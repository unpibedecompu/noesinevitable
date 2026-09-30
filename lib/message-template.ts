/**
 * BORRADOR — pendiente de revisión y aprobación del dueño del proyecto antes de lanzar.
 * (ver PROJECT_SPEC.md → "Plantilla de mensaje pre-escrito")
 *
 * El usuario edita el cuerpo (sin saludo) en un textarea. El saludo y la línea
 * de presentación de cada representante se agregan al abrir el mail, así el
 * mismo texto sirve para cualquier destinatario.
 *
 * El texto sale de data/site-copy.json (editable sin tocar código).
 */
import siteCopy from "@/data/site-copy.json";
import { getCountry } from "@/lib/countries";
import type { Gender, Office, Representative } from "@/lib/types";

export const SUBJECT = siteCopy.subject;

export interface BodyContext {
  userName: string;
  countryName: string;
}

/** Cuerpo del mensaje, sin el saludo (el usuario ve y edita esto). */
export function buildBody(ctx: BodyContext): string {
  const name = ctx.userName || "[tu nombre]";
  return siteCopy.mailContent
    .replaceAll("{{nombre}}", name)
    .replaceAll("{{pais}}", ctx.countryName);
}

/** Título del cargo por género: [femenino, masculino, sin dato]. */
const TITLES: Record<Office, [string, string, string]> = {
  presidente: ["Presidenta", "Presidente", "Presidente/a"],
  vicepresidente: ["Vicepresidenta", "Vicepresidente", "Vicepresidente/a"],
  gobernador: ["Gobernadora", "Gobernador", "Gobernador/a"],
  presidente_gobierno: ["Presidenta del Gobierno", "Presidente del Gobierno", "Presidente/a del Gobierno"],
  vicegobernador: ["Vicegobernadora", "Vicegobernador", "Vicegobernador/a"],
  senador_nacional: ["Senadora", "Senador", "Senador/a"],
  diputado_nacional: ["Diputada", "Diputado", "Diputado/a"],
};

const pick = <T>(g: Gender | undefined, [f, m, x]: [T, T, T]) =>
  g === "f" ? f : g === "m" ? m : x;

/**
 * Saludo del mail. Personas: "Estimada Diputada Nombre Apellido:" (con "/a" si
 * no hay dato de género). Casillas institucionales (Presidencia, Atención
 * Ciudadana…): fórmula formal sin nombre.
 */
export function salutationFor(rep: Representative): string {
  if (rep.institutional) return "De mi mayor consideración:";
  const estimado = pick(rep.gender, ["Estimada", "Estimado", "Estimado/a"]);
  return `${estimado} ${pick(rep.gender, TITLES[rep.office])} ${rep.name}:`;
}

/** Cámara de cada cargo legislativo, por país. Sin entrada → no hay línea de presentación. */
const CHAMBERS: Record<string, Partial<Record<Office, string>>> = {
  AR: {
    diputado_nacional: "la Cámara de Diputados de la Nación",
    senador_nacional: "el Senado de la Nación",
  },
  UY: {
    diputado_nacional: "la Cámara de Representantes",
    senador_nacional: "la Cámara de Senadores",
  },
};

/** Artículo de cada etiqueta de región (`CountryConfig.regionLabel`). */
const REGION_ARTICLE: Record<string, string> = {
  Provincia: "la",
  Departamento: "el",
};

/**
 * Línea que ubica al remitente como representado/a del destinatario, ej:
 * "Vivo en Córdoba, la provincia que usted representa en el Senado de la Nación."
 * Sólo para cargos con región (el usuario eligió esa misma región en el paso 1).
 * `null` si no aplica (cargos nacionales, instituciones, países sin datos).
 */
export function introFor(rep: Representative): string | null {
  const chamber = CHAMBERS[rep.country]?.[rep.office];
  if (rep.institutional || !rep.region || !chamber) return null;
  // CABA no es provincia: "la Ciudad Autónoma de Buenos Aires, el distrito…".
  if (rep.region === "Ciudad Autónoma de Buenos Aires") {
    return `Vivo en la ${rep.region}, el distrito que usted representa en ${chamber}.`;
  }
  const label = getCountry(rep.country)?.regionLabel;
  const article = label && REGION_ARTICLE[label];
  const where = article ? `, ${article} ${label!.toLowerCase()} que usted representa` : ", que usted representa";
  return `Vivo en ${rep.region}${where} en ${chamber}.`;
}

/** Cuerpo final que va al mail / formulario, con saludo y presentación del destinatario. */
export function fullBody(rep: Representative, body: string): string {
  const intro = introFor(rep);
  return [salutationFor(rep), intro, body].filter(Boolean).join("\n\n");
}
