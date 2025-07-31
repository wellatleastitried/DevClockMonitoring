/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dev': {
          '50': '#f0f9ff',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
        },
        'wait': {
          '50': '#fef3c7',
          '500': '#f59e0b',
          '600': '#d97706',
          '700': '#b45309',
        },
        'danger': {
          '500': '#ef4444',
          '600': '#dc2626',
          '700': '#b91c1c',
        }
      }
    },
  },
  plugins: [],
}
