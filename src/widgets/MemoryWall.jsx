import React, { useState } from 'react'
import GalleryView from '../views/GalleryView'
import './MemoryWall.css'

const CITIES = [
  { id: 'guanajuato', name: 'Guanajuato', emoji: '🏛️' },
  { id: 'leon', name: 'León', emoji: '🦁' },
  { id: 'queretaro', name: 'Querétaro', emoji: '🌉' },
  { id: 'canada', name: 'Canadá', emoji: '🍁' }
]

function MemoryWall({ entries, onItemClick }) {
  const [activeCity, setActiveCity] = useState('all')

  // Filtrar entries con photoUrl
  const entriesWithPhotos = entries.filter(entry => 
    entry.metadata?.photoUrl || entry.metadata?.imageUrl
  )

  // Filtrar por ciudad
  const filteredEntries = activeCity === 'all'
    ? entriesWithPhotos
    : entriesWithPhotos.filter(entry => 
        entry.metadata?.location?.toLowerCase().includes(activeCity) ||
        entry.metadata?.city?.toLowerCase() === activeCity
      )

  return (
    <div className="memory-wall">
      <div className="memory-header">
        <h3 className="memory-title">📸 Memory Wall</h3>
        <p className="memory-subtitle">Recuerdos de eventos</p>
      </div>

      {/* Filtros de ciudad */}
      <div className="memory-cities">
        <button
          className={`memory-city-btn ${activeCity === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCity('all')}
        >
          Todos
        </button>
        {CITIES.map(city => (
          <button
            key={city.id}
            className={`memory-city-btn ${activeCity === city.id ? 'active' : ''}`}
            onClick={() => setActiveCity(city.id)}
          >
            <span>{city.emoji}</span>
            <span>{city.name}</span>
          </button>
        ))}
      </div>

      <GalleryView
        entries={filteredEntries}
        imageKey="metadata.photoUrl"
        titleKey="title"
        onItemClick={onItemClick}
        renderItem={(entry) => (
          <>
            <div className="memory-image-wrapper">
              <img
                src={entry.metadata?.photoUrl || entry.metadata?.imageUrl}
                alt={entry.title}
                className="memory-image"
                loading="lazy"
              />
              <div className="memory-overlay">
                <span className="memory-view-icon">🔍</span>
              </div>
              {entry.metadata?.location && (
                <span className="memory-location-badge">
                  📍 {entry.metadata.location}
                </span>
              )}
            </div>
            <div className="memory-info">
              <h4 className="memory-event-title">{entry.title}</h4>
              {entry.metadata?.date && (
                <p className="memory-date">
                  {new Date(entry.metadata.date).toLocaleDateString('es-MX', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </>
        )}
      />
    </div>
  )
}

export default MemoryWall
