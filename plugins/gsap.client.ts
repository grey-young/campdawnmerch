import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);

  return {
    provide: {
      gsap,
      SplitText,
      ScrollTrigger,
    },
  };
});
