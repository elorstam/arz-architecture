begin;

create or replace function public.studio_create_client_invitation(p_project_id uuid,p_invited_email text,p_expires_at timestamptz)
returns table(invitation_id uuid,invitation_token text,expires_at timestamptz)
language plpgsql security definer set search_path=public,extensions as $$
declare v_organization_id uuid;v_invitation_id uuid;v_token text;v_email text:=lower(btrim(p_invited_email));
begin
 select organization_id into v_organization_id from public.studio_projects where id=p_project_id and not is_archived;
 if v_organization_id is null or not public.studio_has_organization_role(v_organization_id,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 if char_length(v_email) not between 3 and 320 then raise exception 'invalid_invited_email' using errcode='22023'; end if;
 if p_expires_at<=now() then raise exception 'invalid_invitation_expiry' using errcode='22023'; end if;
 update public.studio_client_invitations set status='expired' where project_id=p_project_id and lower(invited_email)=v_email and status='pending' and expires_at<=now();
 if exists(select 1 from public.studio_client_invitations where project_id=p_project_id and lower(invited_email)=v_email and status='pending') then raise exception 'pending_invitation_exists' using errcode='23505'; end if;
 if exists(select 1 from public.studio_client_project_access a join public.profiles p on p.id=a.user_id where a.project_id=p_project_id and a.organization_id=v_organization_id and a.revoked_at is null and lower(p.email)=v_email) then raise exception 'client_access_already_active' using errcode='23505'; end if;
 v_token:=encode(extensions.gen_random_bytes(32),'hex');
 insert into public.studio_client_invitations(organization_id,project_id,invited_email,token_hash,expires_at,invited_by) values(v_organization_id,p_project_id,v_email,encode(extensions.digest(v_token,'sha256'),'hex'),p_expires_at,auth.uid()) returning id into v_invitation_id;
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata) values(v_organization_id,auth.uid(),'client_invitation',v_invitation_id,'client_invitation_created','Client invitation created.',jsonb_build_object('project_id',p_project_id));
 return query select v_invitation_id,v_token,p_expires_at;
end $$;

create or replace function public.studio_list_client_invitations(p_project_id uuid)
returns table(id uuid,invited_email text,status text,expires_at timestamptz,accepted_at timestamptz,invited_user_id uuid,invited_user_name text,created_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare v_org uuid;
begin
 select organization_id into v_org from public.studio_projects where studio_projects.id=p_project_id;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 update public.studio_client_invitations i set status='expired' where i.organization_id=v_org and i.project_id=p_project_id and i.status='pending' and i.expires_at<=now();
 return query select i.id,i.invited_email,i.status,i.expires_at,i.accepted_at,i.invited_user_id,p.full_name,i.created_at from public.studio_client_invitations i left join public.profiles p on p.id=i.invited_user_id where i.organization_id=v_org and i.project_id=p_project_id order by i.created_at desc;
end $$;

create or replace function public.studio_list_client_project_access(p_project_id uuid)
returns table(access_id uuid,user_id uuid,full_name text,email text,granted_at timestamptz,revoked_at timestamptz,invitation_status text)
language plpgsql stable security definer set search_path=public as $$
declare v_org uuid;
begin
 select organization_id into v_org from public.studio_projects where studio_projects.id=p_project_id;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 return query select distinct on(a.user_id) a.id,a.user_id,p.full_name,p.email,a.granted_at,a.revoked_at,i.status from public.studio_client_project_access a join public.profiles p on p.id=a.user_id left join lateral(select x.status from public.studio_client_invitations x where x.organization_id=a.organization_id and x.project_id=a.project_id and(x.invited_user_id=a.user_id or lower(x.invited_email)=lower(p.email)) order by x.created_at desc limit 1)i on true where a.organization_id=v_org and a.project_id=p_project_id order by a.user_id,(a.revoked_at is null) desc,a.granted_at desc;
end $$;

create or replace function public.studio_list_client_access_events(p_project_id uuid)
returns table(id uuid,action text,summary text,actor_name text,created_at timestamptz)
language plpgsql stable security definer set search_path=public as $$
declare v_org uuid;
begin
 select organization_id into v_org from public.studio_projects where studio_projects.id=p_project_id;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 return query select e.id,e.action,e.summary,p.full_name,e.created_at from public.activity_events e left join public.profiles p on p.id=e.actor_user_id where e.organization_id=v_org and e.metadata->>'project_id'=p_project_id::text and e.action in('client_invitation_created','client_invitation_revoked','client_invitation_accepted','client_project_access_granted','client_project_access_revoked') order by e.created_at desc limit 100;
end $$;

create or replace function public.studio_revoke_client_invitation(p_project_id uuid,p_invitation_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_org uuid;v_id uuid;
begin
 select organization_id into v_org from public.studio_projects where id=p_project_id;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 update public.studio_client_invitations set status='revoked' where id=p_invitation_id and organization_id=v_org and project_id=p_project_id and status='pending' returning id into v_id;
 if v_id is null then return false; end if;
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata) values(v_org,auth.uid(),'client_invitation',v_id,'client_invitation_revoked','Client invitation revoked.',jsonb_build_object('project_id',p_project_id));
 return true;
end $$;

create or replace function public.studio_renew_client_invitation(p_project_id uuid,p_invitation_id uuid,p_expires_at timestamptz)
returns table(invitation_id uuid,invitation_token text,expires_at timestamptz)
language plpgsql security definer set search_path=public,extensions as $$
declare v_org uuid;v_email text;v_new_id uuid;v_token text;
begin
 select organization_id into v_org from public.studio_projects where id=p_project_id and not is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 if p_expires_at<=now() then raise exception 'invalid_invitation_expiry' using errcode='22023'; end if;
 select invited_email into v_email from public.studio_client_invitations where id=p_invitation_id and organization_id=v_org and project_id=p_project_id and status='pending' for update;
 if v_email is null then raise exception 'invitation_not_found' using errcode='P0002'; end if;
 update public.studio_client_invitations set status='revoked' where id=p_invitation_id;
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata) values(v_org,auth.uid(),'client_invitation',p_invitation_id,'client_invitation_revoked','Client invitation revoked for renewal.',jsonb_build_object('project_id',p_project_id));
 v_token:=encode(extensions.gen_random_bytes(32),'hex');
 insert into public.studio_client_invitations(organization_id,project_id,invited_email,token_hash,expires_at,invited_by) values(v_org,p_project_id,lower(btrim(v_email)),encode(extensions.digest(v_token,'sha256'),'hex'),p_expires_at,auth.uid()) returning id into v_new_id;
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata) values(v_org,auth.uid(),'client_invitation',v_new_id,'client_invitation_created','Client invitation renewed.',jsonb_build_object('project_id',p_project_id));
 return query select v_new_id,v_token,p_expires_at;
end $$;

create or replace function public.studio_accept_client_invitation(p_token text)
returns uuid language plpgsql security definer set search_path=public,auth,extensions as $$
declare v_inv public.studio_client_invitations%rowtype;v_email text;v_access uuid;v_new_access boolean:=false;
begin
 if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
 select lower(email) into v_email from auth.users where id=auth.uid();
 select * into v_inv from public.studio_client_invitations where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') for update;
 if v_inv.id is null or lower(v_inv.invited_email)<>v_email then raise exception 'invitation_invalid' using errcode='42501'; end if;
 if v_inv.status='accepted' and v_inv.invited_user_id=auth.uid() then select id into v_access from public.studio_client_project_access where user_id=auth.uid() and project_id=v_inv.project_id and revoked_at is null;if v_access is null then raise exception 'accepted_invitation_access_missing' using errcode='23514';end if;return v_access;end if;
 if v_inv.status<>'pending' or v_inv.expires_at<=now() then raise exception 'invitation_invalid' using errcode='42501'; end if;
 insert into public.profiles(id,email,full_name) values(auth.uid(),v_email,'') on conflict(id) do nothing;
 if exists(select 1 from public.organization_members where organization_id=v_inv.organization_id and user_id=auth.uid() and role<>'client') then raise exception 'staff_membership_cannot_accept_client_invitation' using errcode='42501'; end if;
 insert into public.organization_members(organization_id,user_id,role,status,created_by) values(v_inv.organization_id,auth.uid(),'client','active',v_inv.invited_by) on conflict(organization_id,user_id) do update set status='active',updated_at=now() where organization_members.role='client';
 select id into v_access from public.studio_client_project_access where user_id=auth.uid() and project_id=v_inv.project_id and revoked_at is null;
 if v_access is null then insert into public.studio_client_project_access(organization_id,project_id,user_id,granted_by) values(v_inv.organization_id,v_inv.project_id,auth.uid(),v_inv.invited_by) returning id into v_access;v_new_access:=true;end if;
 update public.studio_client_invitations set status='accepted',invited_user_id=auth.uid(),accepted_at=now() where id=v_inv.id;
 if v_new_access then insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata) values(v_inv.organization_id,auth.uid(),'client_project_access',v_access,'client_project_access_granted','Client project access granted.',jsonb_build_object('project_id',v_inv.project_id,'user_id',auth.uid()));end if;
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata) values(v_inv.organization_id,auth.uid(),'client_invitation',v_inv.id,'client_invitation_accepted','Client invitation accepted.',jsonb_build_object('project_id',v_inv.project_id));
 return v_access;
end $$;

revoke all on function public.studio_create_client_invitation(uuid,text,timestamptz),public.studio_list_client_invitations(uuid),public.studio_list_client_project_access(uuid),public.studio_list_client_access_events(uuid),public.studio_revoke_client_invitation(uuid,uuid),public.studio_renew_client_invitation(uuid,uuid,timestamptz),public.studio_accept_client_invitation(text) from public,anon;
grant execute on function public.studio_create_client_invitation(uuid,text,timestamptz),public.studio_list_client_invitations(uuid),public.studio_list_client_project_access(uuid),public.studio_list_client_access_events(uuid),public.studio_revoke_client_invitation(uuid,uuid),public.studio_renew_client_invitation(uuid,uuid,timestamptz),public.studio_accept_client_invitation(text) to authenticated;
notify pgrst,'reload schema';
commit;
