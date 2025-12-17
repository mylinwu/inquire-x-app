/**
 * ChatList 组件 - 消息列表
 */

import { Spacing } from "@/constants/theme";
import type { Message } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ChatMessage } from "./ChatMessage";

interface ChatListProps {
  messages: Message[];
  isStreaming?: boolean;
  onFollowUpClick?: (question: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export function ChatList({ 
  messages, 
  isStreaming, 
  onFollowUpClick, 
  onRegenerate 
}: ChatListProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 检测滚动位置是否在底部
  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const atBottom = contentSize.height - contentOffset.y - layoutMeasurement.height < 50;
    setIsAtBottom(atBottom);
  };

  // 仅在滚动条在底部时自动滚动
  useEffect(() => {
    if (isAtBottom && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isStreaming, isAtBottom]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          isStreaming={isStreaming && index === messages.length - 1 && message.role === "assistant"}
          onFollowUpClick={onFollowUpClick}
          onRegenerate={onRegenerate}
        />
      ))}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: Spacing.md,
  },
  bottomPadding: {
    height: Spacing.md,
  },
});
