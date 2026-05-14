import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { format, startOfWeek, addDays, isToday, startOfMonth, endOfMonth, getDay, subMonths, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import './AuraHeatmap.css'

const STORAGE_KEY = 'wellness_aura_map'

// Diccionario Cromático de Emociones - Químicute Palette (más saturados)
const CHROMATIC_EMOTIONS = {
  euphoric: { color: '#d734f4', label: 'Euforia', icon: '✨' },
  happy: { color: '#ff6b95', label: 'Felicidad', icon: '😊' },
  calm: { color: '#7dd3fc', label: 'Zen', icon: '🧘' },
  lowEnergy: { color: '#94a3b8', label: 'Baja Energía', icon: '🔋' }
}



const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] // Lunes a Domingo

function AuraHeatmap() {
  // Estado principal
  const [moodMap, setMoodMap] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  
  const [selectedDay, setSelectedDay] = useState(null)
  const [showMoodModal, setShowMoodModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Obtener la semana actual (Lunes a Domingo)
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }) // Lunes como inicio
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [])

  // Obtener días del mes actual para el heatmap
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = []
    
    // Agregar espacios vacíos al inicio para alinear con el día de la semana
    const startDayOfWeek = getDay(start)
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 // Lunes = 0, Domingo = 6
    
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null)
    }
    
    // Agregar todos los días del mes
    for (let i = 0; i < end.getDate(); i++) {
      days.push(addDays(start, i))
    }
    
    return days
  }, [currentMonth])



  // Persistencia en localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(moodMap))
    } catch (error) {
      console.error('Error saving mood map:', error)
    }
  }, [moodMap])

  // Handlers
  const handleDayClick = (day) => {
    const dayKey = format(day, 'yyyy-MM-dd')
    setSelectedDay(dayKey)
    setShowMoodModal(true)
  }

  const handleMoodSelect = (moodKey) => {
    if (selectedDay) {
      const moodColor = CHROMATIC_EMOTIONS[moodKey].color
      setMoodMap(prev => ({
        ...prev,
        [selectedDay]: moodColor
      }))
      setShowMoodModal(false)
      setSelectedDay(null)
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const getMoodColor = (day) => {
    if (!day) return null
    const dayKey = format(day, 'yyyy-MM-dd')
    return moodMap[dayKey] || null
  }

  const monthYearLabel = format(currentMonth, "MMMM yyyy", { locale: es })

  const mainContent = (
    <div className="aura-heatmap-container">
      {/* Estructura Superior: Registro Semanal */}
      <div className="aura-weekly-section">
        {/* Título */}
        <h2 className="aura-title">Aura Heatmap</h2>
        
        {/* Renderizado de círculos semanales con iniciales y contraste dinámico */}
        {(() => {
          const renderWeeklyBubbles = () => (
            <div className="wh-aura-bubbles">
              {weekDays.map((day, i) => {
                const dayKey = format(day, 'yyyy-MM-dd')
                const mood = moodMap[dayKey]
                const isToday = isToday(day)
                const moodConfig = mood ? CHROMATIC_EMOTIONS[mood] : null
                
                // Contraste dinámico: si hay mood, texto blanco; si no, texto oscuro
                const textColor = moodConfig ? '#ffffff' : 'rgba(15, 23, 42, 0.9)'
                
                return (
                  <div
                    key={dayKey}
                    className={`wh-aura-bubble ${isToday ? 'today' : ''}`}
                    style={moodConfig ? { background: moodConfig.color } : {}}
                    onClick={() => handleDayClick(day)}
                    title={`${format(day, 'EEEE d', { locale: es })}${mood ? ` - ${moodConfig.label}` : ''}`}
                  >
                    <span className="wh-aura-bubble-label" style={{ color: textColor }}>
                      {DAY_LABELS[i]}
                    </span>
                  </div>
                )
              })}
            </div>
          )
          return renderWeeklyBubbles()
        })()}

      </div>

      {/* Estructura Inferior: Heatmap Mensual Compacto */}
      <div className="aura-analysis-section">
        <div className="aura-heatmap-column">
          {/* Navegación del Mes */}
          <div className="aura-month-navigation">
            <button 
              className="aura-nav-btn"
              onClick={handlePreviousMonth}
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <span className="aura-month-label">{monthYearLabel}</span>
            <button 
              className="aura-nav-btn"
              onClick={handleNextMonth}
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>
          
          {/* Grid del Mes */}
          <div className="aura-month-grid">
            {monthDays.map((day, index) => {
              const moodColor = getMoodColor(day)
              const isTodayDay = day && isToday(day)
              
              return (
                <div
                  key={day ? format(day, 'yyyy-MM-dd') : `empty-${index}`}
                  className={`aura-month-cell ${!day ? 'empty' : ''} ${isTodayDay ? 'today' : ''}`}
                  style={{
                    backgroundColor: moodColor || 'rgba(255, 255, 255, 0.05)',
                    boxShadow: moodColor ? `0 0 8px ${moodColor}30` : 'none'
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )

  // Portal: renderiza el modal directamente en document.body para escapar
  // cualquier stacking context creado por transform/filter en ancestros
  const moodModalPortal = createPortal(
    <AnimatePresence>
      {showMoodModal && (
        <>
          {/* Backdrop */}
          <div
            className="aura-modal-backdrop"
            onClick={() => setShowMoodModal(false)}
          />

          {/* Modal */}
          <motion.div
            className="aura-mood-modal"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="aura-modal-header">
              <h3>¿Cómo te sientes hoy?</h3>
              <button
                className="aura-modal-close"
                onClick={() => setShowMoodModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="aura-mood-options">
              {Object.entries(CHROMATIC_EMOTIONS).map(([key, mood]) => (
                <motion.button
                  key={key}
                  className="aura-mood-option"
                  style={{ backgroundColor: mood.color }}
                  onClick={() => handleMoodSelect(key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="aura-mood-icon">{mood.icon}</span>
                  <span className="aura-mood-label">{mood.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )

  return (
    <>
      {mainContent}
      {moodModalPortal}
    </>
  )
}

export default AuraHeatmap