'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import ChatBox from '@/components/ChatBox'

// Dynamically import Map component to avoid SSR issues with Mapbox GL JS
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ color: 'white', textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '2px solid white',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p>Loading Travio...</p>
      </div>
    </div>
  )
})

type MapHandle = {
  resetView: () => void
  zoomToCity: (cityName: string) => void
}

export default function Home() {
  const [isChatActive, setIsChatActive] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [spinEnabled, setSpinEnabled] = useState(true)
  const mapRef = useRef<MapHandle | null>(null)
  
  // Get Mapbox access token from environment variable
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  if (!mapboxAccessToken) {
                  return (
                <div style={{
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div className="card-glass bounce-in" style={{ 
                    textAlign: 'center', 
                    maxWidth: '500px', 
                    padding: '32px',
                    color: 'var(--text-primary)'
                  }}>
                    <h1 className="text-gradient" style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: 'bold', 
                      marginBottom: '20px' 
                    }}>
                      Travio
                    </h1>
                    <p style={{ 
                      marginBottom: '24px', 
                      fontSize: '1.125rem',
                      color: 'var(--text-secondary)'
                    }}>
                      Please set your Mapbox access token to get started.
                    </p>
                    <div className="glass-weak" style={{
                      padding: '20px',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      marginBottom: '20px'
                    }}>
                      <p style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
                        Add this to your <code style={{ color: 'var(--text-accent)' }}>.env.local</code> file:
                      </p>
                      <code className="glass" style={{
                        display: 'block',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace'
                      }}>
                        NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
                      </code>
                    </div>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--text-secondary)',
                      marginBottom: '16px'
                    }}>
                      Get your token from{' '}
                      <a 
                        href="https://account.mapbox.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gradient-blue"
                        style={{ textDecoration: 'underline' }}
                      >
                        Mapbox Account
                      </a>
                    </p>
                  </div>
                </div>
              )
  }

  const handleChatStart = () => {
    setIsChatActive(true)
  }

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName)
    // Ensure chat opens when a city is picked so options show up
    setIsChatActive(true)
    // Zoom to the selected city
    if (mapRef.current?.zoomToCity) {
      mapRef.current.zoomToCity(cityName)
    }
  }

  const handleZoomToCity = (cityName: string) => {
    // Persist selected city and open chat to show options
    setSelectedCity(cityName)
    setIsChatActive(true)
    if (mapRef.current?.zoomToCity) {
      mapRef.current.zoomToCity(cityName)
    }
  }

  const handleToggleSpin = () => {
    setSpinEnabled(!spinEnabled)
  }

  const handleResetView = () => {
    if (mapRef.current?.resetView) {
      mapRef.current.resetView()
    }
  }

                return (
                <main style={{
                  width: '100vw',
                  height: '100vh',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
      {/* ChatBox Component */}
      <ChatBox 
        isActive={isChatActive} 
        onChatStart={handleChatStart}
        selectedCity={selectedCity}
        onToggleSpin={handleToggleSpin}
        onResetView={handleResetView}
        spinEnabled={spinEnabled}
        onZoomToCity={handleZoomToCity}
      />
      
      {/* Map Component */}
      <Map 
        ref={mapRef}
        accessToken={mapboxAccessToken} 
        isChatActive={isChatActive}
        onCitySelect={handleCitySelect}
        spinEnabled={spinEnabled}
        selectedCity={selectedCity}
      />
    </main>
  )
}
