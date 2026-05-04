import React, { useState } from 'react'

// Mock data de recetas (se puede migrar a Firebase después)
const mockRecipes = [
  { id: 1, name: 'Ensalada César', category: 'comida', difficulty: 'fácil', time: '20 min', ingredients: 'Lechuga, pollo, parmesano, crutones' },
  { id: 2, name: 'Pasta Carbonara', category: 'comida', difficulty: 'medio', time: '30 min', ingredients: 'Pasta, huevo, panceta, queso parmesano' },
  { id: 3, name: 'Sopa de Verduras', category: 'comida', difficulty: 'fácil', time: '25 min', ingredients: 'Zanahoria, apio, cebolla, caldo' },
  { id: 4, name: 'Pollo al Horno', category: 'cena', difficulty: 'medio', time: '45 min', ingredients: 'Pollo, hierbas, limón, aceite' },
  { id: 5, name: 'Tacos de Carnitas', category: 'cena', difficulty: 'fácil', time: '35 min', ingredients: 'Cerdo, cebolla, cilantro, tortillas' },
  { id: 6, name: 'Avena con Frutas', category: 'desayuno', difficulty: 'fácil', time: '10 min', ingredients: 'Avena, plátano, miel, nueces' },
  { id: 7, name: 'Huevos Revueltos', category: 'desayuno', difficulty: 'fácil', time: '5 min', ingredients: 'Huevos, leche, mantequilla, pan' },
  { id: 8, name: 'Smoothie Verde', category: 'desayuno', difficulty: 'fácil', time: '5 min', ingredients: 'Espinaca, plátano, mango, leche' }
]

function RecipeModal({ isOpen, onClose, selectedDay, selectedMealType, onSelectRecipe }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen) return null

  // Filtrar recetas por tipo de comida y búsqueda
  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesCategory = recipe.category === selectedMealType
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe)
  }

  const handleConfirm = () => {
    if (selectedRecipe) {
      onSelectRecipe(selectedDay, selectedMealType, selectedRecipe)
      onClose()
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'fácil': return 'text-green-600'
      case 'medio': return 'text-yellow-600'
      case 'difícil': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getDifficultyEmoji = (difficulty) => {
    switch(difficulty) {
      case 'fácil': return '🟢'
      case 'medio': return '🟡'
      case 'difícil': return '🔴'
      default: return '⚪'
    }
  }

  const getMealEmoji = (mealType) => {
    switch(mealType) {
      case 'desayuno': return '🍳'
      case 'comida': return '🍝'
      case 'cena': return '🌙'
      default: return '🍽️'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content recipe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-gray-800">
            {getMealEmoji(selectedMealType)} {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} - {selectedDay}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {/* Búsqueda */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar receta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lista de Recetas */}
          <div className="recipe-list max-h-64 overflow-y-auto">
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span>No hay recetas disponibles para {selectedMealType}</span>
              </div>
            ) : (
              filteredRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  className={`recipe-item p-3 border rounded-lg mb-2 cursor-pointer transition-all ${
                    selectedRecipe?.id === recipe.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectRecipe(recipe)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{recipe.ingredients}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">⏱️ {recipe.time}</span>
                        <span className={`text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                          {getDifficultyEmoji(recipe.difficulty)} {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Receta Seleccionada */}
          {selectedRecipe && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Receta Seleccionada:</h4>
              <p className="text-blue-700">{selectedRecipe.name}</p>
              <p className="text-sm text-blue-600 mt-1">{selectedRecipe.ingredients}</p>
            </div>
          )}
        </div>

        <div className="modal-footer flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedRecipe}
            className={`px-4 py-2 rounded-lg ${
              selectedRecipe
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecipeModal
