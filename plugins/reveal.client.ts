// Global `v-reveal` directive: fluid, fast scroll-in animation.
//
// Uses a single shared IntersectionObserver for the whole app (no per-element
// observers, no scroll listeners) so it stays cheap even with hundreds of
// elements. The actual motion is pure CSS (opacity + transform) defined by the
// `[data-reveal]` rules in assets/css/main.css, keeping it GPU-composited.
//
//   <div v-reveal />            → fade-up when it enters the viewport
//   <div v-reveal="120" />      → same, with a 120ms stagger delay
//   <li v-reveal="i * 80" />    → list stagger by index
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return;

  const supported =
    typeof window !== "undefined" && "IntersectionObserver" in window;

  let observer: IntersectionObserver | null = null;

  if (supported) {
    observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            obs.unobserve(entry.target);
          }
        }
      },
      // Trigger a touch before fully in view for a natural, eager feel.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
  }

  const reveal = {
    mounted(el: HTMLElement, binding: { value?: number }) {
      el.setAttribute("data-reveal", "");

      if (typeof binding.value === "number" && binding.value > 0) {
        el.style.transitionDelay = `${binding.value}ms`;
      }

      // No IO (or reduced motion handled in CSS) → just show it.
      if (!observer) {
        el.classList.add("reveal-in");
        return;
      }

      observer.observe(el);
    },

    unmounted(el: HTMLElement) {
      observer?.unobserve(el);
    },
  };

  nuxtApp.vueApp.directive("reveal", reveal);
});
