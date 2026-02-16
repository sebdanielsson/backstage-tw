import { useEffect } from 'react';

/**
 * Syncs Backstage's theme (set via `data-theme-mode` on `<body>` by
 * UnifiedThemeProvider) with shadcn/Tailwind's dark mode (`.dark` class).
 *
 * Backstage sets `data-theme-mode="light"` or `data-theme-mode="dark"` on
 * the body element when the user switches themes in Settings.
 *
 * shadcn's Tailwind v4 setup uses `@custom-variant dark (&:is(.dark *))` which
 * activates `dark:` utilities when an ancestor has the `.dark` class.
 *
 * This hook observes the body's data-theme-mode attribute via MutationObserver
 * and toggles the `.dark` class accordingly.
 */
export function useBackstageThemeSync() {
  useEffect(() => {
    const body = document.body;

    function syncDarkClass() {
      const mode = body.getAttribute('data-theme-mode');
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Initial sync
    syncDarkClass();

    // Watch for attribute changes on body
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme-mode'
        ) {
          syncDarkClass();
        }
      }
    });

    observer.observe(body, {
      attributes: true,
      attributeFilter: ['data-theme-mode'],
    });

    return () => observer.disconnect();
  }, []);
}
