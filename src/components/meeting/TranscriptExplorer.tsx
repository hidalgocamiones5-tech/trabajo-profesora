import { useState } from 'react';
import type { TranscriptSnippet } from '../../types/meeting';
import { Search, Copy, Check } from 'lucide-react';

interface TranscriptExplorerProps {
  transcript: TranscriptSnippet[];
}

export function TranscriptExplorer({ transcript }: TranscriptExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = transcript.map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={index} className="bg-yellow-300 text-slate-900 rounded-sm px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      {/* Header & Controls */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Transcripción Completa</h2>
          <p className="text-xs text-slate-500 mt-0.5">Generada por Gemini AI</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en el texto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
              copied 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado!' : 'Copiar todo'}
          </button>
        </div>
      </div>

      {/* Transcript Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {transcript.map(snippet => {
          // Si hay búsqueda y el texto no coincide, podemos aplicar opacidad o filtrarlo
          // Aquí optaremos por mostrar todo pero resaltar, y si no coincide nada, bajamos opacidad (opcional)
          const matchesSearch = searchTerm && snippet.text.toLowerCase().includes(searchTerm.toLowerCase());
          const isFaded = searchTerm && !matchesSearch;

          return (
            <div key={snippet.id} className={`flex gap-4 transition-opacity duration-300 ${isFaded ? 'opacity-40' : 'opacity-100'}`}>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(snippet.speaker)}`}>
                  {getInitials(snippet.speaker)}
                </div>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-4 border border-slate-100">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-slate-800 text-sm">{snippet.speaker}</span>
                  <span className="text-xs text-slate-400 font-mono">{snippet.timestamp}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {highlightText(snippet.text, searchTerm)}
                </p>
              </div>
            </div>
          );
        })}
        {transcript.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            No hay transcripción disponible.
          </div>
        )}
      </div>
    </div>
  );
}
