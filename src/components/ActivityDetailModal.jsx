import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './DetailModal.css'

function ActivityDetailModal({ entry, isOpen, onClose, onSave, onEdit, onDelete }) {
  const [localSubtasks, setLocalSubtasks] = useState([])
  const [isModified, setIsModified] = useState(false)

  useEffect(() => {
    if (entry && entry.metadata?.subtasks) {
      setLocalSubtasks(entry.metadata.subtasks)
    } else if (entry && entry.subtasks) {
      setLocalSubtasks(entry.subtasks)
    } else {
      setLocalSubtasks([])
    }
    setIsModified(false)
  }, [entry, isOpen])

  if (!isOpen || !entry) return null

  const description = entry.metadata?.description || entry.description || ''
  const category = entry.metadata?.category || entry.category || ''
  const moduleLabel = entry.module || ''
  const typeLabel = entry.type || ''
  const priority = entry.priority || ''
  const dateString = entry.date || entry.deadline || ''
  const startTime = entry.metadata?.startTime || entry.startTime || ''
  const endTime = entry.metadata?.endTime || entry.endTime || ''
  const location = entry.metadata?.location || ''
  const recurring = entry.metadata?.recurring
  const recurrenceType = entry.metadata?.recurrenceType || ''
  const projectStatus = entry.metadata?.projectStatus || ''

  const formatDate = (value) => {
    if (!value) return null
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPriorityLabel = (priorityValue) => {
    switch (priorityValue) {
      case 'critical': return 'Crítica'
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return 'Normal'
    }
  }

  const getPriorityEmoji = (priorityValue) => {
    switch (priorityValue) {
      case 'critical': return '🔥'
      case 'high': return '⚡'
      case 'medium': return '📌'
      case 'low': return '🌱'
      default: return '🔹'
    }
  }

  const handleToggleSubtask = (index) => {
    const updated = localSubtasks.map((subtask, i) =>
      i === index ? { ...subtask, completed: !subtask.completed } : subtask
    )
    setLocalSubtasks(updated)
    setIsModified(true)
  }

  const handleSave = () => {
    onSave(entry.id, { subtasks: localSubtasks })
    setIsModified(false)
  }

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta entrada?')) {
      onDelete(entry.id)
      onClose()
    }
  }

  const modalContent = (
    <div className="detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-modal">
        <div className="detail-header">
          <h2 className="detail-title">{entry.title}</h2>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="detail-meta">
          {typeLabel && <span className="detail-badge detail-type">{typeLabel}</span>}
          {priority && <span className="detail-badge detail-priority">{getPriorityEmoji(priority)} {getPriorityLabel(priority)}</span>}
          {moduleLabel && <span className="detail-badge detail-module">{moduleLabel}</span>}
          {category && <span className="detail-badge detail-module">{category}</span>}
        </div>

        {(dateString || startTime || endTime || location || recurring) && (
          <div className="detail-datetime">
            <span className="detail-datetime-icon">📅</span>
            <span>
              {dateString ? formatDate(dateString) : 'Sin fecha'}
              {startTime && ` • ${startTime}`}
              {endTime && ` - ${endTime}`}
              {location && ` • ${location}`}
              {recurring && recurrenceType && ` • ${recurrenceType}`}
            </span>
          </div>
        )}

        {description && (
          <div className="detail-section">
            <h3 className="detail-section-title">📝 Descripción</h3>
            <p className="detail-notes">{description}</p>
          </div>
        )}

        {projectStatus && entry.type === 'project' && (
          <div className="detail-section">
            <h3 className="detail-section-title">📈 Estado del proyecto</h3>
            <p className="detail-notes">{projectStatus}</p>
          </div>
        )}

        {localSubtasks.length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-title">☑️ Subtareas</h3>
            <div className="detail-subtasks">
              {localSubtasks.map((subtask, index) => (
                <label key={index} className="detail-subtask-item">
                  <input
                    type="checkbox"
                    checked={!!subtask.completed}
                    onChange={() => handleToggleSubtask(index)}
                  />
                  <span className={subtask.completed ? 'subtask-done' : ''}>
                    {subtask.text || subtask.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="detail-actions">
          <button className="detail-btn detail-btn-edit" onClick={() => onEdit(entry)}>
            ✏️ Editar
          </button>
          <button className="detail-btn detail-btn-delete" onClick={handleDelete}>
            🗑️ Eliminar
          </button>
          <button
            className={`detail-btn detail-btn-save ${isModified ? 'active' : ''}`}
            onClick={handleSave}
            disabled={!isModified}
          >
            💾 Guardar
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ActivityDetailModal
