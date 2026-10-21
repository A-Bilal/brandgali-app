import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { SITE_URL } from '@/data/brandgali';
import { useFollows } from '@/data/follows-context';
import { openInApp } from '@/utils/open-link';

export default function AccountScreen() {
  const { followedIds } = useFollows();

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Account" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Sign in / sign up (same Firebase accounts as the website) comes in the next update. */}
        <View style={styles.signInCard}>
          <View style={styles.signInIcon}>
            <Ionicons name="person-outline" size={26} color={Colors.navy} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.signInTitle}>Sign in coming soon</Text>
            <Text style={styles.signInText}>You’ll use the same account as brandgali.com, so your follows stay in sync.</Text>
          </View>
        </View>

        <Group title="YOUR BRANDS">
          <Row label="Brands I follow" value={String(followedIds.length)} onPress={() => router.navigate('/following')} last />
        </Group>

        <Group title="BRANDGALI">
          <Row label="About BrandGali" onPress={() => openInApp(`${SITE_URL}/about.html`)} />
          <Row label="List your brand" onPress={() => openInApp(`${SITE_URL}/partner.html`)} />
          <Row label="Privacy policy" onPress={() => openInApp(`${SITE_URL}/privacy.html`)} />
          <Row label="Contact support" onPress={() => openInApp('mailto:info@brandgali.com')} last />
        </Group>

        <Text style={styles.version}>BrandGali {Constants.expoConfig?.version ?? ''}</Text>
      </ScrollView>
    </View>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.groupTitle} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function Row({ label, value, onPress, last }: { label: string; value?: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: Colors.cream }]}
      accessibilityRole="button">
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: 40, gap: 20 },
  signInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 16,
  },
  signInIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  signInTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.navy },
  signInText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 18 },
  groupTitle: { fontFamily: Fonts.bodyBold, fontSize: 12, letterSpacing: 0.7, color: Colors.muted, marginHorizontal: 4 },
  group: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, minHeight: 52 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  rowLabel: { flex: 1, fontFamily: Fonts.bodySemi, fontSize: 15, color: Colors.navy },
  rowValue: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  version: { textAlign: 'center', fontFamily: Fonts.body, fontSize: 12, color: Colors.muted },
});
