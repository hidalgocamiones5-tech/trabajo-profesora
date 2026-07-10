/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lemon': {
          DEFAULT: '#A2D729',
          50: '#F2F9E5',
          100: '#E6F4CC',
          200: '#CDE999',
          300: '#B4DE66',
          400: '#9AD333',
          500: '#A2D729',
          600: '#7FA620',
          700: '#5C7617',
          800: '#3A4B0E',
          900: '#171E05',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
