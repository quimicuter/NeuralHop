import React, { useState } from 'react'
import { IconRenderer } from '../IconRenderer'
import './ViewKanban.css'

const ViewKanban = ({ 
  entries = [], 
  columns = [],
  onMoveEntry,
  onEntryClick,
  onToggleComplete,
  getEntryColor,
  getEntryEmoji
}) => {
  const [draggedEntry, setDraggedEntry] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const handleDragStart = (entry) => {
    setDraggedEntry(entry)
  }

  const handleDragEnd = () => {
    setDraggedEntry(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()
    if (draggedEntry && onMoveEntry) {
      onMoveEntry(draggedEntry.id, columnId)
    }
    setDraggedEntry(null)
    setDragOverColumn(null)
  }

  const getColumnEntries = (columnId) => {
    return entries.filter(entry => {
      const entryStatus = entry.status || 'todo'
      return entryStatus === columnId
    })
  }

  return (
    <div className="view-kanban">
      <div className="kanban-columns">
        {columns.map(column => {
          const columnEntries = getColumnEntries(column.id)
          const isDragOver = dragOverColumn === column.id

          return (
            <div 
              key={column.id}
              className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="kanban-column-header" style={{ borderColor: column.color }}>
                <span className="kanban-column-emoji">
                  <IconRenderer icon={column.icon} size={18} />
                </span>
                <span className="kanban-column-title">{column.title}</span>
                <span className="kanban-column-count">{columnEntries.length}</span>
              </div>

              <div className="kanban-column-content">
                {columnEntries.map(entry => (
                  <div
                    key={entry.id}
                    className={`kanban-card ${entry.completed ? 'completed' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(entry)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onEntryClick && onEntryClick(entry)}
                    style={{ 
                      borderLeftColor: getEntryColor ? getEntryColor(entry) : column.color 
                    }}
                  >
                    <div className="kanban-card-header">
                      {getEntryEmoji && (
                        <span className="kanban-card-emoji">{getEntryEmoji(entry)}</span>
                      )}
                      <h4 className="kanban-card-title">{entry.title}</h4>
                      {onToggleComplete && (
                        <input
                          type="checkbox"
                          checked={entry.completed}
                          onChange={(e) => {
                            e.stopPropagation()
                            onToggleComplete(entry.id)
                          }}
                          className="kanban-card-checkbox"
                        />
                      )}
                    </div>

                    {entry.metadata?.description && (
                      <p className="kanban-card-description">
                        {entry.metadata.description.slice(0, 100)}
                        {entry.metadata.description.length > 100 ? '...' : ''}
                      </p>
                    )}

                    <div className="kanban-card-footer">
                      {entry.priority && (
                        <span className={`kanban-priority priority-${entry.priority}`}>
                          {entry.priority === 'critical' && '🔥'}
                          {entry.priority === 'high' && '⚡'}
                          {entry.priority === 'medium' && '📌'}
                          {entry.priority === 'low' && '🌱'}
                        </span>
                      )}
                      
                      {entry.deadline && (
                        <span className="kanban-deadline">
                          📅 {new Date(entry.deadline).toLocaleDateString('es-ES', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      )}

                      {entry.module && (
                        <span className="kanban-module">{entry.module}</span>
                      )}
                    </div>
                  </div>
                ))}

                {columnEntries.length === 0 && (
                  <div className="kanban-empty">
                    <span>Suelta tareas aquí</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ViewKanban
