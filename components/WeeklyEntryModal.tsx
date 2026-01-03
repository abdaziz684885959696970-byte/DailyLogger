
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { WeeklyEntry } from '../types';

interface WeeklyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTarget?: WeeklyEntry | null;
}

const DoodlePad: React.FC<{ onSave: (data: string) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? (e.touches[0].clientX - rect.left) : ((e as React.MouseEvent).clientX - rect.left);
    const y = ('touches' in e) ? (e.touches[0].clientY - rect.top) : ((e as React.MouseEvent).clientY - rect.top);

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-lg shadow-2xl">
        <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
          <h3 className="font-bold">现场简易涂鸦/草图</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-black">✕</button>
        </div>
        <div className="p-4 bg-white flex justify-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={300}
            className="w-full bg-white border border-gray-200 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="p-4 bg-gray-50 flex gap-2">
          <button onClick={clear} className="px-4 py-2 bg-gray-200 rounded font-bold text-sm">清除</button>
          <div className="flex-1"></div>
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 font-bold text-sm">取消</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded font-bold text-sm shadow-md">保存涂鸦</button>
        </div>
      </div>
    </div>
  );
};

const WeeklyEntryModal: React.FC<WeeklyEntryModalProps> = ({ isOpen, onClose, onSuccess, editTarget }) => {
  const [progress, setProgress] = useState('');
  const [risks, setRisks] = useState('');
  const [plan, setPlan] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [doodle, setDoodle] = useState<string | undefined>(undefined);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [showDoodlePad, setShowDoodlePad] = useState(false);

  const progressRef = useRef<HTMLTextAreaElement>(null);
  const risksRef = useRef<HTMLTextAreaElement>(null);
  const planRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editTarget) {
      setProgress(editTarget.progress);
      setRisks(editTarget.risks);
      setPlan(editTarget.plan);
      setRiskLevel(editTarget.riskLevel);
      setDoodle(editTarget.doodle);
    } else {
      setProgress('');
      setRisks('');
      setPlan('');
      setRiskLevel('low');
      setDoodle(undefined);
    }
  }, [editTarget, isOpen]);

  if (!isOpen) return null;

  const wrapSelection = (field: 'progress' | 'risks' | 'plan', prefix: string, suffix: string) => {
    const ref = field === 'progress' ? progressRef : field === 'risks' ? risksRef : planRef;
    const value = field === 'progress' ? progress : field === 'risks' ? risks : plan;
    const setValue = field === 'progress' ? setProgress : field === 'risks' ? setRisks : setPlan;

    if (ref.current) {
      const start = ref.current.selectionStart;
      const end = ref.current.selectionEnd;
      const selection = value.substring(start, end);
      const newValue = value.substring(0, start) + prefix + selection + suffix + value.substring(end);
      setValue(newValue);
      
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus();
          ref.current.setSelectionRange(start + prefix.length, end + prefix.length);
        }
      }, 0);
    }
  };

  const insertSymbol = (field: 'progress' | 'risks' | 'plan', symbol: string) => {
    const ref = field === 'progress' ? progressRef : field === 'risks' ? risksRef : planRef;
    const value = field === 'progress' ? progress : field === 'risks' ? risks : plan;
    const setValue = field === 'progress' ? setProgress : field === 'risks' ? setRisks : setPlan;

    if (ref.current) {
      const start = ref.current.selectionStart;
      const end = ref.current.selectionEnd;
      const newValue = value.substring(0, start) + symbol + value.substring(end);
      setValue(newValue);
      
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus();
          ref.current.setSelectionRange(start + symbol.length, start + symbol.length);
        }
      }, 0);
    }
  };

  const insertLink = (field: 'progress' | 'risks' | 'plan') => {
    const url = prompt("请输入网页链接地址:", "https://");
    if (url) {
      wrapSelection(field, "[链接文字](", `|${url})`);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const now = new Date();
    const weekRange = editTarget?.weekRange || `第 ${Math.ceil(now.getDate() / 7)} 周 (${now.getMonth() + 1}月)`;
    
    if (editTarget) {
      storageService.updateEntry(editTarget.id, {
        progress,
        risks,
        plan,
        riskLevel,
        doodle
      });
    } else {
      storageService.saveEntry({ 
        progress, 
        risks, 
        plan, 
        weekRange,
        riskLevel,
        doodle
      });
    }
    
    onSuccess();
    onClose();
  };

  const simulateVoiceInput = (field: 'progress' | 'risks' | 'plan') => {
    setRecordingField(field);
    const phrases = {
      progress: "本周主体结构验收顺利完成，二次结构砌筑已进场。",
      risks: "雨季即将来临，深基坑排水设施需进一步加强，防止边坡塌方。",
      plan: "下周计划进行外墙真石漆打样及大面积喷涂作业。"
    };

    setTimeout(() => {
      if (field === 'progress') setProgress(prev => prev + (prev ? "\n" : "") + phrases.progress);
      if (field === 'risks') setRisks(prev => prev + (prev ? "\n" : "") + phrases.risks);
      if (field === 'plan') setPlan(prev => prev + (prev ? "\n" : "") + phrases.plan);
      setRecordingField(null);
    }, 1500);
  };

  const FormatToolbar = ({ field }: { field: 'progress' | 'risks' | 'plan' }) => (
    <div className="flex flex-wrap items-center gap-1 mb-1 p-1 bg-gray-100 rounded-t-lg border-x border-t border-gray-200">
      <button type="button" onClick={() => wrapSelection(field, '**', '**')} className="p-1 px-2 hover:bg-white rounded text-xs font-black text-gray-700" title="加粗">B</button>
      <button type="button" onClick={() => wrapSelection(field, '<color:red>', '</color>')} className="p-1 px-2 hover:bg-white rounded text-xs font-bold text-red-600" title="红色文字">A</button>
      <button type="button" onClick={() => wrapSelection(field, '<color:blue>', '</color>')} className="p-1 px-2 hover:bg-white rounded text-xs font-bold text-blue-600" title="蓝色文字">A</button>
      <button type="button" onClick={() => insertLink(field)} className="p-1 px-2 hover:bg-white rounded text-xs font-bold text-gray-600" title="网页链接">🔗 链接</button>
      <div className="w-px h-4 bg-gray-300 mx-1"></div>
      <button type="button" onClick={() => insertSymbol(field, '• ')} className="p-1 px-2 hover:bg-white rounded text-xs font-bold text-gray-600">• 点</button>
      <button type="button" onClick={() => insertSymbol(field, '□ ')} className="p-1 px-2 hover:bg-white rounded text-xs font-bold text-gray-600">□ 框</button>
      <button type="button" onClick={() => insertSymbol(field, '✔ ')} className="p-1 px-2 hover:bg-white rounded text-xs font-bold text-green-600">✔</button>
      <button type="button" onClick={() => insertSymbol(field, '【重点】')} className="p-1 px-2 hover:bg-white rounded text-xs font-bold text-gray-600">【标题】</button>
      <div className="flex-1 min-w-[20px]"></div>
      <button 
        type="button" 
        onClick={() => simulateVoiceInput(field)}
        className={`text-[10px] px-2 py-1 rounded-full flex items-center gap-1 transition-all ${recordingField === field ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-blue-600 border border-blue-200'}`}
      >
        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005.93 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" />
        </svg>
        {recordingField === field ? '录音中...' : '语音录入'}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-[#1a1c1e] text-white p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{editTarget ? '编辑工作记录' : '新增本周工作进展'}</h2>
            <p className="text-xs text-gray-400">记录您的工程节点、风险和计划</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => setShowDoodlePad(true)}
              className={`text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors ${doodle ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {doodle ? '已添加涂鸦' : '现场涂鸦'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {doodle && (
            <div className="relative group w-40 h-24 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <img src={doodle} alt="doodle" className="w-full h-full object-contain" />
              <button 
                type="button" 
                onClick={() => setDoodle(undefined)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-0 left-0 w-full bg-black/40 text-[8px] text-white text-center py-0.5">附件涂鸦</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">1. 本周核心进展</label>
              <FormatToolbar field="progress" />
              <textarea 
                ref={progressRef}
                required
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="支持 Markdown 格式，记录本周详细成果..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-b-lg focus:ring-2 focus:ring-blue-500 min-h-[160px] text-sm leading-relaxed whitespace-pre-wrap"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">2. 风险与遗留问题</label>
              <FormatToolbar field="risks" />
              <textarea 
                ref={risksRef}
                value={risks}
                onChange={(e) => setRisks(e.target.value)}
                placeholder="列出工期风险、材料短缺、技术难点..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-b-lg focus:ring-2 focus:ring-blue-500 min-h-[120px] text-sm leading-relaxed whitespace-pre-wrap"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">3. 下周工作计划</label>
              <FormatToolbar field="plan" />
              <textarea 
                ref={planRef}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="推演下周的核心施工路径..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-b-lg focus:ring-2 focus:ring-blue-500 min-h-[120px] text-sm leading-relaxed whitespace-pre-wrap"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-700">风险等级：</span>
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setRiskLevel(level)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all border-2 ${
                  riskLevel === level 
                  ? level === 'low' ? 'bg-green-100 border-green-500 text-green-700' : 
                    level === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' : 
                    'bg-red-100 border-red-500 text-red-700'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                }`}
              >
                {level === 'low' ? '低 (可控)' : level === 'medium' ? '中 (预警)' : '高 (严重)'}
              </button>
            ))}
          </div>

          <div className="flex gap-4 pt-2">
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
              取消
            </button>
          </div>
        </form>
      </div>

      {showDoodlePad && (
        <DoodlePad 
          onSave={(data) => {
            setDoodle(data);
            setShowDoodlePad(false);
          }} 
          onCancel={() => setShowDoodlePad(false)} 
        />
      )}
    </div>
  );
};

export default WeeklyEntryModal;
