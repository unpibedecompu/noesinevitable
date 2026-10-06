"use client";

import { useEffect, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { fetchLiveCounts, withBaseline } from "@/lib/mail-stats";
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
 * Mails enviados por país: arranca con la base de antes del conteo por CC
 * (sale en el HTML estático) y se actualiza con los totales en vivo del
 * Worker. Si el Worker no responde, queda la base.
 */
export default function MailStatsChart() {
  const [counts, setCounts] = useState(() => withBaseline());

  useEffect(() => {
    let cancelled = false;
    fetchLiveCounts().then((live) => {
      if (live && !cancelled) setCounts(withBaseline(live));
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    <>
      <div className="mt-4">
        <DonutChart slices={slices} total={total} />
      </div>

      <ul className="mx-auto mt-4 flex max-w-xs flex-col gap-1.5">
        {slices.map((s) => (
          <li key={s.code} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="text-ink/80">{s.name}</span>
            </span>
            <span className="font-semibold text-ink">
              {fmt(s.count)} {s.count === 1 ? "mail" : "mails"}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
