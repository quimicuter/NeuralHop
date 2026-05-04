import React from 'react'
import './CyclicTracker.css'

const DEFAULT_CYCLES = [
  {
    id: 'lavado-cabello',
    title: 'Lavado de cabello',
    emoji: '🧴',
    frequency: 'Cada 2-3 días',
    lastDone: null,
    color: '#81d4fa'
  },
  {
    id: 'exfoliacion',
    title: 'Exfoliación',
    emoji: '✨',
    frequency: '2-3 veces/semana',
    lastDone: null,
    color: '#ce93d8'
  },
  {
    id: 'corte-mensual',
    title: 'Corte mensual',
    emoji: '✂️',
    frequency: 'Mensual',
    lastDone: null,
    color: '#a5d6a7'
  },
  {
    id: 'planchado',
    title: 'Planchado',
    emoji: '💆‍♀️',
    frequency: 'Según necesidad',
    lastDone: null,
    color: '#ffcc80'
  }
]

function CyclicTracker({ entries, onCycleComplete }) {
  // Mapear entries a ciclos
  const cycles = DEFAULT_CYCLES.map(cycle => {
    const entry = entries.find(e => e.metadata?.cycleId === cycle.id)
    return {
      ...cycle,
      entryId: entry?.id,
      lastDone: entry?.metadata?.lastDone,
      completed: entry?.completed || false
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
