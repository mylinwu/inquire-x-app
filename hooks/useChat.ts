/**
 * useChat Hook - 聊天核心逻辑
 */

import { PHASE_USER_MESSAGES } from "@/config";
import { ChatMessage, generateFollowUpQuestions, streamChat } from "@/services/api";
import { useAppStore, useCurrentConversation } from "@/store";
import type { ThinkingPhase } from "@/types";
import { useCallback, useState } from "react";

// ============================================
// 工具函数
// ============================================

/** 更新消息状态的通用函数 */
function updateMessageWithPhase(
  updateMessage: (convId: string, msgId: string, updates: Partial<any>) => void,
  setCurrentPhase: (phase: ThinkingPhase | null) => void,
  convId: string,
  messageId: string,
  phase: ThinkingPhase,
  content?: string
) {
  setCurrentPhase(phase);
  updateMessage(convId, messageId, {
    ...(content !== undefined ? { content } : {}),
    thinkingPhase: phase,
  });
}

/** 清理流式输出状态 */
function cleanupStreamingState(
  setStreaming: (streaming: boolean) => void,
  setCurrentPhase: (phase: ThinkingPhase | null) => void,
  setStreamingContent: (content: string) => void
) {
  setStreaming(false);
  setCurrentPhase(null);
  setStreamingContent("");
}

/** 获取最新的消息ID */
function getLatestMessageId(convId: string): string {
  const conv = useAppStore.getState().conversations.find((c) => c.id === convId);
  const lastMessage = conv?.messages[conv.messages.length - 1];
  return lastMessage?.id || `msg_${Date.now()}_ai`;
}

export function useChat() {
  const {
    settings,
    isStreaming,
    currentPhase,
    streamingContent,
    setStreaming,
    setCurrentPhase,
    setStreamingContent,
    addMessage,
    updateMessage,
    deleteMessage,
    createConversation,
    currentConversationId,
  } = useAppStore();

  const conversation = useCurrentConversation();
  const [error, setError] = useState<string | null>(null);

  const runThreePhaseChat = useCallback(
    async (
      convId: string,
      messageId: string,
      messages: ChatMessage[]
    ) => {
      const phases: ThinkingPhase[] = ["drafting", "questioning", "polishing"];
      let accumulatedContent = "";
      let finalContent = "";

      for (const phase of phases) {
        updateMessageWithPhase(updateMessage, setCurrentPhase, convId, messageId, phase);

        const phaseMessages: ChatMessage[] =
          phase === "drafting"
            ? messages
            : [
                ...messages,
                { role: "assistant" as const, content: accumulatedContent },
                {
                  role: "user" as const,
                  content: PHASE_USER_MESSAGES[phase as keyof typeof PHASE_USER_MESSAGES],
                },
              ];

        let phaseContent = "";

        await streamChat(
          phaseMessages,
          settings,
          phase as "drafting" | "questioning" | "polishing",
          {
            onText: (text) => {
              phaseContent += text;
              if (phase === "polishing") {
                finalContent = phaseContent;
                setStreamingContent(finalContent);
                updateMessage(convId, messageId, { content: finalContent });
              }
            },
            onReasoning: () => {
              updateMessageWithPhase(updateMessage, setCurrentPhase, convId, messageId, "thinking");
            },
          }
        );

        accumulatedContent += `

---

${phaseContent}`;
      }

      updateMessage(convId, messageId, {
        content: finalContent,
        thinkingPhase: "complete",
      });
    },
    [settings, setCurrentPhase, updateMessage, setStreamingContent]
  );

  const runSingleChat = useCallback(
    async (
      convId: string,
      messageId: string,
      messages: ChatMessage[]
    ) => {
      updateMessageWithPhase(updateMessage, setCurrentPhase, convId, messageId, "polishing");

      let content = "";
      let isReasoning = false;

      await streamChat(messages, settings, "polishing", {
        onText: (text) => {
          if (isReasoning) {
            isReasoning = false;
            updateMessageWithPhase(updateMessage, setCurrentPhase, convId, messageId, "polishing", content);
          }
          content += text;
          setStreamingContent(content);
          updateMessage(convId, messageId, { content });
        },
        onReasoning: () => {
          if (!isReasoning) {
            isReasoning = true;
            updateMessageWithPhase(updateMessage, setCurrentPhase, convId, messageId, "thinking");
          }
        },
      });

      updateMessage(convId, messageId, {
        content,
        thinkingPhase: "complete",
      });
    },
    [settings, setCurrentPhase, setStreamingContent, updateMessage]
  );

  const generateFollowUp = useCallback(
    async (convId: string, messageId: string) => {
      try {
        const conv = useAppStore.getState().conversations.find((c) => c.id === convId);
        if (!conv) return;

        const context = conv.messages
          .slice(-4)
          .map((m) => `${m.role === "user" ? "用户" : "AI"}: ${m.content}`)
          .join("\n\n");

        const questions = await generateFollowUpQuestions(context, settings);
        if (questions?.length > 0) {
          updateMessage(convId, messageId, { followUpQuestions: questions });
        }
      } catch {
        // 追问生成失败不影响主流程
      }
    },
    [settings, updateMessage]
  );

  /** 处理聊天请求的核心逻辑 */
  const executeChatRequest = useCallback(
    async (
      convId: string,
      messageId: string,
      messages: ChatMessage[]
    ) => {
      try {
        if (settings.enableThreePhase) {
          await runThreePhaseChat(convId, messageId, messages);
        } else {
          await runSingleChat(convId, messageId, messages);
        }
        await generateFollowUp(convId, messageId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "请求失败");
        updateMessage(convId, messageId, {
          content: "抱歉，请求失败。请检查网络和 API Key 设置。",
          thinkingPhase: "complete",
        });
      } finally {
        cleanupStreamingState(setStreaming, setCurrentPhase, setStreamingContent);
      }
    },
    [
      settings.enableThreePhase,
      runThreePhaseChat,
      runSingleChat,
      generateFollowUp,
      setError,
      updateMessage,
      setStreaming,
      setCurrentPhase,
      setStreamingContent,
    ]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!settings.apiKey) {
        setError("请先在设置中配置 API Key");
        return;
      }

      setError(null);
      setStreaming(true);

      let convId = currentConversationId;
      if (!convId) {
        convId = createConversation();
      }

      // 添加用户消息
      addMessage(convId, { role: "user", content });

      const messages: ChatMessage[] = [
        ...(conversation?.messages || []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content },
      ];

      // 添加 AI 消息占位
      const initialPhase = settings.enableThreePhase ? "drafting" : "polishing";
      addMessage(convId, {
        role: "assistant",
        content: "",
        thinkingPhase: initialPhase,
      });

      const messageId = getLatestMessageId(convId);
      await executeChatRequest(convId, messageId, messages);
    },
    [
      settings.apiKey,
      settings.enableThreePhase,
      conversation,
      currentConversationId,
      setError,
      setStreaming,
      addMessage,
      createConversation,
      executeChatRequest,
    ]
  );

  const regenerateMessage = useCallback(
    async (messageId: string) => {
      if (!settings.apiKey || !currentConversationId) {
        setError("请先在设置中配置 API Key");
        return;
      }

      const conv = useAppStore.getState().conversations.find((c) => c.id === currentConversationId);
      if (!conv) return;

      // 找到要重新生成的消息的索引
      const messageIndex = conv.messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      // 找到这条 AI 消息之前的用户消息
      let userMessageIndex = messageIndex - 1;
      while (userMessageIndex >= 0 && conv.messages[userMessageIndex].role !== "user") {
        userMessageIndex--;
      }
      if (userMessageIndex < 0) return;

      // 删除当前 AI 消息
      deleteMessage(currentConversationId, messageId);

      setError(null);
      setStreaming(true);

      // 构建消息历史（不包含被删除的消息）
      const messages: ChatMessage[] = conv.messages
        .slice(0, messageIndex)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      // 添加新的 AI 消息占位
      const initialPhase = settings.enableThreePhase ? "drafting" : "polishing";
      addMessage(currentConversationId, {
        role: "assistant",
        content: "",
        thinkingPhase: initialPhase,
      });

      const newMessageId = getLatestMessageId(currentConversationId);
      await executeChatRequest(currentConversationId, newMessageId, messages);
    },
    [
      settings.apiKey,
      settings.enableThreePhase,
      currentConversationId,
      setError,
      setStreaming,
      addMessage,
      deleteMessage,
      executeChatRequest,
    ]
  );

  return {
    sendMessage,
    regenerateMessage,
    isStreaming,
    currentPhase,
    streamingContent,
    error,
  };
}
