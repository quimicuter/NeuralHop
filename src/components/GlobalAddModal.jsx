import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
    notes: '',
    // Campos especializados
    metadata: {
      code: '',
      filename: '',
      language: 'python',
      weekNumber: '',
      tags: [],
      paperTag: '',
      journal: '',
      laboratory: '',
      program: '',
      requirementId: '',
      inventoryCategory: '',
      quantity: '',
      unit: '',
      subject: '',
      translation: '',
      language: '',
      front: '',
      back: '',
      productCategory: '',
      cycleId: '',
      contactId: '',
      youtubeId: '',
      goalId: '',
      progress: 0
    }
  })

  // Actualizar el tipo cuando cambia preselectedType
  useEffect(() => {
    setFormData(prev => ({ ...prev, type: preselectedType }))
  }, [preselectedType])

  // ─── TIPOS DINÁMICOS POR RUTA ───
  const location = useLocation()
  const currentPath = location.pathname
  
  // Detectar si estamos en un Hub específico
  const isInHub = currentPath.startsWith('/hub/')
  const hubModule = isInHub ? currentPath.split('/')[3] : null
  
  // Tipos base disponibles siempre
  const baseTypeOptions = [
    { value: 'task', label: 'Tarea', emoji: '📝' },
    { value: 'event', label: 'Evento', emoji: '📅' },
    { value: 'habit', label: 'Hábito', emoji: '🔄' }
  ]
  
  // Tipos especializados por Hub
  const specializedTypeOptions = {
    'data-science': [
      { value: 'code', label: 'Code Snippet', emoji: '🐍' },
      { value: 'course-module', label: 'Módulo Curso', emoji: '📚' }
    ],
    'investigacion': [
      { value: 'paper', label: 'Paper', emoji: '📄' }
    ],
    'maestria': [
      { value: 'application', label: 'Aplicación', emoji: '🎓' },
      { value: 'titulacion', label: 'Requisito Titulación', emoji: '✅' }
    ],
    'lab': [
      { value: 'inventory', label: 'Inventario', emoji: '📦' },
      { value: 'experiment', label: 'Experimento', emoji: '🔬' }
    ],
    'idiomas': [
      { value: 'flashcard', label: 'Flashcard', emoji: '🎴' },
      { value: 'vocabulary', label: 'Vocabulario', emoji: '📖' }
    ],
    'selfcare': [
      { value: 'product', label: 'Producto', emoji: '🧴' },
      { value: 'cycle', label: 'Ciclo', emoji: '🔄' }
    ],
    'mindfulness': [
      { value: 'journal', label: 'Entrada Diario', emoji: '📓' },
      { value: 'contact-entry', label: 'Contacto', emoji: '💞' }
    ],
    'vida-social': [
      { value: 'wishlist', label: 'Lista Deseos', emoji: '🎁' },
      { value: 'memory', label: 'Recuerdo', emoji: '📸' }
    ],
    'fitness': [
      { value: 'video', label: 'Video Rutina', emoji: '🎬' },
      { value: 'goal', label: 'Meta Fitness', emoji: '🎯' }
    ]
  }
  
  // Combinar tipos base + especializados del hub actual
  const typeOptions = isInHub && specializedTypeOptions[hubModule]
    ? [...baseTypeOptions, ...specializedTypeOptions[hubModule]]
    : baseTypeOptions

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

  // ─── OPCIONES ESPECIALIZADAS ───
  const paperTagOptions = [
    { value: 'smart-materials', label: 'Smart Materials' },
    { value: 'biomass-conversion', label: 'Biomass Conversion' },
    { value: 'metabolic-diseases', label: 'Metabolic Diseases' }
  ]
  
  const inventoryCategoryOptions = [
    { value: 'reactivos', label: 'Reactivos' },
    { value: 'material-roto', label: 'Material Roto' },
    { value: 'protocolos', label: 'Protocolos' }
  ]
  
  const subjectOptions = [
    { value: 'experimentacion', label: 'Experimentación en Ingenierías' },
    { value: 'quimica-organica', label: 'Química Orgánica' },
    { value: 'quimica-2', label: 'Química 2' }
  ]
  
  const languageOptions = [
    { value: 'frances', label: 'Français' },
    { value: 'aleman', label: 'Deutsch' },
    { value: 'italiano', label: 'Italiano' },
    { value: 'japones', label: '日本語' },
    { value: 'toefl', label: 'TOEFL' }
  ]
  
  const productCategoryOptions = [
    { value: 'skincare', label: 'Skincare' },
    { value: 'haircare', label: 'Haircare' },
    { value: 'gel-nail-polish', label: 'Gel Nail Polish' }
  ]
  
  const cycleOptions = [
    { value: 'lavado', label: 'Lavado de cabello' },
    { value: 'exfoliacion', label: 'Exfoliación' },
    { value: 'corte', label: 'Corte mensual' },
    { value: 'planchado', label: 'Planchado' }
  ]
  
  const titulacionOptions = [
    { value: 'tesis', label: 'Tesis/Proyecto de titulación' },
    { value: 'acto', label: 'Acto protocolario' },
    { value: 'liberacion', label: 'Liberación de servicio social' },
    { value: 'certificado', label: 'Certificado de idioma' },
    { value: 'credits', label: '100% de créditos aprobados' },
    { value: 'constancia', label: 'Constancia de no adeudo' }
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

    // Construir entryData para la nueva colección 'entries'
    const newEntry = {
      type: formData.type,
      title: formData.title,
      scope: formData.category === 'general' ? 'global' : formData.category,
      module: formData.category === 'general' ? formData.freeCategory : formData.subcategory,
      status: 'todo',
      priority: formData.priority,
      completed: false,
      tags: [],
      metadata: {}
    }

    // Añadir campos específicos por tipo
    if (formData.type === 'event') {
      newEntry.deadline = formData.date
      newEntry.metadata = {
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location
      }
    } else if (formData.type === 'task') {
      newEntry.deadline = formData.deadline
      newEntry.metadata = {
        deadlineTime: formData.deadlineTime
      }
    } else if (formData.type === 'habit') {
      newEntry.metadata = {
        habitDays: formData.habitDays,
        recurring: formData.recurring,
        recurrenceType: formData.recurrenceType
      }
    }
    
    // ─── TIPOS ESPECIALIZADOS ───
    else if (formData.type === 'code') {
      newEntry.metadata = {
        code: formData.metadata.code,
        filename: formData.metadata.filename || 'snippet.py',
        language: formData.metadata.language || 'python'
      }
      newEntry.content = formData.metadata.code
    }
    else if (formData.type === 'course-module') {
      newEntry.metadata = {
        weekNumber: formData.metadata.weekNumber,
        topic: formData.title,
        courseId: 'data-science-main'
      }
    }
    else if (formData.type === 'paper') {
      newEntry.metadata = {
        paperType: true,
        tags: [formData.metadata.paperTag],
        journal: formData.metadata.journal
      }
      newEntry.status = 'idea' // Papers empiezan en "idea"
    }
    else if (formData.type === 'application') {
      newEntry.metadata = {
        applicationType: true,
        program: formData.metadata.program,
        laboratory: formData.metadata.laboratory,
        deadline: formData.deadline,
        progress: 0
      }
    }
    else if (formData.type === 'titulacion') {
      newEntry.metadata = {
        requirementId: formData.metadata.requirementId
      }
      newEntry.completed = false
    }
    else if (formData.type === 'inventory') {
      newEntry.metadata = {
        inventoryType: true,
        category: formData.metadata.inventoryCategory,
        quantity: formData.metadata.quantity,
        unit: formData.metadata.unit,
        status: 'available',
        lastUpdated: new Date().toISOString()
      }
    }
    else if (formData.type === 'experiment') {
      newEntry.metadata = {
        subject: formData.metadata.subject,
        date: formData.date
      }
    }
    else if (formData.type === 'flashcard') {
      newEntry.metadata = {
        flashcardData: true,
        front: formData.metadata.front,
        back: formData.metadata.back,
        language: formData.metadata.language,
        translation: formData.metadata.back
      }
      newEntry.completed = false
    }
    else if (formData.type === 'vocabulary') {
      newEntry.metadata = {
        language: formData.metadata.language,
        translation: formData.metadata.translation
      }
      newEntry.completed = false
    }
    else if (formData.type === 'product') {
      newEntry.metadata = {
        category: formData.metadata.productCategory
      }
    }
    else if (formData.type === 'cycle') {
      newEntry.metadata = {
        cycleId: formData.metadata.cycleId,
        lastDone: new Date().toISOString()
      }
    }
    else if (formData.type === 'journal') {
      newEntry.metadata = {
        mood: 'neutral'
      }
    }
    else if (formData.type === 'contact-entry') {
      newEntry.metadata = {
        contactId: formData.metadata.contactId,
        lastContactDate: new Date().toISOString()
      }
    }
    else if (formData.type === 'wishlist') {
      newEntry.metadata = {
        isWishlist: true,
        estimatedPrice: ''
      }
      newEntry.status = 'ideas'
    }
    else if (formData.type === 'memory') {
      newEntry.metadata = {
        photoUrl: '',
        location: formData.location
      }
    }
    else if (formData.type === 'video') {
      newEntry.metadata = {
        youtubeId: formData.metadata.youtubeId
      }
    }
    else if (formData.type === 'goal') {
      newEntry.metadata = {
        goalId: formData.metadata.goalId,
        progress: 0
      }
    }

    if (formData.notes) {
      newEntry.content = formData.notes
    }

    actions.addEntry(newEntry)
    onClose()
    setFormData({
      type: 'task',
      title: '',
      category: isInHub ? (hubModule && ['selfcare', 'mindfulness', 'vida-social', 'fitness'].includes(hubModule) ? 'personal' : 'escolar') : 'personal',
      subcategory: isInHub ? hubModule : '',
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
      notes: '',
      metadata: {
        code: '',
        filename: '',
        language: 'python',
        weekNumber: '',
        tags: [],
        paperTag: '',
        journal: '',
        laboratory: '',
        program: '',
        requirementId: '',
        inventoryCategory: '',
        quantity: '',
        unit: '',
        subject: '',
        translation: '',
        front: '',
        back: '',
        productCategory: '',
        cycleId: '',
        contactId: '',
        youtubeId: '',
        goalId: '',
        progress: 0
      }
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
  
  const handleMetadataChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value
      }
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
            <label className="form-label centered text-xs">Título</label>
            <div className="input-container">
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="form-input petite centered py-2 px-3"
                placeholder="Escribe el título..."
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-section">
              <label className="form-label centered text-xs">Ámbito</label>
              <div className="pill-group centered">
                {categoryOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`pill-btn petite text-xs ${formData.category === option.value ? 'active' : ''}`}
                    onClick={() => handlePillClick('category', option.value)}
                  >
                    <span className="pill-emoji">{option.emoji}</span>
                    <span className="pill-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label centered text-xs">
                {formData.category === 'general' ? 'Categoría Libre' : 'Módulo'}
              </label>
              <div className="pill-group centered">
                {getModuleOptions().map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`pill-btn petite text-xs ${getSelectedModule() === option.value ? 'active' : ''}`}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="form-section">
                <label className="form-label centered text-xs">Fecha Límite</label>
                <div className="date-time-group centered">
                  <input 
                    type="date" 
                    name="deadline" 
                    value={formData.deadline} 
                    onChange={handleChange} 
                    className="form-input petite centered py-1.5 px-3"
                    placeholder="Fecha límite"
                  />
                  <input 
                    type="time" 
                    name="deadlineTime" 
                    value={formData.deadlineTime} 
                    onChange={handleChange} 
                    className="form-input petite centered py-1.5 px-3"
                    placeholder="Hora (opcional)"
                  />
                </div>
              </div>
              
              <div className="form-section">
                <label className="form-label centered text-xs">Prioridad</label>
                <div className="pill-group centered">
                  {priorityOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`pill-btn petite text-xs ${formData.priority === option.value ? 'active' : ''}`}
                      onClick={() => handlePillClick('priority', option.value)}
                    >
                      <span className="pill-emoji">{option.emoji}</span>
                      <span className="pill-label">{option.label}</span>
                    </button>
                  ))}
                </div>
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

          {/* ─── CAMPOS ESPECIALIZADOS ─── */}
          
          {/* Code Snippet */}
          {formData.type === 'code' && (
            <div className="form-section">
              <label className="form-label centered">🐍 Code Snippet</label>
              <input
                type="text"
                name="filename"
                value={formData.metadata.filename}
                onChange={handleMetadataChange}
                className="form-input petite centered mb-2"
                placeholder="Nombre del archivo (ej: data_analysis.py)"
              />
              <textarea
                name="code"
                value={formData.metadata.code}
                onChange={handleMetadataChange}
                className="form-textarea petite centered py-2 px-3"
                placeholder="Pega tu código Python aquí..."
                rows={4}
                style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
              />
            </div>
          )}
          
          {/* Course Module */}
          {formData.type === 'course-module' && (
            <div className="form-section">
              <label className="form-label centered">📚 Módulo del Curso</label>
              <input
                type="number"
                name="weekNumber"
                value={formData.metadata.weekNumber}
                onChange={handleMetadataChange}
                className="form-input petite centered"
                placeholder="Número de semana (1-12)"
                min="1"
                max="12"
              />
            </div>
          )}
          
          {/* Paper */}
          {formData.type === 'paper' && (
            <div className="form-section">
              <label className="form-label centered">📄 Paper de Investigación</label>
              <select
                name="paperTag"
                value={formData.metadata.paperTag}
                onChange={handleMetadataChange}
                className="form-input petite centered mb-2"
              >
                <option value="">Selecciona tag...</option>
                {paperTagOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                name="journal"
                value={formData.metadata.journal}
                onChange={handleMetadataChange}
                className="form-input petite centered"
                placeholder="Nombre de la revista (opcional)"
              />
            </div>
          )}
          
          {/* Application */}
          {formData.type === 'application' && (
            <div className="form-section">
              <label className="form-label centered">🎓 Aplicación Académica</label>
              <input
                type="text"
                name="program"
                value={formData.metadata.program}
                onChange={handleMetadataChange}
                className="form-input petite centered mb-2"
                placeholder="Programa (ej: KAUST VSRP 2026)"
              />
              <input
                type="text"
                name="laboratory"
                value={formData.metadata.laboratory}
                onChange={handleMetadataChange}
                className="form-input petite centered mb-2"
                placeholder="Laboratorio"
              />
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="form-input petite centered"
                placeholder="Fecha límite"
              />
            </div>
          )}
          
          {/* Titulación */}
          {formData.type === 'titulacion' && (
            <div className="form-section">
              <label className="form-label centered">✅ Requisito de Titulación</label>
              <select
                name="requirementId"
                value={formData.metadata.requirementId}
                onChange={handleMetadataChange}
                className="form-input petite centered"
              >
                <option value="">Selecciona requisito...</option>
                {titulacionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Inventory */}
          {formData.type === 'inventory' && (
            <div className="form-section">
              <label className="form-label centered">📦 Item de Inventario</label>
              <select
                name="inventoryCategory"
                value={formData.metadata.inventoryCategory}
                onChange={handleMetadataChange}
                className="form-input petite centered mb-2"
              >
                <option value="">Categoría...</option>
                {inventoryCategoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="quantity"
                  value={formData.metadata.quantity}
                  onChange={handleMetadataChange}
                  className="form-input petite centered"
                  placeholder="Cantidad"
                />
                <input
                  type="text"
                  name="unit"
                  value={formData.metadata.unit}
                  onChange={handleMetadataChange}
                  className="form-input petite centered"
                  placeholder="Unidad (ml, g, etc)"
                />
              </div>
            </div>
          )}
          
          {/* Experiment */}
          {formData.type === 'experiment' && (
            <div className="form-section">
              <label className="form-label centered">🔬 Experimento</label>
              <select
                name="subject"
                value={formData.metadata.subject}
                onChange={handleMetadataChange}
                className="form-input petite centered mb-2"
              >
                <option value="">Materia...</option>
                {subjectOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input petite centered"
                placeholder="Fecha del experimento"
              />
            </div>
          )}
          
          {/* Flashcard */}
          {formData.type === 'flashcard' && (
            <div className="form-section">
              <label className="form-label centered">🎴 Flashcard</label>
              <select
                name="language"
                value={formData.metadata.language}
                onChange={handleMetadataChange}
                className="form-input petite centered mb-2"
              >
                <option value="">Idioma...</option>
                {languageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                name="front"
                value={formData.metadata.front}
                onChange={handleMetadataChange}
                className="form-input petite centered mb-2"
                placeholder="Texto frontal (ej: Bonjour)"
              />
              <input
                type="text"
                name="back"
                value={formData.metadata.back}
                onChange={handleMetadataChange}
                className="form-input petite centered"
                placeholder="Texto trasero (ej: Hola)"
              />
            </div>
          )}
          
          {/* Vocabulary */}
          {formData.type === 'vocabulary' && (
            <div className="form-section">
              <label className="form-label centered">📖 Entrada de Vocabulario</label>
              <select
                name="language"
                value={formData.metadata.language}
                onChange={handleMetadataChange}
                className="form-input petite centered mb-2"
              >
                <option value="">Idioma...</option>
                {languageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                name="translation"
                value={formData.metadata.translation}
                onChange={handleMetadataChange}
                className="form-input petite centered"
                placeholder="Traducción"
              />
            </div>
          )}
          
          {/* Product */}
          {formData.type === 'product' && (
            <div className="form-section">
              <label className="form-label centered">🧴 Producto</label>
              <select
                name="productCategory"
                value={formData.metadata.productCategory}
                onChange={handleMetadataChange}
                className="form-input petite centered"
              >
                <option value="">Categoría...</option>
                {productCategoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Cycle */}
          {formData.type === 'cycle' && (
            <div className="form-section">
              <label className="form-label centered">🔄 Ciclo de Cuidado</label>
              <select
                name="cycleId"
                value={formData.metadata.cycleId}
                onChange={handleMetadataChange}
                className="form-input petite centered"
              >
                <option value="">Selecciona ciclo...</option>
                {cycleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Video */}
          {formData.type === 'video' && (
            <div className="form-section">
              <label className="form-label centered">🎬 Video de Rutina</label>
              <input
                type="text"
                name="youtubeId"
                value={formData.metadata.youtubeId}
                onChange={handleMetadataChange}
                className="form-input petite centered"
                placeholder="YouTube Video ID (ej: dQw4w9WgXcQ)"
              />
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
            <label className="form-label centered text-xs">Notas</label>
            <div className="input-container">
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                className="form-textarea petite centered py-2 px-3"
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
