/**
 * Valida data/representatives.json contra las reglas del PROJECT_SPEC.
 * Uso: node scripts/validate-representatives.mjs   (o: npm run check:data)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "..", "data", "representatives.json");

const VALID_OFFICES = new Set([
  "presidente",
  "vicepresidente",
  "gobernador",
  "presidente_gobierno",
  "vicegobernador",
  "senador_nacional",
  "diputado_nacional",
]);

const INCLUDED = new Set([
  "AR", "BO", "BR", "CL", "CO", "CR", "EC", "SV", "ES",
  "GT", "HN", "MX", "NI", "PA", "PY", "DO", "UY",
]);

const UNICAMERAL = new Set(["CR", "EC", "SV", "GT", "HN", "NI", "PA"]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let data;
try {
  data = JSON.parse(readFileSync(dataPath, "utf8"));
} catch (err) {
  console.error(`No se pudo leer/parsear ${dataPath}:`, err.message);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error("El archivo debe ser un array.");
  process.exit(1);
}

const errors = [];
const warnings = [];
const seen = new Set();

data.forEach((r, i) => {
  const at = `#${i} (${r?.name ?? "sin nombre"})`;

  const channel = r.channel ?? "email";
  if (!INCLUDED.has(r.country)) errors.push(`${at}: country "${r.country}" no está en la lista de fase 1`);
  if (!VALID_OFFICES.has(r.office)) errors.push(`${at}: office "${r.office}" inválido`);
  if (typeof r.name !== "string" || !r.name.trim()) errors.push(`${at}: name vacío`);
  if (channel !== "email" && channel !== "form") errors.push(`${at}: channel "${r.channel}" inválido (email | form)`);
  if (channel === "form") {
    if (r.email !== "") warnings.push(`${at}: channel "form" pero email no está vacío ("${r.email}")`);
    if (typeof r.formUrl !== "string" || !/^https?:\/\//.test(r.formUrl)) errors.push(`${at}: channel "form" requiere formUrl (URL http/https)`);
  } else {
    if (typeof r.email !== "string" || !EMAIL_RE.test(r.email)) errors.push(`${at}: email inválido ("${r.email}")`);
  }
  if (r.region !== null && (typeof r.region !== "string" || !r.region.trim())) errors.push(`${at}: region debe ser string o null`);
  if (typeof r.verified !== "boolean") errors.push(`${at}: falta el flag booleano "verified"`);
  if (r.gender !== undefined && r.gender !== "f" && r.gender !== "m") errors.push(`${at}: gender "${r.gender}" inválido (f | m)`);
  if (r.institutional !== undefined && r.institutional !== true) errors.push(`${at}: institutional debe ser true u omitirse`);
  if (r.addressee !== undefined && (!r.institutional || typeof r.addressee !== "string" || !r.addressee.trim())) errors.push(`${at}: addressee sólo va en casillas institucionales, como string no vacío`);
  if (r.institutional && !r.addressee && r.gender) warnings.push(`${at}: casilla institucional sin addressee con gender (se ignora)`);
  if ((!r.institutional || r.addressee) && !r.gender) warnings.push(`${at}: sin gender → saludo neutro "Estimado/a"`);

  if (r.office === "senador_nacional" && UNICAMERAL.has(r.country)) {
    errors.push(`${at}: ${r.country} es unicameral, no tiene senador_nacional`);
  }
  if (r.office === "presidente_gobierno" && r.country !== "ES") {
    warnings.push(`${at}: "presidente_gobierno" se usa sólo para España`);
  }

  const key = `${r.country}|${r.region}|${r.office}|${r.email || r.formUrl || r.name}`;
  if (seen.has(key)) warnings.push(`${at}: entrada duplicada (${key})`);
  seen.add(key);

  if (r.verified === true && !r.source) warnings.push(`${at}: verified:true sin "source"`);
  if (r.email && /example\./.test(r.email)) warnings.push(`${at}: email de ejemplo, no real`);
});

const verified = data.filter((r) => r.verified === true).length;
console.log(`\n${data.length} representantes · ${verified} verificados · ${data.length - verified} sin verificar`);

for (const w of warnings) console.log(`  ⚠ ${w}`);
for (const e of errors) console.log(`  ✗ ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} error(es). Corregí antes de commitear.\n`);
  process.exit(1);
}
console.log(`\nOK${warnings.length ? ` (con ${warnings.length} advertencia/s)` : ""}.\n`);
