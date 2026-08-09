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

        this.list.style.minWidth = '160px';
        this.list.style.width = 'max-content';
        this.list.style.whiteSpace = 'nowrap';

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
        button.style.whiteSpace = 'nowrap';
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
            this.dialogOverlay = document.createElement('div');
            this.dialogOverlay.style.display = 'none';
            this.dialogOverlay.style.position = 'fixed';
            this.dialogOverlay.style.top = '0';
            this.dialogOverlay.style.left = '0';
            this.dialogOverlay.style.width = '100vw';
            this.dialogOverlay.style.height = '100vh';
            this.dialogOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            this.dialogOverlay.style.backdropFilter = 'blur(4px)';
            this.dialogOverlay.style.zIndex = '999';
            container.appendChild(this.dialogOverlay);

            this.dialogOverlay.addEventListener('click', () => {
                this.hideDialog();
            });

            this.dialogKeyHandler = (e) => {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    this.hideDialog();
                }
            };

            this.dialog = document.createElement('div');
            this.dialog.style.display = 'none';
            this.dialog.style.backgroundColor = '#18181f';
            this.dialog.style.color = '#f0f0f5';
            this.dialog.style.border = '1px solid #2d2d38';
            this.dialog.style.borderRadius = '12px';
            this.dialog.style.boxShadow = '0 16px 40px rgba(0,0,0,0.75)';
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
            });

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
            document.body.classList.add('fit-to-width');
            this.appContainer.style.width = '100%';
            this.appContainer.style.maxWidth = '100%';
            this.appContainer.style.height = '100%';
            this.appContainer.style.maxHeight = '100dvh';
            this.appContainer.style.display = 'flex';
            this.appContainer.style.flexDirection = 'column';
            this.appContainer.style.justifyContent = 'space-between';
            this.appContainer.style.boxSizing = 'border-box';
            this.appContainer.style.overflow = 'hidden';

            if (this.menuBar && this.menuBar.elem) {
                this.menuBar.elem.style.flexShrink = '0';
            }
            if (this.toolbar && this.toolbar.elem) {
                this.toolbar.elem.style.flexShrink = '0';
            }

            this.canvasWrapper.style.flex = '1 1 0px';
            this.canvasWrapper.style.minHeight = '0';
            this.canvasWrapper.style.minWidth = '0';
            this.canvasWrapper.style.width = '100%';
            this.canvasWrapper.style.height = '100%';
            this.canvasWrapper.style.display = 'flex';
            this.canvasWrapper.style.alignItems = 'center';
            this.canvasWrapper.style.justifyContent = 'center';
            this.canvasWrapper.style.overflow = 'hidden';

            this.canvas.style.maxWidth = '100%';
            this.canvas.style.maxHeight = '100%';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.aspectRatio = '4 / 3';
            this.canvas.style.objectFit = 'contain';

            if (parent) {
                parent.style.width = '100%';
                parent.style.maxWidth = '100%';
                parent.style.height = '100%';
                parent.style.maxHeight = '100dvh';
            }
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
            if (this.virtualKeyboard) {
                if (isMobileDevice) {
                    this.virtualKeyboard.show();
                } else {
                    this.virtualKeyboard.hide();
                }
            }
        } else {
            document.body.classList.remove('fit-to-width');
            this.appContainer.style.height = '';
            this.appContainer.style.display = '';
            this.appContainer.style.flexDirection = '';
            this.appContainer.style.justifyContent = '';

            this.canvasWrapper.style.flex = '';
            this.canvasWrapper.style.height = '';

            const numZoom = parseFloat(this.zoom) || 1;

            const displayWidth = 320 * numZoom;
            const displayHeight = 240 * numZoom;
            this.canvas.style.width = displayWidth + 'px';
            this.canvas.style.height = displayHeight + 'px';
            this.canvas.style.maxWidth = '';
            this.canvas.style.maxHeight = '';
            this.canvas.style.aspectRatio = '';
            this.appContainer.style.width = displayWidth + 'px';
            this.appContainer.style.maxWidth = displayWidth + 'px';
            if (parent) {
                parent.style.maxWidth = displayWidth + 'px';
                parent.style.height = '';
            }
            if (this.virtualKeyboard) {
                this.virtualKeyboard.hide();
            }
        }

        this.emit('setZoom', factor);
    }

    updateCanvasMaxHeight() {
        // Handled dynamically by flex layout
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
        if (this.dialogOverlay) {
            this.dialogOverlay.style.display = 'block';
        }
        this.dialog.style.display = 'block';
        this.dialog.style.position = 'fixed';
        this.dialog.style.backgroundColor = '#18181f';
        this.dialog.style.color = '#f0f0f5';
        this.dialog.style.border = '1px solid #2d2d38';
        this.dialog.style.borderRadius = '12px';
        this.dialog.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.75)';
        this.dialog.style.zIndex = '1000';
        this.dialog.style.width = '85%';
        this.dialog.style.maxWidth = '480px';
        this.dialog.style.height = 'auto';
        this.dialog.style.maxHeight = '80vh';
        this.dialog.style.left = '50%';
        this.dialog.style.top = '50%';
        this.dialog.style.transform = 'translate(-50%, -50%)';
        this.dialog.style.overflowY = 'auto';
        this.dialogBody.style.padding = '8px 16px 16px 16px';

        document.addEventListener('keydown', this.dialogKeyHandler);

        return this.dialogBody;
    }

    hideDialog() {
        if (this.dialogOverlay) {
            this.dialogOverlay.style.display = 'none';
        }
        this.dialog.style.display = 'none';
        this.dialogBody.innerHTML = '';
        document.removeEventListener('keydown', this.dialogKeyHandler);
    }

    unload() {
        if (this.uiEnabled) {
            if (this.dialogOverlay) this.dialogOverlay.remove();
            this.dialog.remove();
            document.removeEventListener('keydown', this.dialogKeyHandler);
        }
        this.appContainer.remove();
    }

}
