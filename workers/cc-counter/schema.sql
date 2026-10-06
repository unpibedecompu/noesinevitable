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
-- de error), 2 = avisó al 90%.
CREATE TABLE IF NOT EXISTS alerts (
  key TEXT PRIMARY KEY,
  alerted INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;
