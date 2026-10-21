import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandAvatar } from '@/components/brand-avatar';
import { ProductCard } from '@/components/product-card';
import { ChipRow, ErrorView, LoadingView, OfflineNotice, SectionHeader } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { allSaleProducts, mixBrands } from '@/data/brandgali';
import { useBrandData } from '@/data/data-context';
import { checkedLabel } from '@/utils/format';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { brands, categories, checkedAt, status, refreshing, offline, refresh } = useBrandData();

  const onSale = brands.filter((b) => b.onSale);
  const topDeals = useMemo(() => {
    // Each brand's single best deal, biggest discount first.
    const best = mixBrands(allSaleProducts(brands));
    return best.slice(0, new Set(best.map((p) => p.brand.id)).size).slice(0, 12);
  }, [brands]);
  const newArrivals = useMemo(
    () => brands.filter((b) => b.newArrivals.length).flatMap((b) => b.newArrivals.slice(0, 1).map((p) => ({ ...p, brand: b }))).slice(0, 12),
    [brands],
  );
  const topPicks = brands.filter((b) => b.featured).slice(0, 8);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <Image source={require('@/assets/images/brandgali-logo.png')} style={styles.logo} contentFit="contain" accessibilityLabel="BrandGali" />
          <Pressable
            onPress={() => router.navigate('/following')}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Brands you follow">
            <Ionicons name="notifications-outline" size={22} color={Colors.navy} />
          </Pressable>
        </View>
        <Pressable onPress={() => router.navigate('/brands')} style={styles.fakeSearch} accessibilityRole="search">
          <Ionicons name="search" size={19} color={Colors.muted} />
          <Text style={styles.fakeSearchText}>Search {brands.length || ''} brands</Text>
        </Pressable>
      </View>

      {status === 'loading' ? (
        <LoadingView />
      ) : status === 'error' ? (
        <ErrorView onRetry={refresh} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.navy} colors={[Colors.navy]} />}>
          {offline ? <OfflineNotice /> : null}

          <View style={styles.hero}>
            <View style={styles.heroBlob} />
            <View style={styles.heroPill}>
              <View style={styles.heroDot} />
              <Text style={styles.heroPillText}>{checkedLabel(checkedAt)}</Text>
            </View>
            <Text style={styles.heroTitle}>
              {onSale.length} {onSale.length === 1 ? 'brand is' : 'brands are'}
              {'\n'}on sale right now
            </Text>
            <Text style={styles.heroText}>Out of {brands.length} Pakistani brands we check every day.</Text>
            <Pressable onPress={() => router.navigate('/sales')} style={styles.heroButton} accessibilityRole="button">
              <Text style={styles.heroButtonText}>See live sales</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.navyDeep} />
            </Pressable>
          </View>

          <ChipRow
            options={[{ key: '', label: 'All' }, ...categories.map((c) => ({ key: c.name, label: c.name }))]}
            selected="__none__"
            onSelect={(key) => router.navigate({ pathname: '/sales', params: { category: key } })}
          />

          {topDeals.length ? (
            <View style={styles.section}>
              <SectionHeader title="Biggest discounts" action="See all" onAction={() => router.navigate('/sales')} />
              <FlatList
                horizontal
                data={topDeals}
                keyExtractor={(p) => p.url}
                showsHorizontalScrollIndicator={false}
                style={styles.bleed}
                contentContainerStyle={styles.rail}
                renderItem={({ item, index }) => (
                  <ProductCard product={item} brandName={item.brand.name} width={150} imageHeight={150} index={index} />
                )}
              />
            </View>
          ) : null}

          {topPicks.length ? (
            <View style={styles.section}>
              <SectionHeader title="Top picks" action="All brands" onAction={() => router.navigate('/brands')} />
              <View style={styles.picks}>
                {topPicks.map((b) => (
                  <Pressable
                    key={b.id}
                    onPress={() => router.push({ pathname: '/brand/[id]', params: { id: b.id } })}
                    style={styles.pick}
                    accessibilityRole="button"
                    accessibilityLabel={`${b.name}${b.onSale ? ', on sale' : ''}`}>
                    <View>
                      <BrandAvatar brand={b} size={60} />
                      {b.onSale ? (
                        <View style={styles.saleTag}>
                          <Text style={styles.saleTagText}>SALE</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.pickName} numberOfLines={1}>
                      {b.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {newArrivals.length ? (
            <View style={styles.section}>
              <SectionHeader title="New arrivals" />
              <FlatList
                horizontal
                data={newArrivals}
                keyExtractor={(p) => p.url}
                showsHorizontalScrollIndicator={false}
                style={styles.bleed}
                contentContainerStyle={styles.rail}
                renderItem={({ item, index }) => (
                  <ProductCard product={item} brandName={item.brand.name} width={150} imageHeight={150} index={index + 2} />
                )}
              />
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 120, height: 44 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeSearch: {
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
  fakeSearchText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted },
  content: { padding: Spacing.xl, paddingBottom: 40, gap: 22 },
  hero: { backgroundColor: Colors.navy, borderRadius: Radius.xl, padding: 22, gap: 12, overflow: 'hidden' },
  heroBlob: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.orange,
    opacity: 0.18,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.teal },
  heroPillText: { color: Colors.white, fontFamily: Fonts.bodySemi, fontSize: 12 },
  heroTitle: { color: Colors.white, fontFamily: Fonts.heading, fontSize: 28, lineHeight: 34 },
  heroText: { color: Colors.heroSubtext, fontFamily: Fonts.body, fontSize: 14 },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: Colors.orange,
    borderRadius: Radius.md,
    paddingHorizontal: 18,
    minHeight: 46,
    marginTop: 2,
  },
  heroButtonText: { color: Colors.navyDeep, fontFamily: Fonts.bodyBold, fontSize: 15 },
  section: { gap: 12 },
  bleed: { marginHorizontal: -Spacing.xl },
  rail: { gap: 12, paddingHorizontal: Spacing.xl },
  picks: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  pick: { width: '25%', alignItems: 'center', gap: 8 },
  pickName: { fontFamily: Fonts.bodySemi, fontSize: 12, color: Colors.navy, textAlign: 'center', paddingHorizontal: 2 },
  saleTag: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    backgroundColor: Colors.orange,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  saleTagText: { color: Colors.navyDeep, fontFamily: Fonts.bodyBold, fontSize: 10 },
});
