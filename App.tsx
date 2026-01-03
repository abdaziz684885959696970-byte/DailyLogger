
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
    <table className="w-full text-left table-fixed border-collapse">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="w-24 px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">周次</th>
          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">记录详情</th>
          <th className="w-24 px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">风险等级</th>
          <th className="w-24 px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">操作</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {entries.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">暂无记录，请点击“新增本周记录”</td>
          </tr>
        ) : (
          entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group align-top">
              <td className="px-6 py-6 font-bold text-gray-800 whitespace-nowrap border-r border-gray-50">{entry.weekRange}</td>
              <td className="px-6 py-6 border-r border-gray-50">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-500 block mb-1">本周进展</span>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {entry.progress}
                    </div>
                  </div>
                  {(entry.risks || entry.doodle) && (
                    <div className="pt-3 border-t border-gray-100">
                      {entry.risks && (
                        <div className="mb-3">
                          <span className="text-[10px] font-black uppercase text-red-500 block mb-1">风险遗留</span>
                          <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap break-words">{entry.risks}</div>
                        </div>
                      )}
                      {entry.doodle && (
                        <div>
                          <span className="text-[10px] font-black uppercase text-green-500 block mb-1">附件涂鸦</span>
                          <img src={entry.doodle} alt="现场图纸" className="w-48 rounded border border-gray-200 bg-white shadow-sm" />
                        </div>
                      )}
                    </div>
                  )}
                  {entry.plan && (
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">下周计划</span>
                      <div className="text-gray-500 text-sm italic whitespace-pre-wrap break-words">{entry.plan}</div>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-6">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                  entry.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                  entry.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {entry.riskLevel === 'high' ? '严重' : entry.riskLevel === 'medium' ? '中等' : '可控'}
                </span>
              </td>
              <td className="px-6 py-6 text-right">
                <button 
                  onClick={() => onEdit(entry)}
                  className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
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
          <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">工程进展概览</h2>
                <p className="text-gray-500">集成语音记录、现场涂鸦与智能分析的施工管理台。</p>
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
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                最近记录详情
              </h3>
              <WeeklyEntriesTable entries={entries.slice(0, 4)} onEdit={openEditModal} />
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 pb-12">
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
              <h1 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Smart Site - 数字化施工管理</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Enterprise Edition v2.5</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-gray-400">当前周次: {`W${Math.ceil(new Date().getDate() / 7)}`}</span>
             <div className="w-px h-4 bg-gray-200"></div>
             <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">已连接</span>
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
