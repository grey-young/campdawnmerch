// Single source of truth for business / contact details used across the site
// (footer, contact page, and all policy pages). Update values here once.
export const useBusiness = () => {
  const phoneDigits = "233247042495";

  return {
    // Legal entity registered for payments (shown to Paystack for verification)
    legalName: "CampDawn Esport",
    // Public-facing store / brand name
    tradingName: "CampDawn Merch",
    tagline: "Branded gaming merchandise, shipped to your door.",

    email: "info@campdawnesports.com",
    emailHref: "mailto:info@campdawnesports.com",

    phone: "+233 247042495",
    phoneHref: `tel:+${phoneDigits}`,
    whatsappHref: `https://wa.me/${phoneDigits}`,

    address: {
      line1: "Awoshie",
      city: "Accra",
      region: "Greater Accra Region",
      country: "Ghana",
      full: "Awoshie, Accra, Greater Accra Region, Ghana",
    },

    socials: {
      instagram: "https://www.instagram.com/campdawn_esports",
      twitter: "https://x.com/campdawnesports",
      tiktok: "https://www.tiktok.com/@campdawn_esports",
    },
  };
};
