create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins read their own row" on public.admins;
create policy "admins read their own row" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

grant select on public.admins to authenticated;
grant select, insert, update, delete on public.articulos, public.cotizaciones to authenticated;

drop policy if exists "admins manage articulos" on public.articulos;
create policy "admins manage articulos" on public.articulos
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage cotizaciones" on public.cotizaciones;
create policy "admins manage cotizaciones" on public.cotizaciones
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage blog images" on storage.objects;
create policy "admins manage blog images" on storage.objects
  for all to authenticated
  using (bucket_id = 'blog' and (select public.is_admin()))
  with check (bucket_id = 'blog' and (select public.is_admin()));
