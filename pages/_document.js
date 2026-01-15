// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            darkMode: 'class',
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
                  }
                },
                animation: {
                  'glow': 'glow 2s ease-in-out infinite alternate',
                  'float': 'float 6s ease-in-out infinite',
                  'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
                  'gradient': 'gradient 8s linear infinite',
                },
                keyframes: {
                  glow: {
                    'from': { textShadow: '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 30px #00f3ff' },
                    'to': { textShadow: '0 0 20px #00f3ff, 0 0 30px #00f3ff, 0 0 40px #00f3ff' }
                  },
                  float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' }
                  },
                  'pulse-glow': {
                    '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(0, 243, 255, 0.5)' },
                    '50%': { opacity: 0.7, boxShadow: '0 0 40px rgba(0, 243, 255, 0.8)' }
                  },
                  gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' }
                  }
                }
              }
            }
          }
        </script>
        <style jsx global>{`
          body {
            background: #0a0a0a;
            color: white;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
          }
          
          ::-webkit-scrollbar {
            width: 10px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #00f3ff, #8a2be2);
            border-radius: 10px;
          }
          
          .cyber-border {
            position: relative;
            border: 2px solid transparent;
            background: linear-gradient(#0a0a0a, #0a0a0a) padding-box,
                        linear-gradient(45deg, #00f3ff, #8a2be2, #ff00ff) border-box;
          }
          
          .cyber-glow {
            box-shadow: 0 0 30px rgba(0, 243, 255, 0.3),
                        0 0 60px rgba(138, 43, 226, 0.2),
                        0 0 90px rgba(255, 0, 255, 0.1);
          }
          
          .gradient-text {
            background: linear-gradient(45deg, #00f3ff, #8a2be2, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .hologram-grid {
            background-image: 
              linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
          }
          
          .neon-button {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 243, 255, 0.3);
            transition: all 0.3s ease;
          }
          
          .neon-button:hover {
            border-color: #00f3ff;
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.5);
            transform: translateY(-2px);
          }
          
          .terminal-font {
            font-family: 'Courier New', monospace;
          }
          
          .glass-effect {
            background: rgba(17, 17, 17, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .cyber-line {
            height: 1px;
            background: linear-gradient(90deg, transparent, #00f3ff, #8a2be2, transparent);
          }
          
          .scan-line {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              to bottom,
              transparent 0%,
              rgba(0, 243, 255, 0.1) 50%,
              transparent 100%
            );
            animation: scan 8s linear infinite;
          }
          
          @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `}</style>
      </Head>
      <body className="bg-dark-950 text-gray-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
