export function createNavbar(isSubpage = false) {
  const prefix = isSubpage ? '../' : '';

  return `
  <nav class="navbar">
    <a href="${prefix}index.html" class="navbar-brand">HEALWITHMAHIMA</a>
    <div class="navbar-links">
      <a href="${prefix}index.html#about-mahima">About</a>
      <a href="${prefix}index.html#programs">Programs</a>
      <a href="${prefix}index.html#stats">Results</a>
      <a href="${prefix}index.html#how-it-works">How it works</a>
    </div>
    <a href="${prefix}index.html#enquire" class="btn-nav">Get a proposal</a>
  </nav>
  `;
}

export function initNavbar() {
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    const isSubpage = window.location.pathname.includes('/programs/');
    navbarPlaceholder.outerHTML = createNavbar(isSubpage);
  }

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let scrolled = null;
    const update = () => {
      const next = window.scrollY > 60;
      if (next !== scrolled) navbar.classList.toggle('scrolled', (scrolled = next));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
}
