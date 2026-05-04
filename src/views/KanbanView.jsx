import React, { useState } from 'react'
import './KanbanView.css'

function KanbanView({ entries, columns, onMoveEntry, onEntryClick, renderCard }) {
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

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault()
    if (draggedEntry && onMoveEntry) {
      onMoveEntry(draggedEntry.id, targetColumnId)
    }
    setDraggedEntry(null)
    setDragOverColumn(null)
  }

  // Agrupar entries por columna
  const entriesByColumn = columns.reduce((acc, col) => {
    acc[col.id] = entries.filter(entry => {
      const entryStatus = entry.status || 'todo'
      return entryStatus === col.id
    })
    return acc
  }, {})

  return (
    <div className="kanban-view">
      {columns.map(column => (
        <div
          key={column.id}
          className={`kanban-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
          onDragLeave={() => setDragOverColumn(null)}
        >
          <div className="kanban-column-header" style={{ borderColor: column.color }}>
            <span className="kanban-column-title">{column.title}</span>
            <span className="kanban-column-count">{entriesByColumn[column.id]?.length || 0}</span>
          </div>
          
          <div className="kanban-column-content">
            {entriesByColumn[column.id]?.map(entry => (
              <div
                key={entry.id}
                className={`kanban-card ${draggedEntry?.id === entry.id ? 'dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(entry)}
                onDragEnd={handleDragEnd}
                onClick={() => onEntryClick && onEntryClick(entry)}
              >
                {renderCard ? renderCard(entry) : (
                  <>
                    <div className="kanban-card-title">{entry.title}</div>
                    {entry.priority && (
                      <div className={`kanban-card-priority priority-${entry.priority}`}>
                        {entry.priority}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanView
