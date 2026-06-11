import { initNavbar } from './navbar.js';
import { initFooter } from './footer.js';

export function initComponents() {
  initNavbar();
  initFooter();
}

// Auto-init on DOMContentLoaded
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
  } else {
    initComponents();
  }
}
