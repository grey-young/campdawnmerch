<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section brand">
        <img
          src="/logo.png"
          alt="CampDawn Merch Logo"
          class="footer-logo"
          loading="lazy"
          decoding="async"
        />
        <p class="desc">
          {{ b.tradingName }} sells branded gaming merchandise. We ship
          clothing, hoodies, t-shirts, caps, and accessories to customers across
          Ghana and worldwide.
        </p>
        <p class="legal-name">
          {{ b.legalName }}<br />
          {{ b.address.full }}
        </p>
      </div>

      <div class="footer-section links">
        <h4>Shop</h4>
        <ul>
          <li><nuxt-link to="/">Home</nuxt-link></li>
          <li><nuxt-link to="/products">Shop All</nuxt-link></li>
          <li><nuxt-link to="/about">About Us</nuxt-link></li>
          <li><nuxt-link to="/cart">Cart</nuxt-link></li>
          <li><nuxt-link to="/contact">Contact</nuxt-link></li>
        </ul>
      </div>

      <div class="footer-section links">
        <h4>Policies</h4>
        <ul>
          <li><nuxt-link to="/privacy-policy">Privacy Policy</nuxt-link></li>
          <li><nuxt-link to="/terms">Terms &amp; Conditions</nuxt-link></li>
          <li><nuxt-link to="/shipping-policy">Shipping &amp; Delivery</nuxt-link></li>
          <li><nuxt-link to="/refund-policy">Refund &amp; Returns</nuxt-link></li>
        </ul>
      </div>

      <div class="footer-section contact">
        <h4>Get in Touch</h4>
        <ul class="contact-list">
          <li>
            <i class="bi bi-envelope"></i>
            <a :href="b.emailHref">{{ b.email }}</a>
          </li>
          <li>
            <i class="bi bi-telephone"></i>
            <a :href="b.phoneHref">{{ b.phone }}</a>
          </li>
          <li>
            <i class="bi bi-geo-alt"></i>
            <span>{{ b.address.city }}, {{ b.address.country }}</span>
          </li>
        </ul>

        <div class="social-links">
          <a :href="b.socials.instagram" title="Instagram" target="_blank" rel="noopener">
            <i class="bi bi-instagram"></i>
          </a>
          <a :href="b.socials.twitter" title="X (Twitter)" target="_blank" rel="noopener">
            <i class="bi bi-twitter-x"></i>
          </a>
          <a :href="b.socials.tiktok" title="TikTok" target="_blank" rel="noopener">
            <i class="bi bi-tiktok"></i>
          </a>
          <a :href="b.emailHref" title="Email">
            <i class="bi bi-envelope"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ year }} {{ b.tradingName }}. All rights reserved.</p>
      <nav class="bottom-links" aria-label="Legal">
        <nuxt-link to="/privacy-policy">Privacy</nuxt-link>
        <nuxt-link to="/terms">Terms</nuxt-link>
        <nuxt-link to="/refund-policy">Refunds</nuxt-link>
        <nuxt-link to="/shipping-policy">Shipping</nuxt-link>
      </nav>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",

  data() {
    return {
      b: useBusiness(),
      year: new Date().getFullYear(),
    };
  },

  mounted() {
    if (!this.$gsap) return;

    // start hidden
    this.$gsap.set(".footer .footer-section", { y: 30, opacity: 0 });
    this.$gsap.set(".footer .social-links a", { scale: 0, opacity: 0 });

    const tl = this.$gsap.timeline({
      scrollTrigger: {
        trigger: ".footer",
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(".footer .footer-section", {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.12,
      ease: "power3.out",
    }).to(
      ".footer .social-links a",
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "back.out(1.4)",
      },
      "-=0.3",
    );
  },
};
</script>

<style lang="scss" scoped>
.footer {
  background: #000;
  color: #fff;
  padding: 60px 0 20px;
  position: relative;
  z-index: 2;

  .footer-content {
    width: 90%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
    gap: 40px;
    margin-bottom: 40px;

    .footer-section {
      &.brand {
        display: flex;
        flex-direction: column;

        .footer-logo {
          width: 90px;
          height: 90px;
          object-fit: contain;
          margin-bottom: 15px;
        }

        .desc {
          font-size: 0.92rem;
          line-height: 1.6;
          color: #aaa;
          margin-bottom: 16px;
        }

        .legal-name {
          font-size: 0.8rem;
          line-height: 1.6;
          color: #777;
        }
      }

      h4 {
        font-size: 1.05rem;
        text-transform: uppercase;
        margin-bottom: 20px;
        font-weight: bold;
      }

      ul {
        list-style: none;
        padding: 0;

        li {
          margin-bottom: 12px;

          a {
            color: #aaa;
            text-decoration: none;
            transition: color 0.3s ease;

            &:hover {
              color: #fff;
            }
          }
        }
      }

      &.contact {
        .contact-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #aaa;
          font-size: 0.9rem;

          i {
            color: #ffbf38;
            font-size: 1rem;
          }

          a {
            color: #aaa;

            &:hover {
              color: #fff;
            }
          }
        }

        .social-links {
          display: flex;
          gap: 12px;
          margin-top: 22px;

          a {
            width: 42px;
            height: 42px;
            background: #222;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            text-decoration: none;
            font-size: 1.1rem;
            transition:
              background 0.3s ease,
              transform 0.3s ease;

            &:hover {
              background: #ffbf38;
              color: #000;
              transform: translateY(-3px);
            }
          }
        }
      }
    }
  }

  .footer-bottom {
    border-top: 1px solid #333;
    padding-top: 26px;
    width: 90%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    color: #666;
    font-size: 0.9rem;

    p {
      margin: 0;
    }

    .bottom-links {
      display: flex;
      gap: 20px;

      a {
        color: #888;
        text-decoration: none;
        font-size: 0.85rem;

        &:hover {
          color: #fff;
        }
      }
    }
  }
}

@media (max-width: 900px) {
  .footer .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 34px;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 0 15px;

    .footer-content {
      width: 92%;
      gap: 30px;
      margin-bottom: 30px;

      .footer-section {
        &.brand {
          grid-column: 1 / -1;

          .footer-logo {
            width: 72px;
            height: 72px;
          }
        }

        h4 {
          font-size: 1rem;
          margin-bottom: 15px;
        }

        ul li {
          margin-bottom: 10px;

          a {
            font-size: 0.9rem;
          }
        }
      }
    }

    .footer-bottom {
      width: 92%;
      flex-direction: column;
      align-items: flex-start;
      padding-top: 20px;
      font-size: 0.82rem;
    }
  }
}

@media (max-width: 480px) {
  .footer .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>
