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
    subcats: ['Selfcare', 'Mindfulness', 'Vida Social', 'Recetas'], 
    customFields: [],
    dataRoot: 'personal'
  },
  escolar: { 
    icon: "🎓", 
    label: 'Académico', 
    color: '#c8a2c8', 
    cover: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=600&q=80', 
    subcats: ['Curso Análisis de Datos', 'Química', 'Maestría', 'Ciencias de Datos'], 
    customFields: ['materia', 'profesor', 'grupo'],
    dataRoot: 'academic'
  },
  datascience: { 
    icon: "📊", 
    label: 'Ciencias de Datos', 
    color: '#3b82f6', 
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', 
    subcats: ['Clases', 'Tareas', 'Proyectos', 'Plataformas'], 
    customFields: ['plataforma', 'profesor', 'deadline'],
    dataRoot: 'datascience'
  },
  profesional: { 
    icon: "💼", 
    label: 'Profesional', 
    color: '#ff9aa2', 
    cover: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80', 
    subcats: ['ENMS | Laboratorio de Química'], 
    customFields: [],
    dataRoot: 'professional'
  },
  recetario: {
    icon: "🤌🏻",
    label: 'Recetario',
    color: '#ffa500',
    cover: 'https://images.unsplash.com/photo-1543397667-603d6b5c5e5c?auto=format&fit=crop&w=600&q=80',
    subcats: ['Desayunos', 'Comidas', 'Cenas', 'Postres'],
    customFields: ['ingredientes', 'tiempoPreparacion', 'dificultad', 'porciones'],
    dataRoot: 'recetario'
  },
  bienestar: {
    icon: "🧘🏻‍♀️",
    label: 'Bienestar',
    color: '#87ceeb',
    cover: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80',
    subcats: ['Fitness', 'Mindfulness', 'Skincare', 'Haircare'],
    customFields: ['series', 'repeticiones', 'linkVideo', 'duracion'],
    dataRoot: 'bienestar'
  }
}

const defaultTasks = [
  { id: 1, type: 'event', title: 'Experimentación (Regreso Semana Santa)', category: 'profesional', subcategory: 'ENMS Labs', date: '2026-04-13', priority: 'high', status: 'todo', recurring: false, enmsMateria: 'Experimentación', enmsProfesor: 'Por Asignar', enmsGrupo: 'Grupo A', enmsPractica: 'Práctica 1' },
  { id: 2, type: 'task', title: 'Reporte Semanal', category: 'profesional', subcategory: 'ENMS Labs', date: '', priority: 'high', status: 'todo', recurring: true, recurrenceType: 'weekly', recurrenceStart: '', weeklyDay: 1, tags: ['reporte'], notes: 'Cada lunes sin excepción' },
  
  // Recetario Tasks con campos especializados
  { id: 101, type: 'task', title: 'Chilaquiles Verdes Económicos', category: 'recetario', subcategory: 'Desayunos', date: '', priority: 'medium', status: 'todo', tags: ['desayuno', 'economico'], ingredientes: 'Tortillas viejas, tomatillo, chile serrano, cebolla, cilantro, queso fresco', tiempoPreparacion: '20 min', dificultad: 'Fácil', porciones: '4', notes: 'Clásico mexicano perfecto para aprovechar tortillas' },
  { id: 102, type: 'task', title: 'Enfrijoladas de Queso', category: 'recetario', subcategory: 'Comidas', date: '', priority: 'medium', status: 'todo', tags: ['almuerzo', 'cena'], ingredientes: 'Frijoles negros molidos, tortillas, queso panela, aguacate', tiempoPreparacion: '15 min', dificultad: 'Fácil', porciones: '3', notes: 'Cremosas y reconfortantes' },
  { id: 103, type: 'task', title: 'Sopa de Fideo con Verduras', category: 'recetario', subcategory: 'Comidas', date: '', priority: 'medium', status: 'todo', tags: ['almuerzo', 'saludable'], ingredientes: 'Fideo, chayote, zanahoria, calabacita, consomé', tiempoPreparacion: '25 min', dificultad: 'Fácil', porciones: '6', notes: 'Nutritiva y económica' },
  { id: 104, type: 'task', title: 'Tostadas de Atún con Elotitos', category: 'recetario', subcategory: 'Cenas', date: '', priority: 'low', status: 'todo', tags: ['cena', 'rapido'], ingredientes: 'Lata de atún, mayonesa, elotitos, tostadas, salsa', tiempoPreparacion: '10 min', dificultad: 'Fácil', porciones: '2', notes: 'Perfecto para cena rápida' },
  { id: 105, type: 'task', title: 'Huevos a la Mexicana', category: 'recetario', subcategory: 'Desayunos', date: '', priority: 'medium', status: 'todo', tags: ['desayuno', 'clasico'], ingredientes: 'Huevo, jitomate, cebolla, chile serrano', tiempoPreparacion: '15 min', dificultad: 'Fácil', porciones: '2', notes: 'Desayuno tradicional mexicano' },
  
  // Bienestar Tasks con campos especializados
  { id: 201, type: 'task', title: 'Rutina Pilates Completa', category: 'bienestar', subcategory: 'Fitness', date: '', priority: 'high', status: 'todo', tags: ['pilates', 'ejercicio'], series: '3', repeticiones: '15', linkVideo: 'https://youtube.com/watch?v=pilates', duracion: '45 min', notes: 'Enfocado en core y flexibilidad' },
  { id: 202, type: 'task', title: 'Meditación Guiada', category: 'bienestar', subcategory: 'Mindfulness', date: '', priority: 'medium', status: 'todo', tags: ['meditacion', 'relajacion'], series: '1', repeticiones: '1', linkVideo: 'https://youtube.com/watch?v=meditacion', duracion: '20 min', notes: 'Meditación para reducir estrés' },
  { id: 203, type: 'task', title: 'Rutina Facial Completa', category: 'bienestar', subcategory: 'Skincare', date: '', priority: 'medium', status: 'todo', tags: ['skincare', 'rostro'], series: '1', repeticiones: '1', linkVideo: '', duracion: '30 min', notes: 'Limpieza, exfoliación e hidratación' },
  { id: 204, type: 'task', title: 'Masaje Capilar con Aceites', category: 'bienestar', subcategory: 'Haircare', date: '', priority: 'low', status: 'todo', tags: ['haircare', 'natural'], series: '1', repeticiones: '1', linkVideo: '', duracion: '15 min', notes: 'Con aceite de coco y romero' }
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
