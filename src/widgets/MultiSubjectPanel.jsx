import React, { useState } from 'react'
import './MultiSubjectPanel.css'

// Pestañas del Lab Manager Hub
const SUBJECTS = [
  { 
    id: 'experimentacion', 
    label: 'Experimentación en Ingenierías', 
    emoji: '⚙️',
    color: '#667eea'
  },
  { 
    id: 'quimica-organica', 
    label: 'Química Orgánica', 
    emoji: '🧪',
    color: '#f093fb'
  },
  { 
    id: 'quimica-2', 
    label: 'Química 2', 
    emoji: '⚗️',
    color: '#4facfe'
  }
]

function MultiSubjectPanel({ entries, onSubjectChange }) {
  const [activeTab, setActiveTab] = useState('experimentacion')

  // Filtrar entries por materia activa
  const subjectEntries = entries?.filter(e => 
    e.metadata?.subject === activeTab || e.tags?.includes(activeTab)
  ) || []

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (onSubjectChange) {
      onSubjectChange(tabId)
    }
  }

  return (
    <div className="multi-subject-panel">
      <div className="subject-header">
        <h3 className="subject-title">🔬 Multi Subject Panel</h3>
        <p className="subject-subtitle">Gestión de experimentos por materia</p>
      </div>

      {/* Tabs */}
      <div className="subject-tabs">
        {SUBJECTS.map(subject => (
          <button
            key={subject.id}
            className={`subject-tab ${activeTab === subject.id ? 'active' : ''}`}
            onClick={() => handleTabChange(subject.id)}
            style={{ 
              '--subject-color': subject.color,
              '--subject-bg': `${subject.color}20`
            }}
          >
            <span className="subject-tab-emoji">{subject.emoji}</span>
            <span className="subject-tab-label">{subject.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="subject-content">
        {subjectEntries.length === 0 ? (
          <div className="subject-empty">
            <span className="subject-empty-emoji">
              {SUBJECTS.find(s => s.id === activeTab)?.emoji}
            </span>
            <p>No hay experimentos registrados para esta materia</p>
            <span className="subject-empty-hint">
              Selecciona "+" para agregar un nuevo experimento
            </span>
          </div>
        ) : (
          <div className="subject-entries">
            {subjectEntries.slice(0, 5).map(entry => (
              <div key={entry.id} className="subject-entry-item">
                <span className="subject-entry-dot" style={{ 
                  background: SUBJECTS.find(s => s.id === activeTab)?.color 
                }}></span>
                <span className="subject-entry-title">{entry.title}</span>
                {entry.metadata?.date && (
                  <span className="subject-entry-date">
                    {new Date(entry.metadata.date).toLocaleDateString('es-MX')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="subject-add-btn">
        + Nuevo experimento
      </button>
    </div>
  )
}

export default MultiSubjectPanel
