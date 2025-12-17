/**
 * 主题配置 - WEUI/Modern 风格
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // 基础色
    text: '#111111',
    background: '#ededed',
    card: '#ffffff',
    border: '#dcdcdc',
    
    // 品牌色 - 微信绿
    primary: '#07c160',
    primaryForeground: '#ffffff',
    
    // 辅助色
    secondary: '#f7f7f7',
    secondaryForeground: '#111111',
    
    muted: '#f7f7f7',
    mutedForeground: '#767676',
    
    accent: '#e5e5e5',
    accentForeground: '#111111',
    
    // 消息气泡
    bubbleUser: '#95ec69',
    bubbleUserText: '#000000',
    bubbleAi: '#ffffff',
    bubbleAiText: '#111111',
    
    // 导航
    tint: '#07c160',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#07c160',
    
    // 状态
    error: '#dc2626',
    success: '#07c160',
    warning: '#f59e0b',
  },
  dark: {
    // 基础色
    text: '#f0f0f0',
    background: '#111111',
    card: '#191919',
    border: '#2c2c2c',
    
    // 品牌色 - 微信绿
    primary: '#07c160',
    primaryForeground: '#ffffff',
    
    // 辅助色
    secondary: '#1e1e1e',
    secondaryForeground: '#f0f0f0',
    
    muted: '#1e1e1e',
    mutedForeground: '#888888',
    
    accent: '#2c2c2c',
    accentForeground: '#f0f0f0',
    
    // 消息气泡
    bubbleUser: '#07c160',
    bubbleUserText: '#ffffff',
    bubbleAi: '#2c2c2c',
    bubbleAiText: '#f0f0f0',
    
    // 导航
    tint: '#07c160',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#07c160',
    
    // 状态
    error: '#ef4444',
    success: '#07c160',
    warning: '#f59e0b',
  },
};

// 通用间距
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// 圆角
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// 字体大小
export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
