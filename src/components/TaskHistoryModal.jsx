import React from 'react'
import { useApp } from '../context/AppContext'
import './TaskHistoryModal.css'

function TaskHistoryModal({ isOpen, onClose }) {
  const { actions, getCompletedTasks } = useApp()

  const completedTasks = getCompletedTasks ? getCompletedTasks() : []

  const getModuleEmoji = (task) => {
    const moduleEmojis = {
      'selfcare': '🛀',
      'mindfulness': '🧘‍♀️',
      'vida-social': '🥂',
      'fitness': '💪',
      'tecno-girl': '💻',
      'investigacion': '🔬',
      'maestria': '🎓',
      'laboratorio': '🧪',
      'idiomas': '🗣️',
      'cumpleanos': '🎂'
    }
    return moduleEmojis[task.module] || '📌'
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
      const [year, month, day] = task.date.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('es-MX', { 
        month: 'short', 
        day: 'numeric',
        hour: task.startTime ? '2-digit' : undefined,
        minute: task.startTime ? '2-digit' : undefined
      })
    } else if (task.type === 'task' && task.deadline) {
      const [year, month, day] = task.deadline.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('es-MX', { 
        month: 'short', 
        day: 'numeric'
      })
    }
    
    return 'Sin fecha'
  }

  const handleUncompleteTask = async (task) => {
    try {
      await actions.updateEntry(task.id, {
        completed: false,
        status: 'todo',
        completedAt: null
      })
    } catch (error) {
      console.error('Error uncompleting task:', error)
    }
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
                        onChange={() => handleUncompleteTask(task)}
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
