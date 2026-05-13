import { useEffect, useState } from 'react'
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import './AuraHeatmap.css'

const STORAGE_KEY = 'wellness_aura_map'

// Diccionario Cromático de Emociones
const CHROMATIC_EMOTIONS = {
  euphoric: { color: '#e73df7', label: 'Eufórica' },
  happy: { color: '#FF8FAB', label: 'Feliz' },
  calm: { color: '#B0E0E6', label: 'Tranquila' },
  thoughtful: { color: '#E6E6FA', label: 'Pensativa' },
  sad: { color: '#A9BCD0', label: 'Agüitada' },
  depressed: { color: '#973d37', label: 'Triste' },
  stressed: { color: '#e91000', label: 'Estresada' }
}

// Array de colores para el popover
const MOOD_COLORS = Object.values(CHROMATIC_EMOTIONS)

const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

function AuraHeatmap() {
  const [moodMap, setMoodMap] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  
  const [selectedCell, setSelectedCell] = useState(null)
  const [showNightNotification, setShowNightNotification] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }))

  // Obtener los 7 días de la semana actual
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  // Calcular el rango de fechas para el encabezado
  const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 })
  const dateRange = `${format(weekStart, 'd')} al ${format(weekEnd, 'd')} de ${format(weekStart, 'MMMM')}, ${format(weekStart, 'yyyy')}`

  // Persistencia en localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(moodMap))
    } catch (error) {
      console.error('Error saving mood map:', error)
    }
  }, [moodMap])

  // Notificación nocturna después de las 21:00
  useEffect(() => {
    const checkNightNotification = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const todayKey = format(startOfDay(now), 'yyyy-MM-dd')
      
      // Si es después de las 21:00 y no hay mood registrado hoy
      const shouldShow = currentHour >= 21 && !moodMap[todayKey]
      setShowNightNotification(shouldShow)
    }

    checkNightNotification()
    const interval = setInterval(checkNightNotification, 60000) // Verificar cada minuto
    
    return () => clearInterval(interval)
  }, [moodMap])

  const handleCellClick = (day) => {
    const dayKey = format(startOfDay(day), 'yyyy-MM-dd')
    setSelectedCell(dayKey)
  }

  const handleMoodSelect = (moodColor) => {
    if (selectedCell) {
      setMoodMap((prev) => ({
        ...prev,
        [selectedCell]: moodColor
      }))
      setSelectedCell(null)
    }
  }

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7))
  }

  const getMoodColor = (day) => {
    const dayKey = format(startOfDay(day), 'yyyy-MM-dd')
    return moodMap[dayKey] || null
  }

  return (
    <div className="aura-heatmap-container">
      {/* Cabecera de la tarjeta */}
      <div className="aura-heatmap-header">
        <div className="aura-header-left">
          <h2 className="aura-title">AURA HEATMAP</h2>
          <button 
            className="aura-calendar-button"
            onClick={() => setShowCalendarModal(true)}
            aria-label="Abrir calendario mensual"
          >
            ⛶
          </button>
        </div>
        <div className="aura-header-right">
          <span className="aura-date-range">{dateRange}</span>
          <button 
            className="aura-today-button"
            onClick={() => handleCellClick(new Date())}
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Grid 2x7 */}
      <div className="aura-heatmap-grid">
        {/* Fila 1: Headers */}
        <div className="aura-heatmap-headers">
          {DAY_LABELS.map((label, index) => (
            <div key={index} className="aura-day-header">
              {label}
            </div>
          ))}
        </div>

        {/* Fila 2: Celdas */}
        <div className="aura-heatmap-cells">
          {weekDays.map((day, index) => {
            const dayKey = format(startOfDay(day), 'yyyy-MM-dd')
            const moodColor = getMoodColor(day)
            const isTodayCell = isToday(day)

            return (
              <div
                key={index}
                className={`aura-heatmap-cell ${isTodayCell ? 'today' : ''}`}
                onClick={() => handleCellClick(day)}
                style={{
                  backgroundColor: moodColor ? `${moodColor}99` : 'rgba(255, 255, 255, 0.05)'
                }}
              >
                {/* Sin símbolos - solo color */}
              </div>
            )
          })}
        </div>
      </div>

      {/* Popover de selección de mood */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            className="aura-mood-popover"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {MOOD_COLORS.map((mood) => (
              <button
                key={mood.color}
                className="aura-mood-button"
                style={{ backgroundColor: mood.color }}
                onClick={() => handleMoodSelect(mood.color)}
                title={mood.label}
                aria-label={mood.label}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificación nocturna */}
      <AnimatePresence>
        {showNightNotification && (
          <motion.div
            className="aura-night-notification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="aura-notification-content">
              <p className="aura-notification-text">Hola, ¿no has llenado tu mood de hoy?</p>
              <button
                className="aura-notification-close"
                onClick={() => setShowNightNotification(false)}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de calendario */}
      <AnimatePresence>
        {showCalendarModal && (
          <motion.div
            className="aura-calendar-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCalendarModal(false)}
          >
            <motion.div
              className="aura-calendar-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.2 }}
            >
              <div className="aura-calendar-header">
                <h3>Seleccionar Semana</h3>
                <button
                  className="aura-modal-close"
                  onClick={() => setShowCalendarModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="aura-calendar-navigation">
                <button onClick={handlePreviousWeek} className="aura-nav-button">
                  ← Semana anterior
                </button>
                <span className="aura-current-week">
                  {format(weekStart, 'd MMM')} - {format(weekEnd, 'd MMM yyyy')}
                </span>
                <button onClick={handleNextWeek} className="aura-nav-button">
                  Siguiente semana →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cerrar popover al hacer clic fuera */}
      {selectedCell && (
        <div
          className="aura-popover-backdrop"
          onClick={() => setSelectedCell(null)}
        />
      )}
    </div>
  )
}

export default AuraHeatmap
