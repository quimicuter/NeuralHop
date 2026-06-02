import React from 'react'
import { Link } from 'react-router-dom'
import ClockWidget from '../components/ClockWidget'
import NexusCalendar from '../components/NexusCalendar'
import SimpleTasks from '../components/SimpleTasks'
import SimpleEvents from '../components/SimpleEvents'
import AuraHeatmap from '../widgets/AuraHeatmap'
import RoutineFlow from '../widgets/RoutineFlow'
import SleepTracker from '../widgets/SleepTracker'
import './DashboardView.css'

const HUB_BUTTONS = [
  { key: 'proyectos',  emoji: '🚀', label: 'Proyectos', kind: 'link',   to: '/hub/academic/proyectos' },
  { key: 'maestria',   emoji: '🎓', label: 'Maestría',  kind: 'link',   to: '/hub/academic/maestria' },
  { key: 'grimorio',   emoji: '🔮', label: 'Grimorio',  kind: 'action', action: 'grimoire' },
  { key: 'notas',      emoji: '📝', label: 'Notas',     kind: 'action', action: 'notes' },
  { key: 'shoplist',   emoji: '🛒', label: 'Shoplist',  kind: 'action', action: 'shoplist' },
  { key: 'recetario',  emoji: '🍳', label: 'Recetario', kind: 'action', action: 'recipe' },
]

const MENU_DAYS = ['L', 'M', 'M', 'J', 'V']
const MENU_MEALS = [
  { emoji: '🍳', key: 'desayuno' },
  { emoji: '🍝', key: 'comida' },
  { emoji: '🌙', key: 'cena' },
]

function DashboardView({
  onOpenAddModal,
  onOpenTaskHistory,
  onOpenRecipeModal,
  onOpenNotes,
  onOpenGrimoire,
  onOpenShoplist,
}) {
  const handleHubAction = (action) => {
    switch (action) {
      case 'grimoire': onOpenGrimoire?.(); break
      case 'notes':    onOpenNotes?.(); break
      case 'shoplist': onOpenShoplist?.(); break
      case 'recipe':   onOpenRecipeModal?.('', ''); break
      default: break
    }
  }

  return (
    <div className="dashboard-view-container">
      {/* 1. BIENVENIDA (Fila 1 / Columna 1-4) */}
      <div className="bento-cell bento-welcome">
        <ClockWidget />
      </div>

      {/* 2. EVENTOS (Fila 2-5 / Columna 1-4) */}
      <div className="bento-cell bento-events">
        <div className="card-header">
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

      {/* 3. TAREAS (Fila 5-9 / Columna 1-4) */}
      <div className="bento-cell bento-tasks">
        <div className="card-header">
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

      {/* 4. AURA HEATMAP (Fila 9-13 / Columna 1-4) */}
      <div className="bento-cell bento-aura">
        <AuraHeatmap />
      </div>

      {/* 5. CALENDARIO CENTRAL (Fila 1-8 / Columna 5-9) */}
      <div className="bento-cell bento-calendar">
        <NexusCalendar />
      </div>

      {/* 6. DOCK DE PORTALES HUBS (Fila 8-10 / Columna 5-9) */}
      <div className="bento-cell bento-hub-navigation">
        <div className="hub-grid">
          {HUB_BUTTONS.map(btn => (
            btn.kind === 'link' ? (
              <Link key={btn.key} to={btn.to} className="hub-btn">
                <span className="hub-btn-emoji">{btn.emoji}</span>
                <span className="hub-btn-label">{btn.label}</span>
              </Link>
            ) : (
              <button
                key={btn.key}
                className="hub-btn"
                onClick={() => handleHubAction(btn.action)}
              >
                <span className="hub-btn-emoji">{btn.emoji}</span>
                <span className="hub-btn-label">{btn.label}</span>
              </button>
            )
          ))}
        </div>
      </div>

      {/* 7. MENÚ SEMANAL (Fila 10-13 / Columna 5-9) */}
      <div className="bento-cell bento-menu">
        <div className="card-header">
          <h3>Menú Semanal</h3>
        </div>
        <div className="menu-grid-6x4">
          <div className="menu-cell empty-header"></div>
          {MENU_DAYS.map((day, i) => (
            <div key={`${day}-${i}`} className="menu-cell day-header">{day}</div>
          ))}

          {MENU_MEALS.map(meal => (
            <React.Fragment key={meal.key}>
              <div className="menu-cell meal-emoji">{meal.emoji}</div>
              {MENU_DAYS.map((day, dIdx) => (
                <div
                  key={`${day}-${dIdx}-${meal.key}`}
                  className={`menu-cell meal-cell ${meal.key === 'comida' ? 'has-meal' : 'empty-meal'}`}
                  onClick={() => onOpenRecipeModal?.(day, meal.key)}
                >
                  {meal.key === 'comida' ? <span className="check-icon">✓</span> : <span className="plus-icon">+</span>}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 8. ROUTINE FLOW (Fila 1-8 / Columna 9-12) */}
      <div className="bento-cell bento-routine">
        <RoutineFlow />
      </div>

      {/* 9. SLEEP TRACKER (Fila 9-12 / Columna 9-12) */}
      <div className="bento-cell bento-sleep">
        <SleepTracker />
      </div>
    </div>
  )
}

export default DashboardView
