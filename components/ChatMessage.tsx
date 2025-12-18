/**
 * ChatMessage 组件 - 单条消息
 */

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import type { Message } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { MarkdownRenderer, ThinkingIndicator } from "./MarkdownRenderer";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onFollowUpClick?: (question: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export function ChatMessage({ 
  message, 
  isStreaming, 
  onFollowUpClick, 
  onRegenerate 
}: ChatMessageProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  
  const isUser = message.role === "user";
  const showThinking = !isUser && message.thinkingPhase && message.thinkingPhase !== "complete";
  const showRegenerate = !isUser && message.thinkingPhase === "complete" && !isStreaming;

  return (
    <View style={[styles.container, isUser ? styles.containerUser : styles.containerAi]}>
      <View style={[styles.bubbleContainer, isUser ? styles.bubbleContainerUser : styles.bubbleContainerAi]}>
        {/* 消息气泡 */}
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: colors.bubbleUser }]
              : [styles.bubbleAi, { backgroundColor: colors.bubbleAi, borderColor: colors.border }],
          ]}
        >
          {showThinking && (
            <ThinkingIndicator phase={message.thinkingPhase || null} />
          )}

          {isUser ? (
            <ThemedText style={[styles.userText, { color: colors.bubbleUserText }]}>
              {message.content}
            </ThemedText>
          ) : (
            <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
          )}
        </View>

        {/* 重新生成按钮 */}
        {showRegenerate && (
          <TouchableOpacity
            onPress={() => onRegenerate?.(message.id)}
            style={styles.regenerateButton}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={12} color={colors.mutedForeground} />
            <ThemedText style={[styles.regenerateText, { color: colors.mutedForeground }]}>
              重新生成
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* 追问问题 */}
        {!isUser &&
          message.followUpQuestions &&
          message.followUpQuestions.length > 0 &&
          message.thinkingPhase === "complete" && (
            <View style={styles.followUpContainer}>
              {message.followUpQuestions.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => onFollowUpClick?.(q)}
                  style={[
                    styles.followUpButton,
                    { backgroundColor: colorScheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" },
                  ]}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[styles.followUpText, { color: colors.mutedForeground }]}>
                    {q}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  containerUser: {
    justifyContent: "flex-end",
  },
  containerAi: {
    justifyContent: "flex-start",
  },
  bubbleContainer: {
    maxWidth: "95%",
  },
  bubbleContainerUser: {
    alignItems: "flex-end",
  },
  bubbleContainerAi: {
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  bubbleUser: {
    borderTopRightRadius: 4,
  },
  bubbleAi: {
    borderTopLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  userText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  regenerateText: {
    fontSize: FontSize.xs,
  },
  followUpContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  followUpButton: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  followUpText: {
    fontSize: FontSize.xs,
  },
});
