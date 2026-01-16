// pages/_app.js
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-dark-950 relative">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-dark-950 via-purple-950/20 to-dark-950 -z-10" />
      <div className="fixed inset-0 hologram-grid -z-10 opacity-[0.03]" />
      <div className="scan-line -z-10" />
      
      {/* Animated floating elements */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl animate-float -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '2s' }} />
      
      {mounted && <Component {...pageProps} />}
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'glass-effect border border-neon-blue/30',
          style: {
            background: 'rgba(17, 17, 17, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#00ff9d',
              secondary: '#111',
            },
            className: 'border-neon-green/30',
          },
          error: {
            iconTheme: {
              primary: '#ff4444',
              secondary: '#111',
            },
            className: 'border-red-500/30',
          },
        }}
      />
    </div>
  )
}

export default MyApp
