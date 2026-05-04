import React from 'react'
import './MultimediaRepo.css'

// Videos predefinidos como seed data
const DEFAULT_VIDEOS = [
  {
    id: 'rutina-ciatica',
    title: 'Rutina para Ciática',
    emoji: '🦵',
    category: 'Alivio de dolor',
    youtubeId: null // El usuario agregará el ID
  },
  {
    id: 'distension-abdominal',
    title: 'Distensión Abdominal',
    emoji: '🫃',
    category: 'Bienestar digestivo',
    youtubeId: null
  }
]

function MultimediaRepo({ entries, onAddVideo, onVideoClick }) {
  // Mapear entries de tipo 'video' o con youtubeId en metadata
  const videoEntries = entries?.filter(e => 
    e.type === 'video' || e.metadata?.youtubeId
  ) || []

  // Combinar entries con videos por defecto
  const videos = videoEntries.length > 0 
    ? videoEntries.map(entry => ({
        id: entry.id,
        title: entry.title,
        emoji: entry.metadata?.emoji || '📺',
        category: entry.metadata?.category || 'Fitness',
        youtubeId: entry.metadata?.youtubeId
      }))
    : DEFAULT_VIDEOS

  const getYoutubeEmbedUrl = (youtubeId) => {
    if (!youtubeId) return null
    return `https://www.youtube.com/embed/${youtubeId}`
  }

  return (
    <div className="multimedia-repo-widget">
      <div className="multimedia-header">
        <h3 className="multimedia-title">📺 Multimedia Repo</h3>
        <p className="multimedia-subtitle">Rutinas y ejercicios guardados</p>
      </div>

      <div className="multimedia-grid">
        {videos.map(video => {
          const embedUrl = getYoutubeEmbedUrl(video.youtubeId)

          return (
            <div 
              key={video.id} 
              className="multimedia-card"
              onClick={() => onVideoClick && onVideoClick(video)}
              style={{ cursor: onVideoClick ? 'pointer' : 'default' }}
            >
              <div className="multimedia-iframe-wrapper">
                {embedUrl ? (
                  <iframe
                    className="multimedia-iframe"
                    src={embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="multimedia-placeholder">
                    <span className="multimedia-placeholder-emoji">{video.emoji}</span>
                    <span className="multimedia-placeholder-text">
                      Agregar video de YouTube
                    </span>
                  </div>
                )}
              </div>
              <div className="multimedia-info">
                <h4 className="multimedia-video-title">{video.title}</h4>
                <p className="multimedia-video-category">{video.category}</p>
              </div>
            </div>
          )
        })}
      </div>

      {onAddVideo && (
        <button 
          className="multimedia-add-btn"
          onClick={onAddVideo}
        >
          + Agregar video de YouTube
        </button>
      )}
    </div>
  )
}

export default MultimediaRepo
