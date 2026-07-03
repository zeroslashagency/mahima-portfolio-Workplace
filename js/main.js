/* ── COMPONENTS ── */
import '../components/index.js';

/* ── CUSTOM CURSOR ── */
const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursor) {
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  }
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  if (cursorRing) {
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
  }
  requestAnimationFrame(animateRing);
}
/* Only run the cursor loop on real pointer devices (skip touch / low-end phones) */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) animateRing();

/* ── SCROLL REVEAL ── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

/* ── STATS COUNTER ── */
function animateCounter(el, target, suffix) {
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsSection = document.querySelector('.stats');
let statsAnimated = false;
const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !statsAnimated) {
    statsAnimated = true;
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
    });
  }
}, { threshold: 0.3 });
if (statsSection) statsObserver.observe(statsSection);

/* ── TICKER DUPLICATE for seamless loop ── */
const track = document.querySelector('.ticker-track');
if (track) {
  const clone = track.innerHTML;
  track.innerHTML = clone + clone;
}


/* ── MOBILE MENU (added) ── */
(function initMobileMenu() {
  const nav = document.querySelector('.navbar');
  const links = document.querySelector('.navbar-links');
  if (!nav || !links) return;
  links.id = links.id || 'navbar-links';

  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', links.id);
  btn.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(btn);

  function close() {
    nav.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-locked');
  }
  function toggle() {
    const open = nav.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-locked', open);
  }
  btn.addEventListener('click', toggle);
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.matchMedia('(min-width: 721px)').addEventListener('change', e => { if (e.matches) close(); });
})();


/* ── LEAD EVENTS + FORM (added) ── */
function fireLead(source) {
  try { if (typeof gtag === 'function') { gtag('event', 'generate_lead', { source: source }); } } catch (e) {}
  try { if (window.fbq) { fbq('track', 'Lead', { content_name: document.title }); } } catch (e) {}
}

/* WhatsApp clicks anywhere = a lead intent */
document.addEventListener('click', function (e) {
  const a = e.target.closest && e.target.closest('a[href*="wa.me"]');
  if (a) fireLead('whatsapp');
});

/* Lead form: validate, submit to Formspree via fetch, fire lead on success */
(function initLeadForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;
  const statusEl = document.getElementById('lf-status');

  function setInvalid(field, bad) {
    const wrap = field.closest('.field');
    if (wrap) wrap.classList.toggle('invalid', bad);
  }
  function validate() {
    let ok = true;
    form.querySelectorAll('[required]').forEach(function (el) {
      const bad = !el.value.trim() || (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
      setInvalid(el, bad);
      if (bad) ok = false;
    });
    return ok;
  }
  form.addEventListener('input', function (e) {
    if (e.target.closest('.field.invalid')) setInvalid(e.target, false);
  });
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    statusEl.className = 'form-status';
    statusEl.textContent = '';
    if (!validate()) return;
    const action = form.getAttribute('action') || '';
    if (action.includes('xxxxxxxx')) {
      statusEl.className = 'form-status fail';
      statusEl.textContent = 'Form endpoint not configured yet. Please message us on WhatsApp for now.';
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    const label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    try {
      const res = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) {
        form.reset();
        statusEl.className = 'form-status ok';
        statusEl.textContent = 'Thanks — we\'ll be in touch within one working day.';
        fireLead('form');
      } else {
        statusEl.className = 'form-status fail';
        statusEl.textContent = 'Something went wrong. Please try WhatsApp instead.';
      }
    } catch (err) {
      statusEl.className = 'form-status fail';
      statusEl.textContent = 'Network error. Please try WhatsApp instead.';
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = label; }
    }
  });
})();
