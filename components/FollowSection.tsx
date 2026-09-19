"use client";

import { trackFunnel } from "@/lib/analytics";
import { INSTAGRAM_URL, NEWSLETTER_URL } from "@/lib/social";
import siteCopy from "@/data/site-copy.json";

/** Bloque de Instagram/newsletter. Se repite en el paso 4 del formulario y en /home. */
export default function FollowSection({ location }: { location: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
        Mantenete informado
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">
        {siteCopy.seguimeDescription}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackFunnel("social_link_clicked", { network: "instagram", location })}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold hover:bg-ink/5"
        >
          Instagram
        </a>
        <a
          href={NEWSLETTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackFunnel("social_link_clicked", { network: "newsletter", location })}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold hover:bg-ink/5"
        >
          Newsletter
        </a>
      </div>
    </div>
  );
}
