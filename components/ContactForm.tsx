"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CountryConfig, Representative } from "@/lib/types";
import { OFFICE_LABELS, COUNTRY_CODES } from "@/lib/countries";
import { SUBJECT, buildBody, fullBody } from "@/lib/message-template";
import {
  buildGmailCompose,
  buildOutlookCompose,
  buildGmailAppCompose,
  buildGmailAppComposeAndroid,
  buildOutlookAppCompose,
  buildShareX,
  buildShareFacebook,
  buildShareWhatsApp,
} from "@/lib/mailto";
import { trackFunnel } from "@/lib/analytics";
import { SHARE_URL, SHARE_TEXT } from "@/lib/share";
import CoursesSection from "@/components/CoursesSection";
import FollowSection from "@/components/FollowSection";

const OFFICE_ORDER: Record<string, number> = {
  presidente: 0,
  presidente_gobierno: 0,
  vicepresidente: 1,
  gobernador: 2,
  vicegobernador: 3,
  senador_nacional: 4,
  diputado_nacional: 5,
};

const REPO_URL =
  "https://github.com/fourofclubs001/unpibedecompu/tree/master/strategy/contacta_representante_latam";

const CHIP_CLS =
  "rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-accent-dark";

/** Clave estable para un representante (el email puede ser "" en canal form). */
const repKey = (r: Representative) =>
  `${r.office}|${r.name}|${r.email || r.formUrl || ""}`;

const repSubtitle = (r: Representative) =>
  [
    OFFICE_LABELS[r.office],
    r.region ?? null,
    r.party && r.party !== "—" ? r.party : null,
  ]
    .filter(Boolean)
    .join(" · ");

type Step = 1 | 2 | 3 | 4;

interface Props {
  countries: CountryConfig[];
  representatives: Representative[];
}

export default function ContactForm({ countries, representatives }: Props) {
  const [step, setStep] = useState<Step>(1);

  useEffect(() => {
    trackFunnel("step_viewed", { step });
  }, [step]);

  // Al cambiar de paso, volver arriba (el paso 2 es largo y el navegador
  // ancla el scroll al botón que se apretó).
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    toTop();
    // La lista larga sigue reflowando unos frames; reintentamos.
    const r1 = requestAnimationFrame(toTop);
    const t1 = window.setTimeout(toTop, 60);
    return () => {
      cancelAnimationFrame(r1);
      window.clearTimeout(t1);
    };
  }, [step]);

  const [countryCode, setCountryCode] = useState<string | null>(
    countries.length === 1 ? countries[0].code : null,
  );
  const [region, setRegion] = useState<string | null>(null);
  const [name, setName] = useState("");

  const [subject, setSubject] = useState(SUBJECT);
  const [body, setBody] = useState("");
  const [bodyEdited, setBodyEdited] = useState(false);
  const [subjectEdited, setSubjectEdited] = useState(false);

  const [lastSent, setLastSent] = useState<Representative | null>(null);
  const [confirmedSent, setConfirmedSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  // En mobile los botones "Gmail"/"Outlook" abren la app nativa (deep link);
  // en desktop, el compositor web. Se detecta una sola vez en el cliente.
  useEffect(() => {
    const ua = navigator.userAgent;
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(ua));
    setIsAndroid(/Android/i.test(ua));
  }, []);

  const country = countries.find((c) => c.code === countryCode) ?? null;

  // Sugerencia de país por IP. `/cdn-cgi/trace` lo sirve Cloudflare gratis.
  useEffect(() => {
    let cancelled = false;
    fetch("/cdn-cgi/trace")
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => {
        if (cancelled) return;
        const loc = text.match(/^loc=([A-Z]{2})$/m)?.[1];
        if (loc && COUNTRY_CODES.includes(loc)) {
          setCountryCode((prev) => (prev === null ? loc : prev));
        }
      })
      .catch(() => {
        /* en local o fuera de Cloudflare no existe: el usuario elige a mano */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const regions = useMemo(() => {
    if (!countryCode) return [];
    const set = new Set<string>();
    for (const r of representatives) {
      if (r.country === countryCode && r.region) set.add(r.region);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [countryCode, representatives]);

  const matches = useMemo(() => {
    if (!countryCode) return [];
    return representatives
      .filter(
        (r) =>
          r.country === countryCode &&
          (r.region === null || r.region === region),
      )
      .sort(
        (a, b) =>
          (OFFICE_ORDER[a.office] ?? 9) - (OFFICE_ORDER[b.office] ?? 9) ||
          a.name.localeCompare(b.name, "es"),
      );
  }, [countryCode, region, representatives]);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!country || !name.trim() || matches.length === 0) return;
    setSubject(SUBJECT);
    if (!bodyEdited) setBody(buildBody({ userName: name.trim(), countryName: country.name }));
    setLastSent(null);
    setStep(2);
    trackFunnel("message_generated", {
      country: country.code,
      region: region ?? "nacional",
      matches: matches.length,
    });
  }

  function handleContactOpened(rep: Representative, via: "gmail" | "outlook" | "form") {
    setLastSent(rep);
    setConfirmedSent(false);
    trackFunnel("email_client_opened", {
      country: countryCode ?? "?",
      office: rep.office,
      channel: rep.channel ?? "email",
      provider: via,
    });
  }

  function handleConfirmSent() {
    if (!lastSent || confirmedSent) return;
    setConfirmedSent(true);
    trackFunnel("email_sent_confirmed", {
      office: lastSent.office,
      channel: lastSent.channel ?? "email",
    });
  }

  async function writeClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* no-op */
    }
  }

  function handleForm(rep: Representative) {
    if (!rep.formUrl) return;
    void writeClipboard(`${subject}\n\n${fullBody(rep.name, body)}`);
    window.open(rep.formUrl, "_blank", "noopener,noreferrer");
    handleContactOpened(rep, "form");
  }

  async function handleCopyFallback() {
    const rep = lastSent;
    if (!rep) return;
    trackFunnel("email_didnt_open_clicked", { office: rep.office });
    const msg = fullBody(rep.name, body);
    const text =
      rep.channel === "form"
        ? `${subject}\n\n${msg}`
        : `Para: ${rep.email}\nAsunto: ${subject}\n\n${msg}`;
    await writeClipboard(text);
  }

  function handleShare(network: "x" | "facebook" | "whatsapp") {
    const url =
      network === "x"
        ? buildShareX(SHARE_TEXT, SHARE_URL)
        : network === "facebook"
          ? buildShareFacebook(SHARE_URL)
          : buildShareWhatsApp(`${SHARE_TEXT} ${SHARE_URL}`);
    window.open(url, "_blank", "noopener,noreferrer");
    trackFunnel("shared", { network, location: "step4" });
  }

  /* ----------------------------- STEP 1 ----------------------------- */
  if (step === 1) {
    return (
      <form
        onSubmit={handleGenerate}
        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6"
      >
        <StepBadge step={1} />

        <label className="mb-2 block text-sm font-semibold">Tu país</label>
        <div className="flex flex-wrap gap-2">
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                setCountryCode(c.code);
                setRegion(null);
                trackFunnel("country_selected", { country: c.code });
              }}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                countryCode === c.code
                  ? "bg-accent font-semibold text-ink"
                  : "bg-ink/5 text-ink/70 hover:bg-ink/10"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {country && regions.length > 0 && (
          <div className="mt-5">
            <label htmlFor="region" className="mb-2 block text-sm font-semibold">
              Tu {country.regionLabel.toLowerCase()}
            </label>
            <select
              id="region"
              value={region ?? ""}
              onChange={(e) => {
                const value = e.target.value || null;
                setRegion(value);
                trackFunnel("region_selected", { region: value ?? "nacional" });
              }}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
            >
              <option value="">Sólo contactar a nivel nacional</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-5">
          <label htmlFor="name" className="mb-2 block text-sm font-semibold">
            Tu Nombre y Apellido <span className="text-ink/40">(para firmar el mail)</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellido"
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
          />
        </div>

        {country && matches.length === 0 && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Todavía no cargamos representantes para esta selección.
          </p>
        )}

        <button
          type="submit"
          disabled={!country || !name.trim() || matches.length === 0}
          className="mt-6 w-full rounded-full bg-accent px-4 py-3 font-semibold text-ink transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Generar mi mensaje
        </button>
      </form>
    );
  }

  /* ----------------------------- STEP 2 ----------------------------- */
  if (step === 2 && country && matches.length > 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              trackFunnel("step_back_clicked", { step: 2 });
              setStep(1);
            }}
            className="text-sm text-ink/50 hover:text-ink"
          >
            ← Volver
          </button>
          <button
            type="button"
            onClick={() => {
              trackFunnel("view_representatives_clicked", { location: "top" });
              setStep(3);
            }}
            className={CHIP_CLS}
          >
            Ver representantes →
          </button>
        </div>
        <StepBadge step={2} />

        <label htmlFor="subject" className="mb-1 block text-sm font-semibold">
          Asunto
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            if (!subjectEdited) {
              setSubjectEdited(true);
              trackFunnel("subject_edited");
            }
          }}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
        />

        <label htmlFor="body" className="mb-1 mt-4 block text-sm font-semibold">
          Mensaje <span className="text-ink/40">(editalo si querés)</span>
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (!bodyEdited) {
              trackFunnel("body_edited");
            }
            setBodyEdited(true);
          }}
          rows={12}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 leading-relaxed"
        />

        <button
          type="button"
          onClick={() => {
            trackFunnel("view_representatives_clicked", { location: "bottom" });
            setStep(3);
          }}
          className="mt-6 w-full rounded-full bg-accent px-4 py-3 font-semibold text-ink transition hover:bg-accent-dark"
        >
          Ver representantes →
        </button>
      </div>
    );
  }

  /* ----------------------------- STEP 3 ----------------------------- */
  if (step === 3 && country && matches.length > 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              trackFunnel("step_back_clicked", { step: 3 });
              setStep(2);
            }}
            className="text-sm text-ink/50 hover:text-ink"
          >
            ← Volver
          </button>
          <button
            type="button"
            onClick={() => {
              trackFunnel("finish_clicked", { location: "top" });
              setStep(4);
            }}
            className={CHIP_CLS}
          >
            Terminé →
          </button>
        </div>
        <StepBadge step={3} />

        <h3 className="mb-1 text-sm font-semibold">
          Enviá tu mensaje{matches.length > 1 ? " a quien quieras" : ""}
        </h3>

        <ul className="space-y-2">
          {matches.map((rep) => {
            const composeParams = {
              to: rep.email,
              subject,
              body: fullBody(rep.name, body),
            };
            const btnCls =
              "rounded-full bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent-dark transition hover:bg-accent/20";
            return (
              <li
                key={repKey(rep)}
                className="flex flex-col gap-2 rounded-lg border border-ink/15 px-3 py-2.5 transition sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">
                      {rep.name}
                    </span>
                  </div>
                  <span className="block truncate text-xs text-ink/60">
                    {repSubtitle(rep)}
                    {rep.channel === "form" ? " · por formulario web" : ""}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {rep.channel === "form" ? (
                    <button
                      type="button"
                      onClick={() => handleForm(rep)}
                      className={btnCls}
                    >
                      Abrir formulario
                    </button>
                  ) : (
                    <>
                      <a
                        href={
                          isMobile
                            ? isAndroid
                              ? buildGmailAppComposeAndroid(composeParams)
                              : buildGmailAppCompose(composeParams)
                            : buildGmailCompose(composeParams)
                        }
                        {...(!isMobile && {
                          target: "_blank",
                          rel: "noopener noreferrer",
                        })}
                        onClick={() => handleContactOpened(rep, "gmail")}
                        className={btnCls}
                      >
                        Enviar con Gmail
                      </a>
                      <a
                        href={
                          isMobile
                            ? buildOutlookAppCompose(composeParams)
                            : buildOutlookCompose(composeParams)
                        }
                        {...(!isMobile && {
                          target: "_blank",
                          rel: "noopener noreferrer",
                        })}
                        onClick={() => handleContactOpened(rep, "outlook")}
                        className={btnCls}
                      >
                        Enviar con Outlook
                      </a>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {!lastSent?.verified && lastSent && (
          <p className="mt-2 text-xs text-amber-700">
            ⚠ El último contacto no está verificado contra la fuente oficial.
          </p>
        )}

        {lastSent && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-ink/5 p-3 text-sm text-ink/70">
            <button
              type="button"
              onClick={handleConfirmSent}
              disabled={confirmedSent}
              className="font-semibold text-accent-dark underline disabled:text-ink/40 disabled:no-underline"
            >
              {confirmedSent ? "✓ Confirmado, gracias" : "Ya lo mandé"}
            </button>
            <span className="text-ink/30">·</span>
            <span>
              ¿No se abrió?{" "}
              <button
                type="button"
                onClick={handleCopyFallback}
                className="font-semibold text-accent-dark underline"
              >
                {copied ? "¡Copiado!" : "Copiá el mensaje"}
              </button>{" "}
              y pegalo en un mail nuevo
              {lastSent?.channel !== "form" && lastSent
                ? ` a ${lastSent.email}`
                : ""}
              .
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            trackFunnel("finish_clicked", { location: "bottom" });
            setStep(4);
          }}
          className="mt-6 w-full rounded-full bg-accent px-4 py-3 font-semibold text-ink transition hover:bg-accent-dark"
        >
          Terminé →
        </button>
      </div>
    );
  }

  /* ----------------------------- STEP 4 ----------------------------- */
  const n = matches.length;
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-ink/5 sm:p-6">
      <div className="mb-3 text-left">
        <button
          type="button"
          onClick={() => {
            trackFunnel("step_back_clicked", { step: 4 });
            setStep(3);
          }}
          className="text-sm text-ink/50 hover:text-ink"
        >
          ← Volver
        </button>
      </div>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-2xl">
        ✓
      </div>
      <h2 className="text-xl font-bold">¡Gracias!</h2>
      <p className="mx-auto mt-2 max-w-md text-ink/70">
        Le escribiste a <strong>{n}</strong>{" "}
        {n === 1 ? "representante" : "representantes"}. Revisá que el mail haya
        salido de tu casilla.
      </p>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Multiplicá el impacto
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => handleShare("whatsapp")}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Compartir en WhatsApp
          </button>
          <button
            type="button"
            onClick={() => handleShare("x")}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold hover:bg-ink/5"
          >
            Compartir en X
          </button>
          <button
            type="button"
            onClick={() => handleShare("facebook")}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold hover:bg-ink/5"
          >
            Compartir en Facebook
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <CoursesSection location="step4" />
      </div>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <FollowSection location="step4" />
      </div>

      <button
        type="button"
        onClick={() => {
          trackFunnel("write_another_clicked");
          setStep(3);
        }}
        className="mt-6 block w-full text-sm text-accent-dark underline hover:text-ink"
      >
        Escribirle a alguien más
      </button>

      <p className="mt-8 border-t border-ink/10 pt-6 text-xs text-ink/50">
        Este formulario es de código abierto.{" "}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackFunnel("repo_link_clicked")}
          className="font-semibold text-accent-dark underline hover:text-ink"
        >
          Colaborá en GitHub
        </a>
        .
      </p>
    </div>
  );
}

function StepBadge({ step }: { step: number }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink/40">
      Paso {step} de 4
    </p>
  );
}
