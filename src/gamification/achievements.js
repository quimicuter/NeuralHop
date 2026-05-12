// Gamification - Achievement System

export const ACHIEVEMENTS = {
  // Library Achievements
  'first_book': {
    id: 'first_book',
    title: '📚 Primer Libro',
    description: 'Agrega tu primer libro a la biblioteca',
    category: 'library',
    xp: 50,
    icon: '📕',
    condition: (stats) => stats.library?.totalItems >= 1
  },
  'bookworm': {
    id: 'bookworm',
    title: '📖 Bookworm',
    description: 'Completa 5 libros',
    category: 'library',
    xp: 100,
    icon: '📚',
    condition: (stats) => stats.library?.completed >= 5
  },
  'scholar': {
    id: 'scholar',
    title: '🎓 Erudito',
    description: 'Completa 10 libros',
    category: 'library',
    xp: 250,
    icon: '🎓',
    condition: (stats) => stats.library?.completed >= 10
  },
  'knowledge_seeker': {
    id: 'knowledge_seeker',
    title: '🔬 Buscador de Conocimiento',
    description: 'Guarda 5 papers científicos',
    category: 'library',
    xp: 150,
    icon: '📄',
    condition: (stats) => stats.library?.papers >= 5
  },
  
  // Grimoire Achievements
  'first_note': {
    id: 'first_note',
    title: '📝 Primera Nota',
    description: 'Crea tu primera nota en el grimorio',
    category: 'grimoire',
    xp: 50,
    icon: '📝',
    condition: (stats) => stats.grimoire?.totalNotes >= 1
  },
  'connected_thinker': {
    id: 'connected_thinker',
    title: '🔗 Pensador Conectado',
    description: 'Crea 3 notas vinculadas entre sí',
    category: 'grimoire',
    xp: 100,
    icon: '🕸️',
    condition: (stats) => stats.grimoire?.connectedNotes >= 3
  },
  'wiki_master': {
    id: 'wiki_master',
    title: '🔮 Maestro del Grimorio',
    description: 'Crea 20 notas con al menos 5 tags diferentes',
    category: 'grimoire',
    xp: 300,
    icon: '🔮',
    condition: (stats) => stats.grimoire?.totalNotes >= 20 && stats.grimoire?.uniqueTags >= 5
  },
  
  // Shoplist Achievements
  'smart_shopper': {
    id: 'smart_shopper',
    title: '🛒 Comprador Inteligente',
    description: 'Completa tu primera lista de compras',
    category: 'shoplist',
    xp: 50,
    icon: '🛒',
    condition: (stats) => stats.shoplist?.completedLists >= 1
  },
  'budget_master': {
    id: 'budget_master',
    title: '💰 Maestro del Presupuesto',
    description: 'Completa 5 compras dentro del presupuesto',
    category: 'shoplist',
    xp: 150,
    icon: '💵',
    condition: (stats) => stats.shoplist?.budgetCompliant >= 5
  },
  'savvy_saver': {
    id: 'savvy_saver',
    title: '🏷️ Ahorrador Astuto',
    description: 'Ahorra más del 20% del presupuesto estimado',
    category: 'shoplist',
    xp: 200,
    icon: '🎯',
    condition: (stats) => stats.shoplist?.savings >= 20
  },
  
  // General/Task Achievements
  'task_master': {
    id: 'task_master',
    title: '✅ Maestro de Tareas',
    description: 'Completa 50 tareas',
    category: 'general',
    xp: 200,
    icon: '✅',
    condition: (stats) => stats.general?.completedTasks >= 50
  },
  'productivity_ninja': {
    id: 'productivity_ninja',
    title: '🥷 Ninja de Productividad',
    description: 'Completa 10 tareas en un solo día',
    category: 'general',
    xp: 150,
    icon: '⚡',
    condition: (stats) => stats.general?.maxTasksInDay >= 10
  },
  'early_bird': {
    id: 'early_bird',
    title: '🐛 Madrugador',
    description: 'Completa una tarea antes de las 8am',
    category: 'general',
    xp: 75,
    icon: '🌅',
    condition: (stats) => stats.general?.earlyTasks >= 1
  },
  'night_owl': {
    id: 'night_owl',
    title: '🦉 Noctámbulo',
    description: 'Completa una tarea después de las 10pm',
    category: 'general',
    xp: 75,
    icon: '🌙',
    condition: (stats) => stats.general?.lateTasks >= 1
  },
  
  // Streak Achievements
  'week_warrior': {
    id: 'week_warrior',
    title: '🔥 Guerrero de la Semana',
    description: 'Mantén una racha de 7 días',
    category: 'streak',
    xp: 200,
    icon: '🔥',
    condition: (stats) => stats.streak?.current >= 7
  },
  'month_master': {
    id: 'month_master',
    title: '💎 Maestro del Mes',
    description: 'Mantén una racha de 30 días',
    category: 'streak',
    xp: 500,
    icon: '💎',
    condition: (stats) => stats.streak?.current >= 30
  },
  'centurion': {
    id: 'centurion',
    title: '🏆 Centurión',
    description: 'Mantén una racha de 100 días',
    category: 'streak',
    xp: 1000,
    icon: '👑',
    condition: (stats) => stats.streak?.current >= 100
  },
  
  // Hub/Module Achievements
  'hub_explorer': {
    id: 'hub_explorer',
    title: '🗺️ Explorador de Hubs',
    description: 'Visita todos los hubs personales',
    category: 'hubs',
    xp: 150,
    icon: '🗺️',
    condition: (stats) => stats.hubs?.visitedPersonal >= 4
  },
  'academic_adventurer': {
    id: 'academic_adventurer',
    title: '🎓 Aventurero Académico',
    description: 'Visita todos los hubs académicos',
    category: 'hubs',
    xp: 150,
    icon: '🏫',
    condition: (stats) => stats.hubs?.visitedAcademic >= 5
  },
  
  // Special Achievements
  'perfectionist': {
    id: 'perfectionist',
    title: '⭐ Perfeccionista',
    description: 'Completa todas las tareas pendientes en un día',
    category: 'special',
    xp: 300,
    icon: '✨',
    condition: (stats) => stats.general?.perfectDays >= 1
  },
  'jack_of_all_trades': {
    id: 'jack_of_all_trades',
    title: '🎯 Polímata',
    description: 'Usa activamente Biblioteca, Grimorio y Shoplist',
    category: 'special',
    xp: 400,
    icon: '🌟',
    condition: (stats) => 
      stats.library?.active && 
      stats.grimoire?.active && 
      stats.shoplist?.active
  },
  'neural_hopper': {
    id: 'neural_hopper',
    title: '🚀 NeuralHopper Élite',
    description: 'Desbloquea 10 logros diferentes',
    category: 'special',
    xp: 500,
    icon: '🚀',
    condition: (stats) => stats.general?.unlockedAchievements >= 10
  }
}

// Level system
export const LEVELS = [
  { level: 1, xp: 0, title: 'Novato' },
  { level: 2, xp: 100, title: 'Aprendiz' },
  { level: 3, xp: 300, title: 'Practicante' },
  { level: 4, xp: 600, title: 'Especialista' },
  { level: 5, xp: 1000, title: 'Experto' },
  { level: 6, xp: 1500, title: 'Maestro' },
  { level: 7, xp: 2100, title: 'Gurú' },
  { level: 8, xp: 2800, title: 'Leyenda' },
  { level: 9, xp: 3600, title: 'Élite' },
  { level: 10, xp: 4500, title: 'NeuralHopper Supremo' }
]

// Get level info from XP
export const getLevelFromXP = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      const nextLevel = LEVELS[i + 1]
      return {
        ...LEVELS[i],
        progress: nextLevel ? ((xp - LEVELS[i].xp) / (nextLevel.xp - LEVELS[i].xp)) * 100 : 100,
        nextLevelXP: nextLevel?.xp || null
      }
    }
  }
  return LEVELS[0]
}

// Daily Quests
export const DAILY_QUESTS = [
  {
    id: 'complete_tasks',
    title: '⚡ Productividad',
    description: 'Completa 5 tareas hoy',
    xp: 50,
    condition: (stats) => stats.daily?.completedTasks >= 5
  },
  {
    id: 'read_book',
    title: '📚 Lector Dedicado',
    description: 'Actualiza el progreso de un libro',
    xp: 30,
    condition: (stats) => stats.daily?.bookProgressUpdated >= 1
  },
  {
    id: 'create_note',
    title: '📝 Pensador',
    description: 'Crea una nueva nota en el grimorio',
    xp: 30,
    condition: (stats) => stats.daily?.notesCreated >= 1
  },
  {
    id: 'add_shop_item',
    title: '🛒 Organizado',
    description: 'Agrega 3 items a la lista de compras',
    xp: 30,
    condition: (stats) => stats.daily?.shopItemsAdded >= 3
  },
  {
    id: 'visit_hubs',
    title: '🗺️ Explorador',
    description: 'Visita 3 hubs diferentes',
    xp: 40,
    condition: (stats) => stats.daily?.hubsVisited >= 3
  },
  {
    id: 'complete_all',
    title: '✨ Día Perfecto',
    description: 'Completa todas las tareas pendientes',
    xp: 100,
    condition: (stats) => stats.daily?.allTasksCompleted
  }
]

// Calculate XP multiplier from streak
export const getStreakMultiplier = (streak) => {
  if (streak >= 30) return 2.0
  if (streak >= 14) return 1.5
  if (streak >= 7) return 1.25
  return 1.0
}
