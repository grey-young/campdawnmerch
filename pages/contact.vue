<template>
  <div class="contact-page">
    <Header />

    <!-- ── Hero ──────────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-ambient" aria-hidden="true">
        <span class="glow" />
        <span class="scan" />
      </div>

      <div class="hero-inner">
        <span class="hud-label" v-reveal><span class="idx">//</span> Contact</span>
        <h1 class="kinetic">
          <span class="line" v-reveal="60">Let's</span>
          <span class="line" v-reveal="140">talk <em>merch.</em></span>
        </h1>
        <p class="lead" v-reveal="220">
          Questions about an order, sizing, shipping or a return? Reach the
          {{ b.tradingName }} team. We usually reply within one business day.
        </p>
      </div>
    </section>

    <!-- ── Body ──────────────────────────────────────────────── -->
    <section class="contact-main">
      <!-- Channel cards -->
      <aside class="channels">
        <a class="channel hud-frame" :href="b.emailHref" v-reveal>
          <i class="bi bi-envelope"></i>
          <div>
            <span class="lbl">Email</span>
            <b>{{ b.email }}</b>
          </div>
          <i class="bi bi-arrow-up-right go"></i>
        </a>

        <a class="channel hud-frame" :href="b.phoneHref" v-reveal="90">
          <i class="bi bi-telephone"></i>
          <div>
            <span class="lbl">Phone / WhatsApp</span>
            <b>{{ b.phone }}</b>
          </div>
          <i class="bi bi-arrow-up-right go"></i>
        </a>

        <div class="channel static" v-reveal="180">
          <i class="bi bi-geo-alt"></i>
          <div>
            <span class="lbl">Find us</span>
            <b>{{ b.address.full }}</b>
          </div>
        </div>

        <div class="socials-card" v-reveal="260">
          <span class="lbl">Follow the drop</span>
          <div class="socials">
            <a :href="b.socials.instagram" target="_blank" rel="noopener" title="Instagram">
              <i class="bi bi-instagram"></i>
            </a>
            <a :href="b.socials.twitter" target="_blank" rel="noopener" title="X (Twitter)">
              <i class="bi bi-twitter-x"></i>
            </a>
            <a :href="b.socials.tiktok" target="_blank" rel="noopener" title="TikTok">
              <i class="bi bi-tiktok"></i>
            </a>
            <a :href="b.emailHref" title="Email">
              <i class="bi bi-envelope"></i>
            </a>
          </div>
        </div>
      </aside>

      <!-- Form panel -->
      <div class="form-card hud-frame" v-reveal="120">
        <span class="hud-label"><span class="idx">→</span> Send a message</span>

        <form @submit.prevent="submit">
          <div class="row">
            <div class="field">
              <label for="name">Name</label>
              <input id="name" v-model.trim="form.name" type="text" placeholder="Your full name" required />
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input id="email" v-model.trim="form.email" type="email" placeholder="you@example.com" required />
            </div>
          </div>

          <div class="field">
            <label for="subject">Subject</label>
            <input id="subject" v-model.trim="form.subject" type="text" placeholder="What is this about?" required />
          </div>

          <div class="field">
            <label for="message">Message</label>
            <textarea id="message" v-model.trim="form.message" rows="6" placeholder="Tell us how we can help..." required></textarea>
          </div>

          <button type="submit" class="submit-btn" v-magnetic="0.25">
            Send message <i class="bi bi-send"></i>
          </button>

          <p v-if="error" class="note error">{{ error }}</p>
          <p v-if="sent" class="note success">
            Thanks! Your email app should open with your message ready to send.
            If it doesn't, email us at <a :href="b.emailHref">{{ b.email }}</a>.
          </p>
        </form>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
const b = useBusiness();

useHead({
  title: "Contact Us | CampDawn Merch",
  meta: [
    {
      name: "description",
      content:
        "Contact CampDawn Merch (CampDawn Esport) by email, phone, WhatsApp, or our contact form for help with orders, shipping, and returns.",
    },
  ],
});

const form = reactive({ name: "", email: "", subject: "", message: "" });
const error = ref("");
const sent = ref(false);

const submit = () => {
  error.value = "";
  sent.value = false;

  if (!form.name || !form.email || !form.subject || !form.message) {
    error.value = "Please fill in all fields before sending.";
    return;
  }

  const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
  const mailto = `${b.emailHref}?subject=${encodeURIComponent(
    form.subject,
  )}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
  sent.value = true;
};
</script>

<style scoped lang="scss">
$lime: #ffbf38;
$ink: #131515;
$plat: #f0f0ec;

.contact-page {
  background: $ink;
  min-height: 100vh;
  overflow: hidden;
}

// ── Hero ─────────────────────────────────────────────────────
.hero {
  position: relative;
  padding: 90px 0 60px;
  overflow: hidden;

  .hero-ambient {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    .glow {
      position: absolute;
      top: -30%;
      right: -10%;
      width: 560px;
      height: 560px;
      border-radius: 50%;
      background: rgba($lime, 0.1);
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

  .hero-inner {
    position: relative;
    z-index: 1;
    width: 90%;
    max-width: 1100px;
    margin: 0 auto;
  }

  .kinetic {
    margin: 20px 0 0;
    font-size: clamp(2.6rem, 8vw, 6rem);
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
    margin: 24px 0 0;
    max-width: 540px;
    font-size: clamp(1rem, 1.4vw, 1.1rem);
    line-height: 1.7;
    color: rgba($plat, 0.6);
  }
}

// ── Body ─────────────────────────────────────────────────────
.contact-main {
  width: 90%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 0 90px;
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 24px;
  align-items: start;
}

.channels {
  display: grid;
  gap: 14px;
}

.channel {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 22px;
  padding: 22px 24px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05) inset;
  transition:
    background 0.35s ease,
    transform 0.35s ease;

  > i:first-child {
    font-size: 1.4rem;
    color: $lime;
    flex-shrink: 0;
  }

  div {
    flex: 1;
    min-width: 0;
  }

  .lbl {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: rgba($plat, 0.45);
    margin-bottom: 5px;
  }

  b {
    color: $plat;
    font-size: 0.98rem;
    word-break: break-word;
  }

  .go {
    color: rgba($plat, 0.4);
    transition:
      color 0.3s ease,
      transform 0.3s ease;
  }

  &:not(.static):hover {
    background: rgba(255, 255, 255, 0.07);
    transform: translateY(-3px);

    .go {
      color: $lime;
      transform: translate(2px, -2px);
    }
  }
}

.socials-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 22px;
  padding: 22px 24px;

  .lbl {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: rgba($plat, 0.45);
    margin-bottom: 14px;
  }

  .socials {
    display: flex;
    gap: 12px;

    a {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      color: $plat;
      font-size: 1.15rem;
      text-decoration: none;
      transition:
        background 0.25s ease,
        color 0.25s ease,
        transform 0.25s ease;

      &:hover {
        background: $lime;
        color: $ink;
        transform: translateY(-3px);
      }
    }
  }
}

// ── Form panel ──────────────────────────────────────────────
.form-card {
  background: rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 28px;
  padding: 36px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset;

  > .hud-label {
    margin-bottom: 24px;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .field {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;

    label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: rgba($plat, 0.5);
      margin-bottom: 8px;
    }

    input,
    textarea {
      border: none;
      background: rgba(255, 255, 255, 0.05);
      color: $plat;
      border-radius: 14px;
      padding: 0.9rem 1.1rem;
      font-size: 15px;
      font-family: inherit;
      outline: none;
      box-shadow: 0 0 0 1px transparent;
      transition:
        background 0.2s ease,
        box-shadow 0.2s ease;

      &::placeholder {
        color: rgba($plat, 0.35);
      }

      &:focus {
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 1px rgba($lime, 0.6);
      }
    }

    textarea {
      resize: vertical;
    }
  }

  // The lime spark CTA.
  .submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: $lime;
    color: $ink;
    border: none;
    padding: 1rem 2rem;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 16px 38px -16px rgba($lime, 0.7);
    transition:
      transform 0.25s ease,
      filter 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      filter: brightness(1.06);
    }
  }

  .note {
    margin: 16px 0 0;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;

    &.error {
      background: rgba(255, 141, 141, 0.12);
      color: #ff8d8d;
    }

    &.success {
      background: rgba(116, 224, 138, 0.12);
      color: #74e08a;

      a {
        color: inherit;
      }
    }
  }
}

@media (max-width: 860px) {
  .contact-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .form-card {
    padding: 24px;

    .row {
      grid-template-columns: 1fr;
    }
  }
}
</style>
