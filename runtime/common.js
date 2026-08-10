export const APP_NAME = 'JSSpeccy';
export const APP_VERSION = '4.1.0';
export const APP_TITLE = `${APP_NAME} v${APP_VERSION}`;
export const APP_DESCRIPTION = 'Un emulador de ZX Spectrum en el navegador con soporte móvil y teclado táctil';
export const APP_ABOUT_TEXT = 'es un emulador de ZX Spectrum en la web desarrollado con JavaScript y WebAssembly, optimizado para el ZX Spectrum +2 español con teclado táctil adaptativo.';
export const APP_AUTHOR = 'Alfonso Alvar';
export const APP_AUTHOR_EMAIL = 'hola@alfonsoalvar.com';
export const ORIGINAL_AUTHOR = 'Matt Westcott (Gasman)';
export const ORIGINAL_PROJECT = 'JSSpeccy3';
export const ORIGINAL_PROJECT_URL = 'https://github.com/gasman/jsspeccy3';
export const GITHUB_REPO_URL = 'https://github.com/alfonsoalvar/jsspeccy3';

if (typeof window !== 'undefined') {
    window.JSSpeccyConfig = {
        APP_NAME,
        APP_VERSION,
        APP_TITLE,
        APP_DESCRIPTION,
        APP_ABOUT_TEXT,
        APP_AUTHOR,
        APP_AUTHOR_EMAIL,
        ORIGINAL_AUTHOR,
        ORIGINAL_PROJECT,
        ORIGINAL_PROJECT_URL,
        GITHUB_REPO_URL,
    };
}
