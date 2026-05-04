import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import './GlobalAddModal.css'

function GlobalAddModal({ isOpen, onClose, preselectedType = 'task' }) {
  const { actions } = useApp()
  const [formData, setFormData] = useState({
    type: preselectedType,
    title: '',
    category: 'personal',
    subcategory: '',
    freeCategory: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    deadline: '',
    deadlineTime: '',
    priority: 'medium',
    recurring: false,
    recurrenceType: 'weekly',
    habitDays: [],
    notes: ''
  })

  // Actualizar el tipo cuando cambia preselectedType
  useEffect(() => {
    setFormData(prev => ({ ...prev, type: preselectedType }))
  }, [preselectedType])

  const typeOptions = [
    { value: 'task', label: 'Tarea', emoji: '📝' },
    { value: 'event', label: 'Evento', emoji: '📅' },
    { value: 'habit', label: 'Hábito', emoji: '🔄' }
  ]

  const categoryOptions = [
    { value: 'personal', label: 'Personal', emoji: '👤' },
    { value: 'escolar', label: 'Académico', emoji: '🎓' },
    { value: 'general', label: 'General', emoji: '🌍' }
  ]

  const personalModules = [
    { value: 'self-care', label: 'Self Care', emoji: '🛀' },
    { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘‍♀️' },
    { value: 'vida-social', label: 'Vida Social', emoji: '🥂' },
    { value: 'fitness', label: 'Fitness', emoji: '💪' }
  ]

  const academicModules = [
    { value: 'maestria', label: 'Maestría', emoji: '🎓' },
    { value: 'data-science', label: 'Data Science', emoji: '📊' },
    { value: 'lab', label: 'Lab', emoji: '🧪' },
    { value: 'idiomas', label: 'Idiomas', emoji: '🗣️' },
    { value: 'investigacion', label: 'Investigación', emoji: '🔬' }
  ]

  const generalCategories = [
    { value: 'social', label: 'Social', emoji: '🥂' },
    { value: 'cumpleaños', label: 'Cumpleaños', emoji: '🎂' },
    { value: 'otro', label: 'Otro', emoji: '📌' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Baja', emoji: '🟢' },
    { value: 'medium', label: 'Media', emoji: '🟡' },
    { value: 'high', label: 'Alta', emoji: '🔴' }
  ]

  const weekDays = [
    { value: 1, label: 'L' },
    { value: 2, label: 'M' },
    { value: 3, label: 'M' },
    { value: 4, label: 'J' },
    { value: 5, label: 'V' },
    { value: 6, label: 'S' },
    { value: 0, label: 'D' }
  ]

  useEffect(() => {
    // Auto-set annual recurrence for birthday events
    if (formData.type === 'event' && formData.category === 'general' && formData.freeCategory === 'cumpleaños') {
      setFormData(prev => ({
        ...prev,
        recurring: true,
        recurrenceType: 'annual'
      }))
    }
  }, [formData.type, formData.category, formData.freeCategory])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const entryData = {
      ...formData,
      id: Date.now().toString(), // Generar ID único
      status: 'todo',
      tags: [],
      createdAt: new Date().toISOString()
    }

    // Set appropriate category based on selection
    if (formData.category === 'general') {
      entryData.category = 'general'
      entryData.subcategory = formData.freeCategory
    } else {
      entryData.subcategory = formData.subcategory
    }

    // Para eventos, usar la fecha del evento
    if (formData.type === 'event' && formData.date) {
      entryData.date = formData.date
    }
    // Para tareas, usar la fecha límite si existe
    else if (formData.type === 'task' && formData.deadline) {
      entryData.date = formData.deadline
    }

    actions.addEntry(formData.type, entryData)
    onClose()
    setFormData({
      type: 'task',
      title: '',
      category: 'personal',
      subcategory: '',
      freeCategory: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      deadline: '',
      deadlineTime: '',
      priority: 'medium',
      recurring: false,
      recurrenceType: 'weekly',
      habitDays: [],
      notes: ''
    })
  }

  const handlePillClick = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDayClick = (dayValue) => {
    setFormData(prev => ({
      ...prev,
      habitDays: prev.habitDays.includes(dayValue)
        ? prev.habitDays.filter(d => d !== dayValue)
        : [...prev.habitDays, dayValue]
    }))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (!isOpen) return null

  const getModuleOptions = () => {
    switch (formData.category) {
      case 'personal':
        return personalModules
      case 'escolar':
        return academicModules
      case 'general':
        return generalCategories
      default:
        return []
    }
  }

  const getSelectedModule = () => {
    if (formData.category === 'general') {
      return formData.freeCategory
    }
    return formData.subcategory
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content global-add-modal centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header centered">
          <h2 className="text-xl font-semibold text-gray-800">Agregar Nueva Entrada</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form centered">
          <div className="form-section">
            <label className="form-label centered">Tipo</label>
            <div className="pill-group centered">
              {typeOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`pill-btn petite ${formData.type === option.value ? 'active' : ''}`}
                  onClick={() => handlePillClick('type', option.value)}
                >
                  <span className="pill-emoji">{option.emoji}</span>
                  <span className="pill-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label centered">Título</label>
            <div className="input-container">
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="form-input petite centered"
                placeholder="Escribe el título..."
                required 
              />
            </div>
          </div>

          <div className="form-section">
            <label className="form-label centered">Ámbito</label>
            <div className="pill-group centered">
              {categoryOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`pill-btn petite ${formData.category === option.value ? 'active' : ''}`}
                  onClick={() => handlePillClick('category', option.value)}
                >
                  <span className="pill-emoji">{option.emoji}</span>
                  <span className="pill-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label centered">
              {formData.category === 'general' ? 'Categoría Libre' : 'Módulo'}
            </label>
            <div className="pill-group centered">
              {getModuleOptions().map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`pill-btn petite ${getSelectedModule() === option.value ? 'active' : ''}`}
                  onClick={() => {
                    if (formData.category === 'general') {
                      handlePillClick('freeCategory', option.value)
                    } else {
                      handlePillClick('subcategory', option.value)
                    }
                  }}
                >
                  <span className="pill-emoji">{option.emoji}</span>
                  <span className="pill-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic fields based on type */}
          {formData.type === 'event' && (
            <div className="form-section">
              <label className="form-label centered">Detalles del Evento</label>
              <div className="date-time-group centered">
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  className="form-input petite centered"
                  placeholder="Fecha"
                />
                <input 
                  type="time" 
                  name="startTime" 
                  value={formData.startTime} 
                  onChange={handleChange} 
                  className="form-input petite centered"
                  placeholder="Inicio"
                />
                <input 
                  type="time" 
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleChange} 
                  className="form-input petite centered"
                  placeholder="Fin"
                />
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="form-input petite centered"
                  placeholder="Ubicación / Link"
                />
              </div>
            </div>
          )}

          {formData.type === 'task' && (
            <div className="form-section">
              <label className="form-label centered">Fecha Límite</label>
              <div className="date-time-group centered">
                <input 
                  type="date" 
                  name="deadline" 
                  value={formData.deadline} 
                  onChange={handleChange} 
                  className="form-input petite centered"
                  placeholder="Fecha límite"
                />
                <input 
                  type="time" 
                  name="deadlineTime" 
                  value={formData.deadlineTime} 
                  onChange={handleChange} 
                  className="form-input petite centered"
                  placeholder="Hora (opcional)"
                />
              </div>
            </div>
          )}

          {formData.type === 'habit' && (
            <div className="form-section">
              <label className="form-label centered">Días de la semana</label>
              <div className="pill-group centered">
                {weekDays.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    className={`pill-btn petite day-pill ${formData.habitDays.includes(day.value) ? 'active' : ''}`}
                    onClick={() => handleDayClick(day.value)}
                  >
                    <span className="pill-label">{day.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-section">
            <label className="form-label centered">Prioridad</label>
            <div className="pill-group centered">
              {priorityOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`pill-btn petite ${formData.priority === option.value ? 'active' : ''}`}
                  onClick={() => handlePillClick('priority', option.value)}
                >
                  <span className="pill-emoji">{option.emoji}</span>
                  <span className="pill-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label centered">Notas</label>
            <div className="input-container">
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                className="form-textarea petite centered"
                placeholder="Añade notas adicionales..."
                rows={2}
              />
            </div>
          </div>

          <div className="form-actions centered">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-submit">Agregar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GlobalAddModal
