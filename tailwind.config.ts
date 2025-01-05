import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  safelist: [
    {
      pattern:
        /bg-(red|blue|gray|green)-(300|400|500|600|700|900)/,
      variants: ['hover', 'active', 'focus']
    },
    {
      pattern: /text-(red|blue|gray)-(300|650|700|900)/,
      variants: ['hover', 'active', 'focus']
    },
    {
      pattern:
        /fill-(red|blue|gray|green)-(300|400|500|600|700|900)/,
      variants: ['hover', 'active', 'focus']
    },
  ],
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('hocus', ['&:hover', '&:focus']);
    }),
  ],
} satisfies Config;
