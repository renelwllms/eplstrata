const path = require("path");
const preset = require("./packages/design-system/tailwind.preset.js");

const root = __dirname;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    path.join(root, "app/**/*.{ts,tsx}"),
    path.join(root, "components/**/*.{ts,tsx}"),
    path.join(root, "lib/**/*.{ts,tsx}"),
    path.join(root, "packages/**/*.{ts,tsx}")
  ],
  presets: [preset],
  theme: {
    extend: {}
  },
  plugins: []
};
