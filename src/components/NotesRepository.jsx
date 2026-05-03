import React, { useState, useEffect } from 'react'
import './NotesRepository.css'

const NotesRepository = () => {
  const [notes, setNotes] = useState([])
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#fbbf24' })
  const [editingNote, setEditingNote] = useState(null)
  const [selectedNotes, setSelectedNotes] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Cargar notas desde localStorage o Firebase
  useEffect(() => {
    const savedNotes = localStorage.getItem('neuralhop-notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  // Guardar notas en localStorage
  const saveNotes = (updatedNotes) => {
    localStorage.setItem('neuralhop-notes', JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
  }

  // Agregar nueva nota
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
      setNewNote({ title: '', content: '', color: '#fbbf24' })
      setIsAddingNote(false)
    }
  }

  // Editar nota
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

  // Eliminar notas seleccionadas
  const handleDeleteNotes = () => {
    const updatedNotes = notes.filter(note => !selectedNotes.has(note.id))
    saveNotes(updatedNotes)
    setSelectedNotes(new Set())
    setShowDeleteConfirm(false)
  }

  // Copiar texto al portapapeles
  const handleCopyNote = (content) => {
    navigator.clipboard.writeText(content)
    // Podríamos agregar una notificación toast aquí
  }

  // Toggle selección de nota
  const toggleNoteSelection = (noteId) => {
    const newSelected = new Set(selectedNotes)
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId)
    } else {
      newSelected.add(noteId)
    }
    setSelectedNotes(newSelected)
  }

  // Formato de fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Colores disponibles para notas
  const noteColors = [
    '#fbbf24', // amarillo
    '#60a5fa', // azul
    '#a78bfa', // índigo
    '#34d399', // verde
    '#f56565', // rojo
    '#f6ad55', // naranja
    '#e5e7eb', // gris
  ]

  return (
    <div className="notes-repository">
      <div className="notes-header">
        <h3>📝 Notas Rápidas</h3>
        <button 
          className="add-note-btn"
          onClick={() => setIsAddingNote(true)}
        >
          + Nueva Nota
        </button>
      </div>

      {/* Modal para agregar/editar nota */}
      {(isAddingNote || editingNote) && (
        <div className="note-modal-overlay">
          <div className="note-modal">
            <div className="note-modal-header">
              <h4>{editingNote ? 'Editar Nota' : 'Nueva Nota'}</h4>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setIsAddingNote(false)
                  setEditingNote(null)
                  setNewNote({ title: '', content: '', color: '#fbbf24' })
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
                  className="cancel-btn"
                  onClick={() => {
                    setIsAddingNote(false)
                    setEditingNote(null)
                    setNewNote({ title: '', content: '', color: '#fbbf24' })
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="save-btn"
                  onClick={editingNote ? handleEditNote : handleAddNote}
                >
                  {editingNote ? 'Guardar Cambios' : 'Crear Nota'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            🗑️ Eliminar Seleccionadas
          </button>
        </div>
      )}

      {/* Lista de notas con scroll */}
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-notes">
            <p>📝 No tienes notas aún</p>
            <p>Click en "+ Nueva Nota" para comenzar</p>
          </div>
        ) : (
          notes.map(note => (
            <div 
              key={note.id}
              className={`note-item ${selectedNotes.has(note.id) ? 'selected' : ''}`}
              onClick={() => toggleNoteSelection(note.id)}
            >
              <div className="note-item-header">
                <div className="note-color-indicator" style={{ backgroundColor: note.color }}></div>
                <h4 className="note-title">{note.title}</h4>
                <div className="note-actions">
                  <button 
                    className="note-action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingNote(note)
                    }}
                    title="Editar nota"
                  >
                    ✏️
                  </button>
                  <button 
                    className="note-action-btn copy-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyNote(note.content)
                    }}
                    title="Copiar texto"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div className="note-preview">
                <p className="note-content">
                  {note.content.length > 100 
                    ? `${note.content.substring(0, 100)}...` 
                    : note.content
                  }
                </p>
                {note.content.length > 100 && (
                  <button 
                    className="expand-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Aquí podríamos mostrar la nota completa en un modal
                    }}
                  >
                    Ver más
                  </button>
                )}
              </div>
              
              <div className="note-meta">
                <span className="note-date">{formatDate(note.updatedAt)}</span>
                {note.updatedAt !== note.createdAt && (
                  <span className="note-modified">• Modificada</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h4>¿Eliminar Notas?</h4>
            <p>Se eliminarán {selectedNotes.size} nota{selectedNotes.size > 1 ? 's' : ''} permanentemente.</p>
            <div className="confirm-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button 
                className="delete-btn"
                onClick={handleDeleteNotes}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesRepository
