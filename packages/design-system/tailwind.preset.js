module.exports = {
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0a1a2b",
          800: "#12243a",
          700: "#1c3350",
          500: "#5a6a7d"
        },
        sand: {
          50: "#f7fbff",
          100: "#eef4ff",
          200: "#d8e4f6"
        },
        ocean: {
          500: "#2b7cc2",
          600: "#1e5aa8"
        },
        ember: {
          500: "#5aa7e6"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"]
      },
      boxShadow: {
        soft: "0 10px 40px rgba(10, 10, 20, 0.15)",
        card: "0 12px 30px rgba(9, 9, 20, 0.12)"
      }
    }
  }
};
