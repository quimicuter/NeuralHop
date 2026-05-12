import React, { useState, useMemo } from 'react'
import './ViewCalendar.css'

const ViewCalendar = ({ 
  entries = [], 
  onEntryClick,
  onToggleComplete,
  monthOffset = 0,
  onMonthChange
}) => {
  const [selectedDate, setSelectedDate] = useState(null)

  const today = new Date()
  const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(), 
    currentMonth.getMonth() + 1, 
    0
  ).getDate()
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(), 
    currentMonth.getMonth(), 
    1
  ).getDay()
  
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const getEntriesForDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    return entries.filter(entry => {
      const entryDate = entry.date || entry.deadline || entry.metadata?.date
      return entryDate === dateStr
    })
  }

  const isToday = (day) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth.getMonth() && 
           today.getFullYear() === currentMonth.getFullYear()
  }

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  const navigateMonth = (direction) => {
    if (onMonthChange) {
      onMonthChange(monthOffset + direction)
    }
  }

  const goToToday = () => {
    if (onMonthChange) {
      onMonthChange(0)
    }
  }

  return (
    <div className="view-calendar">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={() => navigateMonth(-1)}>←</button>
          <h3 className="calendar-month">{monthName}</h3>
          <button className="calendar-nav-btn" onClick={() => navigateMonth(1)}>→</button>
        </div>
        <button className="calendar-today-btn" onClick={goToToday}>Hoy</button>
      </div>

      {/* Week days */}
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: adjustedFirstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const dayEntries = getEntriesForDate(day)
          const hasEntries = dayEntries.length > 0
          const isSelected = selectedDate === day
          const isTodayDate = isToday(day)

          return (
            <div
              key={day}
              className={`calendar-day ${isTodayDate ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEntries ? 'has-entries' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <span className="day-number">{day}</span>
              
              {hasEntries && (
                <div className="day-entries">
                  {dayEntries.slice(0, 3).map((entry, i) => (
                    <div
                      key={entry.id}
                      className={`day-entry ${entry.completed ? 'completed' : ''}`}
                      style={{ backgroundColor: getEntryColor(entry) }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEntryClick && onEntryClick(entry)
                      }}
                      title={entry.title}
                    >
                      <span className="day-entry-title">
                        {entry.title.slice(0, 15)}
                        {entry.title.length > 15 ? '...' : ''}
                      </span>
                    </div>
                  ))}
                  {dayEntries.length > 3 && (
                    <div className="day-more">+{dayEntries.length - 3} más</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected day details */}
      {selectedDate && (
        <div className="calendar-details">
          <div className="calendar-details-header">
            <h4>
              {selectedDate} de {currentMonth.toLocaleDateString('es-ES', { month: 'long' })}
            </h4>
            <button className="close-details" onClick={() => setSelectedDate(null)}>×</button>
          </div>
          
          <div className="calendar-details-list">
            {getEntriesForDate(selectedDate).length === 0 ? (
              <p className="no-entries">Sin eventos o tareas este día</p>
            ) : (
              getEntriesForDate(selectedDate).map(entry => (
                <div
                  key={entry.id}
                  className={`calendar-detail-item ${entry.completed ? 'completed' : ''}`}
                  onClick={() => onEntryClick && onEntryClick(entry)}
                >
                  {onToggleComplete && (
                    <input
                      type="checkbox"
                      checked={entry.completed}
                      onChange={(e) => {
                        e.stopPropagation()
                        onToggleComplete(entry.id)
                      }}
                      className="calendar-checkbox"
                    />
                  )}
                  <div className="calendar-detail-content">
                    <span className="calendar-detail-title">{entry.title}</span>
                    {entry.priority && (
                      <span className={`calendar-detail-priority priority-${entry.priority}`}>
                        {entry.priority === 'critical' && '🔥'}
                        {entry.priority === 'high' && '⚡'}
                        {entry.priority === 'medium' && '📌'}
                        {entry.priority === 'low' && '🌱'}
                      </span>
                    )}
                    {entry.metadata?.startTime && (
                      <span className="calendar-detail-time">{entry.metadata.startTime}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const getEntryColor = (entry) => {
  if (entry.completed) return 'rgba(100, 255, 150, 0.3)'
  
  switch(entry.priority) {
    case 'critical': return 'rgba(255, 100, 100, 0.4)'
    case 'high': return 'rgba(255, 180, 100, 0.4)'
    case 'medium': return 'rgba(100, 180, 255, 0.4)'
    case 'low': return 'rgba(150, 255, 200, 0.4)'
    default: return 'rgba(255, 255, 255, 0.2)'
  }
}

export default ViewCalendar
