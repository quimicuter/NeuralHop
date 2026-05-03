import React, { useState } from 'react'

function HabitsTracker() {
  // Mock data for habits
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: "Masaje cuero cabelludo",
      nextDueDate: "domingo",
      daysUntilNext: 0,
      streak: 3,
      isCompleted: false
    },
    {
      id: 2,
      name: "Meditación matutina",
      nextDueDate: "hoy",
      daysUntilNext: 0,
      streak: 7,
      isCompleted: true
    },
    {
      id: 3,
      name: "Leer 15 minutos",
      nextDueDate: "mañana",
      daysUntilNext: 1,
      streak: 12,
      isCompleted: false
    },
    {
      id: 4,
      name: "Ejercicio de estiramiento",
      nextDueDate: "martes",
      daysUntilNext: 2,
      streak: 5,
      isCompleted: false
    },
    {
      id: 5,
      name: "Toma de vitaminas",
      nextDueDate: "jueves",
      daysUntilNext: 4,
      streak: 20,
      isCompleted: false
    }
  ])

  // Filter habits to show only those with daysUntilNext <= 2
  const visibleHabits = habits.filter(habit => habit.daysUntilNext <= 2)

  const handleCheckboxChange = (habitId) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => 
        habit.id === habitId 
          ? { ...habit, isCompleted: !habit.isCompleted }
          : habit
      )
    )
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
