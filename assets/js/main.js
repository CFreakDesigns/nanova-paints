/* ==========================================================================
   Nanova Paints — main.js
   --------------------------------------------------------------------------
   Plain ES2017, no modules (works from file://). Depends on:
   window.NANOVA_I18N (i18n.js) and window.NANOVA_DATA (data.js).

   01. Utilities & safe storage        10. Products + product modal
   02. i18n engine                     11. Color studio
   03. Scroll lock & modal manager     12. Paint calculator
   04. Header, mobile nav, scroll UI   13. Projects + lightbox
   05. Scroll reveal & scrollspy       14. Dealer finder
   06. Hero canvas (nano lattice)      15. FAQ accordion
   07. Hero counters                   16. Quote form
   08. Lotus-effect diagram            17. Footer
   09. Before / after slider           18. Boot
   ========================================================================== */
(function () {
  'use strict';

  var I18N = window.NANOVA_I18N;
  var DATA = window.NANOVA_DATA;
  var doc = document;
  var root = doc.documentElement;

  if (!I18N || !DATA) {
    root.classList.remove('i18n-pending');
    return;
  }

  /* ==========================================================================
     01. UTILITIES & SAFE STORAGE
     ========================================================================== */
  const $ = (sel, ctx) => (ctx || doc).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* Every storage access is wrapped: the site must work when storage throws */
  const store = {
    get(key, fallback) {
      try { const v = window.localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
    },
    getJSON(key, fallback) {
      try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    setJSON(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    }
  };

  const motionMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const reducedMotion = () => !!(motionMQ && motionMQ.matches);
  const onMotionChange = (fn) => {
    if (!motionMQ) return;
    if (motionMQ.addEventListener) motionMQ.addEventListener('change', fn);
    else if (motionMQ.addListener) motionMQ.addListener(fn);
  };
  const scrollBehavior = () => (reducedMotion() ? 'auto' : 'smooth');

  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);

  /* Converts Arabic-Indic / Persian digits and Arabic separators to Latin */
  const normalizeDigits = (s) => String(s)
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/٫/g, '.')
    .replace(/٬/g, '');

  const debounce = (fn, ms) => {
    let id = 0;
    return function () {
      const args = arguments;
      clearTimeout(id);
      id = setTimeout(() => fn.apply(null, args), ms);
    };
  };

  const hexToRgb = (hex) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const mixHex = (hex, target, amt) => {
    const a = hexToRgb(hex); const b = hexToRgb(target);
    return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * amt).toString(16).padStart(2, '0')).join('');
  };
  const isLight = (hex) => {
    const lin = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return (0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]) > 0.45;
  };

  const svgIcon = (id, cls) => '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>';

  /* Hide broken images so the styled gradient fallback shows instead */
  doc.addEventListener('error', (e) => {
    const el = e.target;
    if (el && el.tagName === 'IMG') el.classList.add('is-broken');
  }, true);

  /* Small toast used for "saved / copied" feedback (role=status) */
  const toastEl = $('#toast');
  let toastTimer = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = '';
    toastEl.classList.remove('is-visible');
    requestAnimationFrame(() => {
      toastEl.textContent = msg;
      toastEl.classList.add('is-visible');
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  function scrollToEl(el) {
    if (el) el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  }

  /* ==========================================================================
     02. i18n ENGINE
     ========================================================================== */
  let lang = store.get('nanova-lang', 'ar') === 'en' ? 'en' : 'ar';
  const langListeners = [];
  const onLang = (fn) => langListeners.push(fn);

  function t(key, vars) {
    const dict = I18N[lang] || I18N.ar;
    let str = dict[key];
    if (str === undefined) str = I18N.ar[key];
    if (str === undefined) return key;
    if (vars) str = str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    return str;
  }
  const L = (obj) => (obj ? (obj[lang] || obj.ar || '') : '');
  const isRTL = () => lang === 'ar';
  const locale = () => (lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US');

  function fmt(n, maxFrac) {
    try {
      return new Intl.NumberFormat(locale(), { maximumFractionDigits: maxFrac || 0, minimumFractionDigits: 0 }).format(n);
    } catch (e) {
      const p = Math.pow(10, maxFrac || 0);
      return String(Math.round(n * p) / p);
    }
  }
  const money = (n) => (lang === 'ar' ? fmt(n) + ' ' + t('unit.sar') : t('unit.sar') + ' ' + fmt(n));
  const sizeLabel = (s) => fmt(s, 1) + ' ' + t('unit.Lshort');
  const listJoin = () => (lang === 'ar' ? '، ' : ', ');

  /* --------------------------------------------------------------------------
     Brand & product names are always written in Latin letters (client rule).
     Inside Arabic text they are bidi-isolated so they sit exactly where the
     Arabic word would be and never flip the line or move punctuation:
       rich(str)   -> escaped HTML with every name wrapped in <bdi>
       iso(str)    -> plain text with names wrapped in U+2068 … U+2069
                      (for attributes, <option> labels and textarea values)
       isoRaw(str) -> isolates an arbitrary Latin token (codes, refs)
     -------------------------------------------------------------------------- */
  const FSI = '⁨';
  const PDI = '⁩';
  const LATIN_NAMES = ['Nanova Paints', 'Nanova']
    .concat(DATA.products.map((p) => p.name.en))
    .sort((a, b) => b.length - a.length);
  const NAME_RE = new RegExp('(' + LATIN_NAMES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
  const rich = (str) => esc(str).replace(NAME_RE, '<bdi>$1</bdi>');
  const iso = (str) => (lang === 'ar' ? String(str).replace(NAME_RE, FSI + '$1' + PDI) : String(str));
  const isoRaw = (str) => (lang === 'ar' ? FSI + str + PDI : String(str));
  /* <option> label: Arabic descriptor first so a Latin name is never the first strong character */
  const productOption = (p) => (lang === 'ar'
    ? L(p.type) + ' — ' + FSI + L(p.name) + PDI
    : L(p.name) + ' — ' + L(p.type));

  function applyStaticText() {
    $$('[data-i18n]').forEach((el) => { el.innerHTML = rich(t(el.getAttribute('data-i18n'))); });
    $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', iso(t(el.getAttribute('data-i18n-aria')))));
    $$('[data-i18n-placeholder]').forEach((el) => el.setAttribute('placeholder', iso(t(el.getAttribute('data-i18n-placeholder')))));
    $$('[data-i18n-alt]').forEach((el) => el.setAttribute('alt', iso(t(el.getAttribute('data-i18n-alt')))));
  }

  function applyDocumentLanguage() {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    applyStaticText();
    doc.title = t('meta.title');
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description'));
    const ogLocale = $('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', lang === 'ar' ? 'ar_SA' : 'en_US');
    /* The toggle shows the *other* language, so tag it accordingly */
    const toggleLabel = $('.lang-toggle__label');
    if (toggleLabel) toggleLabel.setAttribute('lang', lang === 'ar' ? 'en' : 'ar');
  }

  function setLanguage(next, animate) {
    lang = next === 'en' ? 'en' : 'ar';
    applyDocumentLanguage();
    langListeners.forEach((fn) => { try { fn(); } catch (e) { /* keep other modules alive */ } });
    store.set('nanova-lang', lang);
    if (animate && !reducedMotion()) {
      root.classList.remove('is-switching');
      void root.offsetWidth;
      root.classList.add('is-switching');
      setTimeout(() => root.classList.remove('is-switching'), 600);
    }
  }

  /* ==========================================================================
     03. SCROLL LOCK & MODAL MANAGER (focus trap, Esc, backdrop close)
     ========================================================================== */
  let lockCount = 0;
  const lockScroll = () => { lockCount += 1; root.classList.add('is-locked'); };
  const unlockScroll = () => { lockCount = Math.max(0, lockCount - 1); if (!lockCount) root.classList.remove('is-locked'); };

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusables = (container) => $$(FOCUSABLE, container).filter((el) => !el.hidden && el.getClientRects().length > 0);

  function trapTab(e, container) {
    const list = focusables(container);
    if (!list.length) { e.preventDefault(); return; }
    const first = list[0];
    const last = list[list.length - 1];
    const active = doc.activeElement;
    if (e.shiftKey && (active === first || !container.contains(active))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (active === last || !container.contains(active))) { e.preventDefault(); first.focus(); }
  }

  const Modal = (function () {
    let active = null;
    let opener = null;
    let hideTimer = 0;

    function open(el, opts) {
      if (!el) return;
      if (active && active !== el) close({ restoreFocus: false });
      clearTimeout(hideTimer);
      opener = (opts && opts.opener) || doc.activeElement;
      el.hidden = false;
      lockScroll();
      active = el;
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));
      const target = el.querySelector('[data-autofocus]') || el.querySelector('.modal__close') || focusables(el)[0];
      if (target) target.focus({ preventScroll: true });
    }

    function close(opts) {
      if (!active) return;
      const el = active;
      active = null;
      el.classList.remove('is-open');
      unlockScroll();
      const finish = () => { el.hidden = true; };
      if (reducedMotion()) finish(); else hideTimer = setTimeout(finish, 340);
      const restore = !opts || opts.restoreFocus !== false;
      if (restore && opener && doc.contains(opener)) opener.focus({ preventScroll: true });
      opener = null;
    }

    doc.addEventListener('click', (e) => {
      if (!active) return;
      const closer = e.target.closest('[data-close]');
      if (closer && active.contains(closer)) close();
    });

    doc.addEventListener('keydown', (e) => {
      if (!active) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') trapTab(e, active.querySelector('.modal__dialog') || active);
    });

    return {
      open: open,
      close: close,
      isOpen: (el) => active === el
    };
  })();

  /* Cross-module hooks (assigned by the modules below) */
  let prefillQuote = function () {};
  let openProduct = function () {};
  let setCalcProduct = function () {};

  /* ==========================================================================
     04. HEADER, MOBILE NAV, SCROLL UI
     ========================================================================== */
  function initHeader() {
    const header = $('#siteHeader');
    const nav = $('#siteNav');
    const btn = $('#menuToggle');
    const back = $('#backToTop');
    if (!header || !nav || !btn) return;

    const mobileMQ = window.matchMedia('(max-width: 1179.98px)');
    let open = false;

    function setOpen(state, returnFocus) {
      if (state === open) return;
      open = state;
      btn.setAttribute('aria-expanded', String(state));
      btn.setAttribute('aria-label', t(state ? 'nav.menuClose' : 'nav.menuOpen'));
      nav.classList.toggle('is-open', state);
      if (state) {
        lockScroll();
        const first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else {
        unlockScroll();
        if (returnFocus) btn.focus({ preventScroll: true });
      }
    }

    btn.addEventListener('click', () => setOpen(!open, false));
    nav.addEventListener('click', (e) => { if (open && e.target.closest('a')) setOpen(false, false); });

    doc.addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false, true); }
      else if (e.key === 'Tab') trapTab(e, header);
    });

    const onBreakpoint = () => { if (!mobileMQ.matches && open) setOpen(false, false); };
    if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', onBreakpoint);
    else if (mobileMQ.addListener) mobileMQ.addListener(onBreakpoint);

    onLang(() => btn.setAttribute('aria-label', t(open ? 'nav.menuClose' : 'nav.menuOpen')));

    /* Header shadow + back-to-top visibility (rAF-throttled) */
    let ticking = false;
    const update = () => {
      const y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 8);
      if (back) back.classList.toggle('is-visible', y > 700);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    if (back) {
      back.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: scrollBehavior() });
        const brand = $('.site-header .brand');
        if (brand) brand.focus({ preventScroll: true });
      });
    }

    /* Language toggle */
    const langBtn = $('#langToggle');
    if (langBtn) langBtn.addEventListener('click', () => setLanguage(lang === 'ar' ? 'en' : 'ar', true));
  }

  /* ==========================================================================
     05. SCROLL REVEAL & SCROLLSPY
     ========================================================================== */
  function initReveal() {
    const els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || reducedMotion()) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    /* Gentle stagger between sibling reveal elements */
    els.forEach((el) => {
      const sibs = Array.prototype.filter.call(el.parentElement.children, (c) => c.hasAttribute('data-reveal'));
      const idx = sibs.indexOf(el);
      if (idx > 0) el.style.setProperty('--rd', Math.min(idx, 6) * 80 + 'ms');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }

  function initScrollSpy() {
    const links = $$('.nav__link');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const byId = {};
    links.forEach((a) => { byId[a.getAttribute('href').slice(1)] = a; });
    const setActive = (id) => {
      links.forEach((l) => { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
      if (byId[id]) { byId[id].classList.add('is-active'); byId[id].setAttribute('aria-current', 'true'); }
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach((id) => { const s = doc.getElementById(id); if (s) io.observe(s); });
    const hero = $('.hero');
    if (hero) {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setActive(null);
      }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
    }
  }

  /* ==========================================================================
     06. HERO CANVAS — animated nano hexagon lattice with ripple + particles
     Pauses off-screen / in hidden tabs; single static frame for reduced motion.
     ========================================================================== */
  function initHeroCanvas() {
    const canvas = $('#heroCanvas');
    const hero = $('.hero');
    if (!canvas || !hero || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lattice = doc.createElement('canvas');
    const lctx = lattice.getContext('2d');
    const R = 24;
    const RING = 320;
    const SPEED = 80;
    let w = 1, h = 1, dpr = 1;
    let nodes = [];
    let particles = [];
    const origin = { x: 0, y: 0 };
    let raf = 0, running = false, inView = true, last = 0;
    const t0 = performance.now();

    function build() {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      lattice.width = canvas.width;
      lattice.height = canvas.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const vis = $('.hero__visual');
      if (vis) {
        const vr = vis.getBoundingClientRect();
        origin.x = vr.left - rect.left + vr.width / 2;
        origin.y = vr.top - rect.top + vr.height * 0.42;
      } else {
        origin.x = w * (isRTL() ? 0.3 : 0.7);
        origin.y = h * 0.45;
      }

      /* Static lattice (drawn once to an offscreen canvas) */
      const hx = Math.sqrt(3) * R;
      const vy = 1.5 * R;
      const seen = new Set();
      const edges = new Set();
      nodes = [];
      lctx.clearRect(0, 0, w, h);
      const grad = lctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, 'rgba(67, 56, 202, 0.17)');
      grad.addColorStop(1, 'rgba(14, 165, 198, 0.2)');
      lctx.strokeStyle = grad;
      lctx.lineWidth = 1;
      lctx.beginPath();
      const rows = Math.ceil(h / vy) + 2;
      const cols = Math.ceil(w / hx) + 2;
      const key = (x, y) => Math.round(x) + ',' + Math.round(y);
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const cx = c * hx + (r & 1 ? hx / 2 : 0);
          const cy = r * vy;
          const pts = [];
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 180) * (60 * k - 90);
            pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
          }
          for (let k = 0; k < 6; k++) {
            const p1 = pts[k];
            const p2 = pts[(k + 1) % 6];
            const k1 = key(p1[0], p1[1]);
            const k2 = key(p2[0], p2[1]);
            const ek = k1 < k2 ? k1 + '|' + k2 : k2 + '|' + k1;
            if (!edges.has(ek)) { edges.add(ek); lctx.moveTo(p1[0], p1[1]); lctx.lineTo(p2[0], p2[1]); }
            if (!seen.has(k1)) {
              seen.add(k1);
              const dx = p1[0] - origin.x;
              const dy = p1[1] - origin.y;
              nodes.push({ x: p1[0], y: p1[1], d: Math.sqrt(dx * dx + dy * dy), m: clamp(p1[0] / w, 0, 1) });
            }
          }
        }
      }
      lctx.stroke();
      lctx.fillStyle = 'rgba(67, 56, 202, 0.2)';
      nodes.forEach((n) => { lctx.beginPath(); lctx.arc(n.x, n.y, 1.1, 0, Math.PI * 2); lctx.fill(); });

      /* Drifting nano-particles */
      const count = Math.round(clamp((w * h) / 38000, 12, 34));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: -(0.06 + Math.random() * 0.2),
          r: 1.2 + Math.random() * 2.2
        });
      }
    }

    function draw(now, step) {
      const tt = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(lattice, 0, 0, w, h);

      /* Expanding ripple rings light up lattice nodes (a "droplet impact") */
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let ph = (n.d - tt * SPEED) % RING;
        if (ph < 0) ph += RING;
        const dist = Math.min(ph, RING - ph);
        if (dist > 36) continue;
        const I = Math.exp(-(dist * dist) / (2 * 13 * 13)) * Math.max(0, 1 - n.d / 950);
        if (I < 0.04) continue;
        const r = Math.round(67 + (34 - 67) * n.m);
        const g = Math.round(56 + (211 - 56) * n.m);
        const b = Math.round(202 + (238 - 202) * n.m);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.85 * I).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.3 + 2.4 * I, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Particles + faint molecular bonds between neighbours */
      const f = step || 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * f;
        p.y += p.vy * f;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12100) {
            ctx.strokeStyle = 'rgba(37, 99, 235,' + ((1 - Math.sqrt(d2) / 110) * 0.2).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = 'rgba(14, 165, 198, 0.5)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function frame(now) {
      const step = last ? clamp((now - last) / 16.67, 0, 3) : 1;
      last = now;
      draw(now, step);
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }
    function drawStatic() { draw(t0 + 2600, 0); }
    function sync() {
      if (inView && !doc.hidden && !reducedMotion()) start();
      else { stop(); if (reducedMotion()) drawStatic(); }
    }

    build();
    drawStatic();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; sync(); }).observe(hero);
    }
    doc.addEventListener('visibilitychange', sync);
    onMotionChange(sync);

    const rebuild = debounce(() => { build(); if (!running) drawStatic(); }, 160);
    if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(hero);
    else window.addEventListener('resize', rebuild);
    onLang(() => requestAnimationFrame(rebuild));

    sync();
  }

  /* ==========================================================================
     07. HERO COUNTERS
     ========================================================================== */
  function initCounters() {
    const nums = $$('[data-count]');
    if (!nums.length) return;
    const run = (el) => {
      const target = Number(el.getAttribute('data-count'));
      if (reducedMotion()) { el.textContent = fmt(target); return; }
      const dur = 1500;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window) || reducedMotion()) { nums.forEach((el) => { el.textContent = fmt(Number(el.getAttribute('data-count'))); }); return; }
    nums.forEach((el) => { el.textContent = '0'; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach((el) => io.observe(el));
  }

  /* ==========================================================================
     08. LOTUS-EFFECT DIAGRAM — droplet rolls, picks up dirt and carries it away
     ========================================================================== */
  function initLotus() {
    const svg = $('#lotusSvg');
    if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const row = $('#nanoRow');
    const dirtG = $('#lotusDirt');
    const drop = $('#lotusDrop');
    const shadow = $('#dropShadow');

    for (let x = 7; x < 480; x += 14) {
      const c = doc.createElementNS(NS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', 182); c.setAttribute('r', 6);
      row.appendChild(c);
    }

    const DY = 134;          /* droplet centre y */
    const DROP_R = 42;       /* rolling radius */
    const START = -60;
    const END = 560;
    const CYCLE = 6400;
    const offsets = [[-14, 18], [12, 20], [-4, 6], [20, 4], [-22, 0], [6, -12], [-10, -6]];
    const dirt = [150, 196, 244, 290, 338, 384, 430].map((x, i) => {
      const r = 3.6 + (i % 3) * 0.9;
      const el = doc.createElementNS(NS, 'circle');
      el.setAttribute('r', r.toFixed(1));
      dirtG.appendChild(el);
      return { el: el, x0: x, y0: 176 - r, ox: offsets[i][0], oy: offsets[i][1], cap: null };
    });

    function render(p) {
      const x = START + (END - START) * p;
      drop.setAttribute('transform', 'translate(' + x.toFixed(1) + ' 0)');
      shadow.setAttribute('cx', x.toFixed(1));
      dirt.forEach((d) => {
        if (d.cap === null && x + 34 >= d.x0) d.cap = x;
        if (d.cap !== null) {
          /* Rolling without slipping: angle = distance / radius */
          const a = (x - d.cap) / DROP_R;
          const cos = Math.cos(a), sin = Math.sin(a);
          d.el.setAttribute('cx', (x + d.ox * cos - d.oy * sin).toFixed(1));
          d.el.setAttribute('cy', (DY + d.ox * sin + d.oy * cos).toFixed(1));
          d.el.setAttribute('opacity', '1');
        } else {
          d.el.setAttribute('cx', d.x0);
          d.el.setAttribute('cy', d.y0.toFixed(1));
          d.el.setAttribute('opacity', p < 0.06 ? (p / 0.06).toFixed(2) : '1');
        }
      });
    }
    const reset = () => dirt.forEach((d) => { d.cap = null; });

    let raf = 0, running = false, startTime = 0, lastP = 0, inView = false;
    function frame(now) {
      if (!startTime) startTime = now;
      const p = ((now - startTime) % CYCLE) / CYCLE;
      if (p < lastP) reset();
      lastP = p;
      render(p);
      raf = requestAnimationFrame(frame);
    }
    function sync() {
      const shouldRun = inView && !doc.hidden && !reducedMotion();
      if (shouldRun && !running) { running = true; raf = requestAnimationFrame(frame); }
      else if (!shouldRun && running) { running = false; cancelAnimationFrame(raf); }
      if (reducedMotion()) { reset(); render(0.5); }
    }

    reset();
    render(0.5);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; sync(); }, { threshold: 0.2 }).observe(svg);
    }
    doc.addEventListener('visibilitychange', sync);
    onMotionChange(sync);
  }

  /* ==========================================================================
     09. BEFORE / AFTER SLIDER (mouse, touch, keyboard — direction-aware)
     ========================================================================== */
  function initCompare() {
    const ba = $('#ba');
    const handle = $('#baHandle');
    if (!ba || !handle) return;
    let pos = 50;
    let dragging = false;
    let pending = null;

    function render() {
      ba.style.setProperty('--pos', pos.toFixed(2) + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
      handle.setAttribute('aria-valuetext', t('compare.valuetext', { n: Math.round(pos) }));
      ba.classList.toggle('is-low', pos < 22);
      ba.classList.toggle('is-high', pos > 78);
    }
    function setFromX(clientX) {
      const r = ba.getBoundingClientRect();
      const f = clamp((clientX - r.left) / r.width, 0, 1);
      pos = (isRTL() ? 1 - f : f) * 100;
      render();
    }
    function begin(e) {
      dragging = true;
      ba.classList.add('is-dragging', 'is-touched');
      try { ba.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      setFromX(e.clientX);
    }

    ba.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.pointerType === 'touch') {
        /* Wait to see if the gesture is horizontal so vertical scrolling still works */
        pending = { x: e.clientX, y: e.clientY, id: e.pointerId };
        return;
      }
      e.preventDefault();
      begin(e);
      handle.focus({ preventScroll: true });
    });
    ba.addEventListener('pointermove', (e) => {
      if (pending && e.pointerId === pending.id) {
        const dx = Math.abs(e.clientX - pending.x);
        const dy = Math.abs(e.clientY - pending.y);
        if (dx > 6 && dx > dy) { pending = null; begin(e); }
        else if (dy > 10) pending = null;
        return;
      }
      if (dragging) setFromX(e.clientX);
    });
    const end = (e) => {
      if (pending && e && e.type === 'pointerup' && e.pointerId === pending.id) {
        /* A tap moves the handle to the tapped point */
        ba.classList.add('is-touched');
        setFromX(e.clientX);
      }
      pending = null;
      dragging = false;
      ba.classList.remove('is-dragging');
    };
    ba.addEventListener('pointerup', end);
    ba.addEventListener('pointercancel', end);
    ba.addEventListener('lostpointercapture', () => { dragging = false; ba.classList.remove('is-dragging'); });

    handle.addEventListener('keydown', (e) => {
      const stepSize = e.shiftKey ? 10 : 2;
      let next = pos;
      switch (e.key) {
        case 'ArrowRight': next = pos + (isRTL() ? -stepSize : stepSize); break;
        case 'ArrowLeft': next = pos + (isRTL() ? stepSize : -stepSize); break;
        case 'ArrowUp': next = pos + stepSize; break;
        case 'ArrowDown': next = pos - stepSize; break;
        case 'PageUp': next = pos + 10; break;
        case 'PageDown': next = pos - 10; break;
        case 'Home': next = 0; break;
        case 'End': next = 100; break;
        default: return;
      }
      e.preventDefault();
      pos = clamp(next, 0, 100);
      ba.classList.add('is-touched');
      render();
    });

    /* One gentle "peek" animation the first time the slider scrolls into view */
    if ('IntersectionObserver' in window && !reducedMotion()) {
      const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        if (ba.classList.contains('is-touched')) return;
        const keys = [[0, 50], [650, 30], [1400, 66], [2000, 50]];
        const t0 = performance.now();
        const tick = (now) => {
          if (ba.classList.contains('is-touched')) return;
          const el = now - t0;
          let i = 0;
          while (i < keys.length - 2 && el > keys[i + 1][0]) i++;
          const a = keys[i], b = keys[i + 1];
          const p = clamp((el - a[0]) / (b[0] - a[0]), 0, 1);
          const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          pos = a[1] + (b[1] - a[1]) * e;
          render();
          if (el < keys[keys.length - 1][0]) requestAnimationFrame(tick);
        };
        setTimeout(() => requestAnimationFrame(tick), 500);
      }, { threshold: 0.55 });
      io.observe(ba);
    }

    render();
    onLang(render);
  }

  /* ==========================================================================
     10. PRODUCTS + PRODUCT MODAL
     ========================================================================== */
  const productById = (id) => DATA.products.find((p) => p.id === id);
  const isRoofProduct = (p) => p.cats[0] === 'roof';
  let canUid = 0;

  /* Designed paint-can illustration (brand label + product color band) */
  function canSVG(p) {
    const id = 'cn' + (++canUid);
    const name = L(p.name);
    const fs = name.length > 12 ? 12.5 : name.length > 9 ? 14 : 16;
    const cat = t('cat.' + p.cats[0]);
    const c = p.color;
    const dark = mixHex(c, '#000000', 0.28);
    const light = mixHex(c, '#ffffff', 0.28);
    const catSpacing = lang === 'en' ? ' letter-spacing="1.6"' : '';
    const catText = lang === 'en' ? cat.toUpperCase() : cat;
    return '' +
      '<svg class="can" viewBox="0 0 200 232" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<linearGradient id="' + id + 'm" x1="0" x2="1"><stop offset="0" stop-color="#C6CED9"/><stop offset=".14" stop-color="#F4F7FA"/><stop offset=".42" stop-color="#FFFFFF"/><stop offset=".78" stop-color="#E1E6EC"/><stop offset="1" stop-color="#B6C0CC"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="0" x2="1"><stop offset="0" stop-color="#0E1B2E" stop-opacity=".24"/><stop offset=".2" stop-color="#0E1B2E" stop-opacity="0"/><stop offset=".33" stop-color="#FFFFFF" stop-opacity=".42"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".82" stop-color="#0E1B2E" stop-opacity=".05"/><stop offset="1" stop-color="#0E1B2E" stop-opacity=".28"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + light + '"/><stop offset=".55" stop-color="' + c + '"/><stop offset="1" stop-color="' + dark + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4338CA"/><stop offset="1" stop-color="#06B6D4"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="100" cy="216" rx="80" ry="10" fill="#0E1B2E" opacity=".16"/>' +
      '<path d="M36 74C36 8 164 8 164 74" fill="none" stroke="#8C98A8" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M30 62V200A70 13 0 0 0 170 200V62Z" fill="url(#' + id + 'm)"/>' +
      '<path d="M30 90A70 13 0 0 0 170 90V188A70 13 0 0 1 30 188Z" fill="#FFFFFF"/>' +
      '<path d="M30 150A70 13 0 0 0 170 150V188A70 13 0 0 1 30 188Z" fill="url(#' + id + 'b)"/>' +
      '<path d="M30 145A70 13 0 0 0 170 145V149A70 13 0 0 1 30 149Z" fill="' + c + '" opacity=".4"/>' +
      '<g transform="translate(100 107)"><path d="M0-9 7.8-4.5v9L0 9-7.8 4.5v-9Z" fill="url(#' + id + 'h)"/><path d="M0-4.4c-1.9 2.3-3.2 4.1-3.2 5.8a3.2 3.2 0 0 0 6.4 0c0-1.7-1.3-3.5-3.2-5.8Z" fill="#fff"/></g>' +
      '<text x="100" y="128" text-anchor="middle" direction="ltr" font-size="8.5" font-weight="800" letter-spacing="2.6" fill="#5A6B82">NANOVA</text>' +
      '<text x="100" y="148" text-anchor="middle" direction="ltr" font-size="' + fs + '" font-weight="800" fill="#0E1B2E">' + esc(name) + '</text>' +
      '<text x="100" y="185" text-anchor="middle" font-size="10" font-weight="700" fill="#FFFFFF"' + catSpacing + '>' + esc(catText) + '</text>' +
      '<path d="M30 62V200A70 13 0 0 0 170 200V62A70 13 0 0 1 30 62Z" fill="url(#' + id + 's)"/>' +
      '<ellipse cx="100" cy="62" rx="70" ry="13" fill="#D5DBE3"/>' +
      '<ellipse cx="100" cy="61" rx="62" ry="10" fill="url(#' + id + 'b)"/>' +
      '<ellipse cx="94" cy="59" rx="40" ry="5" fill="#fff" opacity=".2"/>' +
      '<circle cx="36" cy="76" r="4" fill="#8C98A8"/><circle cx="164" cy="76" r="4" fill="#8C98A8"/>' +
      '</svg>';
  }

  function initProducts() {
    const grid = $('#productGrid');
    const count = $('#productCount');
    const filterBtns = $$('#productFilters .filter');
    const modal = $('#productModal');
    const content = $('#pmContent');
    if (!grid) return;
    let current = 'all';
    let openId = null;

    function card(p, i) {
      const badges = p.badges.map((b) => '<span class="badge badge--' + b + '">' + esc(t('badge.' + b)) + '</span>').join('');
      const smallest = Math.min.apply(null, p.sizes);
      const price = p.prices[String(smallest)];
      return '<li><article class="product-card" style="--p:' + p.color + ';--i:' + i + '">' +
        '<div class="product-card__media">' + canSVG(p) + (badges ? '<div class="product-card__badges">' + badges + '</div>' : '') + '</div>' +
        '<div class="product-card__body">' +
          '<p class="product-card__type">' + esc(L(p.type)) + '</p>' +
          '<h3 class="product-card__title"><button class="product-card__btn" type="button" data-product="' + p.id + '" aria-haspopup="dialog">' + rich(L(p.name)) + '</button></h3>' +
          '<p class="product-card__short">' + rich(L(p.short)) + '</p>' +
          '<dl class="product-card__meta">' +
            '<div><dt>' + esc(t('products.finish')) + '</dt><dd>' + esc(L(p.finish)) + '</dd></div>' +
            '<div><dt>' + esc(t('products.coverage')) + '</dt><dd>' + fmt(p.coverage, 1) + ' ' + esc(t('unit.m2L')) + '</dd></div>' +
          '</dl>' +
          '<div class="product-card__foot">' +
            '<p class="product-card__price">' + esc(t('products.from')) + ' (' + sizeLabel(smallest) + ')<strong>' + esc(money(price)) + '</strong></p>' +
            '<span class="product-card__go" aria-hidden="true">' + svgIcon('i-arrow', 'i-dir') + '</span>' +
          '</div>' +
        '</div></article></li>';
    }

    function render() {
      const list = DATA.products.filter((p) => current === 'all' || p.cats.indexOf(current) > -1);
      grid.innerHTML = list.map(card).join('');
      if (count) count.textContent = t('products.count', { n: fmt(list.length) });
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        current = btn.getAttribute('data-filter');
        filterBtns.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        render();
      });
    });

    function renderModal(id) {
      const p = productById(id);
      if (!p || !content) return;
      const cats = p.cats.map((c) => '<span class="chip chip--glass">' + esc(t('cat.' + c)) + '</span>').join('');
      const sizes = p.sizes.map(sizeLabel).join(listJoin());
      const prices = p.sizes.map((s) => '<span class="price-chip"><small>' + sizeLabel(s) + '</small><strong>' + esc(money(p.prices[String(s)])) + '</strong></span>').join('');
      const coats = p.coats === 2 ? t('spec.coatsTwo') : t('spec.coatsVal', { n: fmt(p.coats) });
      const row = (label, value) => '<tr><th scope="row">' + esc(label) + '</th><td>' + rich(value) + '</td></tr>';
      content.style.setProperty('--p', p.color);
      content.innerHTML =
        '<div class="pm__media" style="--p:' + p.color + '">' + canSVG(p) + '<div class="pm__cats">' + cats + '</div></div>' +
        '<div class="pm__body">' +
          '<p class="pm__type">' + esc(L(p.type)) + '</p>' +
          '<h2 class="pm__title" id="pmTitle">' + rich(L(p.name)) + '</h2>' +
          '<p class="pm__desc">' + rich(L(p.desc)) + '</p>' +
          '<h3 class="pm__h">' + esc(t('modal.features')) + '</h3>' +
          '<ul class="pm__features">' + p.features.map((f) => '<li>' + svgIcon('i-check') + '<span>' + rich(L(f)) + '</span></li>').join('') + '</ul>' +
          '<h3 class="pm__h">' + esc(t('modal.specs')) + '</h3>' +
          '<table class="spec"><tbody>' +
            row(t('spec.coverage'), t('spec.coverageVal', { n: fmt(p.coverage, 1) })) +
            row(t('spec.dry'), L(p.dry)) +
            row(t('spec.recoat'), L(p.recoat)) +
            row(t('spec.finish'), L(p.finish)) +
            row(t('spec.sizes'), sizes) +
            row(t('spec.coats'), coats) +
            row(t('spec.surfaces'), L(p.surfaces)) +
          '</tbody></table>' +
          '<h3 class="pm__h">' + esc(t('modal.prices')) + '</h3>' +
          '<div class="pm__prices">' + prices + '</div>' +
          '<p class="pm__note">' + esc(t('modal.priceNote')) + '</p>' +
          '<div class="pm__actions">' +
            '<button class="btn btn--grad" type="button" data-quote="' + p.id + '"><span>' + esc(t('modal.quote')) + '</span>' + svgIcon('i-arrow', 'i-dir') + '</button>' +
            '<button class="btn btn--soft" type="button" data-calc="' + p.id + '"><span>' + esc(t('modal.calc')) + '</span></button>' +
          '</div>' +
        '</div>';
    }

    openProduct = function (id, opener) {
      if (!productById(id)) return;
      openId = id;
      renderModal(id);
      if (content && content.parentElement) content.parentElement.scrollTop = 0;
      Modal.open(modal, { opener: opener });
    };

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-product]');
      if (btn) openProduct(btn.getAttribute('data-product'), btn);
    });

    if (content) {
      content.addEventListener('click', (e) => {
        const q = e.target.closest('[data-quote]');
        const c = e.target.closest('[data-calc]');
        if (q) {
          const p = productById(q.getAttribute('data-quote'));
          Modal.close({ restoreFocus: false });
          prefillQuote({ productId: p.id, message: t('contact.prefillProduct', { product: isoRaw(L(p.name)) }) });
        } else if (c) {
          Modal.close({ restoreFocus: false });
          setCalcProduct(c.getAttribute('data-calc'));
        }
      });
    }

    render();
    onLang(() => {
      render();
      if (openId && Modal.isOpen(modal)) {
        renderModal(openId);
        const closeBtn = modal.querySelector('.modal__close');
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      }
    });
  }

  /* ==========================================================================
     11. COLOR STUDIO
     ========================================================================== */
  function initStudio() {
    const svg = $('#roomSvg');
    const palette = $('#palette');
    if (!svg || !palette) return;
    const chip = $('#studioChip');
    const nameEl = $('#studioName');
    const codeEl = $('#studioCode');
    const hexEl = $('#studioHex');
    const saveBtn = $('#saveColor');
    const saveLabel = $('#saveColorLabel');
    const copyBtn = $('#copyColor');
    const copyLabel = $('#copyColorLabel');
    const sampleBtn = $('#sampleColor');
    const favList = $('#favList');
    const favEmpty = $('#favEmpty');
    const favCount = $('#favCount');
    const MAX_FAVS = 5;
    const SIDE_DEFAULT = '#F2F0EB';

    const byCode = (code) => DATA.colors.find((c) => c.code === code);
    let selected = store.get('nanova-color', 'NV-4036');
    if (!byCode(selected)) selected = 'NV-4036';
    let mode = 'accent';
    let favs = store.getJSON('nanova-favs', []);
    if (!Array.isArray(favs)) favs = [];
    favs = favs.filter((c, i, arr) => byCode(c) && arr.indexOf(c) === i).slice(0, MAX_FAVS);
    let copyTimer = 0;

    function renderPalette() {
      palette.innerHTML = DATA.colorFamilies.map((fam) => {
        const swatches = DATA.colors.filter((c) => c.family === fam).map((c) => {
          const nm = L(c.name);
          return '<button class="swatch" type="button" style="--c:' + c.hex + ';--check:' + (isLight(c.hex) ? '#0E1B2E' : '#FFFFFF') + '"' +
            ' data-code="' + c.code + '" data-name="' + esc(nm) + '" aria-label="' + esc(nm + ' — ' + c.code) + '" aria-pressed="' + (c.code === selected) + '"></button>';
        }).join('');
        return '<div class="family"><p class="family__name" id="fam-' + fam + '">' + esc(t('family.' + fam)) + '</p>' +
          '<div class="family__swatches" role="group" aria-labelledby="fam-' + fam + '">' + swatches + '</div></div>';
      }).join('');
    }

    function apply() {
      const c = byCode(selected);
      svg.style.setProperty('--wall-accent', c.hex);
      svg.style.setProperty('--wall-side', mode === 'all' ? c.hex : SIDE_DEFAULT);
      if (chip) chip.style.setProperty('--sel', c.hex);
      nameEl.textContent = L(c.name);
      codeEl.textContent = c.code;
      hexEl.textContent = c.hex.toUpperCase();
      $$('.swatch', palette).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-code') === selected)));
      const saved = favs.indexOf(selected) > -1;
      saveBtn.setAttribute('aria-pressed', String(saved));
      saveLabel.textContent = t(saved ? 'studio.saved' : 'studio.save');
    }

    function renderFavs() {
      favList.innerHTML = favs.map((code) => {
        const c = byCode(code);
        const nm = L(c.name);
        return '<li class="fav">' +
          '<button class="fav__pick" type="button" data-pick="' + code + '" aria-label="' + esc(t('studio.pick', { name: nm })) + '">' +
            '<span class="fav__sw" style="--c:' + c.hex + '"></span>' +
            '<span><span class="fav__name">' + esc(nm) + '</span><span class="fav__code">' + code + '</span></span>' +
          '</button>' +
          '<button class="fav__remove" type="button" data-remove="' + code + '" aria-label="' + esc(t('studio.remove', { name: nm })) + '">' + svgIcon('i-close') + '</button>' +
        '</li>';
      }).join('');
      favEmpty.hidden = favs.length > 0;
      favCount.textContent = favs.length + '/' + MAX_FAVS;
    }

    function select(code) {
      if (!byCode(code)) return;
      selected = code;
      store.set('nanova-color', code);
      apply();
    }
    function saveFavs() { store.setJSON('nanova-favs', favs); }

    palette.addEventListener('click', (e) => {
      const b = e.target.closest('.swatch');
      if (b) select(b.getAttribute('data-code'));
    });

    $$('input[name="wallMode"]').forEach((input) => {
      input.addEventListener('change', () => { if (input.checked) { mode = input.value; apply(); } });
    });

    saveBtn.addEventListener('click', () => {
      const c = byCode(selected);
      const idx = favs.indexOf(selected);
      if (idx > -1) {
        favs.splice(idx, 1);
        toast(t('studio.removedMsg', { name: L(c.name) }));
      } else if (favs.length >= MAX_FAVS) {
        toast(t('studio.favsFull'));
        return;
      } else {
        favs.push(selected);
        toast(t('studio.savedMsg', { name: L(c.name) }));
      }
      saveFavs();
      renderFavs();
      apply();
    });

    favList.addEventListener('click', (e) => {
      const pick = e.target.closest('[data-pick]');
      const rem = e.target.closest('[data-remove]');
      if (pick) select(pick.getAttribute('data-pick'));
      if (rem) {
        const code = rem.getAttribute('data-remove');
        const idx = favs.indexOf(code);
        if (idx < 0) return;
        favs.splice(idx, 1);
        saveFavs();
        renderFavs();
        apply();
        toast(t('studio.removedMsg', { name: L(byCode(code).name) }));
        /* Keep keyboard focus in a sensible place */
        const removeBtns = $$('.fav__remove', favList);
        const next = removeBtns[Math.min(idx, removeBtns.length - 1)];
        (next || saveBtn).focus({ preventScroll: true });
      }
    });

    function copied() {
      copyBtn.classList.add('is-done');
      copyLabel.textContent = t('studio.copied');
      toast(t('studio.copied') + ' — ' + isoRaw(selected));
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { copyBtn.classList.remove('is-done'); copyLabel.textContent = t('studio.copy'); }, 1800);
    }
    function fallbackCopy(text) {
      try {
        const ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        doc.body.appendChild(ta);
        ta.select();
        const ok = doc.execCommand('copy');
        doc.body.removeChild(ta);
        if (ok) copied();
      } catch (err) { /* copying not available */ }
    }
    copyBtn.addEventListener('click', () => {
      const c = byCode(selected);
      const text = c.code + ' ' + L(c.name) + ' ' + c.hex.toUpperCase();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(copied, () => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    });

    sampleBtn.addEventListener('click', () => {
      const c = byCode(selected);
      prefillQuote({ message: t('studio.sampleMsg', { name: L(c.name), code: isoRaw(c.code) }) });
    });

    renderPalette();
    renderFavs();
    apply();
    onLang(() => { renderPalette(); renderFavs(); apply(); copyLabel.textContent = t('studio.copy'); });
  }

  /* ==========================================================================
     12. PAINT CALCULATOR
     ========================================================================== */
  function initCalculator() {
    const form = $('#calcForm');
    if (!form) return;
    const inputs = {
      length: $('#cLength'),
      width: $('#cWidth'),
      height: $('#cHeight'),
      doors: $('#cDoors'),
      windows: $('#cWindows')
    };
    const productSel = $('#cProduct');
    const ceiling = $('#cCeiling');
    const roofNote = $('#calcRoofNote');
    const results = $('#calcResults');
    const rArea = $('#rArea');
    const rAreaLabel = $('#rAreaLabel');
    const rLiters = $('#rLiters');
    const rCans = $('#rCans');
    const rTotal = $('#rTotal');
    const rCost = $('#rCost');
    const invalidEl = $('#calcInvalid');
    const live = $('#calcLive');
    const quoteBtn = $('#calcQuote');

    const DOOR = 0.9 * 2.1;
    const WINDOW = 1.2 * 1.2;
    const WASTE = 1.1;
    let errors = {};
    let last = null;
    let lastLiters = null;

    const miniCan = '<svg viewBox="0 0 22 24" aria-hidden="true" focusable="false"><path d="M5 8c0-5 12-5 12 0" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".6"/><rect x="3" y="7" width="16" height="15" rx="3" fill="rgba(255,255,255,.12)" stroke="currentColor" stroke-width="1.4"/><rect x="3.7" y="13" width="14.6" height="5" fill="#67E8F9" opacity=".85"/></svg>';

    function fillProducts() {
      const keep = productSel.value || 'ecopure';
      productSel.innerHTML = DATA.products.map((p) => '<option value="' + p.id + '">' + esc(productOption(p)) + '</option>').join('');
      productSel.value = productById(keep) ? keep : 'ecopure';
    }

    function parseNum(el) {
      const raw = normalizeDigits(el.value).replace(',', '.').trim();
      if (!/^(\d+\.?\d*|\.\d+)$/.test(raw)) return NaN;
      return parseFloat(raw);
    }

    /* Minimum-cost can combination that covers the required litres */
    function bestCombo(liters, p) {
      const sizes = p.sizes.slice().sort((a, b) => b - a);
      const price = (s) => p.prices[String(s)];
      const need = Math.max(liters, 0.01);
      const EPS = 1e-9;
      let best = null;
      const consider = (counts) => {
        let vol = 0, cost = 0, cans = 0;
        counts.forEach((n, i) => { vol += n * sizes[i]; cost += n * price(sizes[i]); cans += n; });
        if (vol + EPS < need) return;
        if (!best || cost < best.cost - EPS ||
          (Math.abs(cost - best.cost) < EPS && (vol < best.volume - EPS || (Math.abs(vol - best.volume) < EPS && cans < best.cans)))) {
          best = { counts: counts.slice(), cost: cost, volume: vol, cans: cans };
        }
      };
      const maxA = Math.ceil(need / sizes[0]);
      if (sizes.length === 1) {
        consider([maxA]);
      } else if (sizes.length === 2) {
        for (let a = 0; a <= maxA; a++) {
          const rem = need - a * sizes[0];
          consider([a, rem > 0 ? Math.ceil(rem / sizes[1] - EPS) : 0]);
        }
      } else {
        for (let a = 0; a <= maxA; a++) {
          const rem = need - a * sizes[0];
          const maxB = rem > 0 ? Math.ceil(rem / sizes[1]) : 0;
          for (let b = 0; b <= maxB; b++) {
            const rem2 = rem - b * sizes[1];
            consider([a, b, rem2 > 0 ? Math.ceil(rem2 / sizes[2] - EPS) : 0]);
          }
        }
      }
      return {
        items: best.counts.map((n, i) => ({ size: sizes[i], count: n })).filter((x) => x.count > 0),
        cost: best.cost,
        volume: best.volume
      };
    }

    function paintErrors() {
      Object.keys(inputs).forEach((k) => {
        const el = inputs[k];
        const errEl = $('#' + el.id + 'Err');
        if (errors[k]) {
          el.setAttribute('aria-invalid', 'true');
          if (errEl) errEl.textContent = t(errors[k].key, errors[k].vars);
        } else {
          el.removeAttribute('aria-invalid');
          if (errEl) errEl.textContent = '';
        }
      });
    }

    const announce = debounce(() => {
      if (live && last) live.textContent = t('calc.live', { liters: fmt(last.liters, 1), area: fmt(last.area, 1) });
    }, 800);

    function render() {
      if (!last) {
        results.classList.add('is-invalid');
        invalidEl.hidden = false;
        rArea.textContent = '—';
        rLiters.textContent = '—';
        rCans.innerHTML = '';
        rTotal.textContent = '';
        rCost.textContent = '—';
        return;
      }
      results.classList.remove('is-invalid');
      invalidEl.hidden = true;
      rArea.textContent = fmt(last.area, 1);
      rLiters.textContent = fmt(last.liters, 1);
      rCans.innerHTML = last.combo.items.map((it) =>
        '<li class="can-chip">' + miniCan + '<span dir="ltr">' + fmt(it.count) + ' × ' + fmt(it.size, 1) + '</span><small>' + esc(t('unit.L')) + '</small></li>').join('');
      rTotal.textContent = t('calc.total', { n: fmt(last.combo.volume, 1) });
      rCost.textContent = money(last.combo.cost);
      if (lastLiters !== null && Math.abs(lastLiters - last.liters) > 0.05 && !reducedMotion()) {
        const v = rLiters.parentElement;
        v.classList.remove('is-bump');
        void v.offsetWidth;
        v.classList.add('is-bump');
      }
      lastLiters = last.liters;
    }

    function compute() {
      const p = productById(productSel.value) || DATA.products[0];
      const roof = isRoofProduct(p);

      /* Roof coatings only need the plan area */
      $$('[data-wall-only]', form).forEach((el) => {
        el.classList.toggle('is-disabled', roof);
        $$('input, button', el).forEach((i) => { i.disabled = roof; });
      });
      roofNote.hidden = !roof;
      rAreaLabel.textContent = t(roof ? 'calc.areaRoof' : 'calc.area');

      errors = {};
      const v = {};
      Object.keys(inputs).forEach((k) => {
        const el = inputs[k];
        if (roof && el.closest('[data-wall-only]')) { v[k] = 0; return; }
        const min = Number(el.getAttribute('data-min'));
        const max = Number(el.getAttribute('data-max'));
        let n = parseNum(el);
        if (el.hasAttribute('data-int') && Math.floor(n) !== n) n = NaN;
        if (isNaN(n) || n < min || n > max) errors[k] = { key: 'calc.err.range', vars: { min: fmt(min), max: fmt(max) } };
        v[k] = n;
      });

      let area = 0;
      if (!Object.keys(errors).length) {
        if (roof) {
          area = v.length * v.width;
        } else {
          const walls = 2 * (v.length + v.width) * v.height;
          const openings = v.doors * DOOR + v.windows * WINDOW;
          if (openings >= walls) {
            errors.windows = { key: 'calc.err.openings' };
          } else {
            area = walls - openings;
            if (ceiling.checked) area += v.length * v.width;
          }
        }
      }
      paintErrors();

      if (Object.keys(errors).length) {
        last = null;
        render();
        return;
      }
      const checked = form.querySelector('input[name="coats"]:checked');
      const coats = checked ? Number(checked.value) : 2;
      const liters = (area * coats / p.coverage) * WASTE;
      last = { area: area, liters: liters, product: p, combo: bestCombo(liters, p) };
      render();
      announce();
    }

    form.addEventListener('input', compute);
    form.addEventListener('change', compute);
    form.addEventListener('submit', (e) => e.preventDefault());

    $$('.stepper__btn', form).forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = $('#' + btn.getAttribute('data-target'));
        const min = Number(input.getAttribute('data-min'));
        const max = Number(input.getAttribute('data-max'));
        const cur = parseNum(input);
        const next = clamp((isNaN(cur) ? min : Math.round(cur)) + Number(btn.getAttribute('data-step')), min, max);
        input.value = String(next);
        compute();
      });
    });

    quoteBtn.addEventListener('click', () => {
      if (!last) {
        const firstBad = Object.keys(inputs).find((k) => errors[k]);
        if (firstBad) inputs[firstBad].focus();
        return;
      }
      prefillQuote({
        productId: last.product.id,
        area: Math.round(last.area),
        message: t('contact.prefillCalc', { liters: fmt(last.liters, 1), product: isoRaw(L(last.product.name)), area: fmt(last.area, 1) })
      });
    });

    setCalcProduct = function (id) {
      if (!productById(id)) return;
      productSel.value = id;
      compute();
      scrollToEl($('#calculator'));
      productSel.focus({ preventScroll: true });
    };

    fillProducts();
    compute();
    onLang(() => { fillProducts(); compute(); });
  }

  /* ==========================================================================
     13. PROJECTS + LIGHTBOX
     ========================================================================== */
  function initProjects() {
    const grid = $('#projectGrid');
    const filterBtns = $$('#projectFilters .filter');
    const lb = $('#lightbox');
    if (!grid || !lb) return;
    const lbImg = $('#lbImg');
    const lbMedia = $('#lbMedia');
    const prevBtn = $('#lbPrev');
    const nextBtn = $('#lbNext');
    let filter = 'all';
    let list = DATA.projects.slice();
    let index = 0;

    function render() {
      list = DATA.projects.filter((p) => filter === 'all' || p.cat === filter);
      const featured = list.length >= 3;
      grid.innerHTML = list.map((p, i) => {
        const big = featured && i === 0;
        return '<li' + (big ? ' class="is-featured"' : '') + '><article class="project" style="--tint:' + p.tint + ';--i:' + i + '">' +
          '<img src="' + DATA.img(p.img, 1000) + '" alt="' + esc(L(p.alt)) + '" width="1000" height="667" loading="lazy" decoding="async">' +
          '<span class="chip chip--glass project__cat">' + esc(t('pcat.' + p.cat)) + '</span>' +
          '<span class="project__open" aria-hidden="true">' + svgIcon('i-plus') + '</span>' +
          '<div class="project__body">' +
            '<h3 class="project__title"><button class="project__btn" type="button" data-index="' + i + '" aria-haspopup="dialog">' + rich(L(p.title)) + '</button></h3>' +
            '<p class="project__city">' + svgIcon('i-pin') + '<span>' + rich(L(p.city)) + '</span></p>' +
            '<div class="project__more"><div><p class="project__facts">' +
              '<span>' + esc(t('projects.product')) + ': <strong>' + rich(L(p.products)) + '</strong></span>' +
              '<span>' + esc(t('projects.area')) + ': <strong>' + fmt(p.area) + ' ' + esc(t('unit.m2')) + '</strong></span>' +
            '</p></div></div>' +
          '</div>' +
        '</article></li>';
      }).join('');
    }

    function show(i) {
      if (!list.length) return;
      index = (i + list.length) % list.length;
      const p = list[index];
      lbMedia.style.setProperty('--tint', p.tint);
      lbImg.classList.remove('is-broken');
      lbImg.classList.add('is-loading');
      lbImg.onload = () => lbImg.classList.remove('is-loading');
      lbImg.onerror = () => { lbImg.classList.remove('is-loading'); lbImg.classList.add('is-broken'); };
      lbImg.src = DATA.img(p.img, 1600);
      lbImg.alt = L(p.alt);
      if (lbImg.complete && lbImg.naturalWidth > 1) lbImg.classList.remove('is-loading');
      $('#lbCat').textContent = t('pcat.' + p.cat);
      $('#lbCounter').textContent = t('lb.counter', { i: fmt(index + 1), n: fmt(list.length) });
      $('#lbTitle').innerHTML = rich(L(p.title));
      $('#lbCity').innerHTML = rich(L(p.city));
      $('#lbDesc').innerHTML = rich(L(p.desc));
      $('#lbMeta').innerHTML =
        '<div><dt>' + esc(t('projects.product')) + '</dt><dd>' + rich(L(p.products)) + '</dd></div>' +
        '<div><dt>' + esc(t('projects.area')) + '</dt><dd>' + fmt(p.area) + ' ' + esc(t('unit.m2')) + '</dd></div>' +
        '<div><dt>' + esc(t('projects.year')) + '</dt><dd>' + p.year + '</dd></div>';
      const single = list.length < 2;
      prevBtn.hidden = single;
      nextBtn.hidden = single;
      /* Preload neighbours for instant navigation */
      if (!single) {
        [list[(index + 1) % list.length], list[(index - 1 + list.length) % list.length]].forEach((n) => {
          const im = new Image(); im.src = DATA.img(n.img, 1600);
        });
      }
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filter = btn.getAttribute('data-pfilter');
        filterBtns.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        render();
      });
    });

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-index]');
      if (!btn) return;
      show(Number(btn.getAttribute('data-index')));
      Modal.open(lb, { opener: btn });
    });
    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));

    /* Arrow keys follow reading direction: in RTL, ArrowLeft = next */
    doc.addEventListener('keydown', (e) => {
      if (!Modal.isOpen(lb) || list.length < 2) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index + (isRTL() ? 1 : -1)); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(index + (isRTL() ? -1 : 1)); }
    });

    /* Swipe on touch devices, also direction-aware */
    let sx = null, sy = null;
    lbMedia.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
    lbMedia.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      sx = sy = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      const forward = isRTL() ? dx > 0 : dx < 0;
      show(index + (forward ? 1 : -1));
    });

    render();
    onLang(() => { render(); if (Modal.isOpen(lb)) show(index); });
  }

  /* ==========================================================================
     14. DEALER FINDER
     ========================================================================== */
  function initDealers() {
    const sel = $('#dealerCity');
    const grid = $('#dealerGrid');
    const count = $('#dealerCount');
    if (!sel || !grid) return;
    let city = store.get('nanova-city', 'riyadh');
    if (!DATA.dealers[city]) city = 'riyadh';

    const cities = DATA.cities.filter((c) => DATA.dealers[c.id]);
    const total = cities.reduce((sum, c) => sum + DATA.dealers[c.id].length, 0);

    function fill() {
      sel.innerHTML = cities.map((c) => '<option value="' + c.id + '">' + esc(L(c.name)) + '</option>').join('');
      sel.value = city;
      const sc = $('#statCities');
      const sd = $('#statDealers');
      if (sc) sc.textContent = fmt(cities.length);
      if (sd) sd.textContent = fmt(total);
    }

    function render() {
      const cityObj = DATA.cities.find((c) => c.id === city);
      const list = DATA.dealers[city] || [];
      if (count) count.textContent = t('dealers.count', { n: fmt(list.length) });
      grid.innerHTML = list.map((d, i) => {
        const query = encodeURIComponent(d.district.en + ', ' + cityObj.name.en + ', Saudi Arabia');
        const url = 'https://www.google.com/maps/search/?api=1&query=' + query;
        const name = L(d.name);
        return '<li><article class="dealer' + (d.flagship ? ' dealer--flagship' : '') + '" style="--i:' + i + '">' +
          '<span class="chip dealer__type">' + esc(t(d.flagship ? 'dealers.flagship' : 'dealers.authorized')) + '</span>' +
          '<h3 class="dealer__name">' + rich(name) + '</h3>' +
          '<ul class="dealer__info">' +
            '<li>' + svgIcon('i-pin') + '<span>' + esc(L(d.district) + listJoin() + L(cityObj.name)) + '</span></li>' +
            '<li>' + svgIcon('i-phone') + '<a href="tel:' + d.phone + '" dir="ltr">' + d.phone + '</a></li>' +
            '<li>' + svgIcon('i-clock') + '<span><span class="sr-only">' + esc(t('dealers.hours')) + ': </span>' + esc(L(d.hours)) + '</span></li>' +
          '</ul>' +
          '<div class="dealer__actions">' +
            '<a class="btn btn--primary btn--sm" href="' + url + '" target="_blank" rel="noopener noreferrer">' + svgIcon('i-pin') +
              '<span>' + esc(t('dealers.directions')) + '</span><span class="sr-only"> — ' + rich(name) + ' ' + esc(t('dealers.newTab')) + '</span>' + svgIcon('i-external') + '</a>' +
            '<a class="btn btn--soft btn--sm" href="tel:' + d.phone + '">' + svgIcon('i-phone') +
              '<span>' + esc(t('dealers.call')) + '</span><span class="sr-only"> — ' + rich(name) + '</span></a>' +
          '</div>' +
        '</article></li>';
      }).join('');
    }

    sel.addEventListener('change', () => {
      city = sel.value;
      store.set('nanova-city', city);
      render();
    });

    fill();
    render();
    onLang(() => { fill(); render(); });
  }

  /* ==========================================================================
     15. FAQ ACCORDION
     ========================================================================== */
  function initFaq() {
    $$('.acc').forEach((item) => {
      const btn = $('.acc__btn', item);
      if (!btn) return;
      item.classList.toggle('is-open', btn.getAttribute('aria-expanded') === 'true');
      btn.addEventListener('click', () => {
        const next = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(next));
        item.classList.toggle('is-open', next);
      });
    });
  }

  /* ==========================================================================
     16. QUOTE FORM — client-side validation, success modal (nothing is sent)
     ========================================================================== */
  function initForm() {
    const form = $('#quoteForm');
    if (!form) return;
    const summary = $('#formSummary');
    const counter = $('#fMessageCount');
    const successModal = $('#successModal');
    const successText = $('#successText');
    const f = {
      name: $('#fName'),
      company: $('#fCompany'),
      phone: $('#fPhone'),
      email: $('#fEmail'),
      city: $('#fCity'),
      type: $('#fType'),
      product: $('#fProduct'),
      area: $('#fArea'),
      message: $('#fMessage')
    };
    const TYPES = ['villa', 'residential', 'commercial', 'healthcare', 'education', 'industrial', 'other'];
    const MAX_MSG = 1000;
    let errors = {};
    let attempted = false;
    let lastPrefill = '';
    let lastSuccess = null;

    function fillSelects() {
      const keep = { city: f.city.value, type: f.type.value, product: f.product.value };
      f.city.innerHTML = '<option value="">' + esc(t('f.select')) + '</option>' +
        DATA.cities.map((c) => '<option value="' + c.id + '">' + esc(L(c.name)) + '</option>').join('') +
        '<option value="other">' + esc(t('f.otherCity')) + '</option>';
      f.type.innerHTML = '<option value="">' + esc(t('f.select')) + '</option>' +
        TYPES.map((k) => '<option value="' + k + '">' + esc(t('ptype.' + k)) + '</option>').join('');
      f.product.innerHTML = '<option value="">' + esc(t('f.notSure')) + '</option>' +
        DATA.products.map((p) => '<option value="' + p.id + '">' + esc(productOption(p)) + '</option>').join('');
      f.city.value = keep.city;
      f.type.value = keep.type;
      f.product.value = keep.product;
    }

    const rules = {
      name: (v) => (v.trim().length >= 2 ? null : 'err.name'),
      phone: (v) => (/^05\d{8}$/.test(normalizeDigits(v).replace(/[\s-]/g, '')) ? null : 'err.phone'),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'err.email'),
      city: (v) => (v ? null : 'err.city'),
      type: (v) => (v ? null : 'err.type'),
      area: (v) => {
        const s = normalizeDigits(v).replace(/[\s,]/g, '').trim();
        if (!s) return null;
        const n = Number(s);
        return isFinite(n) && n >= 1 && n <= 1000000 ? null : 'err.area';
      },
      message: (v) => (v.length <= MAX_MSG ? null : 'err.message')
    };
    const FIELDS = Object.keys(rules);

    function paint(k) {
      const el = f[k];
      const errEl = $('#' + el.id + 'Err');
      if (errors[k]) {
        el.setAttribute('aria-invalid', 'true');
        if (errEl) errEl.textContent = t(errors[k]);
      } else {
        el.removeAttribute('aria-invalid');
        if (errEl) errEl.textContent = '';
      }
    }
    function validate(k) {
      const err = rules[k](f[k].value);
      if (err) errors[k] = err; else delete errors[k];
      paint(k);
      if (summary && !summary.hidden && !Object.keys(errors).length) summary.hidden = true;
      return !err;
    }
    /* Success message: the visitor's name and the reference are bidi-isolated */
    function renderSuccess() {
      if (!lastSuccess) return;
      successText.innerHTML = esc(t('success.text', { name: '\u0001N\u0001', ref: '\u0001R\u0001' }))
        .replace('\u0001N\u0001', '<bdi>' + esc(lastSuccess.name) + '</bdi>')
        .replace('\u0001R\u0001', '<bdi>' + esc(lastSuccess.ref) + '</bdi>');
    }
    function updateCounter() {
      const n = f.message.value.length;
      counter.textContent = n + '/' + MAX_MSG;
      counter.classList.toggle('is-over', n > MAX_MSG);
    }

    FIELDS.forEach((k) => {
      const el = f[k];
      el.addEventListener('blur', () => { if (attempted || el.value) validate(k); });
      el.addEventListener('input', () => { if (errors[k]) validate(k); });
      if (el.tagName === 'SELECT') el.addEventListener('change', () => { if (attempted || errors[k]) validate(k); });
    });
    f.phone.addEventListener('input', () => {
      /* Accept Arabic-Indic digits and keep only phone characters */
      const cleaned = normalizeDigits(f.phone.value).replace(/[^\d\s+-]/g, '');
      if (cleaned !== f.phone.value) f.phone.value = cleaned;
    });
    f.message.addEventListener('input', updateCounter);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      attempted = true;
      errors = {};
      const results = FIELDS.map(validate);
      if (results.indexOf(false) > -1) {
        summary.hidden = false;
        summary.textContent = t('err.summary');
        const first = FIELDS.find((k) => errors[k]);
        if (first) f[first].focus();
        return;
      }
      summary.hidden = true;
      const ref = 'NV-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
      lastSuccess = { name: f.name.value.trim().split(/\s+/)[0], ref: ref };
      renderSuccess();
      Modal.open(successModal, { opener: form.querySelector('[type="submit"]') });
      form.reset();
      attempted = false;
      errors = {};
      lastPrefill = '';
      FIELDS.forEach(paint);
      updateCounter();
    });

    prefillQuote = function (opts) {
      if (opts.productId && productById(opts.productId)) f.product.value = opts.productId;
      if (opts.area) f.area.value = String(opts.area);
      if (opts.message) {
        const cur = f.message.value.trim();
        f.message.value = (!cur || cur === lastPrefill) ? opts.message : cur + '\n' + opts.message;
        lastPrefill = f.message.value.trim();
        updateCounter();
      }
      scrollToEl($('#contact'));
      f.name.focus({ preventScroll: true });
    };

    fillSelects();
    updateCounter();
    onLang(() => {
      fillSelects();
      FIELDS.forEach(paint);
      if (summary && !summary.hidden) summary.textContent = t('err.summary');
      renderSuccess();
    });
  }

  /* ==========================================================================
     17. FOOTER
     ========================================================================== */
  function initFooter() {
    const list = $('#footerProducts');
    const copy = $('#copyright');
    function render() {
      if (list) {
        list.innerHTML = DATA.products.slice(0, 6).map((p) =>
          '<li><button type="button" data-product="' + p.id + '" aria-haspopup="dialog">' + rich(L(p.name)) + '</button></li>').join('');
      }
      if (copy) copy.innerHTML = rich(t('footer.rights', { year: new Date().getFullYear() }));
    }
    if (list) {
      list.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-product]');
        if (btn) openProduct(btn.getAttribute('data-product'), btn);
      });
    }
    /* Social links are placeholders in this concept project */
    $$('[data-demo-link]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
    render();
    onLang(render);
  }

  /* ==========================================================================
     18. BOOT
     ========================================================================== */
  function init() {
    applyDocumentLanguage();
    const modules = [initHeader, initReveal, initScrollSpy, initHeroCanvas, initCounters, initLotus, initCompare,
      initProducts, initStudio, initCalculator, initProjects, initDealers, initFaq, initForm, initFooter];
    modules.forEach((fn) => {
      try { fn(); } catch (err) {
        if (window.console && console.warn) console.warn('[Nanova] module failed:', fn.name, err);
      }
    });
    root.classList.remove('i18n-pending');
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
