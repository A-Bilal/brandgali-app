import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors, Colors, Fonts } from '@/constants/theme';
import type { Brand } from '@/data/brandgali';

/**
 * The brand's logo, falling back the same way the website does:
 * logo from the brand's site -> Google favicon -> coloured circle with the initial.
 */
export function BrandAvatar({ brand, size = 48 }: { brand: Brand; size?: number }) {
  const sources = useMemo(() => logoCandidates(brand), [brand]);
  // Remembers how far down the fallback list this brand got (reset if the avatar is reused for another brand).
  const [failed, setFailed] = useState({ id: brand.id, index: 0 });
  const index = failed.id === brand.id ? failed.index : 0;
  const next = () => setFailed({ id: brand.id, index: index + 1 });
  const colors = BrandColors[brand.color];
  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (index >= sources.length) {
    return (
      <View style={[styles.initial, circle, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.fg, fontFamily: Fonts.heading, fontSize: Math.round(size * 0.38) }}>
          {brand.initial}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.logoWrap, circle]}>
      <Image
        source={{ uri: sources[index] }}
        style={{ width: size * 0.7, height: size * 0.7 }}
        contentFit="contain"
        cachePolicy="memory-disk"
        accessibilityLabel={`${brand.name} logo`}
        onError={next}
        // Google returns a tiny generic globe (not an error) for sites it can't read.
        onLoad={(e) => {
          if (e.source.width <= 16 && e.source.height <= 16) next();
        }}
      />
    </View>
  );
}

function logoCandidates(brand: Brand): string[] {
  const out: string[] = [];
  // .ico files don't display reliably on phones, so skip straight to the favicon service.
  if (brand.logo && !/\.ico(\?|$)/i.test(brand.logo)) out.push(brand.logo);
  if (brand.url && brand.url !== '#' && !brand.url.includes('instagram.com')) {
    try {
      out.push(`https://www.google.com/s2/favicons?sz=128&domain=${new URL(brand.url).hostname}`);
    } catch {}
  }
  return out;
}

const styles = StyleSheet.create({
  initial: { alignItems: 'center', justifyContent: 'center' },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
});
