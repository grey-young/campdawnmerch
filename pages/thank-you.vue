<template>
  <main class="thanks-page">
    <section class="thanks-wrap" ref="wrap">
      <div class="check">✓</div>

      <p class="eyebrow">Order confirmed</p>
      <h1>Thanks for your purchase!</h1>

      <p class="lead">
        We've received your order and sent the details to your email. Our team
        will get your merch packed and on its way.
      </p>

      <div v-if="order" class="order-box">
        <div class="row">
          <span>Order number</span>
          <b>{{ order.order_number || "—" }}</b>
        </div>
        <div class="row">
          <span>Total</span>
          <b>GH₵ {{ formatMoney(order.total_amount) }}</b>
        </div>
        <div class="row">
          <span>Payment</span>
          <b class="status" :class="order.payment_status">
            {{ order.payment_status === "paid" ? "Paid" : "Pending" }}
          </b>
        </div>
      </div>

      <div v-else-if="loading" class="order-box muted">Loading your order...</div>

      <div class="actions">
        <nuxt-link v-if="orderId" :to="`/orders/${orderId}`" class="primary">
          View order
        </nuxt-link>
        <nuxt-link to="/products" class="ghost">Continue shopping</nuxt-link>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  name: "ThankYouPage",

  data() {
    return {
      loading: true,
      order: null,
    };
  },

  computed: {
    orderId() {
      return this.$route.query.order || null;
    },
  },

  async mounted() {
    if (this.orderId) {
      await this.getOrder();
    }
    this.loading = false;

    this.$nextTick(() => {
      if (this.$gsap && this.$refs.wrap) {
        this.$gsap.from(this.$refs.wrap, {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      }
    });
  },

  methods: {
    async getOrder() {
      const { data } = await this.$supabase
        .from("merch_orders")
        .select("order_number, total_amount, payment_status")
        .eq("id", this.orderId)
        .maybeSingle();

      this.order = data || null;
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },
  },
};
</script>

<style scoped lang="scss">
.thanks-page {
  min-height: 100vh;
  background: #f7f3ed;
  color: #111;
  display: grid;
  place-items: center;
  padding: 40px 0;
}

.thanks-wrap {
  width: min(560px, 92%);
  background: white;
  border-radius: 34px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.check {
  height: 72px;
  width: 72px;
  margin: 0 auto 24px;
  border-radius: 50%;
  background: #111;
  color: #f4d28b;
  display: grid;
  place-items: center;
  font-size: 34px;
  font-weight: 900;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-weight: 900;
  color: #8b6b3f;
}

h1 {
  margin: 0 0 16px;
  font-size: clamp(30px, 6vw, 46px);
  line-height: 0.95;
  letter-spacing: -0.05em;
}

.lead {
  margin: 0 auto 28px;
  max-width: 420px;
  color: #777;
  line-height: 1.6;
}

.order-box {
  text-align: left;
  border: 1px solid #e4d8c9;
  background: #fbf7f1;
  border-radius: 22px;
  padding: 20px 22px;
  margin-bottom: 28px;

  &.muted {
    text-align: center;
    color: #999;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;

    & + .row {
      border-top: 1px solid #eaded0;
    }

    span {
      color: #888;
      font-size: 14px;
    }

    b {
      font-size: 15px;
    }
  }

  .status.paid {
    color: #0f7a35;
  }

  .status.unpaid,
  .status.pending {
    color: #8b6b3f;
  }
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;

  a {
    text-decoration: none;
    padding: 15px 22px;
    border-radius: 999px;
    font-weight: 900;
  }

  .primary {
    background: #111;
    color: white;
  }

  .ghost {
    background: #f4d28b;
    color: #111;
  }
}
</style>
