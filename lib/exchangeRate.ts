// Live USD -> ZAR exchange rate, cached in-memory per server process.
// This site's prices are already ZAR-denominated (matching BobPay), so this
// is only used to convert for display when a customer selects USD.

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const FALLBACK_USD_TO_ZAR = 18.5; // used only if the live API is unreachable

let cached: { rate: number; fetchedAt: number } | null = null;

export async function getUsdToZarRate(): Promise<number> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rate;
  }

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=ZAR', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`exchange rate API responded ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.ZAR;
    if (typeof rate !== 'number' || !Number.isFinite(rate)) {
      throw new Error('exchange rate API returned an invalid rate');
    }
    cached = { rate, fetchedAt: Date.now() };
    return rate;
  } catch (error) {
    console.error('Failed to fetch live USD/ZAR rate, using fallback:', error);
    return cached?.rate ?? FALLBACK_USD_TO_ZAR;
  }
}
