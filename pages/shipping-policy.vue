<template>
  <PolicyPage
    title="Shipping &amp; Delivery Policy"
    subtitle="Processing times, delivery timelines, locations, fees, and order tracking for CampDawn Merch orders."
  >
    <p>
      At <strong>{{ b.tradingName }}</strong> we ship branded merchandise to
      customers within Ghana and internationally. This policy explains how and
      when your order is processed and delivered.
    </p>

    <h2>1. Order Processing Times</h2>
    <ul>
      <li>
        Orders are processed within <strong>1–3 business days</strong> after
        payment is confirmed.
      </li>
      <li>
        Orders are not processed or shipped on weekends or public holidays.
      </li>
      <li>
        During sales, restocks, or peak periods, processing may take slightly
        longer; we will keep you informed if there is a delay.
      </li>
    </ul>

    <h2>2. Delivery Timelines</h2>
    <p>Estimated delivery times after dispatch:</p>
    <ul>
      <li>
        <strong>Within Accra (Greater Accra):</strong> 1–3 business days.
      </li>
      <li>
        <strong>Other regions in Ghana:</strong> 3–7 business days.
      </li>
      <li>
        <strong>International orders:</strong> 7–21 business days, depending on
        the destination and customs clearance.
      </li>
    </ul>
    <p>
      These timelines are estimates and may vary due to courier delays, weather,
      customs, or other factors outside our control.
    </p>

    <h2>3. Shipping Locations</h2>
    <p>
      We deliver <strong>nationwide across Ghana</strong> and to most
      <strong>international destinations</strong>. If we are unable to ship to
      your location, we will contact you and arrange a full refund. Customers are
      responsible for providing a complete and accurate delivery address.
    </p>

    <h2>4. Shipping Fees</h2>
    <ul>
      <li>
        Shipping fees are calculated based on your delivery location and order
        size, and are displayed at checkout before you pay.
      </li>
      <li>
        <strong>International customers</strong> may be responsible for import
        duties, taxes, or customs fees charged by the destination country. These
        are not included in our prices or shipping fees.
      </li>
    </ul>

    <h2>5. Order Tracking</h2>
    <p>
      Once your order ships, we will notify you by email. You can also view your
      order status at any time from your
      <nuxt-link to="/account">account</nuxt-link> page under your orders. Where
      a courier provides a tracking number, we will share it so you can follow
      your delivery. If you have not received a shipping update within the
      expected processing time, please contact us.
    </p>

    <h2>6. Failed or Delayed Deliveries</h2>
    <p>
      If a delivery fails because of an incorrect address or because no one was
      available to receive it, the courier may attempt redelivery or hold the
      parcel for collection. Additional delivery attempts may incur extra fees.
    </p>

    <h2>7. Contact Us</h2>
    <div class="callout">
      <p>
        Questions about shipping or your delivery? Contact
        <strong>{{ b.tradingName }}</strong> at
        <a :href="b.emailHref">{{ b.email }}</a> or
        <a :href="b.phoneHref">{{ b.phone }}</a>.
      </p>
    </div>
  </PolicyPage>
</template>

<script setup>
const b = useBusiness();
</script>
