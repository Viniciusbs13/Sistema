
import React from 'react';
import { Task, Note, ViewMode } from '../types';
import { CheckCircle2, Circle, Clock, ArrowRight, ListTodo, FileText, ChevronRight } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  notes: Note[];
  setView: (view: ViewMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, notes, setView }) => {
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date());
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Stats Card */}
      <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className="text-[140px] font-black text-teal-500 leading-none select-none">Ω</div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Progresso Geral</h2>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-6xl font-black text-white">{Math.round(progress)}%</span>
            <span className="text-zinc-500 mb-2 font-medium">da jornada concluída</span>
          </div>

          <div className="w-full h-3 bg-zinc-950 rounded-full mb-8 overflow-hidden">
            <div 
              className="h-full bg-teal-500 transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">Tarefas Totais</p>
              <p className="text-xl font-bold text-white">{totalTasks}</p>
            </div>
            <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">Concluídas</p>
              <p className="text-xl font-bold text-teal-500">{completedTasks}</p>
            </div>
            <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">Pendentes</p>
              <p className="text-xl font-bold text-zinc-300">{totalTasks - completedTasks}</p>
            </div>
            <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">Notas Wiki</p>
              <p className="text-xl font-bold text-purple-400">{notes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action / Day Card */}
      <div className="bg-teal-600 rounded-3xl p-8 flex flex-col justify-between text-white shadow-xl shadow-teal-900/20">
        <div>
          <h2 className="text-lg font-bold opacity-80 mb-2">{capitalize(today)}</h2>
          <p className="text-4xl font-black leading-tight">Foco em performance máxima.</p>
        </div>
        <button 
          onClick={() => setView('tasks')}
          className="mt-8 bg-black hover:bg-zinc-900 text-white w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          Ir para Atividades <ArrowRight size={20} />
        </button>
      </div>

      {/* Recent Activity Section */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="font-bold flex items-center gap-2">
            <ListTodo className="text-teal-500" size={18} /> Próximas Atividades
          </h3>
          <button onClick={() => setView('tasks')} className="text-xs text-teal-500 font-bold flex items-center gap-1 hover:underline">
            VER TODAS <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="space-y-2">
          {tasks.filter(t => t.status === 'todo').slice(0, 4).map(task => (
            <div key={task.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-900/60 transition-colors">
              <div className="flex items-center gap-3">
                <Circle size={18} className="text-zinc-600" />
                <span className="font-medium">{task.content}</span>
              </div>
              <span className="text-[10px] font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-400 uppercase">
                {task.day}
              </span>
            </div>
          ))}
          {tasks.filter(t => t.status === 'todo').length === 0 && (
            <div className="bg-zinc-900/20 border border-dashed border-zinc-800 p-8 rounded-2xl text-center text-zinc-500">
              Tudo limpo por aqui. Bom trabalho!
            </div>
          )}
        </div>
      </div>

      {/* Recent Notes Card */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="font-bold flex items-center gap-2">
            <FileText className="text-purple-500" size={18} /> Wiki Recente
          </h3>
          <button onClick={() => setView('notes')} className="text-xs text-purple-500 font-bold flex items-center gap-1 hover:underline">
            VER TODAS <ChevronRight size={14} />
          </button>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl divide-y divide-zinc-800 overflow-hidden">
          {notes.slice(0, 3).map(note => (
            <div key={note.id} className="p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors" onClick={() => setView('notes')}>
              <h4 className="font-semibold text-sm truncate">{note.title}</h4>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{note.content}</p>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-sm">
              Sem notas recentes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
