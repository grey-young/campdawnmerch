<template>
  <section class="section-2">
    <header class="s2-head">
      <div>
        <span class="hud-label"><span class="idx">02</span> // Shop</span>
        <h1>Shop <em>CampDawn</em></h1>
      </div>

      <nuxt-link to="/products" class="view-more">
        View all <i class="bi bi-arrow-up-right"></i>
      </nuxt-link>
    </header>

    <div class="marquee-band">
      <Marquee
        :items="['New Drops', 'Limited Runs', 'CampDawn', 'Ships Worldwide']"
        :duration="26"
      />
    </div>

    <div v-if="categories.length" class="category-rows">
      <div
        v-for="(category, idx) in categories"
        :key="category.id"
        class="category-row"
      >
        <div class="row-head">
          <span class="r-idx">{{ String(idx + 1).padStart(2, "0") }}</span>
          <h2>{{ category.name }}</h2>
        </div>

        <div class="carousel">
          <button
            type="button"
            class="nav-arrow left"
            aria-label="Previous"
            @click="prev(category.id)"
          >
            <i class="bi bi-chevron-left"></i>
          </button>

          <div class="viewport">
            <div class="track" :ref="(el) => setTrackRef(category.id, el)">
              <nuxt-link
                v-for="product in category.products"
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
            @click="next(category.id)"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <p v-else class="empty">No items yet.</p>
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
  const snap =
    config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1);
  let timeWrap;
  let totalWidth;
  const container = items[0].parentNode;
  let proxy;

  const getTotalWidth = () =>
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    spaceBefore[0] +
    items[length - 1].offsetWidth *
      gsap.getProperty(items[length - 1], "scaleX") +
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
      categories: [],
    };
  },

  computed: {
    // The freshest product overall (categories come back newest-first),
    // used for the full-width drop spotlight.
    spotlight() {
      for (const category of this.categories) {
        if (category.products && category.products.length) {
          return category.products[0];
        }
      }
      return null;
    },
  },

  created() {
    // Non-reactive stores: DOM track elements (keyed by category id) and the
    // GSAP loop instances. Kept off the reactive data to avoid Vue proxying
    // the timelines/elements.
    this.trackRefs = {};
    this.loops = {};
  },

  async mounted() {
    await this.getProducts();
    this.$nextTick(() => this.buildLoops());
  },

  beforeUnmount() {
    for (const loop of Object.values(this.loops)) loop.cleanup();
  },

  methods: {
    async getProducts() {
      const { data, error } = await this.$supabase
        .from("merch_products")
        .select(
          `
          id, name, slug, price, compare_at_price, status,
          merch_categories (id, name, slug),
          merch_product_images (id, image_url, is_main, sort_order)
        `,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        return;
      }

      this.categories = this.groupByCategory(data || []);
    },

    // Group active products into one row per category, ordered so the category
    // with the most items sits at the top. Uncategorised products fall into an
    // "Other" row.
    groupByCategory(products) {
      const groups = new Map();

      for (const product of products) {
        const category = product.merch_categories;
        const id = category?.id || "other";
        const name = category?.name || "Other";

        if (!groups.has(id)) groups.set(id, { id, name, products: [] });
        groups.get(id).products.push(product);
      }

      return Array.from(groups.values()).sort(
        (a, b) => b.products.length - a.products.length,
      );
    },

    setTrackRef(id, el) {
      if (el) this.trackRefs[id] = el;
      else delete this.trackRefs[id];
    },

    buildLoops() {
      if (!this.$gsap) return;

      for (const category of this.categories) {
        const track = this.trackRefs[category.id];
        if (!track) continue;

        const items = track.querySelectorAll(".product-link");
        if (!items.length) continue;

        const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
        this.loops[category.id] = horizontalLoop(
          this.$gsap,
          this.$Draggable,
          items,
          { paused: true, draggable: true, paddingRight: gap },
        );
      }
    },

    next(id) {
      const loop = this.loops[id];
      if (loop) loop.next({ duration: 0.5, ease: "power2.inOut" });
    },

    prev(id) {
      const loop = this.loops[id];
      if (loop) loop.previous({ duration: 0.5, ease: "power2.inOut" });
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
  background: #131515;
  color: #f0f0ec;
  position: relative;
  z-index: 2;
  overflow: hidden;

  // Section heading lines up with the gutter.
  .s2-head {
    padding: 0 var(--gutter);
    margin: 0 0 30px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;

    h1 {
      margin: 14px 0 0;
      font-size: clamp(28px, 5vw, 56px);
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 0.95;
      color: #f0f0ec;

      em {
        font-style: normal;
        color: #ffbf38;
      }
    }

    .view-more {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: #f0f0ec;
      background: #082751;
      padding: 0.8rem 1.4rem;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
      transition:
        background 0.25s ease,
        color 0.25s ease,
        transform 0.25s ease;

      &:hover {
        background: #ffbf38;
        color: #131515;
        transform: translateY(-2px);
      }
    }
  }

  // Full-width editorial spotlight for the newest product.
  .spotlight {
    margin: 0 var(--gutter) 34px;
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    overflow: hidden;
    border-radius: 28px;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.035);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05) inset;
    transition: background 0.45s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.06);

      .spotlight-media img {
        transform: scale(1.05);
        filter: brightness(1.02);
      }

      .spotlight-copy .cta {
        gap: 14px;
        color: #ffbf38;
      }
    }

    .spotlight-media {
      overflow: hidden;
      min-height: 340px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: brightness(0.9);
        transition:
          transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
          filter 0.5s ease;
      }
    }

    .spotlight-copy {
      align-self: center;
      padding: 40px;

      .tag {
        display: inline-block;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #ffbf38;
        background: rgba(255, 191, 56, 0.12);
        padding: 6px 12px;
        border-radius: 999px;
      }

      h2 {
        margin: 18px 0 0;
        font-size: clamp(26px, 3.4vw, 44px);
        font-weight: 900;
        line-height: 1;
        letter-spacing: -0.03em;
        text-transform: uppercase;
        color: #f0f0ec;
      }

      .price {
        margin: 14px 0 0;
        font-size: 20px;
        font-weight: 800;
        color: #f0f0ec;
      }

      .cta {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        margin-top: 26px;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #f0f0ec;
        transition:
          gap 0.3s ease,
          color 0.3s ease;
      }
    }
  }

  .marquee-band {
    margin: 0 0 46px;
    padding: 16px 0;
    background: rgba(255, 255, 255, 0.025);
  }

  // One stacked row per category.
  .category-rows {
    display: flex;
    flex-direction: column;
    gap: 56px;
  }

  // Per-category label, also aligned with the gutter.
  .row-head {
    padding: 0 var(--gutter);
    margin: 0 0 20px;
    display: flex;
    align-items: baseline;
    gap: 14px;

    .r-idx {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #ffbf38;
    }

    h2 {
      font-size: clamp(18px, 2.4vw, 26px);
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: -0.01em;
      margin: 0;
      color: #f0f0ec;
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
      color: #f0f0ec;
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
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: #f0f0ec;
    font-size: 22px;
    cursor: pointer;
    display: grid;
    place-items: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    transition:
      transform 0.25s ease,
      background 0.25s ease,
      color 0.25s ease;

    &:hover {
      transform: translateY(-50%) scale(1.08);
      background: #ffbf38;
      color: #131515;
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
      align-items: center;
      gap: 12px;

      h1 {
        font-size: 22px;
      }

      a button {
        padding: 0.65rem 1.1rem;
        font-size: 13px;
        gap: 6px;
      }
    }

    .category-rows {
      gap: 38px;
    }

    .row-head {
      margin-bottom: 14px;

      h2 {
        font-size: 17px;
      }
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

@media (max-width: 820px) {
  .section-2 {
    .spotlight {
      grid-template-columns: 1fr;

      .spotlight-media {
        min-height: 240px;
      }

      .spotlight-copy {
        padding: 26px;
      }
    }

    .s2-head {
      align-items: flex-start;
    }
  }
}
</style>
