"use client";

import { useEffect, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { fetchLiveStats, withBaseline, type CountryCount } from "@/lib/mail-stats";

// Paleta categórica (2 slots) validada con scripts/validate_palette.js del
// skill de dataviz contra superficie blanca: CVD ΔE 22.5, normal-vision
// ΔE 23.3 — el warning de contraste de "AR" (2.65:1) se resuelve mostrando
// siempre el nombre y el valor en texto al lado, nunca color solo.
const COUNTRY_COLORS: Record<string, string> = {
  AR: "#12b48b",
  UY: "#2a78d6",
};
const OTHER_COLOR = "#898781";

const fmt = (n: number, digits = 0) =>
  n.toLocaleString("es-AR", { maximumFractionDigits: digits });

const total = (counts: CountryCount[]) => counts.reduce((sum, c) => sum + c.count, 0);

/**
 * Participación: personas y mails enviados, como dos números grandes con el
 * reparto por país en una barra fina debajo. Arranca con la base de antes del
 * conteo automático (sale en el HTML estático) atenuada, y se actualiza con
 * los totales en vivo del Worker; si el Worker no responde, queda la base.
 */
export default function ParticipationStats() {
  const [stats, setStats] = useState(() => withBaseline());
  const [settled, setSettled] = useState(false);

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

  const people = total(stats.people);
  const mails = total(stats.mails);

  return (
    <div
      className={`transition-opacity duration-300 ${settled ? "opacity-100" : "opacity-60"}`}
      aria-busy={!settled}
    >
      <div className="mt-5 grid gap-8 sm:grid-cols-2 sm:gap-6">
        <Stat
          value={people}
          caption={people === 1 ? "persona escribió" : "personas escribieron"}
          counts={stats.people}
        />
        <Stat
          value={mails}
          caption={mails === 1 ? "mail enviado a representantes" : "mails enviados a representantes"}
          counts={stats.mails}
        />
      </div>

      {people > 0 && (
        <p className="mt-6 text-center text-sm text-ink/70">
          ≈ <span className="font-semibold text-ink">{fmt(mails / people, 1)}</span> mails por
          persona
        </p>
      )}

      <p className="mt-2 text-center text-xs text-ink/40">Se actualiza cada 15 minutos.</p>
    </div>
  );
}

function Stat({
  value,
  caption,
  counts,
}: {
  value: number;
  caption: string;
  counts: CountryCount[];
}) {
  const sum = total(counts);
  const parts = counts
    .filter((c) => c.count > 0)
    .map((c) => ({
      ...c,
      name: COUNTRIES.find((country) => country.code === c.code)?.name ?? c.code,
      color: COUNTRY_COLORS[c.code] ?? OTHER_COLOR,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-w-0 text-center">
      <p className="text-5xl font-bold leading-none text-ink">{fmt(value)}</p>
      <p className="mt-2 text-sm text-ink/70">{caption}</p>

      {sum > 0 && (
        <>
          {/* Reparto por país: 2px de superficie entre segmentos, sin bordes. */}
          <div className="mx-auto mt-4 flex h-2.5 max-w-[16rem] gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
            {parts.map((p) => (
              <div
                key={p.code}
                title={`${p.name}: ${fmt(p.count)}`}
                className="h-full min-w-[4px]"
                style={{ flexGrow: p.count, backgroundColor: p.color }}
              />
            ))}
          </div>
          <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-ink/70">
            {parts.map((p) => (
              <li key={p.code} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                  aria-hidden="true"
                />
                {p.name} <span className="font-semibold text-ink">{fmt(p.count)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
