export function createNavbar(isSubpage = false) {
  const prefix = isSubpage ? '../' : '';

  return `
  <nav class="navbar">
    <a href="${prefix}index.html" class="navbar-brand">HEALWITHMAHIMA</a>
    <div class="navbar-links">
      <a href="${prefix}index.html#about">About</a>
      <a href="${prefix}index.html#programs">Programs</a>
      <a href="${prefix}index.html#stats">Results</a>
      <a href="${prefix}index.html#testimonials">Clients</a>
    </div>
    <a href="${prefix}index.html#cta" class="btn-nav">Book Now</a>
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
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }
}
