"use client";

import { trackFunnel } from "@/lib/analytics";
import { PRIMARY_COURSE, SECONDARY_COURSES } from "@/lib/courses";

/** Bloque de cursos de BlueDot. Se repite en el paso 4 del formulario y en /home. */
export default function CoursesSection({ location }: { location: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
        Educate gratis
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">
        BlueDot Impact da cursos gratuitos sobre los riesgos de la IA y
        cómo reducirlos.
      </p>

      <a
        href={PRIMARY_COURSE.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackFunnel("course_clicked", { course: PRIMARY_COURSE.name, location })
        }
        className="mx-auto mt-4 flex max-w-md flex-col overflow-hidden rounded-xl border border-ink/15 text-left transition hover:border-accent hover:shadow-md sm:flex-row"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- export estático, sin optimizador */}
        <img
          src={PRIMARY_COURSE.image}
          alt={`Curso ${PRIMARY_COURSE.name} de BlueDot`}
          className="aspect-[8/7] w-full object-cover sm:w-40"
        />
        <div className="flex flex-1 flex-col p-3">
          <span className="text-base font-semibold">{PRIMARY_COURSE.name}</span>
          <span className="mb-3 mt-0.5 text-xs text-ink/60">{PRIMARY_COURSE.audience}</span>
          <span className="mt-auto inline-block self-start rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-ink">
            Empezar el curso →
          </span>
        </div>
      </a>

      <p className="mx-auto mt-5 max-w-md text-xs font-semibold uppercase tracking-wide text-ink/40">
        ¿Perfil técnico o de política pública?
      </p>
      <ul className="mx-auto mt-2 grid max-w-md grid-cols-2 gap-2 text-left">
        {SECONDARY_COURSES.map((course) => (
          <li key={course.url}>
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackFunnel("course_clicked", { course: course.name, location })
              }
              className="flex h-full flex-col overflow-hidden rounded-lg border border-ink/15 transition hover:border-accent hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- export estático, sin optimizador */}
              <img
                src={course.image}
                alt={`Curso ${course.name} de BlueDot`}
                className="aspect-[8/5] w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-2">
                <span className="text-xs font-semibold">{course.name}</span>
                <span className="mb-2 mt-0.5 text-[11px] text-ink/60">{course.audience}</span>
                <span className="mt-auto inline-block self-start rounded-full bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent-dark">
                  Empezar curso →
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
