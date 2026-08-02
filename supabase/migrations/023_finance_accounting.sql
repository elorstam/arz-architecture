begin;

alter table public.studio_ai_usage_events drop constraint if exists studio_ai_usage_events_module_check;
alter table public.studio_ai_usage_events add constraint studio_ai_usage_events_module_check check(module in('official_processes','project_stages','crm','proposals','decision_log','renders','finance'));
alter table public.studio_ai_usage_events drop constraint if exists studio_ai_usage_events_operation_check;
alter table public.studio_ai_usage_events add constraint studio_ai_usage_events_operation_check check(operation in('fee_ai_whatsapp_message','stage_ai_description','crm_ai_meeting_note','proposal_ai_description','decision_ai_summary','render_description','render_analysis','finance_summary','payment_reminder','invoice_description','progress_payment','cashflow_summary'));

create table if not exists public.studio_finance_entries(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid references public.studio_projects(id), crm_lead_id uuid references public.studio_leads(id), quote_id uuid references public.studio_quotes(id),
 entry_type text not null check(entry_type in('income','expense','progress_payment','invoice')),
 source_type text not null default 'manual' check(source_type in('project','quote','official_process','manual')),
 title text not null check(char_length(btrim(title)) between 2 and 180), description text check(description is null or char_length(description)<=4000),
 category text not null check(category in('project_fee','municipal_fee','building_inspection','personnel','office','software','advertising','tax','social_security','electricity','water','internet','vehicle','fuel','other','progress_payment','invoice')),
 status text not null default 'waiting' check(status in('waiting','partial','collected','paid','issued','cancelled')),
 amount numeric(16,2) not null check(amount>0), tax_rate numeric(5,2) not null default 0 check(tax_rate between 0 and 100), currency text not null default 'TRY' check(currency in('TRY','USD','EUR','GBP')),
 entry_date date not null default current_date, due_date date, invoice_number text check(invoice_number is null or char_length(invoice_number)<=80),
 document_file_id uuid references public.studio_project_files(id), is_client_visible boolean not null default false, client_notified_at timestamptz,
 e_invoice_status text not null default 'not_integrated' check(e_invoice_status in('not_integrated','ready','sent','failed')),
 is_archived boolean not null default false, created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(entry_type='invoice' or invoice_number is null), check(project_id is not null or source_type in('manual','quote'))
);
create table if not exists public.studio_finance_payments(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), income_id uuid not null references public.studio_finance_entries(id), amount numeric(16,2) not null check(amount>0), payment_date date not null default current_date,
 method text not null default 'bank_transfer' check(method in('bank_transfer','cash','credit_card','other')), note text check(note is null or char_length(note)<=1000), receipt_file_id uuid references public.studio_project_files(id),
 is_client_visible boolean not null default false, is_archived boolean not null default false, created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.studio_finance_events(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid references public.studio_projects(id), entry_id uuid references public.studio_finance_entries(id), payment_id uuid references public.studio_finance_payments(id),
 event_type text not null check(event_type in('income_created','expense_created','payment_created','progress_payment_created','invoice_created','status_changed','document_linked','client_notified','archived')),
 title text not null check(char_length(title)<=180), metadata jsonb not null default '{}'::jsonb, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), check(entry_id is not null or payment_id is not null)
);
create unique index if not exists studio_finance_invoice_no_unique on public.studio_finance_entries(organization_id,invoice_number) where invoice_number is not null and is_archived=false;
create index if not exists studio_finance_entries_org_type_idx on public.studio_finance_entries(organization_id,entry_type,status,is_archived);
create index if not exists studio_finance_entries_project_idx on public.studio_finance_entries(organization_id,project_id,entry_date desc);
create index if not exists studio_finance_entries_due_idx on public.studio_finance_entries(organization_id,due_date) where is_archived=false and status not in('collected','paid','cancelled');
create index if not exists studio_finance_payments_income_idx on public.studio_finance_payments(organization_id,income_id,payment_date desc) where is_archived=false;
create index if not exists studio_finance_events_project_idx on public.studio_finance_events(organization_id,project_id,created_at desc);

create or replace function public.studio_validate_finance_entry() returns trigger language plpgsql set search_path=public as $$
declare linked_project uuid; begin
 if new.project_id is not null and not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then raise exception 'Finance project scope mismatch' using errcode='23514'; end if;
 if new.crm_lead_id is not null and not exists(select 1 from public.studio_leads l where l.id=new.crm_lead_id and l.organization_id=new.organization_id) then raise exception 'Finance CRM scope mismatch' using errcode='23514'; end if;
 if new.quote_id is not null and not exists(select 1 from public.studio_quotes q where q.id=new.quote_id and q.organization_id=new.organization_id) then raise exception 'Finance quote scope mismatch' using errcode='23514'; end if;
 if new.document_file_id is not null then select project_id into linked_project from public.studio_project_files where id=new.document_file_id and organization_id=new.organization_id and status='ready'; if linked_project is null or new.project_id is null or linked_project<>new.project_id then raise exception 'Finance document scope mismatch' using errcode='23514'; end if; end if;
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.entry_type<>old.entry_type or new.created_by<>old.created_by or new.created_at<>old.created_at) then raise exception 'Protected finance fields cannot change' using errcode='42501'; end if;
 new.title:=btrim(new.title); new.updated_at:=now(); return new;
end $$;
create or replace function public.studio_validate_finance_payment() returns trigger language plpgsql set search_path=public as $$
declare parent_project uuid; parent_amount numeric; paid numeric; begin
 select project_id,amount into parent_project,parent_amount from public.studio_finance_entries where id=new.income_id and organization_id=new.organization_id and entry_type in('income','progress_payment') and is_archived=false;
 if not found then raise exception 'Finance income scope mismatch' using errcode='23514'; end if;
 if new.receipt_file_id is not null and not exists(select 1 from public.studio_project_files f where f.id=new.receipt_file_id and f.organization_id=new.organization_id and f.project_id=parent_project and f.status='ready') then raise exception 'Payment receipt scope mismatch' using errcode='23514'; end if;
 select coalesce(sum(amount),0) into paid from public.studio_finance_payments where income_id=new.income_id and is_archived=false and id<>new.id;
 if paid+new.amount>parent_amount then raise exception 'Payment exceeds income' using errcode='23514'; end if;
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.income_id<>old.income_id or new.created_by<>old.created_by or new.created_at<>old.created_at) then raise exception 'Protected payment fields cannot change' using errcode='42501'; end if;
 new.updated_at:=now(); return new;
end $$;
create or replace function public.studio_sync_finance_income_status() returns trigger language plpgsql security definer set search_path=public as $$
declare target uuid; paid numeric; total numeric; actor uuid; begin target:=coalesce(new.income_id,old.income_id); actor:=coalesce(new.updated_by,old.updated_by); select amount into total from public.studio_finance_entries where id=target; select coalesce(sum(amount),0) into paid from public.studio_finance_payments where income_id=target and is_archived=false; update public.studio_finance_entries set status=case when paid=0 then 'waiting' when paid<total then 'partial' else 'collected' end,updated_by=actor where id=target and status<>'cancelled'; return coalesce(new,old); end $$;
create or replace function public.studio_finance_audit() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.studio_finance_events(organization_id,project_id,entry_id,event_type,title,created_by) values(new.organization_id,new.project_id,new.id,case new.entry_type when 'income' then 'income_created' when 'expense' then 'expense_created' when 'progress_payment' then 'progress_payment_created' else 'invoice_created' end,case new.entry_type when 'income' then 'Gelir oluşturuldu' when 'expense' then 'Gider oluşturuldu' when 'progress_payment' then 'Hakediş oluşturuldu' else 'Fatura oluşturuldu' end,new.created_by); return new; end $$;
create or replace function public.studio_payment_audit() returns trigger language plpgsql security definer set search_path=public as $$ declare pid uuid; begin select project_id into pid from public.studio_finance_entries where id=new.income_id; insert into public.studio_finance_events(organization_id,project_id,entry_id,payment_id,event_type,title,created_by) values(new.organization_id,pid,new.income_id,new.id,'payment_created','Tahsilat kaydedildi',new.created_by); return new; end $$;
create or replace function public.studio_finance_update_audit() returns trigger language plpgsql security definer set search_path=public as $$ declare kind text; label text; begin if new.is_archived and not old.is_archived then kind:='archived';label:='Finans kaydı arşivlendi'; elsif new.document_file_id is distinct from old.document_file_id then kind:='document_linked';label:='Finans belgesi güncellendi'; elsif new.status is distinct from old.status then kind:='status_changed';label:='Finans durumu güncellendi'; else return new; end if; insert into public.studio_finance_events(organization_id,project_id,entry_id,event_type,title,created_by) values(new.organization_id,new.project_id,new.id,kind,label,new.updated_by);return new;end $$;
drop trigger if exists studio_validate_finance_entry_trigger on public.studio_finance_entries; create trigger studio_validate_finance_entry_trigger before insert or update on public.studio_finance_entries for each row execute function public.studio_validate_finance_entry();
drop trigger if exists studio_validate_finance_payment_trigger on public.studio_finance_payments; create trigger studio_validate_finance_payment_trigger before insert or update on public.studio_finance_payments for each row execute function public.studio_validate_finance_payment();
drop trigger if exists studio_finance_audit_trigger on public.studio_finance_entries; create trigger studio_finance_audit_trigger after insert on public.studio_finance_entries for each row execute function public.studio_finance_audit();
drop trigger if exists studio_finance_update_audit_trigger on public.studio_finance_entries; create trigger studio_finance_update_audit_trigger after update on public.studio_finance_entries for each row execute function public.studio_finance_update_audit();
drop trigger if exists studio_payment_audit_trigger on public.studio_finance_payments; create trigger studio_payment_audit_trigger after insert on public.studio_finance_payments for each row execute function public.studio_payment_audit();
drop trigger if exists studio_sync_finance_income_status_trigger on public.studio_finance_payments; create trigger studio_sync_finance_income_status_trigger after insert or update on public.studio_finance_payments for each row execute function public.studio_sync_finance_income_status();

alter table public.studio_finance_entries enable row level security; alter table public.studio_finance_payments enable row level security; alter table public.studio_finance_events enable row level security;
create policy studio_finance_entries_select on public.studio_finance_entries for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_finance_entries_owner_insert on public.studio_finance_entries for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_finance_entries_owner_update on public.studio_finance_entries for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_finance_payments_select on public.studio_finance_payments for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_finance_payments_owner_insert on public.studio_finance_payments for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_finance_payments_owner_update on public.studio_finance_payments for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_finance_events_select on public.studio_finance_events for select to authenticated using(public.studio_is_organization_member(organization_id));
grant select,insert,update on public.studio_finance_entries,public.studio_finance_payments to authenticated; grant select on public.studio_finance_events to authenticated;
revoke delete on public.studio_finance_entries,public.studio_finance_payments,public.studio_finance_events from anon,authenticated;
notify pgrst,'reload schema'; commit;
