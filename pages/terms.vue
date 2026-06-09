<template>
  <PolicyPage
    title="Terms &amp; Conditions"
    subtitle="The terms that govern your use of the CampDawn Merch website and your purchase of our products."
  >
    <p>
      These Terms &amp; Conditions (“Terms”) govern your access to and use of the
      <strong>{{ b.tradingName }}</strong> website and the purchase of products
      from it. The website and store are operated by
      <strong>{{ b.legalName }}</strong>. By using the website or placing an
      order, you agree to these Terms.
    </p>

    <h2>1. Website Usage</h2>
    <ul>
      <li>
        You may use this website for lawful purposes only and must not use it in
        any way that damages, disables, or impairs the site or interferes with
        other users.
      </li>
      <li>
        You must not attempt to gain unauthorised access to any part of the
        site, other accounts, or our systems.
      </li>
      <li>
        All content on this site, including logos, designs, product images, and
        text, is owned by {{ b.legalName }} or its licensors and may not be
        copied or reused without permission.
      </li>
    </ul>

    <h2>2. Accounts</h2>
    <p>
      To place an order you may need to create an account. You are responsible
      for keeping your login details confidential and for all activity that
      happens under your account. Please notify us immediately of any
      unauthorised use.
    </p>

    <h2>3. Products &amp; Pricing</h2>
    <ul>
      <li>
        We sell branded merchandise including clothing, hoodies, t-shirts, caps,
        and accessories.
      </li>
      <li>
        We make every effort to display product colours, sizes, and details
        accurately, but slight variations may occur between product images and
        the item delivered.
      </li>
      <li>
        All prices are listed in Ghanaian Cedis (GH₵) and are inclusive of
        applicable taxes unless stated otherwise. Shipping fees are calculated
        and shown at checkout.
      </li>
      <li>
        We reserve the right to correct pricing errors and to change prices or
        product availability at any time without notice.
      </li>
    </ul>

    <h2>4. Orders &amp; Purchases</h2>
    <p>
      When you place an order, you are making an offer to purchase the selected
      products. An order is confirmed once payment is successfully received. We
      reserve the right to refuse or cancel an order, for example if an item is
      out of stock, if there was a pricing error, or if we suspect fraud. If we
      cancel a paid order, you will receive a full refund.
    </p>

    <h2>5. Payment Processing</h2>
    <p>
      Payments are processed securely through our third-party payment provider,
      <strong>Paystack</strong>. By paying, you agree to that provider’s terms.
      We do not store your full card or banking details on our servers. You
      confirm that you are authorised to use the payment method you provide.
    </p>

    <h2>6. Shipping, Returns &amp; Refunds</h2>
    <p>
      Delivery of products is governed by our
      <nuxt-link to="/shipping-policy">Shipping &amp; Delivery Policy</nuxt-link>,
      and returns or refunds are governed by our
      <nuxt-link to="/refund-policy">Refund &amp; Return Policy</nuxt-link>. Both
      form part of these Terms.
    </p>

    <h2>7. User Responsibilities</h2>
    <ul>
      <li>provide accurate, current, and complete information when ordering;</li>
      <li>
        ensure the shipping address and contact details you provide are correct;
      </li>
      <li>not misuse the website or engage in fraudulent activity;</li>
      <li>comply with all applicable laws when using the site.</li>
    </ul>

    <h2>8. Limitation of Liability</h2>
    <p>
      To the fullest extent permitted by law, {{ b.legalName }} shall not be
      liable for any indirect, incidental, or consequential loss arising from
      your use of the website or products. Our total liability for any claim
      relating to an order will not exceed the amount you paid for that order.
      Nothing in these Terms excludes liability that cannot be excluded under
      applicable law.
    </p>

    <h2>9. Governing Law</h2>
    <p>
      These Terms are governed by the laws of the Republic of Ghana, and any
      disputes will be subject to the jurisdiction of the Ghanaian courts.
    </p>

    <h2>10. Changes to These Terms</h2>
    <p>
      We may update these Terms from time to time. Continued use of the website
      after changes are posted constitutes acceptance of the updated Terms.
    </p>

    <h2>11. Contact Us</h2>
    <div class="callout">
      <p>
        Questions about these Terms? Contact
        <strong>{{ b.legalName }}</strong> at
        <a :href="b.emailHref">{{ b.email }}</a> or
        <a :href="b.phoneHref">{{ b.phone }}</a>.
      </p>
    </div>
  </PolicyPage>
</template>

<script setup>
const b = useBusiness();
</script>
