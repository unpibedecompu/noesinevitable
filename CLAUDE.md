# Notas para Claude

Leer primero `PROJECT_STATUS.md` (deploy, tareas pendientes), `DATA_TODO.md`
(datos de representantes) y `PROJECT_ESSENCE.md` (tono del copy).

## Cómo trabajar en este repo

- **Siempre en una rama de feature.** `master` hace deploy automático a
  noesinevitable.org en cada push — no mergear ni pushear a `master` sin que
  el dueño lo pida explícitamente.
- Commitear y pushear la rama; después levantar `npm run dev`
  (http://localhost:3000) para que el dueño revise antes de mergear, y
  preguntar si abrir PR o mergear.
- Push: el remoto es de la cuenta de GitHub `unpibedecompu`. Si la cuenta
  activa de `gh` es otra, `gh auth switch --user unpibedecompu` antes de
  pushear (y volver a la anterior después).
- Antes de commitear cambios de datos: `npm run check:data`. Para tipos:
  `npx tsc --noEmit -p .`.

## Estado (2026-09-30)

- Rama `feature/personalized-salutation` pusheada, **sin mergear**: alcance
  limitado a Argentina + Uruguay (se borraron los datos del resto), saludo con
  título y género ("Estimada Diputada …:"), y "ciudadano/a de la provincia de
  …" en la primera oración. Detalle en `PROJECT_STATUS.md` → "Mails
  personalizados por representante".
- Próximas tareas sugeridas (ver `PROJECT_STATUS.md` → "Próximos pasos"):
  dirección de tracking en CC (Email Worker + D1) y alarma por cupo de Umami.
