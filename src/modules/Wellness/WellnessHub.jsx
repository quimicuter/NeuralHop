import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import SimpleTasks from '../../components/SimpleTasks'
import AuraHeatmap from './AuraHeatmap'
import './WellnessHub.css'

// ─── Constants ───────────────────────────────────────────────────────────────

const WELLNESS_TABS = [
  { id: 'glow',         label: 'Glow',          icon: '✧',  description: 'Brillo y recuperación', accent: '255, 167, 102' },
  { id: 'vitality',     label: 'Vitality',       icon: '🗲',  description: 'Energía y movimiento',  accent: '118, 97, 255'  },
  { id: 'innerBalance', label: 'Inner Balance',  icon: '⸙',  description: 'Hidratación y digestión', accent: '75, 190, 165' },
  { id: 'zenRest',      label: 'Zen Rest',       icon: '☾',  description: 'Sueño profundo y calma', accent: '113, 130, 255' }
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

const MOTIVATIONAL_QUOTES = [
  'El cuerpo logra lo que la mente cree.',
  'Cuídate como cuidas a quienes amas.',
  'El descanso no es rendición, es estrategia.',
  'Pequeños pasos cada día, grandes victorias en el tiempo.',
  'Tu bienestar es tu mejor inversión.',
  'La calma es una superpotencia.',
  'Florece desde adentro hacia afuera.'
]

const ACTIVE_PROJECTS = [
  { id: 'split', title: 'Operación Split', progress: 45 },
  { id: 'abs',   title: 'Operación Abs',   progress: 20 },
  { id: 'zen',   title: 'Zen 30 días',     progress: 63 }
]

const SLEEP_DATA = [6.2, 7.0, 5.8, 7.5, 8.0, 6.5, 7.2]
const SLEEP_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTodayQuote = () => {
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  )
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]
}

const getSleepBarHeight = (hours) => {
  const min = 4, max = 9
  return Math.min(100, Math.max(8, ((hours - min) / (max - min)) * 100))
}

// ─── Component ───────────────────────────────────────────────────────────────

function WellnessHub() {
  const navigate = useNavigate()
  useApp() // context subscription kept for future use

  const [activeTab,       setActiveTab]       = useState(() => {
    const saved = window.localStorage.getItem('wellness.activeTab')
    return WELLNESS_TABS.some(t => t.id === saved) ? saved : 'glow'
  })
  // checkedMap: { [tabId]: boolean[] }
  const [checkedMap,     setCheckedMap]      = useState({})
  const [toastMessage,   setToastMessage]    = useState('')
  const [toastVisible,   setToastVisible]    = useState(false)

  const activeTabConfig = WELLNESS_TABS.find(t => t.id === activeTab) || WELLNESS_TABS[0]
  const accent          = `rgba(${activeTabConfig.accent}, 1)`
  const accentSoft      = `rgba(${activeTabConfig.accent}, 0.18)`
  const routineSteps    = ROUTINE_FLOW[activeTab]
  const checkedRoutine  = checkedMap[activeTab] ?? routineSteps.map(() => false)
  const quote           = useMemo(() => getTodayQuote(), [])

  // Persist active tab
  useEffect(() => {
    window.localStorage.setItem('wellness.activeTab', activeTab)
  }, [activeTab])

  // Keyboard shortcuts
  useEffect(() => {
    const map = { '1': 'glow', '2': 'vitality', '3': 'innerBalance', '4': 'zenRest' }
    const onKey = (e) => {
      if (!e.ctrlKey) return
      const next = map[e.key]
      if (next) { e.preventDefault(); setActiveTab(next) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Toast auto-hide
  useEffect(() => {
    if (!toastVisible) return
    const t = window.setTimeout(() => setToastVisible(false), 2800)
    return () => window.clearTimeout(t)
  }, [toastVisible])

  const showToast = (msg) => { setToastMessage(msg); setToastVisible(true) }

  const handleRoutineToggle = (i) => {
    setCheckedMap(prev => {
      const current = prev[activeTab] ?? routineSteps.map(() => false)
      const next = [...current]
      next[i] = !next[i]
      if (next[i]) showToast(`✓ ${routineSteps[i].label}`)
      return { ...prev, [activeTab]: next }
    })
  }

  const progressPercent = checkedRoutine.length
    ? Math.round((checkedRoutine.filter(Boolean).length / checkedRoutine.length) * 100)
    : 0

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="wh-shell">

      {/* ── HEADER BAR ────────────────────────────────────────────────────── */}
      <header className="wh-topbar">
        <div className="wh-topbar-left">
          <button className="wh-back-btn" onClick={() => navigate(-1)}>←</button>
          <h1 className="wh-title">Wellness Hub</h1>
        </div>

        {/* Tab pills */}
        <nav className="wh-tabs">
          {WELLNESS_TABS.map(tab => (
            <button
              key={tab.id}
              className={`wh-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
              style={activeTab === tab.id ? { '--tab-accent': `rgba(${tab.accent}, 0.22)`, borderColor: `rgba(${tab.accent}, 0.5)` } : {}}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="wh-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="wh-topbar-right">
          <span className="wh-date-chip">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </span>
        </div>
      </header>

      {/* ── BENTO GRID ────────────────────────────────────────────────────── */}
      <main className="wh-bento">

        {/* ── ZONE A: Norte-Izquierda — Actividades Wellness (col 1-4 / row 1-2) ── */}
        <section
          className="wh-card wh-zone-activities"
          style={{ '--card-accent': accent, '--card-accent-soft': accentSoft }}
        >
          <div className="wh-card-header">
            <h2 className="wh-card-title">Actividades Wellness</h2>
            <button
              className="wh-add-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('open-global-modal', { detail: { type: 'task', scope: 'personal', module: 'wellness' } }))}
              title="Nueva actividad"
            >+</button>
          </div>

          {/* Toggle: Tareas / Eventos */}
          <div className="wh-activities-toggle">
            <SimpleTasks />
          </div>
        </section>

        {/* ── ZONE B: Norte-Derecha — Aura Heatmap (col 5-12 / row 1-2) ── */}
        <section className="wh-card wh-zone-aura">
          <AuraHeatmap />
        </section>

        {/* ── ZONE C: Centro — Routine Flow Timeline (col 1-12 / row 3-4) ── */}
        <section
          className="wh-card wh-zone-routine"
          style={{ '--card-accent': accent, '--card-accent-soft': accentSoft }}
        >
          <div className="wh-card-header">
            <h2 className="wh-card-title">Routine Flow</h2>
            <div className="wh-routine-progress-label">
              <span style={{ color: accent }}>{progressPercent}%</span>
              <span className="wh-muted"> completado</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="wh-routine-progressbar-track">
            <motion.div
              className="wh-routine-progressbar-fill"
              style={{ background: accent }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          {/* Timeline steps */}
          <div className="wh-timeline">
            {routineSteps.map((step, i) => (
              <motion.button
                key={step.time}
                type="button"
                className={`wh-timeline-step ${checkedRoutine[i] ? 'checked' : ''}`}
                style={checkedRoutine[i] ? { '--step-accent': accent, '--step-accent-soft': accentSoft } : {}}
                onClick={() => handleRoutineToggle(i)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="wh-step-dot" style={checkedRoutine[i] ? { background: accent } : {}} />
                <div className="wh-step-body">
                  <span className="wh-step-time">{step.time}</span>
                  <span className={`wh-step-label ${checkedRoutine[i] ? 'line-through' : ''}`}>
                    {step.label}
                  </span>
                </div>
                <div className="wh-step-check">{checkedRoutine[i] ? '✓' : ''}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── ZONE D: Sur-Izquierda — Sleep Tracker (col 1-5 / row 5-6) ── */}
        <section className="wh-card wh-zone-sleep">
          <div className="wh-card-header">
            <h2 className="wh-card-title">Sleep Tracker</h2>
            <span className="wh-muted wh-sleep-avg">
              Prom. {(SLEEP_DATA.reduce((a, b) => a + b, 0) / SLEEP_DATA.length).toFixed(1)}h
            </span>
          </div>

          <div className="wh-sleep-chart">
            {SLEEP_DATA.map((hours, i) => (
              <div key={i} className="wh-sleep-bar-col">
                <div className="wh-sleep-bar-wrap">
                  <motion.div
                    className="wh-sleep-bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${getSleepBarHeight(hours)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                    style={{
                      background: hours >= 7
                        ? 'linear-gradient(to top, rgba(113,130,255,0.9), rgba(196,181,253,0.7))'
                        : 'linear-gradient(to top, rgba(113,130,255,0.4), rgba(196,181,253,0.25))'
                    }}
                    title={`${hours}h`}
                  />
                </div>
                <span className="wh-sleep-day-label">{SLEEP_LABELS[i]}</span>
                <span className="wh-sleep-hours">{hours}h</span>
              </div>
            ))}
          </div>

          <div className="wh-sleep-legend">
            <span className="wh-sleep-legend-dot optimal" />
            <span className="wh-muted">≥ 7h óptimo</span>
            <span className="wh-sleep-legend-dot low" />
            <span className="wh-muted">{'< 7h'}</span>
          </div>
        </section>

        {/* ── ZONE E: Sur-Derecha — Motivational Quote + Proyectos (col 6-12 / row 5-6) ── */}
        <div className="wh-zone-south-right">

          {/* Quote card (delgada, alto impacto) */}
          <section className="wh-card wh-zone-quote">
            <p className="wh-quote-mark">&ldquo;</p>
            <blockquote className="wh-quote-text">{quote}</blockquote>
            <p className="wh-quote-mark wh-quote-mark-close">&rdquo;</p>
          </section>

          {/* Proyectos Wellness */}
          <section className="wh-card wh-zone-projects">
            <div className="wh-card-header">
              <h2 className="wh-card-title">Proyectos Wellness</h2>
              <button className="wh-add-btn" title="Nuevo proyecto">+</button>
            </div>

            <div className="wh-projects-list">
              {ACTIVE_PROJECTS.map((proj) => (
                <div key={proj.id} className="wh-project-row">
                  <div className="wh-project-meta">
                    <span className="wh-project-name">{proj.title}</span>
                    <span className="wh-project-pct" style={{ color: accent }}>{proj.progress}%</span>
                  </div>
                  <div className="wh-project-track">
                    <motion.div
                      className="wh-project-fill"
                      style={{ background: accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${proj.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

      </main>

      {/* ── TOAST ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            className="wh-toast"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default WellnessHub
