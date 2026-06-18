<template>
  <div class="card">
    <img :src="finalImage" :alt="name" />
    <h3>{{ name }}</h3>
    <p>{{ formattedPrice }}</p>
  </div>
</template>

<script>
export default {
  name: "Card",

  props: {
    name: { type: String, required: true },
    price: { type: [String, Number], required: true },
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
  }

  p {
    font-size: clamp(13px, 1.3vw, 16px);
    font-weight: bold;
    margin: 0 14px 14px;
    color: #333;
  }
}
</style>
