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
        'sidebar-dark': '#050505', // Slightly darker than background
        'surface-dark': '#1A1A1A', // Dark Slate for cards/inputs
        'panel-dark': '#1A1A1A', // Dark Slate for cards/inputs
        'card-dark': '#1A1A1A', // Dark Slate
        'accent-gold': '#d4af37', // Soft Gold
        'accent-copper': '#B87333', // Copper
        'text-beige': '#E7E0D8', // Soft Beige Text
        'text-beige-muted': '#a19b93', // Muted beige
        'text-muted': '#a19b93', // Muted beige
        // Status colors
        "status-pending": "#a1a1aa", // metallic gray
        "status-accepted": "#3b82f6", // dark blue
        "status-processing": "#b87332", // copper
        "status-finished": "#84cc16", // golden green
        // Dashboard colors
        'base': '#0D0D0D', // Same as background-dark
        'surface': '#1A1A1A', // Same as card-dark
        'on-surface': '#E7E0D8', // Same as text-beige
        // Chat colors
        "p-base": "#0D0D0D",
        "p-panel": "#1A1A1A",
        "p-sidebar": "#111111",
        "a-copper": "#B87333",
        "a-gold": "#D4AF37",
        "a-beige": "#E7E0D8",
        "a-gray": "#A9A9A9"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
