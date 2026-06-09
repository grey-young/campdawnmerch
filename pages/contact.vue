<template>
  <div class="contact-page">
    <Header />

    <section class="contact-hero">
      <div class="inner">
        <div class="tag">Get in touch</div>
        <h1>Contact {{ b.tradingName }}</h1>
        <p>
          Have a question about an order, sizing, shipping, or a return? Reach
          the {{ b.tradingName }} team using the details below, or send us a
          message. We usually reply within one business day.
        </p>
      </div>
    </section>

    <section class="contact-main">
      <div class="inner">
        <!-- Business details -->
        <aside class="details">
          <h2>Business details</h2>

          <div class="detail">
            <span class="label">Business name</span>
            <p>{{ b.legalName }}</p>
            <small>Trading as {{ b.tradingName }}</small>
          </div>

          <div class="detail">
            <span class="label">Email</span>
            <p>
              <a :href="b.emailHref">{{ b.email }}</a>
            </p>
          </div>

          <div class="detail">
            <span class="label">Phone / WhatsApp</span>
            <p>
              <a :href="b.phoneHref">{{ b.phone }}</a>
            </p>
          </div>

          <div class="detail">
            <span class="label">Address</span>
            <p>{{ b.address.full }}</p>
          </div>

          <div class="detail">
            <span class="label">Follow us</span>
            <div class="socials">
              <a
                :href="b.socials.instagram"
                target="_blank"
                rel="noopener"
                title="Instagram"
              >
                <i class="bi bi-instagram"></i>
              </a>
              <a
                :href="b.socials.twitter"
                target="_blank"
                rel="noopener"
                title="X (Twitter)"
              >
                <i class="bi bi-twitter-x"></i>
              </a>
              <a
                :href="b.socials.tiktok"
                target="_blank"
                rel="noopener"
                title="TikTok"
              >
                <i class="bi bi-tiktok"></i>
              </a>
              <a :href="b.emailHref" title="Email">
                <i class="bi bi-envelope"></i>
              </a>
            </div>
          </div>
        </aside>

        <!-- Contact form -->
        <div class="form-card">
          <h2>Send a message</h2>

          <form @submit.prevent="submit">
            <div class="row">
              <div class="field">
                <label for="name">Name</label>
                <input
                  id="name"
                  v-model.trim="form.name"
                  type="text"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div class="field">
                <label for="email">Email</label>
                <input
                  id="email"
                  v-model.trim="form.email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label for="subject">Subject</label>
              <input
                id="subject"
                v-model.trim="form.subject"
                type="text"
                placeholder="What is this about?"
                required
              />
            </div>

            <div class="field">
              <label for="message">Message</label>
              <textarea
                id="message"
                v-model.trim="form.message"
                rows="6"
                placeholder="Tell us how we can help..."
                required
              ></textarea>
            </div>

            <button type="submit" class="submit-btn">Send message</button>

            <p v-if="error" class="note error">{{ error }}</p>
            <p v-if="sent" class="note success">
              Thanks! Your email app should open with your message ready to
              send. If it doesn’t, email us directly at
              <a :href="b.emailHref">{{ b.email }}</a
              >.
            </p>
          </form>
        </div>
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
$black: #0a0a0a;
$accent: #c8f135;
$cream: #f6f2ec;

.contact-hero {
  background: $black;
  color: #fff;
  padding: 70px 0 56px;

  .inner {
    width: 90%;
    max-width: 1100px;
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
    font-size: clamp(30px, 5vw, 48px);
    text-transform: uppercase;
    line-height: 1.1;
    margin: 0 0 18px;
  }

  p {
    max-width: 620px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }
}

.contact-main {
  padding: 56px 0 80px;

  .inner {
    width: 90%;
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: 50px;
    align-items: start;
  }

  h2 {
    font-size: 20px;
    text-transform: uppercase;
    margin: 0 0 24px;
  }
}

.details {
  .detail {
    margin-bottom: 24px;

    .label {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #999;
      margin-bottom: 6px;
    }

    p {
      margin: 0;
      font-size: 16px;
      color: #111;
      line-height: 1.5;
    }

    small {
      color: #777;
    }

    a {
      color: #111;
      text-decoration: underline;
      text-decoration-color: $accent;
      text-underline-offset: 3px;
    }
  }

  .socials {
    display: flex;
    gap: 12px;
    margin-top: 4px;

    a {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: $black;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      text-decoration: none;
      transition:
        transform 0.2s ease,
        background 0.2s ease;

      &:hover {
        transform: translateY(-3px);
        background: $accent;
        color: $black;
      }
    }
  }
}

.form-card {
  background: $cream;
  border-radius: 24px;
  padding: 36px;

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .field {
    margin-bottom: 18px;
    display: flex;
    flex-direction: column;

    label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #555;
      margin-bottom: 8px;
    }

    input,
    textarea {
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 12px;
      padding: 0.85rem 1rem;
      font-size: 15px;
      font-family: inherit;
      outline: none;
      transition: border 0.2s ease;

      &:focus {
        border-color: $black;
      }
    }

    textarea {
      resize: vertical;
    }
  }

  .submit-btn {
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

  .note {
    margin: 16px 0 0;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;

    &.error {
      background: #ffe8e8;
      color: #b00020;
    }

    &.success {
      background: #e7f8ec;
      color: #0f7a35;

      a {
        color: inherit;
      }
    }
  }
}

@media (max-width: 860px) {
  .contact-main .inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 520px) {
  .contact-hero {
    padding: 48px 0 40px;
  }

  .form-card {
    padding: 24px;

    .row {
      grid-template-columns: 1fr;
    }
  }
}
</style>
