
import React, { useState } from 'react';
import { Plus, Trash2, Search, FileText, BrainCircuit, Loader2, Sparkles, Tag } from 'lucide-react';
import { Note, Sector, Role } from '../types';
import { summarizeNotes } from '../services/geminiService';

interface NotesViewProps {
  notes: Note[];
  addNote: (title: string, content: string, sector: Sector) => void;
  deleteNote: (id: string) => void;
  userRole: Role;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, addNote, deleteNote, userRole }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [targetSector, setTargetSector] = useState<Sector>('general');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSaveNote = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    addNote(newTitle, newContent, targetSector);
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  const handleSummarize = async (content: string) => {
    setIsSummarizing(true);
    const result = await summarizeNotes(content);
    setSummary(result);
    setIsSummarizing(false);
  };

  const getSectorColor = (sector: Sector) => {
    switch (sector) {
      case 'traffic': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'editing': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-teal-400 bg-teal-400/10 border-teal-400/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      {/* Sidebar List */}
      <div className="md:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
        <button 
          onClick={() => { setIsCreating(true); setSelectedNote(null); setSummary(null); }}
          className="w-full flex items-center justify-center gap-2 p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-all"
        >
          <Plus size={20} /> Nova Nota
        </button>

        {notes.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            Sua wiki está vazia para este setor.
          </div>
        ) : (
          notes.map(note => (
            <button
              key={note.id}
              onClick={() => { setSelectedNote(note); setIsCreating(false); setSummary(null); }}
              className={`
                text-left p-4 rounded-xl border transition-all
                ${selectedNote?.id === note.id 
                  ? 'bg-teal-500/10 border-teal-500/30' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getSectorColor(note.sector)}`}>
                  {note.sector}
                </span>
                <span className="text-[10px] text-zinc-600">{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-semibold text-white truncate">{note.title}</h3>
              <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{note.content}</p>
            </button>
          ))
        )}
      </div>

      {/* Editor/Reader */}
      <div className="md:col-span-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
        {isCreating ? (
          <div className="p-6 flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nova Documentação</h2>
              {userRole === 'admin' && (
                <div className="flex gap-2">
                  {(['general', 'traffic', 'editing'] as Sector[]).map(s => (
                    <button 
                      key={s} 
                      onClick={() => setTargetSector(s)}
                      className={`text-[10px] px-2 py-1 rounded border transition-all uppercase font-bold ${targetSector === s ? 'bg-teal-500/20 border-teal-500 text-teal-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título da Nota"
              className="bg-transparent text-2xl font-bold border-b border-zinc-800 pb-2 focus:outline-none focus:border-teal-500"
            />
            <textarea 
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Comece a escrever aqui seu conhecimento..."
              className="flex-1 bg-transparent resize-none focus:outline-none text-zinc-300 leading-relaxed"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveNote}
                className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-lg font-medium"
              >
                Salvar Nota
              </button>
            </div>
          </div>
        ) : selectedNote ? (
          <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getSectorColor(selectedNote.sector)}`}>
                    SETOR: {selectedNote.sector}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedNote.title}</h2>
                <span className="text-xs text-zinc-500 uppercase tracking-widest">
                  Atualizado em {new Date(selectedNote.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSummarize(selectedNote.content)}
                  disabled={isSummarizing}
                  className="flex items-center gap-2 p-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg transition-all text-sm px-4"
                >
                  {isSummarizing ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
                  IA Resumo
                </button>
                {(userRole === 'admin' || selectedNote.sector === 'general') && (
                  <button 
                    onClick={() => { deleteNote(selectedNote.id); setSelectedNote(null); }}
                    className="p-2 text-zinc-500 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>

            {summary && (
              <div className="mb-8 p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="text-sm font-bold text-purple-400 uppercase mb-2 flex items-center gap-2">
                  <Sparkles size={14} /> Resumo Gerado pela IA
                </h4>
                <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {summary}
                </div>
              </div>
            )}

            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">
              {selectedNote.content}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
            <FileText size={48} className="opacity-20" />
            <p>Selecione uma nota do seu setor para ler ou crie uma nova.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;
