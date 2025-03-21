// ...existing code...

module.exports = {
  // ...existing code...
  theme: {
    extend: {
      // ...existing theme extensions...
      animation: {
        // ...existing animations...
        'fadeOut': 'fadeOut 0.5s ease-in-out forwards',
      },
      keyframes: {
        // ...existing keyframes...
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
      },
    },
  },
  // ...existing code...
}