import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

function NexusGallery() {
  const { state } = useApp()
  const [activeModal, setActiveModal] = useState(null)
  
  const entries = state.entries || []
  const categories = Object.entries(state.categories || {}).map(([key, cat]) => ({
    id: key,
    ...cat
  }))

  const openModal = (category) => {
    setActiveModal(category)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <>
      <div className="nexus-gallery">
        <h3 className="gallery-title">Galerías</h3>
        <div className="gallery-grid">
          {categories.map(category => (
            <div 
              key={category.id}
              className="gallery-item"
              onClick={() => openModal(category)}
            >
              <div className="gallery-icon">{category.icon}</div>
              <div className="gallery-label">{category.label}</div>
              <div className="gallery-count">
                {entries.filter(task => task.category === category.id).length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Modal System */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="modal-icon">{activeModal.icon}</span>
                {activeModal.label}
              </h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="category-tasks">
                {entries
                  .filter(task => task.category === activeModal.id)
                  .map(task => (
                    <div key={task.id} className="modal-task">
                      <div className="task-emoji">{activeModal.icon}</div>
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          {task.subcategory && <span className="task-subcat">{task.subcategory}</span>}
                          {task.tags && task.tags.map(tag => (
                            <span key={tag} className="task-tag">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NexusGallery
