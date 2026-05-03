import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

function TaskBoard() {
  const { state, actions } = useApp()
  const [activeTab, setActiveTab] = useState('tasks')

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    return state.tasks.filter(task => 
      task.date === today && 
      task.status === 'todo' &&
      (task.type === 'task' || !task.type)
    )
  }

  const getUpcomingEvents = () => {
    const today = new Date()
    return state.tasks
      .filter(task => 
        task.type === 'event' && 
        new Date(task.date) >= today &&
        task.status !== 'completed'
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
  }

  const getTodayHabits = () => {
    const today = new Date().getDay()
    return state.habits.filter(habit => {
      if (habit.freq === 'daily') return true
      if (habit.freq === 'weekly' && habit.weeklyDay === today) return true
      if (habit.freq === 'personalizado' && habit.customDays?.includes(today)) return true
      if (habit.freq === 'monthly') {
        const dayOfMonth = new Date().getDate()
        return habit.monthlyDay === dayOfMonth
      }
      return false
    })
  }

  const toggleTaskComplete = (taskId) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      actions.updateTask({
        ...task,
        status: task.status === 'completed' ? 'todo' : 'completed'
      })
    }
  }

  const toggleHabitComplete = (habitId) => {
    const habit = state.habits.find(h => h.id === habitId)
    if (habit) {
      const today = new Date().toISOString().split('T')[0]
      const isDone = habit.lastDone === today
      actions.updateHabit({
        ...habit,
        lastDone: isDone ? '' : today,
        streak: isDone ? Math.max(0, habit.streak - 1) : habit.streak + 1
      })
    }
  }

  const renderTasks = () => {
    const tasks = getTodayTasks()
    if (tasks.length === 0) {
      return <div className="empty-state">No hay tareas para hoy</div>
    }

    return tasks.map(task => (
      <div key={task.id} className="task-item">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.status === 'completed'}
          onChange={() => toggleTaskComplete(task.id)}
        />
        <span className={`task-label ${task.status === 'completed' ? 'completed' : ''}`}>
          {task.title}
        </span>
        <div className="task-meta">
          {task.priority && (
            <span className={`priority-indicator ${task.priority}`}></span>
          )}
        </div>
      </div>
    ))
  }

  const renderEvents = () => {
    const events = getUpcomingEvents()
    if (events.length === 0) {
      return <div className="empty-state">No hay eventos próximos</div>
    }

    return events.map(event => (
      <div key={event.id} className="event-item">
        <div className="event-content">
          <div className="event-title">{event.title}</div>
          <div className="event-meta">
            <span>📅 {new Date(event.date).toLocaleDateString('es-MX')}</span>
            {event.time && <span>🕐 {event.time}</span>}
          </div>
        </div>
      </div>
    ))
  }

  const renderHabits = () => {
    const habits = getTodayHabits()
    if (habits.length === 0) {
      return <div className="empty-state">No hay hábitos para hoy</div>
    }

    return habits.map(habit => {
      const today = new Date().toISOString().split('T')[0]
      const isDone = habit.lastDone === today
      
      return (
        <div key={habit.id} className="habit-row">
          <div className="habit-info">
            <div className="habit-name">{habit.title}</div>
            <div className="habit-group">{habit.group}</div>
          </div>
          <button
            className={`habit-checkbox ${isDone ? 'done' : ''}`}
            onClick={() => toggleHabitComplete(habit.id)}
          >
            {isDone ? '✓' : '○'}
          </button>
        </div>
      )
    })
  }

  return (
    <div className="task-board">
      <div className="task-board-header">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tareas
          </button>
          <button
            className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Eventos
          </button>
          <button
            className={`tab-btn ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            Hábitos
          </button>
        </div>
      </div>
      
      <div className="task-board-content">
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'habits' && renderHabits()}
      </div>
    </div>
  )
}

export default TaskBoard
