/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B87333', // Copper
        secondary: '#d4af37', // Soft Gold
        'background-light': '#E7E0D8', // Soft Beige
        'background-dark': '#0D0D0D', // Deep Charcoal
        'card-dark': '#1A1A1A', // Dark Slate
        'accent-gold': '#d4af37', // Soft Gold
        'text-beige': '#E7E0D8', // Soft Beige Text
        'text-muted': '#a19b93', // Muted beige
        // Dashboard colors
        'base': '#0D0D0D', // Same as background-dark
        'surface': '#1A1A1A', // Same as card-dark
        'on-surface': '#E7E0D8', // Same as text-beige
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
