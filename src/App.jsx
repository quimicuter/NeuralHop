import React from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import ClockWidget from './components/ClockWidget'
import NexusCalendar from './components/NexusCalendar'
import SimpleTasks from './components/SimpleTasks'
import HabitsTracker from './components/HabitsTracker'
import WeatherWidget from './components/WeatherWidget'
import ModuleDashboard from './components/ModuleDashboard'
import GlobalAddModal from './components/GlobalAddModal'
import DataScienceHub from './components/DataScienceHub'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isDataScienceHubOpen, setIsDataScienceHubOpen] = React.useState(false)
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
                <button className="task-btn circular">⏰</button>
                <button className="task-btn circular">+</button>
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
              <button className="task-btn circular">+</button>
            </div>
            <div className="card-content">
              <div className="empty-state">
                <span>No hay eventos próximos. ✨</span>
              </div>
            </div>
          </div>
          
          {/* Menú Semanal (4x4) */}
          <div className="weekly-menu-card">
            <h3 className="menu-title">Menú Semanal</h3>
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
                      onClick={() => console.log(`Abriendo modal para seleccionar receta de Recetario para [${day}] - [${mealType.key}]`)}
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
            <div className="card-header">
              <h3>Notas Rápidas</h3>
              <button className="add-btn">+</button>
            </div>
            <div className="card-content">
              <div className="notes-content"></div>
            </div>
          </div>
          
          {/* Rutina (3x4) */}
          <div className="routine-card">
            <div className="card-header">
              <h3>Hábitos Diarios</h3>
              <button className="task-btn circular">+</button>
            </div>
            <div className="card-content">
              <HabitsTracker />
            </div>
          </div>
          
          {/* BLOQUE DERECHO (Columnas 11-12) */}
          {/* Galería Personal (2x6) */}
          <div className="gallery-personal">
            <h3 className="gallery-title">Personal</h3>
            <div className="gallery-grid">
              <Link to="/modulo/self-care" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">Self Care</span>
                  </div>
                </div>
              </Link>
              <Link to="/modulo/mindfulness" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">Mindfulness</span>
                  </div>
                </div>
              </Link>
              <Link to="/modulo/recetario" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">Recetario</span>
                  </div>
                </div>
              </Link>
              <Link to="/modulo/hobbies" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">Hobbies</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Galería Académico (2x6) */}
          <div className="gallery-academic">
            <h3 className="gallery-title">Académico</h3>
            <div className="gallery-grid">
              <Link to="/modulo/maestria" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">Maestría</span>
                  </div>
                </div>
              </Link>
              <Link to="/modulo/lab" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">Lab</span>
                  </div>
                </div>
              </Link>
              <Link to="/modulo/idiomas" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">Idiomas</span>
                  </div>
                </div>
              </Link>
              <Link to="/modulo/investigacion" className="gallery-card notion-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=60&fm=webp)'}}>
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">Investigación</span>
                  </div>
                </div>
              </Link>
              <button 
                className="gallery-card notion-card" 
                onClick={() => setIsDataScienceHubOpen(true)}
                style={{backgroundImage: 'url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=60&fm=webp)'}}
              >
                <div className="notion-overlay">
                  <div className="notion-content">
                    <span className="notion-title">📊 Data Science</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
            
            <GlobalAddModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
            />
            <DataScienceHub 
              isOpen={isDataScienceHubOpen} 
              onClose={() => setIsDataScienceHubOpen(false)} 
            />
            </div>
          } />
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}

export default App
