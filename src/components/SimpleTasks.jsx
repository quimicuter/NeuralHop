import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import DetailModal from './DetailModal'

function SimpleTasks() {
  const { state, actions, getTasks } = useApp()
  const tasks = (getTasks && getTasks()) || []
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleTaskToggle = (taskId) => {
    actions.updateEntry(taskId, {
      completed: true,
      status: 'done'
    })
  }

  const openDetail = (entry) => {
    setSelectedEntry(entry)
    setIsDetailOpen(true)
  }

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedEntry(null)
  }

  const handleSaveEntry = async (entryId, updates) => {
    await actions.updateEntry(entryId, updates)
    closeDetail()
  }

  const handleEditEntry = (entry) => {
    closeDetail()
    window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: entry }))
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
    const moduleEmojis = {
      'selfcare': '🛀',
      'mindfulness': '🧘‍♀️',
      'vida-social': '🥂',
      'fitness': '💪',
      'foodie': '🍽️',
      'data-science': '📊',
      'investigacion': '🔬',
      'maestria': '🎓',
      'laboratorio': '🧪',
      'idiomas': '🗣️',
      'cumpleanos': '🎂',
      'finanzas': '💰',
      'tramites': '📋'
    }
    return moduleEmojis[task.module] || '📌'
  }

  const getPriorityEmoji = (priority) => {
    switch(priority) {
      case 'critical': return '🔥'
      case 'high': return '⚡'
      case 'medium': return '📌'
      case 'low': return '🌱'
      default: return '�'
    }
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
          day: 'numeric'
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
    
    return null
  }

  // Mostrar solo tareas no completadas (filtro !completed)
  const visibleTasks = (tasks || []).filter(task => 
    !task.completed && task.status !== 'completed'
  ).slice(0, 6) // Limitar a 6 tareas para el dashboard

  return (
    <>
      <div className="task-list">
        {visibleTasks.map(task => {
          const taskDateTime = getTaskDateTime(task)
          return (
            <div
              key={task.id}
              className="task-item-new clickable"
              onClick={() => openDetail(task)}
              role="button"
              tabIndex={0}
            >
              {/* Fila 1: Checkbox + Título + Emoji Módulo */}
              <div className="task-item-header" style={{ justifyContent: 'space-between' }}>
                <div className="task-item-left" style={{ flex: 1, minWidth: 0 }}>
                  <input 
                    type="checkbox" 
                    className="task-checkbox-new"
                    checked={task.status === 'completed'}
                    onChange={() => handleTaskToggle(task.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span 
                    className={`task-title ${isTaskOverdue(task) ? 'text-red-500' : ''}`}
                    style={{ fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700 }}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="task-item-right">
                  <span className="task-emoji">{getModuleEmoji(task)}</span>
                </div>
              </div>
              {/* Fila 2: Emoji Prioridad + Fecha/Hora */}
              <div className="task-item-footer" style={{ marginLeft: 24, gap: 8 }}>
                <span className="task-priority-emoji">{getPriorityEmoji(task.priority)}</span>
                {taskDateTime && (
                  <span className={`task-datetime ${isTaskOverdue(task) ? 'text-red-500' : ''}`}>
                    {taskDateTime}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {visibleTasks.length === 0 && (
          <div className="empty-tasks">
            <span>No hay tareas pendientes. ✨</span>
          </div>
        )}
      </div>

      <DetailModal
        entry={selectedEntry}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onSave={handleSaveEntry}
        onEdit={handleEditEntry}
      />
    </>
  )
}

export default SimpleTasks
