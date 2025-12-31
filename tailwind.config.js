/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#DC2626',
          green: '#059669',
          gold: '#F59E0B',
          snow: '#F8FAFC',
        },
      },
      animation: {
        snow: "snow 20s linear infinite",
        guirlande: "guirlande 3s ease-in-out infinite",
      },
      keyframes: {
        snow: {
          "0%": { transform: "translateY(-100vh) rotate(0deg)" },
          "100%": { transform: "translateY(100vh) rotate(360deg)" },
        },
        guirlande: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
