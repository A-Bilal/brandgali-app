/** "KURTA LEMON" -> "Kurta Lemon". Names that already mix cases are left alone. */
export function prettyName(name: string): string {
  const letters = name.replace(/[^A-Za-z]/g, '');
  if (!letters || letters !== letters.toUpperCase()) return name;
  return name.toLowerCase().replace(/(^|[\s(\-/&])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** "Checked this morning", "Checked yesterday", "Checked 3 days ago" */
export function checkedLabel(date: Date | null, now = new Date()): string {
  if (!date) return 'Checked daily';
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = date.getTime();
  if (t >= startOfToday) {
    const h = date.getHours();
    return h < 12 ? 'Checked this morning' : h < 17 ? 'Checked this afternoon' : 'Checked this evening';
  }
  const days = Math.ceil((startOfToday - t) / 86_400_000);
  return days <= 1 ? 'Checked yesterday' : `Checked ${days} days ago`;
}

/** "Rs 3,990" -> "3,990" (for the crossed-out old price) */
export function stripCurrency(price?: string | null): string {
  return (price ?? '').replace(/^\s*(Rs\.?|PKR)\s*/i, '');
}

/** "https://www.beechtree.pk/" -> "beechtree.pk" */
export function displayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
