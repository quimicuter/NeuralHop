import React from 'react'

function HabitsTracker({ entries, onToggleHabit }) {
  // Mapear entries de Firebase de tipo 'habit' a formato de visualización
  const habits = (entries || []).filter(e => e.type === 'habit').map(entry => {
    // Calcular días hasta próxima repetición basado en habitDays y última fecha
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Domingo, 1 = Lunes, etc.
    const habitDays = entry.metadata?.habitDays || []
    
    // Encontrar próximo día del hábito
    let daysUntilNext = null
    if (habitDays.length > 0) {
      const nextDays = habitDays.filter(d => d >= dayOfWeek)
      if (nextDays.length > 0) {
        daysUntilNext = nextDays[0] - dayOfWeek
      } else {
        daysUntilNext = 7 - dayOfWeek + habitDays[0]
      }
    }
    
    const nextDueLabels = ['Hoy', 'Mañana', 'En 2 días', 'En 3 días', 'En 4 días', 'En 5 días', 'En 6 días']
    
    return {
      id: entry.id,
      name: entry.title,
      nextDueDate: daysUntilNext !== null ? nextDueLabels[daysUntilNext] : 'Programado',
      daysUntilNext: daysUntilNext ?? 7,
      streak: entry.metadata?.streak || 0,
      isCompleted: entry.completed || false,
      habitDays: habitDays
    }
  })

  // Filter habits to show only those with daysUntilNext <= 2 (próximos a vencer)
  const visibleHabits = habits.filter(habit => habit.daysUntilNext <= 2)

  const handleCheckboxChange = (habitId) => {
    if (onToggleHabit) {
      onToggleHabit(habitId)
    }
  }

  const getProximityText = (daysUntilNext, nextDueDate) => {
    if (daysUntilNext === 0) {
      return "Para hoy"
    } else if (daysUntilNext === 1) {
      return `Próximo: ${nextDueDate}`
    } else {
      return `Próximo: ${nextDueDate}`
    }
  }

  return (
    <div className="habits-tracker">
      <div className="habit-list">
        {visibleHabits.map(habit => (
          <div key={habit.id} className="habit-item">
            <div className="habit-left">
              <input 
                type="checkbox" 
                className="habit-checkbox"
                checked={habit.isCompleted}
                onChange={() => handleCheckboxChange(habit.id)}
              />
            </div>
            
            <div className="habit-center">
              <div className="habit-name">{habit.name}</div>
              <div className="habit-proximity">
                {getProximityText(habit.daysUntilNext, habit.nextDueDate)}
              </div>
            </div>
            
            <div className="habit-right">
              <div className="habit-streak">
                <span className="fire-emoji">🔥</span>
                <span className="streak-number">{habit.streak}</span>
              </div>
            </div>
          </div>
        ))}
        
        {visibleHabits.length === 0 && (
          <div className="empty-habits">
            <span>No hay hábitos próximos. ✨</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default HabitsTracker
