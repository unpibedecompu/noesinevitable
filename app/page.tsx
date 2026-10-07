import Link from "next/link";
import siteCopy from "@/data/site-copy.json";
import ParticipationDonuts from "@/components/ParticipationDonuts";
import { COUNTRIES } from "@/lib/countries";
import { getRegions } from "@/lib/representatives";
import CoursesSection from "@/components/CoursesSection";
import FollowSection from "@/components/FollowSection";
import Reveal from "@/components/Reveal";

export default function HomePage() {
  const regionsByCountry = Object.fromEntries(COUNTRIES.map((c) => [c.code, getRegions(c.code)]));

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:pt-12">
      <header className="mb-8">
        <p className="text-lg font-semibold uppercase tracking-wide text-accent-dark sm:text-xl">
          {siteCopy.pageTitle}
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
          Sobre esta iniciativa
        </h1>
        <p className="mt-3 text-base text-ink/70">{siteCopy.explanation}</p>
        <p className="mt-3 text-base text-ink/70">
          {siteCopy.pageTitle} te ayuda a escribirle a tus representantes
          políticos para expresarles tu preocupación por el desarrollo
          acelerado de la IA de frontera.
        </p>
        <Link
          href="/contacta-representantes/"
          className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-accent-dark"
        >
          Escribile a tus representantes →
        </Link>
      </header>

      <Reveal>
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            Participación
          </h2>

          <ParticipationDonuts countries={COUNTRIES} regionsByCountry={regionsByCountry} />
        </section>
      </Reveal>

      <Reveal className="mt-8">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
          <CoursesSection location="home" />
        </div>
      </Reveal>

      <Reveal className="mt-8">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-ink/5 sm:p-6">
          <FollowSection location="home" />
        </div>
      </Reveal>

      <footer className="mt-12 border-t border-ink/10 pt-6 text-xs text-ink/50">
        <Link href="/contacta-representantes/" className="font-semibold text-accent-dark underline">
          Ir al formulario →
        </Link>
      </footer>
    </main>
  );
}
