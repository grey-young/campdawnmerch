<template>
  <div class="marquee" :class="{ 'is-reverse': reverse }" aria-hidden="true">
    <!-- Two identical tracks side by side give a seamless -50% loop. -->
    <div class="track" :style="{ animationDuration: `${duration}s` }">
      <span v-for="n in 2" :key="n" class="run">
        <template v-for="(item, i) in items" :key="`${n}-${i}`">
          <span class="word">{{ item }}</span>
          <span class="sep" aria-hidden="true">✦</span>
        </template>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Marquee",

  props: {
    // Words cycled across the ticker.
    items: {
      type: Array,
      default: () => ["New Drops", "Limited Runs", "CampDawn Merch", "Ships Worldwide"],
    },
    // Seconds for one full pass. Lower = faster.
    duration: { type: Number, default: 28 },
    reverse: { type: Boolean, default: false },
  },
};
</script>

<style scoped lang="scss">
$lime: #ffbf38;
$plat: #f0f0ec;

.marquee {
  overflow: hidden;
  width: 100%;
  display: flex;
  user-select: none;
  // Fade the edges so words enter/exit softly instead of clipping.
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent,
    #000 8%,
    #000 92%,
    transparent
  );
  mask-image: linear-gradient(
    90deg,
    transparent,
    #000 8%,
    #000 92%,
    transparent
  );

  .track {
    display: flex;
    flex-shrink: 0;
    min-width: 100%;
    width: max-content;
    animation: marquee-scroll linear infinite;
    will-change: transform;
  }

  &.is-reverse .track {
    animation-direction: reverse;
  }

  .run {
    display: flex;
    align-items: center;
  }

  .word {
    font-size: clamp(0.95rem, 1.8vw, 1.45rem);
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: $plat;
    white-space: nowrap;
    padding: 0 0.5em;
  }

  .sep {
    color: $lime;
    font-size: 0.7em;
    padding: 0 0.4em;
  }
}

@keyframes marquee-scroll {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee .track {
    animation: none;
  }
}
</style>
