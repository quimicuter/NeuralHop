import { useEffect, useMemo, useRef, useState } from 'react'
import { format, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './WellnessHub.css'
import AuraHeatmap from './AuraHeatmap'

const WELLNESS_TABS = [
  { id: 'glow', label: 'Glow', icon: '✧', description: 'Brillo y recuperación', accent: '255, 167, 102' },
  { id: 'vitality', label: 'Vitality', icon: '🗲', description: 'Energía y movimiento', accent: '118, 97, 255' },
  { id: 'innerBalance', label: 'Inner Balance', icon: '⸙', description: 'Hidratación y digestión', accent: '75, 190, 165' },
  { id: 'zenRest', label: 'Zen Rest', icon: '☾', description: 'Sueño profundo y calma', accent: '113, 130, 255' }
]

const ROUTINE_FLOW = {
  glow: [
    { time: '07:30', label: 'Ritual facial matutino' },
    { time: '09:00', label: 'Agua con electrolitos' },
    { time: '19:45', label: 'Mascarilla nutritiva' },
    { time: '22:15', label: 'Meditación restauradora' }
  ],
  vitality: [
    { time: '06:30', label: 'Cardio de 20 min' },
    { time: '11:00', label: 'Snack verde' },
    { time: '15:30', label: 'Circuito core' },
    { time: '21:00', label: 'Estiramiento profundo' }
  ],
  innerBalance: [
    { time: '08:00', label: 'Agua tibia con limón' },
    { time: '12:30', label: 'Ensalada nutritiva' },
    { time: '16:00', label: 'Pausa de respiración' },
    { time: '20:30', label: 'Infusión digestiva' }
  ],
  zenRest: [
    { time: '20:30', label: 'Diario de gratitud' },
    { time: '21:00', label: 'Lectura ligera' },
    { time: '21:45', label: 'Rutina de sueño' },
    { time: '22:15', label: 'Visualización calmante' }
  ]
}

const TELEMETRY_DATA = {
  glow: {
    sleep: [48, 60, 55, 70, 66, 74, 78],
    water: [50, 62, 58, 69, 71, 80, 84],
    digestion: [35, 44, 51, 47, 58, 65, 72]
  },
  vitality: {
    sleep: [40, 52, 63, 59, 68, 72, 76],
    water: [45, 58, 61, 66, 74, 79, 83],
    digestion: [28, 36, 43, 49, 57, 63, 69]
  },
  innerBalance: {
    sleep: [42, 54, 58, 63, 70, 76, 79],
    water: [52, 60, 65, 70, 78, 83, 88],
    digestion: [39, 48, 55, 60, 68, 74, 80]
  },
  zenRest: {
    sleep: [55, 64, 72, 77, 80, 84, 88],
    water: [40, 50, 58, 64, 70, 75, 79],
    digestion: [32, 38, 45, 50, 57, 63, 68]
  }
}

const TELEMETRY_COLORS = {
  sleep: 'rgba(147, 197, 253, 0.95)',
  water: 'rgba(248, 191, 255, 0.95)',
  digestion: 'rgba(167, 243, 208, 0.95)'
}

const SUBMODULE_TITLE = {
  glow: '✧ GLOW',
  vitality: '🗲 VITALITY',
  innerBalance: '⸙ INNER BALANCE',
  zenRest: '☾𖤓 ZEN REST'
}

const getInitialActiveTab = () => {
  try {
    const saved = window.localStorage.getItem('wellness.activeTab')
    if (saved && WELLNESS_TABS.some((tab) => tab.id === saved)) {
      return saved
    }
  } catch {
    // Ignorar si no hay localStorage disponible
  }
  return 'glow'
}

const MODAL_CONTENT = {
  glow: {
    routines: ['Mascarilla de noche', 'Sérum iluminador', 'Masaje facial rápido', 'Mascarilla nutritiva'],
    tasks: ['Aplicar crema con SPF', 'Beber agua con electrolitos', 'Masajear contorno de ojos', 'Registrar cuidados faciales'],
    events: ['Sesión de spa visual — 19:00', 'Recordatorio de hidratación — 09:00', 'Cita con cosmetóloga — 15:30']
  },
  vitality: {
    routines: ['Calentamiento activo', 'HIIT breve', 'Ritmo de caminata', 'Recuperación dinámica'],
    tasks: ['Preparar batido energético', 'Estiramiento de piernas', 'Revisar pulso post entreno', 'Planificar caminata'],
    events: ['Clase de baile — 08:30', 'Revisión de rutina — 12:00', 'Cita con coach — 18:00']
  },
  innerBalance: {
    routines: ['Agua tibia con limón', 'Batido verde suave', 'Digestión consciente', 'Yoga ligero'],
    tasks: ['Registrar comidas del día', 'Beber agua antes de cada comida', 'Respirar profundamente', 'Tomar té digestivo'],
    events: ['Sesión de meditación — 07:30', 'Chequeo de bienestar — 13:00', 'Taller de intestinalidad — 17:45']
  },
  zenRest: {
    routines: ['Desconexión tecnológica', 'Respiración 4-7-8', 'Ritual de higiene nocturna', 'Música relajante'],
    tasks: ['Apagar pantallas 30 min antes', 'Registrar gratitud', 'Preparar almohada aromática', 'Revisar temperatura de la habitación'],
    events: ['Rutina de sueño — 21:15', 'Lectura ligera — 21:45', 'Cita de descanso — 22:15']
  }
}

const getSparklinePath = (values) => {
  const width = 120
  const height = 56
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const normalized = (value - min) / range
      const y = height - normalized * (height - 12) - 6
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function WellnessHub() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(getInitialActiveTab)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionView, setActionView] = useState('tareas')
  const [cycleDays, setCycleDays] = useState({ skin: 3, sheets: 7, nails: 2 })
  const [cycleAnimation, setCycleAnimation] = useState({ skin: 0.3, sheets: 0.7, nails: 0.2 })
  const [checkedRoutine, setCheckedRoutine] = useState(() => ROUTINE_FLOW[getInitialActiveTab()].map(() => false))
  const cycleResetRef = useRef(null)

  const activeTabConfig = WELLNESS_TABS.find((tab) => tab.id === activeTab) || WELLNESS_TABS[0]
  const currentSubmodule = activeTab
  const currentSubmoduleConfig = WELLNESS_TABS.find((tab) => tab.id === currentSubmodule) || activeTabConfig

  const telemetryDisplay = useMemo(
    () => TELEMETRY_DATA[activeTab] || TELEMETRY_DATA.glow,
    [activeTab]
  )

  const cycleMeters = [
    { key: 'skin', label: 'Piel', color: 'rgba(147, 197, 253, 0.95)', days: cycleDays.skin },
    { key: 'sheets', label: 'Sábanas', color: 'rgba(129, 140, 248, 0.9)', days: cycleDays.sheets },
    { key: 'nails', label: 'Uñas', color: 'rgba(167, 139, 250, 0.9)', days: cycleDays.nails }
  ]

  const activeProjects = [
    { id: 'split', title: 'Operación Split', progress: 45, detail: '45%' },
    { id: 'abs', title: 'Operación Abs', progress: 20, detail: '20%' }
  ]

  const setActiveTabAndResetRoutine = (nextTab) => {
    setActiveTab(nextTab)
    setCheckedRoutine(ROUTINE_FLOW[nextTab].map(() => false))
  }

  const handleProjectMilestone = (project) => {
    setToastMessage(`Añadir hito: ${project.title}`)
    setToastVisible(true)
  }

  const routineSteps = ROUTINE_FLOW[activeTab]

  useEffect(() => {
    window.localStorage.setItem('wellness.activeTab', activeTab)
  }, [activeTab])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!event.ctrlKey) return
      const map = { '1': 'glow', '2': 'vitality', '3': 'innerBalance', '4': 'zenRest' }
      const next = map[event.key]
      if (next) {
        event.preventDefault()
        setActiveTabAndResetRoutine(next)
        setToastMessage(`Activo: ${WELLNESS_TABS.find((tab) => tab.id === next)?.label}`)
        setToastVisible(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!toastVisible) return
    const handle = window.setTimeout(() => setToastVisible(false), 2800)
    return () => window.clearTimeout(handle)
  }, [toastVisible])

  useEffect(() => {
    return () => {
      if (cycleResetRef.current) {
        window.clearTimeout(cycleResetRef.current)
      }
    }
  }, [])

  const today = startOfDay(new Date())

  const showToast = (message) => {
    setToastMessage(message)
    setToastVisible(true)
  }

  const handleCycleCheckin = () => {
    setCycleAnimation({ skin: 1, sheets: 1, nails: 1 })
    if (cycleResetRef.current) {
      window.clearTimeout(cycleResetRef.current)
    }
    cycleResetRef.current = window.setTimeout(() => {
      setCycleDays({ skin: 0, sheets: 0, nails: 0 })
      setCycleAnimation({ skin: 0, sheets: 0, nails: 0 })
      showToast('Ciclo reiniciado')
    }, 900)
  }

  const handleRoutineToggle = (index) => {
    setCheckedRoutine((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const convertToGridPosition = (xStart, xEnd, yStart, yEnd) => {
    const gridColumn = `${xStart} / ${xEnd + 1}`
    const gridRow = `${13 - yEnd} / ${13 - yStart + 1}`

    return { gridColumn, gridRow }
  }

  return (
    <div className="wellness-shell">
      <header className="wellness-header">
        <button type="button" className="wellness-header-back" onClick={() => navigate('/')}>← ⌂</button>
        <div className="wellness-header-title">
          <span>Wellness Hub</span>
        </div>
        <div className="wellness-header-tabs">
          {WELLNESS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`wellness-tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTabAndResetRoutine(tab.id)}
            >
              <span className="wellness-tab-icon">{tab.icon}</span>
              <span className="wellness-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        <button type="button" className="wellness-header-add">+</button>
      </header>
      <div className="wellness-content">
        <div
          className="glass-card wellness-card wellness-routine-card"
          style={{
            ...convertToGridPosition(1, 4, 1, 8),
            minHeight: '0',
            minWidth: '0',
            overflow: 'hidden'
          }}
        >
          <div className="wellness-card-header">
            <p className="wellness-card-label">Routine Flow</p>
            <button className="wellness-small-add" type="button">+</button>
          </div>
          <div className="wellness-routine-body">
            <div className="wellness-routine-track">
              <div className="wellness-routine-line" />
              {routineSteps.map((step, index) => (
                <span
                  key={step.time}
                  className="wellness-routine-dot"
                  style={{ top: `${(index / Math.max(routineSteps.length - 1, 1)) * 100}%` }}
                />
              ))}
            </div>
            <ul className="wellness-routine-list">
              {routineSteps.map((step, index) => (
                <li key={step.time} className="wellness-routine-item">
                  <label className="wellness-routine-task">
                    <input
                      type="checkbox"
                      checked={checkedRoutine[index] || false}
                      onChange={() => handleRoutineToggle(index)}
                    />
                    <span>{`${step.time} · ${step.label}`}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="glass-card wellness-card wellness-radar-card"
          style={{
            ...convertToGridPosition(5, 8, 1, 6),
            minHeight: '0',
            minWidth: '0',
            overflow: 'hidden'
          }}
        >
          <div className="wellness-card-header">
            <p className="wellness-card-label">Cyclic Radar</p>
            <button type="button" className="wellness-small-add" onClick={handleCycleCheckin}>+ Ingresar</button>
          </div>
          <div className="wellness-radar-meters">
            {cycleMeters.map((meter) => {
              const radius = 22
              const circumference = 2 * Math.PI * radius
              const progress = cycleAnimation[meter.key]
              const dashOffset = circumference * (1 - progress)
              return (
                <div key={meter.key} className="wellness-radar-meter">
                  <svg viewBox="0 0 56 56" className="wellness-radar-svg">
                    <circle
                      cx="28"
                      cy="28"
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.16)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="28"
                      cy="28"
                      r={radius}
                      fill="none"
                      stroke={meter.color}
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 28 28)"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: dashOffset }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                    <text
                      x="50%"
                      y="50%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      className="wellness-radar-center-text"
                    >
                      {meter.days}d
                    </text>
                  </svg>
                  <span className="wellness-radar-item-label">{meter.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="glass-card wellness-card wellness-carousel-card"
          style={{
            ...convertToGridPosition(9, 12, 1, 6),
            minHeight: '0',
            minWidth: '0',
            overflow: 'hidden'
          }}
        >
          <div className="wellness-card-header wellness-action-header">
            <p className="wellness-card-label">Action Carousel</p>
            <div className="wellness-toggle-group">
              <button
                type="button"
                className={`pill-button ${actionView === 'tareas' ? 'active' : ''}`}
                onClick={() => setActionView('tareas')}
              >
                Tareas
              </button>
              <button
                type="button"
                className={`pill-button ${actionView === 'eventos' ? 'active' : ''}`}
                onClick={() => setActionView('eventos')}
              >
                Eventos
              </button>
            </div>
          </div>
          <div style={{ perspective: 1000 }} className="wellness-flip-container">
            <AnimatePresence initial={false} mode="wait">
              {actionView === 'tareas' ? (
                <motion.div
                  key="tareas"
                  className="wellness-flip-card"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <ul className="wellness-carousel-list">
                    {[
                      'Comprar magnesio',
                      'Enviar reporte semanal',
                      'Revisar plan de entrenamiento'
                    ].map((task) => (
                      <li key={task} className="wellness-carousel-item">
                        <label className="wellness-carousel-task">
                          <input type="checkbox" />
                          <span>{task}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.div
                  key="eventos"
                  className="wellness-flip-card"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <ul className="wellness-carousel-list">
                    {[
                      'Cita Dermatólogo - 15 Mayo',
                      'Clase de yoga - 18 Mayo',
                      'Consulta nutrición - 20 Mayo'
                    ].map((event) => (
                      <li key={event} className="wellness-carousel-item">
                        <div className="wellness-carousel-event">{event}</div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          className="glass-card wellness-card wellness-telemetry-card"
          style={{
            ...convertToGridPosition(5, 8, 7, 12),
            minHeight: '0',
            minWidth: '0',
            overflow: 'hidden'
          }}
        >
          <div className="wellness-card-header">
            <p className="wellness-card-label">Vitality Telemetry</p>
            <span className="wellness-telemetry-note">Sparklines</span>
          </div>
          <div className="wellness-telemetry-list">
            {Object.entries(telemetryDisplay).map(([key, values]) => (
              <div key={key} className="wellness-telemetry-row">
                <div className="wellness-telemetry-meta">
                  <span className="wellness-telemetry-label">{key === 'sleep' ? 'Sueño' : key === 'water' ? 'Agua' : 'Digestión'}</span>
                  <span className="wellness-telemetry-value">{values.at(-1)}%</span>
                </div>
                <svg viewBox="0 0 120 56" className="wellness-sparkline">
                  <motion.path
                    d={getSparklinePath(values)}
                    fill="none"
                    stroke={TELEMETRY_COLORS[key]}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div
          className="glass-card wellness-card wellness-projects-card"
          style={{
            ...convertToGridPosition(9, 12, 7, 12),
            minHeight: '0',
            minWidth: '0',
            overflow: 'hidden'
          }}
        >
          <div className="wellness-card-header">
            <p className="wellness-card-label">Active Projects</p>
            <button className="wellness-small-add" type="button">+</button>
          </div>
          <div className="wellness-projects-list">
            {activeProjects.map((project) => (
              <div key={project.id} className="wellness-project-item">
                <div className="wellness-project-row">
                  <span className="wellness-project-title">{project.title}</span>
                  <button
                    type="button"
                    className="pill-button outline"
                    onClick={() => handleProjectMilestone(project)}
                  >
                    YT Repo
                  </button>
                </div>
                <div className="wellness-progress-block">
                  <div className="wellness-progress-labels">
                    <span>Progreso</span>
                    <span>{project.detail}</span>
                  </div>
                  <button
                    type="button"
                    className="wellness-progress-bar"
                    onClick={() => handleProjectMilestone(project)}
                  >
                    <motion.div
                      className="wellness-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="glass-card wellness-card wellness-aura-card"
          style={{
            ...convertToGridPosition(1, 4, 9, 12),
            minHeight: '0',
            minWidth: '0',
            overflow: 'hidden'
          }}
        >
          <AuraHeatmap />
        </div>
      </div>
      {isModalOpen && (
        <div className="wellness-modal-backdrop">
          <div className="wellness-modal-shell">
            <div className="wellness-modal-header">
              <div>
                <p className="wellness-card-label">{currentSubmoduleConfig.label.toUpperCase()} - Centro de Gestión</p>
                <h2 className="wellness-modal-title">{SUBMODULE_TITLE[currentSubmodule]} - Centro de Gestión</h2>
              </div>
              <button className="wellness-modal-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="wellness-modal-grid">
              <div className="wellness-modal-panel">
                <div className="wellness-modal-panel-header">
                  <h3 className="wellness-modal-panel-title">Rutinas Específicas</h3>
                  <button className="wellness-modal-add-button" type="button">+</button>
                </div>
                <ul className="wellness-modal-list">
                  {MODAL_CONTENT[currentSubmodule]?.routines.map((item, idx) => (
                    <li key={idx} className="wellness-modal-item">• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="wellness-modal-panel">
                <div className="wellness-modal-panel-header">
                  <h3 className="wellness-modal-panel-title">Tareas Pendientes</h3>
                  <button className="wellness-modal-add-button" type="button">+</button>
                </div>
                <ul className="wellness-modal-list">
                  {MODAL_CONTENT[currentSubmodule]?.tasks.map((item, idx) => (
                    <li key={idx} className="wellness-modal-item wellness-modal-task">
                      <label>
                        <input type="checkbox" />
                        <span>{item}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="wellness-modal-panel">
                <div className="wellness-modal-panel-header">
                  <h3 className="wellness-modal-panel-title">Eventos y Citas</h3>
                  <button className="wellness-modal-add-button" type="button">+</button>
                </div>
                <ul className="wellness-modal-list">
                  {MODAL_CONTENT[currentSubmodule]?.events.map((item, idx) => (
                    <li key={idx} className="wellness-modal-item">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`toast-notification ${toastVisible ? 'visible' : ''}`}>
        {toastMessage}
      </div>
    </div>
  )
}

export default WellnessHub
