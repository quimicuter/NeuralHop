import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { format, startOfWeek, addDays, isToday, startOfMonth, endOfMonth, getDay, subMonths, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import './AuraHeatmap.css'

const STORAGE_KEY = 'wellness_aura_map'

// Diccionario Cromático de Emociones - Crystal Palette (10 opciones)
const CHROMATIC_EMOTIONS = {
  radiant: { color: '#ff1493', label: 'Radiante/Eufórica', icon: '✨' },
  focused: { color: '#00ff7f', label: 'Enfoque/Productiva', icon: '⚡' },
  sensitive: { color: '#dda0dd', label: 'Sensible/Melancólica', icon: '☁️' },
  inspired: { color: '#8a2be2', label: 'Inspirada/Creativa', icon: '🎨' },
  exhausted: { color: '#a9a9a9', label: 'Agotada/Low Battery', icon: '🔋' },
  vulnerable: { color: '#ffb6c1', label: 'Vulnerable/Emocional', icon: '🌸' },
  peaceful: { color: '#87ceeb', label: 'Pacífica/Tranquila', icon: '🕊️' },
  passionate: { color: '#ff4500', label: 'Apasionada/Intensa', icon: '🔥' },
  grateful: { color: '#ffd700', label: 'Agradecida/Positiva', icon: '🙏' },
  adventurous: { color: '#32cd32', label: 'Aventurera/Exploradora', icon: '🌟' }
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
  const [isTransformationDay, setIsTransformationDay] = useState(false)
  const [selectedMoods, setSelectedMoods] = useState({ start: null, end: null })

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
    // Reset modal state
    setIsTransformationDay(false)
    setSelectedMoods({ start: null, end: null })
  }

  const handleMoodSelect = (moodKey) => {
    if (selectedDay) {
      if (isTransformationDay) {
        if (!selectedMoods.start) {
          setSelectedMoods(prev => ({ ...prev, start: moodKey }))
        } else if (!selectedMoods.end) {
          setSelectedMoods(prev => ({ ...prev, end: moodKey }))
        }
      } else {
        const moodColor = CHROMATIC_EMOTIONS[moodKey].color
        setMoodMap(prev => ({
          ...prev,
          [selectedDay]: { type: 'single', color: moodColor, mood: moodKey }
        }))
        setShowMoodModal(false)
        setSelectedDay(null)
      }
    }
  }

  const handleSaveTransformation = () => {
    if (selectedDay && selectedMoods.start && selectedMoods.end) {
      const startColor = CHROMATIC_EMOTIONS[selectedMoods.start].color
      const endColor = CHROMATIC_EMOTIONS[selectedMoods.end].color
      setMoodMap(prev => ({
        ...prev,
        [selectedDay]: { 
          type: 'dual', 
          startColor, 
          endColor, 
          startMood: selectedMoods.start, 
          endMood: selectedMoods.end 
        }
      }))
      setShowMoodModal(false)
      setSelectedDay(null)
      setIsTransformationDay(false)
      setSelectedMoods({ start: null, end: null })
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
    const moodData = moodMap[dayKey]
    if (!moodData) return null
    
    if (moodData.type === 'dual') {
      return `linear-gradient(to bottom, ${moodData.startColor}, ${moodData.endColor})`
    }
    return moodData.color || null
  }

  const getMoodTooltip = (day) => {
    if (!day) return null
    const dayKey = format(day, 'yyyy-MM-dd')
    const moodData = moodMap[dayKey]
    if (!moodData) return null
    
    if (moodData.type === 'dual') {
      const startLabel = CHROMATIC_EMOTIONS[moodData.startMood]?.label || 'Desconocido'
      const endLabel = CHROMATIC_EMOTIONS[moodData.endMood]?.label || 'Desconocido'
      return `Inició: ${startLabel} → Terminó: ${endLabel}`
    }
    const moodLabel = CHROMATIC_EMOTIONS[moodData.mood]?.label || 'Desconocido'
    return moodLabel
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
              {weekDays?.map((day, i) => {
                const dayKey = format(day, 'yyyy-MM-dd')
                const moodData = moodMap[dayKey]
                const todayFlag = isToday(day)
                const moodColor = getMoodColor(day)
                
                // Contraste dinámico: si hay mood, texto blanco; si no, texto oscuro
                const textColor = moodData ? '#ffffff' : 'rgba(15, 23, 42, 0.9)'
                
                return (
                  <div
                    key={dayKey}
                    className={`wh-aura-bubble ${todayFlag ? 'today' : ''}`}
                    style={moodColor ? { background: moodColor } : {}}
                    onClick={() => handleDayClick(day)}
                    title={`${format(day, 'EEEE d', { locale: es })}${moodData ? ` - ${getMoodTooltip(day)}` : ''}`}
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
            {monthDays?.map((day, index) => {
              const moodColor = getMoodColor(day)
              const moodTooltip = getMoodTooltip(day)
              const isTodayDay = day && isToday(day)
              
              return (
                <div
                  key={day ? format(day, 'yyyy-MM-dd') : `empty-${index}`}
                  className={`aura-month-cell ${!day ? 'empty' : ''} ${isTodayDay ? 'today' : ''}`}
                  style={{
                    background: moodColor || 'rgba(255, 255, 255, 0.05)',
                    boxShadow: moodColor ? `0 0 8px rgba(255, 255, 255, 0.3)` : 'none'
                  }}
                  title={day ? `${format(day, 'd', { locale: es })}${moodTooltip ? ` - ${moodTooltip}` : ''}` : ''}
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
        <div className="aura-modal-portal">
          {/* Backdrop */}
          <div
            className="aura-modal-backdrop"
            onClick={() => setShowMoodModal(false)}
          />

          {/* Modal */}
          <motion.div
            className="aura-mood-modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
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

            {/* Toggle para Día de Transformación */}
            <div className="aura-transformation-toggle">
              <label className="aura-toggle-label">
                <input
                  type="checkbox"
                  checked={isTransformationDay}
                  onChange={(e) => {
                    setIsTransformationDay(e.target.checked)
                    if (!e.target.checked) {
                      setSelectedMoods({ start: null, end: null })
                    }
                  }}
                />
                <span className="aura-toggle-slider"></span>
                Día de Transformación
              </label>
            </div>

            {isTransformationDay && (
              <div className="aura-transformation-guide">
                {selectedMoods.start && selectedMoods.end ? (
                  <div className="aura-transformation-preview">
                    <div 
                      className="aura-preview-gradient"
                      style={{
                        background: `linear-gradient(to bottom, ${CHROMATIC_EMOTIONS[selectedMoods.start].color}, ${CHROMATIC_EMOTIONS[selectedMoods.end].color})`
                      }}
                    />
                    <p>Inició: {CHROMATIC_EMOTIONS[selectedMoods.start].label}</p>
                    <p>Terminó: {CHROMATIC_EMOTIONS[selectedMoods.end].label}</p>
                    <button className="aura-save-transformation" onClick={handleSaveTransformation}>
                      Guardar Transformación
                    </button>
                  </div>
                ) : (
                  <p className="aura-transformation-instructions">
                    Selecciona primero el estado inicial, luego el final del día.
                  </p>
                )}
              </div>
            )}

            <div className="aura-mood-options">
              {Object.entries(CHROMATIC_EMOTIONS).map(([key, mood]) => (
                <motion.button
                  key={key}
                  className={`aura-mood-option ${isTransformationDay && selectedMoods.start === key ? 'selected-start' : ''} ${isTransformationDay && selectedMoods.end === key ? 'selected-end' : ''}`}
                  style={{ 
                    backgroundColor: mood.color,
                    border: `2px solid ${mood.color}80`
                  }}
                  onClick={() => handleMoodSelect(key)}
                  whileHover={{ scale: 1.05, boxShadow: `0 0 18px ${mood.color}60` }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Badge for dual-selection order */}
                  {isTransformationDay && selectedMoods.start === key && (
                    <span className="aura-mood-badge">1</span>
                  )}
                  {isTransformationDay && selectedMoods.end === key && (
                    <span className="aura-mood-badge aura-mood-badge-2">2</span>
                  )}

                  <span className="aura-mood-icon">{mood.icon}</span>
                  <span className="aura-mood-label">{mood.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
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