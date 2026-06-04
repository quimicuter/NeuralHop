import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconRenderer } from '../components/IconRenderer'
import BentoWelcome from '../widgets/BentoWelcome'
import NexusCalendar from '../components/NexusCalendar'
import SimpleTasks from '../components/SimpleTasks'
import SimpleEvents from '../components/SimpleEvents'
import AuraHeatmap from '../widgets/AuraHeatmap'
import SleepTracker from '../widgets/SleepTracker'
import RoutineFlow from '../widgets/RoutineFlow'
import './DashboardView.css'

const HUB_BUTTONS = [
  { key: 'proyectos',  icon: 'Rocket', label: 'Proyectos', kind: 'link',   to: '/hub/academic/proyectos' },
  { key: 'maestria',   icon: 'GraduationCap', label: 'Maestría',  kind: 'link',   to: '/hub/academic/maestria' },
  { key: 'notas',      icon: 'FileText', label: 'Notas',     kind: 'action', action: 'notes' },
  { key: 'recetario',  icon: 'ChefHat', label: 'Recetario', kind: 'action', action: 'recipe' },
  { key: 'wellness',   icon: 'Heart', label: 'Wellness',   kind: 'action', action: 'wellness' },
]

function DashboardView({
  onOpenAddModal,
  onOpenTaskHistory,
  onOpenRecipeModal,
  onOpenNotes,
}) {
  const [wellnessModalOpen, setWellnessModalOpen] = useState(false)

  const handleHubAction = (action) => {
    switch (action) {
      case 'notes':    onOpenNotes?.(); break
      case 'recipe':   onOpenRecipeModal?.('', ''); break
      case 'wellness': setWellnessModalOpen(true); break
      default: break
    }
  }

  return (
    <div className="dashboard-view-container">
      {/* ── ZONA PRINCIPAL (Izquierda y Centro combinados) ── */}
      <div className="dashboard-main-zone">
        {/* Bienvenida Panorámica (Arriba, ocupa todo el ancho de la zona principal) */}
        <div className="bento-welcome-wrapper">
          <div className="bento-cell bento-welcome">
            <BentoWelcome />
          </div>
        </div>

        {/* Zona dividida inferior (54% Izquierda / 46% Centro) */}
        <div className="dashboard-split-zone">
          {/* Columna Izquierda (Solo operativas y salud) */}
          <div className="dashboard-column dashboard-col-left">
            <div className="dashboard-metrics-row">
              {/* Tarjeta de Eventos */}
              <div className="bento-cell bento-events">
                <div className="cell-header">
                  <h3>Próximos Eventos</h3>
                  <button
                    className="task-btn circular"
                    onClick={() => onOpenAddModal?.('event')}
                    title="Agregar evento"
                  >
                    +
                  </button>
                </div>
                <div className="cell-content scrollable">
                  <SimpleEvents />
                </div>
              </div>

              {/* Tarjeta de Tareas */}
              <div className="bento-cell bento-tasks">
                <div className="cell-header">
                  <h3>Mis Tareas</h3>
                  <div className="task-buttons">
                    <button
                      className="task-btn circular"
                      onClick={() => onOpenTaskHistory?.()}
                      title="Historial"
                    >
                      ⏰
                    </button>
                    <button
                      className="task-btn circular"
                      onClick={() => onOpenAddModal?.('task')}
                      title="Agregar tarea"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cell-content scrollable">
                  <SimpleTasks />
                </div>
              </div>
            </div>

            {/* Fila de Salud: Aura Heatmap + Sleep Tracker */}
            <div className="dashboard-health-row">
              <div className="bento-cell aura-card">
                <div className="cell-content">
                  <AuraHeatmap />
                </div>
              </div>
              <div className="bento-cell sleep-card">
                <div className="cell-content">
                  <SleepTracker />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Central (Calendario cuadrado y Hubs) */}
          <div className="dashboard-column dashboard-col-center">
            <div className="bento-calendar-master">
              <div className="calendar-section">
                <NexusCalendar />
              </div>
            </div>

            {/* Botones de Hubs */}
            <div className="bento-cell mini-hubs">
              <div className="hub-grid-5">
                {HUB_BUTTONS.map(btn => (
                  btn.kind === 'link' ? (
                    <Link key={btn.key} to={btn.to} className="hub-btn">
                      <span className="hub-btn-icon">
                        <IconRenderer icon={btn.icon} size={24} />
                      </span>
                      <span className="hub-btn-label">{btn.label}</span>
                    </Link>
                  ) : (
                    <button
                      key={btn.key}
                      className="hub-btn"
                      onClick={() => handleHubAction(btn.action)}
                    >
                      <span className="hub-btn-icon">
                        <IconRenderer icon={btn.icon} size={24} />
                      </span>
                      <span className="hub-btn-label">{btn.label}</span>
                    </button>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMNA 3 - DERECHA (20%): RoutineFlow vertical full-height */}
      <div className="dashboard-column dashboard-col-right">
        <div className="bento-cell bento-routine">
          <RoutineFlow />
        </div>
      </div>

      {/* Wellness Modal Portal - Renderizado condicional */}
      {wellnessModalOpen && (
        <div className="wellness-modal-overlay" onClick={() => setWellnessModalOpen(false)}>
          <div className="wellness-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setWellnessModalOpen(false)}
            >
              ✕
            </button>

            <div className="wellness-modal-grid">
              <div className="wellness-card">
                <AuraHeatmap />
              </div>
              <div className="wellness-card">
                <SleepTracker />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardView
