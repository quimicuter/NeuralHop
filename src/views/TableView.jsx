import React, { useState } from 'react'
import './TableView.css'

function TableView({ entries, columns, onRowClick, renderCell }) {
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: !col.hidden }), {})
  )
  const [showColumnMenu, setShowColumnMenu] = useState(false)

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const visibleCols = columns.filter(col => visibleColumns[col.key] !== false)

  return (
    <div className="table-view">
      <div className="table-toolbar">
        <button 
          className="table-column-toggle"
          onClick={() => setShowColumnMenu(!showColumnMenu)}
        >
          📋 Columnas
        </button>
        
        {showColumnMenu && (
          <div className="table-column-menu">
            {columns.map(col => (
              <label key={col.key} className="table-column-option">
                <input
                  type="checkbox"
                  checked={visibleColumns[col.key] !== false}
                  onChange={() => toggleColumn(col.key)}
                />
                <span>{col.title}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              {visibleCols.map(col => (
                <th key={col.key} className={col.className || ''}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length} className="table-empty">
                  No hay entries para mostrar ✨
                </td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr 
                  key={entry.id} 
                  className="table-row"
                  onClick={() => onRowClick && onRowClick(entry)}
                >
                  {visibleCols.map(col => (
                    <td key={`${entry.id}-${col.key}`} className={col.className || ''}>
                      {renderCell ? renderCell(entry, col.key) : (
                        entry[col.key] || '-'
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableView
