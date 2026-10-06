import baseline from "@/data/mail-sent-stats.json";

/**
 * Totales de mails enviados, en vivo: el Worker `workers/cc-counter` los
 * recalcula cada 15 minutos a partir de las copias a registro@ y los publica
 * en `GET /stats` (sólo totales por país, nada personal).
 */
export const STATS_URL =
  "https://noesinevitable-cc-counter.unpibedecompu.workers.dev/stats";

export interface CountryCount {
  code: string;
  count: number;
}

/**
 * Suma los mails de antes del conteo por CC (`data/mail-sent-stats.json`) a
 * los totales en vivo. Sin datos en vivo devuelve sólo la base.
 */
export function withBaseline(live: CountryCount[] = []): CountryCount[] {
  const totals = new Map<string, number>();
  for (const { code, count } of [...baseline.byCountry, ...live]) {
    totals.set(code, (totals.get(code) ?? 0) + count);
  }
  return [...totals].map(([code, count]) => ({ code, count }));
}

/** Pide los totales en vivo; `null` si el Worker no responde a tiempo. */
export async function fetchLiveCounts(timeoutMs = 5000): Promise<CountryCount[] | null> {
  try {
    const res = await fetch(STATS_URL, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const data = (await res.json()) as { byCountry?: CountryCount[] };
    return Array.isArray(data.byCountry) ? data.byCountry : null;
  } catch {
    return null;
  }
}
