<template>
  <teleport to="body">
    <!-- Maintenance: covers the storefront when the admin turns it on.
         Admin/staff and /admin routes are never blocked. -->
    <div v-if="showMaintenance" class="sg-maintenance">
      <div class="sg-box">
        <img src="/logo.png" alt="CampDawn Merch" />
        <h1>We'll be right back</h1>
        <p>
          {{ b.tradingName }} is temporarily closed for maintenance. Please check
          back soon.
        </p>
        <a :href="b.whatsappHref" target="_blank" rel="noopener">Contact us</a>
      </div>
    </div>

    <!-- Store notice: shown once per browser session on the storefront. -->
    <transition name="sg-fade">
      <div
        v-if="showNotice"
        class="sg-overlay"
        @click.self="dismissNotice"
      >
        <div class="sg-modal">
          <button
            type="button"
            class="sg-close"
            aria-label="Close"
            @click="dismissNotice"
          >
            &times;
          </button>

          <div class="sg-badge">Store Notice</div>
          <p class="sg-text">{{ settings.announcement_text }}</p>

          <button type="button" class="sg-ok" @click="dismissNotice">
            Got it
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
const NOTICE_KEY = "campdawn_notice_seen";
const STAFF_ROLES = ["admin", "staff", "super_admin"];

export default {
  name: "StoreGate",

  data() {
    return {
      b: useBusiness(),
      settings: null,
      isStaff: false,
      noticeDismissed: false,
    };
  },

  computed: {
    isAdminRoute() {
      return this.$route.path.startsWith("/admin");
    },

    showMaintenance() {
      return (
        !!this.settings?.is_maintenance_mode &&
        !this.isAdminRoute &&
        !this.isStaff
      );
    },

    showNotice() {
      return (
        !!this.settings?.announcement_text &&
        !this.isAdminRoute &&
        !this.showMaintenance &&
        !this.noticeDismissed
      );
    },
  },

  async mounted() {
    await this.loadSettings();
    await this.loadRole();
  },

  methods: {
    async loadSettings() {
      const { data } = await this.$supabase
        .from("merch_store_settings")
        .select("announcement_text, is_maintenance_mode")
        .limit(1)
        .maybeSingle();

      this.settings = data || null;

      // A notice the visitor already dismissed this session stays hidden,
      // but a changed notice shows again (the stored value is its hash).
      if (this.settings?.announcement_text) {
        const seen = sessionStorage.getItem(NOTICE_KEY);
        if (seen && seen === this.hash(this.settings.announcement_text)) {
          this.noticeDismissed = true;
        }
      }
    },

    async loadRole() {
      const {
        data: { user },
      } = await this.$supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await this.$supabase
        .from("profiles")
        .select("app_role")
        .eq("id", user.id)
        .maybeSingle();

      this.isStaff = STAFF_ROLES.includes(profile?.app_role);
    },

    dismissNotice() {
      this.noticeDismissed = true;
      if (this.settings?.announcement_text) {
        sessionStorage.setItem(
          NOTICE_KEY,
          this.hash(this.settings.announcement_text),
        );
      }
    },

    hash(str) {
      let h = 0;
      for (let i = 0; i < str.length; i += 1) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
      }
      return String(h);
    },
  },
};
</script>

<style scoped lang="scss">
.sg-maintenance {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #131515;
  color: white;
  display: grid;
  place-items: center;
  padding: 24px;
  text-align: center;

  .sg-box {
    max-width: 460px;

    img {
      width: 96px;
      height: 96px;
      object-fit: contain;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0 0 14px;
      font-size: clamp(28px, 6vw, 44px);
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }

    p {
      margin: 0 0 26px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.6;
      font-size: 16px;
    }

    a {
      display: inline-block;
      background: #ffbf38;
      color: #131515;
      text-decoration: none;
      font-weight: 800;
      padding: 14px 26px;
      border-radius: 999px;
    }
  }
}

.sg-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  padding: 20px;
}

.sg-modal {
  position: relative;
  width: min(440px, 100%);
  background: rgba(19, 21, 21, 0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  color: #f0f0ec;
  border-radius: 24px;
  padding: 34px 28px 28px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 40px 100px rgba(0, 0, 0, 0.6);
  text-align: center;

  .sg-close {
    position: absolute;
    top: 14px;
    right: 16px;
    border: none;
    background: transparent;
    font-size: 28px;
    line-height: 1;
    color: rgba(240, 240, 236, 0.5);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #f0f0ec;
    }
  }

  .sg-badge {
    display: inline-block;
    background: rgba(255, 191, 56, 0.12);
    color: #ffbf38;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 7px 14px;
    border-radius: 999px;
    margin-bottom: 18px;
  }

  .sg-text {
    margin: 0 0 24px;
    font-size: 17px;
    line-height: 1.6;
    color: rgba(240, 240, 236, 0.72);
  }

  .sg-ok {
    border: none;
    background: #ffbf38;
    color: #131515;
    font-weight: 800;
    padding: 14px 30px;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 14px 34px -14px rgba(255, 191, 56, 0.7);
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

.sg-fade-enter-active,
.sg-fade-leave-active {
  transition: opacity 0.25s ease;
}

.sg-fade-enter-from,
.sg-fade-leave-to {
  opacity: 0;
}
</style>
