<template>
  <section class="customers-page">
    <div class="page-head" ref="pageHead">
      <div>
        <p class="eyebrow">MERCH CUSTOMERS</p>
        <h1>Customers</h1>
        <span>View buyers, order history, spending and delivery details.</span>
      </div>
    </div>

    <div class="stats" ref="stats">
      <div class="stat-card">
        <p>Total Customers</p>
        <h2>{{ customers.length }}</h2>
      </div>

      <div class="stat-card">
        <p>Customers With Orders</p>
        <h2>{{ customersWithOrders }}</h2>
      </div>

      <div class="stat-card">
        <p>Total Revenue</p>
        <h2>GH₵ {{ formatMoney(totalRevenue) }}</h2>
      </div>

      <div class="stat-card">
        <p>Total Orders</p>
        <h2>{{ orders.length }}</h2>
      </div>
    </div>

    <div class="toolbar" ref="toolbar">
      <input
        v-model="search"
        type="text"
        placeholder="Search by name, username, email or phone..."
      />

      <select v-model="filter">
        <option value="all">All Customers</option>
        <option value="ordered">With Orders</option>
        <option value="no_orders">No Orders</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading customers...</div>

    <div v-else-if="filteredCustomers.length === 0" class="empty">
      <h2>No customers found</h2>
      <p>Customers will appear here when users sign up or place orders.</p>
    </div>

    <div v-else class="customer-list" ref="customerList">
      <article
        v-for="customer in filteredCustomers"
        :key="customer.id"
        class="customer-card"
      >
        <div class="avatar">
          {{ getInitials(customer) }}
        </div>

        <div class="customer-info">
          <h2>{{ getCustomerName(customer) }}</h2>
          <p>{{ customer.email || "No email" }}</p>

          <div class="chips">
            <span>{{ customer.username || "No username" }}</span>
            <span>{{ customer.app_role || "customer" }}</span>
            <span>Joined {{ formatDate(customer.created_at) }}</span>
          </div>
        </div>

        <div class="customer-stats">
          <div>
            <span>Orders</span>
            <b>{{ customer.order_count }}</b>
          </div>

          <div>
            <span>Spent</span>
            <b>GH₵ {{ formatMoney(customer.total_spent) }}</b>
          </div>

          <div>
            <span>Last Order</span>
            <b>{{
              customer.last_order_date
                ? formatDate(customer.last_order_date)
                : "None"
            }}</b>
          </div>
        </div>

        <button class="view-btn" @click="toggleCustomer(customer.id)">
          {{
            openedCustomerId === customer.id ? "Hide Details" : "View Details"
          }}
        </button>

        <div v-if="openedCustomerId === customer.id" class="details">
          <div class="detail-grid">
            <div class="detail-box">
              <h3>Customer Info</h3>
              <p><b>Email:</b> {{ customer.email || "N/A" }}</p>
              <p><b>Username:</b> {{ customer.username || "N/A" }}</p>
              <p><b>Role:</b> {{ customer.app_role || "customer" }}</p>
              <p><b>User ID:</b> {{ customer.id }}</p>
            </div>

            <div class="detail-box">
              <h3>Latest Delivery Info</h3>
              <p>
                <b>Name:</b> {{ customer.latest_address.full_name || "N/A" }}
              </p>
              <p><b>Phone:</b> {{ customer.latest_address.phone || "N/A" }}</p>
              <p>
                <b>Region:</b> {{ customer.latest_address.region || "N/A" }}
              </p>
              <p><b>City:</b> {{ customer.latest_address.city || "N/A" }}</p>
              <p>
                <b>Address:</b>
                {{ customer.latest_address.address_line || "N/A" }}
              </p>
            </div>
          </div>

          <div class="orders-box">
            <h3>Order History</h3>

            <div v-if="customer.orders.length === 0" class="no-orders">
              No orders yet.
            </div>

            <div
              v-for="order in customer.orders"
              :key="order.id"
              class="order-row"
            >
              <div>
                <h4>{{ order.order_number }}</h4>
                <p>{{ formatDate(order.created_at) }}</p>
              </div>

              <span :class="['badge', order.order_status]">
                {{ order.order_status }}
              </span>

              <span :class="['badge', order.payment_status]">
                {{ order.payment_status }}
              </span>

              <b>GH₵ {{ formatMoney(order.total_amount) }}</b>

              <nuxt-link :to="`/admin/orders/${order.id}`"> Open </nuxt-link>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-if="errorMessage" class="message error">
      {{ errorMessage }}
    </div>
  </section>
</template>

<script>
export default {
  name: "AdminCustomersPage",

  data() {
    return {
      loading: true,
      search: "",
      filter: "all",
      profiles: [],
      orders: [],
      customers: [],
      openedCustomerId: null,
      errorMessage: "",
    };
  },

  computed: {
    filteredCustomers() {
      return this.customers.filter((customer) => {
        const term = this.search.toLowerCase();

        const matchesSearch =
          this.getCustomerName(customer).toLowerCase().includes(term) ||
          (customer.username || "").toLowerCase().includes(term) ||
          (customer.email || "").toLowerCase().includes(term) ||
          (customer.latest_address.phone || "").toLowerCase().includes(term);

        const matchesFilter =
          this.filter === "all" ||
          (this.filter === "ordered" && customer.order_count > 0) ||
          (this.filter === "no_orders" && customer.order_count === 0);

        return matchesSearch && matchesFilter;
      });
    },

    customersWithOrders() {
      return this.customers.filter((customer) => customer.order_count > 0)
        .length;
    },

    totalRevenue() {
      return this.orders
        .filter((order) => order.payment_status === "paid")
        .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    },
  },

  async mounted() {
    await this.getCustomers();

    this.$nextTick(() => {
      this.animatePage();
    });
  },

  methods: {
    animatePage() {
      if (!this.$gsap) return;

      this.$gsap.from(this.$refs.pageHead, {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.stats.children, {
        y: 28,
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

      this.animateCustomers();
    },

    animateCustomers() {
      if (!this.$gsap) return;

      this.$nextTick(() => {
        this.$gsap.from(".customer-card", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.07,
          delay: 0.25,
          ease: "power3.out",
        });
      });
    },

    async getCustomers() {
      this.loading = true;
      this.errorMessage = "";

      const { data: profiles, error: profileError } = await this.$supabase
        .from("profiles")
        .select("id, email, username, app_role, created_at")
        .order("created_at", { ascending: false });

      if (profileError) {
        this.errorMessage = profileError.message;
        this.loading = false;
        return;
      }

      const { data: orders, error: orderError } = await this.$supabase
        .from("merch_orders")
        .select(
          `
          id,
          user_id,
          order_number,
          total_amount,
          order_status,
          payment_status,
          delivery_status,
          created_at,
          merch_shipping_addresses (
            full_name,
            phone,
            region,
            city,
            address_line,
            extra_info
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (orderError) {
        this.errorMessage = orderError.message;
        this.loading = false;
        return;
      }

      this.profiles = profiles || [];
      this.orders = orders || [];
      this.customers = this.buildCustomers();

      this.loading = false;
    },

    buildCustomers() {
      return this.profiles.map((profile) => {
        const customerOrders = this.orders.filter(
          (order) => order.user_id === profile.id,
        );

        const paidOrders = customerOrders.filter(
          (order) => order.payment_status === "paid",
        );

        const totalSpent = paidOrders.reduce((sum, order) => {
          return sum + Number(order.total_amount || 0);
        }, 0);

        const latestOrder = customerOrders[0] || null;

        const latestAddress = latestOrder?.merch_shipping_addresses?.[0] || {};

        return {
          ...profile,
          orders: customerOrders,
          order_count: customerOrders.length,
          total_spent: totalSpent,
          last_order_date: latestOrder?.created_at || null,
          latest_address: latestAddress,
        };
      });
    },

    toggleCustomer(customerId) {
      this.openedCustomerId =
        this.openedCustomerId === customerId ? null : customerId;

      this.$nextTick(() => {
        if (this.$gsap && this.openedCustomerId) {
          this.$gsap.fromTo(
            ".details",
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
          );
        }
      });
    },

    getCustomerName(customer) {
      return (
        customer.latest_address?.full_name ||
        customer.username ||
        customer.email ||
        "Unknown Customer"
      );
    },

    getInitials(customer) {
      const name = this.getCustomerName(customer);

      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
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

definePageMeta({
  layout: "admin-layout",
});
</script>

<style scoped lang="scss">
.customers-page {
  width: 100%;
}

.page-head {
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
    font-weight: 800;
    font-size: 13px;
  }

  h2 {
    margin: 10px 0 0;
    font-size: 30px;
    color: #111;
    letter-spacing: -1px;
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

.customer-list {
  display: grid;
  gap: 18px;
}

.customer-card {
  background: white;
  border-radius: 30px;
  padding: 22px;
  display: grid;
  grid-template-columns: 72px 1fr 420px auto;
  gap: 18px;
  align-items: center;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.avatar {
  height: 72px;
  width: 72px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: #111;
  color: #f4d28b;
  font-weight: 950;
  font-size: 22px;
}

.customer-info {
  h2 {
    margin: 0;
    font-size: 22px;
    letter-spacing: -0.6px;
  }

  p {
    margin: 6px 0 10px;
    color: #777;
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    background: #fbfaf8;
    color: #444;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
  }
}

.customer-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  div {
    background: #fbfaf8;
    border-radius: 18px;
    padding: 14px;
  }

  span {
    display: block;
    color: #777;
    font-size: 12px;
    font-weight: 900;
  }

  b {
    display: block;
    margin-top: 5px;
    color: #111;
  }
}

.view-btn {
  border: none;
  background: #111;
  color: white;
  padding: 14px 16px;
  border-radius: 15px;
  font-weight: 950;
  cursor: pointer;
}

.details {
  grid-column: 1 / -1;
  margin-top: 6px;
  padding-top: 20px;
  border-top: 1px solid #eee4d7;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

.detail-box,
.orders-box {
  background: #fbfaf8;
  border-radius: 22px;
  padding: 20px;

  h3 {
    margin: 0 0 14px;
  }

  p {
    margin: 8px 0;
    color: #555;
  }

  b {
    color: #111;
  }
}

.order-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto auto;
  gap: 12px;
  align-items: center;
  background: white;
  border-radius: 18px;
  padding: 15px;
  margin-top: 12px;

  h4 {
    margin: 0;
  }

  p {
    margin: 5px 0 0;
    color: #777;
  }

  a {
    text-decoration: none;
    background: #111;
    color: white;
    padding: 10px 13px;
    border-radius: 13px;
    font-weight: 900;
  }
}

.badge {
  padding: 8px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 950;
  text-transform: uppercase;
  background: #eee;
  color: #555;

  &.paid,
  &.delivered,
  &.confirmed {
    background: #e7f8ec;
    color: #0f7a35;
  }

  &.pending,
  &.unpaid,
  &.processing,
  &.not_started {
    background: #fff2d8;
    color: #9b6a00;
  }

  &.failed,
  &.cancelled,
  &.refunded {
    background: #ffe8e8;
    color: #b00020;
  }
}

.no-orders {
  background: white;
  border-radius: 18px;
  padding: 18px;
  color: #777;
  font-weight: 800;
}

.message {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 50;
  padding: 16px 18px;
  border-radius: 17px;
  font-weight: 900;
  background: #ffe8e8;
  color: #b00020;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);
}

@media (max-width: 1250px) {
  .customer-card {
    grid-template-columns: 72px 1fr;
  }

  .customer-stats,
  .view-btn {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .stats,
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .toolbar {
    flex-direction: column;

    select {
      width: 100%;
    }
  }

  .order-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .stats,
  .detail-grid,
  .customer-stats {
    grid-template-columns: 1fr;
  }

  .customer-card {
    grid-template-columns: 1fr;
  }

  .avatar {
    width: 100%;
  }
}
</style>
