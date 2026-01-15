import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { Printer, ChevronRight, LogOut, X, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { Department } from '../types';

// Reusable Card Component to ensure exact same look and feel for Departments and Subcategories
const KioskCard: React.FC<{
  title: string;
  subtitle?: string;
  onClick: () => void;
  tags?: string[];
}> = ({ title, subtitle, onClick, tags }) => (
  <button
    onClick={onClick}
    className="bg-white border-2 border-slate-200 hover:border-teal-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 rounded-2xl p-8 flex flex-col items-start justify-between group h-64 w-full"
  >
    <div className="text-left w-full">
      <h3 className="text-3xl font-bold text-slate-800 mb-2 group-hover:text-teal-600">
        {title}
      </h3>
      {subtitle && <p className="text-slate-500 text-lg">{subtitle}</p>}
      
      {tags && tags.length > 0 && (
        <div className="mt-4 flex gap-2 flex-wrap opacity-60">
           {tags.slice(0, 3).map(tag => (
             <span key={tag} className="text-xs bg-slate-100 border border-slate-300 px-2 py-1 rounded">
               {tag}
             </span>
           ))}
           {tags.length > 3 && <span className="text-xs text-slate-400">...</span>}
        </div>
      )}
    </div>
    <div className="self-end bg-slate-100 p-3 rounded-full group-hover:bg-teal-600 group-hover:text-white transition-colors">
      <ChevronRight size={32} />
    </div>
  </button>
);

export const KioskView: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const { departments, generateTicket } = useQueue();
  
  // Navigation State
  const [step, setStep] = useState<'DEPT_SELECT' | 'SUB_SELECT'>('DEPT_SELECT');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  
  // Modal/Confirmation State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastTicket, setLastTicket] = useState<{ number: string; deptName: string; isPriority: boolean } | null>(null);

  // Form states
  const [cpf, setCpf] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  const selectedDept = departments.find(d => d.id === selectedDeptId);

  // --- Handlers ---

  const handleDeptClick = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    setSelectedDeptId(deptId);
    setCpf('');
    setSelectedSubCategory('');

    if (dept && dept.subCategories && dept.subCategories.length > 0) {
      // Go to Submenu
      setStep('SUB_SELECT');
    } else {
      // No subcategories, go straight to confirmation modal
      setShowConfirmModal(true);
    }
  };

  const handleSubCategoryClick = (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    setShowConfirmModal(true);
  };

  const handleBackNavigation = () => {
    if (showConfirmModal) {
        setShowConfirmModal(false);
        return;
    }
    
    if (step === 'SUB_SELECT') {
      setStep('DEPT_SELECT');
      setSelectedDeptId(null);
    } else {
      onGoBack(); // Exit Kiosk
    }
  };

  const confirmTicket = (isPriority: boolean) => {
    if (!selectedDeptId) return;

    try {
      const ticket = generateTicket(selectedDeptId, isPriority, selectedSubCategory, cpf);
      const dept = departments.find(d => d.id === selectedDeptId);
      
      setLastTicket({ 
          number: ticket.number, 
          deptName: dept?.name || '',
          isPriority: ticket.isPriority
      });
      
      // Reset Flow
      setShowConfirmModal(false);
      setStep('DEPT_SELECT');
      setSelectedDeptId(null);
      
      // Auto clear message after 4 seconds
      setTimeout(() => setLastTicket(null), 4000);
    } catch (e) {
      alert("Erro ao gerar senha");
    }
  };

  // --- Render: Success Screen ---
  if (lastTicket) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-white text-center animate-in fade-in duration-300 ${lastTicket.isPriority ? 'bg-red-600' : 'bg-teal-600'}`}>
        <Printer size={120} className="mb-8 opacity-80" />
        <h2 className="text-4xl font-light mb-4">Sua senha é:</h2>
        <div className={`text-9xl font-bold mb-4 bg-white px-12 py-6 rounded-2xl shadow-2xl ${lastTicket.isPriority ? 'text-red-600' : 'text-teal-700'}`}>
          {lastTicket.number}
          {lastTicket.isPriority && <span className="block text-2xl mt-2 font-normal text-red-500 tracking-wider">PRIORIDADE</span>}
        </div>
        <p className="text-2xl opacity-90">{lastTicket.deptName}</p>
        <p className="mt-12 text-sm opacity-70">Por favor, aguarde o chamado na TV.</p>
        <button 
          onClick={() => setLastTicket(null)}
          className="mt-8 bg-black bg-opacity-20 hover:bg-opacity-30 px-8 py-3 rounded-full text-lg transition-colors"
        >
          Emitir Nova Senha
        </button>
      </div>
    );
  }

  // --- Render: Main Interaction ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <header className="bg-teal-700 text-white p-8 shadow-lg transition-all duration-300">
        <div className="flex items-center gap-4">
           {step === 'SUB_SELECT' && (
               <button onClick={handleBackNavigation} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                   <ArrowLeft />
               </button>
           )}
           <div>
            <h1 className="text-3xl font-bold">
                {step === 'DEPT_SELECT' ? 'Bem-vindo' : selectedDept?.name}
            </h1>
            <p className="text-teal-100 text-lg">
                {step === 'DEPT_SELECT' 
                    ? 'Toque em uma opção para retirar sua senha' 
                    : 'Selecione o tipo de serviço desejado'}
            </p>
           </div>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* VIEW 1: DEPARTMENTS */}
        {step === 'DEPT_SELECT' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4 duration-300">
            {departments.map((dept) => (
                <KioskCard 
                    key={dept.id}
                    title={dept.name}
                    subtitle={dept.description}
                    tags={dept.subCategories}
                    onClick={() => handleDeptClick(dept.id)}
                />
            ))}
            </div>
        )}

        {/* VIEW 2: SUBCATEGORIES */}
        {step === 'SUB_SELECT' && selectedDept && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
                {selectedDept.subCategories?.map((sub) => (
                    <KioskCard 
                        key={sub}
                        title={sub}
                        subtitle="Toque para continuar"
                        onClick={() => handleSubCategoryClick(sub)}
                    />
                ))}
            </div>
        )}

      </main>
      
      <footer className="p-4 text-center text-slate-400 text-sm relative">
        Sistema de Gestão de Filas v1.0
        <button 
            onClick={handleBackNavigation} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-400 transition-colors p-2 flex items-center gap-2"
            title="Voltar / Sair"
        >
            <span className="hidden md:inline">{step === 'SUB_SELECT' ? 'Voltar' : 'Sair'}</span>
            <LogOut size={16} />
        </button>
      </footer>

      {/* MODAL FOR CPF & PRIORITY (Only shown at the end) */}
      {showConfirmModal && selectedDept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="bg-teal-700 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-2xl font-bold">{selectedDept.name}</h2>
                        <div className="flex items-center gap-2 text-teal-200">
                            {selectedSubCategory && <span className="font-semibold bg-teal-800 px-2 py-0.5 rounded text-sm">{selectedSubCategory}</span>}
                            <span>Confirme seu atendimento</span>
                        </div>
                    </div>
                    <button onClick={() => setShowConfirmModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X size={28} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto space-y-8">
                    
                    {/* CPF Input */}
                    <div className="space-y-3">
                        <label className="text-slate-500 font-bold uppercase text-sm tracking-wider block flex items-center gap-2">
                             <User size={16} /> Identificação (CPF) <span className="text-slate-300 font-normal normal-case">- Opcional</span>
                        </label>
                        <input 
                            type="text" 
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="000.000.000-00"
                            className="w-full text-3xl p-4 border-b-2 border-slate-300 focus:border-teal-600 outline-none font-mono text-slate-700 bg-transparent placeholder:text-slate-300"
                            autoFocus
                        />
                        <p className="text-xs text-slate-400">Digite apenas os números para atendimento personalizado.</p>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Priority Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <button 
                            onClick={() => confirmTicket(false)}
                            className="bg-teal-600 hover:bg-teal-700 text-white p-6 rounded-2xl flex flex-col items-center gap-2 shadow-lg shadow-teal-200 hover:scale-[1.02] transition-transform"
                        >
                            <span className="text-2xl font-bold">NORMAL</span>
                            <span className="opacity-80 text-sm">Atendimento regular</span>
                        </button>
                        
                        <button 
                            onClick={() => confirmTicket(true)}
                            className="bg-white border-2 border-red-200 hover:border-red-500 text-red-600 hover:bg-red-50 p-6 rounded-2xl flex flex-col items-center gap-2 group transition-colors"
                        >
                            <span className="text-2xl font-bold flex items-center gap-2">
                                <AlertCircle className="group-hover:animate-bounce" /> PRIORIDADE
                            </span>
                            <span className="text-red-400 text-sm">Gestantes, Idosos, PNE</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
      )}
    </div>
  );
};