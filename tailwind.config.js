/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF5F0",
          100: "#FFE6D9",
          200: "#FFC9B3",
          300: "#FFA880",
          400: "#FF8B59",
          500: "#FF6B35",
          600: "#E55520",
          700: "#CC4515",
          800: "#A33610",
          900: "#7A280B",
        },
        accent: {
          yellow: "#FFD166",
          green: "#06D6A0",
          red: "#EF476F",
        },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "bounce-subtle": "bounceSubtle 2s infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};
