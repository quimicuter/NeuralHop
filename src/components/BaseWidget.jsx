import React, { useState } from 'react'
import ViewKanban from './views/ViewKanban'
import ViewTable from './views/ViewTable'
import ViewCalendar from './views/ViewCalendar'
import './BaseWidget.css'

const VIEW_ICONS = {
  list: '☰',
  kanban: '▦',
  table: '☷',
  calendar: '📅'
}

const BaseWidget = ({
  title,
  emoji,
  entries = [],
  view: initialView = 'list',
  availableViews = ['list', 'kanban', 'table', 'calendar'],
  onEntryClick,
  onToggleComplete,
  onMoveEntry,
  onDelete,
  onEdit,
  kanbanColumns = [
    { id: 'todo', title: 'Por Hacer', emoji: '⏳', color: '#94a3b8' },
    { id: 'in-progress', title: 'En Progreso', emoji: '🔄', color: '#60a5fa' },
    { id: 'done', title: 'Completado', emoji: '✅', color: '#4ade80' }
  ],
  tableColumns = [],
  renderListItem,
  emptyMessage = 'Sin elementos',
  showHeader = true,
  className = ''
}) => {
  const [currentView, setCurrentView] = useState(initialView)
  const [monthOffset, setMonthOffset] = useState(0)

  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  const handleMoveEntry = (entryId, newStatus) => {
    if (onMoveEntry) {
      onMoveEntry(entryId, newStatus)
    } else if (onEdit) {
      onEdit(entryId, { status: newStatus })
    }
  }

  const getEntryColor = (entry) => {
    if (entry.completed) return 'rgba(100, 255, 150, 0.5)'
    
    const colors = {
      critical: 'rgba(255, 100, 100, 0.6)',
      high: 'rgba(255, 180, 100, 0.6)',
      medium: 'rgba(100, 180, 255, 0.6)',
      low: 'rgba(150, 255, 200, 0.6)'
    }
    return colors[entry.priority] || 'rgba(255, 255, 255, 0.3)'
  }

  const getEntryEmoji = (entry) => {
    const moduleEmojis = {
      'selfcare': '🛀',
      'mindfulness': '🧘‍♀️',
      'vida-social': '🥂',
      'fitness': '💪',
      'foodie': '🍽️',
      'tecno-girl': '💻',
      'investigacion': '🔬',
      'maestria': '🎓',
      'lab': '🧪',
      'idiomas': '🗣️',
      'cumpleanos': '🎂',
      'finanzas': '💰',
      'tramites': '📝'
    }
    return moduleEmojis[entry.module] || '📌'
  }

  const renderListView = () => {
    if (entries.length === 0) {
      return (
        <div className="base-widget-empty">
          <span>{emptyMessage}</span>
        </div>
      )
    }

    if (renderListItem) {
      return (
        <div className="base-widget-list">
          {entries.map(entry => renderListItem(entry))}
        </div>
      )
    }

    return (
      <div className="base-widget-list">
        {entries.map(entry => (
          <div
            key={entry.id}
            className={`base-widget-list-item ${entry.completed ? 'completed' : ''}`}
            onClick={() => onEntryClick && onEntryClick(entry)}
          >
            {onToggleComplete && (
              <input
                type="checkbox"
                checked={entry.completed}
                onChange={(e) => {
                  e.stopPropagation()
                  onToggleComplete(entry.id)
                }}
                className="base-widget-checkbox"
              />
            )}
            <span className="base-widget-emoji">{getEntryEmoji(entry)}</span>
            <span className="base-widget-title">{entry.title}</span>
            {entry.priority && (
              <span className={`base-widget-priority priority-${entry.priority}`}>
                {entry.priority === 'critical' && '🔥'}
                {entry.priority === 'high' && '⚡'}
                {entry.priority === 'medium' && '📌'}
                {entry.priority === 'low' && '🌱'}
              </span>
            )}
            {entry.deadline && (
              <span className="base-widget-deadline">
                {new Date(entry.deadline).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'kanban':
        return (
          <ViewKanban
            entries={entries}
            columns={kanbanColumns}
            onMoveEntry={handleMoveEntry}
            onEntryClick={onEntryClick}
            onToggleComplete={onToggleComplete}
            getEntryColor={getEntryColor}
            getEntryEmoji={getEntryEmoji}
          />
        )
      
      case 'table':
        return (
          <ViewTable
            entries={entries}
            columns={tableColumns.length > 0 ? tableColumns : [
              { key: 'completed', title: '', type: 'checkbox', width: '40px', sortable: false },
              { key: 'title', title: 'Título' },
              { key: 'priority', title: 'Prioridad', type: 'priority' },
              { key: 'deadline', title: 'Fecha', type: 'date' },
              { key: 'module', title: 'Módulo' }
            ]}
            onEntryClick={onEntryClick}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )
      
      case 'calendar':
        return (
          <ViewCalendar
            entries={entries}
            onEntryClick={onEntryClick}
            onToggleComplete={onToggleComplete}
            monthOffset={monthOffset}
            onMonthChange={setMonthOffset}
          />
        )
      
      case 'list':
      default:
        return renderListView()
    }
  }

  return (
    <div className={`base-widget ${className}`}>
      {showHeader && (
        <div className="base-widget-header">
          <div className="base-widget-title-group">
            {emoji && <span className="base-widget-header-emoji">{emoji}</span>}
            <h3 className="base-widget-header-title">{title}</h3>
            <span className="base-widget-count">{entries.length}</span>
          </div>
          
          {availableViews.length > 1 && (
            <div className="base-widget-view-switcher">
              {availableViews.map(view => (
                <button
                  key={view}
                  className={`view-btn ${currentView === view ? 'active' : ''}`}
                  onClick={() => handleViewChange(view)}
                  title={`Vista ${view}`}
                >
                  {VIEW_ICONS[view] || view}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="base-widget-content">
        {renderView()}
      </div>
    </div>
  )
}

export default BaseWidget
