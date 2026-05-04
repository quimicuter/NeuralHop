import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

let db = null
try {
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)
} catch (e) {
  console.warn('Firebase initialization failed:', e)
  db = null
}

const defaultCategories = {
  personal: { 
    icon: "💕", 
    label: 'Personal', 
    color: '#ffb3c6', 
    cover: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=600&q=80', 
    subcats: ['Selfcare', 'Mindfulness', 'Vida Social', 'Fitness', 'Skincare', 'Haircare'], 
    customFields: [],
    dataRoot: 'personal'
  },
  academico: { 
    icon: "🎓", 
    label: 'Académico', 
    color: '#c8a2c8', 
    cover: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=600&q=80', 
    subcats: ['Data Science', 'Investigación', 'Maestría', 'Laboratorio'], 
    customFields: ['materia', 'profesor', 'grupo', 'plataforma'],
    dataRoot: 'academic'
  },
  global: {
    icon: "�",
    label: 'Global',
    color: '#3b82f6',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    subcats: ['Grimorio', 'Agenda', 'ShopList', 'Notas'],
    customFields: [],
    dataRoot: 'global'
  }
}

const defaultTasks = [
  // Personal Tasks
  { id: 1, type: 'task', title: 'Rutina Pilates Completa', category: 'personal', subcategory: 'Fitness', date: '', priority: 'high', status: 'todo', tags: ['pilates', 'ejercicio'], series: '3', repeticiones: '15', linkVideo: 'https://youtube.com/watch?v=pilates', duracion: '45 min', notes: 'Enfocado en core y flexibilidad' },
  { id: 2, type: 'task', title: 'Meditación Guiada', category: 'personal', subcategory: 'Mindfulness', date: '', priority: 'medium', status: 'todo', tags: ['meditacion', 'relajacion'], series: '1', repeticiones: '1', linkVideo: 'https://youtube.com/watch?v=meditacion', duracion: '20 min', notes: 'Meditación para reducir estrés' },
  { id: 3, type: 'task', title: 'Rutina Facial Completa', category: 'personal', subcategory: 'Skincare', date: '', priority: 'medium', status: 'todo', tags: ['skincare', 'rostro'], series: '1', repeticiones: '1', linkVideo: '', duracion: '30 min', notes: 'Limpieza, exfoliación e hidratación' },
  { id: 4, type: 'task', title: 'Masaje Capilar con Aceites', category: 'personal', subcategory: 'Haircare', date: '', priority: 'low', status: 'todo', tags: ['haircare', 'natural'], series: '1', repeticiones: '1', linkVideo: '', duracion: '15 min', notes: 'Con aceite de coco y romero' },
  { id: 5, type: 'task', title: 'Café con Amigas', category: 'personal', subcategory: 'Vida Social', date: '', priority: 'medium', status: 'todo', tags: ['social', 'amigos'], notes: 'Planificar encuentro semanal' },
  
  // Académico Tasks
  { id: 101, type: 'task', title: 'Proyecto Data Science', category: 'academico', subcategory: 'Data Science', date: '', priority: 'high', status: 'todo', tags: ['proyecto', 'datos'], plataforma: 'GitHub', profesor: 'Dr. Smith', grupo: 'Grupo A', notes: 'Análisis de dataset de ventas' },
  { id: 102, type: 'task', title: 'Investigación Química', category: 'academico', subcategory: 'Investigación', date: '', priority: 'high', status: 'todo', tags: ['investigacion', 'quimica'], materia: 'Química Avanzada', profesor: 'Dra. Johnson', grupo: 'Laboratorio 1', notes: 'Experimento con catalizadores' },
  { id: 103, type: 'task', title: 'Tesis Maestría', category: 'academico', subcategory: 'Maestría', date: '', priority: 'high', status: 'todo', tags: ['tesis', 'maestria'], materia: 'Metodología', profesor: 'Dr. Martinez', grupo: 'Grupo B', notes: 'Capítulo 3: Metodología' },
  { id: 104, type: 'task', title: 'Reporte Laboratorio', category: 'academico', subcategory: 'Laboratorio', date: '', priority: 'medium', status: 'todo', tags: ['laboratorio', 'reporte'], materia: 'Lab Química', profesor: 'Mtra. Garcia', grupo: 'Grupo A', notes: 'Práctica 5: Cinética' },
  
  // Global Tasks
  { id: 201, type: 'task', title: 'Actualizar Grimorio', category: 'global', subcategory: 'Grimorio', date: '', priority: 'medium', status: 'todo', tags: ['grimorio', 'actualizacion'], notes: 'Añadir nuevos hechizos y rituales' },
  { id: 202, type: 'event', title: 'Reunión Semanal', category: 'global', subcategory: 'Agenda', date: '2026-04-10', priority: 'high', status: 'todo', tags: ['reunion', 'semanal'], notes: 'Revisión de objetivos semanales' },
  { id: 203, type: 'task', title: 'Compras Semana', category: 'global', subcategory: 'ShopList', date: '', priority: 'medium', status: 'todo', tags: ['compras', 'semana'], notes: 'Supermercado y artículos personales' }
]

const defaultHabits = [
  {id: 1, title: 'Masaje cuero cabelludo', group: 'Haircare', category: 'Bodycare', freq: 'personalizado', customDays: [1,3,5], recurrenceStart: '', lastDone: '', streak: 0},
  {id: 2, title: 'Despunte', group: 'Haircare', category: 'Bodycare', freq: 'monthly', monthlyDay: 15, recurrenceStart: '', lastDone: '', streak: 0},
  {id: 3, title: 'Repolarización capilar', group: 'Haircare', category: 'Bodycare', freq: 'monthly', monthlyDay: 1, recurrenceStart: '', lastDone: '', streak: 0},
  {id: 4, title: 'Exfoliación (cuerpo completo)', group: 'Skincare', category: 'Bodycare', freq: 'weekly', weeklyDay: 6, recurrenceStart: '', lastDone: '', streak: 0},
  {id: 5, title: 'Cara (mañana)', group: 'Skincare', category: 'Bodycare', freq: 'daily', recurrenceStart: '', lastDone: '', streak: 0},
  {id: 6, title: 'Cara (noche)', group: 'Skincare', category: 'Bodycare', freq: 'daily', recurrenceStart: '', lastDone: '', streak: 0},
  {id: 7, title: 'Wake up', group: 'Estiramientos', category: 'Fitness', freq: 'daily', recurrenceStart: '', lastDone: '', streak: 0},
  {id: 8, title: 'Prepare to rest', group: 'Estiramientos', category: 'Fitness', freq: 'daily', recurrenceStart: '', lastDone: '', streak: 0},
  {id: 9, title: 'Rutina Pilates', group: 'Pilates', category: 'Fitness', freq: 'personalizado', customDays: [1,3,5], link: 'https://youtube.com', recurrenceStart: '', lastDone: '', streak: 0},
  {id: 10, title: 'Gym', group: 'Gym', category: 'Fitness', freq: 'personalizado', customDays: [2,4,6], recurrenceStart: '', lastDone: '', streak: 0},
  {id: 11, title: 'Meditación', group: 'Mindfulness', category: 'Mind', freq: 'daily', recurrenceStart: '', lastDone: '', streak: 0},
  {id: 12, title: 'Say ILY to someone', group: 'Salud Emocional', category: 'Mind', freq: 'weekly', weeklyDay: 0, recurrenceStart: '', lastDone: '', streak: 0},
  {id: 13, title: 'Carta del mes', group: 'Salud Emocional', category: 'Mind', freq: 'monthly', monthlyDay: 1, recurrenceStart: '', lastDone: '', streak: 0}
]

const initialState = {
  categories: defaultCategories,
  tasks: defaultTasks,
  habits: defaultHabits,
  pageData: {},
  dashboard: { links: [], biblioteca: [], bgImage: '' },
  quickNotesList: [],
  quickTodos: [],
  pantry: [],
  shoppingList: [],
  weeklyMenu: {},
  enmsWeekPlan: ['', '', '', '', '', ''],
  notes: [], // Añadir notas al estado global
  taskIdCounter: 300,
  habitIdCounter: 20,
  monthOffset: 0
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload }
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, { ...action.payload, id: state.taskIdCounter++ }],
        taskIdCounter: state.taskIdCounter + 1
      }
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        )
      }
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      }
    
    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, { ...action.payload, id: state.habitIdCounter++ }],
        habitIdCounter: state.habitIdCounter + 1
      }
    
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit => 
          habit.id === action.payload.id ? { ...habit, ...action.payload } : habit
        )
      }
    
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload)
      }
    
    case 'SET_NOTES':
      return { ...state, notes: action.payload }
    
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...state.notes, { ...action.payload, id: Date.now() }]
      }
    
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note => 
          note.id === action.payload.id ? { ...note, ...action.payload } : note
        )
      }
    
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload)
      }
    
    case 'DELETE_NOTES':
      return {
        ...state,
        notes: state.notes.filter(note => !action.payload.includes(note.id))
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

  const saveToMemory = async () => {
    if (!db) return
    try {
      await setDoc(doc(db, "usuarios", "datos_planner"), state)
    } catch (e) {
      console.error('Error saving to Firebase:', e)
    }
  }

  const loadFromMemory = async () => {
    if (!db) return
    try {
      const docSnap = await getDoc(doc(db, "usuarios", "datos_planner"))
      if (docSnap.exists()) {
        const data = docSnap.data()
        dispatch({ type: 'SET_STATE', payload: data })
      }
    } catch (e) {
      console.error('Error loading from Firebase:', e)
    }
  }

  useEffect(() => {
    loadFromMemory()
  }, [])

  const actions = {
    addTask: (task) => {
      dispatch({ type: 'ADD_TASK', payload: task })
      saveToMemory()
    },
    
    updateTask: (task) => {
      dispatch({ type: 'UPDATE_TASK', payload: task })
      saveToMemory()
    },
    
    deleteTask: (taskId) => {
      dispatch({ type: 'DELETE_TASK', payload: taskId })
      saveToMemory()
    },
    
    addHabit: (habit) => {
      dispatch({ type: 'ADD_HABIT', payload: habit })
      saveToMemory()
    },
    
    updateHabit: (habit) => {
      dispatch({ type: 'UPDATE_HABIT', payload: habit })
      saveToMemory()
    },
    
    deleteHabit: (habitId) => {
      dispatch({ type: 'DELETE_HABIT', payload: habitId })
      saveToMemory()
    },
    
    // Acciones para notas
    setNotes: (notes) => {
      dispatch({ type: 'SET_NOTES', payload: notes })
      saveToMemory()
    },
    
    addNote: (note) => {
      dispatch({ type: 'ADD_NOTE', payload: note })
      saveToMemory()
    },
    
    updateNote: (note) => {
      dispatch({ type: 'UPDATE_NOTE', payload: note })
      saveToMemory()
    },
    
    deleteNote: (noteId) => {
      dispatch({ type: 'DELETE_NOTE', payload: noteId })
      saveToMemory()
    },
    
    deleteNotes: (noteIds) => {
      dispatch({ type: 'DELETE_NOTES', payload: noteIds })
      saveToMemory()
    },
    
    setMonthOffset: (offset) => {
      dispatch({ type: 'SET_MONTH_OFFSET', payload: offset })
    },
    
    getState: () => state,
    
    addEntry: (type, data) => {
      const entryData = { ...data, type }
      
      switch (type) {
        case 'task':
        case 'event':
          dispatch({ type: 'ADD_TASK', payload: entryData })
          break
        case 'habit':
          dispatch({ type: 'ADD_HABIT', payload: entryData })
          break
        default:
          dispatch({ type: 'ADD_TASK', payload: entryData })
      }
      
      saveToMemory()
    }
  }

  return (
    <AppContext.Provider value={{ state, actions }}>
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
