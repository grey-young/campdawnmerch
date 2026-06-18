-- Safety net: guarantee stock is reduced exactly once whenever an order
-- becomes paid, regardless of how it got there (Paystack RPC, an admin
-- manually marking it paid, etc).
--
-- This complements — it does not duplicate — the existing flows:
--   * confirm_paystack_payment (0001) and place_cod_order (0002) deduct stock
--     in their own loop and set stock_deducted = true in the SAME update, so by
--     the time this trigger sees the row stock_deducted is already true and it
--     skips. No double deduction.
--   * The checkout page sets order_status = 'processing' BEFORE payment is
--     verified, so we deliberately key off payment_status = 'paid' (never set by
--     the client) instead of order_status, so stock is never deducted on an
--     unverified order.

create or replace function public.deduct_stock_on_paid()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  -- Only act the moment an order becomes paid and stock isn't deducted yet.
  if NEW.payment_status = 'paid' and coalesce(NEW.stock_deducted, false) = false then
    for v_item in
      select variant_id, quantity
      from merch_order_items
      where order_id = NEW.id
    loop
      update merch_product_variants
      set stock = greatest(stock - v_item.quantity, 0),
          updated_at = now()
      where id = v_item.variant_id;
    end loop;

    -- BEFORE trigger: flip the flag on the row being written so it sticks
    -- and never deducts twice.
    NEW.stock_deducted := true;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_deduct_stock_on_paid on public.merch_orders;

create trigger trg_deduct_stock_on_paid
before update on public.merch_orders
for each row
execute function public.deduct_stock_on_paid();
