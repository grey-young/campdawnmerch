<template>
  <PolicyPage
    title="Privacy Policy"
    subtitle="How CampDawn Merch collects, uses, stores, and protects your personal information when you shop with us."
  >
    <p>
      This Privacy Policy explains how <strong>{{ b.legalName }}</strong> (“we”,
      “us”, “our”), trading as <strong>{{ b.tradingName }}</strong>, handles
      personal information collected through our website. By using our website
      or placing an order, you agree to the practices described below.
    </p>

    <h2>1. Information We Collect</h2>
    <p>We collect the following categories of customer data:</p>
    <ul>
      <li>
        <strong>Account information.</strong> Your name, username, and email
        address when you create an account or sign in.
      </li>
      <li>
        <strong>Order and delivery information.</strong> Your shipping address,
        phone number, and the products, sizes, and variants you buy.
      </li>
      <li>
        <strong>Payment information.</strong> Payments are processed securely by
        our payment provider, Paystack. We do not store your full card numbers
        or banking details on our servers.
      </li>
      <li>
        <strong>Technical information.</strong> Basic device, browser, and usage
        data collected automatically to keep the site secure and working.
      </li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We use customer information only to run the store, specifically to:</p>
    <ul>
      <li>process, fulfil, and deliver your orders;</li>
      <li>create and manage your customer account;</li>
      <li>
        send order confirmations, shipping updates, and respond to your
        enquiries;
      </li>
      <li>prevent fraud and keep payments and accounts secure;</li>
      <li>improve our products, website, and customer service.</li>
    </ul>
    <p>
      We do <strong>not</strong> sell or rent your personal information to third
      parties.
    </p>

    <h2>3. How Your Data Is Stored &amp; Protected</h2>
    <p>
      Customer data is stored on secure, access-controlled cloud infrastructure.
      Connections to our website are encrypted using HTTPS/TLS, and payment
      transactions are handled over the encrypted, PCI-DSS-compliant
      infrastructure of our payment provider. We restrict access to personal
      data to authorised personnel who need it to operate the store, and we
      retain data only for as long as necessary to fulfil orders and meet legal
      or accounting obligations.
    </p>

    <h2>4. Sharing With Third Parties</h2>
    <p>We share limited information only with trusted partners who help us operate, such as:</p>
    <ul>
      <li>
        <strong>Payment processors</strong> (e.g. Paystack) to securely complete
        transactions;
      </li>
      <li>
        <strong>Delivery and courier partners</strong> to ship your order to the
        address you provide;
      </li>
      <li>
        <strong>Infrastructure providers</strong> that host our website and
        database.
      </li>
    </ul>
    <p>
      These partners may only use your data to provide their service to us and
      are required to keep it secure.
    </p>

    <h2>5. Cookies</h2>
    <p>
      We use cookies and similar technologies to keep you signed in, remember
      the items in your cart, secure your session, and understand how the site
      is used. Essential cookies are required for the website and checkout to
      function. You can disable non-essential cookies through your browser
      settings, but some features (such as staying logged in or keeping a cart)
      may not work correctly.
    </p>

    <h2>6. Your Rights</h2>
    <p>You have the right to:</p>
    <ul>
      <li>access the personal information we hold about you;</li>
      <li>request correction of inaccurate or incomplete data;</li>
      <li>
        request deletion of your account and personal data (subject to records
        we must keep for legal or accounting reasons);
      </li>
      <li>object to or restrict certain processing of your data.</li>
    </ul>
    <p>
      To exercise any of these rights, contact us at
      <a :href="b.emailHref">{{ b.email }}</a> and we will respond as soon as
      reasonably possible.
    </p>

    <h2>7. Children’s Privacy</h2>
    <p>
      Our website is not directed at children under 16, and we do not knowingly
      collect personal information from them.
    </p>

    <h2>8. Changes to This Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. Any changes will be
      posted on this page with an updated revision date.
    </p>

    <h2>9. Contact Us</h2>
    <div class="callout">
      <p>
        <strong>{{ b.legalName }}</strong> (trading as {{ b.tradingName }})<br />
        {{ b.address.full }}<br />
        Email: <a :href="b.emailHref">{{ b.email }}</a><br />
        Phone: <a :href="b.phoneHref">{{ b.phone }}</a>
      </p>
    </div>
  </PolicyPage>
</template>

<script setup>
const b = useBusiness();
</script>
