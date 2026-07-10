import { Calendar, Clock, MessageSquare, Trash2, Plus } from 'lucide-react';
import type { Meeting } from '../../types/meeting';

interface SidebarProps {
  meetings: Meeting[];
  activeMeetingId: string | null;
  onSelectMeeting: (id: string) => void;
  onDeleteMeeting: (id: string) => void;
}

export function Sidebar({ meetings, activeMeetingId, onSelectMeeting, onDeleteMeeting }: SidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-slate-200 h-screen flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-200">
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          Nueva Transcripción
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Historial de Reuniones</h2>
        
        {meetings.length === 0 ? (
          <div className="text-center p-4 text-slate-500 text-sm">
            No hay reuniones guardadas.
          </div>
        ) : (
          meetings.map(meeting => {
            const isActive = meeting.id === activeMeetingId;
            return (
              <div 
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting.id)}
                className={`group cursor-pointer rounded-xl p-3 border transition-all ${
                  isActive 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className={`font-semibold text-sm line-clamp-2 ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                    {meeting.title}
                  </h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMeeting(meeting.id);
                    }}
                    className={`p-1 rounded-md transition-colors ${
                      isActive ? 'text-blue-400 hover:text-red-600 hover:bg-blue-100' : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-slate-200'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{meeting.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{meeting.duration}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {meeting.participants.length} Participantes
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <MessageSquare className="w-3 h-3" />
                    {meeting.topics.length} Temas
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
