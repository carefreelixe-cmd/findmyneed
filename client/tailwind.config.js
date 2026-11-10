/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1B3A5F",
          white: "#FFFFFF",
          gray: "#F5F7FA",
          charcoal: "#2C3E50",
        },
        success: {
          green: "#00A86B",
        },
        alert: {
          red: "#DC3545",
        },
      },
    },
  },
  plugins: [],
};
