
import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Sparkles, BrainCircuit, Tag, Repeat, User as UserIcon, CheckSquare } from 'lucide-react';
import { Task, TaskStatus, Sector, Role, User } from '../types';
import { generateWeeklySubtasks } from '../services/geminiService';

interface TaskBoardProps {
  tasks: Task[];
  addTask: (content: string, day: string, sector: Sector, assignedTo: string, isRecurring?: boolean) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  userRole: Role;
  users: User[];
  currentUserId: string;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, addTask, updateTaskStatus, deleteTask, userRole, users, currentUserId }) => {
  const [activeDay, setActiveDay] = useState<string>(DAYS[0]);
  const [inputVal, setInputVal] = useState('');
  const [targetSector, setTargetSector] = useState<Sector>('general');
  const [assignedTo, setAssignedTo] = useState<string>(currentUserId);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    addTask(inputVal, activeDay, targetSector, assignedTo);
    setInputVal('');
  };

  const getSectorStyle = (sector: Sector) => {
    switch (sector) {
      case 'traffic': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'editing': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-teal-400 bg-teal-400/10 border-teal-400/20';
    }
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Desconhecido';

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="text-teal-500" size={20} />
            <h2 className="text-lg font-semibold">Nova Atividade</h2>
          </div>
          
          {userRole === 'admin' && (
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-600 font-bold uppercase">Delegar Para</span>
                <select 
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs p-1.5 focus:outline-none focus:border-teal-500"
                >
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-600 font-bold uppercase">Setor</span>
                <div className="flex gap-1">
                  {(['general', 'traffic', 'editing'] as Sector[]).map(s => (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => setTargetSector(s)}
                      className={`text-[9px] px-2 py-1.5 rounded border transition-all uppercase font-bold ${targetSector === s ? 'bg-teal-500 text-black border-teal-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAddTask} className="flex gap-2">
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Descreva a atividade..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
          />
          <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95">
            <Plus size={18} /> Criar
          </button>
        </form>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-all text-sm ${activeDay === day ? 'bg-teal-500 text-black font-bold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {tasks.filter(t => t.day === activeDay).length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl text-zinc-600 italic">
            Nenhuma atividade para {activeDay}.
          </div>
        ) : (
          tasks.filter(t => t.day === activeDay).map(task => (
            <div key={task.id} className={`flex items-center justify-between p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl group transition-all ${task.status === 'done' ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')} 
                  className={`transition-colors ${task.status === 'done' ? 'text-teal-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  {task.status === 'done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <div className="flex flex-col">
                  <span className={`text-sm ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                    {task.content}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-[8px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded border ${getSectorStyle(task.sector)}`}>
                      <Tag size={8} /> {task.sector}
                    </span>
                    <span className="text-[8px] font-black text-zinc-400 uppercase flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                      <UserIcon size={8} /> {getUserName(task.assignedTo)}
                    </span>
                    {task.isRecurring && (
                      <span className="text-[8px] font-black text-purple-400 uppercase flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        <Repeat size={8} /> Recorrente
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {task.status === 'todo' && userRole !== 'admin' && (
                  <button 
                    onClick={() => updateTaskStatus(task.id, 'review')}
                    className="text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ENTREGAR
                  </button>
                )}
                {task.status === 'review' && (
                   <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg">
                    EM REVISÃO
                  </span>
                )}
                {(userRole === 'admin' || task.assignedTo === currentUserId) && (
                  <button onClick={() => deleteTask(task.id)} className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
