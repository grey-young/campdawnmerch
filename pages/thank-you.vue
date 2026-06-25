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
          <b>{{ order.order_number || "N/A" }}</b>
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
$lime: #ffbf38;
$ink: #131515;
$plat: #f0f0ec;

.thanks-page {
  min-height: 100vh;
  background: $ink;
  color: $plat;
  display: grid;
  place-items: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;

  // Ambient lime glow behind the card.
  &::before {
    content: "";
    position: absolute;
    top: 20%;
    left: 50%;
    width: 520px;
    height: 520px;
    transform: translateX(-50%);
    background: rgba($lime, 0.1);
    filter: blur(130px);
    pointer-events: none;
  }
}

.thanks-wrap {
  position: relative;
  width: min(560px, 92%);
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 34px;
  padding: 48px 40px;
  text-align: center;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 40px 100px -40px rgba(0, 0, 0, 0.9);
}

.check {
  height: 72px;
  width: 72px;
  margin: 0 auto 24px;
  border-radius: 50%;
  background: $lime;
  color: $ink;
  display: grid;
  place-items: center;
  font-size: 34px;
  font-weight: 900;
  box-shadow: 0 0 40px rgba($lime, 0.4);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-weight: 900;
  color: $lime;
}

h1 {
  margin: 0 0 16px;
  font-size: clamp(30px, 6vw, 46px);
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: $plat;
}

.lead {
  margin: 0 auto 28px;
  max-width: 420px;
  color: rgba($plat, 0.55);
  line-height: 1.6;
}

.order-box {
  text-align: left;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 22px;
  padding: 20px 22px;
  margin-bottom: 28px;

  &.muted {
    text-align: center;
    color: rgba($plat, 0.5);
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;

    & + .row {
      border-top: 1px solid rgba(255, 255, 255, 0.07);
    }

    span {
      color: rgba($plat, 0.5);
      font-size: 14px;
    }

    b {
      font-size: 15px;
      color: $plat;
    }
  }

  .status.paid {
    color: #74e08a;
  }

  .status.unpaid,
  .status.pending {
    color: #ffd66b;
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
    transition:
      transform 0.25s ease,
      background 0.25s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .primary {
    background: $lime;
    color: $ink;
    box-shadow: 0 16px 38px -16px rgba($lime, 0.7);
  }

  .ghost {
    background: rgba(255, 255, 255, 0.06);
    color: $plat;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
