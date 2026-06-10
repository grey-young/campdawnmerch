<template>
  <main class="checkout-page">
    <section class="checkout-wrap">
      <div class="page-head" ref="pageHead">
        <div>
          <p>Checkout</p>
          <h1>Complete order</h1>
          <span v-if="user">Signed in checkout</span>
          <span v-else>Guest checkout</span>
        </div>

        <nuxt-link to="/cart">Back to cart</nuxt-link>
      </div>

      <div v-if="loading" class="state-box">Loading checkout...</div>

      <div v-else-if="cartItems.length === 0" class="state-box">
        <h2>Your cart is empty</h2>
        <p>Add merch before checking out.</p>
        <nuxt-link to="/products">Shop merch</nuxt-link>
      </div>

      <form v-else class="checkout-layout" @submit.prevent="placeOrder">
        <div class="left">
          <div class="card" ref="card">
            <h2>Customer details</h2>

            <div class="grid">
              <div class="form-group">
                <label>Full name</label>
                <input v-model="shipping.full_name" type="text" />
              </div>

              <div class="form-group">
                <label>Phone number</label>
                <input v-model="shipping.phone" type="text" />
              </div>

              <div class="form-group full">
                <label>Email</label>
                <input v-model="guestEmail" type="email" :disabled="!!user" />
              </div>
            </div>
          </div>

          <div class="card" ref="card">
            <h2>Delivery address</h2>

            <div class="grid">
              <div class="form-group">
                <label>Region</label>
                <select v-model="shipping.region">
                  <option value="">Select region</option>
                  <option v-for="region in ghanaRegions" :key="region">
                    {{ region }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>City</label>
                <input
                  v-model="shipping.city"
                  type="text"
                  placeholder="Accra"
                />
              </div>

              <div class="form-group full">
                <label>Address</label>
                <input
                  v-model="shipping.address_line"
                  type="text"
                  placeholder="Street name, house number, landmark"
                />
              </div>

              <div class="form-group full">
                <label>Extra info</label>
                <textarea
                  v-model="shipping.extra_info"
                  placeholder="Any direction or note for delivery..."
                ></textarea>
              </div>
            </div>
          </div>

          <div class="card" ref="card">
            <h2>Payment method</h2>

            <div class="payment-options">
              <button
                type="button"
                class="active"
                @click="paymentMethod = 'paystack'"
              >
                <span>Paystack</span>
                <b>Pay online</b>
              </button>
            </div>
          </div>

          <div class="card" ref="card">
            <h2>Order note</h2>

            <textarea
              v-model="customerNote"
              placeholder="Optional note for your order..."
            ></textarea>
          </div>
        </div>

        <aside class="summary" ref="summary">
          <h2>Order summary</h2>

          <div class="items">
            <div
              v-for="item in cartItems"
              :key="item.variant_id"
              class="summary-item"
            >
              <img
                :src="item.image_url || '/shirt.jpg'"
                :alt="item.product_name"
              />

              <div>
                <h3>{{ item.product_name }}</h3>
                <p>{{ item.color }} / {{ item.size }} × {{ item.quantity }}</p>
              </div>

              <b>GH₵ {{ formatMoney(item.price * item.quantity) }}</b>
            </div>
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

          <div class="line">
            <span>Subtotal</span>
            <b>GH₵ {{ formatMoney(subtotal) }}</b>
          </div>

          <div class="line">
            <span>Delivery</span>
            <b>GH₵ {{ formatMoney(finalDeliveryFee) }}</b>
          </div>

          <div class="line">
            <span>Discount</span>
            <b>- GH₵ {{ formatMoney(discountAmount) }}</b>
          </div>

          <div class="grand">
            <span>Total</span>
            <b>GH₵ {{ formatMoney(grandTotal) }}</b>
          </div>

          <button class="place-order" type="submit" :disabled="placingOrder">
            {{ placingOrder ? "Placing order..." : "Place order" }}
          </button>

          <p class="hint">
            Stock will be deducted after successful payment confirmation.
          </p>
        </aside>
      </form>

      <p v-if="errorMessage" class="toast error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="toast success">{{ successMessage }}</p>
    </section>
  </main>
</template>

<script>
import PaystackPop from "@paystack/inline-js";

export default {
  name: "CheckoutPage",

  data() {
    return {
      loading: true,
      placingOrder: false,
      user: null,
      profile: null,
      cartId: null,
      cartItems: [],
      couponCode: "",
      couponMessage: "",
      appliedCoupon: null,
      customerNote: "",
      paymentMethod: "paystack",
      guestEmail: "",
      errorMessage: "",
      successMessage: "",
      paystackPublicKey: "",

      settings: {
        delivery_fee: 0,
        free_delivery_threshold: 0,
        pay_on_delivery_enabled: false,
        paystack_enabled: true,
      },

      shipping: {
        full_name: "",
        phone: "",
        region: "",
        city: "",
        address_line: "",
        extra_info: "",
      },

      ghanaRegions: [
        "Ahafo",
        "Ashanti",
        "Bono",
        "Bono East",
        "Central",
        "Eastern",
        "Greater Accra",
        "North East",
        "Northern",
        "Oti",
        "Savannah",
        "Upper East",
        "Upper West",
        "Volta",
        "Western",
        "Western North",
      ],
    };
  },

  computed: {
    subtotal() {
      return this.cartItems.reduce((sum, item) => {
        return sum + Number(item.price || 0) * Number(item.quantity || 0);
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
        Number(this.settings.free_delivery_threshold) > 0 &&
        this.subtotal >= Number(this.settings.free_delivery_threshold)
      ) {
        return 0;
      }

      return Number(this.settings.delivery_fee || 0);
    },

    grandTotal() {
      return Math.max(
        this.subtotal + this.finalDeliveryFee - this.discountAmount,
        0,
      );
    },
  },

  async mounted() {
    this.couponCode = this.$route.query.coupon || "";
    this.paystackPublicKey = useRuntimeConfig().public.paystackPublicKey || "";

    await this.getCurrentUser();

    // Checkout requires an account. Send guests to login and bring them back
    // here afterwards; their localStorage cart merges in once signed in.
    if (!this.user) {
      this.$router.replace(
        `/login?redirect=${encodeURIComponent(this.$route.fullPath)}`,
      );
      return;
    }

    await this.getStoreSettings();

    await useGuestCart().mergeIntoAccount(this.$supabase, this.user.id);
    await this.getProfile();
    await this.getSupabaseCart();

    if (this.couponCode) {
      await this.applyCoupon();
    }

    this.loading = false;

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

      this.$gsap.from(this.$refs.card, {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        delay: 0.12,
        ease: "power3.out",
      });

      if (this.$refs.summary) {
        this.$gsap.from(this.$refs.summary, {
          y: 28,
          opacity: 0,
          duration: 0.65,
          delay: 0.2,
          ease: "power3.out",
        });
      }
    },

    async getCurrentUser() {
      const {
        data: { user },
      } = await this.$supabase.auth.getUser();

      this.user = user || null;
      this.guestEmail = user?.email || "";
    },

    async getProfile() {
      const { data } = await this.$supabase
        .from("profiles")
        .select("*")
        .eq("id", this.user.id)
        .maybeSingle();

      this.profile = data || null;

      if (data) {
        this.guestEmail = data.email || this.user.email || "";
        this.shipping.full_name =
          data.full_name || data.name || data.username || "";
        this.shipping.phone = data.phone || "";
        this.shipping.region = data.region || "";
        this.shipping.city = data.city || "";
        this.shipping.address_line = data.address || data.address_line || "";
      }
    },

    async getStoreSettings() {
      const { data } = await this.$supabase
        .from("merch_store_settings")
        .select(
          `
          delivery_fee,
          free_delivery_threshold,
          pay_on_delivery_enabled,
          paystack_enabled
        `,
        )
        .limit(1)
        .maybeSingle();

      if (data) {
        this.settings = {
          delivery_fee: Number(data.delivery_fee || 0),
          free_delivery_threshold: Number(data.free_delivery_threshold || 0),
          pay_on_delivery_enabled: data.pay_on_delivery_enabled,
          paystack_enabled: data.paystack_enabled,
        };
      }
    },

    async getSupabaseCart() {
      const { data: cart } = await this.$supabase
        .from("merch_carts")
        .select("id")
        .eq("user_id", this.user.id)
        .maybeSingle();

      if (!cart) {
        this.cartItems = [];
        return;
      }

      this.cartId = cart.id;

      const { data, error } = await this.$supabase
        .from("merch_cart_items")
        .select(
          `
          id,
          quantity,
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
        .eq("cart_id", this.cartId);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.cartItems = (data || [])
        .filter((item) => {
          const variant = item.merch_product_variants;
          const product = variant?.merch_products;

          return (
            variant &&
            product &&
            variant.is_active &&
            product.status === "active"
          );
        })
        .map((item) => {
          const variant = item.merch_product_variants;
          const product = variant.merch_products;

          return {
            source: "supabase",
            cart_item_id: item.id,
            variant_id: variant.id,
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            price: Number(product.price || 0),
            quantity: item.quantity,
            color: variant.color,
            size: variant.size,
            stock: variant.stock,
            sku: variant.sku,
            image_url: this.getMainImage(product.merch_product_images),
          };
        });
    },

    async getGuestCart() {
      const rawCart = JSON.parse(
        localStorage.getItem("campdawn_guest_cart") || "[]",
      );

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
        return;
      }

      this.cartItems = (data || [])
        .filter((variant) => {
          return (
            variant.is_active &&
            variant.merch_products &&
            variant.merch_products.status === "active"
          );
        })
        .map((variant) => {
          const savedItem = rawCart.find(
            (item) => item.variant_id === variant.id,
          );
          const product = variant.merch_products;

          return {
            source: "guest",
            variant_id: variant.id,
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            price: Number(product.price || 0),
            quantity: Number(savedItem?.quantity || 1),
            color: variant.color,
            size: variant.size,
            stock: variant.stock,
            sku: variant.sku,
            image_url: this.getMainImage(product.merch_product_images),
          };
        });
    },

    getMainImage(images = []) {
      if (!images.length) return "/shirt.jpg";

      const main = images.find((image) => image.is_main);

      return main
        ? main.image_url
        : [...images].sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    },

    validateCheckout() {
      if (!this.user && !this.guestEmail) return "Email is required.";
      if (!this.shipping.full_name) return "Full name is required.";
      if (!this.shipping.phone) return "Phone number is required.";
      if (!this.shipping.region) return "Region is required.";
      if (!this.shipping.city) return "City is required.";
      if (!this.shipping.address_line) return "Address is required.";
      if (!this.paymentMethod) return "Select a payment method.";

      for (const item of this.cartItems) {
        if (item.quantity > item.stock) {
          return `${item.product_name} has only ${item.stock} left.`;
        }
      }

      return null;
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

    async placeOrder() {
      this.errorMessage = "";
      this.successMessage = "";

      const validationError = this.validateCheckout();

      if (validationError) {
        this.errorMessage = validationError;
        return;
      }

      this.placingOrder = true;

      try {
        const userId = this.user?.id || null;

        const { data: order, error: orderError } = await this.$supabase
          .from("merch_orders")
          .insert({
            user_id: userId,
            subtotal: this.subtotal,
            delivery_fee: this.finalDeliveryFee,
            discount_amount: this.discountAmount,
            total_amount: this.grandTotal,
            order_status: "pending",
            payment_status: "unpaid",
            delivery_status: "not_started",
            customer_note: this.customerNote || null,
          })
          .select("id, order_number")
          .single();

        if (orderError) throw orderError;

        const orderItems = this.cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price_at_purchase: item.price,
        }));

        const { error: itemsError } = await this.$supabase
          .from("merch_order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        const { error: addressError } = await this.$supabase
          .from("merch_shipping_addresses")
          .insert({
            order_id: order.id,
            full_name: this.shipping.full_name,
            phone: this.shipping.phone,
            email: this.guestEmail || this.user?.email || null,
            region: this.shipping.region,
            city: this.shipping.city,
            address_line: this.shipping.address_line,
            extra_info: this.shipping.extra_info || null,
          });

        if (addressError) throw addressError;

        const paymentReference = `CD-${Date.now()}-${order.id.slice(0, 6)}`;

        const { error: paymentError } = await this.$supabase
          .from("merch_payments")
          .insert({
            order_id: order.id,
            provider: "paystack",
            reference: paymentReference,
            amount: this.grandTotal,
            status: "pending",
            metadata: {
              email: this.guestEmail || this.user?.email || null,
              coupon_code: this.appliedCoupon?.code || null,
              payment_method: this.paymentMethod,
              checkout_type: this.user ? "account" : "guest",
            },
          });

        if (paymentError) throw paymentError;

        // Charge first, and only confirm the order once payment is verified
        // server-side. The order stays "pending" until then.
        this.payWithPaystack(order, paymentReference);
      } catch (error) {
        this.errorMessage = error.message || "Failed to place order.";
        this.placingOrder = false;
      }
    },

    payWithPaystack(order, reference) {
      if (!this.paystackPublicKey) {
        this.errorMessage =
          "Paystack is not configured. Please contact support.";
        this.placingOrder = false;
        return;
      }

      const popup = new PaystackPop();

      popup.newTransaction({
        key: this.paystackPublicKey,
        email: this.guestEmail || this.user?.email,
        amount: Math.round(this.grandTotal * 100),
        currency: "GHS",
        reference,
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
        },
        onSuccess: (transaction) => {
          this.verifyAndFinish(order, transaction.reference || reference);
        },
        onCancel: () => {
          this.placingOrder = false;
          this.errorMessage =
            "Payment cancelled. Your order is saved as pending — you can try paying again.";
        },
        onError: (error) => {
          this.placingOrder = false;
          this.errorMessage =
            error?.message || "Payment failed. Please try again.";
        },
      });
    },

    async verifyAndFinish(order, reference) {
      try {
        const { data, error } = await this.$supabase.functions.invoke(
          "verify-paystack",
          { body: { reference } },
        );

        if (error) {
          // FunctionsHttpError carries the response body in error.context.
          let detail = error.message;
          try {
            const body = await error.context.json();
            detail = body?.error || detail;
          } catch (_) {}
          throw new Error(detail);
        }
        if (!data?.ok) {
          throw new Error(data?.error || "Payment verification failed.");
        }

        await this.finalizeOrder(order);
        this.successMessage = "Payment successful. Order confirmed.";
        this.$router.push(`/thank-you?order=${order.id}`);
      } catch (error) {
        this.placingOrder = false;
        this.errorMessage =
          error.message ||
          "We couldn't verify your payment. If you were charged, please contact support.";
      }
    },

    async finalizeOrder(order) {
      if (this.appliedCoupon) {
        await this.$supabase
          .from("merch_discount_codes")
          .update({
            used_count: Number(this.appliedCoupon.used_count || 0) + 1,
          })
          .eq("id", this.appliedCoupon.id);
      }

      if (this.user && this.cartId) {
        await this.$supabase
          .from("merch_cart_items")
          .delete()
          .eq("cart_id", this.cartId);
      } else {
        localStorage.removeItem("campdawn_guest_cart");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"));
      }
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },
  },
};
</script>

<style scoped lang="scss">
.checkout-page {
  min-height: 100vh;
  background: #f7f3ed;
  color: #111;
}

.checkout-wrap {
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
    font-size: clamp(42px, 7vw, 82px);
    line-height: 0.9;
    letter-spacing: -0.06em;
  }

  span {
    display: block;
    margin-top: 10px;
    color: #777;
    font-weight: 700;
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
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
}

.left {
  display: grid;
  gap: 18px;
}

.card {
  background: white;
  border-radius: 30px;
  padding: 26px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0 0 20px;
    font-size: 25px;
    letter-spacing: -0.04em;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;

  .full {
    grid-column: 1 / -1;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #777;
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid #e4d8c9;
    background: #fbf7f1;
    border-radius: 17px;
    padding: 15px 16px;
    outline: none;
    font-size: 15px;

    &:focus {
      border-color: #111;
      background: white;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }
}

.card > textarea {
  width: 100%;
  min-height: 120px;
  border: 1px solid #e4d8c9;
  background: #fbf7f1;
  border-radius: 17px;
  padding: 15px 16px;
  outline: none;
  resize: vertical;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  button {
    border: 1px solid #e4d8c9;
    background: #fbf7f1;
    border-radius: 22px;
    padding: 18px;
    text-align: left;
    cursor: pointer;

    span {
      display: block;
      font-weight: 950;
      color: #111;
      margin-bottom: 7px;
    }

    b {
      color: #777;
      font-size: 13px;
    }

    &.active {
      background: #111;
      border-color: #111;

      span {
        color: white;
      }

      b {
        color: #f4d28b;
      }
    }
  }
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

.items {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.summary-item {
  display: grid;
  grid-template-columns: 58px 1fr auto;
  gap: 12px;
  align-items: center;

  img {
    height: 58px;
    width: 58px;
    object-fit: cover;
    border-radius: 16px;
    background: #eee3d2;
  }

  h3 {
    margin: 0;
    font-size: 14px;
  }

  p {
    margin: 5px 0 0;
    color: #aaa;
    font-size: 12px;
  }

  b {
    font-size: 13px;
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

.line,
.grand {
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

.grand {
  border-bottom: none;
  padding-top: 18px;

  span,
  b {
    font-size: 22px;
    color: #f4d28b;
  }
}

.place-order {
  width: 100%;
  margin-top: 18px;
  border: none;
  background: white;
  color: #111;
  padding: 16px 18px;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.hint {
  margin: 14px 0 0;
  color: #aaa;
  font-size: 12px;
  line-height: 1.5;
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

@media (max-width: 1050px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .summary {
    position: static;
  }
}

@media (max-width: 680px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .grid,
  .payment-options {
    grid-template-columns: 1fr;

    .full {
      grid-column: auto;
    }
  }

  .summary-item {
    grid-template-columns: 50px 1fr;
  }

  .summary-item b {
    grid-column: 2;
  }
}
</style>
