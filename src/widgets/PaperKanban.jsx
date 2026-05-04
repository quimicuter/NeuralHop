import React from 'react'
import KanbanView from '../views/KanbanView'
import './PaperKanban.css'

// Tags estrictos para Investigación Hub
const RESEARCH_TAGS = [
  { id: 'smart-materials', label: 'Smart Materials', color: '#667eea' },
  { id: 'biomass-conversion', label: 'Biomass Conversion', color: '#f093fb' },
  { id: 'metabolic-diseases', label: 'Metabolic Diseases', color: '#f5576c' }
]

// Columnas Kanban para papers
const COLUMNS = [
  { id: 'idea', title: '💡 Idea', color: '#90caf9' },
  { id: 'draft', title: '📝 Draft', color: '#ffe082' },
  { id: 'review', title: '👀 Review', color: '#ce93d8' },
  { id: 'submitted', title: '📤 Submitted', color: '#a5d6a7' },
  { id: 'published', title: '📚 Published', color: '#81c784' }
]

function PaperKanban({ entries, onMoveEntry, onEntryClick }) {
  // Filtrar entries de tipo paper o con tag de investigación
  const paperEntries = entries?.filter(e => 
    e.type === 'paper' || 
    RESEARCH_TAGS.some(tag => e.metadata?.tags?.includes(tag.id))
  ) || []

  const renderCard = (entry) => {
    const tag = RESEARCH_TAGS.find(t => entry.metadata?.tags?.includes(t.id))
    
    return (
      <div className="paper-card">
        <div className="paper-card-title">{entry.title}</div>
        {entry.metadata?.journal && (
          <div className="paper-card-journal">📰 {entry.metadata.journal}</div>
        )}
        {tag && (
          <div 
            className="paper-card-tag" 
            style={{ background: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
          >
            {tag.label}
          </div>
        )}
        {entry.metadata?.deadline && (
          <div className="paper-card-deadline">
            ⏰ {new Date(entry.metadata.deadline).toLocaleDateString('es-MX')}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="paper-kanban">
      <div className="paper-kanban-header">
        <h3 className="paper-kanban-title">📄 Paper Kanban</h3>
        <p className="paper-kanban-subtitle">
          Tags: Smart Materials | Biomass Conversion | Metabolic Diseases
        </p>
      </div>

      <KanbanView
        entries={paperEntries}
        columns={COLUMNS}
        onMoveEntry={onMoveEntry}
        onEntryClick={onEntryClick}
        renderCard={renderCard}
      />
    </div>
  )
}

export default PaperKanban
