<template>
  <div>
    <MainLoader />
    <Header />
    <SectionOne />
    <SectionTwo />
    <SectionThree />
    <SectionFour />
    <div class="background">
      <div class="content">
        <div class="info">
          <div class="info-content">
            <div class="tag">Camp Dawn Gaming</div>
            <h2>See The World<br />Through Our Craft</h2>
            <p>
              CampDawn Merch is an online store for branded gaming merchandise:
              clothing, hoodies, t-shirts, caps, and accessories. Browse the
              collection, pay securely online, and we'll ship your order to your
              door across Ghana and worldwide.
            </p>
            <nuxt-link to="/products">
              <button class="shop-btn">
                <span>Shop Now</span>
                <i class="bi bi-arrow-up-right"></i>
              </button>
            </nuxt-link>
          </div>
        </div>
        <div class="image">
          <img src="/2.jpg" alt="CampDawn Merch" />
          <img src="/1.jpg" alt="CampDawn Merch" />
          <img src="/6.jpg" alt="CampDawn Merch" />
          <img src="/7.jpg" alt="CampDawn Merch" />
          <img src="/9.jpg" alt="CampDawn Merch" />
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
export default {
  name: "Home Page",
  mounted() {
    this.$gsap.set(".background", { opacity: 0, y: 30 });
    this.$gsap.set(
      [
        ".background .tag",
        ".background .content .info h2",
        ".background .content .info p",
        ".background .content .info .shop-btn",
        ".background .content .image img",
      ],
      { opacity: 0, y: 30 },
    );

    this.$gsap
      .timeline({
        scrollTrigger: {
          trigger: ".section-three",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })
      .to(".background", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      })
      .to(
        [
          ".background .tag",
          ".background .content .info h2",
          ".background .content .info p",
          ".background .content .info .shop-btn",
          ".background .content .image img",
        ],
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
        },
        "-=0.6",
      );
  },
};
</script>

<style lang="scss" scoped>
// ── Gamer palette ─────────────────────────────────────────────
$black: #0a0a0a;
$offwhite: #f0f0ec;
$accent: #c8f135; // toxic lime, classic gamer highlight

.background {
  opacity: 0;
  transform: translateY(30px);
  width: 100%;
  background: $black;
  position: fixed;
  height: 100vh;
  width: 100%;
  top: 0;
  left: 0;
  overflow: hidden;

  // Scanline texture
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(255, 255, 255, 0.015) 3px,
      rgba(255, 255, 255, 0.015) 4px
    );
    pointer-events: none;
    z-index: 1;
  }

  // Corner bracket, top left
  &::after {
    content: "";
    position: absolute;
    top: 24px;
    left: 24px;
    width: 40px;
    height: 40px;
    border-top: 2px solid $accent;
    border-left: 2px solid $accent;
    z-index: 2;
    pointer-events: none;
  }

  .content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: stretch;
    height: 100vh;
  }

  // ── Info panel ───────────────────────────────────────────────
  .info {
    width: 50%;
    display: flex;
    align-items: center;

    .info-content {
      width: 80%;
      margin: auto;
      padding: 80px 0;
    }

    .tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: $accent;
      border: 1px solid rgba($accent, 0.4);
      padding: 5px 12px;
      border-radius: 2px;
      margin-bottom: 24px;
    }

    h2 {
      font-size: clamp(1.8rem, 3.5vw, 2.8rem);
      font-weight: 700;
      line-height: 1.1;
      color: $offwhite;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }

    p {
      font-size: clamp(0.875rem, 1.2vw, 1rem);
      line-height: 1.7;
      color: rgba($offwhite, 0.55);
      margin-bottom: 36px;
      max-width: 440px;
    }

    .shop-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: $accent;
      color: $black;
      border: none;
      padding: 0.9rem 2rem;
      border-radius: 2px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      transition:
        background 0.2s ease,
        transform 0.2s ease;

      &:hover {
        background: lighten($accent, 8%);
        transform: translateY(-2px);
      }
    }
  }

  // ── Image strip ──────────────────────────────────────────────
  .image {
    width: 50%;
    display: flex;
    align-items: stretch;
    overflow: hidden;

    img {
      flex: 1;
      min-width: 0;
      object-fit: cover;
      filter: grayscale(100%) brightness(0.6);
      transition:
        filter 0.4s ease,
        flex 0.4s ease;

      &:hover {
        filter: grayscale(0%) brightness(0.9);
        flex: 2.2;
      }
    }
  }
}

// ── Tablet ────────────────────────────────────────────────────
@media (max-width: 900px) {
  .background {
    .content {
      flex-direction: column;
      min-height: auto;
    }

    .info {
      width: 100%;
      border-bottom: 1px solid rgba($accent, 0.15);

      .info-content {
        width: 88%;
        padding: 60px 0 48px;
      }

      p {
        max-width: 100%;
      }
    }

    .image {
      width: 100%;
      height: 340px;

      // On tablet disable the flex-grow hover, too disruptive in a row
      img:hover {
        flex: 1;
      }
    }
  }
}

// ── Mobile ────────────────────────────────────────────────────
@media (max-width: 480px) {
  .background {
    // Corner brackets too large on small screens, shrink them
    &::after {
      top: 16px;
      left: 16px;
      width: 28px;
      height: 28px;
    }

    .info {
      .info-content {
        width: 90%;
        padding: 48px 0 36px;
      }

      h2 {
        font-size: 1.7rem;
      }
    }

    .image {
      height: 260px;
      img:nth-child(1),
      img:nth-child(5) {
        display: none;
      }
    }
  }
}
</style>
