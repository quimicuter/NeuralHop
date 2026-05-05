import React from 'react'
import './ProgressBars.css'

function ProgressBars({ entries, onGoalClick }) {
  // Solo usar entries de Firebase de tipo 'goal'
  const goals = (entries || []).filter(e => e.type === 'goal' || e.metadata?.goalId).map(entry => ({
    id: entry.metadata?.goalId || entry.id,
    title: entry.title,
    emoji: entry.metadata?.emoji || '🎯',
    color: entry.metadata?.color || '#90caf9',
    progress: entry.metadata?.progress || 0,
    entryId: entry.id
  }))

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
