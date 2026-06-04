import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import './RoutineFlow.css'

const ROUTINE_FILTERS = [
  { id: 'all',          label: 'Global',         icon: '\u{1F310}', accent: '120, 130, 180' },
  { id: 'glow',         label: 'Glow',           icon: '\u2727',    accent: '255, 167, 102' },
  { id: 'vitality',     label: 'Vitality',       icon: '\u{1F5F2}', accent: '118, 97, 255'  },
  { id: 'innerBalance', label: 'Inner Balance',  icon: '\u2E19',    accent: '75, 190, 165'  },
  { id: 'zenRest',      label: 'Zen Rest',       icon: '\u263E',    accent: '113, 130, 255' },
]

const ROUTINE_FLOW = {
  glow: [
    { time: '07:30', label: 'Ritual facial matutino' },
    { time: '09:00', label: 'Agua con electrolitos'  },
    { time: '19:45', label: 'Mascarilla nutritiva'   },
    { time: '22:15', label: 'Meditación restauradora'}
  ],
  vitality: [
    { time: '06:30', label: 'Cardio de 20 min'       },
    { time: '11:00', label: 'Snack verde'             },
    { time: '15:30', label: 'Circuito core'           },
    { time: '21:00', label: 'Estiramiento profundo'   }
  ],
  innerBalance: [
    { time: '08:00', label: 'Agua tibia con limón'   },
    { time: '12:30', label: 'Ensalada nutritiva'      },
    { time: '16:00', label: 'Pausa de respiración'    },
    { time: '20:30', label: 'Infusión digestiva'      }
  ],
  zenRest: [
    { time: '20:30', label: 'Diario de gratitud'      },
    { time: '21:00', label: 'Lectura ligera'          },
    { time: '21:45', label: 'Rutina de sueño'         },
    { time: '22:15', label: 'Visualización calmante'  }
  ]
}

export default function RoutineFlow() {
  const { getHabits, actions } = useApp()
  const globalHabits = getHabits ? getHabits() : []

  const [routineFilter, setRoutineFilter] = useState(() => {
    const saved = window.localStorage.getItem('wellness.routineFilter')
    return ROUTINE_FILTERS.some(t => t.id === saved) ? saved : 'all'
  })
  const [checkedMap, setCheckedMap] = useState({})
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [hiddenStatics, setHiddenStatics] = useState(() => {
    const saved = window.localStorage.getItem('wellness.hiddenStatics')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    window.localStorage.setItem('wellness.routineFilter', routineFilter)
  }, [routineFilter])

  const showToast = (msg) => { setToastMessage(msg); setToastVisible(true) }
  useEffect(() => {
    if (!toastVisible) return
    const t = window.setTimeout(() => setToastVisible(false), 2600)
    return () => window.clearTimeout(t)
  }, [toastVisible])

  const dynamicHabits = useMemo(() => {
    return (globalHabits || [])
      .filter(h => h && h.type === 'habit' && h.module === 'wellness')
      .map(h => {
        const sub = h.submodule || h.metadata?.submodule || h.metadata?.category || ''
        const time = h.time || h.metadata?.time || ''
        return { id: h.id, time, label: h.title || 'Hábito', sub, dynamic: true, entry: h }
      })
      .filter(h => !!h.time)
  }, [globalHabits])

  const routineSteps = useMemo(() => {
    const baseAll = Object.entries(ROUTINE_FLOW || {}).flatMap(([sub, steps]) =>
      (steps || []).map(s => ({ ...s, sub, dynamic: false }))
    ).filter(s => !hiddenStatics.includes(s.label))

    const merged = [...baseAll, ...dynamicHabits]
    const filtered = routineFilter === 'all' ? merged : merged.filter(s => s.sub === routineFilter)
    return filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }, [routineFilter, dynamicHabits, hiddenStatics])

  const checkedRoutine = checkedMap[routineFilter] ?? (routineSteps?.map(() => false) || [])

  const progressPercent = checkedRoutine.length
    ? Math.round((checkedRoutine.filter(Boolean).length / checkedRoutine.length) * 100)
    : 0

  const handleRoutineToggle = (i) => {
    setCheckedMap(prev => {
      const current = prev[routineFilter] ?? routineSteps.map(() => false)
      const next = [...current]
      next[i] = !next[i]
      if (next[i]) showToast(`✓ ${routineSteps[i].label}`)
      return { ...prev, [routineFilter]: next }
    })
  }

  const requestDelete = (entry) => {
    setItemToDelete(entry)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    if (itemToDelete.id) {
      try {
        await actions.deleteEntry(itemToDelete.id)
        showToast('🗑 Hábito eliminado')
      } catch (err) {
        console.error('[RoutineFlow] Error:', err)
      }
    } else {
      const nextHidden = [...hiddenStatics, itemToDelete.title || itemToDelete.label]
      setHiddenStatics(nextHidden)
      window.localStorage.setItem('wellness.hiddenStatics', JSON.stringify(nextHidden))
      showToast('🗑 Rutina oculta')
    }
    setItemToDelete(null)
  }

  return (
    <div className="wh-card wh-routine-flow" role="region" aria-label="Routine Flow">
      <div className="wh-card-header">
        <h2 className="wh-card-title">Routine Flow</h2>
        <div className="wh-routine-progress-label" aria-hidden>
          <span style={{ color: 'var(--routine-accent, rgb(118,97,255))', fontWeight: 700 }}>{progressPercent}%</span>
          <span className="wh-muted"> completado</span>
        </div>
      </div>

      <nav className="wh-routine-filter" aria-label="Filtro de rutinas">
        {ROUTINE_FILTERS?.map(f => {
          const isActive = routineFilter === f.id
          return (
            <button
              key={f.id}
              className={`wh-routine-filter-btn ${isActive ? 'active' : ''}`}
              title={f.label}
              onClick={() => setRoutineFilter(f.id)}
              style={isActive ? {
                color: `rgb(${f.accent})`,
                background: `rgba(${f.accent}, 0.14)`,
                borderColor: `rgba(${f.accent}, 0.45)`
              } : {}}
            >
              <span className="wh-routine-filter-glyph">{f.icon}</span>
            </button>
          )
        })}
      </nav>

      <div className="wh-routine-progressbar-track" aria-hidden>
        <motion.div
          className="wh-routine-progressbar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="wh-timeline-container wh-timeline-scroll" style={{ maxHeight: 'calc(100vh - 12rem)', overflowY: 'auto' }}>
        <div className="wh-timeline-axis" aria-hidden />

        {routineSteps?.map((step, i) => {
          const stepFilter = ROUTINE_FILTERS.find(f => f.id === step.sub)
          const stepAccentRgb = stepFilter?.accent || '118, 97, 255'
          const stepAccent = `rgb(${stepAccentRgb})`
          const stepAccentSoft = `rgba(${stepAccentRgb}, 0.08)`
          const isChecked = checkedRoutine[i]

          return (
            <motion.div
              key={`${step?.id ?? step?.sub}-${step?.time ?? i}-${i}`}
              className={`wh-timeline-step ${i % 2 === 0 ? 'left' : 'right'} ${isChecked ? 'checked' : ''}`}
              style={{ '--step-accent': stepAccent, '--step-accent-soft': stepAccentSoft }}
              whileTap={{ scale: 0.985 }}
            >
              <div className="wh-timeline-connector" />

              <div
                className="wh-timeline-dot"
                onClick={(e) => { e.stopPropagation(); handleRoutineToggle(i) }}
                style={{ background: isChecked ? stepAccent : undefined, borderColor: stepAccent }}
              />

              <div className="wh-timeline-card">
                <div className="wh-timeline-card-body">
                  <div 
                    className={`wh-routine-inline-checkbox ${isChecked ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleRoutineToggle(i) }}
                    style={{ borderColor: stepAccent, backgroundColor: isChecked ? stepAccent : 'transparent' }}
                  >
                    {isChecked && '✓'}
                  </div>
                  
                  <div className="wh-timeline-text-group">
                    <span className="wh-timeline-time" style={{ color: stepAccent }}>{step.time}</span>
                    <span className={`wh-timeline-label ${isChecked ? 'line-through' : ''}`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {itemToDelete && (
          <div className="wh-premium-overlay" onClick={() => setItemToDelete(null)}>
            <motion.div 
              className="wh-premium-confirm-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="wh-premium-confirm-title">✨ ¿Eliminar actividad?</h3>
              <p className="wh-premium-confirm-text">
                Estás por remover "<strong>{itemToDelete.title || itemToDelete.label}</strong>" de tu flujo de rutinas diarias.
              </p>
              <div className="wh-premium-confirm-actions">
                <button className="wh-premium-btn-cancel" onClick={() => setItemToDelete(null)}>Cancelar</button>
                <button className="wh-premium-btn-confirm" onClick={confirmDelete}>Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastVisible && (
          <motion.div className="wh-toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}