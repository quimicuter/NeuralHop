import React, { useState, useEffect } from 'react'
import './DetailModal.css'

function DetailModal({ entry, isOpen, onClose, onSave, onEdit, onDelete }) {
  const [localSubtasks, setLocalSubtasks] = useState([])
  const [isModified, setIsModified] = useState(false)

  useEffect(() => {
    if (entry && entry.subtasks) {
      setLocalSubtasks(entry.subtasks)
    } else {
      setLocalSubtasks([])
    }
    setIsModified(false)
  }, [entry, isOpen])

  if (!isOpen || !entry) return null

  const handleToggleSubtask = (index) => {
    const updated = localSubtasks.map((st, i) =>
      i === index ? { ...st, done: !st.done } : st
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

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'critical': return 'Crítica'
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return 'Normal'
    }
  }

  const getPriorityEmoji = (priority) => {
    switch (priority) {
      case 'critical': return '🔥'
      case 'high': return '⚡'
      case 'medium': return '📌'
      case 'low': return '🌱'
      default: return '🔹'
    }
  }

  return (
    <div className="detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-modal">
        {/* Header */}
        <div className="detail-header">
          <h2 className="detail-title">{entry.title}</h2>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>

        {/* Metadata */}
        <div className="detail-meta">
          {entry.type && (
            <span className="detail-badge detail-type">{entry.type}</span>
          )}
          {entry.priority && (
            <span className="detail-badge detail-priority">
              {getPriorityEmoji(entry.priority)} {getPriorityLabel(entry.priority)}
            </span>
          )}
          {entry.module && (
            <span className="detail-badge detail-module">{entry.module}</span>
          )}
        </div>

        {/* Date & Time */}
        {(entry.date || entry.deadline) && (
          <div className="detail-datetime">
            <span className="detail-datetime-icon">📅</span>
            <span>
              {formatDate(entry.date || entry.deadline)}
              {entry.time && ` • ${entry.time}`}
            </span>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div className="detail-section">
            <h3 className="detail-section-title">📝 Notas</h3>
            <p className="detail-notes">{entry.notes}</p>
          </div>
        )}

        {/* Subtasks */}
        {localSubtasks.length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-title">☑️ Subtareas</h3>
            <div className="detail-subtasks">
              {localSubtasks.map((subtask, index) => (
                <label key={index} className="detail-subtask-item">
                  <input
                    type="checkbox"
                    checked={subtask.done}
                    onChange={() => handleToggleSubtask(index)}
                  />
                  <span className={subtask.done ? 'subtask-done' : ''}>
                    {subtask.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
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
}

export default DetailModal
