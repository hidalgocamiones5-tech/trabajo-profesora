import { Users, Target, BrainCircuit, Sparkles } from 'lucide-react';
import type { Meeting } from '../types/meeting';

interface MeetingDashboardProps {
  meeting: Meeting;
}

export function MeetingDashboard({ meeting }: MeetingDashboardProps) {
  // Función para obtener iniciales y color aleatorio
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      {/* AI Summary - Placeholder */}
      <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 shadow-md border border-indigo-800 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BrainCircuit className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <h2 className="text-lg font-semibold text-indigo-50">Resumen Ejecutivo IA</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3">
              <p className="text-indigo-100 font-medium tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                PRÓXIMAMENTE
              </p>
            </div>
            <p className="text-indigo-200 text-sm mt-4 text-center max-w-sm">
              Estamos integrando el motor de Gemini AI para generar síntesis automáticas de tus reuniones.
            </p>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Participantes</h2>
        </div>
        <div className="space-y-3">
          {meeting.participants.map((participant, index) => (
            <div key={index} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm ${getAvatarColor(participant)}`}>
                {getInitials(participant)}
              </div>
              <span className="font-medium text-slate-700">{participant}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Decisions */}
      <div className="md:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-800">Decisiones Estratégicas</h2>
        </div>
        <ul className="space-y-3">
          {meeting.strategicDecisions.map((decision, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              <p className="text-slate-700 leading-relaxed">{decision}</p>
            </li>
          ))}
          {meeting.strategicDecisions.length === 0 && (
            <li className="text-slate-500 italic text-sm">No se registraron decisiones estratégicas.</li>
          )}
        </ul>
      </div>

    </div>
  );
}
