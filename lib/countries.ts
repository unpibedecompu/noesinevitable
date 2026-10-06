import type { CountryConfig } from "./types";

/**
 * Países incluidos. Los comentados quedan pendientes de datos verificados
 * (ver DATA_TODO.md). Excluidos a propósito: Venezuela, Perú, Cuba.
 */
export const COUNTRIES: CountryConfig[] = [
  { code: "AR", name: "Argentina", bicameral: true, regionLabel: "Provincia", headOfGovernmentOffice: "presidente" },
  // { code: "BO", name: "Bolivia", bicameral: true, regionLabel: "Departamento", headOfGovernmentOffice: "presidente" },
  // { code: "CL", name: "Chile", bicameral: true, regionLabel: "Región", headOfGovernmentOffice: "presidente" },
  // { code: "CO", name: "Colombia", bicameral: true, regionLabel: "Departamento", headOfGovernmentOffice: "presidente" },
  // Sólo AR y UY tienen datos cargados; el resto se borró de representatives.json (2026-09-30, ver DATA_TODO.md).
  // { code: "CR", name: "Costa Rica", bicameral: false, regionLabel: "Provincia", headOfGovernmentOffice: "presidente" },
  // { code: "EC", name: "Ecuador", bicameral: false, regionLabel: "Provincia", headOfGovernmentOffice: "presidente" },
  // { code: "SV", name: "El Salvador", bicameral: false, regionLabel: "Departamento", headOfGovernmentOffice: "presidente" },
  // { code: "ES", name: "España", bicameral: true, regionLabel: "Comunidad Autónoma", headOfGovernmentOffice: "presidente_gobierno" },
  // { code: "GT", name: "Guatemala", bicameral: false, regionLabel: "Departamento", headOfGovernmentOffice: "presidente" },
  // { code: "HN", name: "Honduras", bicameral: false, regionLabel: "Departamento", headOfGovernmentOffice: "presidente" },
  // { code: "MX", name: "México", bicameral: true, regionLabel: "Estado", headOfGovernmentOffice: "presidente" },
  // { code: "NI", name: "Nicaragua", bicameral: false, regionLabel: "Departamento", headOfGovernmentOffice: "presidente" },
  // { code: "PA", name: "Panamá", bicameral: false, regionLabel: "Provincia", headOfGovernmentOffice: "presidente" },
  // { code: "PY", name: "Paraguay", bicameral: true, regionLabel: "Departamento", headOfGovernmentOffice: "presidente" },
  // { code: "DO", name: "República Dominicana", bicameral: true, regionLabel: "Provincia", headOfGovernmentOffice: "presidente" },
  { code: "UY", name: "Uruguay", bicameral: true, regionLabel: "Departamento", headOfGovernmentOffice: "presidente" },
];

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code);

export function getCountry(code: string | null | undefined): CountryConfig | undefined {
  if (!code) return undefined;
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

export const OFFICE_LABELS: Record<string, string> = {
  presidente: "Presidente/a",
  vicepresidente: "Vicepresidente/a",
  gobernador: "Gobernador/a",
  presidente_gobierno: "Presidente/a del Gobierno",
  vicegobernador: "Vicegobernador/a",
  senador_nacional: "Senador/a nacional",
  diputado_nacional: "Diputado/a nacional",
};
