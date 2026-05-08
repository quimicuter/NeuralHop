import { useState, useEffect, useCallback } from 'react';
import { addEntry, updateEntry } from '../engine/EntryEngine';
import './GlobalAddModal.css';

// ============================================
// CONFIGURACIÓN CENTRALIZADA
// ============================================
const SCOPE_MODULES = {
  personal: ['selfcare', 'mindfulness', 'vida-social', 'fitness', 'foodie'],
  academico: ['data-science', 'investigacion', 'maestria', 'laboratorio', 'idiomas'],
  general: ['cumpleanos', 'finanzas', 'tramites']
};

export const MODULE_CONFIG = {
  'selfcare': { emoji: '🧘', label: 'Selfcare', allowsHabits: true },
  'mindfulness': { emoji: '🫂', label: 'Mindfulness', allowsHabits: true },
  'vida-social': { emoji: '👥', label: 'Vida Social', allowsHabits: false },
  'fitness': { emoji: '💪', label: 'Fitness', allowsHabits: true },
  'foodie': { emoji: '🍽️', label: 'Foodie', allowsHabits: false },
  'data-science': { emoji: '📊', label: 'Data Science', allowsHabits: false },
  'investigacion': { emoji: '🔬', label: 'Investigación', allowsHabits: true },
  'maestria': { emoji: '🎓', label: 'Maestría', allowsHabits: false },
  'laboratorio': { emoji: '🧪', label: 'Laboratorio', allowsHabits: false },
  'idiomas': { emoji: '🌍', label: 'Idiomas', allowsHabits: true },
  'cumpleanos': { emoji: '🎂', label: 'Cumpleaños', allowsHabits: false, isBirthday: true },
  'finanzas': { emoji: '💰', label: 'Finanzas', allowsHabits: false },
  'tramites': { emoji: '📋', label: 'Trámites', allowsHabits: false }
};

const SCOPE_LABELS = {
  personal: { emoji: '✨', label: 'Personal' },
  academico: { emoji: '🎓', label: 'Académico' },
  general: { emoji: '⚙️', label: 'General' }
};

const TYPE_CONFIG = {
  task: { color: 'pink', icon: '☑️', label: 'Tarea' },
  event: { color: 'purple', icon: '📅', label: 'Evento' },
  habit: { color: 'blue', icon: '🔁', label: 'Hábito' }
};

const PRIORITY_CONFIG = [
  { value: 'critical', label: 'Crítica', color: '#ef4444a2', emoji: '🔥' },
  { value: 'high', label: 'Alta', color: '#f974169c', emoji: '⚡' },
  { value: 'medium', label: 'Media', color: '#eab20873', emoji: '📌' },
  { value: 'low', label: 'Baja', color: '#22c55e7c', emoji: '🌱' }
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'annual', label: 'Anual' }
];

// ============================================
// COMPONENTE
// ============================================
const GlobalAddModal = ({ isOpen, onClose, onTaskAdded, preselectedType, editEntry }) => {
  // Estados del flujo de embudo
  const [scope, setScope] = useState('personal');
  const [module, setModule] = useState('selfcare');
  const [type, setType] = useState('task');
  
  // Estados del formulario
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [frequency, setFrequency] = useState('daily');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState(['']);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Campos exclusivos de Evento
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [eventRecurrence, setEventRecurrence] = useState('annual');

  // Wizard de cumpleaños
  const [birthdayName, setBirthdayName] = useState('');
  const [birthdayDate, setBirthdayDate] = useState('');
  const [hasParty, setHasParty] = useState(false);
  const [partyDate, setPartyDate] = useState('');
  const [partyTime, setPartyTime] = useState('');
  const [partyPlace, setPartyPlace] = useState('');
  
  // Estados UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accentColor, setAccentColor] = useState('rgba(236, 72, 153, 0.3)');

  // Resetear o poblar al abrir
  useEffect(() => {
    if (isOpen) {
      if (editEntry) {
        // Modo edición: poblar campos desde la entrada existente
        const editType = editEntry.type || 'task';
        setScope(editEntry.scope || 'personal');
        setModule(editEntry.module || 'selfcare');
        setType(editType);
        updateAccentColor(editType);
        setTitle(editEntry.title || '');
        setPriority(editEntry.priority || 'medium');
        setFrequency(editEntry.frequency || 'daily');
        setNotes(editEntry.notes || '');
        setSubtasks(
          editEntry.subtasks && editEntry.subtasks.length > 0
            ? editEntry.subtasks.map(s => (typeof s === 'string' ? s : s.text))
            : ['']
        );
        setDate(editEntry.date || '');
        setTime(editEntry.time || '');
        setEndDate(editEntry.endDate || '');
        setEndTime(editEntry.endTime || '');
        setLocation(editEntry.location || '');
        setIsRecurring(editEntry.recurrence ? true : false);
        setEventRecurrence(editEntry.recurrence || 'annual');
        setBirthdayName(editEntry.birthdayName || '');
        setBirthdayDate(editEntry.birthDate || '');
        setHasParty(false);
        setPartyDate('');
        setPartyTime('');
        setPartyPlace('');
        setIsSubmitting(false);
      } else {
        // Modo creación: resetear
        const initialType = preselectedType === 'event' ? 'event' : 'task';
        setScope('personal');
        setModule('selfcare');
        setType(initialType);
        updateAccentColor(initialType);
        setTitle('');
        setPriority('medium');
        setFrequency('daily');
        setNotes('');
        setSubtasks(['']);
        setDate('');
        setTime('');
        setEndDate('');
        setEndTime('');
        setLocation('');
        setIsRecurring(false);
        setEventRecurrence('annual');
        setBirthdayName('');
        setBirthdayDate('');
        setHasParty(false);
        setPartyDate('');
        setPartyTime('');
        setPartyPlace('');
        setIsSubmitting(false);
        updateAccentColor('task');
      }
    }
  }, [isOpen, editEntry]);

  // Actualizar color según tipo
  const updateAccentColor = useCallback((newType) => {
    const colors = {
      task: 'rgba(236, 72, 153, 0.3)',    // Pink
      event: 'rgba(147, 51, 234, 0.3)',     // Purple
      habit: 'rgba(59, 130, 246, 0.3)'      // Blue
    };
    setAccentColor(colors[newType] || colors.task);
  }, []);

  // Cambiar tipo
  const handleTypeChange = (newType) => {
    setType(newType);
    updateAccentColor(newType);
  };

  // Cambiar ámbito (resetea módulo)
  const handleScopeChange = (newScope) => {
    setScope(newScope);
    const firstModule = SCOPE_MODULES[newScope][0];
    setModule(firstModule);
    
    // Resetear tipo si no permite hábitos
    const modConfig = MODULE_CONFIG[firstModule];
    if (type === 'habit' && !modConfig.allowsHabits) {
      setType('task');
      updateAccentColor('task');
    }
  };

  // Cambiar módulo
  const handleModuleChange = (newModule) => {
    setModule(newModule);
    const modConfig = MODULE_CONFIG[newModule];
    if (type === 'habit' && !modConfig.allowsHabits) {
      setType('task');
      updateAccentColor('task');
    }
  };

  // Agregar subtask
  const addSubtask = () => setSubtasks([...subtasks, '']);
  const updateSubtask = (idx, val) => {
    const updated = [...subtasks];
    updated[idx] = val;
    setSubtasks(updated);
  };

  // Guardar
  const handleSave = async () => {
    if (!editEntry && !title.trim() && !MODULE_CONFIG[module]?.isBirthday) return;
    if (editEntry && !title.trim()) return;

    setIsSubmitting(true);

    try {
      if (editEntry) {
        // Modo edición: actualizar entrada existente
        const data = {
          title: title.trim(),
          type,
          scope,
          module,
          priority,
          notes: notes.trim()
        };

        if (type === 'habit') {
          data.frequency = frequency;
        } else {
          data.frequency = null;
        }
        if (type === 'event' || date) {
          data.date = date;
          if (time) data.time = time;
        } else {
          data.date = null;
          data.time = null;
        }
        if (type === 'event') {
          data.endDate = endDate || null;
          data.endTime = endTime || null;
          data.location = location.trim() || null;
          data.recurrence = isRecurring ? eventRecurrence : null;
        }
        if (subtasks.filter(s => s.trim()).length > 0) {
          data.subtasks = subtasks.filter(s => s.trim()).map(s => ({ text: s, done: false }));
        } else {
          data.subtasks = [];
        }

        await updateEntry(editEntry.id, data);
      } else {
        // Modo creación
        // Wizard de cumpleaños - crea 2 registros
        if (MODULE_CONFIG[module]?.isBirthday && birthdayName && birthdayDate) {
          // Extraer año de nacimiento para metadata
          const birthYear = new Date(birthdayDate + 'T12:00:00').getFullYear();

          // 1. Recordatorio anual del cumpleaños
          await addEntry({
            title: `🎂 Cumpleaños de ${birthdayName}`,
            type: 'event',
            scope: 'general',
            module: 'cumpleanos',
            date: birthdayDate,
            priority: 'high',
            notes: `Cumpleaños de ${birthdayName}`,
            status: 'active',
            isBirthdayReminder: true,
            recurrence: 'annual',
            birthdayName,
            birthDate: birthdayDate,
            birthYear: birthYear
          });

          // 2. Evento de fiesta si aplica
          if (hasParty && partyDate) {
            await addEntry({
              title: `🎉 Fiesta de ${birthdayName}`,
              type: 'event',
              scope: 'personal',
              module: 'vida-social',
              date: partyDate,
              time: partyTime || '20:00',
              priority: 'medium',
              notes: `Celebración de cumpleaños de ${birthdayName}${partyPlace ? ` en ${partyPlace}` : ''}`,
              status: 'active',
              isPartyEvent: true,
              birthdayName
            });
          }
        } else {
          // Registro normal
          const data = {
            title: title.trim(),
            type,
            scope,
            module,
            priority,
            notes: notes.trim(),
            status: 'active'
          };

          if (type === 'habit') {
            data.frequency = frequency;
          }
          if (type === 'event' || date) {
            data.date = date;
            if (time) data.time = time;
          }
          if (type === 'event') {
            if (endDate) data.endDate = endDate;
            if (endTime) data.endTime = endTime;
            if (location.trim()) data.location = location.trim();
            if (isRecurring) data.recurrence = eventRecurrence;
          }
          if (subtasks.filter(s => s.trim()).length > 0) {
            data.subtasks = subtasks.filter(s => s.trim()).map(s => ({ text: s, done: false }));
          }

          await addEntry(data);
        }
      }

      onTaskAdded?.();
      onClose();
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentModules = SCOPE_MODULES[scope] || [];
  const currentModuleConfig = MODULE_CONFIG[module] || {};
  const availableTypes = ['task', 'event', ...(currentModuleConfig.allowsHabits ? ['habit'] : [])];
  const isBirthday = currentModuleConfig.isBirthday;

  return (
    <div className="gam-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gam-modal">
        {/* HEADER FIJO */}
        <div className="gam-header-fixed">
          <h2 className="gam-title">{editEntry ? 'Editar Entrada' : 'Nueva Entrada'}</h2>
        </div>

        {/* CUERPO CON SCROLL */}
        <div className="gam-body">
          {/* COLUMNA IZQUIERDA - NAVEGACIÓN */}
          <div className="gam-col-left">
            <div className="gam-scope-nav">
              {Object.entries(SCOPE_LABELS).map(([key, { emoji, label }]) => (
                <button
                  key={key}
                  className={`gam-pill-vertical ${scope === key ? 'active' : ''}`}
                  onClick={() => handleScopeChange(key)}
                >
                  <span className="gam-pill-emoji">{emoji}</span>
                  <span className="gam-pill-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA - CONTENIDO */}
          <div className="gam-col-right">
            {/* MÓDULOS - FILA HORIZONTAL DE CÍRCULOS */}
            <div className="gam-modules-row">
              {currentModules.map((modKey) => {
                const mod = MODULE_CONFIG[modKey];
                return (
                  <div
                    key={modKey}
                    className={`gam-module-item ${module === modKey ? 'selected' : ''}`}
                    onClick={() => handleModuleChange(modKey)}
                  >
                    <div className="gam-module-circle">{mod.emoji}</div>
                    <span className="gam-module-label">{mod.label}</span>
                  </div>
                );
              })}
            </div>

            {/* CONTENIDO DINÁMICO SEGÚN MÓDULO */}
            {isBirthday ? (
              /* TARJETA DE CUMPLEAÑOS SIN TABS */
              <div className="gam-birthday-card">
                <div className="gam-card-header">
                  <span className="gam-card-icon">🎂</span>
                  <span className="gam-card-title">Registro de Cumpleaños</span>
                </div>
                
                <div className="gam-card-body">
                  <div className="gam-field-compact">
                    <label className="gam-label-compact">Nombre del cumpleañero/a</label>
                    <input
                      type="text"
                      className="gam-input-compact"
                      value={birthdayName}
                      onChange={(e) => setBirthdayName(e.target.value)}
                      placeholder="Ej: María"
                    />
                  </div>
                  
                  <div className="gam-field-row-compact">
                    <div className="gam-field-compact">
                      <label className="gam-label-compact">Fecha de nacimiento</label>
                      <input
                        type="date"
                        className="gam-input-compact"
                        value={birthdayDate}
                        onChange={(e) => setBirthdayDate(e.target.value)}
                      />
                    </div>
                    
                    <label className="gam-toggle-compact">
                      <input
                        type="checkbox"
                        checked={hasParty}
                        onChange={(e) => setHasParty(e.target.checked)}
                      />
                      <span className="gam-toggle-label">¿Habrá fiesta? 🎉</span>
                    </label>
                  </div>

                  {/* Campos de fiesta - aparecen cuando hasParty es true */}
                  {hasParty && (
                    <div className="gam-party-fields">
                      <div className="gam-party-divider">
                        <span>Datos de la fiesta</span>
                      </div>
                      
                      <div className="gam-field-row-compact">
                        <div className="gam-field-compact">
                          <label className="gam-label-compact">Fecha de la fiesta</label>
                          <input
                            type="date"
                            className="gam-input-compact"
                            value={partyDate}
                            onChange={(e) => setPartyDate(e.target.value)}
                          />
                        </div>
                        
                        <div className="gam-field-compact">
                          <label className="gam-label-compact">Hora</label>
                          <input
                            type="time"
                            className="gam-input-compact"
                            value={partyTime}
                            onChange={(e) => setPartyTime(e.target.value)}
                            placeholder="20:00"
                          />
                        </div>
                      </div>
                      
                      <div className="gam-field-compact">
                        <label className="gam-label-compact">Lugar (opcional)</label>
                        <input
                          type="text"
                          className="gam-input-compact"
                          value={partyPlace}
                          onChange={(e) => setPartyPlace(e.target.value)}
                          placeholder="Ej: Casa de María, Salón..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* FORMULARIO NORMAL CON TABS */
              <>
                {/* TABS DE TIPO */}
                <div className="gam-tabs-fused">
                  {availableTypes.map((t) => (
                    <button
                      key={t}
                      className={`gam-tab-fused gam-tab-${t} ${type === t ? 'active' : ''}`}
                      onClick={() => handleTypeChange(t)}
                    >
                      {TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}
                    </button>
                  ))}
                </div>

                {/* CONTENT CARD */}
                <div className="gam-content-fused" style={{ '--accent': accentColor }}>
                  {/* TÍTULO */}
                  <div className="gam-field-compact">
                    <input
                      type="text"
                      className="gam-input-title-compact"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título..."
                      autoFocus
                    />
                  </div>

                  {type === 'event' ? (
                    /* FORMULARIO EXCLUSIVO PARA EVENTOS */
                    <>
                      {/* Fecha Inicio + Fecha Fin */}
                      <div className="gam-field-row-compact">
                        <div className="gam-field-compact">
                          <label className="gam-label-compact">Fecha inicio</label>
                          <input
                            type="date"
                            className="gam-input-compact"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                          />
                        </div>
                        <div className="gam-field-compact">
                          <label className="gam-label-compact">Fecha fin</label>
                          <input
                            type="date"
                            className="gam-input-compact"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Hora Inicio + Hora Fin */}
                      <div className="gam-field-row-compact">
                        <div className="gam-field-compact">
                          <label className="gam-label-compact">Hora inicio</label>
                          <input
                            type="time"
                            className="gam-input-compact"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                          />
                        </div>
                        <div className="gam-field-compact">
                          <label className="gam-label-compact">Hora fin</label>
                          <input
                            type="time"
                            className="gam-input-compact"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Ubicación / Link */}
                      <div className="gam-field-compact">
                        <label className="gam-label-compact">Ubicación o Link</label>
                        <input
                          type="text"
                          className="gam-input-compact"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Ej: Casa de María, Zoom link..."
                        />
                      </div>

                      {/* Recurrencia */}
                      <div className="gam-field-row-compact">
                        <label className="gam-toggle-compact">
                          <input
                            type="checkbox"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                          />
                          <span className="gam-toggle-label">Evento recurrente 🔁</span>
                        </label>
                        {isRecurring && (
                          <div className="gam-field-compact">
                            <select
                              className="gam-select-compact"
                              value={eventRecurrence}
                              onChange={(e) => setEventRecurrence(e.target.value)}
                            >
                              {FREQUENCY_OPTIONS.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Notas */}
                      <div className="gam-field-compact">
                        <label className="gam-label-compact">Notas</label>
                        <textarea
                          className="gam-textarea-compact"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Notas adicionales..."
                          rows={3}
                        />
                      </div>
                    </>
                  ) : (
                    /* FORMULARIO PARA TAREAS Y HÁBITOS */
                    <>
                      {/* PRIORIDAD/FRECUENCIA + FECHA */}
                      <div className="gam-field-row-compact">
                        {type === 'habit' ? (
                          <div className="gam-field-compact">
                            <label className="gam-label-compact">Frecuencia</label>
                            <select
                              className="gam-select-compact"
                              value={frequency}
                              onChange={(e) => setFrequency(e.target.value)}
                            >
                              {FREQUENCY_OPTIONS.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="gam-field-compact">
                            <label className="gam-label-compact">Prioridad</label>
                            <select
                              className="gam-select-compact"
                              value={priority}
                              onChange={(e) => setPriority(e.target.value)}
                            >
                              {PRIORITY_CONFIG.map((p) => (
                                <option key={p.value} value={p.value}>
                                  {p.emoji} {p.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="gam-field-compact">
                          <label className="gam-label-compact">Fecha</label>
                          <input
                            type="date"
                            className="gam-input-compact"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* SUBTAREAS + NOTAS EN 2 COL */}
                      <div className="gam-two-col-compact">
                        <div className="gam-col-compact">
                          <label className="gam-label-compact">Subtareas</label>
                          <div className="gam-subtasks-compact">
                            {subtasks.map((st, idx) => (
                              <div key={idx} className="gam-subtask-item-compact">
                                <input type="checkbox" disabled className="gam-checkbox-compact" />
                                <input
                                  type="text"
                                  className="gam-input-subtask-compact"
                                  value={st}
                                  onChange={(e) => updateSubtask(idx, e.target.value)}
                                  placeholder="Subtarea..."
                                />
                              </div>
                            ))}
                            <button className="gam-btn-add-sub-compact" onClick={addSubtask}>
                              + Agregar
                            </button>
                          </div>
                        </div>

                        <div className="gam-col-compact">
                          <label className="gam-label-compact">Notas</label>
                          <textarea
                            className="gam-textarea-compact"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas adicionales..."
                            rows={4}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* FOOTER FIJO */}
        <div className="gam-footer-fixed">
          <button className="gam-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button
            className="gam-btn-save"
            onClick={handleSave}
            disabled={isSubmitting || (!title.trim() && !isBirthday)}
            style={{ 
              opacity: (isSubmitting || (!title.trim() && !isBirthday)) ? 0.5 : 1,
              background: isBirthday ? '#ec4899' :
                         TYPE_CONFIG[type]?.color === 'pink' ? '#ec4899' : 
                         TYPE_CONFIG[type]?.color === 'purple' ? '#9333ea' : '#3b82f6'
            }}
          >
            {isSubmitting ? '⏳ Guardando...' : '✓ Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalAddModal;