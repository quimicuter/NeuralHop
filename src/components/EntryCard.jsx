import React from 'react'
import { IconRenderer } from './IconRenderer'
import { MODULE_CONFIG, SCOPE_LABELS } from './GlobalAddModal'
import './EntryCard.css'

// ===== Helpers de origen =====
const getScopeIcon = (entry) => {
  const scope = entry?.scope
  return SCOPE_LABELS?.[scope]?.icon || 'Circle'
}

const getSubmoduleIcon = (entry) => {
  const moduleCfg = MODULE_CONFIG?.[entry?.module]
  if (!moduleCfg) return 'Dot'
  const subId = entry?.metadata?.category || entry?.category
  const sub = moduleCfg.submodules?.find(s => s.id === subId)
  if (sub?.icon) return sub.icon
  return moduleCfg.icon || 'Dot'
}

const getEventMarkerIcon = (entry) => {
  if (!entry) return 'Calendar'
  const moduleIcon = MODULE_CONFIG?.[entry.module]?.icon
  const metadataIcon = entry.metadata?.icon
  return metadataIcon || moduleIcon || getScopeIcon(entry) || 'Calendar'
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
          <span className="entry-event-marker" aria-hidden="true">
            <IconRenderer icon={getEventMarkerIcon(entry)} size={16} />
          </span>
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
          <IconRenderer icon={getScopeIcon(entry)} size={14} />
        </span>
        <span className="entry-title">{entry?.title || entry?.name || 'Sin título'}</span>
        {entry?.module === 'wellness' && (
          <span className="entry-submodule-symbol" aria-hidden="true">
            <IconRenderer icon={getSubmoduleIcon(entry)} size={12} />
          </span>
        )}
      </div>
    </div>
  )
}

export default EntryCard
