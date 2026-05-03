import React from 'react'
import { useApp } from '../context/AppContext'

function Pillars() {
  const { state } = useApp()

  const renderModuleCards = () => {
    const modules = []
    
    Object.entries(state.categories).forEach(([catKey, category]) => {
      category.subcats.forEach(subcat => {
        modules.push({
          key: `${catKey}-${subcat}`,
          category: catKey,
          subcategory: subcat,
          icon: state.pageData[subcat]?.icon || '📂',
          color: category.color
        })
      })
    })

    return modules.map(module => (
      <div
        key={module.key}
        className="module-card"
        style={{
          background: `linear-gradient(135deg, ${module.color}20, ${module.color}10)`,
          borderLeft: `4px solid ${module.color}`
        }}
      >
        <div className="module-icon">{module.icon}</div>
        <div className="module-info">
          <div className="module-category">{module.subcategory}</div>
          <div className="module-count">
            {state.tasks.filter(task => 
              task.category === module.category && 
              task.subcategory === module.subcategory
            ).length} tareas
          </div>
        </div>
      </div>
    ))
  }

  return (
    <div className="pillars-container">
      <div className="pillars-header">
        <h3 className="pillars-title">Módulos</h3>
      </div>
      <div className="modules-scroll">
        {renderModuleCards()}
      </div>
    </div>
  )
}

export default Pillars
