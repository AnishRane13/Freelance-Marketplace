/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        keyframes: {
          modalFadeIn: {
            '0%': { opacity: 0, transform: 'scale(0.95)' },
            '100%': { opacity: 1, transform: 'scale(1)' }
          }
        },
        animation: {
          modalFadeIn: 'modalFadeIn 0.2s ease-out'
        }
      }
  },
  plugins: [],
}