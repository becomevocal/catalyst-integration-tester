'use client';

import { useEffect } from 'react';

export function ElementorScriptReinitializer() {
  useEffect(() => {
    window && window.location.hostname === 'localhost' && console.log('[local debug] Re-initializing Elementor frontend scripts');

    // This DOMContentLoaded event triggers lazy load images on initial page load and route changes.
    // -    It's needed for the first page load because the script is loaded by Next.js using the 'afterInteractive' strategy,
    //      which means the browser fires DOMContentLoaded before the script is loaded.
    // -    It's needed for the route changes because the browser only fires DOMContentLoaded once, on initial page load.
    window.document.dispatchEvent(
      new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true,
      }),
    );

    // This init() call configures Elementor's frontend JS script that controls page animations, dialogs, etc.
    // -    It's *not* needed on the initial page load since the script will call init() when loaded for the first time.
    // -    It is needed on route changes because the script won't be loaded again, which will cause JS animations and
    //      interactions to fail, in addition to hiding areas of the page by leaving '.elementor-invisible' class on elements.

    (window as any)?.elementorFrontend?.init();
  }, []);

  return null;
}
