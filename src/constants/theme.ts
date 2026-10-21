/**
 * BrandGali's look, taken from the website's CSS variables (index.html :root)
 * so the app and the site feel like one product.
 */

export const Colors = {
  navy: '#1B2A5E',
  navyDeep: '#12183A',
  orange: '#F5A623',
  orangeDeep: '#F08A1E',
  teal: '#0EA98B',
  tealDeep: '#0B7D68',
  cream: '#FAF6EE',
  line: '#E7E1D3',
  muted: '#6B7080',
  card: '#FFFDFA',
  white: '#FFFFFF',
  saleText: '#A3560B', // orange that's readable as small text on cream
  saleTint: '#FFF3DC',
  saleTintBorder: '#F6D493',
  danger: '#B42318',
  heroSubtext: '#D5DAEA',
} as const;

/** The three badge colours a brand can have in brands-data.js, with readable text on each. */
export const BrandColors = {
  navy: { bg: Colors.navy, fg: Colors.white },
  orange: { bg: Colors.orange, fg: Colors.navyDeep },
  teal: { bg: Colors.tealDeep, fg: Colors.white },
} as const;

/** Soft backgrounds for product photos while they load. */
export const ImageTints = ['#F3E3B8', '#D9E6E1', '#EED9DA', '#DFE3EF', '#E8E0D2', '#E3E8DA'] as const;

/** Font family names, as registered in src/app/_layout.tsx. */
export const Fonts = {
  heading: 'Poppins_700Bold',
  headingSemi: 'Poppins_600SemiBold',
  headingHeavy: 'Poppins_800ExtraBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const Shadow = {
  shadowColor: Colors.navyDeep,
  shadowOpacity: 0.08,
  shadowRadius: 15,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
} as const;
