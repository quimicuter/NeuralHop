import React, { useState, useEffect } from 'react'
import './NotesRepository.css'

const NotesRepository = () => {
  const [notes, setNotes] = useState([])
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#fbf72486' })
  const [editingNote, setEditingNote] = useState(null)
  const [selectedNotes, setSelectedNotes] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const savedNotes = localStorage.getItem('neuralhop-notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  const saveNotes = (updatedNotes) => {
    localStorage.setItem('neuralhop-notes', JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
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

  const handleDeleteNotes = () => {
    const updatedNotes = notes.filter(note => !selectedNotes.has(note.id))
    saveNotes(updatedNotes)
    setSelectedNotes(new Set())
    setShowDeleteConfirm(false)
  }

  const handleCopyNote = (content) => {
    navigator.clipboard.writeText(content)
  }

  const toggleNoteSelection = (noteId) => {
    const newSelected = new Set(selectedNotes)
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId)
    } else {
      newSelected.add(noteId)
    }
    setSelectedNotes(newSelected)
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

      {/* Lista de notas */}
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-notes">
            <p>📝 No tienes notas aún</p>
            <p>Click en "+" para comenzar</p>
          </div>
        ) : (
          notes.map(note => (
            <div 
              key={note.id}
              className={`note-item ${selectedNotes.has(note.id) ? 'selected' : ''}`}
              onClick={() => toggleNoteSelection(note.id)}
              style={{ borderLeftColor: note.color }}
            >
              <div className="note-item-header">
                <h4 className="note-item-title">{note.title}</h4>
                <div className="note-actions">
                  <button 
                    className="note-action-btn"
                    onClick={(e) => { e.stopPropagation(); setEditingNote(note); }}
                  >
                    ✏️
                  </button>
                  <button 
                    className="note-action-btn"
                    onClick={(e) => { e.stopPropagation(); handleCopyNote(note.content); }}
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div className="note-preview">
                <p className="note-content-text">
                  {note.content.length > 80 
                    ? `${note.content.substring(0, 80)}...` 
                    : note.content
                  }
                </p>
              </div>
              
              <div className="note-meta">
                <span className="note-date">{formatDate(note.updatedAt)}</span>
              </div>
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="note-modal-overlay">
          <div className="note-modal confirm-modal">
            <h4 className="note-modal-title">¿Eliminar notas?</h4>
            <p className="confirm-text">Se eliminarán {selectedNotes.size} nota(s).</p>
            <div className="note-modal-actions">
              <button className="note-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button className="note-delete-btn" onClick={handleDeleteNotes}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesRepository
