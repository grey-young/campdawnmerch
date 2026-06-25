<template>
  <main class="order-page">
    <Header />

    <section class="order-wrap">
      <div class="page-head" ref="pageHead">
        <div>
          <p class="hud-label">Order</p>
          <h1>{{ order?.order_number || "Order details" }}</h1>
          <span>Track your merch order and payment details.</span>
        </div>

        <nuxt-link to="/account">Back to account</nuxt-link>
      </div>

      <div v-if="loading" class="state-box">Loading order...</div>

      <div v-else-if="!order" class="state-box">
        <h2>Order not found</h2>
        <p>This order does not exist or cannot be viewed.</p>
        <nuxt-link to="/products">Shop merch</nuxt-link>
      </div>

      <div v-else class="order-layout">
        <div class="left">
          <div class="hero-card" ref="card">
            <div>
              <p>Order Number</p>
              <h2>{{ order.order_number }}</h2>
              <span>{{ formatDate(order.created_at) }}</span>
            </div>

            <b>GH₵ {{ formatMoney(order.total_amount) }}</b>
          </div>

          <div class="status-card" ref="card">
            <h2>Order status</h2>

            <div class="status-row">
              <div :class="{ active: statusIndex >= 0 }">
                <span>1</span>
                <p>Pending</p>
              </div>

              <div :class="{ active: statusIndex >= 1 }">
                <span>2</span>
                <p>Confirmed</p>
              </div>

              <div :class="{ active: statusIndex >= 2 }">
                <span>3</span>
                <p>Processing</p>
              </div>

              <div :class="{ active: statusIndex >= 3 }">
                <span>4</span>
                <p>Shipped</p>
              </div>

              <div :class="{ active: statusIndex >= 4 }">
                <span>5</span>
                <p>Delivered</p>
              </div>
            </div>

            <div class="badges">
              <span :class="order.order_status">{{ order.order_status }}</span>
              <span :class="order.payment_status">{{
                order.payment_status
              }}</span>
              <span :class="order.delivery_status">{{
                order.delivery_status
              }}</span>
            </div>
          </div>

          <div class="card" ref="card">
            <div class="card-head">
              <h2>Items ordered</h2>
              <p>{{ itemCount }} item(s)</p>
            </div>

            <div class="items">
              <article
                v-for="item in order.merch_order_items"
                :key="item.id"
                class="item-row"
              >
                <div>
                  <h3>{{ item.product_name }}</h3>
                  <p>
                    {{ item.color || "No color" }} /
                    {{ item.size || "No size" }}
                  </p>
                </div>

                <span>Qty {{ item.quantity }}</span>

                <b>GH₵ {{ formatMoney(item.total_price) }}</b>
              </article>
            </div>
          </div>

          <div class="card" ref="card">
            <div class="card-head">
              <h2>Delivery address</h2>
              <p>Where your merch is going.</p>
            </div>

            <div class="info-list">
              <p><b>Name:</b> {{ address.full_name || "N/A" }}</p>
              <p><b>Phone:</b> {{ address.phone || "N/A" }}</p>
              <p><b>Region:</b> {{ address.region || "N/A" }}</p>
              <p><b>City:</b> {{ address.city || "N/A" }}</p>
              <p><b>Address:</b> {{ address.address_line || "N/A" }}</p>
              <p v-if="address.extra_info">
                <b>Extra:</b> {{ address.extra_info }}
              </p>
            </div>
          </div>
        </div>

        <aside class="summary" ref="summary">
          <h2>Summary</h2>

          <div class="line">
            <span>Subtotal</span>
            <b>GH₵ {{ formatMoney(order.subtotal) }}</b>
          </div>

          <div class="line">
            <span>Delivery</span>
            <b>GH₵ {{ formatMoney(order.delivery_fee) }}</b>
          </div>

          <div class="line">
            <span>Discount</span>
            <b>- GH₵ {{ formatMoney(order.discount_amount) }}</b>
          </div>

          <div class="grand">
            <span>Total</span>
            <b>GH₵ {{ formatMoney(order.total_amount) }}</b>
          </div>

          <div class="payment-box">
            <h3>Payment</h3>
            <p><b>Provider:</b> {{ payment.provider || "N/A" }}</p>
            <p><b>Reference:</b> {{ payment.reference || "N/A" }}</p>
            <p><b>Status:</b> {{ payment.status || order.payment_status }}</p>
            <p>
              <b>Amount:</b> GH₵
              {{ formatMoney(payment.amount || order.total_amount) }}
            </p>
          </div>

          <div v-if="order.customer_note" class="note-box">
            <h3>Your note</h3>
            <p>{{ order.customer_note }}</p>
          </div>

          <nuxt-link to="/products" class="shop-link">
            Continue shopping
          </nuxt-link>
        </aside>
      </div>

      <p v-if="errorMessage" class="toast error">{{ errorMessage }}</p>
    </section>
  </main>
</template>

<script>
export default {
  name: "CustomerOrderDetailsPage",

  data() {
    return {
      loading: true,
      order: null,
      user: null,
      errorMessage: "",
    };
  },

  computed: {
    address() {
      return this.order?.merch_shipping_addresses;
    },

    payment() {
      return this.order?.merch_payments?.[0] || {};
    },

    itemCount() {
      return (this.order?.merch_order_items || []).reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
      }, 0);
    },

    statusIndex() {
      const statuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
      ];

      if (this.order?.order_status === "cancelled") return -1;

      return statuses.indexOf(this.order?.order_status);
    },
  },

  async mounted() {
    await this.getCurrentUser();
    await this.getOrder();

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
    },

    async getOrder() {
      this.loading = true;
      this.errorMessage = "";

      const orderId = this.$route.params.id;

      const { data, error } = await this.$supabase
        .from("merch_orders")
        .select(
          `
          id,
          user_id,
          order_number,
          subtotal,
          delivery_fee,
          discount_amount,
          total_amount,
          order_status,
          payment_status,
          delivery_status,
          customer_note,
          created_at,
          merch_order_items (
            id,
            product_name,
            size,
            color,
            quantity,
            price_at_purchase,
            total_price
          ),
          merch_shipping_addresses (
            id,
            full_name,
            phone,
            region,
            city,
            address_line,
            extra_info
          ),
          merch_payments (
            id,
            provider,
            reference,
            amount,
            status,
            paid_at
          )
        `,
        )
        .eq("id", orderId)
        .single();

      if (error) {
        this.errorMessage = error.message;
        this.order = null;
        this.loading = false;
        return;
      }

      if (data.user_id && this.user && data.user_id !== this.user.id) {
        this.errorMessage = "You cannot view this order.";
        this.order = null;
        this.loading = false;
        return;
      }

      this.order = data;
      this.loading = false;
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },

    formatDate(date) {
      if (!date) return "No date";

      return new Date(date).toLocaleDateString("en-GH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped lang="scss">
.order-page {
  min-height: 100vh;
  background: #131515;
  color: #f0f0ec;
}

.order-wrap {
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
    color: #ffbf38;
  }

  h1 {
    margin: 0;
    font-size: clamp(42px, 7vw, 82px);
    line-height: 0.9;
    letter-spacing: -0.06em;
    color: #f0f0ec;
  }

  span {
    display: block;
    margin-top: 12px;
    color: rgba(240, 240, 236, 0.5);
  }

  a {
    text-decoration: none;
    color: #f0f0ec;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 14px 18px;
    border-radius: 999px;
    font-weight: 900;
    transition:
      background 0.25s ease,
      transform 0.25s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.09);
      transform: translateY(-2px);
    }
  }
}

.state-box {
  min-height: 360px;
  background: rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 34px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 40px;

  h2 {
    margin: 0;
    color: #f0f0ec;
  }

  p {
    color: rgba(240, 240, 236, 0.5);
  }

  a {
    text-decoration: none;
    background: #ffbf38;
    color: #131515;
    padding: 14px 18px;
    border-radius: 999px;
    font-weight: 900;
    box-shadow: 0 16px 38px -16px rgba(255, 191, 56, 0.7);
  }
}

.order-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

.left {
  display: grid;
  gap: 18px;
}

.hero-card,
.card,
.status-card,
.summary {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 30px;
  padding: 26px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.05) inset,
    0 26px 60px -40px rgba(0, 0, 0, 0.95);
}

// Lime-tinted glass for the order hero.
.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 191, 56, 0.06);
  color: #f0f0ec;

  p {
    margin: 0 0 8px;
    color: #ffbf38;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: 32px;
    color: #f0f0ec;
  }

  span {
    display: block;
    margin-top: 8px;
    color: rgba(240, 240, 236, 0.5);
  }

  b {
    color: #ffbf38;
    font-size: 28px;
  }
}

h2 {
  margin: 0 0 18px;
  font-size: 26px;
  letter-spacing: -0.04em;
  color: #f0f0ec;
}

.status-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 20px;

  div {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 20px;
    padding: 14px;
    opacity: 0.4;
    transition:
      opacity 0.3s ease,
      background 0.3s ease;

    &.active {
      opacity: 1;
      background: #ffbf38;
      color: #131515;

      span {
        background: #131515;
        color: #ffbf38;
      }
    }
  }

  span {
    height: 28px;
    width: 28px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: #f0f0ec;
    font-weight: 900;
    margin-bottom: 10px;
  }

  p {
    margin: 0;
    font-size: 12px;
    font-weight: 900;
  }
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(240, 240, 236, 0.6);
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 900;
  }

  .paid,
  .delivered,
  .confirmed {
    background: rgba(116, 224, 138, 0.14);
    color: #74e08a;
  }

  .pending,
  .unpaid,
  .processing,
  .not_started {
    background: rgba(255, 214, 107, 0.14);
    color: #ffd66b;
  }

  .failed,
  .cancelled,
  .refunded {
    background: rgba(255, 141, 141, 0.14);
    color: #ff8d8d;
  }
}

.card-head {
  margin-bottom: 18px;

  h2 {
    margin-bottom: 6px;
  }

  p {
    margin: 0;
    color: rgba(240, 240, 236, 0.5);
  }
}

.items {
  display: grid;
  gap: 12px;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 16px;

  h3 {
    margin: 0;
    color: #f0f0ec;
  }

  p {
    margin: 6px 0 0;
    color: rgba(240, 240, 236, 0.5);
  }

  span,
  b {
    font-weight: 900;
    color: #f0f0ec;
  }
}

.info-list {
  p {
    margin: 9px 0;
    color: rgba(240, 240, 236, 0.6);
  }

  b {
    color: #f0f0ec;
  }
}

// Elevated glass — one step brighter than the cards.
.summary {
  position: sticky;
  top: 24px;
  background: rgba(8, 39, 81, 0.34);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  color: #f0f0ec;

  h2 {
    color: #f0f0ec;
  }
}

.line,
.grand {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  span {
    color: rgba(240, 240, 236, 0.5);
  }

  b {
    color: #f0f0ec;
  }
}

.grand {
  border-bottom: none;

  span,
  b {
    font-size: 22px;
    color: #ffbf38;
  }
}

.payment-box,
.note-box {
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 22px;
  padding: 18px;

  h3 {
    margin: 0 0 12px;
    color: #ffbf38;
  }

  p {
    margin: 8px 0;
    color: rgba(240, 240, 236, 0.65);
  }

  b {
    color: #f0f0ec;
  }
}

.shop-link {
  display: block;
  margin-top: 20px;
  text-align: center;
  text-decoration: none;
  background: #ffbf38;
  color: #131515;
  padding: 15px 18px;
  border-radius: 999px;
  font-weight: 900;
  box-shadow: 0 16px 40px -16px rgba(255, 191, 56, 0.7);
  transition:
    transform 0.25s ease,
    filter 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.06);
  }
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: rgba(255, 141, 141, 0.16);
  color: #ff8d8d;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 900;
}

@media (max-width: 1000px) {
  .order-layout {
    grid-template-columns: 1fr;
  }

  .summary {
    position: static;
  }

  .status-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .page-head,
  .hero-card,
  .item-row {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
