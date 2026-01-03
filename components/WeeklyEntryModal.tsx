
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { WeeklyEntry } from '../types';

interface WeeklyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTarget?: WeeklyEntry | null;
}

const WeeklyEntryModal: React.FC<WeeklyEntryModalProps> = ({ isOpen, onClose, onSuccess, editTarget }) => {
  const [progress, setProgress] = useState('');
  const [risks, setRisks] = useState('');
  const [plan, setPlan] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [recordingField, setRecordingField] = useState<string | null>(null);

  useEffect(() => {
    if (editTarget) {
      setProgress(editTarget.progress);
      setRisks(editTarget.risks);
      setPlan(editTarget.plan);
      setRiskLevel(editTarget.riskLevel);
    } else {
      setProgress('');
      setRisks('');
      setPlan('');
      setRiskLevel('low');
    }
  }, [editTarget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const now = new Date();
    const weekRange = editTarget?.weekRange || `第 ${Math.ceil(now.getDate() / 7)} 周 (${now.getMonth() + 1}月)`;
    
    if (editTarget) {
      storageService.updateEntry(editTarget.id, {
        progress,
        risks,
        plan,
        riskLevel
      });
    } else {
      storageService.saveEntry({ 
        progress, 
        risks, 
        plan, 
        weekRange,
        riskLevel 
      });
    }
    
    onSuccess();
    onClose();
  };

  const importLastWeek = () => {
    const entries = storageService.getEntries();
    if (entries.length > 0) {
      const lastEntry = entries[0];
      setProgress(lastEntry.progress);
      setRisks(lastEntry.risks);
      setPlan(lastEntry.plan);
      setRiskLevel(lastEntry.riskLevel);
    } else {
      alert("暂无历史记录可供导入。");
    }
  };

  const simulateVoiceInput = (field: 'progress' | 'risks' | 'plan') => {
    setRecordingField(field);
    const phrases = {
      progress: "本周主体结构验收顺利完成，二次结构砌筑已进场。",
      risks: "雨季即将来临，深基坑排水设施需进一步加强，防止边坡塌方。",
      plan: "下周计划进行外墙真石漆打样及大面积喷涂作业。"
    };

    setTimeout(() => {
      if (field === 'progress') setProgress(prev => prev + (prev ? " " : "") + phrases.progress);
      if (field === 'risks') setRisks(prev => prev + (prev ? " " : "") + phrases.risks);
      if (field === 'plan') setPlan(prev => prev + (prev ? " " : "") + phrases.plan);
      setRecordingField(null);
    }, 1500);
  };

  const VoiceButton = ({ field }: { field: 'progress' | 'risks' | 'plan' }) => (
    <button 
      type="button" 
      onClick={() => simulateVoiceInput(field)}
      className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-all ${recordingField === field ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005.93 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" />
      </svg>
      {recordingField === field ? '录音中...' : '语音录入'}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-[#1a1c1e] text-white p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{editTarget ? '编辑工作记录' : '新增本周工作进展'}</h2>
            <p className="text-xs text-gray-400">系统将根据这些信息智能生成周报</p>
          </div>
          <div className="flex items-center gap-3">
            {!editTarget && (
              <button 
                type="button" 
                onClick={importLastWeek}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                导入上周内容
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                1. 本周核心进展
                <VoiceButton field="progress" />
              </label>
              <textarea 
                required
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="详细描述本周完成的工作节点..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                2. 风险与遗留问题
                <VoiceButton field="risks" />
              </label>
              <textarea 
                value={risks}
                onChange={(e) => setRisks(e.target.value)}
                placeholder="识别到的风险或进度阻碍..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                3. 下周工作计划
                <VoiceButton field="plan" />
              </label>
              <textarea 
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="计划下周完成的任务..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-700">风险评估：</span>
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setRiskLevel(level)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 ${
                  riskLevel === level 
                  ? level === 'low' ? 'bg-green-100 border-green-500 text-green-700' : 
                    level === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' : 
                    'bg-red-100 border-red-500 text-red-700'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                }`}
              >
                {level === 'low' ? '低风险' : level === 'medium' ? '中风险' : '高风险'}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              {editTarget ? '保存修改' : '确认提交'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-8 bg-gray-100 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all"
            >
              关闭
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeeklyEntryModal;
