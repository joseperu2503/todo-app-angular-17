/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "light-1": "#f4f5ef",
        "green-dark": "#263e3e",
        "green-light": "#b3ba91",
      },
    },
  },
  plugins: [],
};
