
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import WeeklyEntryModal from './components/WeeklyEntryModal';
import DocumentIngestor from './components/DocumentIngestor';
import WeeklyReportGenerator from './components/WeeklyReportGenerator';
import { AppView, WeeklyEntry, WeeklyReport } from './types';
import { storageService } from './services/storageService';

const Dashboard: React.FC<{ entries: WeeklyEntry[], latestReport: WeeklyReport | null }> = ({ entries, latestReport }) => {
  const highRisksCount = entries.filter(e => e.riskLevel === 'high').length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-gray-500 font-medium text-xs mb-2 uppercase tracking-widest">已记录周数</h3>
        <div className="flex items-center justify-between">
          <span className="text-4xl font-black text-blue-600">{entries.length}</span>
          <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-gray-500 font-medium text-xs mb-2 uppercase tracking-widest">待处理风险</h3>
        <div className="flex items-center justify-between">
          <span className={`text-4xl font-black ${highRisksCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{highRisksCount}</span>
          <div className={`w-10 h-10 rounded flex items-center justify-center ${highRisksCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1c1e] p-6 rounded-xl shadow-lg text-white">
        <h3 className="text-gray-400 font-medium text-xs mb-2 uppercase tracking-widest">最新正式周报</h3>
        {latestReport ? (
          <div>
            <p className="text-lg font-bold mb-1">已于 {new Date(latestReport.timestamp).toLocaleDateString()} 生成</p>
            <p className="text-xs text-blue-400">点击进入 AI 周报查看详情</p>
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm">暂无生成的正式周报</p>
        )}
      </div>
    </div>
  );
};

const WeeklyEntriesTable: React.FC<{ entries: WeeklyEntry[], onEdit: (e: WeeklyEntry) => void }> = ({ entries, onEdit }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">周次</th>
          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">核心进展</th>
          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">风险项</th>
          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">风险等级</th>
          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">操作</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {entries.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">暂无记录，请点击“新增本周记录”</td>
          </tr>
        ) : (
          entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">{entry.weekRange}</td>
              <td className="px-6 py-4 text-gray-600 max-w-sm truncate">{entry.progress}</td>
              <td className="px-6 py-4 text-gray-600 max-w-sm truncate">{entry.risks || '无'}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                  entry.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                  entry.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {entry.riskLevel === 'high' ? '严重' : entry.riskLevel === 'medium' ? '中等' : '可控'}
                </span>
              </td>
              <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(entry)}
                  className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                >
                  编辑
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WeeklyEntry | null>(null);
  const [entries, setEntries] = useState<WeeklyEntry[]>(storageService.getEntries());
  const [reports, setReports] = useState<WeeklyReport[]>(storageService.getReports());

  const refreshData = () => {
    setEntries(storageService.getEntries());
    setReports(storageService.getReports());
  };

  const openAddModal = () => {
    setEditTarget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (entry: WeeklyEntry) => {
    setEditTarget(entry);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">工程进展概览</h2>
                <p className="text-gray-500">记录每周工作，智能识别项目风险。</p>
              </div>
              <button 
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 transition-all shadow-xl active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新增本周记录
              </button>
            </div>
            <Dashboard entries={entries} latestReport={reports[0] || null} />
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">最近记录</h3>
              <WeeklyEntriesTable entries={entries.slice(0, 4)} onEdit={openEditModal} />
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">每周工作记录历史</h2>
            <WeeklyEntriesTable entries={entries} onEdit={openEditModal} />
          </div>
        );
      case 'library':
        return <DocumentIngestor />;
      case 'report':
        return <WeeklyReportGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f7f6]">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-900 uppercase">智慧工地 - 数字化施工管理平台</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Digital Construction Management v2.0</p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <WeeklyEntryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refreshData} 
        editTarget={editTarget}
      />
    </div>
  );
};

export default App;
