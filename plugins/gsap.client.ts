import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrambleTextPlugin,
    SplitText,
    Draggable,
    InertiaPlugin,
  );

  return {
    provide: {
      gsap,
      SplitText,
      ScrollTrigger,
      Draggable,
    },
  };
});
