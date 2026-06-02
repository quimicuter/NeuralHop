import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import HubShell from './hubs/HubShell'
import DashboardView from './views/DashboardView'
import GlobalAddModal from './components/GlobalAddModal'
import TecnoGirlHub from './modules/TecnoGirl/TecnoGirlHub'
import LibraryHub from './modules/Library/LibraryHub'
import GrimoireHub from './modules/Grimoire/GrimoireHub'
import ShoplistHub from './modules/Shoplist/ShoplistHub'
import NotesRepository from './components/NotesRepository'
import TaskHistoryModal from './components/TaskHistoryModal'
import OfflineBanner from './components/OfflineBanner'
import RecipeModal from './components/RecipeModal'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isTecnoGirlHubOpen, setIsTecnoGirlHubOpen] = React.useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false)
  const [isGrimoireOpen, setIsGrimoireOpen] = React.useState(false)
  const [isShoplistOpen, setIsShoplistOpen] = React.useState(false)
  const [isTaskHistoryOpen, setIsTaskHistoryOpen] = React.useState(false)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = React.useState(false)
  const [isNotesOpen, setIsNotesOpen] = React.useState(false)
  const [selectedRecipeDay, setSelectedRecipeDay] = React.useState('')
  const [selectedRecipeMealType, setSelectedRecipeMealType] = React.useState('')
  const [modalPreselectedType, setModalPreselectedType] = React.useState('task')
  const [modalPreselectedCategory, setModalPreselectedCategory] = React.useState(null)
  const [editEntryData, setEditEntryData] = React.useState(null)
  const [prefillEntryData, setPrefillEntryData] = React.useState(null)

  const openModalWithType = (type) => {
    setModalPreselectedType(type)
    setModalPreselectedCategory(null)
    setEditEntryData(null)
    setPrefillEntryData(null)
    setIsModalOpen(true)
  }

  React.useEffect(() => {
    const handleEditEvent = (event) => {
      const entry = event.detail
      if (entry) {
        setEditEntryData(entry)
        setPrefillEntryData(null)
        setModalPreselectedType(entry.type || 'task')
        setIsModalOpen(true)
      }
    }

    const handleOpenGlobalModal = (event) => {
      const type = event?.detail?.type || 'task'
      setModalPreselectedType(type)
      setModalPreselectedCategory(event?.detail?.preselectedCategory || null)
      setEditEntryData(event?.detail?.editEntry || null)
      setPrefillEntryData(event?.detail?.prefill || null)
      setIsModalOpen(true)
    }

    window.addEventListener('open-edit-modal', handleEditEvent)
    window.addEventListener('open-global-modal', handleOpenGlobalModal)
    return () => {
      window.removeEventListener('open-edit-modal', handleEditEvent)
      window.removeEventListener('open-global-modal', handleOpenGlobalModal)
    }
  }, [])

  const openRecipeModal = (day, mealType) => {
    setSelectedRecipeDay(day)
    setSelectedRecipeMealType(mealType)
    setIsRecipeModalOpen(true)
  }

  const handleSelectRecipe = (day, mealType, recipe) => {
    // Receta seleccionada: ${recipe.name} para ${day} - ${mealType}
    // Aquí se puede guardar en el estado o Firebase
  }
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={
            <div className="app-container">
              <div className="background-layer"></div>
              <OfflineBanner />

              <DashboardView
                onOpenAddModal={openModalWithType}
                onOpenTaskHistory={() => setIsTaskHistoryOpen(true)}
                onOpenRecipeModal={openRecipeModal}
                onOpenNotes={() => setIsNotesOpen(true)}
                onOpenGrimoire={() => setIsGrimoireOpen(true)}
                onOpenShoplist={() => setIsShoplistOpen(true)}
              />

            <GlobalAddModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false)
                setEditEntryData(null)
                setPrefillEntryData(null)
                setModalPreselectedCategory(null)
              }}
              preselectedType={modalPreselectedType}
              preselectedCategory={modalPreselectedCategory}
              editEntry={editEntryData}
              prefillData={prefillEntryData}
              onTaskAdded={() => {
                // Force refresh via console confirmation
                // 🎯 Nueva entrada guardada en Firebase - sincronización en tiempo real activa
              }}
            />
            <TecnoGirlHub 
              isOpen={isTecnoGirlHubOpen} 
              onClose={() => setIsTecnoGirlHubOpen(false)} 
            />
            <LibraryHub 
              isOpen={isLibraryOpen} 
              onClose={() => setIsLibraryOpen(false)} 
            />
            <GrimoireHub 
              isOpen={isGrimoireOpen} 
              onClose={() => setIsGrimoireOpen(false)} 
            />
            <ShoplistHub 
              isOpen={isShoplistOpen} 
              onClose={() => setIsShoplistOpen(false)} 
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
            
            {/* Modal de Notas */}
            {isNotesOpen && (
              <div className="notes-modal-overlay" onClick={() => setIsNotesOpen(false)}>
                <div className="notes-modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="notes-modal-close" onClick={() => setIsNotesOpen(false)}>✕</div>
                  <NotesRepository />
                </div>
              </div>
            )}
            </div>
          } />
          <Route path="/hub/:scope/:moduleId" element={<HubShell />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}

export default App
