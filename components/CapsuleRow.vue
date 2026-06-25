<template>
  <section class="capsule" :class="`capsule--${layout}`">
    <!-- ── Editorial banner ──────────────────────────────────── -->
    <header class="banner">
      <div
        v-if="banner"
        class="banner-art"
        :style="{ backgroundImage: `url(${banner})` }"
        aria-hidden="true"
      />
      <!-- ambient wash so text stays legible without a hard overlay box -->
      <div class="banner-wash" aria-hidden="true" />

      <div class="banner-copy">
        <span v-if="eyebrow" class="eyebrow">
          <span class="dot" aria-hidden="true" />{{ eyebrow }}
        </span>
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>

      <!-- carousel controls live in the banner, top-right -->
      <div v-if="layout === 'carousel'" class="controls">
        <button type="button" aria-label="Scroll back" @click="scrollBy(-1)">
          <i class="bi bi-arrow-left"></i>
        </button>
        <button type="button" aria-label="Scroll forward" @click="scrollBy(1)">
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </header>

    <!-- ── Content: grid or scroll-snap carousel ─────────────── -->
    <div v-if="layout === 'carousel'" ref="scroller" class="scroller">
      <slot />
    </div>
    <div v-else class="grid">
      <slot />
    </div>
  </section>
</template>

<script>
export default {
  name: "CapsuleRow",

  props: {
    eyebrow: { type: String, default: "" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    banner: { type: String, default: "" },
    // "carousel" → dense horizontal scroll-snap row; "grid" → wrapped grid.
    layout: {
      type: String,
      default: "grid",
      validator: (v) => ["grid", "carousel"].includes(v),
    },
  },

  methods: {
    // Scroll roughly one viewport of cards in the given direction (-1 / +1).
    scrollBy(direction) {
      const el = this.$refs.scroller;
      if (!el) return;
      el.scrollBy({
        left: direction * Math.round(el.clientWidth * 0.85),
        behavior: "smooth",
      });
    },
  },
};
</script>

<style scoped lang="scss">
$lime: #ffbf38;
$ink: #131515;
$plat: #f0f0ec;

.capsule {
  // Faint glass capsule: distinguished from the page purely by transparency.
  position: relative;
  border-radius: 30px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.022);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset;

  // ── Banner ─────────────────────────────────────────────────
  .banner {
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 28px;
    margin-bottom: 26px;
    isolation: isolate;
  }

  .banner-art {
    position: absolute;
    inset: 0;
    z-index: -2;
    background-size: cover;
    background-position: center;
    transform: scale(1.04);
    filter: brightness(0.65) saturate(1.05);
    transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover .banner-art {
    transform: scale(1.09);
  }

  // Smooth layer drop from transparent to ink — no hard edges.
  .banner-wash {
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      linear-gradient(
        180deg,
        rgba(19, 21, 21, 0.1) 0%,
        rgba(19, 21, 21, 0.55) 60%,
        rgba(19, 21, 21, 0.92) 100%
      ),
      radial-gradient(
        120% 100% at 0% 100%,
        rgba($lime, 0.14) 0%,
        transparent 55%
      );
  }

  // When no banner image, the capsule still reads as a tinted glass header.
  .banner:not(:has(.banner-art)) {
    background: rgba(255, 255, 255, 0.03);
  }

  .banner-copy {
    max-width: 620px;

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: $lime;
      margin-bottom: 14px;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: $lime;
        box-shadow: 0 0 10px 1px rgba($lime, 0.8);
      }
    }

    h2 {
      margin: 0;
      font-size: clamp(1.6rem, 3.4vw, 2.6rem);
      font-weight: 800;
      line-height: 1.02;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: $plat;
    }

    p {
      margin: 12px 0 0;
      font-size: clamp(0.85rem, 1.1vw, 0.98rem);
      line-height: 1.6;
      color: rgba($plat, 0.62);
    }
  }

  // ── Carousel controls ──────────────────────────────────────
  .controls {
    position: absolute;
    top: 24px;
    right: 24px;
    display: flex;
    gap: 10px;
    z-index: 2;

    button {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border: none;
      cursor: pointer;
      border-radius: 50%;
      color: $plat;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      font-size: 1.05rem;
      transition:
        background 0.3s ease,
        color 0.3s ease,
        transform 0.3s ease;

      &:hover {
        background: $lime;
        color: $ink;
        transform: translateY(-2px);
      }
    }
  }

  // ── Grid layout ────────────────────────────────────────────
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 22px;
    align-items: start;
  }

  // ── Carousel layout: dense horizontal scan, snap, no scrollbar ─
  .scroller {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(230px, 260px);
    gap: 22px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding: 6px 2px 14px;
    // Hide the scrollbar; navigation is via the controls / swipe.
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }

    > * {
      scroll-snap-align: start;
    }
  }
}

@media (max-width: 720px) {
  .capsule {
    padding: 14px;
    border-radius: 24px;

    .banner {
      min-height: 180px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .controls {
      top: 16px;
      right: 16px;

      button {
        width: 38px;
        height: 38px;
      }
    }

    .grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .scroller {
      grid-auto-columns: minmax(170px, 72%);
      gap: 14px;
    }
  }
}
</style>
