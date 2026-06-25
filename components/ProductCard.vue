<template>
  <article
    class="product-card"
    :class="{ 'is-sold-out': soldOut }"
  >
    <!-- ── Media + interactive layer ─────────────────────────── -->
    <div class="media">
      <nuxt-link :to="to" class="media-link" :aria-label="name">
        <img :src="finalImage" :alt="name" loading="lazy" decoding="async" />
      </nuxt-link>

      <!-- corner tick: a faint HUD signature, not a border -->
      <span class="tick" aria-hidden="true" />

      <!-- dynamic stock badge -->
      <span
        v-if="badge"
        class="badge"
        :class="`badge--${badge.variant}`"
      >
        {{ badge.label }}
      </span>

      <!-- sold-out veil replaces the quick actions entirely -->
      <div v-if="soldOut" class="veil">
        <span>Sold&nbsp;Out</span>
        <small>Restock soon</small>
      </div>

      <!-- quick actions: slide up on hover/focus -->
      <div v-else class="quick">
        <div v-if="sizes.length" class="sizes" role="group" aria-label="Select a size">
          <button
            v-for="size in sizes"
            :key="size"
            type="button"
            class="size"
            @click="emitAdd(size)"
          >
            {{ size }}
          </button>
        </div>

        <button type="button" class="add" @click="emitAdd(null)">
          <i class="bi bi-bag-plus"></i>
          <span>{{ sizes.length ? "Quick add" : "Add to bag" }}</span>
        </button>
      </div>
    </div>

    <!-- ── Context row ───────────────────────────────────────── -->
    <nuxt-link :to="to" class="info">
      <h3>{{ name }}</h3>
      <p class="price">
        <span class="current">{{ formattedPrice }}</span>
        <span v-if="formattedCompare" class="compare">{{ formattedCompare }}</span>
      </p>
    </nuxt-link>
  </article>
</template>

<script>
export default {
  name: "ProductCard",

  props: {
    name: { type: String, required: true },
    // Pre-formatted localized price, e.g. "GH₵ 240.00".
    price: { type: [String, Number], required: true },
    // Raw compare-at value; rendered struck-through only when above price.
    comparePrice: { type: [String, Number], default: null },
    image: { type: String, default: "/shirt.jpg" },
    to: { type: String, default: "#" },
    // { label: "New Drop", variant: "new" | "limited" | "sold-out" } | null
    badge: { type: Object, default: null },
    // Available sizes for the slide-up popover, e.g. ["S","M","L"].
    sizes: { type: Array, default: () => [] },
    soldOut: { type: Boolean, default: false },
  },

  emits: ["add"],

  computed: {
    finalImage() {
      if (!this.image) return "/shirt.jpg";
      if (this.image.startsWith("http") || this.image.startsWith("/"))
        return this.image;
      return `/${this.image}`;
    },

    formattedPrice() {
      if (typeof this.price === "string") return this.price;
      return `GH₵ ${Number(this.price || 0).toFixed(2)}`;
    },

    formattedCompare() {
      const compare = Number(this.comparePrice || 0);
      const current = Number(
        typeof this.price === "string"
          ? this.price.replace(/[^0-9.]/g, "")
          : this.price || 0,
      );

      if (!compare || compare <= current) return "";
      return `GH₵ ${compare.toFixed(2)}`;
    },
  },

  methods: {
    emitAdd(size) {
      this.$emit("add", { size });
    },
  },
};
</script>

<style scoped lang="scss">
// ── Tokens (mirrored from the home hero + footer) ─────────────
$lime: #ffbf38;
$ink: #131515;
$plat: #f0f0ec;

.product-card {
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  // Platinum glass: separation by transparency, never a border.
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  // Soft layer drop in place of a hard outline.
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.05) inset,
    0 18px 40px -28px rgba(0, 0, 0, 0.9);
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.45s ease,
    box-shadow 0.45s ease;

  &:hover {
    transform: translateY(-6px);
    background: rgba(255, 255, 255, 0.07);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.08) inset,
      0 30px 60px -30px rgba(0, 0, 0, 0.95);
  }

  // ── Media ───────────────────────────────────────────────────
  .media {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
  }

  .media-link {
    display: block;
    height: 100%;
    width: 100%;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      // Subtle premium dim that lifts on hover — no harsh color flip.
      filter: brightness(0.92) saturate(1.02);
      transform: scale(1.01);
      transition:
        filter 0.5s ease,
        transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  &:hover .media-link img {
    filter: brightness(1.04) saturate(1.06);
    transform: scale(1.06);
  }

  // Faint HUD corner tick — gamer signature without a box border.
  .tick {
    position: absolute;
    top: 12px;
    left: 12px;
    width: 16px;
    height: 16px;
    border-top: 2px solid rgba($lime, 0.55);
    border-left: 2px solid rgba($lime, 0.55);
    opacity: 0.5;
    transition: opacity 0.4s ease;
    pointer-events: none;
    z-index: 3;
  }

  &:hover .tick {
    opacity: 0.9;
  }

  // ── Badge: white glass, with a faint accent tint per variant ─
  .badge {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 3;
    padding: 6px 11px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $plat;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 6px 18px -10px rgba(0, 0, 0, 0.8);

    &--new {
      color: $lime;
      background: rgba($lime, 0.12);
    }

    &--limited {
      color: #ffd66b;
      background: rgba(255, 214, 107, 0.12);
    }

    &--sold-out {
      color: #ff8d8d;
      background: rgba(255, 141, 141, 0.12);
    }
  }

  // ── Sold-out state ─────────────────────────────────────────
  &.is-sold-out .media-link img {
    filter: grayscale(0.9) brightness(0.5);
    transform: none;
  }

  .veil {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: rgba(19, 21, 21, 0.35);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);

    span {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: $plat;
    }

    small {
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba($plat, 0.5);
    }
  }

  // ── Quick actions: fluid slide-up, no sudden flips ─────────
  .quick {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 12px;
    z-index: 4;
    display: flex;
    flex-direction: column;
    gap: 8px;
    // Hidden below the card edge until hover/focus.
    transform: translateY(140%);
    opacity: 0;
    transition:
      transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.4s ease;
  }

  &:hover .quick,
  &:focus-within .quick {
    transform: translateY(0);
    opacity: 1;
  }

  .sizes {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .size {
      flex: 1 1 auto;
      min-width: 34px;
      padding: 8px 0;
      border: none;
      cursor: pointer;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: $plat;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition:
        background 0.3s ease,
        transform 0.3s ease,
        color 0.3s ease;

      &:hover {
        background: rgba($lime, 0.9);
        color: $ink;
        transform: translateY(-2px);
      }
    }
  }

  .add {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 11px 14px;
    border: none;
    cursor: pointer;
    border-radius: 12px;
    // The lime "spark" — the one saturated CTA in the duo system.
    background: $lime;
    color: $ink;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    box-shadow: 0 10px 24px -12px rgba($lime, 0.7);
    transition:
      transform 0.3s ease,
      filter 0.3s ease;

    i {
      font-size: 14px;
    }

    &:hover {
      transform: translateY(-2px);
      filter: brightness(1.06);
    }
  }

  // ── Context row ────────────────────────────────────────────
  .info {
    display: block;
    text-decoration: none;
    padding: 14px 16px 16px;

    h3 {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: $plat;
      // Reserve two lines so varied titles never shift card height.
      min-height: 2.5em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .price {
      margin: 0;
      display: flex;
      align-items: baseline;
      gap: 9px;

      .current {
        font-size: 15px;
        font-weight: 800;
        color: $plat;
      }

      .compare {
        font-size: 12px;
        font-weight: 600;
        color: rgba($plat, 0.4);
        text-decoration: line-through;
      }
    }
  }

  @media (max-width: 480px) {
    border-radius: 18px;

    .info {
      padding: 12px 12px 14px;

      h3 {
        font-size: 12.5px;
      }

      .price .current {
        font-size: 14px;
      }
    }

    // Touch devices have no hover: keep quick-add reachable.
    .quick {
      transform: translateY(0);
      opacity: 1;
      position: static;
      margin: 10px 12px 12px;
    }
  }
}
</style>
