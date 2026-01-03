
export interface WeeklyEntry {
  id: string;
  date: string; // ISO string representing the entry creation
  weekRange: string; // e.g., "2023-W42" or "10.16-10.22"
  progress: string;
  risks: string;
  plan: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface IngestedDoc {
  id: string;
  name: string;
  type: string;
  content: string;
  timestamp: string;
}

export interface WeeklyReport {
  id: string;
  content: string;
  timestamp: string;
}

export type AppView = 'dashboard' | 'logs' | 'library' | 'report';
