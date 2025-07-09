export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
      },
      colors: {
        white: "hsl(0, 0%, 98%)",
        grey: {
          50: "hsl(228, 33%, 97%)",
          100: "hsl(223, 19%, 93%)",
          500: "hsl(211, 10%, 45%)",
          800: "hsl(212, 24%, 26%)",
        },
        pink: {
          200: "hsl(357, 100%, 86%)",
          400: "hsl(358, 79%, 66%)"
        },
        purple: {
          200: "hsl(239, 57%, 85%)",
          600: "hsl(238, 40%, 52%)"
        }
      }
    },
  },
}
