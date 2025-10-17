if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/minimal-pwa/serviceworker.js");
}

// PWA install prompt handling
(() => {
    let deferredPrompt = null;
    const banner = document.getElementById('install-banner');
    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('install-dismiss');

    // Show banner helper
    function showBanner() {
        if (!banner) return;
        banner.style.display = 'flex';
        banner.setAttribute('aria-hidden', 'false');
    }

    function hideBanner() {
        if (!banner) return;
        banner.style.display = 'none';
        banner.setAttribute('aria-hidden', 'true');
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        deferredPrompt = e;
        // Show our custom install banner
        showBanner();
    });

    // Handle install button click
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) {
                // No deferred prompt — maybe already installed or not supported
                hideBanner();
                return;
            }
            // Show the native prompt
            deferredPrompt.prompt();
            // Wait for the user's choice
            const choiceResult = await deferredPrompt.userChoice;
            // Clear the saved prompt since it can only be used once
            deferredPrompt = null;
            hideBanner();
            console.log('User choice for PWA install:', choiceResult.outcome);
        });
    }

    // Dismiss button
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            hideBanner();
        });
    }

    // Listen for appinstalled event
    window.addEventListener('appinstalled', (evt) => {
        console.log('PWA was installed.', evt);
        // Cleanup UI
        hideBanner();
    });

    // iOS fallback: detect Safari on iOS and show a short instruction if needed
    function isIos() {
        return /iphone|ipad|ipod/i.test(window.navigator.userAgent.toLowerCase());
    }

    function isInStandaloneMode() {
        return ('standalone' in window.navigator) && window.navigator.standalone;
    }

    // Show iOS instruction if relevant and banner isn't shown by beforeinstallprompt
    if (isIos() && !isInStandaloneMode()) {
        // Add a small timed hint to the banner (if banner exists), otherwise log to console
        if (banner) {
            const hint = document.createElement('div');
            hint.style.fontSize = '0.9em';
            hint.style.color = '#333';
            hint.style.marginTop = '6px';
            hint.textContent = 'Tap Share → Add to Home Screen to install this app.';
            banner.querySelector('div')?.appendChild(hint);
            // Show banner so iOS users see instructions
            showBanner();
        } else {
            console.log('iOS: Tap Share → Add to Home Screen to install this app.');
        }
    }
})();