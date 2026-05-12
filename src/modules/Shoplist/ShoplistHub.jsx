import React, { useState, useEffect, useCallback } from 'react'
import { ShopStats, ShopListView } from '../../widgets/shoplist'
import './Shoplist.css'

const SHOPLIST_STORAGE_KEY = 'neuralhop-shoplist-db'
const SHOPLIST_BUDGET_KEY = 'neuralhop-shoplist-budget'

const categoryOptions = [
  { value: 'Alimentos', label: 'Alimentos', emoji: '🥘', color: '#10B981' },
  { value: 'Electrónica', label: 'Electrónica', emoji: '💻', color: '#3B82F6' },
  { value: 'Hogar', label: 'Hogar', emoji: '🏠', color: '#F59E0B' },
  { value: 'Ropa', label: 'Ropa', emoji: '👕', color: '#EC4899' },
  { value: 'Salud', label: 'Salud', emoji: '💊', color: '#EF4444' },
  { value: 'Entretenimiento', label: 'Entretenimiento', emoji: '🎮', color: '#8B5CF6' },
  { value: 'Transporte', label: 'Transporte', emoji: '🚗', color: '#06B6D4' },
  { value: 'Otros', label: 'Otros', emoji: '📦', color: '#6B7280' }
]

const priorityOptions = [
  { value: 'critical', label: 'Crítica', emoji: '🔴', color: '#EF4444' },
  { value: 'high', label: 'Alta', emoji: '⚡', color: '#F59E0B' },
  { value: 'medium', label: 'Media', emoji: '📌', color: '#3B82F6' },
  { value: 'low', label: 'Baja', emoji: '🌱', color: '#10B981' },
  { value: 'normal', label: 'Normal', emoji: '⏳', color: '#6B7280' }
]

function ShoplistHub({ isOpen, onClose }) {
  const [items, setItems] = useState([])
  const [budget, setBudget] = useState(0)
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'stats' | 'add'
  const [quickCapture, setQuickCapture] = useState({
    name: '',
    category: 'Alimentos',
    priority: 'normal',
    price: '',
    quantity: 1,
    notes: ''
  })
  const [editingItemId, setEditingItemId] = useState(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(SHOPLIST_STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (error) {
        console.warn('Shoplist DB load failed:', error)
      }
    }

    const storedBudget = window.localStorage.getItem(SHOPLIST_BUDGET_KEY)
    if (storedBudget) {
      try {
        setBudget(JSON.parse(storedBudget))
      } catch (error) {
        console.warn('Budget load failed:', error)
      }
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SHOPLIST_STORAGE_KEY, JSON.stringify(items))
    
    // Calculate spent
    const spent = items
      .filter(item => item.status === 'purchased' && item.actualPrice)
      .reduce((sum, item) => sum + (parseFloat(item.actualPrice) || 0), 0)
    
    setBudget(prev => ({ ...prev, spent }))
  }, [items])

  useEffect(() => {
    window.localStorage.setItem(SHOPLIST_BUDGET_KEY, JSON.stringify(budget))
  }, [budget.total])

  const nextId = useCallback(() => {
    return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
  }, [items])

  const addItem = () => {
    if (!quickCapture.name.trim()) return
    
    const newItem = {
      id: nextId(),
      name: quickCapture.name.trim(),
      category: quickCapture.category,
      priority: quickCapture.priority,
      price: parseFloat(quickCapture.price) || 0,
      quantity: parseInt(quickCapture.quantity) || 1,
      notes: quickCapture.notes.trim(),
      purchased: false,
      dateAdded: new Date().toISOString(),
      datePurchased: null
    }
    
    setItems(prev => [newItem, ...prev])
    setQuickCapture({
      name: '',
      category: 'Alimentos',
      priority: 'normal',
      price: '',
      quantity: 1,
      notes: ''
    })
    setActiveTab('list')
  }

  const toggleItem = (itemId) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const newPurchased = !item.purchased
      return {
        ...item,
        purchased: newPurchased,
        datePurchased: newPurchased ? new Date().toISOString() : null
      }
    }))
  }

  const deleteItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const editItem = (itemId, updates) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ))
    setEditingItemId(null)
  }

  if (!isOpen) return null

  return (
    <div className="hub-overlay" onClick={onClose}>
      <div className="hub-container" onClick={(e) => e.stopPropagation()}>
        {/* Header con Tabs */}
        <div className="shoplist-v2-header">
          <div className="shoplist-title-section">
            <div className="shoplist-label">🛒 Shoplist</div>
            <h2 className="hub-title">Lista de Compras</h2>
            <p>{items.filter(i => !i.purchased).length} pendientes • {items.filter(i => i.purchased).length} comprados • ${items.filter(i => i.purchased).reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0).toFixed(2)} gastado</p>
          </div>
          
          <div className="shoplist-tabs">
            <button 
              className={activeTab === 'list' ? 'active' : ''}
              onClick={() => setActiveTab('list')}
            >
              📝 Lista
            </button>
            <button 
              className={activeTab === 'stats' ? 'active' : ''}
              onClick={() => setActiveTab('stats')}
            >
              📊 Estadísticas
            </button>
            <button 
              className={activeTab === 'add' ? 'active' : ''}
              onClick={() => setActiveTab('add')}
            >
              ➕ Agregar
            </button>
          </div>
          
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Main Content */}
        <div className="hub-content">
          {/* LIST TAB */}
          {activeTab === 'list' && (
            <div className="shoplist-list-layout">
              <div className="shoplist-main-area">
                <ShopListView
                  items={items}
                  onToggleItem={toggleItem}
                  onDeleteItem={deleteItem}
                  onEditItem={(item, updates) => editItem(item.id, updates)}
                  budget={budget}
                />
              </div>
              <div className="shoplist-sidebar">
                <div className="shoplist-sidebar-widget">
                  <ShopStats items={items} budget={budget} />
                </div>
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="shoplist-stats-layout">
              <div className="stats-full-width">
                <ShopStats items={items} budget={budget} />
              </div>
            </div>
          )}

          {/* ADD TAB */}
          {activeTab === 'add' && (
            <div className="shoplist-add-layout">
              <section className="shoplist-glass-panel shoplist-quick-capture-v2">
                <h3>Agregar Nuevo Item</h3>
                <p>Captura rápidamente un artículo para tu lista de compras.</p>
                
                <div className="field-group-v2">
                  <label>Nombre del artículo</label>
                  <input
                    type="text"
                    value={quickCapture.name}
                    onChange={(e) => setQuickCapture(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Leche, Pan, Huevos..."
                    autoFocus
                  />
                </div>

                <div className="field-row-v2">
                  <div className="field-group-v2">
                    <label>Categoría</label>
                    <div className="category-selector-v2">
                      {categoryOptions.map(opt => (
                        <button
                          key={opt.value}
                          className={quickCapture.category === opt.value ? 'active' : ''}
                          onClick={() => setQuickCapture(prev => ({ ...prev, category: opt.value }))}
                          style={{ 
                            borderColor: quickCapture.category === opt.value ? opt.color : undefined,
                            background: quickCapture.category === opt.value ? `${opt.color}20` : undefined
                          }}
                        >
                          <span>{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="field-row-v2">
                  <div className="field-group-v2">
                    <label>Prioridad</label>
                    <div className="priority-selector-v2">
                      {priorityOptions.map(opt => (
                        <button
                          key={opt.value}
                          className={quickCapture.priority === opt.value ? 'active' : ''}
                          onClick={() => setQuickCapture(prev => ({ ...prev, priority: opt.value }))}
                          style={{ color: opt.color }}
                        >
                          {opt.emoji} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="field-row-v2">
                  <div className="field-group-v2">
                    <label>Precio Unitario</label>
                    <input
                      type="number"
                      value={quickCapture.price}
                      onChange={(e) => setQuickCapture(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="field-group-v2">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      value={quickCapture.quantity}
                      onChange={(e) => setQuickCapture(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      min="1"
                    />
                  </div>
                </div>

                <div className="field-group-v2">
                  <label>Notas (opcional)</label>
                  <input
                    type="text"
                    value={quickCapture.notes}
                    onChange={(e) => setQuickCapture(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Marca, tienda específica, etc."
                  />
                </div>
                
                <button className="primary-btn-v2" onClick={addItem}>
                  🛒 Agregar a la lista
                </button>
              </section>

              <section className="shoplist-tips-panel">
                <h4>💡 Consejos</h4>
                <ul>
                  <li><strong>🔥 Crítica:</strong> Artículos esenciales que necesitas urgentemente</li>
                  <li><strong>⚡ Alta:</strong> Artículos importantes para esta semana</li>
                  <li><strong>📌 Media:</strong> Cosas que necesitas pero no urgentes</li>
                  <li><strong>🌱 Baja:</strong> Artículos deseados pero no necesarios</li>
                  <li><strong>⏳ Normal:</strong> Items de compra regular</li>
                </ul>
                
                <div className="budget-quick-set">
                  <h5>💰 Presupuesto</h5>
                  <div className="budget-input-row">
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                      placeholder="Presupuesto total"
                      min="0"
                      step="1"
                    />
                    <span>USD</span>
                  </div>
                  <p className="budget-hint">Define tu presupuesto para seguimiento de gastos</p>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShoplistHub
