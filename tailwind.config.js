/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}','./components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        shim: {
          bg:'#07070f', bgalt:'#0e0e1f', card:'#12122a', cardH:'#1a1a38',
          primary:'#c8446a', primaryH:'#e05580', accent:'#f4a7bc',
          accentD:'#9b3055', gold:'#e8c97a', muted:'#7a6a80',
          text:'#f0eaf4', textD:'#9a8aaa',
          border:'rgba(200,68,106,0.2)',
        }
      },
      fontFamily: { display:['"Cinzel Decorative"','serif'], jp:['"Noto Sans JP"','sans-serif'] },
    },
  },
  plugins: [],
}
