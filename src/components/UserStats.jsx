import React, { useState } from 'react'
import { useGamification } from '../gamification'
import './UserStats.css'

function UserStats({ isOpen, onClose }) {
  const { 
    gamification, 
    level, 
    streak, 
    achievements, 
    unlockedAchievements,
    getDailyQuests,
    getStreakMultiplier 
  } = useGamification()
  
  const [activeTab, setActiveTab] = useState('overview')
  const dailyQuests = getDailyQuests()
  const multiplier = getStreakMultiplier()

  if (!isOpen) return null

  const renderOverview = () => (
    <div className="user-stats-overview">
      {/* Level Card */}
      <div className="level-card">
        <div className="level-badge">
          <span className="level-number">{level.level}</span>
          <span className="level-title">{level.title}</span>
        </div>
        
        <div className="xp-section">
          <div className="xp-bar-container">
            <div 
              className="xp-bar-fill"
              style={{ width: `${level.progress}%` }}
            />
          </div>
          <div className="xp-numbers">
            <span>{gamification.xp} XP</span>
            {level.nextLevelXP && (
              <span>/ {level.nextLevelXP} XP</span>
            )}
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="streak-card">
        <div className="streak-flame">
          <span className="flame-icon">🔥</span>
          <span className="streak-count">{streak.current}</span>
        </div>
        <div className="streak-info">
          <span className="streak-label">Días consecutivos</span>
          <span className="streak-record">Record: {streak.longest}</span>
        </div>
        {multiplier > 1 && (
          <div className="multiplier-badge">
            ×{multiplier} XP
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="quick-icon">🏆</span>
          <span className="quick-value">{unlockedAchievements.length}</span>
          <span className="quick-label">Logros</span>
        </div>
        <div className="quick-stat">
          <span className="quick-icon">✅</span>
          <span className="quick-value">{gamification.totalStats.tasksCompleted}</span>
          <span className="quick-label">Tareas</span>
        </div>
        <div className="quick-stat">
          <span className="quick-icon">📚</span>
          <span className="quick-value">{gamification.totalStats.booksCompleted}</span>
          <span className="quick-label">Libros</span>
        </div>
        <div className="quick-stat">
          <span className="quick-icon">📝</span>
          <span className="quick-value">{gamification.totalStats.notesCreated}</span>
          <span className="quick-label">Notas</span>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="today-progress">
        <h4>📅 Progreso de Hoy</h4>
        <div className="today-stats">
          <div className="today-item">
            <span>✅ Tareas</span>
            <span>{gamification.dailyStats.completedTasks}</span>
          </div>
          <div className="today-item">
            <span>📚 Lectura</span>
            <span>{gamification.dailyStats.bookProgressUpdated > 0 ? '✓' : '○'}</span>
          </div>
          <div className="today-item">
            <span>📝 Notas</span>
            <span>{gamification.dailyStats.notesCreated}</span>
          </div>
          <div className="today-item">
            <span>🛒 Compras</span>
            <span>{gamification.dailyStats.shopItemsAdded}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAchievements = () => {
    const categories = [...new Set(achievements.map(a => a.category))]
    
    return (
      <div className="achievements-view">
        {categories.map(category => {
          const categoryAchievements = achievements.filter(a => a.category === category)
          const unlockedInCategory = categoryAchievements.filter(a => 
            unlockedAchievements.includes(a.id)
          )
          
          return (
            <div key={category} className="achievement-category">
              <h4 className="category-header">
                {getCategoryIcon(category)} {getCategoryLabel(category)}
                <span className="category-progress">
                  {unlockedInCategory.length}/{categoryAchievements.length}
                </span>
              </h4>
              <div className="achievements-grid">
                {categoryAchievements.map(achievement => {
                  const isUnlocked = unlockedAchievements.includes(achievement.id)
                  return (
                    <div 
                      key={achievement.id}
                      className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <span className="achievement-icon">{achievement.icon}</span>
                      <h5>{achievement.title}</h5>
                      <p>{achievement.description}</p>
                      <div className="achievement-footer">
                        <span className="achievement-xp">+{achievement.xp} XP</span>
                        {isUnlocked && <span className="unlocked-badge">✓</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderDailyQuests = () => (
    <div className="daily-quests-view">
      <div className="quests-header">
        <h4>🎯 Misiones Diarias</h4>
        <span className="reset-timer">Se reinician a las 00:00</span>
      </div>
      
      <div className="quests-list">
        {dailyQuests.map(quest => {
          const progress = quest.progress
          const isCompleted = quest.completed
          const percent = (progress.current / progress.target) * 100
          
          return (
            <div 
              key={quest.id}
              className={`quest-card ${isCompleted ? 'completed' : ''}`}
            >
              <div className="quest-info">
                <h5>{quest.title}</h5>
                <p>{quest.description}</p>
              </div>
              <div className="quest-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <span className="progress-text">
                  {progress.current}/{progress.target}
                </span>
              </div>
              <div className="quest-reward">
                <span>+{quest.xp} XP</span>
                {isCompleted && <span className="completed-check">✅</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="quests-summary">
        <span>
          Completadas: {dailyQuests.filter(q => q.completed).length}/{dailyQuests.length}
        </span>
        <span>
          XP disponible: {dailyQuests.filter(q => !q.completed).reduce((s, q) => s + q.xp, 0)}
        </span>
      </div>
    </div>
  )

  const getCategoryIcon = (cat) => {
    const icons = {
      library: '📚',
      grimoire: '🔮',
      shoplist: '🛒',
      general: '⭐',
      streak: '🔥',
      hubs: '🗺️',
      special: '✨'
    }
    return icons[cat] || '🏆'
  }

  const getCategoryLabel = (cat) => {
    const labels = {
      library: 'Biblioteca',
      grimoire: 'Grimorio',
      shoplist: 'Shoplist',
      general: 'General',
      streak: 'Rachas',
      hubs: 'Hubs',
      special: 'Especiales'
    }
    return labels[cat] || cat
  }

  return (
    <div className="user-stats-overlay" onClick={onClose}>
      <div className="user-stats-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="user-stats-header">
          <div className="user-avatar">
            <span>👤</span>
          </div>
          <div className="user-info">
            <h2>Tu Progreso</h2>
            <p>Nivel {level.level} • {level.title}</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="user-stats-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📊 Resumen
          </button>
          <button 
            className={activeTab === 'achievements' ? 'active' : ''}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Logros
          </button>
          <button 
            className={activeTab === 'quests' ? 'active' : ''}
            onClick={() => setActiveTab('quests')}
          >
            🎯 Misiones
          </button>
        </div>

        {/* Content */}
        <div className="user-stats-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'achievements' && renderAchievements()}
          {activeTab === 'quests' && renderDailyQuests()}
        </div>
      </div>
    </div>
  )
}

export default UserStats
