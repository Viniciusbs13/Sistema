
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Calendar, FileText, CheckSquare, Plus, Trash2, Search, BrainCircuit, Menu, X, ChevronRight, BarChart3, Users, Repeat, Briefcase } from 'lucide-react';
import { Task, Note, ViewMode, TaskStatus, User, Role, Sector, Chronogram, Client, ClientAsset } from './types';
import Sidebar from './components/Sidebar';
import TaskBoard from './components/TaskBoard';
import NotesView from './components/NotesView';
import Dashboard from './components/Dashboard';
import ChronogramPanel from './components/ChronogramPanel';
import TeamView from './components/TeamView';
import ClientPanel from './components/ClientPanel';

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Diretor Omega', role: 'admin', sector: 'general', accessKey: 'admin-master' },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [chronograms, setChronograms] = useState<Chronogram[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientAssets, setClientAssets] = useState<ClientAsset[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Persistence with Error Handling
  useEffect(() => {
    try {
      const v = 'v7';
      const savedTasks = localStorage.getItem(`omega-tasks-${v}`);
      const savedNotes = localStorage.getItem(`omega-notes-${v}`);
      const savedChrono = localStorage.getItem(`omega-chrono-${v}`);
      const savedUsers = localStorage.getItem(`omega-users-${v}`);
      const savedClients = localStorage.getItem(`omega-clients-${v}`);
      const savedAssets = localStorage.getItem(`omega-assets-${v}`);
      
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedChrono) setChronograms(JSON.parse(savedChrono));
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedAssets) setClientAssets(JSON.parse(savedAssets));
    } catch (error) {
      console.error("Erro ao carregar banco de dados local:", error);
      // Se houver erro de parse, limpamos para evitar loop de crash
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const v = 'v7';
    localStorage.setItem(`omega-tasks-${v}`, JSON.stringify(tasks));
    localStorage.setItem(`omega-notes-${v}`, JSON.stringify(notes));
    localStorage.setItem(`omega-chrono-${v}`, JSON.stringify(chronograms));
    localStorage.setItem(`omega-users-${v}`, JSON.stringify(users));
    localStorage.setItem(`omega-clients-${v}`, JSON.stringify(clients));
    localStorage.setItem(`omega-assets-${v}`, JSON.stringify(clientAssets));
  }, [tasks, notes, chronograms, users, clients, clientAssets, isInitialized]);

  // Invitation logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteData = params.get('invite');
    if (inviteData) {
      try {
        const decodedUser = JSON.parse(atob(inviteData)) as User;
        setUsers(prev => prev.find(u => u.id === decodedUser.id) ? prev : [...prev, decodedUser]);
        setCurrentUser(decodedUser);
        setView('tasks');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) { console.error("Link de convite inválido"); }
    }
  }, [users]);

  const filteredTasks = useMemo(() => {
    if (currentUser.role === 'admin') return tasks;
    return tasks.filter(t => t.assignedTo === currentUser.id);
  }, [tasks, currentUser]);

  const filteredNotes = useMemo(() => {
    if (currentUser.role === 'admin') return notes;
    return notes.filter(n => n.sector === currentUser.sector || n.sector === 'general');
  }, [notes, currentUser]);

  const addTask = (content: string, day: string, sector: Sector = 'general', assignedTo: string) => {
    setTasks(prev => [...prev, { id: crypto.randomUUID(), content, status: 'todo', day, sector, assignedTo, isRecurring: false, createdAt: Date.now() }]);
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, completedAt: status === 'done' ? Date.now() : t.completedAt } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const resetChronogram = (chrono: Chronogram, target: string) => {
    let ids = target === 'all_sector' ? users.filter(u => u.sector === chrono.sector || chrono.sector === 'general').map(u => u.id) : [target];
    const newTasks: Task[] = [];
    ids.forEach(uid => chrono.days.forEach(day => chrono.tasks.forEach(content => newTasks.push({ id: crypto.randomUUID(), content, status: 'todo', day, sector: chrono.sector, assignedTo: uid, isRecurring: true, templateId: chrono.id, createdAt: Date.now() }))));
    setTasks(prev => [...prev.filter(t => t.templateId !== chrono.id || !ids.includes(t.assignedTo)), ...newTasks]);
    setChronograms(prev => prev.map(c => c.id === chrono.id ? { ...c, lastReset: Date.now() } : c));
  };

  if (!isInitialized) return <div className="h-screen w-screen bg-black flex items-center justify-center text-teal-500 font-bold">Carregando Workspace...</div>;

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-200 overflow-hidden font-sans">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        users={users}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <Menu size={20} className="text-teal-500" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-black capitalize flex items-center gap-2 text-white">
                {view === 'clients' && <Briefcase className="text-teal-500" />}
                {view !== 'clients' && <BarChart3 className="text-teal-500" />}
                {view}
              </h1>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Acesso: {currentUser.name}</p>
            </div>
          </div>
        </header>

        {view === 'dashboard' && <Dashboard tasks={filteredTasks} notes={filteredNotes} setView={setView} />}
        {view === 'tasks' && <TaskBoard tasks={filteredTasks} addTask={addTask} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} userRole={currentUser.role} users={users} currentUserId={currentUser.id} />}
        {view === 'notes' && <NotesView notes={filteredNotes} addNote={(t, c, s) => setNotes(prev => [{ id: crypto.randomUUID(), title: t, content: c, tags: [], sector: s, updatedAt: Date.now() }, ...prev])} deleteNote={(id) => setNotes(n => n.filter(x => x.id !== id))} userRole={currentUser.role} />}
        {view === 'chronograms' && <ChronogramPanel chronograms={chronograms} setChronograms={setChronograms} resetChronogram={resetChronogram} userRole={currentUser.role} userSector={currentUser.sector} users={users} />}
        {view === 'team' && <TeamView tasks={tasks} users={users} updateTaskStatus={updateTaskStatus} addUser={(n, r, s) => setUsers(prev => [...prev, { id: crypto.randomUUID(), name: n, role: r, sector: s, accessKey: `${n.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}` }])} deleteUser={(id) => id !== '1' && setUsers(prev => prev.filter(u => u.id !== id))} deleteTask={deleteTask} />}
        {view === 'clients' && (
          <ClientPanel 
            clients={clients} 
            setClients={setClients} 
            assets={clientAssets} 
            setAssets={setClientAssets} 
            users={users} 
            currentUser={currentUser} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
