/**
 * ChatInput 组件 - 消息输入框
 */

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, FontSize, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "输入消息...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const insets = useSafeAreaInsets();
  
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "mutedForeground");
  const cardColor = useThemeColor({}, "card");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue("");
    }
  }, [value, disabled, onSend]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderTopColor: borderColor,
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
        },
      ]}
    >
      <View style={[styles.inputWrapper, { backgroundColor: cardColor, borderColor }]}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={mutedColor}
          editable={!disabled}
          multiline
          maxLength={4000}
          style={[
            styles.input,
            {
              color: textColor,
              opacity: disabled ? 0.5 : 1,
              fontFamily: "monospace",
            },
          ]}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend ? primaryColor : mutedColor,
              opacity: canSend ? 1 : 0.3,
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
      <ThemedText style={styles.disclaimer}>
        AI 内容由模型生成，请仔细甄别
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    maxHeight: 150,
    minHeight: 36,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  disclaimer: {
    fontSize: FontSize.xs,
    textAlign: "center",
    marginTop: Spacing.sm,
    opacity: 0.4,
  },
});
