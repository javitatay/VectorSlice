/**
 * VectorSlice.jsx — SVG → Resolume Arena XML
 *
 * Convierte los paths del documento de Illustrator en un Screen Setup XML
 * importable directamente en Resolume Arena 7.
 *
 * USO:
 *   1) Abre tu documento en Illustrator con los shapes a convertir.
 *   2) File > Scripts > Other Script… > selecciona este archivo.
 *      (O cópialo a la carpeta Presets/[idioma]/Scripts/ para que aparezca
 *       directamente en File > Scripts.)
 *
 * COPIA EN CARPETA DE SCRIPTS:
 *   Mac:     /Applications/Adobe Illustrator [versión]/Presets/en_US/Scripts/
 *   Windows: C:\Program Files\Adobe\Adobe Illustrator [versión]\Presets\en_US\Scripts\
 *
 * Autor: Javier Tatay Rubio · javitatay.github.io
 * Licencia: MIT
 */

#target illustrator
#targetengine "main"

(function () {

  // ── CONFIG ──────────────────────────────────────────────────────────────
  var CONFIG = {
    subdivisions: 8,        // Segmentos por curva Bezier
    outputWidth:  1920,     // Resolución de salida X
    outputHeight: 1080,     // Resolución de salida Y
    saveToResolumeFolder: false  // Si true, guarda directo en presets de Resolume
  };

  var PALETTE = [
    '#3d7a4e','#2c8a5a','#4a9465','#1f6b42',
    '#5aac7a','#327a58','#6bbf8a','#256647',
    '#3d8c60','#4fa070','#28724e','#57b07d'
  ];

  // ── ENTRY POINT ─────────────────────────────────────────────────────────
  if (app.documents.length === 0) {
    alert('VectorSlice\n\nNo hay ningún documento abierto.\nAbre un .ai o .svg con tus shapes y vuelve a ejecutar el script.');
    return;
  }

  var doc = app.activeDocument;

  // Diálogo de opciones
  var opts = showDialog(doc);
  if (!opts) return;  // Usuario canceló

  CONFIG.subdivisions = opts.subs;
  CONFIG.outputWidth  = opts.width;
  CONFIG.outputHeight = opts.height;

  // Recolectar slices
  var slices = collectSlices(doc, CONFIG.subdivisions);

  if (slices.length === 0) {
    alert('VectorSlice\n\nNo se encontraron paths válidos en el documento.\nAsegúrate de tener al menos un shape vectorial (path, rect, círculo, etc.).');
    return;
  }

  // Determinar bounds del documento (usamos el artboard activo)
  var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
  var abRect = ab.artboardRect; // [left, top, right, bottom]
  var docBounds = {
    x: abRect[0],
    y: -abRect[1],          // Y invertida: Illustrator usa Y+ hacia arriba
    w: abRect[2] - abRect[0],
    h: abRect[1] - abRect[3]
  };

  // Generar XML
  var docName = doc.name.replace(/\.(ai|svg|pdf|eps)$/i, '');
  var xml = buildXML(slices, docBounds, CONFIG, docName);

  // Guardar
  var outFile = chooseOutputFile(docName, opts.saveToResolume);
  if (!outFile) return;

  try {
    writeFile(outFile, xml);
  } catch (e) {
    alert('VectorSlice\n\nError al guardar el archivo:\n' + e.message);
    return;
  }

  alert('VectorSlice\n\n✓ Exportados ' + slices.length + ' slice' + (slices.length !== 1 ? 's' : '') + '.\n\nArchivo:\n' + outFile.fsName);


  // ════════════════════════════════════════════════════════════════════════
  // DIÁLOGO DE OPCIONES
  // ════════════════════════════════════════════════════════════════════════
  function showDialog(doc) {
    var w = new Window('dialog', 'VectorSlice — SVG → Resolume');
    w.orientation = 'column';
    w.alignChildren = 'fill';
    w.margins = 18;
    w.spacing = 12;

    // Header
    var hdr = w.add('group');
    hdr.orientation = 'column';
    hdr.alignChildren = 'left';
    hdr.spacing = 2;
    var title = hdr.add('statictext', undefined, 'VectorSlice');
    title.graphics.font = ScriptUI.newFont(title.graphics.font.name, 'BOLD', 14);
    hdr.add('statictext', undefined, 'Exportar paths como Screen Setup de Resolume Arena');

    // Detectar artboard activo para preset de tamaño
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var abRect = ab.artboardRect;
    var abW = Math.round(abRect[2] - abRect[0]);
    var abH = Math.round(abRect[1] - abRect[3]);

    // Panel de opciones
    var p = w.add('panel', undefined, 'Opciones');
    p.orientation = 'column';
    p.alignChildren = 'fill';
    p.margins = 14;
    p.spacing = 8;

    // Subdivisiones
    var g1 = p.add('group');
    g1.add('statictext', undefined, 'Subdivisión de curvas:').preferredSize.width = 160;
    var iSub = g1.add('edittext', undefined, String(CONFIG.subdivisions));
    iSub.characters = 5;
    g1.add('statictext', undefined, 'segmentos por curva');

    // Resolución
    var g2 = p.add('group');
    g2.add('statictext', undefined, 'Resolución de salida:').preferredSize.width = 160;
    var iW = g2.add('edittext', undefined, String(abW || CONFIG.outputWidth));
    iW.characters = 6;
    g2.add('statictext', undefined, '×');
    var iH = g2.add('edittext', undefined, String(abH || CONFIG.outputHeight));
    iH.characters = 6;
    g2.add('statictext', undefined, 'px');

    // Botón "Usar artboard"
    var g3 = p.add('group');
    g3.add('statictext', undefined, '').preferredSize.width = 160;
    var btnAB = g3.add('button', undefined, 'Usar dimensiones del artboard (' + abW + '×' + abH + ')');
    btnAB.onClick = function () {
      iW.text = String(abW);
      iH.text = String(abH);
    };

    // Destino
    var p2 = w.add('panel', undefined, 'Destino');
    p2.orientation = 'column';
    p2.alignChildren = 'left';
    p2.margins = 14;
    p2.spacing = 6;
    var rChoose = p2.add('radiobutton', undefined, 'Elegir ubicación al guardar');
    var rResolume = p2.add('radiobutton', undefined, 'Guardar en carpeta de presets de Resolume Arena');
    rChoose.value = true;

    // Footer info
    var info = w.add('statictext', undefined, 'Solo se procesa el artboard activo. Capas ocultas/bloqueadas se ignoran.', { multiline: true });
    info.preferredSize.width = 380;
    info.graphics.foregroundColor = info.graphics.newPen(info.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5, 1], 1);

    // Botones
    var btns = w.add('group');
    btns.alignment = 'right';
    var bCancel = btns.add('button', undefined, 'Cancelar', { name: 'cancel' });
    var bOK = btns.add('button', undefined, 'Exportar XML', { name: 'ok' });

    var result = null;
    bOK.onClick = function () {
      var subs = parseInt(iSub.text, 10);
      var width = parseInt(iW.text, 10);
      var height = parseInt(iH.text, 10);

      if (isNaN(subs) || subs < 2 || subs > 32) {
        alert('La subdivisión debe estar entre 2 y 32.');
        return;
      }
      if (isNaN(width) || width < 1 || isNaN(height) || height < 1) {
        alert('Resolución inválida.');
        return;
      }

      result = {
        subs: subs,
        width: width,
        height: height,
        saveToResolume: rResolume.value
      };
      w.close();
    };
    bCancel.onClick = function () { w.close(); };

    w.show();
    return result;
  }


  // ════════════════════════════════════════════════════════════════════════
  // RECOLECCIÓN DE SLICES
  // ════════════════════════════════════════════════════════════════════════
  function collectSlices(doc, subs) {
    var slices = [];
    var idx = 0;

    // Iteramos todos los pathItems del documento
    // (Illustrator no expone "shapes SVG" — todo se trata como PathItem)
    for (var i = 0; i < doc.pathItems.length; i++) {
      var p = doc.pathItems[i];

      // Saltar guías, capas ocultas o bloqueadas
      if (p.guides) continue;
      if (p.hidden) continue;
      if (p.layer.visible === false) continue;
      if (p.layer.locked) continue;
      if (p.locked) continue;

      var points = pathToPoints(p, subs);
      if (!points || points.length < 3) continue;

      slices.push({
        id: idx,
        name: sanitizeName(p.name || p.layer.name, idx),
        points: points,
        color: PALETTE[idx % PALETTE.length]
      });
      idx++;
    }

    // También procesar CompoundPathItems (cada subpath como un slice)
    for (var ci = 0; ci < doc.compoundPathItems.length; ci++) {
      var cp = doc.compoundPathItems[ci];
      if (cp.hidden || cp.layer.visible === false || cp.layer.locked) continue;

      for (var cpi = 0; cpi < cp.pathItems.length; cpi++) {
        var sp = cp.pathItems[cpi];
        var spPts = pathToPoints(sp, subs);
        if (!spPts || spPts.length < 3) continue;

        slices.push({
          id: idx,
          name: sanitizeName((cp.name || cp.layer.name) + (cp.pathItems.length > 1 ? '_' + (cpi + 1) : ''), idx),
          points: spPts,
          color: PALETTE[idx % PALETTE.length]
        });
        idx++;
      }
    }

    return slices;
  }

  /**
   * Convierte un PathItem en una lista de puntos {x, y}.
   * Subdivide curvas Bezier según `subs`.
   * IMPORTANTE: Illustrator usa Y+ hacia arriba; aquí invertimos para que
   * Y+ sea hacia abajo (como SVG/Resolume).
   */
  function pathToPoints(pathItem, subs) {
    var pts = pathItem.pathPoints;
    if (!pts || pts.length < 2) return null;

    var out = [];
    var n = pts.length;
    var closed = pathItem.closed;
    var segments = closed ? n : n - 1;

    for (var i = 0; i < segments; i++) {
      var a = pts[i];
      var b = pts[(i + 1) % n];

      var p0 = { x: a.anchor[0], y: -a.anchor[1] };
      var p3 = { x: b.anchor[0], y: -b.anchor[1] };
      var p1 = { x: a.rightDirection[0], y: -a.rightDirection[1] };
      var p2 = { x: b.leftDirection[0],  y: -b.leftDirection[1] };

      // Añadir el ancla inicial
      if (i === 0) out.push(p0);

      // ¿Es una curva o una recta?
      // Si los handles coinciden con los anchors → recta
      var isCurve = (p1.x !== p0.x || p1.y !== p0.y) ||
                    (p2.x !== p3.x || p2.y !== p3.y);

      if (isCurve) {
        // Subdividir Bezier cúbica
        for (var s = 1; s <= subs; s++) {
          var t = s / subs;
          var m = 1 - t;
          var x = m*m*m*p0.x + 3*m*m*t*p1.x + 3*m*t*t*p2.x + t*t*t*p3.x;
          var y = m*m*m*p0.y + 3*m*m*t*p1.y + 3*m*t*t*p2.y + t*t*t*p3.y;
          out.push({ x: x, y: y });
        }
      } else {
        // Línea recta: solo añadir el punto final
        out.push(p3);
      }
    }

    // Si está cerrado, eliminamos el último punto duplicado (== primero)
    if (closed && out.length > 1) {
      var first = out[0], last = out[out.length - 1];
      if (Math.abs(first.x - last.x) < 0.01 && Math.abs(first.y - last.y) < 0.01) {
        out.pop();
      }
    }

    return out;
  }


  // ════════════════════════════════════════════════════════════════════════
  // GENERACIÓN DEL XML
  // ════════════════════════════════════════════════════════════════════════
  function buildXML(slices, docBounds, cfg, fileName) {
    var outW = cfg.outputWidth;
    var outH = cfg.outputHeight;
    var scaleX = outW / docBounds.w;
    var scaleY = outH / docBounds.h;

    // IDs únicos estilo Resolume (timestamp + offset)
    var uidBase = new Date().getTime();
    function uid() { return String(uidBase++); }

    // Generadores de ParamRange
    function pr(name, val, min, max) {
      return '\t\t\t\t\t\t<ParamRange name="' + name + '" T="DOUBLE" default="' + val + '" value="' + val + '">\n' +
             '\t\t\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
             '\t\t\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
             '\t\t\t\t\t\t\t<ValueRange name="defaultRange" min="' + min + '" max="' + max + '"/>\n' +
             '\t\t\t\t\t\t\t<ValueRange name="minMax" min="' + min + '" max="' + max + '"/>\n' +
             '\t\t\t\t\t\t\t<ValueRange name="startStop" min="' + min + '" max="' + max + '"/>\n' +
             '\t\t\t\t\t\t</ParamRange>';
    }
    function pr2(name, val, min, max) {
      return '\t\t\t\t\t<ParamRange name="' + name + '" T="DOUBLE" default="' + val + '" value="' + val + '">\n' +
             '\t\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
             '\t\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
             '\t\t\t\t\t\t<ValueRange name="defaultRange" min="' + min + '" max="' + max + '"/>\n' +
             '\t\t\t\t\t\t<ValueRange name="minMax" min="' + min + '" max="' + max + '"/>\n' +
             '\t\t\t\t\t\t<ValueRange name="startStop" min="' + min + '" max="' + max + '"/>\n' +
             '\t\t\t\t\t</ParamRange>';
    }

    function sliceXML(s) {
      // Calcular bbox del slice
      var xs = [], ys = [];
      for (var i = 0; i < s.points.length; i++) {
        // Coords relativas al origen del artboard, escaladas
        var rx = (s.points[i].x - docBounds.x) * scaleX;
        var ry = (s.points[i].y - docBounds.y) * scaleY;
        xs.push(r2(rx));
        ys.push(r2(ry));
      }
      var x0 = min(xs), y0 = min(ys), x1 = max(xs), y1 = max(ys);
      var w  = x1 - x0, h = y1 - y0;

      // 4 vértices TL→TR→BR→BL
      var v4 = '\t\t\t\t\t\t\t<v x="' + r2(x0) + '" y="' + r2(y0) + '"/>\n' +
               '\t\t\t\t\t\t\t<v x="' + r2(x1) + '" y="' + r2(y0) + '"/>\n' +
               '\t\t\t\t\t\t\t<v x="' + r2(x1) + '" y="' + r2(y1) + '"/>\n' +
               '\t\t\t\t\t\t\t<v x="' + r2(x0) + '" y="' + r2(y1) + '"/>';

      // Grid 4×4 para BezierWarper
      var bv = '';
      for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 4; col++) {
          bv += '\t\t\t\t\t\t\t\t<v x="' + r2(x0 + w * (col / 3)) + '" y="' + r2(y0 + h * (row / 3)) + '"/>\n';
        }
      }

      return '\t\t\t\t\t<Slice uniqueId="' + uid() + '">\n' +
             '\t\t\t\t\t\t<Params name="Common">\n' +
             '\t\t\t\t\t\t\t<Param name="Name" T="STRING" default="Layer" value="' + xmlEsc(s.name) + '"/>\n' +
             '\t\t\t\t\t\t\t<Param name="Enabled" T="BOOL" default="1" value="1"/>\n' +
             '\t\t\t\t\t\t</Params>\n' +
             '\t\t\t\t\t\t<Params name="Input">\n' +
             '\t\t\t\t\t\t\t<ParamChoice name="Input Source" default="0:1" value="0:1" storeChoices="0"/>\n' +
             '\t\t\t\t\t\t\t<Param name="Input Opacity" T="BOOL" default="1" value="1"/>\n' +
             '\t\t\t\t\t\t\t<Param name="Input Bypass/Solo" T="BOOL" default="1" value="1"/>\n' +
             '\t\t\t\t\t\t\t<Param name="SoftEdgeEnable" T="BOOL" default="0" value="0"/>\n' +
             '\t\t\t\t\t\t</Params>\n' +
             '\t\t\t\t\t\t<Params name="Output">\n' +
             '\t\t\t\t\t\t\t<Param name="Flip" T="UINT8" default="0" value="0"/>\n' +
             pr('Brightness', 0, -1, 1) + '\n' +
             pr('Contrast',   0, -1, 1) + '\n' +
             pr('Red',        0, -1, 1) + '\n' +
             pr('Green',      0, -1, 1) + '\n' +
             pr('Blue',       0, -1, 1) + '\n' +
             '\t\t\t\t\t\t\t<Param name="Is Key" T="BOOL" default="0" value="0"/>\n' +
             '\t\t\t\t\t\t\t<Param name="Black BG" T="BOOL" default="0" value="0"/>\n' +
             pr('BRed',   0, 0, '0.4000000000000000222') + '\n' +
             pr('BGreen', 0, 0, '0.4000000000000000222') + '\n' +
             pr('BBlue',  0, 0, '0.4000000000000000222') + '\n' +
             '\t\t\t\t\t\t</Params>\n' +
             '\t\t\t\t\t\t<InputRect orientation="0">\n' + v4 + '\n\t\t\t\t\t\t</InputRect>\n' +
             '\t\t\t\t\t\t<OutputRect orientation="0">\n' + v4 + '\n\t\t\t\t\t\t</OutputRect>\n' +
             '\t\t\t\t\t\t<Warper>\n' +
             '\t\t\t\t\t\t\t<Params name="Warper">\n' +
             '\t\t\t\t\t\t\t\t<ParamChoice name="Point Mode" default="PM_LINEAR" value="PM_LINEAR" storeChoices="0"/>\n' +
             '\t\t\t\t\t\t\t\t<Param name="Flip" T="UINT8" default="0" value="0"/>\n' +
             '\t\t\t\t\t\t\t</Params>\n' +
             '\t\t\t\t\t\t\t<BezierWarper controlWidth="4" controlHeight="4">\n' +
             '\t\t\t\t\t\t\t\t<vertices>\n' + bv + '\t\t\t\t\t\t\t\t</vertices>\n' +
             '\t\t\t\t\t\t\t</BezierWarper>\n' +
             '\t\t\t\t\t\t\t<Homography>\n' +
             '\t\t\t\t\t\t\t\t<src>\n' + v4 + '\n\t\t\t\t\t\t\t\t</src>\n' +
             '\t\t\t\t\t\t\t\t<dst>\n' + v4 + '\n\t\t\t\t\t\t\t\t</dst>\n' +
             '\t\t\t\t\t\t\t</Homography>\n' +
             '\t\t\t\t\t\t</Warper>\n' +
             '\t\t\t\t\t</Slice>';
    }

    var screenId = uid();
    var slicesXml = [];
    for (var s = 0; s < slices.length; s++) slicesXml.push(sliceXML(slices[s]));

    var xml =
      '<?xml version="1.0" encoding="utf-8"?>\n' +
      '<XmlState name="' + xmlEsc(fileName) + '">\n' +
      '\t<versionInfo name="Resolume Arena" majorVersion="7" minorVersion="26" microVersion="1" revision="7833"/>\n' +
      '\t<ScreenSetup name="ScreenSetup">\n' +
      '\t\t<Params name="ScreenSetupParams"/>\n' +
      '\t\t<CurrentCompositionTextureSize width="' + outW + '" height="' + outH + '"/>\n' +
      '\t\t<screens>\n' +
      '\t\t\t<Screen name="VectorSlice" uniqueId="' + screenId + '">\n' +
      '\t\t\t\t<Params name="Params">\n' +
      '\t\t\t\t\t<Param name="Name" T="STRING" default="" value="VectorSlice"/>\n' +
      '\t\t\t\t\t<Param name="Enabled" T="BOOL" default="1" value="1"/>\n' +
      '\t\t\t\t\t<Param name="Hidden" T="BOOL" default="0" value="0"/>\n' +
      '\t\t\t\t</Params>\n' +
      '\t\t\t\t<Params name="Output">\n' +
      pr2('Opacity',    1, 0,  1) + '\n' +
      pr2('Brightness', 0, -1, 1) + '\n' +
      pr2('Contrast',   0, -1, 1) + '\n' +
      pr2('Red',        0, -1, 1) + '\n' +
      pr2('Green',      0, -1, 1) + '\n' +
      pr2('Blue',       0, -1, 1) + '\n' +
      '\t\t\t\t</Params>\n' +
      '\t\t\t\t<guides>\n' +
      '\t\t\t\t\t<ScreenGuide name="ScreenGuide" type="0">\n' +
      '\t\t\t\t\t\t<Params name="Params">\n' +
      '\t\t\t\t\t\t\t<ParamPixels name="Image"/>\n' +
      pr('Opacity', 0.25, 0, 1) + '\n' +
      '\t\t\t\t\t\t</Params>\n' +
      '\t\t\t\t\t</ScreenGuide>\n' +
      '\t\t\t\t\t<ScreenGuide name="ScreenGuide" type="1">\n' +
      '\t\t\t\t\t\t<Params name="Params">\n' +
      '\t\t\t\t\t\t\t<ParamPixels name="Image"/>\n' +
      pr('Opacity', 0.25, 0, 1) + '\n' +
      '\t\t\t\t\t\t</Params>\n' +
      '\t\t\t\t\t</ScreenGuide>\n' +
      '\t\t\t\t</guides>\n' +
      '\t\t\t\t<layers>\n' +
      slicesXml.join('\n') + '\n' +
      '\t\t\t\t</layers>\n' +
      '\t\t\t\t<OutputDevice>\n' +
      '\t\t\t\t\t<OutputDeviceVirtual name="VectorSlice" deviceId="VirtualScreen 1" idHash="10094742552620344504" width="' + outW + '" height="' + outH + '">\n' +
      '\t\t\t\t\t\t<Params name="Params">\n' +
      '\t\t\t\t\t\t\t<ParamRange name="Width" T="DOUBLE" default="' + outW + '" value="' + outW + '">\n' +
      '\t\t\t\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
      '\t\t\t\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
      '\t\t\t\t\t\t\t\t<ValueRange name="defaultRange" min="1" max="32768"/>\n' +
      '\t\t\t\t\t\t\t\t<ValueRange name="minMax" min="1" max="32768"/>\n' +
      '\t\t\t\t\t\t\t\t<ValueRange name="startStop" min="1" max="32768"/>\n' +
      '\t\t\t\t\t\t\t</ParamRange>\n' +
      '\t\t\t\t\t\t\t<ParamRange name="Height" T="DOUBLE" default="' + outH + '" value="' + outH + '">\n' +
      '\t\t\t\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
      '\t\t\t\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
      '\t\t\t\t\t\t\t\t<ValueRange name="defaultRange" min="1" max="32768"/>\n' +
      '\t\t\t\t\t\t\t\t<ValueRange name="minMax" min="1" max="32768"/>\n' +
      '\t\t\t\t\t\t\t\t<ValueRange name="startStop" min="1" max="32768"/>\n' +
      '\t\t\t\t\t\t\t</ParamRange>\n' +
      '\t\t\t\t\t\t</Params>\n' +
      '\t\t\t\t\t</OutputDeviceVirtual>\n' +
      '\t\t\t\t</OutputDevice>\n' +
      '\t\t\t</Screen>\n' +
      '\t\t</screens>\n' +
      '\t\t<SoftEdging>\n' +
      '\t\t\t<Params name="Soft Edge">\n' +
      '\t\t\t\t<ParamRange name="Gamma Red" T="DOUBLE" default="2" value="2">\n' +
      '\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
      '\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
      '\t\t\t\t\t<ValueRange name="defaultRange" min="1" max="3"/>\n' +
      '\t\t\t\t\t<ValueRange name="minMax" min="1" max="3"/>\n' +
      '\t\t\t\t\t<ValueRange name="startStop" min="1" max="3"/>\n' +
      '\t\t\t\t</ParamRange>\n' +
      '\t\t\t\t<ParamRange name="Gamma Green" T="DOUBLE" default="2" value="2">\n' +
      '\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
      '\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
      '\t\t\t\t\t<ValueRange name="defaultRange" min="1" max="3"/>\n' +
      '\t\t\t\t\t<ValueRange name="minMax" min="1" max="3"/>\n' +
      '\t\t\t\t\t<ValueRange name="startStop" min="1" max="3"/>\n' +
      '\t\t\t\t</ParamRange>\n' +
      '\t\t\t\t<ParamRange name="Gamma Blue" T="DOUBLE" default="2" value="2">\n' +
      '\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
      '\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
      '\t\t\t\t\t<ValueRange name="defaultRange" min="1" max="3"/>\n' +
      '\t\t\t\t\t<ValueRange name="minMax" min="1" max="3"/>\n' +
      '\t\t\t\t\t<ValueRange name="startStop" min="1" max="3"/>\n' +
      '\t\t\t\t</ParamRange>\n' +
      '\t\t\t\t<ParamRange name="Gamma" T="DOUBLE" default="1" value="1">\n' +
      '\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
      '\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
      '\t\t\t\t\t<ValueRange name="defaultRange" min="0" max="1"/>\n' +
      '\t\t\t\t\t<ValueRange name="minMax" min="0" max="1"/>\n' +
      '\t\t\t\t\t<ValueRange name="startStop" min="0" max="1"/>\n' +
      '\t\t\t\t</ParamRange>\n' +
      '\t\t\t\t<ParamRange name="Luminance" T="DOUBLE" default="0.5" value="0.5">\n' +
      '\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
      '\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
      '\t\t\t\t\t<ValueRange name="defaultRange" min="0" max="1"/>\n' +
      '\t\t\t\t\t<ValueRange name="minMax" min="0" max="1"/>\n' +
      '\t\t\t\t\t<ValueRange name="startStop" min="0" max="1"/>\n' +
      '\t\t\t\t</ParamRange>\n' +
      '\t\t\t\t<ParamRange name="Power" T="DOUBLE" default="2" value="1.999999999999999778">\n' +
      '\t\t\t\t\t<PhaseSourceStatic name="PhaseSourceStatic"/>\n' +
      '\t\t\t\t\t<BehaviourDouble name="BehaviourDouble"/>\n' +
      '\t\t\t\t\t<ValueRange name="defaultRange" min="0.10000000000000000555" max="7"/>\n' +
      '\t\t\t\t\t<ValueRange name="minMax" min="0.10000000000000000555" max="7"/>\n' +
      '\t\t\t\t\t<ValueRange name="startStop" min="0.10000000000000000555" max="7"/>\n' +
      '\t\t\t\t</ParamRange>\n' +
      '\t\t\t</Params>\n' +
      '\t\t</SoftEdging>\n' +
      '\t</ScreenSetup>\n' +
      '</XmlState>\n';

    return xml;
  }


  // ════════════════════════════════════════════════════════════════════════
  // SELECCIÓN DE ARCHIVO DE SALIDA
  // ════════════════════════════════════════════════════════════════════════
  function chooseOutputFile(baseName, saveToResolume) {
    if (saveToResolume) {
      var folder = getResolumePresetFolder();
      if (!folder) {
        alert('No se encontró la carpeta de presets de Resolume Arena.\n\n' +
              'Carpetas buscadas:\n' +
              '  Mac:     ~/Documents/Resolume Arena/presets/screensetup/\n' +
              '  Windows: ~/Documents/Resolume Arena 7/presets/screensetup/\n\n' +
              'Selecciona la ubicación manualmente.');
        return promptSaveFile(baseName);
      }
      return new File(folder.fsName + '/' + baseName + '.xml');
    }
    return promptSaveFile(baseName);
  }

  function promptSaveFile(baseName) {
    var f = File.saveDialog('Guardar Screen Setup de Resolume', 'XML files:*.xml');
    if (!f) return null;
    // Asegurar extensión .xml
    if (!/\.xml$/i.test(f.fsName)) {
      f = new File(f.fsName + '.xml');
    }
    return f;
  }

  function getResolumePresetFolder() {
    var candidates;
    if ($.os.indexOf('Windows') !== -1) {
      candidates = [
        Folder.myDocuments.fsName + '/Resolume Arena 7/presets/screensetup',
        Folder.myDocuments.fsName + '/Resolume Arena/presets/screensetup'
      ];
    } else {
      candidates = [
        Folder.myDocuments.fsName + '/Resolume Arena/presets/screensetup',
        Folder.myDocuments.fsName + '/Resolume Arena 7/presets/screensetup'
      ];
    }
    for (var i = 0; i < candidates.length; i++) {
      var f = new Folder(candidates[i]);
      if (f.exists) return f;
    }
    return null;
  }


  // ════════════════════════════════════════════════════════════════════════
  // ESCRITURA DEL ARCHIVO
  // ════════════════════════════════════════════════════════════════════════
  function writeFile(file, content) {
    file.encoding = 'UTF-8';
    if (!file.open('w')) throw new Error('No se pudo abrir el archivo para escritura.');
    file.write(content);
    file.close();
  }


  // ════════════════════════════════════════════════════════════════════════
  // UTILIDADES
  // ════════════════════════════════════════════════════════════════════════
  function sanitizeName(s, i) {
    if (!s) return 'SCREEN_' + pad(i + 1);
    var c = String(s).replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/^_+|_+$/g, '');
    return c || ('SCREEN_' + pad(i + 1));
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function xmlEsc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function r2(n) {
    return Math.round(n * 100) / 100;
  }

  function min(arr) {
    var m = arr[0];
    for (var i = 1; i < arr.length; i++) if (arr[i] < m) m = arr[i];
    return m;
  }

  function max(arr) {
    var m = arr[0];
    for (var i = 1; i < arr.length; i++) if (arr[i] > m) m = arr[i];
    return m;
  }

})();
