import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import {
  subscribeSleepLog,
  setSleepReflection,
  toDateKey,
  QUALITY_COLORS,
  QUALITY_SCORE,
} from '../engine/SleepEngine'
import SleepEntryModal from './SleepEntryModal'
import './SleepTracker.css'

const DAY_LABELS_ES = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

// Build array of last N days as { dateKey, label, dow }
function buildDateRange(days, today = new Date()) {
  const arr = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    arr.push({
      dateKey: toDateKey(d),
      label: DAY_LABELS_ES[d.getDay()],
      dom: d.getDate(),
    })
  }
  return arr
}

function SleepTracker() {
  const [logByDate, setLogByDate] = useState({}) // { 'YYYY-MM-DD': entry }
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState(null)
  const [reflection, setReflection] = useState('')
  const [reflectionDirty, setReflectionDirty] = useState(false)
  const reflectionTimerRef = useRef(null)

  // Suscripción 30 días
  useEffect(() => {
    const unsub = subscribeSleepLog(30, (rows) => {
      const map = {}
      rows.forEach(r => { map[r.date] = r })
      setLogByDate(map)
    })
    return () => unsub && unsub()
  }, [])

  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const todayEntry = logByDate[todayKey]

  // Sincroniza textarea de reflexión con el día de hoy
  useEffect(() => {
    if (!reflectionDirty) {
      setReflection(todayEntry?.reflection || '')
    }
  }, [todayEntry, reflectionDirty])

  // Autosave debounced
  const onReflectionChange = useCallback((value) => {
    setReflection(value)
    setReflectionDirty(true)
    if (reflectionTimerRef.current) clearTimeout(reflectionTimerRef.current)
    reflectionTimerRef.current = setTimeout(async () => {
      await setSleepReflection(todayKey, value)
      setReflectionDirty(false)
    }, 800)
  }, [todayKey])

  // Datos para AreaChart de 7 días
  const last7 = useMemo(() => buildDateRange(7), [])
  const chart7Data = useMemo(() => last7.map(d => ({
    label: d.label,
    hours: logByDate[d.dateKey]?.hours ?? 0,
    quality: logByDate[d.dateKey]?.quality ?? null,
    dateKey: d.dateKey,
  })), [last7, logByDate])

  // Datos para BarChart de 30 días
  const last30 = useMemo(() => buildDateRange(30), [])
  const chart30Data = useMemo(() => last30.map(d => ({
    dom: d.dom,
    hours: logByDate[d.dateKey]?.hours ?? 0,
    quality: logByDate[d.dateKey]?.quality ?? null,
    dateKey: d.dateKey,
  })), [last30, logByDate])

  // Stats: promedio + streak
  const validEntries = useMemo(
    () => Object.values(logByDate).filter(e => typeof e.hours === 'number' && e.hours > 0),
    [logByDate]
  )
  const avgHours = useMemo(() => {
    if (!validEntries.length) return 0
    return validEntries.reduce((a, b) => a + b.hours, 0) / validEntries.length
  }, [validEntries])

  // Streak: días consecutivos hacia atrás desde hoy con quality >= 'good' (score >= 4)
  const streak = useMemo(() => {
    let count = 0
    const today = new Date()
    for (let i = 0; i < 60; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = toDateKey(d)
      const entry = logByDate[key]
      if (entry && QUALITY_SCORE[entry.quality] >= 4) count++
      else break
    }
    return count
  }, [logByDate])

  const handleDotClick = (dateKey) => {
    setModalDate(dateKey)
    setModalOpen(true)
  }

  return (
    <div className="st-tracker">
      {/* Header */}
      <div className="st-header">
        <h2 className="st-title">Sleep Tracker</h2>
        <div className="st-stats">
          <span className="st-stat">
            <span className="st-stat-num">{avgHours.toFixed(1)}h</span>
            <span className="st-stat-lbl">prom</span>
          </span>
          <span className="st-stat">
            <span className="st-stat-num">{streak}</span>
            <span className="st-stat-lbl">streak ☾</span>
          </span>
        </div>
      </div>

      {/* AreaChart 7d */}
      <div className="st-area-wrap">
        <ResponsiveContainer width="100%" height={88}>
          <AreaChart data={chart7Data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="violetArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'rgba(15,23,42,0.45)', fontFamily: 'Inter' }}
              interval={0}
            />
            <YAxis hide domain={[0, 10]} />
            <Tooltip
              cursor={{ stroke: 'rgba(167,139,250,0.4)', strokeWidth: 1 }}
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '0.5rem',
                fontSize: '0.65rem',
                padding: '4px 8px',
                boxShadow: '0 4px 16px rgba(80,40,180,0.12)',
              }}
              labelStyle={{ color: 'rgba(15,23,42,0.6)', fontSize: '0.6rem' }}
              formatter={(v) => [`${v}h`, 'Sueño']}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#7c3aed"
              strokeWidth={1.8}
              fill="url(#violetArea)"
              activeDot={{ r: 3.5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Dots — últimos 7 días */}
      <div className="st-dots-section">
        <span className="st-section-label">Daily Dots</span>
        <div className="st-dots-row">
          {last7.map((d) => {
            const entry = logByDate[d.dateKey]
            const color = entry?.quality ? QUALITY_COLORS[entry.quality] : null
            const isToday = d.dateKey === todayKey
            return (
              <button
                key={d.dateKey}
                className={`st-dot ${entry ? 'filled' : 'empty'} ${isToday ? 'today' : ''}`}
                style={entry ? {
                  background: color,
                  borderColor: color,
                  boxShadow: `0 0 8px ${color}80`,
                } : {}}
                onClick={() => handleDotClick(d.dateKey)}
                title={entry
                  ? `${d.dateKey} · ${entry.hours}h · ${entry.quality}`
                  : `${d.dateKey} · sin registro`}
              >
                <span className="st-dot-label">{d.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid 2 columnas: 30d chart + reflexión */}
      <div className="st-bottom-grid">
        <div className="st-30d">
          <span className="st-section-label">Últimos 30 días</span>
          <div className="st-30d-chart">
            <ResponsiveContainer width="100%" height={70}>
              <BarChart data={chart30Data} margin={{ top: 2, right: 2, bottom: 0, left: 0 }} barCategoryGap={1}>
                <XAxis dataKey="dom" hide />
                <YAxis hide domain={[0, 10]} />
                <Tooltip
                  cursor={{ fill: 'rgba(167,139,250,0.08)' }}
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(167,139,250,0.3)',
                    borderRadius: '0.5rem',
                    fontSize: '0.6rem',
                    padding: '3px 6px',
                  }}
                  labelFormatter={(v) => `Día ${v}`}
                  formatter={(v) => [`${v}h`, 'Sueño']}
                />
                <Bar dataKey="hours" radius={[2, 2, 0, 0]}>
                  {chart30Data.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.quality ? QUALITY_COLORS[d.quality] : 'rgba(167,139,250,0.18)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="st-reflection">
          <span className="st-section-label">
            Reflexión de hoy
            {reflectionDirty && <span className="st-saving"> · guardando…</span>}
          </span>
          <textarea
            className="st-reflection-textarea"
            value={reflection}
            onChange={(e) => onReflectionChange(e.target.value)}
            placeholder="¿Cómo te sientes hoy? Una nota breve…"
            rows={3}
            maxLength={240}
          />
        </div>
      </div>

      {/* Modal de registro */}
      <SleepEntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dateKey={modalDate}
        initialData={modalDate ? logByDate[modalDate] : null}
      />
    </div>
  )
}

export default SleepTracker
