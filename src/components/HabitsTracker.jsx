import React from 'react'
import { useApp } from '../context/AppContext'

function HabitsTracker() {
  const { state, actions, getHabits } = useApp()

  const habits = getHabits ? getHabits() : []

  const handleCheckboxChange = (habitId) => {
    const habit = habits.find(h => h.id === habitId)
    if (habit) {
      actions.updateEntry(habitId, {
        completed: !habit.completed
      })
    }
  }

  const getProximityText = (habit) => {
    const today = new Date()
    const todayDay = today.getDay()
    
    if (habit.habitDays && habit.habitDays.length > 0) {
      // Calcular próximo día basado en habitDays
      const daysUntilNext = habit.habitDays
        .map(day => {
          const targetDay = day === 0 ? 7 : day // Convertir domingo (0) a 7 para cálculo
          const currentDay = todayDay === 0 ? 7 : todayDay
          let diff = targetDay - currentDay
          if (diff <= 0) diff += 7 // Si ya pasó este día, calcular para la próxima semana
          return diff
        })
        .sort((a, b) => a - b)[0] // Día más cercano

      if (daysUntilNext === 0) {
        return "Para hoy"
      } else if (daysUntilNext === 1) {
        return "Mañana"
      } else {
        return `En ${daysUntilNext} días`
      }
    }
    
    return "Sin frecuencia"
  }

  // Filtrar hábitos para mostrar solo los próximos (simulación simple)
  const visibleHabits = habits.slice(0, 5) // Limitar a 5 hábitos para el dashboard

  return (
    <div className="habits-tracker">
      <div className="habit-list">
        {visibleHabits.map(habit => (
          <div key={habit.id} className="habit-item">
            <div className="habit-left">
              <input 
                type="checkbox" 
                className="habit-checkbox"
                checked={habit.completed || false}
                onChange={() => handleCheckboxChange(habit.id)}
              />
            </div>
            
            <div className="habit-center">
              <div className="habit-name">{habit.title}</div>
              <div className="habit-proximity">
                {getProximityText(habit)}
              </div>
            </div>
            
            <div className="habit-right">
              <div className="habit-streak">
                <span className="fire-emoji">🔥</span>
                <span className="streak-number">{habit.streak || 0}</span>
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
