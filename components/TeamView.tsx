
import React, { useState } from 'react';
import { User, Task, TaskStatus, Role, Sector } from '../types';
import { TrendingUp, CheckCircle, Clock, AlertCircle, Filter, X, Copy, ExternalLink, Link as LinkIcon, UserPlus, Trash2, Mail, ShieldCheck, Share2 } from 'lucide-react';

interface TeamViewProps {
  tasks: Task[];
  users: User[];
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addUser: (name: string, role: Role, sector: Sector) => void;
  deleteUser: (id: string) => void;
  deleteTask: (id: string) => void;
}

const TeamView: React.FC<TeamViewProps> = ({ tasks, users, updateTaskStatus, addUser, deleteUser, deleteTask }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('editing');
  const [newSector, setNewSector] = useState<Sector>('editing');

  const collaborators = users.filter(u => u.role !== 'admin');

  const getMetrics = (userId: string) => {
    const userTasks = tasks.filter(t => t.assignedTo === userId);
    const completed = userTasks.filter(t => t.status === 'done').length;
    const total = userTasks.length;
    const pending = userTasks.filter(t => t.status === 'todo').length;
    const inReview = userTasks.filter(t => t.status === 'review').length;
    const score = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, pending, inReview, score };
  };

  const getFunctionalLink = (user: User) => {
    // We encode the user data into the link so it works on other browsers/PCs
    const inviteData = btoa(JSON.stringify(user));
    return `${window.location.origin}${window.location.pathname}?invite=${inviteData}`;
  };

  const copyLink = (user: User) => {
    const url = getFunctionalLink(user);
    navigator.clipboard.writeText(url);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addUser(newName, newRole, newSector);
    setNewName('');
    setIsAddingUser(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Central da Equipe</h2>
          <p className="text-sm text-zinc-500">Métricas de performance e links de acesso dinâmicos.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowLinks(!showLinks)}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all border ${showLinks ? 'bg-zinc-800 text-teal-400 border-teal-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
          >
            <Share2 size={18} /> {showLinks ? 'Ver Cards' : 'Listar Todos os Links'}
          </button>
          <button 
            onClick={() => setIsAddingUser(true)}
            className="bg-teal-600 hover:bg-teal-500 text-black px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <UserPlus size={18} /> Adicionar Colaborador
          </button>
        </div>
      </div>

      {isAddingUser && (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Configurar Novo Colaborador</h3>
            <button onClick={() => setIsAddingUser(false)} className="text-zinc-500 hover:text-white"><X /></button>
          </div>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Nome</label>
              <input 
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
                placeholder="Ex: Pedro Henrique"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Cargo</label>
              <select 
                value={newRole}
                onChange={e => setNewRole(e.target.value as Role)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300"
              >
                <option value="traffic">Gestor de Tráfego</option>
                <option value="editing">Editor de Vídeo</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Setor</label>
              <select 
                value={newSector}
                onChange={e => setNewSector(e.target.value as Sector)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300"
              >
                <option value="traffic">Tráfego Pago</option>
                <option value="editing">Edição</option>
                <option value="general">Geral</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAddingUser(false)} className="px-4 py-2 text-zinc-500 font-bold">Cancelar</button>
              <button type="submit" className="bg-teal-600 text-black px-8 py-2 rounded-xl font-black shadow-lg shadow-teal-500/20">CRIAR COLABORADOR</button>
            </div>
          </form>
        </div>
      )}

      {showLinks ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 bg-zinc-900">
             <h3 className="font-bold flex items-center gap-2"><LinkIcon className="text-teal-500" size={18} /> Central de Links de Acesso</h3>
             <p className="text-xs text-zinc-500 mt-1 font-medium">Copie e envie estes links para que os funcionários acessem de qualquer navegador.</p>
          </div>
          <div className="divide-y divide-zinc-800">
            {collaborators.map(user => (
              <div key={user.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 font-black">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{user.name}</h4>
                    <span className="text-[9px] text-zinc-500 uppercase font-black">{user.role} | {user.sector}</span>
                  </div>
                </div>
                <div className="flex-1 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 font-mono text-[10px] text-zinc-600 truncate max-w-md">
                  {getFunctionalLink(user)}
                </div>
                <button 
                  onClick={() => copyLink(user)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all w-full md:w-auto justify-center ${copiedId === user.id ? 'bg-teal-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                >
                  {copiedId === user.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copiedId === user.id ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborators.map(user => {
            const m = getMetrics(user.id);
            const isSelected = selectedUserId === user.id;

            return (
              <div 
                key={user.id}
                className={`
                  bg-zinc-900 border transition-all rounded-3xl p-6 cursor-pointer relative group
                  ${isSelected ? 'border-teal-500 ring-1 ring-teal-500/20' : 'border-zinc-800 hover:border-zinc-700'}
                `}
                onClick={() => setSelectedUserId(isSelected ? null : user.id)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500 font-black text-xl">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-none">{user.name}</h3>
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1 block">
                        Setor: {user.sector}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); copyLink(user); }}
                      className={`p-2 rounded-xl transition-all shadow-sm ${copiedId === user.id ? 'bg-teal-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-teal-500 hover:text-black'}`}
                      title="Copiar Link para este funcionário"
                    >
                      {copiedId === user.id ? <CheckCircle size={16} /> : <Share2 size={16} />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm(`Remover ${user.name}?`)) deleteUser(user.id); }}
                      className="p-2 bg-zinc-800 text-zinc-500 hover:text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-zinc-500">Performance</span>
                    <span className="text-2xl font-black text-teal-500">{Math.round(m.score)}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 transition-all duration-700" 
                      style={{ width: `${m.score}%` }} 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-zinc-950 p-2 rounded-xl text-center">
                      <p className="text-[9px] text-zinc-500 uppercase mb-1">Check</p>
                      <p className="text-sm font-bold text-white">{m.completed}</p>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-xl text-center">
                      <p className="text-[9px] text-zinc-500 uppercase mb-1">Fila</p>
                      <p className="text-sm font-bold text-zinc-400">{m.pending}</p>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-xl text-center">
                      <p className="text-[9px] text-zinc-500 uppercase mb-1">Revisão</p>
                      <p className={`text-sm font-bold ${m.inReview > 0 ? 'text-amber-500 animate-pulse' : 'text-zinc-600'}`}>
                        {m.inReview}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedUserId && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-500"><ShieldCheck size={24} /></div>
                 <div>
                    <h3 className="text-xl font-bold">Monitorando Fila de {users.find(u => u.id === selectedUserId)?.name}</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Produção Individual</p>
                 </div>
              </div>
              <button onClick={() => setSelectedUserId(null)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {tasks.filter(t => t.assignedTo === selectedUserId).length === 0 ? (
                <div className="text-center py-16 bg-zinc-950/30 rounded-3xl border border-dashed border-zinc-800">
                   <Mail className="mx-auto mb-4 text-zinc-700" size={40} />
                   <p className="text-zinc-600 italic font-medium">Nenhuma atividade pendente.</p>
                </div>
              ) : (
                tasks.filter(t => t.assignedTo === selectedUserId).map(task => (
                  <div key={task.id} className="bg-zinc-950/50 border border-zinc-800/50 p-5 rounded-2xl flex items-center justify-between hover:bg-zinc-950 transition-all group">
                    <div className="flex items-center gap-4">
                      {task.status === 'done' ? (
                        <div className="p-2 bg-teal-500/10 text-teal-500 rounded-full"><CheckCircle size={20} /></div>
                      ) : task.status === 'review' ? (
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-full animate-pulse"><AlertCircle size={20} /></div>
                      ) : (
                        <div className="p-2 bg-zinc-800 text-zinc-700 rounded-full"><Clock size={20} /></div>
                      )}
                      <div>
                        <p className={`font-semibold ${task.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                          {task.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] text-zinc-500 uppercase font-black">{task.day}</span>
                           <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                           <span className="text-[10px] text-zinc-600 uppercase font-bold">{task.sector}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {task.status === 'review' && (
                        <button 
                          onClick={() => updateTaskStatus(task.id, 'done')}
                          className="bg-teal-600 hover:bg-teal-500 text-black text-[10px] font-black px-6 py-2.5 rounded-xl shadow-lg shadow-teal-500/10 transition-all active:scale-95"
                        >
                          APROVAR ENTREGÁVEL
                        </button>
                      )}
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;
