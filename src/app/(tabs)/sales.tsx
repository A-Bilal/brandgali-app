import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { BrandAvatar } from '@/components/brand-avatar';
import { ProductCard } from '@/components/product-card';
import { ChipRow, EmptyView, ErrorView, LoadingView, OfflineNotice, ScreenHeader } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { allSaleProducts, mixBrands, parsePrice, type SaleProduct } from '@/data/brandgali';
import { useBrandData } from '@/data/data-context';
import { checkedLabel } from '@/utils/format';

const SORTS = ['Top deals', 'Biggest discount', 'Lowest price'] as const;
type Sort = (typeof SORTS)[number];

export default function SalesScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const { brands, categories, checkedAt, status, refreshing, offline, refresh } = useBrandData();
  const [sort, setSort] = useState<Sort>('Top deals');
  // Tapping a category on Home opens this tab with that category picked (the
  // `category` param); a category picked here wins until Home sends a new one.
  const [picked, setPicked] = useState<{ fromParam?: string; value: string }>({ value: '' });
  const category = picked.fromParam === params.category ? picked.value : (params.category ?? '');
  const setCategory = (value: string) => setPicked({ fromParam: params.category, value });

  const onSale = brands.filter((b) => b.onSale);
  const products = useMemo(() => {
    const list = allSaleProducts(brands).filter((p) => !category || p.brand.category === category);
    return sortProducts(list, sort);
  }, [brands, category, sort]);
  // Brands on sale whose products the daily check couldn't read: still worth showing.
  const withoutProducts = onSale.filter((b) => !b.saleProducts.length && (!category || b.category === category));
  const saleCategories = categories.filter((c) => onSale.some((b) => b.category === c.name));

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader
        title="Live sales"
        subtitle={`${onSale.length} brands on sale · ${checkedLabel(checkedAt).toLowerCase()}`}>
        <ChipRow
          options={[{ key: '', label: 'All' }, ...saleCategories.map((c) => ({ key: c.name, label: c.name }))]}
          selected={category}
          onSelect={setCategory}
        />
      </ScreenHeader>

      {status === 'loading' ? (
        <LoadingView />
      ) : status === 'error' ? (
        <ErrorView onRetry={refresh} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.url}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.navy} colors={[Colors.navy]} />}
          ListHeaderComponent={
            <View style={{ gap: 10, marginBottom: 2 }}>
              {offline ? <OfflineNotice /> : null}
              <View style={styles.toolbar}>
                <Text style={styles.count}>
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </Text>
                <Pressable
                  onPress={() => setSort(SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length])}
                  style={styles.sortButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Sorted by ${sort}. Tap to change.`}>
                  <Ionicons name="swap-vertical" size={15} color={Colors.tealDeep} />
                  <Text style={styles.sortText}>{sort}</Text>
                </Pressable>
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.cell}>
              <ProductCard product={item} brandName={item.brand.name} index={index} />
            </View>
          )}
          ListEmptyComponent={
            withoutProducts.length ? undefined : (
              <EmptyView icon="pricetags-outline" title="No sales here right now" text="Try another category, or pull down to check again." />
            )
          }
          ListFooterComponent={
            withoutProducts.length ? (
              <View style={styles.more}>
                <Text style={styles.moreTitle}>More brands on sale</Text>
                <Text style={styles.moreText}>See the deals on their own sites.</Text>
                {withoutProducts.map((b) => (
                  <Pressable
                    key={b.id}
                    onPress={() => router.push({ pathname: '/brand/[id]', params: { id: b.id } })}
                    style={styles.moreRow}
                    accessibilityRole="button">
                    <BrandAvatar brand={b} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.moreName}>{b.name}</Text>
                      <Text style={styles.moreDeal}>{b.saleLabel}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
                  </Pressable>
                ))}
              </View>
            ) : undefined
          }
        />
      )}
    </View>
  );
}

function sortProducts(list: SaleProduct[], sort: Sort): SaleProduct[] {
  if (sort === 'Biggest discount') return list; // already sorted this way
  if (sort === 'Lowest price') {
    return [...list].sort((a, b) => (parsePrice(a.currentPrice) ?? Infinity) - (parsePrice(b.currentPrice) ?? Infinity));
  }
  return mixBrands(list);
}

const styles = StyleSheet.create({
  list: { padding: Spacing.lg, paddingBottom: 40, gap: 12 },
  row: { gap: 12 },
  cell: { flex: 1, maxWidth: '50%' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontFamily: Fonts.bodySemi, fontSize: 13, color: Colors.muted },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 40, paddingLeft: 12 },
  sortText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.tealDeep },
  more: { marginTop: 18, gap: 10 },
  moreTitle: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.navy },
  moreText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, marginTop: -6 },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 12,
  },
  moreName: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.navy },
  moreDeal: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.saleText, marginTop: 2 },
});
