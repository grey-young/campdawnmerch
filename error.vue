<template>
  <div class="error-page">
    <Header />

    <section class="error-main">
      <div class="inner">
        <div class="code">{{ error?.statusCode || 404 }}</div>
        <h1>{{ heading }}</h1>
        <p>{{ message }}</p>
        <div class="actions">
          <button class="primary" @click="goHome">Back to Home</button>
          <nuxt-link to="/products" class="secondary">Browse Shop</nuxt-link>
          <nuxt-link to="/contact" class="secondary">Contact Us</nuxt-link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
const props = defineProps({
  error: { type: Object, default: () => ({}) },
});

const heading = computed(() =>
  props.error?.statusCode === 404 ? "Page not found" : "Something went wrong",
);

const message = computed(() =>
  props.error?.statusCode === 404
    ? "The page you’re looking for doesn’t exist or may have moved."
    : "An unexpected error occurred. Please try again, or head back to the homepage.",
);

const goHome = () => clearError({ redirect: "/" });

useHead({ title: `${heading.value} | CampDawn Merch` });
</script>

<style scoped lang="scss">
$black: #131515;
$accent: #ffbf38;
$plat: #f0f0ec;

.error-page {
  background: $black;
  min-height: 100vh;
}

.error-main {
  min-height: 60vh;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 80px 20px;

  .inner {
    max-width: 540px;
  }

  .code {
    font-size: clamp(70px, 18vw, 140px);
    font-weight: 800;
    line-height: 1;
    color: $plat;
    letter-spacing: -0.04em;
    text-shadow: 0 0 60px rgba($accent, 0.25);
  }

  h1 {
    font-size: clamp(22px, 4vw, 32px);
    text-transform: uppercase;
    margin: 12px 0 14px;
    color: $plat;
  }

  p {
    color: rgba($plat, 0.55);
    line-height: 1.7;
    margin: 0 0 30px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    justify-content: center;

    .primary,
    .secondary {
      padding: 0.85rem 1.6rem;
      border-radius: 999px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition:
        transform 0.25s ease,
        background 0.25s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }

    // The lime spark CTA.
    .primary {
      background: $accent;
      color: $black;
      border: none;
      box-shadow: 0 14px 34px -14px rgba($accent, 0.7);
    }

    .secondary {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: $plat;
      border: none;

      &:hover {
        background: rgba(255, 255, 255, 0.09);
      }
    }
  }
}
</style>
