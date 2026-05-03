import React, { useState, useEffect } from 'react'

function ClockWidget() {
  const [time, setTime] = useState(new Date())
  const [quote, setQuote] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const quotes = [
      "✨ Tu bienestar es tu mayor riqueza",
      "🌸 Cada día es una nueva oportunidad",
      "💕 Cuida de ti con amor y paciencia", 
      "🧘 La paz comienza desde adentro",
      "🌺 Eres suficiente tal como eres"
    ]
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setQuote(randomQuote)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="clock-widget">
      <div className="clock-display">
        <div className="time">{formatTime(time)}</div>
        <div className="date">{formatDate(time)}</div>
      </div>
      <div className="lyric-quote">{quote}</div>
    </div>
  )
}

export default ClockWidget
