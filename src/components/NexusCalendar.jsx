import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { IconRenderer } from './IconRenderer'
import { MODULE_CONFIG } from './GlobalAddModal'
import './NexusCalendar.css'

// Color por ámbito para los puntos del calendario (Paleta Cozy Forest)
const SCOPE_DOT_COLORS = {
  personal: '#8b3a62',   // burgundy profundo
  academico: '#6b5b45',  // marrón cálido / tierra
  general: '#d4a373'     // ocre/oro viejo
}

const getEntryDotColor = (entry) => {
  if (entry?.scope && SCOPE_DOT_COLORS[entry.scope]) return SCOPE_DOT_COLORS[entry.scope]
  return '#d4a373' // ocre/oro viejo fallback
}

// Mapeo de colores para indicadores prioritarios
const getPriorityIconColor = (priority) => {
  const colors = {
    low: '#22c55e',      // Verde
    medium: '#eab308',   // Amarillo
    high: '#ef4444',     // Rojo
    critical: '#8b0000'  // Rojo oscuro
  }
  return colors[priority] || '#94a3b8'
}

function NexusCalendar() {
  const { state, actions } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())

  const getMonthName = (date) => {
    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isWeekend = (day) => {
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  const getTasksForDay = (day) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayStr}`
    const monthDayStr = `${month}-${dayStr}`
    const entries = state.entries || []

    // Filtrar tareas reales basadas en deadline.
    const tasks = entries.filter(task =>
      task.type === 'task' &&
      (task.deadline === dateStr || (task.date === dateStr && task.deadline))
    )

    // Filtrar eventos: type event o tareas mal etiquetadas con date pero sin deadline,
    // además de eventos recurrentes.
    const events = entries.filter(task => {
      if (task.type === 'event') {
        if (task.date === dateStr) return true
        if (task.deadline === dateStr) return true
        if (task.recurrence === 'annual' && (task.date || task.deadline)) {
          const sourceDate = task.date || task.deadline
          return sourceDate.slice(5) === monthDayStr
        }
        return false
      }
      if (task.type === 'task' && task.date && !task.deadline) {
        return task.date === dateStr
      }
      return false
    })

    return { events, tasks }
  }

  const getTaskIcon = (task) => {
    if (!task) return 'Pin'

    const moduleIcon = MODULE_CONFIG[task.module]?.icon
    const metadataIcon = task.metadata?.icon

    if (metadataIcon) return metadataIcon
    if (moduleIcon) return moduleIcon

    if (task.type === 'event') {
      if (task.title?.trim()) return 'Calendar'
      return 'Calendar'
    }

    if (task.type === 'task') {
      if (task.title?.trim()) return 'CheckSquare'
      return 'Pin'
    }

    if (task.category && state.categories[task.category]) {
      return state.categories[task.category].icon || 'Pin'
    }
    if (task.scope && state.categories[task.scope]) {
      return state.categories[task.scope].icon || 'Pin'
    }
    return 'Pin'
  }

  // Calcular edad del cumpleañero a partir de birthYear
  const getBirthdayAge = (task) => {
    if (!task.birthYear) return null
    const currentYear = new Date().getFullYear()
    return currentYear - task.birthYear
  }

  // Tooltip/title para mostrar info al hacer hover
  const getTaskTooltip = (task) => {
    const age = getBirthdayAge(task)
    if (task.isBirthdayReminder && age !== null) {
      return `🎂 Cumpleaños de ${task.birthdayName} — Cumple ${age} años`
    }
    if (task.isPartyEvent) {
      return `🎉 Fiesta de ${task.birthdayName}${task.time ? ` a las ${task.time}` : ''}`
    }
    return task.title || ''
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  // Helper: determinar estado del semáforo para un día
  const getTrafficLight = (tasks) => {
    const all = tasks || []
    const total = all.length
    const pending = all.filter(t => t.completed !== true && t.status !== 'completed')
    const pendingCount = pending.length

    // Si no hay ninguna tarea planificada para ese día => gris (ocultar contador)
    if (total === 0) {
      return { color: '#94a3b8', count: null, tooltip: 'No hay tareas para este día' }
    }

    // Si hay tareas pero ya completadas todas => verde
    if (pendingCount === 0) {
      return { color: '#16a34a', count: 0, tooltip: `Todas completadas (${total})` }
    }

    const scopeNames = [...new Set(pending.map(t => t.scope || t.category || 'general'))]
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(', ')

    let color = '#facc15'
    let tooltip = `Tareas pendientes: ${pendingCount} • ${scopeNames}`

    // Umbrales aplicados sobre tareas pendientes:
    // 1-2 => amarillo, 3-5 => naranja oscuro, >5 => rojo
    if (pendingCount <= 2) {
      color = '#facc15' // amarillo
    } else if (pendingCount <= 5) {
      color = '#f97316' // naranja oscuro
    } else {
      color = '#ef4444' // rojo
    }

    // Si hay prioridad alta en las pendientes, enfatizar en rojo oscuro
    if (pending.some(t => t.priority === 'critical' || t.priority === 'high')) {
      color = '#b91c1c'
      tooltip = `Urgente: ${pendingCount} tareas pendientes • ${scopeNames}`
    }

    return {
      color,
      count: pendingCount,
      tooltip
    }
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const { events, tasks } = getTasksForDay(day)
      const today = isToday(day)
      const weekend = isWeekend(day)
      const light = getTrafficLight(tasks)

      days.push(
        <div
          key={day}
          className={`cal-day calendar-day ${today ? 'today' : ''} ${weekend ? 'weekend' : ''}`}
        >
          <div className="day-top-row">
            <div
              className="traffic-light"
              style={{ backgroundColor: light.color }}
              title={light.tooltip}
            >
              {light.count !== null && <span className="traffic-count">{light.count}</span>}
            </div>
            <div className="day-num">{day}</div>
          </div>
          {events.length > 0 && (
            <div className="bento-calendar-emoji-badge" title={getTaskTooltip(events[0])}>
              <IconRenderer icon={getTaskIcon(events[0])} size={18} />
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="nexus-calendar">
      <div className="calendar-header-flex">
        <div className="calendar-title-left">CALENDARIO</div>
        <div className="calendar-nav-right">
          <span className="nav-month-year">{getMonthName(currentDate)}</span>
          <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Mes anterior">❮</button>
          <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Mes siguiente">❯</button>
        </div>
      </div>
      <div className="calendar-weekdays">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
          <div key={index} className="weekday-header">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {renderCalendarDays()}
      </div>
    </div>
  )
}

export default NexusCalendar
