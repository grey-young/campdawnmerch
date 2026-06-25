<template>
  <div class="card">
    <img :src="finalImage" :alt="name" loading="lazy" decoding="async" />
    <h3>{{ name }}</h3>
    <p class="price">
      <span class="current">{{ formattedPrice }}</span>
      <span v-if="formattedCompare" class="compare">{{
        formattedCompare
      }}</span>
    </p>
  </div>
</template>

<script>
export default {
  name: "Card",

  props: {
    name: { type: String, required: true },
    price: { type: [String, Number], required: true },
    // Original price shown struck-through. Only rendered when it's higher
    // than the current price.
    comparePrice: { type: [String, Number], default: null },
    image: { type: String, default: "/shirt.jpg" },
  },

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
};
</script>

<style scoped lang="scss">
$lime: #ffbf38;
$plat: #f0f0ec;

.card {
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  height: 100%;
  min-width: 0; // let the parent grid/track control width
  width: 100%;
  // Platinum glass: separation by transparency, no border.
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
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

  img {
    width: 100%;
    height: clamp(
      180px,
      25vw,
      320px
    ); // scales with viewport, never too tall on mobile
    object-fit: cover;
    display: block;
    background: rgba(255, 255, 255, 0.04);
    filter: brightness(0.92) saturate(1.02);
    transition: filter 0.5s ease;
  }

  &:hover img {
    filter: brightness(1.04) saturate(1.06);
  }

  h3 {
    font-size: clamp(13px, 1.4vw, 16px);
    margin: 14px 16px 8px;
    text-transform: uppercase;
    line-height: 1.25;
    letter-spacing: 0.02em;
    color: $plat;
    // Always reserve two lines and hide any overflow so titles of different
    // lengths never change the card height.
    min-height: 2.5em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  p.price {
    font-size: clamp(14px, 1.3vw, 16px);
    font-weight: 800;
    margin: 0 16px 16px;
    color: $plat;
    display: flex;
    align-items: baseline;
    gap: 9px;

    .compare {
      font-weight: 600;
      color: rgba($plat, 0.4);
      text-decoration: line-through;
      font-size: 0.82em;
    }
  }
}
</style>
