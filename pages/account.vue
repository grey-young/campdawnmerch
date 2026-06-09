<template>
  <main class="account-page">
    <Header />

    <section class="account-wrap">
      <div class="page-head" ref="pageHead">
        <div>
          <p>Account</p>
          <h1>My profile</h1>
          <span>Manage your details and view recent orders.</span>
        </div>
      </div>

      <div v-if="loading" class="state-box">Loading account...</div>

      <div v-else-if="!user" class="state-box">
        <h2>Please login</h2>
        <p>You need an account to view this page.</p>
        <nuxt-link to="/login">Login</nuxt-link>
      </div>

      <div v-else class="account-grid">
        <form
          class="profile-card"
          ref="profileCard"
          @submit.prevent="updateProfile"
        >
          <div class="avatar">
            {{ initials }}
          </div>

          <h2>Profile details</h2>

          <div class="form-group">
            <label>Username</label>
            <input v-model="form.username" type="text" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" disabled />
          </div>

          <div class="form-group">
            <label>Phone</label>
            <input v-model="form.phone" type="text" placeholder="055..." />
          </div>

          <div class="form-group">
            <label>Region</label>
            <input
              v-model="form.region"
              type="text"
              placeholder="Greater Accra"
            />
          </div>

          <div class="form-group">
            <label>City</label>
            <input v-model="form.city" type="text" placeholder="Accra" />
          </div>

          <div class="form-group">
            <label>Address</label>
            <textarea
              v-model="form.address"
              placeholder="Delivery address"
            ></textarea>
          </div>

          <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="message success">
            {{ successMessage }}
          </p>

          <button type="submit" :disabled="saving">
            {{ saving ? "Saving..." : "Save changes" }}
          </button>
        </form>

        <div class="orders-card" ref="ordersCard">
          <div class="card-head">
            <div>
              <h2>Recent orders</h2>
              <p>{{ orders.length }} order(s)</p>
            </div>
          </div>

          <div v-if="orders.length === 0" class="empty-orders">
            <h3>No orders yet</h3>
            <p>Your orders will show here after checkout.</p>
          </div>

          <div v-else class="orders-list">
            <article v-for="order in orders" :key="order.id" class="order-row">
              <div>
                <h3>{{ order.order_number }}</h3>
                <p>{{ formatDate(order.created_at) }}</p>
              </div>

              <span :class="order.order_status">
                {{ order.order_status }}
              </span>

              <b>GH₵ {{ formatMoney(order.total_amount) }}</b>

              <nuxt-link :to="`/orders/${order.id}`">Open</nuxt-link>
            </article>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  name: "AccountPage",

  data() {
    return {
      loading: true,
      saving: false,
      user: null,
      profile: null,
      orders: [],
      errorMessage: "",
      successMessage: "",

      form: {
        username: "",
        email: "",
        phone: "",
        region: "",
        city: "",
        address: "",
      },
    };
  },

  computed: {
    initials() {
      const name = this.form.username || this.form.email || "U";
      return name.slice(0, 2).toUpperCase();
    },
  },

  async mounted() {
    await this.getAccount();

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

      this.$gsap.from([this.$refs.profileCard, this.$refs.ordersCard], {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        delay: 0.15,
        ease: "power3.out",
      });
    },

    async getAccount() {
      this.loading = true;

      const {
        data: { user },
      } = await this.$supabase.auth.getUser();

      this.user = user || null;

      if (!this.user) {
        this.loading = false;
        return;
      }

      const { data: profile } = await this.$supabase
        .from("profiles")
        .select("*")
        .eq("id", this.user.id)
        .maybeSingle();

      this.profile = profile || null;

      this.form = {
        username: profile?.username || "",
        email: profile?.email || this.user.email || "",
        phone: profile?.phone || "",
        region: profile?.region || "",
        city: profile?.city || "",
        address: profile?.address || "",
      };

      await this.getOrders();

      this.loading = false;
    },

    async getOrders() {
      const { data, error } = await this.$supabase
        .from("merch_orders")
        .select(
          "id, order_number, total_amount, order_status, payment_status, created_at",
        )
        .eq("user_id", this.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error) {
        this.orders = data || [];
      }
    },

    async updateProfile() {
      this.errorMessage = "";
      this.successMessage = "";
      this.saving = true;

      try {
        const payload = {
          id: this.user.id,
          email: this.form.email,
          username: this.form.username.trim(),
          phone: this.form.phone || null,
          region: this.form.region || null,
          city: this.form.city || null,
          address: this.form.address || null,
          app_role: this.profile?.app_role || "customer",
        };

        const { error } = await this.$supabase.from("profiles").upsert(payload);

        if (error) throw error;

        this.successMessage = "Profile updated successfully.";

        setTimeout(() => {
          this.successMessage = "";
        }, 1800);
      } catch (error) {
        this.errorMessage = error.message || "Failed to update profile.";
      } finally {
        this.saving = false;
      }
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
.account-page {
  min-height: 100vh;
}

.account-wrap {
  width: min(1180px, 92%);
  margin: 0 auto;
  padding: 70px 0;
}

.page-head {
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

  span {
    display: block;
    margin-top: 12px;
    color: #777;
  }
}

.state-box {
  min-height: 360px;
  display: grid;
  place-items: center;
  text-align: center;
  background: white;
  border-radius: 34px;
  padding: 40px;

  a {
    text-decoration: none;
    background: #111;
    color: white;
    padding: 14px 18px;
    border-radius: 999px;
    font-weight: 900;
  }
}

.account-grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  align-items: start;
}

.profile-card,
.orders-card {
  background: white;
  border-radius: 34px;
  padding: 28px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.162);
}

.avatar {
  height: 88px;
  width: 88px;
  border-radius: 28px;
  background: #111;
  color: #f4d28b;
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 950;
  margin-bottom: 22px;
}

h2 {
  margin: 0 0 22px;
  font-size: 28px;
  letter-spacing: -0.04em;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  label {
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #777;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid #e4d8c9;
    background: #fbf7f1;
    border-radius: 17px;
    padding: 15px 16px;
    outline: none;

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
    min-height: 110px;
    resize: vertical;
  }
}

.message {
  padding: 14px 16px;
  border-radius: 16px;
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

button[type="submit"] {
  width: 100%;
  border: none;
  background: #111;
  color: white;
  padding: 16px 18px;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 8px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;

  h2 {
    margin-bottom: 6px;
  }

  p {
    margin: 0;
    color: #777;
  }

  a {
    text-decoration: none;
    color: #111;
    background: #f4efe7;
    padding: 12px 15px;
    border-radius: 999px;
    font-weight: 900;
    height: fit-content;
  }
}

.empty-orders {
  background: #fbf7f1;
  border-radius: 24px;
  padding: 40px;
  text-align: center;

  h3 {
    margin: 0;
  }

  p {
    color: #777;
  }
}

.orders-list {
  display: grid;
  gap: 12px;
}

.order-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 12px;
  background: #fbf7f1;
  border-radius: 22px;
  padding: 16px;

  h3 {
    margin: 0;
  }

  p {
    margin: 5px 0 0;
    color: #777;
  }

  span {
    padding: 8px 11px;
    border-radius: 999px;
    background: #fff2d8;
    color: #9b6a00;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;

    &.delivered,
    &.confirmed {
      background: #e7f8ec;
      color: #0f7a35;
    }

    &.cancelled {
      background: #ffe8e8;
      color: #b00020;
    }
  }

  a {
    text-decoration: none;
    background: #111;
    color: white;
    padding: 10px 13px;
    border-radius: 999px;
    font-weight: 900;
  }
}

@media (max-width: 900px) {
  .account-grid {
    grid-template-columns: 1fr;
  }

  .order-row {
    grid-template-columns: 1fr;
  }
}
</style>
