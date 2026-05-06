import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import './GlobalAddModal.css'

// ===== CONFIGURACIÓN CENTRALIZADA =====
const SCOPE_MODULES = {
  personal: ['selfcare', 'mindfulness', 'vida-social', 'fitness', 'foodie'],
  academico: ['data-science', 'investigacion', 'maestria', 'laboratorio', 'idiomas'],
  general: ['cumpleanos', 'finanzas', 'tramites']
}

const SCOPE_LABELS = {
  personal: { label: 'Personal', emoji: '👤', color: '#F6D7DC' },
  academico: { label: 'Académico', emoji: '🎓', color: '#C8A2C8' },
  general: { label: 'General', emoji: '🌍', color: '#A2D5C8' }
}

const MODULE_CONFIG = {
  'selfcare': { label: 'Self Care', emoji: '🛀', allowsHabits: true },
  'mindfulness': { label: 'Mindfulness', emoji: '🧘‍♀️', allowsHabits: true },
  'vida-social': { label: 'Vida Social', emoji: '🥂', allowsHabits: false },
  'fitness': { label: 'Fitness', emoji: '💪', allowsHabits: true },
  'foodie': { label: 'Foodie', emoji: '🍜', allowsHabits: true },
  'data-science': { label: 'Data Science', emoji: '📊', allowsHabits: false },
  'investigacion': { label: 'Investigación', emoji: '🔬', allowsHabits: true },
  'maestria': { label: 'Maestría', emoji: '🎓', allowsHabits: false },
  'laboratorio': { label: 'Laboratorio', emoji: '🧪', allowsHabits: false },
  'idiomas': { label: 'Idiomas', emoji: '🗣️', allowsHabits: true },
  'cumpleanos': { label: 'Cumpleaños', emoji: '🎂', allowsHabits: false, isBirthday: true },
  'finanzas': { label: 'Finanzas', emoji: '💰', allowsHabits: false },
  'tramites': { label: 'Trámites', emoji: '📋', allowsHabits: false }
}

const TYPE_CONFIG = {
  task: { label: 'Tarea', emoji: '📝', color: '#F6D7DC' },
  event: { label: 'Evento', emoji: '📅', color: '#D8B4FE' },
  habit: { label: 'Hábito', emoji: '🔄', color: '#93C5FD' }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baja', emoji: '🟢' },
  medium: { label: 'Media', emoji: '🟡' },
  high: { label: 'Alta', emoji: '🔴' }
}

const WEEK_DAYS = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'M' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' }
]

function GlobalAddModal({ isOpen, onClose, preselectedType = '' }) {
  const { actions } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    scope: 'personal',
    module: 'selfcare',
    type: 'task',
    title: '',
    description: '',
    deadline: '',
    deadlineTime: '',
    priority: 'medium',
    eventDate: '',
    eventTime: '',
    eventEndTime: '',
    location: '',
    recurring: false,
    recurrenceType: 'weekly',
    habitDays: [],
    birthdayName: '',
    birthDate: '',
    hasParty: false,
    partyDate: '',
    partyTime: ''
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        scope: 'personal',
        module: 'selfcare',
        type: preselectedType || 'task',
        title: '',
        description: '',
        deadline: '',
        deadlineTime: '',
        priority: 'medium',
        eventDate: '',
        eventTime: '',
        eventEndTime: '',
        location: '',
        recurring: false,
        recurrenceType: 'weekly',
        habitDays: [],
        birthdayName: '',
        birthDate: '',
        hasParty: false,
        partyDate: '',
        partyTime: ''
      })
      setIsSubmitting(false)
    }
  }, [isOpen, preselectedType])

  const updateField = (field, value) => {
    setFormData(prev => {
      const updates = { [field]: value }
      
      if (field === 'scope') {
        updates.module = SCOPE_MODULES[value][0]
      }
      if (field === 'module') {
        const moduleConfig = MODULE_CONFIG[value] || {}
        if (moduleConfig.isBirthday) {
          updates.type = 'event'
        }
      }
      
      return { ...prev, ...updates }
    })
  }

  const toggleHabitDay = (dayValue) => {
    setFormData(prev => ({
      ...prev,
      habitDays: prev.habitDays.includes(dayValue)
        ? prev.habitDays.filter(d => d !== dayValue)
        : [...prev.habitDays, dayValue]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting || !formData.title) return

    setIsSubmitting(true)

    try {
      const currentModuleConfig = MODULE_CONFIG[formData.module] || {}
      const isBirthdayModule = currentModuleConfig.isBirthday
      let payloads = []

      if (isBirthdayModule && formData.birthdayName && formData.birthDate) {
        payloads.push({
          type: 'event',
          title: `🎂 Cumpleaños de ${formData.birthdayName}`,
          scope: 'general',
          module: 'cumpleanos',
          status: 'todo',
          priority: 'medium',
          completed: false,
          deadline: formData.birthDate,
          metadata: {
            isBirthdayReminder: true,
            birthdayPerson: formData.birthdayName,
            birthDate: formData.birthDate,
            recurring: true,
            recurrenceType: 'annual'
          }
        })

        if (formData.hasParty && formData.partyDate) {
          payloads.push({
            type: 'event',
            title: `🎉 Fiesta de ${formData.birthdayName}`,
            scope: 'personal',
            module: 'vida-social',
            status: 'todo',
            priority: 'high',
            completed: false,
            deadline: formData.partyDate,
            metadata: {
              isBirthdayParty: true,
              birthdayPerson: formData.birthdayName,
              startTime: formData.partyTime
            }
          })
        }
      } else {
        const basePayload = {
          type: formData.type,
          title: formData.title,
          scope: formData.scope,
          module: formData.module,
          status: 'todo',
          priority: formData.priority,
          completed: false,
          metadata: {}
        }

        if (formData.type === 'task') {
          basePayload.deadline = formData.deadline
          basePayload.metadata = {
            deadlineTime: formData.deadlineTime,
            description: formData.description
          }
        } else if (formData.type === 'event') {
          basePayload.date = formData.eventDate
          basePayload.metadata = {
            startTime: formData.eventTime,
            endTime: formData.eventEndTime,
            location: formData.location,
            recurring: formData.recurring,
            recurrenceType: formData.recurrenceType,
            description: formData.description
          }
        } else if (formData.type === 'habit') {
          basePayload.metadata = {
            habitDays: formData.habitDays,
            recurring: true,
            recurrenceType: 'weekly',
            description: formData.description
          }
        }

        payloads.push(basePayload)
      }

      for (const payload of payloads) {
        await actions.addEntry(payload)
      }

      onClose()
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error al guardar. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const currentModuleConfig = MODULE_CONFIG[formData.module] || {}
  const isBirthdayModule = currentModuleConfig.isBirthday
  
  const getAvailableTypes = () => {
    const types = ['task', 'event']
    if (currentModuleConfig.allowsHabits) types.push('habit')
    return types
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h1 className="modal-title">Centro de Control</h1>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          
          <div className="modal-left">
            
            <div className="funnel-section">
              <h3 className="funnel-title">Ámbito</h3>
              <div className="scope-pills">
                {Object.entries(SCOPE_LABELS).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    className={`scope-pill ${formData.scope === key ? 'active' : ''}`}
                    onClick={() => updateField('scope', key)}
                    style={formData.scope === key ? { background: config.color, borderColor: config.color } : {}}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="funnel-section">
              <h3 className="funnel-title">Módulo</h3>
              <div className="module-circles">
                {SCOPE_MODULES[formData.scope]?.map(moduleKey => {
                  const config = MODULE_CONFIG[moduleKey]
                  return (
                    <button
                      key={moduleKey}
                      type="button"
                      className={`module-circle ${formData.module === moduleKey ? 'active' : ''}`}
                      onClick={() => updateField('module', moduleKey)}
                      title={config.label}
                    >
                      <span className="module-emoji">{config.emoji}</span>
                      <span className="module-label">{config.label.substring(0, 8)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="form-fields">
              <div className="form-group">
                <label className="form-label">
                  {isBirthdayModule ? 'Nombre' : 'Título'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={isBirthdayModule ? formData.birthdayName : formData.title}
                  onChange={(e) => setFormData({ ...formData, [isBirthdayModule ? 'birthdayName' : 'title']: e.target.value })}
                  placeholder="Escribe aquí..."
                  required
                />
              </div>

              {!isBirthdayModule && (
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Notas adicionales..."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-right">
            
            <div className="type-tabs">
              {getAvailableTypes().map(typeKey => {
                const config = TYPE_CONFIG[typeKey]
                return (
                  <button
                    key={typeKey}
                    type="button"
                    className={`type-tab ${formData.type === typeKey ? 'active' : ''}`}
                    onClick={() => updateField('type', typeKey)}
                    style={formData.type === typeKey ? { background: config.color } : {}}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="metadata-box">
              
              {formData.type === 'task' && (
                <div className="metadata-grid">
                  <div className="metadata-col">
                    <div className="form-group">
                      <label className="form-label">Fecha Límite</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hora</label>
                      <input
                        type="time"
                        className="form-input"
                        value={formData.deadlineTime}
                        onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="metadata-col">
                    <div className="form-group">
                      <label className="form-label">Prioridad</label>
                      <div className="priority-pills">
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <button
                            key={key}
                            type="button"
                            className={`priority-pill ${formData.priority === key ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, priority: key })}
                          >
                            {config.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'event' && !isBirthdayModule && (
                <div className="metadata-grid">
                  <div className="metadata-col">
                    <div className="form-group">
                      <label className="form-label">Fecha</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Inicio</label>
                      <input
                        type="time"
                        className="form-input"
                        value={formData.eventTime}
                        onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="metadata-col">
                    <div className="form-group">
                      <label className="form-label">Fin</label>
                      <input
                        type="time"
                        className="form-input"
                        value={formData.eventEndTime}
                        onChange={(e) => setFormData({ ...formData, eventEndTime: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ubicación</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="📍"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'habit' && (
                <div className="metadata-grid">
                  <div className="metadata-col">
                    <label className="form-label">Días de la Semana</label>
                    <div className="week-days">
                      {WEEK_DAYS.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          className={`day-btn ${formData.habitDays.includes(day.value) ? 'active' : ''}`}
                          onClick={() => toggleHabitDay(day.value)}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isBirthdayModule && (
                <div className="metadata-grid">
                  <div className="metadata-col">
                    <div className="form-group">
                      <label className="form-label">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="metadata-col">
                    <label className="form-label">¿Habrá Fiesta?</label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.hasParty}
                        onChange={(e) => setFormData({ ...formData, hasParty: e.target.checked })}
                      />
                      <span>Crear evento de fiesta</span>
                    </label>
                    
                    {formData.hasParty && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Fecha de Fiesta</label>
                          <input
                            type="date"
                            className="form-input"
                            value={formData.partyDate}
                            onChange={(e) => setFormData({ ...formData, partyDate: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Hora</label>
                          <input
                            type="time"
                            className="form-input"
                            value={formData.partyTime}
                            onChange={(e) => setFormData({ ...formData, partyTime: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-save"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GlobalAddModal
