// Verifies a Paystack transaction server-side using the secret key, then
// confirms the order + deducts stock via the confirm_paystack_payment RPC.
//
// The browser never sees the secret key and the charged amount is re-checked
// against the order total stored in the database, so a tampered client cannot
// confirm an order it did not actually pay for.
//
// Deploy:  supabase functions deploy verify-paystack --no-verify-jwt
// Secrets: supabase secrets set PAYSTACK_SECRET_KEY=sk_xxx
//          (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json().catch(() => ({}));

    if (!reference) {
      return json({ ok: false, error: "missing_reference" }, 400);
    }

    // 1. Verify the transaction with Paystack (authoritative source of truth).
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } },
    );
    const verify = await res.json();

    if (!verify?.status || verify?.data?.status !== "success") {
      return json(
        {
          ok: false,
          error: "payment_not_successful",
          detail: verify?.data?.status ?? verify?.message ?? null,
        },
        400,
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 2. Look up the order total we expect to have been charged.
    const { data: payment, error: pErr } = await supabase
      .from("merch_payments")
      .select("id, order_id")
      .eq("reference", reference)
      .maybeSingle();

    if (pErr || !payment) {
      return json({ ok: false, error: "payment_not_found" }, 404);
    }

    const { data: order, error: oErr } = await supabase
      .from("merch_orders")
      .select("total_amount")
      .eq("id", payment.order_id)
      .maybeSingle();

    if (oErr || !order) {
      return json({ ok: false, error: "order_not_found" }, 404);
    }

    // 3. Re-check amount + currency against the DB, not the client.
    const expected = Math.round(Number(order.total_amount) * 100);
    const paid = Number(verify.data.amount);
    const currency = verify.data.currency;

    if (currency !== "GHS" || paid < expected) {
      return json(
        { ok: false, error: "amount_mismatch", expected, paid, currency },
        400,
      );
    }

    // 4. Atomically confirm + deduct stock (idempotent).
    const { data: result, error: rErr } = await supabase.rpc(
      "confirm_paystack_payment",
      { p_reference: reference },
    );

    if (rErr) {
      return json({ ok: false, error: rErr.message }, 500);
    }

    return json({ ok: true, result });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
