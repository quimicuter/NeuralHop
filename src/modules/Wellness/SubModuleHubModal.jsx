import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import GlobalAddModal from '../../components/GlobalAddModal'
import './SubModuleHubModal.css'

// ─── Configuración por Sub-Hub ────────────────────────────────────────────────

const SUBMODULE_CONFIG = {
  glow: {
    label: 'Glow',
    icon: '✧',
    accent: '255, 167, 102',
    gradient: 'linear-gradient(135deg, rgba(255,200,140,0.18) 0%, rgba(255,167,102,0.08) 60%, rgba(255,240,220,0.12) 100%)',
    statsLabel: 'Ritual facial',
    statsUnit: 'días streak',
    defaultStats: [
      { label: 'Hidratación', value: '6 vasos', icon: '💧' },
      { label: 'SPF hoy', value: 'Sí ✓', icon: '☀️' },
      { label: 'Horas sueño', value: '7.2h', icon: '🌙' },
      { label: 'Streak ritual', value: '12 días', icon: '✧' },
    ],
    repoCategories: [
      { id: 'links', label: 'Links / Videos', icon: '🔗' },
      { id: 'books', label: 'Libros / Artículos', icon: '📖' },
      { id: 'notes', label: 'Notas de Skincare', icon: '📝' },
    ],
    defaultRepo: {
      links: ['Guía rutina AM/PM · YouTube', 'The Ordinary — routine builder'],
      books: ['"The Skincare Bible" · Anjali Mahto', '"Clean Skin from Within"'],
      notes: ['Protocolo vitamina C', 'Ingredientes a evitar'],
    },
  },
  vitality: {
    label: 'Vitality',
    icon: '🗲',
    accent: '118, 97, 255',
    gradient: 'linear-gradient(135deg, rgba(150,130,255,0.18) 0%, rgba(118,97,255,0.08) 60%, rgba(200,190,255,0.12) 100%)',
    statsLabel: 'Energía semanal',
    statsUnit: 'entrenamientos',
    defaultStats: [
      { label: 'Cardio semana', value: '3/5', icon: '🏃' },
      { label: 'Calorías avg', value: '1 820 kcal', icon: '🔥' },
      { label: 'Pasos hoy', value: '8 340', icon: '👟' },
      { label: 'Agua', value: '2.1 L', icon: '💧' },
    ],
    repoCategories: [
      { id: 'links', label: 'Links / Videos', icon: '🔗' },
      { id: 'books', label: 'Libros / Artículos', icon: '📖' },
      { id: 'notes', label: 'Planes de entreno', icon: '📝' },
    ],
    defaultRepo: {
      links: ['Rutina HIIT 20 min · YouTube', 'Nike Run Club App'],
      books: ['"Atomic Habits" · James Clear', '"Breath" · James Nestor'],
      notes: ['Split L/P/B · 4 días', 'Protocolo stretching'],
    },
  },
  innerBalance: {
    label: 'Inner Balance',
    icon: '⸙',
    accent: '75, 190, 165',
    gradient: 'linear-gradient(135deg, rgba(100,210,180,0.18) 0%, rgba(75,190,165,0.08) 60%, rgba(180,245,230,0.12) 100%)',
    statsLabel: 'Hidratación',
    statsUnit: 'vasos/día avg',
    defaultStats: [
      { label: 'Agua hoy', value: '1.8 L', icon: '💧' },
      { label: 'Frutas/verd.', value: '4 porciones', icon: '🥗' },
      { label: 'Mindful min', value: '15 min', icon: '🧘' },
      { label: 'Digestión', value: 'Estable ✓', icon: '⸙' },
    ],
    repoCategories: [
      { id: 'links', label: 'Links / Videos', icon: '🔗' },
      { id: 'books', label: 'Libros / Artículos', icon: '📖' },
      { id: 'notes', label: 'Notas de Terapia', icon: '📝' },
    ],
    defaultRepo: {
      links: ['Meditación guiada 10 min · Insight Timer', 'Yoga matutino · YouTube'],
      books: ['"The Mind-Gut Connection" · Mayer', '"Why Buddhism is True"'],
      notes: ['Diario de gratitud · plantilla', 'Protocolo ayuno intermitente'],
    },
  },
  zenRest: {
    label: 'Zen Rest',
    icon: '☾',
    accent: '113, 130, 255',
    gradient: 'linear-gradient(135deg, rgba(140,155,255,0.18) 0%, rgba(113,130,255,0.08) 60%, rgba(200,210,255,0.12) 100%)',
    statsLabel: 'Calidad sueño',
    statsUnit: 'horas/noche avg',
    defaultStats: [
      { label: 'Sueño ayer', value: '7.5h', icon: '☾' },
      { label: 'Promedio sem.', value: '6.9h', icon: '📊' },
      { label: 'Latencia', value: '18 min', icon: '⏱' },
      { label: 'Despertares', value: '1x', icon: '🌙' },
    ],
    repoCategories: [
      { id: 'links', label: 'Links / Videos', icon: '🔗' },
      { id: 'books', label: 'Libros / Artículos', icon: '📖' },
      { id: 'notes', label: 'Notas de Meditación', icon: '📝' },
    ],
    defaultRepo: {
      links: ['Sleep with Me Podcast', 'Yoga Nidra 20 min · YouTube'],
      books: ['"Why We Sleep" · Matthew Walker', '"The Sleep Revolution" · Arianna'],
      notes: ['Wind-down ritual 9pm', 'Protocolo sin pantallas 21:30'],
    },
  },
}

const CUBE_FACES = [
  { id: 'tasks',    label: 'Tareas',    icon: '✅' },
  { id: 'events',   label: 'Eventos',   icon: '📅' },
  { id: 'habits',   label: 'Hábitos',   icon: '🔄' },
  { id: 'projects', label: 'Proyectos', icon: '🚀' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function filterBySubmodule(entries = [], submoduleId) {
  return entries.filter(e => e?.metadata?.category === submoduleId || e?.category === submoduleId)
}

// ─── Sub-component: Cube Action Zone ─────────────────────────────────────────

function ActionCube({ submoduleId, config, onCreateNew }) {
  const { state } = useApp()
  const [face, setFace] = useState('tasks')
  const [direction, setDirection] = useState(1)

  const entries = state?.entries || []

  const tasks    = filterBySubmodule(entries.filter(e => e.type === 'task'),    submoduleId)
  const events   = filterBySubmodule(entries.filter(e => e.type === 'event'),   submoduleId)
  const habits   = filterBySubmodule(entries.filter(e => e.type === 'habit'),   submoduleId)
  const projects = filterBySubmodule(entries.filter(e => e.type === 'project'), submoduleId)

  const faceData = { tasks, events, habits, projects }

  const handleFaceChange = (newFace) => {
    const oldIdx = CUBE_FACES.findIndex(f => f.id === face)
    const newIdx = CUBE_FACES.findIndex(f => f.id === newFace)
    setDirection(newIdx > oldIdx ? 1 : -1)
    setFace(newFace)
  }

  const currentItems = faceData[face] || []
  const accent = `rgba(${config.accent}, 1)`
  const accentSoft = `rgba(${config.accent}, 0.12)`

  return (
    <div className="smh-cube-zone">
      {/* Face Selector Tabs */}
      <div className="smh-cube-tabs">
        {CUBE_FACES.map(f => (
          <button
            key={f.id}
            className={`smh-cube-tab ${face === f.id ? 'active' : ''}`}
            style={face === f.id ? { '--tab-color': accent, '--tab-bg': accentSoft } : {}}
            onClick={() => handleFaceChange(f.id)}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Animated Face Content */}
      <div className="smh-cube-face-wrap">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={face}
            className="smh-cube-face"
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {currentItems.length === 0 ? (
              <div className="smh-cube-empty">
                <span className="smh-cube-empty-icon">{CUBE_FACES.find(f2 => f2.id === face)?.icon}</span>
                <p>Sin {CUBE_FACES.find(f2 => f2.id === face)?.label.toLowerCase()} en {config.label}</p>
                <button
                  className="smh-create-btn"
                  style={{ '--btn-accent': accent }}
                  onClick={() => onCreateNew(face.replace('tasks','task').replace('events','event').replace('habits','habit').replace('projects','project'))}
                >
                  + Crear {CUBE_FACES.find(f2 => f2.id === face)?.label.slice(0, -1)}
                </button>
              </div>
            ) : (
              <ul className="smh-cube-list">
                {currentItems.slice(0, 6).map(item => (
                  <li key={item.id} className={`smh-cube-item ${item.completed ? 'done' : ''}`}>
                    <span
                      className="smh-cube-item-dot"
                      style={{ background: accent }}
                    />
                    <span className="smh-cube-item-title">{item.title}</span>
                    {item.priority && (
                      <span className={`smh-cube-item-priority priority-${item.priority}`}>
                        {item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quick create button (always visible) */}
      <button
        className="smh-quick-create"
        style={{ '--btn-accent': accent, '--btn-bg': accentSoft }}
        onClick={() => onCreateNew(face.replace('tasks','task').replace('events','event').replace('habits','habit').replace('projects','project'))}
      >
        <span>+</span>
        <span>Nuevo en {config.label}</span>
      </button>
    </div>
  )
}

// ─── Sub-component: Repository Zone ──────────────────────────────────────────

function Repository({ config }) {
  const [activeCategory, setActiveCategory] = useState(config.repoCategories[0]?.id || 'links')
  const accent = `rgba(${config.accent}, 1)`
  const accentSoft = `rgba(${config.accent}, 0.1)`

  const items = config.defaultRepo[activeCategory] || []

  return (
    <div className="smh-repo-zone">
      <div className="smh-zone-header">
        <h3 className="smh-zone-title">Repositorio</h3>
      </div>

      {/* Category tabs */}
      <div className="smh-repo-tabs">
        {config.repoCategories.map(cat => (
          <button
            key={cat.id}
            className={`smh-repo-tab ${activeCategory === cat.id ? 'active' : ''}`}
            style={activeCategory === cat.id ? { '--tab-color': accent, '--tab-bg': accentSoft } : {}}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Items list */}
      <ul className="smh-repo-list">
        {items.map((item, i) => (
          <li key={i} className="smh-repo-item">
            <span className="smh-repo-bullet" style={{ background: accent }} />
            <span className="smh-repo-text">{item}</span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="smh-repo-empty">Sin recursos aún. Agrega el primero.</li>
        )}
      </ul>

      <button
        className="smh-repo-add"
        style={{ '--btn-accent': accent }}
      >
        + Agregar recurso
      </button>
    </div>
  )
}

// ─── Sub-component: Stats Lab Zone ───────────────────────────────────────────

function StatsLab({ config }) {
  const accent = `rgba(${config.accent}, 1)`
  const accentSoft = `rgba(${config.accent}, 0.12)`

  return (
    <div className="smh-stats-zone">
      <div className="smh-zone-header">
        <h3 className="smh-zone-title">Lab de Datos</h3>
        <span className="smh-zone-badge" style={{ background: accentSoft, color: accent }}>
          {config.label}
        </span>
      </div>

      <div className="smh-stats-grid">
        {config.defaultStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="smh-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25, ease: 'easeOut' }}
            style={{ '--stat-accent': accentSoft, '--stat-border': `rgba(${config.accent}, 0.2)` }}
          >
            <span className="smh-stat-icon">{stat.icon}</span>
            <span className="smh-stat-value" style={{ color: accent }}>{stat.value}</span>
            <span className="smh-stat-label">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Modal Component ─────────────────────────────────────────────────────

function SubModuleHubModal({ isOpen, onClose, submoduleId }) {
  const config = SUBMODULE_CONFIG[submoduleId] || SUBMODULE_CONFIG.glow
  const accent  = `rgba(${config.accent}, 1)`

  // GlobalAddModal trigger
  const [addModalOpen,    setAddModalOpen]    = useState(false)
  const [addModalType,    setAddModalType]    = useState('task')

  const handleCreateNew = useCallback((type = 'task') => {
    setAddModalType(type)
    setAddModalOpen(true)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="smh-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Modal Window */}
          <motion.div
            className="smh-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Sub-Hub ${config.label}`}
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ '--smh-gradient': config.gradient, '--smh-accent': accent }}
          >
            {/* ── Header ── */}
            <header className="smh-header">
              <div className="smh-header-identity">
                <span className="smh-header-icon" style={{ color: accent }}>{config.icon}</span>
                <h2 className="smh-header-title">{config.label}</h2>
                <span className="smh-header-sub">Sub-Hub Contextual</span>
              </div>
              <button className="smh-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
            </header>

            {/* ── Bento Body: 3 zonas ── */}
            <div className="smh-bento">
              {/* Zona A: Cubo de Acción */}
              <section className="smh-zone smh-zone-a">
                <div className="smh-zone-header">
                  <h3 className="smh-zone-title">Acción</h3>
                  <span className="smh-zone-badge" style={{ background: `rgba(${config.accent}, 0.12)`, color: accent }}>
                    Filtrado · {config.label}
                  </span>
                </div>
                <ActionCube
                  submoduleId={submoduleId}
                  config={config}
                  onCreateNew={handleCreateNew}
                />
              </section>

              {/* Zona B: Repositorio */}
              <section className="smh-zone smh-zone-b">
                <Repository config={config} />
              </section>

              {/* Zona C: Lab de Datos */}
              <section className="smh-zone smh-zone-c">
                <StatsLab config={config} />
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {createPortal(modal, document.body)}

      {/* GlobalAddModal con módulo y categoría pre-seleccionados */}
      <GlobalAddModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        preselectedType={addModalType}
        preselectedModule="wellness"
        preselectedCategory={submoduleId}
      />
    </>
  )
}

export default SubModuleHubModal
