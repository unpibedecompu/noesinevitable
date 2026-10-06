import Link from "next/link";
import siteCopy from "@/data/site-copy.json";
import ParticipationDonuts from "@/components/ParticipationDonuts";
import { COUNTRIES } from "@/lib/countries";
import { getRegions } from "@/lib/representatives";
import CoursesSection from "@/components/CoursesSection";
import FollowSection from "@/components/FollowSection";

export default function HomePage() {
  const regionsByCountry = Object.fromEntries(COUNTRIES.map((c) => [c.code, getRegions(c.code)]));

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:pt-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">
          {siteCopy.pageTitle}
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">
          Sobre esta iniciativa
        </h1>
        <p className="mt-3 text-base text-ink/70">{siteCopy.explanation}</p>
        <p className="mt-3 text-base text-ink/70">
          {siteCopy.pageTitle} te ayuda a escribirle a tus representantes
          políticos, pidiéndoles que traten los riesgos del desarrollo
          acelerado de la inteligencia artificial como una prioridad.
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
          Participación
        </h2>

        <ParticipationDonuts countries={COUNTRIES} regionsByCountry={regionsByCountry} />
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
