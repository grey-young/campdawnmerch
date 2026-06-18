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

    <div
      v-for="category in groupedByCategory"
      :key="category.id"
      class="category-block"
    >
      <h2 class="category-title">{{ category.name }}</h2>

      <div class="row">
        <nuxt-link
          v-for="product in category.products"
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

  computed: {
    // Group active products by their category so each category renders as its
    // own horizontally scrollable row (e.g. all jerseys together).
    groupedByCategory() {
      const groups = new Map();

      for (const product of this.products) {
        const category = product.merch_categories;
        const id = category?.id || "uncategorized";
        const name = category?.name || "Other";

        if (!groups.has(id)) {
          groups.set(id, { id, name, products: [] });
        }

        groups.get(id).products.push(product);
      }

      return Array.from(groups.values());
    },
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
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        return;
      }

      this.products = data || [];
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
      this.$gsap.set(".section-2 .category-block", {
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
          ".section-2 .category-block",
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

  .category-block {
    width: 90%;
    margin: 60px auto 0;

    .category-title {
      font-size: clamp(18px, 2.2vw, 26px);
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 24px;
    }

    // Horizontal scroller: shows the first products in a category and lets
    // you swipe/scroll sideways through the rest of that category.
    .row {
      display: flex;
      gap: 28px;
      overflow-x: auto;
      padding-bottom: 16px;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;

      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.3) transparent;

      &::-webkit-scrollbar {
        height: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.25);
        border-radius: 999px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      .product-link {
        text-decoration: none;
        display: block;
        flex: 0 0 auto;
        width: 340px;
        max-width: 80vw;
        scroll-snap-align: start;
        color: black;
      }
    }
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

    .category-block {
      width: 95%;
      margin-top: 40px;

      .row {
        gap: 16px;

        .product-link {
          width: 260px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .section-2 {
    padding: 40px 0;

    nav {
      width: 95%;
      gap: 12px;
    }

    .category-block {
      width: 95%;
      margin-top: 30px;

      .row {
        gap: 12px;

        .product-link {
          width: 75vw;
        }
      }
    }
  }
}
</style>
