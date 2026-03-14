-- Esquema base para ReUsemos en Supabase (Postgres)

-- Tabla de perfiles de usuario vinculada a auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  avatar text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Usuario puede ver su propio perfil"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Usuario puede insertar su propio perfil"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Usuario puede actualizar su propio perfil"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Esquema base para "objetos en alquiler"
create table if not exists public.rental_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_per_day numeric(12,2) not null,
  category text,
  area text,
  photos text[], -- URLs a archivos en Supabase Storage
  availability jsonb, -- por ejemplo rangos de fechas o días de la semana
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.rental_items enable row level security;

create policy "Usuarios autenticados pueden leer objetos"
  on public.rental_items
  for select
  using (true);

create policy "Dueño puede insertar objetos"
  on public.rental_items
  for insert
  with check (auth.uid() = owner_id);

create policy "Dueño puede actualizar sus objetos"
  on public.rental_items
  for update
  using (auth.uid() = owner_id);

create policy "Dueño puede borrar sus objetos"
  on public.rental_items
  for delete
  using (auth.uid() = owner_id);

