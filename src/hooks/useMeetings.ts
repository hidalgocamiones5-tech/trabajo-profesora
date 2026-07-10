import { useState, useEffect } from 'react';
import type { Meeting } from '../types/meeting';

// Sample data for the first run
const initialMeeting: Meeting = {
  id: 'm1',
  title: 'Revisión Q2 - Estrategia de Producto',
  date: '2026-07-10',
  duration: '45 min',
  participants: ['Felipe Sanchez', 'Marco Beltrán', 'Ana García'],
  strategicDecisions: [
    'Migrar la base de datos a PostgreSQL antes de Q3.',
    'Contratar 2 nuevos ingenieros Frontend.',
    'Posponer el lanzamiento de la App móvil hasta 2027.'
  ],
  tasks: [
    { id: 't1', title: 'Preparar cotizaciones de AWS', assignee: 'Marco Beltrán', priority: 'alta', dueDate: '2026-07-15', completed: false },
    { id: 't2', title: 'Entrevistas candidatos Frontend', assignee: 'Ana García', priority: 'media', dueDate: '2026-07-20', completed: true }
  ],
  topics: [
    { id: 'top1', number: 1, title: 'Revisión de métricas Q1', summary: 'Se discutió el crecimiento del 15% en MAU y la baja retención en la semana 4.' },
    { id: 'top2', number: 2, title: 'Hoja de ruta Q2', summary: 'Foco principal en estabilidad del backend y reducción de deuda técnica.' }
  ],
  transcript: [
    { id: 'tr1', speaker: 'Felipe Sanchez', timestamp: '00:00', text: 'Buenos días a todos, empecemos con la revisión de métricas.' },
    { id: 'tr2', speaker: 'Ana García', timestamp: '00:15', text: 'Claro Felipe. Hemos visto un crecimiento sostenido, pero debemos preocuparnos por la retención a largo plazo. Necesitamos enfocar Q2 en estabilidad.' },
    { id: 'tr3', speaker: 'Marco Beltrán', timestamp: '00:45', text: 'Estoy de acuerdo. Y para lograr esa estabilidad, la migración a PostgreSQL es prioritaria. Podría encargarme de revisar los costos.' }
  ]
};

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('meeting_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [initialMeeting];
      }
    }
    return [initialMeeting];
  });

  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(meetings[0]?.id || null);

  useEffect(() => {
    localStorage.setItem('meeting_history', JSON.stringify(meetings));
  }, [meetings]);

  const addMeeting = (meeting: Meeting) => {
    setMeetings(prev => [meeting, ...prev]);
    setActiveMeetingId(meeting.id);
  };

  const deleteMeeting = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reunión del historial? Esta acción no se puede deshacer.')) {
      setMeetings(prev => {
        const filtered = prev.filter(m => m.id !== id);
        if (activeMeetingId === id) {
          setActiveMeetingId(filtered[0]?.id || null);
        }
        return filtered;
      });
    }
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const activeMeeting = meetings.find(m => m.id === activeMeetingId) || null;

  return {
    meetings,
    activeMeetingId,
    setActiveMeetingId,
    activeMeeting,
    addMeeting,
    deleteMeeting,
    updateMeeting
  };
}
