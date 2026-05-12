import React from 'react'
import './ReadingProgress.css'

function ReadingProgress({ entries, onUpdateProgress }) {
  // Filter only reading items with progress
  const readingItems = entries.filter(entry => 
    entry.status === 'reading' && entry.progress !== undefined
  )

  // Filter recently completed items
  const recentlyCompleted = entries.filter(entry => {
    if (entry.status !== 'completed' || !entry.dateCompleted) return false
    const completedDate = new Date(entry.dateCompleted)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return completedDate >= thirtyDaysAgo
  }).slice(0, 3)

  // Calculate reading stats
  const totalReading = readingItems.length
  const avgProgress = totalReading > 0 
    ? readingItems.reduce((sum, item) => sum + (item.progress || 0), 0) / totalReading 
    : 0

  const getProgressColor = (progress) => {
    if (progress < 25) return '#ef4444'
    if (progress < 50) return '#f59e0b'
    if (progress < 75) return '#3b82f6'
    return '#10b981'
  }

  const getMotivationalMessage = (progress) => {
    if (progress === 0) return '🚀 ¡Empieza tu viaje!'
    if (progress < 25) return '📖 Primeros pasos...'
    if (progress < 50) return '💪 ¡Vas por buen camino!'
    if (progress < 75) return '🔥 ¡Ya más de la mitad!'
    if (progress < 100) return '🏁 ¡Casi terminado!'
    return '🎉 ¡Completado!'
  }

  return (
    <div className="reading-progress-widget">
      <div className="reading-header">
        <h3>📖 Progreso de Lectura</h3>
        <span className="reading-count">{totalReading} activos</span>
      </div>

      {totalReading === 0 ? (
        <div className="reading-empty">
          <span className="empty-icon">📚</span>
          <p>No hay lecturas activas</p>
          <span>Marca un recurso como "Leyendo" para ver tu progreso</span>
        </div>
      ) : (
        <>
          <div className="reading-stats-summary">
            <div className="stat-item">
              <span className="stat-value">{Math.round(avgProgress)}%</span>
              <span className="stat-label">Progreso promedio</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalReading}</span>
              <span className="stat-label">Lecturas activas</span>
            </div>
          </div>

          <div className="reading-list">
            {readingItems.map(item => (
              <div key={item.id} className="reading-item">
                <div className="reading-item-header">
                  <span className="reading-emoji">
                    {item.kind === 'book' && '📕'}
                    {item.kind === 'paper' && '📄'}
                    {item.kind === 'article' && '📰'}
                    {item.kind === 'video' && '🎬'}
                    {item.kind === 'course' && '🎓'}
                  </span>
                  <div className="reading-info">
                    <h4>{item.title}</h4>
                    <p>{item.author || 'Autor desconocido'}</p>
                  </div>
                  <span className="reading-percentage">
                    {item.progress || 0}%
                  </span>
                </div>

                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      width: `${item.progress || 0}%`,
                      background: `linear-gradient(90deg, ${getProgressColor(item.progress || 0)}, ${getProgressColor(Math.min((item.progress || 0) + 10, 100))})`
                    }}
                  />
                </div>

                <div className="reading-footer">
                  <span className="motivational-text">
                    {getMotivationalMessage(item.progress || 0)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.progress || 0}
                    onChange={(e) => onUpdateProgress && onUpdateProgress(item.id, parseInt(e.target.value))}
                    className="progress-mini-slider"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {recentlyCompleted.length > 0 && (
        <div className="recently-completed">
          <h4>🎉 Completados recientemente</h4>
          <div className="completed-list">
            {recentlyCompleted.map(item => (
              <div key={item.id} className="completed-item">
                <span>✅ {item.title}</span>
                {item.rating > 0 && <span className="completed-rating">{'⭐'.repeat(item.rating)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReadingProgress
