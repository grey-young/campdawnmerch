<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section brand">
        <img src="/logo.png" alt="CampDawn Logo" class="footer-logo" />
        <p>CampDawn Merch - Quality gear for the craft.</p>
      </div>

      <div class="footer-section links">
        <h4>Navigation</h4>
        <ul>
          <li><nuxt-link to="/">Home</nuxt-link></li>
          <li><nuxt-link to="/products">Products</nuxt-link></li>
          <li><nuxt-link to="/cart">Cart</nuxt-link></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <div class="footer-section products">
        <h4>Featured</h4>
        <ul>
          <li><a href="/products">CampDawn Shirt</a></li>
          <li><a href="/products">CampDawn Hoodie</a></li>
          <li><a href="/products">CampDawn Hat</a></li>
        </ul>
      </div>

      <div class="footer-section socials">
        <h4>Follow Us</h4>
        <div class="social-links">
          <a
            href="https://www.instagram.com/campdawn_esports"
            title="Instagram"
            target="_blank"
            ><i class="bi bi-instagram"></i
          ></a>
          <a
            href="https://x.com/campdawnesports"
            title="Twitter"
            target="_blank"
            ><i class="bi bi-twitter"></i
          ></a>
          <a href="mailto:campdawn06@gmail.com" title="Email" target="_blank"
            ><i class="bi bi-envelope"></i
          ></a>
          <a
            href="https://www.tiktok.com/@campdawn_esports"
            title="tiktok"
            target="_blank"
            ><i class="bi bi-tiktok"></i
          ></a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 CampDawn Merch. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",

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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
    margin-bottom: 40px;

    .footer-section {
      &.brand {
        display: flex;
        flex-direction: column;

        .footer-logo {
          width: 100px;
          height: 100px;
          margin-bottom: 15px;
        }

        p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #aaa;
        }
      }

      h4 {
        font-size: 1.1rem;
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

      &.socials {
        .social-links {
          display: flex;
          gap: 15px;

          a {
            width: 45px;
            height: 45px;
            background: #222;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            text-decoration: none;
            font-size: 1.2rem;
            transition:
              background 0.3s ease,
              transform 0.3s ease;

            &:hover {
              background: #fff;
              color: #000;
              transform: scale(1.1);
            }
          }
        }
      }
    }
  }

  .footer-bottom {
    border-top: 1px solid #333;
    padding-top: 30px;
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    width: 90%;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 0 15px;

    .footer-content {
      width: 95%;
      gap: 30px;
      margin-bottom: 30px;

      .footer-section {
        &.brand {
          .footer-logo {
            width: 80px;
            height: 80px;
          }

          p {
            font-size: 0.9rem;
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

        &.socials .social-links {
          gap: 12px;

          a {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }
      }
    }

    .footer-bottom {
      width: 95%;
      padding-top: 20px;
      font-size: 0.85rem;
    }
  }
}
</style>
