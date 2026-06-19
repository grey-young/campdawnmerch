<template>
  <section class="products-page">
    <div class="page-head" ref="pageHead">
      <div>
        <p class="eyebrow">MERCH INVENTORY</p>
        <h1>Products</h1>
        <span>Manage all CampDawn merch products, stock and variants.</span>
      </div>

      <nuxt-link to="/admin/products/create" class="create-btn">
        Add Product
      </nuxt-link>
    </div>

    <div class="stats" ref="stats">
      <div class="stat-card">
        <p>Total Products</p>
        <h2>{{ products.length }}</h2>
      </div>

      <div class="stat-card">
        <p>Active</p>
        <h2>{{ activeProducts }}</h2>
      </div>

      <div class="stat-card">
        <p>Drafts</p>
        <h2>{{ draftProducts }}</h2>
      </div>

      <div class="stat-card">
        <p>Total Stock</p>
        <h2>{{ totalStock }}</h2>
      </div>
    </div>

    <div v-if="featuredProducts.length" class="featured-panel">
      <div class="featured-head">
        <div>
          <h2>Featured Arrangement</h2>
          <p>Order shown in the homepage hero & featured row. Top = first.</p>
        </div>
      </div>

      <div class="featured-list">
        <div
          v-for="(product, index) in featuredProducts"
          :key="product.id"
          class="featured-row"
        >
          <span class="pos">{{ index + 1 }}</span>

          <div class="thumb">
            <img
              v-if="getMainImage(product)"
              :src="getMainImage(product)"
              :alt="product.name"
            />
          </div>

          <strong class="name">{{ product.name }}</strong>

          <div class="move">
            <button
              type="button"
              :disabled="index === 0"
              aria-label="Move up"
              @click="moveFeatured(index, -1)"
            >
              <i class="bi bi-chevron-up"></i>
            </button>
            <button
              type="button"
              :disabled="index === featuredProducts.length - 1"
              aria-label="Move down"
              @click="moveFeatured(index, 1)"
            >
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="toolbar" ref="toolbar">
      <input v-model="search" type="text" placeholder="Search products..." />

      <select v-model="statusFilter">
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading products...</div>

    <div v-else-if="filteredProducts.length === 0" class="empty">
      <h2>No products found</h2>
      <p>Create your first merch product and let the store breathe.</p>

      <nuxt-link to="/admin/products/create"> Create Product </nuxt-link>
    </div>

    <div v-else class="products-grid" ref="productsGrid">
      <article
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
      >
        <div class="image">
          <img
            v-if="getMainImage(product)"
            :src="getMainImage(product)"
            :alt="product.name"
          />

          <div v-else class="no-image">No Image</div>

          <span class="status" :class="product.status">
            {{ product.status }}
          </span>
        </div>

        <div class="content">
          <div class="title-row">
            <div>
              <h2>{{ product.name }}</h2>
              <p>{{ product.merch_categories?.name || "No Category" }}</p>
            </div>

            <strong>GH₵ {{ formatMoney(product.price) }}</strong>
          </div>

          <div class="mini-stats">
            <div>
              <span>Stock</span>
              <b>{{ getProductStock(product) }}</b>
            </div>

            <div>
              <span>Variants</span>
              <b>{{ product.merch_product_variants?.length || 0 }}</b>
            </div>

            <div>
              <span>Featured</span>
              <b>{{ product.is_featured ? "Yes" : "No" }}</b>
            </div>
          </div>

          <div class="variants">
            <span
              v-for="variant in product.merch_product_variants"
              :key="variant.id"
            >
              {{ variant.color }} / {{ variant.size }}: {{ variant.stock }}
            </span>
          </div>

          <div class="actions">
            <select
              :value="product.status"
              @change="updateProductStatus(product, $event.target.value)"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            <nuxt-link :to="`/admin/products/${product.id}`" class="edit">
              Edit
            </nuxt-link>

            <button class="delete" @click="deleteProduct(product)">
              Delete
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="errorMessage" class="message error">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="message success">
      {{ successMessage }}
    </div>
  </section>
</template>

<script>
export default {
  name: "AdminProductsPage",

  data() {
    return {
      loading: true,
      products: [],
      search: "",
      statusFilter: "all",
      errorMessage: "",
      successMessage: "",
    };
  },

  computed: {
    filteredProducts() {
      return this.products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(this.search.toLowerCase()) ||
          product.slug.toLowerCase().includes(this.search.toLowerCase());

        const matchesStatus =
          this.statusFilter === "all" || product.status === this.statusFilter;

        return matchesSearch && matchesStatus;
      });
    },

    activeProducts() {
      return this.products.filter((product) => product.status === "active")
        .length;
    },

    draftProducts() {
      return this.products.filter((product) => product.status === "draft")
        .length;
    },

    totalStock() {
      return this.products.reduce((sum, product) => {
        return sum + this.getProductStock(product);
      }, 0);
    },

    // Featured products in the order they appear on the homepage. Top = first.
    featuredProducts() {
      return [...this.products]
        .filter((product) => product.is_featured)
        .sort(
          (a, b) =>
            (a.featured_order ?? 0) - (b.featured_order ?? 0) ||
            new Date(b.created_at) - new Date(a.created_at),
        );
    },
  },

  async mounted() {
    await this.getProducts();

    this.$nextTick(() => {
      this.animatePage();
    });
  },

  methods: {
    animatePage() {
      if (!this.$gsap) return;

      this.$gsap.from(this.$refs.pageHead, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.stats.children, {
        y: 30,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        delay: 0.12,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.toolbar, {
        y: 20,
        opacity: 0,
        duration: 0.55,
        delay: 0.24,
        ease: "power3.out",
      });

      if (this.$refs.productsGrid) {
        this.$gsap.from(".product-card", {
          y: 35,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          delay: 0.32,
          ease: "power3.out",
        });
      }
    },

    async getProducts() {
      this.loading = true;
      this.errorMessage = "";

      const { data, error } = await this.$supabase
        .from("merch_products")
        .select(
          `
          id,
          name,
          slug,
          description,
          price,
          compare_at_price,
          status,
          is_featured,
          featured_order,
          created_at,
          merch_categories (
            id,
            name
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
            sku,
            is_active
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        this.errorMessage = error.message;
        this.loading = false;
        return;
      }

      this.products = data || [];
      this.loading = false;
    },

    getMainImage(product) {
      const images = product.merch_product_images || [];

      if (!images.length) return "";

      const mainImage = images.find((image) => image.is_main);

      return mainImage
        ? mainImage.image_url
        : images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    },

    getProductStock(product) {
      const variants = product.merch_product_variants || [];

      return variants.reduce((sum, variant) => {
        return sum + Number(variant.stock || 0);
      }, 0);
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },

    async moveFeatured(index, direction) {
      const list = this.featuredProducts;
      const target = index + direction;

      if (target < 0 || target >= list.length) return;

      // Swap the two products, then renumber the whole list 0..n.
      const reordered = [...list];
      [reordered[index], reordered[target]] = [
        reordered[target],
        reordered[index],
      ];
      reordered.forEach((product, position) => {
        product.featured_order = position;
      });

      this.errorMessage = "";

      // Persist only the rows whose position actually changed.
      const results = await Promise.all(
        reordered.map((product) =>
          this.$supabase
            .from("merch_products")
            .update({ featured_order: product.featured_order })
            .eq("id", product.id),
        ),
      );

      const failed = results.find((result) => result.error);
      if (failed) {
        this.errorMessage = failed.error.message;
        return;
      }

      this.successMessage = "Featured order updated.";
      setTimeout(() => {
        this.successMessage = "";
      }, 1500);
    },

    async updateProductStatus(product, status) {
      this.errorMessage = "";
      this.successMessage = "";

      const { error } = await this.$supabase
        .from("merch_products")
        .update({ status })
        .eq("id", product.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      product.status = status;
      this.successMessage = "Product status updated.";

      setTimeout(() => {
        this.successMessage = "";
      }, 1800);
    },

    async deleteProduct(product) {
      const confirmDelete = confirm(
        `Are you sure you want to delete "${product.name}"?`,
      );

      if (!confirmDelete) return;

      this.errorMessage = "";
      this.successMessage = "";

      const { error } = await this.$supabase
        .from("merch_products")
        .delete()
        .eq("id", product.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.products = this.products.filter((item) => item.id !== product.id);
      this.successMessage = "Product deleted successfully.";

      setTimeout(() => {
        this.successMessage = "";
      }, 1800);
    },
  },
};

definePageMeta({
  layout: "admin-layout",
});
</script>

<style lang="scss" scoped>
.products-page {
  width: 100%;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;

  .eyebrow {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 4px;
    color: #9b753f;
  }

  h1 {
    margin: 0;
    font-size: clamp(34px, 5vw, 50px);
    letter-spacing: -2px;
    color: #111;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #777;
  }
}

.create-btn {
  text-decoration: none;
  background: #111;
  color: white;
  padding: 15px 20px;
  border-radius: 17px;
  font-weight: 900;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.14);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}

.stat-card {
  background: white;
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.06);

  p {
    margin: 0;
    color: #777;
    font-weight: 700;
    font-size: 13px;
  }

  h2 {
    margin: 10px 0 0;
    font-size: 34px;
    color: #111;
    letter-spacing: -1px;
  }
}

.featured-panel {
  background: white;
  border-radius: 26px;
  padding: 24px;
  margin-bottom: 22px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.06);

  .featured-head {
    margin-bottom: 18px;

    h2 {
      margin: 0;
      font-size: 22px;
      letter-spacing: -0.6px;
    }

    p {
      margin: 6px 0 0;
      color: #777;
      font-size: 14px;
    }
  }

  .featured-list {
    display: grid;
    gap: 10px;
  }

  .featured-row {
    display: grid;
    grid-template-columns: 34px 52px 1fr auto;
    align-items: center;
    gap: 14px;
    background: #fbfaf8;
    border: 1px solid #eee4d7;
    border-radius: 18px;
    padding: 10px 14px;

    .pos {
      font-weight: 900;
      color: #9b753f;
      text-align: center;
    }

    .thumb {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      overflow: hidden;
      background: #f3eee6;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .name {
      min-width: 0;
      font-size: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .move {
      display: flex;
      gap: 8px;

      button {
        width: 38px;
        height: 38px;
        border: none;
        border-radius: 12px;
        background: #111;
        color: white;
        font-size: 16px;
        cursor: pointer;
        display: grid;
        place-items: center;
        transition: 0.2s ease;

        &:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
    }
  }
}

.toolbar {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;

  input,
  select {
    border: 1px solid #ded8cf;
    background: white;
    border-radius: 17px;
    padding: 15px 16px;
    font-size: 15px;
    outline: none;
  }

  input {
    flex: 1;
  }

  select {
    width: 190px;
  }
}

.loading,
.empty {
  background: white;
  border-radius: 30px;
  padding: 50px;
  text-align: center;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.06);
}

.empty {
  h2 {
    margin: 0;
    font-size: 28px;
  }

  p {
    color: #777;
    margin: 10px 0 24px;
  }

  a {
    display: inline-block;
    text-decoration: none;
    background: #111;
    color: white;
    padding: 14px 18px;
    border-radius: 15px;
    font-weight: 900;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

.product-card {
  background: white;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.image {
  position: relative;
  height: 270px;
  background: #f3eee6;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: 0.4s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.no-image {
  height: 100%;
  display: grid;
  place-items: center;
  color: #777;
  font-weight: 900;
}

.status {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 9px 13px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  background: white;
  color: #111;

  &.active {
    background: #e7f8ec;
    color: #0f7a35;
  }

  &.draft {
    background: #fff2d8;
    color: #9b6a00;
  }

  &.archived {
    background: #eeeeee;
    color: #555;
  }
}

.content {
  padding: 22px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;

  h2 {
    margin: 0;
    font-size: 22px;
    letter-spacing: -0.7px;
  }

  p {
    margin: 6px 0 0;
    color: #777;
    font-size: 14px;
  }

  strong {
    white-space: nowrap;
    color: #111;
  }
}

.mini-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;

  div {
    background: #fbfaf8;
    border-radius: 18px;
    padding: 14px;
  }

  span {
    display: block;
    color: #777;
    font-size: 12px;
    font-weight: 800;
  }

  b {
    display: block;
    margin-top: 5px;
    font-size: 18px;
  }
}

.variants {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;

  span {
    background: #111;
    color: white;
    border-radius: 999px;
    padding: 8px 11px;
    font-size: 12px;
    font-weight: 800;
  }
}

.actions {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;

  select,
  a,
  button {
    border: none;
    border-radius: 14px;
    padding: 13px 14px;
    font-weight: 900;
    font-size: 14px;
  }

  select {
    background: #f3eee6;
    color: #111;
    outline: none;
  }

  a {
    text-decoration: none;
    background: #111;
    color: white;
    text-align: center;
  }

  button {
    cursor: pointer;
  }

  .delete {
    background: #ffe8e8;
    color: #b00020;
  }
}

.message {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 50;
  padding: 16px 18px;
  border-radius: 17px;
  font-weight: 900;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);

  &.error {
    background: #ffe8e8;
    color: #b00020;
  }

  &.success {
    background: #e7f8ec;
    color: #0f7a35;
  }
}

@media (max-width: 1100px) {
  .products-grid,
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }

  .stats,
  .products-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;

    select {
      width: 100%;
    }
  }

  .actions {
    grid-template-columns: 1fr;
  }
}
</style>
