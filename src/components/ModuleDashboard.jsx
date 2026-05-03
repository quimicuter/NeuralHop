import React from 'react'
import { Link, useParams } from 'react-router-dom'
import './ModuleDashboard.css'

const moduleTitles = {
  'self-care': 'Self Care',
  'mindfulness': 'Mindfulness', 
  'recetario': 'Recetario',
  'hobbies': 'Hobbies',
  'maestria': 'Maestría',
  'lab': 'Lab',
  'idiomas': 'Idiomas',
  'investigacion': 'Investigación'
}

function ModuleDashboard() {
  const { moduleId } = useParams()
  const moduleTitle = moduleTitles[moduleId] || 'Módulo Desconocido'

  return (
    <div className="module-dashboard">
      <div className="module-header">
        <Link to="/" className="back-btn">
          ← Regresar al Dashboard Principal
        </Link>
        <h1 className="module-title">{moduleTitle}</h1>
      </div>
      
      <div className="module-content">
        <div className="placeholder-content">
          <p>Contenido del módulo <strong>{moduleTitle}</strong> estará disponible próximamente.</p>
          <p>Aquí se desplegarán las tareas, eventos y hábitos específicos de este módulo.</p>
        </div>
      </div>
    </div>
  )
}

export default ModuleDashboard
