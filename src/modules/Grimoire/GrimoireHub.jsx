import React, { useState, useEffect, useCallback } from 'react'
import { GrimoireGraph, GrimoireSearch } from '../../widgets/grimoire'
import './Grimoire.css'

const GRIMOIRE_STORAGE_KEY = 'neuralhop-grimoire-db'

const initialGrimoireData = [
  {
    id: 1,
    title: 'Conceptos de Química Orgánica',
    content: `# Reactivos de Grignard

Los reactivos de Grignard son compuestos organometálicos de fórmula general R-Mg-X.

## Usos principales:
- Síntesis de alcoholes
- Formación de enlaces carbono-carbono
- Preparación de ácidos carboxílicos

## Precauciones:
⚠️ Son muy sensibles al agua y al aire.
⚠️ Trabajar siempre bajo atmósfera inerte.`,
    tags: ['química', 'orgánica', 'laboratorio'],
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Protocolo KAUST VSRP',
    content: `# Preparación de documentos

## Requisitos:
1. CV actualizado
2. Carta de motivación
3. Transcripción de calificaciones
4. 2 cartas de recomendación

## Contactos:
- Dr. Niveen Khashab (PI)
- Carlos Saul Osorio-González (Collaborator)`,
    tags: ['maestría', 'KAUST', 'trámites'],
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString()
  }
]

function GrimoireHub({ isOpen, onClose }) {
  const [notes, setNotes] = useState([])
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'graph' | 'search'
  const [isCreating, setIsCreating] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [],
    color: '#8B5CF6'
  })
  
  // Colors for notes
  const noteColors = [
    { name: 'Violeta', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Ámbar', value: '#F59E0B' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Esmeralda', value: '#34D399' }
  ]

  useEffect(() => {
    const stored = window.localStorage.getItem(GRIMOIRE_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setNotes(parsed)
        if (parsed.length > 0 && !selectedNoteId) {
          setSelectedNoteId(parsed[0].id)
        }
      } catch (error) {
        console.warn('Grimoire DB load failed:', error)
        setNotes(initialGrimoireData)
        setSelectedNoteId(initialGrimoireData[0].id)
      }
    } else {
      setNotes(initialGrimoireData)
      setSelectedNoteId(initialGrimoireData[0].id)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(GRIMOIRE_STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  const selectedNote = notes.find(n => n.id === selectedNoteId)

  const nextId = useCallback(() => {
    return notes.reduce((max, note) => Math.max(max, note.id), 0) + 1
  }, [notes])

  // Parse backlinks from content [[Note Title]]
  const extractBacklinks = useCallback((content) => {
    const matches = content?.match(/\[\[([^\]]+)\]\]/g) || []
    return matches.map(m => m.slice(2, -2).trim().toLowerCase())
  }, [])

  // Get backlinks pointing TO this note
  const getBacklinksTo = useCallback((noteId) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return []
    return notes.filter(n => {
      if (n.id === noteId) return false
      const links = extractBacklinks(n.content)
      return links.includes(note.title.toLowerCase())
    })
  }, [notes, extractBacklinks])

  const createNote = () => {
    if (!newNote.title.trim()) return
    
    const note = {
      id: nextId(),
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      tags: newNote.tags.filter(t => t.trim()),
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString()
    }
    
    setNotes(prev => [note, ...prev])
    setSelectedNoteId(note.id)
    setIsCreating(false)
    setNewNote({ title: '', content: '', tags: [] })
  }

  const updateNote = (noteId, updates) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, dateModified: new Date().toISOString() }
        : note
    ))
  }

  const deleteNote = (noteId) => {
    if (window.confirm('¿Eliminar esta entrada del grimorio?')) {
      setNotes(prev => {
        const filtered = prev.filter(n => n.id !== noteId)
        if (selectedNoteId === noteId && filtered.length > 0) {
          setSelectedNoteId(filtered[0].id)
        } else if (filtered.length === 0) {
          setSelectedNoteId(null)
        }
        return filtered
      })
    }
  }

  const getAllTags = () => {
    const tagSet = new Set()
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = selectedTag === 'all' ||
      note.tags?.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="hub-overlay" onClick={onClose}>
      <div className="hub-container" onClick={(e) => e.stopPropagation()}>
        {/* Header con Tabs */}
        <div className="grimoire-v2-header">
          <div className="grimoire-title-section">
            <div className="grimoire-label">🔮 Grimorio</div>
            <h2 className="hub-title">Archivo de Conocimiento</h2>
            <p>{notes.length} notas • {getAllTags().length} etiquetas • Usa [[Título]] para vincular</p>
          </div>
          
          <div className="grimoire-tabs">
            <button 
              className={activeTab === 'notes' ? 'active' : ''}
              onClick={() => { setActiveTab('notes'); setIsCreating(false) }}
            >
              📝 Notas
            </button>
            <button 
              className={activeTab === 'graph' ? 'active' : ''}
              onClick={() => { setActiveTab('graph'); setIsCreating(false) }}
            >
              🕸️ Grafo
            </button>
            <button 
              className={activeTab === 'search' ? 'active' : ''}
              onClick={() => { setActiveTab('search'); setIsCreating(false) }}
            >
              🔍 Buscar
            </button>
          </div>
          
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Main Content */}
        <div className="hub-content">
          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="grimoire-notes-layout">
              {/* Sidebar */}
              <section className="grimoire-sidebar-v2">
                <div className="sidebar-header">
                  <button 
                    className="grimoire-add-btn-v2"
                    onClick={() => {
                      setIsCreating(true)
                      setSelectedNoteId(null)
                    }}
                  >
                    <span>+</span> Nueva Nota
                  </button>
                </div>

                <div className="notes-list-v2">
                  {notes.length === 0 ? (
                    <p className="notes-empty">No hay notas. ¡Crea tu primera entrada!</p>
                  ) : (
                    notes.map(note => (
                      <div
                        key={note.id}
                        className={`note-item-v2 ${selectedNoteId === note.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedNoteId(note.id)
                          setIsCreating(false)
                        }}
                      >
                        <div 
                          className="note-color-indicator"
                          style={{ background: note.color || '#8B5CF6' }}
                        />
                        <div className="note-item-content">
                          <h4>{note.title || 'Sin título'}</h4>
                          <div className="note-item-meta">
                            <span>{formatDate(note.dateModified)}</span>
                            {note.tags?.length > 0 && (
                              <span className="note-item-tags">
                                {note.tags.slice(0, 2).map(t => `#${t}`).join(' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Editor */}
              <section className="grimoire-editor-v2">
                {isCreating ? (
                  <div className="create-note-v2">
                    <h3>✨ Nueva Nota</h3>
                    
                    <div className="field-group-v2">
                      <label>Título</label>
                      <input
                        type="text"
                        value={newNote.title}
                        onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título de la nota..."
                        autoFocus
                      />
                    </div>

                    <div className="field-group-v2">
                      <label>Contenido</label>
                      <textarea
                        value={newNote.content}
                        onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        placeholder={`Escribe tu nota...\n\n💡 Tip: Usa [[Nombre de Nota]] para crear links`}
                        rows={15}
                      />
                    </div>

                    <div className="field-row-v2">
                      <div className="field-group-v2">
                        <label>Etiquetas</label>
                        <input
                          type="text"
                          value={newNote.tags.join(', ')}
                          onChange={(e) => setNewNote(prev => ({ 
                            ...prev, 
                            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          }))}
                          placeholder="tag1, tag2, tag3..."
                        />
                      </div>
                      
                      <div className="field-group-v2">
                        <label>Color</label>
                        <div className="color-picker-v2">
                          {noteColors.map(c => (
                            <button
                              key={c.value}
                              className={newNote.color === c.value ? 'active' : ''}
                              style={{ background: c.value }}
                              onClick={() => setNewNote(prev => ({ ...prev, color: c.value }))}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="actions-v2">
                      <button className="primary-btn-v2" onClick={createNote}>
                        Crear nota
                      </button>
                      <button 
                        className="secondary-btn-v2" 
                        onClick={() => {
                          setIsCreating(false)
                          if (notes.length > 0) setSelectedNoteId(notes[0].id)
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : selectedNote ? (
                  <div className="edit-note-v2">
                    <div className="edit-header-v2">
                      <input
                        type="text"
                        value={selectedNote.title}
                        onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                        className="edit-title-v2"
                        placeholder="Título..."
                      />
                      <div className="edit-meta-v2">
                        <span className="last-modified">
                          Modificado: {formatDateTime(selectedNote.dateModified)}
                        </span>
                        <div className="color-picker-mini">
                          {noteColors.map(c => (
                            <button
                              key={c.value}
                              className={selectedNote.color === c.value ? 'active' : ''}
                              style={{ background: c.value }}
                              onClick={() => updateNote(selectedNote.id, { color: c.value })}
                            />
                          ))}
                        </div>
                        <button 
                          className="delete-btn-v2"
                          onClick={() => deleteNote(selectedNote.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {selectedNote.tags?.length > 0 && (
                      <div className="edit-tags-v2">
                        {selectedNote.tags.map(tag => (
                          <span key={tag} className="tag-badge">#{tag}</span>
                        ))}
                      </div>
                    )}

                    <textarea
                      value={selectedNote.content}
                      onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                      className="edit-content-v2"
                      placeholder="Escribe tu nota... Usa [[Título]] para vincular"
                    />

                    {/* Backlinks Section */}
                    {(() => {
                      const backlinks = getBacklinksTo(selectedNote.id)
                      if (backlinks.length === 0) return null
                      return (
                        <div className="backlinks-section">
                          <h5>🔗 Vinculado desde ({backlinks.length})</h5>
                          <div className="backlinks-list">
                            {backlinks.map(link => (
                              <button
                                key={link.id}
                                className="backlink-item"
                                onClick={() => setSelectedNoteId(link.id)}
                              >
                                <span 
                                  className="backlink-color"
                                  style={{ background: link.color || '#8B5CF6' }}
                                />
                                {link.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Outgoing Links Preview */}
                    {(() => {
                      const outgoing = extractBacklinks(selectedNote.content)
                      if (outgoing.length === 0) return null
                      return (
                        <div className="outgoing-links-section">
                          <h5>→ Links a ({outgoing.length})</h5>
                          <div className="outgoing-links-list">
                            {outgoing.map((title, i) => {
                              const targetNote = notes.find(n => 
                                n.title.toLowerCase() === title.toLowerCase()
                              )
                              return (
                                <button
                                  key={i}
                                  className={`outgoing-link-item ${targetNote ? 'exists' : 'missing'}`}
                                  onClick={() => targetNote && setSelectedNoteId(targetNote.id)}
                                >
                                  {targetNote && (
                                    <span 
                                      className="link-color"
                                      style={{ background: targetNote.color || '#8B5CF6' }}
                                    />
                                  )}
                                  [[{title}]]
                                  {!targetNote && <span className="missing-badge">crear</span>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="empty-editor-v2">
                    <span className="empty-icon">🔮</span>
                    <p>Selecciona una nota para editar</p>
                    <span>o crea una nueva entrada</span>
                  </div>
                )}
              </section>

              {/* Preview Panel */}
              <section className="grimoire-preview-v2">
                <h4>Vista Previa</h4>
                {selectedNote ? (
                  <div className="preview-content-v2">
                    <div className="preview-header" style={{ borderLeftColor: selectedNote.color || '#8B5CF6' }}>
                      <h3>{selectedNote.title}</h3>
                      <span className="preview-date">{formatDateTime(selectedNote.dateModified)}</span>
                    </div>
                    <div className="markdown-preview-v2">
                      {selectedNote.content?.split('\n').map((line, i) => {
                        // Parse [[links]] in preview
                        const parseLine = (text) => {
                          const parts = text.split(/(\[\[[^\]]+\]\])/g)
                          return parts.map((part, j) => {
                            if (part.startsWith('[[') && part.endsWith(']]')) {
                              const linkTitle = part.slice(2, -2)
                              const linkedNote = notes.find(n => 
                                n.title.toLowerCase() === linkTitle.toLowerCase()
                              )
                              return (
                                <span 
                                  key={j} 
                                  className={`preview-link ${linkedNote ? 'exists' : 'missing'}`}
                                  onClick={() => linkedNote && setSelectedNoteId(linkedNote.id)}
                                >
                                  {linkTitle}
                                </span>
                              )
                            }
                            return part
                          })
                        }
                        
                        if (line.startsWith('# ')) {
                          return <h1 key={i}>{parseLine(line.slice(2))}</h1>
                        } else if (line.startsWith('## ')) {
                          return <h2 key={i}>{parseLine(line.slice(3))}</h2>
                        } else if (line.startsWith('### ')) {
                          return <h3 key={i}>{parseLine(line.slice(4))}</h3>
                        } else if (line.startsWith('- ')) {
                          return <li key={i}>{parseLine(line.slice(2))}</li>
                        } else if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i}><strong>{parseLine(line.slice(2, -2))}</strong></p>
                        } else if (line.trim()) {
                          return <p key={i}>{parseLine(line)}</p>
                        }
                        return <br key={i} />
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="preview-placeholder">Selecciona una nota</p>
                )}
              </section>
            </div>
          )}

          {/* GRAPH TAB */}
          {activeTab === 'graph' && (
            <div className="grimoire-graph-layout">
              <GrimoireGraph
                notes={notes}
                onNoteClick={(noteId) => {
                  setSelectedNoteId(noteId)
                  setActiveTab('notes')
                }}
                highlightedNote={selectedNoteId}
              />
            </div>
          )}

          {/* SEARCH TAB */}
          {activeTab === 'search' && (
            <div className="grimoire-search-layout">
              <GrimoireSearch
                notes={notes}
                onNoteClick={(note) => {
                  setSelectedNoteId(note.id)
                  setActiveTab('notes')
                }}
                onNoteEdit={(note) => {
                  setSelectedNoteId(note.id)
                  setActiveTab('notes')
                }}
                onNoteDelete={deleteNote}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GrimoireHub
