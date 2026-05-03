import React, { useState } from 'react'

function WeeklyMenu() {
  // Estado inicial para la matriz de comidas
  const [mealMatrix, setMealMatrix] = useState({
    L: { desayuno: null, comida: 'Ensalada César', cena: null },
    M: { desayuno: 'Avena con frutas', comida: null, cena: 'Pasta' },
    M: { desayuno: null, comida: 'Pollo asado', cena: null },
    J: { desayuno: 'Tostadas', comida: null, cena: 'Sopa' },
    V: { desayuno: null, comida: 'Tacos', cena: null },
    S: { desayuno: 'Pancakes', comida: 'Pizza', cena: null },
    D: { desayuno: null, comida: null, cena: 'Enchiladas' }
  })

  // Manejador de clic en celdas
  const handleCellClick = (dia, tipoComida) => {
    console.log(`Abriendo modal para seleccionar receta de Recetario para [${dia}] - [${tipoComida}]`)
  }

  const days = ['L', 'M', 'M', 'J', 'V'] // Removed S and D
  const mealTypes = [
    { emoji: '🍳', key: 'desayuno' },
    { emoji: '🍝', key: 'comida' },
    { emoji: '🌙', key: 'cena' }
  ]
  
  return (
    <div className="weekly-menu">
      <h3 className="menu-title">Menú Semanal</h3>
      <div className="menu-grid-6x4">
        {/* Fila 1 - Cabecera */}
        <div className="menu-cell empty-header"></div>
        {days.map(day => (
          <div key={day} className="menu-cell day-header">
            {day}
          </div>
        ))}
        
        {/* Filas 2-4 - Matrix de comidas */}
        {mealTypes.map(mealType => (
          <React.Fragment key={mealType.key}>
            <div className="menu-cell meal-emoji">
              {mealType.emoji}
            </div>
            {days.map(day => (
              <div 
                key={`${day}-${mealType.key}`}
                className={`menu-cell meal-cell ${mealMatrix[day][mealType.key] ? 'has-meal' : 'empty-meal'}`}
                onClick={() => handleCellClick(day, mealType.key)}
              >
                {mealMatrix[day][mealType.key] ? (
                  <span className="check-icon">✓</span>
                ) : (
                  <span className="plus-icon">+</span>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default WeeklyMenu
