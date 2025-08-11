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
    'New York, United States',
    'Mumbai, India',
    'Paris, France',
    'London, United Kingdom',
    'Rome, Italy',

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
      'Sydney', 'Melbourne', 'Perth', 'Auckland', 'Noumea'
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
      <div className="card-glass fade-in landing-dark-text" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        maxWidth: '95vw',
        height: '360px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000
      }}>
        {/* Top bar - "Where to?" and Next button */}
        <div className="align-block" style={{
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#4facfe 0%, #00f2fe 100%)',
              boxShadow: '0 0 10px rgba(79,172,254,0.6)'
            }} />
            <span style={{
              fontWeight: 700,
              color: '#0f766e'
            }}>Where to?</span>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="btn-glass"
            style={{ padding: '8px 14px', opacity: inputValue.trim() ? 1 : 0.6, cursor: inputValue.trim() ? 'pointer' : 'not-allowed' }}
            title="Next"
          >
            Next
          </button>
        </div>

        {/* Search input and suggestions */}
        <div style={{ flex: 1, padding: '12px 12px 0 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Input row */}
          <div className="glass-weak align-block" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ opacity: 0.6 }}>▸</span>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search cities or ask a question..."
              className="input-glass"
              style={{ flex: 1, background: 'transparent', border: 'none', boxShadow: 'none' }}
            />
            <span style={{ opacity: 0.6 }}>▸</span>
          </div>

          {/* Suggestions list */}
          <div className="glass-weak align-block" style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              fontSize: '0.75rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.7)',
              marginBottom: 8
            }}>Example Cities</div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {exampleCities.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputValue(label)
                    setTimeout(() => handleSendMessage(), 50)
                  }}
                  className="btn-glass suggestion-btn"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    justifyContent: 'space-between',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    marginBottom: 8
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>{label}</span>
                  <span style={{ opacity: 0.75 }}>↗</span>
                </button>
              ))}
            </div>
                    </div>
        </div>
      </div>
    )
  }

  // Active chat layout (left side)
  return (
    <div className="card-glass slide-in-left landing-dark-text" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '50vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      background: 'rgba(255,255,255,0.9)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--glass-border)',
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
              width={200}
              height={100}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
              priority
            />
            Assistant
          </h3>
          <p style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)', 
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
          <div className="glass-weak align-block" style={{ padding: '12px' }}>
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
                  className="btn-glass suggestion-btn"
                  style={{ textAlign: 'left', justifyContent: 'space-between', display: 'flex', alignItems: 'center', padding: '10px 12px' }}
                  onClick={() => {
                    setInputValue(opt)
                    setShowCityOptions(false)
                    setTimeout(() => handleSendMessage(), 10)
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
              className={message.sender === 'user' ? 'glass-strong' : 'glass-weak'}
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '16px',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                wordWrap: 'break-word'
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
            <div className="glass-weak" style={{
              padding: '12px 16px',
              borderRadius: '16px',
              fontSize: '0.875rem'
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
        borderTop: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedCity ? `Ask about ${selectedCity}...` : "Type your message..."}
            className="input-glass"
            style={{ flex: 1 }}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="btn-glass"
            style={{
              opacity: inputValue.trim() ? 1 : 0.5,
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              padding: '12px 16px'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
} 