import React, { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { LibraryShelf, ReadingProgress, ReadingStats } from '../../widgets/library'
import './Library.css'

const LIBRARY_STORAGE_KEY = 'neuralhop-library-db'

const initialLibraryData = [
  {
    id: 1,
    kind: 'book',
    title: 'Atomic Habits',
    author: 'James Clear',
    status: 'reading',
    rating: 0,
    notes: 'Hábitos atómicos para mejorar 1% cada día',
    tags: ['productividad', 'hábitos'],
    url: '',
    dateAdded: new Date().toISOString(),
    dateCompleted: null
  },
  {
    id: 2,
    kind: 'paper',
    title: 'Smart Materials Review',
    author: 'Dr. Niveen Khashab',
    status: 'reference',
    rating: 5,
    notes: 'Paper clave para investigación de materiales inteligentes',
    tags: ['investigación', 'química', 'KAUST'],
    url: 'https://www.nature.com',
    dateAdded: new Date().toISOString(),
    dateCompleted: null
  }
]

const kindOptions = [
  { value: 'book', label: 'Libro', emoji: '�' },
  { value: 'paper', label: 'Paper', emoji: '�' },
  { value: 'article', label: 'Artículo', emoji: '📰' },
  { value: 'video', label: 'Video', emoji: '🎬' },
  { value: 'course', label: 'Curso', emoji: '🎓' }
]

const quickAddFields = {
  book: { label: 'Título del libro', placeholder: 'Ej: Atomic Habits', authorLabel: 'Autor', authorPlaceholder: 'Ej: James Clear' },
  paper: { label: 'Título del paper', placeholder: 'Ej: Smart Materials Review', authorLabel: 'Autor / Revista', authorPlaceholder: 'Ej: Nature Chemistry' },
  article: { label: 'Título del artículo', placeholder: 'Ej: The Future of AI', authorLabel: 'Sitio / Autor', authorPlaceholder: 'Ej: Medium / MIT' },
  video: { label: 'Título del video', placeholder: 'Ej: Introducción a React', authorLabel: 'Canal / Plataforma', authorPlaceholder: 'Ej: YouTube / Fireship' },
  course: { label: 'Nombre del curso', placeholder: 'Ej: CS50', authorLabel: 'Universidad / Profesor', authorPlaceholder: 'Ej: Harvard / David Malan' }
}

function LibraryHub({ isOpen, onClose }) {
  const { state, actions } = useApp()
  const [libraryData, setLibraryData] = useState([])
  const [quickCapture, setQuickCapture] = useState({ 
    kind: 'book', 
    title: '', 
    author: '', 
    url: '',
    notes: '',
    status: 'want-to-read'
  })
  const [activeTab, setActiveTab] = useState('shelf') // 'shelf' | 'add' | 'import'
  const [importData, setImportData] = useState('')
  const [importError, setImportError] = useState('')

  useEffect(() => {
    const stored = window.localStorage.getItem(LIBRARY_STORAGE_KEY)
    if (stored) {
      try {
        setLibraryData(JSON.parse(stored))
        return
      } catch (error) {
        console.warn('Library DB load failed:', error)
      }
    }
    setLibraryData(initialLibraryData)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(libraryData))
  }, [libraryData])

  const nextId = useCallback(() => {
    return libraryData.reduce((max, entry) => Math.max(max, entry.id), 0) + 1
  }, [libraryData])

  const saveQuickCapture = () => {
    if (!quickCapture.title.trim()) return
    const newEntry = {
      id: nextId(),
      kind: quickCapture.kind,
      title: quickCapture.title.trim(),
      author: quickCapture.author.trim(),
      url: quickCapture.url.trim(),
      notes: quickCapture.notes.trim(),
      status: quickCapture.status,
      rating: 0,
      progress: 0,
      tags: [],
      dateAdded: new Date().toISOString(),
      dateCompleted: quickCapture.status === 'completed' ? new Date().toISOString() : null
    }
    setLibraryData(prev => [newEntry, ...prev])
    setQuickCapture({ 
      kind: 'book', 
      title: '', 
      author: '', 
      url: '',
      notes: '',
      status: 'want-to-read'
    })
  }

  const updateEntry = (entryId, updates) => {
    setLibraryData(prev => prev.map(entry => {
      if (entry.id !== entryId) return entry
      const wasCompleted = entry.status === 'completed'
      const isNowCompleted = updates.status === 'completed'
      return {
        ...entry,
        ...updates,
        dateCompleted: !wasCompleted && isNowCompleted ? new Date().toISOString() : wasCompleted && !isNowCompleted ? null : entry.dateCompleted
      }
    }))
  }

  const updateProgress = (entryId, progress) => {
    setLibraryData(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, progress } : entry
    ))
  }

  const deleteEntry = (entryId) => {
    setLibraryData(prev => prev.filter(entry => entry.id !== entryId))
  }

  const exportLibrary = () => {
    const dataStr = JSON.stringify(libraryData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `neuralhop-library-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importLibrary = () => {
    try {
      const parsed = JSON.parse(importData)
      if (!Array.isArray(parsed)) throw new Error('Formato inválido: se esperaba un array')
      
      const validEntries = parsed.filter(entry => entry.title && entry.kind)
      if (validEntries.length === 0) throw new Error('No se encontraron entradas válidas')
      
      // Reassign IDs
      const reindexed = validEntries.map((entry, index) => ({
        ...entry,
        id: Date.now() + index,
        dateAdded: entry.dateAdded || new Date().toISOString()
      }))
      
      setLibraryData(prev => [...reindexed, ...prev])
      setImportData('')
      setImportError('')
      setActiveTab('shelf')
      alert(`✅ Importados ${reindexed.length} recursos exitosamente`)
    } catch (error) {
      setImportError(error.message)
    }
  }

  const currentFields = quickAddFields[quickCapture.kind]

  if (!isOpen) return null

  return (
    <div className="hub-overlay" onClick={onClose}>
      <div className="hub-container" onClick={(e) => e.stopPropagation()}>
        {/* Header con Tabs */}
        <div className="library-v2-header">
          <div className="library-title-section">
            <div className="library-label">📚 Biblioteca</div>
            <h2 className="hub-title">Centro de Conocimiento</h2>
            <p>{libraryData.length} recursos • {libraryData.filter(e => e.status === 'reading').length} en lectura</p>
          </div>
          
          <div className="library-tabs">
            <button 
              className={activeTab === 'shelf' ? 'active' : ''}
              onClick={() => setActiveTab('shelf')}
            >
              📚 Estantería
            </button>
            <button 
              className={activeTab === 'add' ? 'active' : ''}
              onClick={() => setActiveTab('add')}
            >
              ➕ Agregar
            </button>
            <button 
              className={activeTab === 'import' ? 'active' : ''}
              onClick={() => setActiveTab('import')}
            >
              📥 Import/Export
            </button>
          </div>
          
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Main Content */}
        <div className="hub-content">
          {activeTab === 'shelf' && (
            <div className="library-shelf-layout">
              <div className="library-main-area">
                <LibraryShelf 
                  entries={libraryData}
                  onEntryClick={(entry) => console.log('Entry clicked:', entry)}
                  onUpdateStatus={updateEntry}
                  onUpdateRating={(id, rating) => updateEntry(id, { rating })}
                  onDelete={deleteEntry}
                />
              </div>
              <div className="library-sidebar">
                <div className="library-sidebar-widget">
                  <ReadingProgress 
                    entries={libraryData}
                    onUpdateProgress={updateProgress}
                  />
                </div>
                <div className="library-sidebar-widget">
                  <ReadingStats entries={libraryData} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="library-add-layout">
              <section className="library-glass-panel library-quick-capture-v2">
                <h3>Agregar Nuevo Recurso</h3>
                <p>Captura rápidamente un libro, paper, artículo o recurso de aprendizaje.</p>
                
                <div className="library-kind-selector">
                  {kindOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={quickCapture.kind === opt.value ? 'active' : ''}
                      onClick={() => setQuickCapture(prev => ({ ...prev, kind: opt.value }))}
                    >
                      <span className="kind-emoji">{opt.emoji}</span>
                      <span className="kind-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="library-field-group">
                  <label>{currentFields.label}</label>
                  <input
                    type="text"
                    value={quickCapture.title}
                    onChange={(e) => setQuickCapture(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={currentFields.placeholder}
                    autoFocus
                  />
                </div>
                
                <div className="library-field-row">
                  <div className="library-field-group">
                    <label>{currentFields.authorLabel}</label>
                    <input
                      type="text"
                      value={quickCapture.author}
                      onChange={(e) => setQuickCapture(prev => ({ ...prev, author: e.target.value }))}
                      placeholder={currentFields.authorPlaceholder}
                    />
                  </div>
                  <div className="library-field-group">
                    <label>URL (opcional)</label>
                    <input
                      type="url"
                      value={quickCapture.url}
                      onChange={(e) => setQuickCapture(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div className="library-field-group">
                  <label>Notas / Resumen</label>
                  <textarea
                    value={quickCapture.notes}
                    onChange={(e) => setQuickCapture(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas o resumen rápido..."
                    rows={4}
                  />
                </div>

                <div className="library-field-group">
                  <label>Estado Inicial</label>
                  <div className="library-status-selector">
                    {[
                      { value: 'want-to-read', emoji: '📚', label: 'Quiero leer' },
                      { value: 'reading', emoji: '📖', label: 'Leyendo' },
                      { value: 'completed', emoji: '✅', label: 'Completado' },
                      { value: 'reference', emoji: '📑', label: 'Referencia' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        className={quickCapture.status === opt.value ? 'active' : ''}
                        onClick={() => setQuickCapture(prev => ({ ...prev, status: opt.value }))}
                      >
                        {opt.emoji} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button className="library-primary-btn" onClick={saveQuickCapture}>
                  📚 Agregar a biblioteca
                </button>
              </section>

              <section className="library-tips-panel">
                <h4>💡 Consejos</h4>
                <ul>
                  <li><strong>Libros:</strong> Agrega libros que estés leyendo o quieras leer</li>
                  <li><strong>Papers:</strong> Guarda papers científicos para tu investigación</li>
                  <li><strong>Artículos:</strong> Blog posts y artículos interesantes</li>
                  <li><strong>Videos:</strong> Cursos, tutoriales y charlas</li>
                  <li><strong>Cursos:</strong> Seguimiento de cursos en progreso</li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="library-import-layout">
              <section className="library-glass-panel">
                <h3>📥 Importar Biblioteca</h3>
                <p>Pega aquí los datos JSON de tu biblioteca exportada previamente.</p>
                <textarea
                  className="import-textarea"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder={`[\n  {\n    "title": "Ejemplo",\n    "kind": "book",\n    "status": "reading",\n    ...\n  }\n]`}
                  rows={12}
                />
                {importError && <p className="import-error">❌ {importError}</p>}
                <div className="library-import-actions">
                  <button className="library-primary-btn" onClick={importLibrary}>
                    📥 Importar datos
                  </button>
                  <button className="library-secondary-btn" onClick={() => setImportData('')}>
                    Limpiar
                  </button>
                </div>
              </section>

              <section className="library-glass-panel">
                <h3>📤 Exportar Biblioteca</h3>
                <p>Descarga una copia de seguridad de toda tu biblioteca.</p>
                <div className="library-export-info">
                  <div className="export-stat">
                    <span className="export-number">{libraryData.length}</span>
                    <span className="export-label">Recursos totales</span>
                  </div>
                </div>
                <button className="library-primary-btn" onClick={exportLibrary}>
                  📤 Exportar a JSON
                </button>
              </section>

              <section className="library-glass-panel">
                <h3>🔄 Sincronización</h3>
                <p>Próximamente: Sincronización con:</p>
                <ul className="sync-list">
                  <li>📖 Goodreads</li>
                  <li>📚 Google Books</li>
                  <li>📄 Zotero</li>
                  <li>☁️ Google Drive / Dropbox</li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LibraryHub
