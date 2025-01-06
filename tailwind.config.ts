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
      pattern: /bg-(red|blue|gray|green)-(300|400|500|600|700|900)/,
      variants: ['hover', 'active', 'focus']
    },
    {
      pattern: /text-(red|blue|gray)-(300|650|700|900)/,
      variants: ['hover', 'active', 'focus']
    },
    {
      pattern: /fill-(red|blue|gray|green)-(300|400|500|600|700|900)/,
      variants: ['hover', 'active', 'focus']
    },
    {
      pattern: /w-(1|2|3|4|5|6|7|8|9|10)/,
    },
    {
      pattern: /h-(1|2|3|4|5|6|7|8|9|10)/,
    },
  ],
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('hocus', ['&:hover', '&:focus']);
    }),
  ],
} satisfies Config;
