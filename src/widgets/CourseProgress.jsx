import React from 'react'
import './CourseProgress.css'

// Timeline de 3 meses para Tecno Girl Hub
const MONTHS = [
  { id: 'month-1', label: 'Mes 1', status: 'Fundamentos', week: 'Sem 1-4' },
  { id: 'month-2', label: 'Mes 2', status: 'Análisis', week: 'Sem 5-8' },
  { id: 'month-3', label: 'Mes 3', status: 'Proyecto', week: 'Sem 9-12' }
]

function CourseProgress({ entries, currentMonth = 1 }) {
  // Calcular progreso basado en entries completados
  const completedModules = entries?.filter(e => e.completed && e.type === 'course-module').length || 0
  const totalModules = entries?.filter(e => e.type === 'course-module').length || 12 // default 12 semanas
  
  const progressPercent = Math.min(100, Math.round((completedModules / totalModules) * 100))
  
  return (
    <div className="course-progress-widget">
      <div className="course-header">
        <h3 className="course-title">📚 Course Progress</h3>
        <p className="course-subtitle">Timeline de 3 meses - Tecno Girl</p>
      </div>

      <div className="timeline-container">
        <div className="timeline-line">
          <div 
            className="timeline-progress" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <div className="timeline-months">
          {MONTHS.map((month, index) => {
            const isCompleted = index < currentMonth - 1
            const isCurrent = index === currentMonth - 1
            
            return (
              <div key={month.id} className="timeline-month">
                <div className={`month-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`} />
                <span className="month-label">{month.label}</span>
                <span className="month-status">{month.status}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="course-stats">
        <div className="stat-item">
          <div className="stat-value">{progressPercent}%</div>
          <div className="stat-label">Completado</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{completedModules}</div>
          <div className="stat-label">Módulos</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalModules - completedModules}</div>
          <div className="stat-label">Pendientes</div>
        </div>
      </div>
    </div>
  )
}

export default CourseProgress
