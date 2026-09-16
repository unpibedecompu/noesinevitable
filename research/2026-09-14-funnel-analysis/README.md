# Análisis de embudo — 13/14 de septiembre 2026

Contexto: reel de lanzamiento publicado la noche del 2026-09-12
(@unpibedecompu). Estas son las primeras ~36hs de tráfico real post-reel,
leídas del dashboard de Umami Cloud (`lucasvitali001@gmail.com`, sitio
`contacta-representante-latam`). Capturas: [`umami-2026-09-13.jpg`](./umami-2026-09-13.jpg)
(evento por evento, todo el día 13) y [`umami-2026-09-14.jpg`](./umami-2026-09-14.jpg)
(evento por evento, día 14 parcial hasta las 13:05).

## Data cruda

| Evento | 13/09 | 14/09 (parcial) |
|---|---:|---:|
| step_viewed | 29 | 10 |
| email_client_opened | 25 | 31 |
| region_selected | 14 | 4 |
| view_representatives_clicked | 12 | 4 |
| message_generated | 11 | 4 |
| country_selected | 4 | 2 |
| step_back_clicked | 4 | — |
| body_edited | 3 | — |
| finish_clicked | 2 | 2 |
| course_clicked | 1 | 0 |
| social_link_clicked | — | 1 |
| shared | 0 | 0 |

## Diagnóstico

El hallazgo principal: **`finish_clicked` = 4 en total vs. `email_client_opened`
= 56 en total** (~14x de diferencia). El Paso 4 (pantalla de confirmación) es
donde viven tanto la sección de cursos de BlueDot como los botones de
compartir (`components/ContactForm.tsx`, antes de este cambio: líneas
554-700) — y casi nadie llega ahí. Eso solo explica por qué `course_clicked`
está en 1 y `shared` en 0 pese a decenas de personas interactuando de verdad
con la acción principal (abrir el compositor de mail).

Mecanismo más probable: en el Paso 3, "Enviar con Gmail/Outlook" es un
`<a>` que en mobile hace deep-link a la app nativa (rama `isMobile` en
`ContactForm.tsx`). La mayoría del tráfico de un reel es mobile. El usuario
sale de la pestaña del navegador para mandar el mail y no vuelve a tocar
"Terminé →" — abandono clásico por cambio de app, no falta de interés. De
los pocos que sí llegan al Paso 4, ~1 de cada 4 clickea un curso — una tasa
razonable, lo cual confirma que el problema es de **exposición**, no de que
la sección de cursos no convenza.

## Decisiones tomadas a partir de esto (ver commits en esta rama)

1. **No avanzar de paso automáticamente.** El dueño del proyecto quiere que
   la gente pueda mandarle mail a varios representantes seguidos — un
   auto-advance a la confirmación después del primer envío iría en contra
   de eso.
2. Mostrar cursos + compartir también en el Paso 3 (no sólo detrás de
   "Terminé"), en formato discreto para no competir con la acción principal
   (mandar mails).
3. Señal de "terminé" más liviana: botón "Ya lo mandé" junto al fallback de
   copiar mensaje, en vez de depender sólo del botón "Terminé →" al fondo.
4. En la sección de cursos, un solo CTA primario ("El futuro de la IA" — el
   punto de entrada sin requisitos técnicos que marca `PROJECT_ESSENCE.md`)
   en vez de tres tarjetas con igual peso visual, más el idioma (inglés)
   aclarado antes del click, no después.
5. Evento nuevo `email_sent_confirmed` — señal más real que
   `email_client_opened` (que sólo prueba que se abrió el compositor, no
   que se mandó).

## Caveat pendiente (no resuelto por estas capturas)

Estas capturas muestran totales por *nombre* de evento, no por la propiedad
`step` (no dicen cuánta gente entra al sitio y nunca llega a completar el
Paso 1), ni el total de pageviews del período. Para ver el techo real del
embudo (visitas → Paso 1 completado) hace falta: overview de pageviews de
Umami para el mismo rango, o abrir el evento `step_viewed` en el dashboard
de Umami y mirar su desglose por propiedad `step` (Umami lo muestra al
clickear el evento en la lista). Pendiente.
