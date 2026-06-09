<template>
  <section class="section-2">
    <nav>
      <h1>Our Merch</h1>

      <nuxt-link to="/products">
        <button>
          View More
          <i class="bi bi-arrow-up-right"></i>
        </button>
      </nuxt-link>
    </nav>

    <div class="products">
      <nuxt-link
        v-for="product in products"
        :key="product.id"
        :to="`/products/${product.slug}`"
        class="product-link"
      >
        <Card
          :name="product.name"
          :price="`GH₵ ${formatMoney(product.price)}`"
          :image="getMainImage(product)"
        />
      </nuxt-link>
    </div>
  </section>
</template>

<script>
export default {
  name: "SectionTwo",

  data() {
    return {
      products: [],
    };
  },

  async mounted() {
    await this.getProducts();
    this.$nextTick(() => {
      this.runAnimations();
    });
  },

  methods: {
    async getProducts() {
      const { data, error } = await this.$supabase
        .from("merch_products")
        .select(
          `
          id, name, slug, price, compare_at_price, status, is_featured,
          merch_categories (id, name, slug),
          merch_product_images (id, image_url, is_main, sort_order),
          merch_product_variants (id, color, size, stock, is_active)
        `,
        )
        .eq("status", "active");

      if (error) {
        console.error(error.message);
        return;
      }

      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      this.products = shuffled.slice(0, 5);
    },

    getMainImage(product) {
      const images = product.merch_product_images || [];
      if (!images.length) return "/shirt.jpg";
      const mainImage = images.find((image) => image.is_main);
      return mainImage
        ? mainImage.image_url
        : images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },

    runAnimations() {
      if (!this.$gsap) return;

      this.$gsap.set(".section-2 nav > *", { y: 30, opacity: 0 });
      this.$gsap.set(".section-2 .products .product-link", {
        y: 50,
        opacity: 0,
      });

      const timeline = this.$gsap.timeline({
        scrollTrigger: {
          trigger: ".section-2",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      timeline
        .to(".section-2 nav > *", {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
        })
        .to(
          ".section-2 .products .product-link",
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
          },
          "-=0.3",
        );
    },
  },
};
</script>

<style scoped lang="scss">
.section-2 {
  min-height: 80vh;
  padding: 80px 0;
  background: white;
  position: relative;
  z-index: 2;

  nav {
    width: 90%;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    h1 {
      font-size: clamp(24px, 4vw, 42px);
      text-transform: uppercase;
      font-weight: 700;
    }

    a {
      color: black;
      text-decoration: none;
      flex-shrink: 0; // prevents button from squishing on mid-size screens

      button {
        background: black;
        border: none;
        padding: 0.875rem 2rem;
        color: white;
        border-radius: 100px;
        cursor: pointer;
        font-size: 14px;
        transition: 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap; // prevents button text wrapping

        &:hover {
          transform: translateY(-3px);
        }
      }
    }
  }

  .products {
    width: 90%;
    margin: 60px auto 0;
    display: grid;
    grid-template-columns: repeat(5, minmax(400px, 1fr));
    gap: 28px;

    .product-link {
      text-decoration: none;
      display: block;
      width: 100%;
      min-width: 0;
      height: 100%;
      color: black;
    }
  }
}

@media (max-width: 1400px) {
  .section-2 .products {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .section-2 .products {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .section-2 {
    padding: 50px 0;

    nav {
      width: 95%;
      flex-direction: column;
      align-items: flex-start;
    }

    .products {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-top: 40px;
      width: 95%;
    }
  }
}

@media (max-width: 480px) {
  .section-2 {
    padding: 40px 0;

    nav {
      width: 95%;
      width: 95%;
      gap: 12px;
    }

    .products {
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 12px;
      width: 95%;
      margin-top: 30px;
    }
  }
}
</style>
