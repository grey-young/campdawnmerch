-- Lets the admin arrange the order featured products appear in (homepage hero
-- + the "Featured Items" row). Lower number = shown first.

alter table public.merch_products
  add column if not exists featured_order integer not null default 0;

-- Seed a stable initial order for anything already featured.
with ordered as (
  select id, row_number() over (order by created_at desc) - 1 as rn
  from public.merch_products
  where is_featured = true
)
update public.merch_products p
set featured_order = ordered.rn
from ordered
where p.id = ordered.id;
