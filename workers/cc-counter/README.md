# cc-counter — contador de mails enviados

El sitio pone `registro@noesinevitable.org` en CC de cada mail a un
representante (`TRACKING_CC` en `lib/mailto.ts`). Cloudflare Email Routing le
entrega esa copia a este Worker, que:

- lee sólo el header `To` y, si es un representante de
  `data/representatives.json`, suma 1 a su contador del día en D1;
- ignora mails a direcciones desconocidas y los que *manda* un representante
  ("responder a todos" de un despacho);
- descarta el mail: no guarda contenido ni la dirección de quien lo manda.

Además manda dos alarmas por mail a `lucasvitali001@gmail.com`, al cruzar el
70% y el 90% de cada cupo (una vez por umbral y período):

- **Cupo diario de este Worker:** un cron cada 15 minutos suma los mails del
  día contra `DAILY_LIMIT`.
- **Cupo mensual de Umami Cloud:** un cron diario (11:00 UTC) estima los
  eventos del período de facturación contra `UMAMI_MONTHLY_LIMIT`. Ver
  "Alarma de Umami" más abajo.

Es un Worker aparte del sitio: el `wrangler.jsonc` de la raíz (static assets,
deploy automático desde Git) no se toca. Éste se deploya a mano.

**Cupos (plan free):** 100k ejecuciones de Worker/día y 100k filas escritas en
D1/día. Cada mail escribe 1 fila, así que el techo es **~100k mails/día** — de
ahí `DAILY_LIMIT = 100000`. La alarma no ve los mails ignorados, que igual
gastan ejecuciones; con avisos al 70% y 90% queda margen. Si hace falta más:
Workers Paid ($5/mes) y subir `DAILY_LIMIT`.

**Los datos de representantes van empaquetados en el Worker.** Si cambia
`data/representatives.json` (altas, bajas, emails nuevos), volver a deployar
este Worker o esos mails no se cuentan.

## Setup (una sola vez)

Todo desde `workers/cc-counter/`, con la cuenta de Cloudflare dueña de
`noesinevitable.org`.

1. **Instalar y loguearse**
   ```sh
   npm install
   npx wrangler login
   ```
2. **Activar Email Routing** — Dashboard → `noesinevitable.org` → Email →
   Email Routing → *Enable*. Aceptar los registros MX/SPF que propone (el
   dominio no recibe mail en otro lado, no hay MX que pisar).
3. **Verificar el destino de las alarmas** — Email Routing → *Destination
   addresses* → agregar `lucasvitali001@gmail.com` y confirmar desde el mail
   que llega. Sin esto el binding `send_email` no puede mandar alarmas.
4. **Crear la base D1**
   ```sh
   npx wrangler d1 create noesinevitable-cc-counter
   ```
   Copiar el `database_id` que imprime a `wrangler.jsonc` (reemplaza
   `REEMPLAZAR_CON_EL_ID_DE_D1`).
5. **Crear las tablas**
   ```sh
   npm run schema
   ```
6. **Deployar el Worker**
   ```sh
   npm run deploy
   ```
7. **Rutear la dirección al Worker** — Email Routing → *Routing rules* →
   *Create address*: `registro` → acción *Send to a Worker* →
   `noesinevitable-cc-counter`.
8. **Probar** — mandar un mail a `registro@noesinevitable.org` (con `To` sólo
   a `registro@…`): tiene que aparecer en *Email Routing → Activity log* como
   entregado al Worker, y no sumar nada en `counts` (no es un
   representante). Para ver el conteo de punta a punta, mandarse un mail real
   desde el sitio a un representante (es un mail legítimo, como el de
   cualquier usuario) y mirar `counts`:
   ```sh
   npx wrangler d1 execute noesinevitable-cc-counter --remote \
     --command "SELECT * FROM counts ORDER BY day DESC LIMIT 5"
   ```
9. **Recién ahí mergear** la rama que agrega el CC al sitio. Si el sitio sale
   antes, cada copia a `registro@` rebota y el usuario recibe un aviso de
   error de entrega.

## Alarma de Umami

Umami Cloud no manda alertas de uso ni tiene API de uso (la página *Settings →
Usage* es sólo del dashboard). El Worker reconstruye el número como lo cuenta
Umami — cada pageview y cada evento propio suman 1, y cada propiedad guardada
de un evento suma 1 más — con tres endpoints de la API de estadísticas:
`/websites/<id>/stats` (pageviews), `/events/stats` (eventos) y
`/event-data/stats` (propiedades). La "session data" también cuenta en Umami,
pero el sitio no la usa. Es una estimación: comparar de vez en cuando con
*Settings → Usage*.

Setup (una sola vez):

1. En Umami Cloud (cuenta `lucasvitali001@gmail.com`): Settings → API keys →
   *Create key*.
2. Guardarla como secret del Worker (pide la clave por consola; no queda en
   el repo):
   ```sh
   npx wrangler secret put UMAMI_API_KEY
   ```
3. Chequear en *Settings → Usage* qué día arranca el período de facturación
   y, si no es el 1, cambiar `UMAMI_BILLING_DAY` en `wrangler.jsonc` y
   deployar.

Sin `UMAMI_API_KEY` la alarma no corre. Si la API falla (clave vencida o
revocada, cambio de API), el Worker manda un mail "no pude consultar el uso
de Umami", a lo sumo uno por día.

## Consultas

Mails por representante:
```sh
npx wrangler d1 execute noesinevitable-cc-counter --remote \
  --command "SELECT email, country, SUM(sent) AS sent FROM counts GROUP BY email ORDER BY sent DESC"
```

Mails por país:
```sh
npx wrangler d1 execute noesinevitable-cc-counter --remote \
  --command "SELECT country, SUM(sent) AS sent FROM counts GROUP BY country"
```

Mails por día:
```sh
npx wrangler d1 execute noesinevitable-cc-counter --remote \
  --command "SELECT day, SUM(sent) AS sent FROM counts GROUP BY day ORDER BY day DESC"
```

Las ejecuciones totales del Worker (incluidos los mails ignorados) se ven en el
dashboard: Workers → `noesinevitable-cc-counter` → Metrics.

## Limitaciones conocidas

- Cualquiera puede inflar el conteo mandando mails a `registro@` con un
  representante en `To`. Los números son orientativos, no auditables.
- Cuenta mails *enviados con el CC intacto*: si el usuario borra el CC, o
  copia el mensaje a mano, ese envío no se cuenta.
- Días en UTC (el día "cambia" a las 21 h de Argentina/Uruguay).

## Desarrollo local

```sh
npx wrangler d1 execute noesinevitable-cc-counter --local --file=schema.sql
npx wrangler dev --local
# en otra terminal (el mail necesita Message-ID):
printf 'Message-ID: <t1@example.com>\r\nFrom: a@example.com\r\nTo: audiencias@presidencia.gob.ar\r\nSubject: t\r\n\r\nhola\r\n' |
  curl -X POST "http://localhost:8787/cdn-cgi/handler/email?from=a@example.com&to=registro@noesinevitable.org" --data-binary @-
```
Para probar la alarma, levantar con `--test-scheduled --var DAILY_LIMIT:2`,
mandar 2 mails como el de arriba y disparar el cron:
```sh
curl "http://localhost:8787/__scheduled?cron=*/15+*+*+*+*"
```
Los mails "enviados" quedan como `.eml` en `.wrangler/tmp/email/`.

La alarma de Umami se prueba contra un mock de la API: levantar un servidor
que responda `/websites/<id>/stats`, `/events/stats` y `/event-data/stats`, y
apuntar el Worker ahí con `--var UMAMI_API_KEY:test --var
UMAMI_API_URL:http://localhost:<puerto>`; después disparar el cron diario:
```sh
curl "http://localhost:8787/__scheduled?cron=0+11+*+*+*"
```
