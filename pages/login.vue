<template>
  <main class="login-page">
    <section class="login-layout">
      <div class="image-side" ref="imageSide">
        <img src="/shirt.jpg" alt="CampDawn merch" />

        <div class="overlay"></div>

        <div class="image-text">
          <p>CAMPDAWN MERCH</p>
          <h1>Welcome back.</h1>
          <span>Pick up where you left your cart.</span>
        </div>
      </div>

      <div class="form-side">
        <div class="form-wrap">
          <div class="brand animate-item">
            <img src="/logo.png" alt="CampDawn logo" />
            <p>CampDawn Merch</p>
          </div>

          <div class="head">
            <p class="animate-item">SIGN IN</p>
            <h1 class="animate-item">Login</h1>
            <span class="animate-item">
              Enter your details to continue shopping.
            </span>
          </div>

          <form @submit.prevent="login">
            <div class="form-group animate-item">
              <label>Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="you@email.com"
              />
            </div>

            <div class="form-group animate-item">
              <label>Password</label>
              <input v-model="form.password" type="password" />
            </div>

            <p v-if="errorMessage" class="message error animate-item">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="message success animate-item">
              {{ successMessage }}
            </p>

            <button type="submit" :disabled="loading" class="animate-item">
              {{ loading ? "Signing in..." : "Sign in" }}
            </button>
          </form>

          <div class="bottom animate-item">
            <span>Don’t have an account?</span>
            <nuxt-link :to="signupLink">Create one</nuxt-link>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  name: "LoginPage",

  data() {
    return {
      loading: false,
      errorMessage: "",
      successMessage: "",

      form: {
        email: "",
        password: "",
      },
    };
  },

  computed: {
    signupLink() {
      const redirect = this.$route.query.redirect;
      return redirect
        ? `/signup?redirect=${encodeURIComponent(redirect)}`
        : "/signup";
    },
  },

  mounted() {
    this.runAnimations();
  },

  methods: {
    runAnimations() {
      if (!this.$gsap) return;

      this.$gsap.to(this.$refs.imageSide, {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
      });

      this.$gsap.to(".image-text > *", {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 0.9,
        delay: 0.3,
        ease: "power3.out",
      });

      this.$gsap.to(".animate-item", {
        y: 0,
        opacity: 1,
        stagger: 0.09,
        duration: 0.7,
        delay: 0.35,
        ease: "power3.out",
      });
    },

    validateForm() {
      if (!this.form.email.trim()) return "Email is required.";
      if (!this.form.password) return "Password is required.";
      return null;
    },

    async login() {
      this.errorMessage = "";
      this.successMessage = "";

      const validationError = this.validateForm();

      if (validationError) {
        this.errorMessage = validationError;
        return;
      }

      this.loading = true;

      try {
        const { error } = await this.$supabase.auth.signInWithPassword({
          email: this.form.email.trim(),
          password: this.form.password,
        });

        if (error) throw error;

        this.successMessage = "Signed in successfully.";

        setTimeout(() => {
          this.$router.push(this.$route.query.redirect || "/products");
        }, 700);
      } catch (error) {
        this.errorMessage = error.message || "Login failed.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
}

.login-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.image-side {
  height: 100vh;
  position: sticky;
  top: 0;
  overflow: hidden;
  opacity: 0;
  transform: scale(1.08);

  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.72),
      rgba(0, 0, 0, 0.12)
    );
  }

  .image-text {
    position: absolute;
    left: 60px;
    bottom: 60px;
    z-index: 2;
    color: white;
    width: 70%;

    > * {
      opacity: 0;
      transform: translateY(40px);
    }

    p {
      margin: 0 0 12px;
      font-size: 12px;
      letter-spacing: 5px;
      font-weight: 900;
    }

    h1 {
      margin: 0;
      font-size: clamp(54px, 7vw, 92px);
      line-height: 0.9;
      letter-spacing: -4px;
    }

    span {
      display: block;
      margin-top: 18px;
      color: rgba(255, 255, 255, 0.82);
      font-size: 17px;
      line-height: 1.7;
    }
  }
}

.form-side {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
}

.form-wrap {
  width: 100%;
  max-width: 560px;
}

.animate-item {
  opacity: 0;
  transform: translateY(30px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 34px;

  img {
    height: 52px;
    width: 52px;
    object-fit: contain;
    background: #111;
    padding: 8px;
    border-radius: 14px;
  }

  p {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }
}

.head {
  margin-bottom: 34px;

  p {
    margin: 0 0 10px;
    font-size: 12px;
    letter-spacing: 5px;
    font-weight: 900;
    color: #9b753f;
  }

  h1 {
    margin: 0;
    font-size: clamp(50px, 6vw, 82px);
    line-height: 0.9;
    letter-spacing: -4px;
  }

  span {
    display: block;
    margin-top: 18px;
    color: #777;
    line-height: 1.7;
    font-size: 16px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 18px;

  label {
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #666;
  }

  input {
    width: 100%;
    border: 1px solid #ddd4c8;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 18px;
    padding: 17px 18px;
    outline: none;
    font-size: 15px;
    transition: 0.25s ease;

    &:focus {
      border-color: #111;
      background: white;
      transform: translateY(-1px);
    }
  }
}

.message {
  margin-top: 18px;
  padding: 15px 16px;
  border-radius: 18px;
  font-weight: 800;

  &.error {
    background: #ffe8e8;
    color: #b00020;
  }

  &.success {
    background: #e8f8ec;
    color: #0f7a35;
  }
}

button[type="submit"] {
  width: 100%;
  margin-top: 8px;
  border: none;
  background: #111;
  color: white;
  padding: 18px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    background: black;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.bottom {
  margin-top: 24px;
  display: flex;
  gap: 8px;
  justify-content: center;

  span {
    color: #777;
  }

  a {
    color: #111;
    font-weight: 900;
    text-decoration: none;
  }
}

@media (max-width: 980px) {
  .login-layout {
    grid-template-columns: 1fr;
  }

  .image-side {
    height: 320px;
    position: relative;

    .image-text {
      left: 30px;
      bottom: 30px;
      width: 85%;
    }
  }

  .form-side {
    padding: 40px 24px;
  }
}

@media (max-width: 640px) {
  .head h1 {
    font-size: 58px;
  }

  .image-side .image-text h1 {
    font-size: 54px;
  }
}
</style>
