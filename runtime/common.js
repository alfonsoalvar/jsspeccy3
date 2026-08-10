export const APP_NAME = 'JSSpeccy';
export const APP_VERSION = '4.0.1';
export const APP_TITLE = `${APP_NAME} v${APP_VERSION}`;
export const APP_DESCRIPTION = 'a ZX Spectrum emulator in the browser with mobile support and more features';
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
        APP_AUTHOR,
        APP_AUTHOR_EMAIL,
        ORIGINAL_AUTHOR,
        ORIGINAL_PROJECT,
        ORIGINAL_PROJECT_URL,
        GITHUB_REPO_URL,
    };
}
