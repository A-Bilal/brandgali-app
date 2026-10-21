import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandAvatar } from '@/components/brand-avatar';
import { FollowButton } from '@/components/follow-button';
import { ProductCard } from '@/components/product-card';
import { EmptyView, LoadingView, SectionHeader } from '@/components/ui';
import { BrandColors, Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { Product } from '@/data/brandgali';
import { useBrandData } from '@/data/data-context';
import { checkedLabel, displayDomain } from '@/utils/format';
import { openInApp } from '@/utils/open-link';

export default function BrandScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getBrand, status } = useBrandData();
  const brand = getBrand(id);

  const back = (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={[styles.back, { top: insets.top + 8 }]}
      accessibilityRole="button"
      accessibilityLabel="Back">
      <Ionicons name="chevron-back" size={24} color={Colors.navy} />
    </Pressable>
  );

  if (!brand) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 60 }}>
        {status === 'loading' ? <LoadingView /> : <EmptyView icon="storefront-outline" title="Brand not found" text="It may have been removed from BrandGali." />}
        {back}
      </View>
    );
  }

  const cover = BrandColors[brand.color].bg;
  const hasStore = !!brand.url && brand.url !== '#';
  const products: Product[] = brand.onSale ? brand.saleProducts : brand.newArrivals;
  const cities = [...new Set(brand.stores.map((s) => s.city))];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={[styles.cover, { backgroundColor: cover, height: insets.top + 110 }]}>
          <View style={styles.coverBlobA} />
          <View style={styles.coverBlobB} />
        </View>

        <View style={styles.body}>
          <View style={styles.identity}>
            <View style={styles.avatarRing}>
              <BrandAvatar brand={brand} size={80} />
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name} accessibilityRole="header">
                {brand.name}
              </Text>
              <Text style={styles.meta}>
                {brand.category}
                {hasStore ? ` · ${displayDomain(brand.url)}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <FollowButton brandId={brand.id} brandName={brand.name} size="large" />
            {hasStore ? (
              <Pressable onPress={() => openInApp(brand.url)} style={styles.visit} accessibilityRole="link">
                <Text style={styles.visitText}>Visit store</Text>
                <Ionicons name="open-outline" size={17} color={Colors.navy} />
              </Pressable>
            ) : null}
          </View>

          {brand.onSale ? (
            <Pressable
              onPress={() => openInApp(brand.saleSourceUrl || brand.url)}
              style={styles.saleBanner}
              accessibilityRole="link"
              accessibilityLabel={`Sale live, ${brand.saleLabel}. Open the sale on ${brand.name}'s site.`}>
              <View style={styles.saleIcon}>
                <Ionicons name="flame" size={24} color={Colors.navyDeep} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.saleTitle}>Sale live · {brand.saleLabel}</Text>
                <Text style={styles.saleText}>
                  {brand.saleProducts.length
                    ? `${brand.saleProducts.length} products found on ${brand.name}'s site`
                    : `See the deals on ${brand.name}'s site`}{' '}
                  · {checkedLabel(brand.checkedAt ? new Date(brand.checkedAt) : null).replace('Checked ', '')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.saleText} />
            </Pressable>
          ) : (
            <View style={styles.noSale}>
              <Ionicons name="notifications-outline" size={20} color={Colors.tealDeep} />
              <Text style={styles.noSaleText}>No sale right now. Follow {brand.name} and we’ll let you know when one starts.</Text>
            </View>
          )}

          {products.length ? (
            <View style={{ gap: 12 }}>
              <SectionHeader title={brand.onSale ? 'Sale products' : 'New arrivals'} />
              <View style={styles.grid}>
                {products.map((p, i) => (
                  <View key={p.url} style={styles.cell}>
                    <ProductCard product={p} imageHeight={160} index={i} />
                  </View>
                ))}
                {products.length % 2 ? <View style={styles.cell} /> : null}
              </View>
            </View>
          ) : null}

          {cities.length ? (
            <View style={{ gap: 10 }}>
              <SectionHeader title="Stores" />
              <View style={styles.cities}>
                {cities.map((c) => (
                  <View key={c} style={styles.city}>
                    <Ionicons name="location-outline" size={14} color={Colors.muted} />
                    <Text style={styles.cityText}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
      {back}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { overflow: 'hidden' },
  coverBlobA: {
    position: 'absolute',
    right: -50,
    top: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.white,
    opacity: 0.12,
  },
  coverBlobB: {
    position: 'absolute',
    right: 110,
    bottom: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.orange,
    opacity: 0.3,
  },
  back: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: Spacing.xl, marginTop: -30, gap: 16 },
  identity: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  // starts just below the cover, which the avatar overlaps by 30px
  identityText: { flex: 1, gap: 2, paddingTop: 38 },
  avatarRing: { borderRadius: 46, borderWidth: 4, borderColor: Colors.cream, backgroundColor: Colors.cream },
  name: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.navy },
  meta: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  actions: { flexDirection: 'row', gap: 10 },
  visit: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  visitText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.navy },
  saleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.saleTint,
    borderWidth: 1,
    borderColor: Colors.saleTintBorder,
    borderRadius: Radius.lg,
    padding: 14,
  },
  saleIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.orange, alignItems: 'center', justifyContent: 'center' },
  saleTitle: { fontFamily: Fonts.heading, fontSize: 17, color: Colors.navy },
  saleText: { fontFamily: Fonts.body, fontSize: 13, color: '#5E5440' },
  noSale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 14,
  },
  noSaleText: { flex: 1, fontFamily: Fonts.body, fontSize: 14, color: Colors.navy, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { flexBasis: '45%', flexGrow: 1 },
  cities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  city: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cityText: { fontFamily: Fonts.bodySemi, fontSize: 13, color: Colors.navy },
});
