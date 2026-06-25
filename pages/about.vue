<template>
  <div class="about-page">
    <Header />

    <!-- ── Hero ──────────────────────────────────────────────── -->
    <section class="hero hud-frame">
      <div class="hero-ambient" aria-hidden="true">
        <span class="glow" />
        <span class="scan" />
      </div>

      <span class="ghost" aria-hidden="true" v-parallax="60">CAMPDAWN</span>

      <div class="hero-inner">
        <span class="hud-label" v-reveal
          ><span class="idx">01</span> // About</span
        >

        <h1 class="kinetic">
          <span class="line" v-reveal="60">Branded</span>
          <span class="line" v-reveal="140">for the <em>game.</em></span>
        </h1>

        <p class="lead" v-reveal="240">
          {{ b.tradingName }} designs and ships
          <strong>branded gaming merchandise</strong>: hoodies, tees, caps and
          accessories, shipped to players across {{ b.address.country }} and
          worldwide.
        </p>

        <div class="hero-cta" v-reveal="320">
          <nuxt-link to="/products" class="btn-primary" v-magnetic="0.3">
            Shop the collection <i class="bi bi-arrow-up-right"></i>
          </nuxt-link>
          <nuxt-link to="/contact" class="btn-ghost" v-magnetic="0.25"
            >Talk to us</nuxt-link
          >
        </div>
      </div>
    </section>

    <!-- ── Marquee ───────────────────────────────────────────── -->
    <div class="marquee-band">
      <Marquee
        :items="[
          'Gaming Apparel',
          'Shipped Worldwide',
          'CampDawn Merch',
          'Limited Drops',
          'Built To Wear',
        ]"
        :duration="30"
      />
    </div>

    <!-- ── Catalogue ─────────────────────────────────────────── -->
    <section class="block catalogue">
      <header class="block-head" v-reveal>
        <span class="hud-label"><span class="idx">02</span> // Catalogue</span>
        <h2>What we make</h2>
        <p>
          Apparel and accessories built around the CampDawn brand, with clear
          sizing, variants and pricing in {{ currency }}.
        </p>
      </header>

      <div class="cat-grid">
        <article
          v-for="(cat, i) in categories"
          :key="cat.label"
          class="cat-tile"
          v-reveal="i * 80"
        >
          <h3>{{ cat.label }}</h3>
          <p>{{ cat.note }}</p>
          <span class="tile-idx" aria-hidden="true">0{{ i + 1 }}</span>
        </article>
      </div>
    </section>

    <!-- ── Process ───────────────────────────────────────────── -->
    <section class="block process">
      <header class="block-head" v-reveal>
        <span class="hud-label"><span class="idx">03</span> // Process</span>
        <h2>How it works</h2>
      </header>

      <ol class="timeline">
        <li v-for="(step, i) in steps" :key="step.title" v-reveal="i * 90">
          <span class="num">0{{ i + 1 }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.body }}</p>
        </li>
      </ol>
    </section>

    <!-- ── Stats ─────────────────────────────────────────────── -->
    <section class="block">
      <div class="stat-strip" v-reveal>
        <div v-for="stat in stats" :key="stat.label" class="stat">
          <i :class="`bi ${stat.icon}`"></i>
          <div>
            <b>{{ stat.value }}</b>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── The business ──────────────────────────────────────── -->
    <section class="block business">
      <div class="biz-grid">
        <div class="biz-copy" v-reveal>
          <span class="hud-label"
            ><span class="idx">04</span> // The business</span
          >
          <h2>The team behind the store</h2>
          <p>
            We focus on three things: good products, secure payments, and
            reliable delivery. Need a hand? Our
            <nuxt-link to="/contact">team</nuxt-link> is one message away.
          </p>
        </div>

        <aside class="biz-card hud-frame" v-reveal="120">
          <div class="row">
            <span>Operated by</span>
            <b>{{ b.legalName }}</b>
          </div>
          <div class="row">
            <span>Trading as</span>
            <b>{{ b.tradingName }}</b>
          </div>
          <div class="row">
            <span>Based in</span>
            <b>{{ b.address.city }}, {{ b.address.country }}</b>
          </div>
          <div class="row">
            <span>Reach us</span>
            <b
              ><a :href="b.emailHref">{{ b.email }}</a></b
            >
          </div>
        </aside>
      </div>
    </section>

    <!-- ── CTA band ──────────────────────────────────────────── -->
    <section class="cta-band">
      <div class="cta-inner hud-frame" v-reveal>
        <span class="ghost" aria-hidden="true" v-parallax="40">DROP</span>
        <h2>Ready to rep CampDawn?</h2>
        <p>Browse the latest drops and get your fit shipped to your door.</p>
        <nuxt-link to="/products" class="btn-primary" v-magnetic="0.35">
          Enter the shop <i class="bi bi-arrow-up-right"></i>
        </nuxt-link>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
const b = useBusiness();
const currency = "GH₵";

const categories = [
  {
    label: "Hoodies",
    icon: "bi-bag-heart",
    note: "Heavyweight, daily-wear ready.",
  },
  { label: "T-Shirts", icon: "bi-stars", note: "Clean graphics, soft cotton." },
  { label: "Caps", icon: "bi-bullseye", note: "Top off the fit." },
  { label: "Clothing", icon: "bi-fire", note: "Streetwear staples." },
  { label: "Accessories", icon: "bi-gem", note: "The finishing details." },
];

const steps = [
  {
    title: "Browse & add",
    body: "Pick your pieces, size and variant, and drop them in your bag.",
  },
  {
    title: "Checkout securely",
    body: "Pay online through Paystack, or choose pay-on-delivery.",
  },
  {
    title: "We pack & ship",
    body: "Your order is processed and sent to your delivery address.",
  },
  {
    title: "Track to your door",
    body: "Follow your order from your account until it arrives.",
  },
];

const stats = [
  { icon: "bi-globe-americas", value: "Worldwide", label: "Shipping" },
  { icon: "bi-shield-check", value: "Secure", label: "Paystack payments" },
  { icon: "bi-geo-alt", value: "Ghana", label: "Based & shipping" },
  { icon: "bi-truck", value: "Tracked", label: "Every order" },
];

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
$lime: #ffbf38;
$ink: #131515;
$plat: #f0f0ec;

.about-page {
  background: $ink;
  min-height: 100vh;
  overflow: hidden;
}

.block {
  width: 90%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 70px 0;
}

.block-head {
  max-width: 640px;
  margin-bottom: 40px;

  h2 {
    margin: 16px 0 0;
    font-size: clamp(2rem, 4.6vw, 3.2rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    color: $plat;
  }

  p {
    margin: 14px 0 0;
    font-size: 1rem;
    line-height: 1.7;
    color: rgba($plat, 0.6);
  }
}

// ── Hero ─────────────────────────────────────────────────────
.hero {
  position: relative;
  min-height: 84vh;
  display: flex;
  align-items: center;
  padding: 80px 0;
  overflow: hidden;

  .hero-ambient {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    .glow {
      position: absolute;
      top: -20%;
      left: -10%;
      width: 620px;
      height: 620px;
      border-radius: 50%;
      background: rgba($lime, 0.12);
      filter: blur(130px);
    }

    .scan {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 3px,
        rgba(255, 255, 255, 0.013) 3px,
        rgba(255, 255, 255, 0.013) 4px
      );
    }
  }

  // Oversized ghost wordmark drifting behind the headline.
  .ghost {
    position: absolute;
    right: -2%;
    bottom: -6%;
    z-index: 0;
    font-size: clamp(6rem, 22vw, 20rem);
    font-weight: 900;
    letter-spacing: -0.05em;
    line-height: 0.8;
    color: transparent;
    -webkit-text-stroke: 1px rgba(240, 240, 236, 0.07);
    pointer-events: none;
    user-select: none;
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    width: 90%;
    max-width: 1180px;
    margin: 0 auto;
  }

  .kinetic {
    margin: 22px 0 0;
    font-size: clamp(3rem, 9vw, 7.5rem);
    font-weight: 900;
    line-height: 0.92;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    color: $plat;

    .line {
      display: block;
    }

    em {
      font-style: normal;
      color: $lime;
    }
  }

  .lead {
    margin: 28px 0 0;
    max-width: 520px;
    font-size: clamp(1rem, 1.5vw, 1.15rem);
    line-height: 1.7;
    color: rgba($plat, 0.62);

    strong {
      color: $plat;
    }
  }

  .hero-cta {
    margin-top: 36px;
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }
}

// ── Shared buttons ──────────────────────────────────────────
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: $lime;
  color: $ink;
  text-decoration: none;
  padding: 1rem 1.9rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 18px 42px -18px rgba($lime, 0.75);
  transition:
    transform 0.25s ease,
    filter 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    filter: brightness(1.06);
  }
}

// Secondary button = navy.
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #082751;
  color: $plat;
  text-decoration: none;
  padding: 1rem 1.9rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 18px 42px -22px rgba(8, 39, 81, 0.9);
  transition:
    background 0.25s ease,
    transform 0.25s ease;

  &:hover {
    background: #0b3470;
    transform: translateY(-3px);
  }
}

// ── Marquee band ────────────────────────────────────────────
.marquee-band {
  padding: 22px 0;
  background: rgba(255, 255, 255, 0.025);
}

// ── Catalogue ───────────────────────────────────────────────
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.cat-tile {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 22px;
  padding: 28px 24px 30px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05) inset;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.45s ease;

  &:hover {
    transform: translateY(-6px);
    background: rgba(255, 255, 255, 0.06);

    i {
      color: $lime;
      transform: scale(1.08);
    }
  }

  i {
    font-size: 1.9rem;
    color: rgba($plat, 0.8);
    transition:
      color 0.4s ease,
      transform 0.4s ease;
  }

  h3 {
    margin: 16px 0 6px;
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: $plat;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: rgba($plat, 0.5);
  }

  .tile-idx {
    position: absolute;
    top: 16px;
    right: 18px;
    font-size: 0.8rem;
    font-weight: 800;
    color: rgba($plat, 0.22);
    letter-spacing: 0.1em;
  }
}

// ── Process timeline ────────────────────────────────────────
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;

  li {
    position: relative;
    padding: 26px 22px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 20px;

    // Connector dot rail across the top.
    &::before {
      content: "";
      position: absolute;
      top: 38px;
      left: 22px;
      right: -18px;
      height: 1px;
      background: linear-gradient(90deg, rgba($lime, 0.4), transparent);
    }

    &:last-child::before {
      display: none;
    }

    .num {
      display: inline-grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: $lime;
      color: $ink;
      font-weight: 900;
      font-size: 0.85rem;
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }

    h3 {
      margin: 0 0 8px;
      font-size: 1.05rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: $plat;
    }

    p {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.55;
      color: rgba($plat, 0.55);
    }
  }
}

// ── Stat strip ──────────────────────────────────────────────
.stat-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 26px;
  padding: 10px;

  .stat {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 22px;

    i {
      font-size: 1.7rem;
      color: $lime;
    }

    b {
      display: block;
      font-size: 1.05rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: $plat;
    }

    span {
      font-size: 0.82rem;
      color: rgba($plat, 0.5);
    }
  }
}

// ── Business ────────────────────────────────────────────────
.biz-grid {
  display: grid;
  grid-template-columns: 1fr 0.9fr;
  gap: 40px;
  align-items: center;

  .biz-copy {
    h2 {
      margin: 16px 0 0;
      font-size: clamp(1.8rem, 3.6vw, 2.8rem);
      font-weight: 800;
      line-height: 1.02;
      letter-spacing: -0.03em;
      text-transform: uppercase;
      color: $plat;
    }

    p {
      margin: 16px 0 0;
      font-size: 1rem;
      line-height: 1.7;
      color: rgba($plat, 0.6);

      a {
        color: $plat;
        text-decoration-color: $lime;
        text-underline-offset: 3px;
      }
    }
  }

  .biz-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 26px;
    padding: 12px 26px;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset;

    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 18px 0;

      & + .row {
        border-top: 1px solid rgba(255, 255, 255, 0.07);
      }

      span {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: rgba($plat, 0.45);
      }

      b {
        font-size: 0.95rem;
        color: $plat;
        text-align: right;

        a {
          color: $plat;
          text-decoration: none;
        }
      }
    }
  }
}

// ── CTA band ────────────────────────────────────────────────
.cta-band {
  width: 90%;
  max-width: 1180px;
  margin: 30px auto 90px;
}

.cta-inner {
  position: relative;
  overflow: hidden;
  text-align: center;
  background:
    radial-gradient(120% 140% at 50% 0%, rgba($lime, 0.12), transparent 60%),
    rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 34px;
  padding: 70px 30px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset;

  .ghost {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: clamp(7rem, 26vw, 22rem);
    font-weight: 900;
    line-height: 0.8;
    color: transparent;
    -webkit-text-stroke: 1px rgba(240, 240, 236, 0.05);
    pointer-events: none;
    user-select: none;
    z-index: 0;
  }

  h2 {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: clamp(2rem, 5vw, 3.6rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    color: $plat;
  }

  p {
    position: relative;
    z-index: 1;
    margin: 14px 0 30px;
    color: rgba($plat, 0.6);
  }

  .btn-primary {
    position: relative;
    z-index: 1;
  }
}

// ── Responsive ──────────────────────────────────────────────
@media (max-width: 900px) {
  .timeline,
  .stat-strip {
    grid-template-columns: repeat(2, 1fr);
  }

  .timeline li::before {
    display: none;
  }

  .biz-grid {
    grid-template-columns: 1fr;
    gap: 26px;
  }
}

@media (max-width: 560px) {
  .hero {
    min-height: 76vh;
  }

  .cat-grid {
    grid-template-columns: 1fr 1fr;
  }

  .timeline,
  .stat-strip {
    grid-template-columns: 1fr;
  }

  .stat-strip .stat {
    padding: 16px 18px;
  }
}
</style>
