import EventEmitter from 'events';
import fileDialog from 'file-dialog';
import JSZip from 'jszip';

import { DisplayHandler } from './render.js';
import { UIController } from './ui.js';
import { parseSNAFile, parseZ80File, parseSZXFile, createZ80Snapshot } from './snapshot.js';
import { TAPFile, TZXFile, exportBasicProgramToTZX } from './tape.js';
import { StandardKeyboardHandler, RecreatedZXSpectrumHandler } from './keyboard.js';
import { AudioHandler } from './audio.js';
import { APP_NAME, APP_VERSION, APP_TITLE, APP_DESCRIPTION, APP_ABOUT_TEXT, APP_AUTHOR, APP_AUTHOR_EMAIL, ORIGINAL_AUTHOR, ORIGINAL_PROJECT } from './common.js';

import openIcon from './icons/open.svg';
import resetIcon from './icons/reset.svg';
import playIcon from './icons/play.svg';
import pauseIcon from './icons/pause.svg';
import fullscreenIcon from './icons/fullscreen.svg';
import exitFullscreenIcon from './icons/exitfullscreen.svg';
import tapePlayIcon from './icons/tape_play.svg';
import tapePauseIcon from './icons/tape_pause.svg';
import keyboardIcon from './icons/keyboard.svg';


const scriptUrl = document.currentScript.src;

class Emulator extends EventEmitter {
    constructor(canvas, opts) {
        super();
        this.canvas = canvas;
        this.worker = new Worker(new URL('jsspeccy-worker.js', scriptUrl));
        this.keyboardEnabled = ('keyboardEnabled' in opts) ? opts.keyboardEnabled : true;
        if (this.keyboardEnabled) {
            this.keyboardHandler = (opts.keyboardMap == 'recreated')
                ? new RecreatedZXSpectrumHandler(this.worker, opts.keyboardEventRoot || document)
                : new StandardKeyboardHandler(this.worker, opts.keyboardEventRoot || document);
        }
        this.displayHandler = new DisplayHandler(this.canvas);
        this.audioHandler = new AudioHandler();
        this.isRunning = false;
        this.isReady = false;
        this.isInitiallyPaused = (!opts.autoStart);
        this.autoLoadTapes = opts.autoLoadTapes || false;
        this.tapeAutoLoadMode = opts.tapeAutoLoadMode || 'default';  // or usr0
        this.tapeIsPlaying = false;
        this.tapeTrapsEnabled = ('tapeTrapsEnabled' in opts) ? opts.tapeTrapsEnabled : true;

        this.msPerFrame = 20;

        this.isExecutingFrame = false;
        this.nextFrameTime = null;
        this.machineType = null;

        this.nextFileOpenID = 0;
        this.fileOpenPromiseResolutions = {};

        this.onReadyHandlers = [];

        this.worker.onmessage = (e) => {
            switch(e.data.message) {
                case 'ready':
                    this.loadRoms().then(() => {
                        this.setMachine(opts.machine || 128);
                        this.setTapeTraps(this.tapeTrapsEnabled);
                        if (opts.openUrl) {
                            this.openUrlList(opts.openUrl).catch(err => {
                                alert(err);
                            }).then(() => {
                                if (opts.autoStart) this.start();
                            });
                        } else if (opts.autoStart) {
                            this.start();
                        }

                        this.isReady = true;
                        for (let i=0; i < this.onReadyHandlers.length; i++) {
                            this.onReadyHandlers[i]();
                        }
                    });
                    break;
                case 'frameCompleted':
                    // benchmarkRunCount++;
                    if ('audioBufferLeft' in e.data) {
                        this.audioHandler.frameCompleted(e.data.audioBufferLeft, e.data.audioBufferRight);
                    }

                    this.displayHandler.frameCompleted(e.data.frameBuffer);
                    if (this.isRunning) {
                        const time = performance.now();
                        if (time > this.nextFrameTime) {
                            /* running at full blast - start next frame but adjust time base
                            to give it the full time allocation */
                            this.runFrame();
                            this.nextFrameTime = time + this.msPerFrame;
                        } else {
                            this.isExecutingFrame = false;
                        }
                    } else {
                        this.isExecutingFrame = false;
                    }
                    break;
                case 'fileOpened':
                    if (e.data.mediaType == 'tape' && this.autoLoadTapes) {
                        const TAPE_LOADERS_BY_MACHINE = {
                            '48': {'default': 'tapeloaders/tape_48.szx', 'usr0': 'tapeloaders/tape_48.szx'},
                            '128': {'default': 'tapeloaders/tape_128.szx', 'usr0': 'tapeloaders/tape_128_usr0.szx'},
                            '5': {'default': 'tapeloaders/tape_pentagon.szx', 'usr0': 'tapeloaders/tape_pentagon_usr0.szx'},
                        };
                        this.openUrl(new URL(TAPE_LOADERS_BY_MACHINE[this.machineType][this.tapeAutoLoadMode], scriptUrl));
                        if (!this.tapeTrapsEnabled) {
                            this.playTape();
                        }
                    }
                    this.fileOpenPromiseResolutions[e.data.id]({
                        mediaType: e.data.mediaType,
                    });
                    if (e.data.mediaType == 'tape') {
                        this.emit('openedTapeFile');
                    }
                    break;
                case 'playingTape':
                    this.tapeIsPlaying = true;
                    this.emit('playingTape');
                    break;
                case 'stoppedTape':
                    this.tapeIsPlaying = false;
                    this.emit('stoppedTape');
                    break;
                case 'snapshotData':
                    if (this.snapshotPromiseResolutions && this.snapshotPromiseResolutions[e.data.id]) {
                        this.snapshotPromiseResolutions[e.data.id](e.data.snapshot);
                        delete this.snapshotPromiseResolutions[e.data.id];
                    }
                    break;
                default:
                    console.log('message received by host:', e.data);
            }
        }
        this.worker.postMessage({
            message: 'loadCore',
            baseUrl: scriptUrl,
        })
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isInitiallyPaused = false;
            this.nextFrameTime = performance.now();
            if (this.keyboardEnabled) {
                this.keyboardHandler.start();
            }
            this.audioHandler.start();
            this.focus();
            this.emit('start');
            window.requestAnimationFrame((t) => {
                this.runAnimationFrame(t);
            });
        }
    }

    focus() {
        if (this.keyboardEnabled && this.keyboardHandler.rootElement.focus) {
            this.keyboardHandler.rootElement.focus();
        }
    }

    setKeyboardEventRoot(newRootElement) {
        if (this.keyboardEnabled) {
            this.keyboardHandler.setRootElement(newRootElement);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            if (this.keyboardEnabled) {
                this.keyboardHandler.stop();
            }
            this.audioHandler.stop();
            this.emit('pause');
        }
    }

    async loadRom(url, page) {
        const response = await fetch(new URL(url, scriptUrl));
        const data = new Uint8Array(await response.arrayBuffer());
        this.worker.postMessage({
            message: 'loadMemory',
            data,
            page: page,
        });
    }

    async loadRoms() {
        await this.loadRom('roms/128-0.rom', 8);
        await this.loadRom('roms/128-1.rom', 9);
        await this.loadRom('roms/48.rom', 10);
        await this.loadRom('roms/pentagon-0.rom', 12);
        await this.loadRom('roms/trdos.rom', 13);
    }


    runFrame() {
        this.isExecutingFrame = true;
        const frameBuffer = this.displayHandler.getNextFrameBuffer();

        if (this.audioHandler.isActive) {
            const [audioBufferLeft, audioBufferRight] = this.audioHandler.frameBuffers;

            this.worker.postMessage({
                message: 'runFrame',
                frameBuffer,
                audioBufferLeft,
                audioBufferRight,
            }, [frameBuffer, audioBufferLeft, audioBufferRight]);
        } else {
            this.worker.postMessage({
                message: 'runFrame',
                frameBuffer,
            }, [frameBuffer]);
        }
    }

    runAnimationFrame(time) {
        if (this.displayHandler.readyToShow()) {
            this.displayHandler.show();
            // benchmarkRenderCount++;
        }
        if (this.isRunning) {
            if (time > this.nextFrameTime && !this.isExecutingFrame) {
                this.runFrame();
                this.nextFrameTime += this.msPerFrame;
            }
            window.requestAnimationFrame((t) => {
                this.runAnimationFrame(t);
            });
        }
    };

    setMachine(type) {
        if (type != 128 && type != 5) type = 48;
        this.worker.postMessage({
            message: 'setMachineType',
            type,
        });
        this.machineType = type;
        this.emit('setMachine', type);
    }

    reset() {
        this.worker.postMessage({message: 'reset'});
    }

    loadSnapshot(snapshot) {
        const fileID = this.nextFileOpenID++;
        this.worker.postMessage({
            message: 'loadSnapshot',
            id: fileID,
            snapshot,
        })
        this.emit('setMachine', snapshot.model);
        return new Promise((resolve, reject) => {
            this.fileOpenPromiseResolutions[fileID] = resolve;
        });
    }

    getSnapshot() {
        const id = this.nextFileOpenID++;
        this.snapshotPromiseResolutions = this.snapshotPromiseResolutions || {};
        return new Promise((resolve) => {
            this.snapshotPromiseResolutions[id] = resolve;
            this.worker.postMessage({
                message: 'createSnapshot',
                id: id
            });
        });
    }

    async saveSnapshot(filename = 'snapshot.z80') {
        const snap = await this.getSnapshot();
        const buffer = createZ80Snapshot(snap);
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async saveBasicTZX(filename = 'program.tzx') {
        try {
            const snap = await this.getSnapshot();
            const buffer = exportBasicProgramToTZX(snap, filename.replace(/\.tzx$/i, ''));
            const blob = new Blob([buffer], { type: 'application/x-tzx' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error saving BASIC program: ' + err.message);
        }
    }

    openTAPFile(data) {
        const fileID = this.nextFileOpenID++;
        this.worker.postMessage({
            message: 'openTAPFile',
            id: fileID,
            data,
        })
        return new Promise((resolve, reject) => {
            this.fileOpenPromiseResolutions[fileID] = resolve;
        });
    }

    openTZXFile(data) {
        const fileID = this.nextFileOpenID++;
        this.worker.postMessage({
            message: 'openTZXFile',
            id: fileID,
            data,
        })
        return new Promise((resolve, reject) => {
            this.fileOpenPromiseResolutions[fileID] = resolve;
        });
    }

    getFileOpener(filename) {
        const cleanName = filename.toLowerCase();
        if (cleanName.endsWith('.z80')) {
            return arrayBuffer => {
                const z80file = parseZ80File(arrayBuffer);
                return this.loadSnapshot(z80file);
            };
        } else if (cleanName.endsWith('.szx')) {
            return arrayBuffer => {
                const szxfile = parseSZXFile(arrayBuffer);
                return this.loadSnapshot(szxfile);
            };
        } else if (cleanName.endsWith('.sna')) {
            return arrayBuffer => {
                const snafile = parseSNAFile(arrayBuffer);
                return this.loadSnapshot(snafile);
            };
        } else if (cleanName.endsWith('.tap')) {
            return arrayBuffer => {
                if (!TAPFile.isValid(arrayBuffer)) {
                    alert('Invalid TAP file');
                } else {
                    return this.openTAPFile(arrayBuffer);
                }
            };
        } else if (cleanName.endsWith('.tzx')) {
            return arrayBuffer => {
                if (!TZXFile.isValid(arrayBuffer)) {
                    alert('Invalid TZX file');
                } else {
                    return this.openTZXFile(arrayBuffer);
                }
            };
        } else if (cleanName.endsWith('.zip')) {
            return async arrayBuffer => {
                const zip = await JSZip.loadAsync(arrayBuffer);
                const openers = [];
                zip.forEach((path, file) => {
                    if (path.startsWith('__MACOSX/')) return;
                    const opener = this.getFileOpener(path);
                    if (opener) {
                        const boundOpener = async () => {
                            const buf = await file.async('arraybuffer');
                            return opener(buf);
                        };
                        openers.push(boundOpener);
                    }
                });
                if (openers.length == 1) {
                    return openers[0]();
                } else if (openers.length == 0) {
                    throw 'No loadable files found inside ZIP file: ' + filename;
                } else {
                    // TODO: prompt to choose a file
                    throw 'Multiple loadable files found inside ZIP file: ' + filename;
                }
            }
        }
    }

    async openFile(file) {
        const opener = this.getFileOpener(file.name);
        if (opener) {
            const buf = await file.arrayBuffer();
            return opener(buf).catch(err => {alert(err);});
        } else {
            throw 'Unrecognised file type: ' + file.name;
        }
    }

    async openUrl(url) {
        const opener = this.getFileOpener(url.toString());
        if (opener) {
            const response = await fetch(url);
            const buf = await response.arrayBuffer();
            return opener(buf);
        } else {
            throw 'Unrecognised file type: ' + url.split('/').pop();
        }
    }
    async openUrlList(urls) {
        if (typeof(urls) === 'string') {
            return await this.openUrl(urls);
        } else {
            for (const url of urls) {
                await this.openUrl(url);
            }
        }
    }

    setAutoLoadTapes(val) {
        this.autoLoadTapes = val;
        this.emit('setAutoLoadTapes', val);
    }
    setTapeTraps(val) {
        this.tapeTrapsEnabled = val;
        this.worker.postMessage({
            message: 'setTapeTraps',
            value: val,
        })
        this.emit('setTapeTraps', val);
    }

    playTape() {
        this.worker.postMessage({
            message: 'playTape',
        });
    }
    stopTape() {
        this.worker.postMessage({
            message: 'stopTape',
        });
    }

    exit() {
        this.pause();
        this.worker.terminate();
    }
}

window.JSSpeccy = (container, opts) => {
    // let benchmarkRunCount = 0;
    // let benchmarkRenderCount = 0;
    opts = opts || {};

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;

    const keyboardEnabled = ('keyboardEnabled' in opts) ? opts.keyboardEnabled : true;
    const uiEnabled = ('uiEnabled' in opts) ? opts.uiEnabled : true;

    const emu = new Emulator(canvas, {
        machine: opts.machine || 128,
        autoStart: opts.autoStart || false,
        autoLoadTapes: opts.autoLoadTapes || false,
        tapeAutoLoadMode: opts.tapeAutoLoadMode || 'default',
        openUrl: opts.openUrl,
        tapeTrapsEnabled: ('tapeTrapsEnabled' in opts) ? opts.tapeTrapsEnabled : true,
        keyboardEnabled: keyboardEnabled,
        keyboardMap: opts.keyboardMap || 'standard',
    });
    const ui = new UIController(container, emu, {
        zoom: opts.zoom || 1,
        sandbox: opts.sandbox,
        uiEnabled: uiEnabled,
        virtualKeyboard: ('virtualKeyboard' in opts) ? opts.virtualKeyboard : true,
    });


    if (keyboardEnabled) {
        if (ui.appContainer.tabIndex == -1) {
            ui.appContainer.tabIndex = 0;  // allow receiving focus for keyboard events
        }
        emu.setKeyboardEventRoot(ui.appContainer);
    }

    if (uiEnabled) {
        const fileMenu = ui.menuBar.addMenu('File');
        if (!opts.sandbox) {
            fileMenu.addItem('Open...', () => {
                openFileDialog();
            });
            fileMenu.addItem('Save snapshot (.z80)...', () => {
                const dateStr = new Date().toISOString().slice(0, 10);
                const defaultName = `jsspeccy_${dateStr}`;
                const inputName = prompt('Nombre del archivo snapshot .z80:', defaultName);
                if (inputName !== null) {
                    const cleanName = inputName.trim() || defaultName;
                    const finalName = cleanName.toLowerCase().endsWith('.z80') ? cleanName : `${cleanName}.z80`;
                    emu.saveSnapshot(finalName);
                }
            });
            fileMenu.addItem('Save BASIC program (.tzx)...', () => {
                const defaultName = 'MI_PROG';
                const inputName = prompt('Nombre del programa BASIC (máx. 10 caracteres):', defaultName);
                if (inputName !== null) {
                    const cleanName = inputName.trim() || defaultName;
                    emu.saveBasicTZX(`${cleanName}.tzx`);
                }
            });
            fileMenu.addItem('Find games...', () => {
                openGameBrowser();
            });
            const autoLoadTapesMenuItem = fileMenu.addItem('Auto-load tapes', () => {
                emu.setAutoLoadTapes(!emu.autoLoadTapes);
                emu.focus();
            });
            const updateAutoLoadTapesCheckbox = () => {
                if (emu.autoLoadTapes) {
                    autoLoadTapesMenuItem.setCheckbox();
                } else {
                    autoLoadTapesMenuItem.unsetCheckbox();
                }
            }
            emu.on('setAutoLoadTapes', updateAutoLoadTapesCheckbox);
            updateAutoLoadTapesCheckbox();
        }

        const tapeTrapsMenuItem = fileMenu.addItem('Instant tape loading', () => {
            emu.setTapeTraps(!emu.tapeTrapsEnabled);
            emu.focus();
        });

        const updateTapeTrapsCheckbox = () => {
            if (emu.tapeTrapsEnabled) {
                tapeTrapsMenuItem.setCheckbox();
            } else {
                tapeTrapsMenuItem.unsetCheckbox();
            }
        }
        emu.on('setTapeTraps', updateTapeTrapsCheckbox);
        updateTapeTrapsCheckbox();

        const machineMenu = ui.menuBar.addMenu('Machine');
        const machine48Item = machineMenu.addItem('Spectrum 48K', () => {
            emu.setMachine(48);
            emu.focus();
        });
        const machine128Item = machineMenu.addItem('Spectrum 128K +2 ES', () => {
            emu.setMachine(128);
            emu.focus();
        });
        const machinePentagonItem = machineMenu.addItem('Pentagon 128', () => {
            emu.setMachine(5);
            emu.focus();
        });

        const machineNames = {
            48: 'Spectrum 48K',
            128: 'Spectrum 128K +2 ES',
            5: 'Pentagon 128'
        };
        const updateMachineUI = (type) => {
            const name = machineNames[type] || 'Spectrum 48K';
            if (type == 48) {
                machine48Item.setBullet();
                machine128Item.unsetBullet();
                machinePentagonItem.unsetBullet();
            } else if (type == 128) {
                machine48Item.unsetBullet();
                machine128Item.setBullet();
                machinePentagonItem.unsetBullet();
            } else if (type == 5) {
                machine48Item.unsetBullet();
                machine128Item.unsetBullet();
                machinePentagonItem.setBullet();
            }
            if (ui.toolbar) {
                ui.toolbar.setMachine(name);
            }
        };
        emu.on('setMachine', updateMachineUI);
        updateMachineUI(emu.machineType || 48);

        const displayMenu = ui.menuBar.addMenu('Display');

        const fitWidthItem = displayMenu.addItem('Fit to width', () => {ui.setZoom('fit'); emu.focus();});
        const zoomItemsBySize = {
            1: displayMenu.addItem('100%', () => {ui.setZoom(1); emu.focus();}),
            2: displayMenu.addItem('200%', () => {ui.setZoom(2); emu.focus();}),
            3: displayMenu.addItem('300%', () => {ui.setZoom(3); emu.focus();}),
        };

        const setZoomCheckbox = (factor) => {
            if (factor == 'fit' || factor == 'fit-width') {
                fitWidthItem.setBullet();
                for (let i in zoomItemsBySize) {
                    zoomItemsBySize[i].unsetBullet();
                }
            } else {
                fitWidthItem.unsetBullet();
                for (let i in zoomItemsBySize) {
                    if (parseInt(i) == factor) {
                        zoomItemsBySize[i].setBullet();
                    } else {
                        zoomItemsBySize[i].unsetBullet();
                    }
                }
            }
        };



        const aboutMenu = ui.menuBar.addMenu('About');
        aboutMenu.addItem(`About ${APP_TITLE}`, () => {
            openAboutDialog();
        });



        ui.on('setZoom', setZoomCheckbox);
        setZoomCheckbox(ui.zoom);


        emu.on('setMachine', (type) => {
            if (type == 48) {
                machine48Item.setBullet();
                machine128Item.unsetBullet();
                machinePentagonItem.unsetBullet();
            } else if (type == 128) {
                machine48Item.unsetBullet();
                machine128Item.setBullet();
                machinePentagonItem.unsetBullet();
            } else { // pentagon
                machine48Item.unsetBullet();
                machine128Item.unsetBullet();
                machinePentagonItem.setBullet();
            }
        });

        if (!opts.sandbox) {
            ui.toolbar.addButton(openIcon, {label: 'Open file'}, () => {
                openFileDialog();
            });
        }
        ui.toolbar.addButton(resetIcon, {label: 'Reset'}, () => {
            emu.reset();
        });
        const pauseButton = ui.toolbar.addButton(playIcon, {label: 'Unpause'}, () => {
            if (emu.isRunning) {
                emu.pause();
            } else {
                emu.start();
            }
        });
        emu.on('pause', () => {
            pauseButton.setIcon(playIcon);
            pauseButton.setLabel('Unpause');
        });
        emu.on('start', () => {
            pauseButton.setIcon(pauseIcon);
            pauseButton.setLabel('Pause');
        });
        const tapeButton = ui.toolbar.addButton(tapePlayIcon, {label: 'Start tape'}, () => {
            if (emu.tapeIsPlaying) {
                emu.stopTape();
            } else {
                emu.playTape();
            }
        });
        tapeButton.disable();
        emu.on('openedTapeFile', () => {
            tapeButton.enable();
        });
        emu.on('playingTape', () => {
            tapeButton.setIcon(tapePauseIcon);
            tapeButton.setLabel('Stop tape');
        });
        emu.on('stoppedTape', () => {
            tapeButton.setIcon(tapePlayIcon);
            tapeButton.setLabel('Start tape');
        });

        if (ui.virtualKeyboard) {
            ui.toolbar.addButton(
                keyboardIcon,
                {label: 'Toggle touch keyboard'},
                () => {
                    ui.virtualKeyboard.toggle();
                }
            );
        }


    }

    const openFileDialog = () => {
        fileDialog().then(files => {
            const file = files[0];
            emu.openFile(file).then(() => {
                if (emu.isInitiallyPaused) emu.start();
                emu.focus();
            }).catch((err) => {alert(err);});
        });
    }

    const openAboutDialog = () => {
        emu.pause();
        const body = ui.showDialog();
        body.innerHTML = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px 20px; color: #e0e0e0; line-height: 1.6;">
                <h2 style="margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 700; border-bottom: 1px solid #3a3a48; padding-bottom: 8px;">About ${APP_TITLE}</h2>
                <p style="margin: 12px 0; font-size: 14px;">
                    <strong>${APP_TITLE}</strong> ${APP_ABOUT_TEXT}
                </p>
                <div style="background-color: #262632; border: 1px solid #3a3a48; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; color: #a0a0b0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Fork Author & Maintainer (v${APP_VERSION})</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 600; color: #ffffff;">${APP_AUTHOR}</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px;">
                        <a href="mailto:${APP_AUTHOR_EMAIL}" style="color: #60a5fa; text-decoration: none;">${APP_AUTHOR_EMAIL}</a>
                    </p>
                </div>
                <div style="background-color: #262632; border: 1px solid #3a3a48; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; color: #a0a0b0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Original Base Project</p>
                    <p style="margin: 0; font-size: 14px; color: #d0d0d0;">
                        Originally created as ${ORIGINAL_PROJECT} by ${ORIGINAL_AUTHOR}.
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 13px;">
                        <a href="https://github.com/gasman/jsspeccy3" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: none;">github.com/gasman/jsspeccy3</a>
                    </p>
                </div>
            </div>
        `;
    };


    const openGameBrowser = () => {

        emu.pause();
        const body = ui.showDialog();
        body.innerHTML = `
            <label>Find games</label>
            <form>
                <input type="search">
                <button type="submit">Search</button>
            </form>
            <div class="results">
            </div>
        `;
        const input = body.querySelector('input');
        const searchButton = body.querySelector('button');
        const searchForm = body.querySelector('form');
        const resultsContainer = body.querySelector('.results');

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            searchButton.innerText = 'Searching...';
            const searchTerm = input.value.replace(/[^\w\s\-\']/, '');

            const encodeParam = (key, val) => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(val);
            }

            const searchUrl = (
                'https://archive.org/advancedsearch.php?'
                + encodeParam('q', 'collection:softwarelibrary_zx_spectrum title:"' + searchTerm + '"')
                + '&' + encodeParam('fl[]', 'creator')
                + '&' + encodeParam('fl[]', 'identifier')
                + '&' + encodeParam('fl[]', 'title')
                + '&' + encodeParam('rows', '50')
                + '&' + encodeParam('page', '1')
                + '&' + encodeParam('output', 'json')
            )
            fetch(searchUrl).then(response => {
                searchButton.innerText = 'Search';
                return response.json();
            }).then(data => {
                resultsContainer.innerHTML = '<ul style="list-style-type: none; padding-left: 0; margin-top: 12px;"></ul><p style="font-size: 12px; color: #a0a0b0; margin-top: 16px;">- powered by <a href="https://archive.org/" target="_blank" style="color: #60a5fa; text-decoration: none;">Internet Archive</a></p>';
                const ul = resultsContainer.querySelector('ul');
                const results = data.response.docs;
                results.forEach(result => {
                    const li = document.createElement('li');
                    li.style.margin = '8px 0';
                    li.style.fontSize = '14px';
                    li.style.lineHeight = '1.4';
                    ul.appendChild(li);
                    const resultLink = document.createElement('a');
                    resultLink.href = '#';
                    resultLink.innerText = result.title;
                    resultLink.style.color = '#38bdf8';
                    resultLink.style.textDecoration = 'none';
                    resultLink.style.fontWeight = '600';
                    resultLink.style.transition = 'color 0.15s';
                    resultLink.addEventListener('mouseenter', () => {
                        resultLink.style.color = '#7dd3fc';
                        resultLink.style.textDecoration = 'underline';
                    });
                    resultLink.addEventListener('mouseleave', () => {
                        resultLink.style.color = '#38bdf8';
                        resultLink.style.textDecoration = 'none';
                    });
                    const creator = document.createElement('span');
                    creator.style.color = '#94a3b8';
                    creator.textContent = ' - ' + (result.creator || 'Desconocido');
                    li.appendChild(resultLink);
                    li.appendChild(creator);
                    resultLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        fetch(
                            'https://archive.org/metadata/' + result.identifier
                        ).then(response => response.json()).then(data => {
                            let chosenFilename = null;
                            data.files.forEach(file => {
                                const ext = file.name.split('.').pop().toLowerCase();
                                if (ext == 'z80' || ext == 'sna' || ext == 'tap' || ext == 'tzx' || ext == 'szx') {
                                    chosenFilename = file.name;
                                }
                            });
                            if (!chosenFilename) {
                                alert('No loadable file found');
                            } else {
                                const finalUrl = 'https://cors.archive.org/cors/' + result.identifier + '/' + chosenFilename;
                                emu.openUrl(finalUrl).catch((err) => {
                                    alert(err);
                                }).then(() => {
                                    ui.hideDialog();
                                    emu.focus();
                                    emu.start();
                                });
                            }
                        })
                    })
                })
            })
        })
        input.focus();
    }

    const exit = () => {
        emu.exit();
        ui.unload();
    }

    /*
        const benchmarkElement = document.getElementById('benchmark');
        setInterval(() => {
            benchmarkElement.innerText = (
                "Running at " + benchmarkRunCount + "fps, rendering at "
                + benchmarkRenderCount + "fps"
            );
            benchmarkRunCount = 0;
            benchmarkRenderCount = 0;
        }, 1000)
    */

    return {
        setZoom: (zoom) => {ui.setZoom(zoom);},
        toggleFullscreen: () => {ui.toggleFullscreen();},
        enterFullscreen: () => {ui.enterFullscreen();},
        exitFullscreen: () => {ui.exitFullscreen();},
        toggleVirtualKeyboard: () => {if (ui.virtualKeyboard) ui.virtualKeyboard.toggle();},
        setMachine: (model) => {emu.setMachine(model);},

        openFileDialog: () => {openFileDialog();},
        openUrl: (url) => {
            emu.openUrl(url).catch((err) => {alert(err);});
        },
        loadSnapshotFromStruct: (snapshot) => {
            emu.loadSnapshot(snapshot);
        },
        onReady: (callback) => {
            if (emu.isReady) {
                callback();
            } else {
                emu.onReadyHandlers.push(callback);
            }
        },
        exit: () => {exit();},
    };
};

window.JSSpeccy.APP_NAME = APP_NAME;
window.JSSpeccy.APP_VERSION = APP_VERSION;
window.JSSpeccy.APP_TITLE = APP_TITLE;
window.JSSpeccy.APP_DESCRIPTION = APP_DESCRIPTION;
window.JSSpeccy.APP_AUTHOR = APP_AUTHOR;
window.JSSpeccy.APP_AUTHOR_EMAIL = APP_AUTHOR_EMAIL;
window.JSSpeccy.config = window.JSSpeccyConfig;

