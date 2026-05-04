import React from 'react'
import './ProgressBars.css'

// 3 metas predefinidas para Fitness Hub
const DEFAULT_GOALS = [
  {
    id: 'split-completo',
    title: 'Split Completo',
    emoji: '🤸',
    color: '#f48fb1', // Pink
    defaultProgress: 65
  },
  {
    id: 'destensar-cadera',
    title: 'Destensar Cadera',
    emoji: '🧘',
    color: '#81d4fa', // Light Blue
    defaultProgress: 40
  },
  {
    id: 'crecimiento-gluteos',
    title: 'Crecimiento Glúteos',
    emoji: '🍑',
    color: '#ce93d8', // Purple
    defaultProgress: 55
  }
]

function ProgressBars({ entries, onGoalClick }) {
  // Mapear entries a metas (si existen) o usar valores por defecto
  const goals = DEFAULT_GOALS.map(goal => {
    const entry = entries?.find(e => e.metadata?.goalId === goal.id)
    return {
      ...goal,
      progress: entry?.metadata?.progress ?? goal.defaultProgress,
      entryId: entry?.id
    }
  })

  const circumference = 2 * Math.PI * 42 // r=42

  const handleGoalClick = (goal) => {
    if (onGoalClick) {
      onGoalClick(goal.id, goal.entryId)
    }
  }

  return (
    <div className="progress-bars-widget">
      <div className="progress-header">
        <h3 className="progress-title">🎯 Progress Goals</h3>
        <p className="progress-subtitle">Metas de fitness activas</p>
      </div>

      <div className="progress-grid">
        {goals.map(goal => {
          const strokeDashoffset = circumference - (goal.progress / 100) * circumference

          return (
            <div
              key={goal.id}
              className="progress-item"
              onClick={() => handleGoalClick(goal)}
              style={{ cursor: onGoalClick ? 'pointer' : 'default' }}
            >
              <div className="progress-circle-container">
                <svg className="progress-circle-svg" viewBox="0 0 100 100">
                  {/* Círculo de fondo */}
                  <circle
                    className="progress-circle-bg"
                    cx="50"
                    cy="50"
                    r="42"
                  />
                  {/* Círculo de progreso */}
                  <circle
                    className="progress-circle-fill"
                    cx="50"
                    cy="50"
                    r="42"
                    stroke={goal.color}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="progress-circle-inner">
                  <span className="progress-emoji">{goal.emoji}</span>
                  <span className="progress-percentage">{goal.progress}%</span>
                </div>
              </div>
              <span className="progress-label">{goal.title}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressBars
