import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, orderBy, limit, where } from 'firebase/firestore'

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
    subcats: ['Data Science', 'Investigación', 'Maestría', 'Laboratorio', 'Química', 'Análisis de Datos'], 
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

const initialState = {
  categories: defaultCategories,
  tasks: [],
  habits: [],
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
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    
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

  // Suscripción a tareas en tiempo real desde Firebase
  useEffect(() => {
    if (!db) return

    const tasksQuery = query(collection(db, "tasks"))
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasks = []
      snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() })
      })
      dispatch({ type: 'SET_TASKS', payload: tasks })
    }, (error) => {
      console.error('Error listening to tasks:', error)
    })

    return () => unsubscribe()
  }, [])

  const actions = {
    addTask: async (task) => {
      if (!db) return
      try {
        const taskRef = doc(collection(db, "tasks"))
        await setDoc(taskRef, { ...task, completed: false, createdAt: new Date() })
      } catch (e) {
        console.error('Error adding task to Firebase:', e)
      }
    },
    
    updateTask: async (task) => {
      if (!db) return
      try {
        const taskRef = doc(db, "tasks", task.id)
        await updateDoc(taskRef, task)
      } catch (e) {
        console.error('Error updating task in Firebase:', e)
      }
    },
    
    deleteTask: async (taskId) => {
      if (!db) return
      try {
        const taskRef = doc(db, "tasks", taskId)
        await deleteDoc(taskRef)
      } catch (e) {
        console.error('Error deleting task from Firebase:', e)
      }
    },
    
    addHabit: (habit) => {
      dispatch({ type: 'ADD_HABIT', payload: habit })
    },
    
    updateHabit: (habit) => {
      dispatch({ type: 'UPDATE_HABIT', payload: habit })
    },
    
    deleteHabit: (habitId) => {
      dispatch({ type: 'DELETE_HABIT', payload: habitId })
    },
    
    // Acciones para notas
    setNotes: (notes) => {
      dispatch({ type: 'SET_NOTES', payload: notes })
    },
    
    addNote: (note) => {
      dispatch({ type: 'ADD_NOTE', payload: note })
    },
    
    updateNote: (note) => {
      dispatch({ type: 'UPDATE_NOTE', payload: note })
    },
    
    deleteNote: (noteId) => {
      dispatch({ type: 'DELETE_NOTE', payload: noteId })
    },
    
    deleteNotes: (noteIds) => {
      dispatch({ type: 'DELETE_NOTES', payload: noteIds })
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
