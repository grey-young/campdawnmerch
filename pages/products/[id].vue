<template lang="html">
  <main>
    <Header />

    <div v-if="loading" class="loading">Loading product...</div>

    <div v-else-if="!product" class="loading">Product not found.</div>

    <div v-else class="container">
      <div class="one">
        <div class="image">
          <img :src="activeImage || mainImage" :alt="product.name" />
        </div>

        <div v-if="galleryImages.length > 1" class="thumbs">
          <button
            v-for="(image, index) in galleryImages"
            :key="index"
            type="button"
            class="thumb"
            :class="{ active: (activeImage || mainImage) === image }"
            @click="activeImage = image"
          >
            <img :src="image" :alt="`${product.name} image ${index + 1}`" />
          </button>
        </div>
      </div>

      <div class="details">
        <h1 class="name field">{{ product.name }}</h1>

        <div class="field price-field">
          <label>Price</label>
          <h1 class="price">GH₵ {{ formatMoney(product.price) }}</h1>
        </div>

        <div class="field description-field">
          <label>Description</label>
          <div class="description">
            <p>{{ product.description || "No description available." }}</p>
          </div>
        </div>

        <div class="field color-field">
          <label>Color</label>

          <div class="color">
            <button
              v-for="color in availableColors"
              :key="color"
              type="button"
              class="color-btn"
              :class="{
                active: selectedColor === color,
                light: isLightColor(color),
              }"
              :style="{ background: getColorValue(color) }"
              :title="color"
              @click="selectColor(color)"
            ></button>
          </div>

          <p class="selected-text">
            Selected: <b>{{ selectedColor || "Choose color" }}</b>
          </p>
        </div>

        <div class="field size-field">
          <label>Size</label>

          <div class="sizes">
            <button
              v-for="size in availableSizes"
              :key="size"
              type="button"
              :class="{ active: selectedSize === size }"
              @click="selectSize(size)"
            >
              {{ size }}
            </button>
          </div>

          <p v-if="selectedSize" class="selected-text">
            Selected: <b>{{ selectedSize }}</b>
          </p>
        </div>

        <div class="field stock-field">
          <label>Stock</label>

          <p v-if="selectedVariant">
            {{ selectedVariant.stock }} available for
            <b>{{ selectedColor }} / {{ selectedSize }}</b>
          </p>

          <p v-else>Select color and size</p>
        </div>

        <div class="field quantity-field">
          <label>Quantity</label>

          <div class="content">
            <div class="quantity">
              <i class="bi bi-dash-lg" @click="decreaseQuantity"></i>
              <span>{{ quantity }}</span>
              <i class="bi bi-plus-lg" @click="increaseQuantity"></i>
            </div>

            <button
              class="add-to-cart"
              type="button"
              :disabled="
                addingToCart || !selectedVariant || selectedVariant.stock < 1
              "
              @click="addToCart"
            >
              {{ addingToCart ? "Adding..." : "Add to Cart" }}
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="message success">
          {{ successMessage }}
        </p>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: "ProductDetailsPage",

  data() {
    return {
      loading: true,
      addingToCart: false,
      product: null,
      quantity: 1,
      selectedSize: "",
      selectedColor: "",
      activeImage: "",
      errorMessage: "",
      successMessage: "",
    };
  },

  computed: {
    variants() {
      return (this.product?.merch_product_variants || []).filter(
        (variant) => variant.is_active && Number(variant.stock) > 0,
      );
    },

    availableColors() {
      return [...new Set(this.variants.map((variant) => variant.color))];
    },

    availableSizes() {
      if (!this.selectedColor) return [];

      return [
        ...new Set(
          this.variants
            .filter((variant) => variant.color === this.selectedColor)
            .map((variant) => variant.size),
        ),
      ];
    },

    selectedVariant() {
      return this.variants.find(
        (variant) =>
          variant.color === this.selectedColor &&
          variant.size === this.selectedSize,
      );
    },

    galleryImages() {
      const images = (this.product?.merch_product_images || [])
        .slice()
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      if (!images.length) return ["/shirt.jpg"];

      // Main image first, then the rest in sort order.
      const main = images.find((image) => image.is_main);
      const ordered = main
        ? [main, ...images.filter((image) => image.id !== main.id)]
        : images;

      return ordered.map((image) => image.image_url);
    },

    mainImage() {
      return this.galleryImages[0] || "/shirt.jpg";
    },
  },

  async mounted() {
    await this.getProduct();

    this.$nextTick(() => {
      this.runAnimations();
    });
  },

  methods: {
    async getProduct() {
      this.loading = true;

      const slugOrId = this.$route.params.slug || this.$route.params.id;

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
        .eq("slug", slugOrId)
        .eq("status", "active")
        .single();

      if (error) {
        console.error(error.message);
        this.product = null;
        this.loading = false;
        return;
      }

      this.product = data;
      this.activeImage = this.mainImage;

      if (this.variants.length) {
        this.selectedColor = this.variants[0].color;
        this.selectedSize = this.availableSizes[0] || "";
      }

      this.loading = false;
    },

    selectColor(color) {
      this.selectedColor = color;
      this.selectedSize = this.availableSizes[0] || "";
      this.quantity = 1;

      if (this.$gsap) {
        this.$gsap.fromTo(
          ".sizes button",
          { y: 10, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.05,
            ease: "power3.out",
          },
        );
      }
    },

    selectSize(size) {
      this.selectedSize = size;
      this.quantity = 1;
    },

    async addToCart() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.selectedColor) {
        this.errorMessage = "Please select a color.";
        return;
      }

      if (!this.selectedSize) {
        this.errorMessage = "Please select a size.";
        return;
      }

      if (!this.selectedVariant) {
        this.errorMessage = "This color and size is not available.";
        return;
      }

      if (this.quantity > this.selectedVariant.stock) {
        this.errorMessage = "Quantity is more than available stock.";
        return;
      }

      this.addingToCart = true;

      try {
        const {
          data: { user },
          error: userError,
        } = await this.$supabase.auth.getUser();

        if (userError || !user) {
          this.$router.push("/login");
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
          const { data: newCart, error: cartError } = await this.$supabase
            .from("merch_carts")
            .insert({ user_id: user.id })
            .select("id")
            .single();

          if (cartError) throw cartError;

          cartId = newCart.id;
        }

        const { data: existingItem } = await this.$supabase
          .from("merch_cart_items")
          .select("id, quantity")
          .eq("cart_id", cartId)
          .eq("variant_id", this.selectedVariant.id)
          .maybeSingle();

        if (existingItem) {
          const newQuantity = existingItem.quantity + this.quantity;

          if (newQuantity > this.selectedVariant.stock) {
            this.errorMessage =
              "You already have this item in cart. Stock limit reached.";
            this.addingToCart = false;
            return;
          }

          const { error } = await this.$supabase
            .from("merch_cart_items")
            .update({ quantity: newQuantity })
            .eq("id", existingItem.id);

          if (error) throw error;
        } else {
          const { error } = await this.$supabase
            .from("merch_cart_items")
            .insert({
              cart_id: cartId,
              variant_id: this.selectedVariant.id,
              quantity: this.quantity,
            });

          if (error) throw error;
        }

        this.successMessage = "Added to cart successfully.";

        if (this.$gsap) {
          this.$gsap.fromTo(
            ".success",
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" },
          );
        }
      } catch (error) {
        this.errorMessage = error.message || "Failed to add item to cart.";
      } finally {
        this.addingToCart = false;
      }
    },

    decreaseQuantity() {
      if (this.quantity > 1) this.quantity -= 1;
    },

    increaseQuantity() {
      if (!this.selectedVariant) return;

      if (this.quantity < this.selectedVariant.stock) {
        this.quantity += 1;
      }
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },

    getColorValue(color) {
      const colors = {
        black: "#111111",
        white: "#ffffff",
        red: "#d50000",
        blue: "#1d4ed8",
        green: "#15803d",
        yellow: "#facc15",
        brown: "#7c4a2d",
        cream: "#f2e3c6",
        grey: "#808080",
        gray: "#808080",
        pink: "#f9a8d4",
        purple: "#7e22ce",
        orange: "#f97316",
      };

      return colors[color.toLowerCase()] || color;
    },

    isLightColor(color) {
      return ["white", "cream", "yellow"].includes(color.toLowerCase());
    },

    runAnimations() {
      if (!this.$gsap) return;

      this.$gsap.to(
        [
          ".container .one",
          ".details .name",
          ".details .color-field",
          ".details .price-field",
          ".details .description-field",
          ".details .size-field",
          ".details .stock-field",
          ".details .quantity-field",
        ],
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
main {
  min-height: 100vh;

  .loading {
    min-height: 70vh;
    display: grid;
    place-items: center;
    font-size: 20px;
    font-weight: 800;
  }

  .container {
    min-height: 90vh;
    width: 90%;
    margin: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;

    .one {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      opacity: 0;
      transform: translateY(30px);

      .image {
        height: 80%;
        width: 90%;
        overflow: hidden;
        border-radius: 18px;
        background: #f3eee6;

        img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          display: block;
        }
      }

      .thumbs {
        width: 90%;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .thumb {
          height: 84px;
          width: 84px;
          padding: 0;
          border: 2px solid transparent;
          border-radius: 14px;
          overflow: hidden;
          background: #f3eee6;
          cursor: pointer;
          transition: 0.2s ease;

          img {
            height: 100%;
            width: 100%;
            object-fit: cover;
            display: block;
          }

          &:hover {
            transform: translateY(-2px);
          }

          &.active {
            border-color: #111;
          }
        }
      }
    }

    .details {
      width: 100%;
      margin: auto;

      .name {
        font-size: clamp(34px, 5vw, 58px);
        opacity: 0;
        transform: translateY(30px);
      }

      .price {
        font-size: 36px;
        margin: 12px 0 0;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 26px;
        opacity: 0;
        transform: translateY(30px);

        label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #777;
        }
      }

      .description {
        font-size: 18px;
        line-height: 1.6;
      }

      .color {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .color-btn {
        height: 48px;
        width: 48px;
        border-radius: 50%;
        border: 2px solid transparent;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        cursor: pointer;
        transition: 0.2s ease;
        position: relative;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
        }

        &.active {
          border-color: #111;
          transform: scale(1.08);
        }

        &.light {
          border-color: #ddd;

          &.active {
            border-color: #111;
          }
        }
      }

      .selected-text {
        font-size: 14px;
        color: #777;
        margin: 0;

        b {
          color: #111;
        }
      }

      .sizes {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        button {
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: white;
          color: #111;
          border-radius: 999px;
          padding: 0.9rem 1.25rem;
          font-weight: 800;
          cursor: pointer;
          transition: 0.25s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
          }

          &.active {
            background: #111;
            color: white;
            border-color: #111;
          }
        }
      }

      .stock-field {
        p {
          margin: 0;
          font-size: 15px;
          color: #555;
        }

        b {
          color: #111;
        }
      }
    }

    .quantity-field {
      .content {
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;
      }
    }

    .quantity {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #fbfbfb;
      padding: 0.8rem 1rem;
      border-radius: 999px;
      width: fit-content;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);

      i {
        font-size: 20px;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }

      span {
        font-size: 18px;
        min-width: 30px;
        text-align: center;
        font-weight: 600;
      }
    }

    .add-to-cart {
      background-color: #111;
      border: none;
      padding: 1rem 2rem;
      color: white;
      cursor: pointer;
      font-size: 16px;
      border-radius: 999px;
      box-shadow: 0 16px 35px rgba(0, 0, 0, 0.15);
      transition: 0.25s ease;

      &:hover {
        transform: translateY(-2px);
        background-color: #000;
      }

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        transform: none;
      }
    }

    .message {
      padding: 14px 16px;
      border-radius: 14px;
      font-weight: 800;

      &.error {
        background: #ffe8e8;
        color: #b00020;
      }

      &.success {
        background: #e7f8ec;
        color: #0f7a35;
      }
    }
  }
}

@media (max-width: 900px) {
  main {
    .container {
      grid-template-columns: 1fr;
      padding: 40px 0;

      .one .image {
        height: 420px;
        width: 100%;
      }
    }
  }
}
</style>
