begin;

create or replace function public.studio_create_client_invitation(
  p_project_id uuid,
  p_invited_email text,
  p_expires_at timestamptz
)
returns table(
  invitation_id uuid,
  invitation_token text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path=public,extensions
as $$
declare
  v_organization_id uuid;
  v_invitation_id uuid;
  v_token text;
  v_email text := lower(btrim(p_invited_email));
begin
  select p.organization_id
  into v_organization_id
  from public.studio_projects p
  where p.id = p_project_id
    and not p.is_archived;

  if v_organization_id is null
     or not public.studio_has_organization_role(
       v_organization_id,
       array['owner']
     )
  then
    raise exception 'forbidden'
      using errcode='42501';
  end if;

  if char_length(v_email) not between 3 and 320 then
    raise exception 'invalid_invited_email'
      using errcode='22023';
  end if;

  if p_expires_at <= now() then
    raise exception 'invalid_invitation_expiry'
      using errcode='22023';
  end if;

  update public.studio_client_invitations i
  set status = 'expired'
  where i.project_id = p_project_id
    and lower(i.invited_email) = v_email
    and i.status = 'pending'
    and i.expires_at <= now();

  if exists(
    select 1
    from public.studio_client_invitations i
    where i.project_id = p_project_id
      and lower(i.invited_email) = v_email
      and i.status = 'pending'
  ) then
    raise exception 'pending_invitation_exists'
      using errcode='23505';
  end if;

  if exists(
    select 1
    from public.studio_client_project_access a
    join public.profiles p
      on p.id = a.user_id
    where a.project_id = p_project_id
      and a.organization_id = v_organization_id
      and a.revoked_at is null
      and lower(p.email) = v_email
  ) then
    raise exception 'client_access_already_active'
      using errcode='23505';
  end if;

  v_token :=
    encode(
      extensions.gen_random_bytes(32),
      'hex'
    );

  insert into public.studio_client_invitations(
    organization_id,
    project_id,
    invited_email,
    token_hash,
    expires_at,
    invited_by
  )
  values(
    v_organization_id,
    p_project_id,
    v_email,
    encode(
      extensions.digest(
        v_token,
        'sha256'
      ),
      'hex'
    ),
    p_expires_at,
    auth.uid()
  )
  returning id
  into v_invitation_id;

  insert into public.activity_events(
    organization_id,
    actor_user_id,
    entity_type,
    entity_id,
    action,
    summary,
    metadata
  )
  values(
    v_organization_id,
    auth.uid(),
    'client_invitation',
    v_invitation_id,
    'client_invitation_created',
    'Client invitation created.',
    jsonb_build_object(
      'project_id',
      p_project_id
    )
  );

  return query
  select
    v_invitation_id,
    v_token,
    p_expires_at;
end
$$;

revoke all on function public.studio_create_client_invitation(
  uuid,
  text,
  timestamptz
) from public, anon;

grant execute on function public.studio_create_client_invitation(
  uuid,
  text,
  timestamptz
) to authenticated;

notify pgrst, 'reload schema';

commit;