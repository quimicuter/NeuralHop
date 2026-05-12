import React, { useMemo } from 'react'
import './ReadingStats.css'

function ReadingStats({ entries }) {
  const stats = useMemo(() => {
    const total = entries.length
    const completed = entries.filter(e => e.status === 'completed').length
    const reading = entries.filter(e => e.status === 'reading').length
    const wantToRead = entries.filter(e => e.status === 'want-to-read').length
    const reference = entries.filter(e => e.status === 'reference').length

    // By kind
    const byKind = entries.reduce((acc, entry) => {
      acc[entry.kind] = (acc[entry.kind] || 0) + 1
      return acc
    }, {})

    // By rating
    const rated = entries.filter(e => e.rating > 0)
    const avgRating = rated.length > 0
      ? rated.reduce((sum, e) => sum + e.rating, 0) / rated.length
      : 0
    const fiveStar = rated.filter(e => e.rating === 5).length

    // This month activity
    const thisMonth = new Date()
    thisMonth.setMonth(thisMonth.getMonth() - 1)
    const recentCompleted = entries.filter(e => {
      if (e.status !== 'completed' || !e.dateCompleted) return false
      return new Date(e.dateCompleted) >= thisMonth
    }).length

    const recentAdded = entries.filter(e => {
      if (!e.dateAdded) return false
      return new Date(e.dateAdded) >= thisMonth
    }).length

    return {
      total,
      completed,
      reading,
      wantToRead,
      reference,
      byKind,
      avgRating: Math.round(avgRating * 10) / 10,
      fiveStar,
      recentCompleted,
      recentAdded,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [entries])

  const kindLabels = {
    book: 'Libros',
    paper: 'Papers',
    article: 'Artículos',
    video: 'Videos',
    course: 'Cursos'
  }

  const kindEmojis = {
    book: '📕',
    paper: '📄',
    article: '📰',
    video: '🎬',
    course: '🎓'
  }

  const getKindColor = (kind) => {
    const colors = {
      book: '#8B4513',
      paper: '#4A5568',
      article: '#2B6CB0',
      video: '#C53030',
      course: '#285E61'
    }
    return colors[kind] || '#8B4513'
  }

  return (
    <div className="reading-stats-widget">
      <h3>📊 Estadísticas de Lectura</h3>

      {/* Main Stats Grid */}
      <div className="stats-main-grid">
        <div className="stat-card highlight">
          <span className="stat-number large">{stats.total}</span>
          <span className="stat-label">Total Recursos</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-number">{stats.completionRate}%</span>
          <span className="stat-label">Tasa de Completado</span>
          <div className="mini-progress">
            <div className="mini-fill" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-number">{stats.avgRating}</span>
          <span className="stat-label">Valoración Promedio</span>
          <div className="stars-display">
            {'⭐'.repeat(Math.round(stats.avgRating))}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="stats-section">
        <h4>📈 Por Estado</h4>
        <div className="status-bars">
          <div className="status-bar-item">
            <div className="status-label">
              <span>📖 Leyendo</span>
              <span>{stats.reading}</span>
            </div>
            <div className="status-bar">
              <div 
                className="status-fill reading" 
                style={{ width: `${(stats.reading / stats.total) * 100 || 0}%` }}
              />
            </div>
          </div>
          
          <div className="status-bar-item">
            <div className="status-label">
              <span>✅ Completados</span>
              <span>{stats.completed}</span>
            </div>
            <div className="status-bar">
              <div 
                className="status-fill completed" 
                style={{ width: `${(stats.completed / stats.total) * 100 || 0}%` }}
              />
            </div>
          </div>
          
          <div className="status-bar-item">
            <div className="status-label">
              <span>📚 Por Leer</span>
              <span>{stats.wantToRead}</span>
            </div>
            <div className="status-bar">
              <div 
                className="status-fill want-to-read" 
                style={{ width: `${(stats.wantToRead / stats.total) * 100 || 0}%` }}
              />
            </div>
          </div>
          
          <div className="status-bar-item">
            <div className="status-label">
              <span>📑 Referencias</span>
              <span>{stats.reference}</span>
            </div>
            <div className="status-bar">
              <div 
                className="status-fill reference" 
                style={{ width: `${(stats.reference / stats.total) * 100 || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* By Kind */}
      {Object.keys(stats.byKind).length > 0 && (
        <div className="stats-section">
          <h4>📚 Por Tipo</h4>
          <div className="kind-distribution">
            {Object.entries(stats.byKind).map(([kind, count]) => (
              <div key={kind} className="kind-item">
                <span className="kind-emoji">{kindEmojis[kind]}</span>
                <div className="kind-info">
                  <span className="kind-name">{kindLabels[kind] || kind}</span>
                  <span className="kind-count">{count}</span>
                </div>
                <div 
                  className="kind-indicator"
                  style={{ backgroundColor: getKindColor(kind) }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="stats-section">
        <h4>📅 Actividad Reciente (30 días)</h4>
        <div className="activity-stats">
          <div className="activity-item positive">
            <span className="activity-icon">✅</span>
            <div className="activity-info">
              <span className="activity-value">{stats.recentCompleted}</span>
              <span className="activity-label">Completados</span>
            </div>
          </div>
          
          <div className="activity-item neutral">
            <span className="activity-icon">📚</span>
            <div className="activity-info">
              <span className="activity-value">{stats.recentAdded}</span>
              <span className="activity-label">Agregados</span>
            </div>
          </div>
          
          {stats.fiveStar > 0 && (
            <div className="activity-item gold">
              <span className="activity-icon">⭐</span>
              <div className="activity-info">
                <span className="activity-value">{stats.fiveStar}</span>
                <span className="activity-label">5 estrellas</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="motivational-card">
        {stats.completionRate >= 50 ? (
          <>
            <span className="motivational-emoji">🎉</span>
            <p>¡Excelente! Has completado más de la mitad de tu biblioteca.</p>
          </>
        ) : stats.reading > 0 ? (
          <>
            <span className="motivational-emoji">💪</span>
            <p>¡Sigue así! Tienes {stats.reading} lecturas activas.</p>
          </>
        ) : stats.wantToRead > 0 ? (
          <>
            <span className="motivational-emoji">📚</span>
            <p>Tienes {stats.wantToRead} recursos esperando. ¡Elige uno y empieza!</p>
          </>
        ) : (
          <>
            <span className="motivational-emoji">🌱</span>
            <p>Tu biblioteca está creciendo. Sigue agregando recursos.</p>
          </>
        )}
      </div>
    </div>
  )
}

export default ReadingStats
