<template>
  <main class="cart-page">
    <section class="cart-wrap">
      <div class="page-head" ref="pageHead">
        <div>
          <p>Your bag</p>
          <h1>Cart</h1>
        </div>

        <nuxt-link to="/products">Continue shopping</nuxt-link>
      </div>

      <div v-if="loading" class="state-box">Loading cart...</div>

      <div v-else-if="cartItems.length === 0" class="state-box empty">
        <h2>Your cart is empty</h2>
        <p>Add some merch before checking out.</p>
        <nuxt-link to="/products">Shop merch</nuxt-link>
      </div>

      <div v-else class="cart-layout">
        <div class="cart-items" ref="itemsList">
          <article v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-image">
              <img
                :src="getItemImage(item)"
                :alt="getProduct(item).name"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="item-info">
              <h2>{{ getProduct(item).name }}</h2>
              <p>
                {{ item.merch_product_variants.color }} /
                {{ item.merch_product_variants.size }}
              </p>

              <span> {{ item.merch_product_variants.stock }} left </span>
            </div>

            <div class="item-price">
              GH₵ {{ formatMoney(getProduct(item).price) }}
            </div>

            <div class="qty">
              <button type="button" @click="decreaseQuantity(item)">−</button>
              <span>{{ item.quantity }}</span>
              <button type="button" @click="increaseQuantity(item)">+</button>
            </div>

            <div class="item-total">
              GH₵ {{ formatMoney(getProduct(item).price * item.quantity) }}
            </div>

            <button class="remove" type="button" @click="removeItem(item)">
              Remove
            </button>
          </article>
        </div>

        <aside class="summary" ref="summary">
          <h2>Summary</h2>

          <div class="summary-line">
            <span>Subtotal</span>
            <b>GH₵ {{ formatMoney(subtotal) }}</b>
          </div>

          <div class="summary-line">
            <span>Delivery</span>
            <b>GH₵ {{ formatMoney(finalDeliveryFee) }}</b>
          </div>

          <div class="summary-line">
            <span>Discount</span>
            <b>- GH₵ {{ formatMoney(discountAmount) }}</b>
          </div>

          <div class="coupon-box">
            <label>Coupon</label>

            <div class="coupon-input">
              <input
                v-model="couponCode"
                type="text"
                placeholder="Enter code"
              />

              <button type="button" @click="applyCoupon">Apply</button>
            </div>

            <p v-if="couponMessage">{{ couponMessage }}</p>

            <button
              v-if="appliedCoupon"
              type="button"
              class="clear-coupon"
              @click="clearCoupon"
            >
              Remove coupon
            </button>
          </div>

          <div class="grand-total">
            <span>Total</span>
            <b>GH₵ {{ formatMoney(grandTotal) }}</b>
          </div>

          <button type="button" class="checkout" @click="goToCheckout">
            Checkout
          </button>
        </aside>
      </div>

      <p v-if="errorMessage" class="toast error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="toast success">{{ successMessage }}</p>
    </section>
  </main>
</template>

<script>
export default {
  name: "CartPage",

  data() {
    return {
      loading: true,
      isGuest: false,
      cartId: null,
      cartItems: [],
      deliveryFee: 0,
      freeDeliveryThreshold: 0,
      couponCode: "",
      couponMessage: "",
      appliedCoupon: null,
      errorMessage: "",
      successMessage: "",
    };
  },

  computed: {
    subtotal() {
      return this.cartItems.reduce((sum, item) => {
        return sum + Number(this.getProduct(item).price || 0) * item.quantity;
      }, 0);
    },

    discountAmount() {
      if (!this.appliedCoupon) return 0;

      if (this.appliedCoupon.discount_type === "percentage") {
        return (
          (this.subtotal * Number(this.appliedCoupon.discount_value)) / 100
        );
      }

      return Math.min(Number(this.appliedCoupon.discount_value), this.subtotal);
    },

    finalDeliveryFee() {
      if (
        this.freeDeliveryThreshold > 0 &&
        this.subtotal >= this.freeDeliveryThreshold
      ) {
        return 0;
      }

      return this.deliveryFee;
    },

    grandTotal() {
      return Math.max(
        this.subtotal + this.finalDeliveryFee - this.discountAmount,
        0,
      );
    },
  },

  async mounted() {
    await this.getStoreSettings();
    await this.getCart();

    this.$nextTick(() => {
      this.animatePage();
    });
  },

  methods: {
    animatePage() {
      if (!this.$gsap) return;

      this.$gsap.from(this.$refs.pageHead, {
        y: 24,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
      });

      this.$gsap.from(".cart-item", {
        y: 24,
        opacity: 0,
        duration: 0.55,
        stagger: 0.07,
        delay: 0.1,
        ease: "power3.out",
      });

      if (this.$refs.summary) {
        this.$gsap.from(this.$refs.summary, {
          y: 28,
          opacity: 0,
          duration: 0.65,
          delay: 0.18,
          ease: "power3.out",
        });
      }
    },

    async getStoreSettings() {
      const { data } = await this.$supabase
        .from("merch_store_settings")
        .select("delivery_fee, free_delivery_threshold")
        .limit(1)
        .maybeSingle();

      if (data) {
        this.deliveryFee = Number(data.delivery_fee || 0);
        this.freeDeliveryThreshold = Number(data.free_delivery_threshold || 0);
      }
    },

    async getCart() {
      this.loading = true;
      this.errorMessage = "";

      const {
        data: { user },
      } = await this.$supabase.auth.getUser();

      if (!user) {
        // Guests see a cart stored locally, no login required.
        this.isGuest = true;
        await this.loadGuestCart();
        this.loading = false;
        return;
      }

      this.isGuest = false;

      // Bring any items added before signing in into the account.
      await useGuestCart().mergeIntoAccount(this.$supabase, user.id);

      const { data: cart, error: cartError } = await this.$supabase
        .from("merch_carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cartError) {
        this.errorMessage = cartError.message;
        this.loading = false;
        return;
      }

      if (!cart) {
        this.cartItems = [];
        this.loading = false;
        return;
      }

      this.cartId = cart.id;

      const { data: items, error: itemError } = await this.$supabase
        .from("merch_cart_items")
        .select(
          `
          id,
          quantity,
          created_at,
          merch_product_variants (
            id,
            color,
            size,
            stock,
            sku,
            is_active,
            merch_products (
              id,
              name,
              slug,
              price,
              status,
              merch_product_images (
                id,
                image_url,
                is_main,
                sort_order
              )
            )
          )
        `,
        )
        .eq("cart_id", this.cartId)
        .order("created_at", { ascending: false });

      if (itemError) {
        this.errorMessage = itemError.message;
        this.loading = false;
        return;
      }

      this.cartItems = (items || []).filter((item) => {
        const variant = item.merch_product_variants;
        const product = variant?.merch_products;

        return (
          variant && product && variant.is_active && product.status === "active"
        );
      });

      this.loading = false;
    },

    async loadGuestCart() {
      const guestCart = useGuestCart();
      const rawCart = guestCart.read();

      if (!rawCart.length) {
        this.cartItems = [];
        return;
      }

      const variantIds = rawCart.map((item) => item.variant_id);

      const { data, error } = await this.$supabase
        .from("merch_product_variants")
        .select(
          `
          id,
          color,
          size,
          stock,
          sku,
          is_active,
          merch_products (
            id,
            name,
            slug,
            price,
            status,
            merch_product_images (
              id,
              image_url,
              is_main,
              sort_order
            )
          )
        `,
        )
        .in("id", variantIds);

      if (error) {
        this.errorMessage = error.message;
        this.cartItems = [];
        return;
      }

      this.cartItems = (data || [])
        .filter(
          (variant) =>
            variant.is_active &&
            variant.merch_products &&
            variant.merch_products.status === "active",
        )
        .map((variant) => {
          const saved = rawCart.find((item) => item.variant_id === variant.id);

          // Shaped to match the signed-in cart item structure the template uses.
          return {
            id: variant.id,
            quantity: Number(saved?.quantity || 1),
            merch_product_variants: variant,
          };
        });

      // Drop any saved items whose variant no longer exists or is inactive.
      const validIds = new Set(this.cartItems.map((item) => item.id));

      if (validIds.size !== rawCart.length) {
        guestCart.write(
          rawCart.filter((item) => validIds.has(item.variant_id)),
        );
      }
    },

    getProduct(item) {
      return item.merch_product_variants?.merch_products || {};
    },

    getItemImage(item) {
      const images = this.getProduct(item).merch_product_images || [];

      if (!images.length) return "/shirt.jpg";

      const main = images.find((image) => image.is_main);

      return main
        ? main.image_url
        : images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    },

    async updateQuantity(item, quantity) {
      this.errorMessage = "";
      this.successMessage = "";

      if (quantity < 1) return;

      if (quantity > item.merch_product_variants.stock) {
        this.errorMessage = "No more stock available.";
        return;
      }

      if (this.isGuest) {
        useGuestCart().setQuantity(item.id, quantity);
        item.quantity = quantity;
        return;
      }

      const { error } = await this.$supabase
        .from("merch_cart_items")
        .update({ quantity })
        .eq("id", item.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      item.quantity = quantity;
      this.notifyCartUpdated();
    },

    decreaseQuantity(item) {
      if (item.quantity > 1) {
        this.updateQuantity(item, item.quantity - 1);
      }
    },

    increaseQuantity(item) {
      this.updateQuantity(item, item.quantity + 1);
    },

    async removeItem(item) {
      if (this.isGuest) {
        useGuestCart().remove(item.id);
        this.cartItems = this.cartItems.filter(
          (cartItem) => cartItem.id !== item.id,
        );
        this.successMessage = "Item removed.";

        setTimeout(() => {
          this.successMessage = "";
        }, 1500);
        return;
      }

      const { error } = await this.$supabase
        .from("merch_cart_items")
        .delete()
        .eq("id", item.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.cartItems = this.cartItems.filter(
        (cartItem) => cartItem.id !== item.id,
      );
      this.successMessage = "Item removed.";
      this.notifyCartUpdated();

      setTimeout(() => {
        this.successMessage = "";
      }, 1500);
    },

    notifyCartUpdated() {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"));
      }
    },

    async applyCoupon() {
      this.couponMessage = "";
      this.appliedCoupon = null;

      if (!this.couponCode) {
        this.couponMessage = "Enter a coupon code.";
        return;
      }

      const { data, error } = await this.$supabase
        .from("merch_discount_codes")
        .select("*")
        .eq("code", this.couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        this.couponMessage = "Invalid coupon.";
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        this.couponMessage = "Coupon has expired.";
        return;
      }

      if (data.starts_at && new Date(data.starts_at) > new Date()) {
        this.couponMessage = "Coupon is not active yet.";
        return;
      }

      if (data.usage_limit && data.used_count >= data.usage_limit) {
        this.couponMessage = "Coupon limit reached.";
        return;
      }

      this.appliedCoupon = data;
      this.couponCode = data.code;
      this.couponMessage = "Coupon applied.";
    },

    clearCoupon() {
      this.appliedCoupon = null;
      this.couponCode = "";
      this.couponMessage = "";
    },

    goToCheckout() {
      if (this.appliedCoupon?.code) {
        this.$router.push({
          path: "/checkout",
          query: {
            coupon: this.appliedCoupon.code,
          },
        });
      } else {
        this.$router.push("/checkout");
      }
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },
  },
};
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: #f7f3ed;
  color: #111;
}

.cart-wrap {
  width: min(1180px, 92%);
  margin: 0 auto;
  padding: 70px 0;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 34px;

  p {
    margin: 0 0 8px;
    font-size: 12px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    font-weight: 900;
    color: #8b6b3f;
  }

  h1 {
    margin: 0;
    font-size: clamp(44px, 8vw, 90px);
    line-height: 0.9;
    letter-spacing: -0.06em;
  }

  a {
    text-decoration: none;
    color: #111;
    background: white;
    padding: 14px 18px;
    border-radius: 999px;
    font-weight: 800;
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.06);
  }
}

.state-box {
  min-height: 360px;
  border-radius: 34px;
  background: white;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 40px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0;
    font-size: 34px;
    letter-spacing: -0.04em;
  }

  p {
    margin: 10px 0 24px;
    color: #777;
  }

  a {
    text-decoration: none;
    background: #111;
    color: white;
    padding: 14px 18px;
    border-radius: 999px;
    font-weight: 900;
  }
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

.cart-items {
  display: grid;
  gap: 14px;
}

.cart-item {
  display: grid;
  grid-template-columns: 118px 1fr 110px 118px 120px auto;
  gap: 16px;
  align-items: center;
  background: white;
  border-radius: 28px;
  padding: 16px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.05);
}

.item-image {
  width: 118px;
  height: 118px;
  border-radius: 22px;
  background: #eee3d2;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.item-info {
  h2 {
    margin: 0;
    font-size: 21px;
    letter-spacing: -0.04em;
  }

  p {
    margin: 7px 0 10px;
    color: #666;
  }

  span {
    display: inline-flex;
    background: #f4efe7;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
  }
}

.item-price,
.item-total {
  font-weight: 900;
}

.qty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  button {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 50%;
    background: #f4efe7;
    font-size: 18px;
    font-weight: 900;
    cursor: pointer;
  }

  span {
    min-width: 24px;
    text-align: center;
    font-weight: 900;
  }
}

.remove {
  border: none;
  background: #fff0f0;
  color: #b00020;
  padding: 12px 14px;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
}

.summary {
  position: sticky;
  top: 24px;
  background: #111;
  color: white;
  border-radius: 34px;
  padding: 26px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);

  h2 {
    margin: 0 0 20px;
    font-size: 28px;
    letter-spacing: -0.04em;
  }
}

.summary-line,
.grand-total {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);

  span {
    color: #aaa;
  }

  b {
    color: white;
  }
}

.coupon-box {
  padding: 18px 0;

  label {
    display: block;
    margin-bottom: 10px;
    color: #aaa;
    font-size: 13px;
    font-weight: 900;
  }

  p {
    margin: 10px 0 0;
    color: #f4d28b;
    font-size: 13px;
    font-weight: 800;
  }
}

.coupon-input {
  display: flex;
  gap: 8px;

  input {
    min-width: 0;
    flex: 1;
    border: none;
    outline: none;
    padding: 13px 14px;
    border-radius: 14px;
  }

  button {
    border: none;
    background: #f4d28b;
    color: #111;
    padding: 13px 14px;
    border-radius: 14px;
    font-weight: 900;
    cursor: pointer;
  }
}

.clear-coupon {
  margin-top: 10px;
  border: none;
  background: transparent;
  color: white;
  text-decoration: underline;
  cursor: pointer;
}

.grand-total {
  border-bottom: none;
  padding-top: 18px;

  span,
  b {
    font-size: 22px;
    color: #f4d28b;
  }
}

.checkout {
  width: 100%;
  margin-top: 18px;
  border: none;
  background: white;
  color: #111;
  padding: 16px 18px;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 20;
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 900;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.14);

  &.error {
    background: #ffe8e8;
    color: #b00020;
  }

  &.success {
    background: #e7f8ec;
    color: #0f7a35;
  }
}

@media (max-width: 1150px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .summary {
    position: static;
  }

  .cart-item {
    grid-template-columns: 118px 1fr 120px;
  }

  .remove {
    grid-column: 1 / -1;
    width: fit-content;
  }
}

@media (max-width: 680px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-item {
    grid-template-columns: 1fr;
  }

  .item-image {
    width: 100%;
    height: 260px;
  }

  .item-price,
  .item-total {
    display: flex;
    justify-content: space-between;
  }
}
</style>
