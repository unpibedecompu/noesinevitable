-- Un contador por representante (upsert), sin índices extra: cada índice
-- cuenta como fila escrita y multiplica el consumo del cupo de D1.
CREATE TABLE IF NOT EXISTS counts (
  email TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  sent INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;

-- Ejecuciones del Worker por día (UTC), para la alarma de cupo.
-- `alerted` es un bitmask: 1 = avisó al 70%, 2 = avisó al 90%.
CREATE TABLE IF NOT EXISTS daily (
  day TEXT PRIMARY KEY,
  executions INTEGER NOT NULL DEFAULT 0,
  alerted INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;
