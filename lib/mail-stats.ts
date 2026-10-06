import baseline from "@/data/mail-sent-stats.json";

/**
 * Participación en vivo, del Worker `workers/cc-counter`:
 * - mails: copias a registro@ (el CC de cada mail), por la región del
 *   representante que lo recibió (`NATIONAL` para cargos nacionales);
 * - personas: navegadores donde alguien apretó "Enviar" al menos una vez
 *   (`recordPerson`), por la región que eligió en el formulario.
 * El Worker recalcula los totales cada 15 minutos y los publica en
 * `GET /stats` (sólo totales, nada personal).
 */
// `NEXT_PUBLIC_CC_WORKER_URL` sólo para probar en local contra `wrangler dev`.
const WORKER_URL =
  process.env.NEXT_PUBLIC_CC_WORKER_URL ?? "https://noesinevitable-cc-counter.unpibedecompu.workers.dev";
export const STATS_URL = `${WORKER_URL}/stats`;
const PEOPLE_URL = `${WORKER_URL}/people`;

/** Marca en localStorage: este navegador ya se contó como persona. */
const COUNTED_KEY = "noesinevitable:persona-contada";

/** Región de los mails a cargos de alcance nacional (igual que en el Worker). */
export const NATIONAL = "_nacional";

/** Una celda de los totales: país + región (`null` = sin especificar). */
export interface Part {
  code: string;
  region: string | null;
  count: number;
}

export interface Participation {
  mails: Part[];
  people: Part[];
}

function addParts(...lists: Part[][]): Part[] {
  const totals = new Map<string, Part>();
  for (const p of lists.flat()) {
    const key = `${p.code}|${p.region ?? ""}`;
    totals.set(key, { ...p, count: (totals.get(key)?.count ?? 0) + p.count });
  }
  return [...totals.values()];
}

/** Las partes de la base no tienen región: van a "sin especificar". */
const base = (list: { code: string; count: number }[]): Part[] =>
  list.map((c) => ({ ...c, region: null }));

/**
 * Suma la participación de antes del conteo automático
 * (`data/mail-sent-stats.json`, sólo por país) a los totales en vivo. Sin
 * datos en vivo devuelve sólo la base.
 */
export function withBaseline(live?: Participation | null): Participation {
  return {
    mails: addParts(base(baseline.mails), live?.mails ?? []),
    people: addParts(base(baseline.people), live?.people ?? []),
  };
}

const parts = (x: unknown): Part[] =>
  Array.isArray(x)
    ? x.map((p: Partial<Part>) => ({
        code: String(p.code),
        region: typeof p.region === "string" ? p.region : null,
        count: Number(p.count) || 0,
      }))
    : [];

/** Pide los totales en vivo; `null` si el Worker no responde a tiempo. */
export async function fetchLiveStats(timeoutMs = 5000): Promise<Participation | null> {
  try {
    const res = await fetch(STATS_URL, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return { mails: parts(data.mails), people: parts(data.people) };
  } catch {
    return null;
  }
}

/**
 * Cuenta a esta persona la primera vez que aprieta "Enviar" en este
 * navegador. Manda sólo país y provincia/departamento, con `sendBeacon` para
 * que no se pierda si la página navega a la app de mail (como texto plano,
 * sin preflight de CORS). Nunca rompe el flujo.
 */
export function recordPerson(country: string, region: string | null): void {
  try {
    if (localStorage.getItem(COUNTED_KEY)) return;
    const body = new Blob([JSON.stringify({ country, region })], { type: "text/plain" });
    if (navigator.sendBeacon?.(PEOPLE_URL, body)) localStorage.setItem(COUNTED_KEY, "1");
  } catch {
    /* sin localStorage (modo privado, etc.): no se cuenta */
  }
}
