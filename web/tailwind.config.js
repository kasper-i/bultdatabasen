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
        analogous: {
          50: "#F7D0FA",
          100: "#F4BDF8",
          200: "#EE98F4",
          300: "#E874F0",
          400: "#E24FEC",
          500: "#DC2AE8",
          600: "#BA15C5",
          700: "#8A1092",
          800: "#5A0A5F",
          900: "#2A052D",
        },
      },
    },
  },
};
