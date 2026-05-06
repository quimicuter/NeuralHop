import React, { useState, useEffect } from 'react'

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

function ClockWidget() {
  const [time, setTime] = useState(new Date())
  const [currentLyric, setCurrentLyric] = useState(MIS_LYRICS[0])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const randomLyric = MIS_LYRICS[Math.floor(Math.random() * MIS_LYRICS.length)]
    setCurrentLyric(randomLyric)
  }, [])

  const formatHM = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const formatS = (date) => date.getSeconds().toString().padStart(2, '0')
  const formatDate = (date) => date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="welcome-layout">
      {/* COLUMNA IZQUIERDA: Reloj Centrado */}
      <div className="clock-col">
        <div className="clock-content">
          <div className="time-display">
            {formatHM(time)}<span className="sec-pink">:{formatS(time)}</span>
          </div>
          <div className="date-display">{formatDate(time)}</div>
        </div>
      </div>

      {/* LÍNEA DIVISORIA: El ancla morada */}
      <div className="vertical-divider"></div>

      {/* COLUMNA DERECHA: Lyrics "pegadas" a la línea */}
      <div className="lyrics-col">
        <div className="lyric-box">
          <p className="lyric-text-micro">"{currentLyric.texto}"</p>
          <span className="lyric-author-micro">{currentLyric.autor}</span>
        </div>
      </div>
    </div>
  )
}

export default ClockWidget