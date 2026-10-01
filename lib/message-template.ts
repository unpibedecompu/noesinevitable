/**
 * BORRADOR — pendiente de revisión y aprobación del dueño del proyecto antes de lanzar.
 * (ver PROJECT_SPEC.md → "Plantilla de mensaje pre-escrito")
 *
 * El usuario edita el cuerpo (sin saludo) en un textarea. El saludo de cada
 * representante se agrega al abrir el mail, así el mismo texto sirve para
 * cualquier destinatario.
 *
 * El texto sale de data/site-copy.json (editable sin tocar código).
 */
import siteCopy from "@/data/site-copy.json";
import type { Gender, Office, Representative } from "@/lib/types";

export const SUBJECT = siteCopy.subject;

export interface BodyContext {
  userName: string;
  countryName: string;
  /** Provincia / departamento elegido en el paso 1 (`null` si el país no tiene). */
  regionName: string | null;
  /** `CountryConfig.regionLabel` del país ("Provincia", "Departamento"…). */
  regionLabel: string;
}

/**
 * "de la provincia de La Pampa, Argentina" / "del departamento de Rivera,
 * Uruguay" / "de la Ciudad de Buenos Aires, Argentina". Sin región o con una
 * etiqueta sin artículo cargado: "de {región}, {país}".
 */
function placeFor(ctx: BodyContext): string {
  const { regionName: region, regionLabel: label, countryName: country } = ctx;
  if (!region) return `de ${country}`;
  if (region === "Ciudad Autónoma de Buenos Aires") return `de la Ciudad de Buenos Aires, ${country}`;
  const prefix = REGION_PREFIX[label];
  return `${prefix ? `${prefix} ` : "de "}${region}, ${country}`;
}

/** Cómo se nombra cada tipo de región en la oración, por `regionLabel`. */
const REGION_PREFIX: Record<string, string> = {
  Provincia: "de la provincia de",
  Departamento: "del departamento de",
};

/**
 * Cuerpo del mensaje, sin el saludo (el usuario ve y edita esto).
 * `{{lugar}}` va en la primera oración ("le escribo como ciudadano/a de la
 * provincia de Córdoba, Argentina"): es lo que identifica al remitente como
 * representado/a del destinatario, como el "I am writing as a constituent"
 * de la plantilla de ControlAI. Incluye la preposición ("de la…", "del…").
 */
export function buildBody(ctx: BodyContext): string {
  const name = ctx.userName || "[tu nombre]";
  return siteCopy.mailContent
    .replaceAll("{{nombre}}", name)
    .replaceAll("{{lugar}}", placeFor(ctx))
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
 * Saludo del mail: "Estimada Diputada Nombre Apellido:" (con "/a" si no hay
 * dato de género). Casillas institucionales: mismo saludo con el titular del
 * cargo (`addressee`), o "Estimados/as:" si no hay una persona detrás
 * (ej. Atención Ciudadana del Senado).
 */
export function salutationFor(rep: Representative): string {
  const name = rep.institutional ? rep.addressee : rep.name;
  if (!name) return "Estimados/as:";
  const estimado = pick(rep.gender, ["Estimada", "Estimado", "Estimado/a"]);
  return `${estimado} ${pick(rep.gender, TITLES[rep.office])} ${name}:`;
}

/** Cuerpo final que va al mail / formulario, ya con el saludo del destinatario. */
export function fullBody(rep: Representative, body: string): string {
  return `${salutationFor(rep)}\n\n${body}`;
}
