import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import './TaskHistoryModal.css'

function TaskHistoryModal({ isOpen, onClose }) {
  const { state } = useApp()
  const [completedTasks, setCompletedTasks] = useState([])

  useEffect(() => {
    // Filtrar tareas completadas
    const tasks = state.tasks.filter(task => 
      (task.type === 'task' || !task.type || task.type === undefined) && 
      (task.completed || task.status === 'completed')
    )
    setCompletedTasks(tasks)
  }, [state.tasks])

  const getModuleEmoji = (task) => {
    const moduleEmojis = {
      'self-care': '🛀',
      'mindfulness': '🧘‍♀️',
      'recetario': '🍳',
      'hobbies': '🎨',
      'maestria': '🎓',
      'lab': '🧪',
      'idiomas': '🗣️',
      'investigacion': '🔬',
      'social': '🥂',
      'cumpleaños': '🎂',
      'otro': '📌'
    }
    
    const module = task.subcategory || task.freeCategory
    return moduleEmojis[module] || '📌'
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#db6666'
      case 'medium': return '#eab20893'
      case 'low': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const getTaskDateTime = (task) => {
    if (task.type === 'event' && task.date) {
      const date = new Date(task.date)
      return date.toLocaleDateString('es-MX', { 
        month: 'short', 
        day: 'numeric',
        hour: task.startTime ? '2-digit' : undefined,
        minute: task.startTime ? '2-digit' : undefined
      })
    } else if (task.type === 'task' && task.deadline) {
      const date = new Date(task.deadline)
      return date.toLocaleDateString('es-MX', { 
        month: 'short', 
        day: 'numeric'
      })
    }
    
    return 'Sin fecha'
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Historial de Tareas Completadas</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="task-history-content">
          {completedTasks.length === 0 ? (
            <div className="empty-history">
              <span>No hay tareas completadas aún. ✨</span>
            </div>
          ) : (
            <div className="completed-tasks-list">
              {completedTasks.map(task => (
                <div key={task.id} className="completed-task-item">
                  <div className="task-item-header">
                    <div className="task-item-left">
                      <input 
                        type="checkbox" 
                        className="task-checkbox-new"
                        checked={true}
                        readOnly
                      />
                      <span className="task-title completed">{task.title}</span>
                    </div>
                    <div className="task-item-right">
                      <span className="task-emoji">{getModuleEmoji(task)}</span>
                    </div>
                  </div>
                  <div className="task-item-footer">
                    <div className="priority-indicator" style={{ backgroundColor: getPriorityColor(task.priority) }}></div>
                    <span className="task-datetime">{getTaskDateTime(task)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskHistoryModal
