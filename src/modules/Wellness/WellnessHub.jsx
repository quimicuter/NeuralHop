import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import SimpleTasks from '../../components/SimpleTasks'
import SimpleEvents from '../../components/SimpleEvents'
import AuraHeatmap from './AuraHeatmap'
import SubModuleHubModal from './SubModuleHubModal'
import './WellnessHub.css'

// ─── Constants ───────────────────────────────────────────────────────────────

const WELLNESS_TABS = [
  { id: 'glow',         label: 'Glow',          icon: '✧',  description: 'Brillo y recuperación', accent: '255, 167, 102' },
  { id: 'vitality',     label: 'Vitality',       icon: '🗲',  description: 'Energía y movimiento',  accent: '118, 97, 255'  },
  { id: 'innerBalance', label: 'Inner Balance',  icon: '⸙',  description: 'Hidratación y digestión', accent: '75, 190, 165' },
  { id: 'zenRest',      label: 'Zen Rest',       icon: '☾',  description: 'Sueño profundo y calma', accent: '113, 130, 255' }
]

// Routine Flow internal filters (Global + submodules). Uses system glyphs.
const ROUTINE_FILTERS = [
  { id: 'all',          label: 'Global',         icon: '\u{1F310}', accent: '120, 130, 180' }, // 🌐
  { id: 'glow',         label: 'Glow',           icon: '\u2727',    accent: '255, 167, 102' }, // ✧
  { id: 'vitality',     label: 'Vitality',       icon: '\u{1F5F2}', accent: '118, 97, 255'  }, // 🗲
  { id: 'innerBalance', label: 'Inner Balance',  icon: '\u2E19',    accent: '75, 190, 165'  }, // ⸙
  { id: 'zenRest',      label: 'Zen Rest',       icon: '\u263E',    accent: '113, 130, 255' }, // ☾
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

  // Routine Flow internal filter ('all' | submoduleId)
  const [routineFilter,   setRoutineFilter]   = useState(() => {
    const saved = window.localStorage.getItem('wellness.routineFilter')
    return ROUTINE_FILTERS.some(t => t.id === saved) ? saved : 'all'
  })
  // checkedMap: { [filterId]: boolean[] }
  const [checkedMap,     setCheckedMap]      = useState({})
  const [toastMessage,   setToastMessage]    = useState('')
  const [toastVisible,   setToastVisible]    = useState(false)
  
  // 3D Cube state
  const [cubeFace,       setCubeFace]        = useState('tasks')

  // Sub-Hub Modal state
  const [subHubOpen,     setSubHubOpen]      = useState(false)
  const [subHubId,       setSubHubId]        = useState(null)

  const openSubHub = (id) => { setSubHubId(id); setSubHubOpen(true) }
  const closeSubHub = () => { setSubHubOpen(false) }

  const activeFilterConfig = ROUTINE_FILTERS.find(t => t.id === routineFilter) || ROUTINE_FILTERS[0]
  const accent          = `rgba(${activeFilterConfig.accent}, 1)`
  const accentSoft      = `rgba(${activeFilterConfig.accent}, 0.18)`
  const routineSteps    = useMemo(() => {
    if (routineFilter === 'all') {
      const all = Object.entries(ROUTINE_FLOW).flatMap(([sub, steps]) =>
        steps.map(s => ({ ...s, sub }))
      )
      return all.sort((a, b) => a.time.localeCompare(b.time))
    }
    return ROUTINE_FLOW[routineFilter] || []
  }, [routineFilter])
  const checkedRoutine  = checkedMap[routineFilter] ?? routineSteps.map(() => false)
  const quote           = useMemo(() => getTodayQuote(), [])

  // Persist routine filter
  useEffect(() => {
    window.localStorage.setItem('wellness.routineFilter', routineFilter)
  }, [routineFilter])

  // Keyboard shortcuts (cycle routine filter)
  useEffect(() => {
    const map = { '0': 'all', '1': 'glow', '2': 'vitality', '3': 'innerBalance', '4': 'zenRest' }
    const onKey = (e) => {
      if (!e.ctrlKey) return
      const next = map[e.key]
      if (next) { e.preventDefault(); setRoutineFilter(next) }
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
      const current = prev[routineFilter] ?? routineSteps.map(() => false)
      const next = [...current]
      next[i] = !next[i]
      if (next[i]) showToast(`✓ ${routineSteps[i].label}`)
      return { ...prev, [routineFilter]: next }
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

        {/* Tab pills — clicking only opens the corresponding Sub-Hub Modal */}
        <nav className="wh-tabs">
          {WELLNESS_TABS.map(tab => (
            <button
              key={tab.id}
              className="wh-tab-pill"
              title={`Abrir Sub-Hub ${tab.label}`}
              onClick={() => openSubHub(tab.id)}
            >
              <span className="wh-tab-icon">{tab.icon}</span>
              <span className="wh-tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="wh-topbar-right">
          <span className="wh-date-chip">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </span>
        </div>
      </header>

      {/* ── 4-COLUMN GRID ─────────────────────────────────────────────────── */}
      <main className="wh-grid-4col">

        {/* ── COLUMN 1: Estado Interno ─────────────────────────────────────── */}
        <section className="wh-column wh-column-state">
          {/* Aura Heatmap - Químicute */}
          <div className="wh-card wh-aura-tracker">
            <AuraHeatmap />
          </div>

          {/* Sleep Tracker */}
          <div className="wh-card wh-sleep-tracker">
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
          </div>
        </section>

        {/* ── COLUMN 2: Eje de Vida ─────────────────────────────────────── */}
        <section className="wh-column wh-column-axis">
          <div className="wh-card wh-routine-flow">
            <div className="wh-card-header">
              <h2 className="wh-card-title">Routine Flow</h2>
              <div className="wh-routine-progress-label">
                <span style={{ color: accent }}>{progressPercent}%</span>
                <span className="wh-muted"> completado</span>
              </div>
            </div>

            {/* Internal filter nav (Global + 4 submódulos) */}
            <nav className="wh-routine-filter" aria-label="Filtro de rutinas">
              {ROUTINE_FILTERS.map(f => {
                const isActive = routineFilter === f.id
                return (
                  <button
                    key={f.id}
                    className={`wh-routine-filter-btn ${isActive ? 'active' : ''}`}
                    title={f.label}
                    aria-pressed={isActive}
                    onClick={() => setRoutineFilter(f.id)}
                    style={isActive ? {
                      color: `rgb(${f.accent})`,
                      background: `rgba(${f.accent}, 0.14)`,
                      borderColor: `rgba(${f.accent}, 0.45)`,
                      boxShadow: `0 0 8px rgba(${f.accent}, 0.45)`
                    } : {}}
                  >
                    <span className="wh-routine-filter-glyph">{f.icon}</span>
                  </button>
                )
              })}
            </nav>

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

            {/* Vertical zig-zag timeline with absolute centering */}
            <div className="wh-timeline-container">
              {/* Central axis line */}
              <div className="wh-timeline-axis" />
              
              {/* Timeline steps */}
              {routineSteps.map((step, i) => (
                <motion.div
                  key={`${step.sub ?? routineFilter}-${step.time}-${i}`}
                  className={`wh-timeline-step ${i % 2 === 0 ? 'left' : 'right'} ${checkedRoutine[i] ? 'checked' : ''}`}
                  style={checkedRoutine[i] ? { '--step-accent': accent, '--step-accent-soft': accentSoft } : {}}
                  onClick={() => handleRoutineToggle(i)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Connector line */}
                  <div className="wh-timeline-connector" />
                  
                  {/* Central dot */}
                  <div className="wh-timeline-dot" style={checkedRoutine[i] ? { background: accent } : {}} />
                  
                  {/* Step card */}
                  <div className="wh-timeline-card">
                    <div className="wh-timeline-time">{step.time}</div>
                    <div className={`wh-timeline-label ${checkedRoutine[i] ? 'line-through' : ''}`}>
                      {step.label}
                    </div>
                    <div className="wh-timeline-check">{checkedRoutine[i] ? '✓' : ''}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COLUMN 3: Metas & Mindset ─────────────────────────────────── */}
        <section className="wh-column wh-column-mindset">
          {/* Motivational Quote */}
          <div className="wh-card wh-motivation-quote">
            <p className="wh-quote-mark">&ldquo;</p>
            <blockquote className="wh-quote-text">{quote}</blockquote>
            <p className="wh-quote-mark wh-quote-mark-close">&rdquo;</p>
          </div>

          {/* Wellness Projects (compact) */}
          <div className="wh-card wh-wellness-projects">
            <div className="wh-card-header">
              <h2 className="wh-card-title">Proyectos Wellness</h2>
              <button className="wh-add-btn" title="Nuevo proyecto">+</button>
              <button className="wh-history-btn" title="Historial de proyectos">🕒</button>
            </div>

            <div className="wh-projects-compact-list">
              {ACTIVE_PROJECTS.map((proj) => (
                <div key={proj.id} className="wh-project-compact-row">
                  <div className="wh-project-compact-meta">
                    <span className="wh-project-compact-name">{proj.title}</span>
                    <span className="wh-project-compact-pct" style={{ color: accent }}>{proj.progress}%</span>
                  </div>
                  <div className="wh-project-compact-track">
                    <motion.div
                      className="wh-project-compact-fill"
                      style={{ background: accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${proj.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COLUMN 4: Acción (3D Cube) ─────────────────────────────────── */}
        <section className="wh-column wh-column-action">
          <div className="wh-card wh-action-cube">
            {/* Toggle buttons */}
            <div className="wh-cube-toggle">
              <button
                className={`wh-cube-btn ${cubeFace === 'tasks' ? 'active' : ''}`}
                onClick={() => setCubeFace('tasks')}
              >
                Tareas
              </button>
              <button
                className={`wh-cube-btn ${cubeFace === 'events' ? 'active' : ''}`}
                onClick={() => setCubeFace('events')}
              >
                Eventos
              </button>
            </div>

            {/* 3D Cube container */}
            <div className="wh-cube-container">
              <motion.div
                className="wh-cube"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: cubeFace === 'events' ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
                transition={{ duration: 0.6, ease: 'ease-in-out' }}
              >
                {/* Front face - Tasks */}
                <div className="wh-cube-face wh-cube-front">
                  <div className="wh-cube-face-header">
                    <h3>Wellness Tasks</h3>
                    <button
                      className="wh-add-btn"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-global-modal', { detail: { type: 'task', scope: 'personal', module: 'wellness' } }))}
                      title="Nueva tarea"
                    >+</button>
                  </div>
                  <div className="wh-cube-content">
                    <SimpleTasks />
                  </div>
                </div>

                {/* Back face - Events */}
                <div className="wh-cube-face wh-cube-back">
                  <div className="wh-cube-face-header">
                    <h3>Wellness Events</h3>
                    <button
                      className="wh-add-btn"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-global-modal', { detail: { type: 'event', scope: 'personal', module: 'wellness' } }))}
                      title="Nuevo evento"
                    >+</button>
                  </div>
                  <div className="wh-cube-content">
                    <SimpleEvents />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

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

      {/* ── SUB-HUB MODAL ──────────────────────────────────────────────────── */}
      {subHubId && (
        <SubModuleHubModal
          isOpen={subHubOpen}
          onClose={closeSubHub}
          submoduleId={subHubId}
        />
      )}

    </div>
  )
}

export default WellnessHub