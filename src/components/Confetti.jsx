import React, { useEffect, useCallback } from 'react'
import './Confetti.css'

// Confetti effect component
function Confetti({ active, onComplete, type = 'default' }) {
  
  const createConfetti = useCallback(() => {
    const container = document.createElement('div')
    container.className = 'confetti-container'
    document.body.appendChild(container)
    
    const colors = type === 'achievement' 
      ? ['#a855f7', '#d4a5ff', '#fbbf24', '#f59e0b', '#10b981', '#34d399']
      : ['#6ee7b7', '#34d399', '#10b981', '#ffd4a3', '#ffb347', '#8b5cf6']
    
    const shapes = ['square', 'circle', 'triangle', 'ribbon']
    
    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div')
      const color = colors[Math.floor(Math.random() * colors.length)]
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      
      confetti.className = `confetti-piece ${shape}`
      confetti.style.backgroundColor = color
      confetti.style.left = Math.random() * 100 + '%'
      confetti.style.animationDelay = Math.random() * 0.5 + 's'
      confetti.style.animationDuration = (Math.random() * 1 + 2) + 's'
      
      container.appendChild(confetti)
    }
    
    // Create some larger sparkles
    for (let i = 0; i < 10; i++) {
      const sparkle = document.createElement('div')
      sparkle.className = 'confetti-sparkle'
      sparkle.innerHTML = '✨'
      sparkle.style.left = Math.random() * 100 + '%'
      sparkle.style.animationDelay = Math.random() * 0.3 + 's'
      sparkle.style.animationDuration = (Math.random() * 0.5 + 1.5) + 's'
      container.appendChild(sparkle)
    }
    
    // Remove after animation
    setTimeout(() => {
      container.remove()
      onComplete && onComplete()
    }, 3500)
  }, [type, onComplete])
  
  useEffect(() => {
    if (active) {
      createConfetti()
    }
  }, [active, createConfetti])
  
  return null
}

// Achievement unlock notification
export function AchievementToast({ achievement, onClose }) {
  if (!achievement) return null
  
  return (
    <div className="achievement-toast" onClick={onClose}>
      <div className="achievement-toast-content">
        <div className="toast-icon">{achievement.icon}</div>
        <div className="toast-info">
          <span className="toast-label">🏆 Logro Desbloqueado</span>
          <h4>{achievement.title}</h4>
          <p>{achievement.description}</p>
          <span className="toast-xp">+{achievement.xp} XP</span>
        </div>
        <button className="toast-close">×</button>
      </div>
    </div>
  )
}

// Level up notification
export function LevelUpToast({ level, onClose }) {
  if (!level) return null
  
  return (
    <div className="levelup-toast" onClick={onClose}>
      <div className="levelup-toast-content">
        <div className="levelup-badge">
          <span className="levelup-number">{level.level}</span>
        </div>
        <div className="levelup-info">
          <span className="levelup-label">🎉 ¡Subiste de Nivel!</span>
          <h4>{level.title}</h4>
          <p>Continúa así para alcanzar nuevas metas</p>
        </div>
      </div>
      <Confetti active={true} type="achievement" />
    </div>
  )
}

// XP gain animation component
export function XPGain({ amount, multiplier, onComplete }) {
  if (!amount) return null
  
  return (
    <div className="xp-gain-container" onAnimationEnd={onComplete}>
      <span className="xp-amount">+{amount} XP</span>
      {multiplier > 1 && (
        <span className="xp-multiplier">×{multiplier}</span>
      )}
    </div>
  )
}

export default Confetti
