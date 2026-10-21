/** Small building blocks shared by several screens. */

import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

/** The white bar at the top of each tab, with the title. */
export function ScreenHeader({
  title,
  subtitle,
  right,
  children,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {title ? (
        <View style={styles.headerRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** A row of tappable pills, e.g. categories. Scrolls sideways when it doesn't fit. */
export function ChipRow({
  options,
  selected,
  onSelect,
  variant = 'pill',
}: {
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
  variant?: 'pill' | 'underline';
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: variant === 'pill' ? 8 : 18, paddingHorizontal: Spacing.xl }}
      style={{ marginHorizontal: -Spacing.xl, flexGrow: 0 }}>
      {options.map((o) => {
        const on = o.key === selected;
        return (
          <Pressable
            key={o.key}
            onPress={() => onSelect(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={variant === 'pill' ? [styles.pill, on && styles.pillOn] : [styles.tab, on && styles.tabOn]}>
            <Text
              style={[
                styles.chipText,
                variant === 'pill' && on && { color: Colors.white },
                variant === 'underline' && { color: on ? Colors.navy : Colors.muted },
              ]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function SearchBox({ value, onChangeText, placeholder }: { value: string; onChangeText: (t: string) => void; placeholder: string }) {
  return (
    <View style={styles.search}>
      <Ionicons name="search" size={19} color={Colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        style={styles.searchInput}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel={placeholder}
      />
      {value && process.env.EXPO_OS === 'android' ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={Colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.navy} />
      <Text style={styles.centerText}>Loading today’s sales…</Text>
    </View>
  );
}

export function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={44} color={Colors.muted} />
      <Text style={styles.centerTitle}>Can’t reach BrandGali</Text>
      <Text style={styles.centerText}>Check your internet connection and try again.</Text>
      <Pressable onPress={onRetry} style={styles.retry} accessibilityRole="button">
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

export function EmptyView({ icon, title, text, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; children?: ReactNode }) {
  return (
    <View style={[styles.center, { paddingVertical: 48 }]}>
      <Ionicons name={icon} size={40} color={Colors.muted} />
      <Text style={styles.centerTitle}>{title}</Text>
      <Text style={styles.centerText}>{text}</Text>
      {children}
    </View>
  );
}

export function OfflineNotice() {
  return (
    <View style={styles.offline}>
      <Ionicons name="cloud-offline-outline" size={16} color={Colors.saleText} />
      <Text style={styles.offlineText}>You’re offline. Showing the last sales we saved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: Fonts.heading, fontSize: 26, color: Colors.navy },
  subtitle: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { fontFamily: Fonts.heading, fontSize: 19, color: Colors.navy },
  sectionAction: { fontFamily: Fonts.bodySemi, fontSize: 14, color: Colors.tealDeep },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  pillOn: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  tab: { paddingVertical: 6, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: Colors.orange },
  chipText: { fontFamily: Fonts.bodySemi, fontSize: 14, color: Colors.navy },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  searchInput: { flex: 1, fontFamily: Fonts.body, fontSize: 15, color: Colors.navy, paddingVertical: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  centerTitle: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.navy, textAlign: 'center' },
  centerText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 20 },
  retry: { marginTop: 8, backgroundColor: Colors.navy, borderRadius: Radius.md, paddingHorizontal: 22, paddingVertical: 12 },
  retryText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: 15 },
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.saleTint,
    borderColor: Colors.saleTintBorder,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  offlineText: { fontFamily: Fonts.bodySemi, fontSize: 13, color: Colors.saleText, flex: 1 },
});
