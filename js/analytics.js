/* ── ANALYTICS ──
   Set the real IDs to enable tracking. While they are empty nothing loads, so the site
   doesn't ship ~430 KB of third-party script or send hits to placeholder accounts.
   Loaded after the page's load event so it never competes with the hero. */
const GA_ID = '';       // e.g. 'G-ABC123XYZ'
const ADS_ID = '';      // e.g. 'AW-123456789'
const PIXEL_ID = '';    // e.g. '1234567890'

function loadScript(src) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function init() {
  if (GA_ID || ADS_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    if (GA_ID) window.gtag('config', GA_ID);
    if (ADS_ID) window.gtag('config', ADS_ID);
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + (GA_ID || ADS_ID));
  }
  if (PIXEL_ID) {
    const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }
}

if (document.readyState === 'complete') init();
else window.addEventListener('load', init, { once: true });
