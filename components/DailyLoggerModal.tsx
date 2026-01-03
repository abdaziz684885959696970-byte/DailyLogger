
import React, { useState } from 'react';
import { storageService } from '../services/storageService';

interface DailyLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DailyLoggerModal: React.FC<DailyLoggerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [completed, setCompleted] = useState('');
  const [issues, setIssues] = useState('');
  const [plan, setPlan] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Calculate week range for internal storage
    const now = new Date();
    const weekRange = `第 ${Math.ceil(now.getDate() / 7)} 周 (${now.getMonth() + 1}月)`;
    
    // Fix: storageService.saveLog does not exist, use saveEntry and map daily fields to WeeklyEntry type
    storageService.saveEntry({ 
      progress: completed, 
      risks: issues, 
      plan,
      weekRange,
      riskLevel: 'low' 
    });
    setCompleted('');
    setIssues('');
    setPlan('');
    onSuccess();
    onClose();
  };

  const handleQuickConfirm = () => {
    const defaultVal = "按原计划推进";
    const now = new Date();
    const weekRange = `第 ${Math.ceil(now.getDate() / 7)} 周 (${now.getMonth() + 1}月)`;

    // Fix: storageService.saveLog does not exist, use saveEntry
    storageService.saveEntry({ 
      progress: completed || defaultVal, 
      risks: issues || "无", 
      plan: plan || defaultVal,
      weekRange,
      riskLevel: 'low'
    });
    onClose();
    onSuccess();
  };

  const toggleRecording = () => {
    // Simulated Voice-to-Text for the demo environment
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setCompleted(prev => prev + (prev ? " " : "") + "现场施工进度已完成80%，设备已进场。");
        setIsRecording(false);
      }, 1500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">每日打卡提醒</h2>
            <p className="text-sm text-gray-500">18:00 自动弹出 · 记录今日进度</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex justify-between items-center">
              (1) 今日完成事项
              <button 
                type="button" 
                onClick={toggleRecording}
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-colors ${isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <svg className={`w-3 h-3 ${isRecording ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005.93 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" />
                </svg>
                {isRecording ? '听取中...' : '语音转文字'}
              </button>
            </label>
            <textarea 
              value={completed}
              onChange={(e) => setCompleted(e.target.value)}
              placeholder="简短描述今日工作成果..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">(2) 遗留问题</label>
            <textarea 
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="是否有任何延误、短缺或未决事项？"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">(3) 明日计划</label>
            <input 
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="明天的核心任务..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              提交记录
            </button>
            <button 
              type="button"
              onClick={handleQuickConfirm}
              className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-900 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              一键按原计划推进
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyLoggerModal;
