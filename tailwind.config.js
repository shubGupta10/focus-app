/** @type {import('tailwindcss').Config} */
module.exports = {
  // Update this line to tell Tailwind to style EVERYTHING inside src/
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
