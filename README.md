# El Arquitecto de Bits · Arquitectura de Computadoras

Aplicación web lúdica e interactiva para aprender Arquitectura de Computadoras con **17 laboratorios**, **51 misiones**, **85 preguntas**, **6 retos** con ejercicios generados al azar, **19 insignias** y **10 niveles**. Todo cabe en un único archivo, `index.html`, que también funciona sin conexión.

Diseño de referencia: **Aslin Gonzalo Botello Plata**. Adaptación didáctica de *El Detective de Datos*.

## Cómo usarla

1. Abre `index.html` en un navegador actualizado (Chrome, Edge, Firefox o Safari), sin instalar nada.
2. Elige **Soy estudiante** (recorrido con misiones y evaluación) o **Soy profesor** (todas las escenas abiertas, modo proyección y Zona de retos para la clase).
3. Cada escena tiene tres fases: **Aprende → Experimenta → Comprueba**. Con las tres misiones y al menos 4 de 5 aciertos se abre la escena siguiente.

Para publicarla en internet: en GitHub, *Settings → Pages → Deploy from a branch*, elige la rama y la carpeta raíz. La aplicación quedará en `https://<usuario>.github.io/Temas-Arquitectura-Computadora/`.

## Novedades de la sexta edición

| Área | Mejora |
| --- | --- |
| Juego | Niveles del 1 («Chispa curiosa») al 10 («Arquitecto de Bits»), XP visible en la barra superior, rachas 🔥, 19 insignias, confeti, sonidos sintetizados (se silencian con 🔊) y reacciones de Bit. |
| Zona de retos | 6 juegos: *Binario relámpago*, *Puertas en acción*, *Banderas de la ALU*, *¿HIT o MISS?*, *Velocidad y Amdahl* y *Microcontrolador en acción*. Modo contrarreloj (60 s, con bonificación por racha) y modo práctica (10 ejercicios con explicación). Teclas 1–4 para responder. |
| Simulaciones | Los indicadores que cambian se resaltan con una animación; las escenas, ilustraciones y la ruta tienen movimiento sutil (se desactiva con «reducir movimiento» del sistema). |
| Ley de Moore | Gráfica con escala **lineal o logarítmica** a elección y una segunda gráfica con chips reales (Intel 4004 → Apple M2 Ultra) frente a la regla de duplicación. |
| Diseño | Paleta más colorida con degradados, tipografía moderna (Space Grotesk, Nunito, JetBrains Mono y Barlow Semi Condensed) con opción **Aa** para volver a Times New Roman, tema claro u oscuro y diseño adaptado a celulares. |
| Seguimiento | Registro opcional **en tiempo real en Google Sheets** de cada interacción del estudiante (ver abajo). |
| Bitácora | Muestra nivel, colección de insignias y récords de retos; la descarga JSON incluye ese resumen. |

## Correcciones de contenido

- **Ley de Moore (matemática y gráfica):** las barras usaban una altura `15 + 1,8·factor`, que no era ni lineal ni logarítmica: 1× y 64× parecían casi iguales. Ahora la altura es proporcional al factor (lineal) o a su logaritmo (logarítmica).
- **Ley de Moore (consistencia):** el concepto partía de 1 000 transistores y el simulador de 1 millón; ahora ambos usan 1 millón y se explica la fórmula 2^(n/2). Se añadió la historia: Gordon Moore propuso en 1965 una duplicación anual y en 1975 la ajustó a cada dos años.
- **Rendimiento y energía:** la escena se llamaba así pero no explicaba la energía. Se añadió el concepto de potencia dinámica `P ≈ α·C·V²·f`, el hecho de que bajar solo la frecuencia no ahorra energía en la tarea (`E = P × t`) y el papel de DVFS, más una métrica de potencia relativa y una pregunta frecuente.
- **Humedad del suelo (IoT):** los botones decían «−15 %» y «+15 %», pero el modelo resta y suma **puntos porcentuales**. Ahora dicen «−15 puntos» y «+15 puntos».
- **Gramática:** «un FPGA» → «una FPGA» (*field-programmable gate array*, sustantivo femenino), unificado en todo el texto.
- **Entrada y salida:** se aclara que el 65 del teclado es el código ASCII de la letra «A».
- **Privacidad:** los textos que decían «no se envían datos a servidores» ahora cambian automáticamente cuando el profesor activa el registro en Google Sheets, para informar a los estudiantes con honestidad.

Se revisaron las cuentas de las 17 escenas, las 85 preguntas, las 51 misiones y el glosario de Bit (conversiones, banderas de la ALU, costos de caché, Amdahl, ADC y temporizador); el resto estaba correcto. Los ejercicios de la Zona de retos se verificaron con un programa independiente: 24 000 ejercicios generados, sin ningún error.

## Registro en tiempo real con Google Sheets

La carpeta [`google-apps-script/`](google-apps-script/) contiene `Code.gs`, el script que recibe los eventos y los organiza en estas hojas:

| Hoja | Contenido |
| --- | --- |
| **Panel** | Estudiantes registrados, en línea ahora, eventos de hoy, % de aciertos, avance por escena, top 10 por XP, últimos eventos y gráfico de aciertos. |
| **Estudiantes** | Una fila por estudiante: estado en línea, escena actual, escenas, misiones, aciertos, XP, nivel, insignias, retos y preguntas a Bit. |
| **Eventos** | Todo lo que ocurre, con fecha, escena, fase, acción, valor y dispositivo. |
| **Respuestas / Misiones / Cuestionarios / Retos** | Detalle por tipo de actividad. |

### Instalación (unos 5 minutos)

1. Abre la hoja de cálculo «El Arquitecto de Bits · Registro en vivo» (o una hoja nueva) y entra a **Extensiones → Apps Script**.
2. Pega el contenido de `google-apps-script/Code.gs`, guarda y ejecuta la función **`configurarHoja`**. Acepta los permisos.
3. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier usuario**. Copia la URL que termina en `/exec`.
4. En la aplicación, entra como **profesor** y pulsa **☁ Conectar hoja**. Pega la URL, pulsa **Probar conexión** y luego **Guardar y activar**.
5. Reparte la aplicación de una de estas formas:
   - **Enlace para estudiantes:** si la publicaste en GitHub Pages, el panel genera un enlace con la conexión incluida (`?hoja=…&curso=…`).
   - **Archivo configurado:** pulsa **↓ Descargar aplicación**; el HTML descargado ya incluye la conexión.
   - **En el código:** escribe la URL en `window.REGISTRO_CONFIG` al inicio del último `<script>` de `index.html`.

Opcional: en la hoja, menú **🎓 Arquitecto de Bits → Definir clave del curso**, y escribe la misma clave en la aplicación. Así se rechazan los envíos que no la incluyan.

### Cómo funciona

- La aplicación agrupa los eventos y los envía cada pocos segundos. Sin conexión, los guarda en el navegador y los envía al volver la red; al cerrar la pestaña usa `sendBeacon`.
- Cada evento tiene un identificador único: si un reintento llega dos veces, el script lo descarta.
- Los ajustes continuos de un control deslizante se agrupan en un solo evento, para no llenar la hoja.
- Los textos que escriben los estudiantes se guardan como texto, nunca como fórmulas.
- Solo se registran las sesiones de estudiantes; las demostraciones del profesor no generan filas, salvo la prueba de conexión.
- El indicador **☁** de la barra superior muestra el estado: *En vivo*, *Sincronizando*, *Sin red* o *Revisar registro*.

**Privacidad.** Se registran el nombre que escribe el estudiante y sus interacciones con la aplicación. Informa a tus estudiantes antes de usarla; la aplicación lo avisa en la pantalla de ingreso, en el chat de Bit y con el indicador ☁.

## Estructura del repositorio

```
index.html                     Aplicación completa (HTML, CSS y JavaScript en un solo archivo)
google-apps-script/Code.gs     Script de Google Apps Script para el registro en vivo
google-apps-script/appsscript.json  Manifiesto (zona horaria America/Bogota, aplicación web)
```

El historial de git conserva la versión original como primer commit.
