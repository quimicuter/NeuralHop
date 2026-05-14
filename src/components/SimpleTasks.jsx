import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import DetailModal from './DetailModal'
import EntryCard from './EntryCard'

function SimpleTasks({ moduleFilter = null, scopeFilter = null, limit = 6 }) {
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

  const handleDeleteEntry = async (entryId) => {
    await actions.deleteEntry(entryId)
    closeDetail()
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
    const deadline = new Date(task.deadline + 'T12:00:00')
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
      'tecno-girl': '💻',
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
      const [year, month, day] = task.date.split('-').map(Number)
      const date = new Date(year, month - 1, day)
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
      const date = new Date(task.deadline + 'T12:00:00')
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
    !task.completed &&
    task.status !== 'completed' &&
    (!moduleFilter || task.module === moduleFilter) &&
    (!scopeFilter  || task.scope  === scopeFilter)
  ).slice(0, limit)

  return (
    <>
      <div className="task-list">
        {visibleTasks.map(task => (
          <EntryCard
            key={task.id}
            entry={task}
            variant="task"
            isOverdue={isTaskOverdue(task)}
            getDateTime={getTaskDateTime}
            onToggle={handleTaskToggle}
            onClick={() => openDetail(task)}
          />
        ))}
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
        onDelete={handleDeleteEntry}
      />
    </>
  )
}

export default SimpleTasks
