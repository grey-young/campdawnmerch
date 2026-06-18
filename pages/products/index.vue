<template lang="html">
  <div id="product-page">
    <Header />

    <div class="all-merch">
      <div class="more-stuff">
        <div>
          <h2>All Merch</h2>
          <p>{{ filteredProducts.length }} product(s) available</p>
        </div>

        <input
          v-model="search"
          type="text"
          placeholder="Search for products..."
        />
      </div>

      <div v-if="categories.length" class="category-filter">
        <button
          type="button"
          class="chip"
          :class="{ active: selectedCategory === 'all' }"
          @click="selectedCategory = 'all'"
        >
          All
        </button>

        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="chip"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>

      <div v-if="filteredProducts.length === 0" class="empty">
        <h3>No merch found</h3>
        <p>Try another search or category.</p>
      </div>

      <div v-else class="products-grid">
        <nuxt-link
          v-for="product in filteredProducts"
          :key="product.id"
          :to="`/products/${product.slug}`"
          class="product-link"
        >
          <Card
            :name="product.name"
            :price="`GH₵ ${formatMoney(product.price)}`"
            :compare-price="product.compare_at_price"
            :image="getMainImage(product)"
          />

          <div class="product-meta">
            <span>{{ product.merch_categories?.name }}</span>
            <b>{{ getProductStock(product) }} in stock</b>
          </div>
        </nuxt-link>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
export default {
  name: "ProductsPage",

  data() {
    return {
      loading: true,
      search: "",
      selectedCategory: "all",
      products: [],
    };
  },

  computed: {
    categories() {
      const unique = new Map();

      for (const product of this.products) {
        const category = product.merch_categories;

        if (category && category.id) {
          unique.set(category.id, category.name);
        }
      }

      return Array.from(unique, ([id, name]) => ({ id, name }));
    },

    filteredProducts() {
      const term = this.search.toLowerCase();

      return this.products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(term) ||
          product.slug.toLowerCase().includes(term) ||
          (product.merch_categories?.name || "").toLowerCase().includes(term);

        const matchesCategory =
          this.selectedCategory === "all" ||
          product.merch_categories?.id === this.selectedCategory;

        return matchesSearch && matchesCategory;
      });
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
      this.loading = true;

      const { data, error } = await this.$supabase
        .from("merch_products")
        .select(
          `
          id,
          name,
          slug,
          price,
          compare_at_price,
          status,
          is_featured,
          merch_categories (
            id,
            name,
            slug
          ),
          merch_product_images (
            id,
            image_url,
            is_main,
            sort_order
          ),
          merch_product_variants (
            id,
            color,
            size,
            stock,
            is_active
          )
        `,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        this.loading = false;
        return;
      }

      this.products = data || [];
      this.loading = false;
    },

    getMainImage(product) {
      const images = product.merch_product_images || [];

      if (!images.length) return "/shirt.jpg";

      const mainImage = images.find((image) => image.is_main);

      return mainImage
        ? mainImage.image_url
        : images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    },

    getProductStock(product) {
      const variants = product.merch_product_variants || [];

      return variants
        .filter((variant) => variant.is_active)
        .reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },

    runAnimations() {
      if (!this.$gsap) return;

      this.$gsap.set([".more-stuff h2", ".more-stuff p", ".more-stuff input"], {
        opacity: 0,
        y: 30,
      });

      this.$gsap.set(".product-link", {
        opacity: 0,
        y: 40,
      });

      const timeline = this.$gsap.timeline({
        scrollTrigger: {
          trigger: ".all-merch",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      timeline
        .to([".more-stuff h2", ".more-stuff p", ".more-stuff input"], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
        })
        .to(
          ".product-link",
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.1,
          },
          "-=0.35",
        );
    },
  },
};
</script>

<style lang="scss" scoped>
#product-page {
  .all-merch {
    width: 90%;
    margin: 80px auto;

    .more-stuff {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 25px;
      margin-bottom: 40px;

      h2 {
        font-size: 32px;
        text-transform: uppercase;
        margin: 0;
      }

      p {
        margin: 10px 0 0;
        color: #777;
        font-size: 15px;
      }

      input {
        padding: 0.8rem 1.5rem;
        border: 1px solid black;
        border-radius: 100px;
        outline: none;
        font-size: 16px;
        width: 350px;
      }
    }

    .category-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 36px;

      .chip {
        border: 1px solid rgba(0, 0, 0, 0.18);
        background: white;
        color: #111;
        border-radius: 999px;
        padding: 0.65rem 1.25rem;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: 0.2s ease;

        &:hover {
          border-color: #111;
          transform: translateY(-2px);
        }

        &.active {
          background: #111;
          color: white;
          border-color: #111;
        }
      }
    }

    .loading,
    .empty {
      min-height: 260px;
      display: grid;
      place-items: center;
      text-align: center;
      border-radius: 30px;
      background: #f6f2ec;

      h3 {
        margin: 0;
        font-size: 26px;
      }

      p {
        margin: 8px 0 0;
        color: #777;
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 30px;
    }

    .product-link {
      text-decoration: none;
      color: inherit;
      display: block;
      transition: 0.3s ease;

      &:hover {
        transform: translateY(-6px);
      }
    }

    .product-meta {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;

      span,
      b {
        font-size: 12px;
        font-weight: 800;
        padding: 8px 11px;
        border-radius: 999px;
      }

      span {
        background: #f3eee6;
        color: #111;
      }

      b {
        background: #111;
        color: white;
      }
    }
  }
}

@media (max-width: 1100px) {
  #product-page {
    .all-merch {
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
      }
    }
  }
}

@media (max-width: 900px) {
  #product-page {
    .all-merch {
      margin: 60px auto;

      .more-stuff {
        gap: 20px;

        h2 {
          font-size: 28px;
        }

        input {
          width: 100%;
        }
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
    }
  }
}

@media (max-width: 720px) {
  #product-page {
    .all-merch {
      width: 95%;
      margin: 50px auto;

      .more-stuff {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        h2 {
          font-size: 26px;
        }

        p {
          font-size: 14px;
        }

        input {
          width: 100%;
          padding: 0.75rem 1.2rem;
          font-size: 15px;
        }
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 18px;
      }

      .product-meta {
        flex-wrap: wrap;
        gap: 8px;

        span,
        b {
          flex: 1;
          min-width: 100px;
          font-size: 11px;
          padding: 6px 9px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  #product-page {
    .all-merch {
      width: 95%;
      margin: 40px auto;

      .more-stuff {
        margin-bottom: 30px;

        h2 {
          font-size: 22px;
        }

        p {
          font-size: 13px;
        }

        input {
          padding: 0.65rem 1rem;
          font-size: 14px;
          border-radius: 8px;
        }
      }

      .loading,
      .empty {
        min-height: 200px;

        h3 {
          font-size: 22px;
        }

        p {
          font-size: 13px;
        }
      }

      .products-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .product-link {
        &:hover {
          transform: translateY(-3px);
        }
      }

      .product-meta {
        flex-direction: column;
        align-items: flex-start;

        span,
        b {
          width: 100%;
          text-align: center;
          font-size: 10px;
        }
      }
    }
  }
}
</style>
