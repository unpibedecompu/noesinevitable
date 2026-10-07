"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Aparece (fade + sube un poco) cuando entra en pantalla al scrollear.
 * Se renderiza visible: sólo se oculta ya en el cliente y si todavía está
 * fuera de pantalla, así que sin JS, o si ya se ve al cargar, no parpadea.
 * Con "reducir movimiento" no se anima.
 */
export default function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("shown");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${
        state === "static"
          ? ""
          : `transition duration-700 ease-out ${state === "hidden" ? "translate-y-6 opacity-0" : ""}`
      }`}
    >
      {children}
    </div>
  );
}
