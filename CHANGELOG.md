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
