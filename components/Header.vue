<template>
  <header>
    <nav>
      <nuxt-link to="/" class="logo-link">
        <img src="/logo.png" alt="campdawn merch logo" id="logo" />
      </nuxt-link>

      <ul class="main-nav">
        <li><nuxt-link to="/products">Shop</nuxt-link></li>
        <li><nuxt-link to="/about">About</nuxt-link></li>
        <li><nuxt-link to="/contact">Contact</nuxt-link></li>
      </ul>

      <ul class="nav-link">
        <li>
          <nuxt-link to="/cart" class="cart-link">
            <i class="bi bi-bag"></i>
            <span v-if="cartCount > 0" class="cart-badge">
              {{ cartCount > 99 ? "99+" : cartCount }}
            </span>
          </nuxt-link>
        </li>

        <li v-if="!user">
          <nuxt-link to="/login">
            <button class="login-btn">Login</button>
          </nuxt-link>
        </li>

        <li v-if="!user">
          <nuxt-link to="/signup">
            <button class="nav-btn">Sign Up</button>
          </nuxt-link>
        </li>

        <li v-else class="profile-menu" ref="profileMenu">
          <button class="profile-btn" @click="toggleProfileMenu">
            <span>{{ initials }}</span>
          </button>

          <div v-if="isProfileOpen" class="dropdown">
            <div class="user-info">
              <strong>{{ profile?.username || "Customer" }}</strong>
              <small>{{ user.email }}</small>
            </div>
            <nuxt-link to="/account">Profile</nuxt-link>
            <button @click="logout">Logout</button>
          </div>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",

  data() {
    return {
      user: null,
      profile: null,
      isProfileOpen: false,
      cartCount: 0,
    };
  },

  computed: {
    initials() {
      const name = this.profile?.username || this.user?.email || "U";
      return name.slice(0, 2).toUpperCase();
    },
  },

  async mounted() {
    await this.getUser();
    await this.refreshCartCount();
    document.addEventListener("click", this.handleOutsideClick);
    window.addEventListener("cart:updated", this.refreshCartCount);
    this.$nextTick(() => {
      if (this.$gsap) {
        this.$gsap.from("header nav > *", {
          duration: 0.8,
          y: -25,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.12,
        });
      }
    });
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    window.removeEventListener("cart:updated", this.refreshCartCount);
  },

  methods: {
    async getUser() {
      const {
        data: { user },
      } = await this.$supabase.auth.getUser();
      this.user = user || null;

      if (this.user) {
        const { data } = await this.$supabase
          .from("profiles")
          .select("username, email, app_role")
          .eq("id", this.user.id)
          .maybeSingle();
        this.profile = data || null;
      }
    },

    async refreshCartCount() {
      const {
        data: { user },
      } = await this.$supabase.auth.getUser();

      if (!user) {
        this.cartCount = useGuestCart().count();
        return;
      }

      const { data: cart } = await this.$supabase
        .from("merch_carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cart) {
        this.cartCount = 0;
        return;
      }

      const { data } = await this.$supabase
        .from("merch_cart_items")
        .select("quantity")
        .eq("cart_id", cart.id);

      this.cartCount = (data || []).reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      );
    },

    toggleProfileMenu() {
      this.isProfileOpen = !this.isProfileOpen;
    },

    handleOutsideClick(event) {
      if (
        this.$refs.profileMenu &&
        !this.$refs.profileMenu.contains(event.target)
      ) {
        this.isProfileOpen = false;
      }
    },

    async logout() {
      await this.$supabase.auth.signOut();
      this.user = null;
      this.profile = null;
      this.isProfileOpen = false;
      await this.refreshCartCount();
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped lang="scss">
header {
  height: 10vh;
  min-height: 56px; // prevents header from collapsing too small on short viewports
  max-height: 80px; // caps it on very tall viewports
  width: 100%;
  background: white;
  position: relative;
  z-index: 20;

  nav {
    height: 100%;
    width: 90%;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .logo-link {
      height: 60%;
      display: flex;
      align-items: center;
      flex-shrink: 0; // logo never squishes
    }

    #logo {
      height: 100%;
      width: auto;
    }

    .main-nav {
      display: flex;
      align-items: center;
      gap: 30px;
      list-style: none;
      margin: 0;
      padding: 0;

      li a {
        color: #111;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        position: relative;
        transition: color 0.2s ease;

        &::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -6px;
          height: 2px;
          width: 0;
          background: #111;
          transition: width 0.25s ease;
        }

        &:hover::after,
        &.router-link-active::after {
          width: 100%;
        }
      }
    }

    .nav-link {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 18px;
      list-style: none;
      margin: 0;
      padding: 0;
      flex-shrink: 0;

      li {
        position: relative;

        a {
          color: black;
          text-decoration: none;

          i {
            font-size: 1.5rem;
            display: block; // removes inline baseline gap
          }
        }

        .cart-link {
          position: relative;
          display: block;
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -10px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: #111;
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          line-height: 18px;
          text-align: center;
        }

        button {
          border: none;
          cursor: pointer;
          font-weight: bold;
        }

        .login-btn {
          background: transparent;
          color: #111;
          font-size: 1rem;
          padding: 0.9rem 1.1rem;
        }

        .nav-btn {
          background-color: black;
          padding: 0.9rem 1.6rem;
          color: white;
          font-size: 1rem;
          border-radius: 100px;
          white-space: nowrap;
          transition: all 0.3s ease;

          &:hover {
            scale: 1.05;
          }
        }
      }
    }
  }
}

.profile-menu {
  position: relative;
}

.profile-btn {
  height: 42px;
  width: 42px;
  border-radius: 50%;
  background: #111;
  color: white;
  display: grid;
  place-items: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.dropdown {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  width: 230px;
  background: white;
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.12);
  border: 1px solid #eee;
  display: grid;
  gap: 6px;
  // keeps dropdown inside viewport on small screens
  max-width: calc(100vw - 24px);

  .user-info {
    padding: 10px 10px 14px;
    border-bottom: 1px solid #eee;
    margin-bottom: 6px;

    strong {
      display: block;
      font-size: 0.95rem;
      color: #111;
    }

    small {
      display: block;
      margin-top: 4px;
      color: #777;
      font-size: 0.75rem;
      word-break: break-all;
    }
  }

  a,
  button {
    width: 100%;
    text-align: left;
    text-decoration: none;
    background: transparent;
    color: #111;
    padding: 11px 10px;
    border-radius: 12px;
    font-size: 0.9rem;
    transition: 0.2s ease;
    border: none;
    cursor: pointer;
    font-weight: normal;

    &:hover {
      background: #f4f1ec;
    }
  }

  button {
    color: #b00020;
  }
}

// ── Tablet ────────────────────────────────────────────────────
@media (max-width: 820px) {
  header nav .main-nav {
    gap: 20px;

    li a {
      font-size: 0.88rem;
    }
  }
}

@media (max-width: 700px) {
  header nav {
    width: 95%;

    .main-nav {
      display: none; // full navigation remains available in the footer
    }

    .nav-link {
      gap: 10px;

      li .login-btn {
        display: none; // "Login" hidden; icon + Sign Up is enough at this width
      }

      li .nav-btn {
        padding: 0.75rem 1.1rem;
        font-size: 0.9rem;
      }
    }
  }
}

// ── Mobile ────────────────────────────────────────────────────
@media (max-width: 480px) {
  header {
    min-height: 52px;

    nav {
      width: 92%;

      .logo-link {
        height: 55%;
      }

      .nav-link {
        gap: 8px;

        li .nav-btn {
          padding: 0.65rem 0.9rem;
          font-size: 0.8rem;
        }

        li a i {
          font-size: 1.3rem;
        }
      }
    }
  }

  // dropdown anchors to right edge of screen on very small phones
  .dropdown {
    right: -8px;
  }
}
</style>
