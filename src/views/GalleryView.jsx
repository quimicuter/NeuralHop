import React from 'react'
import './GalleryView.css'

function GalleryView({ entries, imageKey = 'photoUrl', titleKey = 'title', subtitleKey, onItemClick, renderItem }) {
  return (
    <div className="gallery-view">
      {entries.length === 0 ? (
        <div className="gallery-empty">
          <span>No hay items para mostrar ✨</span>
        </div>
      ) : (
        entries.map(entry => (
          <div
            key={entry.id}
            className="gallery-item"
            onClick={() => onItemClick && onItemClick(entry)}
          >
            {renderItem ? renderItem(entry) : (
              <>
                <div className="gallery-image-wrapper">
                  <img
                    src={entry[imageKey] || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={entry[titleKey]}
                    className="gallery-image"
                    loading="lazy"
                  />
                  <div className="gallery-overlay">
                    <span className="gallery-view-icon">👁️</span>
                  </div>
                </div>
                <div className="gallery-info">
                  <h4 className="gallery-title">{entry[titleKey]}</h4>
                  {subtitleKey && entry[subtitleKey] && (
                    <p className="gallery-subtitle">{entry[subtitleKey]}</p>
                  )}
                  {entry.metadata?.location && (
                    <p className="gallery-location">📍 {entry.metadata.location}</p>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default GalleryView
