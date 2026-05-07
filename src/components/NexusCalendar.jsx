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
    const entries = state.entries || []
    
    // Filtrar tareas (type: 'task' o sin type) con fecha
    const tasks = entries.filter(task => 
      (task.type === 'task' || !task.type || task.type === undefined) && 
      task.date === dateStr
    )
    
    // Filtrar eventos (type: 'event') con fecha
    const events = entries.filter(task => 
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

  // Calcular edad del cumpleañero a partir de birthYear
  const getBirthdayAge = (task) => {
    if (!task.birthYear) return null
    const currentYear = new Date().getFullYear()
    return currentYear - task.birthYear
  }

  // Tooltip/title para mostrar info al hacer hover
  const getTaskTooltip = (task) => {
    const age = getBirthdayAge(task)
    if (task.isBirthdayReminder && age !== null) {
      return `🎂 Cumpleaños de ${task.birthdayName} — Cumple ${age} años`
    }
    if (task.isPartyEvent) {
      return `🎉 Fiesta de ${task.birthdayName}${task.time ? ` a las ${task.time}` : ''}`
    }
    return task.title || ''
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
                title={getTaskTooltip(task)}
                style={{
                  backgroundColor: task.isBirthdayReminder ? '#ec4899' :
                                   task.isPartyEvent ? '#9333ea' :
                                   task.category === 'personal' ? '#ffb3c6' : 
                                   task.category === 'escolar' ? '#c8a2c8' : 
                                   task.category === 'general' ? '#ff9aa2' : '#4A90E2'
                }}
              >
                <span className="task-emoji">
                  {task.isBirthdayReminder ? '🎂' : task.isPartyEvent ? '🎉' : getTaskEmoji(task)}
                </span>
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
      <div className="month-header">
        <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Mes anterior">❮</button>
        <span className="month-label">{getMonthName(currentDate)}</span>
        <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Mes siguiente">❯</button>
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
