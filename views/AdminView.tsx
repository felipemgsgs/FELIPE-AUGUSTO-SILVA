import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { MediaType, Department } from '../types';
import { Plus, Trash2, Layout, Image as ImageIcon, Settings, LogOut, Video } from 'lucide-react';

export const AdminView: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const { departments, addDepartment, removeDepartment, marketingPlaylist, addMedia, removeMedia } = useQueue();
  const [activeTab, setActiveTab] = useState<'depts' | 'marketing'>('depts');

  // Form States
  const [newDept, setNewDept] = useState({ name: '', prefix: '', description: '', subCategoriesStr: '' });
  
  // Media Form State
  const [newMedia, setNewMedia] = useState({ 
    title: '', 
    url: '', 
    duration: 15, 
    type: MediaType.IMAGE 
  });

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDept.name && newDept.prefix) {
      // Parse subcategories from comma separated string
      const subCats = newDept.subCategoriesStr 
        ? newDept.subCategoriesStr.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      addDepartment({
          name: newDept.name,
          prefix: newDept.prefix,
          description: newDept.description,
          subCategories: subCats
      });
      setNewDept({ name: '', prefix: '', description: '', subCategoriesStr: '' });
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMedia.title && newMedia.url) {
      addMedia({ 
        title: newMedia.title,
        url: newMedia.url,
        duration: newMedia.duration,
        type: newMedia.type
      }); 
      // Reset form
      setNewMedia({ title: '', url: '', duration: 15, type: MediaType.IMAGE });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-teal-950 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-teal-900">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-teal-500" />
            Admin Panel
          </h1>
        </div>
        <ul className="flex-1 py-6">
          <li>
            <button 
              onClick={() => setActiveTab('depts')}
              className={`w-full text-left px-6 py-3 hover:bg-teal-900 transition-colors flex items-center gap-3 ${activeTab === 'depts' ? 'bg-teal-900 text-white border-r-4 border-teal-500' : ''}`}
            >
              <Layout size={18} /> Departamentos
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('marketing')}
              className={`w-full text-left px-6 py-3 hover:bg-teal-900 transition-colors flex items-center gap-3 ${activeTab === 'marketing' ? 'bg-teal-900 text-white border-r-4 border-teal-500' : ''}`}
            >
              <ImageIcon size={18} /> Marketing TV
            </button>
          </li>
        </ul>
        
        <div className="p-6 border-t border-teal-900">
           <button onClick={onGoBack} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full group">
             <LogOut size={18} className="group-hover:text-red-400" /> Sair
           </button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Departments Tab */}
        {activeTab === 'depts' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestão de Departamentos</h2>
            
            {/* Add Form */}
            <form onSubmit={handleAddDept} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prefixo</label>
                <input 
                  type="text" maxLength={3} value={newDept.prefix} onChange={e => setNewDept({...newDept, prefix: e.target.value.toUpperCase()})}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="EX: CXA" required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                <input 
                  type="text" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Caixa" required 
                />
              </div>
               <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subcategorias (separe por vírgula)</label>
                <input 
                  type="text" value={newDept.subCategoriesStr} onChange={e => setNewDept({...newDept, subCategoriesStr: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="PF, PJ, Rural" 
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                <input 
                  type="text" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Descrição opcional do departamento" 
                />
              </div>
              <button type="submit" className="md:col-span-1 bg-teal-600 text-white p-2 h-10 rounded hover:bg-teal-700 flex justify-center items-center gap-2 w-full">
                <Plus size={18} /> Adicionar
              </button>
            </form>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">Prefixo</th>
                    <th className="p-4">Departamento</th>
                    <th className="p-4">Subcategorias</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map(dept => (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-teal-600">{dept.prefix}</td>
                      <td className="p-4 text-slate-800 font-medium">
                          {dept.name}
                          <div className="text-xs text-slate-400 font-normal">{dept.description}</div>
                      </td>
                      <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {dept.subCategories?.map(sub => (
                                <span key={sub} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                                    {sub}
                                </span>
                            ))}
                          </div>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => removeDepartment(dept.id)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Campanhas na TV</h2>
            
            {/* Add Form */}
            <form onSubmit={handleAddMedia} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Mídia</label>
                <select 
                    value={newMedia.type} 
                    onChange={e => setNewMedia({...newMedia, type: e.target.value as MediaType})}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                    <option value={MediaType.IMAGE}>Imagem</option>
                    <option value={MediaType.VIDEO}>Vídeo / YouTube</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                <input 
                  type="text" value={newMedia.title} onChange={e => setNewMedia({...newMedia, title: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Campanha X" required 
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL (Youtube ou Arquivo)</label>
                <input 
                  type="text" value={newMedia.url} onChange={e => setNewMedia({...newMedia, url: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="https://..." required 
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duração(s)</label>
                <input 
                  type="number" value={newMedia.duration} onChange={e => setNewMedia({...newMedia, duration: parseInt(e.target.value)})}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" min="5" 
                />
              </div>
              <div className="md:col-span-1">
                <button type="submit" className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700 flex justify-center items-center">
                  <Plus size={18} />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketingPlaylist.map(media => (
                <div key={media.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
                  <div className="h-40 bg-slate-200 overflow-hidden relative">
                    {media.type === MediaType.IMAGE ? (
                        <img src={media.url} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <Video className="text-white/50" size={40} />
                            {/* Simple visual cue that it is a video */}
                            <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Video</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {media.duration}s
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-700 truncate w-40">{media.title}</h3>
                        <p className="text-[10px] text-slate-400 truncate w-40">{media.url}</p>
                    </div>
                    <button onClick={() => removeMedia(media.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};