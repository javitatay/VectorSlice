# VectorSlice

**Convierte vectores de Illustrator en Slices de Resolume Arena.**  
Sin redibujar. Sin plugins. Abre el archivo en el navegador y listo.

🔗 **[Abrir VectorSlice →](https://javitatay.github.io/VectorSlice/)**

---

## El problema que resuelve

Cuando haces mapping en Resolume Arena, necesitas dibujar manualmente cada pantalla o superficie en el Advanced Output como un Slice. Si el diseño viene de Illustrator, el proceso tradicional es redibujar punto por punto. VectorSlice elimina ese paso.

## Pipeline

```
Illustrator  →  Exportar SVG  →  VectorSlice  →  XML  →  Resolume Arena
```

El único paso manual es exportar el `.svg` desde Illustrator (`File > Export > Export As > SVG`). El resto es automático.

---

## Uso

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

## Shapes soportados

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

---

## Compatibilidad

| Software | Versión mínima |
|----------|---------------|
| Adobe Illustrator | CC 2019+ |
| Resolume Arena | 7.0+ |
| Navegador | Chrome 90+, Firefox 88+, Edge 90+ |

> ⚠️ No compatible con Resolume Avenue (no tiene Advanced Output)

---

## Estructura del repositorio

```
vectorslice/
├── index.html   — Aplicación completa (standalone, sin dependencias)
└── README.md
```

La herramienta es un único archivo HTML autocontenido. No necesita servidor, build tools ni dependencias externas. Funciona offline.

---

## Troubleshooting

**No detecta slices**  
Verifica que las formas sean paths vectoriales. Exporta el SVG con la opción *Preserve Illustrator Editing Capabilities* desactivada para obtener un SVG más limpio.

**La resolución detectada no coincide con el artboard**  
VectorSlice lee el `viewBox` del SVG, que es la fuente de verdad para las coordenadas internas. Si Illustrator exporta `width`/`height` en unidades físicas (pt, mm) sin `viewBox`, la conversión se hace a 96 dpi. En caso de duda, verifica que el SVG exportado incluya el atributo `viewBox`.

**Las curvas se ven angulosas en Resolume**  
Aumenta el valor de "Precisión de curvas" a 12–16 antes de exportar.

**Resolume no importa el XML**  
Confirma que usas Resolume Arena 7 (no Avenue ni versión 6).

**Los slices ocultos no aparecen en el XML**  
Es el comportamiento esperado — los slices con visibilidad desactivada se excluyen del export. Actívalos antes de exportar si los necesitas.

---

## Autoría

**Javier Tatay Rubio**  
Profesor · CFGM Video DJ · Animación Visual en Vivo  
[javitatay.github.io](https://javitatay.github.io) · [AVV Lab](https://javitatay.github.io/AVV)

---

## Licencia

MIT — libre de usar, modificar y distribuir.
