import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { BrandAvatar } from '@/components/brand-avatar';
import { FollowButton } from '@/components/follow-button';
import { ChipRow, EmptyView, ErrorView, LoadingView, ScreenHeader, SearchBox } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { Brand } from '@/data/brandgali';
import { useBrandData } from '@/data/data-context';

const ON_SALE = '__sale__';

export default function BrandsScreen() {
  const { brands, categories, status, refreshing, refresh } = useBrandData();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('');

  const tabs = useMemo(
    () => [
      { key: '', label: `All ${brands.length}` },
      { key: ON_SALE, label: `On sale ${brands.filter((b) => b.onSale).length}` },
      ...categories
        .map((c) => ({ key: c.name, label: `${c.name} ${brands.filter((b) => b.category === c.name).length}` }))
        .filter((c) => !c.label.endsWith(' 0')),
    ],
    [brands, categories],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return brands
      .filter((b) => (tab === ON_SALE ? b.onSale : !tab || b.category === tab))
      .filter((b) => !q || b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [brands, query, tab]);

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Brands" subtitle={`${brands.length} Pakistani brands, one place`}>
        <SearchBox value={query} onChangeText={setQuery} placeholder={`Search ${brands.length} brands`} />
        <ChipRow options={tabs} selected={tab} onSelect={setTab} variant="underline" />
      </ScreenHeader>

      {status === 'loading' ? (
        <LoadingView />
      ) : status === 'error' ? (
        <ErrorView onRetry={refresh} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.navy} colors={[Colors.navy]} />}
          renderItem={({ item }) => <BrandRow brand={item} />}
          ListEmptyComponent={<EmptyView icon="search-outline" title="No brands found" text={`Nothing matches "${query}".`} />}
        />
      )}
    </View>
  );
}

function BrandRow({ brand }: { brand: Brand }) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push({ pathname: '/brand/[id]', params: { id: brand.id } })}
        style={styles.rowMain}
        accessibilityRole="button"
        accessibilityLabel={`${brand.name}${brand.onSale ? `, sale live, ${brand.saleLabel}` : ''}`}>
        <BrandAvatar brand={brand} size={46} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.name} numberOfLines={1}>
            {brand.name}
          </Text>
          {brand.onSale ? (
            <View style={styles.saleLine}>
              <View style={styles.saleDot} />
              <Text style={styles.saleText} numberOfLines={1}>
                Sale live · {brand.saleLabel}
              </Text>
            </View>
          ) : (
            <Text style={styles.category}>{brand.category}</Text>
          )}
        </View>
      </Pressable>
      <FollowButton brandId={brand.id} brandName={brand.name} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.lg, paddingBottom: 40, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
  name: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.navy },
  category: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted },
  saleLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  saleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.orangeDeep },
  saleText: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.saleText, flexShrink: 1 },
});
