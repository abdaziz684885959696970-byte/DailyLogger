
import { GoogleGenAI, Type } from "@google/genai";
import { WeeklyEntry, IngestedDoc } from "../types";

export const geminiService = {
  generateWeeklyReport: async (entries: WeeklyEntry[], docs: IngestedDoc[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const entriesSummary = entries.map(e => 
      `周次: ${e.weekRange}\n进展: ${e.progress}\n风险项: ${e.risks} (等级: ${e.riskLevel})\n计划: ${e.plan}`
    ).join('\n---\n');

    const docsSummary = docs.map(d => 
      `参考文件: ${d.name}\n分析摘要: ${d.content}`
    ).join('\n---\n');

    const prompt = `
      请作为高级工程监理，根据以下每周工作记录和工程素材，整理并生成一份正式的【工程周报】。
      
      【本周工作进展记录】
      ${entriesSummary}
      
      【工程素材库支持】
      ${docsSummary}
      
      生成要求：
      1. 工作回顾：请使用标准工程语言，将口语化的进展描述重构为专业的技术汇报语言。
      2. 风险预警 (Critical Risks)：必须对记录中提到的风险进行分级分析，结合素材库中的延误、变更指令等信息，给出应对方案。
      3. 下周施工重点：基于当前进度和遗留问题，合理推演下周的核心施工任务。
      
      输出格式：Markdown，包含“一、本周工作回顾”、“二、风险评估与对策”、“三、下周工作计划”。
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      return response.text || "生成失败。";
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("AI 报告生成失败，请检查 API 配置。");
    }
  },

  extractFileInfo: async (fileName: string, rawText: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `分析工程文档 (${fileName})，提取核心工程关键信息（如：设备到货、施工节点延误、变更、决策）。
    
    内容：
    ${rawText}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "无关键信息";
    } catch (error) {
      return "提取失败";
    }
  }
};
