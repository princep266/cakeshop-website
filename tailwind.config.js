/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'cake-pink': '#FFE5F1',
        'cake-brown': '#8B4513',
        'cake-cream': '#FFF8DC',
        'cake-red': '#FF6B6B',
      },
    },
  },
  plugins: [],
}

