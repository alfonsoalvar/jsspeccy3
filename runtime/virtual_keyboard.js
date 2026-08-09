import { SPECCY, caps, sym } from './keyboard.js';

const KEYBOARD_LAYOUT = [
    [
        { label: '1', key: SPECCY.ONE },
        { label: '2', key: SPECCY.TWO },
        { label: '3', key: SPECCY.THREE },
        { label: '4', key: SPECCY.FOUR },
        { label: '5', key: SPECCY.FIVE },
        { label: '6', key: SPECCY.SIX },
        { label: '7', key: SPECCY.SEVEN },
        { label: '8', key: SPECCY.EIGHT },
        { label: '9', key: SPECCY.NINE },
        { label: '0', key: SPECCY.ZERO },
        { label: 'DEL', key: caps(SPECCY.ZERO), flex: 1.5, type: 'action' },
    ],
    [
        { label: 'Q', key: SPECCY.Q },
        { label: 'W', key: SPECCY.W },
        { label: 'E', key: SPECCY.E },
        { label: 'R', key: SPECCY.R },
        { label: 'T', key: SPECCY.T },
        { label: 'Y', key: SPECCY.Y },
        { label: 'U', key: SPECCY.U },
        { label: 'I', key: SPECCY.I },
        { label: 'O', key: SPECCY.O },
        { label: 'P', key: SPECCY.P },
    ],
    [
        { label: 'A', key: SPECCY.A },
        { label: 'S', key: SPECCY.S },
        { label: 'D', key: SPECCY.D },
        { label: 'F', key: SPECCY.F },
        { label: 'G', key: SPECCY.G },
        { label: 'H', key: SPECCY.H },
        { label: 'J', key: SPECCY.J },
        { label: 'K', key: SPECCY.K },
        { label: 'L', key: SPECCY.L },
        { label: 'ENTER', key: SPECCY.ENTER, flex: 2, type: 'action' },
    ],
    [
        { label: 'CAPS', key: SPECCY.CAPS_SHIFT, flex: 1.5, type: 'shift', isCaps: true },
        { label: 'Z', key: SPECCY.Z },
        { label: 'X', key: SPECCY.X },
        { label: 'C', key: SPECCY.C },
        { label: 'V', key: SPECCY.V },
        { label: 'B', key: SPECCY.B },
        { label: 'N', key: SPECCY.N },
        { label: 'M', key: SPECCY.M },
        { label: ',', key: sym(SPECCY.N), type: 'action' },
        { label: '.', key: sym(SPECCY.M), type: 'action' },
        { label: 'CAPS', key: SPECCY.CAPS_SHIFT, flex: 1.5, type: 'shift', isCaps: true },
    ],

    [
        { label: 'SPACE', key: SPECCY.BREAK_SPACE, flex: 5, type: 'action' },
        { label: '◀', key: caps(SPECCY.FIVE), flex: 1.2, type: 'nav' },
        { label: '▲', key: caps(SPECCY.SEVEN), flex: 1.2, type: 'nav' },
        { label: '▼', key: caps(SPECCY.SIX), flex: 1.2, type: 'nav' },
        { label: '▶', key: caps(SPECCY.EIGHT), flex: 1.2, type: 'nav' },
    ]
];




export class VirtualKeyboard {
    constructor(container, emulator) {
        this.container = container;
        this.emulator = emulator;
        this.visible = true;

        this.capsLocked = false;

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
                    max-width: 100%;
                    margin: 0;
                    flex-shrink: 0;
                    padding: 4px 6px;
                    box-sizing: border-box;
                    background: #1c1c1e;
                    border-top: 1px solid #3a3a3c;
                    border-radius: 0;
                    user-select: none;
                    -webkit-user-select: none;
                    touch-action: manipulation;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                .jsspeccy-vk-row {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 5px;
                    gap: 3px;
                }
                .jsspeccy-vk-row:last-child {
                    margin-bottom: 0;
                }
                .jsspeccy-vk-key {
                    flex: 1;
                    min-width: 0;
                    height: 32px;
                    background: #2c2c2e;
                    color: #f2f2f7;
                    border: 1px solid #48484a;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 2px 0 #141414;
                    position: relative;
                    touch-action: none;
                    transition: background-color 0.1s, transform 0.05s;
                }
                .jsspeccy-vk-key:active, .jsspeccy-vk-key.active {
                    background: #007aff !important;
                    color: #ffffff !important;
                    transform: translateY(2px);
                    box-shadow: none;
                }
                .jsspeccy-vk-key.shift-active {
                    background: #ff9500 !important;
                    color: #ffffff !important;
                    border-color: #ffb340;
                }
                .jsspeccy-vk-key-action {
                    background: #3a3a3c;
                    font-size: 11px;
                }
                .jsspeccy-vk-key-shift {
                    background: #3a3a3c;
                    color: #ffcc00;
                    font-size: 11px;
                }
                .jsspeccy-vk-key-nav {
                    background: #242426;
                    color: #30d158;
                    border-color: #3a3a3c;
                    font-size: 15px;
                }
                @media (max-width: 480px), (max-height: 700px) {
                    .jsspeccy-virtual-keyboard {
                        padding: 3px;
                        margin-top: 4px;
                    }
                    .jsspeccy-vk-row {
                        margin-bottom: 3px;
                        gap: 2px;
                    }
                    .jsspeccy-vk-key {
                        height: 28px;
                        font-size: 10px;
                    }
                    .jsspeccy-vk-key-nav {
                        font-size: 13px;
                    }
                }

            `;
            document.head.appendChild(styleElem);
        }
    }

    buildLayout() {
        KEYBOARD_LAYOUT.forEach(rowDef => {
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

                const labelElem = document.createElement('span');
                labelElem.className = 'main-label';
                if (/^[A-Z]$/.test(item.label)) {
                    labelElem.setAttribute('data-letter', item.label);
                    labelElem.textContent = this.capsLocked ? item.label : item.label.toLowerCase();
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

    updateLetterCase() {
        const letterElems = this.elem.querySelectorAll('.main-label[data-letter]');
        letterElems.forEach(elem => {
            const letter = elem.getAttribute('data-letter');
            elem.textContent = this.capsLocked ? letter : letter.toLowerCase();
        });
    }

    attachKeyEvents(keyElem, item) {
        const pressKey = (e) => {
            if (e) e.preventDefault();
            keyElem.classList.add('active');

            if (item.isCaps) {
                this.capsLocked = !this.capsLocked;
                const capsButtons = this.elem.querySelectorAll('[is-caps="true"]');
                if (this.capsLocked) {
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



            if (this.emulator.keyboardHandler) {
                if (item.key && item.key.caps) {
                    this.emulator.keyboardHandler.keyDown(SPECCY.CAPS_SHIFT);
                }
                if (item.key && item.key.sym) {
                    this.emulator.keyboardHandler.keyDown(SPECCY.SYMBOL_SHIFT);
                }
                this.emulator.keyboardHandler.keyDown(item.key);
            }
        };

        const releaseKey = (e) => {
            if (e) e.preventDefault();
            keyElem.classList.remove('active');

            if (item.isCaps) {
                return;
            }

            if (this.emulator.keyboardHandler) {
                this.emulator.keyboardHandler.keyUp(item.key);
                if (item.key && item.key.caps && !this.capsLocked) {
                    this.emulator.keyboardHandler.keyUp(SPECCY.CAPS_SHIFT);
                }
                if (item.key && item.key.sym) {
                    this.emulator.keyboardHandler.keyUp(SPECCY.SYMBOL_SHIFT);
                }
            }
        };



        if (item.isCaps) keyElem.setAttribute('is-caps', 'true');

        keyElem.addEventListener('pointerdown', pressKey);
        keyElem.addEventListener('pointerup', releaseKey);
        keyElem.addEventListener('pointerleave', releaseKey);
        keyElem.addEventListener('pointercancel', releaseKey);

        keyElem.addEventListener('touchstart', pressKey, { passive: false });
        keyElem.addEventListener('touchend', releaseKey, { passive: false });
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

