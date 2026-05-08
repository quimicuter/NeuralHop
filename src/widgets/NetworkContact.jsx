import React from 'react'
import './NetworkContact.css'

function NetworkContact({ entries, onContactClick }) {
  // Solo usar entries de Firebase de tipo 'research-contact' o con contactType
  const contacts = (entries || []).filter(e => 
    e.type === 'research-contact' || e.metadata?.contactType === 'research'
  ).map(entry => ({
    id: entry.metadata?.contactId || entry.id,
    name: entry.title,
    emoji: entry.metadata?.emoji || '🔬',
    color: entry.metadata?.color || '#667eea',
    institution: entry.metadata?.institution || 'Institución no definida',
    role: entry.metadata?.role || 'Contacto de investigación',
    lastInteraction: entry.metadata?.lastInteraction,
    notes: entry.metadata?.notes,
    entryId: entry.id
  }))

  return (
    <div className="network-contact-widget">
      <div className="network-header">
        <h3 className="network-title">🌐 Network Contact</h3>
        <p className="network-subtitle">Red de investigación académica</p>
      </div>

      <div className="network-list">
        {contacts.map(contact => (
          <div 
            key={contact.id}
            className="network-card"
            onClick={() => onContactClick && onContactClick(contact)}
            style={{ cursor: onContactClick ? 'pointer' : 'default' }}
          >
            <div 
              className="network-avatar"
              style={{ background: `${contact.color}20`, borderColor: contact.color }}
            >
              <span style={{ color: contact.color }}>{contact.emoji}</span>
            </div>
            <div className="network-info">
              <h4 className="network-name">{contact.name}</h4>
              <p className="network-role">{contact.role}</p>
              <p className="network-institution">🏛️ {contact.institution}</p>
              {contact.lastInteraction && (
                <p className="network-last-contact">
                  Último contacto: {new Date(contact.lastInteraction + 'T12:00:00').toLocaleDateString('es-MX')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NetworkContact
