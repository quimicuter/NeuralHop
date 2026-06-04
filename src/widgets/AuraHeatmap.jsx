import { useEffect, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, startOfDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Info, CloudRain, CloudMoon, Meh, Leaf, Sparkles, Sun, Star } from 'lucide-react'
import './AuraHeatmap.css'

const STORAGE_KEY = 'aura_energy_map'
const STORAGE_KEY_ADVANCED = 'aura_advanced_map'

const MOOD_LEVELS = {
  1: { core: '#122155', halo: '#0f172a', label: 'Tormenta', subtitle: 'Muy mal', icon: CloudRain },
  2: { core: '#1e40af', halo: '#2563eb', label: 'Melancolía', subtitle: 'Triste', icon: CloudMoon },
  3: { core: '#f8fafc', halo: '#d1d5db', label: 'Meh', subtitle: 'Neutral', icon: Meh },
  4: { core: '#0f766e', halo: '#2dd4bf', label: 'Fresco', subtitle: 'Buen día', icon: Leaf },
  5: { core: '#115e59', halo: '#22c55e', label: 'Pino', subtitle: 'Muy bueno', icon: Leaf },
  6: { core: '#15803d', halo: '#86efac', label: 'Radiante', subtitle: 'Brillante', icon: Sun },
  7: { core: '#166534', halo: '#4ade80', label: 'Épico', subtitle: 'Excelente', icon: Star },
}

function loadMap() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function loadAdvancedMap() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_ADVANCED)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function AuraHeatmap() {
  const [energyMap, setEnergyMap] = useState(loadMap)
  const [advancedMap, setAdvancedMap] = useState(loadAdvancedMap)
  const [activeKey, setActiveKey] = useState(null) // día seleccionado
  const [showAdvancedModal, setShowAdvancedModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showStatsModal, setShowStatsModal] = useState(false)

  // Estado del modal avanzado de transición
  const [startMood, setStartMood] = useState(3)
  const [endMood, setEndMood] = useState(3)
  const [notes, setNotes] = useState('')

  // Persistencia
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(energyMap))
    } catch (e) {
      console.warn('AuraHeatmap persist error:', e)
    }
  }, [energyMap])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_ADVANCED, JSON.stringify(advancedMap))
    } catch (e) {
      console.warn('Aura advanced persist error:', e)
    }
  }, [advancedMap])

  // Mes actual: todos los días del mes (incluyendo semanas completas)
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const weekStart = startOfWeek(start, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(end, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1))
  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1))
  const getMonthYear = () => format(currentDate, 'MMM yyyy', { locale: es })

  const setLevel = useCallback((dateKey, level) => {
    setEnergyMap(prev => {
      const next = { ...prev }
      if (level == null) delete next[dateKey]
      else next[dateKey] = { level }
      return next
    })
    setActiveKey(null)
  }, [])

  const saveAdvancedData = useCallback((dateKey, start, end, note) => {
    setAdvancedMap(prev => {
      const next = { ...prev }
      if (!start && !end && !note) {
        delete next[dateKey]
      } else {
        next[dateKey] = { startMood: start, endMood: end, notes: note }
      }
      return next
    })
  }, [])

  const openAdvancedModal = useCallback((dateKey) => {
    const existing = advancedMap[dateKey]
    if (existing) {
      setStartMood(existing.startMood || 3)
      setEndMood(existing.endMood || 3)
      setNotes(existing.notes || '')
    } else {
      setStartMood(3)
      setEndMood(3)
      setNotes('')
    }
    setActiveKey(dateKey)
    setShowAdvancedModal(true)
  }, [advancedMap])

  const todayLevel = useMemo(() => {
    const k = format(new Date(), 'yyyy-MM-dd')
    return energyMap[k]?.level ?? null
  }, [energyMap])

  // Bloquear días futuros
  const isFuture = useCallback((date) => {
    return isBefore(startOfDay(new Date()), startOfDay(date))
  }, [])

  const handleDayClick = useCallback((dateKey, isFutureDay) => {
    if (isFutureDay) return
    openAdvancedModal(dateKey)
  }, [openAdvancedModal])

  const handleAdvancedSave = useCallback(() => {
    if (activeKey) {
      // Calcular nivel promedio y guardar en energyMap
      const avgMood = Math.round((startMood + endMood) / 2)
      setLevel(activeKey, avgMood)
      saveAdvancedData(activeKey, startMood, endMood, notes)
    }
    setShowAdvancedModal(false)
    setActiveKey(null)
  }, [activeKey, startMood, endMood, notes, setLevel, saveAdvancedData])

  return (
    <div className="aura-widget">
      {/* Header Ultra Compacto */}
      <div className="aura-header">
        <div className="aura-header-title">
          <span className="aura-title-text">Aura Heatmap</span>
        </div>
        <div className="aura-header-nav">
          <button className="aura-nav-btn" onClick={prevMonth} aria-label="Mes anterior">
            <ChevronLeft size={14} />
          </button>
          <span className="aura-nav-date">{getMonthYear()}</span>
          <button className="aura-nav-btn" onClick={nextMonth} aria-label="Mes siguiente">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="aura-header-info">
          <button className="aura-info-btn" onClick={() => setShowStatsModal(true)} aria-label="Estadísticas">
            <Info size={16} />
          </button>
        </div>
      </div>

      <div className="aura-month-grid">
        {monthDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const level = energyMap[dateKey]?.level ?? 0
          const isActive = activeKey === dateKey
          const todayFlag = isToday(day)
          const futureFlag = isFuture(day)
          const inOtherMonth = day.getMonth() !== new Date().getMonth()
          const palette = level ? MOOD_LEVELS[level] : null
          const intensity = level / 7 // 0..1
          const style = palette
            ? {
                background: `radial-gradient(circle at 35% 30%, ${palette.core} 0%, ${palette.halo} 68%, ${palette.halo}00 100%)`,
                boxShadow: `0 0 ${8 + intensity * 18}px ${palette.halo}33, inset 0 0 6px rgba(255,255,255,0.18)`,
                borderColor: `${palette.halo}88`,
              }
            : undefined

          return (
            <button
              key={dateKey}
              type="button"
              className={`aura-day ${todayFlag ? 'is-today' : ''} ${level ? 'has-level' : 'is-empty'} ${isActive ? 'is-active' : ''} ${futureFlag ? 'is-future' : ''} ${inOtherMonth ? 'is-other-month' : ''}`}
              style={style}
              onClick={() => handleDayClick(dateKey, futureFlag)}
              title={`${format(day, 'EEEE d MMM', { locale: es })}${level ? ` · ${MOOD_LEVELS[level]?.label}` : ''}${futureFlag ? ' (futuro)' : ''}`}
              aria-label={`Día ${format(day, 'd')}, nivel ${level || 'sin registro'}`}
              disabled={futureFlag}
            >
              {level > 0 && <span className="aura-day-dot">{level}</span>}
            </button>
          )
        })}
      </div>

      {/* Modal Avanzado de Transición de Mood */}
      {showAdvancedModal && createPortal(
        <div className="aura-modal-overlay" onClick={() => setShowAdvancedModal(false)}>
          <div className="aura-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="aura-modal-header">
              <h4>{activeKey ? format(new Date(activeKey), 'EEEE d MMMM', { locale: es }) : 'Editar día'}</h4>
              <button className="aura-modal-close" onClick={() => setShowAdvancedModal(false)}>✕</button>
            </div>

            <div className="aura-modal-body">
              <div className="aura-transition-section aura-preview-row">
                <span className="aura-preview-label">Color seleccionado</span>
                <div
                  className="aura-preview-box"
                  style={(() => {
                    const avgLevel = Math.round((startMood + endMood) / 2)
                    const palette = MOOD_LEVELS[avgLevel]
                    return palette ? {
                      background: `radial-gradient(circle at 35% 30%, ${palette.core} 0%, ${palette.halo} 68%, ${palette.halo}00 100%)`,
                      boxShadow: `0 0 14px ${palette.halo}33`,
                      borderColor: `${palette.halo}55`,
                    } : undefined
                  })()}
                >
                  <span>{MOOD_LEVELS[startMood]?.label || 'Sin selección'} → {MOOD_LEVELS[endMood]?.label || 'Sin selección'}</span>
                  <small>{MOOD_LEVELS[Math.round((startMood + endMood) / 2)]?.label || 'Sin selección'}</small>
                </div>
              </div>

              <div className="aura-transition-section">
                <label>Estado de ánimo al inicio:</label>
                <div className="aura-mood-selector">
                  {[1, 2, 3, 4, 5, 6, 7].map(lvl => {
                    const mood = MOOD_LEVELS[lvl]
                    const Icon = mood.icon
                    return (
                      <button
                        key={`start-${lvl}`}
                        type="button"
                        className={`aura-mood-btn ${startMood === lvl ? 'selected' : ''}`}
                        onClick={() => setStartMood(lvl)}
                        style={{
                          background: startMood === lvl ? mood.halo : 'rgba(255,255,255,0.05)',
                          color: startMood === lvl ? '#0f172a' : '#f4efe9',
                          borderColor: mood.halo,
                        }}
                        title={`${mood.label} · ${mood.subtitle}`}
                      >
                        <Icon size={16} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="aura-transition-section">
                <label>Estado de ánimo al final:</label>
                <div className="aura-mood-selector">
                  {[1, 2, 3, 4, 5, 6, 7].map(lvl => {
                    const mood = MOOD_LEVELS[lvl]
                    const Icon = mood.icon
                    return (
                      <button
                        key={`end-${lvl}`}
                        type="button"
                        className={`aura-mood-btn ${endMood === lvl ? 'selected' : ''}`}
                        onClick={() => setEndMood(lvl)}
                        style={{
                          background: endMood === lvl ? mood.halo : 'rgba(255,255,255,0.05)',
                          color: endMood === lvl ? '#0f172a' : '#f4efe9',
                          borderColor: mood.halo,
                        }}
                        title={`${mood.label} · ${mood.subtitle}`}
                      >
                        <Icon size={16} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="aura-transition-section">
                <label>Notas del día:</label>
                <textarea
                  className="aura-notes-input"
                  placeholder="¿Cómo fue tu día?..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="aura-modal-footer">
              <button
                className="aura-modal-btn aura-modal-btn-cancel"
                onClick={() => setShowAdvancedModal(false)}
              >
                Cancelar
              </button>
              <button
                className="aura-modal-btn aura-modal-btn-save"
                onClick={handleAdvancedSave}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Estadísticas Globales */}
      {showStatsModal && createPortal(
        <div className="aura-modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="aura-modal-content aura-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="aura-modal-header">
              <h4>Estadísticas Globales</h4>
              <button className="aura-modal-close" onClick={() => setShowStatsModal(false)}>✕</button>
            </div>

            <div className="aura-modal-body">
              <div className="aura-detail-row">
                <span className="aura-detail-label">Total de días registrados:</span>
                <span className="aura-detail-value">{Object.keys(energyMap).length}</span>
              </div>
              <div className="aura-detail-row">
                <span className="aura-detail-label">Promedio de energía:</span>
                <span className="aura-detail-value">
                  {Object.keys(energyMap).length > 0
                    ? (Object.values(energyMap).reduce((sum, entry) => sum + (entry.level || 0), 0) / Object.keys(energyMap).length).toFixed(1)
                    : '-'}
                </span>
              </div>
              <div className="aura-detail-row">
                <span className="aura-detail-label">Días avanzados:</span>
                <span className="aura-detail-value">{Object.keys(advancedMap).length}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AuraHeatmap
