'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatBoxProps {
  isActive: boolean
  onChatStart: () => void
  selectedCity?: string
  onZoomToCity?: (cityName: string) => void
}

export default function ChatBox({ isActive, onChatStart, selectedCity, onZoomToCity }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Options shown after selecting a city
  const [cityOptions, setCityOptions] = useState<string[]>([])
  const [showCityOptions, setShowCityOptions] = useState(false)

  // New: example suggestions shown in the landing search UI
  const exampleCities = [
    'Where can I find fried fish in The Bahamas?',
    'Top 5 Italian restaurants in New York.',
    'What are popular activities in Mumbai, India?',
    'Give me a 3-day itinerary in Paris, France.',
    'What are kid-friendly activities in London?',
    'What are the cost of museum tickets in Rome, Italy.'
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Function to detect and zoom to cities mentioned in messages
  const detectAndZoomToCity = (text: string) => {
    if (!onZoomToCity) return
    
    // List of supported cities from the Map component
    const supportedCities = [
      'Paris', 'London', 'Berlin', 'Rome', 'Bruges', 'Amsterdam', 'Barcelona', 'Copenhagen', 'Vienna', 'Budapest', 'Prague', 'Warsaw', 'Kyiv', 'Moscow',
      'Tokyo', 'Seoul', 'Hong Kong', 'Shanghai', 'Beijing', 'Mumbai', 'New Delhi', 'Kolkata', 'Bangkok', 'Ho Chi Minh City', 'Singapore', 'Jakarta', 'Manila',
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Toronto', 'Vancouver', 'Mexico City', 'São Paulo', 'Buenos Aires', 'Santiago', 'Lima',
      'Cairo', 'Lagos', 'Cape Town', 'Nairobi', 'Victoria', 'Tunis', 'Casablanca',
      'Sydney', 'Melbourne', 'Perth', 'Auckland', 'Noumea',

      // Caribbean (Bahamas, Turks & Caicos, West Indies)
      // Bahamas
      'Nassau', 'Freeport', 'George Town (Exuma)', 'Marsh Harbour', 'Alice Town (Bimini)', "Governor's Harbour", 'Dunmore Town', 'Andros Town',
      // Turks & Caicos
      'Providenciales', 'Cockburn Town',
      // West Indies (selected)
      'Kingston', 'Montego Bay', 'Ocho Rios', 'Port of Spain', 'San Juan', 'Santo Domingo', 'Punta Cana', 'Bridgetown', 'Castries', "St. George's",
      'Roseau', "St. John's", 'Basseterre', 'Philipsburg', 'Oranjestad', 'Willemstad', 'Kralendijk', 'Road Town', 'Charlotte Amalie', 'Cruz Bay',
      'Gustavia', 'Pointe-à-Pitre', 'Fort-de-France', 'Kingstown'
    ]

    // Helper to escape regex and create a Unicode-aware boundary regex for city names
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const makeCityRegex = (city: string) => {
      const spaced = escapeRegExp(city).replace(/\s+/g, '\\s+')
      // Avoid substring matches by requiring non-letter boundaries around the city name
      // Uses ASCII letter class for broad compatibility
      return new RegExp(`(?:^|[^A-Za-z])(${spaced})(?=[^A-Za-z]|$)`, 'i')
    }
    
    // Common city patterns that might indicate a city mention
    const cityPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, // "City, Country" format
      /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, // "in CityName" format
      /\bto\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, // "to CityName" format
      /\bvisit\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g // "visit CityName" format
    ]
    
    let foundCity: string | null = null
    let mentionedCity: string | null = null
    
    // First check if any supported city is mentioned (use boundary-aware regex)
    for (const city of supportedCities) {
      const regex = makeCityRegex(city)
      if (regex.test(text)) {
        foundCity = city
        break
      }
    }
    
    // If no supported city found, check for city-like patterns
    if (!foundCity) {
      for (const pattern of cityPatterns) {
        const matches = [...text.matchAll(pattern)]
        for (const match of matches) {
          const potentialCity = (match[1] || match[0]).trim()
          if (potentialCity && potentialCity.length > 2) {
            const normalizedPotential = potentialCity.replace(/\s+/g, ' ').toLowerCase()
            const isSupported = supportedCities.some(city => city.toLowerCase() === normalizedPotential)
            if (!isSupported) {
              mentionedCity = potentialCity
              break
            }
          }
        }
        if (mentionedCity) break
      }
    }
    
    if (foundCity) {
      onZoomToCity(foundCity)
      console.log('Zooming to city:', foundCity)
    } else if (mentionedCity) {
      onZoomToCity(`${mentionedCity} is not supported yet, stay tuned for next update! 🌍`)
    }
  }

  // Update messages when selectedCity changes
  useEffect(() => {
    if (selectedCity) {
      // Prepare 5 suggested prompts for the selected city
      const city = selectedCity.split(',')[0]
      const options = [
        `Most iconic places to visit in ${city}`,
        `Cool things to do over a weekend in ${city}`,
        `Best local foods and where to try them in ${city}`,
        `Hidden gems only locals know in ${city}`,
        `Budget-friendly itinerary for 2 days in ${city}`
      ]
      setCityOptions(options)
      setShowCityOptions(true)
    }

    if (selectedCity && messages.length > 0) {
      let messageText = ''
      
      if (selectedCity.includes('not supported')) {
        messageText = selectedCity
      } else {
        messageText = `🌍 Now chatting about ${selectedCity}! Ask me anything about this amazing city.`
      }
      
      const cityMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, cityMessage])
    }
  }, [selectedCity])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Start chat if this is the first message
    if (messages.length === 0) {
      onChatStart()
    }

    // Hide city options once a prompt is chosen/sent
    if (showCityOptions) setShowCityOptions(false)

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Prepare messages for API
      const apiMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))

      // Add current user message
      apiMessages.push({
        role: 'user',
        content: inputValue
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          selectedCity
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.content,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        
        // Detect and zoom to cities mentioned in the bot's response
        detectAndZoomToCity(data.content)
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again or make sure your OpenAI API key is configured.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Landing page chat box
  if (!isActive) {
    return (
      <div className="fade-in" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        maxWidth: '95vw',
        height: '360px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        color: '#111'
      }}>
        {/* Search input and suggestions */}
        <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Input row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '12px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb'
          }}>
            <span style={{ opacity: 0.6 }}>▸</span>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Plan a trip, discover cities and restaurants, or ask a travel question…"
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: 'none', 
                outline: 'none',
                fontSize: '0.95rem',
                color: '#111'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              style={{
                opacity: inputValue.trim() ? 1 : 0,
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                padding: '8px 12px',
                fontSize: '0.875rem',
                background: 'transparent',
                color: 'transparent',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              title="Send"
            >
              →
            </button>
          </div>

          {/* Suggestions list */}
          <div style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px',
            borderRadius: '12px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '0.75rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.7)',
              marginBottom: 8
            }}>TRY THESE PROMPTS…</div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {exampleCities.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputValue(label)
                    setTimeout(() => handleSendMessage(), 50)
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    justifyContent: 'space-between',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    marginBottom: 8,
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: '#111'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>{label}</span>
                  <span style={{ opacity: 0.75 }}>↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'inline-block',
            fontSize: '0.85rem',
            color: '#374151',
            fontStyle: 'italic',
            padding: '8px 16px',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            This is a limited preview of the suite of features provided by Travio.
          </div>
        </div>
      </div>
    )
  }

  // Active chat layout (left side)
  return (
    <div className="slide-in-left" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '50vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      color: '#111'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ 
          fontSize: '1.75rem',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}>
        </div>
        <div>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            margin: 0, 
            color: '#111',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Image 
              src="/travio.png"
              alt="Travio"
              width={100}
              height={100}
              onClick={() => window.location.reload()}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                cursor: 'pointer'
              }}
              title="Refresh"
              priority
            />
          </h3>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            margin: 0 
          }}>
            {selectedCity ? `Chatting about ${selectedCity}` : 'Ask me about the world'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* City suggestion options (dropdown-like) */}
        {showCityOptions && cityOptions.length > 0 && (
          <div style={{ 
            padding: '12px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px'
          }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: 8
            }}>
              Choose a topic about {selectedCity?.split(',')[0]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cityOptions.map((opt, i) => (
                <button
                  key={i}
                  style={{ 
                    textAlign: 'left', 
                    justifyContent: 'space-between', 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 12px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: '#111'
                  }}
                  onClick={() => {
                    setInputValue(opt)
                    setShowCityOptions(false)
                    setTimeout(() => handleSendMessage(), 10)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                  }}
                >
                  <span>{opt}</span>
                  <span>↗</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`fade-in`}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '16px',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                wordWrap: 'break-word',
                background: message.sender === 'user' ? '#3b82f6' : '#f3f4f6',
                color: message.sender === 'user' ? '#ffffff' : '#111',
                border: message.sender === 'user' ? 'none' : '1px solid #e5e7eb'
              }}
            >
              {message.sender === 'bot' ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                message.text
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              fontSize: '0.875rem',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb'
            }}>
              <div className="typing-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedCity ? `Ask about ${selectedCity}...` : "Type your message..."}
            style={{ 
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s ease',
              color: '#111'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            style={{
              opacity: inputValue.trim() ? 1 : 0.5,
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              padding: '12px 16px',
              background: inputValue.trim() ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
} 