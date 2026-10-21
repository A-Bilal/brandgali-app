import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandAvatar } from '@/components/brand-avatar';
import { EmptyView, ErrorView, LoadingView, ScreenHeader } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { Brand } from '@/data/brandgali';
import { useBrandData } from '@/data/data-context';
import { useFollows } from '@/data/follows-context';

export default function FollowingScreen() {
  const { brands, status, refreshing, refresh } = useBrandData();
  const { followedIds } = useFollows();

  const followed = brands.filter((b) => followedIds.includes(b.id)).sort((a, b) => a.name.localeCompare(b.name));
  const onSale = followed.filter((b) => b.onSale);
  const waiting = followed.filter((b) => !b.onSale);

  const addButton = (
    <Pressable onPress={() => router.navigate('/brands')} style={styles.add} accessibilityRole="button" accessibilityLabel="Follow more brands">
      <Ionicons name="add" size={18} color={Colors.white} />
      <Text style={styles.addText}>Add</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader
        title="Following"
        subtitle={followed.length ? `${followed.length} ${followed.length === 1 ? 'brand' : 'brands'} · ${onSale.length} on sale now` : 'Brands you follow show up here'}
        right={addButton}
      />

      {status === 'loading' ? (
        <LoadingView />
      ) : status === 'error' ? (
        <ErrorView onRetry={refresh} />
      ) : !followed.length ? (
        <EmptyView icon="heart-outline" title="Follow your favourite brands" text="See their sales in one place, and get alerted the moment a new sale starts.">
          <Pressable onPress={() => router.navigate('/brands')} style={styles.browse} accessibilityRole="button">
            <Text style={styles.browseText}>Browse brands</Text>
          </Pressable>
        </EmptyView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.navy} colors={[Colors.navy]} />}>
          {onSale.length ? (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.saleDot} />
                <Text style={styles.sectionTitle} accessibilityRole="header">
                  On sale now
                </Text>
              </View>
              {onSale.map((b) => (
                <FollowedRow key={b.id} brand={b} />
              ))}
            </View>
          ) : null}
          {waiting.length ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.muted }]} accessibilityRole="header">
                No sale right now
              </Text>
              {waiting.map((b) => (
                <FollowedRow key={b.id} brand={b} />
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function FollowedRow({ brand }: { brand: Brand }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/brand/[id]', params: { id: brand.id } })}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
      accessibilityRole="button">
      <BrandAvatar brand={brand} size={48} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.name}>{brand.name}</Text>
        {brand.onSale ? (
          <Text style={styles.deal}>Sale live · {brand.saleLabel}</Text>
        ) : (
          <Text style={styles.waitText}>We’ll alert you when a sale starts</Text>
        )}
      </View>
      {brand.onSale ? (
        <View style={styles.viewDeals}>
          <Text style={styles.viewDealsText}>View deals</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.tealDeep} />
        </View>
      ) : (
        <Ionicons name="notifications-outline" size={20} color={Colors.muted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: 40, gap: 22 },
  section: { gap: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saleDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.orangeDeep },
  sectionTitle: { fontFamily: Fonts.heading, fontSize: 17, color: Colors.navy },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 12,
  },
  name: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.navy },
  deal: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.saleText },
  waitText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  viewDeals: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewDealsText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.tealDeep },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.navy,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    minHeight: 40,
  },
  addText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: 14 },
  browse: { marginTop: 8, backgroundColor: Colors.navy, borderRadius: Radius.md, paddingHorizontal: 22, paddingVertical: 12 },
  browseText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: 15 },
});
