<template>
  <section class="dashboard">
    <div class="hero" ref="hero">
      <div>
        <p>ADMIN ANALYTICS</p>
        <h1>Dashboard</h1>
        <span>Revenue, orders, stock and store activity.</span>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading dashboard...</div>

    <template v-else>
      <div class="stats" ref="stats">
        <div class="stat">
          <span>Revenue</span>
          <h2>GH₵ {{ formatMoney(totalRevenue) }}</h2>
          <p>Paid orders</p>
        </div>

        <div class="stat">
          <span>Orders</span>
          <h2>{{ orders.length }}</h2>
          <p>{{ pendingOrders }} pending</p>
        </div>

        <div class="stat">
          <span>Products</span>
          <h2>{{ products.length }}</h2>
          <p>{{ activeProducts }} active</p>
        </div>

        <div class="stat">
          <span>Stock</span>
          <h2>{{ totalStock }}</h2>
          <p>{{ lowStock.length }} low stock</p>
        </div>
      </div>

      <div class="charts-grid">
        <div class="panel wide" ref="panel">
          <div class="panel-head">
            <div>
              <h2>Revenue Trend</h2>
              <p>Last 7 days</p>
            </div>
          </div>

          <div class="bar-chart">
            <div v-for="day in revenueChart" :key="day.label" class="bar-col">
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ height: `${day.height}%` }"
                ></div>
              </div>

              <span>{{ day.label }}</span>
              <b>₵{{ formatCompact(day.value) }}</b>
            </div>
          </div>
        </div>

        <div class="panel" ref="panel">
          <div class="panel-head">
            <div>
              <h2>Order Status</h2>
              <p>Current split</p>
            </div>
          </div>

          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" class="donut">
              <circle cx="60" cy="60" r="44" class="donut-bg" />

              <circle
                v-for="slice in statusChart"
                :key="slice.status"
                cx="60"
                cy="60"
                r="44"
                class="donut-slice"
                :stroke-dasharray="`${slice.percent} ${100 - slice.percent}`"
                :stroke-dashoffset="slice.offset"
                :class="slice.status"
              />
            </svg>

            <div class="donut-center">
              <h3>{{ orders.length }}</h3>
              <span>Orders</span>
            </div>
          </div>

          <div class="legend">
            <div v-for="slice in statusChart" :key="slice.status">
              <span :class="slice.status"></span>
              <p>{{ slice.status }}</p>
              <b>{{ slice.count }}</b>
            </div>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="panel" ref="panel">
          <div class="panel-head">
            <div>
              <h2>Orders Trend</h2>
              <p>Last 7 days</p>
            </div>
          </div>

          <div class="line-chart">
            <svg viewBox="0 0 500 220" preserveAspectRatio="none">
              <polyline
                :points="orderLinePoints"
                fill="none"
                stroke="black"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <circle
                v-for="point in orderDots"
                :key="point.x"
                :cx="point.x"
                :cy="point.y"
                r="5"
              />
            </svg>

            <div class="line-labels">
              <span v-for="day in ordersChart" :key="day.label">
                {{ day.label }}
              </span>
            </div>
          </div>
        </div>

        <div class="panel" ref="panel">
          <div class="panel-head">
            <div>
              <h2>Stock Health</h2>
              <p>Inventory overview</p>
            </div>
          </div>

          <div class="stock-bars">
            <div>
              <span>Healthy</span>
              <b>{{ healthyStockCount }}</b>
              <i>
                <em :style="{ width: `${stockHealthPercent}%` }"></em>
              </i>
            </div>

            <div>
              <span>Low Stock</span>
              <b>{{ lowStock.length }}</b>
              <i>
                <em
                  class="danger"
                  :style="{ width: `${lowStockPercent}%` }"
                ></em>
              </i>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="panel" ref="panel">
          <div class="panel-head">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest purchases</p>
            </div>

            <nuxt-link to="/admin/orders">View all</nuxt-link>
          </div>

          <div class="orders-list">
            <article v-for="order in recentOrders" :key="order.id">
              <div>
                <h3>{{ order.order_number }}</h3>
                <p>
                  {{ getCustomerName(order) }} •
                  {{ formatDate(order.created_at) }}
                </p>
              </div>

              <span :class="order.order_status">{{ order.order_status }}</span>
              <b>GH₵ {{ formatMoney(order.total_amount) }}</b>
            </article>
          </div>
        </div>

        <div class="panel" ref="panel">
          <div class="panel-head">
            <div>
              <h2>Low Stock</h2>
              <p>Needs attention</p>
            </div>
          </div>

          <div class="low-list">
            <article v-for="variant in lowStock" :key="variant.id">
              <div>
                <h3>{{ variant.merch_products?.name }}</h3>
                <p>{{ variant.color }} / {{ variant.size }}</p>
              </div>

              <b>{{ variant.stock }}</b>
            </article>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script>
export default {
  name: "AdminDashboard",

  data() {
    return {
      loading: true,
      products: [],
      variants: [],
      orders: [],
      errorMessage: "",
    };
  },

  computed: {
    totalRevenue() {
      return this.orders
        .filter((order) => order.payment_status === "paid")
        .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    },

    pendingOrders() {
      return this.orders.filter((order) => order.order_status === "pending")
        .length;
    },

    activeProducts() {
      return this.products.filter((product) => product.status === "active")
        .length;
    },

    totalStock() {
      return this.variants.reduce(
        (sum, variant) => sum + Number(variant.stock || 0),
        0,
      );
    },

    lowStock() {
      return this.variants
        .filter((variant) => Number(variant.stock || 0) <= 5)
        .slice(0, 6);
    },

    healthyStockCount() {
      return this.variants.filter((variant) => Number(variant.stock || 0) > 5)
        .length;
    },

    stockHealthPercent() {
      if (!this.variants.length) return 0;
      return (this.healthyStockCount / this.variants.length) * 100;
    },

    lowStockPercent() {
      if (!this.variants.length) return 0;
      return (this.lowStock.length / this.variants.length) * 100;
    },

    recentOrders() {
      return this.orders.slice(0, 6);
    },

    revenueChart() {
      return this.buildDailyChart("revenue");
    },

    ordersChart() {
      return this.buildDailyChart("orders");
    },

    orderDots() {
      const max = Math.max(...this.ordersChart.map((d) => d.value), 1);

      return this.ordersChart.map((day, index) => {
        const x = 20 + index * 76;
        const y = 190 - (day.value / max) * 150;

        return { x, y };
      });
    },

    orderLinePoints() {
      return this.orderDots.map((point) => `${point.x},${point.y}`).join(" ");
    },

    statusChart() {
      const statuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
      ];
      const total = this.orders.length || 1;
      let offset = 25;

      return statuses
        .map((status) => {
          const count = this.orders.filter(
            (order) => order.order_status === status,
          ).length;
          const percent = (count / total) * 100;
          const item = { status, count, percent, offset };
          offset -= percent;
          return item;
        })
        .filter((item) => item.count > 0);
    },
  },

  async mounted() {
    await this.getDashboardData();

    this.$nextTick(() => {
      this.animatePage();
    });
  },

  methods: {
    async getDashboardData() {
      this.loading = true;

      const [products, variants, orders] = await Promise.all([
        this.$supabase
          .from("merch_products")
          .select("id, name, status, price, created_at"),

        this.$supabase
          .from("merch_product_variants")
          .select(
            `
            id,
            color,
            size,
            stock,
            is_active,
            merch_products (
              id,
              name
            )
          `,
          )
          .eq("is_active", true),

        this.$supabase
          .from("merch_orders")
          .select(
            `
            id,
            order_number,
            total_amount,
            order_status,
            payment_status,
            created_at,
            merch_shipping_addresses (
              full_name
            )
          `,
          )
          .order("created_at", { ascending: false }),
      ]);

      this.products = products.data || [];
      this.variants = variants.data || [];
      this.orders = orders.data || [];
      this.loading = false;
    },

    buildDailyChart(type) {
      const days = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const label = date.toLocaleDateString("en-GH", {
          weekday: "short",
        });

        const sameDayOrders = this.orders.filter((order) => {
          const orderDate = new Date(order.created_at);

          return orderDate.toDateString() === date.toDateString();
        });

        const value =
          type === "revenue"
            ? sameDayOrders
                .filter((order) => order.payment_status === "paid")
                .reduce(
                  (sum, order) => sum + Number(order.total_amount || 0),
                  0,
                )
            : sameDayOrders.length;

        days.push({ label, value });
      }

      const max = Math.max(...days.map((day) => day.value), 1);

      return days.map((day) => ({
        ...day,
        height: Math.max((day.value / max) * 100, day.value > 0 ? 10 : 2),
      }));
    },

    animatePage() {
      if (!this.$gsap) return;

      this.$gsap.from(this.$refs.hero, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.stats.children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        delay: 0.1,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.panel, {
        y: 35,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.22,
        ease: "power3.out",
      });
    },

    getCustomerName(order) {
      return order.merch_shipping_addresses?.[0]?.full_name || "Guest customer";
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },

    formatCompact(value) {
      if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
      return Number(value || 0).toFixed(0);
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("en-GH", {
        month: "short",
        day: "numeric",
      });
    },
  },
};

definePageMeta({
  layout: "admin-layout",
});
</script>

<style scoped lang="scss">
.dashboard {
  width: 100%;
  color: #111;
}

.hero {
  min-height: 230px;
  border-radius: 34px;
  padding: 34px;

  color: black;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 22px;
  overflow: hidden;

  p {
    margin: 0 0 10px;
    color: #f4d28b;
    font-size: 12px;
    letter-spacing: 4px;
  }

  h1 {
    margin: 0;
    font-size: clamp(46px, 7vw, 86px);
    letter-spacing: -5px;
    line-height: 0.9;
  }

  span {
    display: block;
    margin-top: 14px;
    color: #bbb;
  }

  a {
    text-decoration: none;
    background: white;
    color: #111;
    padding: 15px 18px;
    border-radius: 999px;
  }
}

.loading {
  background: white;
  padding: 60px;
  border-radius: 30px;
  text-align: center;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}

.stat,
.panel {
  background: white;
  border-radius: 30px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.stat {
  padding: 24px;

  span {
    color: #777;
    font-size: 13px;
  }

  h2 {
    margin: 10px 0 8px;
    font-size: 34px;
    letter-spacing: -2px;
  }

  p {
    margin: 0;
    color: #999;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 22px;
  margin-bottom: 22px;
}

.panel {
  padding: 26px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;

  h2 {
    margin: 0;
    font-size: 26px;
    letter-spacing: -1px;
  }

  p {
    margin: 6px 0 0;
    color: #777;
  }

  a {
    text-decoration: none;
    background: #f5efe6;
    color: #111;
    padding: 12px 14px;
    border-radius: 999px;
    height: fit-content;
  }
}

.bar-chart {
  height: 290px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
  align-items: end;
}

.bar-col {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto auto;
  gap: 8px;
  text-align: center;

  span {
    color: #777;
    font-size: 12px;
    font-weight: 900;
  }

  b {
    font-size: 12px;
  }
}

.bar-track {
  height: 100%;
  background: #f5efe6;
  border-radius: 999px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  min-height: 4px;
  background: #111;
  border-radius: 999px;
}

.donut-wrap {
  position: relative;
  width: 210px;
  height: 210px;
  margin: 0 auto 20px;
}

.donut {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-bg {
  fill: none;
  stroke: #f5efe6;
  stroke-width: 18;
}

.donut-slice {
  fill: none;
  stroke-width: 18;
  stroke-linecap: round;

  &.pending {
    stroke: #f4d28b;
  }

  &.confirmed {
    stroke: #111;
  }

  &.processing {
    stroke: #8b6b3f;
  }

  &.shipped {
    stroke: #777;
  }

  &.delivered {
    stroke: #0f7a35;
  }
}

.donut-center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;

  h3 {
    margin: 0;
    font-size: 42px;
  }

  span {
    display: block;
    margin-top: -40px;
    color: #777;
    font-weight: 800;
  }
}

.legend {
  display: grid;
  gap: 10px;

  div {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
  }

  span {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: #111;

    &.pending {
      background: #f4d28b;
    }

    &.processing {
      background: #8b6b3f;
    }

    &.shipped {
      background: #777;
    }

    &.delivered {
      background: #0f7a35;
    }
  }

  p {
    margin: 0;
    text-transform: capitalize;
    color: #555;
  }
}

.line-chart {
  height: 290px;

  svg {
    width: 100%;
    height: 240px;
    background: linear-gradient(to bottom, #fbfaf8, white);
    border-radius: 22px;

    circle {
      fill: #111;
    }
  }
}

.line-labels {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-top: 12px;
  text-align: center;

  span {
    font-size: 12px;
    color: #777;
    font-weight: 900;
  }
}

.stock-bars {
  display: grid;
  gap: 24px;

  div {
    display: grid;
    gap: 10px;
  }

  span {
    color: #777;
    font-weight: 900;
  }

  b {
    font-size: 32px;
  }

  i {
    height: 12px;
    background: #f5efe6;
    border-radius: 999px;
    overflow: hidden;
  }

  em {
    display: block;
    height: 100%;
    background: #111;
    border-radius: 999px;

    &.danger {
      background: #b00020;
    }
  }
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1.3fr 0.8fr;
  gap: 22px;
}

.orders-list,
.low-list {
  display: grid;
  gap: 12px;
}

.orders-list article,
.low-list article {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #fbfaf8;
  border-radius: 20px;

  h3 {
    margin: 0;
    font-size: 16px;
  }

  p {
    margin: 5px 0 0;
    color: #777;
    font-size: 13px;
  }

  span {
    padding: 8px 11px;
    border-radius: 999px;
    background: #fff2d8;
    color: #9b6a00;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
  }
}

.low-list article {
  grid-template-columns: 1fr auto;

  b {
    height: 42px;
    width: 42px;
    border-radius: 50%;
    background: #ffe8e8;
    color: #b00020;
    display: grid;
    place-items: center;
  }
}

@media (max-width: 1100px) {
  .stats,
  .charts-grid,
  .bottom-grid {
    grid-template-columns: 1fr 1fr;
  }

  .charts-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .orders-list article {
    grid-template-columns: 1fr;
  }
}
</style>
