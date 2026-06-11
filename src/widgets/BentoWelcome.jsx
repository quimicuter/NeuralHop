import React, { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudLightning, Snowflake } from 'lucide-react'
import './BentoWelcome.css'

const MIS_LYRICS = [
  { texto: "Time, truth and hearts", autor: "The Killers" },
  { texto: "You're gonna miss me when I'm gone...", autor: "The Killers" },
  { texto: "Don't break character, you got a lot of heart", autor: "The Killers" },
  { texto: "It was only a kiss", autor: "The Killers" },
  { texto: "'Cuz I don't shine if you don't shine", autor: "The Killers" },
  { texto: "Are we human? Or are we Dancer?", autor: "The Killers" },
  { texto: "We're all the same, and love is blind", autor: "The Killers" },
  { texto: "I got soul, but I'm not a soldier", autor: "The Killers" },
  { texto: "Afuera tú no existes solo adentro", autor: "Caifanes" },
  { texto: "Préstame tu peine y péiname el alma...", autor: "Caifanes" },
  { texto: "No dejes que nos coma el diablo amor", autor: "Caifanes" },
  { texto: "Antes de que nos olviden, haremos historia", autor: "Caifanes" },
  { texto: "I am not afraid to keep on living", autor: "MCR" },
  { texto: "We'll carry on...", autor: "MCR" },
  { texto: "I don't wanna be a superhero", autor: "Falling In Reverse" },
  { texto: "Lemon Boy and I, we're gonna live forever.", autor: "Cavetown" },
  { texto: "Don't mess with me I'm a big boy now", autor: "Cavetown" },
];

function BentoWelcome() {
  const [time, setTime] = useState(new Date())
  const [currentLyric, setCurrentLyric] = useState(MIS_LYRICS[0])
  const [weather, setWeather] = useState({ temp: '--', desc: 'Cargando...', icon: 'Sun' })

  // 1. Reloj
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 2. Frase Aleatoria
  useEffect(() => {
    const randomLyric = MIS_LYRICS[Math.floor(Math.random() * MIS_LYRICS.length)]
    setCurrentLyric(randomLyric)
  }, [])

  // 3. Clima en tiempo real (OpenWeather)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'a6e25ff300f070931c0a2f2db56b94c9'
        if (!API_KEY) {
          throw new Error('OpenWeather API key missing')
        }

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setWeather({ temp: '--', desc: 'Offline', icon: 'Cloud' })
          return
        }

        const lat = 21.0181
        const lon = -101.2580
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`)
        if (!res.ok) {
          throw new Error(`OpenWeather API response ${res.status}`)
        }

        const data = await res.json()
        if (data.main) {
          setWeather({
            temp: Math.round(data.main.temp),
            desc: data.weather[0]?.description || 'Clima desconocido',
            icon: data.weather[0]?.main || 'Cloud'
          })
        }
      } catch (error) {
        console.error('Error cargando el clima:', error)
        setWeather({ temp: '--', desc: 'Sin conexión', icon: 'Cloud' })
      }
    }

    fetchWeather()
    const weatherTimer = setInterval(fetchWeather, 1800000)
    return () => clearInterval(weatherTimer)
  }, [])

  const formatHM = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const formatS = (date) => date.getSeconds().toString().padStart(2, '0')
  const formatDate = (date) => date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

  const renderWeatherIcon = () => {
    switch (weather.icon) {
      case 'Clouds': return <Cloud size={32} strokeWidth={1.5} />;
      case 'Rain': case 'Drizzle': return <CloudRain size={32} strokeWidth={1.5} />;
      case 'Thunderstorm': return <CloudLightning size={32} strokeWidth={1.5} />;
      case 'Snow': return <Snowflake size={32} strokeWidth={1.5} />;
      default: return <Sun size={32} strokeWidth={1.5} />;
    }
  };

  return (
    <div className="welcome-layout-3col">
      {/* ⏰ COLUMNA IZQUIERDA: Reloj y Fecha */}
      <div className="welcome-col welcome-time">
        <div className="time-display">
          {formatHM(time)}<span className="sec-burgundy">:{formatS(time)}</span>
        </div>
        <div className="date-display">{formatDate(time)}</div>
      </div>

      {/* 🌤️ COLUMNA CENTRAL: Clima */}
      <div className="welcome-col welcome-weather">
        <div className="weather-icon-wrapper">
          {renderWeatherIcon()}
        </div>
        <div className="weather-details">
          <span className="weather-temp">{weather.temp}°</span>
          <span className="weather-desc">{weather.desc}</span>
        </div>
      </div>

      {/* 🍂 COLUMNA DERECHA: Lyrics */}
      <div className="welcome-col welcome-quote">
        <div className="lyric-box">
          <p className="lyric-text-micro" title={currentLyric.texto}>
            "{currentLyric.texto}"
          </p>
          <span className="lyric-author-micro">— {currentLyric.autor}</span>
        </div>
      </div>
    </div>
  )
}

export default BentoWelcome