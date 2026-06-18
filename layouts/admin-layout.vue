<template>
  <div class="admin-layout">
    <!-- Mobile top bar with hamburger (hidden on desktop) -->
    <header class="mobile-bar">
      <button
        class="hamburger"
        type="button"
        aria-label="Open menu"
        @click="sidebarOpen = true"
      >
        <i class="bi bi-list"></i>
      </button>

      <div class="mobile-brand">
        <img src="/logo.png" alt="CampDawn Merch Logo" />
        <span>{{ pageTitle }}</span>
      </div>
    </header>

    <!-- Backdrop shown behind the drawer on mobile -->
    <div
      v-if="sidebarOpen"
      class="backdrop"
      @click="sidebarOpen = false"
    ></div>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <button
        class="close-btn"
        type="button"
        aria-label="Close menu"
        @click="sidebarOpen = false"
      >
        <i class="bi bi-x-lg"></i>
      </button>

      <div class="brand">
        <img src="/logo.png" alt="CampDawn Merch Logo" />
        <div>
          <h3>CampDawn</h3>
          <p>Merch Admin</p>
        </div>
      </div>

      <nav class="nav">
        <nuxt-link to="/admin/dashboard">Dashboard</nuxt-link>
        <nuxt-link to="/admin/products">Products</nuxt-link>
        <nuxt-link to="/admin/categories">Categories</nuxt-link>
        <nuxt-link to="/admin/orders">Orders</nuxt-link>
        <nuxt-link to="/admin/customers">Customers</nuxt-link>
        <nuxt-link to="/admin/coupons">Coupons</nuxt-link>
        <nuxt-link to="/admin/settings">Settings</nuxt-link>
      </nav>

      <button class="logout" @click="logoutAdmin">Logout</button>
    </aside>

    <main class="main-content">
      <section class="page-body">
        <slot />
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: "AdminLayout",

  data() {
    return {
      adminEmail: "",
      allowedRoles: ["admin", "staff", "super_admin"],
      sidebarOpen: false,
    };
  },

  watch: {
    // Close the mobile drawer whenever the route changes.
    "$route.fullPath"() {
      this.sidebarOpen = false;
    },
  },

  computed: {
    pageTitle() {
      const current = this.$route.path.split("/").filter(Boolean).pop();

      if (!current) return "Dashboard";

      return current
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    },
  },

  async mounted() {
    await this.checkAdminAccess();
  },

  methods: {
    async checkAdminAccess() {
      const {
        data: { user },
        error: userError,
      } = await this.$supabase.auth.getUser();

      if (userError || !user) {
        this.$router.push("/admin");
        return;
      }

      this.adminEmail = user.email;

      const { data: profile, error: profileError } = await this.$supabase
        .from("profiles")
        .select("app_role")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !profile ||
        !this.allowedRoles.includes(profile.app_role)
      ) {
        await this.$supabase.auth.signOut();
        this.$router.push("/admin");
      }
    },

    async logoutAdmin() {
      await this.$supabase.auth.signOut();
      this.$router.push("/admin");
    },
  },
};
</script>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 290px 1fr;
  background: #f5f2ed;
}

// Mobile-only top bar with the hamburger toggle.
.mobile-bar {
  display: none;
}

.backdrop {
  display: none;
}

.close-btn {
  display: none;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  background: #050505;
  padding: 26px 20px;
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 50;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 42px;

  img {
    height: 62px;
    width: 62px;
    object-fit: contain;
    border-radius: 18px;
    background: #111;
    padding: 8px;
  }

  h3 {
    margin: 0;
    font-size: 19px;
    letter-spacing: -0.5px;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #aaa;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;

  a {
    text-decoration: none;
    color: #bdbdbd;
    padding: 15px 16px;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 600;
    transition: 0.25s ease;
    border: 1px solid transparent;

    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.08);
    }

    &.nuxt-link-active,
    &.router-link-active {
      color: #111;
      background: #f4d28b;
      border-color: rgba(255, 255, 255, 0.18);
      box-shadow: 0 12px 30px rgba(244, 210, 139, 0.18);
    }
  }
}

.logout {
  margin-top: auto;
  width: 100%;
  border: none;
  padding: 15px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;

  &:hover {
    background: #ff4d4d;
  }
}

.main-content {
  min-width: 0;
  padding: 28px;
  overflow-x: hidden;
  overflow-y: auto;
}

.topbar {
  min-height: 92px;
  background: white;
  border-radius: 26px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);

  h1 {
    margin: 0;
    font-size: 32px;
    letter-spacing: -1.3px;
    color: #111;
  }

  p {
    margin: 6px 0 0;
    color: #777;
    font-size: 14px;
  }
}

.admin-user {
  padding: 12px 16px;
  border-radius: 999px;
  background: #f5f2ed;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.page-body {
  min-height: calc(100vh - 146px);
}

@media (max-width: 900px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  // Top bar with hamburger replaces the always-on sidebar.
  .mobile-bar {
    display: flex;
    align-items: center;
    gap: 14px;
    position: sticky;
    top: 0;
    z-index: 40;
    background: #050505;
    color: white;
    padding: 12px 16px;

    .hamburger {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border: none;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 22px;
      cursor: pointer;
      display: grid;
      place-items: center;
    }

    .mobile-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;

      img {
        height: 32px;
        width: 32px;
        object-fit: contain;
        flex-shrink: 0;
      }

      span {
        font-weight: 700;
        font-size: 16px;
        text-transform: capitalize;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 60;
  }

  // Sidebar becomes an off-canvas drawer.
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    max-width: 84vw;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 70;
    overflow-y: auto;

    &.open {
      transform: translateX(0);
    }
  }

  .close-btn {
    display: grid;
    place-items: center;
    position: absolute;
    top: 16px;
    right: 16px;
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 18px;
    cursor: pointer;
  }

  .main-content {
    padding: 18px;
  }
}

@media (max-width: 520px) {
  .brand img {
    height: 52px;
    width: 52px;
  }
}
</style>
