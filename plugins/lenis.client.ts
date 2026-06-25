// Momentum smooth-scroll (Lenis) wired into GSAP's ticker + ScrollTrigger.
//
// This is what gives the whole site its "weighted", premium scroll feel and
// makes every ScrollTrigger-driven animation (parallax, pins, scrubs) buttery
// and perfectly in sync. Driven by gsap.ticker so there's a single rAF loop.
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return;

  // Respect users who don't want motion: fall back to native scrolling.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const lenis = new Lenis({
    duration: 1.05,
    // expo-out: quick to settle, no rubbery tail
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  // Keep ScrollTrigger perfectly aligned to Lenis' virtual scroll position.
  lenis.on("scroll", ScrollTrigger.update);

  // One rAF loop for everything.
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // On client-side navigation, jump to top and recalc triggers for the new page.
  nuxtApp.hook("page:finish", () => {
    lenis.scrollTo(0, { immediate: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  // Let any component pause/resume or scroll programmatically.
  return {
    provide: { lenis },
  };
});
