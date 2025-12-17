/**
 * 类型定义
 */

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  thinkingPhase?: ThinkingPhase;
  followUpQuestions?: string[];
}

export type ThinkingPhase = 
  | "drafting"      // 写草稿中 (三段式第一步)
  | "thinking"      // 思考中 (思考模型)
  | "questioning"   // 自我质疑中
  | "polishing"     // 打磨中
  | "complete";     // 完成

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  username: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  followUpPrompt: string;
  recommendedQuestions: string[];
  enableThreePhase: boolean;
  enableAIGeneratedQuestions: boolean;
  streamSpeed: "slow" | "medium" | "fast";
  markdownSafetyLevel: "strict" | "normal" | "loose";
  temperature: number;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

// API 请求类型
export interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  apiKey: string;
  model: string;
  systemPrompt: string;
  phase: "drafting" | "questioning" | "polishing";
  username?: string;
  temperature?: number;
}

export interface FollowUpRequest {
  context: string;
  apiKey: string;
  model: string;
  followUpPrompt: string;
}

export interface GenerateQuestionsRequest {
  apiKey: string;
  model: string;
  referenceQuestions: string[];
}
