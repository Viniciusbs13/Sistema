
export type TaskStatus = 'todo' | 'doing' | 'done' | 'review';
export type Sector = 'general' | 'traffic' | 'editing';
export type Role = 'admin' | 'traffic' | 'editing';

export interface User {
  id: string;
  name: string;
  role: Role;
  sector: Sector;
  accessKey: string;
  avatar?: string;
}

export interface Task {
  id: string;
  content: string;
  status: TaskStatus;
  day: string;
  sector: Sector;
  assignedTo: string;
  isRecurring: boolean;
  templateId?: string;
  createdAt: number;
  completedAt?: number;
}

export interface Client {
  id: string;
  name: string;
  managerId: string; // User ID
  status: 'active' | 'paused';
  createdAt: number;
}

export type AssetType = 'spreadsheet' | 'text' | 'checklist';

export interface ClientAsset {
  id: string;
  clientId: string;
  type: AssetType;
  title: string;
  data: any; // Dynamic based on type
  updatedAt: number;
}

export interface Chronogram {
  id: string;
  title: string;
  sector: Sector;
  tasks: string[];
  days: string[];
  lastReset?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  sector: Sector;
  updatedAt: number;
}

export type ViewMode = 'tasks' | 'notes' | 'dashboard' | 'chronograms' | 'team' | 'clients';
