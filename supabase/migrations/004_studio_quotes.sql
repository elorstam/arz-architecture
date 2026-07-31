begin;

create table if not exists public.studio_quote_sequences(
 organization_id uuid not null references public.organizations(id) on delete cascade,
 sequence_year integer not null check(sequence_year between 2020 and 9999),
 last_value integer not null default 0 check(last_value>=0),
 updated_at timestamptz not null default now(),
 primary key(organization_id,sequence_year)
);

create table if not exists public.studio_quotes(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 lead_id uuid not null references public.studio_leads(id),
 quote_number text not null check(quote_number~'^Q-[0-9]{4}-[0-9]{4,}$'),
 title text not null check(length(btrim(title)) between 1 and 200),
 status text not null default 'Draft' check(status in('Draft','Sent','Approved','Rejected','Expired','Cancelled','Converted')),
 currency text not null check(currency in('TRY','USD','EUR')),
 subtotal numeric(16,2) not null default 0 check(subtotal>=0),
 discount_type text not null default 'None' check(discount_type in('None','Fixed','Percentage')),
 discount_value numeric(16,2) not null default 0 check(discount_value>=0),
 discount_total numeric(16,2) not null default 0 check(discount_total>=0 and discount_total<=subtotal),
 tax_rate numeric(5,2) not null default 20 check(tax_rate between 0 and 100),
 tax_total numeric(16,2) not null default 0 check(tax_total>=0),
 grand_total numeric(16,2) not null default 0 check(grand_total>=0),
 valid_until date null,
 notes text not null default '' check(length(notes)<=10000),
 payment_terms text not null default '' check(length(payment_terms)<=5000),
 client_name_snapshot text not null,
 client_company_snapshot text not null default '',
 client_email_snapshot text not null default '',
 client_phone_snapshot text not null,
 client_city_snapshot text not null default '',
 client_district_snapshot text not null default '',
 is_archived boolean not null default false,
 created_by uuid null references public.profiles(id) on delete set null,
 updated_by uuid null references public.profiles(id) on delete set null,
 approved_at timestamptz null,
 sent_at timestamptz null,
 converted_project_id uuid null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(organization_id,quote_number),
 check(status not in('Sent','Approved','Rejected','Expired','Converted') or sent_at is not null),
 check(status not in('Approved','Converted') or approved_at is not null),
 check((status='Converted' and converted_project_id is not null) or (status<>'Converted' and converted_project_id is null))
);

create table if not exists public.studio_quote_items(
 id uuid primary key default gen_random_uuid(),
 quote_id uuid not null references public.studio_quotes(id) on delete cascade,
 sort_order integer not null check(sort_order>=0),
 service_name text not null check(length(btrim(service_name)) between 1 and 200),
 description text not null default '' check(length(description)<=4000),
 quantity numeric(12,3) not null check(quantity>0),
 unit text not null check(unit in('Piece','m²','m','Hour','Day','Month','Project','Package','Other')),
 unit_price numeric(16,2) not null check(unit_price>=0),
 line_total numeric(16,2) not null check(line_total>=0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(quote_id,sort_order)
);

alter table public.studio_projects add column if not exists source_quote_id uuid null;
alter table public.studio_projects drop constraint if exists studio_projects_source_quote_id_fkey;
alter table public.studio_projects add constraint studio_projects_source_quote_id_fkey
 foreign key(source_quote_id) references public.studio_quotes(id);
create unique index if not exists studio_projects_source_quote_unique
 on public.studio_projects(source_quote_id) where source_quote_id is not null;
alter table public.studio_quotes drop constraint if exists studio_quotes_converted_project_id_fkey;
alter table public.studio_quotes add constraint studio_quotes_converted_project_id_fkey
 foreign key(converted_project_id) references public.studio_projects(id);

create index if not exists studio_quotes_org_archived_created_idx on public.studio_quotes(organization_id,is_archived,created_at desc);
create index if not exists studio_quotes_org_status_idx on public.studio_quotes(organization_id,status) where is_archived=false;
create index if not exists studio_quotes_lead_idx on public.studio_quotes(lead_id,created_at desc);
create index if not exists studio_quote_items_quote_sort_idx on public.studio_quote_items(quote_id,sort_order);

drop trigger if exists studio_quote_sequences_set_updated_at on public.studio_quote_sequences;
create trigger studio_quote_sequences_set_updated_at before update on public.studio_quote_sequences
for each row execute function public.studio_set_updated_at();
drop trigger if exists studio_quotes_set_updated_at on public.studio_quotes;
create trigger studio_quotes_set_updated_at before update on public.studio_quotes
for each row execute function public.studio_set_updated_at();
drop trigger if exists studio_quote_items_set_updated_at on public.studio_quote_items;
create trigger studio_quote_items_set_updated_at before update on public.studio_quote_items
for each row execute function public.studio_set_updated_at();

create or replace function public.studio_protect_quote_fields()
returns trigger language plpgsql set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Authentication required.'; end if;
 if tg_op='INSERT' then
  new.created_by=auth.uid(); new.updated_by=auth.uid();
 else
  if new.organization_id is distinct from old.organization_id
   or new.quote_number is distinct from old.quote_number
   or new.created_by is distinct from old.created_by
   or new.created_at is distinct from old.created_at then
   raise exception 'Controlled quote fields cannot be changed.';
  end if;
  if old.status<>'Draft' and(
   new.lead_id is distinct from old.lead_id or new.title is distinct from old.title
   or new.currency is distinct from old.currency or new.subtotal is distinct from old.subtotal
   or new.discount_type is distinct from old.discount_type or new.discount_value is distinct from old.discount_value
   or new.discount_total is distinct from old.discount_total or new.tax_rate is distinct from old.tax_rate
   or new.tax_total is distinct from old.tax_total or new.grand_total is distinct from old.grand_total
   or new.valid_until is distinct from old.valid_until or new.notes is distinct from old.notes
   or new.payment_terms is distinct from old.payment_terms
   or new.client_name_snapshot is distinct from old.client_name_snapshot
   or new.client_company_snapshot is distinct from old.client_company_snapshot
   or new.client_email_snapshot is distinct from old.client_email_snapshot
   or new.client_phone_snapshot is distinct from old.client_phone_snapshot
   or new.client_city_snapshot is distinct from old.client_city_snapshot
   or new.client_district_snapshot is distinct from old.client_district_snapshot
  ) then raise exception 'Sent quote content is immutable.'; end if;
  new.updated_by=auth.uid();
 end if;
 if not exists(select 1 from public.studio_leads l where l.id=new.lead_id and l.organization_id=new.organization_id) then
  raise exception 'Quote lead must belong to the same organization.';
 end if;
 if new.converted_project_id is not null and not exists(select 1 from public.studio_projects p where p.id=new.converted_project_id and p.organization_id=new.organization_id and p.source_quote_id=new.id) then
  raise exception 'Converted project must belong to this quote organization.';
 end if;
 return new;
end $$;
drop trigger if exists studio_quotes_protect_fields on public.studio_quotes;
create trigger studio_quotes_protect_fields before insert or update on public.studio_quotes
for each row execute function public.studio_protect_quote_fields();

create or replace function public.studio_protect_project_fields()
returns trigger language plpgsql set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Authentication required.'; end if;
 if tg_op='INSERT' then
  if new.source_quote_id is not null and coalesce(current_setting('app.studio_quote_conversion',true),'')<>'on' then
   raise exception 'Project quote source is server-controlled.';
  end if;
  new.created_by=auth.uid(); new.updated_by=auth.uid();
 else
  if new.organization_id is distinct from old.organization_id
   or new.created_by is distinct from old.created_by
   or new.created_at is distinct from old.created_at
   or new.source_quote_id is distinct from old.source_quote_id then
   raise exception 'Controlled project fields cannot be changed.';
  end if;
  new.updated_by=auth.uid();
 end if;
 if new.responsible_user_id is not null and not exists(
  select 1 from public.organization_members m where m.organization_id=new.organization_id
   and m.user_id=new.responsible_user_id and m.status='active' and m.role in('owner','admin','team_member')
 ) then raise exception 'Responsible user must be an active organization team member.'; end if;
 return new;
end $$;

alter table public.studio_quote_sequences enable row level security;
alter table public.studio_quotes enable row level security;
alter table public.studio_quote_items enable row level security;

create policy studio_quotes_select_member on public.studio_quotes for select to authenticated
using(public.studio_is_organization_member(organization_id));
create policy studio_quotes_insert_owner on public.studio_quotes for insert to authenticated
with check(public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_quotes_update_owner on public.studio_quotes for update to authenticated
using(public.studio_has_organization_role(organization_id,array['owner']))
with check(public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_quote_items_select_member on public.studio_quote_items for select to authenticated
using(exists(select 1 from public.studio_quotes q where q.id=quote_id and public.studio_is_organization_member(q.organization_id)));

create or replace function public.studio_create_quote(payload jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare
 org_id uuid; lead_row public.studio_leads%rowtype; quote_id uuid:=gen_random_uuid();
 seq integer; qyear integer:=extract(year from now())::integer; number text;
 item jsonb; item_count integer:=0; subtotal_value numeric(16,2):=0;
 discount_kind text:=coalesce(payload->>'discountType','None');
 discount_value_input numeric:=coalesce(nullif(payload->>'discountValue','')::numeric,0);
 tax_rate_input numeric:=coalesce(nullif(payload->>'taxRate','')::numeric,20);
 discount_amount numeric(16,2); tax_amount numeric(16,2); total_amount numeric(16,2);
 qty numeric; price numeric; line numeric(16,2);
begin
 select l.* into lead_row from public.studio_leads l join public.organization_members m on m.organization_id=l.organization_id
 where l.id=(payload->>'leadId')::uuid and l.is_archived=false and m.user_id=auth.uid() and m.status='active' and m.role='owner';
 if not found then raise exception 'Lead unavailable.'; end if;
 org_id:=lead_row.organization_id;
 if length(btrim(coalesce(payload->>'title','')))=0 then raise exception 'Quote title required.'; end if;
 if coalesce(jsonb_typeof(payload->'items'),'')<>'array' or jsonb_array_length(payload->'items')=0 then raise exception 'Quote items required.'; end if;
 if coalesce(payload->>'currency','') not in('TRY','USD','EUR') or discount_kind not in('None','Fixed','Percentage') then raise exception 'Invalid quote values.'; end if;
 if discount_value_input<0 or tax_rate_input<0 or tax_rate_input>100 or(discount_kind='Percentage' and discount_value_input>100) then raise exception 'Invalid financial values.'; end if;
 for item in select * from jsonb_array_elements(payload->'items') loop
  item_count:=item_count+1; qty:=(item->>'quantity')::numeric; price:=(item->>'unitPrice')::numeric;
  if qty<=0 or price<0 or coalesce(item->>'unit','') not in('Piece','m²','m','Hour','Day','Month','Project','Package','Other')
   or length(btrim(coalesce(item->>'serviceName','')))=0 then raise exception 'Invalid quote item.'; end if;
  line:=round(qty*price,2); subtotal_value:=subtotal_value+line;
 end loop;
 discount_amount:=case when discount_kind='Percentage' then round(subtotal_value*discount_value_input/100,2)
  when discount_kind='Fixed' then round(discount_value_input,2) else 0 end;
 if discount_amount>subtotal_value then raise exception 'Discount exceeds subtotal.'; end if;
 tax_amount:=round((subtotal_value-discount_amount)*tax_rate_input/100,2);
 total_amount:=subtotal_value-discount_amount+tax_amount;
 insert into public.studio_quote_sequences(organization_id,sequence_year,last_value) values(org_id,qyear,1)
 on conflict(organization_id,sequence_year) do update set last_value=studio_quote_sequences.last_value+1 returning last_value into seq;
 number:=format('Q-%s-%s',qyear,lpad(seq::text,4,'0'));
 insert into public.studio_quotes(id,organization_id,lead_id,quote_number,title,status,currency,subtotal,discount_type,discount_value,
  discount_total,tax_rate,tax_total,grand_total,valid_until,notes,payment_terms,client_name_snapshot,client_company_snapshot,
  client_email_snapshot,client_phone_snapshot,client_city_snapshot,client_district_snapshot)
 values(quote_id,org_id,lead_row.id,number,btrim(payload->>'title'),'Draft',payload->>'currency',subtotal_value,discount_kind,
  discount_value_input,discount_amount,tax_rate_input,tax_amount,total_amount,nullif(payload->>'validUntil','')::date,
  coalesce(payload->>'notes',''),coalesce(payload->>'paymentTerms',''),
  btrim(concat_ws(' ',lead_row.first_name,lead_row.last_name)),lead_row.company_name,coalesce(lead_row.email,''),lead_row.phone,lead_row.city,lead_row.district);
 item_count:=0;
 for item in select * from jsonb_array_elements(payload->'items') loop
  qty:=(item->>'quantity')::numeric;price:=(item->>'unitPrice')::numeric;line:=round(qty*price,2);
  insert into public.studio_quote_items(quote_id,sort_order,service_name,description,quantity,unit,unit_price,line_total)
  values(quote_id,item_count,btrim(item->>'serviceName'),coalesce(item->>'description',''),qty,item->>'unit',price,line);
  item_count:=item_count+1;
 end loop;
 return quote_id;
end $$;

create or replace function public.studio_update_quote(target_quote_id uuid,payload jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare
 quote_row public.studio_quotes%rowtype; lead_row public.studio_leads%rowtype; item jsonb; item_count integer:=0;
 subtotal_value numeric(16,2):=0; discount_kind text:=coalesce(payload->>'discountType','None');
 discount_value_input numeric:=coalesce(nullif(payload->>'discountValue','')::numeric,0);
 tax_rate_input numeric:=coalesce(nullif(payload->>'taxRate','')::numeric,20);
 discount_amount numeric(16,2); tax_amount numeric(16,2); total_amount numeric(16,2);qty numeric;price numeric;line numeric(16,2);
begin
 select * into quote_row from public.studio_quotes where id=target_quote_id for update;
 if not found or not public.studio_has_organization_role(quote_row.organization_id,array['owner']) then raise exception 'Quote unavailable.'; end if;
 if quote_row.status<>'Draft' or quote_row.is_archived then raise exception 'Quote is read only.'; end if;
 select * into lead_row from public.studio_leads where id=(payload->>'leadId')::uuid and organization_id=quote_row.organization_id and is_archived=false;
 if not found then raise exception 'Lead unavailable.'; end if;
 if length(btrim(coalesce(payload->>'title','')))=0 or jsonb_array_length(coalesce(payload->'items','[]'::jsonb))=0 then raise exception 'Quote input required.'; end if;
 if coalesce(payload->>'currency','') not in('TRY','USD','EUR') or discount_kind not in('None','Fixed','Percentage') then raise exception 'Invalid quote values.'; end if;
 if discount_value_input<0 or tax_rate_input<0 or tax_rate_input>100 or(discount_kind='Percentage' and discount_value_input>100) then raise exception 'Invalid financial values.'; end if;
 for item in select * from jsonb_array_elements(payload->'items') loop
  qty:=(item->>'quantity')::numeric;price:=(item->>'unitPrice')::numeric;
  if qty<=0 or price<0 or coalesce(item->>'unit','') not in('Piece','m²','m','Hour','Day','Month','Project','Package','Other')
   or length(btrim(coalesce(item->>'serviceName','')))=0 then raise exception 'Invalid quote item.'; end if;
  subtotal_value:=subtotal_value+round(qty*price,2);
 end loop;
 discount_amount:=case when discount_kind='Percentage' then round(subtotal_value*discount_value_input/100,2)
  when discount_kind='Fixed' then round(discount_value_input,2) else 0 end;
 if discount_amount>subtotal_value then raise exception 'Discount exceeds subtotal.'; end if;
 tax_amount:=round((subtotal_value-discount_amount)*tax_rate_input/100,2);total_amount:=subtotal_value-discount_amount+tax_amount;
 update public.studio_quotes set lead_id=lead_row.id,title=btrim(payload->>'title'),currency=payload->>'currency',
  subtotal=subtotal_value,discount_type=discount_kind,discount_value=discount_value_input,discount_total=discount_amount,
  tax_rate=tax_rate_input,tax_total=tax_amount,grand_total=total_amount,valid_until=nullif(payload->>'validUntil','')::date,
  notes=coalesce(payload->>'notes',''),payment_terms=coalesce(payload->>'paymentTerms',''),
  client_name_snapshot=btrim(concat_ws(' ',lead_row.first_name,lead_row.last_name)),client_company_snapshot=lead_row.company_name,
  client_email_snapshot=coalesce(lead_row.email,''),client_phone_snapshot=lead_row.phone,
  client_city_snapshot=lead_row.city,client_district_snapshot=lead_row.district where id=quote_row.id;
 delete from public.studio_quote_items where quote_id=quote_row.id;
 for item in select * from jsonb_array_elements(payload->'items') loop
  qty:=(item->>'quantity')::numeric;price:=(item->>'unitPrice')::numeric;line:=round(qty*price,2);
  insert into public.studio_quote_items(quote_id,sort_order,service_name,description,quantity,unit,unit_price,line_total)
  values(quote_row.id,item_count,btrim(item->>'serviceName'),coalesce(item->>'description',''),qty,item->>'unit',price,line);
  item_count:=item_count+1;
 end loop;
end $$;

create or replace function public.studio_transition_quote(target_quote_id uuid,target_status text)
returns void language plpgsql security definer set search_path=public as $$
declare q public.studio_quotes%rowtype;
begin
 select * into q from public.studio_quotes where id=target_quote_id for update;
 if not found or not public.studio_has_organization_role(q.organization_id,array['owner']) then raise exception 'Quote unavailable.'; end if;
 if q.is_archived then raise exception 'Archived quote cannot transition.'; end if;
 if target_status='Sent' and q.status='Draft' then
  if q.valid_until is not null and q.valid_until<current_date then raise exception 'Quote validity expired.'; end if;
  update public.studio_quotes set status='Sent',sent_at=now() where id=q.id;
 elsif target_status='Approved' and q.status='Sent' then update public.studio_quotes set status='Approved',approved_at=now() where id=q.id;
 elsif target_status='Rejected' and q.status='Sent' then update public.studio_quotes set status='Rejected' where id=q.id;
 elsif target_status='Expired' and q.status='Sent' then update public.studio_quotes set status='Expired' where id=q.id;
 elsif target_status='Cancelled' and q.status in('Draft','Sent') then update public.studio_quotes set status='Cancelled' where id=q.id;
 else raise exception 'Invalid quote transition.'; end if;
end $$;

create or replace function public.studio_set_quote_archived(target_quote_id uuid,archived boolean)
returns void language plpgsql security definer set search_path=public as $$
declare org_id uuid;
begin
 select organization_id into org_id from public.studio_quotes where id=target_quote_id;
 if org_id is null or not public.studio_has_organization_role(org_id,array['owner']) then raise exception 'Quote unavailable.'; end if;
 update public.studio_quotes set is_archived=archived where id=target_quote_id;
end $$;

create or replace function public.studio_convert_quote_to_project(target_quote_id uuid,project_payload jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare q public.studio_quotes%rowtype;lead_row public.studio_leads%rowtype;project_id uuid:=gen_random_uuid();responsible uuid;
begin
 select * into q from public.studio_quotes where id=target_quote_id for update;
 if not found or not public.studio_has_organization_role(q.organization_id,array['owner']) then raise exception 'Quote unavailable.'; end if;
 if q.converted_project_id is not null then return q.converted_project_id; end if;
 if q.status<>'Approved' or q.is_archived then raise exception 'Only approved quotes can convert.'; end if;
 select * into lead_row from public.studio_leads where id=q.lead_id and organization_id=q.organization_id and is_archived=false for update;
 if not found then raise exception 'Lead unavailable.'; end if;
 responsible:=nullif(project_payload->>'responsibleUserId','')::uuid;
 if responsible is not null and not exists(select 1 from public.organization_members m where m.organization_id=q.organization_id
  and m.user_id=responsible and m.status='active' and m.role in('owner','admin','team_member')) then raise exception 'Responsible user unavailable.'; end if;
 if coalesce(project_payload->>'stage','') not in('Teklif','Ön Tasarım','Tasarım','Ruhsat','Uygulama','Görselleştirme','Teslim')
  or coalesce(project_payload->>'status','') not in('Aktif','Beklemede','Revizyon','Gecikmiş','Tamamlandı')
  or coalesce((project_payload->>'progress')::integer,-1) not between 0 and 100 then raise exception 'Invalid project values.'; end if;
 perform set_config('app.studio_quote_conversion','on',true);
 insert into public.studio_projects(id,organization_id,code,name,client_name,client_contact_name,client_email,client_phone,
  category,location,project_year,stage,status,progress,summary,current_phase,start_date,target_date,next_milestone,
  next_milestone_date,responsible_user_id,source_quote_id)
 values(project_id,q.organization_id,btrim(project_payload->>'code'),btrim(project_payload->>'name'),
  q.client_company_snapshot,q.client_name_snapshot,q.client_email_snapshot,q.client_phone_snapshot,
  coalesce(project_payload->>'category',''),concat_ws(' / ',nullif(q.client_city_snapshot,''),nullif(q.client_district_snapshot,'')),
  extract(year from current_date)::text,project_payload->>'stage',project_payload->>'status',(project_payload->>'progress')::integer,
  format('%s numaralı onaylı tekliften oluşturuldu.',q.quote_number),coalesce(project_payload->>'currentPhase',''),
  nullif(project_payload->>'startDate','')::date,nullif(project_payload->>'targetDate','')::date,'',null,responsible,q.id);
 update public.studio_quotes set status='Converted',converted_project_id=project_id where id=q.id;
 update public.studio_leads set stage='Kazanıldı',status='Kapandı' where id=lead_row.id;
 return project_id;
exception when unique_violation then
 select converted_project_id into project_id from public.studio_quotes where id=target_quote_id;
 if project_id is not null then return project_id; end if;
 raise;
end $$;

revoke all on public.studio_quote_sequences from anon,authenticated;
revoke insert,update,delete on public.studio_quotes from anon,authenticated;
revoke insert,update,delete on public.studio_quote_items from anon,authenticated;
grant select on public.studio_quotes,public.studio_quote_items to authenticated;
revoke all on function public.studio_create_quote(jsonb) from public,anon;
revoke all on function public.studio_update_quote(uuid,jsonb) from public,anon;
revoke all on function public.studio_transition_quote(uuid,text) from public,anon;
revoke all on function public.studio_set_quote_archived(uuid,boolean) from public,anon;
revoke all on function public.studio_convert_quote_to_project(uuid,jsonb) from public,anon;
grant execute on function public.studio_create_quote(jsonb) to authenticated;
grant execute on function public.studio_update_quote(uuid,jsonb) to authenticated;
grant execute on function public.studio_transition_quote(uuid,text) to authenticated;
grant execute on function public.studio_set_quote_archived(uuid,boolean) to authenticated;
grant execute on function public.studio_convert_quote_to_project(uuid,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
