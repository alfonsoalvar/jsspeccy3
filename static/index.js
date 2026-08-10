let emu;

window.addEventListener('load', () => {
    const container = document.getElementById('jsspeccy');
    if (container && typeof JSSpeccy === 'function') {
        emu = JSSpeccy(container, { zoom: 2, sandbox: false });
    }

    if (window.JSSpeccyConfig) {
        document.title = window.JSSpeccyConfig.APP_TITLE;

        const heading = document.getElementById('app-heading');
        if (heading) heading.textContent = window.JSSpeccyConfig.APP_TITLE;

        const tagline = document.getElementById('app-tagline');
        if (tagline) tagline.textContent = window.JSSpeccyConfig.APP_DESCRIPTION;

        const authorLink = document.getElementById('author-link');
        if (authorLink) {
            authorLink.textContent = window.JSSpeccyConfig.APP_AUTHOR;
            authorLink.href = 'mailto:' + window.JSSpeccyConfig.APP_AUTHOR_EMAIL;
        }

        const origAuthorLink = document.getElementById('original-author-link');
        if (origAuthorLink) {
            origAuthorLink.textContent = window.JSSpeccyConfig.ORIGINAL_AUTHOR;
            origAuthorLink.href = window.JSSpeccyConfig.ORIGINAL_PROJECT_URL;
        }

        const githubRepoLink = document.getElementById('github-repo-link');
        if (githubRepoLink) {
            githubRepoLink.href = window.JSSpeccyConfig.GITHUB_REPO_URL;
        }
    }
});
