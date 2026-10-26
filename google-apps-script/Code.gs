/**
 * El Arquitecto de Bits · Registro en vivo con Google Sheets
 *
 * Recibe los eventos que envía la aplicación (index.html) y los organiza en hojas:
 *   Panel · Estudiantes · Eventos · Respuestas · Misiones · Cuestionarios · Retos · Instrucciones
 *
 * Instalación (una sola vez):
 *   1. Abre la hoja de cálculo → Extensiones → Apps Script. Pega este archivo como Code.gs y guarda.
 *   2. Ejecuta la función configurarHoja y acepta los permisos.
 *   3. Implementar → Nueva implementación → Tipo: Aplicación web.
 *      Ejecutar como: «Yo». Quién tiene acceso: «Cualquier usuario».
 *   4. Copia la URL que termina en /exec y pégala en la aplicación (modo profesor → ☁ Registro en vivo).
 *
 * Opcional: menú «🎓 Arquitecto de Bits → Definir clave del curso» para rechazar envíos sin la clave.
 * Si cambias este código, crea una nueva versión en Implementar → Gestionar implementaciones.
 */

const APP_ID = 'arquitecto-de-bits';
const MAX_EVENTOS_POR_ENVIO = 100;
const MINUTOS_EN_LINEA = 5;

const ESCENAS = [
  ['U1.1', 'Bits y números'], ['U1.2', 'Componentes digitales'], ['U1.3', 'Moore y FPGA'],
  ['U2.1', 'Operaciones de la ALU'], ['U2.2', 'ALU en FPGA'], ['U2.3', 'CPU y buses'],
  ['U3.1', 'Entrada y salida'], ['U3.2', 'Polling, INT y DMA'], ['U3.3', 'Protocolos y dúplex'],
  ['U4.1', 'Tipos de memoria'], ['U4.2', 'Jerarquía y caché'], ['U4.3', 'Memoria embebida'],
  ['U5.1', 'Comparar arquitecturas'], ['U5.2', 'Rendimiento y energía'],
  ['U6.1', 'PIC: ADC, GPIO y timer'], ['U6.2', 'IoT y riego inteligente'], ['U7.0', 'El ciclo de instrucción']
];

const RETOS = {
  binario: 'Binario relámpago', puertas: 'Puertas en acción', alu: 'Banderas de la ALU',
  cache: '¿HIT o MISS?', rendimiento: 'Velocidad y Amdahl', mcu: 'Microcontrolador en acción'
};

const TIPOS = {
  ingreso_estudiante: 'Ingreso', vista: 'Navegación', simulacion_ajuste: 'Ajuste en simulación',
  simulacion_accion: 'Acción en simulación', mision_lograda: 'Misión lograda', respuesta: 'Respuesta',
  cuestionario_completado: 'Cuestionario completado', cuestionario_reintento: 'Reintento de cuestionario',
  reinicio_simulacion: 'Reinicio de simulación', reinicio_progreso: 'Reinicio de progreso',
  insignia: 'Insignia', nivel: 'Subida de nivel', chat_pregunta: 'Pregunta a Bit',
  reto_inicio: 'Inicio de reto', reto_respuesta: 'Respuesta en reto', reto_fin: 'Fin de reto',
  regreso: 'Regreso a la pestaña', sesion_fin: 'Fin de sesión', prueba: 'Prueba de conexión'
};

const HOJAS = {
  eventos: {
    nombre: 'Eventos', color: '#4f46e5',
    columnas: ['Fecha y hora', 'Fecha en el dispositivo', 'Curso', 'Estudiante', 'Clave del estudiante',
      'Tipo de evento', 'Escena', 'Título de la escena', 'Fase', 'Vista', 'Acción', 'Valor', '¿Correcto?',
      'Puntaje', 'XP', 'Nivel', 'Escenas completadas', 'Misiones', 'Insignias', 'Detalle', 'Sesión',
      'Dispositivo', 'Versión', 'ID del evento'],
    anchos: [150, 150, 130, 190, 160, 170, 70, 170, 100, 90, 150, 220, 80, 70, 60, 55, 90, 70, 70, 320, 120, 200, 60, 120]
  },
  estudiantes: {
    nombre: 'Estudiantes', color: '#0ea5e9',
    columnas: ['Estudiante', 'Clave del estudiante', 'Curso', 'Primera conexión', 'Última actividad', 'Estado',
      'Escena actual', 'Escenas completadas', 'Misiones logradas', 'Respuestas', 'Aciertos', '% de aciertos',
      'XP', 'Nivel', 'Insignias', 'Rondas de retos', 'Mejor puntaje en retos', 'Preguntas a Bit', 'Eventos',
      'Último dispositivo'],
    anchos: [200, 170, 140, 150, 150, 150, 100, 100, 100, 90, 80, 90, 70, 60, 75, 90, 110, 100, 75, 220]
  },
  respuestas: {
    nombre: 'Respuestas', color: '#8b5cf6',
    columnas: ['Fecha y hora', 'Curso', 'Estudiante', 'Origen', 'Escena o reto', 'Pregunta', 'Respuesta elegida',
      'Respuesta correcta', '¿Correcta?', 'Clave del estudiante'],
    anchos: [150, 130, 190, 110, 150, 420, 200, 200, 85, 160]
  },
  misiones: {
    nombre: 'Misiones', color: '#10b981',
    columnas: ['Fecha y hora', 'Curso', 'Estudiante', 'Escena', 'Título de la escena', 'Misión', 'Clave del estudiante'],
    anchos: [150, 130, 190, 70, 190, 320, 160]
  },
  cuestionarios: {
    nombre: 'Cuestionarios', color: '#f59e0b',
    columnas: ['Fecha y hora', 'Curso', 'Estudiante', 'Escena', 'Título de la escena', 'Puntaje (de 5)', 'Resultado', 'Clave del estudiante'],
    anchos: [150, 130, 190, 70, 190, 100, 110, 160]
  },
  retos: {
    nombre: 'Retos', color: '#ec4899',
    columnas: ['Fecha y hora', 'Curso', 'Estudiante', 'Reto', 'Modo', 'Puntaje', 'Aciertos', 'Intentos',
      'Precisión', 'Mejor racha', 'Duración (s)', '¿Récord?', 'Clave del estudiante'],
    anchos: [150, 130, 190, 190, 110, 70, 70, 70, 80, 85, 90, 80, 160]
  }
};

/* ------------------------------------------------------------------ aplicación web */

function doPost(e) {
  try {
    const datos = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (datos.app !== APP_ID) return respuesta_({ok: false, error: 'Aplicación desconocida'});
    if (!claveValida_(datos.clave)) return respuesta_({ok: false, error: 'Clave del curso incorrecta'});
    const eventos = (Array.isArray(datos.eventos) ? datos.eventos : [])
      .filter(ev => ev && typeof ev === 'object' && ev.id)
      .slice(0, MAX_EVENTOS_POR_ENVIO);
    if (!eventos.length) return respuesta_({ok: true, recibidos: 0});

    const lock = LockService.getScriptLock();
    lock.waitLock(25000);
    let nuevos;
    try {
      // Un reintento del navegador puede reenviar eventos ya guardados: se descartan por su ID.
      const cache = CacheService.getScriptCache();
      const vistos = cache.getAll(eventos.map(ev => 'ev:' + ev.id));
      nuevos = eventos.filter(ev => !vistos['ev:' + ev.id]);
      if (nuevos.length) {
        registrar_(nuevos, datos);
        const marcas = {};
        nuevos.forEach(ev => { marcas['ev:' + ev.id] = '1'; });
        cache.putAll(marcas, 21600);
      }
    } finally {
      lock.releaseLock();
    }
    return respuesta_({ok: true, recibidos: nuevos.length, duplicados: eventos.length - nuevos.length});
  } catch (err) {
    return respuesta_({ok: false, error: String((err && err.message) || err)});
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!claveValida_(p.clave)) return respuesta_({ok: false, error: 'Clave del curso incorrecta'});
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName(HOJAS.eventos.nombre);
  return respuesta_({
    ok: true,
    app: APP_ID,
    hoja: ss.getName(),
    eventos: hoja ? Math.max(0, hoja.getLastRow() - 1) : 0,
    mensaje: p.accion === 'ping' ? 'Conexión correcta' : 'Registro en vivo de El Arquitecto de Bits activo'
  });
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function claveValida_(clave) {
  const esperada = PropertiesService.getScriptProperties().getProperty('CLAVE');
  return !esperada || String(clave || '') === esperada;
}

/* ------------------------------------------------------------------ registro */

function registrar_(eventos, datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ahora = new Date();
  const filas = {eventos: [], respuestas: [], misiones: [], cuestionarios: [], retos: []};

  eventos.forEach(ev => {
    const curso = texto_(ev.curso || datos.curso);
    const fecha = fecha_(ev.fecha_cliente) || ahora;
    const tipo = String(ev.tipo || '');
    const detalle = json_(ev.detalle);
    filas.eventos.push([ahora, fecha, curso, texto_(ev.estudiante), texto_(ev.clave_estudiante),
      TIPOS[tipo] || texto_(tipo), texto_(ev.escena), texto_(ev.titulo_escena), texto_(ev.fase), texto_(ev.vista),
      texto_(ev.accion), texto_(ev.valor), texto_(ev.correcto), numero_(ev.puntaje), numero_(ev.xp),
      numero_(ev.nivel), numero_(ev.escenas_completadas), numero_(ev.misiones), numero_(ev.insignias),
      texto_(ev.detalle), texto_(ev.sesion), texto_(ev.dispositivo), texto_(ev.version), texto_(ev.id)]);

    if (tipo === 'respuesta' || tipo === 'reto_respuesta') {
      const reto = tipo === 'reto_respuesta';
      filas.respuestas.push([fecha, curso, texto_(ev.estudiante), reto ? 'Zona de retos' : 'Cuestionario',
        reto ? texto_(RETOS[ev.accion] || ev.accion) : texto_(ev.escena),
        texto_(reto ? [detalle.tema, detalle.ejercicio].filter(Boolean).join(' · ') : detalle.pregunta),
        texto_(ev.valor), texto_(detalle.correcta), texto_(ev.correcto), texto_(ev.clave_estudiante)]);
    }
    if (tipo === 'mision_lograda') {
      filas.misiones.push([fecha, curso, texto_(ev.estudiante), texto_(ev.escena), texto_(ev.titulo_escena),
        texto_(ev.valor), texto_(ev.clave_estudiante)]);
    }
    if (tipo === 'cuestionario_completado') {
      filas.cuestionarios.push([fecha, curso, texto_(ev.estudiante), texto_(ev.escena), texto_(ev.titulo_escena),
        numero_(ev.puntaje), ev.correcto === 'Sí' ? 'Aprobado' : 'Por repetir', texto_(ev.clave_estudiante)]);
    }
    if (tipo === 'reto_fin') {
      filas.retos.push([fecha, curso, texto_(ev.estudiante), texto_(RETOS[ev.accion] || ev.accion), texto_(ev.valor),
        numero_(ev.puntaje), numero_(detalle.aciertos), numero_(detalle.intentos),
        detalle.precision === undefined ? '' : Number(detalle.precision) / 100, numero_(detalle.mejor_racha),
        numero_(detalle.duracion_s), detalle.record ? 'Sí' : 'No', texto_(ev.clave_estudiante)]);
    }
  });

  Object.keys(filas).forEach(clave => agregar_(ss, HOJAS[clave], filas[clave]));
  actualizarEstudiantes_(ss, eventos, ahora, datos);
}

function agregar_(ss, def, filas) {
  if (!filas.length) return;
  const hoja = asegurarHoja_(ss, def);
  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, def.columnas.length).setValues(filas);
}

function actualizarEstudiantes_(ss, eventos, ahora, datos) {
  const def = HOJAS.estudiantes;
  const hoja = asegurarHoja_(ss, def);
  const porEstudiante = {};
  eventos.forEach(ev => {
    const clave = String(ev.clave_estudiante || '').trim();
    if (!clave || ev.tipo === 'prueba') return;
    (porEstudiante[clave] = porEstudiante[clave] || []).push(ev);
  });
  const claves = Object.keys(porEstudiante);
  if (!claves.length) return;

  const total = Math.max(0, hoja.getLastRow() - 1);
  const existentes = total ? hoja.getRange(2, 2, total, 1).getValues().map(r => String(r[0])) : [];
  const n = def.columnas.length;

  claves.forEach(clave => {
    const lista = porEstudiante[clave];
    let fila = existentes.indexOf(clave) + 2;
    let actual;
    if (fila >= 2) {
      actual = hoja.getRange(fila, 1, 1, n).getValues()[0];
    } else {
      fila = hoja.getLastRow() + 1;
      existentes.push(clave);
      actual = new Array(n).fill('');
      actual[3] = ahora;
      [7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18].forEach(i => { actual[i] = 0; });
    }
    lista.forEach(ev => {
      actual[0] = texto_(ev.estudiante) || actual[0];
      actual[1] = texto_(clave);
      actual[2] = texto_(ev.curso || datos.curso) || actual[2];
      actual[4] = ahora;
      if (ev.escena) actual[6] = texto_(ev.escena + ' · ' + (ev.titulo_escena || ''));
      if (ev.escenas_completadas !== '' && ev.escenas_completadas !== undefined) actual[7] = numero_(ev.escenas_completadas);
      if (ev.misiones !== '' && ev.misiones !== undefined) actual[8] = numero_(ev.misiones);
      if (ev.tipo === 'respuesta') {
        actual[9] = (Number(actual[9]) || 0) + 1;
        if (ev.correcto === 'Sí') actual[10] = (Number(actual[10]) || 0) + 1;
      }
      if (ev.xp !== '' && ev.xp !== undefined) actual[12] = numero_(ev.xp);
      if (ev.nivel !== '' && ev.nivel !== undefined) actual[13] = numero_(ev.nivel);
      if (ev.insignias !== '' && ev.insignias !== undefined) actual[14] = numero_(ev.insignias);
      if (ev.tipo === 'reto_fin') {
        actual[15] = (Number(actual[15]) || 0) + 1;
        actual[16] = Math.max(Number(actual[16]) || 0, Number(ev.puntaje) || 0);
      }
      if (ev.tipo === 'chat_pregunta') actual[17] = (Number(actual[17]) || 0) + 1;
      if (ev.tipo === 'reinicio_progreso') { actual[7] = 0; actual[8] = 0; }
      actual[18] = (Number(actual[18]) || 0) + 1;
      actual[19] = texto_(ev.dispositivo) || actual[19];
    });
    // Las columnas F y L son fórmulas. setFormula usa la sintaxis en inglés en cualquier configuración regional.
    hoja.getRange(fila, 1, 1, 5).setValues([actual.slice(0, 5)]);
    hoja.getRange(fila, 7, 1, 5).setValues([actual.slice(6, 11)]);
    hoja.getRange(fila, 13, 1, n - 12).setValues([actual.slice(12)]);
    hoja.getRange(fila, 6).setFormula('=IF(E' + fila + '="","",IF(NOW()-E' + fila + '<' + MINUTOS_EN_LINEA + '/1440,"🟢 En línea",IF(NOW()-E' + fila + '<1/24,"🟡 Activo hace poco","⚪ Inactivo")))');
    hoja.getRange(fila, 12).setFormula('=IF(J' + fila + '=0,"",K' + fila + '/J' + fila + ')');
  });
}

/* ------------------------------------------------------------------ utilidades */

// Evita que un texto escrito por un estudiante se interprete como fórmula.
function texto_(v) {
  if (v === null || v === undefined) return '';
  const s = String(v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function numero_(v) {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(v);
  return isFinite(n) ? n : texto_(v);
}
function fecha_(v) {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d.getTime()) ? d : null;
}
function json_(v) {
  if (!v) return {};
  if (typeof v === 'object') return v;
  try { return JSON.parse(v) || {}; } catch (e) { return {}; }
}

function asegurarHoja_(ss, def) {
  let hoja = ss.getSheetByName(def.nombre);
  if (!hoja) {
    hoja = ss.insertSheet(def.nombre);
    formatearHoja_(hoja, def);
  }
  return hoja;
}

function formatearHoja_(hoja, def) {
  const n = def.columnas.length;
  if (hoja.getMaxColumns() < n) hoja.insertColumnsAfter(hoja.getMaxColumns(), n - hoja.getMaxColumns());
  hoja.getRange(1, 1, 1, n).setValues([def.columnas])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground(def.color)
    .setVerticalAlignment('middle').setWrap(true);
  hoja.setFrozenRows(1);
  hoja.setRowHeight(1, 38);
  hoja.setTabColor(def.color);
  def.anchos.forEach((w, i) => hoja.setColumnWidth(i + 1, w));
  const filas = Math.max(1, hoja.getMaxRows() - 1);
  def.columnas.forEach((c, i) => {
    const rango = hoja.getRange(2, i + 1, filas, 1);
    if (/^Fecha|conexión|actividad/.test(c)) rango.setNumberFormat('yyyy-mm-dd hh:mm:ss');
    if (/^% |^Precisión/.test(c)) rango.setNumberFormat('0%');
  });
  if (!hoja.getBandings().length) {
    hoja.getRange(1, 1, hoja.getMaxRows(), n)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
      .setHeaderRowColor(def.color);
  }
}

/* ------------------------------------------------------------------ configuración y menú */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🎓 Arquitecto de Bits')
    .addItem('Configurar o reparar las hojas', 'configurarHoja')
    .addItem('Definir clave del curso', 'definirClave')
    .addItem('Insertar un evento de prueba', 'insertarPrueba')
    .addItem('Borrar las filas de prueba', 'borrarPruebas')
    .addSeparator()
    .addItem('Cómo publicar la aplicación web', 'mostrarAyuda')
    .addToUi();
}

/** Crea o repara todas las hojas, formatos y el Panel. Se puede ejecutar varias veces sin perder datos. */
function configurarHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(Session.getScriptTimeZone() || 'America/Bogota');
  try { ss.setRecalculationInterval(SpreadsheetApp.RecalculationInterval.MINUTE); } catch (e) {}
  Object.keys(HOJAS).forEach(k => {
    const def = HOJAS[k];
    const hoja = ss.getSheetByName(def.nombre) || ss.insertSheet(def.nombre);
    formatearHoja_(hoja, def);
  });
  construirPanel_(ss);
  construirInstrucciones_(ss);
  const vacia = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja1');
  if (vacia && vacia.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(vacia);
  ordenar_(ss);
  try { SpreadsheetApp.getUi().alert('Listo: las hojas están configuradas. Ahora publica la aplicación web (menú 🎓 → Cómo publicar).'); } catch (e) {}
}

function ordenar_(ss) {
  ['Panel', 'Estudiantes', 'Eventos', 'Respuestas', 'Misiones', 'Cuestionarios', 'Retos', 'Instrucciones'].forEach((nombre, i) => {
    const hoja = ss.getSheetByName(nombre);
    if (hoja) { ss.setActiveSheet(hoja); ss.moveActiveSheet(i + 1); }
  });
  ss.setActiveSheet(ss.getSheetByName('Panel'));
}

function construirPanel_(ss) {
  const hoja = ss.getSheetByName('Panel') || ss.insertSheet('Panel', 0);
  hoja.clear();
  hoja.getCharts().forEach(c => hoja.removeChart(c));
  hoja.setTabColor('#111827');
  hoja.setHiddenGridlines(true);
  [230, 130, 130, 130, 130, 140, 30, 220, 90, 90, 120].forEach((w, i) => hoja.setColumnWidth(i + 1, w));

  hoja.getRange('A1').setValue('🎓 El Arquitecto de Bits · Panel del aula en vivo')
    .setFontSize(20).setFontWeight('bold').setFontColor('#4f46e5');
  hoja.getRange('A2').setFormula('="Actualizado: "&TEXT(NOW(),"yyyy-mm-dd hh:mm")&" · Estado en línea = actividad en los últimos ' + MINUTOS_EN_LINEA + ' minutos"')
    .setFontColor('#6b7280');

  const tarjetas = [
    ['Estudiantes registrados', '=COUNTA(Estudiantes!B2:B)'],
    ['En línea ahora', '=COUNTIF(Estudiantes!E2:E,">"&(NOW()-' + MINUTOS_EN_LINEA + '/1440))'],
    ['Eventos de hoy', '=COUNTIF(Eventos!A2:A,">="&TODAY())'],
    ['Misiones logradas', '=COUNTA(Misiones!A2:A)'],
    ['% de aciertos', '=IFERROR(COUNTIF(Respuestas!I2:I,"Sí")/COUNTA(Respuestas!I2:I),"—")'],
    ['Rondas de retos', '=COUNTA(Retos!A2:A)']
  ];
  tarjetas.forEach((t, i) => {
    hoja.getRange(4, i + 1).setValue(t[0]).setFontColor('#6b7280').setFontWeight('bold').setWrap(true);
    hoja.getRange(5, i + 1).setFormula(t[1]).setFontSize(22).setFontWeight('bold').setFontColor('#111827');
  });
  hoja.getRange('E5').setNumberFormat('0%');
  hoja.getRange(4, 1, 2, 6).setBackground('#eef2ff').setHorizontalAlignment('center').setVerticalAlignment('middle');
  hoja.setRowHeight(5, 44);

  hoja.getRange('A7').setValue('Avance por escena').setFontSize(14).setFontWeight('bold').setFontColor('#4f46e5');
  hoja.getRange(8, 1, 1, 6).setValues([['Escena', 'Misiones logradas', 'Cuestionarios', 'Aprobados', 'Promedio (de 5)', '% de aciertos']])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#4f46e5').setWrap(true);
  ESCENAS.forEach((e, i) => {
    const r = 9 + i, code = e[0];
    hoja.getRange(r, 1).setValue(code + ' · ' + e[1]);
    hoja.getRange(r, 2, 1, 5).setFormulas([[
      '=COUNTIF(Misiones!D2:D,"' + code + '")',
      '=COUNTIF(Cuestionarios!D2:D,"' + code + '")',
      '=COUNTIFS(Cuestionarios!D2:D,"' + code + '",Cuestionarios!G2:G,"Aprobado")',
      '=IFERROR(AVERAGEIF(Cuestionarios!D2:D,"' + code + '",Cuestionarios!F2:F),"")',
      '=IFERROR(COUNTIFS(Respuestas!E2:E,"' + code + '",Respuestas!I2:I,"Sí")/COUNTIF(Respuestas!E2:E,"' + code + '"),"")'
    ]]);
  });
  hoja.getRange(9, 5, ESCENAS.length, 1).setNumberFormat('0.0');
  hoja.getRange(9, 6, ESCENAS.length, 1).setNumberFormat('0%');
  hoja.getRange(9, 2, ESCENAS.length, 5).setHorizontalAlignment('center');
  const reglaVerde = SpreadsheetApp.newConditionalFormatRule().setGradientMaxpoint('#10b981').setGradientMidpointWithValue('#fde68a', SpreadsheetApp.InterpolationType.PERCENT, '50').setGradientMinpoint('#fecaca').setRanges([hoja.getRange(9, 6, ESCENAS.length, 1)]).build();
  hoja.setConditionalFormatRules([reglaVerde]);

  hoja.getRange('H4').setValue('🏆 Top 10 por XP').setFontSize(14).setFontWeight('bold').setFontColor('#4f46e5');
  hoja.getRange('H5:K5').setValues([['Estudiante', 'XP', 'Nivel', 'Escenas']]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#8b5cf6');
  hoja.getRange('H6').setFormula('=IFERROR(SORTN(FILTER({Estudiantes!A2:A,Estudiantes!M2:M,Estudiantes!N2:N,Estudiantes!H2:H},Estudiantes!A2:A<>""),10,0,2,FALSE),"Sin datos todavía")');

  hoja.getRange('H18').setValue('⚡ Últimos eventos').setFontSize(14).setFontWeight('bold').setFontColor('#4f46e5');
  hoja.getRange('H19:K19').setValues([['Estudiante', 'Evento', 'Escena', 'Valor']]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#0ea5e9');
  hoja.getRange('H20').setFormula('=IFERROR(QUERY(Eventos!A2:L,"select D, F, G, L where A is not null order by A desc limit 15",0),"Sin eventos todavía")');

  const grafico = hoja.newChart().asColumnChart()
    .addRange(hoja.getRange(8, 1, ESCENAS.length + 1, 1))
    .addRange(hoja.getRange(8, 6, ESCENAS.length + 1, 1))
    .setNumHeaders(1)
    .setTitle('% de aciertos por escena')
    .setColors(['#8b5cf6'])
    .setLegendPosition(Charts.Position.NONE)
    .setPosition(27, 1, 0, 10)
    .setOption('width', 760).setOption('height', 300)
    .setOption('vAxis.format', 'percent')
    .setOption('vAxis.viewWindow.min', 0)
    .setOption('vAxis.viewWindow.max', 1)
    .build();
  hoja.insertChart(grafico);
}

function construirInstrucciones_(ss) {
  const hoja = ss.getSheetByName('Instrucciones') || ss.insertSheet('Instrucciones');
  hoja.clear();
  hoja.setTabColor('#6b7280');
  hoja.setColumnWidth(1, 40);
  hoja.setColumnWidth(2, 820);
  const pasos = [
    ['', '🎓 El Arquitecto de Bits · Registro en vivo'],
    ['', 'Esta hoja recibe en tiempo real las interacciones de los estudiantes con la aplicación.'],
    ['1', 'Extensiones → Apps Script. Pega el archivo Code.gs del repositorio y guarda.'],
    ['2', 'Ejecuta la función configurarHoja (o usa el menú 🎓 → Configurar o reparar las hojas) y acepta los permisos.'],
    ['3', 'Implementar → Nueva implementación → Aplicación web. Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.'],
    ['4', 'Copia la URL que termina en /exec. En la aplicación entra como profesor y pulsa ☁ Conectar hoja.'],
    ['5', 'Pega la URL, prueba la conexión y guarda. Reparte el enlace para estudiantes o descarga la aplicación ya configurada.'],
    ['🔐', 'Opcional: menú 🎓 → Definir clave del curso. La misma clave debe escribirse en la aplicación.'],
    ['ℹ️', 'Panel: resumen y ranking · Estudiantes: una fila por estudiante · Eventos: todo lo que ocurre · Respuestas, Misiones, Cuestionarios y Retos: detalles por tipo.'],
    ['⚖️', 'Informa a tus estudiantes que sus interacciones se registran. La aplicación lo indica en la pantalla de ingreso y en el chat.']
  ];
  hoja.getRange(1, 1, pasos.length, 2).setValues(pasos).setWrap(true).setVerticalAlignment('top');
  hoja.getRange('B1').setFontSize(18).setFontWeight('bold').setFontColor('#4f46e5');
  hoja.getRange(3, 1, pasos.length - 2, 1).setFontWeight('bold').setHorizontalAlignment('center').setFontColor('#8b5cf6');
}

function definirClave() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Clave del curso', 'Escribe una clave para aceptar solo envíos de tu curso (déjala vacía para quitarla):', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const clave = r.getResponseText().trim();
  const props = PropertiesService.getScriptProperties();
  if (clave) props.setProperty('CLAVE', clave); else props.deleteProperty('CLAVE');
  ui.alert(clave ? 'Clave guardada. Escríbela también en la aplicación (modo profesor → ☁ Registro en vivo).' : 'Clave eliminada: se aceptan envíos sin clave.');
}

function insertarPrueba() {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    registrar_([{id: Utilities.getUuid(), fecha_cliente: new Date().toISOString(), tipo: 'prueba', estudiante: 'Prueba del profesor',
      clave_estudiante: 'prueba-del-profesor', accion: 'evento de prueba', valor: 'Insertado desde el menú', version: 'Apps Script'}], {});
  } finally {
    lock.releaseLock();
  }
  try { SpreadsheetApp.getUi().alert('Se agregó una fila de prueba en Eventos.'); } catch (e) {}
}

function borrarPruebas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName(HOJAS.eventos.nombre);
  if (!hoja || hoja.getLastRow() < 2) return;
  const valores = hoja.getRange(2, 4, hoja.getLastRow() - 1, 1).getValues();
  for (let i = valores.length - 1; i >= 0; i--) {
    if (valores[i][0] === 'Prueba del profesor') hoja.deleteRow(i + 2);
  }
  try { SpreadsheetApp.getUi().alert('Filas de prueba eliminadas.'); } catch (e) {}
}

function mostrarAyuda() {
  SpreadsheetApp.getUi().alert('Publicar la aplicación web',
    '1. Implementar → Nueva implementación.\n2. Tipo: Aplicación web.\n3. Ejecutar como: Yo.\n4. Quién tiene acceso: Cualquier usuario.\n5. Copia la URL que termina en /exec y pégala en la aplicación (modo profesor → ☁ Conectar hoja).\n\nSi cambias el código, usa Gestionar implementaciones → Editar → Nueva versión.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}
