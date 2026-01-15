import React, { useState } from 'react';
import { QueueProvider } from './context/QueueContext';
import { KioskView } from './views/KioskView';
import { AttendantView } from './views/AttendantView';
import { DisplayView } from './views/DisplayView';
import { AdminView } from './views/AdminView';
import { Monitor, Tablet, Tv, Settings, Home } from 'lucide-react';

// This component simulates routing between the 4 requested pages
// In a real PHP deployment, these would be separate URLs (e.g., /kiosk, /panel, /tv, /admin)
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'kiosk' | 'attendant' | 'display' | 'admin'>('home');

  const handleGoBack = () => setCurrentView('home');

  const renderView = () => {
    switch (currentView) {
      case 'kiosk': return <KioskView onGoBack={handleGoBack} />;
      case 'attendant': return <AttendantView onGoBack={handleGoBack} />;
      case 'display': return <DisplayView onGoBack={handleGoBack} />;
      case 'admin': return <AdminView onGoBack={handleGoBack} />;
      default: return (
        <div className="min-h-screen bg-teal-950 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                QueueMaster <span className="text-teal-400">Pro</span>
              </h1>
              <p className="text-teal-200 text-xl">
                Selecione qual interface do sistema você deseja iniciar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ViewCard 
                title="Totem de Senhas" 
                desc="Para o cliente retirar a senha" 
                icon={<Tablet size={40} />} 
                onClick={() => setCurrentView('kiosk')} 
              />
              <ViewCard 
                title="Estação de Atendimento" 
                desc="Para funcionários chamarem senhas" 
                icon={<Monitor size={40} />} 
                onClick={() => setCurrentView('attendant')} 
              />
              <ViewCard 
                title="TV / Display" 
                desc="Exibição pública de senhas e mídia" 
                icon={<Tv size={40} />} 
                onClick={() => setCurrentView('display')} 
              />
              <ViewCard 
                title="Administração" 
                desc="Gestão de departamentos e marketing" 
                icon={<Settings size={40} />} 
                onClick={() => setCurrentView('admin')} 
              />
            </div>
            
             <div className="mt-12 text-center text-teal-600/50 text-sm">
               <p>Simulação Frontend React em memória.</p>
               <p>Em produção, cada módulo seria acessado por uma URL específica no servidor PHP.</p>
             </div>
          </div>
        </div>
      );
    }
  };

  return (
    <QueueProvider>
      {/* Floating Home Button only if not on home screen to allow easy navigation during demo */}
      {currentView !== 'home' && (
        <button 
          onClick={() => setCurrentView('home')}
          className="fixed bottom-6 right-6 z-50 bg-teal-900 text-white p-4 rounded-full shadow-2xl hover:bg-teal-800 hover:scale-105 transition-all border-2 border-teal-700 hover:border-teal-400 group"
          title="Voltar ao Menu Principal"
        >
          <Home size={24} className="group-hover:text-teal-300 transition-colors" />
        </button>
      )}
      {renderView()}
    </QueueProvider>
  );
};

const ViewCard: React.FC<{ title: string; desc: string; icon: React.ReactNode; onClick: () => void }> = ({ title, desc, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-teal-900 border border-teal-800 hover:border-teal-500 hover:bg-teal-800 hover:-translate-y-2 transition-all duration-300 p-8 rounded-2xl text-left group shadow-lg"
  >
    <div className="mb-6 text-teal-400 group-hover:text-teal-300 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-teal-200/60 text-sm leading-relaxed">{desc}</p>
  </button>
);

export default App;