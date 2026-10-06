/**
 * Contador de mails enviados a representantes + alarmas de cupo.
 *
 * El sitio pone `registro@noesinevitable.org` en CC de cada mail. Email
 * Routing entrega esa copia a este Worker, que:
 *   1. lee sólo el header `To` (no parsea el mail entero: el plan free tiene
 *      poco CPU por ejecución),
 *   2. si el destinatario es un representante conocido, suma 1 a su contador
 *      del día en D1 — una sola fila escrita por mail,
 *   3. descarta el mail — no se guarda contenido ni direcciones del remitente.
 *
 * Personas: el sitio hace `POST /people` (sólo país y provincia/departamento)
 * la primera vez que alguien aprieta "Enviar" en ese navegador; se suma 1 por
 * país, región y día.
 *
 * Totales públicos: el cron de 15 minutos guarda mails y personas por país en
 * una sola fila de D1, y `GET /stats` devuelve esa fila (la usa /home del
 * sitio). Así cada visita lee 1 fila, no las tablas enteras.
 *
 * Alarmas por mail a `ALERT_TO`, al cruzar el 70% y el 90% de cada cupo (una
 * vez por umbral y período):
 *   - cupo diario de este Worker/D1 (`DAILY_LIMIT`), cron cada 15 minutos;
 *   - cupo mensual de eventos de Umami Cloud (`UMAMI_MONTHLY_LIMIT`), cron
 *     diario. Umami no tiene alertas propias ni API de uso, así que el uso se
 *     reconstruye con la API de estadísticas.
 * Ver README.md.
 */
import { EmailMessage } from "cloudflare:email";
import representatives from "../../../data/representatives.json";

interface Env {
  DB: D1Database;
  ALERT: SendEmail;
  /** Tope diario de mails a contar (string porque viene de `vars`). */
  DAILY_LIMIT?: string;
  ALERT_FROM: string;
  ALERT_TO: string;
  /** Secret (`wrangler secret put UMAMI_API_KEY`). Sin él no hay alarma de Umami. */
  UMAMI_API_KEY?: string;
  UMAMI_WEBSITE_ID: string;
  /** Eventos por período de facturación del plan de Umami. */
  UMAMI_MONTHLY_LIMIT?: string;
  /** Día del mes en que arranca el período de facturación de Umami (1-28). */
  UMAMI_BILLING_DAY?: string;
  /** Sólo para pruebas locales contra un mock; en producción no se define. */
  UMAMI_API_URL?: string;
}

/** Cron de la alarma de Umami (el otro, cada 15 minutos, es el del cupo diario). */
const UMAMI_CRON = "0 11 * * *";
const UMAMI_API = "https://api.umami.is/v1";

type Rep = { country: string; region: string | null };

/** email (minúsculas) → país y provincia/departamento, de `data/representatives.json`. */
const REPS = new Map<string, Rep>(
  (representatives as ({ email: string } & Rep)[])
    .filter((r) => r.email)
    .map((r) => [r.email.trim().toLowerCase(), { country: r.country, region: r.region }]),
);

/** País → provincias/departamentos con representantes cargados. */
const REGIONS = new Map<string, Set<string>>();
for (const { country, region } of REPS.values()) {
  if (!REGIONS.has(country)) REGIONS.set(country, new Set());
  if (region) REGIONS.get(country)!.add(region);
}

/**
 * Región de los mails a cargos de alcance nacional (Presidencia, senadores
 * de UY…) en los totales públicos; el sitio la muestra como "Cargos
 * nacionales". `null` es "sin especificar".
 */
const NATIONAL = "_nacional";

const THRESHOLDS = [
  { pct: 70, bit: 1 },
  { pct: 90, bit: 2 },
];

/** Día actual en UTC, `YYYY-MM-DD`. */
const today = () => new Date().toISOString().slice(0, 10);

/** Direcciones de un header tipo `"Nombre" <a@b.com>, c@d.com`, en minúsculas. */
function addresses(header: string | null): string[] {
  if (!header) return [];
  return (header.match(/[^\s<>,;"']+@[^\s<>,;"']+/g) ?? []).map((a) =>
    a.toLowerCase(),
  );
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    // Respuesta de un despacho con "responder a todos": la manda el
    // representante, no un ciudadano — no se cuenta.
    const fromRep = addresses(message.headers.get("from")).some((a) =>
      REPS.has(a),
    );
    const rep = fromRep
      ? undefined
      : addresses(message.headers.get("to")).find((a) => REPS.has(a));

    if (rep) {
      await env.DB.prepare(
        `INSERT INTO counts (day, email, country, sent) VALUES (?1, ?2, ?3, 1)
         ON CONFLICT(day, email) DO UPDATE SET sent = sent + 1`,
      )
        .bind(today(), rep, REPS.get(rep)!.country)
        .run();
    }
    // Sin forward ni reject: Email Routing descarta el mail.
  },

  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    if (controller.cron === UMAMI_CRON) await checkUmami(env);
    else {
      await updatePublicStats(env);
      await checkDaily(env);
    }
  },

  /**
   * `GET /stats`: totales públicos de mails y personas por país y región
   * (nada personal). `POST /people`: el sitio avisa, una sola vez por
   * navegador, que alguien apretó "Enviar"; el cuerpo es sólo
   * `{"country":"AR","region":"Córdoba"}` (o el código de país pelado).
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (pathname === "/stats" && request.method === "GET") {
      const row = await env.DB.prepare(`SELECT value FROM stats WHERE key = 'public'`)
        .first<{ value: string }>();
      return new Response(row?.value ?? JSON.stringify({ updatedAt: null, mails: [], people: [] }), {
        headers: {
          ...CORS,
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }
    if (pathname === "/people" && request.method === "POST") {
      const { country, region } = parsePerson(await request.text());
      if (!REGIONS.has(country)) {
        return new Response("Unknown country", { status: 400, headers: CORS });
      }
      // Una región que no es de ese país se guarda como "sin especificar".
      const known = region && REGIONS.get(country)!.has(region) ? region : "";
      await env.DB.prepare(
        `INSERT INTO participants (day, country, region, n) VALUES (?1, ?2, ?3, 1)
         ON CONFLICT(day, country, region) DO UPDATE SET n = n + 1`,
      )
        .bind(today(), country, known)
        .run();
      return new Response(null, { status: 204, headers: CORS });
    }
    return new Response("Not found", { status: 404, headers: CORS });
  },
};

/** Los totales son públicos: cualquier origen puede leerlos (y sumar personas). */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

/** Cuerpo de `POST /people`: JSON `{ country, region }` o el código de país pelado. */
function parsePerson(body: string): { country: string; region: string | null } {
  try {
    const data = JSON.parse(body) as { country?: unknown; region?: unknown };
    return {
      country: String(data.country ?? "").toUpperCase(),
      region: typeof data.region === "string" ? data.region : null,
    };
  } catch {
    return { country: body.trim().toUpperCase(), region: null };
  }
}

/** Una celda de los totales: país + región (`null` = sin especificar). */
type Part = { code: string; region: string | null; count: number };
type Totals = { mails: Part[]; people: Part[] };

/**
 * Mails y personas por país y región, en los días que cumplen `where`. Los
 * mails van a la región del representante (o `NATIONAL`); las personas, a la
 * que eligieron en el formulario.
 */
async function sumParts(env: Env, where: string, day: string): Promise<Totals> {
  const [mails, people] = await env.DB.batch([
    env.DB.prepare(
      `SELECT email, country, SUM(sent) AS count FROM counts WHERE ${where} GROUP BY email`,
    ).bind(day),
    env.DB.prepare(
      `SELECT country AS code, region, SUM(n) AS count FROM participants
       WHERE ${where} GROUP BY country, region`,
    ).bind(day),
  ]);
  return {
    mails: addParts(
      (mails.results as { email: string; country: string; count: number }[]).map((r) => ({
        code: r.country,
        region: REPS.get(r.email)?.region ?? NATIONAL,
        count: r.count,
      })),
    ),
    people: (people.results as Part[]).map((r) => ({ ...r, region: r.region || null })),
  };
}

function addParts(...lists: Part[][]): Part[] {
  const totals = new Map<string, Part>();
  for (const p of lists.flat()) {
    const key = `${p.code}|${p.region ?? ""}`;
    const prev = totals.get(key);
    totals.set(key, { ...p, count: (prev?.count ?? 0) + p.count });
  }
  return [...totals.values()];
}

/**
 * Recalcula los totales públicos (`stats` → 'public'). Para no leer las
 * tablas enteras cada 15 minutos, los días anteriores a hoy se suman una vez
 * por día y quedan guardados en `stats` → 'past'; cada corrida suma sólo las
 * filas de hoy.
 */
async function updatePublicStats(env: Env): Promise<void> {
  const day = today();
  const pastRow = await env.DB.prepare(`SELECT value FROM stats WHERE key = 'past'`)
    .first<{ value: string }>();
  let past = pastRow ? (JSON.parse(pastRow.value) as Totals & { through: string; v?: number }) : null;
  // `v` cambia si cambia la forma de los totales: se recalcula.
  if (!past || past.through !== day || past.v !== 2) {
    past = { v: 2, through: day, ...(await sumParts(env, "day < ?1", day)) };
    await putStat(env, "past", past);
  }
  const current = await sumParts(env, "day = ?1", day);
  await putStat(env, "public", {
    updatedAt: new Date().toISOString(),
    mails: addParts(past.mails, current.mails),
    people: addParts(past.people, current.people),
  });
}

async function putStat(env: Env, key: string, value: unknown): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO stats (key, value) VALUES (?1, ?2)
     ON CONFLICT(key) DO UPDATE SET value = ?2`,
  )
    .bind(key, JSON.stringify(value))
    .run();
}

/** Cupo diario de mails contados (Worker + D1). */
async function checkDaily(env: Env): Promise<void> {
  const day = today();
  // La clave primaria de `counts` empieza por `day`: sólo se leen las filas
  // de hoy (a lo sumo una por representante).
  const row = await env.DB.prepare(
    `SELECT COALESCE(SUM(sent), 0) AS sent FROM counts WHERE day = ?1`,
  )
    .bind(day)
    .first<{ sent: number }>();
  const limit = Number(env.DAILY_LIMIT) || 100000;
  await maybeAlert(env, `cc:${day}`, row?.sent ?? 0, limit, (pct, sent) => ({
    subject: `noesinevitable.org: ${pct}% del cupo diario de mails (${sent}/${limit})`,
    body: [
      `Hoy (${day}, UTC) el Worker cc-counter ya contó ${sent} mails,`,
      `el ${pct}% del tope configurado (DAILY_LIMIT = ${limit}).`,
      "",
      "Cupos del plan free: 100k ejecuciones de Worker/día y 100k filas",
      "escritas en D1/día (1 por mail). Los mails ignorados (respuestas de",
      "despachos, direcciones desconocidas) también gastan ejecuciones y no",
      "aparecen en este número. Si sigue subiendo, pasar a Workers Paid",
      "($5/mes) para no perder conteos.",
    ],
  }));
}

/**
 * Inicio del período de facturación de Umami que contiene `now`, en UTC:
 * el día `billingDay` de este mes, o del anterior si todavía no llegó.
 */
function billingPeriodStart(now: Date, billingDay: number): Date {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), billingDay),
  );
  if (start > now) start.setUTCMonth(start.getUTCMonth() - 1);
  return start;
}

/** Un número de la API de Umami: según la versión viene pelado o como `{ value }`. */
function num(x: unknown): number {
  if (typeof x === "number") return x;
  if (x && typeof x === "object" && "value" in x) return Number(x.value) || 0;
  return Number(x) || 0;
}

async function umamiGet(env: Env, path: string, start: Date, end: Date) {
  const url = `${env.UMAMI_API_URL ?? UMAMI_API}/websites/${env.UMAMI_WEBSITE_ID}/${path}?startAt=${start.getTime()}&endAt=${end.getTime()}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${env.UMAMI_API_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

/**
 * Uso del período según cómo lo mide Umami Cloud: cada pageview y cada evento
 * propio cuentan 1, y cada propiedad guardada de un evento cuenta 1 más. (La
 * "session data" también cuenta, pero el sitio no la usa.)
 */
async function umamiUsage(env: Env, start: Date, end: Date) {
  const [stats, events, eventData] = await Promise.all([
    umamiGet(env, "stats", start, end),
    umamiGet(env, "events/stats", start, end),
    umamiGet(env, "event-data/stats", start, end),
  ]);
  const ed = (Array.isArray(eventData) ? eventData[0] : eventData) ?? {};
  const pageviews = num(stats.pageviews);
  const customEvents = num(
    ((events.data ?? events) as Record<string, unknown>).events,
  );
  const properties = num((ed as Record<string, unknown>).records);
  return { pageviews, customEvents, properties, total: pageviews + customEvents + properties };
}

/** Cupo mensual de eventos de Umami Cloud. */
async function checkUmami(env: Env): Promise<void> {
  if (!env.UMAMI_API_KEY) return;
  const now = new Date();
  const start = billingPeriodStart(now, Number(env.UMAMI_BILLING_DAY) || 1);
  const period = start.toISOString().slice(0, 10);
  const limit = Number(env.UMAMI_MONTHLY_LIMIT) || 1000000;

  let usage;
  try {
    usage = await umamiUsage(env, start, now);
  } catch (err) {
    // Si la API falla (clave vencida, cambio de API…) la alarma quedaría muda
    // sin que nadie se entere: avisar, a lo sumo una vez por día.
    await notifyOnce(env, `umami-error:${today()}`, 1, {
      subject: "noesinevitable.org: no pude consultar el uso de Umami",
      body: [
        `La alarma de cupo de Umami falló: ${String(err)}`,
        "",
        "Revisar la API key (UMAMI_API_KEY) del Worker cc-counter. Mientras",
        "tanto, mirar el uso a mano en Umami Cloud → Settings → Usage.",
      ],
    });
    return;
  }

  await maybeAlert(env, `umami:${period}`, usage.total, limit, (pct, total) => ({
    subject: `noesinevitable.org: ${pct}% del cupo mensual de Umami (${total}/${limit})`,
    body: [
      `Desde el ${period} (inicio del período de facturación, UTC), Umami`,
      `lleva ~${total} eventos, el ${pct}% del cupo (UMAMI_MONTHLY_LIMIT = ${limit}):`,
      `  - pageviews: ${usage.pageviews}`,
      `  - eventos propios: ${usage.customEvents}`,
      `  - propiedades de eventos: ${usage.properties}`,
      "",
      "Es una estimación con la API de estadísticas; el número oficial está",
      "en Umami Cloud → Settings → Usage. En el plan Pro, pasado el cupo cada",
      "evento extra se cobra ($0.00003, ~$30 por millón). Si sigue subiendo,",
      "recortar eventos (ver PROJECT_STATUS.md → \"Recortar eventos de",
      "analytics\") o presupuestar el excedente.",
    ],
  }));
}

type Message = { subject: string; body: string[] };

/** Avisa al cruzar el 70% y el 90% de `limit`, una vez por umbral y `key`. */
async function maybeAlert(
  env: Env,
  key: string,
  value: number,
  limit: number,
  message: (pct: number, value: number) => Message,
): Promise<void> {
  for (const { pct, bit } of THRESHOLDS) {
    if (value >= (limit * pct) / 100) {
      await notifyOnce(env, key, bit, message(pct, value));
    }
  }
}

/** Manda `message` salvo que el bit `bit` de `key` ya esté marcado en `notices`. */
async function notifyOnce(
  env: Env,
  key: string,
  bit: number,
  message: Message,
): Promise<void> {
  const row = await env.DB.prepare(`SELECT alerted FROM notices WHERE key = ?1`)
    .bind(key)
    .first<{ alerted: number }>();
  if ((row?.alerted ?? 0) & bit) return;
  await env.DB.prepare(
    `INSERT INTO notices (key, alerted) VALUES (?1, ?2)
     ON CONFLICT(key) DO UPDATE SET alerted = alerted | ?2`,
  )
    .bind(key, bit)
    .run();
  await sendMail(env, message);
}

async function sendMail(env: Env, { subject, body }: Message): Promise<void> {
  const raw = [
    `From: noesinevitable.org <${env.ALERT_FROM}>`,
    `To: ${env.ALERT_TO}`,
    `Subject: ${subject}`,
    `Message-ID: <${crypto.randomUUID()}@noesinevitable.org>`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body.join("\r\n"),
  ].join("\r\n");
  await env.ALERT.send(new EmailMessage(env.ALERT_FROM, env.ALERT_TO, raw));
}
