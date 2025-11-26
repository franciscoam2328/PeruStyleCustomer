/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        "background-light": "#ffffff",
        "background-dark": "#111827",
        "text-main": "#1f2937", // Gray-800
        "text-muted": "#6b7280", // Gray-500
        "accent-teal": "#a8dadc", // For the hero background
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        sans: ["Montserrat", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
      },
    },
  },
  plugins: [],
}
