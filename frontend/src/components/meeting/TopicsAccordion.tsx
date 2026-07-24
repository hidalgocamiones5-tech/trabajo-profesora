import { useState } from 'react';
import type { Topic } from '../../types/meeting';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TopicsAccordionProps {
  topics: Topic[];
}

export function TopicsAccordion({ topics }: TopicsAccordionProps) {
  const [openTopicId, setOpenTopicId] = useState<string | null>(topics[0]?.id || null);

  const toggleTopic = (id: string) => {
    setOpenTopicId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-semibold text-slate-800">Temas de Discusión</h2>
      </div>
      
      <div className="divide-y divide-slate-100">
        {topics.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No se identificaron temas en esta reunión.
          </div>
        ) : (
          topics.map(topic => {
            const isOpen = openTopicId === topic.id;
            
            return (
              <div key={topic.id} className="group">
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className={`w-full flex items-center justify-between p-4 transition-colors ${
                    isOpen ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-semibold shrink-0 transition-colors ${
                      isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}>
                      {topic.number}
                    </div>
                    <span className={`font-medium ${isOpen ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {topic.title}
                    </span>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'
                    }`} 
                  />
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pl-16 pr-8 text-sm text-slate-600 bg-indigo-50/20 leading-relaxed border-t border-indigo-50/50">
                        {topic.summary}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
