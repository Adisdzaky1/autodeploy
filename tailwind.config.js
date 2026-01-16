// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f3ff',
          purple: '#8a2be2',
          pink: '#ff00ff',
          green: '#00ff9d',
        },
        dark: {
          950: '#0a0a0a',
          900: '#111111',
          850: '#1a1a1a',
          800: '#222222',
          700: '#333333',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
        'gradient': 'gradient 8s linear infinite',
        'scan': 'scan 8s linear infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        glow: {
          'from': { 
            textShadow: '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 30px #00f3ff' 
          },
          'to': { 
            textShadow: '0 0 20px #00f3ff, 0 0 30px #00f3ff, 0 0 40px #00f3ff' 
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: 1, 
            boxShadow: '0 0 20px rgba(0, 243, 255, 0.5)' 
          },
          '50%': { 
            opacity: 0.7, 
            boxShadow: '0 0 40px rgba(0, 243, 255, 0.8)' 
          }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        }
      },
      backgroundImage: {
        'cyber-grid': `linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)`,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(45deg, #00f3ff, #8a2be2, #ff00ff)',
      }
    },
  },
  plugins: [],
}
