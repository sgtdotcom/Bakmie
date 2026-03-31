import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        g: {
          DEFAULT: '#1B4A3A',
          2: '#153C2E',
          3: '#0E2820',
          4: '#245E4A',
          5: '#3A7A60',
        },
        gold: {
          DEFAULT: '#C8960A',
          2: '#E8B020',
          3: '#F5C840',
        },
        cream: {
          DEFAULT: '#F5EDD8',
          2: '#EDE0C4',
          3: '#D9CCB0',
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
