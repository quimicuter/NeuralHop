import React from 'react'
import './TitulacionChecklist.css'

// Requisitos de titulación - Universidad de Guanajuato
const TITULACION_REQUISITOS = [
  { id: 'tesis', title: 'Tesis/Proyecto de titulación', emoji: '📄', required: true },
  { id: 'acto', title: 'Acto protocolario', emoji: '🎓', required: true },
  { id: 'liberacion', title: 'Liberación de servicio social', emoji: '🤝', required: true },
  { id: 'certificado', title: 'Certificado de idioma', emoji: '🗣️', required: true },
  { id: 'credits', title: '100% de créditos aprobados', emoji: '✅', required: true },
  { id: 'constancia', title: 'Constancia de no adeudo', emoji: '📋', required: true }
]

function TitulacionChecklist({ entries, onToggleItem }) {
  // Mapear entries completados
  const completedItems = entries?.filter(e => e.completed).map(e => e.metadata?.requirementId) || []

  const progress = Math.round((completedItems.length / TITULACION_REQUISITOS.length) * 100)

  return (
    <div className="titulacion-checklist-widget">
      <div className="titulacion-header">
        <h3 className="titulacion-title">🎓 Titulación Checklist</h3>
        <p className="titulacion-subtitle">Universidad de Guanajuato</p>
      </div>

      <div className="titulacion-progress">
        <div className="titulacion-progress-bar">
          <div 
            className="titulacion-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="titulacion-progress-text">{progress}% completado</span>
      </div>

      <div className="titulacion-list">
        {TITULACION_REQUISITOS.map(req => {
          const isCompleted = completedItems.includes(req.id)
          
          return (
            <div 
              key={req.id}
              className={`titulacion-item ${isCompleted ? 'completed' : ''}`}
              onClick={() => onToggleItem && onToggleItem(req.id)}
              style={{ cursor: onToggleItem ? 'pointer' : 'default' }}
            >
              <div className="titulacion-checkbox">
                {isCompleted ? '✓' : '○'}
              </div>
              <span className="titulacion-emoji">{req.emoji}</span>
              <span className="titulacion-req-title">{req.title}</span>
              {req.required && <span className="titulacion-required">*</span>}
            </div>
          )
        })}
      </div>

      <div className="titulacion-footer">
        <p className="titulacion-note">
          * Requisitos obligatorios para procedimiento de titulación
        </p>
      </div>
    </div>
  )
}

export default TitulacionChecklist
