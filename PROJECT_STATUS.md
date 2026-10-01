# Estado del proyecto

Última actualización: 2026-09-29.

## Deploy

- **Live URL:** https://contacta-representante-latam.unpibedecompu.workers.dev/
- Hosteado en **Cloudflare Workers** (el dashboard nuevo de Cloudflare unificó
  Pages dentro de Workers — esto ya NO es un proyecto "Pages" clásico).
- Conectado por Git a `unpibedecompu/contacta-representante-latam`, branch
  `master` → build y deploy automático en cada push.
- Build command: `npm run build` · Deploy command: `npx wrangler deploy`.
- El repo tiene `wrangler.jsonc` (`assets.directory: "out"`) — **necesario**:
  sin él, `wrangler deploy` autodetecta "Next.js" e intenta migrar al
  adaptador OpenNext (para SSR), lo cual rompe porque este proyecto usa
  `output: "export"` (build estático). Si algún día se borra o se toca ese
  archivo y el deploy falla con `ENOENT: .../.next/standalone/.../pages-manifest.json`,
  es por esto.
- **Dominio propio conectado:** `noesinevitable.org` (comprado vía Cloudflare
  Registrar, agregado en Worker → Settings → Domains → Custom Domains,
  dominio raíz sin subdominio). `SHARE_URL` en `components/ContactForm.tsx`
  ya apunta ahí. El `workers.dev` sigue funcionando en paralelo.
- Nota de acceso: para pushear a este repo hace falta la cuenta de GitHub
  **`unpibedecompu`** (dueña del repo). La cuenta `grecsoc` (activa por
  default en esta máquina) no tiene permisos — da 403. Cambiar con
  `gh auth switch --user unpibedecompu` antes de pushear si hace falta.

## Alcance de países

- **Limitado a Argentina y Uruguay** (decisión 2026-09-30, ver
  `lib/countries.ts`). El resto de los países de la fase 1 original está
  comentado en ese archivo, no borrado — reactivar descomentando cuando haya
  datos verificados de más países.
- `data/representatives.json` tiene sólo AR y UY: las filas del resto de los
  países (CO, MX, EC, CR, GT, PA, DO) se borraron el 2026-09-30 y quedan en
  el historial de git. Ver `DATA_TODO.md` para el estado de carga/verificación
  de representantes por país.

## Analytics

- Los env vars de analytics (`NEXT_PUBLIC_CF_BEACON_TOKEN`,
  `NEXT_PUBLIC_UMAMI_WEBSITE_ID`) son build-time, no runtime — como el
  Worker es 100% static assets (`assets.directory`), **no** existe la
  sección "Runtime variables and secrets" de Settings para este proyecto
  (esa da error "cannot be added to a Worker that only has static
  assets"). Van en **Worker → Settings → Builds → Variables and
  secrets**, que es lo que consume el pipeline de Git-connected Builds al
  correr `npm run build`. Cualquier cambio ahí necesita un push nuevo
  (aunque sea un commit vacío) para tomar efecto, porque Next.js hornea
  esos valores en el HTML/JS estático en build time.
- **Cloudflare Web Analytics** (pageviews, gratis/ilimitado — confirmado
  en la doc oficial de Cloudflare, sin tope de eventos, solo un soft
  limit de 10 sitios por cuenta): **conectado y confirmado funcionando**
  desde 2026-09-11. Token `NEXT_PUBLIC_CF_BEACON_TOKEN` seteado en Builds.
- **Umami Cloud** (funnel: país elegido, mensaje generado, click en
  Gmail/Outlook, compartido): **conectado y confirmado funcionando** desde
  2026-09-11, en cuenta separada `lucasvitali001@gmail.com` (no
  `unpibedecompu@gmail.com`). Website "contacta-representante-latam",
  domain `contacta-representante-latam.unpibedecompu.workers.dev`.
  Website ID `948684fb-65ac-48d6-bd97-770b72bd8440`, seteado en
  `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (Builds → Variables and secrets).
  - Bug histórico (encontrado y arreglado 2026-09-11): el ID que estaba
    documentado acá antes (`693eaa79-33c9-4772-a9b1-37e21fd7c4e8`) **no
    era un website ID** — era el Account ID de la cuenta
    `unpibedecompu@gmail.com` en Umami, copiado por error. Por eso el
    tracking nunca funcionó pese a que el código y el env var estaban
    "seteados" — apuntaban a un sitio que no existía. Verificado con
    curl al HTML en vivo (sin script de Umami) y confirmado en el
    dashboard de Umami (la cuenta `unpibedecompu@gmail.com` nunca tuvo un
    sitio para este proyecto, solo "unpibedecompu links").
  - Se usa una cuenta de Umami separada (`lucasvitali001@gmail.com`)
    porque el plan free ("Hobby") de Umami permite **1 solo sitio por
    cuenta** (no 3 como se pensó inicialmente — dato incorrecto de una
    fuente no oficial), y la cuenta `unpibedecompu@gmail.com` ya tiene su
    slot ocupado por `unpibedecompu links` (unpibedecompu.github.io).
  - Riesgo conocido y aceptado por ahora: tope de **100.000 eventos/mes**
    en el plan Hobby de Umami (6 meses de retención). Si el sitio se
    viraliza (el objetivo del proyecto) podría taparse justo en el pico.
  - Evaluado 2026-09-11: **si se acerca al tope, pasar al plan Pro de
    Umami ($20/mes, 1M eventos/mes, hasta 20 sitios)** en vez de migrar a
    Cloudflare Analytics Engine. Analytics Engine hoy es gratis pero
    requiere que el sitio deje de ser un export estático puro y tenga un
    Worker con `fetch` handler real que llame `writeDataPoint()` — mucho
    mayor costo de ingeniería que pagar $20/mes. No hay acción pendiente
    por ahora, solo vigilar el dashboard de Umami si hay un pico de
    tráfico.
- El hook `trackFunnel` (`lib/analytics.ts`) es vendor-agnostic — dispara a
  `window.umami`, `window.plausible`, `window.gtag` o `window.fathom`, el
  que esté cargado. Hoy solo Umami está cargado.

## Envío de mails

- **Decisión 2026-09-29:** se descarta que la página envíe los mails desde
  un backend. Se sigue usando el proveedor de mail del usuario (Gmail /
  Outlook / app nativa), **un mail por representante**, cada uno con su
  botón. Motivos en `PROJECT_SPEC.md` → "Decisión (2026-09-29)".
- En el paso 3, al abrir el mail para un representante su tarjeta queda con
  un ✓ y el nombre, la descripción y los botones se atenúan (siguen
  clickeables por si el mail no se abrió). Inspirado en ControlAI. El ✓
  significa "se abrió el mail", no "se envió".

## Próximos pasos

- [ ] **Dirección de tracking en CC** (ej. `registro@noesinevitable.org`)
      para contar envíos reales y no sólo clicks:
      - Cloudflare Email Routing en `noesinevitable.org` (ojo: reemplaza los
        MX si el dominio ya recibe mail en otro lado).
      - **Email Worker + base D1.** El Worker lee sólo el header `To` (no
        parsear el mail entero: el plan free tiene poco CPU por ejecución),
        lo matchea contra `representatives.json`, suma 1 a un contador en
        D1 por representante/país y descarta el mail (sin guardar contenido
        ni direcciones). Ignorar mails cuyo `To` no sea un representante
        conocido (ej. "responder a todos" de un despacho).
        - Esquema D1: **un contador por representante** (upsert), no una
          fila por mail, y sin índices extra — cada índice cuenta como fila
          escrita y multiplica el consumo del cupo.
        - Cupos free: 100k ejecuciones de Worker/día y 100k filas escritas
          en D1/día (≈100k mails/día con el esquema de arriba). Costo $0;
          Workers Paid ($5/mes) si hace falta más.
      - **Alarma por mail cerca del límite diario.** El Worker lleva en D1 un
        contador de ejecuciones del día; al cruzar ~70% y ~90% de las 100k
        manda un mail a `lucasvitali001@gmail.com` (una sola vez por umbral
        por día) con el binding `send_email` de Email Routing — los envíos a
        direcciones de destino verificadas son gratis. Así se puede pasar a
        Workers Paid antes de que un pico viral deje mails sin contar.
      - Agregar `cc` a los links de `lib/mailto.ts` (Gmail web, Outlook web,
        `mailto:`, deep links mobile — probar en dispositivo real).
      - Explicar el CC en la UI ("para contar cuántos mails se mandan") y en
        la política de privacidad.
- [ ] **Revisar los datos que se le piden al usuario** para el mail. Hoy es
      sólo nombre (+ provincia para filtrar). Evaluar pedir código postal,
      ciudad u otro dato que haga el mail más creíble como "constituyente"
      real del representante (ControlAI pide dirección / código postal),
      sin romper el objetivo de completar en 10-20 segundos.
- [x] **Mails personalizados por representante** (AR + UY, 2026-09-30).
      `lib/message-template.ts` arma, al abrir cada mail:
      - Saludo con título y género: "Estimada Diputada {nombre}:" /
        "Estimado Senador {nombre}:". Sin dato de género → "Estimado/a
        Diputado/a". Casillas institucionales (`institutional: true`):
        mismo saludo con el titular actual (`addressee`): "Estimado
        Presidente Javier Milei:", "Estimada Vicepresidenta Victoria
        Villarruel:" — **actualizar `addressee`/`gender` si cambia el
        titular**. Atención Ciudadana del Senado (sin persona) →
        "Estimados/as:".
      - Línea de presentación para cargos con región: "Vivo en Córdoba, la
        provincia que usted representa en el Senado de la Nación." (CABA →
        "el distrito"). Los senadores de UY (circunscripción nacional) no la
        llevan.
      - Género (`gender: "f" | "m"` en `representatives.json`): diputados AR
        leídos de la ficha oficial de hcdn.gob.ar ("Diputada"/"Diputado");
        senadores AR y todo UY inferidos por nombre de pila (la inferencia
        coincidió 256/256 con las fichas de HCDN).
- [x] **Link a `noesinevitable.org` en el mail** — agregado como P.D. al
      final de `mailContent` (`data/site-copy.json`): dominio pelado, sin
      `https://` ni parámetros, presentado como aviso ("Le escribo a través
      de…") y no como llamado a clickear, para no parecer phishing.
- [ ] **Alarma por mail cuando se acerque el tope de eventos de Umami**
      (100k/mes en el plan gratis; ver `strategy/estimated_budget.md`).
      Avisar a `lucasvitali001@gmail.com` al ~70% y ~90% del cupo, para
      pasar a Pro antes de perder datos en un pico viral. Primero chequear
      si Umami Cloud trae alertas de uso propias; si no, un Worker de
      Cloudflare con cron diario que consulte los eventos del mes por la
      API de Umami Cloud y mande el mail.
- [ ] Reactivar más países en `lib/countries.ts` cuando haya datos
      verificados (ver `DATA_TODO.md`).

## Para más adelante

- [ ] **Sección "últimas noticias"** — opción de incluir en el mail noticias
      recientes y relevantes sobre riesgos de IA (ControlAI lo ofrece como
      checkbox "Include the latest relevant news in my email").
- [ ] **Recortar eventos de analytics** para estirar el cupo de Umami
      (100k eventos/mes gratis; el cupo cuenta eventos, no visitantes).
      Candidatos a sacar por bajo valor: `step_viewed`, `subject_edited`,
      `body_edited`, `step_back_clicked`. Mantener los del embudo principal
      (`country_selected`, `message_generated`, `email_client_opened`,
      `email_sent_confirmed`, `shared`, `course_clicked`).
- [ ] **Automatizar la visualización de analytics de /home** (hoy se mira a
      mano en los dashboards de Cloudflare y Umami).
