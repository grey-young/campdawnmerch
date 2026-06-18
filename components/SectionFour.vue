<template>
  <section class="section-4">
    <div class="text">
      <h1>Stay In The Loop</h1>
      <p>Follow Our Social Media For The Latest Updates!</p>
    </div>

    <div class="circle">
      <img
        src="/logo.png"
        alt="CampDawn Logo"
        class="center-logo"
        loading="lazy"
        decoding="async"
      />
      <a
        href="https://www.instagram.com/campdawn_esports"
        class="social-icon social-1"
        target="_blank"
        ><i class="bi bi-instagram"></i
      ></a>
      <a
        href="https://x.com/campdawnesports"
        class="social-icon social-2"
        target="_blank"
        ><i class="bi bi-twitter"></i
      ></a>
      <a
        href="mailto:campdawn06@gmail.com"
        class="social-icon social-3"
        target="_blank"
        ><i class="bi bi-envelope"></i
      ></a>
      <a
        href="https://www.tiktok.com/@campdawn_esports"
        class="social-icon social-4"
        target="_blank"
        ><i class="bi bi-tiktok"></i
      ></a>
    </div>
  </section>
</template>
<script>
export default {
  name: "SectionFour",
  data() {
    return {
      orbitTimeline: null,
      revealTimeline: null,
    };
  },
  mounted() {
    this.$gsap.set(".section-4 .text h1", { opacity: 0, y: 30 });
    this.$gsap.set(".section-4 .text p", { opacity: 0, y: 30 });
    this.$gsap.set(".center-logo", { opacity: 0, scale: 0 });
    this.$gsap.set(".social-icon", { opacity: 0, scale: 0 });

    const tl = (this.revealTimeline = this.$gsap
      .timeline({
        scrollTrigger: {
          trigger: ".section-4",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })
      .to(
        [".section-4 .text h1", ".section-4 .text p"],
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
        },
        0,
      )
      .to(
        ".center-logo",
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out",
        },
        "-=0.4",
      )
      .to(
        ".social-icon",
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out",
          stagger: 0.12,
        },
        "-=0.3",
      ));

    // Create continuous orbit animation
    this.orbitTimeline = this.$gsap
      .timeline({ repeat: -1 })
      .to(
        ".section-4 .circle",
        {
          rotation: 360,
          duration: 20,
          ease: "none",
        },
        0,
      )
      .to(
        ".center-logo",
        {
          rotation: -360,
          duration: 20,
          ease: "none",
        },
        0,
      );

    // Pause orbit on hover, resume on leave
    this.pauseOrbit = () => this.orbitTimeline && this.orbitTimeline.pause();
    this.resumeOrbit = () => this.orbitTimeline && this.orbitTimeline.play();
    this.socialIcons = Array.from(document.querySelectorAll(".social-icon"));
    this.socialIcons.forEach((icon) => {
      icon.addEventListener("mouseenter", this.pauseOrbit);
      icon.addEventListener("mouseleave", this.resumeOrbit);
    });
  },

  beforeUnmount() {
    // Stop the infinite orbit and the scroll-triggered reveal so they don't
    // keep ticking on detached nodes after leaving the page.
    if (this.orbitTimeline) this.orbitTimeline.kill();

    if (this.revealTimeline) {
      if (this.revealTimeline.scrollTrigger) {
        this.revealTimeline.scrollTrigger.kill();
      }
      this.revealTimeline.kill();
    }

    (this.socialIcons || []).forEach((icon) => {
      icon.removeEventListener("mouseenter", this.pauseOrbit);
      icon.removeEventListener("mouseleave", this.resumeOrbit);
    });
  },
};
</script>
<style lang="scss" scoped>
.section-4 {
  height: 80vh;
  background: #fff;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;

  .text {
    text-align: center;
    margin-bottom: 60px;

    h1 {
      font-size: 36px;
      text-transform: uppercase;
      opacity: 0;
      transform: translateY(30px);
    }

    p {
      font-size: 18px;
      margin-top: 15px;
      opacity: 0;
      transform: translateY(30px);
    }
  }

  .circle {
    position: relative;
    width: 350px;
    height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;

    .center-logo {
      width: 120px;
      height: 120px;
      position: absolute;
      opacity: 0;
      transform: scale(0);
      z-index: 10;
    }

    .social-icon {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #000;
      text-decoration: none;
      opacity: 0;
      transform: scale(0);
      transition:
        background 0.3s ease,
        color 0.3s ease;

      &:hover {
        background: #000;
        color: #fff;
      }

      &.social-1 {
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      &.social-2 {
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }

      &.social-3 {
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      &.social-4 {
        top: 50%;
        left: 0;
        transform: translateY(-50%);
      }
    }
  }
}

@media (max-width: 768px) {
  .section-4 {
    padding: 40px 20px;

    .text {
      margin-bottom: 40px;

      h1 {
        font-size: 28px;
      }

      p {
        font-size: 16px;
      }
    }

    .circle {
      width: 280px;
      height: 280px;

      .center-logo {
        width: 90px;
        height: 90px;
      }

      .social-icon {
        width: 50px;
        height: 50px;
        font-size: 18px;
      }
    }
  }
}

@media (max-width: 480px) {
  .section-4 {
    height: auto;
    padding: 30px 16px;
    min-height: auto;

    .text {
      margin-bottom: 30px;

      h1 {
        font-size: 24px;
      }

      p {
        font-size: 14px;
        margin-top: 10px;
      }
    }

    .circle {
      width: 220px;
      height: 220px;

      .center-logo {
        width: 70px;
        height: 70px;
      }

      .social-icon {
        width: 42px;
        height: 42px;
        font-size: 14px;
      }
    }
  }
}
</style>
