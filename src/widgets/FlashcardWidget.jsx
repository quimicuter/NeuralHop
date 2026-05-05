import React, { useState } from 'react'
import './FlashcardWidget.css'

function FlashcardWidget({ entries, onCardMastered }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Mapear entries de Firebase
  const flashcards = (entries || []).map(e => ({
    id: e.id,
    front: e.title,
    back: e.metadata?.translation || e.content,
    language: e.metadata?.language || 'general'
  }))

  const currentCard = flashcards[currentIndex]

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const handleMaster = () => {
    if (onCardMastered && currentCard) {
      onCardMastered(currentCard.id)
    }
    handleNext()
  }

  if (!currentCard) {
    return (
      <div className="flashcard-widget">
        <div className="flashcard-header">
          <h3 className="flashcard-title">🎴 Flashcard Widget</h3>
        </div>
        <div className="flashcard-empty">
          <p>No hay flashcards disponibles</p>
        </div>
      </div>
    )
  }

  const languageEmojis = {
    'frances': '🇫🇷',
    'aleman': '🇩🇪',
    'italiano': '🇮🇹',
    'japones': '🇯🇵',
    'toefl': '🇺🇸',
    'general': '🌍'
  }

  return (
    <div className="flashcard-widget">
      <div className="flashcard-header">
        <h3 className="flashcard-title">🎴 Flashcard Widget</h3>
        <p className="flashcard-subtitle">
          {currentIndex + 1} / {flashcards.length}
        </p>
      </div>

      <div 
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        <div className="flashcard-inner">
          {/* Frente */}
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-lang">
              {languageEmojis[currentCard.language] || '🌍'}
            </span>
            <span className="flashcard-text">{currentCard.front}</span>
            <span className="flashcard-hint">Toca para voltear</span>
          </div>
          
          {/* Reverso */}
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-text">{currentCard.back}</span>
            <button 
              className="flashcard-master-btn"
              onClick={(e) => {
                e.stopPropagation()
                handleMaster()
              }}
            >
              ✓ Dominado
            </button>
          </div>
        </div>
      </div>

      <div className="flashcard-controls">
        <button className="flashcard-btn" onClick={handlePrev}>← Anterior</button>
        <button className="flashcard-btn primary" onClick={handleFlip}>
          {isFlipped ? 'Ocultar' : 'Mostrar'}
        </button>
        <button className="flashcard-btn" onClick={handleNext}>Siguiente →</button>
      </div>
    </div>
  )
}

export default FlashcardWidget
