
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { IngestedDoc } from '../types';

const DocumentIngestor: React.FC = () => {
  const [docs, setDocs] = useState<IngestedDoc[]>(storageService.getDocs());
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    for (const file of Array.from(files)) {
      // In a real environment, we'd use Mammoth for DOCX and XLSX for Excel
      // Here we simulate content extraction for the demo
      const simulatedContent = `[模拟文档解析内容] 
      项目: ${file.name}
      关键节点: 2023-11-20 设备到货。
      风险提示: 暖通工程师反馈由于供应链原因，风机盘管可能延期3周。
      变更指令: 甲方要求在B区增设三个临时强电箱。`;

      const analysis = await geminiService.extractFileInfo(file.name, simulatedContent);
      
      const newDoc = storageService.saveDoc({
        name: file.name,
        type: file.name.split('.').pop() || 'Unknown',
        content: analysis
      });
      setDocs(prev => [newDoc, ...prev]);
    }
    setIsUploading(false);
  };

  const deleteDoc = (id: string) => {
    storageService.deleteDoc(id);
    setDocs(storageService.getDocs());
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">素材库 (文档智能吸收)</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 transition-colors hover:bg-gray-100 hover:border-blue-400">
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600 font-medium mb-1">拖拽或点击上传</p>
          <p className="text-gray-400 text-sm mb-4">支持 Excel (进度表), Word (会议纪要), PDF</p>
          <input 
            type="file" 
            multiple 
            onChange={handleFileUpload} 
            className="hidden" 
            id="file-upload" 
          />
          <label 
            htmlFor="file-upload" 
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md cursor-pointer transition-transform active:scale-95 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isUploading ? '正在分析智能内容...' : '选择文件'}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map(doc => (
          <div key={doc.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative group">
            <button 
              onClick={() => deleteDoc(doc.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                {doc.type}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-gray-800 truncate" title={doc.name}>{doc.name}</h3>
                <p className="text-xs text-gray-400">{new Date(doc.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded h-32 overflow-y-auto border border-gray-100">
              {doc.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentIngestor;
