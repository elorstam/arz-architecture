begin;

create or replace function public.studio_initialize_project_folders(target_project_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  org_id uuid;
begin
  select organization_id into org_id
  from public.studio_projects
  where id=target_project_id
    and public.studio_is_organization_member(organization_id);

  if org_id is null then
    raise exception 'Project not found.';
  end if;

  -- Existing projects retain their physical mappings and manually-created folders.
  -- The new template is applied only to projects that have not been initialized yet.
  if exists(
    select 1 from public.studio_project_folders
    where project_id=target_project_id and is_system
  ) then
    return;
  end if;

  insert into public.studio_project_folders(
    organization_id,project_id,name,normalized_name,sort_order,is_system,is_archived,created_by,updated_by
  )
  select org_id,target_project_id,v.name,lower(v.name),v.sort_order,true,v.is_archived,auth.uid(),auth.uid()
  from(values
    ('01 Proje',10,false),
    ('02 Statik',20,false),
    ('03 Mekanik-Elektrik',30,false),
    ('04 Zemin Etüd',40,false),
    ('05 Numarataj',50,false),
    ('06 İSKİ',60,false),
    ('07 Harçlar',70,false),
    ('08 Dilekçeler',80,false),
    ('09 Yapı Denetim',90,false),
    ('10 Ruhsat Evrakları',100,false),
    ('11 3D Görseller',110,false),
    ('08 Arşiv',900,true)
  )v(name,sort_order,is_archived)
  where not exists(
    select 1 from public.studio_project_folders f
    where f.project_id=target_project_id
      and f.parent_folder_id is null
      and f.normalized_name=lower(v.name)
      and f.is_archived=v.is_archived
  );
end
$$;

revoke all on function public.studio_initialize_project_folders(uuid) from public,anon;
grant execute on function public.studio_initialize_project_folders(uuid) to authenticated;

notify pgrst,'reload schema';
commit;
