'use client'

import { useState, useRef, useEffect } from 'react'

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
  onToggleSpin?: () => void
  onResetView?: () => void
  spinEnabled?: boolean
  onZoomToCity?: (cityName: string) => void
}

export default function ChatBox({ isActive, onChatStart, selectedCity, onToggleSpin, onResetView, spinEnabled, onZoomToCity }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    
    // Check if any city is mentioned in the text
    for (const city of supportedCities) {
      if (text.toLowerCase().includes(city.toLowerCase())) {
        onZoomToCity(city)
        break
      }
    }
  }

  // Update messages when selectedCity changes
  useEffect(() => {
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
      <div className="card-glass fade-in" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        maxWidth: '90vw',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        color: 'var(--text-primary)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--glass-border)',
          textAlign: 'center'
        }}>
        </div>

        {/* Welcome Message */}
        <div style={{
          flex: 1,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
                    <div className="bounce-in" style={{ 
            fontSize: '5rem', 
            marginBottom: '24px',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            
          </div>
          <h3 className="text-gradient-gold" style={{ 
            fontSize: '2rem', 
            margin: '0 0 20px 0',
            fontWeight: '700',
            textShadow: '0 6px 12px rgba(0,0,0,0.5)',
            letterSpacing: '0.025em'
          }}>
            Welcome to Travio
          </h3>
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'var(--text-primary)', 
            margin: '0 0 36px 0', 
            lineHeight: '1.7',
            maxWidth: '420px',
            fontWeight: 500,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '0.01em'
          }}>
            Click on any city on the globe to start a conversation about it! 
            Or type a message to begin exploring the world together.
          </p>
          
          {/* Quick Start Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            maxWidth: '450px'
          }}>
            {[
              "Tell me about Paris",
              "What's special about Tokyo?",
              "Show me Mount Everest",
              "Travel tips for New York"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputValue(suggestion)
                  setTimeout(() => handleSendMessage(), 100)
                }}
                className="btn-glass"
                style={{
                  fontSize: '0.8rem',
                  padding: '10px 16px',
                  borderRadius: '24px',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  letterSpacing: '0.01em'
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to start exploring..."
              className="input-glass"
              style={{ flex: 1 }}
            />
            {onToggleSpin && (
              <button
                onClick={onToggleSpin}
                className="btn-glass"
                style={{
                  padding: '12px',
                  fontSize: '1rem',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={spinEnabled ? 'Pause rotation' : 'Resume rotation'}
              >
                {spinEnabled ? '⏸' : '▶'}
              </button>
            )}
            {onResetView && (
              <button
                onClick={onResetView}
                className="btn-glass"
                style={{
                  padding: '12px',
                  fontSize: '1rem',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Reset view"
              >
                🔄
              </button>
            )}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="btn-glass"
              style={{
                opacity: inputValue.trim() ? 1 : 0.5,
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
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

  // Active chat layout (left side)
  return (
    <div className="card-glass slide-in-left" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '50vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      color: 'var(--text-primary)'
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
          <h3 className="text-gradient" style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            margin: 0 
          }}>
            Travio Assistant
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
                lineHeight: '1.5',
                wordWrap: 'break-word'
              }}
            >
              {message.text}
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
          {onToggleSpin && (
            <button
              onClick={onToggleSpin}
              className="btn-glass"
              style={{
                padding: '10px',
                fontSize: '0.875rem',
                minWidth: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={spinEnabled ? 'Pause rotation' : 'Resume rotation'}
            >
              {spinEnabled ? '⏸' : '▶'}
            </button>
          )}
          {onResetView && (
            <button
              onClick={onResetView}
              className="btn-glass"
              style={{
                padding: '10px',
                fontSize: '0.875rem',
                minWidth: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Reset view"
            >
              🔄
            </button>
          )}
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