<template>
  <section class="section-2">
    <div class="head">
      <h1>Featured Items</h1>

      <nuxt-link to="/products">
        <button>
          View More
          <i class="bi bi-arrow-up-right"></i>
        </button>
      </nuxt-link>
    </div>

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
// Seamless infinite horizontal loop (GSAP's official horizontalLoop helper,
// with drag/swipe support). Wraps endlessly in both directions; created paused
// so it only moves on arrow click or swipe.
function horizontalLoop(gsap, Draggable, items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};

  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: "none" },
    onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
  });

  const length = items.length;
  let startX = items[0].offsetLeft;
  const times = [];
  const widths = [];
  const spaceBefore = [];
  const xPercents = [];
  let curIndex = 0;
  let indexIsDirty = false;
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1);
  let timeWrap;
  let totalWidth;
  const container = items[0].parentNode;
  let proxy;

  const getTotalWidth = () =>
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    spaceBefore[0] +
    items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") +
    (parseFloat(config.paddingRight) || 0);

  function populateWidths() {
    let b1 = container.getBoundingClientRect();
    let b2;
    items.forEach((el, i) => {
      widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, "x", "px")) / widths[i]) * 100 +
          gsap.getProperty(el, "xPercent"),
      );
      b2 = el.getBoundingClientRect();
      spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
      b1 = b2;
    });
    gsap.set(items, { xPercent: (i) => xPercents[i] });
    totalWidth = getTotalWidth();
  }

  function populateTimeline() {
    tl.clear();
    for (let i = 0; i < length; i++) {
      const item = items[i];
      const curX = (xPercents[i] / 100) * widths[i];
      const distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
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
            duration:
              (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
            immediateRender: false,
          },
          distanceToLoop / pixelsPerSecond,
        )
        .add("label" + i, distanceToStart / pixelsPerSecond);
      times[i] = distanceToStart / pixelsPerSecond;
    }
    timeWrap = gsap.utils.wrap(0, tl.duration());
  }

  function getClosest(values, value, wrap) {
    let i = values.length;
    let closest = 1e10;
    let index = 0;
    let d;
    while (i--) {
      d = Math.abs(values[i] - value);
      if (d > wrap / 2) d = wrap - d;
      if (d < closest) {
        closest = d;
        index = i;
      }
    }
    return index;
  }

  function toIndex(index, vars) {
    vars = vars || {};
    if (Math.abs(index - curIndex) > length / 2) {
      index += index > curIndex ? -length : length;
    }
    const newIndex = gsap.utils.wrap(0, length, index);
    let time = times[newIndex];
    if (time > tl.time() !== index > curIndex && index !== curIndex) {
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    if (time < 0 || time > tl.duration()) vars.modifiers = { time: timeWrap };
    curIndex = newIndex;
    vars.overwrite = true;
    gsap.killTweensOf(proxy);
    return vars.duration === 0
      ? tl.time(timeWrap(time))
      : tl.tweenTo(time, vars);
  }

  function refresh(deep) {
    const progress = tl.progress();
    tl.progress(0, true);
    startX = items[0].offsetLeft;
    populateWidths();
    deep && populateTimeline();
    tl.progress(progress, true);
  }

  gsap.set(items, { x: 0 });
  populateWidths();
  populateTimeline();

  tl.toIndex = (index, vars) => toIndex(index, vars);
  tl.closestIndex = (setCurrent) => {
    const index = getClosest(times, tl.time(), tl.duration());
    if (setCurrent) {
      curIndex = index;
      indexIsDirty = false;
    }
    return index;
  };
  tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
  tl.next = (vars) => toIndex(tl.current() + 1, vars);
  tl.previous = (vars) => toIndex(tl.current() - 1, vars);

  const onResize = () => refresh(true);
  window.addEventListener("resize", onResize);
  tl.cleanup = () => {
    window.removeEventListener("resize", onResize);
    tl.draggable && tl.draggable.kill();
    tl.kill();
  };

  tl.progress(1, true).progress(0, true); // pre-render

  // Drag / swipe support.
  if (config.draggable && typeof Draggable === "function") {
    proxy = document.createElement("div");
    let ratio;
    let startProgress;
    let draggable;
    let lastSnap;
    let initChangeX;
    const wrap = gsap.utils.wrap(0, 1);
    const align = () =>
      tl.progress(
        wrap(startProgress + (draggable.startX - draggable.x) * ratio),
      );
    const syncIndex = () => tl.closestIndex(true);

    draggable = Draggable.create(proxy, {
      trigger: container,
      type: "x",
      onPressInit() {
        const x = this.x;
        gsap.killTweensOf(tl);
        startProgress = tl.progress();
        refresh();
        ratio = 1 / totalWidth;
        initChangeX = startProgress / -ratio - x;
        gsap.set(proxy, { x: startProgress / -ratio });
      },
      onDrag: align,
      onThrowUpdate: align,
      overshootTolerance: 0,
      inertia: true,
      snap(value) {
        if (Math.abs(startProgress / -ratio - this.x) < 10) {
          return lastSnap + initChangeX;
        }
        const time = -(value * ratio) * tl.duration();
        const wrappedTime = timeWrap(time);
        const snapTime = times[getClosest(times, wrappedTime, tl.duration())];
        let dif = snapTime - wrappedTime;
        if (Math.abs(dif) > tl.duration() / 2) {
          dif += dif < 0 ? tl.duration() : -tl.duration();
        }
        lastSnap = (time + dif) / tl.duration() / -ratio;
        return lastSnap;
      },
      onRelease() {
        syncIndex();
        draggable.isThrowing && (indexIsDirty = true);
      },
      onThrowComplete: syncIndex,
    })[0];
    tl.draggable = draggable;
  }

  tl.closestIndex(true);
  return tl;
}

export default {
  name: "SectionTwo",

  data() {
    return {
      products: [],
      loop: null,
    };
  },

  async mounted() {
    await this.getProducts();
    this.$nextTick(() => this.buildLoop());
  },

  beforeUnmount() {
    if (this.loop) this.loop.cleanup();
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

      const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      this.loop = horizontalLoop(this.$gsap, this.$Draggable, items, {
        paused: true,
        draggable: true,
        paddingRight: gap,
      });
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
  // Consistent side gutter on both mobile and desktop.
  --gutter: clamp(16px, 5vw, 80px);
  --gap: 20px;

  min-height: 50vh;
  padding: 80px 0;
  background: white;
  position: relative;
  z-index: 2;
  overflow: hidden;

  // Heading lines up with the gutter.
  .head {
    padding: 0 var(--gutter);
    margin: 0 0 40px;
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
      flex-shrink: 0;

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
        white-space: nowrap;

        &:hover {
          transform: translateY(-3px);
        }
      }
    }
  }

  // Full-bleed carousel: the track scrolls right to the screen edges, while
  // the first card sits inset by the gutter.
  .carousel {
    position: relative;
  }

  .viewport {
    overflow: hidden;
    padding: 0 var(--gutter);
  }

  .track {
    display: flex;
    gap: var(--gap);

    .product-link {
      text-decoration: none;
      display: block;
      flex: 0 0 auto;
      width: clamp(240px, 22vw, 300px);
      color: black;
    }
  }

  // Arrows overlay the edges (desktop). Hidden on touch where you swipe.
  .nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 50%;
    background: #111;
    color: white;
    font-size: 22px;
    cursor: pointer;
    display: grid;
    place-items: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    transition: 0.25s ease;

    &:hover {
      transform: translateY(-50%) scale(1.08);
    }

    &.left {
      left: 12px;
    }

    &.right {
      right: 12px;
    }
  }

  .empty {
    padding: 0 var(--gutter);
    color: #777;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .section-2 {
    --gutter: 16px;
    --gap: 14px;
    padding: 50px 0;

    .head {
      margin-bottom: 28px;
      flex-direction: column;
      align-items: flex-start;
    }

    .track .product-link {
      // ~2 and a half cards visible on a phone.
      width: 40vw;
    }

    // On touch devices the carousel is swiped, so hide the arrows.
    .nav-arrow {
      display: none;
    }
  }
}
</style>
