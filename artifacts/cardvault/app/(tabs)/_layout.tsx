import React from "react";
import { Platform, StyleSheet, View, type ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type TabIcon = keyof typeof Ionicons.glyphMap;

function TabBarIcon({
  focused,
  color,
  activeIcon,
  inactiveIcon,
}: {
  focused: boolean;
  color: ColorValue;
  activeIcon: TabIcon;
  inactiveIcon: TabIcon;
}) {
  return (
    <Ionicons
      name={focused ? activeIcon : inactiveIcon}
      size={22}
      color={color}
    />
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const tabBarHeight = isWeb ? 84 : 66 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: isWeb ? 0 : Math.max(insets.bottom, 8),
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: {
          minHeight: 48,
        },
        tabBarBackground: () => (
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarAccessibilityLabel: "Dashboard tab",
          tabBarButtonTestID: "tab-dashboard",
          tabBarIcon: (props) => (
            <TabBarIcon
              {...props}
              activeIcon="grid"
              inactiveIcon="grid-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarAccessibilityLabel: "Search tab",
          tabBarButtonTestID: "tab-search",
          tabBarIcon: (props) => (
            <TabBarIcon
              {...props}
              activeIcon="search"
              inactiveIcon="search-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Collection",
          tabBarAccessibilityLabel: "Collection tab",
          tabBarButtonTestID: "tab-collection",
          tabBarIcon: (props) => (
            <TabBarIcon
              {...props}
              activeIcon="albums"
              inactiveIcon="albums-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarAccessibilityLabel: "Wishlist tab",
          tabBarButtonTestID: "tab-wishlist",
          tabBarIcon: (props) => (
            <TabBarIcon
              {...props}
              activeIcon="heart"
              inactiveIcon="heart-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarAccessibilityLabel: "Settings tab",
          tabBarButtonTestID: "tab-settings",
          tabBarIcon: (props) => (
            <TabBarIcon
              {...props}
              activeIcon="settings"
              inactiveIcon="settings-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}
