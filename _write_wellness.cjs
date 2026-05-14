const fs = require('fs');
const target = 'src/modules/Wellness/WellnessHub.jsx';

const content = `import { useEffect, useMemo, useRef, useState } from 'react'
import { format, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AuraHeatmap from './AuraHeatmap'

const WELLNESS_TABS = [
  { id: 'glow', label: 'Glow', icon: '\u2727', description: 'Brillo y recuperaci\u00f3n', accent: '255, 167, 102' },
  { id: 'vitality', label: 'Vitality', icon: '\uD83D\uDDF2', description: 'Energ\u00eda y movimiento', accent: '118, 97, 255' },
  { id: 'innerBalance', label: 'Inner Balance', icon: '\u2E59', description: 'Hidrataci\u00f3n y digesti\u00f3n', accent: '75, 190, 165' },
  { id: 'zenRest', label: 'Zen Rest', icon: '\u263E', description: 'Sue\u00f1o profundo y calma', accent: '113, 130, 255' }
]

const ROUTINE_FLOW = {
  glow: [
    { time: '07:30', label: 'Ritual facial matutino' },
    { time: '09:00', label: 'Agua con electrolitos' },
    { time: '19:45', label: 'Mascarilla nutritiva' },
    { time: '22:15', label: 'Meditaci\u00f3n restauradora' }
  ],
  vitality: [
    { time: '06:30', label: 'Cardio de 20 min' },
    { time: '11:00', label: 'Snack verde' },
    { time: '15:30', label: 'Circuito core' },
    { time: '21:00', label: 'Estiramiento profundo' }
  ],
  innerBalance: [
    { time: '08:00', label: 'Agua tibia con lim\u00f3n' },
    { time: '12:30', label: 'Ensalada nutritiva' },
    { time: '16:00', label: 'Pausa de respiraci\u00f3n' },
    { time: '20:30', label: 'Infusi\u00f3n digestiva' }
  ],
  zenRest: [
    { time: '20:30', label: 'Diario de gratitud' },
    { time: '21:00', label: 'Lectura ligera' },
    { time: '21:45', label: 'Rutina de sue\u00f1o' },
    { time: '22:15', label: 'Visualizaci\u00f3n calmante' }
  ]
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

// Crystal shell: shared Tailwind classes for all glass cards
const crystalShell =
  'bg-white/45 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-lg overflow-hidden'

// Title style: Playfair Display serif, bold, left-aligned
const cardTitle = 'font-[family-name:var(--font-heading)] font-bold text-left text-[#0f172a]/80 text-sm tracking-wide'

// Body style: Inter sans-serif, light, subtle lilac
const cardBody = 'font-[family-name:var(--font-primary)] font-light text-[#7c6f9a]/80 text-xs'

const MOTIVATIONAL_QUOTE = {
  text: 'Tu cuerpo escucha todo lo que tu mente dice.',
  author: 'Naomi Judd'
}

const SLEEP_DATA = {
  hours: 7.5,
  quality: 82,
  deepSleep: '2h 15m',
  rem: '1h 50m',
  phases: [
    { label: 'Profundo', value: 28, color: '#818cf8' },
    { label: 'REM', value: 24, color: '#c084fc' },
    { label: 'Ligero', value: 48, color: '#a5b4fc' }
  ]
}

const ACTIVE_PROJECTS = [
  { id: 'split', title: 'Operaci\u00f3n Split', progress: 45, detail: '45%' },
  { id: 'abs', title: 'Operaci\u00f3n Abs', progress: 20, detail: '20%' }
]

const WELLNESS_ACTIVITIES = [
  { id: '1', label: 'Comprar magnesio', type: 'task', done: false },
  { id: '2', label: 'Enviar reporte semanal', type: 'task', done: true },
  { id: '3', label: 'Revisar plan de entrenamiento', type: 'task', done: false },
  { id: '4', label: 'Cita Dermat\u00f3logo', type: 'event', time: '15 Mayo, 10:00' },
  { id: '5', label: 'Clase de yoga', type: 'event', time: '18 Mayo, 08:30' },
  { id: '6', label: 'Consulta nutrici\u00f3n', type: 'event', time: '20 Mayo, 16:00' }
]

function WellnessHub() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(getInitialActiveTab)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [checkedRoutine, setCheckedRoutine] = useState(() =>
    ROUTINE_FLOW[getInitialActiveTab()].map(() => false)
  )
  const [activities, setActivities] = useState(WELLNESS_ACTIVITIES)

  const activeTabConfig = WELLNESS_TABS.find((tab) => tab.id === activeTab) || WELLNESS_TABS[0]
  const routineSteps = ROUTINE_FLOW[activeTab]

  const setActiveTabAndResetRoutine = (nextTab) => {
    setActiveTab(nextTab)
    setCheckedRoutine(ROUTINE_FLOW[nextTab].map(() => false))
  }

  const handleRoutineToggle = (index) => {
    setCheckedRoutine((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const handleActivityToggle = (id) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a))
    )
  }

  const handleProjectMilestone = (project) => {
    setToastMessage(\`A\u00f1adir hito: \${project.title}\`)
    setToastVisible(true)
  }

  const showToast = (message) => {
    setToastMessage(message)
    setToastVisible(true)
  }

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
        setToastMessage(
          \`Activo: \${WELLNESS_TABS.find((tab) => tab.id === next)?.label}\`
        )
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

  const today = startOfDay(new Date())

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#e9d5ff] via-[#e0e7ff] to-[#bae6fd]">
      {/* Toast */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl text-sm font-medium text-[#0f172a]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="absolute top-3 left-3 right-3 z-40 flex items-center gap-3 px-4 py-2.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center justify-center min-w-[40px] h-10 px-3 bg-white/80 border border-[#0f172a]/10 rounded-xl text-[#0f172a]/90 text-sm font-bold hover:bg-white transition-colors"
        >
          {'\u2190 \u2302'}
        </button>
        <span className="font-[family-name:var(--font-primary)] text-sm font-bold tracking-[0.12em] text-[#0f172a]/95 whitespace-nowrap">
          Wellness Hub
        </span>
        <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
          {WELLNESS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabAndResetRoutine(tab.id)}
              className={\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0f172a]/10 text-xs font-semibold transition-all \${
                activeTab === tab.id
                  ? 'bg-white/95 text-[#0f172a]/95 border-[#0f172a]/15 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]'
                  : 'bg-white/55 text-[#0f172a]/75 hover:bg-white/70'
              }\`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>
