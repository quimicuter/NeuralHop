import { useEffect, useMemo, useState, useCallback } from 'react'
import { format, startOfWeek, addDays, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import './AuraHeatmap.css'

const STORAGE_KEY = 'aura_energy_map'
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Niveles 1-5 con paleta translúcida (cian → violeta → magenta)
// Cada nivel define color base, color exterior del aura y radio del glow
const ENERGY_LEVELS = {
  1: { core: '#67e8f9', halo: '#22d3ee', label: 'Bajo · introspectivo'   },
  2: { core: '#c4b5fd', halo: '#a78bfa', label: 'Calmo · sereno'         },
  3: { core: '#d8b4fe', halo: '#c084fc', label: 'Medio · equilibrada'    },
  4: { core: '#f0abfc', halo: '#e879f9', label: 'Alto · creativa'        },
  5: { core: '#fbcfe8', halo: '#ec4899', label: 'Radiante · expansiva'   },
}

function loadMap() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function AuraHeatmap() {
  const [energyMap, setEnergyMap] = useState(loadMap)
  const [activeKey, setActiveKey] = useState(null) // día seleccionado (muestra picker inline)

  // Persistencia
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(energyMap))
    } catch (e) {
      console.warn('AuraHeatmap persist error:', e)
    }
  }, [energyMap])

  // Semana actual L-D
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [])

  const setLevel = useCallback((dateKey, level) => {
    setEnergyMap(prev => {
      const next = { ...prev }
      if (level == null) delete next[dateKey]
      else next[dateKey] = { level }
      return next
    })
    setActiveKey(null)
  }, [])

  const todayLevel = useMemo(() => {
    const k = format(new Date(), 'yyyy-MM-dd')
    return energyMap[k]?.level ?? null
  }, [energyMap])

  return (
    <div className="aura-widget">
      <header className="aura-widget-header">
        <h3 className="aura-widget-title">Aura Heatmap</h3>
        <span className="aura-widget-sub">
          {todayLevel ? ENERGY_LEVELS[todayLevel].label : 'Toca un día'}
        </span>
      </header>

      <div className="aura-week-row">
        {weekDays.map((day, i) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const level = energyMap[dateKey]?.level ?? 0
          const isActive = activeKey === dateKey
          const todayFlag = isToday(day)
          const palette = level ? ENERGY_LEVELS[level] : null
          const intensity = level / 5 // 0..1
          const style = palette
            ? {
                background: `radial-gradient(circle at 35% 30%, ${palette.core} 0%, ${palette.halo} 70%, ${palette.halo}00 100%)`,
                boxShadow: `0 0 ${8 + intensity * 18}px ${palette.halo}${Math.round(60 + intensity * 60).toString(16)}, inset 0 0 6px rgba(255,255,255,0.4)`,
                borderColor: `${palette.halo}88`,
              }
            : undefined

          return (
            <button
              key={dateKey}
              type="button"
              className={`aura-day ${todayFlag ? 'is-today' : ''} ${level ? 'has-level' : 'is-empty'} ${isActive ? 'is-active' : ''}`}
              style={style}
              onClick={() => setActiveKey(isActive ? null : dateKey)}
              title={`${format(day, 'EEEE d MMM', { locale: es })}${level ? ` · ${ENERGY_LEVELS[level].label}` : ''}`}
              aria-label={`Día ${DAY_LABELS[i]}, nivel ${level || 'sin registro'}`}
            >
              <span className="aura-day-label">{DAY_LABELS[i]}</span>
              {level > 0 && <span className="aura-day-dot">{level}</span>}
            </button>
          )
        })}
      </div>

      {activeKey && (
        <div className="aura-picker" role="group" aria-label="Selecciona tu nivel de aura">
          {[1, 2, 3, 4, 5].map(lvl => {
            const p = ENERGY_LEVELS[lvl]
            return (
              <button
                key={lvl}
                type="button"
                className="aura-picker-btn"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${p.core}, ${p.halo})`,
                  boxShadow: `0 0 10px ${p.halo}90`,
                }}
                onClick={() => setLevel(activeKey, lvl)}
                title={p.label}
              >
                {lvl}
              </button>
            )
          })}
          <button
            type="button"
            className="aura-picker-btn aura-picker-clear"
            onClick={() => setLevel(activeKey, null)}
            title="Limpiar registro"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default AuraHeatmap
