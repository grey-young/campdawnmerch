<template>
  <section class="section-2">
    <nav>
      <h1>Featured Items</h1>

      <nuxt-link to="/products">
        <button>
          View More
          <i class="bi bi-arrow-up-right"></i>
        </button>
      </nuxt-link>
    </nav>

    <div v-if="products.length" class="carousel">
      <button
        type="button"
        class="nav-arrow left"
        aria-label="Previous"
        @click="prev"
      >
        <i class="bi bi-chevron-left"></i>
      </button>

      <div class="viewport">
        <div class="track" ref="track">
          <nuxt-link
            v-for="product in products"
            :key="product.id"
            :to="`/products/${product.slug}`"
            class="product-link"
          >
            <Card
              :name="product.name"
              :price="`GH₵ ${formatMoney(product.price)}`"
              :compare-price="product.compare_at_price"
              :image="getMainImage(product)"
            />
          </nuxt-link>
        </div>
      </div>

      <button
        type="button"
        class="nav-arrow right"
        aria-label="Next"
        @click="next"
      >
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <p v-else class="empty">No featured items yet.</p>
  </section>
</template>

<script>
// Seamless infinite horizontal loop (adapted from GSAP's official
// horizontalLoop helper). Items wrap around endlessly in either direction;
// created paused so it only moves when next()/previous() is called.
function horizontalLoop(gsap, items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const length = items.length;
  const startX = items[0].offsetLeft;
  const times = [];
  const widths = [];
  const xPercents = [];
  let curIndex = 0;
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap = gsap.utils.snap(1);

  gsap.set(items, {
    xPercent: (i, el) => {
      const w = (widths[i] = parseFloat(gsap.getProperty(el, "width", "px")));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, "x", "px")) / w) * 100 +
          gsap.getProperty(el, "xPercent"),
      );
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });

  const totalWidth =
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") +
    (parseFloat(config.paddingRight) || 0);

  for (let i = 0; i < length; i++) {
    const item = items[i];
    const curX = (xPercents[i] / 100) * widths[i];
    const distanceToStart = item.offsetLeft + curX - startX;
    const distanceToLoop =
      distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");

    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0,
    )
      .fromTo(
        item,
        {
          xPercent: snap(
            ((curX - distanceToLoop + totalWidth) / widths[i]) * 100,
          ),
        },
        {
          xPercent: xPercents[i],
          duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond,
      )
      .add("label" + i, distanceToStart / pixelsPerSecond);

    times[i] = distanceToStart / pixelsPerSecond;
  }

  function toIndex(index, vars) {
    vars = vars || {};
    if (Math.abs(index - curIndex) > length / 2) {
      index += index > curIndex ? -length : length;
    }
    const newIndex = gsap.utils.wrap(0, length, index);
    let time = times[newIndex];
    if (time > tl.time() !== index > curIndex) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  tl.next = (vars) => toIndex(curIndex + 1, vars);
  tl.previous = (vars) => toIndex(curIndex - 1, vars);
  tl.progress(1, true).progress(0, true); // pre-render for snappy first move

  return tl;
}

export default {
  name: "SectionTwo",

  data() {
    return {
      products: [],
      loop: null,
      resizeTimer: null,
    };
  },

  async mounted() {
    await this.getProducts();
    this.$nextTick(() => this.buildLoop());
    window.addEventListener("resize", this.onResize);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    if (this.loop) this.loop.kill();
  },

  methods: {
    async getProducts() {
      const { data, error } = await this.$supabase
        .from("merch_products")
        .select(
          `
          id, name, slug, price, compare_at_price, status, is_featured, featured_order,
          merch_product_images (id, image_url, is_main, sort_order)
        `,
        )
        .eq("status", "active")
        .eq("is_featured", true)
        .order("featured_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        return;
      }

      this.products = data || [];
    },

    buildLoop() {
      const track = this.$refs.track;
      if (!track || !this.$gsap || !this.products.length) return;

      const items = track.querySelectorAll(".product-link");
      if (!items.length) return;

      const gap = parseFloat(getComputedStyle(track).columnGap) || 28;
      this.loop = horizontalLoop(this.$gsap, items, { paddingRight: gap });
    },

    onResize() {
      // Widths change at breakpoints, so rebuild the loop with fresh measurements.
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (this.loop) this.loop.kill();
        this.$gsap && this.$gsap.set(".section-2 .product-link", { clearProps: "all" });
        this.buildLoop();
      }, 200);
    },

    next() {
      if (this.loop) this.loop.next({ duration: 0.5, ease: "power2.inOut" });
    },

    prev() {
      if (this.loop) this.loop.previous({ duration: 0.5, ease: "power2.inOut" });
    },

    getMainImage(product) {
      const images = product.merch_product_images || [];
      if (!images.length) return "/shirt.jpg";
      const mainImage = images.find((image) => image.is_main);
      return mainImage
        ? mainImage.image_url
        : images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    },

    formatMoney(value) {
      return Number(value || 0).toFixed(2);
    },
  },
};
</script>

<style scoped lang="scss">
.section-2 {
  min-height: 60vh;
  padding: 80px 0;
  background: white;
  position: relative;
  z-index: 2;

  nav {
    width: 90%;
    margin: 0 auto 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    h1 {
      font-size: clamp(24px, 4vw, 42px);
      text-transform: uppercase;
      font-weight: 700;
    }

    a {
      color: black;
      text-decoration: none;
      flex-shrink: 0; // prevents button from squishing on mid-size screens

      button {
        background: black;
        border: none;
        padding: 0.875rem 2rem;
        color: white;
        border-radius: 100px;
        cursor: pointer;
        font-size: 14px;
        transition: 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap; // prevents button text wrapping

        &:hover {
          transform: translateY(-3px);
        }
      }
    }
  }

  // Arrow | clipped row | arrow
  .carousel {
    width: 90%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .nav-arrow {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border: none;
    border-radius: 50%;
    background: #111;
    color: white;
    font-size: 22px;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: 0.25s ease;

    &:hover {
      transform: scale(1.08);
    }
  }

  .viewport {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .track {
    display: flex;
    gap: 28px;

    .product-link {
      text-decoration: none;
      display: block;
      flex: 0 0 auto;
      width: 340px;
      max-width: 80vw;
      color: black;
    }
  }

  .empty {
    width: 90%;
    margin: 0 auto;
    color: #777;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .section-2 {
    padding: 50px 0;

    nav {
      width: 95%;
      margin-bottom: 36px;
      flex-direction: column;
      align-items: flex-start;
    }

    .carousel {
      width: 95%;
      gap: 8px;
    }

    .nav-arrow {
      width: 42px;
      height: 42px;
      font-size: 18px;
    }

    .track {
      gap: 16px;

      .product-link {
        width: 260px;
      }
    }
  }
}

@media (max-width: 480px) {
  .section-2 {
    padding: 40px 0;

    nav {
      width: 95%;
      gap: 12px;
    }

    .track .product-link {
      width: 75vw;
    }
  }
}
</style>
