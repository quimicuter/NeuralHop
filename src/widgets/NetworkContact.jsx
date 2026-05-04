import React from 'react'
import './NetworkContact.css'

// Seed data estricto - Investigación Hub
// SOLO: Dr. Niveen Khashab y Carlos Saul Osorio-González
const RESEARCH_CONTACTS = [
  { 
    id: 'dr-niveen-khashab', 
    name: 'Dr. Niveen Khashab', 
    emoji: '🔬', 
    color: '#667eea',
    institution: 'KAUST',
    role: 'Principal Investigator'
  },
  { 
    id: 'carlos-saul-osorio', 
    name: 'Carlos Saul Osorio-González', 
    emoji: '🧪', 
    color: '#f093fb',
    institution: 'Research Lab',
    role: 'Collaborator'
  }
]

function NetworkContact({ entries, onContactClick }) {
  // Mapear entries de tipo contacto de investigación
  const contactEntries = entries?.filter(e => 
    e.type === 'research-contact' || e.metadata?.contactType === 'research'
  ) || []

  const contacts = RESEARCH_CONTACTS.map(contact => {
    const entry = contactEntries.find(e => 
      e.metadata?.contactId === contact.id || 
      e.title?.toLowerCase().includes(contact.name.toLowerCase())
    )
    
    return {
      ...contact,
      lastInteraction: entry?.metadata?.lastInteraction,
      notes: entry?.metadata?.notes,
      entryId: entry?.id
    }
  })

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
                  Último contacto: {new Date(contact.lastInteraction).toLocaleDateString('es-MX')}
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
