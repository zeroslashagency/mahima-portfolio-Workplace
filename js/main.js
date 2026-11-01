/* ── COMPONENTS ── */
import '../components/index.js';
import './analytics.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── HERO HEADLINE: split <br> lines for the line-mask reveal ── */
(function splitHeroLines() {
  const h1 = document.querySelector('.hero-left h1');
  if (!h1 || reduceMotion) return;
  const lines = h1.innerHTML.split(/<br\s*\/?>/i);
  h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
  h1.innerHTML = lines.map(l => `<span class="line" aria-hidden="true"><span>${l.trim()}</span></span>`).join('');
})();

/* ── SCROLL REVEAL ── */
const REVEAL_CLASSES = ['reveal', 'reveal-left', 'reveal-right', 'visible', 'delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5'];

/* [data-stagger] reveals each child in turn */
document.querySelectorAll('[data-stagger]').forEach(group => {
  Array.from(group.children).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', (i * 90) + 'ms');
  });
});

/* After the entrance, drop the reveal classes so each element's own hover transition applies */
function finishReveal(el) {
  el.classList.remove(...REVEAL_CLASSES);
  el.style.removeProperty('--reveal-delay');
}

const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(finishReveal);
  document.querySelectorAll('.reveal-media').forEach(el => el.classList.add('visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      observer.unobserve(el);
      if (el.classList.contains('reveal-media') && !el.matches('.reveal, .reveal-left, .reveal-right')) {
        el.classList.add('visible');
        return;
      }
      el.addEventListener('transitionend', function done(e) {
        if (e.target !== el || e.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', done);
        const keepMedia = el.classList.contains('reveal-media');
        finishReveal(el);
        if (keepMedia) el.classList.add('visible');
      });
      el.classList.add('visible');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => observer.observe(el));
  document.querySelectorAll('.reveal-media').forEach(el => observer.observe(el));
}

/* ── VIDEO: load and play only near the viewport; pause when off-screen ── */
document.querySelectorAll('video[data-autoplay]').forEach(video => {
  const source = video.querySelector('source[data-src]');
  if (!source || !('IntersectionObserver' in window)) return;
  let loaded = false;
  const io = new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    if (visible && !loaded) {
      source.src = source.dataset.src;
      video.load();
      loaded = true;
    }
    if (reduceMotion) return;
    if (visible) video.play().catch(() => {});
    else video.pause();
  }, { rootMargin: '200px 0px' });
  io.observe(video);
});


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

  /* preselect the program when arriving from a program page (?program=...) */
  const wanted = new URLSearchParams(location.search).get('program');
  const programSelect = form.querySelector('#lf-program');
  if (wanted && programSelect) {
    const match = Array.from(programSelect.options).find(o => o.text === wanted);
    if (match) programSelect.value = match.value || match.text;
  }

  form.querySelectorAll('.field').forEach(function (wrap) {
    const input = wrap.querySelector('input, select, textarea');
    const err = wrap.querySelector('.err');
    if (input && err) {
      err.id = err.id || (input.id + '-err');
      input.setAttribute('aria-describedby', err.id);
    }
  });

  function setInvalid(field, bad) {
    const wrap = field.closest('.field');
    if (wrap) wrap.classList.toggle('invalid', bad);
    if (bad) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
  function validate() {
    let firstBad = null;
    form.querySelectorAll('[required]').forEach(function (el) {
      const bad = !el.value.trim() || (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
      setInvalid(el, bad);
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
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
