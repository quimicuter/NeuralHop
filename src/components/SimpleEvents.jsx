import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import DetailModal from './DetailModal'
import EntryCard from './EntryCard'

function SimpleEvents() {
  const { state, actions, getEvents } = useApp()
  const events = (getEvents && getEvents()) || []
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleEventToggle = (eventId) => {
    actions.updateEntry(eventId, {
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

  const getModuleEmoji = (event) => {
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
      'tramites': '📝'
    }
    return moduleEmojis[event.module] || '📅'
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

  const getEventDateTime = (event) => {
    if (event.date) {
      const [year, month, day] = event.date.split('-').map(Number)
      const date = new Date(year, month - 1, day)
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
    
    return null
  }

  const isEventOverdue = (event) => {
    if (!event.date || event.completed) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [year, month, day] = event.date.split('-').map(Number)
    const eventDate = new Date(year, month - 1, day)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate < today
  }

  // Mostrar solo eventos no completados
  const visibleEvents = (events || []).filter(event => 
    !event.completed && event.status !== 'completed' && event.module !== 'cumpleanos' && !event.isBirthdayReminder
  ).slice(0, 4) // Limitar a 4 eventos para el dashboard

  return (
    <>
      <div className="event-list">
        {visibleEvents.map(event => (
          <EntryCard
            key={event.id}
            entry={event}
            variant="event"
            isOverdue={isEventOverdue(event)}
            getDateTime={getEventDateTime}
            onClick={() => openDetail(event)}
          />
        ))}
        {visibleEvents.length === 0 && (
          <div className="empty-events">
            <span>No hay eventos próximos. ✨</span>
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

export default SimpleEvents
