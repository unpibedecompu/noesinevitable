"use client";

import { useEffect, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { fetchLiveStats, withBaseline, type CountryCount } from "@/lib/mail-stats";
import DonutChart from "@/components/DonutChart";

// Paleta categórica (2 slots) validada con scripts/validate_palette.js del
// skill de dataviz contra superficie blanca: CVD ΔE 22.5, normal-vision
// ΔE 23.3 — el warning de contraste de "AR" (2.65:1) se resuelve mostrando
// siempre la leyenda con el valor en texto, nunca color solo.
const SLICE_COLORS: Record<string, string> = {
  AR: "#12b48b",
  UY: "#2a78d6",
};

const fmt = (n: number) => n.toLocaleString("es-AR");

/**
 * Personas y mails enviados por país, en dos donuts. Arranca con la base de
 * antes del conteo automático (sale en el HTML estático) y se actualiza con
 * los totales en vivo del Worker. Si el Worker no responde, queda la base.
 */
export default function MailStatsChart() {
  const [stats, setStats] = useState(() => withBaseline());

  useEffect(() => {
    let cancelled = false;
    fetchLiveStats().then((live) => {
      if (live && !cancelled) setStats(withBaseline(live));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-4 grid gap-8 sm:grid-cols-2 sm:gap-4">
      <Donut
        title="Personas"
        counts={stats.people}
        center={["persona", "personas"]}
        legend={["persona", "personas"]}
      />
      <Donut
        title="Mails enviados"
        counts={stats.mails}
        center={["mail enviado", "mails enviados"]}
        legend={["mail", "mails"]}
      />
    </div>
  );
}

function Donut({
  title,
  counts,
  center,
  legend,
}: {
  title: string;
  counts: CountryCount[];
  center: [string, string];
  legend: [string, string];
}) {
  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const slices = counts
    .map((c) => ({
      code: c.code,
      name: COUNTRIES.find((country) => country.code === c.code)?.name ?? c.code,
      count: c.count,
      color: SLICE_COLORS[c.code] ?? "#898781",
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-center text-sm font-semibold text-ink/70">{title}</figcaption>
      <DonutChart slices={slices} total={total} unit={center} />
      <ul className="mx-auto mt-4 flex max-w-[14rem] flex-col gap-1.5">
        {slices.map((s) => (
          <li key={s.code} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="text-ink/80">{s.name}</span>
            </span>
            <span className="font-semibold text-ink">
              {fmt(s.count)} {s.count === 1 ? legend[0] : legend[1]}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
