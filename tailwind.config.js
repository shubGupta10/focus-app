/** @type {import('tailwindcss').Config} */
module.exports = {
  // Update this line to tell Tailwind to style EVERYTHING inside src/
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        textSecondary: 'var(--color-text-secondary)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        icon: 'var(--color-icon)',
      }
    },
  },
  plugins: [],
}
