import React, { useEffect, useMemo, useState } from 'react'
import { format, subDays, eachDayOfInterval, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import SimpleTasks from '../../components/SimpleTasks'
import SimpleEvents from '../../components/SimpleEvents'
import './WellnessHub.css'

const DASHBOARD_BACKGROUND = 'url("https://images.unsplash.com/photo-1551573355-19727699d60aq=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")'
const PROJECT_IMAGE = 'https://images.unsplash.com/photo-1551573355-19727699d60aq=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

const WELLNESS_TABS = [
  { id: 'glow', label: 'Glow', description: 'Brillo y recuperacin', accent: '255, 167, 102' },
  { id: 'vitality', label: 'Vitality', description: 'Energa y movimiento', accent: '118, 97, 255' },
  { id: 'innerBalance', label: 'Inner Balance', description: 'Hidratacin y digestin', accent: '75, 190, 165' },
  { id: 'zenRest', label: 'Zen Rest', description: 'Sueo profundo y calma', accent: '113, 130, 255' }
]

const ROUTINE_FLOW = {
  glow: [
    { time: '07:30', label: 'Ritual facial matutino' },
    { time: '09:00', label: 'Agua con electrolitos' },
    { time: '19:45', label: 'Mascarilla nutritiva' },
    { time: '22:15', label: 'Meditacin restauradora' }
  ],
  vitality: [
    { time: '06:30', label: 'Cardio de 20 min' },
    { time: '11:00', label: 'Snack verde' },
    { time: '15:30', label: 'Circuito core' },
    { time: '21:00', label: 'Estiramiento profundo' }
  ],
  innerBalance: [
    { time: '08:00', label: 'Agua tibia con limn' },
    { time: '12:30', label: 'Ensalada nutritiva' },
    { time: '16:00', label: 'Pausa de respiracin' },
    { time: '20:30', label: 'Infusin digestiva' }
  ],
  zenRest: [
    { time: '20:30', label: 'Diario de gratitud' },
    { time: '21:00', label: 'Lectura ligera' },
    { time: '21:45', label: 'Rutina de sueo' },
    { time: '22:15', label: 'Visualizacin calmante' }
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

const RADAR_RINGS = [
  { label: 'Recover', percent: 0.3, days: 4 },
  { label: 'Momentum', percent: 0.7, days: 7 },
  { label: 'Peak', percent: 1.0, days: 12 }
]

const SUBMODULE_TITLE = {
  glow: ' GLOW',
  vitality: ' VITALITY',
  innerBalance: ' INNER BALANCE',
  zenRest: ' ZEN REST'
}

const MODAL_CONTENT = {
  glow: {
    routines: ['Mascarilla de noche', 'Srum iluminador', 'Masaje facial rpido', 'Mascarilla nutritiva'],
    tasks: ['Aplicar crema con SPF', 'Beber agua con electrolitos', 'Masajear contorno de ojos', 'Registrar cuidados faciales'],
    events: ['Sesin de spa visual  19:00', 'Recordatorio de hidratacin  09:00', 'Cita con cosmetloga  15:30']
  },
  vitality: {
    routines: ['Calentamiento activo', 'HIIT breve', 'Ritmo de caminata', 'Recuperacin dinmica'],
    tasks: ['Preparar batido energtico', 'Estiramiento de piernas', 'Revisar pulso post entreno', 'Planificar caminata'],
    events: ['Clase de baile  08:30', 'Revisin de rutina  12:00', 'Cita con coach  18:00']
  },
  innerBalance: {
    routines: ['Agua tibia con limn', 'Batido verde suave', 'Digestin consciente', 'Yoga ligero'],
    tasks: ['Registrar comidas del da', 'Beber agua antes de cada comida', 'Respirar profundamente', 'Tomar t digestivo'],
    events: ['Sesin de meditacin  07:30', 'Chequeo de bienestar  13:00', 'Taller de intestinalidad  17:45']
  },
  zenRest: {
    routines: ['Desconexin tecnolgica', 'Respiracin 4-7-8', 'Ritual de higiene nocturna', 'Msica relajante'],
    tasks: ['Apagar pantallas 30 min antes', 'Registrar gratitud', 'Preparar almohada aromtica', 'Revisar temperatura de la habitacin'],
    events: ['Rutina de sueo  21:15', 'Lectura ligera  21:45', 'Cita de descanso  22:15']
  }
}

const STORAGE_KEY = 'wellness.moodEntries'
const MOOD_OPTIONS = [
  { id: 'glow', icon: '', label: 'Glow', color: 'rgba(147, 197, 253, 0.96)' },
  { id: 'vitality', icon: '', label: 'Vitality', color: 'rgba(251, 207, 232, 0.92)' },
  { id: 'innerBalance', icon: '', label: 'Inner Balance', color: 'rgba(167, 243, 208, 0.92)' },
  { id: 'zenRest', icon: '', label: 'Zen Rest', color: 'rgba(199, 210, 254, 0.94)' }
]

const getSparklinePath = (values) => {
  const width = 120
  const height = 56
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  return values
  .map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const normalized = (value - min) / range;
    const y = height - normalized * (height - 12) - 6;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }) // <--- Aquí faltaba cerrar el paréntesis del .map
  .join(' ');
}

const getHeatOpacity = (index) => {
  return (0.2 + Math.abs(Math.sin(index * 0.9)) * 0.48).toFixed(2)
}

function WellnessHub() {
  const { getEntries } = useApp()
  const [activeTab, setActiveTab] = useState('glow')
  const [viewMode, setViewMode] = useState('tasks')
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSubmodule, setActiveSubmodule] = useState(null)
  const [isEditingTelemetry, setIsEditingTelemetry] = useState(false)
  const [actionView, setActionView] = useState('tareas')
  const [telemetryInputs, setTelemetryInputs] = useState({ sleep: '', water: '', digestion: '' })
  const [cycleDays, setCycleDays] = useState({ skin: 3, sheets: 7, nails: 2 })
  const [cycleAnimation, setCycleAnimation] = useState({ skin: 0.3, sheets: 0.7, nails: 0.2 })
  const cycleResetRef = React.useRef(null)

  const activeTabConfig = WELLNESS_TABS.find((tab) => tab.id === activeTab) || WELLNESS_TABS[0]
  const currentSubmodule = activeSubmodule || activeTab
  const currentSubmoduleConfig = WELLNESS_TABS.find((tab) => tab.id === currentSubmodule) || activeTabConfig
  const accent = `rgba(${activeTabConfig.accent}, 0.95)`
  const heatRgb = activeTabConfig.accent
  const tabIndex = WELLNESS_TABS.findIndex((tab) => tab.id === activeTab)

  const telemetryDisplay = useMemo(() => {
    const panel = TELEMETRY_DATA[activeTab];
    
    // Aquí estaba el error: faltaba el '?' antes de 'fallback'
    const valueOrDefault = (value, fallback) => (value === '' ? fallback : Number(value));

    return {
      sleep: [...panel.sleep.slice(0, -1), valueOrDefault(telemetryInputs.sleep, panel.sleep.at(-1))],
      water: [...panel.water.slice(0, -1), valueOrDefault(telemetryInputs.water, panel.water.at(-1))],
      digestion: [...panel.digestion.slice(0, -1), valueOrDefault(telemetryInputs.digestion, panel.digestion.at(-1))]
    };
  }, [activeTab, telemetryInputs]);

  const cycleMeters = [
    { key: 'skin', label: 'Piel', color: 'rgba(147, 197, 253, 0.95)', days: cycleDays.skin },
    { key: 'sheets', label: 'Sbanas', color: 'rgba(129, 140, 248, 0.9)', days: cycleDays.sheets },
    { key: 'nails', label: 'Uas', color: 'rgba(167, 139, 250, 0.9)', days: cycleDays.nails }
  ]

  const activeProjects = [
    { id: 'split', title: 'Operacin Split', progress: 45, detail: '45%' },
    { id: 'abs', title: 'Operacin Abs', progress: 20, detail: '20%' }
  ]

  const handleProjectMilestone = (project) => {
    setToastMessage(`Aadir hito: ${project.title}`)
    setToastVisible(true)
  }

  const routineSteps = ROUTINE_FLOW[activeTab]
  const heatmapCells = useMemo(
    () => Array.from({ length: 28 }, (_, index) => getHeatOpacity(index, tabIndex)),
    [tabIndex]
  )

  useEffect(() => {
    const saved = window.localStorage.getItem('wellness.activeTab')
    if (saved && WELLNESS_TABS.some((tab) => tab.id === saved)) {
      setActiveTab(saved)
    }
  }, [])

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
        setActiveTab(next)
        setToastMessage(`Activo: ${WELLNESS_TABS.find((tab) => tab.id === next).label}`)
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
  const heatmapDates = useMemo(
    () =>
      eachDayOfInterval({
        start: subDays(today, 27),
        end: today
      }),
    [today]
  )

  const [moodEntries, setMoodEntries] = useState(() => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Agregamos el '?' justo después de 'stored'
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error al cargar moods:", error);
    return {};
  }
});
  const [popoverIndex, setPopoverIndex] = useState(null)
  const [checkedRoutine, setCheckedRoutine] = useState([])
  const todayIndex = heatmapDates.findIndex((date) => isSameDay(date, today))

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(moodEntries))
    } catch (error) {
      console.warn('No se pudo guardar moodEntries en localStorage', error)
    }
  }, [moodEntries])

  useEffect(() => {
    setCheckedRoutine(routineSteps.map(() => false))
  }, [routineSteps])

  const showToast = (message) => {
    setToastMessage(message)
    setToastVisible(true)
  }

  const handleSubmoduleClick = (tabId) => {
    setActiveSubmodule(tabId)
    setIsModalOpen(true)
  }

  const handleTelemetryInput = (key, value) => {
    setTelemetryInputs((prev) => ({
      ...prev,
      [key]: value
    }))
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

  const handleMoodCellClick = (index) => {
  if (index === todayIndex) {
    // Aquí agregamos el '?' que Windsurf olvidó
    setPopoverIndex((prev) => (prev === index ? null : index));
  } else {
    setPopoverIndex(null);
  }
};

  const handleMoodSelect = (index, mood) => {
    const dateKey = format(heatmapDates[index], 'yyyy-MM-dd')
    setMoodEntries((prev) => ({
      ...prev,
      [dateKey]: mood
    }))
    setPopoverIndex(null)
    showToast(`Hoy: ${mood.label}`)
  }

  const handleRoutineToggle = (index) => {
    setCheckedRoutine((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  // Sistema de Coordenadas Cartesianas (12x12) - Bottom-Up
  const convertToGridPosition = (xStart, xEnd, yStart, yEnd) => {
    // Convertir coordenadas Bottom-Up a CSS Grid (Top-Down)
    // CSS Grid usa filas de arriba hacia abajo (1-12)
    // Sistema cartesiano usa Y de abajo hacia arriba (1-12)
    
    const gridColumn = `${xStart} / ${xEnd + 1}`
    const gridRow = `${13 - yEnd} / ${13 - yStart + 1}`
    
    return { gridColumn, gridRow }
  }

  const filteredEntries = getEntries ? getEntries({ scope: 'personal', module: 'wellness' }) || [] : []

  return (
    <div className="wellness-content" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridTemplateRows: 'repeat(12, 1fr)',
      height: '100%',
      width: '100%',
      gap: '0.5rem'
    }}>
          {/* Aura Heatmap: Coordenadas X(1-4), Y(9-12) */}
          <div 
            className="glass-card wellness-card wellness-aura-card"
            style={{
              ...convertToGridPosition(1, 4, 9, 12),
              minH: '0',
              minW: '0',
              overflow: 'hidden'
            }}
          >
              <div className="wellness-aura-header">
                <p className="wellness-aura-title">AURA HEATMAP</p>
                <span className="wellness-aura-caption">Mood tracker semanal</span>
              </div>
              <div className="wellness-heatmap-days">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                  <span key={day} className="wellness-heatmap-day-label">
                    {day}
                  </span>
                ))}
              </div>
              <div className="wellness-heatmap-grid">
                {heatmapDates.map((date, index) => {
                  const dateKey = format(date, 'yyyy-MM-dd')
                  const mood = moodEntries[dateKey]
                  const isToday = isSameDay(date, today)
                  const backgroundColor = mood.color || 'rgba(15, 23, 42, 0.05)'
                  return (
                    <motion.div
                      key={dateKey}
                      role="button"
                      tabIndex={0}
                      className={`wellness-heatmap-cell ${isToday ? 'today' : ''}`}
                      title={`${format(date, 'PPP', { locale: es })} · ${mood?.label || 'Sin registro'}`}
                      onClick={() => (isToday ? handleMoodCellClick(index) : setPopoverIndex(null))}
                      onKeyDown={(event) => {
                        if (!isToday) return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleMoodCellClick(index)
                        }
                      }}
                      whileHover={{ y: -1 }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.26 }}
                      style={{ backgroundColor }}
                    >
                      {mood && <span className="wellness-heatmap-indicator">{mood.icon}</span>}
                      {isToday && popoverIndex === index && (
                        <motion.div
                          className="wellness-heatmap-popover"
                          initial={{ opacity: 0, scale: 0.88, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.88, y: 8 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                        >
                          {MOOD_OPTIONS.map((option) => (
                            <motion.button
                              key={option.id}
                              type="button"
                              className="wellness-heatmap-popover-button"
                              onClick={() => handleMoodSelect(index, option)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.94 }}
                            >
                              {option.icon}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
          </div>

          {/* Routine Flow: Coordenadas X(1-4), Y(1-8) */}
          <div 
            className="glass-card wellness-card wellness-routine-card"
            style={{
              ...convertToGridPosition(1, 4, 1, 8),
              minH: '0',
              minW: '0',
              overflow: 'hidden'
            }}
          >
              <div className="wellness-routine-header">
                <p className="wellness-card-label">Routine Flow</p>
                <button className="wellness-small-add" type="button">
                  +
                </button>
              </div>
              <div className="wellness-routine-body">
                <div className="wellness-routine-track">
                  <div className="wellness-routine-line" />
                  <div
                    className="wellness-routine-dot"
                    style={{
                      top: `${
                        (() => {
                          const nextActive = checkedRoutine.findIndex((checked) => !checked)
                          const stepIndex = nextActive === -1 ? routineSteps.length - 1 : nextActive
                          return (stepIndex / Math.max(routineSteps.length - 1, 1)) * 100
                        })()
                      }%`
                    }}
                  />
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
          </div>

          <div 
            className="glass-card wellness-card wellness-telemetry-card"
            style={{
              ...convertToGridPosition(5, 8, 7, 12),
              minH: '0',
              minW: '0',
              overflow: 'hidden'
            }}
          >
              <div className="wellness-card-header">
                <p className="wellness-card-label">Vitality Telemetry</p>
                <button
                  type="button"
                  className="wellness-small-add"
                  onClick={() => setIsEditingTelemetry((prev) => !prev)}
                >
                  +
                </button>
              </div>
              <div className="wellness-telemetry-list">
                {[
                  { key: 'sleep', label: 'Sueo' },
                  { key: 'water', label: 'Agua' },
                  { key: 'digestion', label: 'Digestin' }
                ].map((metric) => (
                  <div key={metric.key} className="wellness-telemetry-row">
                    <div className="wellness-telemetry-meta">
                      <span>{metric.label}</span>
                      {isEditingTelemetry && (
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="wellness-telemetry-input"
                          value={telemetryInputs[metric.key]}
                          onChange={(event) => handleTelemetryInput(metric.key, event.target.value)}
                        />
                      )}
                    </div>
                    <svg viewBox="0 0 120 56" className="wellness-sparkline">
                      <motion.path
                        d={getSparklinePath(telemetryDisplay[metric.key])}
                        fill="none"
                        stroke={accent}
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </svg>
                  </div>
                ))}
              </div>
          </div>

          {/* Radar Card: Coordenadas X(5-8), Y(1-6) */}
          <div 
            className="glass-card wellness-card wellness-radar-card"
            style={{
              ...convertToGridPosition(5, 8, 1, 6),
              minH: '0',
              minW: '0',
              overflow: 'hidden'
            }}
          >
              <div className="wellness-card-header">
                <p className="wellness-card-label">Cyclic Radar</p>
                <button type="button" className="wellness-small-add" onClick={handleCycleCheckin}>
                  + Ingresar
                </button>
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

          {/* Projects Card: Coordenadas X(9-12), Y(7-12) */}
          <div 
            className="glass-card wellness-card wellness-projects-card"
            style={{
              ...convertToGridPosition(9, 12, 7, 12),
              minH: '0',
              minW: '0',
              overflow: 'hidden'
            }}
          >
              <div className="wellness-card-header">
                <p className="wellness-card-label">Active Projects</p>
                <button className="wellness-small-add" type="button">
                  +
                </button>
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

          {/* Carousel Card: Coordenadas X(9-12), Y(1-6) */}
          <div 
            className="glass-card wellness-card wellness-carousel-card"
            style={{
              ...convertToGridPosition(9, 12, 1, 6),
              minH: '0',
              minW: '0',
              overflow: 'hidden'
            }}
          >
              <div className="wellness-card-header wellness-action-header">
                <p className="wellness-card-label">Action Carousel</p>
                <div className="wellness-toggle-group">
                  <button
                    type="button"
                    className={`pill-button ${actionView === 'tareas'  'active' : ''}`}
                    onClick={() => setActionView('tareas')}
                  >
                    Tareas
                  </button>
                  <button
                    type="button"
                    className={`pill-button ${actionView === 'eventos'  'active' : ''}`}
                    onClick={() => setActionView('eventos')}
                  >
                    Eventos
                  </button>
                </div>
              </div>
              <div style={{ perspective: 1000 }} className="wellness-flip-container">
                <AnimatePresence initial={false} mode="wait">
                  {actionView === 'tareas'  (
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
                          'Cita Dermatlogo - 15 Mayo',
                          'Clase de yoga - 18 Mayo',
                          'Consulta nutricin - 20 Mayo'
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

      {isModalOpen && (
        <div className="wellness-modal-backdrop">
          <div className="wellness-modal-shell">
            <div className="wellness-modal-header">
              <div>
                <p className="wellness-card-label">{currentSubmoduleConfig.label.toUpperCase()} - Centro de Gestin</p>
                <h2 className="wellness-modal-title">{SUBMODULE_TITLE[currentSubmodule]} - Centro de Gestin</h2>
              </div>
              <button className="wellness-modal-close" onClick={() => setIsModalOpen(false)}>
                
              </button>
            </div>
            <div className="wellness-modal-grid">
              <div className="wellness-modal-panel">
                <div className="wellness-modal-panel-header">
                  <h3 className="wellness-modal-panel-title">Rutinas Especficas</h3>
                  <button className="wellness-modal-add-button" type="button">+</button>
                </div>
                <ul className="wellness-modal-list">
                  {MODAL_CONTENT[currentSubmodule].routines.map((item, idx) => (
                    <li key={idx} className="wellness-modal-item"> {item}</li>
                  ))}
                </ul>
              </div>
              <div className="wellness-modal-panel">
                <div className="wellness-modal-panel-header">
                  <h3 className="wellness-modal-panel-title">Tareas Pendientes</h3>
                  <button className="wellness-modal-add-button" type="button">+</button>
                </div>
                <ul className="wellness-modal-list">
                  {MODAL_CONTENT[currentSubmodule].tasks.map((item, idx) => (
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
                  {MODAL_CONTENT[currentSubmodule].events.map((item, idx) => (
                    <li key={idx} className="wellness-modal-item"> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`toast-notification ${toastVisible  'visible' : ''}`}>
        {toastMessage}
      </div>
    </div>
  )
}

export default WellnessHub
