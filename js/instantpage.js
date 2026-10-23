/*!
 * instant.page / Instant Preloader - tiziznz.com (梯子指南针)
 * Lightweight, zero-dependency page prefetching mechanism.
 * Prefetches internal pages on 65ms hover or touchstart to eliminate transition lag.
 */
(function () {
  'use strict';

  if (window.__instantPrefetchLoaded) return;
  window.__instantPrefetchLoaded = true;

  // Respect user preference for reduced data usage
  if (
    navigator.connection &&
    (navigator.connection.saveData ||
      (navigator.connection.effectiveType && navigator.connection.effectiveType.includes('2g')))
  ) {
    return;
  }

  const prefetched = new Set();
  let hoverTimer = null;
  const supportsPrefetch = (function () {
    try {
      const link = document.createElement('link');
      return Boolean(link.relList && link.relList.supports && link.relList.supports('prefetch'));
    } catch (e) {
      return false;
    }
  })();

  const NON_PAGE_EXTS = new Set([
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
    'exe', 'dmg', 'apk', 'pkg', 'deb', 'rpm',
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico',
    'mp4', 'webm', 'mp3', 'wav',
    'pdf', 'docx', 'xlsx', 'pptx'
  ]);

  function getValidUrl(anchor) {
    if (!anchor || !anchor.href) return null;

    // Check custom blacklist attributes
    if (anchor.hasAttribute('data-no-instant') || anchor.hasAttribute('download')) {
      return null;
    }
    if (anchor.rel && anchor.rel.toLowerCase().includes('nofollow')) {
      return null;
    }

    try {
      const url = new URL(anchor.href, window.location.href);

      // Strictly same origin only - excludes Telegram, external sites, etc.
      if (url.origin !== window.location.origin) {
        return null;
      }

      // Protocols must be http or https
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return null;
      }

      // Ignore pure hash links on the same path
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return null;
      }

      // Ignore current page
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        !url.hash
      ) {
        return null;
      }

      // Filter out binary downloads / non-HTML files
      const match = url.pathname.match(/\.([a-zA-Z0-9]+)$/);
      if (match) {
        const ext = match[1].toLowerCase();
        if (NON_PAGE_EXTS.has(ext)) {
          return null;
        }
      }

      return url.href;
    } catch (e) {
      return null;
    }
  }

  function prefetch(url) {
    if (!url || prefetched.has(url)) return;
    prefetched.add(url);

    if (supportsPrefetch) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      if ('fetchPriority' in link) {
        link.fetchPriority = 'low';
      }
      document.head.appendChild(link);
    } else {
      // Fallback for browsers without <link rel=prefetch> support
      try {
        fetch(url, { credentials: 'same-origin', priority: 'low' }).catch(function () {});
      } catch (e) {}
    }
  }

  // Pointer hover (65ms threshold)
  function onPointerOver(e) {
    const anchor = e.target && e.target.closest ? e.target.closest('a') : null;
    const url = getValidUrl(anchor);
    if (!url) return;

    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function () {
      prefetch(url);
      hoverTimer = null;
    }, 65);
  }

  function onPointerOut(e) {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  }

  // Mobile touchstart - prefetch immediately on touch
  function onTouchStart(e) {
    const anchor = e.target && e.target.closest ? e.target.closest('a') : null;
    const url = getValidUrl(anchor);
    if (url) {
      prefetch(url);
    }
  }

  // Register listeners with passive: true for smooth scrolling
  document.addEventListener('pointerover', onPointerOver, { passive: true, capture: true });
  document.addEventListener('pointerout', onPointerOut, { passive: true, capture: true });
  document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
})();
