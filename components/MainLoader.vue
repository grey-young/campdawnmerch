<template>
  <div class="loader" ref="loader">
    <div class="bg" aria-hidden="true">
      <span class="grid"></span>
      <span class="scan"></span>
      <span class="glow"></span>
    </div>

    <!-- HUD corner brackets -->
    <span class="corner tl"></span>
    <span class="corner tr"></span>
    <span class="corner bl"></span>
    <span class="corner br"></span>

    <div class="inner" ref="inner">
      <div class="top">
        <span class="hud"><span class="tick"></span> Booting CampDawn</span>
        <span class="count"><span ref="count">00</span><i>%</i></span>
      </div>

      <div class="brandmark">
        <img src="/logo.png" alt="" ref="logo" loading="eager" />
        <h1 class="word" ref="word">CAMPDAWN</h1>
      </div>

      <div class="rail">
        <span class="fill" ref="fill"></span>
      </div>

      <div class="foot">
        <span class="status" ref="status">Initialising</span>
        <span class="season">Season 001</span>
      </div>
    </div>

    <!-- Curtain panels for the reveal wipe -->
    <span class="curtain" ref="curtain"></span>
  </div>
</template>

<script>
export default {
  name: "MainLoader",

  mounted() {
    const gsap = this.$gsap;
    if (!gsap) {
      // No motion lib — just remove the overlay.
      if (this.$refs.loader) this.$refs.loader.style.display = "none";
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { loader, inner, count, fill, word, status } = this.$refs;

    if (reduce) {
      gsap.set(loader, { display: "none" });
      return;
    }

    const phases = ["Initialising", "Loading assets", "Rendering store", "Ready"];
    const progress = { v: 0 };

    const tl = gsap.timeline();

    // Intro
    tl.from(".loader .top", { opacity: 0, y: -14, duration: 0.6, ease: "power3.out" })
      .from(".loader .brandmark img", { opacity: 0, scale: 0.7, duration: 0.7, ease: "back.out(1.6)" }, "-=0.2")
      .from(".loader .foot", { opacity: 0, y: 14, duration: 0.6, ease: "power3.out" }, "-=0.4");

    // Scramble the wordmark in.
    tl.to(
      word,
      { duration: 1.5, scrambleText: { text: "CAMPDAWN", chars: "0123456789#", speed: 0.6 } },
      0.3,
    );

    // Progress counter + rail, with status phase swaps.
    tl.to(
      progress,
      {
        v: 100,
        duration: 2,
        ease: "power1.inOut",
        onUpdate: () => {
          const v = Math.round(progress.v);
          if (count) count.textContent = String(v).padStart(2, "0");
          gsap.set(fill, { scaleX: progress.v / 100 });
          if (status) {
            status.textContent = phases[Math.min(Math.floor(v / 26), phases.length - 1)];
          }
        },
      },
      0.25,
    );

    // Exit: lift the content, then wipe the curtain up to reveal the hero.
    tl.to(inner, { y: -30, opacity: 0, duration: 0.5, ease: "power3.in" }, "+=0.15")
      .to(".loader .curtain", { scaleY: 1, duration: 0.6, ease: "power4.inOut" }, "-=0.2")
      .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
      .set(loader, { display: "none" });
  },
};
</script>

<style lang="scss" scoped>
$lime: #ffbf38;
$ink: #131515;
$plat: #f0f0ec;

.loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: $ink;
  color: $plat;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 58px 58px;
    -webkit-mask-image: radial-gradient(circle at 50% 50%, #000, transparent 75%);
    mask-image: radial-gradient(circle at 50% 50%, #000, transparent 75%);
  }

  .scan {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(255, 255, 255, 0.014) 3px,
      rgba(255, 255, 255, 0.014) 4px
    );
  }

  .glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60vw;
    height: 60vw;
    max-width: 640px;
    max-height: 640px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba($lime, 0.12), transparent 60%);
    filter: blur(40px);
  }
}

.corner {
  position: absolute;
  width: 36px;
  height: 36px;
  pointer-events: none;

  &.tl { top: 24px; left: 24px; border-top: 2px solid rgba($lime, 0.55); border-left: 2px solid rgba($lime, 0.55); }
  &.tr { top: 24px; right: 24px; border-top: 2px solid rgba($lime, 0.55); border-right: 2px solid rgba($lime, 0.55); }
  &.bl { bottom: 24px; left: 24px; border-bottom: 2px solid rgba($lime, 0.55); border-left: 2px solid rgba($lime, 0.55); }
  &.br { bottom: 24px; right: 24px; border-bottom: 2px solid rgba($lime, 0.55); border-right: 2px solid rgba($lime, 0.55); }
}

.inner {
  position: relative;
  z-index: 2;
  width: min(640px, 86%);
  text-align: center;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;

  .hud {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba($plat, 0.7);

    .tick {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: $lime;
      box-shadow: 0 0 10px 1px rgba($lime, 0.8);
      animation: cd-pulse 1.2s ease-in-out infinite;
    }
  }

  .count {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: $lime;
    font-variant-numeric: tabular-nums;

    i {
      font-style: normal;
      color: rgba($plat, 0.5);
      margin-left: 2px;
    }
  }
}

.brandmark {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;

  img {
    width: 96px;
    height: 96px;
    object-fit: contain;
  }

  .word {
    margin: 0;
    font-size: clamp(2rem, 8vw, 4.4rem);
    font-weight: 900;
    letter-spacing: 0.04em;
    line-height: 1;
    color: $plat;
  }
}

.rail {
  margin: 40px 0 16px;
  height: 2px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;

  .fill {
    display: block;
    height: 100%;
    width: 100%;
    transform: scaleX(0);
    transform-origin: left center;
    background: linear-gradient(90deg, $lime, rgba($lime, 0.5));
    box-shadow: 0 0 14px rgba($lime, 0.6);
  }
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba($plat, 0.45);

  .status {
    color: rgba($plat, 0.7);
  }
}

// Curtain wipe that grows from the bottom on exit.
.curtain {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #111;
  transform: scaleY(0);
  transform-origin: bottom center;
}

@media (max-width: 560px) {
  .corner {
    width: 26px;
    height: 26px;
  }
  .brandmark img {
    width: 76px;
    height: 76px;
  }
}
</style>
