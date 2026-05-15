import React from 'react'
import { MODULE_CONFIG, SCOPE_LABELS } from './GlobalAddModal'
import './EntryCard.css'

// ===== Helpers de origen =====
const getScopeEmoji = (entry) => {
  const scope = entry?.scope
  return SCOPE_LABELS?.[scope]?.emoji || '✦'
}

const getSubmoduleSymbol = (entry) => {
  const moduleCfg = MODULE_CONFIG?.[entry?.module]
  if (!moduleCfg) return '·'
  const subId = entry?.metadata?.category || entry?.category
  const sub = moduleCfg.submodules?.find(s => s.id === subId)
  if (sub?.emoji) return sub.emoji
  return moduleCfg.emoji || '·'
}

const getEventMarkerEmoji = (entry) => {
  if (!entry) return '📅'
  const moduleEmoji = MODULE_CONFIG?.[entry.module]?.emoji
  const metadataEmoji = entry.metadata?.emoji
  return metadataEmoji || moduleEmoji || getScopeEmoji(entry) || '📅'
}

// ===== Componente principal =====
function EntryCard({
  entry,
  onToggle,
  onClick,
  isOverdue = false,
  getDateTime,
  hideCheckbox = false,
  variant = 'task' // 'task' | 'event'
}) {
  const priority = entry?.priority || 'low'
  const completed = entry?.completed || entry?.status === 'completed'
  const dateTime = getDateTime?.(entry)
  const scope = entry?.scope || 'general'

  const handleToggle = (e) => {
    e.stopPropagation()
    onToggle?.(entry.id)
  }

  return (
    <div
      className={`entry-card scope-${scope} ${completed ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {/* LADO IZQUIERDO: Checkbox / Indicador de evento */}
      <div className="entry-card-left">
        {variant === 'event' || hideCheckbox ? (
          <span className="entry-event-marker" aria-hidden="true">{getEventMarkerEmoji(entry)}</span>
        ) : (
          <button
            type="button"
            className={`entry-checkbox ${completed ? 'checked' : ''}`}
            onClick={handleToggle}
            aria-label={completed ? 'Marcar como pendiente' : 'Marcar como completado'}
          >
            {completed && <span className="entry-checkbox-tick">✓</span>}
          </button>
        )}
      </div>

      {/* CENTRO: Título + Línea de detalles */}
      <div className="entry-card-center">
        <h4 className={`entry-title ${isOverdue ? 'overdue' : ''}`}>
          {entry?.title || 'Sin título'}
        </h4>
        <div className="entry-detail-row">
          <span
            className={`entry-priority-dot priority-${priority}`}
            title={`Prioridad: ${priority}`}
          />
          {dateTime && <span className="entry-datetime">{dateTime}</span>}
          {entry?.location && variant === 'event' && (
            <span className="entry-location" title={entry.location}>
              📍 {entry.location}
            </span>
          )}
        </div>
      </div>

      {/* LADO DERECHO: Emoji de ámbito, título y símbolo de submódulo */}
      <div className="entry-card-right">
        <span className="entry-scope-emoji" aria-hidden="true">
          {getScopeEmoji(entry)}
        </span>
        <span className="entry-title">{entry?.title || entry?.name || 'Sin título'}</span>
        {entry?.module === 'wellness' && (
          <span className="entry-submodule-symbol" aria-hidden="true">
            {getSubmoduleSymbol(entry)}
          </span>
        )}
      </div>
    </div>
  )
}

export default EntryCard
