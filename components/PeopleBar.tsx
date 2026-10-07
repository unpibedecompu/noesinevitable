"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CountryConfig } from "@/lib/types";
import { COUNTRY_COLORS, OTHER_COLOR, fetchLiveStats, withBaseline } from "@/lib/mail-stats";

const fmt = (n: number) => n.toLocaleString("es-AR");

/** Texto oscuro o blanco, el que contraste más con el color del tramo. */
function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (lum + 0.05) / 0.05 > 1.05 / (lum + 0.05) ? "#14181f" : "#ffffff";
}

/**
 * "N personas ya contactaron a sus representantes" y una barra a todo el
 * ancho, con un tramo por país con su nombre adentro (mismos colores que
 * los donuts de la home).
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
      {/* Cada tramo crece según su parte, pero nunca más angosto que su nombre:
          con muy pocas personas un país chico ocupa un poco más de lo que le toca. */}
      <div className="mt-2 flex h-8 w-full gap-0.5 overflow-hidden rounded-lg" aria-hidden="true">
        {segments.map((s) => (
          <div
            key={s.code}
            className="flex min-w-fit items-center justify-center whitespace-nowrap px-2 text-xs font-semibold"
            style={{ flex: `${s.count} 1 0%`, backgroundColor: s.color, color: textOn(s.color) }}
          >
            {s.name} {fmt(s.count)}
          </div>
        ))}
      </div>
    </Link>
  );
}
