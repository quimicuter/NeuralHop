import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ACHIEVEMENTS, DAILY_QUESTS, getLevelFromXP, getStreakMultiplier } from './achievements'

const GAMIFICATION_STORAGE_KEY = 'neuralhop-gamification'

const GamificationContext = createContext(null)

export function GamificationProvider({ children }) {
  const [gamification, setGamification] = useState({
    xp: 0,
    unlockedAchievements: [],
    streak: {
      current: 0,
      lastActive: null,
      longest: 0
    },
    dailyStats: {
      date: new Date().toDateString(),
      completedTasks: 0,
      bookProgressUpdated: 0,
      notesCreated: 0,
      shopItemsAdded: 0,
      hubsVisited: [],
      allTasksCompleted: false,
      completedQuests: []
    },
    totalStats: {
      tasksCompleted: 0,
      maxTasksInDay: 0,
      perfectDays: 0,
      earlyTasks: 0,
      lateTasks: 0,
      libraryItems: 0,
      booksCompleted: 0,
      notesCreated: 0,
      shopItemsCompleted: 0,
      budgetCompliantPurchases: 0
    }
  })

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(GAMIFICATION_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Reset daily stats if it's a new day
        if (parsed.dailyStats?.date !== new Date().toDateString()) {
          parsed.dailyStats = {
            date: new Date().toDateString(),
            completedTasks: 0,
            bookProgressUpdated: 0,
            notesCreated: 0,
            shopItemsAdded: 0,
            hubsVisited: [],
            allTasksCompleted: false,
            completedQuests: []
          }
        }
        setGamification(parsed)
      } catch (error) {
        console.warn('Failed to load gamification data:', error)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(gamification))
  }, [gamification])

  // Check and update streak
  useEffect(() => {
    const checkStreak = () => {
      const today = new Date()
      const lastActive = gamification.streak.lastActive 
        ? new Date(gamification.streak.lastActive) 
        : null
      
      if (!lastActive) return
      
      const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        // Continue streak
        setGamification(prev => ({
          ...prev,
          streak: {
            ...prev.streak,
            current: prev.streak.current + 1,
            lastActive: today.toISOString(),
            longest: Math.max(prev.streak.longest, prev.streak.current + 1)
          }
        }))
      } else if (daysDiff > 1) {
        // Streak broken
        setGamification(prev => ({
          ...prev,
          streak: {
            ...prev.streak,
            current: 1,
            lastActive: today.toISOString()
          }
        }))
      }
    }
    
    checkStreak()
  }, [])

  // Check achievements
  const checkAchievements = useCallback(() => {
    const stats = {
      library: {
        totalItems: gamification.totalStats.libraryItems,
        completed: gamification.totalStats.booksCompleted
      },
      grimoire: {
        totalNotes: gamification.totalStats.notesCreated
      },
      shoplist: {
        completedLists: Math.floor(gamification.totalStats.shopItemsCompleted / 5),
        budgetCompliant: gamification.totalStats.budgetCompliantPurchases
      },
      general: {
        completedTasks: gamification.totalStats.tasksCompleted,
        maxTasksInDay: gamification.totalStats.maxTasksInDay,
        perfectDays: gamification.totalStats.perfectDays,
        earlyTasks: gamification.totalStats.earlyTasks,
        lateTasks: gamification.totalStats.lateTasks,
        unlockedAchievements: gamification.unlockedAchievements.length
      },
      streak: gamification.streak
    }

    const newlyUnlocked = []
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!gamification.unlockedAchievements.includes(achievement.id)) {
        if (achievement.condition(stats)) {
          newlyUnlocked.push(achievement)
        }
      }
    })

    if (newlyUnlocked.length > 0) {
      const totalXP = newlyUnlocked.reduce((sum, a) => sum + a.xp, 0)
      const multiplier = getStreakMultiplier(gamification.streak.current)
      const finalXP = Math.floor(totalXP * multiplier)

      setGamification(prev => ({
        ...prev,
        xp: prev.xp + finalXP,
        unlockedAchievements: [
          ...prev.unlockedAchievements,
          ...newlyUnlocked.map(a => a.id)
        ]
      }))

      return newlyUnlocked
    }

    return []
  }, [gamification])

  // Add XP
  const addXP = useCallback((amount, reason = '') => {
    const multiplier = getStreakMultiplier(gamification.streak.current)
    const finalXP = Math.floor(amount * multiplier)
    
    setGamification(prev => ({
      ...prev,
      xp: prev.xp + finalXP
    }))

    return finalXP
  }, [gamification.streak.current])

  // Update daily stats
  const updateDailyStats = useCallback((updates) => {
    setGamification(prev => ({
      ...prev,
      dailyStats: {
        ...prev.dailyStats,
        ...updates
      }
    }))
  }, [])

  // Update total stats
  const updateTotalStats = useCallback((updates) => {
    setGamification(prev => ({
      ...prev,
      totalStats: {
        ...prev.totalStats,
        ...updates
      }
    }))
  }, [])

  // Record activity for streak
  const recordActivity = useCallback(() => {
    setGamification(prev => ({
      ...prev,
      streak: {
        ...prev.streak,
        lastActive: new Date().toISOString()
      }
    }))
  }, [])

  // Complete task - helper function
  const completeTask = useCallback((taskType = 'general') => {
    const now = new Date()
    const hour = now.getHours()
    
    setGamification(prev => {
      const newDailyTasks = prev.dailyStats.completedTasks + 1
      const newTotalTasks = prev.totalStats.tasksCompleted + 1
      
      const updates = {
        dailyStats: {
          ...prev.dailyStats,
          completedTasks: newDailyTasks
        },
        totalStats: {
          ...prev.totalStats,
          tasksCompleted: newTotalTasks,
          maxTasksInDay: Math.max(prev.totalStats.maxTasksInDay, newDailyTasks)
        },
        streak: {
          ...prev.streak,
          lastActive: now.toISOString()
        }
      }

      // Check early/late bird
      if (hour < 8 && !prev.totalStats.earlyTasks) {
        updates.totalStats.earlyTasks = prev.totalStats.earlyTasks + 1
      }
      if (hour >= 22 && !prev.totalStats.lateTasks) {
        updates.totalStats.lateTasks = prev.totalStats.lateTasks + 1
      }

      return updates
    })

    // Add XP for completing task
    addXP(10, `Completó tarea: ${taskType}`)
  }, [addXP])

  // Get daily quests progress
  const getDailyQuests = useCallback(() => {
    return DAILY_QUESTS.map(quest => ({
      ...quest,
      completed: gamification.dailyStats.completedQuests.includes(quest.id),
      progress: getQuestProgress(quest, gamification.dailyStats)
    }))
  }, [gamification.dailyStats])

  // Get quest progress helper
  const getQuestProgress = (quest, dailyStats) => {
    switch (quest.id) {
      case 'complete_tasks':
        return { current: dailyStats.completedTasks, target: 5 }
      case 'read_book':
        return { current: dailyStats.bookProgressUpdated, target: 1 }
      case 'create_note':
        return { current: dailyStats.notesCreated, target: 1 }
      case 'add_shop_item':
        return { current: dailyStats.shopItemsAdded, target: 3 }
      case 'visit_hubs':
        return { current: dailyStats.hubsVisited.length, target: 3 }
      case 'complete_all':
        return { current: dailyStats.allTasksCompleted ? 1 : 0, target: 1 }
      default:
        return { current: 0, target: 1 }
    }
  }

  // Get current level
  const currentLevel = getLevelFromXP(gamification.xp)

  const value = {
    gamification,
    xp: gamification.xp,
    level: currentLevel,
    streak: gamification.streak,
    unlockedAchievements: gamification.unlockedAchievements,
    achievements: Object.values(ACHIEVEMENTS),
    addXP,
    checkAchievements,
    updateDailyStats,
    updateTotalStats,
    recordActivity,
    completeTask,
    getDailyQuests,
    getStreakMultiplier: () => getStreakMultiplier(gamification.streak.current)
  }

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider')
  }
  return context
}

export default GamificationContext
