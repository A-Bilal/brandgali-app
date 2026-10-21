import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, ImageTints, Radius } from '@/constants/theme';
import type { Product } from '@/data/brandgali';
import { productPercentOff } from '@/data/brandgali';
import { prettyName, stripCurrency } from '@/utils/format';
import { openInApp } from '@/utils/open-link';

type Props = {
  product: Product;
  /** Shown above the product name (leave out on a brand's own page). */
  brandName?: string;
  width?: number;
  imageHeight?: number;
  /** Picks the placeholder colour shown while the photo loads. */
  index?: number;
};

export function ProductCard({ product, brandName, width, imageHeight = 168, index = 0 }: Props) {
  const percent = productPercentOff(product);
  const hasOldPrice = !!product.originalPrice && product.originalPrice !== product.currentPrice;
  const price = product.currentPrice || product.originalPrice;

  return (
    <Pressable
      onPress={() => openInApp(product.url)}
      accessibilityRole="link"
      accessibilityLabel={`${prettyName(product.name)}${price ? `, ${price}` : ''}`}
      style={({ pressed }) => [styles.card, width ? { width } : styles.fill, pressed && styles.pressed]}>
      <View style={[styles.photo, { height: imageHeight, backgroundColor: ImageTints[index % ImageTints.length] }]}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <Ionicons name="pricetag-outline" size={28} color={Colors.muted} />
        )}
        {percent ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{percent}%</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        {brandName ? (
          <Text style={styles.brand} numberOfLines={1}>
            {brandName}
          </Text>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>
          {prettyName(product.name)}
        </Text>
        {price ? (
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            {hasOldPrice ? <Text style={styles.oldPrice}>{stripCurrency(product.originalPrice)}</Text> : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  fill: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  photo: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.orange,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: Colors.navyDeep, fontFamily: Fonts.bodyBold, fontSize: 12 },
  body: { padding: 10, paddingBottom: 12, gap: 3 },
  brand: { color: Colors.muted, fontFamily: Fonts.bodySemi, fontSize: 12 },
  name: { color: Colors.navy, fontFamily: Fonts.bodySemi, fontSize: 14, lineHeight: 18, minHeight: 36 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  price: { color: Colors.navy, fontFamily: Fonts.bodyBold, fontSize: 15 },
  oldPrice: {
    color: Colors.muted,
    fontFamily: Fonts.body,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
});
