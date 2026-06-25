<template>
  <div v-if="enabled && !onAdmin" class="cursor-layer" aria-hidden="true">
    <div ref="ring" class="reticle" :class="{ hover: hovering, down: pressed }">
      <span class="corner tl"></span>
      <span class="corner tr"></span>
      <span class="corner bl"></span>
      <span class="corner br"></span>
      <span class="cross cx"></span>
      <span class="cross cy"></span>
    </div>
    <div ref="dot" class="dot" :class="{ hover: hovering, down: pressed }"></div>
  </div>
</template>

<script>
export default {
  name: "CursorFX",

  data() {
    return { enabled: false, hovering: false, pressed: false, onAdmin: false };
  },

  watch: {
    // Admin dashboard keeps its normal cursor.
    "$route.path"(path) {
      this.onAdmin = path.startsWith("/admin");
      this.syncCursorClass();
    },
  },

  mounted() {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || !this.$gsap) return;

    this.enabled = true;
    this.onAdmin = this.$route?.path?.startsWith("/admin") || false;
    this.syncCursorClass();

    this.$nextTick(() => {
      const gsap = this.$gsap;
      const ring = this.$refs.ring;
      const dot = this.$refs.dot;
      if (!ring || !dot) return;

      this.ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
      this.ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
      this.dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
      this.dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });

      // Continuous reticle spin (idle scan). Composited with x/y + scale.
      this.spin = gsap.to(ring, { rotation: 360, duration: 9, ease: "none", repeat: -1 });

      window.addEventListener("pointermove", this.onMove, { passive: true });
      window.addEventListener("pointerover", this.onOver, { passive: true });
      window.addEventListener("pointerout", this.onOut, { passive: true });
      window.addEventListener("pointerdown", this.onDown, { passive: true });
      window.addEventListener("pointerup", this.onUp, { passive: true });
    });
  },

  beforeUnmount() {
    document.documentElement.classList.remove("cursor-fx-on");
    this.spin?.kill?.();
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerover", this.onOver);
    window.removeEventListener("pointerout", this.onOut);
    window.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointerup", this.onUp);
  },

  methods: {
    syncCursorClass() {
      const on = this.enabled && !this.onAdmin;
      document.documentElement.classList.toggle("cursor-fx-on", on);
    },
    onMove(e) {
      this.ringX?.(e.clientX);
      this.ringY?.(e.clientY);
      this.dotX?.(e.clientX);
      this.dotY?.(e.clientY);
    },
    isInteractive(t) {
      return t?.closest?.("a, button, input, textarea, select, [data-cursor]");
    },
    onOver(e) {
      if (this.isInteractive(e.target)) {
        this.hovering = true;
        // Lock-on: scale up and slow the spin.
        this.$gsap.to(this.$refs.ring, { scale: 1.7, duration: 0.3, ease: "power3.out" });
        this.spin?.timeScale(0.25);
      }
    },
    onOut(e) {
      if (this.isInteractive(e.target)) {
        this.hovering = false;
        this.$gsap.to(this.$refs.ring, { scale: 1, duration: 0.3, ease: "power3.out" });
        this.spin?.timeScale(1);
      }
    },
    onDown() {
      this.pressed = true;
      this.$gsap.to(this.$refs.ring, { scale: this.hovering ? 1.4 : 0.7, duration: 0.15 });
    },
    onUp() {
      this.pressed = false;
      this.$gsap.to(this.$refs.ring, { scale: this.hovering ? 1.7 : 1, duration: 0.2 });
    },
  },
};
</script>

<style scoped lang="scss">
$amber: #ffbf38;

.cursor-layer {
  position: fixed;
  inset: 0;
  z-index: 9000;
  pointer-events: none;
}

.reticle {
  position: fixed;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  will-change: transform;

  .corner {
    position: absolute;
    width: 9px;
    height: 9px;
    transition: border-color 0.25s ease;
  }
  .tl { top: 0; left: 0; border-top: 2px solid $amber; border-left: 2px solid $amber; }
  .tr { top: 0; right: 0; border-top: 2px solid $amber; border-right: 2px solid $amber; }
  .bl { bottom: 0; left: 0; border-bottom: 2px solid $amber; border-left: 2px solid $amber; }
  .br { bottom: 0; right: 0; border-bottom: 2px solid $amber; border-right: 2px solid $amber; }

  // Center crosshair ticks
  .cross {
    position: absolute;
    top: 50%;
    left: 50%;
    background: rgba($amber, 0.55);
    transform: translate(-50%, -50%);
  }
  .cx { width: 7px; height: 1.5px; }
  .cy { width: 1.5px; height: 7px; }

  // Lock-on glow when over an interactive target.
  &.hover .corner {
    border-color: #fff;
    box-shadow: 0 0 8px rgba($amber, 0.8);
  }
}

.dot {
  position: fixed;
  top: 0;
  left: 0;
  width: 5px;
  height: 5px;
  margin: -2.5px 0 0 -2.5px;
  border-radius: 50%;
  background: $amber;
  box-shadow: 0 0 10px rgba($amber, 0.9);
  will-change: transform;
  transition: opacity 0.2s ease;

  // Hide the dot when locked on — the reticle frames the target instead.
  &.hover { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .cursor-layer { display: none; }
}
</style>
