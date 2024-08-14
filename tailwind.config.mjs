/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

import colors from 'tailwindcss/colors';
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./node_modules/preline/preline.js",
  ],
  darkMode: "class",
  theme: {
    colors: {
      white: "#ffffff",
      neutral: colors.neutral, 
      primary: {
        black: "#000000",
        yellow: "#FFC24A",
        orange: "#FF5836",
        green: "#6EC770",
        blue: "#2D83F5",
      },
      secondary: {
        beige: "#EBDED4",
        teal: "#4DA29A",
      },
      neutral: {
        ...require('tailwindcss/colors').neutral,
      },
      gray: require('tailwindcss/colors').gray,
      indigo: require('tailwindcss/colors').indigo,
      red: require('tailwindcss/colors').red,
      zinc: require('tailwindcss/colors').zinc,
    },
    extend: {
      fontFamily: {
        onest: ['"Onest Bold"', 'sans-serif'],
        paragraph: ['"Paragraph font"', 'sans-serif'],
        light: ['"Light"', 'sans-serif'],
        normal: ['"Book,Normal"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("tailwindcss/nesting"),
    require("preline/plugin"),
    require("@tailwindcss/forms"),
  ],
};
