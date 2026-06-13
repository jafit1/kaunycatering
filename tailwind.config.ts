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
        'nav-bg': '#0f141a',
        'primary': '#ea580c',
        'primary-hover': '#c2410c',
        'surface-1': '#f3f3f7',
        'surface-2': '#e2e2e8',
        'ink': '#1a1a1a',
        'ink-body': '#2d333a',
        'ink-faded': '#687078',
        'hairline': '#ccccd1',
      },
      borderRadius: {
        'aws-card': '16px',
        'aws-pill': '40px',
        'aws-sharp': '0px',
      },
      boxShadow: {
        'aws-elevation-1': '1px 1px 20px rgba(0,0,0,0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      animation: {
        'cart-blink': 'cartBlink 0.4s ease-in-out',
      },
      keyframes: {
        cartBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
