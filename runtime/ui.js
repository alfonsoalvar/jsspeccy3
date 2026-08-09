import EventEmitter from 'events';

import playIcon from './icons/play.svg';
import closeIcon from './icons/close.svg';
import { VirtualKeyboard } from './virtual_keyboard.js';



export class MenuBar {
    constructor(container) {
        this.elem = document.createElement('div');
        this.elem.style.display = 'flow-root';
        this.elem.style.backgroundColor = '#1e1e24';
        this.elem.style.color = '#f0f0f5';
        this.elem.style.borderBottom = '1px solid #2d2d38';
        this.elem.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        this.elem.style.top = '0';
        this.elem.style.width = '100%';
        container.appendChild(this.elem);
        this.currentMouseenterEvent = null;
        this.currentMouseoutEvent = null;
    }

    addMenu(title) {
        return new Menu(this.elem, title);
    }

    enterFullscreen() {
        this.elem.style.position = 'absolute';
    }
    exitFullscreen() {
        this.elem.style.position = 'static';
    }
    show() {
        this.elem.style.visibility = 'visible';
    }
    hide() {
        this.elem.style.visibility = 'hidden';
    }
    onmouseenter(e) {
        if (this.currentMouseenterEvent) {
            this.elem.removeEventListener('mouseenter', this.currentMouseenterEvent);
        }
        if (e) {
            this.elem.addEventListener('mouseenter', e);
        }
        this.currentMouseenterEvent = e;
    }
    onmouseout(e) {
        if (this.currentMouseoutEvent) {
            this.elem.removeEventListener('mouseleave', this.currentMouseoutEvent);
        }
        if (e) {
            this.elem.addEventListener('mouseleave', e);
        }
        this.currentMouseoutEvent = e;
    }
}

export class Menu {
    constructor(container, title) {
        const elem = document.createElement('div');
        elem.style.float = 'left';
        elem.style.position = 'relative';
        container.appendChild(elem);

        const button = document.createElement('button');
        button.style.margin = '2px 4px';
        button.style.padding = '3px 8px';
        button.style.backgroundColor = '#2a2a34';
        button.style.color = '#f0f0f5';
        button.style.border = '1px solid #3a3a48';
        button.style.borderRadius = '4px';
        button.style.fontSize = '12px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.15s';
        button.innerText = title;

        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#383846';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#2a2a34';
        });

        elem.appendChild(button);

        this.list = document.createElement('ul');
        this.list.style.position = 'absolute';
        this.list.style.width = '150px';
        this.list.style.backgroundColor = '#1e1e24';
        this.list.style.color = '#f0f0f5';
        this.list.style.listStyleType = 'none';
        this.list.style.margin = '0';
        this.list.style.padding = '4px 0';
        this.list.style.border = '1px solid #3a3a48';
        this.list.style.borderRadius = '6px';
        this.list.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
        this.list.style.display = 'none';
        this.list.style.zIndex = '1000';
        elem.appendChild(this.list);

        button.addEventListener('click', () => {
            if (this.isOpen()) {
                this.close();
            } else {
                this.open();
            }
        })
        document.addEventListener('click', (e) => {
            if (e.target != button && this.isOpen()) this.close();
        })
    }

    isOpen() {
        return this.list.style.display == 'block';
    }

    open() {
        this.list.style.display = 'block';
    }

    close() {
        this.list.style.display = 'none';
    }

    addItem(title, onClick) {
        const li = document.createElement('li');
        this.list.appendChild(li);
        const button = document.createElement('button');
        button.innerText = title;
        button.style.width = '100%';
        button.style.textAlign = 'left';
        button.style.borderWidth = '0';
        button.style.padding = '6px 12px';
        button.style.backgroundColor = 'transparent';
        button.style.color = '#f0f0f5';
        button.style.fontSize = '12px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.1s';

        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#2d2d3a';
            button.style.color = '#ffffff';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = 'transparent';
            button.style.color = '#f0f0f5';
        });
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        li.appendChild(button);
        return {
            setBullet: () => {
                button.innerText = String.fromCharCode(0x2022) + ' ' + title;
            },
            unsetBullet: () => {
                button.innerText = title;
            },
            setCheckbox: () => {
                button.innerText = String.fromCharCode(0x2713) + ' ' + title;
            },
            unsetCheckbox: () => {
                button.innerText = title;
            },
        }
    }
}

export class Toolbar {
    constructor(container) {
        this.elem = document.createElement('div');
        this.elem.style.backgroundColor = '#1e1e24';
        this.elem.style.borderTop = '1px solid #2d2d38';
        this.elem.style.padding = '3px 6px';
        this.elem.style.bottom = '0';
        this.elem.style.width = '100%';
        this.elem.style.boxSizing = 'border-box';
        this.elem.style.display = 'flex';
        this.elem.style.alignItems = 'center';
        this.elem.style.justifyContent = 'space-between';
        container.appendChild(this.elem);

        this.leftContainer = document.createElement('div');
        this.leftContainer.style.display = 'flex';
        this.leftContainer.style.alignItems = 'center';
        this.elem.appendChild(this.leftContainer);

        this.rightContainer = document.createElement('div');
        this.rightContainer.style.display = 'flex';
        this.rightContainer.style.alignItems = 'center';
        this.elem.appendChild(this.rightContainer);

        this.machineBadge = document.createElement('div');
        this.machineBadge.style.display = 'inline-flex';
        this.machineBadge.style.alignItems = 'center';
        this.machineBadge.style.justifyContent = 'center';
        this.machineBadge.style.height = '26px';
        this.machineBadge.style.margin = '2px 4px';
        this.machineBadge.style.padding = '0 6px';
        this.machineBadge.style.fontSize = '12px';
        this.machineBadge.style.fontWeight = '700';
        this.machineBadge.style.color = '#c0c0d0';

        this.machineBadge.style.backgroundColor = 'transparent';
        this.machineBadge.style.border = 'none';
        this.machineBadge.style.userSelect = 'none';
        this.machineBadge.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.rightContainer.appendChild(this.machineBadge);


        this.currentMouseenterEvent = null;
        this.currentMouseoutEvent = null;
    }
    addButton(icon, opts, onClick) {
        opts = opts || {};
        const button = new ToolbarButton(icon, opts, onClick);
        if (opts.align == 'right') {
            this.rightContainer.insertBefore(button.elem, this.machineBadge);
        } else {
            this.leftContainer.appendChild(button.elem);
        }
        return button;
    }
    setMachine(name) {
        this.machineBadge.textContent = name;
    }

    enterFullscreen() {
        this.elem.style.position = 'absolute';
    }
    exitFullscreen() {
        this.elem.style.position = 'static';
    }
    show() {
        this.elem.style.visibility = 'visible';
    }
    hide() {
        this.elem.style.visibility = 'hidden';
    }
    onmouseenter(e) {
        if (this.currentMouseenterEvent) {
            this.elem.removeEventListener('mouseenter', this.currentMouseenterEvent);
        }
        if (e) {
            this.elem.addEventListener('mouseenter', e);
        }
        this.currentMouseenterEvent = e;
    }
    onmouseout(e) {
        if (this.currentMouseoutEvent) {
            this.elem.removeEventListener('mouseleave', this.currentMouseoutEvent);
        }
        if (e) {
            this.elem.addEventListener('mouseleave', e);
        }
        this.currentMouseoutEvent = e;
    }
}

class ToolbarButton {
    constructor(icon, opts, onClick) {
        this.elem = document.createElement('button');
        this.elem.style.display = 'inline-flex';
        this.elem.style.alignItems = 'center';
        this.elem.style.justifyContent = 'center';
        this.elem.style.height = '26px';
        this.elem.style.margin = '2px 3px';
        this.elem.style.padding = '0 7px';
        this.elem.style.backgroundColor = '#2a2a34';
        this.elem.style.color = '#f0f0f5';
        this.elem.style.border = '1px solid #3a3a48';
        this.elem.style.borderRadius = '4px';
        this.elem.style.boxSizing = 'border-box';
        this.elem.style.cursor = 'pointer';
        this.elem.style.transition = 'background-color 0.15s, border-color 0.15s';


        this.elem.addEventListener('mouseenter', () => {
            this.elem.style.backgroundColor = '#383846';
            this.elem.style.borderColor = '#4e4e5e';
        });
        this.elem.addEventListener('mouseleave', () => {
            this.elem.style.backgroundColor = '#2a2a34';
            this.elem.style.borderColor = '#3a3a48';
        });

        this.setIcon(icon);
        if (opts.label) this.setLabel(opts.label);
        this.elem.addEventListener('click', onClick);
    }
    setIcon(icon) {
        this.elem.innerHTML = icon;
        if (this.elem.firstChild) {
            this.elem.firstChild.style.height = '18px';
            this.elem.firstChild.style.verticalAlign = 'middle';
            this.elem.firstChild.style.filter = 'brightness(0) invert(1)';
        }
    }

    setLabel(label) {
        this.elem.title = label;
    }
    disable() {
        this.elem.disabled = true;
        if (this.elem.firstChild) this.elem.firstChild.style.opacity = '0.4';
    }
    enable() {
        this.elem.disabled = false;
        if (this.elem.firstChild) this.elem.firstChild.style.opacity = '1';
    }
}


export class UIController extends EventEmitter {
    constructor(container, emulator, opts) {
        super();
        this.canvas = emulator.canvas;
        this.uiEnabled = ('uiEnabled' in opts) ? opts.uiEnabled : true;

        /* build UI elements */
        if (this.uiEnabled) {
            this.dialog = document.createElement('div');
            this.dialog.style.display = 'none';
            this.dialog.style.backgroundColor = '#1e1e24';
            this.dialog.style.color = '#f0f0f5';
            this.dialog.style.border = '1px solid #3a3a48';
            this.dialog.style.borderRadius = '8px';
            this.dialog.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
            container.appendChild(this.dialog);
            const dialogCloseButton = document.createElement('button');
            dialogCloseButton.innerHTML = closeIcon;
            dialogCloseButton.style.float = 'right';
            dialogCloseButton.style.border = 'none';
            dialogCloseButton.style.backgroundColor = 'transparent';
            dialogCloseButton.style.cursor = 'pointer';
            if (dialogCloseButton.firstChild) {
                dialogCloseButton.firstChild.style.height = '20px';
                dialogCloseButton.firstChild.style.verticalAlign = 'middle';
                dialogCloseButton.firstChild.style.filter = 'invert(1)';
            }
            this.dialog.appendChild(dialogCloseButton);
            dialogCloseButton.addEventListener('click', () => {
                this.hideDialog();
            })
            this.dialogBody = document.createElement('div');
            this.dialogBody.style.clear = 'both';
            this.dialog.appendChild(this.dialogBody);
        }

        this.appContainer = document.createElement('div');
        container.appendChild(this.appContainer);
        this.appContainer.style.position = 'relative';
        this.appContainer.style.outline = 'none';

        if (this.uiEnabled) {
            this.menuBar = new MenuBar(this.appContainer);
        }
        this.canvasWrapper = document.createElement('div');
        this.canvasWrapper.style.position = 'relative';
        this.canvasWrapper.style.width = '100%';
        this.canvasWrapper.style.display = 'flex';
        this.canvasWrapper.style.justifyContent = 'center';
        this.canvasWrapper.style.alignItems = 'center';
        this.appContainer.appendChild(this.canvasWrapper);

        this.canvasWrapper.appendChild(this.canvas);
        this.canvas.style.objectFit = 'contain';
        this.canvas.style.display = 'block';

        if (this.uiEnabled) {
            this.toolbar = new Toolbar(this.appContainer);
        }

        if (opts.virtualKeyboard !== false) {
            this.virtualKeyboard = new VirtualKeyboard(this.appContainer, emulator);
            this.virtualKeyboard.onToggle = () => {
                this.updateCanvasMaxHeight();
            };
        }


        this.startButton = document.createElement('button');
        this.startButton.innerHTML = playIcon;
        this.canvasWrapper.appendChild(this.startButton);

        this.startButton.style.position = 'absolute';
        this.startButton.style.top = '50%';
        this.startButton.style.left = '50%';
        this.startButton.style.width = '96px';
        this.startButton.style.height = '64px';
        this.startButton.style.marginLeft = '-48px';
        this.startButton.style.marginTop = '-32px';
        this.startButton.style.backgroundColor = 'rgba(20, 20, 28, 0.85)';
        this.startButton.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        this.startButton.style.borderRadius = '12px';
        this.startButton.style.backdropFilter = 'blur(8px)';
        this.startButton.style.cursor = 'pointer';
        this.startButton.style.transition = 'background-color 0.2s, border-color 0.2s, transform 0.1s';
        if (this.startButton.firstChild) {
            this.startButton.firstChild.style.height = '48px';
            this.startButton.firstChild.style.verticalAlign = 'middle';
            this.startButton.firstChild.style.filter = 'invert(1)';
        }
        this.startButton.addEventListener('mouseenter', () => {
            this.startButton.style.backgroundColor = 'rgba(0, 122, 255, 0.9)';
            this.startButton.style.borderColor = '#007aff';
        });
        this.startButton.addEventListener('mouseleave', () => {
            this.startButton.style.backgroundColor = 'rgba(20, 20, 28, 0.85)';
            this.startButton.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });

        this.startButton.addEventListener('click', (e) => {
            emulator.start();
        });
        emulator.on('start', () => {
            this.startButton.style.display = 'none';
        });
        emulator.on('pause', () => {
            this.startButton.style.display = 'block';
        });

        /* variables for tracking zoom / fullscreen state */
        this.zoom = null;
        this.isFullscreen = false;
        this.uiIsHidden = false;
        this.allowUIHiding = true;
        this.hideUITimeout = null;
        this.ignoreNextMouseMove = false;

        /* state changes when entering / exiting fullscreen */
        const fullscreenMouseMove = () => {
            if (this.ignoreNextMouseMove) {
                this.ignoreNextMouseMove = false;
                return;
            }
            this.showUI();
            if (this.hideUITimeout) clearTimeout(this.hideUITimeout);
            this.hideUITimeout = setTimeout(() => {this.hideUI();}, 3000);
        }
        this.appContainer.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                this.isFullscreen = true;
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';

                if (this.uiEnabled) {
                    document.addEventListener('mousemove', fullscreenMouseMove);
                    /* a bogus mousemove event is emitted on entering fullscreen, so ignore it */
                    this.ignoreNextMouseMove = true;

                    this.menuBar.enterFullscreen();
                    this.menuBar.onmouseenter(() => {this.allowUIHiding = false;});
                    this.menuBar.onmouseout(() => {this.allowUIHiding = true;});

                    this.toolbar.enterFullscreen();
                    this.toolbar.onmouseenter(() => {this.allowUIHiding = false;});
                    this.toolbar.onmouseout(() => {this.allowUIHiding = true;});

                    this.hideUI();
                }
                this.emit('setZoom', 'fullscreen');
                emulator.focus();
            } else {
                this.isFullscreen = false;
                if (this.uiEnabled) {
                    if (this.hideUITimeout) clearTimeout(this.hideUITimeout);
                    this.showUI();

                    this.menuBar.exitFullscreen();
                    this.menuBar.onmouseenter(null);
                    this.menuBar.onmouseout(null);

                    this.toolbar.exitFullscreen();
                    this.toolbar.onmouseenter(null);
                    this.toolbar.onmouseout(null);

                    document.removeEventListener('mousemove', fullscreenMouseMove);
                }
                this.setZoom(this.zoom);
            }
        })

        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
        this.setZoom(isMobileDevice ? 'fit' : (opts.zoom || 1));


        if (!opts.sandbox) {
            /* drag-and-drop for loading files */
            this.appContainer.addEventListener('drop', (ev) => {
                ev.preventDefault();
                let loadList = Promise.resolve();
                if (ev.dataTransfer.items) {
                    // Use DataTransferItemList interface to access the file(s)
                    for (const item of ev.dataTransfer.items) {
                        // If dropped items aren't files, reject them
                        if (item.kind === 'file') {
                            const file = item.getAsFile();
                            loadList = loadList.then(() => {
                                emulator.openFile(file);
                            });
                        }
                    }
                } else {
                    // Use DataTransfer interface to access the file(s)
                    for (const file of ev.dataTransfer.files) {
                        loadList = loadList.then(() => {
                            emulator.openFile(file);
                        });
                    }
                }
                loadList.then(() => {
                    if (emulator.isInitiallyPaused) emulator.start();
                })
            });
            this.appContainer.addEventListener('dragover', (ev) => {
                ev.preventDefault();
            });
        }
    }

    setZoom(factor) {
        this.zoom = factor;
        if (this.isFullscreen) {
            document.exitFullscreen();
            return;  // setZoom will be retriggered once fullscreen has exited
        }
        const parent = this.appContainer.parentElement;
        if (factor === 'fit' || factor === 'fit-width') {
            this.canvas.style.width = '100%';
            this.canvas.style.maxWidth = '100%';
            this.canvas.style.height = 'auto';
            this.canvas.style.aspectRatio = '4 / 3';
            this.canvas.style.objectFit = 'contain';
            this.appContainer.style.width = '100%';
            this.appContainer.style.maxWidth = '100%';
            if (parent) {
                parent.style.width = '100%';
                parent.style.maxWidth = '100%';
            }
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
            if (this.virtualKeyboard) {
                if (isMobileDevice) {
                    this.virtualKeyboard.show();
                } else {
                    this.virtualKeyboard.hide();
                }
            }
            this.updateCanvasMaxHeight();
        } else {

            const numZoom = parseFloat(this.zoom) || 1;
            const displayWidth = 320 * numZoom;
            const displayHeight = 240 * numZoom;
            this.canvas.style.width = displayWidth + 'px';
            this.canvas.style.height = displayHeight + 'px';
            this.canvas.style.maxHeight = '';
            this.canvas.style.aspectRatio = '';
            this.appContainer.style.width = displayWidth + 'px';
            this.appContainer.style.maxWidth = displayWidth + 'px';
            if (parent) {
                parent.style.maxWidth = displayWidth + 'px';
            }
            if (this.virtualKeyboard) {
                this.virtualKeyboard.hide();
            }
        }

        this.emit('setZoom', factor);
    }

    updateCanvasMaxHeight() {
        if (this.zoom === 'fit' || this.zoom === 'fit-width') {
            const kbVisible = this.virtualKeyboard && this.virtualKeyboard.visible;
            this.canvas.style.maxHeight = kbVisible ? 'calc(100vh - 290px)' : 'calc(100vh - 70px)';
        }
    }





    enterFullscreen() {
        this.appContainer.requestFullscreen();
    }
    exitFullscreen() {
        if (this.isFullscreen) {
            document.exitFullscreen();
        }
    }
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    hideUI() {
        if (this.uiEnabled && this.allowUIHiding && !this.uiIsHidden) {
            this.uiIsHidden = true;
            this.appContainer.style.cursor = 'none';
            this.menuBar.hide();
            this.toolbar.hide();
        }
    }
    showUI() {
        if (this.uiEnabled && this.uiIsHidden) {
            this.uiIsHidden = false;
            this.appContainer.style.cursor = 'default';
            this.menuBar.show();
            this.toolbar.show();
        }
    }
    showDialog() {
        this.dialog.style.display = 'block';
        this.dialog.style.position = 'absolute';
        this.dialog.style.backgroundColor = '#eee';
        this.dialog.style.zIndex = '100';
        this.dialog.style.width = '75%';
        this.dialog.style.height = '80%';
        this.dialog.style.left = '12%';
        this.dialog.style.top = '10%';
        this.dialog.style.overflow = 'scroll';  // TODO: less hacky scrolling that doesn't hide the close button
        this.dialogBody.style.paddingLeft = '8px';
        this.dialogBody.style.paddingRight = '8px';
        this.dialogBody.style.paddingBottom = '8px';

        return this.dialogBody;
    }
    hideDialog() {
        this.dialog.style.display = 'none';
        this.dialogBody.innerHTML = '';
    }
    unload() {
        if (this.uiEnabled) {
            this.dialog.remove();
        }
        this.appContainer.remove();
    }
}
