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
.card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease;
  cursor: pointer;
  height: 100%;
  min-width: 0; // was 400px, let the parent grid control width
  width: 100%;
  background: white;

  &:hover {
    transform: translateY(-5px);
  }

  img {
    width: 100%;
    height: clamp(
      180px,
      25vw,
      320px
    ); // scales with viewport, never too tall on mobile
    object-fit: contain;
    display: block;
    background: #f3eee6;
  }

  h3 {
    font-size: clamp(14px, 1.5vw, 18px);
    margin: 12px 14px 6px;
    text-transform: uppercase;
    line-height: 1.2;
    // Always reserve two lines and hide any overflow so titles of different
    // lengths never change the card height.
    min-height: 2.4em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  p.price {
    font-size: clamp(13px, 1.3vw, 16px);
    font-weight: bold;
    margin: 0 14px 14px;
    color: #333;
    display: flex;
    align-items: baseline;
    gap: 8px;

    .compare {
      font-weight: 600;
      color: #999;
      text-decoration: line-through;
      font-size: 0.85em;
    }
  }
}
</style>
