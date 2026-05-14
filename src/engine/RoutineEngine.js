import { subscribeToAllEntries } from './EntryEngine'

// Helper para obtener fecha actual en formato YYYY-MM-DD
const getTodayKey = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Helper para obtener hora actual en formato HH:MM
const getCurrentTime = () => {
  const now = new Date()
  return now.toTimeString().slice(0, 5)
}

// Helper para determinar si una entrada es de hoy
const isTodayEntry = (entry) => {
  if (!entry?.datetime) return false
  const entryDate = new Date(entry.datetime).toISOString().split('T')[0]
  return entryDate === getTodayKey()
}

// Helper para ordenar entradas por hora
const sortByTime = (entries) => {
  return entries.sort((a, b) => {
    const timeA = a.datetime ? new Date(a.datetime).toTimeString().slice(0, 5) : '00:00'
    const timeB = b.datetime ? new Date(b.datetime).toTimeString().slice(0, 5) : '00:00'
    return timeA.localeCompare(timeB)
  })
}

// Helper para filtrar entradas
const filterTodayEntries = (entries, filter = 'all') => {
  return entries.filter(entry => {
    if (!isTodayEntry(entry)) return false
    
    // Filtrar por módulo wellness
    if (entry.module !== 'wellness') return false
    
    // Filtrar por categoría si es necesario
    if (filter !== 'all' && entry.category !== filter) return false
    
    return true
  })
}

// Suscripción a rutina del día en tiempo real
export const subscribeToTodayRoutine = (callback, filter = 'all') => {
  return subscribeToAllEntries((entries) => {
    const todayEntries = filterTodayEntries(entries, filter)
    callback(sortByTime(todayEntries))
  })
}

// Helper para obtener color de Aura según mood del día
export const getAuraColorByMood = (mood) => {
  const moodColors = {
    euphoric: '#d734f4',
    happy: '#ff6b95', 
    calm: '#7dd3fc',
    lowEnergy: '#94a3b8',
    neutral: '#a78bfa'
  }
  return moodColors[mood] || moodColors.neutral
}

// Helper para determinar si una entrada está completada
export const isEntryCompleted = (entry) => {
  return entry.completed || entry.status === 'completed'
}

// Helper para obtener progreso de rutina
export const getRoutineProgress = (entries) => {
  if (!entries.length) return 0
  const completed = entries.filter(isEntryCompleted).length
  return Math.round((completed / entries.length) * 100)
}
