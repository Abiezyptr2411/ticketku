/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#F0EBFF',
          DEFAULT: '#6C3BFF',
          dark: '#4B1FD1',
        },
        background: '#F8F8FC',
        card: '#FFFFFF',
        text: {
          primary: '#171717',
          secondary: '#777777',
        },
        border: '#E5E2EF'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
