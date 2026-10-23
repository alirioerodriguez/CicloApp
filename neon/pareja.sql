-- Savia · modo pareja. Ella comparte un resumen mínimo (fase y fechas, nunca registros) con una persona.
-- Ejecútalo en el SQL Editor de Neon, después de ciclo_data.sql.

create table if not exists public.pareja (
  owner_id text primary key default auth.user_id(),
  codigo text unique,                 -- código de 8 letras para conectar; se borra al canjearlo
  codigo_expira timestamptz,          -- vale 24 horas
  pareja_id text,                     -- la cuenta de la pareja, una vez conectada
  resumen jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.pareja enable row level security;

-- Ella lee, crea, cambia y borra su fila.
drop policy if exists "duena" on public.pareja;
create policy "duena" on public.pareja
  for all to authenticated
  using (auth.user_id() = owner_id)
  with check (auth.user_id() = owner_id);

-- La pareja conectada solo puede leerla.
drop policy if exists "pareja lee" on public.pareja;
create policy "pareja lee" on public.pareja
  for select to authenticated
  using (auth.user_id() = pareja_id);

grant select, insert, update, delete on public.pareja to authenticated;

-- Canjear el código: la pareja no puede ver la fila antes de conectarse, por eso va en una función.
create or replace function public.canjear_codigo_pareja(c text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  if auth.user_id() is null then return null; end if;
  update public.pareja
     set pareja_id = auth.user_id(), codigo = null, codigo_expira = null
   where codigo = upper(regexp_replace(c, '[^A-Za-z0-9]', '', 'g'))
     and codigo_expira > now()
     and owner_id <> auth.user_id()
  returning resumen into r;
  return r;
end $$;

-- La pareja deja de acompañar.
create or replace function public.soltar_pareja() returns void
language sql security definer set search_path = public as $$
  update public.pareja set pareja_id = null where pareja_id = auth.user_id();
$$;

revoke all on function public.canjear_codigo_pareja(text) from public;
revoke all on function public.soltar_pareja() from public;
grant execute on function public.canjear_codigo_pareja(text) to authenticated;
grant execute on function public.soltar_pareja() to authenticated;
