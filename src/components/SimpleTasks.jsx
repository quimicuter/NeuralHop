import React from 'react'
import { useApp } from '../context/AppContext'

function SimpleTasks() {
  const { state, actions, getTasks } = useApp()
  const tasks = (getTasks && getTasks()) || []

  const handleTaskToggle = (taskId) => {
    actions.updateEntry(taskId, {
      completed: true,
      status: 'done'
    })
  }

  const getCategoryColor = (category) => {
    switch(category) {
      case 'personal': return '#ffb3c6'
      case 'escolar':
      case 'academico':
      case 'academic': return '#c8a2c8'
      case 'general': return '#ff9aa2'
      default: return '#4A90E2'
    }
  }

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'personal': return 'Personal'
      case 'escolar':
      case 'academico':
      case 'academic': return 'Académico'
      case 'general': return 'General'
      default: return category
    }
  }

  const isTaskOverdue = (task) => {
    if (!task.deadline || task.completed) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Inicio del día
    const deadline = new Date(task.deadline)
    deadline.setHours(0, 0, 0, 0) // Inicio del día
    return deadline < today
  }

  const getModuleEmoji = (task) => {
    // Emoji basado en el subcategoría/módulo
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
    
    const module = task.subcategory || task.freeCategory
    return moduleEmojis[module] || '📌'
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#db6666' // rojo
      case 'medium': return '#eab20893' // amarillo
      case 'low': return '#22c55e' // verde
      default: return '#6b7280' // gris
    }
  }

  const getTaskDateTime = (task) => {
    if (task.type === 'event' && task.date) {
      const date = new Date(task.date)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      if (date.toDateString() === today.toDateString()) {
        return `Hoy • ${task.startTime || 'Todo el día'}`
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Mañana • ${task.startTime || 'Todo el día'}`
      } else {
        return date.toLocaleDateString('es-MX', { 
          month: 'short', 
          day: 'numeric',
          hour: task.startTime ? '2-digit' : undefined,
          minute: task.startTime ? '2-digit' : undefined
        })
      }
    } else if (task.type === 'task' && task.deadline) {
      const date = new Date(task.deadline)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      if (date.toDateString() === today.toDateString()) {
        return `Hoy • ${task.deadlineTime || 'Fin del día'}`
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Mañana • ${task.deadlineTime || 'Fin del día'}`
      } else {
        return date.toLocaleDateString('es-MX', { 
          month: 'short', 
          day: 'numeric'
        })
      }
    }
    
    return 'Sin fecha'
  }

  // Mostrar solo tareas no completadas (filtro !completed)
  const visibleTasks = (tasks || []).filter(task => 
    !task.completed && task.status !== 'completed'
  ).slice(0, 6) // Limitar a 6 tareas para el dashboard

  return (
    <>
      <div className="task-list">
        {visibleTasks.map(task => (
          <div key={task.id} className="task-item-new">
            <div className="task-item-header">
              <div className="task-item-left">
                <input 
                  type="checkbox" 
                  className="task-checkbox-new"
                  checked={task.status === 'completed'}
                  onChange={() => handleTaskToggle(task.id)}
                />
                <span className={`task-title ${isTaskOverdue(task) ? 'text-red-500 font-bold' : ''}`}>{task.title}</span>
              </div>
              <div className="task-item-right">
                <span className="task-emoji">{getModuleEmoji(task)}</span>
              </div>
            </div>
            <div className="task-item-footer">
              <div className="priority-indicator" style={{ backgroundColor: getPriorityColor(task.priority) }}></div>
              <span className={`task-datetime ${isTaskOverdue(task) ? 'text-red-500 font-bold' : ''}`}>{getTaskDateTime(task)}</span>
            </div>
          </div>
        ))}
        {visibleTasks.length === 0 && (
          <div className="empty-tasks">
            <span>No hay tareas pendientes. ✨</span>
          </div>
        )}
      </div>
    </>
  )
}

export default SimpleTasks
