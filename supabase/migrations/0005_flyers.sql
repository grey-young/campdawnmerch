-- Flyers shown in the homepage hero (Section One). These replace the old
-- "featured products" arrangement that used to drive that strip. The admin
-- uploads/orders them from the dedicated Flyers page in the dashboard.

create table if not exists public.merch_flyers (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  title       text,
  link_url    text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists merch_flyers_active_order_idx
  on public.merch_flyers (is_active, sort_order);

alter table public.merch_flyers enable row level security;

-- Anyone (anon visitors on the storefront) can read active flyers.
drop policy if exists "Public can read active flyers" on public.merch_flyers;
create policy "Public can read active flyers"
  on public.merch_flyers
  for select
  using (is_active = true);

-- Staff/admins can read everything (including inactive) and manage flyers.
drop policy if exists "Admins manage flyers" on public.merch_flyers;
create policy "Admins manage flyers"
  on public.merch_flyers
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.app_role in ('admin', 'staff', 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.app_role in ('admin', 'staff', 'super_admin')
    )
  );
