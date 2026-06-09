// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      title: "CampDawn Merch ",
      meta: [
        {
          name: "description",
          content:
            "CampDawn is a competitive gaming and esports tournament platform where players and teams compete, track match results, and climb global leaderboards. Join tournaments, challenge top players, and dominate the battlefield.",
        },
        {
          name: "keywords",
          content:
            "CampDawn, esports tournaments, gaming tournaments platform, competitive gaming, online esports competitions, gaming brackets, tournament platform, esports teams, match results tracking, gaming leaderboards",
        },
        {
          name: "author",
          content: "CampDawn",
        },
        {
          name: "robots",
          content: "index, follow",
        },

        {
          name: "og:title",
          content: "CampDawn | Competitive Esports & Gaming Tournaments",
        },
        {
          name: "og:description",
          content:
            "Join competitive gaming tournaments on CampDawn. Create teams, compete in brackets, submit match results, and climb the esports leaderboards.",
        },
        {
          name: "og:type",
          content: "website",
        },
        {
          name: "og:site_name",
          content: "CampDawn",
        },

        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: "CampDawn | Competitive Gaming Platform",
        },
        {
          name: "twitter:description",
          content:
            "Compete in esports tournaments, join teams, and rise through the CampDawn leaderboards.",
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
