import React, { useState, useEffect } from 'react'

function WeatherWidget() {
  const [weather, setWeather] = useState({
    temp: null,
    city: 'Guanajuato',
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

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Guanajuato,MX&units=metric&appid=${apiKey}`
        )
        
        if (!response.ok) {
          throw new Error('Weather data unavailable')
        }

        const data = await response.json()
        setWeather({
          temp: Math.round(data.main.temp),
          city: data.name,
          description: data.weather[0].description,
          icon: data.weather[0].icon
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
          {weather.icon && <img 
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
          />}
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
