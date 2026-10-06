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
  - **Plan Pro de Umami desde 2026-10-06** ($20/mes, 1M eventos/mes, 2
    años de retención, hasta 20 sitios; período de facturación desde el
    día 6). Pasado el millón, cada evento extra se cobra $0.00003 (~$30
    por millón) — ya no se pierden datos en un pico, pero sube el costo.
    Antes estaba en Hobby (100k eventos/mes, 6 meses de retención).
  - Evaluado 2026-09-11: Pro de Umami en vez de migrar a Cloudflare
    Analytics Engine. Analytics Engine hoy es gratis pero requiere que el
    sitio deje de ser un export estático puro y tenga un Worker con
    `fetch` handler real que llame `writeDataPoint()` — mucho mayor costo
    de ingeniería que pagar $20/mes.
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

- [x] **Dirección de tracking en CC** (`registro@noesinevitable.org`) para
      contar envíos reales y no sólo clicks. **En producción desde
      2026-10-06.** Setup y consultas en `workers/cc-counter/README.md`.
      - Hecho: Email Worker `workers/cc-counter/` (separado del sitio; el
        `wrangler.jsonc` de la raíz no se tocó). Lee sólo el header `To`, lo
        matchea contra `representatives.json`, suma 1 en D1 por
        representante y descarta el mail sin guardar contenido ni
        direcciones. Ignora mails cuyo `To` no sea un representante conocido
        y los que *manda* un representante ("responder a todos" de un
        despacho). Probado en local con `wrangler dev`.
      - Hecho: esquema D1 con un contador por representante y día (upsert),
        sin índices extra: **1 fila escrita por mail** → techo free de
        **~100k mails/día** (100k filas en D1 y 100k ejecuciones de Worker).
        Costo $0; Workers Paid ($5/mes) si hace falta más.
      - Hecho: alarma por mail a `lucasvitali001@gmail.com` al cruzar 70% y
        90% de `DAILY_LIMIT` (100000 por default, en `vars`), una sola vez
        por umbral por día, con el binding `send_email`. La chequea un cron
        cada 15 minutos (no cada mail, para no gastar una segunda escritura
        por mail): puede llegar hasta 15 min tarde, y no cuenta los mails
        ignorados, que igual gastan ejecuciones.
      - Hecho en Cloudflare (2026-10-06): Email Routing activado (MX
        configurados), `lucasvitali001@gmail.com` verificado como destino,
        base D1 `noesinevitable-cc-counter` creada, Worker deployado y
        `registro@` ruteado al Worker. Probado con un mail real
        (`wrangler tail` mostró el evento `Email … Ok`).
      - Hecho: `cc` en todos los links de `lib/mailto.ts` (Gmail web,
        Outlook web, `mailto:`, deep links iOS/Android) vía `TRACKING_CC`, y
        una línea en el paso 3 explicando la copia. **Falta probar los deep
        links mobile en dispositivo real.**
      - **Orden de deploy:** primero el setup de Cloudflare y la prueba del
        README, después mergear la rama. Si el sitio sale con el CC antes,
        cada copia rebota y el usuario recibe un error de entrega
        (`TRACKING_CC = ""` lo desactiva).
      - Riesgo aceptado: cualquiera puede inflar el conteo mandando mails a
        `registro@` con un representante en `To`. Los números son
        orientativos, no auditables.
      - Pendiente: no hay política de privacidad en el sitio; cuando se
        escriba, mencionar el CC.
- [x] **Revisar los datos que se le piden al usuario** para el mail
      (decisión del dueño, 2026-10-06). Se pide nombre, provincia/departamento
      y **sexo** (Femenino / Masculino / Otro): cambia "ciudadano/a" por
      "ciudadana" / "ciudadano" en la primera oración (placeholder
      `{{ciudadano}}` en `mailContent`); con "Otro" queda "ciudadano/a". Es
      obligatorio: "Generar mi mensaje" queda deshabilitado hasta elegir.
      No se manda a analytics. **Descartados:** código postal (los
      representantes de AR/UY se eligen por provincia/departamento entero,
      no cambia el destinatario y nadie lo chequea), DNI/cédula y dirección
      (riesgo de privacidad, parece phishing, ningún despacho lo necesita),
      ciudad y frase personal (el dueño prefirió no sumarlas).
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
      - Provincia/departamento del usuario en la primera oración: "le
        escribo como ciudadano/a de la provincia de La Pampa, Argentina" /
        "del departamento de Rivera, Uruguay" / "de la Ciudad de Buenos
        Aires, Argentina" (placeholder `{{lugar}}` en `mailContent`, armado
        en `placeFor` según `regionLabel`; si se suma un país con otra
        etiqueta, agregarla a `REGION_PREFIX`). Inspirado en ControlAI, cuya
        plantilla no tiene línea de presentación aparte — dice "I am
        writing as a constituent" en la primera oración. (Se probó antes una
        línea "Vivo en X, la provincia que usted representa en…" y sonaba
        forzada, y después la provincia debajo de la firma.)
      - Género (`gender: "f" | "m"` en `representatives.json`): diputados AR
        leídos de la ficha oficial de hcdn.gob.ar ("Diputada"/"Diputado");
        senadores AR y todo UY inferidos por nombre de pila (la inferencia
        coincidió 256/256 con las fichas de HCDN).
- [x] **Link a `noesinevitable.org` en el mail** — agregado como P.D. al
      final de `mailContent` (`data/site-copy.json`): dominio pelado, sin
      `https://` ni parámetros, presentado como aviso ("Le escribo a través
      de…") y no como llamado a clickear, para no parecer phishing.
- [x] **Alarma por mail cuando se acerque el tope de eventos de Umami**
      Hecha 2026-10-06 en el mismo Worker `workers/cc-counter/`: cron diario
      (11:00 UTC) que avisa a `lucasvitali001@gmail.com` al 70% y 90% del
      cupo del plan Pro (1M eventos por período, desde el día 6), para
      anticipar el cobro de excedente. Umami Cloud no tiene alertas de uso propias ni API de uso, así
      que el uso se estima con la API de estadísticas (pageviews + eventos
      + propiedades de eventos — **cada propiedad cuenta como un evento
      más** en Umami). Si la API falla, avisa por mail (uno por día).
      Detalle y setup de la API key en `workers/cc-counter/README.md` →
      "Alarma de Umami".
- [ ] **Contador en vivo en el paso 1 del formulario** ("Ya se enviaron N
      mails a representantes"), con los mismos datos que /home
      (`fetchLiveCounts` en `lib/mail-stats.ts`). Prueba social justo donde
      la gente decide escribir.
- [ ] **Revisar el texto debajo del título en /home** ("Sobre esta
      iniciativa": la explicación y el párrafo de cómo funciona).
- [ ] Reactivar más países en `lib/countries.ts` cuando haya datos
      verificados (ver `DATA_TODO.md`).

## Para más adelante

- [ ] **Sección "últimas noticias"** — opción de incluir en el mail noticias
      recientes y relevantes sobre riesgos de IA (ControlAI lo ofrece como
      checkbox "Include the latest relevant news in my email").
- [ ] **Recortar eventos de analytics** para estirar el cupo de Umami
      (1M eventos/mes en Pro, después se cobra; el cupo cuenta eventos y
      cada propiedad de un evento, no visitantes).
      Candidatos a sacar por bajo valor: `step_viewed`, `subject_edited`,
      `body_edited`, `step_back_clicked`. Mantener los del embudo principal
      (`country_selected`, `message_generated`, `email_client_opened`,
      `email_sent_confirmed`, `shared`, `course_clicked`).
- [x] **Automatizar la visualización de /home** (2026-10-06). El gráfico
      muestra en vivo dos donuts (personas y mails) con filtro por país en
      chips y una leyenda debajo; elegir un país muestra sus provincias/
      departamentos, cada uno con su color:
      **personas** (navegadores donde
      alguien apretó "Enviar" al menos una vez: `recordPerson` hace
      `POST /people` con sólo el código de país y marca el navegador en
      localStorage) y **mails enviados** (copias a registro@). El Worker
      `workers/cc-counter` recalcula los totales cada 15 minutos y los
      publica en `GET /stats`; /home los pide al abrir
      (`components/ParticipationDonuts.tsx`). Las personas se cuentan por
      la región que eligieron en el formulario; los mails, por la del
      representante que los recibió ("Cargos nacionales" si es nacional). Se suma una base fija con la
      participación de antes del conteo automático
      (`data/mail-sent-stats.json`: 11 personas y 57 mails según Umami). Si
      el Worker no responde, se ve sólo la base. Aproximado: una persona en
      dos dispositivos, o que borra los datos del navegador, cuenta dos
      veces, y cualquiera podría inflar los números a mano.
