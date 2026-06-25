<template>
  <PolicyPage
    title="Refund &amp; Return Policy"
    subtitle="How returns, exchanges, and refunds work at CampDawn Merch, including eligibility and timelines."
  >
    <p>
      If something is not right with your <strong>{{ b.tradingName }}</strong>
      order, this policy explains when and how you can return an item and get a
      refund.
    </p>

    <h2>1. Eligibility for Returns</h2>
    <p>To be eligible for a return, an item must be:</p>
    <ul>
      <li>unworn, unwashed, and in its original condition;</li>
      <li>in its original packaging with any tags still attached;</li>
      <li>
        accompanied by proof of purchase (order number or order confirmation
        email).
      </li>
    </ul>
    <p>
      We also accept returns for items that arrive <strong>damaged, defective,
      or incorrect</strong>. Please contact us with a photo within 48 hours of
      delivery in these cases.
    </p>

    <h2>2. Return Period</h2>
    <p>
      You may request a return within <strong>7 days</strong> of receiving your
      order. Requests made after this period may not be accepted.
    </p>

    <h2>3. Non-Refundable Items</h2>
    <p>The following are not eligible for return or refund:</p>
    <ul>
      <li>items marked as <strong>final sale</strong> or clearance;</li>
      <li>custom, personalised, or made-to-order products;</li>
      <li>
        items that have been worn, washed, altered, or damaged after delivery;
      </li>
      <li>items returned without proof of purchase or after the return period.</li>
    </ul>

    <h2>4. How to Request a Return</h2>
    <ol>
      <li>
        Email <a :href="b.emailHref">{{ b.email }}</a> with your order number and
        the reason for your return.
      </li>
      <li>
        Our team will confirm whether your item is eligible and send return
        instructions.
      </li>
      <li>
        Ship the item back as instructed, or arrange handover for local orders.
      </li>
    </ol>
    <p>
      Customers are responsible for return shipping costs, unless the item
      arrived damaged, defective, or incorrect. In that case we cover the cost.
    </p>

    <h2>5. Refund Process</h2>
    <ul>
      <li>
        Once we receive and inspect your returned item, we will email you to
        confirm whether your refund is approved.
      </li>
      <li>
        Approved refunds are issued to your original payment method via our
        payment provider, <strong>Paystack</strong>.
      </li>
      <li>
        Refunds are typically processed within <strong>5 to 10 business days</strong>
        after approval. The time it takes to appear in your account depends on
        your bank or card issuer.
      </li>
      <li>
        Original shipping fees are non-refundable unless the return is due to our
        error.
      </li>
    </ul>

    <h2>6. Exchanges</h2>
    <p>
      If you need a different size or variant, contact us and we will arrange an
      exchange where stock is available. If the item is unavailable, we will
      offer a refund instead.
    </p>

    <h2>7. Contact for Return Requests</h2>
    <div class="callout">
      <p>
        To start a return or ask a question, contact
        <strong>{{ b.tradingName }}</strong>:<br />
        Email: <a :href="b.emailHref">{{ b.email }}</a><br />
        Phone / WhatsApp: <a :href="b.phoneHref">{{ b.phone }}</a><br />
        Address: {{ b.address.full }}
      </p>
    </div>
  </PolicyPage>
</template>

<script setup>
const b = useBusiness();
</script>
