import React, { useState } from 'react'
import './MultiLanguageDB.css'

// Filtros de idiomas - Idiomas Hub
const LANGUAGES = [
  { id: 'frances', label: 'Français', emoji: '🇫🇷', color: '#0055a4' },
  { id: 'aleman', label: 'Deutsch', emoji: '🇩🇪', color: '#ffce00' },
  { id: 'italiano', label: 'Italiano', emoji: '🇮🇹', color: '#009246' },
  { id: 'japones', label: '日本語', emoji: '🇯🇵', color: '#bc002d' },
  { id: 'toefl', label: 'TOEFL', emoji: '🇺🇸', color: '#1a3b5d' }
]

function MultiLanguageDB({ entries, onLanguageSelect }) {
  const [activeLanguage, setActiveLanguage] = useState('frances')

  // Filtrar entries por idioma
  const languageEntries = entries?.filter(e => 
    e.metadata?.language === activeLanguage || e.tags?.includes(activeLanguage)
  ) || []

  const activeLangData = LANGUAGES.find(l => l.id === activeLanguage)

  const handleLanguageChange = (langId) => {
    setActiveLanguage(langId)
    if (onLanguageSelect) {
      onLanguageSelect(langId)
    }
  }

  return (
    <div className="multi-language-db">
      <div className="language-header">
        <h3 className="language-title">🌍 Multi Language DB</h3>
        <p className="language-subtitle">Repositorio de vocabulario y frases</p>
      </div>

      {/* Language Flags */}
      <div className="language-flags">
        {LANGUAGES.map(lang => (
          <button
            key={lang.id}
            className={`language-flag ${activeLanguage === lang.id ? 'active' : ''}`}
            onClick={() => handleLanguageChange(lang.id)}
            style={{ 
              '--lang-color': lang.color,
              '--lang-bg': `${lang.color}15`
            }}
            title={lang.label}
          >
            <span className="flag-emoji">{lang.emoji}</span>
            <span className="flag-label">{lang.label}</span>
          </button>
        ))}
      </div>

      {/* Active Language Content */}
      <div className="language-content" style={{ borderColor: activeLangData?.color }}>
        <div className="language-stats">
          <div className="lang-stat">
            <span className="lang-stat-value">{languageEntries.length}</span>
            <span className="lang-stat-label">Entradas</span>
          </div>
          <div className="lang-stat">
            <span className="lang-stat-value">
              {languageEntries.filter(e => e.completed).length}
            </span>
            <span className="lang-stat-label">Dominadas</span>
          </div>
          <div className="lang-stat">
            <span className="lang-stat-value">
              {Math.round((languageEntries.filter(e => e.completed).length / (languageEntries.length || 1)) * 100)}%
            </span>
            <span className="lang-stat-label">Progreso</span>
          </div>
        </div>

        {languageEntries.length === 0 ? (
          <div className="language-empty">
            <span className="language-empty-emoji">{activeLangData?.emoji}</span>
            <p>No hay entradas para {activeLangData?.label}</p>
            <span className="language-empty-hint">Agrega vocabulario o frases para comenzar</span>
          </div>
        ) : (
          <div className="language-entries">
            {languageEntries.slice(0, 5).map(entry => (
              <div key={entry.id} className={`language-entry ${entry.completed ? 'mastered' : ''}`}>
                <span className="entry-status">{entry.completed ? '✓' : '○'}</span>
                <div className="entry-content">
                  <span className="entry-phrase">{entry.title}</span>
                  {entry.metadata?.translation && (
                    <span className="entry-translation">{entry.metadata.translation}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MultiLanguageDB
