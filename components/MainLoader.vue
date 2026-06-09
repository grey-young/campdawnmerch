<template>
  <div class="loader">
    <div class="content">
      <div class="container">
        <h1>
          <span>Welcome</span>
          <span> To</span>
          <span> CampDawn </span>
        </h1>

        <div class="image">
          <img src="/logo.png" alt="" />
        </div>
      </div>
      <div class="animate"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: "MainLoader",
  mounted() {
    const tl = this.$gsap.timeline({
      defaults: { ease: "power3.out", duration: 1 },
    });

    tl.to(".loader .container h1 span", {
      y: 0,
      opacity: 1,
      stagger: 0.2,
    })
      .to(
        ".loader .container .image img",
        {
          y: 0,
          opacity: 1,
        },
        "-=0.8",
      )
      .to(".loader .animate", {
        y: "-100%",
        duration: 1.2,
        ease: "power3.inOut",
      })
      .to(
        ".loader",
        {
          y: "-100%",
          duration: 1.2,
          ease: "power3.inOut",
        },
        "-=0.6",
      )
      .set(".loader", { display: "none" });
  },
};
</script>
<style lang="scss" scoped>
.loader {
  width: 100%;
  height: 100vh;
  background: #000;
  color: #fff;
  position: fixed;
  z-index: 9999;

  .content {
    position: relative;
    height: inherit;
    width: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .container {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    h1 {
      font-size: 48px;
      margin-bottom: 20px;
      overflow: hidden;

      span {
        display: inline-block;
        margin-left: 20px;
        transform: translateY(100%);
      }
    }

    .image {
      width: 150px;
      height: auto;
      overflow: hidden;

      img {
        width: 100%;
        height: auto;
        transform: translateY(100%);
      }
    }
  }

  .animate {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    transform: translateY(100%);
  }
}
</style>
