# VectorSlice

**Convierte vectores de Illustrator en Slices de Resolume Arena.**  
Sin redibujar. Sin plugins. Dos vías: navegador o script nativo de Illustrator.

🔗 **[Abrir VectorSlice →](https://javitatay.github.io/VectorSlice/)**  
📥 **[Descargar script para Illustrator →](https://javitatay.github.io/VectorSlice/#descargar-script)**

---

## El problema que resuelve

Cuando haces mapping en Resolume Arena, necesitas dibujar manualmente cada pantalla o superficie en el Advanced Output como un Slice. Si el diseño viene de Illustrator, el proceso tradicional es redibujar punto por punto. VectorSlice elimina ese paso.

## Pipelines

Dos formas de llegar al mismo XML, elige la que mejor encaje con tu flujo:

```
Vía A:  Illustrator  →  Exportar SVG  →  VectorSlice (web)  →  XML  →  Resolume Arena
Vía B:  Illustrator  →  VectorSlice.jsx  ─────────────────→  XML  →  Resolume Arena
```

| | Vía A — Web | Vía B — Script Illustrator |
|---|---|---|
| Paso intermedio | Exportar SVG | ❌ ninguno |
| UI | Visual con preview, edición y reordenación | Diálogo nativo de Illustrator |
| Edición pre-exportación | ✅ Renombrar, ocultar, reordenar | ❌ Tal cual está en el documento |
| Multi-plataforma | Cualquier navegador | Solo donde tengas Illustrator |
| Instalación | ❌ Ninguna | Copiar 1 archivo (opcional) |

**Recomendación:** usa la **Vía A (web)** si necesitas previsualizar, renombrar o reordenar slices antes de exportar. Usa la **Vía B (script)** si trabajas íntegramente en Illustrator y quieres saltarte el paso del SVG.

---

## Vía A — Web

### 1. Prepara el SVG en Illustrator

- Dibuja tus formas vectoriales — cada shape se convierte en un Slice en Resolume
- **Nombra cada capa o shape** — ese nombre se convierte en el ID del Slice
- Exporta: `File > Export > Export As > SVG`

### 2. Abre VectorSlice

Abre `index.html` en el navegador, o accede a la versión online.  
No requiere instalación ni conexión a internet.

### 3. Importa el SVG

Arrastra el `.svg` al panel lateral izquierdo **o directamente al área central** del canvas. VectorSlice detecta automáticamente todos los shapes, lee la resolución del documento y muestra un preview visual con los slices en su posición real dentro del artboard.

### 4. Revisa y edita los slices

Desde la lista lateral puedes ajustar el layout antes de exportar:

| Acción | Cómo |
|--------|------|
| **Seleccionar** un slice | Click — resalta en el preview con bounding box y dimensiones |
| **Renombrar** un slice | Doble click sobre el nombre — edita inline, Enter confirma, Esc cancela |
| **Reordenar** slices | Arrastra desde el icono `⠿` — una línea indica la posición de destino |
| **Ocultar / mostrar** un slice | Botón `◉ / ○` — los slices ocultos se excluyen del XML exportado |
| **Eliminar** un slice | Botón `×` al hacer hover |

### 5. Usa el preview

El canvas representa siempre el artboard completo del documento SVG, con los slices en su posición real. En la esquina superior derecha del preview hay dos controles:

- **Overlay res.** — dibuja el marco de la resolución de salida con marcas de esquina. Útil para verificar que los slices encajan dentro del área de composición.
- **Dimensiones** — muestra el ancho y alto en píxeles de cada slice directamente sobre el canvas, calculados según la resolución de salida configurada.

Al seleccionar un slice en la lista, el preview muestra su bounding box con handles en las esquinas y las dimensiones reales en píxeles.

### 6. Exporta el XML

Click en **Exportar ▾** y elige el formato:

| Formato | Descripción | Destino en Resolume |
|---------|-------------|---------------------|
| **Screen Setup XML** | Layout de pantallas y slices | `Advanced Output → Import Layout` |
| **Composition Preset XML** | Mismo layout envuelto en una composición completa | Preset de composición con resolución y framerate |

El archivo se descarga con el mismo nombre que el SVG importado. Los slices ocultos se excluyen del export.

### 7. Importa en Resolume Arena

Copia el archivo `.xml` a la carpeta de presets de Resolume:

- **Mac:** `~/Documents/Resolume Arena/presets/screensetup/`
- **Windows:** `C:\Users\[usuario]\Documents\Resolume Arena 7\presets\screensetup\`

Reinicia Resolume Arena. El preset aparecerá en la lista de Screen Setups con el nombre de tu archivo SVG, y cada Slice con el nombre de su capa correspondiente.

---

## Vía B — Script de Illustrator

Si trabajas en Illustrator, puedes generar el XML directamente desde el menú `File > Scripts` sin pasar por SVG.

### Instalación

**Opción 1 — Ejecución puntual** (no requiere instalar nada):

1. Descarga [`VectorSlice.jsx`](https://javitatay.github.io/VectorSlice/#descargar-script) desde la web (un click en el botón "Descargar VectorSlice.jsx")
2. En Illustrator: `File > Scripts > Other Script…` (`Cmd/Ctrl + F12`)
3. Selecciona el archivo `.jsx`

**Opción 2 — Instalación permanente en el menú:**

Copia `VectorSlice.jsx` a la carpeta de scripts de Illustrator:

- **Mac:** `/Applications/Adobe Illustrator [versión]/Presets/en_US/Scripts/`
- **Windows:** `C:\Program Files\Adobe\Adobe Illustrator [versión]\Presets\en_US\Scripts\`

> Sustituye `en_US` por `es_ES` si tu Illustrator está en español.

Reinicia Illustrator. Aparecerá en `File > Scripts > VectorSlice`.

### Uso

1. Abre el documento con tus shapes en Illustrator
2. Nombra cada path o capa — ese nombre será el ID del Slice
3. Ejecuta el script
4. En el diálogo configura:
   - **Subdivisión de curvas** (default 8 — sube a 12–16 para curvas muy detalladas)
   - **Resolución de salida** (botón *"Usar dimensiones del artboard"* para autorrellenar)
   - **Destino**: elegir ubicación manual o guardar directamente en la carpeta de presets de Resolume
5. Click en *Exportar XML*

### Qué procesa y qué ignora

✅ **Se procesa:**
- `PathItem`s (rectángulos, círculos, formas con la pluma, etc.)
- `CompoundPathItem`s (cada subpath se exporta como Slice independiente)
- Solo el **artboard activo**
- Solo capas/objetos **visibles y desbloqueados**

❌ **Se ignora:**
- Texto sin convertir a curvas (`Type > Create Outlines` antes)
- Imágenes rasterizadas
- Guías
- Capas ocultas o bloqueadas
- Symbols (expándelos antes)

### Carpeta automática de Resolume

Si eliges *"Guardar en carpeta de presets de Resolume Arena"*, el script busca automáticamente:

- **Mac:** `~/Documents/Resolume Arena/presets/screensetup/`
- **Windows:** `~/Documents/Resolume Arena 7/presets/screensetup/`

Si no la encuentra, hace fallback al diálogo manual. Tras guardar, **reinicia Resolume Arena** para que aparezca el preset.

---

## Shapes soportados (Vía A — Web)

| Tipo | Soporte |
|------|---------|
| `path` — líneas, curvas, formas custom | ✅ |
| `rect` — incluye bordes redondeados | ✅ |
| `circle` / `ellipse` | ✅ |
| `polygon` / `polyline` | ✅ |
| Texto, imágenes rasterizadas | ❌ |

---

## Opciones

| Opción | Descripción |
|--------|-------------|
| **Precisión de curvas** | Segmentos por curva Bézier. Más = curvas más suaves, más puntos en el XML. Recomendado: 8 |
| **Resolución de salida** | Dimensiones a las que se escalan las coordenadas. Default: 1920×1080 |

Ambas opciones existen tanto en la web como en el script de Illustrator.

---

## Compatibilidad

| Software | Versión mínima |
|----------|---------------|
| Adobe Illustrator | CS6 (Vía B) · CC 2019+ (export SVG limpio para Vía A) |
| Resolume Arena | 7.0+ |
| Navegador | Chrome 90+, Firefox 88+, Edge 90+ |

> ⚠️ No compatible con Resolume Avenue (no tiene Advanced Output)

---

## Estructura del repositorio

```
vectorslice/
├── index.html        — Aplicación web (standalone, sin dependencias)
├── VectorSlice.jsx   — Script ExtendScript para Adobe Illustrator
└── README.md
```

La herramienta web es un único archivo HTML autocontenido. No necesita servidor, build tools ni dependencias externas. Funciona offline.

El script `.jsx` es ExtendScript puro (ES3), sin dependencias, compatible con cualquier versión moderna de Illustrator.

---

## Troubleshooting

### Vía A — Web

**No detecta slices**  
Verifica que las formas sean paths vectoriales. Exporta el SVG con la opción *Preserve Illustrator Editing Capabilities* desactivada para obtener un SVG más limpio.

**La resolución detectada no coincide con el artboard**  
VectorSlice lee el `viewBox` del SVG, que es la fuente de verdad para las coordenadas internas. Si Illustrator exporta `width`/`height` en unidades físicas (pt, mm) sin `viewBox`, la conversión se hace a 96 dpi. En caso de duda, verifica que el SVG exportado incluya el atributo `viewBox`.

**Los slices ocultos no aparecen en el XML**  
Es el comportamiento esperado — los slices con visibilidad desactivada se excluyen del export. Actívalos antes de exportar si los necesitas.

### Vía B — Script Illustrator

**"No se encontraron paths válidos"**  
Asegúrate de tener al menos un shape vectorial en el artboard activo. Comprueba que las capas no estén ocultas o bloqueadas. Si solo tienes texto, convírtelo a curvas (`Type > Create Outlines`).

**Las coordenadas no cuadran en Resolume**  
Usa el botón *"Usar dimensiones del artboard"* en lugar de poner valores manuales. Verifica que tu artboard tenga la misma proporción que tu salida en Resolume.

**El script solo procesa una parte del documento**  
Por diseño, el script procesa únicamente el **artboard activo**. Para exportar otros artboards, cámbialos como activos y ejecuta el script varias veces.

### General

**Las curvas se ven angulosas en Resolume**  
Aumenta el valor de "Precisión de curvas" / "Subdivisión de curvas" a 12–16 antes de exportar.

**Resolume no importa el XML**  
Confirma que usas Resolume Arena 7 (no Avenue ni versión 6). Reinicia Resolume tras copiar el preset a la carpeta `screensetup/`.

---

## Autoría

**Javier Tatay Rubio**  
Profesor · CFGM Video DJ · Animación Visual en Vivo  
[javitatay.github.io](https://javitatay.github.io) · [AVV Lab](https://javitatay.github.io/AVV)

---

## Licencia

MIT — libre de usar, modificar y distribuir.
