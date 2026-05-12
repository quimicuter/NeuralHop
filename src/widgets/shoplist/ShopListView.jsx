import React, { useState, useMemo } from 'react'
import './ShopListView.css'

const categoryEmojis = {
  'Alimentos': '🥘',
  'Electrónica': '💻',
  'Hogar': '🏠',
  'Ropa': '👕',
  'Salud': '💊',
  'Entretenimiento': '🎮',
  'Transporte': '🚗',
  'Otros': '📦'
}

const priorityConfig = {
  critical: { emoji: '🔥', color: '#EF4444', label: 'Crítica' },
  high: { emoji: '⚡', color: '#F59E0B', label: 'Alta' },
  medium: { emoji: '📌', color: '#3B82F6', label: 'Media' },
  low: { emoji: '🌱', color: '#10B981', label: 'Baja' },
  normal: { emoji: '⏳', color: '#6B7280', label: 'Normal' }
}

function ShopListView({ 
  items, 
  onToggleItem, 
  onDeleteItem, 
  onEditItem,
  onUpdatePrice,
  onUpdateQuantity,
  budget 
}) {
  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid' | 'kanban'
  const [filters, setFilters] = useState({
    status: 'all', // 'all' | 'pending' | 'purchased'
    category: 'all',
    priority: 'all'
  })
  const [sortBy, setSortBy] = useState('added') // 'added' | 'priority' | 'price' | 'name'
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    quantity: 1,
    category: 'Otros',
    priority: 'normal',
    notes: ''
  })

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items]
    
    // Apply filters
    if (filters.status === 'pending') result = result.filter(i => !i.purchased)
    if (filters.status === 'purchased') result = result.filter(i => i.purchased)
    if (filters.category !== 'all') result = result.filter(i => i.category === filters.category)
    if (filters.priority !== 'all') result = result.filter(i => i.priority === filters.priority)
    
    // Apply sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, normal: 4 }
          return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        case 'price':
          return (b.price || 0) - (a.price || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'added':
        default:
          return new Date(b.dateAdded) - new Date(a.dateAdded)
      }
    })
    
    return result
  }, [items, filters, sortBy])

  // Get unique categories and priorities
  const categories = useMemo(() => 
    [...new Set(items.map(i => i.category).filter(Boolean))].sort(),
    [items]
  )
  
  const priorities = useMemo(() => 
    [...new Set(items.map(i => i.priority).filter(Boolean))].sort(),
    [items]
  )

  const stats = useMemo(() => {
    const total = items.length
    const purchased = items.filter(i => i.purchased).length
    const spent = items
      .filter(i => i.purchased)
      .reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0)
    return { total, purchased, spent }
  }, [items])

  const startEdit = (item) => {
    setEditingItem(item.id)
    setEditForm({
      name: item.name,
      price: item.price || '',
      quantity: item.quantity || 1,
      category: item.category || 'Otros',
      priority: item.priority || 'normal',
      notes: item.notes || ''
    })
  }

  const saveEdit = () => {
    if (!editingItem) return
    onEditItem && onEditItem(editingItem, {
      name: editForm.name,
      price: parseFloat(editForm.price) || 0,
      quantity: parseInt(editForm.quantity) || 1,
      category: editForm.category,
      priority: editForm.priority,
      notes: editForm.notes
    })
    setEditingItem(null)
  }

  const renderListView = () => (
    <div className="shop-list-container">
      {filteredItems.map(item => (
        <div 
          key={item.id} 
          className={`shop-list-item ${item.purchased ? 'purchased' : ''} priority-${item.priority}`}
        >
          <div className="item-main">
            <input
              type="checkbox"
              checked={item.purchased}
              onChange={() => onToggleItem && onToggleItem(item.id)}
              className="item-checkbox"
            />
            <span className="item-category-emoji">
              {categoryEmojis[item.category] || '📦'}
            </span>
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <div className="item-meta">
                <span 
                  className="item-priority"
                  style={{ color: priorityConfig[item.priority]?.color }}
                >
                  {priorityConfig[item.priority]?.emoji} {priorityConfig[item.priority]?.label}
                </span>
                {item.category && (
                  <span className="item-category">{item.category}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="item-details">
            {item.price > 0 && (
              <div className="item-price-section">
                <span className="item-price">${item.price.toFixed(2)}</span>
                {item.quantity > 1 && (
                  <span className="item-quantity">× {item.quantity}</span>
                )}
                <span className="item-total">
                  = ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="item-actions">
              <button 
                className="action-btn edit"
                onClick={() => startEdit(item)}
                title="Editar"
              >
                ✏️
              </button>
              <button 
                className="action-btn delete"
                onClick={() => onDeleteItem && onDeleteItem(item.id)}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {editingItem === item.id && (
            <div className="item-edit-panel" onClick={(e) => e.stopPropagation()}>
              <div className="edit-row">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Nombre"
                />
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  placeholder="Precio"
                  step="0.01"
                  min="0"
                />
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                  placeholder="Cantidad"
                  min="1"
                />
              </div>
              <div className="edit-row">
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                >
                  {Object.keys(categoryEmojis).map(cat => (
                    <option key={cat} value={cat}>{categoryEmojis[cat]} {cat}</option>
                  ))}
                </select>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                >
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.emoji} {config.label}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Notas (opcional)"
                className="edit-notes"
              />
              <div className="edit-actions">
                <button className="save-btn" onClick={saveEdit}>Guardar</button>
                <button className="cancel-btn" onClick={() => setEditingItem(null)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderGridView = () => (
    <div className="shop-grid-container">
      {filteredItems.map(item => (
        <div 
          key={item.id} 
          className={`shop-grid-item ${item.purchased ? 'purchased' : ''}`}
          style={{ borderColor: priorityConfig[item.priority]?.color }}
        >
          <div className="grid-header">
            <input
              type="checkbox"
              checked={item.purchased}
              onChange={() => onToggleItem && onToggleItem(item.id)}
            />
            <span className="grid-emoji">{categoryEmojis[item.category] || '📦'}</span>
          </div>
          <h4 className="grid-name">{item.name}</h4>
          <div className="grid-meta">
            <span style={{ color: priorityConfig[item.priority]?.color }}>
              {priorityConfig[item.priority]?.emoji}
            </span>
            <span>{item.category}</span>
          </div>
          {item.price > 0 && (
            <div className="grid-price">
              ${item.price.toFixed(2)}
              {item.quantity > 1 && <span> × {item.quantity}</span>}
            </div>
          )}
          <div className="grid-actions">
            <button onClick={() => startEdit(item)}>✏️</button>
            <button onClick={() => onDeleteItem && onDeleteItem(item.id)}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  )

  const renderKanbanView = () => {
    const columns = {
      pending: { title: '🛒 Pendientes', items: filteredItems.filter(i => !i.purchased) },
      purchased: { title: '✅ Comprados', items: filteredItems.filter(i => i.purchased) }
    }

    return (
      <div className="shop-kanban-container">
        {Object.entries(columns).map(([key, column]) => (
          <div key={key} className="kanban-column">
            <h4 className="kanban-header">
              {column.title}
              <span className="kanban-count">{column.items.length}</span>
            </h4>
            <div className="kanban-items">
              {column.items.map(item => (
                <div 
                  key={item.id} 
                  className="kanban-item"
                  style={{ borderLeftColor: priorityConfig[item.priority]?.color }}
                >
                  <div className="kanban-item-header">
                    <span>{categoryEmojis[item.category] || '📦'}</span>
                    <span style={{ color: priorityConfig[item.priority]?.color }}>
                      {priorityConfig[item.priority]?.emoji}
                    </span>
                  </div>
                  <p className="kanban-item-name">{item.name}</p>
                  {item.price > 0 && (
                    <span className="kanban-item-price">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  )}
                  <div className="kanban-item-actions">
                    <button onClick={() => onToggleItem && onToggleItem(item.id)}>
                      {item.purchased ? '↩️' : '✅'}
                    </button>
                    <button onClick={() => startEdit(item)}>✏️</button>
                    <button onClick={() => onDeleteItem && onDeleteItem(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="shoplist-view-widget">
      {/* Toolbar */}
      <div className="shoplist-toolbar">
        <div className="view-modes">
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
            ☰ Lista
          </button>
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
            ▦ Grid
          </button>
          <button className={viewMode === 'kanban' ? 'active' : ''} onClick={() => setViewMode('kanban')}>
            ▧ Kanban
          </button>
        </div>

        <div className="shoplist-filters">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">📦 Todos</option>
            <option value="pending">🛒 Pendientes</option>
            <option value="purchased">✅ Comprados</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="all">🏷️ Todas categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{categoryEmojis[cat] || '📦'} {cat}</option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="all">🎯 Todas prioridades</option>
            {priorities.map(pri => (
              <option key={pri} value={pri}>
                {priorityConfig[pri]?.emoji} {priorityConfig[pri]?.label}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="added">📅 Más recientes</option>
            <option value="priority">🎯 Por prioridad</option>
            <option value="price">💰 Por precio</option>
            <option value="name">🔤 Alfabético</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="shoplist-stats-bar">
        <span>📦 {stats.total} items</span>
        <span>✅ {stats.purchased} comprados</span>
        <span>💰 ${stats.spent.toFixed(2)} gastado</span>
        {budget > 0 && (
          <span className={stats.spent > budget ? 'over-budget' : 'under-budget'}>
            {stats.spent > budget ? '⚠️' : '💵'} ${(budget - stats.spent).toFixed(2)} restante
          </span>
        )}
      </div>

      {/* Content */}
      <div className="shoplist-view-content">
        {filteredItems.length === 0 ? (
          <div className="shoplist-empty">
            <span>🛒</span>
            <p>No hay items que coincidan con los filtros</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && renderListView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'kanban' && renderKanbanView()}
          </>
        )}
      </div>
    </div>
  )
}

export default ShopListView
