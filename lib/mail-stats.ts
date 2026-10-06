import baseline from "@/data/mail-sent-stats.json";

/**
 * Participación en vivo, del Worker `workers/cc-counter`:
 * - mails: copias a registro@ (el CC de cada mail);
 * - personas: navegadores donde alguien apretó "Enviar" al menos una vez
 *   (`recordPerson`).
 * El Worker recalcula los totales cada 15 minutos y los publica en
 * `GET /stats` (sólo totales por país, nada personal).
 */
const WORKER_URL = "https://noesinevitable-cc-counter.unpibedecompu.workers.dev";
export const STATS_URL = `${WORKER_URL}/stats`;
const PEOPLE_URL = `${WORKER_URL}/people`;

/** Marca en localStorage: este navegador ya se contó como persona. */
const COUNTED_KEY = "noesinevitable:persona-contada";

export interface CountryCount {
  code: string;
  count: number;
}

export interface Participation {
  mails: CountryCount[];
  people: CountryCount[];
}

function addCounts(...lists: CountryCount[][]): CountryCount[] {
  const totals = new Map<string, number>();
  for (const { code, count } of lists.flat()) totals.set(code, (totals.get(code) ?? 0) + count);
  return [...totals].map(([code, count]) => ({ code, count }));
}

/**
 * Suma la participación de antes del conteo automático
 * (`data/mail-sent-stats.json`) a los totales en vivo. Sin datos en vivo
 * devuelve sólo la base.
 */
export function withBaseline(live?: Participation | null): Participation {
  return {
    mails: addCounts(baseline.mails, live?.mails ?? []),
    people: addCounts(baseline.people, live?.people ?? []),
  };
}

/** Pide los totales en vivo; `null` si el Worker no responde a tiempo. */
export async function fetchLiveStats(timeoutMs = 5000): Promise<Participation | null> {
  try {
    const res = await fetch(STATS_URL, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<Participation>;
    return {
      mails: Array.isArray(data.mails) ? data.mails : [],
      people: Array.isArray(data.people) ? data.people : [],
    };
  } catch {
    return null;
  }
}

/**
 * Cuenta a esta persona la primera vez que aprieta "Enviar" en este
 * navegador. Manda sólo el código de país, con `sendBeacon` para que no se
 * pierda si la página navega a la app de mail. Nunca rompe el flujo.
 */
export function recordPerson(country: string): void {
  try {
    if (localStorage.getItem(COUNTED_KEY)) return;
    if (navigator.sendBeacon?.(PEOPLE_URL, country)) localStorage.setItem(COUNTED_KEY, "1");
  } catch {
    /* sin localStorage (modo privado, etc.): no se cuenta */
  }
}
