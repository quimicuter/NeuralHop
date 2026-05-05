import React from 'react'
import './CyclicTracker.css'

// Configuración de tipos de ciclos disponibles (no datos, solo metadatos de UI)
const CYCLE_TEMPLATES = {
  'lavado-cabello': { emoji: '🧴', color: '#81d4fa' },
  'exfoliacion': { emoji: '✨', color: '#ce93d8' },
  'corte-mensual': { emoji: '✂️', color: '#a5d6a7' },
  'planchado': { emoji: '💆‍♀️', color: '#ffcc80' }
}

function CyclicTracker({ entries, onCycleComplete }) {
  // Solo usar entries de Firebase - mapear a ciclos
  const cycles = (entries || []).filter(e => e.type === 'cycle' || e.metadata?.cycleId).map(entry => {
    const template = CYCLE_TEMPLATES[entry.metadata?.cycleId] || { emoji: '🔄', color: '#90caf9' }
    return {
      id: entry.metadata?.cycleId || entry.id,
      title: entry.title,
      emoji: template.emoji,
      color: template.color,
      entryId: entry.id,
      lastDone: entry.metadata?.lastDone,
      completed: entry.completed || false
    }
  })

  const getDaysSince = (dateString) => {
    if (!dateString) return null
    const lastDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today - lastDate)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleCycleClick = (cycle) => {
    if (onCycleComplete) {
      onCycleComplete(cycle.id, cycle.entryId)
    }
  }

  return (
    <div className="cyclic-tracker">
      <div className="cyclic-header">
        <h3 className="cyclic-title">🔄 Ciclic Tracker</h3>
        <p className="cyclic-subtitle">Rutinas recurrentes de selfcare</p>
      </div>

      <div className="cyclic-grid">
        {cycles.map(cycle => {
          const daysSince = getDaysSince(cycle.lastDone)
          const isOverdue = daysSince !== null && daysSince > 3 && cycle.id === 'lavado-cabello'
          
          return (
            <div
              key={cycle.id}
              className={`cyclic-card ${cycle.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
              onClick={() => handleCycleClick(cycle)}
              style={{ '--cycle-color': cycle.color }}
            >
              <div className="cyclic-emoji">{cycle.emoji}</div>
              <div className="cyclic-info">
                <h4 className="cyclic-name">{cycle.title}</h4>
                <span className="cyclic-freq">{cycle.frequency}</span>
              </div>
              <div className="cyclic-status">
                {cycle.completed ? (
                  <span className="cyclic-check">✓</span>
                ) : daysSince ? (
                  <span className="cyclic-days">{daysSince}d</span>
                ) : (
                  <span className="cyclic-pending">•</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CyclicTracker
