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
  personal: { label: 'Personal', emoji: '👤' },
  academico: { label: 'Académico', emoji: '🎓' },
  general: { label: 'General', emoji: '🌍' }
}

const MODULE_CONFIG = {
  // Personal
  'selfcare': { label: 'Selfcare', emoji: '🛀', allowsHabits: true },
  'mindfulness': { label: 'Mindfulness', emoji: '🧘‍♀️', allowsHabits: true },
  'vida-social': { label: 'Vida Social', emoji: '🥂', allowsHabits: false },
  'fitness': { label: 'Fitness', emoji: '💪', allowsHabits: true },
  'foodie': { label: 'Foodie', emoji: '🍜', allowsHabits: true },
  // Académico
  'data-science': { label: 'Data Science', emoji: '📊', allowsHabits: false },
  'investigacion': { label: 'Investigación', emoji: '🔬', allowsHabits: true },
  'maestria': { label: 'Maestría', emoji: '🎓', allowsHabits: false },
  'laboratorio': { label: 'Laboratorio', emoji: '🧪', allowsHabits: false },
  'idiomas': { label: 'Idiomas', emoji: '🗣️', allowsHabits: true },
  // General
  'cumpleanos': { label: 'Cumpleaños', emoji: '🎂', allowsHabits: false, isBirthday: true },
  'finanzas': { label: 'Finanzas', emoji: '💰', allowsHabits: false },
  'tramites': { label: 'Trámites', emoji: '📋', allowsHabits: false }
}

const TYPE_CONFIG = {
  task: { label: 'Tarea', emoji: '📝', allowedScopes: ['personal', 'academico', 'general'] },
  event: { label: 'Evento', emoji: '📅', allowedScopes: ['personal', 'academico', 'general'] },
  habit: { label: 'Hábito', emoji: '🔄', allowedScopes: ['personal', 'academico', 'general'] }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baja', emoji: '🟢', color: '#22c55e' },
  medium: { label: 'Media', emoji: '🟡', color: '#eab308' },
  high: { label: 'Alta', emoji: '🔴', color: '#ef4444' }
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
function GlobalAddModal({ isOpen, onClose }) {
  const { actions } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estado del formulario con estructura cascada
  const [formData, setFormData] = useState({
    // Nivel 1: Ámbito (requerido primero)
    scope: '',
    // Nivel 2: Módulo (requiere ámbito)
    module: '',
    // Nivel 3: Tipo (requiere módulo)
    type: '',
    // Datos base
    title: '',
    description: '',
    // Metadata dinámica
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
    // Wizard cumpleaños
    birthdayName: '',
    birthDate: '',
    hasParty: false,
    partyDate: '',
    partyTime: ''
  })

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        scope: '',
        module: '',
        type: '',
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
  }, [isOpen])

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
        updates.type = ''
        // Resetear campos específicos del módulo anterior
        if (MODULE_CONFIG[value]?.isBirthday) {
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

  // ===== VALIDACIONES DEL EMBUDO =====
  const canSelectModule = formData.scope !== ''
  const canSelectType = formData.module !== ''
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

  // ===== SUBMIT CON LOADING STATE =====
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      let payloads = []

      // ===== WIZARD CUMPLEAÑOS: Crear 2 registros =====
      if (isBirthdayModule && formData.birthdayName && formData.birthDate) {
        // 1. Recordatorio del cumpleaños (entry general)
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

        // 2. Evento de fiesta (si aplica)
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
              startTime: formData.partyTime,
              relatedReminder: 'cumpleanos'
            }
          })
        }
      }
      // ===== FLUJO NORMAL =====
      else {
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

        // Metadata específica por tipo
        if (formData.type === 'task') {
          basePayload.deadline = formData.deadline
          basePayload.metadata = {
            deadlineTime: formData.deadlineTime,
            description: formData.description
          }
        }
        else if (formData.type === 'event') {
          basePayload.deadline = formData.eventDate
          basePayload.metadata = {
            startTime: formData.eventTime,
            endTime: formData.eventEndTime,
            location: formData.location,
            recurring: formData.recurring,
            recurrenceType: formData.recurrenceType,
            description: formData.description
          }
        }
        else if (formData.type === 'habit') {
          basePayload.metadata = {
            habitDays: formData.habitDays,
            recurring: true,
            recurrenceType: 'weekly',
            description: formData.description
          }
        }

        payloads.push(basePayload)
      }

      // Enviar todos los payloads a Firebase
      for (const payload of payloads) {
        await actions.addEntry(payload)
      }

      // Cerrar modal solo si todo fue exitoso
      onClose()
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error al guardar. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nueva Entrada</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* ===== COLUMNA IZQUIERDA: Embudo y Título ===== */}
          <div className="modal-column modal-column-left">
            
            {/* NIVEL 1: ÁMBITO */}
            <div className="form-section">
              <span className="form-section-title">Paso 1: Selecciona el Ámbito</span>
              <div className="pill-group">
                {Object.entries(SCOPE_LABELS).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    className={`pill-btn ${formData.scope === key ? 'active' : ''}`}
                    onClick={() => updateField('scope', key)}
                  >
                    <span className="pill-emoji">{config.emoji}</span>
                    <span className="pill-label">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* NIVEL 2: MÓDULO (bloqueado hasta seleccionar ámbito) */}
            <div className={`form-section ${!canSelectModule ? 'section-blocked' : ''}`}>
              <span className="form-section-title">
                Paso 2: Selecciona el Módulo
                {!canSelectModule && <span style={{ marginLeft: '0.5rem', opacity: 0.5 }}>🔒</span>}
              </span>
              {canSelectModule && (
                <div className="pill-group">
                  {SCOPE_MODULES[formData.scope]?.map(moduleKey => {
                    const config = MODULE_CONFIG[moduleKey]
                    return (
                      <button
                        key={moduleKey}
                        type="button"
                        className={`pill-btn ${formData.module === moduleKey ? 'active' : ''}`}
                        onClick={() => updateField('module', moduleKey)}
                      >
                        <span className="pill-emoji">{config.emoji}</span>
                        <span className="pill-label">{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              {!canSelectModule && (
                <div className="empty-hint">Selecciona un ámbito primero</div>
              )}
            </div>

            {/* NIVEL 3: TIPO (bloqueado hasta seleccionar módulo) */}
            <div className={`form-section ${!canSelectType ? 'section-blocked' : ''}`}>
              <span className="form-section-title">
                Paso 3: Selecciona el Tipo
                {!canSelectType && <span style={{ marginLeft: '0.5rem', opacity: 0.5 }}>🔒</span>}
              </span>
              {canSelectType && (
                <div className="pill-group">
                  {getAvailableTypes().map(type => (
                    <button
                      key={type.value}
                      type="button"
                      className={`pill-btn ${formData.type === type.value ? 'active' : ''}`}
                      onClick={() => updateField('type', type.value)}
                    >
                      <span className="pill-emoji">{type.emoji}</span>
                      <span className="pill-label">{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
              {!canSelectType && (
                <div className="empty-hint">Selecciona un módulo primero</div>
              )}
            </div>

            {/* TÍTULO (visible cuando hay tipo seleccionado) */}
            {formData.type && (
              <div className="form-section metadata-section">
                <label className="form-label">
                  {isBirthdayModule ? 'Nombre del cumpleañero/a' : 'Título'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={isBirthdayModule ? formData.birthdayName : formData.title}
                  onChange={(e) => updateField(isBirthdayModule ? 'birthdayName' : 'title', e.target.value)}
                  placeholder={isBirthdayModule ? "Ej: María González" : "Escribe el título..."}
                  required
                />
              </div>
            )}

            {/* DESCRIPCIÓN OPCIONAL */}
            {formData.type && !isBirthdayModule && (
              <div className="form-section">
                <label className="form-label">Descripción (opcional)</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Añade detalles adicionales..."
                  rows={2}
                />
              </div>
            )}

          </div>

          {/* ===== COLUMNA DERECHA: Metadata Dinámica ===== */}
          <div className="modal-column modal-column-right">
            
            {/* METADATA: TAREA */}
            {formData.type === 'task' && (
              <div className="metadata-section">
                <span className="form-section-title">📝 Detalles de la Tarea</span>
                
                <div className="form-section">
                  <label className="form-label">Fecha límite</label>
                  <div className="date-time-row">
                    <input
                      type="date"
                      className="form-input"
                      value={formData.deadline}
                      onChange={(e) => updateField('deadline', e.target.value)}
                      required
                    />
                    <input
                      type="time"
                      className="form-input"
                      value={formData.deadlineTime}
                      onChange={(e) => updateField('deadlineTime', e.target.value)}
                      placeholder="Hora (opcional)"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Prioridad</label>
                  <div className="pill-group">
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        className={`pill-btn ${formData.priority === key ? 'active' : ''}`}
                        onClick={() => updateField('priority', key)}
                      >
                        <span className="pill-emoji">{config.emoji}</span>
                        <span className="pill-label">{config.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* METADATA: EVENTO */}
            {formData.type === 'event' && !isBirthdayModule && (
              <div className="metadata-section">
                <span className="form-section-title">📅 Detalles del Evento</span>
                
                <div className="form-section">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.eventDate}
                    onChange={(e) => updateField('eventDate', e.target.value)}
                    required
                  />
                </div>

                <div className="form-section">
                  <label className="form-label">Horario</label>
                  <div className="date-time-row">
                    <input
                      type="time"
                      className="form-input"
                      value={formData.eventTime}
                      onChange={(e) => updateField('eventTime', e.target.value)}
                      placeholder="Inicio"
                    />
                    <input
                      type="time"
                      className="form-input"
                      value={formData.eventEndTime}
                      onChange={(e) => updateField('eventEndTime', e.target.value)}
                      placeholder="Fin"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Ubicación / Link</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Ej: Salón 302 o https://zoom.com/..."
                  />
                </div>

                <div className="form-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.recurring}
                      onChange={(e) => updateField('recurring', e.target.checked)}
                    />
                    Evento recurrente
                  </label>
                  {formData.recurring && (
                    <select
                      className="form-select"
                      value={formData.recurrenceType}
                      onChange={(e) => updateField('recurrenceType', e.target.value)}
                      style={{ marginTop: '0.5rem' }}
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                      <option value="annual">Anual</option>
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* METADATA: HÁBITO */}
            {formData.type === 'habit' && (
              <div className="metadata-section">
                <span className="form-section-title">🔄 Configuración del Hábito</span>
                
                <div className="form-section">
                  <label className="form-label">Días de la semana</label>
                  <div className="pill-group">
                    {WEEK_DAYS.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        className={`pill-btn day-pill ${formData.habitDays.includes(day.value) ? 'active' : ''}`}
                        onClick={() => toggleHabitDay(day.value)}
                      >
                        <span className="pill-label">{day.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WIZARD: CUMPLEAÑOS */}
            {isBirthdayModule && formData.type === 'event' && (
              <div className="birthday-wizard">
                <div className="birthday-wizard-title">
                  <span>🎂</span>
                  <span>Wizard de Cumpleaños</span>
                </div>

                <div className="form-section">
                  <label className="form-label">Fecha de nacimiento</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    required
                  />
                </div>

                <div className="form-section">
                  <label className="checkbox-label">
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
                    <div className="form-divider" />
                    <div className="form-section">
                      <label className="form-label">Fecha de la fiesta</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.partyDate}
                        onChange={(e) => updateField('partyDate', e.target.value)}
                        required={formData.hasParty}
                      />
                    </div>
                    <div className="form-section">
                      <label className="form-label">Hora de la fiesta</label>
                      <input
                        type="time"
                        className="form-input"
                        value={formData.partyTime}
                        onChange={(e) => updateField('partyTime', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

          {/* ===== ACCIONES ===== */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmitting || !formData.type || (!isBirthdayModule && !formData.title) || (isBirthdayModule && !formData.birthdayName)}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GlobalAddModal
