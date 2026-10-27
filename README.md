# El Arquitecto de Bits · Arquitectura de Computadoras

Aplicación web lúdica e interactiva para aprender Arquitectura de Computadoras: **17 laboratorios**, **51 misiones**, **85 preguntas**, **16 insignias** y **10 niveles**. Todo cabe en un único archivo, `index.html`, escrito por completo en **Times New Roman**, que también funciona sin conexión.

Diseño de referencia: **Aslin Gonzalo Botello Plata**. Adaptación didáctica de *El Detective de Datos*.

## Cómo usarla

1. Abre `index.html` en un navegador actualizado (Chrome, Edge, Firefox o Safari), sin instalar nada.
2. **Soy estudiante:** escribe nombre y apellido. Cada escena tiene tres fases, **Aprende → Experimenta → Comprueba**. Con las tres misiones y al menos 4 de 5 aciertos se abre la escena siguiente.
3. **Soy profesor:** pide la contraseña de profesor (la conoce el docente; no se publica en este repositorio). Abre todas las escenas, el modo presentación y el acceso a la hoja de registro. Las demostraciones del profesor no generan filas en la hoja.

Para publicarla en internet: en GitHub, *Settings → Pages → Deploy from a branch*, elige la rama y la carpeta raíz. Quedará en `https://<usuario>.github.io/Temas-Arquitectura-Computadora/`.

> La contraseña de profesor se guarda como huella SHA-256 y se comprueba en el navegador. Basta para el aula, pero no es seguridad de servidor: alguien con conocimientos técnicos podría saltársela leyendo el código.

## Novedades de la sexta edición

| Área | Mejora |
| --- | --- |
| Juego | Niveles del 1 («Chispa curiosa») al 10 («Arquitecto de Bits»), XP en la barra superior, rachas 🔥, 16 insignias, confeti, sonidos sintetizados (se silencian con 🔊) y reacciones de Bit. |
| Simulaciones | Los indicadores que cambian se resaltan con una animación; las ilustraciones y la ruta tienen movimiento sutil (se desactiva con «reducir movimiento» del sistema). |
| Ley de Moore | Gráfica con escala **lineal o logarítmica** a elección y una segunda gráfica con chips reales (Intel 4004 → Apple M2 Ultra) frente a la regla de duplicación. |
| Diseño | Paleta más colorida con degradados, tipografía única Times New Roman, tema claro u oscuro y diseño adaptado a celulares. |
| Profesor | Acceso con contraseña y panel con el estado del registro y un botón para abrir la hoja. |
| Seguimiento | Registro **en tiempo real en Google Sheets** de cada interacción del estudiante, ya integrado en la aplicación (ver abajo). |
| Bitácora | Muestra nivel y colección de insignias; la descarga JSON incluye ese resumen. |
| Bit con IA | El chat responde con **DeepSeek**, con el contexto de la escena, las misiones y el simulador; da pistas en lugar de soluciones durante la evaluación. Sin conexión vuelve a su base didáctica. |

## Correcciones de contenido

- **Ley de Moore (matemática y gráfica):** las barras usaban una altura `15 + 1,8·factor`, que no era ni lineal ni logarítmica: 1× y 64× parecían casi iguales. Ahora la altura es proporcional al factor (lineal) o a su logaritmo (logarítmica).
- **Ley de Moore (consistencia):** el concepto partía de 1 000 transistores y el simulador de 1 millón; ahora ambos usan 1 millón y se explica la fórmula 2^(n/2). Se añadió la historia: Gordon Moore propuso en 1965 una duplicación anual y en 1975 la ajustó a cada dos años.
- **Rendimiento y energía:** la escena se llamaba así pero no explicaba la energía. Se añadió el concepto de potencia dinámica `P ≈ α·C·V²·f`, el hecho de que bajar solo la frecuencia no ahorra energía en la tarea (`E = P × t`) y el papel de DVFS, más una métrica de potencia relativa y una pregunta frecuente.
- **Humedad del suelo (IoT):** los botones decían «−15 %» y «+15 %», pero el modelo resta y suma **puntos porcentuales**. Ahora dicen «−15 puntos» y «+15 puntos».
- **Gramática:** «un FPGA» → «una FPGA» (*field-programmable gate array*, sustantivo femenino), unificado en todo el texto.
- **Entrada y salida:** se aclara que el 65 del teclado es el código ASCII de la letra «A».
- **Privacidad:** los textos de ingreso y del chat informan que las interacciones se registran en la hoja del profesor.

Se revisaron las cuentas de las 17 escenas, las 85 preguntas, las 51 misiones y el glosario de Bit (conversiones, banderas de la ALU, costos de caché, Amdahl, ADC y temporizador); el resto estaba correcto.

## Registro en tiempo real con Google Sheets

La aplicación trae la dirección del registro escrita en `window.REGISTRO_CONFIG` (último `<script>` de `index.html`). Los estudiantes solo escriben su nombre y todo se guarda solo, sin que el profesor conecte nada.

La hoja «El Arquitecto de Bits · Registro en vivo» tiene estas pestañas:

| Hoja | Contenido |
| --- | --- |
| **Panel** | Estudiantes registrados, en línea ahora, eventos de hoy, misiones, % de aciertos, cuestionarios aprobados, avance por escena, top 10 por XP y últimos eventos. |
| **Estudiantes** | Una fila por estudiante: estado en línea, escena actual, escenas, misiones, respuestas, aciertos, XP, nivel, insignias y preguntas a Bit. |
| **Eventos** | Todo lo que ocurre, con fecha, escena, fase, acción, valor y dispositivo. |
| **Respuestas / Misiones / Cuestionarios** | Detalle por tipo de actividad. |

### Publicación del script

El script ya está publicado como aplicación web desde la hoja (Extensiones → Apps Script) y su URL `/exec` está escrita en `REGISTRO_CONFIG.endpoint`. No hay que repetir nada.

Si algún día cambias `Code.gs`: guarda, entra a **Implementar → Gestionar implementaciones → Editar (lápiz) → Versión: Nueva versión → Implementar**. Así la URL se conserva y la aplicación sigue conectada. Si en cambio creas una implementación nueva, tendrá otra URL y habrá que actualizar `REGISTRO_CONFIG.endpoint`.

Para comprobar que responde, abre en el navegador la URL con `?accion=ping` al final: debe mostrar `"ok":true` y `"Conexión correcta"`.

Opcional: en la hoja, menú **🎓 Arquitecto de Bits → Definir clave del curso**, y escribe la misma clave en `REGISTRO_CONFIG.clave`.

### Cómo funciona

- La aplicación agrupa los eventos y los envía cada pocos segundos. Sin conexión, los guarda en el navegador y los envía al volver la red; al cerrar la pestaña usa `sendBeacon`.
- Cada evento tiene un identificador único: si un reintento llega dos veces, el script lo descarta.
- Los ajustes continuos de un control deslizante se agrupan en un solo evento.
- Los textos que escriben los estudiantes se guardan como texto, nunca como fórmulas.
- Solo se registran las sesiones de estudiantes.
- El indicador **☁** de la barra superior muestra el estado: *En vivo*, *Sincronizando*, *Sin red* o *Revisar registro*.

**Privacidad.** Se registran el nombre que escribe el estudiante y sus interacciones con la aplicación, incluidas las preguntas a Bit y sus respuestas. Las preguntas del chat se envían además a DeepSeek, sin el nombre del estudiante. Infórmalo a tus estudiantes; la aplicación lo avisa en la pantalla de ingreso, en el chat de Bit y con el indicador ☁.

## Bit con inteligencia artificial (DeepSeek)

Bit envía a DeepSeek (modelo `deepseek-chat`) la pregunta, las últimas cuatro preguntas con sus respuestas y el contexto de la escena: objetivo, conceptos, misiones, estado del simulador y, en *Comprueba*, el enunciado de la pregunta en pantalla. El nombre del estudiante no se envía. Las respuestas aparecen palabra por palabra y admiten **negritas**, listas y `código`.

Bit obtiene la respuesta por el primer camino disponible:

1. **Desde el navegador**, con la clave escrita en `window.BIT_IA.clave` (bloque `BIT_IA`, al inicio del último `<script>` de `index.html`).
2. **A través del script de Google** (`Code.gs`), si el navegador no llega a DeepSeek o la página no trae clave. El script usa la clave que envía la página o la guardada con el menú **🎓 Arquitecto de Bits → Activar y probar la IA de Bit (DeepSeek)**, y limita el uso a 12 preguntas por minuto y navegador y a 3 000 por día.
3. **Con la base didáctica** de siempre, si no hay conexión o fallan los dos caminos anteriores. Bit lo avisa en el chat.

> **La clave no está en este repositorio.** El repositorio es público y una clave publicada puede ser usada por cualquiera; además, DeepSeek desactiva las claves que encuentra filtradas. El `index.html` de aquí trae `clave: ''`. La versión con la clave se entrega aparte, para compartirla solo con personas de confianza.

Para que también funcione la versión publicada sin clave (por ejemplo, la de GitHub Pages), activa el segundo camino una sola vez:

1. En la hoja, **Extensiones → Apps Script**: reemplaza `Code.gs` por el de este repositorio. Si ves `appsscript.json`, reemplázalo también: añade el permiso para conectarse a servicios externos.
2. Guarda, recarga la hoja y usa el menú **🎓 Arquitecto de Bits → Activar y probar la IA de Bit (DeepSeek)**. Autoriza el permiso nuevo y pega la clave: se guarda en las propiedades del script, no en la hoja.
3. **Implementar → Gestionar implementaciones → Editar → Versión: Nueva versión → Implementar.** La URL `/exec` no cambia.

En la hoja, cada conversación aparece en **Eventos** como «Pregunta a Bit» y «Respuesta de Bit»; la columna *Acción* indica si respondió DeepSeek o la base didáctica.

## Estructura del repositorio

```
index.html                          Aplicación completa (HTML, CSS y JavaScript en un solo archivo)
google-apps-script/Code.gs          Script de Google Apps Script para el registro en vivo
google-apps-script/appsscript.json  Manifiesto (zona horaria America/Bogota, aplicación web)
```

El historial de git conserva la versión original como primer commit.
