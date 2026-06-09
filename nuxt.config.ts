// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      titleTemplate: "%s",
      title:
        "CampDawn Merch | Branded Clothing, Hoodies, T-Shirts, Caps & Accessories",
      meta: [
        {
          name: "description",
          content:
            "CampDawn Merch is an online store for branded gaming merchandise. We sell clothing, hoodies, t-shirts, caps, and accessories and ship every order to customers across Ghana and worldwide. Operated by CampDawn Esport.",
        },
        {
          name: "keywords",
          content:
            "CampDawn Merch, branded merchandise, gaming clothing, hoodies, t-shirts, caps, accessories, online store Ghana, buy merch Ghana, esports apparel, streetwear",
        },
        {
          name: "author",
          content: "CampDawn Esport",
        },
        {
          name: "robots",
          content: "index, follow",
        },

        {
          property: "og:title",
          content:
            "CampDawn Merch | Branded Clothing, Hoodies, Caps & Accessories",
        },
        {
          property: "og:description",
          content:
            "Shop branded gaming merchandise. Hoodies, t-shirts, caps, and accessories delivered to your door across Ghana and worldwide.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "CampDawn Merch",
        },
        {
          property: "og:image",
          content: "/logo.png",
        },

        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: "CampDawn Merch | Branded Gaming Merchandise",
        },
        {
          name: "twitter:description",
          content:
            "Branded hoodies, t-shirts, caps, and accessories shipped to customers across Ghana and internationally.",
        },

        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        { charset: "utf-8" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/logo.png" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0",
        },
      ],
    },
  },

  css: ["@/assets/css/main.css"],
  ssr: false,

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
  nitro: {
    firebase: {
      gen: 2,
    },
  },
});
