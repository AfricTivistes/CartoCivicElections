import ogImageSrc from "@images/social.png";

export const SITE = {
  title: "SOOBU",
  tagline: "Mapping of CSO Initiatives",
  description: "The Mapping of CSO Initiatives by AfricTivistes is an interactive platform that centralizes and visualizes the initiatives of civil society organizations (CSOs) in Africa related to elections. This platform aims to promote transparency, integrity, and citizen participation in electoral processes, while facilitating collaborations among CSOs and sharing best practices in electoral governance.",
  description_short: "Platform for mapping civil society initiatives related to elections in Africa by AfricTivistes.",
  url: "https://initiative4elections.tech/",
  author: "AfricTivistes",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "en-US",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  locale: "en_US",
  type: "website",
  url: SITE.url,
  title: `${SITE.title}: : Mapping of CSO Initiatives`,
  description: "The Mapping of CSO Initiatives by AfricTivistes is an interactive platform that centralizes and visualizes the initiatives of civil society organizations (CSOs) in Africa related to elections. This platform aims to promote transparency, integrity, and citizen participation in electoral processes, while facilitating collaborations among CSOs and sharing best practices in electoral governance.",
  image: ogImageSrc,
};
