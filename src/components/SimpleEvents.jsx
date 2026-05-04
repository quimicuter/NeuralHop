import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

function SimpleEvents() {
  const { state, actions } = useApp()
  const [events, setEvents] = useState([])

  useEffect(() => {
    // Filtrado estricto: solo eventos reales y no completados
    const realEvents = state.tasks.filter(item => 
      item.type === 'event' && 
      !item.completed
    )
    setEvents(realEvents)
  }, [state.tasks])

  const handleEventToggle = (eventId) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      actions.updateTask({
        ...event,
        completed: true,
        status: 'completed'
      })
    }
  }

  const getCategoryColor = (category) => {
    switch(category) {
      case 'personal': return '#ffb3c6'
      case 'escolar': return '#c8a2c8'
      case 'general': return '#ff9aa2'
      default: return '#4A90E2'
    }
  }

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'personal': return 'Personal'
      case 'escolar': return 'Académico'
      case 'general': return 'General'
      default: return category
    }
  }

  const getModuleEmoji = (event) => {
    const moduleEmojis = {
      'self-care': '🛀',
      'mindfulness': '🧘‍♀️',
      'recetario': '🍳',
      'hobbies': '🎨',
      'maestria': '🎓',
      'lab': '🧪',
      'idiomas': '🗣️',
      'investigacion': '🔬',
      'social': '🥂',
      'cumpleaños': '🎂',
      'otro': '📌'
    }
    return moduleEmojis[event.subcategory] || '📅'
  }

  const getEventDateTime = (event) => {
    if (event.date) {
      const date = new Date(event.date)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      if (date.toDateString() === today.toDateString()) {
        return `Hoy • ${event.startTime || 'Todo el día'}`
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Mañana • ${event.startTime || 'Todo el día'}`
      } else {
        return date.toLocaleDateString('es-MX', { 
          month: 'short', 
          day: 'numeric',
          hour: event.startTime ? '2-digit' : undefined,
          minute: event.startTime ? '2-digit' : undefined
        })
      }
    }
    
    return 'Sin fecha'
  }

  const isEventOverdue = (event) => {
    if (!event.date || event.completed) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate < today
  }

  // Mostrar solo eventos no completados
  const visibleEvents = events.filter(event => 
    !event.completed && event.status !== 'completed'
  ).slice(0, 4) // Limitar a 4 eventos para el dashboard

  return (
    <div className="event-list">
      {visibleEvents.map(event => (
        <div key={event.id} className="task-item-new">
          <div className="task-item-header">
            <div className="task-item-left">
              <input 
                type="checkbox" 
                className="task-checkbox-new"
                checked={event.status === 'completed'}
                onChange={() => handleEventToggle(event.id)}
              />
              <span className={`task-title ${isEventOverdue(event) ? 'text-red-500 font-bold' : ''}`}>
                {event.title}
              </span>
            </div>
            <div className="task-item-right">
              <span className="task-emoji">{getModuleEmoji(event)}</span>
            </div>
          </div>
          <div className="task-item-footer">
            <div className="priority-indicator" style={{ backgroundColor: getCategoryColor(event.category) }}></div>
            <span className={`task-datetime ${isEventOverdue(event) ? 'text-red-500 font-bold' : ''}`}>
              {getEventDateTime(event)}
            </span>
            {event.location && (
              <span className="task-location">📍 {event.location}</span>
            )}
          </div>
        </div>
      ))}
      {visibleEvents.length === 0 && (
        <div className="empty-events">
          <span>No hay eventos próximos. ✨</span>
        </div>
      )}
    </div>
  )
}

export default SimpleEvents
