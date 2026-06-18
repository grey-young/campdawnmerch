<template>
  <section class="orders-dashboard">
    <div class="page-head" ref="pageHead">
      <div>
        <p>ORDERS CONTROL</p>
        <h1>Orders Dashboard</h1>
        <span>Click an order to view its full details.</span>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading orders...</div>

    <div v-else class="dashboard-shell">
      <aside class="orders-sidebar" ref="ordersSidebar">
        <div class="sidebar-head">
          <h2>Orders</h2>
          <input v-model="search" type="text" placeholder="Search orders..." />

          <label class="show-unconfirmed">
            <input v-model="showUnconfirmed" type="checkbox" />
            Show unconfirmed / abandoned
          </label>
        </div>

        <div class="order-list">
          <button
            v-for="order in filteredOrders"
            :key="order.id"
            type="button"
            class="order-tab"
            :class="{ active: selectedOrder?.id === order.id }"
            @click="selectOrder(order)"
          >
            <div>
              <strong>{{ order.order_number || "No number" }}</strong>
              <span>{{ getCustomerName(order) }}</span>
            </div>

            <b>GH₵ {{ formatMoney(order.total_amount) }}</b>

            <small :class="order.order_status">
              {{ order.order_status }}
            </small>
          </button>
        </div>
      </aside>

      <main class="details-panel" ref="detailsPanel">
        <div v-if="!selectedOrder" class="empty">
          <h2>Select an order</h2>
          <p>Order details will appear here.</p>
        </div>

        <template v-else>
          <div class="details-head">
            <div>
              <p>ORDER</p>
              <h2>{{ selectedOrder.order_number }}</h2>
              <span>{{ formatDate(selectedOrder.created_at) }}</span>
            </div>

            <strong>GH₵ {{ formatMoney(selectedOrder.total_amount) }}</strong>
          </div>

          <div class="badges">
            <span :class="selectedOrder.order_status">
              {{ selectedOrder.order_status }}
            </span>

            <span :class="selectedOrder.payment_status">
              {{ selectedOrder.payment_status }}
            </span>

            <span :class="selectedOrder.delivery_status">
              {{ selectedOrder.delivery_status }}
            </span>
          </div>

          <div class="status-grid">
            <div class="form-group">
              <label>Order Status</label>
              <select v-model="selectedOrder.order_status">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div class="form-group">
              <label>Payment Status</label>
              <select v-model="selectedOrder.payment_status">
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div class="form-group">
              <label>Delivery Status</label>
              <select v-model="selectedOrder.delivery_status">
                <option value="not_started">Not Started</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <button type="button" @click="saveStatus">Save Status</button>
          </div>

          <div class="cards">
            <div class="info-card">
              <h3>Customer Details</h3>
              <p><b>Name:</b> {{ address.full_name || "N/A" }}</p>
              <p><b>Phone:</b> {{ address.phone || "N/A" }}</p>
              <p><b>Email:</b> {{ address.email || "N/A" }}</p>
              <p><b>Region:</b> {{ address.region || "N/A" }}</p>
              <p><b>City:</b> {{ address.city || "N/A" }}</p>
              <p><b>Address:</b> {{ address.address_line || "N/A" }}</p>
              <p v-if="address.extra_info">
                <b>Extra:</b> {{ address.extra_info }}
              </p>
            </div>

            <div class="info-card">
              <h3>Payment Details</h3>
              <p><b>Provider:</b> {{ payment.provider || "N/A" }}</p>
              <p><b>Reference:</b> {{ payment.reference || "N/A" }}</p>
              <p><b>Status:</b> {{ payment.status || "N/A" }}</p>
              <p><b>Amount:</b> GH₵ {{ formatMoney(payment.amount) }}</p>
              <p>
                <b>Stock Deducted:</b>
                {{ selectedOrder.stock_deducted ? "Yes" : "No" }}
              </p>
            </div>
          </div>

          <div class="items-card">
            <h3>Ordered Items</h3>

            <div
              v-for="item in selectedOrder.merch_order_items"
              :key="item.id"
              class="item-row"
            >
              <div>
                <h4>{{ item.product_name }}</h4>
                <p>
                  {{ item.color || "No color" }} / {{ item.size || "No size" }}
                </p>
              </div>

              <span>Qty {{ item.quantity }}</span>
              <b>GH₵ {{ formatMoney(item.total_price) }}</b>
            </div>
          </div>

          <div class="summary-card">
            <div>
              <span>Subtotal</span>
              <b>GH₵ {{ formatMoney(selectedOrder.subtotal) }}</b>
            </div>

            <div>
              <span>Delivery</span>
              <b>GH₵ {{ formatMoney(selectedOrder.delivery_fee) }}</b>
            </div>

            <div>
              <span>Discount</span>
              <b>GH₵ {{ formatMoney(selectedOrder.discount_amount) }}</b>
            </div>

            <div class="total">
              <span>Total</span>
              <b>GH₵ {{ formatMoney(selectedOrder.total_amount) }}</b>
            </div>
          </div>

          <div class="note-card">
            <h3>Admin Note</h3>

            <textarea
              v-model="selectedOrder.admin_note"
              placeholder="Write an internal note..."
            ></textarea>

            <button type="button" @click="saveNote">Save Note</button>
          </div>
        </template>
      </main>
    </div>

    <p v-if="errorMessage" class="toast error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="toast success">{{ successMessage }}</p>
  </section>
</template>

<script>
export default {
  name: "AdminOrdersDashboard",

  data() {
    return {
      loading: true,
      orders: [],
      selectedOrder: null,
      search: "",
      showUnconfirmed: false,
      errorMessage: "",
      successMessage: "",
    };
  },

  computed: {
    filteredOrders() {
      const term = this.search.toLowerCase();

      return this.orders.filter((order) => {
        // Hide abandoned/failed checkout drafts unless explicitly requested.
        if (!this.showUnconfirmed && !this.isConfirmed(order)) return false;

        const address = this.getAddress(order);

        return (
          (order.order_number || "").toLowerCase().includes(term) ||
          this.getCustomerName(order).toLowerCase().includes(term) ||
          (address.phone || "").toLowerCase().includes(term) ||
          (address.email || "").toLowerCase().includes(term) ||
          (address.city || "").toLowerCase().includes(term) ||
          (address.region || "").toLowerCase().includes(term)
        );
      });
    },

    address() {
      return this.getAddress(this.selectedOrder);
    },

    payment() {
      return this.getPayment(this.selectedOrder);
    },
  },

  async mounted() {
    await this.getOrders();

    this.selectedOrder = this.filteredOrders[0] || null;

    this.$nextTick(() => {
      this.animatePage();
    });
  },

  methods: {
    animatePage() {
      if (!this.$gsap) return;

      this.$gsap.from(this.$refs.pageHead, {
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.ordersSidebar, {
        x: -25,
        opacity: 0,
        duration: 0.7,
        delay: 0.1,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.detailsPanel, {
        x: 25,
        opacity: 0,
        duration: 0.7,
        delay: 0.18,
        ease: "power3.out",
      });
    },

    animateDetails() {
      if (!this.$gsap) return;

      this.$nextTick(() => {
        this.$gsap.from(".details-panel > *", {
          y: 18,
          opacity: 0,
          duration: 0.45,
          stagger: 0.04,
          ease: "power3.out",
        });
      });
    },

    async getOrders() {
      this.loading = true;
      this.errorMessage = "";

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
          stock_deducted,
          customer_note,
          admin_note,
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
            email,
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
        .order("created_at", { ascending: false });

      if (error) {
        this.errorMessage = error.message;
        this.loading = false;
        return;
      }

      this.orders = data || [];
      this.loading = false;
    },

    selectOrder(order) {
      this.selectedOrder = order;
      this.animateDetails();
    },

    getAddress(order) {
      if (!order) return {};
      return order.merch_shipping_addresses;
    },

    getPayment(order) {
      if (!order) return {};
      return order.merch_payments?.[0] || {};
    },

    getCustomerName(order) {
      const address = this.getAddress(order);

      return (
        address.full_name || address.email || address.phone || "Guest Customer"
      );
    },

    // A "real" order: payment confirmed, stock reserved (COD), or already moved
    // past the pending/cancelled draft stage. Abandoned Paystack attempts stay
    // pending+unpaid and are excluded.
    isConfirmed(order) {
      return (
        order.payment_status === "paid" ||
        order.stock_deducted === true ||
        !["pending", "cancelled"].includes(order.order_status)
      );
    },

    async saveStatus() {
      this.errorMessage = "";
      this.successMessage = "";

      const { error } = await this.$supabase
        .from("merch_orders")
        .update({
          order_status: this.selectedOrder.order_status,
          payment_status: this.selectedOrder.payment_status,
          delivery_status: this.selectedOrder.delivery_status,
        })
        .eq("id", this.selectedOrder.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.successMessage = "Order status updated.";

      setTimeout(() => {
        this.successMessage = "";
      }, 1500);
    },

    async saveNote() {
      this.errorMessage = "";
      this.successMessage = "";

      const { error } = await this.$supabase
        .from("merch_orders")
        .update({
          admin_note: this.selectedOrder.admin_note || null,
        })
        .eq("id", this.selectedOrder.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.successMessage = "Admin note saved.";

      setTimeout(() => {
        this.successMessage = "";
      }, 1500);
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
.orders-dashboard {
  width: 100%;
}

.page-head {
  margin-bottom: 24px;

  p {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 4px;
    color: #9b753f;
  }

  h1 {
    margin: 0;
    font-size: clamp(34px, 5vw, 52px);
    letter-spacing: -2px;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #777;
  }
}

.loading {
  background: white;
  border-radius: 28px;
  padding: 50px;
  text-align: center;
  font-weight: 900;
}

.dashboard-shell {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 22px;
  min-height: calc(100vh - 170px);
}

.orders-sidebar,
.details-panel {
  background: white;
  border-radius: 30px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.orders-sidebar {
  padding: 20px;
  max-height: calc(100vh - 170px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-head {
  margin-bottom: 16px;

  h2 {
    margin: 0 0 14px;
    font-size: 24px;
    letter-spacing: -0.7px;
  }

  input[type="text"] {
    width: 100%;
    border: 1px solid #ded8cf;
    background: #fbfaf8;
    border-radius: 16px;
    padding: 14px 15px;
    outline: none;
  }

  .show-unconfirmed {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    font-size: 13px;
    font-weight: 600;
    color: #777;
    cursor: pointer;

    input {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }
}

.order-list {
  overflow-y: auto;
  display: grid;
  gap: 10px;
  padding-right: 4px;
}

.order-tab {
  border: 1px solid #eee4d7;
  background: #fbfaf8;
  border-radius: 22px;
  padding: 15px;
  text-align: left;
  cursor: pointer;
  transition: 0.25s ease;

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  strong {
    color: #111;
    font-size: 15px;
  }

  span {
    color: #777;
    font-size: 13px;
  }

  b {
    display: block;
    margin-top: 10px;
    color: #111;
  }

  small {
    display: inline-block;
    margin-top: 10px;
    padding: 7px 10px;
    border-radius: 999px;
    background: #eee;
    color: #555;
    font-weight: 900;
    text-transform: uppercase;
    font-size: 11px;
  }

  &.active {
    background: #111;
    border-color: #111;

    strong,
    b {
      color: white;
    }

    span {
      color: #bbb;
    }

    small {
      background: #f4d28b;
      color: #111;
    }
  }
}

.details-panel {
  padding: 26px;
  overflow: hidden;
}

.empty {
  min-height: 400px;
  display: grid;
  place-items: center;
  text-align: center;

  h2 {
    margin: 0;
    font-size: 30px;
  }

  p {
    color: #777;
  }
}

.details-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  background: #111;
  color: white;
  border-radius: 26px;
  padding: 24px;
  margin-bottom: 18px;
  overflow: hidden;
  overflow-y: auto;
  p {
    margin: 0 0 8px;
    color: #f4d28b;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 3px;
  }

  h2 {
    margin: 0;
    font-size: 30px;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #aaa;
  }

  strong {
    font-size: 24px;
    color: #f4d28b;
  }
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;

  span {
    padding: 8px 12px;
    border-radius: 999px;
    background: #eee;
    color: #555;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 900;
  }

  .paid,
  .delivered,
  .confirmed {
    background: #e7f8ec;
    color: #0f7a35;
  }

  .pending,
  .unpaid,
  .processing,
  .not_started {
    background: #fff2d8;
    color: #9b6a00;
  }

  .cancelled,
  .failed,
  .refunded {
    background: #ffe8e8;
    color: #b00020;
  }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: 12px;
  align-items: end;
  background: #fbfaf8;
  border-radius: 22px;
  padding: 18px;
  margin-bottom: 18px;

  button {
    border: none;
    background: #111;
    color: white;
    padding: 14px 16px;
    border-radius: 15px;
    font-weight: 900;
    cursor: pointer;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;

  label {
    font-size: 12px;
    font-weight: 900;
    color: #777;
  }

  select {
    border: 1px solid #ded8cf;
    background: white;
    border-radius: 14px;
    padding: 12px;
    outline: none;
  }
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.info-card,
.items-card,
.summary-card,
.note-card {
  background: #fbfaf8;
  border-radius: 24px;
  padding: 20px;

  h3 {
    margin: 0 0 14px;
    font-size: 20px;
  }

  p {
    margin: 8px 0;
    color: #555;
  }

  b {
    color: #111;
  }
}

.items-card {
  margin-bottom: 18px;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 14px;
  align-items: center;
  background: white;
  border-radius: 18px;
  padding: 14px;
  margin-top: 10px;

  h4 {
    margin: 0;
  }

  p {
    margin: 5px 0 0;
    color: #777;
  }

  span {
    font-weight: 900;
  }
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 18px;

  div {
    background: white;
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
    margin-top: 6px;
  }

  .total {
    background: #111;

    span,
    b {
      color: #f4d28b;
    }
  }
}

.note-card {
  textarea {
    width: 100%;
    min-height: 100px;
    border: 1px solid #ded8cf;
    border-radius: 16px;
    padding: 14px;
    outline: none;
    resize: vertical;
  }

  button {
    margin-top: 12px;
    border: none;
    background: #111;
    color: white;
    padding: 13px 16px;
    border-radius: 15px;
    font-weight: 900;
    cursor: pointer;
  }
}

.toast {
  position: fixed;
  right: 26px;
  bottom: 26px;
  padding: 15px 17px;
  border-radius: 16px;
  font-weight: 900;
  z-index: 30;

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
  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .orders-sidebar {
    max-height: 420px;
  }

  .status-grid,
  .cards,
  .summary-card {
    grid-template-columns: 1fr;
  }
}
</style>
