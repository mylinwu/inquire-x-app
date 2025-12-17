import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        // 隐藏 tab bar，因为这是一个单页聊天应用
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          // 隐藏 explore 页面
          href: null,
        }}
      />
    </Tabs>
  );
}
