
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import WeeklyEntryModal from './components/WeeklyEntryModal';
import DocumentIngestor from './components/DocumentIngestor';
import WeeklyReportGenerator from './components/WeeklyReportGenerator';
import { AppView, WeeklyEntry, WeeklyReport } from './types';
import { storageService } from './services/storageService';

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return <span className="text-gray-300 italic">未填</span>;

  // Simple parser for our custom tags
  // **bold**
  // <c:red>text</c>
  // <bg:yellow>text</bg>
  // [text](|url)
  
  const tokens = text.split(/(\*\*.*?\*\*|<c:.*?>.*?<\/c>|<bg:.*?>.*?<\/bg>|\[.*?\]\(.*?\|.*?\))/g);

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed text-sm text-gray-700">
      {tokens.map((token, i) => {
        if (token.startsWith('**') && token.endsWith('**')) {
          return <strong key={i} className="font-black text-gray-900">{token.slice(2, -2)}</strong>;
        }
        
        const colorMatch = token.match(/<c:(.*?)>(.*?)<\/c>/);
        if (colorMatch) {
          return <span key={i} style={{ color: colorMatch[1] }} className="font-bold">{colorMatch[2]}</span>;
        }

        const bgMatch = token.match(/<bg:(.*?)>(.*?)<\/bg>/);
        if (bgMatch) {
          const bgColor = bgMatch[1] === 'yellow' ? '#fef3c7' : bgMatch[1] === 'green' ? '#dcfce7' : bgMatch[1];
          const textColor = bgMatch[1] === 'yellow' ? '#92400e' : bgMatch[1] === 'green' ? '#166534' : 'inherit';
          return <span key={i} style={{ backgroundColor: bgColor, color: textColor }} className="px-1 rounded font-bold border border-black/5">{bgMatch[2]}</span>;
        }

        const linkMatch = token.match(/\[(.*?)\]\((.*?)\|(.*?)\)/);
        if (linkMatch) {
          return (
            <a key={i} href={linkMatch[3]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 font-bold mx-0.5">
              {linkMatch[1]}
            </a>
          );
        }

        return <span key={i}>{token}</span>;
      })}
    </div>
  );
};

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
            <p className="text-xs text-blue-400 font-bold">点击侧边栏查看详细内容</p>
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
          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">核心进展 & 计划</th>
          <th className="w-24 px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">风险级别</th>
          <th className="w-24 px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">操作</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {entries.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic font-medium">暂无记录，请点击上方“新增本周记录”按钮</td>
          </tr>
        ) : (
          entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group align-top">
              <td className="px-6 py-8 font-black text-gray-900 border-r border-gray-50 bg-gray-50/30">{entry.weekRange}</td>
              <td className="px-6 py-8 border-r border-gray-50">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 block w-fit mb-2">本周核心进展</span>
                    <FormattedText text={entry.progress} />
                  </div>
                  {entry.risks && (
                    <div className="pt-4 border-t border-dashed border-gray-200">
                      <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 block w-fit mb-2">风险与阻碍</span>
                      <FormattedText text={entry.risks} />
                    </div>
                  )}
                  {entry.plan && (
                    <div className="pt-4 border-t border-dashed border-gray-200">
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block w-fit mb-2">下周推进计划</span>
                      <FormattedText text={entry.plan} />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-8">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase shadow-sm border ${
                  entry.riskLevel === 'high' ? 'bg-red-600 text-white border-red-700' :
                  entry.riskLevel === 'medium' ? 'bg-yellow-400 text-yellow-900 border-yellow-500' :
                  'bg-green-500 text-white border-green-600'
                }`}>
                  {entry.riskLevel === 'high' ? '高风险' : entry.riskLevel === 'medium' ? '中等' : '可控'}
                </span>
              </td>
              <td className="px-6 py-8 text-right">
                <button 
                  onClick={() => onEdit(entry)}
                  className="text-white hover:bg-blue-700 font-bold text-xs bg-blue-600 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-95"
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
          <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">项目工作台</h2>
                <p className="text-gray-500 font-medium">智能记录工程周期进展，识别风险要素。</p>
              </div>
              <button 
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 transition-all shadow-xl active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                记录本周新动态
              </button>
            </div>
            <Dashboard entries={entries} latestReport={reports[0] || null} />
            <div className="space-y-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                核心进展看板
              </h3>
              <WeeklyEntriesTable entries={entries.slice(0, 5)} onEdit={openEditModal} />
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 pb-16">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">全量周志记录</h2>
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
    <div className="flex h-screen bg-[#f8fafc]">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <header className="flex justify-between items-center mb-12 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">施工管理数字化平台</h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Digital Field Management v2.6</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] text-gray-400 font-black uppercase">当前日期</p>
                <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
             <div className="w-px h-8 bg-gray-200"></div>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">系统就绪</span>
             </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
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
