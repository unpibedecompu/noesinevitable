"use client";

import { useEffect, useMemo, useState } from "react";
import type { CountryConfig } from "@/lib/types";
import { NATIONAL, fetchLiveStats, withBaseline, type Part } from "@/lib/mail-stats";
import DonutChart from "@/components/DonutChart";

// Países: paleta categórica (2 slots) validada con scripts/validate_palette.js
// del skill de dataviz contra superficie blanca (CVD ΔE 22.5, normal-vision
// ΔE 23.3). El nombre y el valor siempre van en texto al lado (tabla).
const COUNTRY_COLORS: Record<string, string> = {
  AR: "#12b48b",
  UY: "#2a78d6",
};

// Regiones: las 8 tonalidades de la paleta categórica del skill de dataviz,
// más una versión oscura y una clara de cada una, para darle un color propio
// a cada provincia/departamento (hasta 24). Pasadas las 8 primeras algunos
// colores se parecen: la tabla de abajo lleva siempre el nombre y el valor.
const BASE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];

function mix(hex: string, target: number, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [n >> 16, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (target - c) * amount));
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

const REGION_COLORS = [
  ...BASE,
  ...BASE.map((c) => mix(c, 0, 0.35)),
  ...BASE.map((c) => mix(c, 255, 0.45)),
];
const NATIONAL_COLOR = "#52514e";
const UNSPECIFIED_COLOR = "#a3a29c";
const OTHER_COLOR = "#898781";

const regionName = (region: string | null) =>
  region === NATIONAL ? "Cargos nacionales" : region ?? "Sin especificar";

interface Row {
  key: string;
  name: string;
  color: string;
  people: number;
  mails: number;
}

/**
 * Participación: dos donuts (personas y mails enviados) con una leyenda
 * debajo. Elegir un país en los filtros de arriba muestra sus provincias/
 * departamentos, cada uno con su color. Arranca con la base de antes del
 * conteo automático, atenuada, y se actualiza con los totales en vivo.
 */
export default function ParticipationDonuts({
  countries,
  regionsByCountry,
}: {
  countries: CountryConfig[];
  /** Regiones de cada país, en orden fijo: le dan a cada una un color estable. */
  regionsByCountry: Record<string, string[]>;
}) {
  const [stats, setStats] = useState(() => withBaseline());
  const [settled, setSettled] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveStats().then((live) => {
      if (cancelled) return;
      if (live) setStats(withBaseline(live));
      setSettled(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const country = countries.find((c) => c.code === selected) ?? null;

  const rows = useMemo<Row[]>(() => {
    const byKey = new Map<string, Row>();
    const add = (list: Part[], field: "people" | "mails") => {
      for (const p of list) {
        if (country && p.code !== country.code) continue;
        const key = country ? (p.region ?? "") : p.code;
        const row = byKey.get(key) ?? {
          key,
          name: country
            ? regionName(p.region)
            : (countries.find((c) => c.code === p.code)?.name ?? p.code),
          color: country
            ? regionColor(p.region, regionsByCountry[country.code] ?? [])
            : (COUNTRY_COLORS[p.code] ?? OTHER_COLOR),
          people: 0,
          mails: 0,
        };
        row[field] += p.count;
        byKey.set(key, row);
      }
    };
    add(stats.people, "people");
    add(stats.mails, "mails");
    return [...byKey.values()].sort(
      (a, b) => b.people - a.people || b.mails - a.mails || a.name.localeCompare(b.name, "es"),
    );
  }, [stats, country, countries, regionsByCountry]);

  const totalPeople = rows.reduce((s, r) => s + r.people, 0);
  const totalMails = rows.reduce((s, r) => s + r.mails, 0);
  const slices = (field: "people" | "mails") =>
    rows
      .filter((r) => r[field] > 0)
      .sort((a, b) => b[field] - a[field])
      .map((r) => ({ code: r.key, name: r.name, count: r[field], color: r.color }));

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm transition ${
      active ? "bg-accent font-semibold text-ink" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
    }`;

  return (
    <div
      className={`transition-opacity duration-300 ${settled ? "opacity-100" : "opacity-60"}`}
      aria-busy={!settled}
    >
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por país">
        <button type="button" className={chip(!country)} aria-pressed={!country} onClick={() => setSelected(null)}>
          Todos
        </button>
        {countries.map((c) => (
          <button
            key={c.code}
            type="button"
            className={chip(selected === c.code)}
            aria-pressed={selected === c.code}
            onClick={() => setSelected(c.code)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 sm:grid-cols-2 sm:gap-4">
        <figure className="min-w-0">
          <figcaption className="mb-2 text-center text-sm font-semibold text-ink/70">Personas</figcaption>
          <DonutChart slices={slices("people")} total={totalPeople} unit={["persona", "personas"]} />
        </figure>
        <figure className="min-w-0">
          <figcaption className="mb-2 text-center text-sm font-semibold text-ink/70">
            Mails enviados
          </figcaption>
          <DonutChart slices={slices("mails")} total={totalMails} unit={["mail enviado", "mails enviados"]} />
        </figure>
      </div>

      {/* Leyenda: el color solo no alcanza para saber qué es cada porción. */}
      <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-ink/70">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.color }} aria-hidden="true" />
            {r.name}
          </li>
        ))}
      </ul>

      {country && (
        <p className="mt-4 text-center text-xs text-ink/50">
          Las personas se cuentan por la {country.regionLabel.toLowerCase()} que eligieron; los
          mails, por la del representante que los recibió.
        </p>
      )}

      <p className="mt-2 text-center text-xs text-ink/40">Se actualiza cada 15 minutos.</p>
    </div>
  );
}

/** Color fijo por región: su posición en la lista ordenada del país. */
function regionColor(region: string | null, regions: string[]): string {
  if (region === NATIONAL) return NATIONAL_COLOR;
  const i = region ? regions.indexOf(region) : -1;
  return i < 0 ? UNSPECIFIED_COLOR : REGION_COLORS[i % REGION_COLORS.length];
}
