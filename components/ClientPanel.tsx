
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client, ClientAsset, User, AssetType, ClientHealth } from '../types';
import { 
  Plus, Folder, Trash2, FileText, CheckSquare, ChevronLeft, ChevronRight, 
  X, UserPlus, Table as TableIcon, Columns, Rows, AlertTriangle, 
  CloudCheck, CloudUpload, MoreHorizontal, ArrowDown, ArrowUp, ArrowLeft, ArrowRight,
  ShieldAlert, Activity
} from 'lucide-react';

interface ClientPanelProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  assets: ClientAsset[];
  setAssets: React.Dispatch<React.SetStateAction<ClientAsset[]>>;
  users: User[];
  currentUser: User;
}

const ClientPanel: React.FC<ClientPanelProps> = ({ clients, setClients, assets, setAssets, users, currentUser }) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientManager, setNewClientManager] = useState('');
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const filteredClients = isAdmin ? clients : clients.filter(c => c.managerId === currentUser.id);
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const editingAsset = assets.find(a => a.id === editingAssetId);

  const handleAddClient = () => {
    if (!newClientName || !newClientManager) return;
    const client: Client = {
      id: crypto.randomUUID(),
      name: newClientName,
      managerId: newClientManager,
      status: 'active',
      health: 'good',
      createdAt: Date.now()
    };
    setClients(prev => [...prev, client]);
    setNewClientName('');
    setIsAddingClient(false);
  };

  const updateClientHealth = (clientId: string, health: ClientHealth) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, health } : c));
  };

  const handleAddAsset = (type: AssetType) => {
    if (!selectedClientId) return;
    
    let initialData: any;
    if (type === 'spreadsheet') {
      initialData = Array(6).fill(0).map(() => Array(6).fill(""));
      initialData[0] = ["Cabeçalho 1", "Cabeçalho 2", "Status", "Valor", "Notas", ""];
    } else if (type === 'checklist' ) {
      initialData = [];
    } else {
      initialData = "";
    }
      
    const newAsset: ClientAsset = {
      id: crypto.randomUUID(),
      clientId: selectedClientId,
      type,
      title: `Novo ${type === 'spreadsheet' ? 'Planejamento' : type === 'checklist' ? 'Checklist' : 'Documento'}`,
      data: initialData,
      updatedAt: Date.now()
    };
    setAssets(prev => [...prev, newAsset]);
    setEditingAssetId(newAsset.id);
  };

  const handleAutoSave = (id: string, data: any, title: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, data, title, updatedAt: Date.now() } : a));
  };

  const deleteAsset = (id: string) => {
    if (!confirm('Deseja excluir permanentemente este arquivo do banco de dados?')) return;
    setAssets(prev => prev.filter(a => a.id !== id));
    if (editingAssetId === id) setEditingAssetId(null);
  };

  const getHealthColor = (health?: ClientHealth) => {
    switch (health) {
      case 'good': return 'bg-emerald-500';
      case 'average': return 'bg-yellow-500';
      case 'bad': return 'bg-red-500';
      default: return 'bg-zinc-700';
    }
  };

  const getHealthLabel = (health?: ClientHealth) => {
    switch (health) {
      case 'good': return 'Estável / Bom Resultado';
      case 'average': return 'Alerta / Resultado Médio';
      case 'bad': return 'Instável / Crítico';
      default: return 'Sem Status';
    }
  };

  if (editingAsset) {
    const isManager = selectedClient?.managerId === currentUser.id;
    return (
      <AssetEditor 
        asset={editingAsset} 
        onAutoSave={handleAutoSave}
        onClose={() => setEditingAssetId(null)}
        isReadOnly={!isAdmin && !isManager}
      />
    );
  }

  if (selectedClientId && selectedClient) {
    const isManager = selectedClient.managerId === currentUser.id;
    return (
      <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedClientId(null)} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                {selectedClient.name}
                <div className={`w-3 h-3 rounded-full ${getHealthColor(selectedClient.health)} shadow-lg`} />
              </h2>
              <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">Base de Dados & Status de Saúde</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Health Flag Selector */}
             {(isAdmin || isManager) && (
               <div className="bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-2xl flex items-center gap-1">
                  {(['good', 'average', 'bad'] as ClientHealth[]).map(h => (
                    <button 
                      key={h}
                      onClick={() => updateClientHealth(selectedClient.id, h)}
                      className={`
                        w-8 h-8 rounded-xl flex items-center justify-center transition-all
                        ${selectedClient.health === h ? getHealthColor(h) + ' text-black' : 'hover:bg-zinc-800 text-zinc-600'}
                      `}
                      title={getHealthLabel(h)}
                    >
                      <Activity size={16} />
                    </button>
                  ))}
               </div>
             )}
             
             {(isAdmin || isManager) && (
              <div className="relative group">
                <button className="bg-teal-600 text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20">
                  <Plus size={18} /> Novo Arquivo
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  <button onClick={() => handleAddAsset('spreadsheet')} className="w-full text-left px-4 py-3 hover:bg-zinc-800 flex items-center gap-3 text-sm border-b border-zinc-800"><TableIcon size={16} className="text-green-500" /> Planilha de Dados</button>
                  <button onClick={() => handleAddAsset('text')} className="w-full text-left px-4 py-3 hover:bg-zinc-800 flex items-center gap-3 text-sm border-b border-zinc-800"><FileText size={16} className="text-purple-500" /> Notas / Wiki</button>
                  <button onClick={() => handleAddAsset('checklist')} className="w-full text-left px-4 py-3 hover:bg-zinc-800 flex items-center gap-3 text-sm"><CheckSquare size={16} className="text-blue-500" /> Checklist Operacional</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health Summary Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          selectedClient.health === 'good' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
          selectedClient.health === 'average' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500' :
          'bg-red-500/5 border-red-500/20 text-red-500'
        }`}>
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl bg-current bg-opacity-10`}>
                <Activity size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Status Atual de Entrega</p>
                <p className="text-sm font-bold">{getHealthLabel(selectedClient.health)}</p>
             </div>
          </div>
          <p className="text-[10px] font-black uppercase opacity-50 hidden md:block">Monitoramento em tempo real</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.filter(a => a.clientId === selectedClientId).map(asset => (
            <div 
              key={asset.id} 
              className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl hover:border-teal-500/50 transition-all group relative cursor-pointer shadow-xl overflow-hidden" 
              onClick={() => setEditingAssetId(asset.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${
                  asset.type === 'spreadsheet' ? 'bg-green-500/10 text-green-500' : 
                  asset.type === 'checklist' ? 'bg-blue-500/10 text-blue-500' : 
                  'bg-purple-500/10 text-purple-500'
                }`}>
                  {asset.type === 'spreadsheet' ? <TableIcon size={24} /> : asset.type === 'checklist' ? <CheckSquare size={24} /> : <FileText size={24} />}
                </div>
                {(isAdmin || selectedClient?.managerId === currentUser.id) && (
                  <button onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }} className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-white mb-1 truncate">{asset.title}</h3>
              <p className="text-[10px] text-zinc-600 uppercase font-black">Sincronizado: {new Date(asset.updatedAt).toLocaleTimeString()}</p>
            </div>
          ))}
          {assets.filter(a => a.clientId === selectedClientId).length === 0 && (
            <div className="col-span-full py-20 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-3xl text-center text-zinc-600 italic">
              Nenhuma base de dados criada para este cliente ainda.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Database CRM</h2>
          <p className="text-sm text-zinc-500">Gestão de arquivos e monitoramento de saúde do cliente.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsAddingClient(true)} className="bg-teal-600 text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-500/10">
            <UserPlus size={18} /> Vincular Cliente
          </button>
        )}
      </div>

      {isAddingClient && (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl animate-in fade-in slide-in-from-top-4 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Adicionar Cliente ao Ecossistema</h3>
            <button onClick={() => setIsAddingClient(false)} className="text-zinc-500 hover:text-white"><X /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1 tracking-widest">Identificação do Cliente</label>
              <input 
                autoFocus
                value={newClientName} 
                onChange={e => setNewClientName(e.target.value)} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:border-teal-500 outline-none text-white" 
                placeholder="Ex: Omega Digital" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1 tracking-widest">Gestor da Conta</label>
              <select value={newClientManager} onChange={e => setNewClientManager(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:border-teal-500 outline-none">
                <option value="">Selecione...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => setIsAddingClient(false)} className="px-4 py-2 text-zinc-500 font-bold">Sair</button>
            <button onClick={handleAddClient} className="bg-teal-600 text-black px-8 py-2 rounded-xl font-black">CONFIRMAR REGISTRO</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} onClick={() => setSelectedClientId(client.id)} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-teal-500 transition-all cursor-pointer group relative overflow-hidden shadow-xl">
            {/* Health Indicator Flag */}
            <div className={`absolute top-0 right-0 w-16 h-16 transition-transform group-hover:scale-110`}>
                <div className={`absolute top-0 right-0 w-full h-full ${getHealthColor(client.health)} opacity-10`} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${getHealthColor(client.health)} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center mb-4">
                <Folder size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{client.name}</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                Responsável: <span className="text-zinc-300">{users.find(u => u.id === client.managerId)?.name || 'N/A'}</span>
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                 <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                   client.health === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                   client.health === 'average' ? 'bg-yellow-500/20 text-yellow-400' :
                   'bg-red-500/20 text-red-400'
                 }`}>
                   {client.health === 'good' ? 'Estável' : client.health === 'average' ? 'Atenção' : 'Crítico'}
                 </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">{assets.filter(a => a.clientId === client.id).length} Base(s) de Dados</span>
                <ChevronRight size={16} className="text-zinc-700 group-hover:text-teal-500 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Asset Editor with 100% functional Spreadsheet and Real-time Simulated Save
const AssetEditor: React.FC<{ 
  asset: ClientAsset, 
  onAutoSave: (id: string, data: any, title: string) => void, 
  onClose: () => void, 
  isReadOnly: boolean 
}> = ({ asset, onAutoSave, onClose, isReadOnly }) => {
  const [data, setData] = useState(asset.data);
  const [title, setTitle] = useState(asset.title);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimer = useRef<any>(null);

  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    
    setIsSyncing(true);
    syncTimer.current = setTimeout(() => {
      onAutoSave(asset.id, data, title);
      setIsSyncing(false);
    }, 800);

    return () => { if(syncTimer.current) clearTimeout(syncTimer.current); };
  }, [data, title]);

  const handleSpreadsheetChange = (rIdx: number, cIdx: number, val: string) => {
    if (isReadOnly) return;
    const newData = [...data];
    newData[rIdx] = [...newData[rIdx]];
    newData[rIdx][cIdx] = val;
    setData(newData);
  };

  const addRow = (index: number = data.length) => {
    if (isReadOnly) return;
    const newRow = Array(data[0].length).fill("");
    const newData = [...data];
    newData.splice(index, 0, newRow);
    setData(newData);
  };

  const addCol = (index: number = data[0].length) => {
    if (isReadOnly) return;
    const newData = data.map((row: string[]) => {
      const newRow = [...row];
      newRow.splice(index, 0, "");
      return newRow;
    });
    setData(newData);
  };

  const deleteRow = (rIdx: number) => {
    if (isReadOnly || data.length <= 1) return;
    setData(data.filter((_: any, i: number) => i !== rIdx));
  };

  const deleteCol = (cIdx: number) => {
    if (isReadOnly || data[0].length <= 1) return;
    setData(data.map((row: string[]) => row.filter((_: any, i: number) => i !== cIdx)));
  };

  const getColLabel = (index: number) => {
    let label = '';
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  };

  return (
    <div className="h-full flex flex-col space-y-4 pb-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 shadow-lg">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={onClose} className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              disabled={isReadOnly}
              className="bg-transparent text-xl font-black text-white focus:outline-none border-b border-transparent focus:border-teal-500/50 w-full" 
              placeholder="Nome da Base de Dados"
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                {asset.type === 'spreadsheet' ? 'GRID DATABASE' : 'DOCUMENT BASE'}
              </p>
              <div className="h-1 w-1 bg-zinc-700 rounded-full" />
              <div className="flex items-center gap-1.5">
                {isSyncing ? (
                  <CloudUpload size={12} className="text-teal-500 animate-pulse" />
                ) : (
                  <CloudCheck size={12} className="text-zinc-500" />
                )}
                <span className={`text-[8px] font-bold uppercase ${isSyncing ? 'text-teal-500' : 'text-zinc-600'}`}>
                  {isSyncing ? 'Sincronizando...' : 'Alterações Salvas'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button 
              onClick={() => { if(confirm('Deseja limpar todos os dados?')) setData(asset.type === 'spreadsheet' ? Array(6).fill(0).map(() => Array(6).fill("")) : asset.type === 'checklist' ? [] : ""); }}
              className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 transition-all hover:text-white"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {asset.type === 'spreadsheet' && (
          <div className="flex flex-col h-full">
            {!isReadOnly && (
              <div className="p-3 border-b border-zinc-800 bg-zinc-950/30 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button onClick={() => addRow()} className="flex items-center gap-1 text-[9px] font-bold bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-700 transition-all text-zinc-300">
                    <Rows size={12} /> INSERIR LINHA
                  </button>
                  <button onClick={() => addCol()} className="flex items-center gap-1 text-[9px] font-bold bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-700 transition-all text-zinc-300">
                    <Columns size={12} /> INSERIR COLUNA
                  </button>
                </div>
                <div className="h-4 w-[1px] bg-zinc-800" />
                <div className="text-[10px] text-zinc-600 font-medium">Controles estilo Excel ativos</div>
              </div>
            )}

            <div className="flex-1 overflow-auto relative custom-scrollbar bg-zinc-950/10">
              <table className="border-collapse w-full table-fixed min-w-max">
                <thead>
                  <tr className="sticky top-0 z-20">
                    <th className="w-12 bg-zinc-950 border border-zinc-800 p-0 text-[10px] text-zinc-600 font-black uppercase sticky left-0 z-30">#</th>
                    {data[0].map((_: any, i: number) => (
                      <th key={i} className="w-48 bg-zinc-950 border border-zinc-800 p-0 relative group">
                        <div className="flex items-center">
                          <span className="flex-1 text-[10px] font-black text-zinc-600 p-2">{getColLabel(i)}</span>
                          {!isReadOnly && data[0].length > 1 && (
                            <button 
                              onClick={() => deleteCol(i)}
                              className="p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row: string[], rIdx: number) => (
                    <tr key={rIdx} className="group/row">
                      <th className="bg-zinc-950 border border-zinc-800 p-0 text-[10px] text-zinc-600 font-black sticky left-0 z-10 flex items-center justify-center h-10 w-12 group-hover/row:bg-zinc-900 transition-colors">
                        <span className="group-hover/row:hidden">{rIdx + 1}</span>
                        {!isReadOnly && data.length > 1 && (
                          <button onClick={() => deleteRow(rIdx)} className="hidden group-hover/row:flex text-red-500/50 hover:text-red-500"><Trash2 size={12} /></button>
                        )}
                      </th>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="border border-zinc-800/60 p-0 h-10 focus-within:z-10 focus-within:ring-1 focus-within:ring-teal-500/50 relative">
                          <input 
                            value={cell} 
                            onChange={e => handleSpreadsheetChange(rIdx, cIdx, e.target.value)} 
                            disabled={isReadOnly}
                            className={`
                              w-full h-full bg-transparent px-3 py-2 text-xs text-zinc-300 outline-none transition-all
                              ${rIdx === 0 ? 'font-bold text-teal-500 bg-teal-500/5' : ''}
                              focus:bg-zinc-900/50
                            `} 
                            placeholder="..."
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!isReadOnly && (
                    <tr>
                       <td className="sticky left-0 bg-zinc-950/50"></td>
                       <td colSpan={data[0].length}>
                          <button 
                            onClick={() => addRow()}
                            className="w-full h-10 flex items-center justify-center text-[10px] font-black text-zinc-700 hover:text-teal-500 hover:bg-teal-500/5 border-t border-zinc-800 transition-all uppercase tracking-widest"
                          >
                            <Plus size={12} className="mr-2" /> Adicionar nova linha de dados
                          </button>
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {asset.type === 'text' && (
          <textarea 
            value={data} 
            onChange={e => setData(e.target.value)} 
            readOnly={isReadOnly}
            className="w-full h-full bg-transparent resize-none focus:outline-none text-zinc-300 leading-relaxed font-sans p-8 text-lg custom-scrollbar"
            placeholder="Comece a registrar o conhecimento deste cliente aqui..."
          />
        )}

        {asset.type === 'checklist' && (
          <div className="max-w-3xl mx-auto py-10 px-6 space-y-6 w-full custom-scrollbar overflow-y-auto h-full">
            <div className="flex items-center justify-between mb-8 bg-blue-500/10 p-6 rounded-3xl border border-blue-500/20">
               <div>
                  <h4 className="font-bold text-blue-500 uppercase text-xs tracking-widest">Database Tracker</h4>
                  <p className="text-2xl font-black text-white">{Math.round((data.filter((i:any) => i.done).length / (data.length || 1)) * 100)}% concluído</p>
               </div>
               <div className="w-40 h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                  <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${(data.filter((i:any) => i.done).length / (data.length || 1)) * 100}%` }} />
               </div>
            </div>

            <div className="space-y-3 pb-20">
              {data.map((item: { text: string, done: boolean }, idx: number) => (
                <div key={idx} className={`flex items-center gap-4 border p-5 rounded-2xl group transition-all shadow-sm ${item.done ? 'bg-zinc-950/20 border-zinc-900/50 opacity-60' : 'bg-zinc-950 border-zinc-800 hover:border-teal-500/50'}`}>
                  <button 
                    onClick={() => { if(!isReadOnly) { const d = [...data]; d[idx] = { ...d[idx], done: !d[idx].done }; setData(d); }}}
                    className={`transition-all transform active:scale-90 flex-shrink-0 ${item.done ? 'text-teal-500' : 'text-zinc-700 hover:text-teal-500/50'}`}
                  >
                    {item.done ? <CheckCircleIcon size={32} /> : <CheckSquareIcon size={32} />}
                  </button>
                  <input 
                    value={item.text} 
                    onChange={e => { if(!isReadOnly) { const d = [...data]; d[idx] = { ...d[idx], text: e.target.value }; setData(d); }}}
                    disabled={isReadOnly}
                    placeholder="Descrição da atividade..."
                    className={`flex-1 bg-transparent focus:outline-none text-base font-semibold transition-all ${item.done ? 'line-through text-zinc-600 font-normal italic' : 'text-zinc-200'}`} 
                  />
                  {!isReadOnly && (
                    <button 
                      onClick={() => setData(data.filter((_: any, i: number) => i !== idx))} 
                      className="text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              
              {!isReadOnly && (
                <button 
                  onClick={() => setData([...data, { text: '', done: false }])}
                  className="w-full py-8 border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600 hover:text-teal-500 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all font-black uppercase text-[10px] tracking-[4px] flex items-center justify-center gap-4"
                >
                  <Plus size={16} /> ADICIONAR REGISTRO
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 text-amber-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <AlertTriangle size={18} /> MODO DE LEITURA: As alterações não podem ser salvas para o seu perfil. Contate o administrador.
        </div>
      )}
    </div>
  );
};

const CheckCircleIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const CheckSquareIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
);

export default ClientPanel;
