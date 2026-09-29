# Contacta a tu Representante — LatAm + España

Formulario web para que cualquier persona de Latinoamérica y España le mande un
email pre-escrito (editable) a sus representantes políticos sobre los riesgos del
desarrollo de IA de frontera.

Ver [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) para el detalle de alcance y decisiones.
Idea basada en <https://controlai.org/take-action>.

## Estado

Fase 1 — MVP. Envío por `mailto:` (sin backend, costo cero). El usuario manda el
mail desde su propio cliente de correo.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- **Export estático** (`output: "export"` → carpeta `out/`). Sin servidor ni
  funciones por request → gratis y sin límites de tráfico en Cloudflare Pages.
- Analytics: Cloudflare Web Analytics (pageviews, gratis) + hooks vendor-agnósticos
  para eventos de embudo (`lib/analytics.ts`). **Nada** trackea el envío real.
- Datos de representantes: `data/representatives.json` estático (sin base de datos)

## Correr localmente

```bash
npm install
npm run dev        # http://localhost:3000
```

En dev se muestran también los representantes con `verified: false` para poder
probar la UI. En producción (`NODE_ENV=production`) sólo se sirven los
verificados.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo (`localhost:3000`) |
| `npm run build` | build + export estático a `out/` |
| `npm run preview` | build y sirve `out/` localmente (`localhost:4173`) |
| `npm run lint` | ESLint (config de Next) |
| `npm run check:data` | valida `data/representatives.json` contra las reglas del spec |

## Flujo del usuario

1. **Paso 1** — elegí país (auto-sugerido por IP vía `/cdn-cgi/trace` de
   Cloudflare, editable), `provincia/estado` y nombre → "Generar mi mensaje".
2. **Paso 2** — revisá/editá asunto y cuerpo.
3. **Paso 3** — lista de representantes, un botón por representante
   ("Enviar con Gmail" / "Enviar con Outlook", o "Abrir formulario"). Cada
   uno abre un mail individual en el proveedor del usuario; al usarlo, la
   tarjeta queda con ✓ y atenuada. Si el cliente no abre, hay un fallback
   para copiar el mensaje.
4. **Paso 4** — gracias + compartir (WhatsApp / X / Facebook), cursos de
   BlueDot y redes.

## Datos de representantes

`data/representatives.json` es un array de objetos:

```jsonc
{
  "country": "AR",                       // ISO alpha-2
  "region": "Córdoba",                   // provincia/estado, o null si es cargo nacional
  "office": "diputado_nacional",         // ver PROJECT_SPEC para valores válidos
  "channel": "email",                    // "email" (default) | "form"
  "email": "email@hcdn.gob.ar",          // "" si channel es "form"
  "formUrl": "https://...",              // obligatorio si channel es "form"
  "name": "Nombre Apellido",
  "party": "Partido",                    // opcional, sólo para la UI
  "verified": false,                     // true SOLO si se chequeó contra la fuente oficial
  "source": "https://www.hcdn.gob.ar/..." // URL de la fuente oficial
}
```

- **`channel: "email"`** → se abre `mailto:`. **`channel: "form"`** → el usuario
  copia el mensaje y se le abre `formUrl` (para cargos que sólo tienen formulario
  web, ej. la Presidencia de México).
- Estado de carga y pendientes: **[`DATA_TODO.md`](./DATA_TODO.md)**. Hoy: AR y CO
  con datos oficiales (`verified: true`), MX cargado pero sin verificar (sitios
  geo-bloqueados) → no se muestra en producción todavía.

## Deploy — Cloudflare Workers (static assets, gratis, tráfico ilimitado)

El dashboard actual de Cloudflare unificó Pages dentro de "Workers & Pages": al
conectar un repo por Git ahora crea un **Worker**, no un proyecto Pages
clásico. El plan free sirve assets estáticos con **requests y ancho de banda
ilimitados** (único límite real: 500 builds/mes). Como el sitio es un export
estático servido desde el CDN, aguanta picos virales sin costo.

El repo trae `wrangler.jsonc` con `assets.directory: "out"`, que le dice a
Wrangler que esto es un sitio estático puro. **Es importante que ese archivo
exista antes del primer deploy**: si `wrangler deploy` no encuentra
`wrangler.jsonc`, autodetecta "Next.js" e intenta migrar el proyecto al
adaptador OpenNext (pensado para SSR), lo cual falla porque este proyecto usa
`output: "export"` (build estático, no server build) — el error se ve como
`ENOENT: .../.next/standalone/.next/server/pages-manifest.json`.

**Setup (una vez):**

1. Cloudflare Dash → Workers & Pages → Create → Connect to Git → elegir este
   repo.
2. Build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: dejar el default (`/`) — este repo ya es la raíz del proyecto
3. (Opcional) Analytics: Cloudflare Dash → Web Analytics → Add a site → copiar el
   token → en el Worker → Settings → Variables agregar
   `NEXT_PUBLIC_CF_BEACON_TOKEN = <token>`. Para el embudo (Umami), agregar
   también `NEXT_PUBLIC_UMAMI_WEBSITE_ID = <website id de umami.is>`.
4. Conectar dominio propio (Worker → Settings → Domains & Routes) y actualizar
   `SHARE_URL` en `components/ContactForm.tsx`.

La detección de país usa `/cdn-cgi/trace`, que Cloudflare responde
automáticamente en cualquier sitio que aloje. En local ese endpoint no existe →
el país arranca sin preseleccionar y el usuario elige a mano.

**Deploy manual (alternativa, sin Git):**

```bash
npm run build
npx wrangler deploy
```

## Fuera de scope

- **Backend de envío (Resend/SES): descartado** (2026-09-29). Los mails salen
  del proveedor del usuario, uno por representante — ver `PROJECT_SPEC.md`.
- No implementar todavía: base de datos, representantes provinciales/locales,
  login, dashboard de analytics avanzado, Turnstile (sólo si hay abuso de bots).

Próximos pasos y pendientes: [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).
