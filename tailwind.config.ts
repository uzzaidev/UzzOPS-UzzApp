import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        uzzai: {
          primary: '#2D6A5E', // Verde escuro
          secondary: '#4A90A4', // Azul médio (turquesa)
          warning: '#F4D03F', // Amarelo/Dourado
          dark: '#1F1F1F', // Preto/Charcoal
          gray: '#B0B0B0', // Cinza médio
        },
      },
    },
  },
  plugins: [],
};

export default config;
