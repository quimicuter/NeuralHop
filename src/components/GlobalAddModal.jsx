import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import './GlobalAddModal.css'

// ===== CONFIGURACIÓN CENTRALIZADA =====
export const SCOPE_MODULES = {
  personal: ['selfcare', 'mindfulness', 'vida-social', 'fitness', 'foodie'],
  academico: ['data-science', 'investigacion', 'maestria', 'laboratorio', 'idiomas'],
  general: ['cumpleanos', 'finanzas', 'tramites']
}

export const SCOPE_LABELS = {
  personal: { label: 'Personal', emoji: '👤' },
  academico: { label: 'Académico', emoji: '🎓' },
  general: { label: 'General', emoji: '🌍' }
}

export const MODULE_CONFIG = {
  // Personal
  'selfcare': { label: 'Selfcare', emoji: '🛀', allowsHabits: true },
  'mindfulness': { label: 'Mindfulness', emoji: '🧘‍♀️', allowsHabits: true },
  'vida-social': { label: 'Vida Social', emoji: '🥂', allowsHabits: false },
  'fitness': { label: 'Fitness', emoji: '💪', allowsHabits: true },
  'foodie': { label: 'Foodie', emoji: '🍴', allowsHabits: true },
  // Académico
  'data-science': { label: 'Data Science', emoji: '📊', allowsHabits: false },
  'investigacion': { label: 'Investigación', emoji: '🔬', allowsHabits: true },
  'maestria': { label: 'Maestría', emoji: '🎓', allowsHabits: false },
  'laboratorio': { label: 'Laboratorio', emoji: '🧪', allowsHabits: false },
  'idiomas': { label: 'Idiomas', emoji: '🗣️', allowsHabits: true },
  // General
  'cumpleanos': { label: 'Cumpleaños', emoji: '🎂', allowsHabits: false, isBirthday: true },
  'finanzas': { label: 'Finanzas', emoji: '💰', allowsHabits: false },
  'tramites': { label: 'Trámites', emoji: '📝', allowsHabits: false }
}

const TYPE_CONFIG = {
  task: { label: 'Tarea', emoji: '📝', color: 'rgba(255, 204, 213, 0.65)' },
  event: { label: 'Evento', emoji: '📅', color: 'rgba(215, 189, 226, 0.65)' },
  habit: { label: 'Hábito', emoji: '🔄', color: 'rgba(174, 214, 241, 0.65)' }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baja', emoji: '🟢', color: '#22c55e' },
  medium: { label: 'Media', emoji: '🟡', color: '#eab308' },
  high: { label: 'Alta', emoji: '🔴', color: '#ef4444' },
  critical: { label: 'Crítica', emoji: '🔥', color: '#dc2626' }
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

// ===== COMPONENTE PRINCIPAL =====
function GlobalAddModal({ isOpen, onClose, preselectedType = '', editingEntry = null }) {
  const { actions } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emptyFormData = {
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
  }

  const [formData, setFormData] = useState(emptyFormData)

  const buildFormDataFromEntry = (entry) => {
    if (!entry) return emptyFormData

    return {
      scope: entry.scope || '',
      module: entry.module || '',
      type: entry.type || preselectedType || '',
      title: entry.title || '',
      description: entry.metadata?.description || '',
      deadline: entry.deadline || '',
      deadlineTime: entry.metadata?.deadlineTime || '',
      priority: entry.priority || 'medium',
      eventDate: entry.date || '',
      eventTime: entry.metadata?.startTime || '',
      eventEndTime: entry.metadata?.endTime || '',
      location: entry.metadata?.location || '',
      recurring: !!entry.metadata?.recurring,
      recurrenceType: entry.metadata?.recurrenceType || 'weekly',
      habitDays: entry.metadata?.habitDays || [],
      birthdayName: entry.metadata?.birthdayPerson || '',
      birthDate: entry.metadata?.birthDate || '',
      hasParty: !!entry.metadata?.isBirthdayParty,
      partyDate: entry.metadata?.partyDate || '',
      partyTime: entry.metadata?.startTime || ''
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setFormData(buildFormDataFromEntry(editingEntry))
      } else {
        setFormData({
          ...emptyFormData,
          type: preselectedType || 'task'
        })
      }
      setIsSubmitting(false)
    }
  }, [isOpen, preselectedType, editingEntry])

  // Reset type to 'task' when module changes
  useEffect(() => {
    if (formData.module && !MODULE_CONFIG[formData.module]?.isBirthday) {
      setFormData(prev => ({
        ...prev,
        type: 'task'
      }))
    }
  }, [formData.module])

  // ===== HANDLERS =====
  const updateField = (field, value) => {
    setFormData(prev => {
      const updates = { [field]: value }

      // Lógica de cascada: si cambia un nivel superior, resetear los inferiores
      if (field === 'scope') {
        updates.module = ''
        updates.type = ''
      }
      if (field === 'module') {
        const moduleConfig = MODULE_CONFIG[value] || {}
        if (moduleConfig.isBirthday) {
          updates.type = 'event'
        } else {
          updates.type = ''
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

  // ===== VALIDACIONES =====
  const canSelectModule = formData.scope !== ''
  const canSelectType = formData.module !== '' && !MODULE_CONFIG[formData.module]?.isBirthday
  const currentModuleConfig = MODULE_CONFIG[formData.module] || {}
  const canSelectHabit = currentModuleConfig.allowsHabits
  const isBirthdayModule = currentModuleConfig.isBirthday

  // Tipos disponibles según el módulo
  const getAvailableTypes = () => {
    const types = [
      { value: 'task', label: 'Tarea', emoji: '📝' },
      { value: 'event', label: 'Evento', emoji: '📅' }
    ]

    if (canSelectHabit) {
      types.push({ value: 'habit', label: 'Hábito', emoji: '🔄' })
    }

    return types
  }

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      if (editingEntry) {
        const updates = {
          type: formData.type,
          title: formData.title,
          scope: formData.scope,
          module: formData.module,
          priority: formData.priority,
          metadata: {
            ...editingEntry.metadata,
            description: formData.description
          }
        }

        if (formData.type === 'task') {
          updates.deadline = formData.deadline ? new Date(formData.deadline + 'T12:00:00').toISOString().split('T')[0] : ''
          updates.metadata = {
            ...updates.metadata,
            deadlineTime: formData.deadlineTime
          }
        } else if (formData.type === 'event') {
          updates.date = formData.eventDate ? new Date(formData.eventDate + 'T12:00:00').toISOString().split('T')[0] : ''
          updates.metadata = {
            ...updates.metadata,
            startTime: formData.eventTime,
            endTime: formData.eventEndTime,
            location: formData.location,
            recurring: formData.recurring,
            recurrenceType: formData.recurrenceType
          }
        } else if (formData.type === 'habit') {
          updates.metadata = {
            ...updates.metadata,
            habitDays: formData.habitDays,
            recurring: true,
            recurrenceType: 'weekly'
          }
        }

        await actions.updateEntry(editingEntry.id, updates)
      } else {
        let payloads = []

        // ===== WIZARD CUMPLEAÑOS: Crear 2 registros =====
        if (isBirthdayModule && formData.birthdayName && formData.birthDate) {
          payloads.push({
            type: 'event',
            title: `🎂 Cumpleaños de ${formData.birthdayName}`,
            scope: 'general',
            module: 'cumpleanos',
            status: 'todo',
            priority: 'medium',
            completed: false,
            deadline: new Date(formData.birthDate + 'T12:00:00').toISOString().split('T')[0],
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
              deadline: new Date(formData.partyDate + 'T12:00:00').toISOString().split('T')[0],
              metadata: {
                isBirthdayParty: true,
                birthdayPerson: formData.birthdayName,
                startTime: formData.partyTime,
                relatedReminder: 'cumpleanos'
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
            basePayload.deadline = formData.deadline ? new Date(formData.deadline + 'T12:00:00').toISOString().split('T')[0] : ''
            basePayload.metadata = {
              deadlineTime: formData.deadlineTime,
              description: formData.description
            }
          } else if (formData.type === 'event') {
            basePayload.date = formData.eventDate ? new Date(formData.eventDate + 'T12:00:00').toISOString().split('T')[0] : ''
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
      }

      onClose()
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error al guardar. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingEntry) return
    if (!confirm('¿Estás seguro de que quieres eliminar esta entrada?')) return

    try {
      await actions.deleteEntry(editingEntry.id)
      onClose()
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar. Por favor intenta de nuevo.')
    }
  }

  if (!isOpen) return null

  const selectedTypeConfig = TYPE_CONFIG[formData.type] || {}

  return (
    <div className="gam-overlay" onClick={onClose}>
      <div className="gam-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="gam-header">
          <button className="gam-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="gam-body">
          {/* Columna Izquierda - Ámbitos */}
          <div className="gam-col-left">
            <div className="gam-scope-nav">
              {Object.entries(SCOPE_LABELS).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  className={`gam-scope-pill ${formData.scope === key ? 'active' : ''}`}
                  onClick={() => updateField('scope', key)}
                >
                  <span className="gam-scope-emoji">{config.emoji}</span>
                  <span className="gam-scope-label">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Columna Derecha - Contenido */}
          <div className="gam-col-right">
            {/* Módulos - Fila de círculos */}
            {canSelectModule && (
              <div className="gam-modules-row">
                {SCOPE_MODULES[formData.scope]?.map(moduleKey => {
                  const config = MODULE_CONFIG[moduleKey]
                  return (
                    <div
                      key={moduleKey}
                      className={`gam-module-item ${formData.module === moduleKey ? 'selected' : ''}`}
                      onClick={() => updateField('module', moduleKey)}
                    >
                      <div className="gam-module-circle">
                        {config.emoji}
                      </div>
                      <span className="gam-module-label">{config.label}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pestañas - Solo si no es cumpleaños */}
            {canSelectType && (
              <div className="gam-tabs">
                {getAvailableTypes().map(type => (
                  <button
                    key={type.value}
                    type="button"
                    className={`gam-tab ${formData.type === type.value ? 'active' : ''}`}
                    onClick={() => updateField('type', type.value)}
                  >
                    <span className="gam-tab-emoji">{type.emoji}</span>
                    <span className="gam-tab-label">{type.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Formulario dinámico */}
            <div className="gam-form-container">
              {formData.type && (
                <div className="gam-form-card" style={{ '--accent': selectedTypeConfig.color }}>
                  {/* Campos comunes */}
                  <div className="gam-form-grid">
                    <div className="gam-form-field">
                      <label className="gam-form-label">
                        {isBirthdayModule ? 'Nombre' : 'Título'}
                      </label>
                      <input
                        type="text"
                        className="gam-form-input"
                        value={isBirthdayModule ? formData.birthdayName : formData.title}
                        onChange={(e) => updateField(isBirthdayModule ? 'birthdayName' : 'title', e.target.value)}
                        placeholder={isBirthdayModule ? "Ej: María González" : "Escribe el título..."}
                        required
                      />
                    </div>

                    {!isBirthdayModule && (
                      <div className="gam-form-field">
                        <label className="gam-form-label">Prioridad</label>
                        <select
                          className="gam-form-select"
                          value={formData.priority}
                          onChange={(e) => updateField('priority', e.target.value)}
                        >
                          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.emoji} {config.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Campos específicos por tipo */}
                    {formData.type === 'task' && (
                      <>
                        <div className="gam-form-field">
                          <label className="gam-form-label">Fecha límite</label>
                          <input
                            type="date"
                            className="gam-form-input"
                            value={formData.deadline}
                            onChange={(e) => updateField('deadline', e.target.value)}
                            required
                          />
                        </div>
                        <div className="gam-form-field">
                          <label className="gam-form-label">Hora (opcional)</label>
                          <input
                            type="time"
                            className="gam-form-input"
                            value={formData.deadlineTime}
                            onChange={(e) => updateField('deadlineTime', e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {formData.type === 'event' && !isBirthdayModule && (
                      <>
                        <div className="gam-form-field">
                          <label className="gam-form-label">Fecha</label>
                          <input
                            type="date"
                            className="gam-form-input"
                            value={formData.eventDate}
                            onChange={(e) => updateField('eventDate', e.target.value)}
                            required
                          />
                        </div>
                        <div className="gam-form-field">
                          <label className="gam-form-label">Hora inicio</label>
                          <input
                            type="time"
                            className="gam-form-input"
                            value={formData.eventTime}
                            onChange={(e) => updateField('eventTime', e.target.value)}
                          />
                        </div>
                        <div className="gam-form-field">
                          <label className="gam-form-label">Hora fin</label>
                          <input
                            type="time"
                            className="gam-form-input"
                            value={formData.eventEndTime}
                            onChange={(e) => updateField('eventEndTime', e.target.value)}
                          />
                        </div>
                        <div className="gam-form-field">
                          <label className="gam-form-label">Ubicación</label>
                          <input
                            type="text"
                            className="gam-form-input"
                            value={formData.location}
                            onChange={(e) => updateField('location', e.target.value)}
                            placeholder="Ej: Salón 302 o https://zoom.com/..."
                          />
                        </div>
                      </>
                    )}

                    {formData.type === 'habit' && (
                      <div className="gam-form-field gam-form-field-full">
                        <label className="gam-form-label">Días de la semana</label>
                        <div className="gam-habit-days">
                          {WEEK_DAYS.map(day => (
                            <button
                              key={day.value}
                              type="button"
                              className={`gam-habit-day ${formData.habitDays.includes(day.value) ? 'active' : ''}`}
                              onClick={() => toggleHabitDay(day.value)}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wizard Cumpleaños */}
                    {isBirthdayModule && (
                      <>
                        <div className="gam-form-field">
                          <label className="gam-form-label">Fecha de nacimiento</label>
                          <input
                            type="date"
                            className="gam-form-input"
                            value={formData.birthDate}
                            onChange={(e) => updateField('birthDate', e.target.value)}
                            required
                          />
                        </div>
                        <div className="gam-form-field">
                          <label className="gam-form-toggle">
                            <input
                              type="checkbox"
                              checked={formData.hasParty}
                              onChange={(e) => updateField('hasParty', e.target.checked)}
                            />
                            ¿Habrá fiesta?
                          </label>
                        </div>
                        {formData.hasParty && (
                          <>
                            <div className="gam-form-field">
                              <label className="gam-form-label">Fecha de la fiesta</label>
                              <input
                                type="date"
                                className="gam-form-input"
                                value={formData.partyDate}
                                onChange={(e) => updateField('partyDate', e.target.value)}
                                required={formData.hasParty}
                              />
                            </div>
                            <div className="gam-form-field">
                              <label className="gam-form-label">Hora de la fiesta</label>
                              <input
                                type="time"
                                className="gam-form-input"
                                value={formData.partyTime}
                                onChange={(e) => updateField('partyTime', e.target.value)}
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Descripción */}
                    {!isBirthdayModule && (
                      <div className="gam-form-field gam-form-field-full">
                        <label className="gam-form-label">Notas (opcional)</label>
                        <textarea
                          className="gam-form-textarea"
                          value={formData.description}
                          onChange={(e) => updateField('description', e.target.value)}
                          placeholder="Añade detalles adicionales..."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="gam-footer">
          {editingEntry && (
            <button
              type="button"
              className="gam-btn gam-btn-delete"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Eliminar
            </button>
          )}
          <div className="gam-footer-right">
            <button
              type="button"
              className="gam-btn gam-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="gam-btn gam-btn-submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.type || (!isBirthdayModule && !formData.title) || (isBirthdayModule && !formData.birthdayName)}
              style={{ '--btn-color': selectedTypeConfig.color }}
            >
              {isSubmitting ? 'Guardando...' : (editingEntry ? 'Guardar' : 'Crear')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalAddModal
