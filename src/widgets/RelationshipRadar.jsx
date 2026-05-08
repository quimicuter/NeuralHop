import React from 'react'
import './RelationshipRadar.css'

function RelationshipRadar({ entries }) {
  // Solo usar entries de Firebase de tipo 'contact-entry' o con contactId
  const contacts = (entries || []).filter(e => 
    e.type === 'contact-entry' || e.metadata?.contactId
  ).map(entry => {
    const lastContact = entry.metadata?.lastContactDate || entry.metadata?.lastContact
    const daysSince = lastContact 
      ? Math.ceil((new Date() - new Date(lastContact + 'T12:00:00')) / (1000 * 60 * 60 * 24))
      : null
    
    return {
      id: entry.metadata?.contactId || entry.id,
      name: entry.title,
      emoji: entry.metadata?.emoji || '👤',
      color: entry.metadata?.color || '#90caf9',
      daysSince,
      lastContact,
      entryId: entry.id
    }
  })

  const getProximityRing = (days) => {
    if (days === null) return { ring: 'outer', label: 'Sin registro' }
    if (days <= 3) return { ring: 'inner', label: 'Reciente' }
    if (days <= 7) return { ring: 'middle', label: 'Esta semana' }
    return { ring: 'outer', label: `${days} días` }
  }

  return (
    <div className="relationship-radar">
      <div className="radar-header">
        <h3 className="radar-title">💞 Relationship Radar</h3>
        <p className="radar-subtitle">Círculos concéntricos = proximidad temporal</p>
      </div>

      <div className="radar-container">
        {/* Círculos concéntricos de fondo */}
        <div className="radar-ring radar-ring-outer"></div>
        <div className="radar-ring radar-ring-middle"></div>
        <div className="radar-ring radar-ring-inner"></div>
        
        {/* Centro */}
        <div className="radar-center">
          <span>💓</span>
        </div>

        {/* Contactos posicionados en sus anillos */}
        {contacts.map((contact, index) => {
          const proximity = getProximityRing(contact.daysSince)
          const angle = (index * 120) - 90 // Distribuir en círculo
          
          return (
            <div
              key={contact.id}
              className={`radar-contact ${proximity.ring}`}
              style={{
                '--contact-color': contact.color,
                '--contact-angle': `${angle}deg`
              }}
            >
              <div className="radar-avatar">
                <span className="radar-avatar-emoji">{contact.emoji}</span>
              </div>
              <div className="radar-contact-info">
                <span className="radar-contact-name">{contact.name}</span>
                <span className="radar-contact-days">{proximity.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="radar-legend">
        <div className="radar-legend-item">
          <span className="radar-legend-dot inner"></span>
          <span>Últimos 3 días</span>
        </div>
        <div className="radar-legend-item">
          <span className="radar-legend-dot middle"></span>
          <span>Esta semana</span>
        </div>
        <div className="radar-legend-item">
          <span className="radar-legend-dot outer"></span>
          <span>Más de 7 días</span>
        </div>
      </div>
    </div>
  )
}

export default RelationshipRadar
