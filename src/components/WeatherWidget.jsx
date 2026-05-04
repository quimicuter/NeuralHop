import React, { useState, useEffect } from 'react'

// Mapeo de weather codes a emojis
const getWeatherEmoji = (weathercode) => {
  const weatherMap = {
    0: '☀️', // Soleado
    1: '☁️', // Mayormente nublado
    2: '☁️', // Nublado
    3: '☁️', // Nubosidad
    45: '🌫️', // Niebla
    48: '🌫️', // Niebla escarchada
    51: '🌧️', // Llovizna ligera
    53: '🌧️', // Llovizna
    55: '🌧️', // Llovizna fuerte
    56: '🌧️', // Llovizna muy fuerte
    57: '🌧️', // Chubascos
    61: '❄️', // Nieve ligera
    63: '❄️', // Nieve
    65: '❄️', // Nieve fuerte
    66: '❄️', // Nieve muy fuerte
    71: '🌤️', // Neblina
    73: '🌤️', // Tormenta
    75: '🌤️', // Tormenta fuerte
    77: '🌤️', // Tormenta violenta
    80: '🌦️', // Chubascos ligeros
    81: '🌦️', // Chubascos
    82: '🌦️', // Chubascos fuertes
    85: '🌦️', // Llovizna helada
    86: '🌦️', // Llovizna helada fuerte
    95: '🌦️'  // Tormenta eléctrica
  }
  return weatherMap[weathercode] || '🌤️' // Por defecto tormenta
}

function WeatherWidget() {
  const [weather, setWeather] = useState({
    temp: null,
    city: 'León, Gto.',
    description: '',
    icon: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
        if (!apiKey) {
          throw new Error('OpenWeather API key not found')
        }

        // Coordenadas de León, Guanajuato
        const lat = 21.1219
        const lon = -101.6826

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&units=metric`
        )
        
        if (!response.ok) {
          throw new Error('Weather data unavailable')
        }

        const data = await response.json()
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          city: 'León, Gto.',
          description: getWeatherDescription(data.current_weather.weathercode),
          icon: null // Open-Meteo usa weathercode en lugar de icon
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="weather-loading-minimal">
          <div className="loading-icon">🌤️</div>
          <div className="loading-text">Cargando atmósfera...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <div className="weather-error-minimal">
          <div className="error-icon">🌫️</div>
          <div className="error-text">Sin clima</div>
        </div>
      </div>
    )
  }

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <div className="weather-icon">
          <span className="weather-emoji">{getWeatherEmoji(weather.weathercode)}</span>
        </div>
        <div className="weather-info">
          <div className="weather-temp">{weather.temp}°C</div>
          <div className="weather-city">{weather.city}</div>
          <div className="weather-desc">{weather.description}</div>
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget
