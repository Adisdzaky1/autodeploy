// pages/_app.js
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="fixed inset-0 bg-gradient-to-br from-dark-950 via-purple-950/20 to-dark-950 -z-10" />
      <div className="fixed inset-0 hologram-grid -z-10 opacity-10" />
      <div className="scan-line -z-10" />
      
      {mounted && <Component {...pageProps} />}
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(17, 17, 17, 0.9)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#00ff9d',
              secondary: '#111',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4444',
              secondary: '#111',
            },
          },
        }}
      />
    </div>
  )
}

export default MyApp
