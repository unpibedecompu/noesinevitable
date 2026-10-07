import { COUNTRIES } from "@/lib/countries";

/** Título y descripción por defecto (pestaña y vista previa al compartir). */
export const TITLE = "Escribile a tus representantes sobre los riesgos de la IA";

// Países activos, en texto: "Argentina y Uruguay", "Argentina, Uruguay y Chile".
const names = COUNTRIES.map((c) => c.name);
const COUNTRY_LIST =
  names.length > 1 ? `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}` : (names[0] ?? "");
export const DESCRIPTION = `En menos de un minuto, mandale un mail a tus representantes políticos para expresarles tu preocupación por el desarrollo acelerado de la IA de frontera. ${COUNTRY_LIST}.`;
