import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/config";
import type { Conversation, Message, Settings, ThinkingPhase } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ============================================
// 工具函数
// ============================================

/** 生成唯一的消息 ID */
function generateMessageId(role: "user" | "assistant"): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${role}`;
}

/** 生成对话标题 */
function generateConversationTitle(content: string): string {
  const maxLength = 20;
  return content.length > maxLength
    ? content.slice(0, maxLength) + "..."
    : content;
}

interface AppState {
  // 会话相关
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // UI 状态
  isMenuOpen: boolean;
  isSettingsOpen: boolean;
  
  // 流式输出状态
  isStreaming: boolean;
  currentPhase: ThinkingPhase | null;
  streamingContent: string;
  
  // 设置
  settings: Settings;
  
  // 会话操作
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  setCurrentConversation: (id: string | null) => void;
  
  // 消息操作
  addMessage: (conversationId: string, message: Omit<Message, "id" | "timestamp">) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  
  // UI 操作
  setMenuOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  
  // 流式输出操作
  setStreaming: (streaming: boolean) => void;
  setCurrentPhase: (phase: ThinkingPhase | null) => void;
  setStreamingContent: (content: string) => void;
  
  // 设置操作
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      conversations: [],
      currentConversationId: null,
      isMenuOpen: false,
      isSettingsOpen: false,
      isStreaming: false,
      currentPhase: null,
      streamingContent: "",
      settings: DEFAULT_SETTINGS,

      createConversation: () => {
        const id = `conv_${Date.now()}`;
        const newConversation: Conversation = {
          id,
          title: "新对话",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId:
            state.currentConversationId === id ? null : state.currentConversationId,
        })),

      clearAllConversations: () =>
        set((state) => ({
          conversations: [],
          currentConversationId: null,
        })),

      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },

      addMessage: (conversationId, message) => {
        const newMessage: Message = {
          ...message,
          id: generateMessageId(message.role),
          timestamp: Date.now(),
        };
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  title: conv.messages.length === 0 && message.role === "user" 
                    ? generateConversationTitle(message.content)
                    : conv.title,
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      updateMessage: (conversationId, messageId, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      deleteMessage: (conversationId, messageId) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.filter((msg) => msg.id !== messageId),
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      setMenuOpen: (open) => set({ isMenuOpen: open }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      setStreamingContent: (content) => set({ streamingContent: content }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: STORAGE_KEYS.appState,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        settings: state.settings,
      }),
    }
  )
);

// ============================================
// 辅助选择器 Hooks
// ============================================

/** 获取当前会话（memo化） */
export const useCurrentConversation = () => {
  return useAppStore((state) => {
    const { conversations, currentConversationId } = state;
    return conversations.find((c) => c.id === currentConversationId) || null;
  });
};

/** 获取设置（memo化） */
export const useSettings = () => useAppStore((state) => state.settings);

/** 获取流式输出状态 */
export const useStreamingState = () =>
  useAppStore((state) => ({
    isStreaming: state.isStreaming,
    currentPhase: state.currentPhase,
    streamingContent: state.streamingContent,
  }));

/** 获取 UI 状态 */
export const useUIState = () =>
  useAppStore((state) => ({
    isMenuOpen: state.isMenuOpen,
    isSettingsOpen: state.isSettingsOpen,
  }));
