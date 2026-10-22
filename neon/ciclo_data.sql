-- Savia · respaldo en la nube con Neon (Managed Better Auth + Data API).
-- Una fila por usuaria. auth.user_id() devuelve el "sub" del JWT de Neon Auth (texto).
-- Ejecútalo en el SQL Editor de Neon después de activar Neon Auth y el Data API.

create table if not exists public.ciclo_data (
  user_id text primary key default auth.user_id(),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ciclo_data enable row level security;

-- Cada usuaria solo puede leer, crear, cambiar y borrar su propia fila.
drop policy if exists "propia fila" on public.ciclo_data;
create policy "propia fila" on public.ciclo_data
  for all to authenticated
  using (auth.user_id() = user_id)
  with check (auth.user_id() = user_id);

-- Las visitas sin sesión no ven nada.
revoke all on public.ciclo_data from anon;
grant select, insert, update, delete on public.ciclo_data to authenticated;
