import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { calcHours, setSleepEntry, QUALITY_OPTIONS } from '../../engine/SleepEngine'
import './SleepEntryModal.css'

/**
 * SleepEntryModal — registra/edita el sueño de un día específico.
 * Props:
 *   isOpen, onClose, dateKey (YYYY-MM-DD), initialData ({ bedtime, wakeTime, quality, note }|null)
 */
function SleepEntryModal({ isOpen, onClose, dateKey, initialData }) {
  const [bedtime,  setBedtime]  = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality,  setQuality]  = useState('good')
  const [note,     setNote]     = useState('')
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setBedtime(initialData?.bedtime  ?? '23:00')
    setWakeTime(initialData?.wakeTime ?? '07:00')
    setQuality(initialData?.quality  ?? 'good')
    setNote(initialData?.note         ?? '')
  }, [isOpen, initialData])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const hours = useMemo(() => calcHours(bedtime, wakeTime), [bedtime, wakeTime])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const ok = await setSleepEntry(dateKey, { bedtime, wakeTime, hours, quality, note })
    setSaving(false)
    if (ok) onClose()
    else alert('Error al guardar el registro de sueño. Revisa la consola.')
  }

  const prettyDate = useMemo(() => {
    if (!dateKey) return ''
    try {
      const [y, m, d] = dateKey.split('-').map(Number)
      return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long'
      })
    } catch { return dateKey }
  }, [dateKey])

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div className="sem-overlay">
          <motion.div
            className="sem-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="sem-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Registrar sueño"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
          >
            <header className="sem-header">
              <div className="sem-header-left">
                <span className="sem-header-icon">☾</span>
                <div>
                  <h2 className="sem-title">Registrar Sueño</h2>
                  <p className="sem-subtitle">{prettyDate}</p>
                </div>
              </div>
              <button className="sem-close" onClick={onClose} aria-label="Cerrar">✕</button>
            </header>

            <div className="sem-body">
              {/* Horas */}
              <div className="sem-row">
                <label className="sem-field">
                  <span className="sem-label">Dormí a las</span>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="sem-time"
                  />
                </label>

                <label className="sem-field">
                  <span className="sem-label">Desperté a las</span>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="sem-time"
                  />
                </label>

                <div className="sem-hours-chip">
                  <span className="sem-hours-num">{hours.toFixed(1)}</span>
                  <span className="sem-hours-unit">horas</span>
                </div>
              </div>

              {/* Calidad */}
              <div className="sem-field-block">
                <span className="sem-label">¿Qué tan bien descansaste?</span>
                <div className="sem-quality-row">
                  {QUALITY_OPTIONS.map(q => (
                    <button
                      key={q.id}
                      className={`sem-quality-btn ${quality === q.id ? 'active' : ''}`}
                      style={quality === q.id ? {
                        background: q.color,
                        borderColor: q.color,
                        boxShadow: `0 0 14px ${q.color}66`
                      } : {}}
                      onClick={() => setQuality(q.id)}
                      title={q.label}
                    >
                      <span className="sem-quality-emoji">{q.emoji}</span>
                      <span className="sem-quality-label">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nota */}
              <label className="sem-field-block">
                <span className="sem-label">Nota corta (opcional)</span>
                <textarea
                  className="sem-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="¿Algo que recordar de esta noche?"
                  rows={2}
                  maxLength={140}
                />
              </label>
            </div>

            <footer className="sem-footer">
              <button className="sem-btn sem-btn-ghost" onClick={onClose}>Cancelar</button>
              <button
                className="sem-btn sem-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return createPortal(modal, document.body)
}

export default SleepEntryModal
