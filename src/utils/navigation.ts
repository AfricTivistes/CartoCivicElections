// An array of links for navigation bar
const navBarLinks = [
  { name: "About", url: "#" },
  { name: "Initiatives", url: "#" },
  { name: "News", url: "#" },
  { name: "Contact", url: "/contact" },
];
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
  facebook: "https://www.facebook.com/",
  x: "https://twitter.com/",
  github: "https://github.com/mearashadowfax/ScrewFast",
  google: "https://www.google.com/",
  slack: "https://slack.com/",
};

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
};