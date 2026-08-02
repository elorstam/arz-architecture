begin;

-- Migration 016 owns this partial unique index. Keep the index idempotent here
-- because the 031 initializer relies on it for conflict-safe initialization.
create unique index if not exists studio_project_stage_system_title_uq
  on public.studio_project_stages(project_id, title)
  where is_system;

create or replace function public.studio_initialize_project_stages(target_project uuid, target_user uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_org uuid;
  project_category text;
  labels text[];
  label text;
  n integer := 0;
begin
  select organization_id, lower(category)
    into target_org, project_category
    from public.studio_projects
   where id = target_project;

  if target_org is null or not public.studio_has_organization_role(target_org, array['owner']) then
    raise exception 'project_stage_forbidden' using errcode = '42501';
  end if;

  labels := case
    when project_category in ('visualization', 'görselleştirme', 'gorsellestirme')
      then array['Modelleme', 'Kaplama', 'Işık', 'İlk Render', 'Revize', 'Final Render', 'Teslim']
    else array['Avan', 'Mimari', 'Zemin', 'İSKİ', 'Statik', 'Mekanik-Elektrik', 'Ruhsat']
  end;

  foreach label in array labels loop
    n := n + 1;
    insert into public.studio_project_stages(
      organization_id, project_id, title, sort_order, is_system, created_by, updated_by
    ) values (
      target_org,
      target_project,
      label,
      (select coalesce(max(sort_order), 0) from public.studio_project_stages where project_id = target_project) + n,
      true,
      target_user,
      target_user
    )
    on conflict (project_id, title) where is_system do nothing;
  end loop;
end;
$$;

grant execute on function public.studio_initialize_project_stages(uuid, uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
