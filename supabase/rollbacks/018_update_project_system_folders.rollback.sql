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
  if org_id is null then raise exception 'Project not found.'; end if;

  insert into public.studio_project_folders(organization_id,project_id,name,normalized_name,sort_order,is_system,created_by,updated_by)
  select org_id,target_project_id,v.name,lower(v.name),v.sort_order,true,auth.uid(),auth.uid()
  from(values
    ('01 Proje',10),('02 Çizimler',20),('03 Modeller',30),('04 Dokümanlar',40),
    ('05 Görseller',50),('06 Renderlar',60),('07 Sunumlar',70),('08 Arşiv',80)
  )v(name,sort_order)
  where not exists(
    select 1 from public.studio_project_folders f
    where f.project_id=target_project_id
      and f.parent_folder_id is null
      and f.normalized_name=lower(v.name)
  );
end
$$;

revoke all on function public.studio_initialize_project_folders(uuid) from public,anon;
grant execute on function public.studio_initialize_project_folders(uuid) to authenticated;

notify pgrst,'reload schema';
commit;
