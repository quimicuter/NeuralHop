import { useEffect, useMemo, useState } from 'react'
import {
  setSleepEntry,
  calcHours,
  QUALITY_OPTIONS,
} from '../engine/SleepEngine'
import './SleepEntryModal.css'

function SleepEntryModal({ isOpen, onClose, dateKey, initialData }) {
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState('good')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Reset form whenever modal opens or initial data changes
  useEffect(() => {
    if (!isOpen) return
    setBedtime(initialData?.bedtime || '23:00')
    setWakeTime(initialData?.wakeTime || '07:00')
    setQuality(initialData?.quality || 'good')
    setNote(initialData?.note || '')
  }, [isOpen, initialData])

  const hours = useMemo(() => calcHours(bedtime, wakeTime), [bedtime, wakeTime])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!dateKey) return
    setSaving(true)
    const ok = await setSleepEntry(dateKey, {
      bedtime,
      wakeTime,
      hours,
      quality,
      note,
      reflection: initialData?.reflection || '',
    })
    setSaving(false)
    if (ok) onClose?.()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.()
  }

  // Format date for header (YYYY-MM-DD → human readable)
  const formattedDate = useMemo(() => {
    if (!dateKey) return ''
    const [y, m, d] = dateKey.split('-')
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }, [dateKey])

  return (
    <div className="sem-backdrop" onClick={handleBackdropClick}>
      <div className="sem-modal" role="dialog" aria-modal="true">
        <header className="sem-header">
          <div>
            <h3 className="sem-title">Registro de Sueño</h3>
            <p className="sem-subtitle">{formattedDate}</p>
          </div>
          <button className="sem-close" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        <div className="sem-body">
          {/* Times */}
          <div className="sem-time-row">
            <label className="sem-field">
              <span className="sem-label">🌙 Hora de dormir</span>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="sem-input"
              />
            </label>
            <label className="sem-field">
              <span className="sem-label">☀️ Hora de despertar</span>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="sem-input"
              />
            </label>
          </div>

          {/* Calculated hours */}
          <div className="sem-hours-display">
            <span className="sem-hours-num">{hours.toFixed(1)}</span>
            <span className="sem-hours-lbl">horas dormidas</span>
          </div>

          {/* Quality options */}
          <div className="sem-quality">
            <span className="sem-label">¿Cómo dormiste?</span>
            <div className="sem-quality-row">
              {QUALITY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`sem-quality-btn ${quality === opt.id ? 'active' : ''}`}
                  style={quality === opt.id ? {
                    background: opt.color,
                    borderColor: opt.color,
                    boxShadow: `0 0 12px ${opt.color}80`,
                  } : {}}
                  onClick={() => setQuality(opt.id)}
                >
                  <span className="sem-q-emoji">{opt.emoji}</span>
                  <span className="sem-q-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <label className="sem-field">
            <span className="sem-label">Nota (opcional)</span>
            <textarea
              className="sem-textarea"
              rows={2}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Sueños, cómo te sentiste al despertar…"
            />
          </label>
        </div>

        <footer className="sem-footer">
          <button className="sem-btn ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="sem-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default SleepEntryModal
