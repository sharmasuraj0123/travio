'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapProps {
  accessToken: string
  isChatActive: boolean
  onCitySelect?: (cityName: string) => void
  spinEnabled?: boolean
  selectedCity?: string
}

interface MapRef {
  resetView: () => void
  zoomToCity: (cityName: string) => void
}

// Supported cities with their coordinates
interface CityCoordinates {
  lng: number
  lat: number
}

const SUPPORTED_CITIES: Record<string, CityCoordinates> = {
  // Europe
  'Paris': { lng: 2.3522, lat: 48.8566 },
  'London': { lng: -0.1276, lat: 51.5074 },
  'Berlin': { lng: 13.4050, lat: 52.5200 },
  'Rome': { lng: 12.4964, lat: 41.9028 },
  'Bruges': { lng: 3.3792, lat: 51.9225 },
  'Amsterdam': { lng: 4.9041, lat: 52.3676 },
  'Barcelona': { lng: 2.1734, lat: 41.3851 },
  'Copenhagen': { lng: 12.5683, lat: 55.6761 },
  'Vienna': { lng: 16.3738, lat: 48.2082 },
  'Budapest': { lng: 19.0402, lat: 47.4979 },
  'Prague': { lng: 14.4378, lat: 50.0755 },
  'Warsaw': { lng: 21.0122, lat: 52.2297 },
  'Kyiv': { lng: 30.5234, lat: 50.4501 },
  'Moscow': { lng: 37.6173, lat: 55.7558 },
  
  // Asia
  'Tokyo': { lng: 139.6917, lat: 35.6895 },
  'Seoul': { lng: 126.9780, lat: 37.5665 },
  'Hong Kong': { lng: 114.0579, lat: 22.5431 },
  'Shanghai': { lng: 121.4737, lat: 31.2304 },
  'Beijing': { lng: 116.4074, lat: 39.9042 },
  'Mumbai': { lng: 72.8777, lat: 19.0760 },
  'New Delhi': { lng: 77.2090, lat: 28.6139 },
  'Kolkata': { lng: 88.3639, lat: 22.5726 },
  'Bangkok': { lng: 100.5018, lat: 13.7563 },
  'Ho Chi Minh City': { lng: 106.6297, lat: 10.8231 },
  'Singapore': { lng: 103.8198, lat: 1.3521 },
  'Jakarta': { lng: 106.8456, lat: -6.2088 },
  'Manila': { lng: 120.9842, lat: 14.5995 },
  
  // Americas
  'New York': { lng: -74.006, lat: 40.7128 },
  'Los Angeles': { lng: -118.2437, lat: 34.0522 },
  'Chicago': { lng: -87.6298, lat: 41.8781 },
  'Houston': { lng: -95.3698, lat: 29.7604 },
  'Miami': { lng: -80.1918, lat: 25.7617 },
  'Toronto': { lng: -79.3832, lat: 43.6532 },
  'Vancouver': { lng: -123.1207, lat: 49.2827 },
  'Mexico City': { lng: -99.1332, lat: 19.4326 },
  'São Paulo': { lng: -46.6333, lat: -23.5505 },
  'Buenos Aires': { lng: -58.3816, lat: -34.6037 },
  'Santiago': { lng: -70.6483, lat: -33.4489 },
  'Lima': { lng: -77.0428, lat: -12.0464 },
  
  // Africa
  'Cairo': { lng: 31.2357, lat: 30.0444 },
  'Lagos': { lng: 3.3792, lat: 6.5244 },
  'Cape Town': { lng: 18.4241, lat: -33.9249 },
  'Nairobi': { lng: 36.8172, lat: -1.2921 },
  'Victoria': { lng: 55.2708, lat: -4.4419 },
  'Tunis': { lng: 10.1815, lat: 36.8065 },
  'Casablanca': { lng: -6.8498, lat: 34.0209 },
  
  // Oceania
  'Sydney': { lng: 151.2093, lat: -33.8688 },
  'Melbourne': { lng: 144.9631, lat: -37.8136 },
  'Perth': { lng: 115.8605, lat: -31.9505 },
  'Auckland': { lng: 174.7633, lat: -36.8485 },
  'Noumea': { lng: 167.8449, lat: -29.0556 }
}

const Map = forwardRef<MapRef, MapProps>(({ accessToken, isChatActive, onCitySelect, spinEnabled = true, selectedCity }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [userInteracting, setUserInteracting] = useState(false)

  // Globe spinning configuration
  const secondsPerRevolution = 240 // Complete a revolution every 4 minutes
  const maxSpinZoom = 5 // Above zoom level 5, do not rotate
  const slowSpinZoom = 3 // Rotate at intermediate speeds between zoom levels 3 and 5

  // Expose resetView and zoomToCity functions to parent component
  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (map.current) {
        map.current.flyTo({
          center: [30, 15],
          zoom: 1,
          duration: 2000,
          easing: (t) => t
        })
      }
    },
    zoomToCity: (cityName: string) => {
      if (map.current && SUPPORTED_CITIES[cityName]) {
        const coords = SUPPORTED_CITIES[cityName]
        map.current.flyTo({
          center: [coords.lng, coords.lat],
          zoom: 12,
          duration: 2500,
          easing: (t) => {
            // Custom easing for smooth zoom animation
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
          }
        })
      }
    }
  }))

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Changed to streets for black and white appearance
      projection: 'globe', // Display the map as a globe
      zoom: 1,
      center: [30, 15]
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl())

    // Disable scroll zoom for better globe experience
    map.current.scrollZoom.disable()

    // Set up the atmosphere and fog when the style loads
    map.current.on('style.load', () => {
      if (map.current) {
        map.current.setFog({}) // Set the default atmosphere style
        
        // Add markers for supported cities
        addCityMarkers()
      }
    })

    // Pause spinning on user interaction
    const handleInteractionStart = () => setUserInteracting(true)
    const handleInteractionEnd = () => {
      setTimeout(() => setUserInteracting(false), 100)
    }

    map.current.on('mousedown', handleInteractionStart)
    map.current.on('dragstart', handleInteractionStart)
    map.current.on('touchstart', handleInteractionStart)
    map.current.on('mouseup', handleInteractionEnd)
    map.current.on('dragend', handleInteractionEnd)
    map.current.on('touchend', handleInteractionEnd)

    // Add click event to zoom to supported cities only
    map.current.on('click', (e) => {
      if (!map.current) return
      
      // Get the coordinates of the click
      const coordinates = e.lngLat
      
      // Check if click is near any supported city
      const clickedCity = findNearestSupportedCity(coordinates.lng, coordinates.lat)
      
      if (clickedCity) {
        // Fly to the clicked city with consistent animation and pause spinning
        setUserInteracting(true)
        map.current.flyTo({
          center: [SUPPORTED_CITIES[clickedCity].lng, SUPPORTED_CITIES[clickedCity].lat],
          zoom: 12,
          duration: 2500,
          easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
        })
        const onEnd = () => {
          setUserInteracting(false)
          map.current?.off('moveend', onEnd)
        }
        map.current.on('moveend', onEnd)
        
        // Call the callback with the city name
        if (onCitySelect) {
          onCitySelect(clickedCity)
        }
        
        console.log(`Clicked on supported city: ${clickedCity}`)
      } else {
        // Show message for unsupported areas
        if (onCitySelect) {
          onCitySelect('City not supported yet. Stay tuned! 🌍')
        }
        console.log(`Clicked at: ${coordinates.lng}, ${coordinates.lat} - No supported city nearby`)
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [accessToken, onCitySelect])

  // Function to add markers for supported cities
  const addCityMarkers = () => {
    if (!map.current) return

    Object.entries(SUPPORTED_CITIES).forEach(([cityName, coords]) => {
      // Create marker element
      const markerEl = document.createElement('div')
      markerEl.className = 'city-marker'
      markerEl.innerHTML = `
        <div class="marker-pulse"></div>
        <div class="marker-dot"></div>
        <div class="marker-label">${cityName}</div>
      `
      
      // Create and add marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([coords.lng, coords.lat])
        .addTo(map.current!)
      
      // Add click event to marker
      markerEl.addEventListener('click', () => {
        if (!map.current) return
        // Pause spinning during animation
        setUserInteracting(true)
        map.current.flyTo({
          center: [coords.lng, coords.lat],
          zoom: 12,
          duration: 2500,
          easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
        })
        const onEnd = () => {
          setUserInteracting(false)
          map.current?.off('moveend', onEnd)
        }
        map.current.on('moveend', onEnd)
        if (onCitySelect) onCitySelect(cityName)
      })
    })
  }

  // Function to find the nearest supported city within a certain distance
  const findNearestSupportedCity = (lng: number, lat: number, maxDistance = 0.5) => {
    let nearestCity: string | null = null
    let minDistance = maxDistance

    Object.entries(SUPPORTED_CITIES).forEach(([cityName, coords]) => {
      const distance = Math.sqrt(
        Math.pow(lng - coords.lng, 2) + Math.pow(lat - coords.lat, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        nearestCity = cityName
      }
    })

    return nearestCity
  }

  // Function to spin the globe
  const spinGlobe = () => {
    if (!map.current || !spinEnabled || userInteracting) return

    const zoom = map.current.getZoom()
    if (zoom >= maxSpinZoom) return

    let distancePerSecond = 360 / secondsPerRevolution
    if (zoom > slowSpinZoom) {
      // Slow spinning at higher zooms
      const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom)
      distancePerSecond *= zoomDif
    }

    const center = map.current.getCenter()
    center.lng -= distancePerSecond
    
    // Smoothly animate the map over one second
    map.current.easeTo({ 
      center, 
      duration: 1000, 
      easing: (n) => n 
    })
  }

  // Start spinning animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (spinEnabled && !userInteracting) {
        spinGlobe()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [spinEnabled, userInteracting])

  // React to selectedCity prop changes by flying to that city
  useEffect(() => {
    if (!selectedCity || !map.current) return
    const coords = SUPPORTED_CITIES[selectedCity]
    if (!coords) return

    // Pause spinning during animation
    setUserInteracting(true)
    map.current.flyTo({
      center: [coords.lng, coords.lat],
      zoom: 12,
      duration: 2500,
      easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
    })

    // Resume spinning shortly after
    const timeoutId = setTimeout(() => setUserInteracting(false), 2600)
    return () => clearTimeout(timeoutId)
  }, [selectedCity])

  // Container styles based on chat state
  const containerStyle = isChatActive 
    ? { 
        position: 'fixed' as const,
        top: 0,
        right: 0,
        width: '50vw',
        height: '100vh',
        zIndex: 1
      }
    : { 
        position: 'relative' as const,
        width: '100%',
        height: '100%'
      }

  // Inline styles for branding elements
  const headerStyle = {
    position: 'absolute' as const,
    top: '20px',
    left: '20px',
    zIndex: 10,
    color: 'var(--text-primary)',
    maxWidth: '320px'
  }

  const bottomRightStyle = {
    position: 'absolute' as const,
    bottom: '20px',
    right: '20px',
    zIndex: 10,
    color: 'var(--text-primary)',
    maxWidth: '280px'
  }

  return (
    <div style={containerStyle}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Enhanced Header with Branding */}
      <div className="card-glass fade-in" style={headerStyle}>
        <h1 className="text-gradient" style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          marginBottom: '16px',
          textShadow: '0 6px 12px rgba(0,0,0,0.6)',
          letterSpacing: '0.02em'
        }}>
          Travio
        </h1>
        <p style={{ 
          fontSize: '1.4rem', 
          color: 'var(--text-primary)', 
          fontWeight: 600, 
          margin: '0 0 12px 0',
          textShadow: '0 3px 6px rgba(0,0,0,0.4)',
          letterSpacing: '0.01em'
        }}>
          Explore the world
        </p>
        <p style={{ 
          fontSize: '1.1rem', 
          color: 'var(--text-secondary)', 
          margin: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          fontWeight: 500
        }}>
          Click on highlighted cities to start chatting!
        </p>
      </div>

      {/* Instructions */}
      <div className="card-glass fade-in" style={bottomRightStyle}>
        <p style={{ 
          fontSize: '1.1rem', 
          fontWeight: 700, 
          margin: '0 0 14px 0', 
          color: 'var(--text-primary)',
          textShadow: '0 3px 6px rgba(0,0,0,0.4)',
          letterSpacing: '0.01em'
        }}>
          💡 How to use:
        </p>
        <ul style={{ 
          fontSize: '0.95rem', 
          color: 'var(--text-secondary)', 
          margin: 0, 
          paddingLeft: '18px', 
          lineHeight: '1.6',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          fontWeight: 500
        }}>
          <li>Click on highlighted cities to zoom in</li>
          <li>Drag to rotate the globe</li>
          <li>Use controls to pause/reset</li>
          <li>The globe auto-spins when idle</li>
        </ul>
      </div>


    </div>
  )
})

Map.displayName = 'Map'

export default Map