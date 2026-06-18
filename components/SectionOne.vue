<template>
  <section class="section-1">
    <div class="text">
      <h1>
        <span class="line">Shop CampDawn</span><br />
        <span class="line">Merch</span>
      </h1>
    </div>
    <div class="images">
      <div class="image-item" v-for="(image, index) in images" :key="index">
        <img :src="image.src" :alt="image.alt" />
        <div class="img-hover">
          <h3>{{ image.alt }}</h3>
          <nuxt-link :to="image.to">
            <button type="button">Shop Now</button>
          </nuxt-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// Fallback hero images, shown when there aren't enough featured products.
// Each featured product the admin uploads replaces these slots one by one,
// starting from the first.
const DEFAULT_IMAGES = [
  { src: "/hoodie.png", alt: "CampDawn Hoodie", to: "/products" },
  { src: "/shirt2.jpg", alt: "CampDawn Shirt", to: "/products" },
  { src: "/shirt.jpg", alt: "CampDawn Shirt", to: "/products" },
  { src: "/hat.png", alt: "CampDawn Hat", to: "/products" },
  { src: "/shirt3.png", alt: "CampDawn Shirt", to: "/products" },
];

export default {
  name: "SectionOne",
  data() {
    return {
      images: DEFAULT_IMAGES.map((image) => ({ ...image })),
    };
  },
  mounted() {
    this.loadFeatured();

    setTimeout(() => {
      const tl = this.$gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.5 },
      });

      tl.to(
        ".section-1 .text .line",
        { y: 0, opacity: 1, stagger: 0.15 },
        0,
      ).to(
        ".section-1 .images .image-item",
        { y: 0, opacity: 1, stagger: 0.12 },
        "-=0.4",
      );
    }, 3000);
  },
  methods: {
    async loadFeatured() {
      const { data, error } = await this.$supabase
        .from("merch_products")
        .select(
          `
          id, name, slug, is_featured,
          merch_product_images (image_url, is_main, sort_order)
        `,
        )
        .eq("status", "active")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(DEFAULT_IMAGES.length);

      if (error) {
        console.error(error.message);
        return;
      }

      const featured = data || [];
      if (!featured.length) return;

      // Replace the default slots one by one with each featured product.
      // 1 featured replaces only the first slot, 2 the first two, and so on.
      const slots = DEFAULT_IMAGES.map((image) => ({ ...image }));

      featured.forEach((product, index) => {
        slots[index] = {
          src: this.getMainImage(product),
          alt: product.name,
          to: `/products/${product.slug}`,
        };
      });

      this.images = slots;
    },

    getMainImage(product) {
      const images = product.merch_product_images || [];
      if (!images.length) return "/shirt.jpg";
      const mainImage = images.find((image) => image.is_main);
      return mainImage
        ? mainImage.image_url
        : images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    },
  },
};
</script>

<style lang="scss" scoped>
.section-1 {
  width: 100%;
  background: white;
  position: relative;
  z-index: 2;

  .images {
    .image-item {
      position: relative;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
    }

    .img-hover {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      opacity: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 1rem;
      gap: 0.75rem;
      transition: opacity 0.3s ease;
      color: white;
    }

    .image-item:hover .img-hover,
    .image-item:focus-within .img-hover {
      opacity: 1;
    }

    .img-hover h3 {
      margin: 0;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .img-hover button {
      appearance: none;
      border: none;
      background: white;
      color: black;
      padding: 0.75rem 1.2rem;
      cursor: pointer;
      font-weight: 700;
      text-transform: uppercase;
      transition: transform 0.2s ease;
    }

    .img-hover button:hover {
      transform: translateY(-2px);
    }
  }

  @media (min-width: 769px) {
    height: 90vh;

    .text {
      height: 40%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      h1 {
        font-size: 58px;
      }
    }

    .images {
      height: 60%;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;

      .image-item {
        position: relative;
        height: 80%;
        width: 16%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
      }

      .image-item:nth-child(2),
      .image-item:nth-child(4) {
        height: 90%;
        width: 20%;
      }

      .image-item:nth-child(3) {
        height: 100%;
        width: 24%;

        img {
          filter: none;
        }
      }

      .img-hover {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        opacity: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 1rem;
        gap: 0.75rem;
        transition: opacity 0.3s ease;
        color: white;
      }

      .image-item:hover .img-hover {
        opacity: 1;
      }

      .img-hover h3 {
        margin: 0;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .img-hover button {
        appearance: none;
        border: none;
        background: white;
        color: black;
        padding: 0.75rem 1.2rem;
        cursor: pointer;
        font-weight: 700;
        text-transform: uppercase;
        transition: transform 0.2s ease;
      }

      .img-hover button:hover {
        transform: translateY(-2px);
      }
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    min-height: 100svh;
    padding-bottom: 2rem;

    .text {
      padding: 2.5rem 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;

      h1 {
        font-size: 40px;
      }
    }

    .images {
      padding: 0 1rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: auto auto;
      gap: 0.75rem;

      .image-item:nth-child(1),
      .image-item:nth-child(2) {
        height: 260px;
        width: 100%;
      }

      .image-item:nth-child(3) {
        grid-column: 1 / -1;
        height: 320px;
        width: 100%;

        img {
          filter: none;
        }
      }

      // 4th and 5th: third row
      .image-item:nth-child(4),
      .image-item:nth-child(5) {
        height: 260px;
        width: 100%;
      }
    }
  }

  @media (max-width: 480px) {
    min-height: 100svh;
    padding-bottom: 2rem;

    .text {
      padding: 2rem 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;

      h1 {
        font-size: 28px;
      }
    }

    .images {
      padding: 0 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .image-item {
        width: 100%;
        height: 220px;
      }

      .image-item:nth-child(3) {
        height: 300px;

        img {
          filter: none;
        }
      }
    }
  }

  .text {
    h1 {
      text-align: center;
      text-transform: uppercase;

      .line {
        display: inline-block;
        transform: translateY(40px);
        opacity: 0;
      }
    }
  }

  .images {
    .image-item {
      opacity: 0;
      transform: translateY(80px);
      transition:
        opacity 0.3s ease,
        transform 0.3s ease;

      img {
        object-fit: contain;
        transition: filter 0.3s ease;
      }
    }
  }
}
</style>
