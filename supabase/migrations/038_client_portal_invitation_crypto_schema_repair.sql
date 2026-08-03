begin;

create or replace function public.studio_create_client_invitation(
  p_project_id uuid,
  p_invited_email text,
  p_expires_at timestamptz
)
returns table(invitation_id uuid, invitation_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_organization_id uuid;
  v_invitation_id uuid;
  v_token text;
  v_email text := lower(btrim(p_invited_email));
begin
  select organization_id into v_organization_id from public.studio_projects where id = p_project_id;
  if v_organization_id is null or not public.studio_has_organization_role(v_organization_id, array['owner']) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if char_length(v_email) not between 3 and 320 then raise exception 'invalid_invited_email' using errcode = '22023'; end if;
  if p_expires_at <= now() then raise exception 'invalid_invitation_expiry' using errcode = '22023'; end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.studio_client_invitations(organization_id,project_id,invited_email,token_hash,expires_at,invited_by)
  values(v_organization_id,p_project_id,v_email,encode(extensions.digest(v_token,'sha256'),'hex'),p_expires_at,auth.uid())
  returning id into v_invitation_id;

  insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata)
  values(v_organization_id,auth.uid(),'client_invitation',v_invitation_id,'client_invitation_created','Client invitation created.',jsonb_build_object('project_id',p_project_id));
  return query select v_invitation_id,v_token,p_expires_at;
end;
$$;

revoke all on function public.studio_create_client_invitation(uuid,text,timestamptz) from public,anon;
grant execute on function public.studio_create_client_invitation(uuid,text,timestamptz) to authenticated;
notify pgrst,'reload schema';
commit;
