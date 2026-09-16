"use client";

import { PRIMARY_COURSE } from "@/lib/courses";
import { trackFunnel } from "@/lib/analytics";

/**
 * Visible en el header, fuera de <ContactForm> — así aparece en los 4 pasos
 * sin depender de scrollear una lista de representantes que en algunos
 * países (AR) puede tener cientos de filas (ver research/2026-09-14-funnel-analysis).
 */
export default function MeanwhileTeaser() {
  return (
    <a
      href={PRIMARY_COURSE.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackFunnel("course_clicked", { course: PRIMARY_COURSE.name, location: "header" })
      }
      className="mt-1 inline-block text-sm font-medium text-accent-dark underline underline-offset-2"
    >
      Aprende sobre riesgos de la IA en 2 horas
    </a>
  );
}
