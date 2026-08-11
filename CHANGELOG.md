4.1.1 (2026-08-11)
------------------

* **Teclado Físico y Mapeo en Español**:
  - Priorización de entrada por carácter (`evt.key`) para evitar la interferencia de códigos de teclas físicas sobre los símbolos impresos (`$`, `%`, `&`, `(`, `)`, `^`, `¿`, `ñ`, `Ñ`).
  - Mapeo nativo de la tecla `ñ` y `Ñ` (mayúscula) para el layout del ZX Spectrum +2 español.
  - Corrección de colisión entre la tecla de retroceso (`Backspace`) y la tecla numérica `8`.
  - Mapeo de la tecla física `Bloq Mayús` (`CapsLock`) a la combinación nativa del Spectrum (`Caps Shift + 2`).
  - Filtrado de eventos de auto-repetición del sistema operativo (`evt.repeat`) para prevenir teclas atascadas o pulsaciones repetidas indefinidamente.
  - Adición de liberador de seguridad al perder el foco de la ventana (`blur`) para soltar todas las teclas automáticamente.
  - Liberación limpia de modificadores (`Caps Shift` / `Symbol Shift`) en eventos `keyUp` para evitar estados bloqueados.

* **Teclado Virtual y UX Móvil**:
  - Modificadores retenidos (`MAYÚS` y `SIMB`) en pantallas táctiles móviles hasta la selección de un carácter alfanumérico.
  - Manejadores de cancelación táctil (`pointercancel`, `touchcancel`, `contextmenu`) para evitar teclas atascadas al deslizar el dedo en dispositivos móviles.
  - Filtrado en `pointerleave` exclusivo para táctil (`pointerType === 'touch'`) garantizando que el ratón en escritorio no libere prematuramente las teclas al arrastrar.
  - Incremento del tamaño visual de las teclas táctiles y optimización de contraste en etiquetas (`MAYÚS`, `B. MAYÚS`, `SIMB`).
  - Corrección de las teclas de acción `EXTRA` (`Caps Shift + Symbol Shift`), `V. NORM` (`Caps Shift + 3`), y `V. INV` (`Caps Shift + 4`).

* **Interfaz de Usuario (UI)**:
  - Adición de distintivo con el nombre y versión de la aplicación (`JSSpeccy v4.1.1`) en el extremo derecho de la barra de menú superior.
  - Ajuste de ancho mínimo a 380px en el modo de pantalla `1x` para mantener la barra de menú en una sola fila.

4.1.0 (2026-08-10)
------------------

* **Soporte y Teclado ZX Spectrum +2 (Español)**:
  - Implementación de la distribución, serigrafía y mapa de teclado oficial del ZX Spectrum +2 versión española (tecla Ñ/ñ, símbolos y teclas de función).
  - Renombrado y configuración del modelo a `Spectrum +2 (Español)`.
  - Ajuste de estilo y alineación de las filas del teclado virtual táctil, unificación visual de las teclas de cursor y limitación del ancho máximo (`max-width: 720px`) para mantener la proporción de las teclas en monitores anchos.

* **Exportación y Guardado de Archivos**:
  - Implementación de exportación directa de programas BASIC en formato de cinta `.tzx` desde la memoria RAM del emulador.
  - Implementación de exportación de snapshots en formato `.z80`.
  - Integración de cuadros de diálogo (`prompt`) para personalizar el nombre del archivo al exportar tanto `.tzx` como `.z80`.

* **Filtros Visuales y Efecto CRT**:
  - Adición del efecto CRT en tiempo real (líneas de escaneo / *scanlines*, máscara de subpíxeles RGB y sombra de viñeta cóncava) activado por defecto.
  - Nueva opción en el menú `Pantalla ➔ Efecto CRT (Scanlines)` con casillero de verificación para alternar el filtro dinámicamente.

* **Traducción e Interfaz en Español**:
  - Traducción completa de los menús de la interfaz (`Archivo`, `Modelo`, `Pantalla`, `Acerca de`) y ventanas modales al español.
  - Mejora en el contraste visual de los enlaces en el buscador de juegos de Internet Archive.
  - Extracción de metadatos globales (`common.js`) para desacoplar index.html.

4.0.0 (2026-08-09)
------------------

* Touch & Mobile Virtual Keyboard:
  - Add responsive on-screen Virtual Keyboard with custom Spectrum layout (alpha-numeric keys, symbols, enter, delete, space, and shift controls).
  - Add dynamic lower/upper case lettering on keycaps based on CAPS Shift state.
  - Implement auto-open logic for Virtual Keyboard in 'Fit to width' mode exclusively on mobile touch devices.
  - Add onToggle callback system to dynamically trigger layout recalculations.
* Responsive UI & Toolbar Enhancements:
  - Add Flexbox 100vh layout for 'Fit to width' mode to eliminate bottom gaps and optimize viewports.
  - Reposition Virtual Keyboard toggle button to the left toolbar alongside Tape controls.
  - Convert active machine selector badge into a clean, bold text-only indicator without interactive borders/backgrounds.
  - Remove redundant Fullscreen button to centralize display management around 'Fit to width'.
  - Apply CSS icon inversion filters for high-contrast white toolbar icons in dark theme.
* Header, Footer & About Dialog:
  - Add top Header and Footer to index.html matching original presentation with fork maintainer attribution (Alfonso Alvar) and original project credits (Matt Westcott).
  - Automatically hide Header and Footer when entering 'Fit to width' mode to maximize screen space.
  - Add "About JSSpeccy v4.0.0" dialog in top menu with dark theme, backdrop blur, centered positioning, and ESC/backdrop dismissal handlers.
  - Ensure menu dropdown items wrap cleanly without line breaks (max-content & nowrap).


3.2 (2024-11-23)
----------------

* Add mappings from keyboard symbol keys to equivalent Spectrum keypresses (Andrew Forrest)
* Add support for the Recreated ZX Spectrum's "game mode" (Andrew Forrest)
* Add `keyboardEnabled` configuration option
* Add `uiEnabled` configuration option
* Add `loadSnapshotFromStruct` API endpoint
* Add `onReady` API endpoint
* Enable 'instant tape loading' option in sandbox mode
* Make keyboard event listeners play better with other interactive elements on the page


3.1 (2021-08-26)
----------------

* Real-time tape loading, including turbo loaders (except for direct recording, CSW and generalized data TZX blocks)
* Emulate floating bus behaviour
* Fix typo in docs (`openURL` -> `openUrl`)


3.0.1 (2021-08-16)
------------------

* Fix relative jump instructions to not treat +0x7f as -0x81 (which broke the Protracker 3 player)


3.0 (2021-08-14)
----------------

Initial release of JSSpeccy 3.

* Web Worker and WebAssembly emulation core
* 48K, 128K, Pentagon emulaton
* Accurate multicolour
* AY and beeper audio
* TAP, TZX, Z80, SNA, SZX, ZIP loading
* Fullscreen mode
* Browsing games from Internet Archive
