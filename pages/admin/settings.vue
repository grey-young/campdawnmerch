<template>
  <section class="settings-page">
    <div class="page-head" ref="pageHead">
      <div>
        <p class="eyebrow">STORE CONTROL</p>
        <h1>Settings</h1>
        <span
          >Manage your merch store details, delivery and payment settings.</span
        >
      </div>
    </div>

    <div v-if="loading" class="loading">Loading settings...</div>

    <form v-else class="settings-form" @submit.prevent="saveSettings">
      <div class="form-card" ref="card">
        <div class="card-title">
          <h2>Store Information</h2>
          <p>Main details customers may see around the shop.</p>
        </div>

        <div class="grid">
          <div class="form-group">
            <label>Store Name</label>
            <input v-model="form.store_name" type="text" />
          </div>

          <div class="form-group">
            <label>Currency</label>
            <select v-model="form.currency">
              <option value="GHS">GHS</option>
              <option value="USD">USD</option>
              <option value="NGN">NGN</option>
            </select>
          </div>

          <div class="form-group">
            <label>Store Email</label>
            <input v-model="form.store_email" type="email" />
          </div>

          <div class="form-group">
            <label>Store Phone</label>
            <input v-model="form.store_phone" type="text" />
          </div>

          <div class="form-group full">
            <label>Store Location</label>
            <input v-model="form.store_location" type="text" />
          </div>
        </div>
      </div>

      <div class="form-card" ref="card">
        <div class="card-title">
          <h2>Delivery Settings</h2>
          <p>Control delivery charges and free delivery threshold.</p>
        </div>

        <div class="grid">
          <div class="form-group">
            <label>Delivery Fee</label>
            <input v-model.number="form.delivery_fee" type="number" min="0" />
          </div>

          <div class="form-group">
            <label>Free Delivery Threshold</label>
            <input
              v-model.number="form.free_delivery_threshold"
              type="number"
              min="0"
            />
          </div>
        </div>
      </div>

      <div class="form-card" ref="card">
        <div class="card-title">
          <h2>Payment Settings</h2>
          <p>Enable or disable payment methods.</p>
        </div>

        <div class="switches">
          <button
            type="button"
            class="switch-card"
            :class="{ active: form.paystack_enabled }"
            @click="form.paystack_enabled = !form.paystack_enabled"
          >
            <span>Paystack</span>
            <b>{{ form.paystack_enabled ? "Enabled" : "Disabled" }}</b>
          </button>

          <button
            type="button"
            class="switch-card"
            :class="{ active: form.pay_on_delivery_enabled }"
            @click="
              form.pay_on_delivery_enabled = !form.pay_on_delivery_enabled
            "
          >
            <span>Pay on Delivery</span>
            <b>{{ form.pay_on_delivery_enabled ? "Enabled" : "Disabled" }}</b>
          </button>
        </div>
      </div>

      <div class="form-card" ref="card">
        <div class="card-title">
          <h2>Store Notice</h2>
          <p>Show a short announcement on the shop.</p>
        </div>

        <div class="form-group full">
          <label>Announcement Text</label>
          <textarea
            v-model="form.announcement_text"
            placeholder="Example: Free delivery in Accra this weekend."
          ></textarea>
        </div>

        <div class="maintenance">
          <div>
            <h3>Maintenance Mode</h3>
            <p>
              Turn this on when you want to temporarily pause the storefront.
            </p>
          </div>

          <button
            type="button"
            class="toggle"
            :class="{ active: form.is_maintenance_mode }"
            @click="form.is_maintenance_mode = !form.is_maintenance_mode"
          >
            {{ form.is_maintenance_mode ? "On" : "Off" }}
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>

      <div class="actions" ref="actions">
        <button type="submit" :disabled="saving">
          {{ saving ? "Saving Settings..." : "Save Settings" }}
        </button>
      </div>
    </form>
  </section>
</template>

<script>
export default {
  name: "AdminSettingsPage",

  data() {
    return {
      loading: true,
      saving: false,
      settingsId: null,
      errorMessage: "",
      successMessage: "",

      form: {
        store_name: "CampDawn Merch",
        store_email: "",
        store_phone: "",
        store_location: "",
        currency: "GHS",
        delivery_fee: 0,
        free_delivery_threshold: 0,
        pay_on_delivery_enabled: false,
        paystack_enabled: true,
        announcement_text: "",
        is_maintenance_mode: false,
      },
    };
  },

  async mounted() {
    await this.getSettings();

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

      this.$gsap.from(this.$refs.actions, {
        y: 20,
        opacity: 0,
        duration: 0.55,
        delay: 0.35,
        ease: "power3.out",
      });
    },

    async getSettings() {
      this.loading = true;
      this.errorMessage = "";

      const { data, error } = await this.$supabase
        .from("merch_store_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        this.errorMessage = error.message;
        this.loading = false;
        return;
      }

      this.settingsId = data.id;

      this.form = {
        store_name: data.store_name || "CampDawn Merch",
        store_email: data.store_email || "",
        store_phone: data.store_phone || "",
        store_location: data.store_location || "",
        currency: data.currency || "GHS",
        delivery_fee: data.delivery_fee || 0,
        free_delivery_threshold: data.free_delivery_threshold || 0,
        pay_on_delivery_enabled: data.pay_on_delivery_enabled,
        paystack_enabled: data.paystack_enabled,
        announcement_text: data.announcement_text || "",
        is_maintenance_mode: data.is_maintenance_mode,
      };

      this.loading = false;
    },

    async saveSettings() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.form.store_name) {
        this.errorMessage = "Store name is required.";
        return;
      }

      this.saving = true;

      try {
        const payload = {
          store_name: this.form.store_name.trim(),
          store_email: this.form.store_email || null,
          store_phone: this.form.store_phone || null,
          store_location: this.form.store_location || null,
          currency: this.form.currency,
          delivery_fee: this.form.delivery_fee || 0,
          free_delivery_threshold: this.form.free_delivery_threshold || 0,
          pay_on_delivery_enabled: this.form.pay_on_delivery_enabled,
          paystack_enabled: this.form.paystack_enabled,
          announcement_text: this.form.announcement_text || null,
          is_maintenance_mode: this.form.is_maintenance_mode,
        };

        const { error } = await this.$supabase
          .from("merch_store_settings")
          .update(payload)
          .eq("id", this.settingsId);

        if (error) throw error;

        this.successMessage = "Settings saved successfully.";

        if (this.$gsap) {
          this.$gsap.fromTo(
            ".success",
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
          );
        }

        setTimeout(() => {
          this.successMessage = "";
        }, 1800);
      } catch (error) {
        this.errorMessage = error.message || "Failed to save settings.";

        if (this.$gsap) {
          this.$gsap.fromTo(
            ".error",
            { x: -10, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
          );
        }
      } finally {
        this.saving = false;
      }
    },
  },
};

definePageMeta({
  layout: "admin-layout",
});
</script>

<style scoped lang="scss">
.settings-page {
  width: 100%;
}

.page-head {
  margin-bottom: 28px;

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

.loading {
  background: white;
  border-radius: 30px;
  padding: 50px;
  text-align: center;
  font-weight: 900;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.settings-form {
  display: grid;
  gap: 22px;
}

.form-card {
  background: white;
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.06);
}

.card-title {
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

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;

  &.full {
    grid-column: 1 / -1;
  }

  label {
    font-size: 13px;
    font-weight: 900;
    color: #333;
  }

  input,
  select,
  textarea {
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

  textarea {
    min-height: 130px;
    resize: vertical;
  }
}

.switches {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.switch-card {
  border: 1px solid #eee4d7;
  background: #fbfaf8;
  border-radius: 24px;
  padding: 22px;
  text-align: left;
  cursor: pointer;
  transition: 0.25s ease;

  span {
    display: block;
    font-size: 15px;
    color: #777;
    font-weight: 900;
  }

  b {
    display: block;
    margin-top: 10px;
    font-size: 24px;
    color: #111;
  }

  &.active {
    background: #111;
    border-color: #111;

    span {
      color: #f4d28b;
    }

    b {
      color: white;
    }
  }
}

.maintenance {
  margin-top: 22px;
  padding: 20px;
  border-radius: 24px;
  background: #fbfaf8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  h3 {
    margin: 0;
    font-size: 20px;
  }

  p {
    margin: 6px 0 0;
    color: #777;
  }
}

.toggle {
  border: none;
  min-width: 90px;
  padding: 14px 18px;
  border-radius: 999px;
  background: #f3eee6;
  color: #111;
  font-weight: 900;
  cursor: pointer;

  &.active {
    background: #ffe8e8;
    color: #b00020;
  }
}

.message {
  padding: 16px 18px;
  border-radius: 17px;
  font-weight: 900;

  &.error {
    background: #ffe8e8;
    color: #b00020;
  }

  &.success {
    background: #e7f8ec;
    color: #0f7a35;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 30px;

  button {
    border: none;
    background: #111;
    color: white;
    padding: 16px 24px;
    border-radius: 17px;
    font-weight: 900;
    cursor: pointer;

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }
}

@media (max-width: 780px) {
  .grid,
  .switches {
    grid-template-columns: 1fr;
  }

  .maintenance {
    flex-direction: column;
    align-items: flex-start;
  }

  .toggle,
  .actions button {
    width: 100%;
  }
}
</style>
