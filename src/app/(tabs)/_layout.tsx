import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

/** Selected tabs get an orange-filled icon with a navy outline, like the website's accents. */
function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  if (!focused) return <Ionicons name={`${name}-outline` as IconName} size={24} color={color} />;
  return (
    <View style={styles.iconStack}>
      <Ionicons name={name as IconName} size={24} color={Colors.orange} style={StyleSheet.absoluteFill} />
      <Ionicons name={`${name}-outline` as IconName} size={24} color={Colors.navy} />
    </View>
  );
}

const tabs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'sales', title: 'Sales', icon: 'flame' },
  { name: 'brands', title: 'Brands', icon: 'storefront' },
  { name: 'following', title: 'Following', icon: 'heart' },
  { name: 'account', title: 'Account', icon: 'person' },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.navy,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: { backgroundColor: Colors.white, borderTopColor: Colors.line },
        tabBarLabelStyle: { fontFamily: Fonts.bodySemi, fontSize: 11 },
        sceneStyle: { backgroundColor: Colors.cream },
      }}>
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused, color }) => <TabIcon name={t.icon} focused={focused} color={String(color)} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconStack: { width: 24, height: 24 },
});
