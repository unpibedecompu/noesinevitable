export type MailProvider = "gmail" | "outlook" | "mailto";

export interface ComposeParams {
  to: string;
  /** Copia (opcional). Se usa para la dirección de tracking (`TRACKING_CC`). */
  cc?: string;
  subject: string;
  body: string;
}

/**
 * Dirección que va en CC de cada mail para contar envíos reales (la recibe el
 * Worker de `workers/cc-counter/`, que sólo suma 1 por representante y
 * descarta el mail). Poner "" para desactivarla.
 *
 * ⚠ No deployar con esta dirección antes de que el Worker y el Email Routing
 * de noesinevitable.org estén andando: si no, cada CC rebota y el usuario
 * recibe un aviso de error de entrega.
 */
export const TRACKING_CC = "registro@noesinevitable.org";

/** `{ cc }` si hay CC, `{}` si no — para no mandar un `cc=` vacío. */
const ccParam = (cc: string | undefined): Record<string, string> =>
  cc ? { cc } : {};

/** URLSearchParams usa "+" para los espacios; muchos clientes lo toman literal. */
const qs = (params: Record<string, string>) =>
  new URLSearchParams(params).toString().replace(/\+/g, "%20");

/**
 * Link `mailto:` — abre el cliente de correo del sistema operativo.
 * Fase 1: no hay backend de envío — el usuario manda el mail desde su propio cliente.
 */
export function buildMailto(params: ComposeParams): string {
  return `mailto:${encodeURIComponent(params.to)}?${qs({
    ...ccParam(params.cc),
    subject: params.subject,
    body: params.body,
  })}`;
}

/** Compositor web de Gmail, pre-cargado. Abre en una pestaña nueva (desktop). */
export function buildGmailCompose(params: ComposeParams): string {
  return `https://mail.google.com/mail/?${qs({
    view: "cm",
    fs: "1",
    to: params.to,
    ...ccParam(params.cc),
    su: params.subject,
    body: params.body,
  })}`;
}

/** Compositor web de Outlook, pre-cargado. Abre en una pestaña nueva (desktop). */
export function buildOutlookCompose(params: ComposeParams): string {
  return `https://outlook.office.com/mail/deeplink/compose?${qs({
    to: params.to,
    ...ccParam(params.cc),
    subject: params.subject,
    body: params.body,
  })}`;
}

/**
 * Deep link a la app de Gmail en iOS: esquema no oficial pero ampliamente
 * usado (`googlegmail:///co`). Sólo funciona en iOS — la app de Gmail para
 * Android no registra este esquema. Si la app no está instalada, el
 * navegador no navega a ningún lado — por eso siempre queda como red de
 * contención el fallback "¿No se abrió? Copiá el mensaje".
 */
export function buildGmailAppCompose(params: ComposeParams): string {
  return `googlegmail:///co?${qs({
    to: params.to,
    ...ccParam(params.cc),
    subject: params.subject,
    body: params.body,
  })}`;
}

/**
 * Deep link a la app de Gmail en Android. `mail.google.com/mail/?view=cm`
 * es un truco sólo del compositor *web*: si se envuelve esa URL en un
 * intent, Android abre igual la app de Gmail pero en la bandeja de
 * entrada, ignorando los parámetros (probado en dispositivo). Lo que sí
 * entiende la app es un `mailto:` real, así que se arma ese URI (mismo
 * formato que `buildMailto`) y se envuelve en un intent `android.intent
 * .action.VIEW` forzado al paquete `com.google.android.gm`. Al ser
 * "mailto" un esquema opaco (sin autoridad), la parte antes de `#Intent;`
 * va sin `//`, para que Android reconstruya `mailto:destinatario?...` en
 * vez de `mailto://destinatario?...`.
 */
export function buildGmailAppComposeAndroid(params: ComposeParams): string {
  const ssp = `${encodeURIComponent(params.to)}?${qs({
    ...ccParam(params.cc),
    subject: params.subject,
    body: params.body,
  })}`;
  const fallback = encodeURIComponent(buildGmailCompose(params));
  return `intent:${ssp}#Intent;scheme=mailto;package=com.google.android.gm;S.browser_fallback_url=${fallback};end`;
}

/**
 * Deep link a la app de Outlook (iOS/Android), esquema no oficial
 * (`ms-outlook://compose`). Misma salvedad que `buildGmailAppCompose`.
 */
export function buildOutlookAppCompose(params: ComposeParams): string {
  return `ms-outlook://compose?${qs({
    to: params.to,
    ...ccParam(params.cc),
    subject: params.subject,
    body: params.body,
  })}`;
}

/** Devuelve el link de envío según el proveedor elegido por el usuario. */
export function buildComposeUrl(
  provider: MailProvider,
  params: ComposeParams,
): string {
  if (provider === "gmail") return buildGmailCompose(params);
  if (provider === "outlook") return buildOutlookCompose(params);
  return buildMailto(params);
}

/** Link de "compartir en X/Twitter". */
export function buildShareX(text: string, url: string): string {
  const q = new URLSearchParams({ text, url });
  return `https://twitter.com/intent/tweet?${q.toString()}`;
}

/** Link de "compartir en Facebook". */
export function buildShareFacebook(url: string): string {
  const q = new URLSearchParams({ u: url });
  return `https://www.facebook.com/sharer/sharer.php?${q.toString()}`;
}

/** Link de "compartir en WhatsApp" (clave en LatAm, sobre todo mobile). */
export function buildShareWhatsApp(text: string): string {
  const q = new URLSearchParams({ text });
  return `https://wa.me/?${q.toString()}`;
}
