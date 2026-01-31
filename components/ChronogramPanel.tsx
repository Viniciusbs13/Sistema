
import React, { useState } from 'react';
import { Chronogram, Role, Sector, User } from '../types';
import { Plus, Play, RotateCcw, Trash2, ListChecks, History, UserPlus, CheckCircle2 } from 'lucide-react';

interface ChronogramPanelProps {
  chronograms: Chronogram[];
  setChronograms: React.Dispatch<React.SetStateAction<Chronogram[]>>;
  resetChronogram: (c: Chronogram, userId: string) => void;
  userRole: Role;
  userSector: Sector;
  users: User[];
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const ChronogramPanel: React.FC<ChronogramPanelProps> = ({ chronograms, setChronograms, resetChronogram, userRole, userSector, users }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTasks, setNewTasks] = useState('');
  const [targetSector, setTargetSector] = useState<Sector>(userSector === 'general' ? 'general' : userSector);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Segunda']);
  const [assigneeForReset, setAssigneeForReset] = useState<Record<string, string>>({});

  const filteredChronos = userRole === 'admin' 
    ? chronograms 
    : chronograms.filter(c => c.sector === userSector || c.sector === 'general');

  const handleSave = () => {
    if (!newTitle.trim() || !newTasks.trim() || selectedDays.length === 0) {
      alert("Preencha o título, tarefas e escolha ao menos um dia.");
      return;
    }
    const chrono: Chronogram = {
      id: crypto.randomUUID(),
      title: newTitle,
      sector: targetSector,
      tasks: newTasks.split('\n').filter(t => t.trim()),
      days: selectedDays
    };
    setChronograms(prev => [...prev, chrono]);
    setNewTitle('');
    setNewTasks('');
    setSelectedDays(['Segunda']);
    setIsCreating(false);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const sectorUsers = (sector: Sector) => users.filter(u => u.sector === sector || sector === 'general');

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Modelos de Cronogramas</h2>
          <p className="text-sm text-zinc-500">Fluxos de trabalho com dias específicos e atribuição em massa.</p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-teal-500/10"
          >
            <Plus size={18} /> Novo Modelo
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Título do Fluxo</label>
              <input 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
                placeholder="Ex: Rotina de Criativos"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Setor Alvo</label>
              <select 
                value={targetSector}
                onChange={e => setTargetSector(e.target.value as Sector)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm"
              >
                <option value="general">Geral</option>
                <option value="traffic">Tráfego Pago</option>
                <option value="editing">Edição de Vídeo</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Dias da Semana que o fluxo ocorre</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${selectedDays.includes(day) ? 'bg-teal-500 text-black border-teal-500' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Atividades do Fluxo (uma por linha)</label>
            <textarea 
              value={newTasks}
              onChange={e => setNewTasks(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 h-32 font-mono text-xs focus:border-teal-500 outline-none"
              placeholder="Tarefa 1&#10;Tarefa 2..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-zinc-500 text-sm font-bold">Cancelar</button>
            <button onClick={handleSave} className="bg-teal-600 px-8 py-2 rounded-xl font-black text-black text-sm">CRIAR MODELO</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChronos.map(chrono => (
          <div key={chrono.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all flex flex-col h-full">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[8px] font-black text-teal-500 uppercase bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20">
                  {chrono.sector}
                </span>
                {userRole === 'admin' && (
                  <button onClick={() => setChronograms(c => c.filter(x => x.id !== chrono.id))} className="text-zinc-700 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{chrono.title}</h3>
              <div className="flex flex-wrap gap-1 mb-4">
                {chrono.days.map(d => (
                  <span key={d} className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-bold">{d.slice(0, 3)}</span>
                ))}
              </div>
              
              <div className="space-y-2 mb-6">
                {chrono.tasks.slice(0, 4).map((t, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs text-zinc-500">
                    <div className="w-1 h-1 bg-zinc-700 rounded-full" /> {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-zinc-600 uppercase flex items-center gap-1">
                  <UserPlus size={10} /> Atribuir Para:
                </span>
                <select 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs p-2 text-zinc-300 outline-none"
                  value={assigneeForReset[chrono.id] || ''}
                  onChange={(e) => setAssigneeForReset(prev => ({ ...prev, [chrono.id]: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="all_sector" className="text-teal-500 font-bold">TODOS DO SETOR</option>
                  {sectorUsers(chrono.sector).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              
              <button 
                onClick={() => {
                  const uid = assigneeForReset[chrono.id];
                  if (uid) resetChronogram(chrono, uid);
                  else alert("Selecione um colaborador ou 'Todos do Setor' primeiro!");
                }}
                className="w-full bg-teal-600 hover:bg-teal-500 text-black py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-teal-500/10"
              >
                <RotateCcw size={14} /> REINICIAR FLUXO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChronogramPanel;
