import React from 'react'
import TableView from '../views/TableView'
import './ApplicationTracker.css'

// Seed data predefinida - Maestría Hub
const DEFAULT_APPLICATIONS = [
  {
    id: 'kaust-vsrp-2026',
    program: 'KAUST VSRP 2026',
    laboratory: 'Smart Hybrid Materials Laboratory',
    status: 'draft',
    deadline: '2026-02-15',
    progress: 25
  }
]

function ApplicationTracker({ entries, onRowClick }) {
  // Mapear entries de tipo aplicación
  const applicationEntries = entries?.filter(e => 
    e.type === 'application' || e.metadata?.applicationType
  ) || []

  const applications = applicationEntries.length > 0
    ? applicationEntries.map(entry => ({
        id: entry.id,
        program: entry.title,
        laboratory: entry.metadata?.laboratory || 'Por definir',
        status: entry.status || entry.metadata?.status || 'todo',
        deadline: entry.metadata?.deadline,
        progress: entry.metadata?.progress || 0
      }))
    : DEFAULT_APPLICATIONS

  const columns = [
    { key: 'program', title: 'Programa' },
    { key: 'laboratory', title: 'Laboratorio' },
    { key: 'status', title: 'Estado' },
    { key: 'deadline', title: 'Fecha límite' },
    { key: 'progress', title: 'Progreso' }
  ]

  const renderCell = (entry, key) => {
    switch (key) {
      case 'status':
        const statusColors = {
          'todo': { bg: '#e3f2fd', color: '#1565c0', label: 'Pendiente' },
          'in-progress': { bg: '#fff3e0', color: '#e65100', label: 'En progreso' },
          'done': { bg: '#e8f5e9', color: '#2e7d32', label: 'Completado' },
          'submitted': { bg: '#f3e5f5', color: '#7b1fa2', label: 'Enviado' }
        }
        const status = statusColors[entry.status] || statusColors['todo']
        return (
          <span 
            className="app-status-badge"
            style={{ background: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        )
      
      case 'deadline':
        return entry.deadline 
          ? new Date(entry.deadline).toLocaleDateString('es-MX')
          : 'Sin fecha'
      
      case 'progress':
        return (
          <div className="app-progress-bar">
            <div 
              className="app-progress-fill"
              style={{ width: `${entry.progress}%` }}
            />
            <span className="app-progress-text">{entry.progress}%</span>
          </div>
        )
      
      default:
        return entry[key] || '-'
    }
  }

  return (
    <div className="application-tracker-widget">
      <div className="application-header">
        <h3 className="application-title">🎓 Application Tracker</h3>
        <p className="application-subtitle">Seguimiento de aplicaciones académicas</p>
      </div>

      <TableView
        entries={applications}
        columns={columns}
        onRowClick={onRowClick}
        renderCell={renderCell}
      />
    </div>
  )
}

export default ApplicationTracker
