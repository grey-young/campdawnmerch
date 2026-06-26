<template>
  <section class="hero" ref="hero">
    <!-- Ambient field -->
    <div class="field" aria-hidden="true">
      <span class="glow" ref="glow"></span>
      <span class="glow nv"></span>
      <span class="grid"></span>
      <span class="scan"></span>
    </div>

    <!-- HUD corner brackets -->
    <span class="corner tl" aria-hidden="true"></span>
    <span class="corner br" aria-hidden="true"></span>

    <div class="hero-grid">
      <!-- Left: type block -->
      <div class="type">
        <div class="eyebrow" ref="eyebrow">
          <span class="tick"></span>
          <span>CampDawn Merch</span>
          <span class="sep">/</span>
          <span class="scramble" ref="scramble">SEASON 001</span>
        </div>

        <h1 class="title" ref="title">
          <span class="row solid">Camp</span>
          <span class="row ghost">Dawn</span>
        </h1>

        <p class="tagline" ref="tagline">
          Branded gaming merchandise. Hoodies, tees and caps, shipped to your
          door across {{ country }} and worldwide.
        </p>

        <div class="actions" ref="actions">
          <nuxt-link to="/products" class="btn-shop" v-magnetic="0.4">
            <span>Enter the shop</span>
            <i class="bi bi-arrow-up-right"></i>
          </nuxt-link>
          <nuxt-link to="/about" class="btn-link" v-magnetic="0.25"
            >Our story</nuxt-link
          >
        </div>
      </div>

      <!-- Right: parallax product gallery -->
      <div class="gallery" ref="gallery">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="frame"
          :class="`f${index + 1}`"
          :data-depth="depths[index] || 0.1"
        >
          <nuxt-link :to="image.to || '/products'" class="frame-inner">
            <img
              :src="image.src"
              :alt="image.alt"
              loading="eager"
              decoding="async"
            />
            <span v-if="image.alt" class="frame-tag">{{ image.alt }}</span>
          </nuxt-link>
        </div>
      </div>
    </div>

    <!-- Scroll cue -->
    <div class="cue" ref="cue">
      <span>Scroll</span>
      <span class="bar"><span class="fill"></span></span>
    </div>
  </section>
</template>

<script>
// Pool of gaming + apparel/accessory icons a hero letter morphs into on hover.
const LETTER_ICONS = [
  "bi-controller",
  "bi-joystick",
  "bi-dice-5",
  "bi-dice-6",
  "bi-trophy-fill",
  "bi-rocket-takeoff-fill",
  "bi-headset",
  "bi-cpu-fill",
  "bi-suit-spade-fill",
  "bi-suit-club-fill",
  "bi-bag-fill",
  "bi-handbag-fill",
  "bi-watch",
  "bi-eyeglasses",
  "bi-emoji-sunglasses-fill",
  "bi-stack",
];

const DEFAULT_IMAGES = [
  { src: "/hoodie.png", alt: "Hoodie", to: "/products" },
  { src: "/shirt2.jpg", alt: "Tee", to: "/products" },
  { src: "/shirt.jpg", alt: "Graphic", to: "/products" },
  { src: "/hat.png", alt: "Cap", to: "/products" },
  { src: "/shirt3.png", alt: "Drop", to: "/products" },
];

export default {
  name: "SectionOne",

  data() {
    return {
      images: DEFAULT_IMAGES.map((image) => ({ ...image })),
      depths: [0.18, 0.32, 0.1, 0.26, 0.4],
      country: "Ghana",
    };
  },

  created() {
    this.cleanups = [];
    this.split = null;
  },

  mounted() {
    this.loadFlyers();
    // Let the intro loader lift before the hero plays in.
    this.introTimer = setTimeout(() => this.runIntro(), 2500);
  },

  beforeUnmount() {
    clearTimeout(this.introTimer);
    this.cleanups.forEach((fn) => fn());
    this.split?.revert?.();
  },

  methods: {
    async loadFlyers() {
      const { data, error } = await this.$supabase
        .from("merch_flyers")
        .select("image_url, title, link_url, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(DEFAULT_IMAGES.length);

      if (error) {
        console.error(error.message);
        return;
      }
      const flyers = data || [];
      if (!flyers.length) return;

      this.images = flyers.map((flyer) => ({
        src: flyer.image_url,
        alt: flyer.title || "",
        to: flyer.link_url || "/products",
      }));
    },

    runIntro() {
      const gsap = this.$gsap;
      if (!gsap) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const frames = this.$refs.gallery?.querySelectorAll(".frame") || [];

      if (reduce) {
        gsap.set(
          [
            this.$refs.eyebrow,
            this.$refs.tagline,
            this.$refs.actions,
            this.$refs.cue,
            ...frames,
          ],
          { opacity: 1, y: 0, clearProps: "all" },
        );
        return;
      }

      // Character-level reveal of the wordmark.
      this.split = new this.$SplitText(this.$refs.title, {
        type: "chars",
        charsClass: "char",
      });
      this.setupLetterIcons();

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(this.$refs.eyebrow, { y: 20, opacity: 0, duration: 0.7 })
        .from(
          this.split.chars,
          { yPercent: 120, opacity: 0, duration: 1, stagger: 0.05 },
          "-=0.3",
        )
        .from(this.$refs.tagline, { y: 24, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(
          this.$refs.actions,
          { y: 20, opacity: 0, duration: 0.7 },
          "-=0.55",
        )
        .from(
          frames,
          { y: 70, opacity: 0, scale: 0.92, duration: 1, stagger: 0.1 },
          "-=0.9",
        )
        .from(this.$refs.cue, { opacity: 0, duration: 0.6 }, "-=0.3");

      // Hacker scramble on the season tag.
      if (this.$refs.scramble) {
        tl.to(
          this.$refs.scramble,
          {
            duration: 1.1,
            scrambleText: { text: "SEASON 001", chars: "01", speed: 0.5 },
          },
          0.4,
        );
      }

      // Scroll parallax per frame (depth-based) + the glow.
      frames.forEach((frame) => {
        const depth = parseFloat(frame.getAttribute("data-depth")) || 0.15;
        const tween = gsap.to(frame, {
          yPercent: -depth * 100,
          ease: "none",
          scrollTrigger: {
            trigger: this.$refs.hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        this.cleanups.push(() => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
      });

      // Pointer parallax on the gallery for subtle depth.
      this.onPointer = (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;
        frames.forEach((frame) => {
          const depth = parseFloat(frame.getAttribute("data-depth")) || 0.15;
          gsap.to(frame, {
            x: cx * depth * 40,
            rotate: cx * depth * 4,
            duration: 0.8,
            ease: "power3.out",
            overwrite: "auto",
          });
        });
        gsap.to(this.$refs.glow, {
          x: cx * 40,
          y: cy * 30,
          duration: 1,
          ease: "power3.out",
        });
      };
      window.addEventListener("pointermove", this.onPointer, { passive: true });
      this.cleanups.push(() =>
        window.removeEventListener("pointermove", this.onPointer),
      );
    },

    // Each wordmark character flips to a random gaming/apparel icon on hover.
    setupLetterIcons() {
      const gsap = this.$gsap;
      const chars = this.split?.chars || [];

      chars.forEach((el) => {
        const letter = el.textContent;
        el.innerHTML = `<span class="glyph">${letter}</span><i class="ico bi" aria-hidden="true"></i>`;
        const glyph = el.querySelector(".glyph");
        const ico = el.querySelector(".ico");

        const enter = () => {
          const icon =
            LETTER_ICONS[Math.floor(Math.random() * LETTER_ICONS.length)];
          ico.className = "ico bi " + icon;
          gsap.killTweensOf([glyph, ico]);
          gsap.to(glyph, {
            opacity: 0,
            scale: 0.3,
            duration: 0.22,
            ease: "power2.in",
          });
          gsap.fromTo(
            ico,
            { opacity: 0, scale: 0, rotate: -35 },
            {
              opacity: 1,
              scale: 1,
              rotate: 0,
              duration: 0.45,
              ease: "back.out(3)",
            },
          );
        };
        const leave = () => {
          gsap.killTweensOf([glyph, ico]);
          gsap.to(ico, {
            opacity: 0,
            scale: 0,
            duration: 0.2,
            ease: "power2.in",
          });
          gsap.to(glyph, {
            opacity: 1,
            scale: 1,
            duration: 0.38,
            ease: "back.out(2)",
          });
        };

        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        this.cleanups.push(() => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
      });
    },
  },
};
</script>

<style scoped lang="scss">
$lime: #ffbf38;
$ink: #131515;
$plat: #f0f0ec;

.hero {
  position: relative;
  min-height: 100svh;
  background: $ink;
  color: $plat;
  overflow: hidden;
  z-index: 2;
  display: flex;
  align-items: center;
}

// ── Ambient field ───────────────────────────────────────────
.field {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  .glow {
    position: absolute;
    top: -10%;
    left: 30%;
    width: 60vw;
    height: 60vw;
    max-width: 760px;
    max-height: 760px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba($lime, 0.16), transparent 62%);
    filter: blur(40px);

    // Navy secondary glow, opposite corner — amber/navy duotone depth.
    &.nv {
      top: auto;
      left: -12%;
      bottom: -18%;
      background: radial-gradient(
        circle,
        rgba(8, 39, 81, 0.85),
        transparent 60%
      );
    }
  }

  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 64px 64px;
    -webkit-mask-image: radial-gradient(
      circle at 60% 40%,
      #000,
      transparent 78%
    );
    mask-image: radial-gradient(circle at 60% 40%, #000, transparent 78%);
  }

  .scan {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(255, 255, 255, 0.012) 3px,
      rgba(255, 255, 255, 0.012) 4px
    );
  }
}

// ── HUD corners ─────────────────────────────────────────────
.corner {
  position: absolute;
  width: 42px;
  height: 42px;
  z-index: 3;
  pointer-events: none;

  &.tl {
    top: 22px;
    left: 22px;
    border-top: 2px solid rgba($lime, 0.6);
    border-left: 2px solid rgba($lime, 0.6);
  }
  &.br {
    bottom: 22px;
    right: 22px;
    border-bottom: 2px solid rgba($lime, 0.6);
    border-right: 2px solid rgba($lime, 0.6);
  }
}

// ── Layout ──────────────────────────────────────────────────
.hero-grid {
  position: relative;
  z-index: 2;
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 0.9fr;
  gap: 40px;
  align-items: center;
  padding: 80px 0;
}

// ── Type block ──────────────────────────────────────────────
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba($plat, 0.8);

  .tick {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $lime;
    box-shadow: 0 0 12px 1px rgba($lime, 0.8);
  }

  .sep {
    color: rgba($plat, 0.3);
  }

  .scramble {
    color: $lime;
    font-variant-numeric: tabular-nums;
  }
}

.title {
  margin: 22px 0 0;
  font-size: clamp(4.5rem, 15vw, 12rem);
  font-weight: 900;
  line-height: 0.82;
  letter-spacing: -0.05em;
  text-transform: uppercase;

  .row {
    display: block;
    overflow: hidden;
  }

  .solid {
    color: $plat;
  }

  .ghost {
    color: transparent;
    -webkit-text-stroke: 1.5px rgba(240, 240, 236, 0.35);
  }

  // SplitText injects .char spans; each holds a letter + a hover icon.
  :deep(.char) {
    display: inline-block;
    position: relative;
    will-change: transform;
    cursor: pointer;
  }

  :deep(.glyph) {
    display: inline-block;
  }

  :deep(.ico) {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    opacity: 0;
    color: #ffbf38;
    font-size: 0.7em;
    pointer-events: none;
    filter: drop-shadow(0 0 16px rgba(255, 191, 56, 0.5));
  }
}

.tagline {
  margin: 30px 0 0;
  max-width: 440px;
  font-size: clamp(0.95rem, 1.4vw, 1.1rem);
  line-height: 1.7;
  color: rgba($plat, 0.6);
}

.actions {
  margin-top: 36px;
  display: flex;
  align-items: center;
  gap: 18px;

  .btn-shop {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: $lime;
    color: $ink;
    text-decoration: none;
    padding: 1.05rem 2rem;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    box-shadow: 0 20px 46px -18px rgba($lime, 0.75);
    transition: filter 0.25s ease;

    i {
      transition: transform 0.3s ease;
    }

    &:hover {
      filter: brightness(1.06);
      i {
        transform: translate(3px, -3px);
      }
    }
  }

  .btn-link {
    color: rgba($plat, 0.8);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    position: relative;
    padding-bottom: 3px;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      height: 1.5px;
      width: 100%;
      background: $lime;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    &:hover {
      color: $plat;
      &::after {
        transform: scaleX(1);
      }
    }
  }
}

// ── Parallax gallery ────────────────────────────────────────
.gallery {
  position: relative;
  height: 560px;

  .frame {
    position: absolute;
    border-radius: 18px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.95);
    will-change: transform;

    .frame-inner {
      display: block;
      height: 100%;
      width: 100%;
      position: relative;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      filter: grayscale(0.5) brightness(0.85);
      transition:
        filter 0.5s ease,
        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .frame-tag {
      position: absolute;
      left: 10px;
      bottom: 10px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: $plat;
      background: rgba(19, 21, 21, 0.45);
      backdrop-filter: blur(6px);
      padding: 5px 9px;
      border-radius: 999px;
      opacity: 0;
      transform: translateY(6px);
      transition: 0.35s ease;
    }

    &:hover {
      z-index: 5;
      img {
        filter: grayscale(0) brightness(1.03);
        transform: scale(1.06);
      }
      .frame-tag {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  // Scattered collage positions
  .f1 {
    top: 4%;
    left: 2%;
    width: 40%;
    height: 52%;
  }
  .f2 {
    top: 0;
    right: 4%;
    width: 34%;
    height: 44%;
  }
  .f3 {
    top: 40%;
    left: 30%;
    width: 40%;
    height: 56%;
    z-index: 2;
  }
  .f4 {
    bottom: 2%;
    right: 2%;
    width: 30%;
    height: 40%;
  }
  .f5 {
    bottom: 6%;
    left: 0;
    width: 26%;
    height: 34%;
  }
}

// ── Scroll cue ──────────────────────────────────────────────
.cue {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba($plat, 0.5);

  .bar {
    width: 1.5px;
    height: 46px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
    border-radius: 2px;

    .fill {
      display: block;
      width: 100%;
      height: 40%;
      background: $lime;
      animation: cue-run 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
  }
}

@keyframes cue-run {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(250%);
  }
}

// ── Responsive ──────────────────────────────────────────────
@media (max-width: 980px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 110px 0 90px;
    align-content: center;
  }

  .gallery {
    height: 360px;
  }

  .corner {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 560px) {
  .title {
    font-size: clamp(3.4rem, 26vw, 7rem);
  }

  .gallery {
    height: 300px;

    .f1 {
      width: 46%;
      height: 56%;
    }
    .f2 {
      width: 40%;
      height: 46%;
    }
    .f3 {
      width: 46%;
      height: 60%;
    }
    .f4 {
      width: 36%;
      height: 42%;
    }
    .f5 {
      display: none;
    }
  }

  .cue {
    display: none;
  }
}
</style>
