/**
 * Eventos de embudo, sin lock-in a un proveedor.
 *
 * OJO (ver PROJECT_SPEC): no hay forma de saber si el usuario realmente apretó
 * "enviar" en su cliente de mail. `email_client_opened` es el mejor proxy que
 * tenemos y hay que leerlo como una aproximación, no como envíos.
 *
 * `trackFunnel` dispara el evento contra cualquier analytics con script-tag que
 * esté cargado (Plausible, Umami, GA, Fathom…). Si no hay ninguno, es no-op.
 * Cloudflare Web Analytics (gratis, ilimitado) cubre los pageviews por separado.
 */
export type FunnelEvent =
  | "step_viewed"
  | "country_selected"
  | "region_selected"
  | "message_generated"
  | "step_back_clicked"
  | "view_representatives_clicked"
  | "subject_edited"
  | "body_edited"
  | "finish_clicked"
  | "email_client_opened"
  | "email_sent_confirmed"
  | "email_didnt_open_clicked"
  | "shared"
  | "course_clicked"
  | "social_link_clicked"
  | "write_another_clicked"
  | "repo_link_clicked";

type Props = Record<string, string | number | boolean>;

interface AnalyticsGlobals {
  plausible?: (event: string, opts?: { props?: Props }) => void;
  umami?: { track?: (event: string, data?: Props) => void };
  gtag?: (command: "event", event: string, params?: Props) => void;
  fathom?: { trackEvent?: (event: string) => void };
}

export function trackFunnel(event: FunnelEvent, props?: Props) {
  if (typeof window === "undefined") return;
  const w = window as unknown as AnalyticsGlobals;
  try {
    w.plausible?.(event, props ? { props } : undefined);
    w.umami?.track?.(event, props);
    w.gtag?.("event", event, props);
    w.fathom?.trackEvent?.(event);
  } catch {
    /* analytics nunca debe romper el flujo */
  }
}
