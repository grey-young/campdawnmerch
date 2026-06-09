<template>
  <div class="admin-layout">
    <aside class="sidebar">
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
    };
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

  .sidebar {
    position: relative;
    height: auto;
  }

  .nav {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .main-content {
    padding: 18px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    h1 {
      font-size: 26px;
    }
  }
}

@media (max-width: 520px) {
  .nav {
    grid-template-columns: 1fr;
  }

  .brand img {
    height: 52px;
    width: 52px;
  }
}
</style>
