import React, { useState } from 'react'
import GalleryView from '../views/GalleryView'
import './VirtualShelf.css'

// Categorías predeterminadas según especificación: Skincare, Haircare, Gel Nail Polish
const CATEGORIES = [
  { id: 'skincare', label: 'Skincare', emoji: '✨' },
  { id: 'haircare', label: 'Haircare', emoji: '💇‍♀️' },
  { id: 'gel-nail-polish', label: 'Gel Nail Polish', emoji: '💅' }
]

function VirtualShelf({ entries }) {
  const [activeCategory, setActiveCategory] = useState('all')

  // Filtrar entries por categoría
  const filteredEntries = activeCategory === 'all'
    ? entries
    : entries.filter(entry => entry.metadata?.category === activeCategory)

  return (
    <div className="virtual-shelf">
      <div className="shelf-header">
        <h3 className="shelf-title">🛍️ Virtual Shelf</h3>
        
        <div className="shelf-filters">
          <button
            className={`shelf-filter ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`shelf-filter ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <GalleryView
        entries={filteredEntries}
        imageKey="metadata.photoUrl"
        titleKey="title"
        subtitleKey="metadata.brand"
        renderItem={(entry) => (
          <>
            <div className="shelf-image-wrapper">
              <img
                src={entry.metadata?.photoUrl || 'https://via.placeholder.com/300x200?text=Producto'}
                alt={entry.title}
                className="shelf-image"
                loading="lazy"
              />
              <div className="shelf-overlay">
                <span className="shelf-view-icon">👁️</span>
              </div>
              {entry.metadata?.category && (
                <span className="shelf-category-badge">
                  {CATEGORIES.find(c => c.id === entry.metadata.category)?.emoji}
                </span>
              )}
            </div>
            <div className="shelf-info">
              <h4 className="shelf-product-name">{entry.title}</h4>
              {entry.metadata?.brand && (
                <p className="shelf-brand">{entry.metadata.brand}</p>
              )}
              {entry.metadata?.notes && (
                <p className="shelf-notes">{entry.metadata.notes}</p>
              )}
            </div>
          </>
        )}
      />
    </div>
  )
}

export default VirtualShelf
