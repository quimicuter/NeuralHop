import React from 'react'
import KanbanView from '../views/KanbanView'
import './WishlistKanban.css'

const COLUMNS = [
  { id: 'ideas', title: '💡 Ideas', color: '#90caf9' },
  { id: 'comprado', title: '🛍️ Comprado', color: '#a5d6a7' },
  { id: 'entregado', title: '🎁 Entregado', color: '#ce93d8' }
]

function WishlistKanban({ entries, onMoveEntry, onEntryClick }) {
  return (
    <div className="wishlist-kanban">
      <div className="wishlist-header">
        <h3 className="wishlist-title">📝 Wishlist Kanban</h3>
        <p className="wishlist-subtitle">Seguimiento de regalos e ideas</p>
      </div>

      <KanbanView
        entries={entries}
        columns={COLUMNS}
        onMoveEntry={onMoveEntry}
        onEntryClick={onEntryClick}
        renderCard={(entry) => (
          <div className="wishlist-card">
            <div className="wishlist-card-title">{entry.title}</div>
            {entry.metadata?.recipient && (
              <div className="wishlist-card-recipient">
                Para: {entry.metadata.recipient}
              </div>
            )}
            {entry.metadata?.estimatedPrice && (
              <div className="wishlist-card-price">
                💰 ${entry.metadata.estimatedPrice}
              </div>
            )}
            {entry.priority && (
              <div className={`wishlist-priority priority-${entry.priority}`}>
                {entry.priority}
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}

export default WishlistKanban
