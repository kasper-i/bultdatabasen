const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          50: "#E2D0FA",
          100: "#D7BDF8",
          200: "#C098F4",
          300: "#AA74F0",
          400: "#934FEC",
          500: "#7D2AE8",
          600: "#6215C5",
          700: "#491092",
          800: "#2F0A5F",
          900: "#16052D",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
