import React, { useState, useMemo } from 'react'
import './GrimoireSearch.css'

const highlightText = (text, query) => {
  if (!query || !text) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) => 
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  )
}

function GrimoireSearch({ notes, onNoteClick, onNoteEdit, onNoteDelete }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    tags: [],
    hasLinks: null, // null = all, true = has links, false = no links
    dateRange: 'all' // 'all', 'today', 'week', 'month'
  })
  const [sortBy, setSortBy] = useState('relevance') // 'relevance', 'newest', 'oldest', 'title'
  const [viewMode, setViewMode] = useState('compact') // 'compact', 'detailed'
  const [selectedNote, setSelectedNote] = useState(null)

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set()
    notes.forEach(note => {
      (note.tags || []).forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [notes])

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let results = notes.filter(note => {
      // Text search
      const searchLower = query.toLowerCase()
      const matchesQuery = !query || 
        note.title?.toLowerCase().includes(searchLower) ||
        note.content?.toLowerCase().includes(searchLower) ||
        (note.tags || []).some(t => t.toLowerCase().includes(searchLower))

      // Tag filter
      const matchesTags = filters.tags.length === 0 ||
        filters.tags.every(tag => (note.tags || []).includes(tag))

      // Links filter
      const hasLinks = (note.content?.match(/\[\[[^\]]+\]\]/g) || []).length > 0
      const matchesLinks = filters.hasLinks === null || 
        filters.hasLinks === hasLinks

      // Date filter
      let matchesDate = true
      if (filters.dateRange !== 'all' && note.dateCreated) {
        const noteDate = new Date(note.dateCreated)
        const now = new Date()
        switch (filters.dateRange) {
          case 'today':
            matchesDate = noteDate.toDateString() === now.toDateString()
            break
          case 'week':
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
            matchesDate = noteDate >= weekAgo
            break
          case 'month':
            const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
            matchesDate = noteDate >= monthAgo
            break
        }
      }

      return matchesQuery && matchesTags && matchesLinks && matchesDate
    })

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0)
        case 'oldest':
          return new Date(a.dateCreated || 0) - new Date(b.dateCreated || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'relevance':
        default:
          if (!query) return 0
          // Title match scores higher than content match
          const aTitle = a.title?.toLowerCase().includes(query.toLowerCase()) ? 2 : 0
          const bTitle = b.title?.toLowerCase().includes(query.toLowerCase()) ? 2 : 0
          const aContent = a.content?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
          const bContent = b.content?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
          return (bTitle + bContent) - (aTitle + aContent)
      }
    })

    return results
  }, [notes, query, filters, sortBy])

  const toggleTag = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const clearFilters = () => {
    setFilters({
      tags: [],
      hasLinks: null,
      dateRange: 'all'
    })
    setQuery('')
  }

  const extractLinks = (content) => {
    const matches = content?.match(/\[\[([^\]]+)\]\]/g) || []
    return matches.map(m => m.slice(2, -2))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric',
      hour: date.getHours() !== 0 ? '2-digit' : undefined,
      minute: date.getHours() !== 0 ? '2-digit' : undefined
    })
  }

  const getNotePreview = (content, query) => {
    if (!content) return ''
    const maxLength = 120
    if (!query) return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '')
    
    // Find the query in content and show context around it
    const searchLower = query.toLowerCase()
    const contentLower = content.toLowerCase()
    const index = contentLower.indexOf(searchLower)
    
    if (index === -1) return content.slice(0, maxLength) + '...'
    
    const start = Math.max(0, index - 40)
    const end = Math.min(content.length, index + query.length + 40)
    return (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '')
  }

  return (
    <div className="grimoire-search-widget">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar en el grimorio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="clear-search" onClick={() => setQuery('')}>
              ×
            </button>
          )}
        </div>
        
        <div className="search-stats">
          {filteredNotes.length} de {notes.length} notas
        </div>
      </div>

      {/* Filters Bar */}
      <div className="search-filters-bar">
        <div className="filter-group">
          <label>📅 Fecha:</label>
          <select 
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          >
            <option value="all">Todas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>

        <div className="filter-group">
          <label>🔗 Links:</label>
          <select
            value={filters.hasLinks === null ? 'all' : filters.hasLinks ? 'yes' : 'no'}
            onChange={(e) => {
              const val = e.target.value
              setFilters(prev => ({ 
                ...prev, 
                hasLinks: val === 'all' ? null : val === 'yes'
              }))
            }}
          >
            <option value="all">Todas</option>
            <option value="yes">Con links</option>
            <option value="no">Sin links</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📊 Orden:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="relevance">Relevancia</option>
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="title">Título A-Z</option>
          </select>
        </div>

        <button className="clear-filters-btn" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="tags-filter-section">
          <span className="tags-label">🏷️ Tags:</span>
          <div className="tags-filter-list">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-filter-btn ${filters.tags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={viewMode === 'compact' ? 'active' : ''}
          onClick={() => setViewMode('compact')}
        >
          ☰ Compacto
        </button>
        <button 
          className={viewMode === 'detailed' ? 'active' : ''}
          onClick={() => setViewMode('detailed')}
        >
          ▦ Detallado
        </button>
      </div>

      {/* Results */}
      <div className={`search-results ${viewMode}`}>
        {filteredNotes.length === 0 ? (
          <div className="search-empty">
            <span className="empty-icon">🔮</span>
            <p>No se encontraron notas</p>
            <span>Prueba con otros términos de búsqueda</span>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className={`search-result-item ${selectedNote === note.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedNote(note.id)
                onNoteClick && onNoteClick(note)
              }}
            >
              <div className="result-header">
                <div className="result-title-row">
                  <span 
                    className="result-color"
                    style={{ background: note.color || '#8B5CF6' }}
                  />
                  <h4 className="result-title">
                    {query ? highlightText(note.title, query) : note.title}
                  </h4>
                  <span className="result-date">{formatDate(note.dateCreated)}</span>
                </div>
                
                <div className="result-actions">
                  <button 
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onNoteEdit && onNoteEdit(note)
                    }}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm(`¿Eliminar "${note.title}"?`)) {
                        onNoteDelete && onNoteDelete(note.id)
                      }
                    }}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {viewMode === 'detailed' && (
                <div className="result-preview">
                  {query 
                    ? highlightText(getNotePreview(note.content, query), query)
                    : getNotePreview(note.content, query)
                  }
                </div>
              )}

              <div className="result-footer">
                {(note.tags || []).length > 0 && (
                  <div className="result-tags">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="result-tag">#{tag}</span>
                    ))}
                  </div>
                )}
                
                {(() => {
                  const links = extractLinks(note.content)
                  return links.length > 0 && (
                    <div className="result-links">
                      <span className="links-icon">🔗</span>
                      <span className="links-count">{links.length}</span>
                    </div>
                  )
                })()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GrimoireSearch
