import React from 'react'
import * as LucideIcons from 'lucide-react'

/**
 * Renderizador dinámico de iconos de Lucide React
 * Permite pasar el nombre del icono como string y renderiza el componente correspondiente
 * con estilos heredables (currentColor) para que el color sea controlable vía CSS
 */
export function IconRenderer({ 
  icon, 
  size = 20, 
  className = '',
  style = {},
  title = ''
}) {
  if (!icon || typeof icon !== 'string') {
    console.warn('[IconRenderer] Icon name is required and must be a string', icon);
    return null;
  }

  // Obtener el componente de lucide por nombre
  const IconComponent = LucideIcons[icon];
  
  if (!IconComponent) {
    console.warn(`[IconRenderer] Icon "${icon}" not found in lucide-react`);
    return null;
  }

  // Renderizar con estilos que hereden currentColor (para control de color vía CSS)
  return (
    <IconComponent 
      size={size} 
      className={`lucide-icon ${className}`}
      style={{
        color: 'currentColor',
        ...style
      }}
      title={title}
    />
  );
}

/**
 * Componente wrapper para iconos inline
 * Útil para usar en botones, selects, badges, etc.
 */
export function InlineIcon({ 
  icon, 
  size = 16, 
  label = '',
  className = ''
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <IconRenderer icon={icon} size={size} />
      {label && <span>{label}</span>}
    </span>
  );
}

/**
 * Badge de icono - para mostrar un icono en un fondo colored
 */
export function IconBadge({ 
  icon, 
  size = 20,
  bgColor = 'rgba(255, 255, 255, 0.1)',
  textColor = 'currentColor',
  borderRadius = '6px',
  padding = '6px'
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        color: textColor,
        borderRadius,
        padding,
        flexShrink: 0
      }}
    >
      <IconRenderer icon={icon} size={size} />
    </div>
  );
}

export default IconRenderer
