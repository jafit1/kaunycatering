import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f8f3",
          100: "#e1f0e6",
          200: "#c3e1cd",
          300: "#94c9a6",
          400: "#5ea97b",
          500: "#2f8a58",
          600: "#1c7045",
          700: "#145a38",
          800: "#0f4a2e",
          900: "#0b3b25",
          950: "#06251a",
        },
        accent: {
          DEFAULT: "#ffd43b",
          hover: "#f5c518",
          soft: "#fff6d6",
        },
        tangerine: "#f7931e",
        cherry: "#8e1b1b",

        // Legacy token names (dipakai panel admin) → dipetakan ke tema hijau baru
        "nav-bg": "#0b3b25",
        primary: "#0f4a2e",
        "primary-hover": "#0b3b25",
        "surface-1": "#f4f6f3",
        "surface-2": "#eaeee9",
        ink: "#0f1a14",
        "ink-body": "#3b4640",
        "ink-faded": "#7b8680",
        hairline: "#e3e8e3",
      },
      borderRadius: {
        // radius dibuat lebih kecil agar tampilan tegas & tidak terlalu bulat
        "aws-card": "12px",
        "aws-pill": "8px",
        "aws-sharp": "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
        "3xl": "14px",
        "4xl": "16px",
      },
      boxShadow: {
        "aws-elevation-1": "0 8px 24px -12px rgba(11,59,37,0.18)",
        soft: "0 1px 2px rgba(15,26,20,0.04), 0 8px 24px -12px rgba(15,26,20,0.12)",
        lift: "0 2px 4px rgba(15,26,20,0.04), 0 22px 40px -18px rgba(11,59,37,0.35)",
        pop: "0 24px 60px -20px rgba(6,37,26,0.45)",
      },
      fontFamily: {
        sans: ["\"Montserrat Variable\"", "Montserrat", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        "cart-blink": "cartBump 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        marquee: "marquee 28s linear infinite",
      },
      keyframes: {
        cartBump: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(-1.5deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
