/**
 * MarkdownRenderer 组件 - Markdown 渲染
 */

import { ThemedText } from "@/components/themed-text";
import { PHASE_LABELS } from "@/config";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import type { ThinkingPhase } from "@/types";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";
import Markdown from "react-native-markdown-display";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

// 动画配置常量
const FADE_ANIMATION_DURATION = 150;
const FADE_INTERVAL = 80;

export function MarkdownRenderer({ content, isStreaming = false }: MarkdownRendererProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  
  // 动画值：用于渐入效果
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const lastContentLength = useRef(content.length);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 当内容更新且正在流式输出时，触发渐入动画
  useEffect(() => {
    if (isStreaming && content.length > lastContentLength.current) {
      // 清除之前的动画定时器
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
      
      // 短暂降低透明度然后渐入
      fadeAnim.setValue(0.7);
      
      animationTimeout.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: FADE_ANIMATION_DURATION,
          useNativeDriver: true,
        }).start();
      }, FADE_INTERVAL);
    }
    
    lastContentLength.current = content.length;
    
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, [content, isStreaming, fadeAnim]);

  const markdownStyles = {
    body: {
      color: colors.text,
      fontSize: FontSize.md,
      lineHeight: 24,
    },
    heading1: {
      color: colors.text,
      fontSize: FontSize.xl,
      fontWeight: "600" as const,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    heading2: {
      color: colors.text,
      fontSize: FontSize.lg,
      fontWeight: "600" as const,
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
    },
    heading3: {
      color: colors.text,
      fontSize: FontSize.md,
      fontWeight: "600" as const,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
    },
    paragraph: {
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    bullet_list: {
      marginBottom: Spacing.sm,
    },
    ordered_list: {
      marginBottom: Spacing.sm,
    },
    list_item: {
      marginBottom: Spacing.xs,
    },
    code_inline: {
      backgroundColor: colorScheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      color: colors.text,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: "monospace",
      fontSize: FontSize.sm,
    },
    fence: {
      backgroundColor: colorScheme === "dark" ? "#161b22" : "#f6f8fa",
      borderRadius: BorderRadius.sm,
      padding: Spacing.sm,
      marginVertical: Spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    code_block: {
      backgroundColor: colorScheme === "dark" ? "#161b22" : "#f6f8fa",
      color: colors.text,
      fontFamily: "monospace",
      fontSize: FontSize.sm,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      paddingLeft: Spacing.md,
      marginVertical: Spacing.sm,
      opacity: 0.8,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: Spacing.md,
    },
    link: {
      color: colorScheme === "dark" ? "#7d90a9" : "#576b95",
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      marginVertical: Spacing.sm,
    },
    th: {
      backgroundColor: colors.muted,
      padding: Spacing.sm,
      fontWeight: "600" as const,
    },
    td: {
      padding: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    strong: {
      fontWeight: "600" as const,
    },
    em: {
      fontStyle: "italic" as const,
    },
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Markdown style={markdownStyles}>
        {content || " "}
      </Markdown>
    </Animated.View>
  );
}

// 状态指示器
interface ThinkingIndicatorProps {
  phase: ThinkingPhase | null;
}

export function ThinkingIndicator({ phase }: ThinkingIndicatorProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  if (!phase || phase === "complete") return null;

  return (
    <View style={styles.thinkingContainer}>
      <View style={[styles.thinkingDot, { backgroundColor: colors.primary }]}>
        <View style={[styles.thinkingDotPing, { backgroundColor: colors.primary }]} />
      </View>
      <ThemedText style={[styles.thinkingText, { color: colors.mutedForeground }]}>
        {PHASE_LABELS[phase] || "处理中"}...
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  thinkingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  thinkingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "relative",
  },
  thinkingDotPing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 5,
    opacity: 0.75,
  },
  thinkingText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
});
