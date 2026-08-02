begin;

create or replace function public.studio_initialize_project_stages(target_project uuid,target_user uuid) returns void language plpgsql security invoker set search_path=public as $$
declare target_org uuid; project_category text; labels text[]; label text; n integer:=0;
begin
 select organization_id,lower(category) into target_org,project_category from public.studio_projects where id=target_project;
 if target_org is null or not public.studio_has_organization_role(target_org,array['owner']) then raise exception 'project_stage_forbidden' using errcode='42501'; end if;
 labels:=case when project_category in ('visualization','görselleştirme','gorsellestirme') then array['Modelleme','Kaplama','Işık','İlk Render','Revize','Final Render','Teslim'] else array['Avan','Mimari','Zemin','İSKİ','Statik','Mekanik-Elektrik','Ruhsat'] end;
 foreach label in array labels loop n:=n+1; insert into public.studio_project_stages(organization_id,project_id,title,sort_order,is_system,created_by,updated_by) values(target_org,target_project,label,(select coalesce(max(sort_order),0) from public.studio_project_stages where project_id=target_project)+n,true,target_user,target_user) on conflict(project_id,title) do nothing; end loop;
end $$;

create or replace function public.studio_validate_stage_scope() returns trigger language plpgsql set search_path=public as $$
declare project_org uuid;
begin
 select organization_id into project_org from public.studio_projects where id=new.project_id;
 if project_org is null or project_org<>new.organization_id then raise exception 'stage_scope_mismatch' using errcode='23514'; end if;
 if tg_op='UPDATE' and old.is_system and (new.is_system is distinct from old.is_system or new.is_archived or not new.is_active or new.sort_order is distinct from old.sort_order or new.title is distinct from old.title) then raise exception 'system_stage_immutable' using errcode='42501'; end if;
 new.updated_at=now(); return new;
end $$;
drop trigger if exists studio_validate_stage_scope_trigger on public.studio_project_stages;
create trigger studio_validate_stage_scope_trigger before insert or update on public.studio_project_stages for each row execute function public.studio_validate_stage_scope();
grant execute on function public.studio_initialize_project_stages(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
