import { useState } from 'react';
import type { Task } from '../../types/meeting';
import { CheckCircle2, Circle, Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TasksBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onDeleteTask: (id: string) => void;
}

export function TasksBoard({ tasks, onUpdateTask, onAddTask, onDeleteTask }: TasksBoardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignee: '', priority: 'media' as const, dueDate: '' });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-200';
      case 'media': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'baja': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleAdd = () => {
    if (!newTask.title.trim()) return;
    onAddTask({
      ...newTask,
      completed: false,
    });
    setNewTask({ title: '', assignee: '', priority: 'media', dueDate: '' });
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Tareas y Compromisos</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-slate-200 bg-blue-50/50"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                type="text" 
                placeholder="Título de la tarea" 
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                className="md:col-span-4 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input 
                type="text" 
                placeholder="Responsable" 
                value={newTask.assignee}
                onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <select 
                value={newTask.priority}
                onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="alta">Prioridad Alta</option>
                <option value="media">Prioridad Media</option>
                <option value="baja">Prioridad Baja</option>
              </select>
              <input 
                type="date" 
                value={newTask.dueDate}
                onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="flex items-center gap-2">
                <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Guardar</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No hay tareas registradas para esta reunión.
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
                  className={`transition-colors ${task.completed ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-blue-500'}`}
                >
                  {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                <div>
                  <p className={`font-medium text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="font-medium">{task.assignee}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.dueDate}</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
