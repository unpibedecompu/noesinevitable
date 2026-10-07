"use client";

import { useEffect, useRef, useState } from "react";

/** Duración de las animaciones de los gráficos (barra, donuts, números). */
export const GROW_MS = 700;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * `false` en el primer render y `true` en el cuadro siguiente: los gráficos
 * dibujan sus tramos en 0 y, con una transición de CSS, crecen hasta su
 * tamaño. Después, cada cambio de datos se desliza con la misma transición.
 */
export function useGrown(): boolean {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return grown;
}

/** Número que cuenta hasta `target` (desde 0 al montar, después desde el valor anterior). */
export function useCountUp(target: number, duration = GROW_MS): number {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (reducedMotion()) {
      from.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let id = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const v = Math.round(origin + (target - origin) * eased);
      from.current = v;
      setValue(v);
      if (t < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, duration]);

  return value;
}
