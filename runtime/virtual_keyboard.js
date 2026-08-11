import { SPECCY, caps, sym } from './keyboard.js';

const KEYBOARD_LAYOUT_PLUS2 = [
    [
        { label: 'VIDEO NORM', subLabel: 'VIDEO INV', key: caps(SPECCY.FOUR), type: 'action', flex: 1.2 },
        { label: '1', subLabel: '!', key: SPECCY.ONE },
        { label: '2', subLabel: '@', key: SPECCY.TWO },
        { label: '3', subLabel: '#', key: SPECCY.THREE },
        { label: '4', subLabel: '$', key: SPECCY.FOUR },
        { label: '5', subLabel: '%', key: SPECCY.FIVE },
        { label: '6', subLabel: '&', key: SPECCY.SIX },
        { label: '7', subLabel: "'", key: SPECCY.SEVEN },
        { label: '8', subLabel: '(', key: SPECCY.EIGHT },
        { label: '9', subLabel: ')', key: SPECCY.NINE },
        { label: '0', subLabel: '_', key: SPECCY.ZERO },
        { label: 'BREAK', key: caps(SPECCY.BREAK_SPACE), flex: 1.2, type: 'action' },
    ],
    [
        { label: 'BORRAR', key: caps(SPECCY.ZERO), flex: 1.3, type: 'action' },
        { label: 'GRAF', key: caps(SPECCY.NINE), flex: 1.1, type: 'action' },
        { label: 'Q', key: SPECCY.Q },
        { label: 'W', key: SPECCY.W },
        { label: 'E', key: SPECCY.E },
        { label: 'R', subLabel: '< RUN', key: SPECCY.R },
        { label: 'T', subLabel: '>', key: SPECCY.T },
        { label: 'Y', subLabel: '/', key: SPECCY.Y },
        { label: 'U', subLabel: '¿', key: SPECCY.U },
        { label: 'I', subLabel: 'CODE', key: SPECCY.I },
        { label: 'O', key: SPECCY.O },
        { label: 'P', key: SPECCY.P },
    ],
    [
        { label: 'EXTRA', key: caps(SPECCY.THREE), flex: 1.2, type: 'action' },
        { label: 'EDIT', key: caps(SPECCY.ONE), flex: 1.1, type: 'action' },
        { label: 'A', key: SPECCY.A },
        { label: 'S', subLabel: 'ñ', key: SPECCY.S },
        { label: 'D', subLabel: 'Ñ', key: SPECCY.D },
        { label: 'F', key: SPECCY.F },
        { label: 'G', key: SPECCY.G },
        { label: 'H', subLabel: '^', key: SPECCY.H },
        { label: 'J', subLabel: '-LOAD', key: SPECCY.J },
        { label: 'K', subLabel: '+', key: SPECCY.K },
        { label: 'L', subLabel: '=', key: SPECCY.L },
        { label: 'INTRO', key: SPECCY.ENTER, flex: 1.6, type: 'action' },
    ],
    [
        { label: 'MAYUSCULAS', key: SPECCY.CAPS_SHIFT, flex: 1.5, type: 'shift', isCaps: true },
        { label: 'BLOQ MAYS', key: caps(SPECCY.TWO), flex: 1.2, type: 'action', isCapsLock: true },
        { label: 'Z', subLabel: ':', key: SPECCY.Z },
        { label: 'X', subLabel: 'Pt', key: SPECCY.X },
        { label: 'C', subLabel: '?', key: SPECCY.C },
        { label: 'V', subLabel: '/', key: SPECCY.V },
        { label: 'B', subLabel: '*', key: SPECCY.B },
        { label: 'N', subLabel: ',', key: SPECCY.N },
        { label: 'M', subLabel: '.', key: SPECCY.M },
        { label: '.', key: sym(SPECCY.M), type: 'action' },
    ],
    [
        { label: 'SIMB', key: SPECCY.SYMBOL_SHIFT, flex: 1.2, type: 'shift', isSym: true },
        { label: ';', key: sym(SPECCY.O), type: 'action' },
        { label: '"', key: sym(SPECCY.P), type: 'action' },
        { label: '\u25C0', key: caps(SPECCY.FIVE), flex: 1.1, type: 'nav' },
        { label: '\u25B6', key: caps(SPECCY.EIGHT), flex: 1.1, type: 'nav' },
        { label: 'ESPACIO', key: SPECCY.BREAK_SPACE, flex: 3.5, type: 'action' },
        { label: '\u25B2', key: caps(SPECCY.SEVEN), flex: 1.1, type: 'nav' },
        { label: '\u25BC', key: caps(SPECCY.SIX), flex: 1.1, type: 'nav' },
        { label: ',', key: sym(SPECCY.N), type: 'action' },
        { label: 'SIMB', key: SPECCY.SYMBOL_SHIFT, flex: 1.2, type: 'shift', isSym: true },
    ]
];

export class VirtualKeyboard {
    constructor(container, emulator) {
        this.container = container;
        this.emulator = emulator;
        this.visible = true;

        this.capsShiftActive = false;
        this.capsLockActive = false;
        this.symLocked = false;

        this.elem = document.createElement('div');
        this.elem.className = 'jsspeccy-virtual-keyboard';
        this.applyStyles();
        this.buildLayout();

        this.container.appendChild(this.elem);
    }

    applyStyles() {
        const styleId = 'jsspeccy-vk-styles';
        if (!document.getElementById(styleId)) {
            const styleElem = document.createElement('style');
            styleElem.id = styleId;
            styleElem.textContent = `
                .jsspeccy-virtual-keyboard {
                    width: 100%;
                    max-width: 720px;
                    margin: 0 auto;
                    flex-shrink: 0;
                    padding: 4px 4px;
                    box-sizing: border-box;
                    background: #18181c;
                    border-top: 2px solid #33333d;
                    user-select: none;
                    -webkit-user-select: none;
                    touch-action: manipulation;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                .jsspeccy-vk-row {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 4px;
                    gap: 2px;
                }
                .jsspeccy-vk-row:last-child {
                    margin-bottom: 0;
                }
                .jsspeccy-vk-key {
                    flex: 1;
                    min-width: 0;
                    height: 30px;
                    background: #2a2a32;
                    color: #f2f2f7;
                    border: 1px solid #42424e;
                    border-radius: 4px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 2px 0 #121216;
                    position: relative;
                    touch-action: none;
                    transition: background-color 0.1s, transform 0.05s;
                    padding: 0 1px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .jsspeccy-vk-key:active, .jsspeccy-vk-key.active {
                    background: #e11d48 !important;
                    color: #ffffff !important;
                    transform: translateY(2px);
                    box-shadow: none;
                }
                .jsspeccy-vk-key.shift-active {
                    background: #d97706 !important;
                    color: #ffffff !important;
                    border-color: #f59e0b;
                }
                .jsspeccy-vk-key-action {
                    background: #343440;
                    color: #e2e8f0;
                    font-size: 9px;
                    letter-spacing: -0.2px;
                }
                .jsspeccy-vk-key-shift {
                    background: #383846;
                    color: #fbbf24;
                    font-size: 9px;
                    letter-spacing: -0.2px;
                }
                .jsspeccy-vk-key-nav {
                    background: #2a2a32;
                    color: #f2f2f7;
                    border-color: #42424e;
                    font-size: 13px;
                }
                .jsspeccy-vk-sublabel {
                    position: absolute;
                    top: 1px;
                    right: 2px;
                    font-size: 7.5px;
                    font-weight: 700;
                    color: #f59e0b;
                    pointer-events: none;
                    line-height: 1;
                    opacity: 0.85;
                }
                .jsspeccy-virtual-keyboard.sym-active-mode .jsspeccy-vk-sublabel {
                    color: #38bdf8 !important;
                    opacity: 1 !important;
                    font-size: 8px !important;
                }
                @media (max-width: 520px), (max-height: 700px) {
                    .jsspeccy-virtual-keyboard {
                        padding: 3px 2px;
                    }
                    .jsspeccy-vk-row {
                        margin-bottom: 2px;
                        gap: 1.5px;
                    }
                    .jsspeccy-vk-key {
                        height: 26px;
                        font-size: 9.5px;
                        border-radius: 3px;
                    }
                    .jsspeccy-vk-key-action, .jsspeccy-vk-key-shift {
                        font-size: 8px;
                        padding: 0;
                    }
                    .jsspeccy-vk-key-nav {
                        font-size: 12px;
                    }
                    .jsspeccy-vk-sublabel {
                        font-size: 6.5px;
                        top: 0px;
                        right: 1px;
                    }
                }
            `;
            document.head.appendChild(styleElem);
        }
    }

    buildLayout() {
        KEYBOARD_LAYOUT_PLUS2.forEach(rowDef => {
            const rowElem = document.createElement('div');
            rowElem.className = 'jsspeccy-vk-row';

            rowDef.forEach(item => {
                const keyElem = document.createElement('div');
                keyElem.className = 'jsspeccy-vk-key';
                if (item.flex) {
                    keyElem.style.flex = item.flex;
                }
                if (item.type) {
                    keyElem.classList.add(`jsspeccy-vk-key-${item.type}`);
                }

                if (item.subLabel) {
                    const subElem = document.createElement('span');
                    subElem.className = 'jsspeccy-vk-sublabel';
                    subElem.textContent = item.subLabel;
                    keyElem.appendChild(subElem);
                }

                const labelElem = document.createElement('span');
                labelElem.className = 'main-label';
                if (/^[A-Z]$/.test(item.label)) {
                    labelElem.setAttribute('data-letter', item.label);
                    labelElem.textContent = (this.capsShiftActive || this.capsLockActive) ? item.label : item.label.toLowerCase();
                } else {
                    labelElem.textContent = item.label;
                }
                keyElem.appendChild(labelElem);

                this.attachKeyEvents(keyElem, item);
                rowElem.appendChild(keyElem);
            });

            this.elem.appendChild(rowElem);
        });
    }

    isUpperMode() {
        return this.capsShiftActive || this.capsLockActive;
    }

    updateLetterCase() {
        const isUpper = this.isUpperMode();
        const letterElems = this.elem.querySelectorAll('.main-label[data-letter]');
        letterElems.forEach(elem => {
            const letter = elem.getAttribute('data-letter');
            elem.textContent = isUpper ? letter : letter.toLowerCase();
        });
    }

    attachKeyEvents(keyElem, item) {
        const pressKey = (e) => {
            if (e) e.preventDefault();
            keyElem.classList.add('active');

            // Handle MAYÚS (Caps Shift)
            if (item.isCaps) {
                this.capsShiftActive = !this.capsShiftActive;
                const capsButtons = this.elem.querySelectorAll('[is-caps="true"]');
                if (this.capsShiftActive) {
                    capsButtons.forEach(btn => btn.classList.add('shift-active'));
                    if (this.emulator.keyboardHandler) {
                        this.emulator.keyboardHandler.keyDown(SPECCY.CAPS_SHIFT);
                    }
                } else {
                    capsButtons.forEach(btn => btn.classList.remove('shift-active'));
                    if (this.emulator.keyboardHandler) {
                        this.emulator.keyboardHandler.keyUp(SPECCY.CAPS_SHIFT);
                    }
                }
                this.updateLetterCase();
                return;
            }

            // Handle BLOQ MAYS (Caps Lock = Caps Shift + 2 in Spectrum OS)
            if (item.isCapsLock) {
                this.capsLockActive = !this.capsLockActive;
                if (this.capsLockActive) {
                    keyElem.classList.add('shift-active');
                } else {
                    keyElem.classList.remove('shift-active');
                }

                // Send hardware Spectrum combination Caps Shift + 2 to toggle Spectrum BASIC Caps Lock
                if (this.emulator.keyboardHandler) {
                    this.emulator.keyboardHandler.keyDown(SPECCY.CAPS_SHIFT);
                    this.emulator.keyboardHandler.keyDown(SPECCY.TWO);
                    setTimeout(() => {
                        if (this.emulator.keyboardHandler) {
                            this.emulator.keyboardHandler.keyUp(SPECCY.TWO);
                            if (!this.capsShiftActive) {
                                this.emulator.keyboardHandler.keyUp(SPECCY.CAPS_SHIFT);
                            }
                        }
                    }, 60);
                }
                this.updateLetterCase();
                return;
            }

            // Handle SIMB (Symbol Shift)
            if (item.isSym) {
                this.symLocked = !this.symLocked;
                const symButtons = this.elem.querySelectorAll('[is-sym="true"]');
                if (this.symLocked) {
                    symButtons.forEach(btn => btn.classList.add('shift-active'));
                    this.elem.classList.add('sym-active-mode');
                    if (this.emulator.keyboardHandler) {
                        this.emulator.keyboardHandler.keyDown(SPECCY.SYMBOL_SHIFT);
                    }
                } else {
                    symButtons.forEach(btn => btn.classList.remove('shift-active'));
                    this.elem.classList.remove('sym-active-mode');
                    if (this.emulator.keyboardHandler) {
                        this.emulator.keyboardHandler.keyUp(SPECCY.SYMBOL_SHIFT);
                    }
                }
                return;
            }

            // Standard keys
            if (this.emulator.keyboardHandler) {
                if (item.key) {
                    if (item.key.caps && !this.capsShiftActive) {
                        this.emulator.keyboardHandler.keyDown(SPECCY.CAPS_SHIFT);
                    }
                    if (item.key.sym && !this.symLocked) {
                        this.emulator.keyboardHandler.keyDown(SPECCY.SYMBOL_SHIFT);
                    }
                    if (item.key.row !== undefined) {
                        this.emulator.keyboardHandler.keyDown(item.key);
                    }
                }
            }
        };

        const releaseKey = (e) => {
            if (e) e.preventDefault();
            keyElem.classList.remove('active');

            if (item.isCaps || item.isCapsLock || item.isSym) {
                return;
            }

            if (this.emulator.keyboardHandler) {
                if (item.key) {
                    if (item.key.row !== undefined) {
                        this.emulator.keyboardHandler.keyUp(item.key);
                    }
                    if (item.key.caps && !this.capsShiftActive) {
                        this.emulator.keyboardHandler.keyUp(SPECCY.CAPS_SHIFT);
                    }
                    if (item.key.sym && !this.symLocked) {
                        this.emulator.keyboardHandler.keyUp(SPECCY.SYMBOL_SHIFT);
                    }
                }
            }

            // Auto-release MAYÚS (Caps Shift) after typing a character if it was temporary shift
            if (this.capsShiftActive && !this.capsLockActive) {
                this.capsShiftActive = false;
                const capsButtons = this.elem.querySelectorAll('[is-caps="true"]');
                capsButtons.forEach(btn => btn.classList.remove('shift-active'));
                if (this.emulator.keyboardHandler) {
                    this.emulator.keyboardHandler.keyUp(SPECCY.CAPS_SHIFT);
                }
                this.updateLetterCase();
            }

            // Auto-release SIMB (Symbol Shift) after typing a character
            if (this.symLocked) {
                this.symLocked = false;
                const symButtons = this.elem.querySelectorAll('[is-sym="true"]');
                symButtons.forEach(btn => btn.classList.remove('shift-active'));
                this.elem.classList.remove('sym-active-mode');
                if (this.emulator.keyboardHandler) {
                    this.emulator.keyboardHandler.keyUp(SPECCY.SYMBOL_SHIFT);
                }
            }
        };

        if (item.isCaps) keyElem.setAttribute('is-caps', 'true');
        if (item.isSym) keyElem.setAttribute('is-sym', 'true');
        if (item.isCapsLock) keyElem.setAttribute('is-caps-lock', 'true');

        keyElem.addEventListener('pointerdown', pressKey);
        keyElem.addEventListener('pointerup', releaseKey);
    }

    toggle() {
        this.visible = !this.visible;
        this.elem.style.display = this.visible ? 'block' : 'none';
        if (this.onToggle) this.onToggle();
        return this.visible;
    }

    show() {
        this.visible = true;
        this.elem.style.display = 'block';
        if (this.onToggle) this.onToggle();
    }

    hide() {
        this.visible = false;
        this.elem.style.display = 'none';
        if (this.onToggle) this.onToggle();
    }
}
