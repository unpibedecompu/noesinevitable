-- Un contador por representante y día (UTC), upsert: 1 fila escrita por mail.
-- Sin índices extra: cada índice cuenta como fila escrita y multiplica el
-- consumo del cupo de D1. La clave empieza por `day` para que el cron de la
-- alarma lea sólo las filas de hoy.
CREATE TABLE IF NOT EXISTS counts (
  day TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  sent INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, email)
) WITHOUT ROWID;

-- Avisos ya mandados, para no repetirlos. Sólo se escribe al avisar.
-- `key` es la alarma + su período: `cc:<día>`, `umami:<inicio del período>`,
-- `umami-error:<día>`. `alerted` es un bitmask: 1 = avisó al 70% (o el aviso
-- de error), 2 = avisó al 90%. (Reemplaza a la tabla `alerts` de la primera
-- versión, que quedó sin uso en la base remota.)
CREATE TABLE IF NOT EXISTS notices (
  key TEXT PRIMARY KEY,
  alerted INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;

-- Totales públicos, recalculados por el cron de 15 minutos. `public`: lo que
-- devuelve GET /stats ({ updatedAt, byCountry }); `past`: suma de los días
-- anteriores a `through`, para no releer toda `counts` en cada corrida.
CREATE TABLE IF NOT EXISTS stats (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
) WITHOUT ROWID;

-- Personas por país y día (UTC): el sitio suma 1 la primera vez que alguien
-- aprieta "Enviar" en un navegador (POST /people). Upsert: 1 fila escrita
-- por persona. No se guarda nada que identifique a nadie.
CREATE TABLE IF NOT EXISTS people (
  day TEXT NOT NULL,
  country TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country)
) WITHOUT ROWID;

-- Personas por país, provincia/departamento y día (UTC): el sitio suma 1 la
-- primera vez que alguien aprieta "Enviar" en un navegador (POST /people).
-- `region` = '' si no eligió una. Reemplaza a `people` (sólo por país), que
-- quedó sin uso. No se guarda nada que identifique a nadie.
CREATE TABLE IF NOT EXISTS participants (
  day TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT '',
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country, region)
) WITHOUT ROWID;
