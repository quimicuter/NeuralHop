import React, { useState } from 'react'
import './DataScienceHub.css'

const DataScienceHub = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'list'
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Setup Python environment', status: 'todo', priority: 'high' },
    { id: 2, title: 'Complete Week 1 assignment', status: 'in-progress', priority: 'medium' },
    { id: 3, title: 'Review linear algebra concepts', status: 'completed', priority: 'low' },
    { id: 4, title: 'Practice pandas operations', status: 'todo', priority: 'high' },
    { id: 5, title: 'Join Kaggle competition', status: 'in-progress', priority: 'medium' }
  ])

  const handleTaskDrag = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const handlePlatformClick = (platform) => {
    const links = {
      zoom: 'https://zoom.us/j/YOUR_MEETING_ID',
      slack: 'https://YOUR_WORKSPACE.slack.com',
      colab: 'https://colab.research.google.com',
      kaggle: 'https://kaggle.com'
    }
    window.open(links[platform], '_blank')
  }

  const renderKanbanBoard = () => {
    const todoTasks = tasks.filter(t => t.status === 'todo')
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    return (
      <div className="kanban-board">
        <div className="kanban-column">
          <h3>📝 Por Hacer</h3>
          <div className="task-list">
            {todoTasks.map(task => (
              <div key={task.id} className="kanban-task" draggable>
                <span className="task-title">{task.title}</span>
                <span className={`priority priority-${task.priority}`}></span>
              </div>
            ))}
          </div>
        </div>
        <div className="kanban-column">
          <h3>🚀 En Progreso</h3>
          <div className="task-list">
            {inProgressTasks.map(task => (
              <div key={task.id} className="kanban-task" draggable>
                <span className="task-title">{task.title}</span>
                <span className={`priority priority-${task.priority}`}></span>
              </div>
            ))}
          </div>
        </div>
        <div className="kanban-column">
          <h3>✅ Completado</h3>
          <div className="task-list">
            {completedTasks.map(task => (
              <div key={task.id} className="kanban-task completed" draggable>
                <span className="task-title">{task.title}</span>
                <span className={`priority priority-${task.priority}`}></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderListView = () => (
    <div className="task-list-view">
      {tasks.map(task => (
        <div key={task.id} className="list-task">
          <span className="task-title">{task.title}</span>
          <div className="task-meta">
            <span className={`status status-${task.status}`}>
              {task.status === 'todo' ? '📝 Por Hacer' : 
               task.status === 'in-progress' ? '🚀 En Progreso' : '✅ Completado'}
            </span>
            <span className={`priority priority-${task.priority}`}></span>
          </div>
        </div>
      ))}
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="data-science-hub-overlay">
      <div className="data-science-hub">
        <div className="hub-header">
          <h2>📊 Data Science Hub</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="bento-grid">
          {/* Clases - 2x1 */}
          <div className="bento-card classes-card">
            <h3>📅 Clases</h3>
            <div className="class-info">
              <div className="class-item">
                <span className="day">Martes</span>
                <span className="time">14:00 - 16:00</span>
              </div>
              <div className="class-item">
                <span className="day">Jueves</span>
                <span className="time">14:00 - 16:00</span>
              </div>
            </div>
          </div>

          {/* Proyectos - 2x1 */}
          <div className="bento-card projects-card">
            <h3>🎯 Proyectos</h3>
            <div className="project-list">
              <div className="project-item">
                <span>📊 Sales Analysis</span>
                <span className="progress">75%</span>
              </div>
              <div className="project-item">
                <span>🤖 ML Model</span>
                <span className="progress">30%</span>
              </div>
            </div>
          </div>

          {/* Plataformas - 1x2 */}
          <div className="bento-card platforms-card">
            <h3>🔗 Plataformas</h3>
            <div className="platform-buttons">
              <button 
                className="platform-btn zoom-btn"
                onClick={() => handlePlatformClick('zoom')}
              >
                📹 Zoom
              </button>
              <button 
                className="platform-btn slack-btn"
                onClick={() => handlePlatformClick('slack')}
              >
                💬 Slack
              </button>
              <button 
                className="platform-btn colab-btn"
                onClick={() => handlePlatformClick('colab')}
              >
                📚 Colab
              </button>
              <button 
                className="platform-btn kaggle-btn"
                onClick={() => handlePlatformClick('kaggle')}
              >
                🏆 Kaggle
              </button>
            </div>
          </div>

          {/* Progreso - 1x1 */}
          <div className="bento-card progress-card">
            <h3>📈 Progreso</h3>
            <div className="progress-stats">
              <div className="stat">
                <span className="number">12</span>
                <span className="label">Horas</span>
              </div>
              <div className="stat">
                <span className="number">85%</span>
                <span className="label">Completado</span>
              </div>
            </div>
          </div>

          {/* Tareas - 1x1 */}
          <div className="bento-card tasks-summary-card">
            <h3>📝 Tareas</h3>
            <div className="tasks-summary">
              <div className="summary-item">
                <span className="count">{tasks.filter(t => t.status === 'todo').length}</span>
                <span className="label">Pendientes</span>
              </div>
              <div className="summary-item">
                <span className="count">{tasks.filter(t => t.status === 'in-progress').length}</span>
                <span className="label">En Progreso</span>
              </div>
            </div>
          </div>

          {/* Actividades Kanban - 3x1 */}
          <div className="bento-card activities-card">
            <div className="activities-header">
              <h3>📋 Actividades</h3>
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                  onClick={() => setViewMode('kanban')}
                >
                  📊 Kanban
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  📝 Lista
                </button>
              </div>
            </div>
            <div className="activities-content">
              {viewMode === 'kanban' ? renderKanbanBoard() : renderListView()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataScienceHub
