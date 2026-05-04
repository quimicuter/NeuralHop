import React, { useState } from 'react'
import TableView from '../views/TableView'
import './InventoryTable.css'

// Categorías de inventario del Lab
const INVENTORY_CATEGORIES = [
  { id: 'reactivos', label: 'Reactivos', emoji: '🧪' },
  { id: 'material-roto', label: 'Material Roto', emoji: '🔧' },
  { id: 'protocolos', label: 'Protocolos', emoji: '📋' }
]

function InventoryTable({ entries, onRowClick }) {
  const [activeCategory, setActiveCategory] = useState('all')

  // Filtrar entries de inventario
  const inventoryEntries = entries?.filter(e => 
    e.type === 'inventory' || e.metadata?.inventoryType
  ) || []

  const filteredEntries = activeCategory === 'all'
    ? inventoryEntries
    : inventoryEntries.filter(e => e.metadata?.category === activeCategory)

  const columns = [
    { key: 'item', title: 'Item' },
    { key: 'category', title: 'Categoría' },
    { key: 'quantity', title: 'Cantidad' },
    { key: 'status', title: 'Estado' },
    { key: 'lastUpdated', title: 'Actualizado' }
  ]

  const renderCell = (entry, key) => {
    switch (key) {
      case 'item':
        return (
          <div className="inventory-item-cell">
            <span className="inventory-item-emoji">
              {INVENTORY_CATEGORIES.find(c => c.id === entry.metadata?.category)?.emoji || '📦'}
            </span>
            <span>{entry.title}</span>
          </div>
        )
      
      case 'category':
        const cat = INVENTORY_CATEGORIES.find(c => c.id === entry.metadata?.category)
        return cat ? `${cat.emoji} ${cat.label}` : 'General'
      
      case 'quantity':
        return (
          <span className="inventory-quantity">
            {entry.metadata?.quantity || 1} {entry.metadata?.unit || 'unidad(es)'}
          </span>
        )
      
      case 'status':
        const statusColors = {
          'available': { bg: '#e8f5e9', color: '#2e7d32', label: 'Disponible' },
          'low': { bg: '#fff3e0', color: '#e65100', label: 'Bajo stock' },
          'out': { bg: '#ffebee', color: '#c62828', label: 'Agotado' },
          'broken': { bg: '#f3e5f5', color: '#7b1fa2', label: 'Dañado' }
        }
        const status = statusColors[entry.metadata?.status] || statusColors['available']
        return (
          <span 
            className="inventory-status-badge"
            style={{ background: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        )
      
      case 'lastUpdated':
        return entry.metadata?.lastUpdated
          ? new Date(entry.metadata.lastUpdated).toLocaleDateString('es-MX')
          : 'N/A'
      
      default:
        return entry[key] || '-'
    }
  }

  return (
    <div className="inventory-table-widget">
      <div className="inventory-header">
        <h3 className="inventory-title">📦 Inventory Table</h3>
        <p className="inventory-subtitle">Gestión de recursos del laboratorio</p>
      </div>

      {/* Filtros */}
      <div className="inventory-filters">
        <button
          className={`inventory-filter ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          Todos
        </button>
        {INVENTORY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`inventory-filter ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <TableView
        entries={filteredEntries}
        columns={columns}
        onRowClick={onRowClick}
        renderCell={renderCell}
      />
    </div>
  )
}

export default InventoryTable
