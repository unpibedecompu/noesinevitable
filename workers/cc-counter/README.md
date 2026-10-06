# cc-counter — contador de mails enviados

El sitio pone `registro@noesinevitable.org` en CC de cada mail a un
representante (`TRACKING_CC` en `lib/mailto.ts`). Cloudflare Email Routing le
entrega esa copia a este Worker, que:

- lee sólo el header `To` y, si es un representante de
  `data/representatives.json`, suma 1 a su contador en D1;
- ignora mails a direcciones desconocidas y los que *manda* un representante
  ("responder a todos" de un despacho);
- descarta el mail: no guarda contenido ni la dirección de quien lo manda;
- avisa por mail a `lucasvitali001@gmail.com` cuando las ejecuciones del día
  cruzan el 70% y el 90% de `DAILY_LIMIT` (una vez por umbral por día).

Es un Worker aparte del sitio: el `wrangler.jsonc` de la raíz (static assets,
deploy automático desde Git) no se toca. Éste se deploya a mano.

**Cupos (plan free):** 100k ejecuciones de Worker/día y 100k filas escritas en
D1/día. Cada mail escribe 2 filas (contador + ejecuciones del día), así que el
techo real es **~50k mails/día** — de ahí `DAILY_LIMIT = 50000`. Si hace falta
más: Workers Paid ($5/mes) y subir `DAILY_LIMIT`.

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
8. **Probar** — desde cualquier casilla, mandar un mail con `To` a un
   representante *de prueba* no sirve (le llegaría de verdad). En cambio:
   mandar un mail a `registro@noesinevitable.org` con `To` sólo a
   `registro@…` y chequear que suma una ejecución sin contar a nadie:
   ```sh
   npx wrangler d1 execute noesinevitable-cc-counter --remote \
     --command "SELECT * FROM daily ORDER BY day DESC LIMIT 3"
   ```
   Para ver el conteo de punta a punta, mandarse un mail real desde el sitio
   a un representante (es un mail legítimo, como el de cualquier usuario) y
   mirar `counts`.
9. **Recién ahí mergear** la rama que agrega el CC al sitio. Si el sitio sale
   antes, cada copia a `registro@` rebota y el usuario recibe un aviso de
   error de entrega.

## Consultas

Mails por representante:
```sh
npx wrangler d1 execute noesinevitable-cc-counter --remote \
  --command "SELECT email, country, sent FROM counts ORDER BY sent DESC"
```

Mails por país:
```sh
npx wrangler d1 execute noesinevitable-cc-counter --remote \
  --command "SELECT country, SUM(sent) AS sent FROM counts GROUP BY country"
```

Ejecuciones por día (incluye mails ignorados):
```sh
npx wrangler d1 execute noesinevitable-cc-counter --remote \
  --command "SELECT day, executions, alerted FROM daily ORDER BY day DESC"
```

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
Con `--var DAILY_LIMIT:5` se prueba la alarma: los mails "enviados" quedan
como `.eml` en `.wrangler/tmp/email/`.
