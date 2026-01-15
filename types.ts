export enum TicketStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED'
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO' // Simulated video using placeholders
}

export interface Department {
  id: string;
  name: string;
  prefix: string; // e.g., 'COM' for Comercial
  description?: string;
  subCategories?: string[]; // Array of sub-services (e.g., ["PF", "PJ", "Rural"])
}

export interface Ticket {
  id: string;
  number: string; // e.g., COM-001
  departmentId: string;
  status: TicketStatus;
  createdAt: number;
  calledAt?: number;
  counter?: string; // Station/Guichê number
  isPriority: boolean; // Normal or Priority
  subCategory?: string; // Selected sub-service
  customerId?: string; // CPF (Optional)
}

export interface MarketingMedia {
  id: string;
  type: MediaType;
  url: string;
  duration: number; // seconds to show
  title: string;
}

export interface AppState {
  departments: Department[];
  tickets: Ticket[];
  marketingPlaylist: MarketingMedia[];
}