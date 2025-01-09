// An array of links for navigation bar
const navBarLinks = [
  { name: "About", url: "/about" },
  { name: "Initiatives", url: "/initiatives" },
  { name: "Contact", url: "/contact" },
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
// An array of links for footer
const footerLinks = [
  {
    section: "Project",
    links: [
      { name: "AHEAD AFRICA", url: "#" },
      { name: "Project", url: "#" },
      { name: "About", url: "#" },
    ],
  },
  {
    section: "Company",
    links: [
      { name: "About us", url: "#" },
      { name: "Blog", url: "#" },
      { name: "Careers", url: "#" },
      { name: "Customers", url: "#" },
    ],
  },
];
// An object of links for social icons
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
