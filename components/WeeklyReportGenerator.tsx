
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';

const WeeklyReportGenerator: React.FC = () => {
  const [report, setReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateReport = async () => {
    const logs = storageService.getEntries().slice(0, 5); 
    const docs = storageService.getDocs();
    
    if (logs.length === 0) {
      alert("没有足够的打卡记录。请先进行每周打卡。");
      return;
    }

    setIsGenerating(true);
    try {
      const content = await geminiService.generateWeeklyReport(logs, docs);
      setReport(content);
      storageService.saveReport(content);
    } catch (err) {
      alert(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReportChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReport(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1c1e] text-white p-10 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl border border-gray-800">
        <h2 className="text-3xl font-black mb-4">智能 AI 周报生成器</h2>
        <p className="text-gray-400 mb-8 max-w-xl">
          基于过去5周的记录和素材库，自动润色专业术语，识别潜在风险，并推演下周工程计划。
        </p>
        <button 
          onClick={generateReport}
          disabled={isGenerating}
          className={`px-12 py-4 rounded-xl font-black text-xl flex items-center gap-3 transition-all duration-300 shadow-2xl ${
            isGenerating 
            ? 'bg-gray-700 cursor-not-allowed opacity-50' 
            : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在深度分析并撰写报告...
            </>
          ) : (
            <>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              一键生成专业周报
            </>
          )}
        </button>
      </div>

      {report && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              周报内容编辑与预览
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  copySuccess ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copySuccess ? '已复制' : '复制全文'}
              </button>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={report}
              onChange={handleReportChange}
              className="w-full min-h-[500px] p-6 text-gray-800 text-lg leading-relaxed bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-sans"
              placeholder="AI 生成的内容将显示在这里，您可以直接进行修改..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReportGenerator;
