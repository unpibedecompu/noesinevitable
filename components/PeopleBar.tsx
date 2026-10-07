"use client";

import { useEffect, useState } from "react";
import type { CountryConfig } from "@/lib/types";
import { COUNTRY_COLORS, OTHER_COLOR, fetchLiveStats, withBaseline } from "@/lib/mail-stats";
import { GROW_MS, useCountUp, useGrown } from "@/lib/animation";

const fmt = (n: number) => n.toLocaleString("es-AR");

/**
 * "N personas ya contactaron a sus representantes" y una barra a todo el
 * ancho, con un tramo por país (mismos colores que los donuts de la home) y
 * debajo cantidad y nombre de cada uno. Sin link: es para ver, no
 * para sacar a nadie del formulario. Arranca con la base de antes del conteo
 * automático, atenuada, y se actualiza con los totales en vivo — mismos datos
 * que la home. La barra crece y el número cuenta al cargar.
 */
export default function PeopleBar({
  countries,
  className = "",
}: {
  countries: CountryConfig[];
  className?: string;
}) {
  const [stats, setStats] = useState(() => withBaseline());
  const [settled, setSettled] = useState(false);
  const grown = useGrown();

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

  const byCountry = new Map<string, number>();
  for (const p of stats.people) byCountry.set(p.code, (byCountry.get(p.code) ?? 0) + p.count);
  const segments = [...byCountry]
    .filter(([, count]) => count > 0)
    .map(([code, count]) => ({
      code,
      count,
      name: countries.find((c) => c.code === code)?.name ?? code,
      color: COUNTRY_COLORS[code] ?? OTHER_COLOR,
    }))
    .sort((a, b) => b.count - a.count);
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const shown = useCountUp(total);

  if (total === 0) return null;

  return (
    <div
      className={`${className} transition-opacity duration-300 ${settled ? "" : "opacity-60"}`}
      role="img"
      aria-label={`${fmt(total)} personas ya contactaron a sus representantes: ${segments
        .map((s) => `${s.name} ${fmt(s.count)}`)
        .join(", ")}.`}
    >
      <p className="text-base text-ink/70" aria-hidden="true">
        <span className="mr-1 text-3xl font-bold tabular-nums text-accent-dark">{fmt(shown)}</span>
        personas ya contactaron a sus representantes
      </p>
      <div className="mt-2 flex h-8 w-full gap-0.5 overflow-hidden rounded-lg bg-ink/5" aria-hidden="true">
        {segments.map((s) => (
          <div
            key={s.code}
            className="h-full transition-[width] ease-out motion-reduce:transition-none"
            style={{
              width: grown ? `${(s.count / total) * 100}%` : "0%",
              backgroundColor: s.color,
              transitionDuration: `${GROW_MS}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/70" aria-hidden="true">
        {segments.map((s) => (
          <span key={s.code} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="font-bold tabular-nums text-ink">{fmt(s.count)}</span>
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
