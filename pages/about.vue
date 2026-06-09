<template>
  <div class="about-page">
    <Header />

    <section class="about-hero">
      <div class="inner">
        <div class="tag">About us</div>
        <h1>{{ b.tradingName }}</h1>
        <p class="lead">
          {{ b.tradingName }} is an online store that designs and sells
          <strong>branded gaming merchandise</strong>. That includes clothing,
          hoodies, t-shirts, caps, and accessories. We pack every order and
          <strong>ship it directly to our customers</strong> across Ghana and
          worldwide.
        </p>
      </div>
    </section>

    <section class="about-body">
      <div class="inner">
        <div class="block">
          <h2>What we sell</h2>
          <p>
            Our catalogue is apparel and accessories built around the CampDawn
            brand. Products come in a range of sizes and variants, with clear
            pricing in Ghanaian Cedis (GH₵), full descriptions, and product
            photos so you know what you are buying.
          </p>
          <ul class="pills">
            <li>Hoodies</li>
            <li>T-Shirts</li>
            <li>Caps</li>
            <li>Clothing</li>
            <li>Accessories</li>
          </ul>
        </div>

        <div class="block">
          <h2>How it works</h2>
          <ol>
            <li>
              Browse the store and add items (with your size and variant) to
              your cart.
            </li>
            <li>Check out and pay securely online through Paystack.</li>
            <li>We process your order and ship it to your delivery address.</li>
            <li>Track your order from your account until it arrives.</li>
          </ol>
        </div>

        <div class="block">
          <h2>The business behind the store</h2>
          <p>
            {{ b.tradingName }} is operated by <strong>{{ b.legalName }}</strong
            >, based in {{ b.address.city }}, {{ b.address.country }}. We focus on
            good products, secure payments, and reliable delivery. If you need
            help, you can reach our
            <nuxt-link to="/contact">team</nuxt-link> any time.
          </p>
        </div>

        <div class="cta">
          <nuxt-link to="/products">
            <button>
              Shop the collection <i class="bi bi-arrow-up-right"></i>
            </button>
          </nuxt-link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
const b = useBusiness();

useHead({
  title: "About CampDawn Merch | Branded Gaming Merchandise",
  meta: [
    {
      name: "description",
      content:
        "CampDawn Merch sells branded gaming merchandise: clothing, hoodies, t-shirts, caps, and accessories shipped to customers across Ghana and worldwide. Operated by CampDawn Esport.",
    },
  ],
});
</script>

<style scoped lang="scss">
$black: #0a0a0a;
$accent: #c8f135;
$cream: #f6f2ec;

.about-hero {
  background: $black;
  color: #fff;
  padding: 70px 0 56px;

  .inner {
    width: 90%;
    max-width: 860px;
    margin: 0 auto;
  }

  .tag {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $accent;
    border: 1px solid rgba($accent, 0.4);
    padding: 5px 12px;
    border-radius: 2px;
    margin-bottom: 22px;
  }

  h1 {
    font-size: clamp(30px, 5vw, 50px);
    text-transform: uppercase;
    margin: 0 0 20px;
  }

  .lead {
    font-size: clamp(16px, 2.2vw, 19px);
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.72);
    margin: 0;

    strong {
      color: #fff;
    }
  }
}

.about-body {
  padding: 56px 0 80px;

  .inner {
    width: 90%;
    max-width: 860px;
    margin: 0 auto;
  }

  .block {
    margin-bottom: 44px;

    h2 {
      font-size: clamp(20px, 3vw, 26px);
      text-transform: uppercase;
      margin: 0 0 16px;
    }

    p {
      font-size: 16px;
      line-height: 1.75;
      color: #2a2a2a;
      margin: 0 0 16px;
    }

    ol {
      padding-left: 22px;
      line-height: 1.75;
      color: #2a2a2a;

      li {
        margin-bottom: 10px;
      }
    }
  }

  .pills {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    li {
      background: $cream;
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  }

  .cta button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: $black;
    color: #fff;
    border: none;
    padding: 1rem 2rem;
    border-radius: 999px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

@media (max-width: 520px) {
  .about-hero {
    padding: 48px 0 40px;
  }

  .about-body {
    padding: 40px 0 60px;
  }
}
</style>
