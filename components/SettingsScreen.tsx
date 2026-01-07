/**
 * SettingsScreen 组件 - 设置页面
 */

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { fetchModels, OpenRouterModel } from "@/services/api";
import { useAppStore } from "@/store";
import type { Settings } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsScreen({ isOpen, onClose }: SettingsScreenProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const { settings, updateSettings, resetSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  // 获取模型列表
  const loadModels = useCallback(async () => {
    if (!localSettings.apiKey) return;
    setIsLoadingModels(true);
    try {
      const modelList = await fetchModels(localSettings.apiKey);
      setModels(modelList);
    } catch {
      // 忽略错误
    } finally {
      setIsLoadingModels(false);
    }
  }, [localSettings.apiKey]);

  useEffect(() => {
    if (localSettings.apiKey && isOpen) {
      loadModels();
    }
  }, [localSettings.apiKey, isOpen, loadModels]);

  const scrollViewRef = React.useRef<ScrollView>(null);
  const inputLayoutsRef = React.useRef<Record<string, number>>({});

  const handleInputLayout = useCallback((key: string, y: number) => {
    inputLayoutsRef.current[key] = y;
  }, []);

  const scrollToInput = useCallback((key: string) => {
    const y = inputLayoutsRef.current[key];
    if (y == null) return;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - Spacing.md), animated: true });
  }, []);

  const handleSave = () => {
    updateSettings({
      ...localSettings,
      recommendedQuestions: localSettings.recommendedQuestions
        .map((q) => q.trim())
        .filter(Boolean),
    });
    onClose();
  };

  const handleReset = () => {
    Alert.alert(
      "重置设置",
      "确定要重置所有设置吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "重置",
          style: "destructive",
          onPress: () => {
            resetSettings();
            setLocalSettings(useAppStore.getState().settings);
          },
        },
      ]
    );
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colorScheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      color: colors.text,
      fontFamily: "monospace"
    },
  ];

  const selectedModel = models.find((m) => m.id === localSettings.model);

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* 头部 */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
                paddingTop: insets.top,
              },
            ]}
          >
            <ThemedText style={styles.headerTitle}>设置</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* 内容 */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 用户名 */}
            <View
              style={styles.section}
              onLayout={(e) => handleInputLayout("username", e.nativeEvent.layout.y)}
            >
              <ThemedText style={styles.sectionTitle}>用户名称</ThemedText>
              <TextInput
                value={localSettings.username}
                onChangeText={(text) => setLocalSettings({ ...localSettings, username: text })}
                placeholder="输入你的昵称"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle}
                onFocus={() => scrollToInput("username")}
              />
              <ThemedText style={[styles.hint, { color: colors.mutedForeground }]}>
                AI 可在对话中通过 {"{username}"} 引用此名称
              </ThemedText>
            </View>

            {/* API Key */}
            <View
              style={styles.section}
              onLayout={(e) => handleInputLayout("apiKey", e.nativeEvent.layout.y)}
            >
              <ThemedText style={styles.sectionTitle}>OpenRouter API Key</ThemedText>
              <TextInput
                value={localSettings.apiKey}
                onChangeText={(text) => setLocalSettings({ ...localSettings, apiKey: text })}
                placeholder="sk-or-..."
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={[inputStyle, { fontFamily: "monospace" }]}
                onFocus={() => scrollToInput("apiKey")}
              />
              <ThemedText style={[styles.hint, { color: colors.mutedForeground }]}>
                从 openrouter.ai 获取密钥
              </ThemedText>
            </View>

          {/* 模型选择 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>AI 模型</ThemedText>
              <TouchableOpacity onPress={loadModels} disabled={!localSettings.apiKey || isLoadingModels}>
                <View style={styles.refreshRow}>
                  {isLoadingModels ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="refresh" size={12} color={colors.primary} />
                  )}
                  <ThemedText style={[styles.refreshText, { color: colors.primary }]}>刷新列表</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setShowModelPicker(true)}
              style={[inputStyle, styles.pickerButton]}
            >
              <ThemedText style={{ color: colors.text }} numberOfLines={1}>
                {selectedModel?.name || localSettings.model}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* 温度 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>模型温度</ThemedText>
              <ThemedText style={[styles.temperatureValue, { color: colors.mutedForeground }]}>
                {localSettings.temperature.toFixed(1)}
              </ThemedText>
            </View>
            <Slider
              value={localSettings.temperature}
              onValueChange={(value: number) => setLocalSettings({ ...localSettings, temperature: value })}
              minimumValue={0}
              maximumValue={2}
              step={0.1}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.muted}
              thumbTintColor={colors.primary}
              style={styles.slider}
            />
            <ThemedText style={[styles.hint, { color: colors.mutedForeground }]}>
              较高的温度会让回答更有创意，较低则更精确
            </ThemedText>
          </View>

          <View style={styles.divider} />

          {/* 三段式开关 */}
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <ThemedText style={styles.switchTitle}>三段式思考流程</ThemedText>
              <ThemedText style={[styles.switchHint, { color: colors.mutedForeground }]}>
                AI 将进行&quot;思考 → 质疑 → 打磨&quot;的深度推理
              </ThemedText>
            </View>
            <Switch
              value={localSettings.enableThreePhase}
              onValueChange={(value) => setLocalSettings({ ...localSettings, enableThreePhase: value })}
              trackColor={{ false: colors.muted, true: colors.primary }}
            />
          </View>

          {/* AI 生成问题开关 */}
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <ThemedText style={styles.switchTitle}>AI 生成推荐问题</ThemedText>
              <ThemedText style={[styles.switchHint, { color: colors.mutedForeground }]}>
                开启后首页将展示 AI 生成的问题
              </ThemedText>
            </View>
            <Switch
              value={localSettings.enableAIGeneratedQuestions}
              onValueChange={(value) => setLocalSettings({ ...localSettings, enableAIGeneratedQuestions: value })}
              trackColor={{ false: colors.muted, true: colors.primary }}
            />
          </View>

          <View style={styles.divider} />

            {/* 系统提示词 */}
            <View
              style={styles.section}
              onLayout={(e) => handleInputLayout("systemPrompt", e.nativeEvent.layout.y)}
            >
              <ThemedText style={styles.sectionTitle}>AI 人设提示词</ThemedText>
              <TextInput
                value={localSettings.systemPrompt}
                onChangeText={(text) => setLocalSettings({ ...localSettings, systemPrompt: text })}
                placeholder="定义 AI 的行为和角色..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={4}
                style={[inputStyle, styles.textArea]}
                textAlignVertical="top"
                onFocus={() => scrollToInput("systemPrompt")}
              />
            </View>

            {/* 追问提示词 */}
            <View
              style={styles.section}
              onLayout={(e) => handleInputLayout("followUpPrompt", e.nativeEvent.layout.y)}
            >
              <ThemedText style={styles.sectionTitle}>追问生成提示词</ThemedText>
              <TextInput
                value={localSettings.followUpPrompt}
                onChangeText={(text) => setLocalSettings({ ...localSettings, followUpPrompt: text })}
                placeholder="定义如何生成追问..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                style={[inputStyle, styles.textArea]}
                textAlignVertical="top"
                onFocus={() => scrollToInput("followUpPrompt")}
              />
            </View>

            {/* 推荐问题 */}
            <View
              style={styles.section}
              onLayout={(e) => handleInputLayout("recommendedQuestions", e.nativeEvent.layout.y)}
            >
              <ThemedText style={styles.sectionTitle}>
                {localSettings.enableAIGeneratedQuestions ? "参考问题风格 (每行一个)" : "推荐问题 (每行一个)"}
              </ThemedText>
              <TextInput
                value={localSettings.recommendedQuestions.join("\n")}
                onChangeText={(text) =>
                  setLocalSettings({ ...localSettings, recommendedQuestions: text.split("\n") })
                }
                multiline
                numberOfLines={5}
                style={[inputStyle, styles.textArea]}
                textAlignVertical="top"
                onFocus={() => scrollToInput("recommendedQuestions")}
              />
            </View>

            <View style={{ height: Spacing.xl }} />
          </ScrollView>

          {/* 底部按钮 */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                paddingBottom: Math.max(insets.bottom, Spacing.md),
              },
            ]}
          >
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <ThemedText style={[styles.resetText, { color: colors.error }]}>重置默认</ThemedText>
            </TouchableOpacity>
            <View style={styles.footerSpacer} />
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <ThemedText style={[styles.cancelText, { color: colors.mutedForeground }]}>取消</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
            >
              <ThemedText style={[styles.saveText, { color: colors.primaryForeground }]}>保存更改</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 模型选择器 */}
      <Modal visible={showModelPicker} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <ThemedText style={styles.pickerTitle}>选择模型</ThemedText>
              <TouchableOpacity onPress={() => setShowModelPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {models.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  onPress={() => {
                    setLocalSettings({ ...localSettings, model: model.id });
                    setShowModelPicker(false);
                  }}
                  style={[
                    styles.pickerItem,
                    localSettings.model === model.id && { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <View style={styles.pickerItemContent}>
                    <ThemedText style={styles.pickerItemTitle}>{model.name}</ThemedText>
                    <ThemedText style={[styles.pickerItemId, { color: colors.mutedForeground }]}>
                      {model.id}
                    </ThemedText>
                  </View>
                  {localSettings.model === model.id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    right: Spacing.md,
    bottom: Spacing.md,
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    fontSize: FontSize.sm,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.sm,
  },
  hint: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  refreshRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  refreshText: {
    fontSize: FontSize.xs,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  temperatureValue: {
    fontSize: FontSize.xs,
    fontFamily: "monospace",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: Spacing.md,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  switchContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchTitle: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  switchHint: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  resetButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  resetText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  footerSpacer: {
    flex: 1,
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  cancelText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  saveButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  saveText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  pickerContainer: {
    maxHeight: "70%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  pickerList: {
    padding: Spacing.sm,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  pickerItemContent: {
    flex: 1,
  },
  pickerItemTitle: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  pickerItemId: {
    fontSize: FontSize.xs,
    marginTop: 2,
    fontFamily: "monospace",
  },
});
