-- Una fila por usuaria con todos sus datos de la app (registros, ajustes, diario, controles).
-- RLS: cada cuenta solo puede leer, crear, cambiar y borrar su propia fila.
create table public.ciclo_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ciclo_data enable row level security;

create policy "ciclo_data: leer lo propio" on public.ciclo_data
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "ciclo_data: crear lo propio" on public.ciclo_data
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "ciclo_data: cambiar lo propio" on public.ciclo_data
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "ciclo_data: borrar lo propio" on public.ciclo_data
  for delete to authenticated using ((select auth.uid()) = user_id);
