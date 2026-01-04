/**
 * RecommendedQuestions 组件 - 推荐问题
 */

import { ThemedText } from "@/components/themed-text";
import { STORAGE_KEYS } from "@/config";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { generateRecommendedQuestions } from "@/services/api";
import { useSettings } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface RecommendedQuestionsProps {
  onSelect: (question: string) => void;
}

export function RecommendedQuestions({ onSelect }: RecommendedQuestionsProps) {
  const settings = useSettings();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cacheChecked, setCacheChecked] = useState(false);

  // 组件挂载时检查缓存状态
  useEffect(() => {
    const loadCachedQuestions = async () => {
      if (settings.enableAIGeneratedQuestions) {
        try {
          const cached = await AsyncStorage.getItem(STORAGE_KEYS.aiQuestions);
          if (cached) {
            const parsed = JSON.parse(cached);
            setAiQuestions(parsed);
          }
        } catch {
          // 缓存解析失败，忽略
        }
      }
      setCacheChecked(true);
    };
    loadCachedQuestions();
  }, [settings.enableAIGeneratedQuestions]);

  // 生成 AI 问题（总是生成新问题并更新缓存）
  const generateQuestions = useCallback(async () => {
    if (!settings.apiKey || isGenerating) return;

    setIsGenerating(true);
    try {
      const questions = await generateRecommendedQuestions(
        settings.recommendedQuestions.filter(Boolean),
        settings
      );
      if (questions && questions.length > 0) {
        setAiQuestions(questions);
        // 更新缓存
        await AsyncStorage.setItem(STORAGE_KEYS.aiQuestions, JSON.stringify(questions));
      }
    } catch {
      // 生成失败，保持当前问题
    } finally {
      setIsGenerating(false);
    }
  }, [settings, isGenerating]);

  // 自动生成问题（仅在没有缓存时）
  useEffect(() => {
    // 只在启用AI生成、缓存已检查、没有缓存的问题、有API Key、且未在生成中时才生成
    if (settings.enableAIGeneratedQuestions && cacheChecked && aiQuestions.length === 0 && settings.apiKey && !isGenerating) {
      generateQuestions();
    }
  }, [settings.enableAIGeneratedQuestions, cacheChecked, aiQuestions.length, settings.apiKey, isGenerating, generateQuestions]);

  // 决定显示哪些问题
  const displayQuestions = settings.enableAIGeneratedQuestions
    ? (aiQuestions.length > 0 ? aiQuestions : [])
    : settings.recommendedQuestions;

  const showLoading = settings.enableAIGeneratedQuestions && isGenerating && aiQuestions.length === 0;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
          <Ionicons name="sparkles" size={32} color={colors.primary} />
        </View>
        <ThemedText style={styles.title}>开始新对话</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.mutedForeground }]}>
          选择一个启发性问题，或直接在下方输入你的想法。
        </ThemedText>
      </View>

      {/* 刷新按钮 */}
      {settings.enableAIGeneratedQuestions && aiQuestions.length > 0 && !isGenerating && (
        <TouchableOpacity
          onPress={generateQuestions}
          style={styles.refreshButton}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={12} color={colors.mutedForeground} />
          <ThemedText style={[styles.refreshText, { color: colors.mutedForeground }]}>
            换一批
          </ThemedText>
        </TouchableOpacity>
      )}

      {showLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.mutedForeground }]}>
            正在生成问题...
          </ThemedText>
        </View>
      ) : (
        <View style={styles.questionsGrid}>
          {displayQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onSelect(question)}
              style={[
                styles.questionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.questionText, { color: colors.text }]}>
                {question}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 正在刷新时显示加载指示器 */}
      {settings.enableAIGeneratedQuestions && isGenerating && aiQuestions.length > 0 && (
        <View style={styles.refreshingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <ThemedText style={[styles.refreshingText, { color: colors.mutedForeground }]}>
            正在生成新问题...
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
    transform: [{ rotate: "3deg" }],
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.sm,
    textAlign: "center",
    maxWidth: 300,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  refreshText: {
    fontSize: FontSize.xs,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
  },
  questionsGrid: {
    gap: Spacing.sm,
  },
  questionCard: {
    padding: Spacing.md,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  questionText: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  refreshingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  refreshingText: {
    fontSize: FontSize.xs,
  },
});
