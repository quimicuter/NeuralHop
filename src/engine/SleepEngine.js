// ─────────────────────────────────────────────
// SleepEngine — Firestore CRUD para colección 'sleepLog'
// Doc ID = 'YYYY-MM-DD' para upsert por día.
// ─────────────────────────────────────────────
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { getApp } from 'firebase/app'

let db = null
function ensureDb() {
  if (db) return db
  try { db = getFirestore(getApp()) } catch { db = null }
  return db
}

// Sanitize undefined → null (Firestore-safe)
function clean(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    out[k] = v === null ? null : v
  }
  return out
}

// Format Date → YYYY-MM-DD (local timezone)
export function toDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Calculate hours slept between bedtime (HH:mm) and wakeTime (HH:mm).
// If wakeTime <= bedtime, assume next-day wake.
export function calcHours(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return 0
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let bedMin = bh * 60 + bm
  let wakeMin = wh * 60 + wm
  if (wakeMin <= bedMin) wakeMin += 24 * 60
  return +((wakeMin - bedMin) / 60).toFixed(2)
}

// Upsert sleep entry for a date.
export async function setSleepEntry(date, data) {
  const _db = ensureDb()
  if (!_db) { console.warn('SleepEngine: Firebase not initialized'); return false }
  try {
    const ref = doc(_db, 'sleepLog', date)
    const payload = clean({
      date,
      bedtime: data.bedtime ?? null,
      wakeTime: data.wakeTime ?? null,
      hours: data.hours ?? null,
      quality: data.quality ?? null,
      note: data.note ?? '',
      reflection: data.reflection ?? '',
      updatedAt: serverTimestamp(),
    })
    await setDoc(ref, payload, { merge: true })
    return true
  } catch (e) {
    console.error('SleepEngine setSleepEntry error:', e)
    return false
  }
}

// Update only reflection (preserves rest).
export async function setSleepReflection(date, reflection) {
  const _db = ensureDb()
  if (!_db) return false
  try {
    const ref = doc(_db, 'sleepLog', date)
    await setDoc(ref, { date, reflection, updatedAt: serverTimestamp() }, { merge: true })
    return true
  } catch (e) {
    console.error('SleepEngine setSleepReflection error:', e)
    return false
  }
}

export async function getSleepEntry(date) {
  const _db = ensureDb()
  if (!_db) return null
  try {
    const ref = doc(_db, 'sleepLog', date)
    const snap = await getDoc(ref)
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (e) {
    console.error('SleepEngine getSleepEntry error:', e)
    return null
  }
}

// Subscribe to last N days. Returns sorted ascending by date.
export function subscribeSleepLog(days = 30, callback) {
  const _db = ensureDb()
  if (!_db) return () => {}

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days + 1)
  const cutoffKey = toDateKey(cutoff)

  const q = query(
    collection(_db, 'sleepLog'),
    where('date', '>=', cutoffKey),
    orderBy('date', 'asc')
  )

  return onSnapshot(q, (snap) => {
    const rows = []
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }))
    callback(rows)
  }, (err) => {
    console.error('SleepEngine subscribeSleepLog error:', err)
  })
}

// Quality → color mapping (Tailwind-ish crystals).
export const QUALITY_COLORS = {
  awful: '#fca5a5', // red-300
  bad:   '#fcd34d', // amber-300
  ok:    '#c4b5fd', // violet-300
  good:  '#a78bfa', // violet-400
  great: '#7c3aed', // violet-600
}

export const QUALITY_OPTIONS = [
  { id: 'awful', label: 'Pésimo',   emoji: '😵', color: QUALITY_COLORS.awful },
  { id: 'bad',   label: 'Mal',      emoji: '😪', color: QUALITY_COLORS.bad   },
  { id: 'ok',    label: 'Regular',  emoji: '😐', color: QUALITY_COLORS.ok    },
  { id: 'good',  label: 'Bien',     emoji: '🙂', color: QUALITY_COLORS.good  },
  { id: 'great', label: 'Genial',   emoji: '😴', color: QUALITY_COLORS.great },
]

export const QUALITY_SCORE = { awful: 1, bad: 2, ok: 3, good: 4, great: 5 }
