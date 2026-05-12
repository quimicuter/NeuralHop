import React, { useState } from 'react'
import './LibraryShelf.css'

const kindColors = {
  book: { gradient: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)', spine: '#8B4513' },
  paper: { gradient: 'linear-gradient(135deg, #4A5568 0%, #718096 50%, #A0AEC0 100%)', spine: '#4A5568' },
  article: { gradient: 'linear-gradient(135deg, #2B6CB0 0%, #4299E1 50%, #63B3ED 100%)', spine: '#2B6CB0' },
  video: { gradient: 'linear-gradient(135deg, #C53030 0%, #E53E3E 50%, #FC8181 100%)', spine: '#C53030' },
  course: { gradient: 'linear-gradient(135deg, #285E61 0%, #38B2AC 50%, #4FD1C5 100%)', spine: '#285E61' }
}

const kindLabels = {
  book: '📕 Libro',
  paper: '📄 Paper',
  article: '📰 Artículo',
  video: '🎬 Video',
  course: '🎓 Curso'
}

const statusLabels = {
  'want-to-read': '📚',
  'reading': '📖',
  'completed': '✅',
  'reference': '📑'
}

function LibraryShelf({ entries, onEntryClick, onUpdateStatus, onUpdateRating, onDelete }) {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [filterKind, setFilterKind] = useState('all')
  const [viewMode, setViewMode] = useState('shelf') // 'shelf' | 'grid' | 'list'
  const [sortBy, setSortBy] = useState('dateAdded') // 'dateAdded' | 'rating' | 'title' | 'status'

  const filteredEntries = entries.filter(entry => {
    if (filterKind === 'all') return true
    return entry.kind === filterKind
  })

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    switch (sortBy) {
      case 'dateAdded':
        return new Date(b.dateAdded) - new Date(a.dateAdded)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'status':
        const statusOrder = { 'reading': 0, 'want-to-read': 1, 'reference': 2, 'completed': 3 }
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
      default:
        return 0
    }
  })

  const getBookHeight = (entry) => {
    // Simulate different book sizes based on content length
    const baseHeight = 180
    const variation = (entry.title?.length || 0) % 40
    return baseHeight + variation
  }

  const getBookWidth = (entry) => {
    // Different widths based on kind
    const widths = { book: 45, paper: 35, article: 30, video: 40, course: 50 }
    return widths[entry.kind] || 40
  }

  const renderShelfView = () => {
    // Group entries into rows (shelves)
    const rows = []
    let currentRow = []
    let currentRowWidth = 0
    const maxRowWidth = 800

    sortedEntries.forEach(entry => {
      const entryWidth = getBookWidth(entry) + 4 // +4 for gap
      if (currentRowWidth + entryWidth > maxRowWidth && currentRow.length > 0) {
        rows.push(currentRow)
        currentRow = [entry]
        currentRowWidth = entryWidth
      } else {
        currentRow.push(entry)
        currentRowWidth += entryWidth
      }
    })
    if (currentRow.length > 0) rows.push(currentRow)

    return (
      <div className="library-shelf-container">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="library-shelf-row">
            <div className="library-shelf-board" />
            <div className="library-books-row">
              {row.map(entry => (
                <div
                  key={entry.id}
                  className={`library-book-spine ${entry.status === 'completed' ? 'completed' : ''}`}
                  style={{
                    width: getBookWidth(entry),
                    height: getBookHeight(entry),
                    background: kindColors[entry.kind]?.gradient || kindColors.book.gradient
                  }}
                  onClick={() => setSelectedEntry(entry)}
                  title={entry.title}
                >
                  <div className="book-spine-content">
                    <span className="book-spine-status">{statusLabels[entry.status]}</span>
                    <span className="book-spine-title">{entry.title.slice(0, 25)}</span>
                    <span className="book-spine-author">{entry.author?.slice(0, 20)}</span>
                    {entry.rating > 0 && (
                      <span className="book-spine-rating">{'⭐'.repeat(Math.min(entry.rating, 3))}</span>
                    )}
                  </div>
                  <div className="book-spine-bottom" />
                </div>
              ))}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="library-empty-shelf">
            <span className="empty-shelf-icon">📚</span>
            <p>Tu estantería está vacía</p>
            <span>Agrega libros, papers, artículos y más</span>
          </div>
        )}
      </div>
    )
  }

  const renderGridView = () => (
    <div className="library-grid-view">
      {sortedEntries.map(entry => (
        <div
          key={entry.id}
          className={`library-book-card ${entry.status === 'completed' ? 'completed' : ''}`}
          onClick={() => setSelectedEntry(entry)}
        >
          <div 
            className="book-card-cover"
            style={{ background: kindColors[entry.kind]?.gradient || kindColors.book.gradient }}
          >
            <span className="book-card-kind">{kindLabels[entry.kind]}</span>
            <span className="book-card-status">{statusLabels[entry.status]}</span>
          </div>
          <div className="book-card-info">
            <h4 className="book-card-title">{entry.title}</h4>
            <p className="book-card-author">{entry.author || 'Autor desconocido'}</p>
            <div className="book-card-footer">
              {entry.rating > 0 && (
                <span className="book-card-rating">{'⭐'.repeat(entry.rating)}</span>
              )}
              {entry.status === 'reading' && (
                <div className="book-card-progress">
                  <div className="progress-mini-bar">
                    <div className="progress-mini-fill" style={{ width: `${entry.progress || 0}%` }} />
                  </div>
                  <span>{entry.progress || 0}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="library-list-view">
      {sortedEntries.map(entry => (
        <div
          key={entry.id}
          className={`library-list-item ${entry.status === 'completed' ? 'completed' : ''}`}
          onClick={() => setSelectedEntry(entry)}
        >
          <span className="list-item-kind">{kindLabels[entry.kind]}</span>
          <div className="list-item-main">
            <h4>{entry.title}</h4>
            <p>{entry.author || 'Autor desconocido'}</p>
          </div>
          <span className="list-item-status">{statusLabels[entry.status]}</span>
          {entry.rating > 0 && (
            <span className="list-item-rating">{'⭐'.repeat(entry.rating)}</span>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="library-shelf-widget">
      {/* Toolbar */}
      <div className="library-toolbar">
        <div className="library-view-switcher">
          <button 
            className={viewMode === 'shelf' ? 'active' : ''} 
            onClick={() => setViewMode('shelf')}
            title="Vista Estantería"
          >
            📚
          </button>
          <button 
            className={viewMode === 'grid' ? 'active' : ''} 
            onClick={() => setViewMode('grid')}
            title="Vista Cuadrícula"
          >
            ▦
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''} 
            onClick={() => setViewMode('list')}
            title="Vista Lista"
          >
            ☰
          </button>
        </div>

        <div className="library-filters">
          <select value={filterKind} onChange={(e) => setFilterKind(e.target.value)}>
            <option value="all">📚 Todos los tipos</option>
            {Object.entries(kindLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dateAdded">📅 Más reciente</option>
            <option value="rating">⭐ Mejor valorado</option>
            <option value="title">🔤 Alfabético</option>
            <option value="status">📊 Por estado</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="library-content">
        {viewMode === 'shelf' && renderShelfView()}
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'list' && renderListView()}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="library-entry-modal" onClick={() => setSelectedEntry(null)}>
          <div className="library-entry-detail" onClick={(e) => e.stopPropagation()}>
            <button className="close-detail-btn" onClick={() => setSelectedEntry(null)}>×</button>
            
            <div className="entry-detail-header">
              <div 
                className="entry-detail-cover"
                style={{ background: kindColors[selectedEntry.kind]?.gradient }}
              >
                <span className="detail-cover-emoji">{kindLabels[selectedEntry.kind].split(' ')[0]}</span>
              </div>
              <div className="entry-detail-info">
                <h2>{selectedEntry.title}</h2>
                <p className="detail-author">{selectedEntry.author || 'Autor desconocido'}</p>
                <div className="detail-meta">
                  <span className="detail-kind">{kindLabels[selectedEntry.kind]}</span>
                  <span className="detail-status">{statusLabels[selectedEntry.status]}</span>
                </div>
              </div>
            </div>

            {selectedEntry.url && (
              <a 
                href={selectedEntry.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="detail-url"
              >
                🔗 Abrir recurso
              </a>
            )}

            {selectedEntry.notes && (
              <div className="detail-notes">
                <h4>📝 Notas</h4>
                <p>{selectedEntry.notes}</p>
              </div>
            )}

            {selectedEntry.tags?.length > 0 && (
              <div className="detail-tags">
                {selectedEntry.tags.map((tag, i) => (
                  <span key={i} className="detail-tag">#{tag}</span>
                ))}
              </div>
            )}

            {/* Progress for reading items */}
            {selectedEntry.status === 'reading' && (
              <div className="detail-progress-section">
                <h4>📖 Progreso de Lectura</h4>
                <div className="progress-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedEntry.progress || 0}
                    onChange={(e) => {
                      const progress = parseInt(e.target.value)
                      onUpdateStatus && onUpdateStatus(selectedEntry.id, { progress })
                      setSelectedEntry({ ...selectedEntry, progress })
                    }}
                    className="progress-slider"
                  />
                  <span className="progress-percentage">{selectedEntry.progress || 0}%</span>
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="detail-rating-section">
              <h4>⭐ Tu Valoración</h4>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star-btn ${star <= (selectedEntry.rating || 0) ? 'active' : ''}`}
                    onClick={() => {
                      onUpdateRating && onUpdateRating(selectedEntry.id, star)
                      setSelectedEntry({ ...selectedEntry, rating: star })
                    }}
                  >
                    {star <= (selectedEntry.rating || 0) ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Actions */}
            <div className="detail-actions">
              <h4>📊 Cambiar Estado</h4>
              <div className="status-buttons">
                {Object.entries(statusLabels).map(([status, emoji]) => (
                  <button
                    key={status}
                    className={`status-btn ${selectedEntry.status === status ? 'active' : ''}`}
                    onClick={() => {
                      onUpdateStatus && onUpdateStatus(selectedEntry.id, { status })
                      setSelectedEntry({ ...selectedEntry, status })
                    }}
                  >
                    {emoji} {status.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Delete */}
            <button 
              className="detail-delete-btn"
              onClick={() => {
                if (window.confirm('¿Eliminar este recurso?')) {
                  onDelete && onDelete(selectedEntry.id)
                  setSelectedEntry(null)
                }
              }}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LibraryShelf
