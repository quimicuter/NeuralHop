import React, { useEffect, useMemo, useState } from 'react'
import './TecnoGirl.css'

const STORAGE_KEY = 'tecno-girl-local-db'

const initialHubData = [
  {
    id: 1,
    kind: 'course',
    title: 'Tecnolochicas',
    description: 'Curso de tecnología creativa para chicas con enfoque práctico en productos digitales.',
    status: 'active',
    steps: [
      { id: 1, title: 'Definir plan de clases', status: 'todo' },
      { id: 2, title: 'Construir recursos visuales', status: 'in-progress' },
      { id: 3, title: 'Publicar módulo introductorio', status: 'completed' }
    ]
  },
  {
    id: 2,
    kind: 'project',
    title: 'NeuralHop',
    description: 'Plataforma modular para gestionar ideas, prototipos y lanzamientos tecnológicos.',
    status: 'active',
    steps: [
      { id: 1, title: 'Mapear objetivos del MVP', status: 'todo' },
      { id: 2, title: 'Crear tablero técnico', status: 'in-progress' },
      { id: 3, title: 'Revisar integración IA', status: 'todo' }
    ]
  }
]

function TecnoGirlHub({ isOpen, onClose }) {
  const [hubData, setHubData] = useState([])
  const [quickCapture, setQuickCapture] = useState({ kind: 'project', title: '', description: '' })
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [editEntry, setEditEntry] = useState({ title: '', description: '', kind: 'project', status: 'active' })
  const [newStepTitle, setNewStepTitle] = useState('')
  const [activeParentId, setActiveParentId] = useState(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setHubData(JSON.parse(stored))
        return
      } catch (error) {
        console.warn('Tecno Girl DB load failed:', error)
      }
    }
    setHubData(initialHubData)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hubData))
  }, [hubData])

  const nextId = () => {
    return hubData.reduce((max, entry) => Math.max(max, entry.id), 0) + 1
  }

  const nextStepId = (entry) => {
    return entry.steps.reduce((max, step) => Math.max(max, step.id), 0) + 1
  }

  const saveQuickCapture = () => {
    if (!quickCapture.title.trim()) return
    const newEntry = {
      id: nextId(),
      kind: quickCapture.kind,
      title: quickCapture.title.trim(),
      description: quickCapture.description.trim(),
      status: 'active',
      steps: []
    }
    setHubData(prev => [newEntry, ...prev])
    setQuickCapture({ kind: quickCapture.kind, title: '', description: '' })
  }

  const startEdit = (entry) => {
    setEditingEntryId(entry.id)
    setEditEntry({
      title: entry.title,
      description: entry.description,
      kind: entry.kind,
      status: entry.status
    })
  }

  const saveEdit = () => {
    setHubData(prev => prev.map(entry => {
      if (entry.id !== editingEntryId) return entry
      return {
        ...entry,
        title: editEntry.title,
        description: editEntry.description,
        kind: editEntry.kind,
        status: editEntry.status
      }
    }))
    setEditingEntryId(null)
  }

  const deleteEntry = (entryId) => {
    setHubData(prev => prev.filter(entry => entry.id !== entryId))
  }

  const addStep = (entryId) => {
    if (!newStepTitle.trim()) return
    setHubData(prev => prev.map(entry => {
      if (entry.id !== entryId) return entry
      return {
        ...entry,
        steps: [...entry.steps, { id: nextStepId(entry), title: newStepTitle.trim(), status: 'todo' }]
      }
    }))
    setNewStepTitle('')
    setActiveParentId(entryId)
  }

  const toggleStepStatus = (entryId, stepId) => {
    setHubData(prev => prev.map(entry => {
      if (entry.id !== entryId) return entry
      return {
        ...entry,
        steps: entry.steps.map(step => step.id === stepId
          ? { ...step, status: step.status === 'todo' ? 'in-progress' : step.status === 'in-progress' ? 'completed' : 'completed' }
          : step
        )
      }
    }))
  }

  const updateStepTitle = (entryId, stepId, title) => {
    setHubData(prev => prev.map(entry => {
      if (entry.id !== entryId) return entry
      return {
        ...entry,
        steps: entry.steps.map(step => step.id === stepId ? { ...step, title } : step)
      }
    }))
  }

  const removeStep = (entryId, stepId) => {
    setHubData(prev => prev.map(entry => {
      if (entry.id !== entryId) return entry
      return {
        ...entry,
        steps: entry.steps.filter(step => step.id !== stepId)
      }
    }))
  }

  const courses = useMemo(() => hubData.filter(entry => entry.kind === 'course'), [hubData])
  const projects = useMemo(() => hubData.filter(entry => entry.kind === 'project'), [hubData])
  const allSteps = useMemo(() => hubData.flatMap(entry => entry.steps.map(step => ({ ...step, parentId: entry.id, parentTitle: entry.title }))), [hubData])
  const todoSteps = allSteps.filter(step => step.status === 'todo')
  const inProgressSteps = allSteps.filter(step => step.status === 'in-progress')
  const completedSteps = allSteps.filter(step => step.status === 'completed')

  if (!isOpen) return null

  return (
    <div className="tecno-girl-hub-overlay" onClick={onClose}>
      <div className="tecno-girl-hub" onClick={(e) => e.stopPropagation()}>
        <div className="tecno-girl-header">
          <div>
            <div className="tech-label">💻 Tecno Girl</div>
            <h2>Hub Modular</h2>
            <p>Espacio de proyectos, cursos y pasos técnicos con base de datos local independiente.</p>
          </div>
          <button className="close-hub-btn" onClick={onClose}>×</button>
        </div>

        <div className="tecno-girl-grid">
          <section className="glass-panel quick-capture-card">
            <h3>Quick Capture</h3>
            <p>Anota ideas desde el celular y vincúlalas a un proyecto o curso.</p>
            <div className="field-group">
              <label>Tipo</label>
              <select
                value={quickCapture.kind}
                onChange={(e) => setQuickCapture(prev => ({ ...prev, kind: e.target.value }))}
              >
                <option value="project">Proyecto</option>
                <option value="course">Curso</option>
              </select>
            </div>
            <div className="field-group">
              <label>Título</label>
              <input
                type="text"
                value={quickCapture.title}
                onChange={(e) => setQuickCapture(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Describe la idea..."
              />
            </div>
            <div className="field-group">
              <label>Descripción</label>
              <textarea
                value={quickCapture.description}
                onChange={(e) => setQuickCapture(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Añade contexto rápido..."
              />
            </div>
            <button className="primary-btn" onClick={saveQuickCapture}>Guardar entrada</button>
          </section>

          <section className="glass-panel project-card">
            <div className="section-header">
              <div>
                <h3>Proyectos y Cursos</h3>
                <p>Gestiona tu contenido técnico de forma separada al planner principal.</p>
              </div>
              <span className="status-pill">Independiente</span>
            </div>
            <div className="split-cards">
              <div className="item-list">
                <h4>Cursos</h4>
                {courses.length === 0 ? (
                  <p className="empty-message">No hay cursos aun.</p>
                ) : courses.map(entry => (
                  <article key={entry.id} className="item-card">
                    <div>
                      <strong>{entry.title}</strong>
                      <p>{entry.description}</p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => startEdit(entry)}>Editar</button>
                      <button className="danger" onClick={() => deleteEntry(entry.id)}>Eliminar</button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="item-list">
                <h4>Proyectos</h4>
                {projects.length === 0 ? (
                  <p className="empty-message">No hay proyectos aun.</p>
                ) : projects.map(entry => (
                  <article key={entry.id} className="item-card">
                    <div>
                      <strong>{entry.title}</strong>
                      <p>{entry.description}</p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => startEdit(entry)}>Editar</button>
                      <button className="danger" onClick={() => deleteEntry(entry.id)}>Eliminar</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            {editingEntryId && (
              <div className="edit-panel">
                <h4>Editar entrada</h4>
                <div className="field-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={editEntry.title}
                    onChange={(e) => setEditEntry(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="field-group">
                  <label>Descripción</label>
                  <textarea
                    value={editEntry.description}
                    onChange={(e) => setEditEntry(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Tipo</label>
                    <select
                      value={editEntry.kind}
                      onChange={(e) => setEditEntry(prev => ({ ...prev, kind: e.target.value }))}
                    >
                      <option value="project">Proyecto</option>
                      <option value="course">Curso</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Estado</label>
                    <select
                      value={editEntry.status}
                      onChange={(e) => setEditEntry(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="active">Activo</option>
                      <option value="paused">Pausado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                </div>
                <div className="edit-actions">
                  <button className="primary-btn" onClick={saveEdit}>Guardar cambios</button>
                  <button className="secondary-btn" onClick={() => setEditingEntryId(null)}>Cancelar</button>
                </div>
              </div>
            )}
          </section>

          <section className="glass-panel steps-card">
            <div className="section-header">
              <div>
                <h3>Vista de Pasos</h3>
                <p>Mini-kanban técnico para gestionar los estados internos de cada paso.</p>
              </div>
              <div className="step-parent-select">
                <label>Agregar paso a</label>
                <select value={activeParentId || (hubData[0]?.id || '')} onChange={(e) => setActiveParentId(Number(e.target.value))}>
                  {hubData.map(entry => (
                    <option key={entry.id} value={entry.id}>{entry.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="step-input-row">
              <input
                type="text"
                placeholder="Nueva tarea técnica..."
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
              />
              <button className="primary-btn" onClick={() => addStep(activeParentId || hubData[0]?.id)}>Agregar paso</button>
            </div>
            <div className="step-board">
              <div className="step-column">
                <h4>Por Hacer</h4>
                {todoSteps.map(step => (
                  <div key={`${step.parentId}-${step.id}`} className="step-card">
                    <div>
                      <span>{step.title}</span>
                      <small>{step.parentTitle}</small>
                    </div>
                    <div className="step-actions">
                      <button onClick={() => toggleStepStatus(step.parentId, step.id)}>▶</button>
                      <button className="danger" onClick={() => removeStep(step.parentId, step.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="step-column">
                <h4>En Progreso</h4>
                {inProgressSteps.map(step => (
                  <div key={`${step.parentId}-${step.id}`} className="step-card in-progress">
                    <div>
                      <span>{step.title}</span>
                      <small>{step.parentTitle}</small>
                    </div>
                    <div className="step-actions">
                      <button onClick={() => toggleStepStatus(step.parentId, step.id)}>✓</button>
                      <button className="danger" onClick={() => removeStep(step.parentId, step.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="step-column">
                <h4>Completado</h4>
                {completedSteps.map(step => (
                  <div key={`${step.parentId}-${step.id}`} className="step-card completed">
                    <div>
                      <span>{step.title}</span>
                      <small>{step.parentTitle}</small>
                    </div>
                    <div className="step-actions">
                      <button className="danger" onClick={() => removeStep(step.parentId, step.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TecnoGirlHub
