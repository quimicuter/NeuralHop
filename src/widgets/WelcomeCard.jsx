import { useMemo } from 'react'

// Frases dinámicas según hora del día y día de semana
const GREETINGS = {
  morning: [
    '¡Hola, Quimicute! Recuerda tu ritual de skincare hoy.',
    'Energía lista para el laboratorio.',
    'Buen día para brillar desde adentro.',
    'Tu rutina matutina es tu superpoder.',
    'Respira profundo y arranca el día.',
  ],
  afternoon: [
    'Hola, Quimicute. Un momento para ti.',
    'Recarga tu energía con un pequeño ritual.',
    'El sol acompaña tu bienestar.',
    'Tu brillo sigue en pleno mediodía.',
    'Pausa consciente, sigue adelante.',
  ],
  evening: [
    'Buenas noches, Quimicute. Calma tu mente.',
    'Prepárate para un sueño reparador.',
    'La noche es para ti.',
    'Relaja, respiras y brillas.',
    'Tu ritual nocturno te espera.',
  ],
}

const getGreeting = () => {
  const hour = new Date().getHours()
  let period = 'morning'
  if (hour >= 12 && hour < 18) period = 'afternoon'
  if (hour >= 18 || hour < 5) period = 'evening'
  const pool = GREETINGS[period] || GREETINGS.morning
  return pool[Math.floor(Math.random() * pool.length)]
}

function WelcomeCard() {
  const greeting = useMemo(getGreeting, [])

  return (
    <div className="wh-welcome-card">
      <div className="wh-welcome-icon">✨</div>
      <p className="wh-welcome-text">{greeting}</p>
    </div>
  )
}

export default WelcomeCard
