<template>
  <section class="coupons-page">
    <div class="page-head" ref="pageHead">
      <div>
        <p class="eyebrow">MERCH DISCOUNTS</p>
        <h1>Coupons</h1>
        <span>Create and manage discount codes for the merch shop.</span>
      </div>
    </div>

    <div class="stats" ref="stats">
      <div class="stat-card">
        <p>Total Coupons</p>
        <h2>{{ coupons.length }}</h2>
      </div>

      <div class="stat-card">
        <p>Active</p>
        <h2>{{ activeCoupons }}</h2>
      </div>

      <div class="stat-card">
        <p>Expired</p>
        <h2>{{ expiredCoupons }}</h2>
      </div>

      <div class="stat-card">
        <p>Total Uses</p>
        <h2>{{ totalUses }}</h2>
      </div>
    </div>

    <div class="layout">
      <form class="form-card" ref="formCard" @submit.prevent="saveCoupon">
        <div class="card-title">
          <h2>{{ editingId ? "Edit Coupon" : "Create Coupon" }}</h2>
          <p>Set discount amount, usage limit and expiry date.</p>
        </div>

        <div class="form-group">
          <label>Coupon Code</label>
          <input v-model="form.code" type="text" placeholder="CAMP10" />
        </div>

        <div class="form-group">
          <label>Discount Type</label>
          <select v-model="form.discount_type">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            Discount Value
            <span v-if="form.discount_type === 'percentage'">(%)</span>
            <span v-else>(GH₵)</span>
          </label>

          <input v-model.number="form.discount_value" type="number" min="0" />
        </div>

        <div class="form-group">
          <label>Usage Limit</label>
          <input
            v-model.number="form.usage_limit"
            type="number"
            min="1"
            placeholder="Leave empty for unlimited"
          />
        </div>

        <div class="form-group">
          <label>Start Date</label>
          <input v-model="form.starts_at" type="datetime-local" />
        </div>

        <div class="form-group">
          <label>Expiry Date</label>
          <input v-model="form.expires_at" type="datetime-local" />
        </div>

        <div class="form-group toggle-line">
          <label>Status</label>

          <button
            type="button"
            class="toggle-btn"
            :class="{ active: form.is_active }"
            @click="form.is_active = !form.is_active"
          >
            {{ form.is_active ? "Active" : "Inactive" }}
          </button>
        </div>

        <div v-if="errorMessage" class="message error">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="message success">
          {{ successMessage }}
        </div>

        <div class="form-actions">
          <button
            v-if="editingId"
            type="button"
            class="cancel"
            @click="resetForm"
          >
            Cancel Edit
          </button>

          <button type="submit" class="submit" :disabled="saving">
            {{
              saving
                ? "Saving..."
                : editingId
                  ? "Update Coupon"
                  : "Create Coupon"
            }}
          </button>
        </div>
      </form>

      <div class="list-card" ref="listCard">
        <div class="list-head">
          <div>
            <h2>All Coupons</h2>
            <p>{{ filteredCoupons.length }} coupon(s) showing</p>
          </div>

          <div class="tools">
            <input v-model="search" type="text" placeholder="Search code..." />

            <select v-model="filter">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading">Loading coupons...</div>

        <div v-else-if="filteredCoupons.length === 0" class="empty">
          <h3>No coupons found</h3>
          <p>Create your first promo code.</p>
        </div>

        <div v-else class="coupon-list">
          <article
            v-for="coupon in filteredCoupons"
            :key="coupon.id"
            class="coupon-item"
          >
            <div class="coupon-code">
              <span>{{ coupon.code }}</span>
              <b
                :class="{
                  active: coupon.is_active,
                  expired: isExpired(coupon),
                }"
              >
                {{ getCouponStatus(coupon) }}
              </b>
            </div>

            <div class="coupon-info">
              <div>
                <span>Discount</span>
                <b>{{ formatDiscount(coupon) }}</b>
              </div>

              <div>
                <span>Used</span>
                <b>
                  {{ coupon.used_count }}
                  <template v-if="coupon.usage_limit">
                    / {{ coupon.usage_limit }}
                  </template>
                </b>
              </div>

              <div>
                <span>Starts</span>
                <b>{{
                  coupon.starts_at ? formatDate(coupon.starts_at) : "Now"
                }}</b>
              </div>

              <div>
                <span>Expires</span>
                <b>{{
                  coupon.expires_at ? formatDate(coupon.expires_at) : "Never"
                }}</b>
              </div>
            </div>

            <div class="coupon-actions">
              <button class="edit" @click="editCoupon(coupon)">Edit</button>

              <button class="status" @click="toggleCoupon(coupon)">
                {{ coupon.is_active ? "Disable" : "Enable" }}
              </button>

              <button class="delete" @click="deleteCoupon(coupon)">
                Delete
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "AdminCouponsPage",

  data() {
    return {
      loading: true,
      saving: false,
      search: "",
      filter: "all",
      coupons: [],
      editingId: null,
      errorMessage: "",
      successMessage: "",

      form: {
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        usage_limit: null,
        starts_at: "",
        expires_at: "",
        is_active: true,
      },
    };
  },

  computed: {
    filteredCoupons() {
      return this.coupons.filter((coupon) => {
        const matchesSearch = coupon.code
          .toLowerCase()
          .includes(this.search.toLowerCase());

        const matchesFilter =
          this.filter === "all" ||
          (this.filter === "active" &&
            coupon.is_active &&
            !this.isExpired(coupon)) ||
          (this.filter === "inactive" && !coupon.is_active) ||
          (this.filter === "expired" && this.isExpired(coupon));

        return matchesSearch && matchesFilter;
      });
    },

    activeCoupons() {
      return this.coupons.filter(
        (coupon) => coupon.is_active && !this.isExpired(coupon),
      ).length;
    },

    expiredCoupons() {
      return this.coupons.filter((coupon) => this.isExpired(coupon)).length;
    },

    totalUses() {
      return this.coupons.reduce((sum, coupon) => {
        return sum + Number(coupon.used_count || 0);
      }, 0);
    },
  },

  watch: {
    "form.code"(value) {
      this.form.code = value.toUpperCase().replace(/\s+/g, "");
    },
  },

  async mounted() {
    await this.getCoupons();

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

      this.$gsap.from([this.$refs.formCard, this.$refs.listCard], {
        y: 35,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        delay: 0.25,
        ease: "power3.out",
      });
    },

    animateList() {
      if (!this.$gsap) return;

      this.$nextTick(() => {
        this.$gsap.from(".coupon-item", {
          y: 24,
          opacity: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power3.out",
        });
      });
    },

    async getCoupons() {
      this.loading = true;
      this.errorMessage = "";

      const { data, error } = await this.$supabase
        .from("merch_discount_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        this.errorMessage = error.message;
        this.loading = false;
        return;
      }

      this.coupons = data || [];
      this.loading = false;

      this.animateList();
    },

    validateCoupon() {
      if (!this.form.code) return "Coupon code is required.";

      if (!this.form.discount_value || this.form.discount_value <= 0) {
        return "Discount value must be greater than 0.";
      }

      if (
        this.form.discount_type === "percentage" &&
        this.form.discount_value > 100
      ) {
        return "Percentage discount cannot be more than 100%.";
      }

      if (
        this.form.usage_limit !== null &&
        this.form.usage_limit !== "" &&
        this.form.usage_limit <= 0
      ) {
        return "Usage limit must be greater than 0.";
      }

      if (
        this.form.starts_at &&
        this.form.expires_at &&
        new Date(this.form.starts_at) > new Date(this.form.expires_at)
      ) {
        return "Start date cannot be after expiry date.";
      }

      return null;
    },

    async saveCoupon() {
      this.errorMessage = "";
      this.successMessage = "";

      const validationError = this.validateCoupon();

      if (validationError) {
        this.errorMessage = validationError;
        return;
      }

      this.saving = true;

      try {
        const payload = {
          code: this.form.code.trim().toUpperCase(),
          discount_type: this.form.discount_type,
          discount_value: this.form.discount_value,
          usage_limit: this.form.usage_limit || null,
          starts_at: this.form.starts_at
            ? new Date(this.form.starts_at).toISOString()
            : null,
          expires_at: this.form.expires_at
            ? new Date(this.form.expires_at).toISOString()
            : null,
          is_active: this.form.is_active,
        };

        if (this.editingId) {
          const { error } = await this.$supabase
            .from("merch_discount_codes")
            .update(payload)
            .eq("id", this.editingId);

          if (error) throw error;

          this.successMessage = "Coupon updated successfully.";
        } else {
          const { error } = await this.$supabase
            .from("merch_discount_codes")
            .insert(payload);

          if (error) throw error;

          this.successMessage = "Coupon created successfully.";
        }

        await this.getCoupons();
        this.resetForm(false);

        setTimeout(() => {
          this.successMessage = "";
        }, 1800);
      } catch (error) {
        this.errorMessage = error.message || "Failed to save coupon.";
      } finally {
        this.saving = false;
      }
    },

    editCoupon(coupon) {
      this.editingId = coupon.id;

      this.form = {
        code: coupon.code || "",
        discount_type: coupon.discount_type || "percentage",
        discount_value: coupon.discount_value || 0,
        usage_limit: coupon.usage_limit || null,
        starts_at: this.toDateTimeLocal(coupon.starts_at),
        expires_at: this.toDateTimeLocal(coupon.expires_at),
        is_active: coupon.is_active,
      };

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    async toggleCoupon(coupon) {
      const { error } = await this.$supabase
        .from("merch_discount_codes")
        .update({ is_active: !coupon.is_active })
        .eq("id", coupon.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      coupon.is_active = !coupon.is_active;
    },

    async deleteCoupon(coupon) {
      const confirmDelete = confirm(
        `Are you sure you want to delete coupon "${coupon.code}"?`,
      );

      if (!confirmDelete) return;

      const { error } = await this.$supabase
        .from("merch_discount_codes")
        .delete()
        .eq("id", coupon.id);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      this.coupons = this.coupons.filter((item) => item.id !== coupon.id);
    },

    resetForm(clearMessage = true) {
      this.editingId = null;

      this.form = {
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        usage_limit: null,
        starts_at: "",
        expires_at: "",
        is_active: true,
      };

      if (clearMessage) {
        this.errorMessage = "";
        this.successMessage = "";
      }
    },

    isExpired(coupon) {
      if (!coupon.expires_at) return false;

      return new Date(coupon.expires_at) < new Date();
    },

    getCouponStatus(coupon) {
      if (this.isExpired(coupon)) return "Expired";
      if (!coupon.is_active) return "Inactive";
      return "Active";
    },

    formatDiscount(coupon) {
      if (coupon.discount_type === "percentage") {
        return `${coupon.discount_value}% Off`;
      }

      return `GH₵ ${this.formatMoney(coupon.discount_value)} Off`;
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },

    formatDate(date) {
      if (!date) return "N/A";

      return new Date(date).toLocaleDateString("en-GH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    toDateTimeLocal(date) {
      if (!date) return "";

      const parsed = new Date(date);
      parsed.setMinutes(parsed.getMinutes() - parsed.getTimezoneOffset());

      return parsed.toISOString().slice(0, 16);
    },
  },
};

definePageMeta({
  layout: "admin-layout",
});
</script>

<style scoped lang="scss">
.coupons-page {
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
  margin-bottom: 24px;
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
    font-size: 32px;
    color: #111;
    letter-spacing: -1px;
  }
}

.layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  align-items: start;
}

.form-card,
.list-card {
  background: white;
  border-radius: 30px;
  padding: 28px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.card-title,
.list-head {
  margin-bottom: 24px;

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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 18px;

  label {
    font-size: 13px;
    font-weight: 900;
    color: #333;

    span {
      color: #9b753f;
    }
  }

  input,
  select {
    width: 100%;
    border: 1px solid #ded8cf;
    border-radius: 17px;
    padding: 15px 16px;
    font-size: 15px;
    outline: none;
    background: #fbfaf8;
    transition: 0.25s ease;

    &:focus {
      border-color: #111;
      background: white;
      box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
    }
  }
}

.toggle-btn {
  width: fit-content;
  border: none;
  padding: 14px 18px;
  border-radius: 16px;
  background: #f3eee6;
  color: #111;
  font-weight: 900;
  cursor: pointer;

  &.active {
    background: #111;
    color: white;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;

  button {
    border: none;
    padding: 15px 18px;
    border-radius: 16px;
    font-weight: 900;
    cursor: pointer;
  }

  .cancel {
    background: #f3eee6;
    color: #111;
  }

  .submit {
    background: #111;
    color: white;

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }
}

.message {
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 800;
  margin-bottom: 14px;

  &.error {
    background: #ffe8e8;
    color: #b00020;
  }

  &.success {
    background: #e7f8ec;
    color: #0f7a35;
  }
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tools {
  display: flex;
  gap: 10px;

  input,
  select {
    border: 1px solid #ded8cf;
    border-radius: 16px;
    padding: 14px 15px;
    outline: none;
    background: #fbfaf8;
  }

  input {
    width: 210px;
  }
}

.loading,
.empty {
  text-align: center;
  padding: 50px;
  background: #fbfaf8;
  border-radius: 24px;

  h3 {
    margin: 0;
  }

  p {
    color: #777;
  }
}

.coupon-list {
  display: grid;
  gap: 14px;
}

.coupon-item {
  display: grid;
  grid-template-columns: 180px 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 18px;
  border-radius: 24px;
  background: #fbfaf8;
  border: 1px solid #eee4d7;
}

.coupon-code {
  span {
    display: block;
    font-size: 22px;
    font-weight: 950;
    letter-spacing: -0.7px;
    color: #111;
  }

  b {
    display: inline-block;
    margin-top: 9px;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    background: #eeeeee;
    color: #555;

    &.active {
      background: #e7f8ec;
      color: #0f7a35;
    }

    &.expired {
      background: #ffe8e8;
      color: #b00020;
    }
  }
}

.coupon-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  div {
    background: white;
    border-radius: 17px;
    padding: 13px;
  }

  span {
    display: block;
    font-size: 12px;
    color: #777;
    font-weight: 900;
  }

  b {
    display: block;
    margin-top: 5px;
    color: #111;
  }
}

.coupon-actions {
  display: flex;
  gap: 8px;

  button {
    border: none;
    padding: 12px 13px;
    border-radius: 14px;
    font-weight: 900;
    cursor: pointer;
  }

  .edit {
    background: #111;
    color: white;
  }

  .status {
    background: #f3eee6;
    color: #111;
  }

  .delete {
    background: #ffe8e8;
    color: #b00020;
  }
}

@media (max-width: 1200px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .coupon-item {
    grid-template-columns: 1fr;
  }

  .coupon-info {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .stats,
  .coupon-info {
    grid-template-columns: 1fr;
  }

  .list-head,
  .tools,
  .form-actions,
  .coupon-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .tools input,
  .tools select {
    width: 100%;
  }
}
</style>
