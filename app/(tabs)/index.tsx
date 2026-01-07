/**
 * Inquire X - 主页面
 */

import { ChatInput } from "@/components/ChatInput";
import { ChatList } from "@/components/ChatList";
import { MenuPanel } from "@/components/MenuPanel";
import { Navbar } from "@/components/Navbar";
import { RecommendedQuestions } from "@/components/RecommendedQuestions";
import { SettingsScreen } from "@/components/SettingsScreen";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useChat } from "@/hooks/useChat";
import { useAppStore, useCurrentConversation } from "@/store";
import React, { useCallback } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, useColorScheme, View } from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const {
    isMenuOpen,
    isSettingsOpen,
    setMenuOpen,
    setSettingsOpen,
    setCurrentConversation,
  } = useAppStore();

  const conversation = useCurrentConversation();
  const { sendMessage, regenerateMessage, isStreaming, error } = useChat();

  const handleNewChat = useCallback(() => {
    setCurrentConversation(null);
  }, [setCurrentConversation]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      await sendMessage(content);
    },
    [sendMessage]
  );

  const handleSelectQuestion = useCallback(
    async (question: string) => {
      await sendMessage(question);
    },
    [sendMessage]
  );

  const handleFollowUpClick = useCallback(
    async (question: string) => {
      await sendMessage(question);
    },
    [sendMessage]
  );

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      await regenerateMessage(messageId);
    },
    [regenerateMessage]
  );

  const handleOpenSettings = useCallback(() => {
    setMenuOpen(false);
    setSettingsOpen(true);
  }, [setMenuOpen, setSettingsOpen]);

  const showEmptyState = !conversation || conversation.messages.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Navbar
        onMenuClick={() => setMenuOpen(true)}
        onNewChat={handleNewChat}
      />

      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 56 : 0}
      >
        {showEmptyState ? (
          <RecommendedQuestions onSelect={handleSelectQuestion} />
        ) : (
          <ChatList
            messages={conversation.messages}
            isStreaming={isStreaming}
            onFollowUpClick={handleFollowUpClick}
            onRegenerate={handleRegenerate}
          />
        )}

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + "15" }]}>
            <ThemedText style={[styles.errorText, { color: colors.error }]}>
              {error}
            </ThemedText>
          </View>
        )}

        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming}
        />
      </KeyboardAvoidingView>

      <MenuPanel
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenSettings={handleOpenSettings}
      />

      <SettingsScreen
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
  errorContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
});
