import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './HubShell.css'

const hubConfig = {
  // ─── Personal ───
  selfcare: {
    emoji: '🛀', title: 'Self Care',
    gradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)',
    accent: '#f48fb1', description: 'Cuidado personal y mantenimiento'
  },
  mindfulness: {
    emoji: '🧘‍♀️', title: 'Mindfulness',
    gradient: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 50%, #9fa8da 100%)',
    accent: '#9fa8da', description: 'Espiritualidad y conexión interior'
  },
  'vida-social': {
    emoji: '🥂', title: 'Vida Social',
    gradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #ef9a9a 100%)',
    accent: '#ef9a9a', description: 'Conexiones y recuerdos'
  },
  fitness: {
    emoji: '💪', title: 'Fitness',
    gradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
    accent: '#a5d6a7', description: 'Cuerpo y movimiento'
  },
  // ─── Académico ───
  'data-science': {
    emoji: '📊', title: 'Data Science',
    gradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
    accent: '#90caf9', description: 'Ciencia de datos y análisis'
  },
  investigacion: {
    emoji: '🔬', title: 'Investigación',
    gradient: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)',
    accent: '#ce93d8', description: 'Laboratorio mental'
  },
  maestria: {
    emoji: '🎓', title: 'Maestría',
    gradient: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 50%, #b39ddb 100%)',
    accent: '#b39ddb', description: 'Transición y objetivos a largo plazo'
  },
  lab: {
    emoji: '🧪', title: 'Laboratorio',
    gradient: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)',
    accent: '#80deea', description: 'Command Center - Gestión de trabajo'
  },
  idiomas: {
    emoji: '🗣️', title: 'Idiomas',
    gradient: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 50%, #ffe082 100%)',
    accent: '#ffe082', description: 'Políglota en progreso'
  }
}

function HubShell() {
  const { scope, moduleId } = useParams()
  const { state, actions, getEntries } = useApp()
  const config = hubConfig[moduleId] || { emoji: '📦', title: moduleId, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#764ba2', description: 'Módulo' }

  // Filtrar entries de este módulo
  const moduleEntries = getEntries ? getEntries({ scope, module: moduleId }) : []
  const moduleTasks = moduleEntries.filter(e => e.type === 'task' && !e.completed)
  const moduleHabits = moduleEntries.filter(e => e.type === 'habit')
  const moduleEvents = moduleEntries.filter(e => e.type === 'event' && !e.completed)

  return (
    <div className="hub-shell" style={{ background: config.gradient }}>
      {/* Header */}
      <div className="hub-header">
        <Link to="/" className="hub-back-btn">
          ← Dashboard
        </Link>
        <div className="hub-title-group">
          <span className="hub-emoji">{config.emoji}</span>
          <h1 className="hub-title">{config.title}</h1>
          <p className="hub-description">{config.description}</p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="hub-bento">
        {/* Widget: Tareas del módulo */}
        <div className="hub-widget hub-widget-tasks">
          <div className="hub-widget-header">
            <h3>📋 Tareas</h3>
            <span className="hub-badge">{moduleTasks.length}</span>
          </div>
          <div className="hub-widget-content">
            {moduleTasks.length === 0 ? (
              <p className="hub-empty">Sin tareas pendientes ✨</p>
            ) : (
              moduleTasks.slice(0, 5).map(task => (
                <div key={task.id} className="hub-entry-item">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => actions.updateEntry(task.id, { completed: true, status: 'done' })}
                  />
                  <span>{task.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget: Hábitos del módulo */}
        <div className="hub-widget hub-widget-habits">
          <div className="hub-widget-header">
            <h3>🔄 Hábitos</h3>
            <span className="hub-badge">{moduleHabits.length}</span>
          </div>
          <div className="hub-widget-content">
            {moduleHabits.length === 0 ? (
              <p className="hub-empty">Sin hábitos registrados 🌱</p>
            ) : (
              moduleHabits.slice(0, 5).map(habit => (
                <div key={habit.id} className="hub-entry-item">
                  <input
                    type="checkbox"
                    checked={habit.completed}
                    onChange={() => actions.updateEntry(habit.id, { completed: !habit.completed })}
                  />
                  <span>{habit.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget: Eventos del módulo */}
        <div className="hub-widget hub-widget-events">
          <div className="hub-widget-header">
            <h3>📅 Eventos</h3>
            <span className="hub-badge">{moduleEvents.length}</span>
          </div>
          <div className="hub-widget-content">
            {moduleEvents.length === 0 ? (
              <p className="hub-empty">Sin eventos próximos 🎯</p>
            ) : (
              moduleEvents.slice(0, 5).map(event => (
                <div key={event.id} className="hub-entry-item">
                  <span className="hub-event-dot" style={{ background: config.accent }}></span>
                  <span>{event.title}</span>
                  {event.metadata?.startTime && <span className="hub-event-time">{event.metadata.startTime}</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget: Placeholder para widgets especializados */}
        <div className="hub-widget hub-widget-custom">
          <div className="hub-widget-header">
            <h3>⚡ Widgets Especializados</h3>
          </div>
          <div className="hub-widget-content">
            <p className="hub-empty">Los widgets especializados para {config.title} se activarán en la Fase B 🚀</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HubShell
