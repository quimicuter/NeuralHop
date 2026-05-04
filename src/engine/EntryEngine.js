import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'

let db = null

export function initEntryEngine(app) {
  if (app) {
    db = getFirestore(app)
  }
}

export function isReady() {
  return db !== null
}

// ─────────────────────────────────────────────
// CREATE - Agregar entry a colección 'entries'
// ─────────────────────────────────────────────
export async function addEntry(entryData) {
  if (!db) { console.warn('EntryEngine: Firebase not initialized'); return null }
  try {
    const entryRef = doc(collection(db, 'entries'))
    const entry = {
      ...entryData,
      completed: false,
      status: entryData.status || 'todo',
      createdAt: serverTimestamp(),
      completedAt: null,
    }
    await setDoc(entryRef, entry)
    return entryRef.id
  } catch (e) {
    console.error('EntryEngine addEntry error:', e)
    return null
  }
}

// ─────────────────────────────────────────────
// READ - Obtener entry por ID
// ─────────────────────────────────────────────
export async function getEntry(entryId) {
  if (!db) return null
  try {
    const entryRef = doc(db, 'entries', entryId)
    const entryDoc = await getDocs(entryRef)
    if (entryDoc.exists()) {
      return { id: entryDoc.id, ...entryDoc.data() }
    }
    return null
  } catch (e) {
    console.error('EntryEngine getEntry error:', e)
    return null
  }
}

// ─────────────────────────────────────────────
// UPDATE - Actualizar entry
// ─────────────────────────────────────────────
export async function updateEntry(entryId, updates) {
  if (!db) return false
  try {
    const entryRef = doc(db, 'entries', entryId)
    const payload = { ...updates }
    // Auto-set completedAt when marking completed
    if (updates.completed === true && !updates.completedAt) {
      payload.completedAt = serverTimestamp()
    }
    if (updates.completed === false) {
      payload.completedAt = null
    }
    await updateDoc(entryRef, payload)
    return true
  } catch (e) {
    console.error('EntryEngine updateEntry error:', e)
    return false
  }
}

// ─────────────────────────────────────────────
// DELETE - Eliminar entry
// ─────────────────────────────────────────────
export async function deleteEntry(entryId) {
  if (!db) return false
  try {
    const entryRef = doc(db, 'entries', entryId)
    await deleteDoc(entryRef)
    return true
  } catch (e) {
    console.error('EntryEngine deleteEntry error:', e)
    return false
  }
}

// ─────────────────────────────────────────────
// SUBSCRIBE - Real-time listener con filtros
// ─────────────────────────────────────────────
export function subscribeToEntries(filters = {}, callback) {
  if (!db) return () => {}

  const constraints = []

  // Filtros dinámicos
  if (filters.type) {
    constraints.push(where('type', '==', filters.type))
  }
  if (filters.scope) {
    constraints.push(where('scope', '==', filters.scope))
  }
  if (filters.module) {
    constraints.push(where('module', '==', filters.module))
  }
  if (filters.completed !== undefined) {
    constraints.push(where('completed', '==', filters.completed))
  }
  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  }
  if (filters.priority) {
    constraints.push(where('priority', '==', filters.priority))
  }

  // Ordenamiento
  if (filters.orderBy) {
    constraints.push(orderBy(filters.orderBy, filters.orderDir || 'desc'))
  } else {
    constraints.push(orderBy('createdAt', 'desc'))
  }

  // Límite
  if (filters.limit) {
    constraints.push(limit(filters.limit))
  }

  const q = query(collection(db, 'entries'), ...constraints)

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const entries = []
    snapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() })
    })
    callback(entries)
  }, (error) => {
    console.error('EntryEngine subscribeToEntries error:', error)
  })

  return unsubscribe
}

// ─────────────────────────────────────────────
// SUBSCRIBE ALL - Listener global sin filtros
// ─────────────────────────────────────────────
export function subscribeToAllEntries(callback) {
  if (!db) return () => {}

  const q = query(collection(db, 'entries'), orderBy('createdAt', 'desc'))
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const entries = []
    snapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() })
    })
    callback(entries)
  }, (error) => {
    console.error('EntryEngine subscribeToAllEntries error:', error)
  })

  return unsubscribe
}

// ─────────────────────────────────────────────
// FILTER HELPERS - Filtrado en memoria (para queries compuestas)
// ─────────────────────────────────────────────
export function filterEntries(entries, filters = {}) {
  return entries.filter(entry => {
    if (filters.type && entry.type !== filters.type) return false
    if (filters.scope && entry.scope !== filters.scope) return false
    if (filters.module && entry.module !== filters.module) return false
    if (filters.completed !== undefined && entry.completed !== filters.completed) return false
    if (filters.status && entry.status !== filters.status) return false
    if (filters.priority && entry.priority !== filters.priority) return false
    if (filters.tag && (!entry.tags || !entry.tags.includes(filters.tag))) return false
    return true
  })
}
