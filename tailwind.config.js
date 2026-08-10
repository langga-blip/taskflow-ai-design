/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0A0C14',
        darkCard: '#131726',
        darkCardVariant: '#1E2338',
        lightBg: '#F8FAFC',
        lightCard: '#FFFFFF',
        lightCardVariant: '#F1F5F9',
        purplePrimary: '#7C3AED',
        purpleVivid: '#8B5CF6',
        blueElectric: '#2563EB',
        cyanNeon: '#06B6D4',
        greenSuccess: '#00E676',
        goldImpact: '#F59E0B',
        redUrgent: '#EF4444',
        glassBorder: '#2E3552',
        glassBorderLight: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
