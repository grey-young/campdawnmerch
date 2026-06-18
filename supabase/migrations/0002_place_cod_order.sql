-- Confirms a pay-on-delivery order: deducts stock once and promotes the order.
-- Unlike confirm_paystack_payment (service-role only), this is called directly
-- by the signed-in customer from the checkout page, so it verifies the order
-- belongs to auth.uid() before touching any stock.

create or replace function public.place_cod_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order merch_orders%rowtype;
  v_item  record;
begin
  select * into v_order
  from merch_orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;

  -- Only the owner may confirm their own order.
  if v_order.user_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  -- Idempotent: if stock was already deducted, do nothing else.
  if v_order.stock_deducted then
    return jsonb_build_object('ok', true, 'already_confirmed', true, 'order_id', v_order.id);
  end if;

  -- Reserve stock, guarding against going negative.
  for v_item in
    select variant_id, quantity
    from merch_order_items
    where order_id = v_order.id
  loop
    update merch_product_variants
    set stock = greatest(stock - v_item.quantity, 0),
        updated_at = now()
    where id = v_item.variant_id;
  end loop;

  -- Promote the order. Payment stays unpaid until cash is collected.
  update merch_orders
  set order_status = 'processing',
      payment_status = 'unpaid',
      stock_deducted = true,
      updated_at = now()
  where id = v_order.id;

  return jsonb_build_object('ok', true, 'order_id', v_order.id);
end;
$$;

grant execute on function public.place_cod_order(uuid) to authenticated;
