export function createFooter(isSubpage = false) {
  const prefix = isSubpage ? '../' : '';

  return `
  <footer>
    <div class="footer-top">
      <div>
        <div class="footer-brand-name">HEALWITHMAHIMA</div>
        <div class="footer-brand-sub">Corporate Wellness &amp; Mindfulness</div>
      </div>
      <nav class="footer-nav">
        <a href="${prefix}index.html#about">About</a>
        <a href="${prefix}index.html#programs">Programs</a>
        <a href="${prefix}index.html#stats">Results</a>
        <a href="${prefix}index.html#testimonials">Clients</a>
        <a href="${prefix}index.html#cta">Contact</a>
      </nav>
    </div>
    <div class="footer-divider"></div>
    <div class="footer-bottom">
      <span>© 2026 HEALWITHMAHIMA. All rights reserved.</span>
      <span>Privacy Policy &nbsp;·&nbsp; Terms of Service</span>
    </div>
  </footer>
  `;
}

export function initFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    const isSubpage = window.location.pathname.includes('/programs/');
    footerPlaceholder.outerHTML = createFooter(isSubpage);
  }
}
