/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'itapay-blue': '#0066CC',
        'itapay-green': '#00CC66',
      },
    },
  },
  plugins: [],
}
