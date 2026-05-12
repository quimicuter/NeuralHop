import React, { useState } from 'react'
import { useGamification, ACHIEVEMENTS } from '../gamification'
import './GamificationWidget.css'

function GamificationWidget({ onOpenProfile }) {
  const { level, streak, gamification, getDailyQuests } = useGamification()
  const [isExpanded, setIsExpanded] = useState(false)
  
  const dailyQuests = getDailyQuests()
  const completedQuests = dailyQuests.filter(q => q.completed).length
  const totalQuests = dailyQuests.length
  
  // Get recent achievements (last 3 unlocked)
  const recentAchievements = gamification.unlockedAchievements
    .slice(-3)
    .reverse()
  
  return (
    <div className={`gamification-widget ${isExpanded ? 'expanded' : ''}`}>
      {/* Floating Button */}
      <button 
        className="gamification-fab"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Tu progreso"
      >
        <span className="fab-icon">🎮</span>
        {streak.current > 0 && (
          <span className="fab-badge">{streak.current}</span>
        )}
      </button>
      
      {/* Expanded Card */}
      {isExpanded && (
        <div className="gamification-card">
          {/* Header */}
          <div className="gamification-card-header">
            <div className="mini-level-badge">
              <span className="mini-level-number">{level.level}</span>
            </div>
            <div className="mini-user-info">
              <span className="mini-level-title">{level.title}</span>
              <div className="mini-xp-bar">
                <div 
                  className="mini-xp-fill"
                  style={{ width: `${level.progress}%` }}
                />
              </div>
              <span className="mini-xp-text">
                {gamification.xp} / {level.nextLevelXP || 'MAX'} XP
              </span>
            </div>
            <button 
              className="expand-btn"
              onClick={() => {
                setIsExpanded(false)
                onOpenProfile && onOpenProfile()
              }}
              title="Ver perfil completo"
            >
              ↗
            </button>
          </div>
          
          {/* Stats Row */}
          <div className="gamification-quick-stats">
            <div className="quick-stat-item">
              <span className="quick-stat-icon">🔥</span>
              <span className="quick-stat-value">{streak.current}</span>
              <span className="quick-stat-label">días</span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-icon">🏆</span>
              <span className="quick-stat-value">
                {gamification.unlockedAchievements.length}
              </span>
              <span className="quick-stat-label">logros</span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-icon">🎯</span>
              <span className="quick-stat-value">
                {completedQuests}/{totalQuests}
              </span>
              <span className="quick-stat-label">misiones</span>
            </div>
          </div>
          
          {/* Today's Progress */}
          <div className="gamification-today">
            <span className="today-label">Hoy</span>
            <div className="today-progress-row">
              <span>✅ {gamification.dailyStats.completedTasks} tareas</span>
              <span>📝 {gamification.dailyStats.notesCreated} notas</span>
              <span>🛒 {gamification.dailyStats.shopItemsAdded} items</span>
            </div>
          </div>
          
          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <div className="gamification-recent">
              <span className="recent-label">Logros recientes</span>
              <div className="recent-badges">
                {recentAchievements.slice(0, 3).map(achId => {
                  // Find achievement details
                  const achievement = Object.values(ACHIEVEMENTS)
                    .find(a => a.id === achId)
                  return achievement ? (
                    <span 
                      key={achId}
                      className="recent-badge"
                      title={achievement.title}
                    >
                      {achievement.icon}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}
          
          {/* XP Multiplier */}
          {streak.current >= 7 && (
            <div className="gamification-multiplier">
              <span className="multiplier-flame">🔥</span>
              <span className="multiplier-text">
                ×{streak.current >= 30 ? '2.0' : streak.current >= 14 ? '1.5' : '1.25'} XP
              </span>
            </div>
          )}
          
          {/* Footer */}
          <button 
            className="view-profile-btn"
            onClick={() => {
              setIsExpanded(false)
              onOpenProfile && onOpenProfile()
            }}
          >
            Ver perfil completo →
          </button>
        </div>
      )}
    </div>
  )
}

export default GamificationWidget
