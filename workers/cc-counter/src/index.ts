/**
 * Contador de mails enviados a representantes.
 *
 * El sitio pone `registro@noesinevitable.org` en CC de cada mail. Email
 * Routing entrega esa copia a este Worker, que:
 *   1. lee sólo el header `To` (no parsea el mail entero: el plan free tiene
 *      poco CPU por ejecución),
 *   2. si el destinatario es un representante conocido, suma 1 a su contador
 *      del día en D1 — una sola fila escrita por mail,
 *   3. descarta el mail — no se guarda contenido ni direcciones del remitente.
 *
 * La alarma de cupo corre aparte, en un cron cada 15 minutos: suma los mails
 * del día y avisa por mail al cruzar el 70% y el 90% de `DAILY_LIMIT`, para
 * pasar a Workers Paid antes de que un pico deje mails sin contar. Ver
 * README.md.
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
}

/** email (minúsculas) → país, de `data/representatives.json`. */
const REPS = new Map<string, string>(
  (representatives as { email: string; country: string }[])
    .filter((r) => r.email)
    .map((r) => [r.email.trim().toLowerCase(), r.country]),
);

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
        .bind(today(), rep, REPS.get(rep))
        .run();
    }
    // Sin forward ni reject: Email Routing descarta el mail.
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const day = today();
    // La clave primaria empieza por `day`: sólo se leen las filas de hoy
    // (a lo sumo una por representante).
    const row = await env.DB.prepare(
      `SELECT
         (SELECT COALESCE(SUM(sent), 0) FROM counts WHERE day = ?1) AS sent,
         (SELECT COALESCE(alerted, 0) FROM alerts WHERE day = ?1) AS alerted`,
    )
      .bind(day)
      .first<{ sent: number; alerted: number | null }>();
    if (row) await maybeAlert(env, day, row.sent, row.alerted ?? 0);
  },
};

async function maybeAlert(
  env: Env,
  day: string,
  sent: number,
  alerted: number,
): Promise<void> {
  const limit = Number(env.DAILY_LIMIT) || 100000;
  for (const { pct, bit } of THRESHOLDS) {
    if (sent < (limit * pct) / 100 || alerted & bit) continue;
    await env.DB.prepare(
      `INSERT INTO alerts (day, alerted) VALUES (?1, ?2)
       ON CONFLICT(day) DO UPDATE SET alerted = alerted | ?2`,
    )
      .bind(day, bit)
      .run();

    const subject = `noesinevitable.org: ${pct}% del cupo diario de mails (${sent}/${limit})`;
    const body = [
      `Hoy (${day}, UTC) el Worker cc-counter ya contó ${sent} mails,`,
      `el ${pct}% del tope configurado (DAILY_LIMIT = ${limit}).`,
      "",
      "Cupos del plan free: 100k ejecuciones de Worker/día y 100k filas",
      "escritas en D1/día (1 por mail). Los mails ignorados (respuestas de",
      "despachos, direcciones desconocidas) también gastan ejecuciones y no",
      "aparecen en este número. Si sigue subiendo, pasar a Workers Paid",
      "($5/mes) para no perder conteos.",
    ].join("\r\n");
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
      body,
    ].join("\r\n");
    await env.ALERT.send(new EmailMessage(env.ALERT_FROM, env.ALERT_TO, raw));
  }
}
