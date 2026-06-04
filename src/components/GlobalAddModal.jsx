import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { IconRenderer } from './IconRenderer'
import './GlobalAddModal.css'

// ===== CONFIGURACIÓN CENTRALIZADA =====
export const SCOPE_MODULES = {
  personal: ['wellness', 'vida-social', 'foodie'],
  academico: ['tecno-girl', 'investigacion', 'maestria', 'laboratorio', 'idiomas'],
  general: ['cumpleanos', 'finanzas', 'tramites']
}

export const SCOPE_LABELS = {
  personal: { label: 'Personal', icon: 'Heart', glow: 'rgba(244, 114, 182, 0.35)' },   // rosa
  academico: { label: 'Académico', icon: 'GraduationCap', glow: 'rgba(139, 92, 246, 0.35)' }, // morado
  general: { label: 'General', icon: 'Globe', glow: 'rgba(56, 189, 248, 0.35)' }       // azul
}

export const MODULE_CONFIG = {
  // Personal
  'wellness': {
    label: 'Wellness Hub',
    icon: 'Leaf',
    allowsHabits: true,
    submodules: [
      { id: 'glow', label: 'Glow', icon: 'Sparkles', color: '#fbbf24' },
      { id: 'vitality', label: 'Vitality', icon: 'Zap', color: '#f87171' },
      { id: 'innerBalance', label: 'Inner Balance', icon: 'Circle', color: '#34d399' },
      { id: 'zenRest', label: 'Zen Rest', icon: 'Moon', color: '#60a5fa' }
    ]
  },
  'vida-social': {
    label: 'Vida Social',
    icon: 'GlassWater',
    allowsHabits: false,
    submodules: [
      { id: 'amigos', label: 'Amigos', icon: 'Users', color: '#ec4899' },
      { id: 'familia', label: 'Familia', icon: 'Users', color: '#f97316' },
      { id: 'eventos', label: 'Eventos', icon: 'PartyPopper', color: '#8b5cf6' }
    ]
  },
  'foodie': {
    label: 'Foodie',
    icon: 'Utensils',
    allowsHabits: true,
    submodules: [
      { id: 'cocina', label: 'Cocina', icon: 'ChefHat', color: '#ef4444' },
      { id: 'recetas', label: 'Recetas', icon: 'BookOpen', color: '#06b6d4' },
      { id: 'dieta', label: 'Dieta', icon: 'Apple', color: '#10b981' }
    ]
  },
  // Académico
  'tecno-girl': {
    label: 'Tecno Girl',
    icon: 'Code2',
    allowsHabits: false,
    submodules: [
      { id: 'dev', label: 'Development', icon: 'Wrench', color: '#6366f1' },
      { id: 'design', label: 'Design', icon: 'Palette', color: '#ec4899' },
      { id: 'marketing', label: 'Marketing', icon: 'Megaphone', color: '#f59e0b' }
    ]
  },
  'investigacion': {
    label: 'Investigación',
    icon: 'FlaskConical',
    allowsHabits: true,
    submodules: [
      { id: 'literatura', label: 'Literatura', icon: 'BookOpen', color: '#6d28d9' },
      { id: 'experimento', label: 'Experimento', icon: 'Dna', color: '#06b6d4' },
      { id: 'analisis', label: 'Análisis', icon: 'BarChart3', color: '#8b5cf6' }
    ]
  },
  'maestria': {
    label: 'Maestría',
    icon: 'GraduationCap',
    allowsHabits: false,
    submodules: [
      { id: 'clases', label: 'Clases', icon: 'BookOpen', color: '#3b82f6' },
      { id: 'tesis', label: 'Tesis', icon: 'FileText', color: '#8b5cf6' },
      { id: 'proyectos', label: 'Proyectos', icon: 'Rocket', color: '#f59e0b' }
    ]
  },
  'laboratorio': {
    label: 'Laboratorio',
    icon: 'Beaker',
    allowsHabits: false,
    submodules: [
      { id: 'practicas', label: 'Prácticas', icon: 'Beaker', color: '#06b6d4' },
      { id: 'reportes', label: 'Reportes', icon: 'ClipboardList', color: '#10b981' },
      { id: 'equipo', label: 'Equipo', icon: 'Flask', color: '#ec4899' }
    ]
  },
  'idiomas': {
    label: 'Idiomas',
    icon: 'Languages',
    allowsHabits: true,
    submodules: [
      { id: 'ingles', label: 'Inglés', icon: 'Globe', color: '#3b82f6' },
      { id: 'aleman', label: 'Alemán', icon: 'Globe', color: '#f97316' },
      { id: 'japones', label: 'Japonés', icon: 'Globe', color: '#ef4444' }
    ]
  },
  // General
  'cumpleanos': { label: 'Cumpleaños', icon: 'Cake', allowsHabits: false, isBirthday: true },
  'finanzas': {
    label: 'Finanzas',
    icon: 'Wallet',
    allowsHabits: false,
    submodules: [
      { id: 'ingresos', label: 'Ingresos', icon: 'TrendingUp', color: '#10b981' },
      { id: 'gastos', label: 'Gastos', icon: 'TrendingDown', color: '#ef4444' },
      { id: 'ahorros', label: 'Ahorros', icon: 'PiggyBank', color: '#3b82f6' }
    ]
  },
  'tramites': {
    label: 'Trámites',
    icon: 'FileText',
    allowsHabits: false,
    submodules: [
      { id: 'documentos', label: 'Documentos', icon: 'FileText', color: '#6b7280' },
      { id: 'solicitudes', label: 'Solicitudes', icon: 'Clipboard', color: '#8b5cf6' },
      { id: 'pagos', label: 'Pagos', icon: 'CreditCard', color: '#f59e0b' }
    ]
  }
}

const TYPE_CONFIG = {
  task: { label: 'Tarea', icon: 'CheckSquare', color: 'rgba(244, 212, 217, 0.65)' },    // Rosa Bruma
  event: { label: 'Evento', icon: 'Calendar', color: 'rgba(215, 189, 226, 0.65)' },   // Lavanda Mate
  habit: { label: 'Hábito', icon: 'RefreshCw', color: 'rgba(189, 212, 231, 0.65)' },   // Azul Glaciar
  project: { label: 'Proyecto', icon: 'Rocket', color: 'rgba(201, 222, 197, 0.65)' } // Verde Salvia
}

const FREQUENCY_CONFIG = {
  daily: { label: 'Diario', icon: 'Circle' },
  weekly: { label: 'Semanal', icon: 'CircleHalf' },
  multiple: { label: 'Múltiple', icon: 'CircleDot' },
  monthly: { label: 'Mensual', icon: 'Calendar' }
}

const PROJECT_STATUS = {
  not_started: { label: 'No empezado', color: '#9ca3af' },
  active: { label: 'Activo', color: '#22c55e' },
  paused: { label: 'Pausa', color: '#eab308' },
  archived: { label: 'Archivado', color: '#6b7280' }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baja', icon: 'Circle', color: '#22c55e' },
  medium: { label: 'Media', icon: 'Circle', color: '#eab308' },
  high: { label: 'Alta', icon: 'Circle', color: '#ef4444' },
  critical: { label: 'Crítica', icon: 'AlertTriangle', color: '#8b0000' }
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

// ===== HELPERS DE HÁBITO =====
// Parsea "1, 15, 28" → [1, 15, 28] filtrando rangos válidos 1-31
export const parseMonthlyDays = (raw) => {
  if (Array.isArray(raw)) return raw.filter(n => Number.isInteger(n) && n >= 1 && n <= 31)
  if (typeof raw !== 'string') return []
  return raw
    .split(/[,\s]+/)
    .map(s => parseInt(s.trim(), 10))
    .filter(n => Number.isInteger(n) && n >= 1 && n <= 31)
}

// Determina si un hábito debe aparecer "hoy" según su metadata
export const isHabitDueToday = (habit, refDate = new Date()) => {
  const meta = habit?.metadata || {}
  const freq = meta.frequency || meta.recurrenceType || 'daily'
  if (freq === 'daily') return true
  if (freq === 'weekly' || freq === 'multiple') {
    const days = Array.isArray(meta.habitDays) ? meta.habitDays : []
    return days.includes(refDate.getDay())
  }
  if (freq === 'monthly') {
    const days = parseMonthlyDays(meta.monthlyDays)
    return days.includes(refDate.getDate())
  }
  return false
}

// ===== COMPONENTE PRINCIPAL =====
function GlobalAddModal({ isOpen, onClose, preselectedType = '', preselectedModule = '', preselectedCategory = null, editEntry = null, prefillData = null }) {
  const { actions } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emptyFormData = {
    scope: 'personal',
    module: 'wellness',
    type: 'task',
    title: '',
    description: '',
    deadline: '',
    deadlineTime: '',
    priority: 'medium',
    category: null,
    subtasks: [],
    subtaskInput: '',
    eventDate: '',
    eventTime: '',
    eventEndTime: '',
    location: '',
    recurring: false,
    recurrenceType: 'weekly',
    habitDays: [],
    frequency: 'daily',
    monthlyDays: '',
    habitTime: '',
    projectStatus: 'not_started',
    roadmapSteps: [],
    roadmapInput: '',
    birthdayName: '',
    birthDate: '',
    hasParty: false,
    partyDate: '',
    partyTime: ''
  }

  const addSubtask = () => {
    if (!formData.subtaskInput.trim()) return
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: Date.now(), text: formData.subtaskInput, completed: false }],
      subtaskInput: ''
    }))
  }

  const toggleSubtask = (id) => {
    setFormData(prev => {
      const updated = prev.subtasks.map(st => 
        st.id === id ? { ...st, completed: !st.completed } : st
      )
      return { ...prev, subtasks: updated }
    })
  }

  const removeSubtask = (id) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== id)
    }))
  }

  const handleSubtaskKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSubtask()
    }
  }

  const [formData, setFormData] = useState(emptyFormData)
  const [openDropdowns, setOpenDropdowns] = useState({ category: false, priority: false, frequency: false, status: false })

  const toggleDropdown = (name) => {
    setOpenDropdowns(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const closeDropdowns = () => {
    setOpenDropdowns({ category: false, priority: false, frequency: false, status: false })
  }

  // ===== ROADMAP STEPS (proyecto) =====
  const addRoadmapStep = () => {
    if (!formData.roadmapInput?.trim()) return
    setFormData(prev => ({
      ...prev,
      roadmapSteps: [...prev.roadmapSteps, { id: Date.now(), text: prev.roadmapInput, completed: false }],
      roadmapInput: ''
    }))
  }

  const toggleRoadmapStep = (id) => {
    setFormData(prev => ({
      ...prev,
      roadmapSteps: prev.roadmapSteps.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    }))
  }

  const removeRoadmapStep = (id) => {
    setFormData(prev => ({
      ...prev,
      roadmapSteps: prev.roadmapSteps.filter(s => s.id !== id)
    }))
  }

  const handleRoadmapKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addRoadmapStep()
    }
  }

  const buildFormDataFromEntry = (entry) => {
    if (!entry) return emptyFormData

    return {
      ...emptyFormData,
      scope: entry.scope || '',
      module: entry.module || '',
      type: entry.type || preselectedType || '',
      title: entry.title || '',
      description: entry.metadata?.description || '',
      deadline: entry.deadline || '',
      deadlineTime: entry.metadata?.deadlineTime || '',
      priority: entry.priority || 'medium',
      category: entry.metadata?.category || null,
      subtasks: entry.metadata?.subtasks || [],
      eventDate: entry.date || '',
      eventTime: entry.metadata?.startTime || '',
      eventEndTime: entry.metadata?.endTime || '',
      location: entry.metadata?.location || '',
      recurring: !!entry.metadata?.recurring,
      recurrenceType: entry.metadata?.recurrenceType || 'weekly',
      habitDays: entry.metadata?.habitDays || [],
      frequency: entry.metadata?.frequency || 'daily',
      monthlyDays: Array.isArray(entry.metadata?.monthlyDays)
        ? entry.metadata.monthlyDays.join(', ')
        : (entry.metadata?.monthlyDays || ''),
      habitTime: entry.time || entry.metadata?.time || '',
      projectStatus: entry.metadata?.projectStatus || 'not_started',
      roadmapSteps: entry.metadata?.roadmapSteps || [],
      birthdayName: entry.metadata?.birthdayPerson || '',
      birthDate: entry.metadata?.birthDate || '',
      hasParty: !!entry.metadata?.isBirthdayParty,
      partyDate: entry.metadata?.partyDate || '',
      partyTime: entry.metadata?.startTime || ''
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (editEntry) {
        setFormData(buildFormDataFromEntry(editEntry))
      } else if (prefillData) {
        setFormData(buildFormDataFromEntry(prefillData))
      } else {
        setFormData({
          ...emptyFormData,
          type: preselectedType || (MODULE_CONFIG[preselectedModule]?.isBirthday ? 'event' : 'task'),
          ...(preselectedModule ? { module: preselectedModule } : {}),
          ...(preselectedCategory ? { category: preselectedCategory } : {})
        })
      }
      setIsSubmitting(false)
    }
  }, [isOpen, preselectedType, preselectedModule, preselectedCategory, editEntry, prefillData])

  // ===== HANDLERS =====
  const updateField = (field, value) => {
    setFormData(prev => {
      const updates = { [field]: value };

      // LÓGICA DE CASCADA: Si cambia el ámbito (scope), selecciona el primer módulo
      if (field === 'scope') {
        const firstModuleOfScope = SCOPE_MODULES[value][0];
        updates.module = firstModuleOfScope;
        if (MODULE_CONFIG[firstModuleOfScope]?.isBirthday) {
          updates.type = 'event';
        }
      }

      // Si cambia el módulo manualmente, conservamos el tipo seleccionado,
      // excepto cuando el nuevo módulo es de cumpleaños, el cual debe ser evento.
      if (field === 'module') {
        const moduleConfig = MODULE_CONFIG[value] || {};
        if (moduleConfig.isBirthday) {
          updates.type = 'event';
        }
      }

      return { ...prev, ...updates };
    });
  };

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
      { value: 'task', label: 'Tarea', icon: 'CheckSquare' },
      { value: 'event', label: 'Evento', icon: 'Calendar' }
    ]

    if (canSelectHabit) {
      types.push({ value: 'habit', label: 'Hábito', icon: 'RefreshCw' })
    }

    types.push({ value: 'project', label: 'Proyecto', icon: 'Rocket' })

    return types
  }

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      // Determina si hay subtareas y si están todas completadas
      const hasSubtasks = formData.subtasks && formData.subtasks.length > 0
      const allSubtasksCompleted = hasSubtasks && formData.subtasks.every(st => st.completed)

      // Roadmap del proyecto
      const hasRoadmap = formData.roadmapSteps && formData.roadmapSteps.length > 0
      const projectCompletion = hasRoadmap
        ? Math.round((formData.roadmapSteps.filter(s => s.completed).length / formData.roadmapSteps.length) * 100)
        : 0

      if (editEntry) {
        const updates = {
          type: formData.type,
          title: formData.title,
          scope: formData.scope,
          module: formData.module,
          priority: formData.priority,
          completed: (formData.type === 'task' && allSubtasksCompleted) || (formData.type === 'project' && projectCompletion === 100),
          metadata: {
            ...editEntry.metadata,
            description: formData.description,
            category: formData.category,
            subtasks: formData.type === 'task' ? (formData.subtasks || []) : [],
            hasSubtaskSync: hasSubtasks
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
          updates.time = formData.habitTime || ''
          updates.submodule = formData.category || ''
          updates.metadata = {
            ...updates.metadata,
            time: formData.habitTime || '',
            submodule: formData.category || '',
            frequency: formData.frequency,
            habitDays: (formData.frequency === 'weekly' || formData.frequency === 'multiple') ? formData.habitDays : [],
            monthlyDays: formData.frequency === 'monthly' ? parseMonthlyDays(formData.monthlyDays) : [],
            recurring: true,
            recurrenceType: formData.frequency
          }
        } else if (formData.type === 'project') {
          updates.deadline = formData.deadline ? new Date(formData.deadline + 'T12:00:00').toISOString().split('T')[0] : ''
          updates.metadata = {
            ...updates.metadata,
            projectStatus: formData.projectStatus,
            roadmapSteps: formData.roadmapSteps,
            completionPercentage: projectCompletion
          }
        }

        await actions.updateEntry(editEntry.id, updates)
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
            date: new Date(formData.birthDate + 'T12:00:00').toISOString().split('T')[0],
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
              date: new Date(formData.partyDate + 'T12:00:00').toISOString().split('T')[0],
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
            completed: (formData.type === 'task' && allSubtasksCompleted) || (formData.type === 'project' && projectCompletion === 100),
            metadata: {
              category: formData.category
            }
          }

          if (formData.type === 'task') {
            basePayload.deadline = formData.deadline ? new Date(formData.deadline + 'T12:00:00').toISOString().split('T')[0] : ''
            basePayload.metadata = {
              ...basePayload.metadata,
              deadlineTime: formData.deadlineTime,
              description: formData.description,
              subtasks: formData.subtasks || [],
              hasSubtaskSync: hasSubtasks
            }
          } else if (formData.type === 'event') {
            basePayload.date = formData.eventDate ? new Date(formData.eventDate + 'T12:00:00').toISOString().split('T')[0] : ''
            basePayload.metadata = {
              ...basePayload.metadata,
              startTime: formData.eventTime,
              endTime: formData.eventEndTime,
              location: formData.location,
              recurring: formData.recurring,
              recurrenceType: formData.recurrenceType,
              description: formData.description
            }
          } else if (formData.type === 'habit') {
            basePayload.time = formData.habitTime || ''
            basePayload.submodule = formData.category || ''
            basePayload.metadata = {
              ...basePayload.metadata,
              time: formData.habitTime || '',
              submodule: formData.category || '',
              frequency: formData.frequency,
              habitDays: (formData.frequency === 'weekly' || formData.frequency === 'multiple') ? formData.habitDays : [],
              monthlyDays: formData.frequency === 'monthly' ? parseMonthlyDays(formData.monthlyDays) : [],
              recurring: true,
              recurrenceType: formData.frequency,
              description: formData.description
            }
          } else if (formData.type === 'project') {
            basePayload.deadline = formData.deadline ? new Date(formData.deadline + 'T12:00:00').toISOString().split('T')[0] : ''
            basePayload.status = formData.projectStatus
            basePayload.metadata = {
              ...basePayload.metadata,
              projectStatus: formData.projectStatus,
              roadmapSteps: formData.roadmapSteps,
              completionPercentage: projectCompletion,
              description: formData.description
            }
          }

          payloads.push(basePayload)
        }

        console.log('[GlobalAddModal] Payloads to save:', payloads)
        for (const payload of payloads) {
          const id = await actions.addEntry(payload)
          console.log('[GlobalAddModal] addEntry returned id:', id, 'for payload:', payload)
          if (!id) {
            throw new Error('addEntry returned null — Firebase rejected the write. Revisa las reglas de Firestore o la consola.')
          }
        }
      }

      onClose()
    } catch (error) {
      console.error('[GlobalAddModal] Error al guardar:', error)
      alert('Error al guardar: ' + (error?.message || error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editEntry) return
    if (!confirm('¿Estás seguro de que quieres eliminar esta entrada?')) return

    try {
      await actions.deleteEntry(editEntry.id)
      onClose()
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar. Por favor intenta de nuevo.')
    }
  }

  if (!isOpen) return null

  const selectedTypeConfig = TYPE_CONFIG[formData.type] || {}

  // ===== % completado del proyecto (basado en roadmap) =====
  const completionPercentage = formData.roadmapSteps?.length > 0
    ? Math.round((formData.roadmapSteps.filter(s => s.completed).length / formData.roadmapSteps.length) * 100)
    : 0

  // ===== HELPERS DE DROPDOWN (reutilizables en task/event/habit/project) =====
  const renderCategoryDropdown = () => (
    <div className="gam-dropdown-wrapper">
      <button
        type="button"
        className="gam-dropdown-trigger gam-dropdown-category gam-dropdown-icon-only"
        onClick={(e) => { e.stopPropagation(); toggleDropdown('category') }}
        title={formData.category
          ? currentModuleConfig.submodules?.find(s => s.id === formData.category)?.label
          : 'Categoría'}
      >
        <span className="gam-dropdown-icon">
          {formData.category ? (
            <IconRenderer icon={currentModuleConfig.submodules?.find(s => s.id === formData.category)?.icon} size={16} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          )}
        </span>
      </button>
      {openDropdowns.category && (
        <div className="gam-dropdown-menu gam-dropdown-menu-category" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="gam-dropdown-item" onClick={() => { updateField('category', null); closeDropdowns() }}>
            Sin categoría
          </button>
          {currentModuleConfig.submodules?.map(submodule => (
            <button
              key={submodule.id}
              type="button"
              className={`gam-dropdown-item ${formData.category === submodule.id ? 'active' : ''}`}
              onClick={() => { updateField('category', submodule.id); closeDropdowns() }}
            >
              <span className="gam-dropdown-item-icon">
                <IconRenderer icon={submodule.icon} size={16} />
              </span>
              <span className="gam-dropdown-item-text">{submodule.label}</span>
              {formData.category === submodule.id && <span className="gam-dropdown-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const renderPriorityDropdown = () => (
    <div className="gam-dropdown-wrapper">
      <button
        type="button"
        className="gam-dropdown-trigger gam-dropdown-priority gam-dropdown-icon-only"
        onClick={(e) => { e.stopPropagation(); toggleDropdown('priority') }}
        style={{ '--priority-color': PRIORITY_CONFIG[formData.priority]?.color }}
        title={`Prioridad: ${PRIORITY_CONFIG[formData.priority]?.label}`}
      >
        <span className="gam-dropdown-icon gam-priority-icon">
          <span className="gam-priority-ring" style={{ borderColor: PRIORITY_CONFIG[formData.priority]?.color }}></span>
        </span>
      </button>
      {openDropdowns.priority && (
        <div className="gam-dropdown-menu gam-dropdown-menu-priority" onClick={(e) => e.stopPropagation()}>
          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              type="button"
              className={`gam-dropdown-item ${formData.priority === key ? 'active' : ''}`}
              onClick={() => { updateField('priority', key); closeDropdowns() }}
            >
              <span className="gam-dropdown-item-icon">
                <span className="gam-priority-ring" style={{ borderColor: config.color }}></span>
              </span>
              <span className="gam-dropdown-item-text">{config.label}</span>
              {formData.priority === key && <span className="gam-dropdown-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const renderStatusDropdown = () => {
    const current = PROJECT_STATUS[formData.projectStatus] || PROJECT_STATUS.not_started
    return (
      <div className="gam-dropdown-wrapper">
        <button
          type="button"
          className="gam-dropdown-trigger gam-dropdown-status gam-dropdown-icon-only"
          onClick={(e) => { e.stopPropagation(); toggleDropdown('status') }}
          title={`Estado: ${current.label}`}
        >
          <span className="gam-dropdown-icon">
            <span className="gam-status-dot" style={{ backgroundColor: current.color }}></span>
          </span>
        </button>
        {openDropdowns.status && (
          <div className="gam-dropdown-menu gam-dropdown-menu-priority" onClick={(e) => e.stopPropagation()}>
            {Object.entries(PROJECT_STATUS).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                className={`gam-dropdown-item ${formData.projectStatus === key ? 'active' : ''}`}
                onClick={() => { updateField('projectStatus', key); closeDropdowns() }}
              >
                <span className="gam-dropdown-item-icon">
                  <span className="gam-status-dot" style={{ backgroundColor: cfg.color }}></span>
                </span>
                <span className="gam-dropdown-item-text">{cfg.label}</span>
                {formData.projectStatus === key && <span className="gam-dropdown-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderFrequencyDropdown = ({ iconOnly = false } = {}) => (
    <div className={`gam-dropdown-wrapper ${iconOnly ? '' : 'gam-dropdown-wrapper-wide'}`}>
      <button
        type="button"
        className={`gam-dropdown-trigger gam-dropdown-frequency ${iconOnly ? 'gam-dropdown-icon-only' : ''}`}
        onClick={(e) => { e.stopPropagation(); toggleDropdown('frequency') }}
        title={iconOnly ? `Frecuencia: ${FREQUENCY_CONFIG[formData.frequency]?.label}` : undefined}
      >
        <span className="gam-dropdown-icon">
          <IconRenderer icon={FREQUENCY_CONFIG[formData.frequency]?.icon} size={16} />
        </span>
        {!iconOnly && <span className="gam-dropdown-text">{FREQUENCY_CONFIG[formData.frequency]?.label}</span>}
        {!iconOnly && <span className="gam-dropdown-arrow">▾</span>}
      </button>
      {openDropdowns.frequency && (
        <div className="gam-dropdown-menu" onClick={(e) => e.stopPropagation()}>
          {Object.entries(FREQUENCY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              type="button"
              className={`gam-dropdown-item ${formData.frequency === key ? 'active' : ''}`}
              onClick={() => { updateField('frequency', key); closeDropdowns() }}
            >
              <span className="gam-dropdown-item-icon">
                <IconRenderer icon={config.icon} size={16} />
              </span>
              <span className="gam-dropdown-item-text">{config.label}</span>
              {formData.frequency === key && <span className="gam-dropdown-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )

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
                  <span className="gam-scope-icon">
                    <IconRenderer icon={config.icon} size={18} />
                  </span>
                  <span className="gam-scope-label">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Columna Derecha - Contenido */}
          <div className="gam-col-right" style={{ '--accent': selectedTypeConfig.color }}>
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
                                <IconRenderer icon={config.icon} size={24} />
                              </div>
                              <span className="gam-module-label">{config.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Pestañas - Pill buttons flotantes */}
          {canSelectType && (
            <div className="gam-type-pills">
              {getAvailableTypes().map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`gam-type-pill ${formData.type === type.value ? 'active' : ''}`}
                  onClick={() => updateField('type', type.value)}
                >
                  <span className="gam-pill-icon">
                    <IconRenderer icon={type.icon} size={16} />
                  </span>
                  <span className="gam-pill-label">{type.label}</span>
                </button>
              ))}
            </div>
          )}

    {/* Contenedor del Formulario */}
    <div className="gam-form-container">
      {formData.type && (
        <div
          className="gam-form-card"
          style={{
            '--accent': selectedTypeConfig.color,
            '--scope-glow': SCOPE_LABELS[formData.scope]?.glow || 'rgba(139, 92, 246, 0.25)'
          }}
        >

          {/* Formulario dinámico */}
                  {/* Campos comunes */}
                  <div className="gam-form-grid">
                    {isBirthdayModule && (
                      <div className="gam-form-field gam-form-field-full">
                        <input
                          type="text"
                          className="gam-form-input"
                          value={formData.birthdayName}
                          onChange={(e) => updateField('birthdayName', e.target.value)}
                          placeholder="Nombre de la persona..."
                          required
                        />
                      </div>
                    )}

                    {/* SECCIÓN TAREA - Alta Densidad */}
                    {formData.type === 'task' && !isBirthdayModule && (
                      <div className="gam-task-section" onClick={closeDropdowns}>
                        {/* Fila de Cabecera Triple (Ultra-Compacta) */}
                        <div className="gam-task-header-row">
                          {/* Título - Principal */}
                          <input
                            type="text"
                            className="gam-task-title-input"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="Título de la tarea..."
                            required
                          />

                          {/* Categoría - Dropdown (solo icono) */}
                          <div className="gam-dropdown-wrapper">
                            <button
                              type="button"
                              className="gam-dropdown-trigger gam-dropdown-category gam-dropdown-icon-only"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDropdown('category')
                              }}
                              title={
                                formData.category
                                  ? currentModuleConfig.submodules?.find(s => s.id === formData.category)?.label
                                  : 'Categoría'
                              }
                            >
                              <span className="gam-dropdown-icon">
                                {formData.category ? (
                                  <IconRenderer icon={currentModuleConfig.submodules?.find(s => s.id === formData.category)?.icon} size={16} />
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                                  </svg>
                                )}
                              </span>
                            </button>

                            {openDropdowns.category && (
                              <div className="gam-dropdown-menu gam-dropdown-menu-category" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className="gam-dropdown-item"
                                  onClick={() => {
                                    updateField('category', null)
                                    closeDropdowns()
                                  }}
                                >
                                  Sin categoría
                                </button>
                                {currentModuleConfig.submodules?.map(submodule => (
                                  <button
                                    key={submodule.id}
                                    type="button"
                                    className={`gam-dropdown-item ${formData.category === submodule.id ? 'active' : ''}`}
                                    onClick={() => {
                                      updateField('category', submodule.id)
                                      closeDropdowns()
                                    }}
                                  >
                                    <span className="gam-dropdown-item-icon">
                                      <IconRenderer icon={submodule.icon} size={16} />
                                    </span>
                                    <span className="gam-dropdown-item-text">{submodule.label}</span>
                                    {formData.category === submodule.id && <span className="gam-dropdown-check">✓</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Prioridad - Dropdown (solo icono) */}
                          <div className="gam-dropdown-wrapper">
                            <button
                              type="button"
                              className="gam-dropdown-trigger gam-dropdown-priority gam-dropdown-icon-only"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDropdown('priority')
                              }}
                              style={{ '--priority-color': PRIORITY_CONFIG[formData.priority]?.color }}
                              title={`Prioridad: ${PRIORITY_CONFIG[formData.priority]?.label}`}
                            >
                              <span className="gam-dropdown-icon gam-priority-icon">
                                <span className="gam-priority-ring" style={{ borderColor: PRIORITY_CONFIG[formData.priority]?.color }}></span>
                              </span>
                            </button>

                            {openDropdowns.priority && (
                              <div className="gam-dropdown-menu gam-dropdown-menu-priority" onClick={(e) => e.stopPropagation()}>
                                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    className={`gam-dropdown-item ${formData.priority === key ? 'active' : ''}`}
                                    onClick={() => {
                                      updateField('priority', key)
                                      closeDropdowns()
                                    }}
                                  >
                                    <span className="gam-dropdown-item-icon">
                                      <span className="gam-priority-ring" style={{ borderColor: config.color }}></span>
                                    </span>
                                    <span className="gam-dropdown-item-text">{config.label}</span>
                                    {formData.priority === key && <span className="gam-dropdown-check">✓</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Fila de Tiempos - Compacta */}
                        <div className="gam-task-times-row">
                          <div className="gam-task-time-field">
                            <input
                              type="date"
                              className="gam-task-date-input"
                              value={formData.deadline}
                              onChange={(e) => updateField('deadline', e.target.value)}
                              required
                            />
                          </div>
                          <div className="gam-task-time-field">
                            <input
                              type="time"
                              className="gam-task-time-input"
                              value={formData.deadlineTime}
                              onChange={(e) => updateField('deadlineTime', e.target.value)}
                              placeholder="Hora"
                            />
                          </div>
                        </div>

                        {/* Cuerpo en Dos Columnas */}
                        <div className="gam-task-body">
                          {/* Columna Izquierda - Notas */}
                          <div className="gam-task-col gam-task-col-notes">
                            <textarea
                              className="gam-task-notes-textarea"
                              value={formData.description}
                              onChange={(e) => updateField('description', e.target.value)}
                              placeholder="Añade notas o detalles..."
                            />
                          </div>

                          {/* Columna Derecha - Subtareas */}
                          <div className="gam-task-col gam-task-col-subtasks">
                            <div className="gam-subtasks-compact">
                              <div className="gam-subtask-input-wrapper">
                                <input
                                  type="text"
                                  className="gam-subtask-input"
                                  value={formData.subtaskInput}
                                  onChange={(e) => updateField('subtaskInput', e.target.value)}
                                  onKeyPress={handleSubtaskKeyPress}
                                  placeholder="Nueva subtarea..."
                                />
                                <button
                                  type="button"
                                  className="gam-subtask-add-btn"
                                  onClick={addSubtask}
                                  title="Añadir"
                                >
                                  +
                                </button>
                              </div>

                              {formData.subtasks.length > 0 && (
                                <div className="gam-subtasks-list-compact">
                                  {formData.subtasks.map(subtask => (
                                    <div key={subtask.id} className="gam-subtask-item-compact">
                                      <input
                                        type="checkbox"
                                        className="gam-subtask-checkbox"
                                        checked={subtask.completed}
                                        onChange={() => toggleSubtask(subtask.id)}
                                      />
                                      <span className={`gam-subtask-text-compact ${subtask.completed ? 'completed' : ''}`}>
                                        {subtask.text}
                                      </span>
                                      <button
                                        type="button"
                                        className="gam-subtask-remove-compact"
                                        onClick={() => removeSubtask(subtask.id)}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ===== SECCIÓN EVENTO - Split View ===== */}
                    {formData.type === 'event' && !isBirthdayModule && (
                      <div className="gam-task-section gam-form-field-full" onClick={closeDropdowns}>
                        {/* Cabecera: Título + Categoría + Prioridad */}
                        <div className="gam-task-header-row">
                          <input
                            type="text"
                            className="gam-task-title-input"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="Título del evento..."
                            required
                          />
                          {renderCategoryDropdown()}
                          {renderPriorityDropdown()}
                        </div>

                        {/* Fila Tiempos: Fecha + Inicio + Fin */}
                        <div className="gam-task-times-row">
                          <div className="gam-task-time-field">
                            <input
                              type="date"
                              className="gam-task-date-input"
                              value={formData.eventDate}
                              onChange={(e) => updateField('eventDate', e.target.value)}
                              required
                            />
                          </div>
                          <div className="gam-task-time-field">
                            <input
                              type="time"
                              className="gam-task-time-input"
                              value={formData.eventTime}
                              onChange={(e) => updateField('eventTime', e.target.value)}
                              placeholder="Inicio"
                            />
                          </div>
                          <div className="gam-task-time-field">
                            <input
                              type="time"
                              className="gam-task-time-input"
                              value={formData.eventEndTime}
                              onChange={(e) => updateField('eventEndTime', e.target.value)}
                              placeholder="Fin"
                            />
                          </div>
                        </div>

                        {/* Split View: Notas | Ubicación */}
                        <div className="gam-task-body">
                          <div className="gam-task-col gam-task-col-notes">
                            <textarea
                              className="gam-task-notes-textarea"
                              value={formData.description}
                              onChange={(e) => updateField('description', e.target.value)}
                              placeholder="Añade notas o detalles..."
                            />
                          </div>
                          <div className="gam-task-col gam-task-col-location">
                            <div className="gam-location-field">
                              <span className="gam-location-icon" aria-hidden>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                              </span>
                              <input
                                type="text"
                                className="gam-location-input"
                                value={formData.location}
                                onChange={(e) => updateField('location', e.target.value)}
                                placeholder="Ubicación o enlace..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ===== SECCIÓN HÁBITO - 3 filas: header / dynamic / textarea ===== */}
                    {formData.type === 'habit' && !isBirthdayModule && (
                      <div className="gam-task-section gam-form-field-full" onClick={closeDropdowns}>
                        {/* Fila 1: Título + Categoría + Frecuencia (icon-only) */}
                        <div className="gam-task-header-row">
                          <input
                            type="text"
                            className="gam-task-title-input"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="Título del hábito..."
                            required
                          />
                          {renderCategoryDropdown()}
                          {renderFrequencyDropdown({ iconOnly: true })}
                        </div>

                        {/* Fila 1b: Hora de ejecución (HH:MM) */}
                        <div className="gam-task-times-row">
                          <div className="gam-task-time-field gam-habit-time-field">
                            <label className="gam-habit-time-label">⏱ Hora</label>
                            <input
                              type="time"
                              className="gam-task-date-input"
                              value={formData.habitTime}
                              onChange={(e) => updateField('habitTime', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* Fila 2: Selector dinámico full-width */}
                        <div className="gam-habit-dynamic-row">
                          {formData.frequency === 'daily' && (
                            <div className="gam-frequency-info gam-frequency-info-wide">
                              <span className="gam-freq-icon">✦</span>
                              <span>Se repite cada día</span>
                            </div>
                          )}
                          {(formData.frequency === 'weekly' || formData.frequency === 'multiple') && (
                            <div className="gam-habit-days gam-habit-days-wide">
                              {WEEK_DAYS.map(day => (
                                <button
                                  key={day.value}
                                  type="button"
                                  className={`gam-habit-day ${formData.habitDays.includes(day.value) ? 'active' : ''}`}
                                  onClick={() => {
                                    if (formData.frequency === 'weekly') {
                                      setFormData(prev => ({ ...prev, habitDays: [day.value] }))
                                    } else {
                                      toggleHabitDay(day.value)
                                    }
                                  }}
                                >
                                  {day.label}
                                </button>
                              ))}
                            </div>
                          )}
                          {formData.frequency === 'monthly' && (
                            <input
                              type="text"
                              className="gam-monthly-input gam-monthly-input-wide"
                              value={formData.monthlyDays}
                              onChange={(e) => updateField('monthlyDays', e.target.value)}
                              placeholder="¿Qué día(s) del mes? Ej: 1, 15, 28"
                            />
                          )}
                        </div>

                        {/* Fila 3: Descripción / meta */}
                        <div className="gam-task-body gam-habit-body">
                          <textarea
                            className="gam-task-notes-textarea gam-habit-notes"
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Descripción o meta del hábito..."
                          />
                        </div>
                      </div>
                    )}

                    {/* ===== SECCIÓN PROYECTO - Cabecera triple + Roadmap ===== */}
                    {formData.type === 'project' && !isBirthdayModule && (
                      <div className="gam-task-section gam-form-field-full" onClick={closeDropdowns}>
                        {/* Cabecera Triple: Título + Categoría + Status */}
                        <div className="gam-task-header-row">
                          <input
                            type="text"
                            className="gam-task-title-input"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="Título del proyecto..."
                            required
                          />
                          {renderCategoryDropdown()}
                          {renderStatusDropdown()}
                        </div>

                        {/* Fila Meta: Fecha límite + Barra de Progreso */}
                        <div className="gam-task-times-row">
                          <div className="gam-task-time-field">
                            <input
                              type="date"
                              className="gam-task-date-input"
                              value={formData.deadline}
                              onChange={(e) => updateField('deadline', e.target.value)}
                              placeholder="Fecha límite"
                            />
                          </div>
                          <div className="gam-task-time-field gam-progress-cell">
                            <div className="gam-progress-display">
                              <div className="gam-progress-bar">
                                <div className="gam-progress-fill" style={{ width: `${completionPercentage}%` }}></div>
                              </div>
                              <span className="gam-progress-value">{completionPercentage}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Split View: Meta | Roadmap */}
                        <div className="gam-task-body">
                          <div className="gam-task-col gam-task-col-notes">
                            <textarea
                              className="gam-task-notes-textarea"
                              value={formData.description}
                              onChange={(e) => updateField('description', e.target.value)}
                              placeholder="Meta u objetivo del proyecto..."
                            />
                          </div>
                          <div className="gam-task-col gam-task-col-subtasks">
                            <div className="gam-subtasks-compact">
                              <div className="gam-subtask-input-wrapper">
                                <input
                                  type="text"
                                  className="gam-subtask-input"
                                  value={formData.roadmapInput}
                                  onChange={(e) => updateField('roadmapInput', e.target.value)}
                                  onKeyPress={handleRoadmapKeyPress}
                                  placeholder="Nuevo paso..."
                                />
                                <button
                                  type="button"
                                  className="gam-subtask-add-btn"
                                  onClick={addRoadmapStep}
                                  title="Añadir paso"
                                >+</button>
                              </div>
                              {formData.roadmapSteps.length > 0 && (
                                <div className="gam-subtasks-list-compact">
                                  {formData.roadmapSteps.map(step => (
                                    <div key={step.id} className="gam-subtask-item-compact">
                                      <input
                                        type="checkbox"
                                        className="gam-subtask-checkbox"
                                        checked={step.completed}
                                        onChange={() => toggleRoadmapStep(step.id)}
                                      />
                                      <span className={`gam-subtask-text-compact ${step.completed ? 'completed' : ''}`}>
                                        {step.text}
                                      </span>
                                      <button
                                        type="button"
                                        className="gam-subtask-remove-compact"
                                        onClick={() => removeRoadmapStep(step.id)}
                                      >✕</button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Wizard Cumpleaños */}
                    {isBirthdayModule && (
                      <>
                        <div className="gam-form-field">
                          <input
                            type="date"
                            className="gam-form-input"
                            value={formData.birthDate}
                            onChange={(e) => updateField('birthDate', e.target.value)}
                            required
                            placeholder="Fecha de nacimiento"
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
                              <input
                                type="date"
                                className="gam-form-input"
                                value={formData.partyDate}
                                onChange={(e) => updateField('partyDate', e.target.value)}
                                required={formData.hasParty}
                                placeholder="Fecha de la fiesta"
                              />
                            </div>
                            <div className="gam-form-field">
                              <input
                                type="time"
                                className="gam-form-input"
                                value={formData.partyTime}
                                onChange={(e) => updateField('partyTime', e.target.value)}
                                placeholder="Hora de la fiesta"
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* (Todos los tipos tienen su propio split-view con notas integradas) */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="gam-footer">
          {editEntry && (
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
              {isSubmitting ? 'Guardando...' : (editEntry ? 'Guardar Cambios' : 'Crear')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalAddModal
