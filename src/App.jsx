import React from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import ClockWidget from './components/ClockWidget'
import NexusCalendar from './components/NexusCalendar'
import SimpleTasks from './components/SimpleTasks'
import SimpleEvents from './components/SimpleEvents'
import HabitsTracker from './components/HabitsTracker'
import WeatherWidget from './components/WeatherWidget'
import ModuleDashboard from './components/ModuleDashboard'
import HubShell from './hubs/HubShell'
import GlobalAddModal from './components/GlobalAddModal'
import DataScienceHub from './components/DataScienceHub'
import NotesRepository from './components/NotesRepository'
import TaskHistoryModal from './components/TaskHistoryModal'
import RecipeModal from './components/RecipeModal'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isDataScienceHubOpen, setIsDataScienceHubOpen] = React.useState(false)
  const [isTaskHistoryOpen, setIsTaskHistoryOpen] = React.useState(false)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = React.useState(false)
  const [selectedRecipeDay, setSelectedRecipeDay] = React.useState('')
  const [selectedRecipeMealType, setSelectedRecipeMealType] = React.useState('')
  const [modalPreselectedType, setModalPreselectedType] = React.useState('task')

  const openModalWithType = (type) => {
    setModalPreselectedType(type)
    setIsModalOpen(true)
  }

  const openRecipeModal = (day, mealType) => {
    setSelectedRecipeDay(day)
    setSelectedRecipeMealType(mealType)
    setIsRecipeModalOpen(true)
  }

  const handleSelectRecipe = (day, mealType, recipe) => {
    console.log(`Receta seleccionada: ${recipe.name} para ${day} - ${mealType}`)
    // Aquí se puede guardar en el estado o Firebase
  }
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={
            <div className="app-container">
              <div className="background-layer"></div>
              
              {/* 12x12 Pure CSS Grid Layout */}
              <div className="nexus-grid">
          {/* BLOQUE IZQUIERDO (Columnas 1-4) */}
          {/* Bienvenida (4x3) */}
          <div className="welcome-card">
            <div className="welcome-content">
              {/* Bloque Izquierdo - Hora, Fecha, Frase */}
              <div className="welcome-left">
                <div className="clock-main">
                  <ClockWidget />
                </div>
              </div>
              
              {/* Bloque Derecho - Clima */}
              <div className="welcome-right">
                <div className="climate-main">
                  <WeatherWidget />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tareas (2x5) */}
          <div className="tasks-card">
            <div className="card-header">
              <h3>Mis Tareas</h3>
              <div className="task-buttons">
                <button className="task-btn circular" onClick={() => setIsTaskHistoryOpen(true)}>⏰</button>
                <button className="task-btn circular" onClick={() => openModalWithType('task')}>+</button>
              </div>
            </div>
            <div className="card-content">
              <SimpleTasks />
            </div>
          </div>
          
          {/* Eventos (2x5) */}
          <div className="events-card">
            <div className="card-header">
              <h3>Próximos Eventos</h3>
              <button className="task-btn circular" onClick={() => openModalWithType('event')}>+</button>
            </div>
            <div className="card-content">
              <SimpleEvents />
            </div>
          </div>
          
          {/* Menú Semanal (4x4) */}
          <div className="weekly-menu-card">
            <div className="card-header">
              <h3>Menú Semanal</h3>
            </div>
            <div className="menu-grid-6x4">
              {/* Fila 1 - Cabecera */}
              <div className="menu-cell empty-header"></div>
              {['L', 'M', 'M', 'J', 'V'].map(day => (
                <div key={day} className="menu-cell day-header">
                  {day}
                </div>
              ))}
              
              {/* Filas 2-4 - Matrix de comidas */}
              {[
                { emoji: '🍳', key: 'desayuno' },
                { emoji: '🍝', key: 'comida' },
                { emoji: '🌙', key: 'cena' }
              ].map(mealType => (
                <React.Fragment key={mealType.key}>
                  <div className="menu-cell meal-emoji">
                    {mealType.emoji}
                  </div>
                  {['L', 'M', 'M', 'J', 'V'].map(day => (
                    <div 
                      key={`${day}-${mealType.key}`}
                      className={`menu-cell meal-cell ${mealType.key === 'comida' ? 'has-meal' : 'empty-meal'}`}
                      onClick={() => openRecipeModal(day, mealType.key)}
                    >
                      {mealType.key === 'comida' ? (
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
          
          {/* BLOQUE CENTRAL (Columnas 5-10) */}
          {/* Navegación (6x2) */}
          <div className="nexus-buttons flex justify-center items-center gap-3">
            <button className="nexus-pill-btn agenda-btn">
              <span>📅</span>
              <span>Agenda</span>
            </button>
            <button className="nexus-pill-btn biblioteca-btn">
              <span>📚</span>
              <span>Biblioteca</span>
            </button>
            <button className="nexus-pill-btn grimorio-btn">
              <span>🔮</span>
              <span>Grimorio</span>
            </button>
            <button className="nexus-pill-btn shoplist-btn">
              <span>🛒</span>
              <span>Shoplist</span>
            </button>
            <button className="floating-add-btn flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full" onClick={() => setIsModalOpen(true)}>
              <span>+</span>
            </button>
          </div>
          
          {/* Calendario (6x6) */}
          <div className="calendar-card">
            <NexusCalendar />
          </div>
          
          {/* Notas (3x4) */}
          <div className="notes-card">
            <NotesRepository />
          </div>
          
          {/* Rutina (3x4) */}
          <div className="routine-card">
            <div className="card-header">
              <h3>Hábitos Diarios</h3>
              <button className="task-btn circular" onClick={() => openModalWithType('habit')}>+</button>
            </div>
            <div className="card-content">
              <HabitsTracker />
            </div>
          </div>
          
          {/* BLOQUE DERECHO (Columnas 11-12) */}
          {/* Galería Personal (2x6) */}
          <div className="gallery-personal">
            <div className="card-header">
              <h3>Personal</h3>
            </div>
            <div className="gallery-grid">
              <Link to="/hub/personal/selfcare" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">🛀 Self Care</span>
                  </div>
                </div>
              </Link>
              <Link to="/hub/personal/mindfulness" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">🧘‍♀️ Mindfulness</span>
                  </div>
                </div>
              </Link>
              <Link to="/hub/personal/vida-social" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">🥂 Vida Social</span>
                  </div>
                </div>
              </Link>
              <Link to="/hub/personal/fitness" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">💪 Fitness</span>
                  </div>
                </div>
              </Link>
                                        </div>
          </div>
          
          {/* Galería Académico (2x6) */}
          <div className="gallery-academic">
            <div className="card-header">
              <h3>Académico</h3>
            </div>
            <div className="gallery-grid">
              <Link to="/hub/academic/data-science" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">📊 Data Science</span>
                  </div>
                </div>
              </Link>
              <Link to="/hub/academic/investigacion" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">🔬 Investigación</span>
                  </div>
                </div>
              </Link>
              <Link to="/hub/academic/maestria" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">🎓 Maestría</span>
                  </div>
                </div>
              </Link>
              <Link to="/hub/academic/lab" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">Laboratorio</span>
                  </div>
                </div>
              </Link>
              <Link to="/hub/academic/idiomas" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">🗣️ Idiomas</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
            
            <GlobalAddModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              preselectedType={modalPreselectedType}
            />
            <DataScienceHub 
              isOpen={isDataScienceHubOpen} 
              onClose={() => setIsDataScienceHubOpen(false)} 
            />
            <TaskHistoryModal 
              isOpen={isTaskHistoryOpen} 
              onClose={() => setIsTaskHistoryOpen(false)} 
            />
            <RecipeModal 
              isOpen={isRecipeModalOpen}
              onClose={() => setIsRecipeModalOpen(false)}
              selectedDay={selectedRecipeDay}
              selectedMealType={selectedRecipeMealType}
              onSelectRecipe={handleSelectRecipe}
            />
            </div>
          } />
          <Route path="/hub/:scope/:moduleId" element={<HubShell />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}

export default App
