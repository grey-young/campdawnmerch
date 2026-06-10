-- Atomically confirms a Paystack payment and deducts stock exactly once.
-- Called by the verify-paystack edge function (after it has verified the
-- transaction against Paystack with the secret key). Runs as security definer
-- so it can bypass RLS, and is intended to be invoked only via the service role.

create or replace function public.confirm_paystack_payment(p_reference text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment merch_payments%rowtype;
  v_order   merch_orders%rowtype;
  v_item    record;
begin
  -- Lock the payment + order rows so concurrent verify calls serialise.
  select * into v_payment
  from merch_payments
  where reference = p_reference
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'payment_not_found');
  end if;

  select * into v_order
  from merch_orders
  where id = v_payment.order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;

  -- Idempotency: if we already confirmed + deducted, do nothing else.
  if v_order.payment_status = 'paid' and v_order.stock_deducted then
    return jsonb_build_object('ok', true, 'already_confirmed', true, 'order_id', v_order.id);
  end if;

  -- Mark the payment successful. NOTE: merch_payments.status allows
  -- 'pending' | 'success' | 'failed' | 'refunded' (no 'paid'), so the
  -- successful state is 'success' here, while the ORDER uses 'paid'.
  update merch_payments
  set status = 'success',
      paid_at = coalesce(paid_at, now()),
      updated_at = now()
  where id = v_payment.id;

  -- Deduct stock once, guarding against going negative.
  if not v_order.stock_deducted then
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
  end if;

  -- Promote the order.
  update merch_orders
  set payment_status = 'paid',
      order_status = 'processing',
      stock_deducted = true,
      updated_at = now()
  where id = v_order.id;

  return jsonb_build_object('ok', true, 'order_id', v_order.id);
end;
$$;
