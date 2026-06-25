<template lang="html">
  <div id="collections">
    <!-- ambient field: glow + scanlines, no borders anywhere -->
    <div class="ambient" aria-hidden="true">
      <span class="glow glow-a" />
      <span class="glow glow-b" />
      <span class="scan" />
    </div>

    <Header theme="dark" />

    <main class="shell">
      <!-- ── Masthead ──────────────────────────────────────────── -->
      <header class="masthead">
        <div class="lede">
          <span class="eyebrow"><span class="dot" />CampDawn Drop Index</span>
          <h1>The Collection</h1>
          <p>{{ filteredProducts.length }} piece(s) in rotation</p>
        </div>

        <div class="search">
          <i class="bi bi-search"></i>
          <input
            v-model="search"
            type="text"
            placeholder="Search the drop..."
            aria-label="Search products"
          />
        </div>
      </header>

      <!-- glass category pills -->
      <nav v-if="categories.length" class="chips" aria-label="Categories">
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
      </nav>

      <!-- ── Loading / empty states ────────────────────────────── -->
      <div v-if="loading" class="state">
        <span class="spinner" />
        <p>Loading the drop…</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="state">
        <h3>Nothing in this lane</h3>
        <p>Try another search or category.</p>
      </div>

      <!-- ── Filtered view: single results grid ────────────────── -->
      <CapsuleRow
        v-else-if="isFiltering"
        layout="grid"
        eyebrow="Results"
        :title="searchTitle"
        :description="`${filteredProducts.length} match(es) for your filter.`"
      >
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          v-bind="cardProps(product)"
          @add="(payload) => quickAdd(product, payload.size)"
        />
      </CapsuleRow>

      <!-- ── Curated view: editorial capsules ──────────────────── -->
      <div v-else class="capsules">
        <CapsuleRow
          v-if="newestDrops.length"
          layout="carousel"
          eyebrow="Just Landed"
          title="Newest Drops"
          description="Fresh off the press. The latest pieces to hit the CampDawn rotation."
          :banner="bannerFor(0)"
        >
          <ProductCard
            v-for="product in newestDrops"
            :key="product.id"
            v-bind="cardProps(product)"
            @add="(payload) => quickAdd(product, payload.size)"
          />
        </CapsuleRow>

        <CapsuleRow
          v-if="coreCollection.length"
          layout="grid"
          eyebrow="Always On"
          title="Core Collection"
          description="The staples. Built to wear daily, designed to last the season."
          :banner="bannerFor(1)"
        >
          <ProductCard
            v-for="product in coreCollection"
            :key="product.id"
            v-bind="cardProps(product)"
            @add="(payload) => quickAdd(product, payload.size)"
          />
        </CapsuleRow>

        <CapsuleRow
          v-if="limitedCollabs.length"
          layout="carousel"
          eyebrow="Limited"
          title="Limited Collabs"
          description="Capsule runs and featured pieces. When they're gone, they're gone."
          :banner="bannerFor(2)"
        >
          <ProductCard
            v-for="product in limitedCollabs"
            :key="product.id"
            v-bind="cardProps(product)"
            @add="(payload) => quickAdd(product, payload.size)"
          />
        </CapsuleRow>
      </div>
    </main>

    <Footer />

    <!-- quick-add toast -->
    <transition name="toast">
      <div v-if="toast" class="toast" :class="{ 'is-error': toastError }">
        <i :class="toastError ? 'bi bi-exclamation-circle' : 'bi bi-bag-check'"></i>
        <span>{{ toast }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
// Banner fallbacks (public/) used when no admin flyers are configured.
const FALLBACK_BANNERS = ["/6.jpg", "/2.jpg", "/9.jpg"];
const NEW_WINDOW_DAYS = 14;
const LOW_STOCK_THRESHOLD = 5;

export default {
  name: "CollectionsPage",

  data() {
    return {
      loading: true,
      search: "",
      selectedCategory: "all",
      products: [],
      banners: [],
      toast: "",
      toastError: false,
      toastTimer: null,
    };
  },

  computed: {
    categories() {
      const unique = new Map();
      for (const product of this.products) {
        const category = product.merch_categories;
        if (category && category.id) unique.set(category.id, category.name);
      }
      return Array.from(unique, ([id, name]) => ({ id, name }));
    },

    isFiltering() {
      return this.search.trim() !== "" || this.selectedCategory !== "all";
    },

    searchTitle() {
      if (this.selectedCategory !== "all") {
        const match = this.categories.find(
          (category) => category.id === this.selectedCategory,
        );
        if (match) return match.name;
      }
      return this.search.trim() ? `“${this.search.trim()}”` : "Filtered";
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

    // Products fetched newest-first already; take the freshest slice.
    newestDrops() {
      return this.products.slice(0, 10);
    },

    coreCollection() {
      return this.products.filter((product) => !product.is_featured);
    },

    limitedCollabs() {
      return this.products.filter((product) => product.is_featured);
    },
  },

  async mounted() {
    await Promise.all([this.getProducts(), this.getBanners()]);
    this.$nextTick(() => this.runAnimations());
  },

  beforeUnmount() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
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
          created_at,
          merch_categories ( id, name, slug ),
          merch_product_images ( id, image_url, is_main, sort_order ),
          merch_product_variants ( id, color, size, stock, is_active )
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

    // Reuse the admin-managed flyers as editorial banner art.
    async getBanners() {
      const { data, error } = await this.$supabase
        .from("merch_flyers")
        .select("image_url, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(6);

      if (error) {
        console.error(error.message);
        return;
      }

      this.banners = (data || []).map((flyer) => flyer.image_url);
    },

    bannerFor(index) {
      return this.banners[index] || FALLBACK_BANNERS[index] || FALLBACK_BANNERS[0];
    },

    // ── Card prop assembly ───────────────────────────────────
    cardProps(product) {
      const stock = this.totalStock(product);
      return {
        name: product.name,
        price: `GH₵ ${this.formatMoney(product.price)}`,
        comparePrice: product.compare_at_price,
        image: this.getMainImage(product),
        to: `/products/${product.slug}`,
        badge: this.badgeFor(product, stock),
        sizes: this.sizesFor(product),
        soldOut: stock === 0,
      };
    },

    badgeFor(product, stock) {
      if (stock === 0) return { label: "Sold Out", variant: "sold-out" };

      const created = product.created_at ? new Date(product.created_at) : null;
      const isNew =
        created &&
        Date.now() - created.getTime() < NEW_WINDOW_DAYS * 86400000;
      if (isNew) return { label: "New Drop", variant: "new" };

      if (stock <= LOW_STOCK_THRESHOLD)
        return { label: "Limited", variant: "limited" };

      return null;
    },

    sizesFor(product) {
      const sizes = (product.merch_product_variants || [])
        .filter((variant) => variant.is_active && Number(variant.stock) > 0)
        .map((variant) => variant.size)
        .filter(Boolean);
      return [...new Set(sizes)];
    },

    totalStock(product) {
      return (product.merch_product_variants || [])
        .filter((variant) => variant.is_active)
        .reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
    },

    getMainImage(product) {
      const images = product.merch_product_images || [];
      if (!images.length) return "/shirt.jpg";
      const main = images.find((image) => image.is_main);
      return main
        ? main.image_url
        : images.slice().sort((a, b) => a.sort_order - b.sort_order)[0]
            .image_url;
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },

    // ── Quick add from a card ────────────────────────────────
    // Picks the best in-stock variant for the chosen size (most stock).
    // When no size is given, falls back to the single best variant overall.
    resolveVariant(product, size) {
      const inStock = (product.merch_product_variants || []).filter(
        (variant) => variant.is_active && Number(variant.stock) > 0,
      );
      const pool = size
        ? inStock.filter((variant) => variant.size === size)
        : inStock;
      if (!pool.length) return null;
      return pool.sort((a, b) => Number(b.stock) - Number(a.stock))[0];
    },

    async quickAdd(product, size) {
      const variant = this.resolveVariant(product, size);
      if (!variant) {
        this.showToast("That option just sold out.", true);
        return;
      }

      try {
        const {
          data: { user },
        } = await this.$supabase.auth.getUser();

        if (!user) {
          useGuestCart().add(variant.id, 1, variant.stock);
          this.showToast(`Added ${product.name} to bag.`);
          return;
        }

        let cartId;
        const { data: existingCart } = await this.$supabase
          .from("merch_carts")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingCart) {
          cartId = existingCart.id;
        } else {
          const { data: newCart, error } = await this.$supabase
            .from("merch_carts")
            .insert({ user_id: user.id })
            .select("id")
            .single();
          if (error) throw error;
          cartId = newCart.id;
        }

        const { data: existingItem } = await this.$supabase
          .from("merch_cart_items")
          .select("id, quantity")
          .eq("cart_id", cartId)
          .eq("variant_id", variant.id)
          .maybeSingle();

        if (existingItem) {
          const next = Number(existingItem.quantity || 0) + 1;
          if (next > variant.stock) {
            this.showToast("Stock limit reached for that item.", true);
            return;
          }
          const { error } = await this.$supabase
            .from("merch_cart_items")
            .update({ quantity: next })
            .eq("id", existingItem.id);
          if (error) throw error;
        } else {
          const { error } = await this.$supabase
            .from("merch_cart_items")
            .insert({ cart_id: cartId, variant_id: variant.id, quantity: 1 });
          if (error) throw error;
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cart:updated"));
        }
        this.showToast(`Added ${product.name} to bag.`);
      } catch (error) {
        this.showToast(error.message || "Couldn't add to bag.", true);
      }
    },

    showToast(message, isError = false) {
      this.toast = message;
      this.toastError = isError;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => (this.toast = ""), 2600);
    },

    runAnimations() {
      if (!this.$gsap) return;

      this.$gsap.from(".masthead > *", {
        opacity: 0,
        y: 26,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
      });

      this.$gsap.utils.toArray(".capsule").forEach((capsule) => {
        this.$gsap.from(capsule, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: capsule,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
// ── Tokens (mirrored from home hero + footer) ─────────────────
$lime: #ffbf38;
$ink: #131515;
$plat: #f0f0ec;

#collections {
  position: relative;
  background: $ink;
  min-height: 100vh;
  overflow: hidden;
  color: $plat;
}

// ── Ambient field ───────────────────────────────────────────
.ambient {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  .glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.5;
  }

  .glow-a {
    top: -10%;
    left: -8%;
    width: 480px;
    height: 480px;
    background: rgba($lime, 0.12);
  }

  .glow-b {
    bottom: -12%;
    right: -10%;
    width: 560px;
    height: 560px;
    background: rgba(8, 39, 81, 0.6);
  }

  .scan {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(255, 255, 255, 0.012) 3px,
      rgba(255, 255, 255, 0.012) 4px
    );
  }
}

.shell {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 60px 0 90px;
}

// ── Masthead ────────────────────────────────────────────────
.masthead {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 28px;
  margin-bottom: 30px;

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: $lime;
    margin-bottom: 16px;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: $lime;
      box-shadow: 0 0 10px 1px rgba($lime, 0.8);
    }
  }

  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    font-weight: 800;
    line-height: 0.98;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    color: $plat;
  }

  p {
    margin: 12px 0 0;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    color: rgba($plat, 0.5);
  }

  // glass search field, no border
  .search {
    position: relative;
    flex-shrink: 0;

    i {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba($plat, 0.4);
      font-size: 1rem;
    }

    input {
      width: 340px;
      max-width: 100%;
      padding: 0.95rem 1.4rem 0.95rem 3rem;
      border: none;
      outline: none;
      border-radius: 999px;
      font-size: 15px;
      font-family: inherit;
      color: $plat;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset;
      transition: background 0.3s ease;

      &::placeholder {
        color: rgba($plat, 0.4);
      }

      &:focus {
        background: rgba(255, 255, 255, 0.08);
      }
    }
  }
}

// ── Category pills ──────────────────────────────────────────
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 44px;

  .chip {
    border: none;
    cursor: pointer;
    border-radius: 999px;
    padding: 0.62rem 1.2rem;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: rgba($plat, 0.7);
    background: rgba(255, 255, 255, 0.045);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition:
      background 0.3s ease,
      color 0.3s ease,
      transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      color: $plat;
      background: rgba(255, 255, 255, 0.08);
    }

    // active = the lime spark
    &.active {
      background: $lime;
      color: $ink;
      box-shadow: 0 10px 26px -12px rgba($lime, 0.7);
    }
  }
}

.capsules {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

// ── States ──────────────────────────────────────────────────
.state {
  min-height: 320px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  text-align: center;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  h3 {
    margin: 0;
    font-size: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: $plat;
  }

  p {
    margin: 0;
    color: rgba($plat, 0.5);
  }

  .spinner {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.12);
    border-top-color: $lime;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// ── Toast ───────────────────────────────────────────────────
.toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  z-index: 50;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  color: $ink;
  background: $lime;
  box-shadow: 0 20px 50px -18px rgba($lime, 0.7);

  i {
    font-size: 1.05rem;
  }

  &.is-error {
    color: $plat;
    background: rgba(40, 18, 18, 0.92);
    backdrop-filter: blur(10px);
    box-shadow: 0 20px 50px -18px rgba(0, 0, 0, 0.9);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}

// ── Responsive ──────────────────────────────────────────────
@media (max-width: 760px) {
  .shell {
    width: 92%;
    padding: 40px 0 70px;
  }

  .masthead {
    flex-direction: column;
    align-items: flex-start;
    gap: 22px;

    .search input {
      width: 100%;
    }
  }

  .chips {
    margin-bottom: 30px;
  }

  .capsules {
    gap: 28px;
  }
}
</style>
