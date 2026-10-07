"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CountryConfig } from "@/lib/types";
import { COUNTRY_COLORS, OTHER_COLOR, fetchLiveStats, withBaseline } from "@/lib/mail-stats";

const fmt = (n: number) => n.toLocaleString("es-AR");

/**
 * "N personas ya contactaron a sus representantes" y una barra a todo el
 * ancho, con un tramo por país (mismos colores que los donuts de la home).
 * Arranca con la base de antes del conteo automático, atenuada, y se
 * actualiza con los totales en vivo — mismos datos que la home.
 */
export default function PeopleBar({ countries }: { countries: CountryConfig[] }) {
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

  if (total === 0) return null;

  return (
    <Link
      href="/"
      className={`mt-5 block transition-opacity ${settled ? "" : "opacity-60"}`}
      aria-label={`${fmt(total)} personas ya contactaron a sus representantes: ${segments
        .map((s) => `${s.name} ${fmt(s.count)}`)
        .join(", ")}. Ver la participación.`}
    >
      <p className="text-sm text-ink/70">
        <span className="text-base font-bold text-ink">{fmt(total)} personas</span> ya
        contactaron a sus representantes
      </p>
      <div className="mt-2 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        {segments.map((s) => (
          <div key={s.code} style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }} />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60" aria-hidden="true">
        {segments.map((s) => (
          <span key={s.code} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name} {fmt(s.count)}
          </span>
        ))}
      </div>
    </Link>
  );
}
