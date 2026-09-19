import Link from "next/link";
import siteCopy from "@/data/site-copy.json";
import mailStats from "@/data/mail-sent-stats.json";
import { COUNTRIES } from "@/lib/countries";
import DonutChart from "@/components/DonutChart";
import CoursesSection from "@/components/CoursesSection";
import FollowSection from "@/components/FollowSection";

// Paleta categórica (2 slots) validada con scripts/validate_palette.js del
// skill de dataviz contra superficie blanca: CVD ΔE 22.5, normal-vision
// ΔE 23.3 — el warning de contraste de "AR" (2.65:1) se resuelve mostrando
// siempre la leyenda con el valor en texto, nunca color solo.
const SLICE_COLORS: Record<string, string> = {
  AR: "#12b48b",
  UY: "#2a78d6",
};

export default function HomePage() {
  const total = mailStats.byCountry.reduce((sum, c) => sum + c.count, 0);
  const slices = mailStats.byCountry
    .map((c) => ({
      code: c.code,
      name: COUNTRIES.find((country) => country.code === c.code)?.name ?? c.code,
      count: c.count,
      color: SLICE_COLORS[c.code] ?? "#898781",
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:pt-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">
          {siteCopy.pageTitle}
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">
          Sobre este proyecto
        </h1>
        <p className="mt-3 text-base text-ink/70">{siteCopy.explanation}</p>
        <p className="mt-3 text-base text-ink/70">
          {siteCopy.pageTitle} te ayuda a escribirle en menos de un minuto a
          tus representantes políticos, pidiéndoles que traten los riesgos
          del desarrollo acelerado de la inteligencia artificial como una
          prioridad. Elegís tu país, generamos el mensaje y lo abrís directo
          en tu cliente de mail — no mandamos nada por vos ni guardamos tus
          datos.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-accent-dark"
        >
          Escribile a tu representante →
        </Link>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Gente que ya escribió, por país
        </h2>

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
                {s.count} {s.count === 1 ? "persona" : "personas"}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-ink/40">
          Actualizado a mano el {mailStats.updatedAt} desde el dashboard de
          analytics (no hay backend — Fase 1 es mailto: sin servidor).
        </p>
      </section>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
        <CoursesSection location="home" />
      </div>

      <div className="mt-8 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-ink/5 sm:p-6">
        <FollowSection location="home" />
      </div>

      <footer className="mt-12 border-t border-ink/10 pt-6 text-xs text-ink/50">
        <Link href="/" className="font-semibold text-accent-dark underline">
          ← Volver al formulario
        </Link>
      </footer>
    </main>
  );
}
