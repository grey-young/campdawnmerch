<template>
  <main>
    <div class="image">
      <img src="/shirt.jpg" alt="campdawn merch login page image" />
      <div class="imageOverlay">
        <h2>CampDawn Merch</h2>
        <p>Admin control room</p>
      </div>
    </div>

    <form @submit.prevent="loginAdmin">
      <div class="container">
        <p class="tag">MERCH ADMIN</p>
        <h1>Admin Login</h1>

        <input
          v-model="username"
          type="text"
          placeholder="Username or Email"
          autocomplete="username"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
          autocomplete="current-password"
        />

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <button type="submit" :disabled="loading">
          {{ loading ? "Checking..." : "Login" }}
        </button>
      </div>
    </form>
  </main>
</template>

<script>
export default {
  name: "AdminLoginPage",

  data() {
    return {
      username: "",
      password: "",
      loading: false,
      errorMessage: "",
    };
  },

  mounted() {
    this.$gsap.to(
      [
        ".imageOverlay h2",
        ".imageOverlay p",
        ".container .tag",
        ".container h1",
        ".container input",
        ".container button",
      ],
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
      },
    );
  },

  methods: {
    async loginAdmin() {
      this.errorMessage = "";

      if (!this.username || !this.password) {
        this.errorMessage = "Please enter your username/email and password.";
        return;
      }

      this.loading = true;

      try {
        let email = this.username.trim();

        if (!email.includes("@")) {
          const { data: profile, error: profileError } = await this.$supabase
            .from("profiles")
            .select("email")
            .eq("username", this.username.trim())
            .single();

          if (profileError || !profile?.email) {
            this.errorMessage = "Admin account not found.";
            this.loading = false;
            return;
          }

          email = profile.email;
        }

        const { data, error } = await this.$supabase.auth.signInWithPassword({
          email,
          password: this.password,
        });

        if (error) {
          this.errorMessage = error.message;
          this.loading = false;
          return;
        }

        const user = data.user;

        const { data: adminProfile, error: roleError } = await this.$supabase
          .from("profiles")
          .select("app_role")
          .eq("id", user.id)
          .single();

        if (roleError || !adminProfile) {
          await this.$supabase.auth.signOut();
          this.errorMessage = "Could not verify admin access.";
          this.loading = false;
          return;
        }

        const allowedRoles = ["admin", "staff", "super_admin"];

        if (!allowedRoles.includes(adminProfile.app_role)) {
          await this.$supabase.auth.signOut();
          this.errorMessage = "You do not have permission to access admin.";
          this.loading = false;
          return;
        }

        this.$router.push("/admin/dashboard");
      } catch (err) {
        this.errorMessage = "Something went wrong. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
main {
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: #f7f4ef;

  .image {
    position: relative;
    height: 100vh;
    width: 100%;
    overflow: hidden;

    img {
      height: 100%;
      width: 100%;
      object-fit: cover;
      transform: scale(1.03);
    }

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        120deg,
        rgba(0, 0, 0, 0.65),
        rgba(0, 0, 0, 0.2)
      );
    }

    .imageOverlay {
      position: absolute;
      left: 50px;
      bottom: 50px;
      z-index: 2;
      color: white;

      h2,
      p {
        opacity: 0;
        transform: translateY(30px);
      }

      h2 {
        font-size: clamp(38px, 5vw, 78px);
        line-height: 0.95;
        margin: 0;
        letter-spacing: -3px;
      }

      p {
        margin-top: 14px;
        font-size: 15px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  form {
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .container {
      width: min(430px, 86%);
      background: rgba(255, 255, 255, 0.78);
      backdrop-filter: blur(18px);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 18px;
      border-radius: 28px;
      padding: 48px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.7);

      .tag,
      h1,
      input,
      button {
        opacity: 0;
        transform: translateY(30px);
      }
    }

    input {
      width: 100%;
      padding: 16px 18px;
      font-size: 15px;
      border-radius: 16px;
      border: 1px solid #ded8cf;
      background: #fff;
      outline: none;
      transition: 0.25s ease;

      &:focus {
        border-color: #111;
        box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.06);
      }
    }

    .error {
      width: 100%;
      padding: 13px 15px;
      border-radius: 14px;
      background: #ffe8e8;
      color: #b00020;
      font-size: 14px;
      margin: 0;
    }

    button {
      width: 100%;
      padding: 16px 22px;
      font-size: 15px;
      font-weight: 700;
      color: white;
      background: #111;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      transition: 0.25s ease;

      &:hover {
        transform: translateY(-2px);
        background: #2b2b2b;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }
  }
}

@media (max-width: 850px) {
  main {
    grid-template-columns: 1fr;

    .image {
      display: none;
    }

    form {
      min-height: 100vh;
      padding: 24px;

      .container {
        width: 100%;
        padding: 34px 24px;
      }
    }
  }
}
</style>
