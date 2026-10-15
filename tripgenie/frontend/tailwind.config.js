/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f4f4',
          100: '#b3dede',
          200: '#80c8c8',
          300: '#4db2b2',
          400: '#26a0a0',
          DEFAULT: '#0D7377',
          600: '#0b666a',
          700: '#08545a',
          800: '#064348',
          900: '#032330',
        },
        accent: {
          50:  '#fef6ed',
          100: '#fde4c8',
          200: '#fbd1a0',
          300: '#f8be78',
          400: '#f6b05a',
          DEFAULT: '#F4A261',
          600: '#e8864a',
          700: '#d46535',
          800: '#b84820',
          900: '#8c2e0e',
        },
        surface: '#FAF7F2',
        dark: '#14213D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
