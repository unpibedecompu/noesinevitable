# Estado de los datos de representantes

`data/representatives.json` — 448 filas, sólo Argentina y Uruguay, todas
`verified: true`.

**Recorte a AR + UY (2026-09-30, decisión del dueño):** se borraron del JSON
todas las filas de otros países (Colombia, México, Ecuador, Costa Rica,
Guatemala, Panamá y Rep. Dominicana — 1007 filas) y Panamá se sacó del
selector. Los datos siguen en el historial de git (commit anterior a este
cambio) si se quieren recuperar. Las filas de esos países se sacaron de la
tabla de cobertura; las notas de más abajo quedan como referencia de fuentes
y de lo que faltaba verificar (hoy implicaría volver a cargarlos).

Regla (2026-09-11): **no se cargan** contactos por formulario web (`channel: form`).
Si un cargo no tiene email publicado, se omite. Las casillas institucionales de
presidencia (audiencias@, contacto@, transparencia@…) sí se cargan como fila
`presidente` cuando son el único canal oficial por email.

Países activos en el selector (`lib/countries.ts`): AR, UY.

**Brasil, descartado (2026-09-11):** se había cargado el roster completo
(513 diputados + 79 senadores + presidencia, ver fuentes en la tabla de Fase 2
más abajo) y se había agregado plantilla de mail en portugués, pero el dueño
decidió sacarlo del alcance del proyecto — la audiencia del proyecto es
hispanohablante y el dueño no habla portugués. Se borraron las filas de
`representatives.json`, la plantilla en portugués (`subjectPt`/`mailContentPt`
en `data/site-copy.json`) y el soporte de idioma en `lib/message-template.ts`.
Si se retoma, las fuentes oficiales (API de dadosabertos.camara.leg.br y
legis.senado.leg.br) están documentadas en la tabla de Fase 2.

## Cobertura actual

| País | Cargo | Filas | verified | Fuente | Notas |
|---|---|---|---|---|---|
| 🇦🇷 AR | presidente | 1 | ✅ | casarosada.gob.ar | `audiencias@presidencia.gob.ar` (pedido de audiencia; es el único email de la Presidencia) |
| 🇦🇷 AR | vicepresidente | 1 | ✅ | senado.gob.ar | `presidencia@senado.gob.ar` (Presidencia del Senado) |
| 🇦🇷 AR | diputado_nacional | 257 | ✅ | hcdn.gob.ar | **roster completo** (257/257). Email `<slug>@hcdn.gob.ar` leído del `mailto:` de cada ficha oficial |
| 🇦🇷 AR | senador_nacional | 73 | ✅ | senado.gob.ar | 72 senadores individuales + 1 atención ciudadana. Extraídos del padrón oficial; sólo 3 cross-checeados a mano |
| 🇺🇾 UY | diputado_nacional | 91 | ✅ | parlamento.gub.uy/sobreelparlamento/legisladores | 91 de 99 (8 suplentes sin email publicado). Email del `mailto:` oficial, 19 departamentos |
| 🇺🇾 UY | senador_nacional | 25 | ✅ | parlamento.gub.uy | 25 de 30 (5 sin email publicado). Circunscripción nacional → `region: null` |

## Pendiente antes de lanzar

### Bloqueante
- [ ] **México: re-verificar desde una IP mexicana.** Las 163 filas MX salieron de capturas de Wayback porque los sitios `.gob.mx` bloquean este entorno. Abrir ~10 direcciones por cámara en un browser normal desde México y, si están bien, poner `verified: true`. El JSON del Senado (`senado.gob.mx/66/datosAbiertos/senadoresDatosAb.json`) es la fuente más confiable.
- [ ] **AR senadores + CO representantes: spot-check de los datos masivos.** Los 72 senadores AR y los 182 representantes CO se extrajeron de listados oficiales pero sólo se cross-checearon 3 y 5 respectivamente. Chequear ~10 más por cámara contra la ficha individual antes de un envío masivo. Ojo con los irregulares (sin punto, apellido compuesto). Los 257 diputados AR sí salieron uno por uno del `mailto:` de cada ficha oficial (patrón `<slug>@hcdn.gob.ar` sin excepciones).
- [ ] **Texto del mensaje** (`lib/message-template.ts`) — sigue siendo borrador, falta aprobación del dueño.

### Completar cobertura
- [x] AR: 257 diputados individuales — hecho.
- [x] CO: 103 senadores individuales — hecho.
- [ ] MX: 464 diputados restantes — iterar `sitl.diputados.gob.mx/LXVI_leg/curricula.php?dipt=<ID>` desde IP MX.
- [x] Fase 2 (2026-09-11) — cargados: Rep. Dominicana, Uruguay, Panamá (completos y verificados), Guatemala (parcial, verificado), Ecuador y Costa Rica (completos pero `verified: false`, no activados en el selector). Brasil se cargó y luego se descartó por decisión del dueño (ver nota más arriba).
- [ ] **España y Chile** — la extracción se cortó a mitad (límite de uso de la sesión) antes de escribir resultados. Fuentes confirmadas en la tabla de abajo; relanzar. Para España usar los emails que estén publicados aunque la cobertura sea parcial.
- [ ] **Bolivia y Paraguay** — descartados por decisión del dueño (2026-09-11): la fuente de contacto es sólo institucional, sin email individual. Nota: Bolivia Senado sí tiene API con email individual (`apisi.senado.gob.bo/page/senadores`, 36/36); Diputados no (y el sitio publica 255 perfiles para 130 bancas, sin distinguir titular/suplente). Hay un borrador en `%LOCALAPPDATA%\Temp\claude-agent-output-latam\reps_BO.json` / `reps_PY.json` si se retoma.
- [ ] DO: confirmar que los 70 diputados con período 2020-2024 en el SIL son de la legislatura 2024-2028. Vía rápida: cada diputado actual tiene ficha en `camaradediputados.gob.do/diputados/<nombre-slug>/` con su email — chequear que las 70 existan y coincidan (hay un listado de slugs en `%LOCALAPPDATA%\Temp\claude-agent-output-latam\do_old70_slugs.txt`). Si pasa, volver a `verified: true` y activar DO.
- [ ] EC: conseguir emails confirmados de la legislatura 2025-2029 (el "Distributivo de personal" LOTAIP vigente está roto en el servidor) y subir a `verified: true`.
- [ ] CR: verificar los 57 emails contra el sitio en vivo desde una IP no bloqueada y confirmar que corresponden a la legislatura 2026-2030.
- [ ] GT: faltan ~102 diputados sin email confirmado (no reelectos). Buscar el directorio de la legislatura 2024-2028.
- [ ] El Salvador, Honduras — tienen sitio oficial y contacto general, pero no encontré fuente oficial que confirme provincia/departamento por diputado. Retomar si aparece un directorio con esa columna.
- [ ] Nicaragua — sitio oficial existe, pero el país está bajo régimen autoritario consolidado (Ortega-Murillo); mismo tipo de reparo institucional que llevó a excluir Venezuela. Pendiente decisión del dueño del proyecto sobre si incluirlo.

### Fase 2 — fuentes verificadas por país (investigación 2026-09-11)

| País | Contacto | Región/circuito | Notas |
|---|---|---|---|
| 🇪🇸 España | [Búsqueda de diputados](https://www.congreso.es/es/busqueda-de-diputados) / [Senado contacto](https://www.senado.es/web/relacionesciudadanos/atencionciudadano/contactar/index.html) | [BOCG](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-79.PDF) — cada acta publica la "Circunscripción" (provincia) | Emails de diputados sólo se publican si el diputado autoriza — cobertura parcial. `headOfGovernmentOffice: presidente_gobierno` |
| 🇨🇱 Chile | [Senado — listado](https://tramitacion.senado.cl/appsenado/index.php?mo=senadores&ac=listado) (email + teléfono + región confirmados) / [Cámara — formulario](https://www.camara.cl/camara/formulario_contacto.aspx) | Región/circunscripción en el mismo listado del Senado; diputados por distrito en camara.cl | Senado con mejor cobertura confirmada que Cámara |
| 🇧🇷 Brasil | [Contatos Câmara](https://www2.camara.leg.br/a-camara/presidencia/contatos) — patrón `dep.apellido@camara.leg.br` | [Filtro por UF](https://camara.leg.br/deputados/quem-sao/resultado?uf=SP) | Falta confirmar patrón de email del Senado (senado.leg.br) |
| 🇪🇨 Ecuador | [Dataset LOTAIP (CSV)](https://www.asambleanacional.gob.ec/lotaip-2023/diciembre/literal2-2/Numeral-2.1-2.2-Conjunto-de-datos.csv) — email oficial por asambleísta | Cada ficha en [pleno-asambleistas](https://www.asambleanacional.gob.ec/es/pleno-asambleistas) dice "Asambleísta por [Provincia]" | Unicameral. Mejor fuente bulk de toda la fase 2 |
| 🇬🇹 Guatemala | [Directorio PDF](https://www.congreso.gob.gt/assets/uploads/secciones/pdf/8c616-directorio-novena-legislatura.pdf) — email por diputado, patrón `nombre@congreso.gob.gt` | [diputados_distrito](https://www.congreso.gob.gt/diputados_distrito) | Unicameral |
| 🇨🇷 Costa Rica | [Correos_Diputados](https://www.asamblea.go.cr/Diputados/SitePages/Correos_Diputados.aspx) | [DiputadosXProvincia](https://www.asamblea.go.cr/Diputados/SitePages/DiputadosXProvincia.aspx) | Unicameral. Sitio rechazó la conexión desde acá (posible geobloqueo tipo México) — confirmar con navegador normal |
| 🇩🇴 Rep. Dominicana | [Senadores 2024-2028](https://www.senadord.gob.do/senadores/) — Excel descargable con correo/teléfono por provincia / [Cámara Diputados contacto](https://camaradediputados.gob.do/contacto/) | Mismo listado, organizado por provincia | |
| 🇵🇦 Panamá | [Directorio de Diputados](https://www.asamblea.gob.pa/Diputados) — fichas individuales con patrón `nombre@asamblea.gob.pa` | Organizado por provincia/circuito electoral | Unicameral |
| 🇵🇾 Paraguay | [Diputados — contacto](https://www.diputados.gov.py/index.php/contacto) / [Senado](https://www.senado.gov.py/) — sólo emails de oficina, no individuales confirmados | [Nómina por departamento](https://www.diputados.gov.py/diputados/nomina-departamentos) | Falta patrón de email individual — puede requerir `channel: form` o email institucional genérico |
| 🇺🇾 Uruguay | [Correos electrónicos](https://parlamento.gub.uy/contactenos/representantes/listaemails) | [Legisladores](https://parlamento.gub.uy/sobreelparlamento/legisladores) — filtro por departamento | |
| 🇧🇴 Bolivia | [diputados.gob.bo](https://diputados.gob.bo/), [senado.gob.bo](https://senado.gob.bo/institucional) — sin patrón de email individual confirmado | [Páginas por departamento](https://diputados.gob.bo/departamento/la-paz/) | Fuente de contacto más débil del grupo — verificar si hay directorio con emails antes de cargar `verified: true` |

### A evaluar (UX, no bloqueante)
- [ ] **Lista larga de senadores**: en CO (circunscripción nacional) y MX (32 de lista nacional) el usuario ve TODOS los senadores en el selector, sin poder filtrar por región. Un CO ve ~120 opciones (presidente + 103 senadores + representantes de su depto). Considerar: buscador en el selector, o poner senadores detrás de un "ver senadores" colapsable, o preseleccionar presidente + cámara baja.
- [ ] AR presidente: ¿usar el formulario de `contacto.casarosada.gob.ar` (`channel: form`) en vez del email de audiencias?
- [ ] AR presidente: sólo existe `audiencias@presidencia.gob.ar`; no hay email personal del presidente ni de su despacho publicado (la alternativa es el formulario de `contacto.casarosada.gob.ar`, hoy excluido por regla).
- [ ] MX senadores "Lista Nacional" (32 con `region: null`): quizás keyear por `estadoOrigen`.
- [ ] CO: nombres de `region` para circunscripciones especiales (CITREP, Afro, Indígena, Internacional, Oposición) — hoy son etiquetas descriptivas, no departamentos.

## Fuentes oficiales por país

| País | Cámara Baja | Cámara Alta |
|---|---|---|
| Bolivia | diputados.bo | senado.bo |
| Brasil | camara.leg.br | senado.leg.br |
| Chile | camara.cl | senado.cl |
| Costa Rica | asamblea.go.cr | — (unicameral) |
| Ecuador | asambleanacional.gob.ec | — (unicameral) |
| El Salvador | asamblea.gob.sv | — (unicameral) |
| España | congreso.es | senado.es |
| Guatemala | congreso.gob.gt | — (unicameral) |
| Honduras | congresonacional.hn | — (unicameral) |
| Nicaragua | asamblea.gob.ni | — (unicameral) |
| Panamá | asamblea.gob.pa | — (unicameral) |
| Paraguay | diputados.gov.py | senado.gov.py |
| Rep. Dominicana | camaradediputados.gob.do | senado.gob.do |
| Uruguay | parlamento.gub.uy | parlamento.gub.uy |

## Excluidos a propósito (no técnico)

- **Venezuela** — situación institucional excepcional.
- **Perú** — fuentes contradictorias sobre la presidencia; revisar más adelante.
- **Cuba** — partido único; "contactar representantes" no aplica igual.
