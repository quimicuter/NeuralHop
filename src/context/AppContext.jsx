import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { initEntryEngine, subscribeToAllEntries, addEntry, updateEntry, deleteEntry, filterEntries } from '../engine/EntryEngine'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug: indicate which env vars are present (booleans)
console.log('Vite raw env:', import.meta.env)
console.log('Firebase env:', {
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  hasStorageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  hasMessagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
  hasMeasurementId: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  mode: import.meta.env.MODE
})

// Inicializa Firebase asegurándote de que no se instancie múltiples veces
let app = null
if (!firebaseConfig.apiKey) {
  console.warn('VITE_FIREBASE_API_KEY parece estar ausente. Firebase no será inicializado en este entorno.')
} else {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    try { getAnalytics(app) } catch (e) { /* analytics optional */ }
    // Inicializar engines con la app
    try {
      initEntryEngine(app)
    } catch (e) {
      console.warn('initEntryEngine warning:', e)
    }
  } catch (e) {
    console.error('❌ Firebase initialization failed:', e)
  }
}

const defaultCategories = {
  personal: { 
    icon: "Heart", 
    label: 'Personal', 
    color: '#ffb3c6', 
    cover: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=600&q=80', 
    subcats: ['Wellness Hub', 'Vida Social', 'Foodie', 'Skincare', 'Haircare'], 
    customFields: [],
    dataRoot: 'personal'
  },
  academico: { 
    icon: "GraduationCap", 
    label: 'Académico', 
    color: '#c8a2c8', 
    cover: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=600&q=80', 
    subcats: ['Tecno Girl', 'Investigación', 'Maestría', 'Laboratorio', 'Química', 'Análisis de Datos'], 
    customFields: ['materia', 'profesor', 'grupo', 'plataforma'],
    dataRoot: 'academic'
  },
  global: {
    icon: "Globe",
    label: 'Global',
    color: '#3b82f6',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    subcats: ['Grimorio', 'Agenda', 'ShopList', 'Notas'],
    customFields: [],
    dataRoot: 'global'
  }
}

const initialState = {
  categories: defaultCategories,
  entries: [],
  pageData: {},
  dashboard: { links: [], biblioteca: [], bgImage: '' },
  quickNotesList: [],
  quickTodos: [],
  pantry: [],
  shoppingList: [],
  weeklyMenu: {},
  enmsWeekPlan: ['', '', '', '', '', ''],
  notes: [],
  monthOffset: 0
}

const ENTRIES_STORAGE_KEY = 'neuralhop-entries-cache'

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_ENTRIES':
      return { ...state, entries: action.payload || [] }

    case 'SET_NOTES':
      return { ...state, notes: action.payload }

    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...(state.notes || []), { ...action.payload, id: Date.now() }]
      }

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: (state.notes || []).map(note => 
          note.id === action.payload.id ? { ...note, ...action.payload } : note
        )
      }

    case 'DELETE_NOTE':
      return {
        ...state,
        notes: (state.notes || []).filter(note => note.id !== action.payload)
      }

    case 'DELETE_NOTES':
      return {
        ...state,
        notes: (state.notes || []).filter(note => !action.payload.includes(note.id))
      }

    case 'SET_MONTH_OFFSET':
      return { ...state, monthOffset: action.payload }

    default:
      return state
  }
}

const AppContext = createContext()

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ENTRIES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          dispatch({ type: 'SET_ENTRIES', payload: parsed })
        }
      }
    } catch (error) {
      console.warn('[AppContext] No se pudieron cargar entries cacheados', error)
    }
  }, [])

  // Suscripción global a entries en tiempo real
  useEffect(() => {
    console.log('[AppContext] Suscribiéndose a entries...')
    const unsubscribe = subscribeToAllEntries((entries) => {
      console.log('[AppContext] Snapshot recibido — total entries:', entries.length, entries)
      dispatch({ type: 'SET_ENTRIES', payload: entries })
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(state.entries || []))
    } catch (error) {
      console.warn('[AppContext] No se pudieron guardar entries cacheados', error)
    }
  }, [state.entries])

  // Helpers derivados del estado de entries
  const getEntries = (filters) => filterEntries(state.entries, filters)
  const getTasks = () => filterEntries(state.entries, { type: 'task', completed: false })
  const getHabits = () => filterEntries(state.entries, { type: 'habit' })
  const getEvents = () => filterEntries(state.entries, { type: 'event', completed: false })
  const getCompletedTasks = () => filterEntries(state.entries, { type: 'task', completed: true })

  const actions = {
    // ─── EntryEngine Universal ───
    addEntry: async (entryData) => {
      return await addEntry(entryData)
    },
    updateEntry: async (entryId, updates) => {
      return await updateEntry(entryId, updates)
    },
    deleteEntry: async (entryId) => {
      return await deleteEntry(entryId)
    },

    // ─── Helpers de filtrado ───
    getEntries,
    getTasks,
    getHabits,
    getEvents,
    getCompletedTasks,

    // ─── Notas (se migrarán a entries en Fase E) ───
    setNotes: (notes) => dispatch({ type: 'SET_NOTES', payload: notes }),
    addNote: (note) => dispatch({ type: 'ADD_NOTE', payload: note }),
    updateNote: (note) => dispatch({ type: 'UPDATE_NOTE', payload: note }),
    deleteNote: (noteId) => dispatch({ type: 'DELETE_NOTE', payload: noteId }),
    deleteNotes: (noteIds) => dispatch({ type: 'DELETE_NOTES', payload: noteIds }),

    setMonthOffset: (offset) => dispatch({ type: 'SET_MONTH_OFFSET', payload: offset }),
    getState: () => state,
  }

  return (
    <AppContext.Provider value={{ state, actions, getEntries, getTasks, getHabits, getEvents, getCompletedTasks }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
