export type Office =
  | "presidente"
  | "vicepresidente"
  | "gobernador"
  | "presidente_gobierno"
  | "vicegobernador"
  | "senador_nacional"
  | "diputado_nacional";

/**
 * Canal de contacto:
 * - `email` (default): tiene dirección de correo → se abre con `mailto:`.
 * - `form`: sólo hay formulario web oficial → el usuario copia el mensaje y
 *   abre `formUrl` en una pestaña nueva (ver PROJECT_SPEC "flujo del form").
 */
export type Channel = "email" | "form";

/** Género del representante, para el saludo ("Estimada Diputada…"). */
export type Gender = "f" | "m";

export interface Representative {
  /** ISO 3166-1 alpha-2, mayúsculas. Ej: "AR" */
  country: string;
  /** Provincia / estado / comunidad autónoma. `null` para cargos de alcance nacional (presidente, etc). */
  region: string | null;
  office: Office;
  name: string;
  /**
   * Casilla institucional (Presidencia, Atención Ciudadana…), no una persona:
   * el saludo es "De mi mayor consideración:" en vez de "Estimado/a {nombre}".
   */
  institutional?: boolean;
  /** Género, para el saludo. Si falta en una persona, se usa "Estimado/a Diputado/a". */
  gender?: Gender;
  /** Canal de contacto. Si falta, se asume "email". */
  channel?: Channel;
  /**
   * Email de contacto. Puede ser institucional genérico si no hay email personal
   * (ver PROJECT_SPEC). Vacío ("") sólo si `channel` es "form".
   */
  email: string;
  /** URL del formulario oficial. Obligatorio si `channel` es "form". */
  formUrl?: string;
  /** Partido, opcional, sólo para mostrar en la UI. */
  party?: string;
  /**
   * `false` mientras el dato no fue chequeado a mano contra la fuente oficial.
   * Ningún representante con `verified: false` debería mostrarse en producción.
   */
  verified: boolean;
  /** URL de la fuente oficial de donde salió el dato. */
  source?: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  /** ¿El país tiene cámara alta (senadores nacionales)? */
  bicameral: boolean;
  /** Etiqueta local para la subdivisión (provincia, estado, comunidad autónoma, departamento…). */
  regionLabel: string;
  /** Cargo del jefe de gobierno: "presidente" en casi toda la región, "presidente_gobierno" en España. */
  headOfGovernmentOffice: Extract<Office, "presidente" | "presidente_gobierno">;
}
