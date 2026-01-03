
import { WeeklyEntry, IngestedDoc, WeeklyReport } from '../types';

const ENTRIES_KEY = 'dl_weekly_entries';
const DOCS_KEY = 'dl_ingested_docs';
const REPORTS_KEY = 'dl_weekly_reports';

export const storageService = {
  getEntries: (): WeeklyEntry[] => {
    const data = localStorage.getItem(ENTRIES_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveEntry: (entry: Omit<WeeklyEntry, 'id' | 'date'>) => {
    const entries = storageService.getEntries();
    const newEntry: WeeklyEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    localStorage.setItem(ENTRIES_KEY, JSON.stringify([newEntry, ...entries]));
    return newEntry;
  },

  updateEntry: (id: string, updatedData: Partial<WeeklyEntry>) => {
    const entries = storageService.getEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updatedData };
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
      return entries[index];
    }
    return null;
  },

  deleteEntry: (id: string) => {
    const entries = storageService.getEntries().filter(e => e.id !== id);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  },

  getDocs: (): IngestedDoc[] => {
    const data = localStorage.getItem(DOCS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveDoc: (doc: Omit<IngestedDoc, 'id' | 'timestamp'>) => {
    const docs = storageService.getDocs();
    const newDoc: IngestedDoc = {
      ...doc,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(DOCS_KEY, JSON.stringify([newDoc, ...docs]));
    return newDoc;
  },

  deleteDoc: (id: string) => {
    const docs = storageService.getDocs().filter(d => d.id !== id);
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  },

  getReports: (): WeeklyReport[] => {
    const data = localStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveReport: (content: string) => {
    const reports = storageService.getReports();
    const newReport: WeeklyReport = {
      id: crypto.randomUUID(),
      content,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(REPORTS_KEY, JSON.stringify([newReport, ...reports]));
    return newReport;
  }
};
