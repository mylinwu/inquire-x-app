/**
 * API 服务层
 * - 使用 @openrouter/ai-sdk-provider 和 AI SDK 处理所有 AI 请求
 * - generateText: 非流式文本生成（聊天、追问、推荐问题等）
 */

import { OPENROUTER_API_URL, PHASE_PROMPTS } from "@/config";
import type { Settings } from "@/types";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { generateText } from "ai";

// ============================================
// 常量定义
// ============================================

/** 默认温度参数 */
const DEFAULT_FOLLOW_UP_TEMPERATURE = 1.0;

/** 问题生成数量 */
const DEFAULT_QUESTION_COUNT = 6;
const FOLLOW_UP_QUESTION_COUNT = 3;

// ============================================
// 工具函数
// ============================================

/** 验证必要的 API 参数 */
function validateApiSettings(settings: Settings): void {
  if (!settings.apiKey) {
    throw new Error("API Key 未配置");
  }
  if (!settings.model) {
    throw new Error("模型未选择");
  }
}

/** 创建 OpenRouter 模型实例 */
function createModel(settings: Settings): LanguageModel {
  validateApiSettings(settings);
  const openrouter = createOpenRouter({ apiKey: settings.apiKey });
  return openrouter(settings.model);
}

/** 统一的错误处理 */
function handleApiError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : "请求失败";
  console.error(`[${context}] Error:`, message);
  
  if (error instanceof Error) {
    console.error(`[${context}] Stack:`, error.stack);
  }
  
  throw new Error(`${context}失败: ${message}`);
}

// ============================================
// 时间格式化
// ============================================

/** 格式化当前时间为中文格式 */
export function formatCurrentTime(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };
  return now.toLocaleString("zh-CN", options);
}

// ============================================
// Chat API - 流式响应
// ============================================

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatStreamCallbacks {
  onText: (text: string) => void;
  onReasoning?: () => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(
  settings: Settings,
  phase: "drafting" | "questioning" | "polishing"
): string {
  let prompt = settings.systemPrompt;
  
  // 添加用户称呼
  if (settings.username) {
    prompt = prompt.replace(/{username}/g, settings.username);
    prompt = `你可以称呼我为"${settings.username}"。\n\n${prompt}`;
  }
  
  // 添加当前时间
  const currentTime = formatCurrentTime();
  prompt = `当前时间：${currentTime}\n\n${prompt}`;
  
  // 添加阶段提示词
  prompt += `\n\n${PHASE_PROMPTS[phase]}`;
  
  return prompt;
}

/**
 * 发送聊天请求（非流式）
 * 注：使用 generateText 以确保 React Native 兼容性
 */
export async function streamChat(
  messages: ChatMessage[],
  settings: Settings,
  phase: "drafting" | "questioning" | "polishing",
  callbacks: ChatStreamCallbacks
): Promise<void> {
  try {
    const model = createModel(settings);
    const systemPrompt = buildSystemPrompt(settings, phase);

    console.log("[streamChat] 发送请求:", {
      model: settings.model,
      temperature: settings.temperature,
      messageCount: messages.length,
    });

    const result = await generateText({
      model,
      system: systemPrompt,
      messages,
      temperature: settings.temperature,
    });

    callbacks.onText(result.text);
    callbacks.onComplete?.();
  } catch (error) {
    const message = error instanceof Error ? error.message : "请求失败";
    callbacks.onError?.(message);
    handleApiError(error, "streamChat");
  }
}

// ============================================
// Follow-up Questions API
// ============================================

/**
 * 解析生成的问题列表
 */
function parseQuestions(text: string, maxCount: number, removeNumbering = false): string[] {
  return text
    .split("\n")
    .map((q) => q.trim())
    .filter((q) => {
      if (!q || q.length === 0) return false;
      if (removeNumbering && /^\d+\./.test(q)) return false;
      return true;
    })
    .slice(0, maxCount);
}

export async function generateFollowUpQuestions(
  context: string,
  settings: Settings
): Promise<string[]> {
  try {
    const model = createModel(settings);
    
    const result = await generateText({
      model,
      system: settings.followUpPrompt,
      prompt: `以下是对话内容：

${context}

请基于此生成三个追问问题。`,
      temperature: DEFAULT_FOLLOW_UP_TEMPERATURE,
    });

    return parseQuestions(result.text, FOLLOW_UP_QUESTION_COUNT);
  } catch (error) {
    handleApiError(error, "generateFollowUpQuestions");
  }
}

// ============================================
// Generate Questions API
// ============================================

export async function generateRecommendedQuestions(
  referenceQuestions: string[],
  settings: Settings
): Promise<string[]> {
  try {
    const model = createModel(settings);
    
    const prompt = `你是一个创意问题生成器。请参考以下问题的风格和主题，生成${DEFAULT_QUESTION_COUNT}个新的、有启发性、是用户可以问 AI 的问题。

参考问题风格：
${referenceQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

要求：
1. 保持类似的风格和语气
2. 问题要简短精炼
3. 每个问题独立成行
4. 不要编号，直接输出问题内容
5. 生成${DEFAULT_QUESTION_COUNT}个问题

请直接输出${DEFAULT_QUESTION_COUNT}个问题，每行一个：`;
    
    const result = await generateText({
      model,
      prompt,
      temperature: DEFAULT_FOLLOW_UP_TEMPERATURE,
    });

    return parseQuestions(result.text, DEFAULT_QUESTION_COUNT, true);
  } catch (error) {
    handleApiError(error, "generateRecommendedQuestions");
  }
}

// ============================================
// Models API
// ============================================

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

export async function fetchModels(apiKey: string): Promise<OpenRouterModel[]> {
  try {
    if (!apiKey) {
      throw new Error("API Key 未配置");
    }

    const response = await fetch(`${OPENROUTER_API_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text.substring(0, 100);
        } catch {}
      }

      if (response.status === 401) {
        throw new Error(`API Key 无效或已过期: ${errorMessage}`);
      }
      throw new Error(`获取模型列表失败: ${errorMessage}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.data)) {
      throw new Error("API 返回的模型列表格式错误");
    }

    return data.data.map((m: OpenRouterModel) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      context_length: m.context_length,
      pricing: m.pricing,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取模型列表失败";
    console.error("[fetchModels] Error:", message);
    throw new Error(message);
  }
}
