# Fase C: Especificaciones de Hubs Académicos

## Resumen de Implementación

### Corrección Crítica de Datos ✓
- **ELIMINADO:** "Osvi" de RelationshipRadar seed data
- **REEMPLAZADO POR:** "Amigo 1"

---

## ACADEMIC HUBS

### 1. DATA SCIENCE Hub (`/hub/academic/data-science`)

#### CourseProgress Widget
**Entry Type:** `course-module`  
**Timeline:** 3 meses con milestones visuales

```javascript
{
  type: 'course-module',
  title: 'Módulo de curso',
  scope: 'academic',
  module: 'data-science',
  completed: boolean,
  metadata: {
    weekNumber: 1, // 1-12
    topic: 'Tema del módulo'
  }
}
```

**Features:**
- Barra de progreso animada
- 3 milestones: Mes 1 (Fundamentos), Mes 2 (Análisis), Mes 3 (Proyecto)
- Estadísticas: % completado, módulos hechos, pendientes

#### CodeSnippet Widget
**Entry Type:** `code`  
**Lenguaje:** Python (syntax highlighting)

```javascript
{
  type: 'code',
  title: 'Nombre del snippet',
  content: 'código opcional',
  scope: 'academic',
  module: 'data-science',
  metadata: {
    filename: 'script.py',
    language: 'python',
    code: 'import pandas as pd...'
  }
}
```

**Features:**
- Syntax highlighting básico para Python
- Temas oscuro estilo VS Code
- Lista de archivos con snippets

---

### 2. INVESTIGACIÓN Hub (`/hub/academic/investigacion`)

#### PaperKanban Widget
**Entry Type:** `paper`  
**Columnas:** Ideas → Draft → Review → Submitted → Published

**Tags Estrictos (Investigación):**
- `smart-materials` → Smart Materials (azul)
- `biomass-conversion` → Biomass Conversion (rosa)
- `metabolic-diseases` → Metabolic Diseases (rojo)

```javascript
{
  type: 'paper',
  title: 'Título del paper',
  status: 'idea' | 'draft' | 'review' | 'submitted' | 'published',
  scope: 'academic',
  module: 'investigacion',
  metadata: {
    journal: 'Nombre de revista',
    tags: ['smart-materials'],
    deadline: '2024-06-15'
  }
}
```

#### NetworkContact Widget
**Entry Type:** `research-contact`  
**Seed Data Estricto:**

| ID | Nombre | Institución | Rol | Emoji |
|----|--------|-------------|-----|-------|
| `dr-niveen-khashab` | Dr. Niveen Khashab | KAUST | Principal Investigator | 🔬 |
| `carlos-saul-osorio` | Carlos Saul Osorio-González | Research Lab | Collaborator | 🧪 |

**NOTA:** Solo estos 2 contactos. Sin "Osvi" ni otros nombres.

```javascript
{
  type: 'research-contact',
  metadata: {
    contactId: 'dr-niveen-khashab',
    lastInteraction: '2024-01-15',
    notes: 'Notas de contacto'
  }
}
```

---

### 3. MAESTRÍA Hub (`/hub/academic/maestria`)

#### ApplicationTracker Widget
**Entry Type:** `application`  
**Seed Data Preconfigurada:**

| Programa | Laboratorio | Estado | Deadline |
|----------|-------------|--------|----------|
| KAUST VSRP 2026 | Smart Hybrid Materials Laboratory | draft | 2026-02-15 |

```javascript
{
  type: 'application',
  title: 'KAUST VSRP 2026',
  status: 'todo' | 'in-progress' | 'done' | 'submitted',
  scope: 'academic',
  module: 'maestria',
  metadata: {
    program: 'KAUST VSRP 2026',
    laboratory: 'Smart Hybrid Materials Laboratory',
    deadline: '2026-02-15',
    progress: 25
  }
}
```

**Features:**
- Tabla con columna de progreso visual
- Badges de estado con colores

#### TitulacionChecklist Widget
**Entry Type:** `titulacion`  
**Institución:** Universidad de Guanajuato

**Requisitos Obligatorios:**
| ID | Requisito | Emoji |
|----|-----------|-------|
| `tesis` | Tesis/Proyecto de titulación | 📄 |
| `acto` | Acto protocolario | 🎓 |
| `liberacion` | Liberación de servicio social | 🤝 |
| `certificado` | Certificado de idioma | 🗣️ |
| `credits` | 100% créditos aprobados | ✅ |
| `constancia` | Constancia de no adeudo | 📋 |

```javascript
{
  type: 'titulacion',
  title: 'Requisito completado',
  completed: true,
  scope: 'academic',
  module: 'maestria',
  metadata: {
    requirementId: 'tesis'
  }
}
```

---

### 4. LAB MANAGER Hub (`/hub/academic/lab`)

#### MultiSubjectPanel Widget
**Entry Type:** `experiment`  
**Pestañas (Subjects):**

| ID | Materia | Emoji |
|----|---------|-------|
| `experimentacion` | Experimentación en Ingenierías | ⚙️ |
| `quimica-organica` | Química Orgánica | 🧪 |
| `quimica-2` | Química 2 | ⚗️ |

```javascript
{
  type: 'experiment',
  title: 'Nombre del experimento',
  scope: 'academic',
  module: 'lab',
  metadata: {
    subject: 'experimentacion', // una de las 3 opciones
    date: '2024-01-15'
  }
}
```

**Features:**
- Tabs con colores diferenciados
- Contador de entradas por materia

#### InventoryTable Widget
**Entry Type:** `inventory`  
**Categorías:**

| ID | Categoría | Emoji |
|----|-----------|-------|
| `reactivos` | Reactivos | 🧪 |
| `material-roto` | Material Roto | 🔧 |
| `protocolos` | Protocolos | 📋 |

**Estados:**
- `available` → Disponible (verde)
- `low` → Bajo stock (naranja)
- `out` → Agotado (rojo)
- `broken` → Dañado (morado)

```javascript
{
  type: 'inventory',
  title: 'Nombre del item',
  scope: 'academic',
  module: 'lab',
  metadata: {
    category: 'reactivos',
    quantity: 5,
    unit: 'ml',
    status: 'available',
    lastUpdated: '2024-01-15'
  }
}
```

---

### 5. IDIOMAS Hub (`/hub/academic/idiomas`)

#### MultiLanguageDB Widget
**Entry Type:** `vocabulary`  
**Filtros de Idiomas:**

| ID | Idioma | Bandera |
|----|--------|---------|
| `frances` | Français | 🇫🇷 |
| `aleman` | Deutsch | 🇩🇪 |
| `italiano` | Italiano | 🇮🇹 |
| `japones` | 日本語 | 🇯🇵 |
| `toefl` | TOEFL | 🇺🇸 |

```javascript
{
  type: 'vocabulary',
  title: 'Bonjour',
  completed: false,
  scope: 'academic',
  module: 'idiomas',
  metadata: {
    language: 'frances',
    translation: 'Hola (Francés)',
    tags: ['saludos']
  }
}
```

**Features:**
- Stats por idioma: entradas, dominadas, % progreso
- Lista de vocabulario con estado de dominio

#### FlashcardWidget
**Entry Type:** `flashcard`  
**Features:**
- Flip animation 3D
- Navegación anterior/siguiente
- Botón "Dominado" para marcar progreso

```javascript
{
  type: 'flashcard',
  title: 'Guten Tag',
  completed: false,
  scope: 'academic',
  module: 'idiomas',
  metadata: {
    translation: 'Buenos días (Alemán)',
    language: 'aleman',
    flashcardData: true
  }
}
```

---

## Widgets por Academic Hub

| Hub | Widgets Especializados | Widgets Base |
|-----|----------------------|--------------|
| **Data Science** | CourseProgress, CodeSnippet | Tasks, Habits |
| **Investigación** | PaperKanban, NetworkContact | Tasks, Habits |
| **Maestría** | ApplicationTracker, TitulacionChecklist | Tasks, Habits |
| **Lab** | MultiSubjectPanel, InventoryTable | Tasks, Habits |
| **Idiomas** | MultiLanguageDB, FlashcardWidget | Tasks, Habits |

---

## Archivos Creados Fase C

### Nuevos Widgets:
```
src/widgets/
├── CourseProgress.jsx + .css
├── CodeSnippet.jsx + .css
├── PaperKanban.jsx + .css
├── NetworkContact.jsx + .css
├── ApplicationTracker.jsx + .css
├── TitulacionChecklist.jsx + .css
├── MultiSubjectPanel.jsx + .css
├── InventoryTable.jsx + .css
├── MultiLanguageDB.jsx + .css
└── FlashcardWidget.jsx + .css
```

### Actualizados:
- `src/hubs/HubShell.jsx` - Configuración completa de widgets
- `src/widgets/RelationshipRadar.jsx` - Limpieza de datos

---

## Build Status
✅ **Compilación exitosa** - 101 módulos transformados

---

*Fase C Completa - NeuralHop Academic Hubs*
