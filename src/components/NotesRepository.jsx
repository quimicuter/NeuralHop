import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import './NotesRepository.css'

const NotesRepository = () => {
  const { state, actions } = useApp()
  const [notes, setNotes] = useState([]) // EXORCISMO: Estado inicial estrictamente vacío
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#fbf72486' })
  const [editingNote, setEditingNote] = useState(null)
  const [selectedNoteId, setSelectedNoteId] = useState(null) // Cambiado: selección individual para eliminar
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copiedId, setCopiedId] = useState(null) // Para feedback visual de copiado

  useEffect(() => {
    // Cargar notas desde Firebase y localStorage
    const loadNotes = () => {
      // Primero intentar cargar desde el estado global (Firebase)
      if (state.notes && state.notes.length > 0) {
        setNotes(state.notes)
        // Sincronizar localStorage como respaldo
        localStorage.setItem('neuralhop-notes', JSON.stringify(state.notes))
      } else {
        // Si no hay notas en Firebase, cargar desde localStorage
        const savedNotes = localStorage.getItem('neuralhop-notes')
        if (savedNotes) {
          const localNotes = JSON.parse(savedNotes)
          setNotes(localNotes)
          // Sincronizar notas locales con Firebase
          actions.setNotes(localNotes)
        }
      }
    }
    loadNotes()
  }, [state.notes])

  const saveNotes = (updatedNotes) => {
    // Guardar en localStorage como respaldo inmediato
    localStorage.setItem('neuralhop-notes', JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
    
    // Sincronizar con Firebase a través del contexto
    try {
      actions.setNotes(updatedNotes)
    } catch (error) {
      console.warn('Error sincronizando notas con Firebase:', error)
    }
  }

  const handleAddNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note = {
        id: Date.now(),
        title: newNote.title.trim() || 'Nota sin título',
        content: newNote.content.trim(),
        color: newNote.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      saveNotes([...notes, note])
      setNewNote({ title: '', content: '', color: '#fbf72486' })
      setIsAddingNote(false)
    }
  }

  const handleEditNote = () => {
    if (editingNote) {
      const updatedNotes = notes.map(note =>
        note.id === editingNote.id
          ? { ...note, ...editingNote, updatedAt: new Date().toISOString() }
          : note
      )
      saveNotes(updatedNotes)
      setEditingNote(null)
    }
  }

  const handleDeleteNote = (noteId) => {
    if (window.confirm('¿Estás segura de que deseas eliminar esta nota?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId)
      saveNotes(updatedNotes)
    }
  }

  const handleDeleteSelected = () => {
    const updatedNotes = notes.filter(note => note.id !== selectedNoteId)
    saveNotes(updatedNotes)
    setSelectedNoteId(null)
    setShowDeleteConfirm(false)
  }

  const handleCopyNote = async (content, noteId) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(noteId)
      setTimeout(() => setCopiedId(null), 2000) // Reset después de 2 segundos
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  const handleNoteClick = (note, e) => {
    // Si hizo clic en un botón de acción, no abrir edición
    if (e.target.closest('.note-action-btn')) return
    setEditingNote(note)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const noteColors = [
    '#fbf72486', // amarillo suave
    '#dbeafe',   // azul pastel
    '#ede9fe',   // índigo pastel
    '#d1fae5',   // verde pastel
    '#fee2e2',   // rojo pastel
    '#ffedd5',   // naranja pastel
    '#f3f4f6',   // gris claro
  ]

  return (
    <div className="notes-repository">
      {/* Header estético y alineado */}
      <div className="notes-header">
        <h3 className="notes-title">Notas Rápidas</h3>
        <button 
          className="add-note-btn"
          onClick={() => setIsAddingNote(true)}
        >
          +
        </button>
      </div>

      {/* Controles de selección */}
      {selectedNotes.size > 0 && (
        <div className="selection-controls">
          <span className="selection-count">
            {selectedNotes.size} nota{selectedNotes.size > 1 ? 's' : ''} seleccionada{selectedNotes.size > 1 ? 's' : ''}
          </span>
          <button 
            className="delete-selected-btn"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑️ Eliminar
          </button>
        </div>
      )}

      {/* Lista de notas - REDISEÑO COMPLETO */}
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-notes">
            <p>No hay notas aún. ✨</p>
          </div>
        ) : (
          notes.map(note => (
            <div 
              key={note.id}
              className={`note-item ${selectedNoteId === note.id ? 'selected' : ''} ${copiedId === note.id ? 'just-copied' : ''}`}
              onClick={(e) => handleNoteClick(note, e)}
              style={{ borderLeftColor: note.color }}
            >
              {/* HEADER: Título izquierda, fecha + iconos derecha */}
              <div className="note-item-header">
                <h4 className="note-item-title">{note.title}</h4>
                <div className="note-header-right">
                  <span className="note-date">{formatDate(note.updatedAt)}</span>
                  <div className="note-actions">
                    <button 
                      className="note-action-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopyNote(note.content, note.id); }}
                      title="Copiar"
                    >
                      📋
                    </button>
                    <button 
                      className="note-action-btn"
                      onClick={(e) => { e.stopPropagation(); setEditingNote(note); }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="note-action-btn delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                      title="Eliminar"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
              
              {/* CUERPO: Truncado con ellipsis (2 líneas máximo) */}
              <div className="note-preview">
                <p className="note-content-text">{note.content}</p>
              </div>
              
              {/* Feedback visual de copiado */}
              {copiedId === note.id && (
                <div className="copy-feedback">¡Copiado!</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal estético para agregar/editar nota */}
      {(isAddingNote || editingNote) && (
        <div className="note-modal-overlay">
          <div className="note-modal">
            <div className="note-modal-header">
              <h4 className="note-modal-title">{editingNote ? 'Editar Nota' : 'Nueva Nota'}</h4>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setIsAddingNote(false)
                  setEditingNote(null)
                  setNewNote({ title: '', content: '', color: '#fbf72486' })
                }}
              >
                ×
              </button>
            </div>
            
            <div className="note-form">
              <input
                type="text"
                placeholder="Título de la nota..."
                value={editingNote ? editingNote.title : newNote.title}
                onChange={(e) => editingNote 
                  ? setEditingNote({...editingNote, title: e.target.value})
                  : setNewNote({...newNote, title: e.target.value})
                }
                className="note-title-input"
              />
              
              <textarea
                placeholder="Escribe tu nota aquí..."
                value={editingNote ? editingNote.content : newNote.content}
                onChange={(e) => editingNote
                  ? setEditingNote({...editingNote, content: e.target.value})
                  : setNewNote({...newNote, content: e.target.value})
                }
                className="note-content-input"
                rows={6}
              />
              
              <div className="note-colors">
                <span>Color:</span>
                {noteColors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${(editingNote ? editingNote.color : newNote.color) === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => editingNote
                      ? setEditingNote({...editingNote, color})
                      : setNewNote({...newNote, color})
                    }
                  />
                ))}
              </div>
              
              <div className="note-modal-actions">
                <button 
                  className="note-cancel-btn"
                  onClick={() => {
                    setIsAddingNote(false)
                    setEditingNote(null)
                    setNewNote({ title: '', content: '', color: '#fbf72486' })
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="note-save-btn"
                  onClick={editingNote ? handleEditNote : handleAddNote}
                >
                  {editingNote ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación (Legacy - ahora usamos window.confirm) */}
      {showDeleteConfirm && (
        <div className="note-modal-overlay">
          <div className="note-modal confirm-modal">
            <h4 className="note-modal-title">¿Eliminar nota?</h4>
            <p className="confirm-text">Esta acción no se puede deshacer.</p>
            <div className="note-modal-actions">
              <button className="note-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button className="note-delete-btn" onClick={handleDeleteSelected}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesRepository
