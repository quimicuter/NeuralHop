import React, { useState, useEffect } from 'react'

// --- FRASES MUSICALES PERSONALIZADAS ---
const MIS_LYRICS = [
  // --- THE KILLERS ---
  { texto: "Time, truth and hearts", autor: "All these things that I've done, The Killers" },
  { texto: "You're gonna miss me when I'm gone...", autor: "Miss Atomic Bomb, The Killers" },
  { texto: "Don't break character, you got a lot of heart", autor: "Be Still, The Killers" },
  { texto: "Don't you wanna come with me? Don't you wanna feel my bones?", autor: "Bones, The Killers" },
  { texto: "It was only a kiss", autor: "Mr Brightside, The Killers" },
  { texto: "'Cuz I don't shine if you don't shine", autor: "Read My Mind, The Killers" },
  { texto: "The starmaker says, 'It ain't so bad'", autor: "Spaceman, The Killers" },
  { texto: "The spaceman says, 'Everybody look down, it's all in your mind'", autor: "Spaceman, The Killers" },
  { texto: "Are we human? Or are we Dancer?", autor: "Human, The Killers" },
  { texto: "There is a place, here in this house that you can stay", autor: "Deadlines and Commitments, The Killers" },
  { texto: "We're all the same, and love is blind", autor: "Change Your Mind, The Killers" },
  { texto: "I got soul, but I'm not a soldier", autor: "All These Things That I've Done, The Killers" },

  // --- CAIFANES ---
  { texto: "Afuera tú no existes solo adentro", autor: "Afuera, Caifanes" },
  { texto: "Préstame tu peine y péiname el alma...", autor: "Viento, Caifanes" },
  { texto: "No dejes que nos coma el diablo amor", autor: "No dejes que..., Caifanes" },
  { texto: "Y vienes desde allá donde no sale el sol, donde no hay amor...", autor: "Aquí no es así, Caifanes" },
  { texto: "Antes de que nos olviden, haremos historia", autor: "Antes de que nos olviden, Caifanes" },
  { texto: "La negra toca en la esquina...", autor: "La célula que explota, Caifanes" },

  // --- MY CHEMICAL ROMANCE ---
  { texto: "I am not afraid to keep on living", autor: "Famous Last Words, MCR" },
  { texto: "We'll carry on...", autor: "Welcome to the Black Parade, MCR" },
  { texto: "I'm not okay, I promise", autor: "I'm Not Okay, MCR" },
  { texto: "So long and goodnight", autor: "Helena, MCR" },

  // --- FALLING IN REVERSE ---
  { texto: "I don't wanna be a superhero, 'cause I can't save the world", autor: "Superhero, Falling In Reverse" },
  { texto: "Hold on my dear, I'm coming home", autor: "Coming Home, Falling In Reverse" },
  { texto: "Tell me who you are, Your father has forsaken you", autor: "Coming Home, Falling In Reverse" },

  // --- CAVETOWN ---
  { texto: "Lemon Boy and I, we're gonna live forever.", autor: "Lemon Boy, Cavetown" },
  { texto: "Don't mess with me I'm a big boy now and I'm very scary.", autor: "Boys will be bugs, Cavetown" },
  { texto: "I'm just a boy with a ukulele and a dream", autor: "Devil Town, Cavetown" }
];

function ClockWidget() {
  const [time, setTime] = useState(new Date())
  const [currentLyric, setCurrentLyric] = useState(MIS_LYRICS[0])

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Elegir frase aleatoria al montar el componente
    const randomLyric = MIS_LYRICS[Math.floor(Math.random() * MIS_LYRICS.length)]
    setCurrentLyric(randomLyric)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
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
      <div className="lyric-quote">
        <div className="text-sm font-serif italic text-gray-700 text-center px-2 mt-1 leading-relaxed">{currentLyric.texto}</div>
        <div className="text-[10px] text-gray-400 font-sans uppercase tracking-widest text-center mt-1">{currentLyric.autor}</div>
      </div>
    </div>
  )
}

export default ClockWidget
