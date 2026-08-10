# JSSpeccy 3

Un emulador de ZX Spectrum para el navegador con soporte para ZX Spectrum +2 Español, diseño móvil adaptativo y exportación de archivos.

## Características

* Emula los modelos Spectrum 48K, Spectrum 128K (+2 Español) y Pentagon 128
* Ejecuta todas las instrucciones del Z80 (documentadas y no documentadas)
* Emulación precisa de efectos de barrido de línea / multicolor (*scanline / multicolour*)
* Audio AY-3-8912 y *beeper*
* Carga de volcados de memoria (snapshots) en formatos SZX, Z80 y SNA
* Carga de imágenes de cinta en formatos TZX y TAP (vía trampas ROM)
* Exportación de volcados de estado (.z80) y programas BASIC en formato de cinta (.tzx) con personalización de nombres
* Carga directa de cualquiera de los archivos anteriores desde dentro de un archivo ZIP
* Teclado táctil virtual adaptativo diseñado con el patrón del ZX Spectrum +2 español
* Modos de pantalla 100% (1x), 200% (2x), 300% (3x), ajuste a pantalla y pantalla completa

## Notas de implementación

JSSpeccy 3 es una reescritura completa de JSSpeccy para aprovechar al máximo las tecnologías web modernas y APIs de alto rendimiento. La emulación se ejecuta en un *Web Worker*, liberando el hilo de la interfaz de usuario (UI) para gestionar las actualizaciones de pantalla y audio. El núcleo del emulador (que consiste en la emulación del procesador Z80 y procesos auxiliares como la generación de salida de vídeo, lectura del teclado y audio) se ejecuta en WebAssembly, compilado desde AssemblyScript (con un preprocesador personalizado).

## Contribuciones y Fork

Este repositorio es una versión mantenida y mejorada del proyecto original por Matt Westcott (Gasman). Incluye soporte nativo para el modelo ZX Spectrum +2 en español, interfaz completamente traducida al español, teclado virtual táctil adaptativo y exportación de programas BASIC en formato .tzx.

## Integración (Embedding)

JSSpeccy 3 está diseñado pensando en su integración en sitios web. Para incluirlo en tu propia página, descarga el contenido compilado y copia la carpeta `jsspeccy` en un directorio accesible por tu servidor web. Asegúrate de mantener los archivos `.js`, `.wasm` y las subcarpetas en la misma ubicación relativa a `jsspeccy.js`.

En la etiqueta `<head>` de tu página HTML, incluye:

```html
<script src="/ruta/a/jsspeccy.js"></script>
```

Sustituyendo `/ruta/a/jsspeccy.js` por la ruta real hacia `jsspeccy.js`. En el lugar de la página donde desees mostrar el emulador, añade el siguiente código:

```html
<div id="jsspeccy"></div>
<script>JSSpeccy(document.getElementById('jsspeccy'))</script>
```

También puedes pasar opciones de configuración como un segundo argumento a `JSSpeccy`:

```html
<script>JSSpeccy(document.getElementById('jsspeccy'), {zoom: 2, machine: 128})</script>
```

### Opciones de configuración disponibles:

* `autoStart`: Si es `true`, el emulador se iniciará inmediatamente sin necesidad de pulsar el botón de reproducción. Ten en cuenta que las políticas de la mayoría de los navegadores no permiten reproducir audio sin interacción previa del usuario.
* `autoLoadTapes`: Si es `true`, cualquier archivo de cinta cargado se ejecutará automáticamente sin necesidad de teclear `LOAD ""` o seleccionar la opción Tape Loader.
* `tapeAutoLoadMode`: Especifica el modo en que debe configurarse la máquina antes de autocargar cintas: `'default'` (por defecto) o `'usr0'` (modo 48K BASIC en modelos 128K).
* `machine`: Especifica la máquina a emular. Puede ser `48` (para Spectrum 48K), `128` (para Spectrum 128K +2 Español) o `5` (para Pentagon 128).
* `openUrl`: Especifica una URL (o lista de URLs) a archivos de cinta, snapshot o archivos comprimidos para cargar al inicio.
* `zoom`: Especifica el tamaño de la ventana del emulador: `1` para 100%, `2` para 200%, `'fit'` para ajustar al ancho del navegador, etc.
* `sandbox`: Si es `true`, deshabilita las opciones del menú UI para abrir archivos locales.
* `tapeTrapsEnabled`: Si es `true` (por defecto), intercepta las rutinas de carga de la ROM para realizar cargas instantáneas de cinta.
* `keyboardEnabled`: `true` por defecto; si es `false`, el emulador no responderá a las entradas del teclado.
* `uiEnabled`: `true` por defecto; si es `false`, la barra de menú superior y la barra de herramientas inferior no se mostrarán.
* `keyboardMap`: Si se establece en `"recreated"`, el emulador aceptará los códigos emitidos por el teclado [Recreated ZX Spectrum](https://recreatedzxspectrum.com/).

### Control de la API de JavaScript

El valor devuelto por la función `JSSpeccy` es un objeto que expone funciones para controlar la ejecución del emulador:

```html
<script>
    let emu = JSSpeccy(document.getElementById('jsspeccy'));
    emu.openFileDialog();
</script>
```

* `emu.setZoom(zoomLevel)`: Cambia el nivel de zoom o ajuste de pantalla.
* `emu.enterFullscreen()`: Activa el modo de pantalla completa.
* `emu.exitFullscreen()`: Sale del modo de pantalla completa.
* `emu.toggleFullscreen()`: Alterna la pantalla completa.
* `emu.setMachine(machine)`: Cambia el modelo emulado (48, 128, 5).
* `emu.openFileDialog()`: Abre el selector de archivos local.
* `emu.openUrl(url)`: Carga un archivo desde una URL especificada.
* `emu.saveSnapshot(filename)`: Exporta un archivo snapshot .z80.
* `emu.saveBasicTZX(filename)`: Exporta el programa BASIC actual en memoria a un archivo .tzx.
* `emu.onReady(callback)`: Ejecuta una función callback una vez el emulador esté totalmente inicializado.
* `emu.exit()`: Detiene el emulador y lo remueve del documento DOM.

## Solución de problemas

Si el emulador no inicia, abre la consola de desarrollador de tu navegador (En Chrome: Ver -> Opciones para desarrolladores -> Consola JavaScript; en Firefox: Herramientas -> Herramientas del navegador -> Consola del navegador) y comprueba los mensajes de error.

Si observas un error como:

```
TypeError: WebAssembly: Response has unsupported MIME type 'application/octet-stream' expected 'application/wasm'
```

Debes configurar tu servidor web para servir archivos `.wasm` con el encabezado de tipo de contenido correcto. En servidores Apache o Nginx, asegúrate de añadir en tu archivo `.htaccess`:

```
AddType application/wasm wasm
```

## Licencia

JSSpeccy 3 está licenciado bajo la Licencia Pública General GNU versión 3 (GPL v3) - consulta el archivo COPYING para más detalles.
