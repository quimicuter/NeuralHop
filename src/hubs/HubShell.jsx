import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import GlobalAddModal from '../components/GlobalAddModal'
import BaseWidget from '../components/BaseWidget'
import './HubShell.css'

// ─── Widgets Especializados Fase B (Personal Hubs) ───
import VirtualShelf from '../widgets/VirtualShelf'
import CyclicTracker from '../widgets/CyclicTracker'
import JournalTable from '../widgets/JournalTable'
import RelationshipRadar from '../widgets/RelationshipRadar'
import MemoryWall from '../widgets/MemoryWall'
import WishlistKanban from '../widgets/WishlistKanban'
import ProgressBars from '../widgets/ProgressBars'
import MultimediaRepo from '../widgets/MultimediaRepo'

// ─── Widgets Especializados Fase C (Academic Hubs) ───
import CourseProgress from '../widgets/CourseProgress'
import CodeSnippet from '../widgets/CodeSnippet'
import PaperKanban from '../widgets/PaperKanban'
import NetworkContact from '../widgets/NetworkContact'
import ApplicationTracker from '../widgets/ApplicationTracker'
import TitulacionChecklist from '../widgets/TitulacionChecklist'
import MultiSubjectPanel from '../widgets/MultiSubjectPanel'
import InventoryTable from '../widgets/InventoryTable'
import MultiLanguageDB from '../widgets/MultiLanguageDB'
import FlashcardWidget from '../widgets/FlashcardWidget'

// ─── Configuración de Hubs con Widgets Especializados ───
const hubConfig = {
  // ═══════════════════════════════════════════════════════
  // ║  PERSONAL HUBS                                        ║
  // ═══════════════════════════════════════════════════════
  
  // ─── WELLNESS HUB: Centro integral de bienestar ───
  wellness: {
    emoji: '🌿', title: 'Wellness Hub',
    gradient: 'linear-gradient(135deg, #fff0f3 0%, #ffcbce 45%, #d8f0e8 100%)',
    accent: '#ff8b94', description: 'Bienestar integral y self-care consolidado',
    widgets: ['virtualShelf', 'cyclicTracker', 'tasks', 'events']
  },
  
  // ─── VIDA SOCIAL: MemoryWall + WishlistKanban ───
  'vida-social': {
    emoji: '🥂', title: 'Vida Social',
    gradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #ef9a9a 100%)',
    accent: '#ef9a9a', description: 'Conexiones y recuerdos',
    widgets: ['memoryWall', 'wishlistKanban', 'events', 'tasks']
  },
  
  // ═══════════════════════════════════════════════════════
  // ║  ACADEMIC HUBS (Fase C)                               ║
  // ═══════════════════════════════════════════════════════
  
  // ─── TECNO GIRL: CourseProgress + CodeSnippet ───
  'tecno-girl': {
    emoji: '💻', title: 'Tecno Girl',
    gradient: 'linear-gradient(135deg, #d8f8ff 0%, #c4e4ff 50%, #8ec1ff 100%)',
    accent: '#4f8fe6', description: 'Innovación tecnológica y proyectos creativos',
    widgets: ['courseProgress', 'codeSnippet', 'tasks', 'habits']
  },
  
  // ─── INVESTIGACIÓN: PaperKanban + NetworkContact ───
  investigacion: {
    emoji: '🔬', title: 'Investigación',
    gradient: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)',
    accent: '#ce93d8', description: 'Laboratorio mental',
    widgets: ['paperKanban', 'networkContact', 'tasks', 'habits']
  },
  
  // ─── MAESTRÍA: ApplicationTracker + TitulacionChecklist ───
  maestria: {
    emoji: '🎓', title: 'Maestría',
    gradient: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 50%, #b39ddb 100%)',
    accent: '#b39ddb', description: 'Transición y objetivos a largo plazo',
    widgets: ['applicationTracker', 'titulacionChecklist', 'tasks', 'habits']
  },
  
  // ─── LAB MANAGER: MultiSubjectPanel + InventoryTable ───
  lab: {
    emoji: '🧪', title: 'Laboratorio',
    gradient: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)',
    accent: '#80deea', description: 'Command Center - Gestión de trabajo',
    widgets: ['multiSubjectPanel', 'inventoryTable', 'tasks', 'habits']
  },
  
  // ─── IDIOMAS: MultiLanguageDB + FlashcardWidget ───
  idiomas: {
    emoji: '🗣️', title: 'Idiomas',
    gradient: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 50%, #ffe082 100%)',
    accent: '#ffe082', description: 'Políglota en progreso',
    widgets: ['multiLanguageDB', 'flashcardWidget', 'tasks', 'habits']
  }
}

function HubShell({ children }) {
  const { scope, moduleId } = useParams()
  const { state, actions, getEntries } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('task')
  const config = hubConfig[moduleId] || { 
    emoji: '📦', title: moduleId, 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    accent: '#764ba2', 
    description: 'Módulo',
    widgets: ['tasks', 'habits', 'events', 'notes']
  }

  // Filtrar entries de este módulo
  const moduleEntries = (getEntries && getEntries({ scope, module: moduleId })) || []
  const moduleTasks = (moduleEntries || []).filter(e => e.type === 'task' && !e.completed)
  const moduleHabits = (moduleEntries || []).filter(e => e.type === 'habit')
  const moduleEvents = (moduleEntries || []).filter(e => e.type === 'event' && !e.completed)
  const moduleJournal = (moduleEntries || []).filter(e => e.type === 'journal')
  const moduleWishlist = (moduleEntries || []).filter(e => e.type === 'wishlist' || e.metadata?.isWishlist)
  const moduleVideos = (moduleEntries || []).filter(e => e.type === 'video' || e.metadata?.youtubeId)
  const moduleProducts = (moduleEntries || []).filter(e => e.type === 'product' || e.metadata?.category)
  const moduleCycles = (moduleEntries || []).filter(e => e.metadata?.cycleId)
  const moduleContacts = (moduleEntries || []).filter(e => e.metadata?.contactId || e.metadata?.lastContactDate)
  const modulePapers = (moduleEntries || []).filter(e => e.type === 'paper' || e.metadata?.paperType)
  const moduleResearchContacts = (moduleEntries || []).filter(e => e.type === 'research-contact' || e.metadata?.contactType === 'research')
  const moduleApplications = (moduleEntries || []).filter(e => e.type === 'application' || e.metadata?.applicationType)
  const moduleTitulacion = (moduleEntries || []).filter(e => e.type === 'titulacion' || e.metadata?.requirementId)
  const moduleExperiments = (moduleEntries || []).filter(e => e.metadata?.subject)
  const moduleInventory = (moduleEntries || []).filter(e => e.type === 'inventory' || e.metadata?.inventoryType)
  const moduleLanguage = (moduleEntries || []).filter(e => e.metadata?.language || e.type === 'vocabulary')
  const moduleFlashcards = (moduleEntries || []).filter(e => e.type === 'flashcard' || e.metadata?.flashcardData)
  const moduleCourses = (moduleEntries || []).filter(e => e.type === 'course-module' || e.metadata?.courseId)

  // ═══════════════════════════════════════════════════════
  // ║  RENDERIZADO DE WIDGETS ESPECIALIZADOS              ║
  // ═══════════════════════════════════════════════════════

  const renderWidget = (widgetType) => {
    switch (widgetType) {
      // ─── SELFCARE WIDGETS ───
      case 'virtualShelf':
        return (
          <div key="virtualShelf" className="hub-widget hub-widget-wide">
            <VirtualShelf entries={moduleProducts} />
          </div>
        )
      
      case 'cyclicTracker':
        return (
          <div key="cyclicTracker" className="hub-widget">
            <CyclicTracker 
              entries={moduleCycles} 
              onCycleComplete={(cycleId, entryId) => {
                if (entryId) {
                  actions.updateEntry(entryId, { 
                    completed: true, 
                    'metadata.lastDone': new Date().toISOString() 
                  })
                } else {
                  actions.addEntry({
                    type: 'cycle',
                    title: 'Ciclo completado',
                    scope,
                    module: moduleId,
                    metadata: { cycleId, lastDone: new Date().toISOString() }
                  })
                }
              }}
            />
          </div>
        )

      // ─── MINDFULNESS WIDGETS ───
      case 'journalTable':
        return (
          <div key="journalTable" className="hub-widget hub-widget-wide">
            <JournalTable 
              entries={moduleJournal} 
              onRowClick={(entry) => console.log('Journal entry:', entry)}
            />
          </div>
        )
      
      case 'relationshipRadar':
        return (
          <div key="relationshipRadar" className="hub-widget hub-widget-tall">
            <RelationshipRadar entries={moduleContacts} />
          </div>
        )

      // ─── VIDA SOCIAL WIDGETS ───
      case 'memoryWall':
        return (
          <div key="memoryWall" className="hub-widget hub-widget-wide">
            <MemoryWall 
              entries={moduleEvents}
              onItemClick={(entry) => console.log('Memory:', entry)}
            />
          </div>
        )
      
      case 'wishlistKanban':
        return (
          <div key="wishlistKanban" className="hub-widget hub-widget-wide">
            <WishlistKanban 
              entries={moduleWishlist}
              onMoveEntry={(entryId, newStatus) => {
                actions.updateEntry(entryId, { status: newStatus })
              }}
              onEntryClick={(entry) => console.log('Wishlist item:', entry)}
            />
          </div>
        )

      // ─── FITNESS WIDGETS ───
      case 'progressBars':
        return (
          <div key="progressBars" className="hub-widget">
            <ProgressBars 
              entries={moduleEntries}
              onGoalClick={(goalId, entryId) => {
                console.log('Goal clicked:', goalId, entryId)
              }}
            />
          </div>
        )
      
      case 'multimediaRepo':
        return (
          <div key="multimediaRepo" className="hub-widget hub-widget-wide">
            <MultimediaRepo 
              entries={moduleVideos}
              onAddVideo={() => console.log('Add video clicked')}
              onVideoClick={(video) => console.log('Video:', video)}
            />
          </div>
        )

      // ═══════════════════════════════════════════════════════
      // ║  ACADEMIC HUBS WIDGETS (Fase C)                    ║
      // ═══════════════════════════════════════════════════════

      // ─── TECNO GIRL WIDGETS ───
      case 'courseProgress':
        return (
          <div key="courseProgress" className="hub-widget">
            <CourseProgress entries={moduleCourses} currentMonth={1} />
          </div>
        )
      
      case 'codeSnippet':
        return (
          <div key="codeSnippet" className="hub-widget hub-widget-wide">
            <CodeSnippet 
              entries={moduleEntries}
              onAddSnippet={() => console.log('Add snippet clicked')}
              onSnippetClick={(snippet) => console.log('Snippet:', snippet)}
            />
          </div>
        )

      // ─── INVESTIGACIÓN WIDGETS ───
      case 'paperKanban':
        return (
          <div key="paperKanban" className="hub-widget hub-widget-wide">
            <PaperKanban 
              entries={modulePapers}
              onMoveEntry={(entryId, newStatus) => {
                actions.updateEntry(entryId, { status: newStatus })
              }}
              onEntryClick={(entry) => console.log('Paper:', entry)}
            />
          </div>
        )
      
      case 'networkContact':
        return (
          <div key="networkContact" className="hub-widget">
            <NetworkContact 
              entries={moduleResearchContacts}
              onContactClick={(contact) => console.log('Contact:', contact)}
            />
          </div>
        )

      // ─── MAESTRÍA WIDGETS ───
      case 'applicationTracker':
        return (
          <div key="applicationTracker" className="hub-widget hub-widget-wide">
            <ApplicationTracker 
              entries={moduleApplications}
              onRowClick={(entry) => console.log('Application:', entry)}
            />
          </div>
        )
      
      case 'titulacionChecklist':
        return (
          <div key="titulacionChecklist" className="hub-widget">
            <TitulacionChecklist 
              entries={moduleTitulacion}
              onToggleItem={(reqId) => {
                actions.addEntry({
                  type: 'titulacion',
                  title: 'Requisito completado',
                  scope,
                  module: moduleId,
                  completed: true,
                  metadata: { requirementId: reqId }
                })
              }}
            />
          </div>
        )

      // ─── LAB MANAGER WIDGETS ───
      case 'multiSubjectPanel':
        return (
          <div key="multiSubjectPanel" className="hub-widget hub-widget-wide">
            <MultiSubjectPanel 
              entries={moduleExperiments}
              onSubjectChange={(subjectId) => console.log('Subject:', subjectId)}
            />
          </div>
        )
      
      case 'inventoryTable':
        return (
          <div key="inventoryTable" className="hub-widget hub-widget-wide">
            <InventoryTable 
              entries={moduleInventory}
              onRowClick={(entry) => console.log('Inventory item:', entry)}
            />
          </div>
        )

      // ─── IDIOMAS WIDGETS ───
      case 'multiLanguageDB':
        return (
          <div key="multiLanguageDB" className="hub-widget hub-widget-wide">
            <MultiLanguageDB 
              entries={moduleLanguage}
              onLanguageSelect={(langId) => console.log('Language:', langId)}
            />
          </div>
        )
      
      case 'flashcardWidget':
        return (
          <div key="flashcardWidget" className="hub-widget">
            <FlashcardWidget 
              entries={moduleFlashcards}
              onCardMastered={(cardId) => {
                actions.updateEntry(cardId, { completed: true })
              }}
            />
          </div>
        )

      // ─── WIDGETS BASE (todos los hubs) ───
      case 'tasks':
        return (
          <div key="tasks" className="hub-widget hub-widget-wide">
            <BaseWidget
              title="Tareas"
              emoji="📋"
              entries={moduleTasks}
              view="list"
              availableViews={['list', 'kanban', 'table', 'calendar']}
              onEntryClick={(entry) => console.log('Task clicked:', entry)}
              onToggleComplete={(id) => actions.updateEntry(id, { completed: true, status: 'done' })}
              onMoveEntry={(id, status) => actions.updateEntry(id, { status })}
              kanbanColumns={[
                { id: 'todo', title: 'Por Hacer', emoji: '⏳', color: '#94a3b8' },
                { id: 'in-progress', title: 'En Progreso', emoji: '🔄', color: '#60a5fa' },
                { id: 'done', title: 'Completado', emoji: '✅', color: '#4ade80' }
              ]}
              emptyMessage="Sin tareas pendientes ✨"
            />
          </div>
        )
      
      case 'habits':
        return (
          <div key="habits" className="hub-widget">
            <BaseWidget
              title="Hábitos"
              emoji="🔄"
              entries={moduleHabits}
              view="list"
              availableViews={['list', 'table']}
              onEntryClick={(entry) => console.log('Habit clicked:', entry)}
              onToggleComplete={(id) => actions.updateEntry(id, { completed: !moduleHabits.find(h => h.id === id)?.completed })}
              emptyMessage="Sin hábitos registrados 🌱"
            />
          </div>
        )
      
      case 'events':
        return (
          <div key="events" className="hub-widget hub-widget-wide">
            <BaseWidget
              title="Eventos"
              emoji="📅"
              entries={moduleEvents}
              view="calendar"
              availableViews={['list', 'calendar', 'table']}
              onEntryClick={(entry) => console.log('Event clicked:', entry)}
              onToggleComplete={(id) => actions.updateEntry(id, { completed: true })}
              emptyMessage="Sin eventos próximos 🎯"
            />
          </div>
        )
      
      case 'notes':
        return (
          <div key="notes" className="hub-widget">
            <div className="hub-widget-header">
              <h3>📝 Notas</h3>
              <span className="hub-badge">{state.notes?.length || 0}</span>
            </div>
            <div className="hub-widget-content">
              <p className="hub-empty">Notas del módulo (Fase E) 📝</p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const showShellHeader = !children

  return (
    <div className="hub-shell" style={showShellHeader ? { background: config.gradient } : undefined}>
      {showShellHeader && (
        <div className="hub-header">
          <Link to="/" className="hub-back-btn">
            ← Dashboard
          </Link>
          <div className="hub-title-group">
            <span className="hub-emoji">{config.emoji}</span>
            <h1 className="hub-title">{config.title}</h1>
            <p className="hub-description">{config.description}</p>
          </div>
          <button 
            className="hub-add-btn"
            onClick={() => {
              setModalType('task')
              setIsModalOpen(true)
            }}
          >
            + Agregar
          </button>
        </div>
      )}

      {/* Bento Grid con Widgets Especializados */}
      {children ? (
        <div className="hub-module-content">
          {children}
        </div>
      ) : (
        <div className="hub-bento">
          {config.widgets?.map(widgetType => renderWidget(widgetType))}
        </div>
      )}

      {/* Modal Global para Agregar Entradas */}
      <GlobalAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedType={modalType}
      />
    </div>
  )
}

export default HubShell
