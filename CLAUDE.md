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

## Estado (2026-10-06)

- Mergeado a `master`: mails personalizados por representante (alcance AR +
  UY) y dirección de tracking en CC (`registro@noesinevitable.org` → Worker
  `workers/cc-counter/`, deployado a mano, aparte del sitio). **Si cambia
  `data/representatives.json`, volver a deployar ese Worker** (`npm run
  deploy` en `workers/cc-counter/`) o los mails nuevos no se cuentan.
- El mismo Worker manda las alarmas de cupo (mails/día y eventos/mes de
  Umami). La de Umami necesita el secret `UMAMI_API_KEY` (ver su README).
- Próximas tareas sugeridas (ver `PROJECT_STATUS.md` → "Próximos pasos"):
  revisar los datos que se le piden al usuario.
