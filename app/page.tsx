import { COUNTRIES, COUNTRY_CODES } from "@/lib/countries";
import { getRepresentatives } from "@/lib/representatives";
import ContactForm from "@/components/ContactForm";
import MeanwhileTeaser from "@/components/MeanwhileTeaser";
import siteCopy from "@/data/site-copy.json";

// Página 100% estática. La detección de país pasó al cliente
// (components/ContactForm → /cdn-cgi/trace, gratis en Cloudflare).
export default function Page() {
  const representatives = getRepresentatives().filter((r) =>
    COUNTRY_CODES.includes(r.country),
  );

  const unverified = representatives.filter((r) => !r.verified).length;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:pt-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">
          {siteCopy.pageTitle}
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">
          {siteCopy.callToAction}
        </h1>
        <p className="mt-3 text-base text-ink/70">{siteCopy.explanation}</p>
        <a
          href={siteCopy.explanationSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-sm font-medium text-accent-dark underline underline-offset-2"
        >
          {siteCopy.explanationSourceLabel}
        </a>
        <MeanwhileTeaser />
      </header>

      {unverified > 0 && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Sólo en desarrollo:</strong> se están mostrando {unverified}{" "}
          contacto{unverified === 1 ? "" : "s"} sin verificar (ver{" "}
          <code>DATA_TODO.md</code>). En producción sólo aparecen los chequeados
          contra la fuente oficial.
        </div>
      )}

      <ContactForm countries={COUNTRIES} representatives={representatives} />

      <footer className="mt-12 border-t border-ink/10 pt-6 text-xs text-ink/50">
        <p>
          El mail se abre en tu propio cliente de correo (Gmail, Outlook,
          la app de tu celular). No mandamos nada por vos y no guardamos tus
          datos. Sólo contamos cuántas personas llegan a la pantalla de envío.
        </p>
      </footer>
    </main>
  );
}
