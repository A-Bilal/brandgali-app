/**
 * Everything the app knows about brands and sales comes from two public files
 * on the website, so the app never needs its own server:
 *
 *  - brands-data.js     the brand list (edited by hand on the website)
 *  - sales-status.json  today's sales + products (updated daily by the
 *                       website's GitHub Action, scraper.js)
 */

import { extractConstLiteral } from './parse-js-literal';

export const SITE_URL = 'https://www.brandgali.com';

export type BrandColor = 'navy' | 'orange' | 'teal';

export type Product = {
  name: string;
  url: string;
  image?: string | null;
  originalPrice?: string | null;
  currentPrice?: string | null;
  discount?: string | null;
};

export type Store = { city: string; area?: string; mapUrl?: string };

export type Category = { name: string };

export type Brand = {
  id: string;
  name: string;
  category: string;
  url: string;
  initial: string;
  color: BrandColor;
  featured: boolean;
  stores: Store[];
  /** Logo found on the brand's own site by the daily check (may be missing). */
  logo: string | null;
  onSale: boolean;
  /** Short label like "50% off" or "Buy 1 get 1"; null when not on sale. */
  saleLabel: string | null;
  /** Biggest % we can actually see in the sale text or products; never invented. */
  maxDiscount: number | null;
  saleSourceUrl: string | null;
  saleProducts: Product[];
  newArrival: boolean;
  newArrivals: Product[];
  checkedAt: string | null;
};

export type SaleProduct = Product & { brand: Brand; percentOff: number | null };

type RawBrand = {
  id: string;
  name: string;
  category: string;
  url: string;
  initial?: string;
  color?: string;
  featured?: boolean;
  stores?: Store[];
};

type RawStatus = {
  status?: string | null;
  live?: { off?: string } | null;
  sale?: { headline?: string; sourceUrl?: string; products?: Product[] } | null;
  newArrival?: boolean;
  newArrivals?: Product[];
  checkedAt?: string;
  logo?: string;
};

export type RawData = {
  brands: RawBrand[];
  categories: Category[];
  statuses: Record<string, RawStatus>;
};

export async function fetchRawData(): Promise<RawData> {
  const [brandsRes, statusRes] = await Promise.all([
    fetch(`${SITE_URL}/brands-data.js`, { cache: 'no-store' }),
    fetch(`${SITE_URL}/sales-status.json`, { cache: 'no-store' }),
  ]);
  if (!brandsRes.ok) throw new Error(`Brand list returned ${brandsRes.status}`);
  if (!statusRes.ok) throw new Error(`Sales list returned ${statusRes.status}`);

  const source = await brandsRes.text();
  const brands = extractConstLiteral(source, 'BRANDS') as RawBrand[];
  const categories = (extractConstLiteral(source, 'CATEGORIES') as { name: string }[]).map((c) => ({
    name: c.name,
  }));
  const statuses = (await statusRes.json()) as Record<string, RawStatus>;

  if (!Array.isArray(brands) || brands.length === 0) throw new Error('Brand list was empty');
  return { brands, categories, statuses };
}

export function buildBrands(raw: RawData): Brand[] {
  return raw.brands
    .filter((b) => b && b.id && b.name)
    .map((b) => {
      const s = raw.statuses[b.id] ?? {};
      const onSale = s.status === 'sale';
      const saleProducts = onSale ? cleanProducts(s.sale?.products) : [];
      const maxDiscount = onSale ? findMaxDiscount(s, saleProducts) : null;
      return {
        id: b.id,
        name: b.name,
        category: b.category,
        url: b.url,
        initial: b.initial || b.name.charAt(0).toUpperCase(),
        color: b.color === 'orange' || b.color === 'teal' ? b.color : 'navy',
        featured: !!b.featured,
        stores: Array.isArray(b.stores) ? b.stores : [],
        logo: s.logo || null,
        onSale,
        saleLabel: onSale ? makeSaleLabel(s.sale?.headline, maxDiscount) : null,
        maxDiscount,
        saleSourceUrl: s.sale?.sourceUrl || null,
        saleProducts,
        newArrival: !!s.newArrival || s.status === 'new' || (s.newArrivals?.length ?? 0) > 0,
        newArrivals: cleanProducts(s.newArrivals),
        checkedAt: s.checkedAt || null,
      };
    });
}

/** Every product currently on sale, across all brands, biggest discount first. */
export function allSaleProducts(brands: Brand[]): SaleProduct[] {
  const seen = new Set<string>();
  const out: SaleProduct[] = [];
  for (const brand of brands) {
    for (const p of brand.saleProducts) {
      if (seen.has(p.url)) continue;
      seen.add(p.url);
      out.push({ ...p, brand, percentOff: productPercentOff(p) });
    }
  }
  return out.sort((a, b) => (b.percentOff ?? -1) - (a.percentOff ?? -1));
}

/** Newest "checked" time across all brands, i.e. when the daily check last ran. */
export function lastCheckedAt(brands: Brand[]): Date | null {
  let latest = 0;
  for (const b of brands) {
    const t = b.checkedAt ? Date.parse(b.checkedAt) : NaN;
    if (!Number.isNaN(t) && t > latest) latest = t;
  }
  return latest ? new Date(latest) : null;
}

export function productPercentOff(p: Product): number | null {
  const fromLabel = p.discount ? Math.abs(parseInt(p.discount.replace(/[^\d-]/g, ''), 10)) : NaN;
  if (fromLabel > 0 && fromLabel < 100) return fromLabel;
  const was = parsePrice(p.originalPrice);
  const now = parsePrice(p.currentPrice);
  if (was && now && was > now) return Math.round((1 - now / was) * 100);
  return null;
}

/** "Rs 3,990" -> 3990 */
export function parsePrice(price?: string | null): number | null {
  if (!price) return null;
  const n = Number(price.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function cleanProducts(list?: Product[] | null): Product[] {
  if (!Array.isArray(list)) return [];
  return list.filter((p) => p && p.name && p.url);
}

// Same idea as getMaxDiscountPercent() on the website: only report a % that
// actually appears in the sale text, plus the real product discounts.
function findMaxDiscount(s: RawStatus, products: Product[]): number | null {
  const text = [s.sale?.headline, s.live?.off].filter(Boolean).join(' ');
  const nums = (text.match(/(\d{1,3})\s*%/g) ?? [])
    .map((m) => parseInt(m, 10))
    .concat(products.map(productPercentOff).filter((n): n is number => n !== null))
    .filter((n) => n > 0 && n < 100);
  return nums.length ? Math.max(...nums) : null;
}

function makeSaleLabel(headline: string | undefined, maxDiscount: number | null): string {
  const h = (headline ?? '').trim();
  const useless = !h || h.length > 24 || /^sale$/i.test(h) || /^0\s*%/.test(h);
  if (!useless) return h.charAt(0).toUpperCase() + h.slice(1).toLowerCase();
  if (maxDiscount) return `Up to ${maxDiscount}% off`;
  return 'Sale on';
}

/**
 * Round-robin across brands (each brand's best deal first, then each brand's
 * second-best, ...) so one brand with lots of products doesn't fill the screen.
 */
export function mixBrands(products: SaleProduct[]): SaleProduct[] {
  const groups = new Map<string, SaleProduct[]>();
  for (const p of products) {
    const list = groups.get(p.brand.id) ?? [];
    list.push(p);
    groups.set(p.brand.id, list);
  }
  const queues = [...groups.values()];
  const out: SaleProduct[] = [];
  for (let round = 0; out.length < products.length; round++) {
    for (const q of queues) if (q[round]) out.push(q[round]);
  }
  return out;
}
