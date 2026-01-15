import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Department, Ticket, MarketingMedia, TicketStatus, MediaType } from '../types';

interface QueueContextType {
  departments: Department[];
  tickets: Ticket[];
  marketingPlaylist: MarketingMedia[];
  
  // Actions
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  removeDepartment: (id: string) => void;
  
  generateTicket: (departmentId: string, isPriority: boolean, subCategory?: string, customerId?: string) => Ticket;
  
  callNextTicket: (counter: string, departmentId?: string) => Ticket | null;
  recallTicket: (ticketId: string) => void;
  finishTicket: (ticketId: string) => void;
  
  addMedia: (media: Omit<MarketingMedia, 'id'>) => void;
  removeMedia: (id: string) => void;
  
  // Helpers
  lastCalledTicket: Ticket | null;
  waitingCount: number;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

// Initial Data Updated for "Caixa" and "Atendimento" with subcategories
const INITIAL_DEPTS: Department[] = [
  { 
    id: '1', 
    name: 'Atendimento', 
    prefix: 'ATD', 
    description: 'Serviços de conta e gerência',
    subCategories: ['Pessoa Física', 'Pessoa Jurídica', 'Rural']
  },
  { 
    id: '2', 
    name: 'Caixa', 
    prefix: 'CXA', 
    description: 'Pagamentos, saques e depósitos',
    subCategories: ['Pagamentos', 'Saques', 'Depósitos']
  },
  { 
    id: '3', 
    name: 'Informações', 
    prefix: 'INF', 
    description: 'Dúvidas gerais e triagem',
    subCategories: []
  },
];

const INITIAL_MEDIA: MarketingMedia[] = [
  { id: 'm1', type: MediaType.IMAGE, title: 'Crédito Rural', url: 'https://picsum.photos/1200/800?random=1', duration: 10 },
  // FIX: Use a direct MP4 file (Big Buck Bunny) as default. 
  // This bypasses YouTube embedding restrictions (Error 153) common in preview environments.
  { id: 'm2', type: MediaType.VIDEO, title: 'Vídeo Institucional', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 30 }, 
  { id: 'm3', type: MediaType.IMAGE, title: 'Baixe o App', url: 'https://picsum.photos/1200/800?random=2', duration: 8 },
];

export const QueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPTS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [marketingPlaylist, setMarketingPlaylist] = useState<MarketingMedia[]>(INITIAL_MEDIA);

  // Computed
  const lastCalledTicket = tickets
    .filter(t => t.status === TicketStatus.CALLED)
    .sort((a, b) => (b.calledAt || 0) - (a.calledAt || 0))[0] || null;

  const waitingCount = tickets.filter(t => t.status === TicketStatus.WAITING).length;

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept = { ...dept, id: Math.random().toString(36).substr(2, 9) };
    setDepartments([...departments, newDept]);
  };

  const removeDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
  };

  const generateTicket = (departmentId: string, isPriority: boolean, subCategory?: string, customerId?: string) => {
    const dept = departments.find(d => d.id === departmentId);
    if (!dept) throw new Error("Department not found");

    // Count existing tickets for this department today to generate number
    const count = tickets.filter(t => t.departmentId === departmentId).length + 1;
    // Format: PREF-ATD-001 or ATD-001 depending on logic, keeping simple for now:
    // If Priority, maybe add a 'P' suffix or just rely on color? 
    // Let's keep the standard Numbering but maybe add 'P' at the end visually.
    const number = `${dept.prefix}-${String(count).padStart(3, '0')}`;

    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      departmentId,
      number,
      status: TicketStatus.WAITING,
      createdAt: Date.now(),
      isPriority,
      subCategory,
      customerId
    };

    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  };

  const callNextTicket = (counter: string, departmentId?: string) => {
    // Logic to find next ticket: 
    // 1. Filter by status WAITING
    // 2. Filter by Department (optional)
    // 3. Sort by PRIORITY (true first), then TIME (oldest first)
    
    let waitingTickets = tickets.filter(t => t.status === TicketStatus.WAITING);
    
    if (departmentId) {
      waitingTickets = waitingTickets.filter(t => t.departmentId === departmentId);
    }
    
    // Sort: Priority First, then FIFO
    waitingTickets.sort((a, b) => {
      if (a.isPriority === b.isPriority) {
        return a.createdAt - b.createdAt; // Both same priority, use time
      }
      return a.isPriority ? -1 : 1; // Priority comes first
    });

    const candidate = waitingTickets[0];

    if (!candidate) return null;

    const updatedTicket = {
      ...candidate,
      status: TicketStatus.CALLED,
      calledAt: Date.now(),
      counter
    };

    setTickets(prev => prev.map(t => t.id === candidate!.id ? updatedTicket : t));
    return updatedTicket;
  };

  const recallTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, calledAt: Date.now() }; // Update timestamp to re-trigger effects
      }
      return t;
    }));
  };

  const finishTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: TicketStatus.FINISHED } : t));
  };

  const addMedia = (media: Omit<MarketingMedia, 'id'>) => {
    const newMedia = { ...media, id: Math.random().toString(36).substr(2, 9) };
    setMarketingPlaylist([...marketingPlaylist, newMedia]);
  };

  const removeMedia = (id: string) => {
    setMarketingPlaylist(marketingPlaylist.filter(m => m.id !== id));
  };

  return (
    <QueueContext.Provider value={{
      departments,
      tickets,
      marketingPlaylist,
      addDepartment,
      removeDepartment,
      generateTicket,
      callNextTicket,
      recallTicket,
      finishTicket,
      addMedia,
      removeMedia,
      lastCalledTicket,
      waitingCount
    }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error("useQueue must be used within QueueProvider");
  return context;
};