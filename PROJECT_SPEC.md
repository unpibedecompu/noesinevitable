# Contacta a tu Representante — LatAm + España

Formulario web que permite a cualquier persona en Latinoamérica y España enviarle
un email pre-escrito (editable) a sus representantes políticos, expresando
preocupación por los riesgos del desarrollo de IA de frontera. Pensado para
tráfico viral (potencialmente cientos de miles / millones de usuarios).

## Objetivo de UX (crítico)

- El formulario debe completarse en **10-20 segundos**, sin excepción.
- Sin registro, sin verificación de email, sin captcha visual (usar Cloudflare
  Turnstile invisible si hace falta filtrar bots).
- Debe funcionar perfecto en mobile (la mayoría del tráfico va a venir de ahí,
  compartido desde redes sociales).
- Botón de "Enviar" siempre visible sin scroll.

## Flujo del usuario

1. Landing detecta o pregunta el país (selector rápido, o geolocalización por IP
   como sugerencia con opción de cambiarlo).
2. Usuario ingresa: nombre (para firmar el mail) y opcionalmente su email
   (solo si se usa para lista de actualizaciones futuras — no obligatorio).
3. Usuario elige a su representante de una lista corta, filtrada por país
   (y por provincia/estado si aplica, para no mostrar cientos de opciones).
4. Se muestra el mensaje pre-escrito (ver plantilla abajo), editable en un
   textarea, con el nombre del usuario ya insertado.
5. Botón "Enviar" genera un link `mailto:` con `to`, `subject` y `body`
   (URL-encoded) y lo abre automáticamente (`window.location.href`).
6. Pantalla de confirmación: "¡Listo! Se abrió tu cliente de mail con el
   mensaje listo para enviar" + botón para compartir en redes.

## Fase 1 (ESTA): envío vía `mailto:` — costo cero

- No hay backend de envío de mails. El usuario manda el mail desde su propio
  cliente (Gmail, Outlook, app nativa del celular).
- Ventaja: cero costo, escala infinito, sin riesgo de spam/reputación de dominio.
- Desventaja conocida y aceptada: no hay tracking de si el usuario efectivamente
  apretó "enviar" en su cliente de mail. Si se quiere trackear, contar clicks en
  el botón "Enviar" (evento de analytics) como proxy, dejando claro que es una
  aproximación.
- Se manda **un mail por representante**, cada uno con su propio botón (no un
  único mail con todos en `to`/`cc`). Así cada representante recibe un mail
  individual, con su nombre en el saludo.

### Decisión (2026-09-29): descartado que la página envíe los mails

Se evaluó un backend de envío (Resend / AWS SES) para mandar el mail a todos
los representantes de una vez desde el servidor. **Queda descartado**; se
sigue usando el proveedor de mail del usuario, un mail por representante.

Motivos:
- Un servidor no puede mandar *como* el usuario (`juan@gmail.com`): SPF/DKIM/
  DMARC lo rechazan o lo mandan a spam. El mail saldría de
  `@noesinevitable.org` con el nombre del ciudadano y `Reply-To`, y los
  despachos tienden a leer eso como campaña masiva → menos peso por mail.
- Mandar desde el Gmail del usuario vía OAuth requiere la verificación de
  Google para scopes restringidos (lenta y cara) y la pantalla de permisos
  asusta y agrega fricción.
- Referencia: ControlAI (`act.controlai.org`), con mucho más equipo y
  presupuesto, hace lo mismo para email — un `mailto:` por destinatario
  desde el cliente del usuario, con un botón por representante que queda
  con ✓ al usarlo. Sólo envían desde el servidor donde el email no llega al
  legislador (formularios web del Congreso de EE.UU., cartas en papel en UK).
- Para medir envíos reales (no sólo clicks) se va a usar una dirección de
  tracking en CC (ver `PROJECT_STATUS.md` → Próximos pasos), no un backend.

## Stack técnico sugerido

- Next.js (App Router) + TypeScript, deploy en Vercel (free tier).
- Sin backend de base de datos para esta fase — los datos de representantes
  viven en un archivo JSON estático versionado en el repo (ver estructura abajo).
  Esto simplifica todo: no hay que levantar Postgres/Supabase todavía.
- Tailwind para estilos, mobile-first.
- Analytics simple (Vercel Analytics o Plausible) para medir completions del
  formulario, no para trackear el mailto en sí.

## Estructura de datos de representantes

Archivo `data/representatives.json`, un array de objetos:

```json
{
  "country": "AR",
  "region": "Ciudad Autónoma de Buenos Aires",
  "office": "diputado_nacional",
  "name": "Nombre Apellido",
  "email": "email@hcdn.gob.ar",
  "party": "Partido (opcional, para mostrar en la UI)"
}
```

Valores válidos de `office`:
- `presidente`
- `vicepresidente`
- `gobernador` (o `presidente_gobierno` para España)
- `vicegobernador` (si aplica; muchos países no tienen esta figura)
- `senador_nacional` (solo países con cámara alta — ver lista de países abajo)
- `diputado_nacional`

## Alcance de países (fase 1)

**Incluidos:** Argentina, Bolivia, Brasil, Chile, Colombia, Costa Rica,
Ecuador, El Salvador, España, Guatemala, Honduras, México, Nicaragua, Panamá,
Paraguay, República Dominicana, Uruguay.

**Excluidos explícitamente (decisión del proyecto, no técnica):**
- **Venezuela** — situación institucional excepcional / poco clara al momento
  de armar la base.
- **Perú** — fuentes contradictorias sobre la presidencia actual al momento
  de armar la base; revisar más adelante si se aclara.
- **Cuba** — sistema de partido único sin oposición electoral competitiva;
  "contactar representantes" no tiene el mismo sentido político que en el
  resto de la región. A discutir si se incluye en una fase futura.

**Países unicamerales** (no tienen `senador_nacional`, solo `diputado_nacional`):
Ecuador, Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica, Panamá.

## Fuentes oficiales por país (para cargar `representatives.json`)

| País | Cámara Baja | Cámara Alta |
|---|---|---|
| Argentina | hcdn.gob.ar | senado.gob.ar |
| Bolivia | diputados.bo | senado.bo |
| Brasil | camara.leg.br | senado.leg.br |
| Chile | camara.cl | senado.cl |
| Colombia | camara.gov.co | senado.gov.co |
| Costa Rica | asamblea.go.cr (unicameral) | — |
| Ecuador | asambleanacional.gob.ec (unicameral) | — |
| El Salvador | asamblea.gob.sv (unicameral) | — |
| España | congreso.es | senado.es |
| Guatemala | congreso.gob.gt (unicameral) | — |
| Honduras | congresonacional.hn (unicameral) | — |
| México | diputados.gob.mx | senado.gob.mx |
| Nicaragua | asamblea.gob.ni (unicameral) | — |
| Panamá | asamblea.gob.pa (unicameral) | — |
| Paraguay | diputados.gov.py | senado.gov.py |
| Rep. Dominicana | camaradediputados.gob.do | senado.gob.do |
| Uruguay | parlamento.gub.uy (ambas cámaras) | parlamento.gub.uy |

Nota: cada sitio tiene estructura HTML propia — no asumir un scraper genérico,
armar uno por país o cargar los datos a mano si el volumen por país es chico.
Muchos legisladores no publican email individual, solo un formulario de
contacto o el email institucional genérico de la cámara — usar ese como
fallback cuando no haya email personal.

## Plantilla de mensaje pre-escrito (editable por el usuario)

```
Asunto: Preocupación ciudadana por los riesgos del desarrollo de IA de frontera

Estimado/a {nombre_representante},

Mi nombre es {nombre_usuario} y le escribo como ciudadano/a de {país} para
expresar mi preocupación por los riesgos asociados al desarrollo acelerado
de sistemas de inteligencia artificial de frontera.

[cuerpo del mensaje — pendiente de redacción final]

Le pido que impulse conocimiento técnico y acuerdos internacionales sobre
esta tecnología, de la misma manera en que la comunidad internacional lo
hizo históricamente con las armas nucleares y biológicas.

Atentamente,
{nombre_usuario}
```

(El texto final del mensaje debe ser revisado/aprobado por el dueño del
proyecto antes de lanzar — el de arriba es un placeholder de estructura.)

## Fuera de scope para esta fase (no implementar todavía)

- Backend de envío de mails (Resend / AWS SES) — **descartado** (ver
  "Decisión (2026-09-29)" arriba). El tracking real de envíos se hace con
  una dirección en CC.
- Base de datos relacional (Postgres/Supabase) — el JSON estático alcanza
  para el volumen de representantes de esta fase.
- Senadores/diputados **provinciales o locales** — solo nivel nacional.
- Login/autenticación de usuarios.
- Dashboard de analytics avanzado.

## Checklist de lanzamiento

- [ ] Formulario completable en <20 segundos, testeado en mobile real.
- [ ] `representatives.json` cargado con al menos Argentina, México y
      Colombia para el prototipo inicial (resto de países se puede sumar
      incrementalmente).
- [ ] Mensaje pre-escrito final aprobado (no el placeholder de este doc).
- [ ] Deploy en Vercel, dominio propio o subdominio conectado.
- [ ] Botón de compartir en redes sociales post-envío.
