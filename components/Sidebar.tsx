
import React from 'react';
import { Layout, Calendar, FileText, CheckSquare, X, BarChart3, Settings, HelpCircle, Repeat, Users, ShieldAlert, LogOut, Briefcase } from 'lucide-react';
import { ViewMode, User, Role } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen, currentUser, setCurrentUser, users }) => {
  const menuItems = [
    { id: 'dashboard' as ViewMode, icon: BarChart3, label: 'Painel' },
    { id: 'tasks' as ViewMode, icon: CheckSquare, label: 'Minhas Tarefas' },
    { id: 'clients' as ViewMode, icon: Briefcase, label: 'Clientes & CRM' },
    { id: 'chronograms' as ViewMode, icon: Repeat, label: 'Cronogramas' },
    { id: 'notes' as ViewMode, icon: FileText, label: 'Wiki & Notas' },
  ];

  if (currentUser.role === 'admin') {
    menuItems.push({ id: 'team' as ViewMode, icon: Users, label: 'Equipe & Performance' });
  }

  return (
    <aside className={`
      ${isOpen ? 'w-64' : 'w-0'} 
      bg-[#111] border-r border-zinc-800 transition-all duration-300 overflow-hidden flex flex-col z-50
    `}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-teal-500 rounded-lg text-black font-black text-xl">
            Ω
          </div>
          <span className="font-bold text-xl tracking-tight text-white">OMEGA</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-800 rounded">
          <X size={18} className="text-zinc-500" />
        </button>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
              ${currentView === item.id 
                ? 'bg-teal-500/10 text-teal-500 font-medium' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
            `}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {currentUser.role === 'admin' && (
        <div className="px-4 py-4 border-t border-zinc-800 bg-zinc-900/30">
          <p className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
            <ShieldAlert size={12} className="text-teal-500" /> Trocar Perfil
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {users.map(u => (
              <button key={u.id} onClick={() => setCurrentUser(u)} className={`w-full text-left px-3 py-1.5 rounded text-[11px] transition-colors flex items-center justify-between ${currentUser.id === u.id ? 'bg-teal-500/10 text-teal-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <span>{u.name}</span>
                <span className="text-[8px] opacity-50 uppercase">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentUser.role !== 'admin' && (
        <div className="p-4 border-t border-zinc-800">
           <button onClick={() => { setCurrentUser(users[0]); setView('dashboard'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={18} />
            <span className="text-sm font-bold">Encerrar Sessão</span>
          </button>
        </div>
      )}

      <div className="p-4 border-t border-zinc-800 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all">
          <Settings size={18} />
          <span className="text-sm font-medium">Configurações</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
