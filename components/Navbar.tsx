/**
 * Navbar 组件 - 导航栏
 */

import { Colors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavbarProps {
  onMenuClick: () => void;
  onNewChat: () => void;
}

export function Navbar({ onMenuClick, onNewChat }: NavbarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={onMenuClick}
          style={styles.button}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={22} color={colors.text} style={{ opacity: 0.8 }} />
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={onNewChat}
          style={styles.button}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={22} color={colors.text} style={{ opacity: 0.8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  button: {
    padding: Spacing.sm,
    marginHorizontal: -Spacing.sm,
  },
  spacer: {
    flex: 1,
  },
});
