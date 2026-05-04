import React from 'react'
import TableView from '../views/TableView'
import './JournalTable.css'

function JournalTable({ entries, onRowClick }) {
  const columns = [
    { key: 'title', title: 'Título' },
    { key: 'content', title: 'Contenido', className: 'journal-content-blur' },
    { key: 'createdAt', title: 'Fecha' },
    { key: 'mood', title: 'Estado' }
  ]

  const renderCell = (entry, key) => {
    switch (key) {
      case 'content':
        return (
          <span className="journal-blur-text">
            {entry.content || entry.metadata?.content || 'Sin contenido...'}
          </span>
        )
      case 'createdAt':
        return entry.createdAt?.toDate
          ? entry.createdAt.toDate().toLocaleDateString('es-MX')
          : new Date(entry.createdAt).toLocaleDateString('es-MX')
      case 'mood':
        const mood = entry.metadata?.mood || '😐'
        return <span className="journal-mood">{mood}</span>
      default:
        return entry[key] || '-'
    }
  }

  return (
    <div className="journal-table-widget">
      <div className="journal-header">
        <h3 className="journal-title">📓 Journal Table</h3>
        <p className="journal-subtitle">Pasa el cursor para revelar el contenido</p>
      </div>
      
      <TableView
        entries={entries}
        columns={columns}
        renderCell={renderCell}
        onRowClick={onRowClick}
      />
    </div>
  )
}

export default JournalTable
