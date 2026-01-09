/**
 * MenuPanel 组件 - 侧边栏菜单
 */

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { formatDistanceToNow } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function MenuPanel({ isOpen, onClose, onOpenSettings }: MenuPanelProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const {
    conversations,
    currentConversationId,
    setCurrentConversation,
    deleteConversation,
    clearAllConversations,
  } = useAppStore();

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    onClose();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "删除对话",
      "确定删除这个对话吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => deleteConversation(id),
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (conversations.length === 0) return;
    
    Alert.alert(
      "清空所有记录",
      "确定清空所有历史记录吗？此操作不可撤销。",
      [
        { text: "取消", style: "cancel" },
        {
          text: "清空",
          style: "destructive",
          onPress: () => {
            clearAllConversations();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* 遮罩层 */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.overlayBackground, { backgroundColor: "rgba(0,0,0,0.4)" }]} />
      </TouchableOpacity>

      {/* 侧边面板 */}
      <View
        style={[
          styles.panel,
          {
            backgroundColor: colors.background,
            borderRightColor: colors.border,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* 头部 */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Ionicons name="time-outline" size={18} color={colors.text} style={{ opacity: 0.8 }} />
            <ThemedText style={styles.headerTitle}>历史记录</ThemedText>
          </View>
          <View style={styles.headerRight}>
            {conversations.length > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 会话列表 */}
        <ScrollView 
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={32} color={colors.mutedForeground} style={{ opacity: 0.2 }} />
              <ThemedText style={[styles.emptyText, { color: colors.mutedForeground }]}>
                暂无对话
              </ThemedText>
            </View>
          ) : (
            conversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                onPress={() => handleSelectConversation(conv.id)}
                onLongPress={() => handleDelete(conv.id)}
                style={[
                  styles.conversationItem,
                  currentConversationId === conv.id && [
                    styles.conversationItemActive,
                    { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}20` },
                  ],
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.conversationContent}>
                  <ThemedText
                    style={[
                      styles.conversationTitle,
                      currentConversationId === conv.id && { color: colors.primary },
                    ]}
                    numberOfLines={1}
                  >
                    {conv.title}
                  </ThemedText>
                  <ThemedText style={[styles.conversationTime, { color: colors.mutedForeground }]}>
                    {formatDistanceToNow(conv.updatedAt)}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(conv.id)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* 底部设置按钮 */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={onOpenSettings}
            style={[styles.settingsButton, { backgroundColor: colorScheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={16} color={colors.text} style={{ opacity: 0.8 }} />
            <ThemedText style={styles.settingsText}>设置</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  clearButton: {
    padding: 6,
  },
  closeButton: {
    padding: 6,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.sm,
    gap: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 3,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.sm,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  conversationItemActive: {
    borderWidth: 1,
  },
  conversationContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: Spacing.sm,
  },
  conversationTitle: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  conversationTime: {
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  deleteButton: {
    padding: 6,
    opacity: 0.5,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  settingsText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
});
