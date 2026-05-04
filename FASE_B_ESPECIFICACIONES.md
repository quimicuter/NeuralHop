# Fase B: Especificaciones de Componentes

## Resumen de Implementación

### Vistas Reutilizables (Core Views)

| Vista | Features Implementadas |
|-------|----------------------|
| **KanbanView** | ✅ Drag & Drop nativo HTML5, agrupación por status, columnas configurables |
| **TableView** | ✅ Bordes glassmorphism, backdrop-filter blur, toggle de columnas |
| **GalleryView** | ✅ object-fit: cover, efecto hover zoom (scale 1.08), elevación translateY(-4px) |

---

## SELFCARE Hub (`/hub/personal/selfcare`)

### VirtualShelf (Galería de Productos)
**Entry Type:** `product`  
**Metadata Requerida:**
```javascript
{
  type: 'product',
  title: 'Nombre del producto',
  scope: 'personal',
  module: 'selfcare',
  metadata: {
    category: 'skincare' | 'haircare' | 'gel-nail-polish',
    brand: 'Marca opcional',
    photoUrl: 'URL de imagen',
    notes: 'Notas adicionales'
  }
}
```

**Categorías Predefinidas:**
- `skincare` → ✨ Skincare
- `haircare` → 💇‍♀️ Haircare  
- `gel-nail-polish` → 💅 Gel Nail Polish

### CyclicTracker (Rastreador de Rutinas)
**Entry Type:** `cycle`  
**Ciclos Preconfigurados:**
| ID | Tarea | Emoji | Frecuencia | Color |
|----|-------|-------|------------|-------|
| `lavado-cabello` | Lavado de cabello | 🧴 | Cada 2-3 días | #81d4fa |
| `exfoliacion` | Exfoliación | ✨ | 2-3 veces/semana | #ce93d8 |
| `corte-mensual` | Corte mensual | ✂️ | Mensual | #a5d6a7 |
| `planchado` | Planchado | 💆‍♀️ | Según necesidad | #ffcc80 |

**Metadata:**
```javascript
{
  type: 'cycle',
  metadata: {
    cycleId: 'lavado-cabello', // uno de los IDs predefinidos
    lastDone: '2024-01-15T10:00:00Z'
  }
}
```

---

## MINDFULNESS Hub (`/hub/personal/mindfulness`)

### JournalTable (Tabla de Diario)
**Entry Type:** `journal`  
**Metadata:**
```javascript
{
  type: 'journal',
  title: 'Título de entrada',
  content: 'Contenido privado...',
  scope: 'personal',
  module: 'mindfulness',
  metadata: {
    mood: '😊', // emoji de estado de ánimo
    content: 'Contenido alternativo'
  }
}
```

**Característica Especial:**
- Columna de contenido con `filter: blur(4px)` por defecto
- Se revela con `filter: blur(0)` al hacer `:hover` en la fila
- `user-select: none` hasta hover para protección visual

### RelationshipRadar (Radar de Relaciones)
**Entry Type:** `contact`  
**Contactos Seed Data:**
| ID | Nombre | Emoji | Color |
|----|--------|-------|-------|
| `jaquelina` | Jaquelina | 👩 | #f48fb1 |
| `jose-carlos` | Jose Carlos | 👨 | #90caf9 |
| `osvi` | Osvi | 👤 | #a5d6a7 |

**UI:** Avatares circulares concéntricos según proximidad temporal
- **Inner ring (centro):** Últimos 3 días
- **Middle ring:** Esta semana (4-7 días)
- **Outer ring:** Más de 7 días

**Metadata:**
```javascript
{
  type: 'contact',
  metadata: {
    contactId: 'jaquelina', // uno de los IDs predefinidos
    lastContactDate: '2024-01-10'
  }
}
```

---

## VIDA SOCIAL Hub (`/hub/personal/vida-social`)

### MemoryWall (Muro de Recuerdos)
**Entry Type:** `event`  
**Filtros por Ciudad:**
- `guanajuato` → 🏛️ Guanajuato
- `leon` → 🦁 León
- `queretaro` → 🌉 Querétaro
- `canada` → 🍁 Canadá

**Criterio de Filtrado:**
```javascript
// Solo eventos con photoUrl en metadata
entries.filter(e => 
  e.type === 'event' && 
  (e.metadata?.photoUrl || e.metadata?.imageUrl)
)
```

**Metadata:**
```javascript
{
  type: 'event',
  title: 'Nombre del evento',
  metadata: {
    photoUrl: 'https://...',
    location: 'Guanajuato',
    city: 'guanajuato', // para filtrado
    date: '2024-01-15'
  }
}
```

### WishlistKanban (Lista de Deseos Kanban)
**Entry Type:** `wishlist`  
**Columnas Fijas:**
| Columna ID | Título | Color |
|------------|--------|-------|
| `ideas` | 💡 Ideas | #90caf9 |
| `comprado` | 🛍️ Comprado | #a5d6a7 |
| `entregado` | 🎁 Entregado | #ce93d8 |

**Metadata:**
```javascript
{
  type: 'wishlist',
  title: 'Nombre del regalo',
  status: 'ideas' | 'comprado' | 'entregado',
  metadata: {
    recipient: 'Nombre del destinatario',
    estimatedPrice: 500,
    isWishlist: true
  }
}
```

---

## FITNESS Hub (`/hub/personal/fitness`)

### ProgressBars (Barras de Progreso Circulares)
**Entry Type:** `goal`  
**Metas SVG Predefinidas:**
| ID | Meta | Emoji | Color | Progreso Default |
|----|------|-------|-------|-----------------|
| `split-completo` | Split Completo | 🤸 | #f48fb1 | 65% |
| `destensar-cadera` | Destensar Cadera | 🧘 | #81d4fa | 40% |
| `crecimiento-gluteos` | Crecimiento Glúteos | 🍑 | #ce93d8 | 55% |

**SVG:** Círculos con `stroke-dasharray` y `stroke-dashoffset` para progreso

**Metadata:**
```javascript
{
  type: 'goal',
  metadata: {
    goalId: 'split-completo',
    progress: 75 // porcentaje 0-100
  }
}
```

### MultimediaRepo (Repositorio de Videos)
**Entry Type:** `video`  
**Seed Data Preconfigurado:**
| ID | Título | Emoji | Categoría |
|----|--------|-------|-----------|
| `rutina-ciatica` | Rutina para Ciática | 🦵 | Alivio de dolor |
| `distension-abdominal` | Distensión Abdominal | 🫃 | Bienestar digestivo |

**YouTube Embed:**
```javascript
{
  type: 'video',
  title: 'Nombre del video',
  metadata: {
    youtubeId: 'dQw4w9WgXcQ', // ID del video de YouTube
    category: 'Alivio de dolor',
    emoji: '🦵'
  }
}
```

---

## Estructura de Datos en Firebase

### Colección: `entries`

```javascript
{
  // ─── Identificadores ───
  id: 'auto-generated',
  type: 'task' | 'habit' | 'event' | 'journal' | 'product' | 
        'cycle' | 'contact' | 'wishlist' | 'goal' | 'video',
  
  // ─── Sistema de Rutas (Hubs) ───
  scope: 'personal' | 'academic' | 'global',
  module: 'selfcare' | 'mindfulness' | 'vida-social' | 'fitness' |
          'data-science' | 'investigacion' | 'maestria' | 'lab' | 'idiomas',
  
  // ─── Contenido Base ───
  title: 'Título del entry',
  content: 'Contenido detallado',
  
  // ─── Estado ───
  completed: boolean,
  status: 'todo' | 'in-progress' | 'done' | 'ideas' | 'comprado' | 'entregado',
  priority: 'low' | 'medium' | 'high',
  
  // ─── Metadata Específica por Tipo ───
  metadata: {
    // SELFCARE
    category: 'skincare' | 'haircare' | 'gel-nail-polish',
    cycleId: string,
    lastDone: ISOString,
    
    // MINDFULNESS
    mood: emoji,
    contactId: 'jaquelina' | 'jose-carlos' | 'osvi',
    lastContactDate: ISOString,
    
    // VIDA SOCIAL
    photoUrl: string,
    location: string,
    city: string,
    recipient: string,
    estimatedPrice: number,
    isWishlist: boolean,
    
    // FITNESS
    goalId: string,
    progress: number, // 0-100
    youtubeId: string,
    
    // Común
    tags: string[],
    startTime: string,
    endTime: string,
    brand: string,
    notes: string
  },
  
  // ─── Timestamps ───
  createdAt: Timestamp,
  completedAt: Timestamp | null
}
```

---

## Widgets por Hub

| Hub | Widgets Especializados | Widgets Base |
|-----|----------------------|--------------|
| **Selfcare** | VirtualShelf, CyclicTracker | Tasks, Habits |
| **Mindfulness** | JournalTable, RelationshipRadar | Tasks, Habits |
| **Vida Social** | MemoryWall, WishlistKanban | Events, Tasks |
| **Fitness** | ProgressBars, MultimediaRepo | Habits, Tasks |
| **Académicos** | (Fase C) | Tasks, Habits, Events, Notes |

---

## CSS Classes de Layout

```css
.hub-widget          /* Widget base */
.hub-widget-wide   /* 2 columnas, min-height: 300px */
.hub-widget-tall   /* 2 filas */
.hub-widget-large  /* 2x2 grid */
```

---

*Documento generado para Fase B - Personal Hubs & Reusable Views*
