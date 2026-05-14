import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { filterEntries } from '../../engine/EntryEngine'
import './WellnessProjects.css'

// Helper para calcular progreso de proyecto
const calculateProjectProgress = (project) => {
  if (!project.steps || !Array.isArray(project.steps)) return 0
  const completedSteps = project.steps.filter(step => step.completed).length
  return Math.round((completedSteps / project.steps.length) * 100)
}

// Helper para determinar si un proyecto está completado
const isProjectCompleted = (project) => {
  return calculateProjectProgress(project) === 100
}

function WellnessProjects() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showCompletedModal, setShowCompletedModal] = useState(false)

  // Suscribirse a proyectos de wellness
  useEffect(() => {
    const unsubscribe = filterEntries((entry) => {
      return entry.type === 'project' && entry.module === 'wellness'
    }, (entries) => {
      setProjects(entries)
    })
    
    return unsubscribe
  }, [])

  // Separar proyectos activos y completados
  const { activeProjects, completedProjects } = useMemo(() => {
    const active = projects.filter(p => !isProjectCompleted(p))
    const completed = projects.filter(p => isProjectCompleted(p))
    return { activeProjects: active, completedProjects: completed }
  }, [projects])

  const handleProjectClick = (project) => {
    setSelectedProject(project)
    setShowProjectModal(true)
  }

  const handleCompletedClick = () => {
    setShowCompletedModal(true)
  }

  return (
    <div className="wellness-projects-container">
      {/* Header con emoji de reloj para proyectos completados */}
      <div className="wellness-projects-header">
        <h3 className="wellness-projects-title">Proyectos Wellness</h3>
        {completedProjects.length > 0 && (
          <button 
            className="wellness-completed-btn"
            onClick={handleCompletedClick}
            title={`${completedProjects.length} proyectos completados`}
          >
            🕐
          </button>
        )}
      </div>

      {/* Lista de proyectos activos */}
      <div className="wellness-projects-list">
        <AnimatePresence>
          {activeProjects.map((project, index) => {
            const progress = calculateProjectProgress(project)
            
            return (
              <motion.div
                key={project.id}
                className="wellness-project-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleProjectClick(project)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Nombre del proyecto */}
                <div className="wellness-project-name">
                  {project.title || project.name || 'Sin nombre'}
                </div>

                {/* Barra de progreso */}
                <div className="wellness-project-progress">
                  <div className="wellness-progress-label">
                    Progreso: {progress}%
                  </div>
                  <div className="wellness-progress-bar">
                    <div 
                      className="wellness-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Botones de acción minimalistas */}
                <div className="wellness-project-actions">
                  <button 
                    className="wellness-action-btn wellness-btn-edit"
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Abrir modal de edición
                    }}
                    title="Editar proyecto"
                  >
                    ✏️
                  </button>
                  <button 
                    className="wellness-action-btn wellness-btn-view"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProjectClick(project)
                    }}
                    title="Ver detalles"
                  >
                    👁️
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Mensaje si no hay proyectos activos */}
        {activeProjects.length === 0 && (
          <div className="wellness-projects-empty">
            <p>No hay proyectos activos</p>
            <button 
              className="wellness-add-project-btn"
              onClick={() => {
                // TODO: Abrir modal para crear nuevo proyecto
                window.dispatchEvent(new CustomEvent('open-global-modal', { 
                  detail: { type: 'project', scope: 'personal', module: 'wellness' } 
                }))
              }}
            >
              + Nuevo Proyecto
            </button>
          </div>
        )}
      </div>

      {/* Modal de detalles del proyecto */}
      <AnimatePresence>
        {showProjectModal && selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => setShowProjectModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal de proyectos completados */}
      <AnimatePresence>
        {showCompletedModal && (
          <CompletedProjectsModal
            projects={completedProjects}
            onClose={() => setShowCompletedModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Modal de detalles del proyecto
function ProjectDetailModal({ project, onClose }) {
  const progress = calculateProjectProgress(project)

  return (
    <div className="wellness-modal-overlay" onClick={onClose}>
      <motion.div
        className="wellness-project-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wellness-modal-header">
          <h2>{project.title || project.name || 'Sin nombre'}</h2>
          <button className="wellness-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="wellness-modal-content">
          {/* Progreso */}
          <div className="wellness-modal-progress">
            <h3>Progreso del Proyecto</h3>
            <div className="wellness-progress-bar large">
              <div 
                className="wellness-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="wellness-progress-text">{progress}% completado</span>
          </div>

          {/* Pasos del proyecto */}
          {project.steps && (
            <div className="wellness-modal-steps">
              <h3>Pasos del Proyecto</h3>
              <div className="wellness-steps-list">
                {project.steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`wellness-step-item ${step.completed ? 'completed' : ''}`}
                  >
                    <span className="wellness-step-checkbox">
                      {step.completed ? '✓' : '○'}
                    </span>
                    <span className="wellness-step-text">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Repositorio de URLs */}
          {project.urls && project.urls.length > 0 && (
            <div className="wellness-modal-urls">
              <h3>Repositorio de URLs</h3>
              <div className="wellness-urls-list">
                {project.urls.map((url, index) => (
                  <a 
                    key={index}
                    href={url.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wellness-url-item"
                  >
                    🔗 {url.title || url.url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Repositorio de libros */}
          {project.books && project.books.length > 0 && (
            <div className="wellness-modal-books">
              <h3>Libros Relacionados</h3>
              <div className="wellness-books-list">
                {project.books.map((book, index) => (
                  <div key={index} className="wellness-book-item">
                    <span className="wellness-book-emoji">📚</span>
                    <div className="wellness-book-info">
                      <div className="wellness-book-title">{book.title}</div>
                      {book.author && <div className="wellness-book-author">{book.author}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Repositorio de artículos */}
          {project.articles && project.articles.length > 0 && (
            <div className="wellness-modal-articles">
              <h3>Artículos de Referencia</h3>
              <div className="wellness-articles-list">
                {project.articles.map((article, index) => (
                  <a 
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wellness-article-item"
                  >
                    📄 {article.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Mini checklist */}
          {project.checklist && project.checklist.length > 0 && (
            <div className="wellness-modal-checklist">
              <h3>Checklist de Consideración</h3>
              <div className="wellness-checklist-list">
                {project.checklist.map((item, index) => (
                  <div 
                    key={index}
                    className={`wellness-checklist-item ${item.completed ? 'completed' : ''}`}
                  >
                    <span className="wellness-checklist-checkbox">
                      {item.completed ? '✓' : '○'}
                    </span>
                    <span className="wellness-checklist-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Modal de proyectos completados
function CompletedProjectsModal({ projects, onClose }) {
  return (
    <div className="wellness-modal-overlay" onClick={onClose}>
      <motion.div
        className="wellness-completed-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wellness-modal-header">
          <h2>🕐 Proyectos Completados</h2>
          <button className="wellness-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="wellness-completed-list">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="wellness-completed-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="wellness-completed-info">
                <h4>{project.title || project.name || 'Sin nombre'}</h4>
                <p>Completado el {new Date(project.completedAt || project.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="wellness-completed-progress">
                <span>✅ 100%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default WellnessProjects
