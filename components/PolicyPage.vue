<template>
  <div class="policy-page">
    <Header />

    <section class="policy-hero">
      <div class="inner">
        <nav class="crumbs" aria-label="Breadcrumb">
          <nuxt-link to="/">Home</nuxt-link>
          <span aria-hidden="true">/</span>
          <span>{{ title }}</span>
        </nav>
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        <p class="updated">Last updated: {{ updated }}</p>
      </div>
    </section>

    <section class="policy-body">
      <article class="inner prose">
        <slot />
      </article>
    </section>

    <Footer />
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  updated: { type: String, default: "9 June 2026" },
});

useHead({
  title: `${props.title} | CampDawn Merch`,
  meta: [
    {
      name: "description",
      content:
        props.subtitle ||
        `${props.title} for CampDawn Merch, operated by CampDawn Esport.`,
    },
  ],
});
</script>

<style scoped lang="scss">
$black: #131515;
$accent: #ffbf38;
$cream: #f6f2ec;
$plat: #f0f0ec;

.policy-page {
  background: #131515;
}

.policy-hero {
  background: $black;
  color: #fff;
  padding: 70px 0 56px;

  .inner {
    width: 90%;
    max-width: 860px;
    margin: 0 auto;
  }

  .crumbs {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 13px;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 22px;

    a {
      color: $accent;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  h1 {
    font-size: clamp(28px, 5vw, 46px);
    text-transform: uppercase;
    letter-spacing: -0.01em;
    line-height: 1.1;
    margin: 0;
  }

  .subtitle {
    margin: 18px 0 0;
    font-size: clamp(15px, 2vw, 17px);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.6);
    max-width: 620px;
  }

  .updated {
    margin: 22px 0 0;
    display: inline-block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: $accent;
    border: 1px solid rgba($accent, 0.4);
    padding: 5px 12px;
    border-radius: 2px;
  }
}

.policy-body {
  padding: 56px 0 80px;

  .inner {
    width: 90%;
    max-width: 860px;
    margin: 0 auto;
  }
}

.prose {
  color: rgba(240, 240, 236, 0.72);
  font-size: 16px;
  line-height: 1.75;

  :deep(h2) {
    font-size: clamp(20px, 3vw, 26px);
    text-transform: uppercase;
    letter-spacing: -0.01em;
    margin: 44px 0 16px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: $plat;
  }

  :deep(h2:first-of-type) {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }

  :deep(h3) {
    font-size: 18px;
    margin: 28px 0 10px;
    color: $plat;
  }

  :deep(p) {
    margin: 0 0 16px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 18px;
    padding-left: 22px;
  }

  :deep(li) {
    margin-bottom: 10px;
  }

  :deep(a) {
    color: $plat;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: $accent;
    text-underline-offset: 3px;
  }

  :deep(strong) {
    color: $plat;
  }

  // Faint glass callout instead of a cream block.
  :deep(.callout) {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 22px 24px;
    margin: 28px 0;

    p {
      margin: 0;
    }
  }
}

@media (max-width: 600px) {
  .policy-hero {
    padding: 48px 0 40px;
  }

  .policy-body {
    padding: 40px 0 60px;
  }

  .prose {
    font-size: 15px;
  }
}
</style>
