begin;

drop function if exists public.studio_renew_client_invitation(uuid, uuid, timestamptz);
drop function if exists public.studio_revoke_client_invitation(uuid, uuid);
drop function if exists public.studio_list_client_access_events(uuid);
drop function if exists public.studio_list_client_project_access(uuid);
drop function if exists public.studio_list_client_invitations(uuid);

create or replace function public.studio_create_client_invitation(
  p_project_id uuid,
  p_invited_email text,
  p_expires_at timestamptz
)
returns table(invitation_id uuid, invitation_token text, expires_at timestamptz)
language plpgsql security definer set search_path=public,extensions as $$
declare v_organization_id uuid; v_invitation_id uuid; v_token text; v_email text:=lower(btrim(p_invited_email));
begin
  select organization_id into v_organization_id from public.studio_projects where id=p_project_id;
  if v_organization_id is null or not public.studio_has_organization_role(v_organization_id,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
  if char_length(v_email) not between 3 and 320 then raise exception 'invalid_invited_email' using errcode='22023'; end if;
  if p_expires_at<=now() then raise exception 'invalid_invitation_expiry' using errcode='22023'; end if;
  v_token:=encode(extensions.gen_random_bytes(32),'hex');
  insert into public.studio_client_invitations(organization_id,project_id,invited_email,token_hash,expires_at,invited_by)
  values(v_organization_id,p_project_id,v_email,encode(extensions.digest(v_token,'sha256'),'hex'),p_expires_at,auth.uid()) returning id into v_invitation_id;
  insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata)
  values(v_organization_id,auth.uid(),'client_invitation',v_invitation_id,'client_invitation_created','Client invitation created.',jsonb_build_object('project_id',p_project_id));
  return query select v_invitation_id,v_token,p_expires_at;
end $$;

create or replace function public.studio_accept_client_invitation(p_token text)
returns uuid language plpgsql security definer set search_path=public,auth,extensions as $$
declare v_inv public.studio_client_invitations%rowtype; v_email text; v_access uuid;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select lower(email) into v_email from auth.users where id=auth.uid();
  select * into v_inv from public.studio_client_invitations where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') for update;
  if v_inv.id is null or lower(v_inv.invited_email)<>v_email then raise exception 'invitation_invalid' using errcode='42501'; end if;
  if v_inv.status='accepted' and v_inv.invited_user_id=auth.uid() then
    select id into v_access from public.studio_client_project_access where user_id=auth.uid() and project_id=v_inv.project_id and revoked_at is null;
    if v_access is null then raise exception 'accepted_invitation_access_missing' using errcode='23514'; end if;
    return v_access;
  end if;
  if v_inv.status<>'pending' or v_inv.expires_at<=now() then raise exception 'invitation_invalid' using errcode='42501'; end if;
  insert into public.profiles(id,email,full_name) values(auth.uid(),v_email,'') on conflict(id) do nothing;
  if exists(select 1 from public.organization_members where organization_id=v_inv.organization_id and user_id=auth.uid() and role<>'client') then raise exception 'staff_membership_cannot_accept_client_invitation' using errcode='42501'; end if;
  insert into public.organization_members(organization_id,user_id,role,status,created_by)
  values(v_inv.organization_id,auth.uid(),'client','active',v_inv.invited_by)
  on conflict(organization_id,user_id) do update set status='active',updated_at=now() where organization_members.role='client';
  select id into v_access from public.studio_client_project_access where user_id=auth.uid() and project_id=v_inv.project_id and revoked_at is null;
  if v_access is null then insert into public.studio_client_project_access(organization_id,project_id,user_id,granted_by) values(v_inv.organization_id,v_inv.project_id,auth.uid(),v_inv.invited_by) returning id into v_access; end if;
  update public.studio_client_invitations set status='accepted',invited_user_id=auth.uid(),accepted_at=now() where id=v_inv.id;
  insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata)
  values(v_inv.organization_id,auth.uid(),'client_invitation',v_inv.id,'client_invitation_accepted','Client invitation accepted.',jsonb_build_object('project_id',v_inv.project_id));
  return v_access;
end $$;

revoke all on function public.studio_create_client_invitation(uuid,text,timestamptz),public.studio_accept_client_invitation(text) from public,anon;
grant execute on function public.studio_create_client_invitation(uuid,text,timestamptz),public.studio_accept_client_invitation(text) to authenticated;
notify pgrst,'reload schema';
commit;
