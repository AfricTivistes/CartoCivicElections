// An array of links for navigation bar
const navBarLinks = [
  { name: "A Propos", url: "/fr/about" },
  { name: "Initiatives", url: "/fr/initiatives" },
  { name: "Contact", url: "/fr/contact" },
];
const navBarAhead = [
  { name: "About", url: "https://ahead.africa/about/" },
  { name: "Countries", url: "https://ahead.africa/countries/" },
  { name: "Learning", url: "https://ahead.africa/learning/" },
  { name: "Research", url: "https://ahead.africa/research/" },
  { name: "Advocacy", url: "https://ahead.africa/advocacy/" },
  { name: "Opportunities", url: "https://ahead.africa/opportunities/" },
  { name: "News", url: "https://ahead.africa/news/" },
  { name: "Events", url: "https://ahead.africa/events/" },
]
const footerLinks = [
  {
    section: "Projet",
    links: [
      { name: "AHEAD AFRICA", url: "#" },
      { name: "Le projet", url: "#" },
      { name: "A propos", url: "#" },
    ],
  },
  {
    section: "Société",
    links: [
      { name: "À propos", url: "#" },
      { name: "Blog", url: "#" },
      { name: "Carrières", url: "#" },
      { name: "Clients", url: "#" },
    ],
  },
];

const socialLinks = {
  facebook: "https://www.facebook.com/profile.php?id=61558341643684",
  x: "https://x.com/AHEADxAfrica",
  github: "https://github.com/mearashadowfax/ScrewFast",
  google: "#",
  slack: "#",
  linkedin: "https://www.linkedin.com/company/ahead-africa/"
};

export default {
  navBarLinks,
  navBarAhead,
  footerLinks,
  socialLinks,
};
