import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

function NexusCalendar() {
  const { state, actions } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())

  const getMonthName = (date) => {
    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isWeekend = (day) => {
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  const getTasksForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // Filtrar tareas (type: 'task' o sin type) con fecha
    const tasks = state.tasks.filter(task => 
      (task.type === 'task' || !task.type || task.type === undefined) && 
      task.date === dateStr
    )
    
    // Filtrar eventos (type: 'event') con fecha
    const events = state.tasks.filter(task => 
      task.type === 'event' && 
      task.date === dateStr
    )
    
    // Combinar tareas y eventos, dando prioridad a los eventos
    return [...events, ...tasks]
  }

  const getTaskEmoji = (task) => {
    // Si es un evento, usar emoji de evento
    if (task.type === 'event') {
      return '📅'
    }
    
    // Si es una tarea, usar emoji de categoría
    const category = state.categories[task.category]
    return category ? category.icon : '📌'
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const tasks = getTasksForDay(day)
      const today = isToday(day)
      const weekend = isWeekend(day)

      days.push(
        <div
          key={day}
          className={`cal-day ${today ? 'today' : ''} ${weekend ? 'weekend' : ''}`}
        >
          <div className="day-num">{day}</div>
          <div className="indicator-container">
            {tasks.slice(0, 3).map((task, index) => (
              <div
                key={index}
                className="cal-indicator"
                style={{
                  backgroundColor: task.category === 'personal' ? '#ffb3c6' : 
                                   task.category === 'escolar' ? '#c8a2c8' : 
                                   task.category === 'general' ? '#ff9aa2' : '#4A90E2'
                }}
              >
                <span className="task-emoji">{getTaskEmoji(task)}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="nexus-calendar">
      <div className="card-header">
        <h3>Agenda</h3>
      </div>
      <div className="month-header">
        <button className="widget-action-btn" onClick={prevMonth}>❮</button>
        <span className="month-label">{getMonthName(currentDate)}</span>
        <button className="widget-action-btn" onClick={nextMonth}>❯</button>
      </div>
      <div className="calendar-weekdays">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
          <div key={index} className="weekday-header">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {renderCalendarDays()}
      </div>
    </div>
  )
}

export default NexusCalendar
