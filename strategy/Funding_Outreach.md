# Plan de búsqueda de financiamiento

Fecha de la investigación: 2026-10-06. Todos los datos de los financiadores se
verificaron en sus páginas oficiales en esa fecha (links en cada sección).
Antes de aplicar, volver a chequear plazos y montos: estas cosas cambian
rápido.

Contexto usado: `PROJECT_ESSENCE.md`, `PROJECT_SPEC.md`, `PROJECT_STATUS.md`,
`strategy/Phases.md`, `strategy/estimated_budget.md` y
`strategy/BlueDot_Rapid_Grant.md`.

---

## 1. Qué aprendimos del rechazo de BlueDot

BlueDot rechazó la aplicación (2026-10-03) por **elegibilidad**, no por
calidad. No dijeron cuál de sus categorías excluidas aplicó, pero hay dos
candidatas claras:

1. **"Lobbying on specific legislation, or electoral or partisan activity"**
   (lobby sobre legislación específica). La actividad central del sitio es
   que ciudadanos le escriban a sus legisladores pidiéndoles que apoyen
   ciertas medidas. Para un financiador que es una *charity* (BlueDot es una
   organización benéfica del Reino Unido) eso se parece mucho a "lobby de
   base" (*grassroots lobbying*), y muchos financiadores benéficos lo
   excluyen por regla, aunque el mail no mencione ningún proyecto de ley.
2. **"Work done for, or promotion of, BlueDot"**. La aplicación decía varias
   veces que el sitio y el mail mandan gente a los cursos de BlueDot. Para
   nosotros era un argumento a favor; para ellos probablemente era un
   conflicto de interés (financiar promoción propia).

Argentina y Uruguay **no** están en la lista de países excluidos, así que
el problema no fue geográfico.

**Reglas para las próximas aplicaciones:**

- **Priorizar financiadores donde la incidencia política (advocacy) está
  explícitamente dentro del alcance** o que no están limitados a donaciones
  benéficas (Lightcone Commons, PauseAI, Manifund).
- **Con financiadores benéficos (charities / fundaciones de EE.UU.),
  describir la actividad con precisión y sin exagerar:** participación
  ciudadana y educación pública sobre riesgos de IA. El mail **no** se
  refiere a ningún proyecto de ley ni a ninguna elección, no es partidario,
  y lo que pide es general (capacidad técnica del Estado, acuerdos
  internacionales, tratar el riesgo como tema de seguridad). Bajo las reglas
  del IRS de EE.UU., el lobby de base requiere referirse a *legislación
  específica*; eso juega a favor, pero **no es una garantía legal**: cada
  financiador interpreta sus propias reglas.
- **Preguntar antes de aplicar.** Un mail de 5 líneas al contacto del
  fondo ("¿Esto entra en lo que pueden financiar?") ahorra semanas.
- **No presentar la promoción del financiador como impacto.** Mencionar
  BlueDot como "un recurso educativo al que derivamos" está bien con
  cualquier otro financiador; con BlueDot mismo no.
- **No pedir fondos para contactar o pagar a funcionarios**, ni nada
  electoral. El proyecto ya cumple esto; conviene decirlo explícitamente.

---

## 2. Las 5 recomendaciones (ordenadas por encaje)

Resumen:

| # | Fuente | Monto sugerido | Plazo / respuesta | Riesgo de elegibilidad |
|---|---|---|---|---|
| 1 | Manifund (open call + regrantors) | mín. $700, meta ~$4.000 | Abierto siempre; días a semanas | Medio-bajo (501c3, lobby limitado) |
| 2 | Lightcone Commons | ~$12.000 (6 meses) | Rolling; respuesta ~23-01-2027 | Bajo (acepta no-benéficos) |
| 3 | PauseAI MicroGrants | ~€1.500 | Rolling; respuesta en ~1 mes | Bajo, pero exige sumarse a PauseAI |
| 4 | EA Funds – Transformative AI Fund | ~$10.000 (4 meses) | Siempre abierto | Medio (charity; advocacy está en alcance) |
| 5 | Coefficient Giving – Capacity Building | ~$10.000 (6 meses) | Rolling; ~3 meses | Medio-alto (encaje temático parcial) |

Los montos usan la misma tarifa que la aplicación a BlueDot ($20/hora) y los
costos de infraestructura de `estimated_budget.md` y `PROJECT_STATUS.md`
(Umami Pro $20/mes, Cloudflare Workers Paid $5/mes si hace falta).

---

### 1. Manifund

- **URL:** <https://manifund.org> · open call:
  <https://manifund.org/about/open-call> · regranting:
  <https://manifund.org/about/regranting>
- **Qué financia y montos:** plataforma tipo "Kickstarter para proyectos
  sin fines de lucro" más un programa de *regranting* donde expertos
  ("regrantors") tienen presupuesto propio para dar subsidios rápido. Su
  foco principal es seguridad y gobernanza de IA. En 2026 buscan distribuir
  ~$5M por regranting ([post 2026](https://www.lesswrong.com/posts/F8qBjWfAsryeTzbvY/regranting-in-2026-now-more-than-ever)).
  Hay grants chicos (ej. $2.500, $7.200) y grandes ($100k+).
- **Elegibilidad:** "Anyone can create a public proposal"; financian
  individuos, charities y (con revisión) empresas. Debe ser un proyecto de
  beneficio público compatible con las reglas 501(c)(3)
  ([open call](https://manifund.org/about/open-call)).
- **Por qué encaja:** acepta individuos de cualquier país, sin monto mínimo,
  y es rápido ("grants in days instead of weeks"). Ya alojó proyectos de
  incidencia política sobre IA, como el de
  [Center for AI Policy](https://manifund.org/projects/support-caips-advocacy-work-in-2025)
  y el de [estipendios de grupos locales de PauseAI](https://manifund.org/projects/pauseai-local-communities---volunteer-stipends).
  Además, Lightcone Commons **importa automáticamente** las aplicaciones
  recientes de Manifund (ver #2), así que el mismo texto sirve dos veces.
- **Riesgos:** Manifund es una 501(c)(3) y su página de regranting dice que
  "do not generally permit donations to political campaigns or lobbying".
  Las charities públicas de EE.UU. pueden hacer lobby "no sustancial", y
  el mail no menciona legislación específica, pero conviene confirmarlo.
  Todo es público (monto, nombre, descripción). No verifiqué cómo pagan a
  Argentina (transferencia, PayPal, etc.) ni si cobran comisión al
  receptor: preguntar.
- **Plazo:** abierto siempre; cada proyecto define su propio plazo de
  recaudación.
- **Formato:** proyecto público en <https://manifund.org/create>:
  descripción, uso de fondos, monto mínimo y meta, plazo. Después se firma
  un acuerdo de subsidio.
- **Pedido sugerido:**
  - **Mínimo $700** = Fase 1 (1 mes en Argentina, el mismo presupuesto que
    BlueDot: $20 Umami Pro, $320 mejoras del sitio, $320 difusión, $40
    imprevistos).
  - **Meta ~$4.000** = Fase 1 + Fase 2 (3 meses más: Chile, Uruguay,
    México y armado del grupo de trabajo). Ej.: 12 h/semana × 13 semanas ×
    $20 = $3.120; Umami Pro 3 × $20 = $60; Workers Paid 3 × $5 = $15;
    imprevistos ~$100.
- **Qué destacar:**
  1. Datos reales del embudo: 11 de 71 visitantes mandaron 57 mails (~35%
     de los visitantes de países cubiertos, ~5 mails por persona) con un
     solo reel en una cuenta de 1.100 seguidores.
  2. Costo marginal casi cero por mail (sitio estático, envío desde el
     cliente de correo del usuario) y precedente de ControlAI, que usa el
     mismo mecanismo.
  3. Hispanohablantes: ~20 países y casi nada de trabajo sobre riesgo de IA
     de frontera en español dirigido a legisladores.
- **Acción extra:** escribirle a un regrantor con interés en gobernanza o
  en advocacy, con el link del proyecto, en vez de esperar que lo
  encuentren solos. Contacto general: austin@manifund.org.

---

### 2. Lightcone Commons

- **URL:** <https://lightconecommons.com> (FAQ en la misma página).
- **Qué financia y montos:** plataforma nueva de Lightcone Infrastructure
  que coordina a varios financiadores grandes de riesgo de IA: Jaan Tallinn
  (~$10M), Dustin Moskovitz (~$5M), el Long-Term Future Fund (~$2M), el ARM
  Fund (~$2M) y donantes anónimos. Esperan repartir $15–25M por ronda, cada
  3 meses. Los grants suelen ser de $10.000 para arriba
  ([resumen](https://grantedai.com/grants/lightcone-commons-quarterly-grant-rounds-ai-alignment-lightcone-9d4f2b18)).
- **Elegibilidad:** "We accept applications from anyone internationally"
  (las únicas excepciones prácticas son Rusia e India). **No hace falta ser
  una ONG:** financian individuos, empresas, organizaciones 501(c)(4) (las
  que en EE.UU. sí pueden hacer lobby) y organizaciones de fuera de EE.UU.
  Para individuos ofrecen patrocinio fiscal si el trabajo califica como
  benéfico, y aclaran que algunos de sus financiadores no están limitados a
  donaciones benéficas.
- **Por qué encaja:** es la fuente donde el problema de BlueDot
  (incidencia política) tiene **menos** chance de repetirse. Uno de los
  evaluadores, Eric Neyman, se dedica justamente a "high-leverage giving
  opportunities in policy and advocacy". Además, Jaan Tallinn (el
  principal financiador) históricamente apoyó trabajo de incidencia sobre
  riesgo de IA.
- **Riesgos:** es lento para lo que necesitamos: la ronda actual cerró el
  23-08-2026 y **las aplicaciones nuevas reciben respuesta alrededor del
  23-01-2027**. El monto típico ($10k+) es más grande que nuestra Fase 1,
  así que hay que presentar un plan más largo. La plataforma es nueva:
  puede cambiar.
- **Plazo:** rolling; hoy responden ~23-01-2027. Tienen un programa de
  "direct grantors" que pueden dar plata antes si alguno se interesa.
- **Formato:** 4 secciones, formato libre, en un documento editable
  después de enviar: *What are you working on? / What would you do with
  funding? / Who is involved? / Logistical details.* Si ya aplicamos a
  Manifund, la aplicación se importa sola (llega un mail con acceso).
- **Pedido sugerido: ~$12.000 por 6 meses** (cubre Fase 2 y el comienzo
  de la expansión):
  - Coordinación, desarrollo y difusión: 20 h/semana × 26 semanas × $20 =
    $10.400.
  - Infraestructura: Umami Pro y Workers Paid ~$150 (más si se viraliza:
    ver tabla de `estimated_budget.md`).
  - Pequeños pagos para voluntarios que verifiquen datos de representantes
    de nuevos países (Chile, México, etc.): ~$1.200.
  - Imprevistos: ~$250.
- **Qué destacar:**
  1. Resultados de la Fase 1 en Argentina (si para enero ya hay datos de la
     dirección de tracking en CC, usar mails **enviados**, no sólo clicks).
  2. Plan de escala concreto por país con metas proporcionales a la
     población (`Phases.md`: Argentina 100.000, México 28.200, Chile 4.300,
     Uruguay 750).
  3. Neutralidad política explícita y encuadre de cooperación
     internacional (como la no proliferación nuclear), que funciona con
     cualquier partido.

---

### 3. PauseAI MicroGrants

- **URL:** <https://pauseai.info/microgrants>
- **Qué financia y montos:** subsidios chicos y únicos, normalmente **menos
  de €2.000**, para proyectos concretos alineados con la misión de PauseAI:
  eventos, videos sobre riesgos de IA, propuestas de políticas,
  investigación, columnas en medios, o crear una organización alineada.
- **Elegibilidad:** hay que sumarse a PauseAI con su formulario oficial y
  firmar un acuerdo de voluntariado. Prefieren gente que ya haya
  contribuido. No se mencionan restricciones por país; cada persona se
  ocupa de sus propios impuestos.
- **Por qué encaja:** la incidencia política ciudadana **es** la actividad
  central de PauseAI (escribirle a legisladores es una de sus acciones
  típicas), así que el problema de BlueDot no aplica. El monto calza
  justo con la Fase 1. `PROJECT_ESSENCE.md` ya nombra a PauseAI como
  referencia de tono.
- **Riesgos:** **asociación de marca.** Sumarse a PauseAI puede chocar con
  la neutralidad del proyecto: "pausar la IA" es un pedido más fuerte que
  el del mail (capacidad técnica + acuerdos internacionales). Hay que
  decidir si está bien que noesinevitable.org aparezca como proyecto
  vinculado a PauseAI. Además, el programa da preferencia a quienes ya
  contribuyeron y pide un informe con recibos al terminar. No encontré el
  link directo al formulario: se accede después de sumarse.
- **Plazo:** rolling; deciden en ~1 mes. El pago suele ser por adelantado
  después de firmar la carta de subsidio.
- **Formato:** formulario corto; lo revisan el Organizing Director y el
  CEO, que pueden pedir una llamada.
- **Pedido sugerido: ~€1.500 por 2 meses de difusión en Argentina y
  Uruguay** (Fase 1 extendida): 8 h/semana × 8 semanas × ~$20 ≈ $1.280 de
  difusión y mejoras, Umami Pro 2 meses $40, imprevistos. Entregable
  concreto: X mails enviados medidos con la dirección de tracking en CC,
  más un informe del embudo.
- **Qué destacar:**
  1. Es una herramienta de "letter writing" lista y funcionando, en
     español, que cualquier grupo de PauseAI de un país hispanohablante
     puede usar.
  2. Datos medibles del embudo y entregables concretos (esto es lo que
     piden en el informe final).
  3. Ofrecer el sitio como recurso para la comunidad de PauseAI (esto
     además sirve como "historial de contribución").

---

### 4. EA Funds – Transformative AI Fund

- **URL:** <https://funds.effectivealtruism.org/funds/transformative-ai> ·
  formulario: <https://av20jp3z.paperform.co/?fund=Transformative%20AI%20Fund>
  · contacto: transformativeai@effectivealtruismfunds.org
- **Qué financia y montos:** reemplazó al **Long-Term Future Fund, que
  cerró** (ver <https://funds.effectivealtruism.org/funds/far-future>).
  Subsidios iniciales para individuos y proyectos nuevos, "typically in
  the $10k–$150k range". El alcance incluye explícitamente proyectos que
  reducen riesgos catastróficos de IA mediante "technical research, policy
  analysis, forecasting, **advocacy**, and demonstration projects".
- **Elegibilidad:** individuos, organizaciones nuevas y organizaciones
  existentes con proyectos nuevos. No menciona restricciones por país.
  "We are always open to applications."
- **Por qué encaja:** se definen como financiamiento "early-stage, fast, and
  tolerant of failure"; somos exactamente eso. Advocacy está en el alcance
  escrito.
- **Riesgos:** EA Funds depende de Effective Ventures, que es una charity
  (EE.UU./Reino Unido), así que puede tener las mismas limitaciones que
  BlueDot sobre lobby. En el
  [post de lanzamiento](https://forum.effectivealtruism.org/posts/dYuNi5Rh68o9YKstg/ea-funds-is-launching-the-transformative-ai-fund)
  advierten que los tiempos de respuesta van a ser más largos al principio.
  Históricamente, el LTFF casi no financiaba proyectos nuevos de advocacy
  ([crítica en el EA Forum](https://forum.effectivealtruism.org/posts/Xfon9oxyMFv47kFnc/some-concerns-about-policy-work-funding-and-the-long-term)).
  **Escribir antes al contacto** preguntando si una herramienta para que
  ciudadanos escriban a legisladores, sin referencia a legislación
  específica, entra en lo que pueden financiar.
- **Plazo:** siempre abierto, rolling.
- **Formato:** formulario online (Paperform) con datos del aplicante,
  proyecto, presupuesto y teoría de impacto.
- **Pedido sugerido: ~$10.000 por 4 meses** (Fase 1 + Fase 2):
  20 h/semana × 17 semanas × $20 = $6.800; voluntarios para cargar y
  verificar datos de Chile y México ~$1.500; infraestructura ~$200; medios
  y materiales de difusión (edición de video, etc.) ~$1.000; imprevistos
  ~$500.
- **Qué destacar:**
  1. Teoría de impacto en dos pasos: legisladores ven que a sus votantes
     les importa el tema, y ciudadanos ven que es una preocupación
     compartida.
  2. Por qué importan países que no construyen IA de frontera: los
     acuerdos internacionales necesitan el apoyo de muchos países, y los
     hispanohablantes son ~20 votos en foros multilaterales.
  3. Validación con datos y metas falsables por fase (si no llegamos a X
     mails, paramos o cambiamos).

---

### 5. Coefficient Giving (ex Open Philanthropy) – Capacity Building

- **URL:**
  <https://coefficientgiving.org/funds/navigating-transformative-ai/funding-for-work-that-builds-capacity-to-address-risks-from-transformative-ai/>
  · consultas: cb-funding@coefficientgiving.org
- **Qué financia y montos:** "capacity-building" sobre riesgos de IA
  transformadora: programas de formación, eventos, grupos y **"resources,
  media, and communications"** (sitios web, videos, podcasts), incluyendo
  proyectos que lleven temas ya cubiertos "to new audiences or in more
  accessible ways". Van "from small grants to individuals, to multi-year
  grants to organizations".
- **Elegibilidad:** individuos y organizaciones, tiempo completo o parcial.
  No menciona restricciones por país.
- **Por qué encaja (parcialmente):** el sitio y los reels llevan el tema a
  un público nuevo (hispanohablantes, en general sin contacto previo con el
  riesgo de IA) y derivan a cursos de formación. Coefficient Giving es,
  además, quien financia los cursos de BlueDot.
- **Riesgos:** es el de menor encaje. El programa "is not primarily intended
  to fund direct work", y escribirle a legisladores es trabajo directo de
  incidencia. Su RFP de gobernanza de IA (que encajaría mejor) **cerró el
  25-01-2026**
  ([fuente](https://www.effectivealtruism.org/opportunities/recTVSiPgDoRHKJrz))
  y no tiene fecha de reapertura. La plata viene en gran parte de una
  fundación privada de EE.UU., que no puede destinar fondos a lobby. Para
  aplicar acá hay que presentar **el componente de comunicación y
  educación** (contenido en español, embudo hacia cursos), no el envío de
  mails como actividad principal.
- **Plazo:** rolling, "open until further notice"; deciden en general
  dentro de 3 meses (se puede pedir más rapidez en el formulario).
- **Formato:** formulario online con datos del aplicante, proyecto y
  actividades a financiar.
- **Pedido sugerido: ~$10.000 por 6 meses** para un programa de
  comunicación en español: producción de reels y explicadores sobre
  riesgos de IA, mantenimiento del sitio como puerta de entrada, y
  medición de cuánta gente llega a un curso. Ej.: 15 h/semana × 26
  semanas × $20 = $7.800; edición de video ~$1.500; infraestructura y
  analytics ~$200; imprevistos ~$500.
- **Qué destacar:**
  1. Público nuevo y desatendido: casi no hay contenido serio en español
     sobre riesgo de IA de frontera.
  2. Embudo medido de contenido → acción → formación (clicks a cursos ya
     medidos con Umami).
  3. Tono basado en evidencia y no alarmista (ver "Tono" en
     `PROJECT_ESSENCE.md`).

---

## 3. Descartados o en espera

| Fuente | Estado (2026-10-06) | Por qué no está en el top 5 |
|---|---|---|
| Long-Term Future Fund | **Cerrado**; reemplazado por el Transformative AI Fund ([fuente](https://funds.effectivealtruism.org/funds/far-future)) | Ya no existe como fondo independiente (aparece como financiador dentro de Lightcone Commons). |
| Survival and Flourishing Fund | Rondas 2026 cerradas; la aplicación rolling queda para la próxima ronda ([fuente](https://survivalandflourishing.fund/2026/application)) | "SFF cannot recommend funding to individuals … who do not have a fiscal sponsor". Recién tiene sentido con patrocinador fiscal y para la ronda 2027. Jaan Tallinn ya está en Lightcone Commons. |
| AI Safety Fund (Frontier Model Forum) | Sin convocatoria abierta ([fuente](https://www.frontiermodelforum.org/ai-safety-fund/)) | Sólo financia investigación técnica. |
| Future of Life Institute | Sin convocatoria abierta que encaje ([fuente](https://futureoflife.org/grant-program/)) | La última RFP (proyectos religiosos) cerró el 02-02-2026. Seguir atentos a nuevas convocatorias. |
| Lightspeed Grants | No encontré rondas después de 2023 ([fuente](https://www.lesswrong.com/posts/xQ4ajnzavSgbYiko2)) | Parece inactivo; Lightcone Commons cumple ese rol ahora. |
| Emergent Ventures (Mercatus) | Abierto, rolling, global, responde en ~1 semana ([fuente](https://www.mercatus.org/emergent-ventures), [guía](https://hub.causo.ai/guides/how-to-apply-to-emergent-ventures-2026)) | Elegible, pero el director (Tyler Cowen) es públicamente escéptico del riesgo existencial y de regular la IA. Encaje temático bajo. Opción de "último recurso": aplicar es barato (1.500 palabras). |
| grantmaking.ai | La ronda de $1M (con Manifund) cerró en julio de 2026 ([fuente](https://forum.effectivealtruism.org/posts/AnMtdJfDym8bGjPB2/usd1m-ai-x-risk-grant-round-is-live-on-grantmaking-ai-apply)) | Conviene cargar el proyecto en su base (<https://grantmaking.ai>) para la próxima ronda. |
| ControlAI | No es un financiador | Posible alianza o difusión (mismo mecanismo de mails), no financiamiento. |
| Fondos de tecnología cívica LatAm | Convocatorias para organizaciones, montos de $80k+ y temas de gobierno digital | No encontré ninguna abierta que acepte individuos y riesgo de IA de frontera. |

---

## 4. Qué reutilizar de la aplicación a BlueDot

Se puede reutilizar casi todo, con estos ajustes:

- **Reutilizar tal cual:** la descripción del proyecto, las 3 cosas que
  pide el mail, los datos del embudo (71 visitantes, 11 remitentes, 57
  mails, ~35% de conversión), los cambios hechos a partir de analytics, el
  presupuesto de Fase 1 ($700 detallado) y "qué haría sin el subsidio".
- **Actualizar:**
  - Países: hoy son **Argentina y Uruguay** (Panamá se sacó el
    2026-09-30, ver `PROJECT_STATUS.md`).
  - Métricas: actualizar con los datos de Umami al día de aplicar y, si ya
    está, con el conteo de la dirección de tracking en CC (mails enviados,
    no sólo abiertos).
  - Mejoras nuevas: mails personalizados por representante (saludo con
    cargo y género, provincia/departamento en la primera oración), link a
    noesinevitable.org en el mail.
  - "Why now": revisar que las noticias citadas (incidente de OpenAI, etc.)
    sigan siendo actuales y poner links.
- **Sacar o bajar el tono:** BlueDot como centro del argumento. Decir "el
  sitio deriva a cursos gratuitos de formación (por ejemplo, BlueDot)".
- **Agregar (por lo que aprendimos del rechazo):** un párrafo corto y
  honesto sobre la naturaleza de la actividad: no partidaria, sin
  referencia a ningún proyecto de ley, sin pagos a funcionarios; los mails
  los manda cada ciudadano desde su propia cuenta, con texto editable.
- **Escalar el pedido:** BlueDot era 1 mes y $700. Para Lightcone, el
  Transformative AI Fund y Coefficient Giving hay que presentar Fase 1 +
  Fase 2 (y más), porque sus montos típicos empiezan en ~$10k.

---

## 5. Orden y cronograma sugeridos (próximas semanas)

| Semana | Acción |
|---|---|
| **6–12 oct** | 1) Actualizar el texto base de BlueDot (sección 4) en inglés. 2) Publicar el proyecto en **Manifund** (mínimo $700, meta ~$4.000) y escribirle a austin@manifund.org para confirmar que el tema del lobby no es un problema y cómo pagan a Argentina. 3) Decidir si está bien vincularse con PauseAI. |
| **13–19 oct** | 4) Si la respuesta es sí: sumarse a PauseAI y mandar la **MicroGrant** (~€1.500). 5) Escribirle a 2–3 regrantors de Manifund con el link. 6) Mandar un mail corto a transformativeai@effectivealtruismfunds.org preguntando si el proyecto es elegible. |
| **20–26 oct** | 7) Aplicar a **Lightcone Commons** (~$12.000, 6 meses), o editar la aplicación importada de Manifund. Cuanto antes se mande, más tiempo tienen los evaluadores antes de la respuesta de ~23-01-2027. 8) Si el Transformative AI Fund respondió que sí, aplicar (~$10.000). |
| **27 oct – 9 nov** | 9) Si para esta fecha no hay respuesta positiva de los anteriores, aplicar a **Coefficient Giving** con el encuadre de comunicación. 10) Opcional: Emergent Ventures. 11) Cargar el proyecto en grantmaking.ai para la próxima ronda. |
| **Siempre** | Mantener actualizadas las métricas (ideal: con la dirección de tracking en CC funcionando) y editar las aplicaciones abiertas (Manifund y Lightcone permiten editar) cuando haya datos nuevos. |

**Lógica del orden:** primero lo rápido y barato (Manifund, PauseAI) para
financiar la Fase 1 ya; en paralelo, lo lento y grande (Lightcone, el
Transformative AI Fund) para la Fase 2 a partir de enero de 2027; al final,
el de menor encaje (Coefficient Giving).

---

## Fuentes

- Manifund: <https://manifund.org/about/open-call>,
  <https://manifund.org/about/regranting>,
  <https://www.lesswrong.com/posts/F8qBjWfAsryeTzbvY/regranting-in-2026-now-more-than-ever>,
  <https://manifund.org/projects/support-caips-advocacy-work-in-2025>,
  <https://manifund.org/projects/pauseai-local-communities---volunteer-stipends>
- Lightcone Commons: <https://lightconecommons.com>,
  <https://grantedai.com/grants/lightcone-commons-quarterly-grant-rounds-ai-alignment-lightcone-9d4f2b18>
- PauseAI MicroGrants: <https://pauseai.info/microgrants>
- EA Funds: <https://funds.effectivealtruism.org/funds/transformative-ai>,
  <https://funds.effectivealtruism.org/funds/far-future>,
  <https://forum.effectivealtruism.org/posts/dYuNi5Rh68o9YKstg/ea-funds-is-launching-the-transformative-ai-fund>,
  <https://forum.effectivealtruism.org/posts/Xfon9oxyMFv47kFnc/some-concerns-about-policy-work-funding-and-the-long-term>
- Coefficient Giving:
  <https://coefficientgiving.org/funds/navigating-transformative-ai/funding-for-work-that-builds-capacity-to-address-risks-from-transformative-ai/>,
  <https://www.effectivealtruism.org/opportunities/recTVSiPgDoRHKJrz>
- SFF: <https://survivalandflourishing.fund/2026/application>
- AI Safety Fund: <https://www.frontiermodelforum.org/ai-safety-fund/>
- FLI: <https://futureoflife.org/grant-program/>
- Emergent Ventures: <https://www.mercatus.org/emergent-ventures>,
  <https://hub.causo.ai/guides/how-to-apply-to-emergent-ventures-2026>
- grantmaking.ai: <https://grantmaking.ai>,
  <https://forum.effectivealtruism.org/posts/AnMtdJfDym8bGjPB2/usd1m-ai-x-risk-grant-round-is-live-on-grantmaking-ai-apply>
- Lightspeed Grants: <https://www.lesswrong.com/posts/xQ4ajnzavSgbYiko2>
- Lobby y fundaciones en EE.UU. (contexto general):
  <https://www.irs.gov/charities-non-profits/charitable-organizations/specific-project-grants-lobbying-exception>,
  <https://afj.org/resource-library/the-project-grant-rule/>
