import React, { useEffect, useState, useRef } from 'react';
import { useQueue } from '../context/QueueContext';
import { TicketStatus, MediaType } from '../types';

// Helper to extract YouTube ID
const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const DisplayView: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const { lastCalledTicket, tickets, marketingPlaylist, departments } = useQueue();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  
  // Previous ticket tracking to trigger sound/flash
  const prevTicketIdRef = useRef<string | null>(null);

  // Marketing Loop Logic
  useEffect(() => {
    if (marketingPlaylist.length === 0) return;

    const currentMedia = marketingPlaylist[currentMediaIndex];
    
    // We strictly use the duration defined in Admin to switch slides
    const timer = setTimeout(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % marketingPlaylist.length);
    }, currentMedia.duration * 1000);

    return () => clearTimeout(timer);
  }, [currentMediaIndex, marketingPlaylist]);

  // Announcement Logic
  useEffect(() => {
    if (lastCalledTicket && lastCalledTicket.id !== prevTicketIdRef.current) {
      // Trigger flash animation
      setIsFlashing(true);
      const flashTimer = setTimeout(() => setIsFlashing(false), 3000); // Flash for 3s

      // Trigger Audio (Text-to-Speech)
      // Note: Browsers may block this without user interaction flags (kiosk mode)
      try {
        const dept = departments.find(d => d.id === lastCalledTicket.departmentId);
        const text = `Senha ${lastCalledTicket.number}, Guichê ${lastCalledTicket.counter}`;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Autoplay audio blocked by browser policy");
      }

      prevTicketIdRef.current = lastCalledTicket.id;

      return () => clearTimeout(flashTimer);
    } else if (lastCalledTicket && lastCalledTicket.calledAt && Date.now() - lastCalledTicket.calledAt < 1000) {
        // If it was just recalled (timestamp updated), trigger speech again
         try {
            const text = `Senha ${lastCalledTicket.number}, Guichê ${lastCalledTicket.counter}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            window.speechSynthesis.speak(utterance);
         } catch (e) {
            console.warn("Autoplay audio blocked by browser policy");
         }
    }
  }, [lastCalledTicket, departments]);

  // History (Last 4 called excluding current)
  const history = tickets
    .filter(t => t.status === TicketStatus.CALLED || t.status === TicketStatus.FINISHED)
    .sort((a, b) => (b.calledAt || 0) - (a.calledAt || 0))
    .slice(1, 5); // Skip the first one as it is main display

  const currentMedia = marketingPlaylist[currentMediaIndex];
  const youtubeId = currentMedia?.type === MediaType.VIDEO ? getYouTubeID(currentMedia.url) : null;
  
  return (
    <div className="h-screen w-screen bg-teal-950 flex overflow-hidden relative">
      
      {/* Left Panel: Ticket Info */}
      <div className={`w-1/3 flex flex-col border-r border-teal-900 transition-colors duration-500 ${isFlashing ? 'bg-red-600' : 'bg-teal-950'}`}>
        
        {/* Main Current Ticket */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 relative">
          <h2 className={`text-3xl uppercase tracking-widest mb-4 font-semibold ${isFlashing ? 'text-white' : 'text-teal-400'}`}>
            Senha Atual
          </h2>
          
          {lastCalledTicket ? (
            <>
              <div className={`text-8xl lg:text-9xl font-black mb-2 ${isFlashing ? 'text-white' : 'text-white'} ${lastCalledTicket.isPriority && !isFlashing ? 'text-red-400' : ''}`}>
                {lastCalledTicket.number}
              </div>
               {lastCalledTicket.isPriority && (
                  <div className="bg-red-600 text-white px-4 py-1 rounded mb-4 font-bold tracking-widest animate-pulse">
                      PRIORIDADE
                  </div>
              )}
              <div className={`text-4xl font-bold mb-8 ${isFlashing ? 'text-white' : 'text-teal-400'}`}>
                GUICHÊ {lastCalledTicket.counter}
              </div>
              <div className={`text-xl ${isFlashing ? 'text-red-100' : 'text-teal-200'}`}>
                {departments.find(d => d.id === lastCalledTicket.departmentId)?.name}
                {lastCalledTicket.subCategory && <span> • {lastCalledTicket.subCategory}</span>}
              </div>
            </>
          ) : (
             <div className="text-teal-700 text-2xl">Aguardando...</div>
          )}
        </div>

        {/* History Section */}
        <div className={`h-1/3 ${isFlashing ? 'bg-red-700' : 'bg-teal-900'} p-6`}>
           <h3 className="text-teal-400 text-sm uppercase tracking-wider mb-4 border-b border-teal-800 pb-2">Últimas Chamadas</h3>
           <div className="space-y-4">
             {history.map(t => (
               <div key={t.id} className="flex justify-between items-center text-teal-200">
                 <span className={`font-bold text-2xl ${t.isPriority ? 'text-red-400' : ''}`}>{t.number}</span>
                 <span className="text-teal-400">Guichê {t.counter}</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Right Panel: Marketing Area */}
      <div className="w-2/3 bg-black relative flex items-center justify-center overflow-hidden">
        {currentMedia ? (
          <div className="w-full h-full relative animate-in fade-in duration-700">
             
             {/* RENDER LOGIC */}
             {currentMedia.type === MediaType.IMAGE ? (
                <img 
                    key={currentMedia.url} 
                    src={currentMedia.url} 
                    alt={currentMedia.title}
                    className="w-full h-full object-cover"
                />
             ) : youtubeId ? (
                /* YOUTUBE EMBED */
                <div className="w-full h-full pointer-events-none">
                     <iframe 
                        key={youtubeId}
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=0&start=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
             ) : (
                /* NATIVE VIDEO / STREAM */
                <video 
                    key={currentMedia.url}
                    src={currentMedia.url}
                    autoPlay
                    muted={false} // Tried to force sound. Browser might block it, but Kiosk settings allow it.
                    playsInline
                    className="w-full h-full object-cover"
                    loop={false}
                />
             )}

            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-12 pointer-events-none">
               <h2 className="text-white text-4xl font-bold">{currentMedia.title}</h2>
               <div className="h-1 bg-teal-500 mt-4" style={{ width: '100%', animation: `shrink ${currentMedia.duration}s linear` }}></div>
            </div>
            <style>{`
              @keyframes shrink {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
          </div>
        ) : (
          <div className="text-white opacity-20 text-4xl font-light">Espaço Institucional</div>
        )}
      </div>
    </div>
  );
};