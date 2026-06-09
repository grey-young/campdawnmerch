<template>
  <section class="order-page">
    <div class="page-head" ref="pageHead">
      <div>
        <p class="eyebrow">ORDER DETAILS</p>
        <h1>{{ order.order_number || "Order" }}</h1>
        <span>View and manage this customer order.</span>
      </div>

      <nuxt-link to="/admin/orders" class="back-btn">
        Back to Orders
      </nuxt-link>
    </div>

    <div v-if="loading" class="loading">Loading order...</div>

    <div v-else-if="!order.id" class="empty">
      <h2>Order not found</h2>
      <p>This order does not exist or you do not have permission to view it.</p>
    </div>

    <div v-else class="order-layout">
      <div class="main-column">
        <div class="card hero-card" ref="card">
          <div>
            <p class="label">Order Number</p>
            <h2>{{ order.order_number }}</h2>
            <span>{{ formatDate(order.created_at) }}</span>
          </div>

          <div class="total">
            <p>Total</p>
            <h3>GH₵ {{ formatMoney(order.total_amount) }}</h3>
          </div>
        </div>

        <div class="card" ref="card">
          <div class="card-title">
            <h2>Order Items</h2>
            <p>{{ getItemCount(order) }} item(s) in this order.</p>
          </div>

          <div class="items">
            <div
              v-for="item in order.merch_order_items"
              :key="item.id"
              class="item-row"
            >
              <div>
                <h3>{{ item.product_name }}</h3>
                <p>
                  {{ item.color || "No color" }} / {{ item.size || "No size" }}
                </p>
              </div>

              <div>
                <span>Qty</span>
                <b>{{ item.quantity }}</b>
              </div>

              <div>
                <span>Price</span>
                <b>GH₵ {{ formatMoney(item.price_at_purchase) }}</b>
              </div>

              <div>
                <span>Total</span>
                <b>GH₵ {{ formatMoney(item.total_price) }}</b>
              </div>
            </div>
          </div>
        </div>

        <div class="card" ref="card">
          <div class="card-title">
            <h2>Order Summary</h2>
            <p>Payment breakdown for this order.</p>
          </div>

          <div class="summary">
            <div>
              <span>Subtotal</span>
              <b>GH₵ {{ formatMoney(order.subtotal) }}</b>
            </div>

            <div>
              <span>Delivery Fee</span>
              <b>GH₵ {{ formatMoney(order.delivery_fee) }}</b>
            </div>

            <div>
              <span>Discount</span>
              <b>GH₵ {{ formatMoney(order.discount_amount) }}</b>
            </div>

            <div class="grand">
              <span>Total Amount</span>
              <b>GH₵ {{ formatMoney(order.total_amount) }}</b>
            </div>
          </div>
        </div>

        <div class="card" ref="card">
          <div class="card-title">
            <h2>Notes</h2>
            <p>Customer note and internal admin note.</p>
          </div>

          <div class="notes">
            <div>
              <h3>Customer Note</h3>
              <p>{{ order.customer_note || "No customer note." }}</p>
            </div>

            <div>
              <h3>Admin Note</h3>
              <textarea
                v-model="order.admin_note"
                placeholder="Write internal note..."
              ></textarea>

              <button
                @click="updateOrder({ admin_note: order.admin_note || null })"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside class="side-column">
        <div class="card status-card" ref="sideCard">
          <div class="card-title">
            <h2>Status Control</h2>
            <p>Update order progress.</p>
          </div>

          <div class="badges">
            <span :class="['badge', order.order_status]">
              {{ order.order_status }}
            </span>

            <span :class="['badge', order.payment_status]">
              {{ order.payment_status }}
            </span>

            <span :class="['badge', order.delivery_status]">
              {{ order.delivery_status }}
            </span>
          </div>

          <div class="form-group">
            <label>Order Status</label>
            <select v-model="order.order_status">
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
            <select v-model="order.payment_status">
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div class="form-group">
            <label>Delivery Status</label>
            <select v-model="order.delivery_status">
              <option value="not_started">Not Started</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <button class="save-btn" :disabled="saving" @click="saveStatuses">
            {{ saving ? "Saving..." : "Save Statuses" }}
          </button>
        </div>

        <div class="card" ref="sideCard">
          <div class="card-title">
            <h2>Customer</h2>
            <p>Delivery information.</p>
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

        <div class="card" ref="sideCard">
          <div class="card-title">
            <h2>Payment</h2>
            <p>Transaction details.</p>
          </div>

          <div class="info-list">
            <p><b>Provider:</b> {{ payment.provider || "N/A" }}</p>
            <p><b>Reference:</b> {{ payment.reference || "N/A" }}</p>
            <p><b>Amount:</b> GH₵ {{ formatMoney(payment.amount) }}</p>
            <p><b>Status:</b> {{ payment.status || "N/A" }}</p>
            <p>
              <b>Paid At:</b>
              {{ payment.paid_at ? formatDate(payment.paid_at) : "N/A" }}
            </p>
            <p>
              <b>Stock Deducted:</b> {{ order.stock_deducted ? "Yes" : "No" }}
            </p>
          </div>

          <button
            v-if="!order.stock_deducted && order.payment_status === 'paid'"
            class="stock-btn"
            @click="deductStock"
          >
            Deduct Stock
          </button>
        </div>

        <button class="delete-btn" @click="deleteOrder">Delete Order</button>
      </aside>
    </div>

    <div v-if="errorMessage" class="message error">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="message success">
      {{ successMessage }}
    </div>
  </section>
</template>

<script>
export default {
  name: "AdminSingleOrderPage",

  data() {
    return {
      loading: true,
      saving: false,
      order: {},
      address: {},
      payment: {},
      errorMessage: "",
      successMessage: "",
    };
  },

  async mounted() {
    await this.getOrder();

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

      this.$gsap.from(this.$refs.card, {
        y: 35,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.15,
        ease: "power3.out",
      });

      this.$gsap.from(this.$refs.sideCard, {
        x: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.25,
        ease: "power3.out",
      });
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
          stock_deducted,
          customer_note,
          admin_note,
          created_at,
          updated_at,
          merch_order_items (
            id,
            product_id,
            variant_id,
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
        this.loading = false;
        return;
      }

      this.order = data || {};
      this.address = data.merch_shipping_addresses?.[0] || {};
      this.payment = data.merch_payments?.[0] || {};

      this.loading = false;
    },

    async updateOrder(payload) {
      this.errorMessage = "";
      this.successMessage = "";

      const { error } = await this.$supabase
        .from("merch_orders")
        .update(payload)
        .eq("id", this.order.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      Object.assign(this.order, payload);
      this.successMessage = "Order updated successfully.";

      this.clearMessage();
    },

    async saveStatuses() {
      this.saving = true;

      await this.updateOrder({
        order_status: this.order.order_status,
        payment_status: this.order.payment_status,
        delivery_status: this.order.delivery_status,
      });

      this.saving = false;
    },

    async deductStock() {
      const confirmDeduct = confirm(
        "Are you sure you want to deduct stock for this order?",
      );

      if (!confirmDeduct) return;

      this.errorMessage = "";
      this.successMessage = "";

      const { error } = await this.$supabase.rpc("deduct_merch_stock", {
        order_uuid: this.order.id,
      });

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.order.stock_deducted = true;
      this.order.payment_status = "paid";
      this.order.order_status = "confirmed";
      this.successMessage = "Stock deducted successfully.";

      this.clearMessage();
    },

    async deleteOrder() {
      const confirmDelete = confirm(
        `Are you sure you want to delete ${this.order.order_number}?`,
      );

      if (!confirmDelete) return;

      const { error } = await this.$supabase
        .from("merch_orders")
        .delete()
        .eq("id", this.order.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.$router.push("/admin/orders");
    },

    getItemCount(order) {
      const items = order.merch_order_items || [];

      return items.reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
      }, 0);
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

    clearMessage() {
      setTimeout(() => {
        this.successMessage = "";
        this.errorMessage = "";
      }, 1800);
    },
  },
};

definePageMeta({
  layout: "admin-layout",
});
</script>

<style scoped lang="scss">
.order-page {
  width: 100%;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.back-btn {
  text-decoration: none;
  background: #111;
  color: white;
  padding: 15px 20px;
  border-radius: 17px;
  font-weight: 900;
}

.loading,
.empty {
  background: white;
  border-radius: 30px;
  padding: 50px;
  text-align: center;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.06);
}

.order-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

.main-column,
.side-column {
  display: grid;
  gap: 22px;
}

.side-column {
  position: sticky;
  top: 24px;
}

.card {
  background: white;
  border-radius: 30px;
  padding: 26px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #111;
  color: white;

  .label {
    margin: 0 0 8px;
    color: #f4d28b;
    font-weight: 900;
    letter-spacing: 2px;
    font-size: 12px;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: 34px;
    letter-spacing: -1px;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #aaa;
  }

  .total {
    text-align: right;

    p {
      margin: 0;
      color: #aaa;
    }

    h3 {
      margin: 8px 0 0;
      font-size: 30px;
      color: #f4d28b;
    }
  }
}

.card-title {
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.8px;
  }

  p {
    margin: 7px 0 0;
    color: #777;
  }
}

.item-row {
  display: grid;
  grid-template-columns: 1.5fr 0.5fr 0.7fr 0.7fr;
  gap: 14px;
  align-items: center;
  background: #fbfaf8;
  border: 1px solid #eee4d7;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 18px;
  }

  p {
    margin: 6px 0 0;
    color: #777;
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
  }
}

.summary {
  display: grid;
  gap: 12px;

  div {
    display: flex;
    justify-content: space-between;
    background: #fbfaf8;
    border-radius: 18px;
    padding: 16px;
  }

  span {
    color: #777;
    font-weight: 800;
  }

  b {
    color: #111;
  }

  .grand {
    background: #111;
    color: white;

    span,
    b {
      color: white;
    }
  }
}

.notes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;

  h3 {
    margin: 0 0 10px;
  }

  p {
    color: #555;
    margin: 0;
  }

  textarea {
    width: 100%;
    min-height: 120px;
    border: 1px solid #ded8cf;
    background: #fbfaf8;
    border-radius: 18px;
    padding: 15px;
    resize: vertical;
    outline: none;
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

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.badge {
  padding: 8px 12px;
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

  &.packed,
  &.shipped {
    background: #e8f0ff;
    color: #174ea6;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;

  label {
    font-size: 12px;
    font-weight: 900;
    color: #333;
  }

  select {
    border: 1px solid #ded8cf;
    background: #fbfaf8;
    border-radius: 15px;
    padding: 13px 14px;
    outline: none;
    font-weight: 800;
  }
}

.save-btn,
.stock-btn,
.delete-btn {
  width: 100%;
  border: none;
  padding: 15px 17px;
  border-radius: 16px;
  font-weight: 950;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.save-btn,
.stock-btn {
  background: #111;
  color: white;
}

.delete-btn {
  background: #ffe8e8;
  color: #b00020;
}

.info-list {
  p {
    margin: 10px 0;
    color: #555;
    line-height: 1.5;
  }

  b {
    color: #111;
  }
}

.message {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 50;
  padding: 16px 18px;
  border-radius: 17px;
  font-weight: 900;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);

  &.error {
    background: #ffe8e8;
    color: #b00020;
  }

  &.success {
    background: #e7f8ec;
    color: #0f7a35;
  }
}

@media (max-width: 1100px) {
  .order-layout {
    grid-template-columns: 1fr;
  }

  .side-column {
    position: static;
  }
}

@media (max-width: 760px) {
  .page-head,
  .hero-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }

  .hero-card .total {
    text-align: left;
  }

  .item-row,
  .notes {
    grid-template-columns: 1fr;
  }
}
</style>
