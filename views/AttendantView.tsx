import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { TicketStatus } from '../types';
import { Mic, CheckCircle, Clock, Users, ArrowRight, LogOut, User, AlertCircle } from 'lucide-react';

export const AttendantView: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const { tickets, departments, callNextTicket, recallTicket, finishTicket } = useQueue();
  const [selectedCounter, setSelectedCounter] = useState('01');
  const [myCurrentTicketId, setMyCurrentTicketId] = useState<string | null>(null);

  // Filter waiting tickets
  const waitingTickets = tickets.filter(t => t.status === TicketStatus.WAITING);
  
  // Sort waiting list for display (Priority first)
  waitingTickets.sort((a, b) => {
      if (a.isPriority === b.isPriority) return a.createdAt - b.createdAt;
      return a.isPriority ? -1 : 1;
  });

  // Find the ticket this attendant is currently serving
  const currentTicket = tickets.find(t => t.id === myCurrentTicketId);

  const handleCallNext = () => {
    const ticket = callNextTicket(selectedCounter);
    if (ticket) {
      setMyCurrentTicketId(ticket.id);
    } else {
      alert("Não há senhas na fila.");
    }
  };

  const handleFinish = () => {
    if (myCurrentTicketId) {
      finishTicket(myCurrentTicketId);
      setMyCurrentTicketId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar / Queue List */}
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-700">
            <Users size={20} />
            Fila de Espera
          </h2>
          <p className="text-sm text-slate-500 mt-1">{waitingTickets.length} clientes aguardando</p>
        </div>
        <ul>
          {waitingTickets.length === 0 ? (
            <li className="p-8 text-center text-slate-400 italic">Fila vazia</li>
          ) : (
            waitingTickets.map((t) => {
              const dept = departments.find(d => d.id === t.departmentId);
              return (
                <li key={t.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${t.isPriority ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold text-lg ${t.isPriority ? 'text-red-600' : 'text-slate-800'}`}>
                        {t.number}
                        {t.isPriority && <span className="ml-2 text-xs bg-red-600 text-white px-1 rounded">P</span>}
                    </span>
                    <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                      {Math.floor((Date.now() - t.createdAt) / 60000)} min
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 flex justify-between">
                      <span>{dept?.name}</span>
                      {t.subCategory && <span className="font-semibold text-slate-600">{t.subCategory}</span>}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      {/* Main Action Area */}
      <main className="flex-1 p-6 md:p-12 flex flex-col">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Painel do Atendente</h1>
            <p className="text-slate-500">Logado no Guichê: 
              <select 
                value={selectedCounter} 
                onChange={(e) => setSelectedCounter(e.target.value)}
                className="ml-2 bg-transparent font-bold text-teal-600 border-b border-teal-600 focus:outline-none"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={String(i+1).padStart(2,'0')}>{String(i+1).padStart(2,'0')}</option>
                ))}
              </select>
            </p>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-3xl font-light text-slate-400">
               {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
             </div>
             <button 
               onClick={onGoBack} 
               className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
               title="Sair do Guichê"
             >
               <LogOut size={24} />
             </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
          {currentTicket ? (
            <div className={`w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border ${currentTicket.isPriority ? 'border-red-200 ring-4 ring-red-50' : 'border-slate-100'}`}>
              <div className="text-center mb-8">
                <span className={`inline-block px-4 py-2 rounded-full font-semibold mb-4 ${currentTicket.isPriority ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {currentTicket.isPriority ? 'ATENDIMENTO PRIORITÁRIO' : 'Em Atendimento'}
                </span>
                
                <h2 className="text-6xl md:text-8xl font-black text-slate-800 mb-2">{currentTicket.number}</h2>
                
                <p className="text-xl text-slate-500 mb-2">
                  {departments.find(d => d.id === currentTicket.departmentId)?.name}
                  {currentTicket.subCategory && <span className="font-bold text-slate-700"> • {currentTicket.subCategory}</span>}
                </p>

                {currentTicket.customerId && (
                    <div className="mt-4 bg-slate-50 inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-200">
                        <User className="text-slate-400" />
                        <span className="font-mono text-lg text-slate-700">{currentTicket.customerId}</span>
                    </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => recallTicket(currentTicket.id)}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors font-semibold"
                >
                  <Mic size={24} />
                  Chamar Novamente
                </button>
                <button 
                  onClick={handleFinish}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold shadow-lg shadow-green-200"
                >
                  <CheckCircle size={24} />
                  Finalizar Atendimento
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                <Clock size={48} />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Aguardando Chamada</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Selecione o botão abaixo para chamar a próxima senha da fila de espera.
              </p>
              <button 
                onClick={handleCallNext}
                disabled={waitingTickets.length === 0}
                className="bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xl px-12 py-6 rounded-full shadow-xl shadow-teal-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 font-bold"
              >
                Próxima Senha <ArrowRight />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};