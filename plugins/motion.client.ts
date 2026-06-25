// A small library of reusable scroll/pointer motion directives, all GSAP-driven
// and synced with Lenis + ScrollTrigger. Each directive cleans up after itself
// on unmount so route changes / HMR don't leak triggers.
//
//   v-fx                     fade-up into view on scroll
//   v-fx="{ y:60, delay:.1 }"
//   v-parallax="80"          scrubbed vertical parallax (px of travel)
//   v-split                  masked line reveal (SplitText)
//   v-split="'chars'"        per-character reveal
//   v-magnetic               pointer-magnetic hover (fine-pointer devices only)
//   v-magnetic="0.5"         stronger pull
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const app = nuxtApp.vueApp;

  // ── v-fx : scroll-in fade/rise ─────────────────────────────
  app.directive("fx", {
    mounted(el: HTMLElement, binding: any) {
      if (reduce) return;
      const o = typeof binding.value === "object" ? binding.value : {};
      const y = o.y ?? 42;
      gsap.set(el, { opacity: 0, y, willChange: "transform, opacity" });
      const st = ScrollTrigger.create({
        trigger: el,
        start: o.start || "top 86%",
        once: true,
        onEnter: () =>
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: o.duration ?? 0.95,
            delay: o.delay ?? 0,
            ease: "power3.out",
            onComplete: () => gsap.set(el, { willChange: "auto" }),
          }),
      });
      (el as any)._fx = st;
    },
    unmounted(el: HTMLElement) {
      (el as any)._fx?.kill();
    },
  });

  // ── v-parallax : scrubbed vertical drift ───────────────────
  app.directive("parallax", {
    mounted(el: HTMLElement, binding: any) {
      if (reduce) return;
      const dist =
        typeof binding.value === "number" ? binding.value : binding.value?.distance ?? 70;
      const tween = gsap.fromTo(
        el,
        { y: -dist },
        {
          y: dist,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
      (el as any)._px = tween;
    },
    unmounted(el: HTMLElement) {
      const t = (el as any)._px;
      t?.scrollTrigger?.kill();
      t?.kill();
    },
  });

  // ── v-split : masked SplitText reveal ──────────────────────
  app.directive("split", {
    mounted(el: HTMLElement, binding: any) {
      if (reduce) return;
      const type = (typeof binding.value === "string" ? binding.value : binding.value?.type) || "lines";
      const build = () => {
        const isChars = type === "chars";
        const split = new SplitText(el, {
          type: isChars ? "chars" : "lines",
          mask: isChars ? undefined : "lines",
          linesClass: "fx-line",
          charsClass: "fx-char",
        });
        const targets = isChars ? split.chars : split.lines;
        gsap.set(targets, { yPercent: 115, opacity: isChars ? 0 : 1 });
        const tween = gsap.to(targets, {
          yPercent: 0,
          opacity: 1,
          duration: isChars ? 0.7 : 0.95,
          stagger: isChars ? 0.025 : 0.12,
          ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
        (el as any)._split = { split, tween };
        ScrollTrigger.refresh();
      };
      // Split after fonts settle so line breaks are measured correctly.
      if ((document as any).fonts?.ready) {
        (document as any).fonts.ready.then(build);
      } else {
        build();
      }
    },
    unmounted(el: HTMLElement) {
      const s = (el as any)._split;
      s?.tween?.scrollTrigger?.kill();
      s?.tween?.kill();
      s?.split?.revert();
    },
  });

  // ── v-magnetic : pointer attraction ────────────────────────
  app.directive("magnetic", {
    mounted(el: HTMLElement, binding: any) {
      if (reduce || !finePointer) return;
      const strength = typeof binding.value === "number" ? binding.value : 0.35;
      const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * strength);
        qy((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const onLeave = () => {
        qx(0);
        qy(0);
      };
      el.style.willChange = "transform";
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      (el as any)._mag = { onMove, onLeave };
    },
    unmounted(el: HTMLElement) {
      const m = (el as any)._mag;
      if (m) {
        el.removeEventListener("mousemove", m.onMove);
        el.removeEventListener("mouseleave", m.onLeave);
      }
    },
  });
});
