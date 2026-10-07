/**
 * Compara los senadores AR de data/representatives.json con el listado oficial
 * de datos abiertos del Senado (email y provincia de cada senador en funciones).
 * Uso: node scripts/check-senadores-ar.mjs   (o: npm run check:senadores-ar)
 * Sale con código 1 si algún email no está en el listado oficial, si cambia la
 * provincia o si falta algún senador en funciones. Correrlo cuando cambia la
 * composición del Senado (10 de diciembre de los años de elección).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OFFICIAL_URL =
  "https://www.senado.gob.ar/micrositios/DatosAbiertos/ExportarListadoSenadores/json";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "..", "data", "representatives.json");

const norm = (s) =>
  (s ?? "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// El listado oficial usa el nombre completo de la provincia:
// "Tierra del Fuego, Antártida e Islas del Atlántico Sur" = "Tierra del Fuego".
const sameProvince = (official, ours) => norm(official).startsWith(norm(ours));

const res = await fetch(OFFICIAL_URL);
if (!res.ok) {
  console.error(`No se pudo bajar el listado oficial (${res.status}): ${OFFICIAL_URL}`);
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
const official = (await res.json()).table.rows.filter(
  (r) => r.D_REAL <= today && r.C_LEGAL >= today && r.EMAIL,
);
const byEmail = new Map(official.map((r) => [norm(r.EMAIL), r]));

const ours = JSON.parse(readFileSync(dataPath, "utf8")).filter(
  // Atención Ciudadana es una casilla institucional, no un senador.
  (r) => r.country === "AR" && r.office === "senador_nacional" && !r.institutional,
);

const problems = [];
for (const r of ours) {
  const o = byEmail.get(norm(r.email));
  if (!o) problems.push(`✗ ${r.name} (${r.region}): ${r.email} no está en el listado oficial`);
  else if (!sameProvince(o.PROVINCIA, r.region))
    problems.push(`✗ ${r.name}: provincia ${r.region} acá, ${o.PROVINCIA} en el listado oficial`);
}
const ourEmails = new Set(ours.map((r) => norm(r.email)));
for (const o of official) {
  if (!ourEmails.has(norm(o.EMAIL)))
    problems.push(`+ falta ${o.NOMBRE} ${o.APELLIDO} (${o.PROVINCIA}): ${o.EMAIL}`);
}

console.log(`Listado oficial: ${official.length} senadores en funciones. Nuestros: ${ours.length}.`);
if (problems.length) {
  console.log(problems.join("\n"));
  process.exit(1);
}
console.log("OK: todos los emails y provincias coinciden con el listado oficial.");
