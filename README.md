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

- Dibuja tus formas vectoriales (cada shape = un Slice en Resolume)
- **Nombra cada capa o shape** — ese nombre se convierte en el ID del Slice
- Exporta: `File > Export > Export As > SVG`

### 2. Abre VectorSlice

Abre `index.html` en el navegador, o accede directamente a la versión online.  
No requiere instalación ni conexión a internet.

### 3. Importa el SVG

Arrastra el `.svg` a la zona de drop. VectorSlice detecta automáticamente todos los shapes y muestra un preview visual.

### 4. Exporta el XML

Click en **Exportar XML**. Se descarga un archivo `.xml` con el mismo nombre que el SVG importado (ej: `mi_mapping.svg` → `mi_mapping.xml`).

### 5. Importa en Resolume Arena

Copia el archivo `.xml` generado a la carpeta de presets de Resolume:

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
| **Curvas** | Segmentos por curva Bezier. Más = mayor precisión. Recomendado: 8 |
| **Resolución** | Dimensiones de referencia para escalar coordenadas. Default: 1920×1080 |

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

**Las curvas se ven angulosas en Resolume**  
Aumenta el valor de "Curvas" a 12–16 antes de exportar.

**Resolume no importa el XML**  
Confirma que usas Resolume Arena 7 (no Avenue ni versión 6).

---

## Autoría

**Javier Tatay Rubio**  
Profesor · CFGM Video DJ · Animación Visual en Vivo  
[javitatay.github.io](https://javitatay.github.io) · [AVV Lab](https://javitatay.github.io/AVV)

---

## Licencia

MIT — libre de usar, modificar y distribuir.
