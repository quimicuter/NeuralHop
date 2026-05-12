import React, { useState } from 'react'
import './ViewTable.css'

const ViewTable = ({ 
  entries = [], 
  columns = [],
  onEntryClick,
  onToggleComplete,
  onDelete,
  onEdit,
  sortable = true
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    if (!sortable) return
    
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortedEntries = () => {
    if (!sortConfig.key) return entries

    return [...entries].sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      // Handle nested metadata properties
      if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.')
        aValue = keys.reduce((obj, key) => obj?.[key], a)
        bValue = keys.reduce((obj, key) => obj?.[key], b)
      }

      // Handle dates
      if (sortConfig.key === 'deadline' || sortConfig.key === 'date' || sortConfig.key.includes('Date')) {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const renderCell = (entry, column) => {
    const value = column.key.includes('.') 
      ? column.key.split('.').reduce((obj, key) => obj?.[key], entry)
      : entry[column.key]

    if (column.render) {
      return column.render(value, entry)
    }

    if (column.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => {
            e.stopPropagation()
            onToggleComplete && onToggleComplete(entry.id)
          }}
          className="table-checkbox"
        />
      )
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    if (column.type === 'priority' && value) {
      const icons = {
        critical: '🔥',
        high: '⚡',
        medium: '📌',
        low: '🌱'
      }
      return (
        <span className={`table-priority priority-${value}`}>
          {icons[value] || '⚪'} {value}
        </span>
      )
    }

    if (column.type === 'status' && value) {
      return (
        <span className={`table-status status-${value}`}>
          {value}
        </span>
      )
    }

    if (column.type === 'tags' && Array.isArray(value)) {
      return (
        <div className="table-tags">
          {value.map((tag, i) => (
            <span key={i} className="table-tag">{tag}</span>
          ))}
        </div>
      )
    }

    return value || '-'
  }

  const sortedEntries = getSortedEntries()

  return (
    <div className="view-table">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th 
                  key={column.key}
                  className={`${column.sortable !== false && sortable ? 'sortable' : ''} ${column.className || ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <span className="th-content">
                    {column.title}
                    {column.sortable !== false && sortable && (
                      <span className="sort-icon">{getSortIcon(column.key)}</span>
                    )}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && <th className="actions-header">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {sortedEntries.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} 
                  className="table-empty"
                >
                  No hay elementos para mostrar
                </td>
              </tr>
            ) : (
              sortedEntries.map(entry => (
                <tr 
                  key={entry.id}
                  className={entry.completed ? 'completed' : ''}
                  onClick={() => onEntryClick && onEntryClick(entry)}
                >
                  {columns.map(column => (
                    <td key={column.key} className={column.className || ''}>
                      {renderCell(entry, column)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="actions-cell">
                      <div className="table-actions">
                        {onEdit && (
                          <button 
                            className="table-action-btn edit"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(entry)
                            }}
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            className="table-action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(entry.id)
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="table-footer">
        <span className="table-count">
          {sortedEntries.length} elemento{sortedEntries.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

export default ViewTable
