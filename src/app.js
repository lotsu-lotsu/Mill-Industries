/* =========================================================================
   MILL INDÚSTRIAS: páginas, menus, animações, catálogo, representantes e orçamentos
   ========================================================================= */
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const key = (s) => norm(s).replace(/[\s.\-″"'×,()/]/g, '');
  const root = document.documentElement;

  /* --------------------------------------------------------------- IMAGENS */
  const ASSET_MAP = (typeof ASSETS !== 'undefined' && ASSETS) || {};
  const PRODUCT_MAP = (typeof PMAP !== 'undefined' && PMAP) || {};
  function asset(name) {
    if (ASSET_MAP[name]) return ASSET_MAP[name];
    const el = document.querySelector(`img[data-key="${name}"]`);
    if (el && el.getAttribute('src')) return el.getAttribute('src');
    return 'assets/' + name;
  }
  const img = (path) => asset(PRODUCT_MAP[path] || path);
  $$('img[data-asset]').forEach((im) => { im.src = asset(im.dataset.asset); });

  /* -------------------------------------------------------------- MEDIÇÃO */
  let current = null;
  function track(event, params = {}) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event }, params));
      if (typeof window.gtag === 'function') window.gtag('event', event, params);
      if (typeof window.fbq === 'function' && event === 'generate_lead') window.fbq('track', 'Lead', params);
      if (typeof window.fbq === 'function' && event === 'whatsapp_click') window.fbq('trackCustom', 'WhatsAppClick', params);
    } catch (e) { /* sem medição */ }
  }
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'gbraid', 'wbraid'];
  (function captureUtm() {
    try {
      const q = new URLSearchParams(location.search);
      const found = {};
      UTM_KEYS.forEach((k) => { if (q.get(k)) found[k] = q.get(k); });
      if (Object.keys(found).length) {
        found.landing = location.pathname + location.search;
        found.ts = new Date().toISOString();
        localStorage.setItem('mill_utm', JSON.stringify(found));
      } else if (!localStorage.getItem('mill_ref') && document.referrer && !document.referrer.includes(location.host)) {
        localStorage.setItem('mill_ref', new URL(document.referrer).hostname);
      }
    } catch (e) { /* sem armazenamento */ }
  })();
  function getUtm() { try { return JSON.parse(localStorage.getItem('mill_utm') || '{}'); } catch (e) { return {}; } }
  function originLabel() {
    const u = getUtm();
    if (u.utm_source) return [u.utm_source, u.utm_medium, u.utm_campaign].filter(Boolean).join(' / ');
    if (u.gclid || u.gbraid || u.wbraid) return 'google ads';
    if (u.fbclid) return 'meta';
    try { const r = localStorage.getItem('mill_ref'); if (r) return r.replace(/^www\./, ''); } catch (e) { /* noop */ }
    return 'site';
  }

  /* ------------------------------------------------------------- WHATSAPP */
  const waUrl = (num, text) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  const deptNum = (dept) => CONFIG.wa[dept] || CONFIG.wa.geral;
  function wireWa(scope = document) {
    $$('.js-wa', scope).forEach((a) => {
      if (a.dataset.wired) return;
      a.dataset.wired = '1';
      a.href = waUrl(deptNum(a.dataset.dept), a.dataset.msg || 'Olá, estou vindo do site.');
      a.target = '_blank'; a.rel = 'noopener';
    });
  }
  function placementOf(el) { const s = el.closest('[id]'); return (current || 'site') + (s ? ':' + s.id : ''); }
  document.addEventListener('click', (e) => {
    const wa = e.target.closest('a[href^="https://wa.me"]');
    if (wa) track('whatsapp_click', { dept: wa.dataset.dept || wa.dataset.rep || 'geral', placement: placementOf(wa) });
    const t = e.target.closest('[data-track]');
    if (t) track(t.dataset.track, { placement: placementOf(t) });
  });

  /* --------------------------------------------------------- TEXTOS FIXOS */
  const years = new Date().getFullYear() - CONFIG.founded;
  $$('.js-years').forEach((el) => { if (el.dataset.count) el.dataset.count = years; el.textContent = years; });
  $$('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });
  $$('.js-count-maq').forEach((el) => { el.textContent = MACHINES.length; });
  $$('.js-count-ser').forEach((el) => { el.textContent = BLADES.length; });
  $$('.js-cv').forEach((a) => {
    const subject = `Currículo: ${a.dataset.area}`;
    const body = `Olá! Envio em anexo o meu currículo (PDF) para as oportunidades da ${a.dataset.area.toLowerCase()} da Mill.\n\nNome:\nCidade:\nTelefone:`;
    a.href = `mailto:${CONFIG.rhEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    a.addEventListener('click', () => track('cv_click', { area: a.dataset.area }));
  });

  /* ------------------------------------------------- TRAVA DE ROLAGEM */
  function syncLock() {
    const open = $('#mnav.is-open') || $('#drawer.is-open') || $('.modal.is-open') || $('.vmodal.is-open');
    root.style.overflow = open ? 'hidden' : '';
  }

  /* ============================================================== MENU */
  const nav = $('#nav');
  const ALL_LABEL = { serras: 'Todas as lâminas', maquinas: 'Todas as máquinas', posvenda: 'Visão geral', reps: 'Mapa de representantes', sobre: 'Sobre nós' };
  function megaHTML(n) {
    const cols = n.groups.reduce((s, g) => s + (g.cols || 1), 0);
    const groups = n.groups.map((g) => `<div class="mega__group${g.cols === 2 ? ' mega__group--2' : ''}"><p class="mono mega__h">${esc(g.h)}</p><div class="mega__links">${g.items.map(([href, t, d, ic]) => `<a class="mega__link" href="${href}"><span class="mega__ic">${icon(ic)}</span><span><b>${esc(t)}</b>${d ? `<small>${esc(d)}</small>` : ''}</span></a>`).join('')}</div></div>`).join('');
    let promo = '';
    if (n.k === 'reps') promo = `<a class="mega__promo mega__promo--text" href="#/representantes">${icon('pin', 'ic big')}<span><small class="mono">Revendas e representantes</small><b>Encontre um representante Mill perto de você${icon('arrow')}</b></span></a>`;
    else if (n.k === 'sobre') promo = `<a class="mega__promo" href="#/sobre/video"><img src="${asset('video.webp')}" alt="" loading="lazy"><small class="mono">Vídeo institucional</small><b>Conheça a fábrica${icon('play')}</b></a>`;
    else if (n.promo) promo = `<a class="mega__promo${n.promo.photo ? '' : ' mega__promo--plate'}" href="${n.promo.href}"><img src="${asset(n.promo.img)}" alt="" loading="lazy"><small class="mono">${esc(n.promo.s)}</small><b>${esc(n.promo.t)}${icon('arrow')}</b></a>`;
    return `<div class="mega__in" style="--cols:${cols}">${groups}${promo}</div>`;
  }
  $('#navList').innerHTML = NAV.map((n) => (n.groups
    ? `<li class="nav__item" data-menu="${n.k}"><a class="nav__link" href="${n.href}" data-nav="${n.k}" aria-haspopup="true" aria-expanded="false">${esc(n.label)}${icon('chev')}</a><div class="mega">${megaHTML(n)}</div></li>`
    : `<li class="nav__item"><a class="nav__link" href="${n.href}" data-nav="${n.k}">${esc(n.label)}</a></li>`)).join('');
  $('#mnavLinks').innerHTML = NAV.map((n, i) => {
    const num = String(i + 1).padStart(2, '0');
    if (!n.groups) return `<div class="mgroup"><div class="mgroup__row"><a class="mgroup__link" href="${n.href}"><span>${num}</span>${esc(n.label)}</a></div></div>`;
    const items = n.groups.flatMap((g) => g.items).filter(([h]) => h !== n.href);
    return `<div class="mgroup"><div class="mgroup__row"><a class="mgroup__link" href="${n.href}"><span>${num}</span>${esc(n.label)}</a><button class="mgroup__tog" aria-expanded="false" aria-controls="mg${i}" aria-label="Ver opções de ${esc(n.label)}">${icon('plus')}</button></div><div class="mgroup__sub" id="mg${i}"><div><a href="${n.href}">${esc(ALL_LABEL[n.k] || n.label)}</a>${items.map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join('')}</div></div></div>`;
  }).join('');

  let openItem = null, tOpen = 0, tClose = 0;
  function openMega(li) {
    if (openItem && openItem !== li) closeMega(openItem);
    openItem = li; li.classList.add('is-open');
    $('.nav__link', li).setAttribute('aria-expanded', 'true');
    nav.classList.add('has-mega'); nav.classList.remove('is-hidden');
  }
  function closeMega(li) {
    li = li || openItem; if (!li) return;
    li.classList.remove('is-open');
    $('.nav__link', li).setAttribute('aria-expanded', 'false');
    if (openItem === li) openItem = null;
    if (!openItem) nav.classList.remove('has-mega');
  }
  $$('.nav__item[data-menu]').forEach((li) => {
    li.addEventListener('mouseenter', () => { if (!fine) return; clearTimeout(tClose); clearTimeout(tOpen); tOpen = setTimeout(() => openMega(li), openItem ? 0 : 90); });
    li.addEventListener('mouseleave', () => { if (!fine) return; clearTimeout(tOpen); tClose = setTimeout(() => closeMega(li), 200); });
    li.addEventListener('focusin', () => openMega(li));
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) closeMega(li); });
    $('.nav__link', li).addEventListener('click', (e) => {
      if (!fine && !li.classList.contains('is-open')) { e.preventDefault(); e.stopPropagation(); openMega(li); }
    });
  });
  document.addEventListener('click', (e) => { if (openItem && (!e.target.closest('.nav__item') || e.target.closest('.mega a'))) closeMega(); });

  const mnav = $('#mnav'), burger = $('#burger');
  function setMenu(open) {
    mnav.classList.toggle('is-open', open);
    mnav.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) nav.classList.remove('is-hidden');
    syncLock();
  }
  burger.addEventListener('click', () => setMenu(!mnav.classList.contains('is-open')));
  mnav.addEventListener('click', (e) => {
    const t = e.target.closest('.mgroup__tog');
    if (t) { const g = t.closest('.mgroup'); const open = !g.classList.contains('is-open'); g.classList.toggle('is-open', open); t.setAttribute('aria-expanded', String(open)); return; }
    if (e.target.closest('a, [data-lead]')) setMenu(false);
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 1180 && mnav.classList.contains('is-open')) setMenu(false); });

  /* ======================================================= TEXTOS EM PALAVRAS */
  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'sw';
            const inner = document.createElement('span'); inner.style.setProperty('--i', i++); inner.textContent = p;
            w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
  }
  $$('[data-split]').forEach(splitWords);

  /* ============================================================ REVELAR */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 }) : null;
  function observe(el) { if (io && !reduce) io.observe(el); else el.classList.add('is-in'); }
  $$('[data-reveal], [data-split]').forEach((el) => { if (!el.closest('.hs')) observe(el); });

  function animateCount(el) {
    const target = +el.dataset.count; const dot = el.dataset.fmt === 'dot';
    const fmt = (v) => (dot ? Math.round(v).toLocaleString('pt-BR') : String(Math.round(v)));
    if (reduce) { el.textContent = fmt(target); return; }
    const t0 = performance.now(), dur = 1700;
    const step = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      el.textContent = fmt(target * (1 - Math.pow(2, -10 * p)));
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    };
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduce) {
    const cio = new IntersectionObserver((entries) => { entries.forEach((en) => { if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); } }); }, { threshold: .6 });
    $$('[data-count]').forEach((el) => { el.textContent = '0'; cio.observe(el); });
  }

  /* ======================================================= EFEITOS DE PONTEIRO */
  $$('.dcard').forEach((c) => c.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }));
  if (fine && !reduce) {
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .16, y = (e.clientY - r.top - r.height / 2) * .28;
        b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* =============================================================== HERO */
  const hero = $('.hero');
  const heroSlides = $$('.hs', hero), heroTabs = $$('[data-slide]', hero);
  let heroIdx = 0;
  function heroGo(i, user) {
    i = (i + heroSlides.length) % heroSlides.length;
    if (i === heroIdx) return;
    const prev = heroSlides[heroIdx], next = heroSlides[i];
    prev.classList.remove('is-active'); prev.setAttribute('aria-hidden', 'true');
    $$('a, button', prev).forEach((x) => x.setAttribute('tabindex', '-1'));
    next.classList.add('is-active'); next.removeAttribute('aria-hidden');
    $$('a, button', next).forEach((x) => x.removeAttribute('tabindex'));
    heroIdx = i;
    heroTabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.setAttribute('tabindex', k === i ? '0' : '-1');
      t.classList.toggle('is-done', k < i);
    });
    if (user) track('hero_slide', { slide: i + 1 });
  }
  heroTabs.forEach((t, k) => {
    t.setAttribute('tabindex', k === 0 ? '0' : '-1');
    t.addEventListener('click', () => heroGo(k, true));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); heroGo(heroIdx + (e.key === 'ArrowRight' ? 1 : -1), true); heroTabs[heroIdx].focus();
    });
    if (!reduce) $('.hero__bar i', t).addEventListener('animationend', () => { if (k === heroIdx) heroGo(heroIdx + 1); });
  });
  $$('[data-hero]', hero).forEach((b) => b.addEventListener('click', () => heroGo(heroIdx + (b.dataset.hero === 'next' ? 1 : -1), true)));
  if (fine) {
    $('.hero__stage', hero).addEventListener('mouseenter', () => hero.classList.add('is-paused'));
    $('.hero__stage', hero).addEventListener('mouseleave', () => hero.classList.remove('is-paused'));
  }
  hero.addEventListener('focusin', () => hero.classList.add('is-paused'));
  hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) hero.classList.remove('is-paused'); });
  (function swipe() {
    let x0 = null, y0 = 0;
    const st = $('.hero__stage', hero);
    st.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; x0 = e.clientX; y0 = e.clientY; });
    st.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) heroGo(heroIdx + (dx < 0 ? 1 : -1), true);
    });
    st.addEventListener('pointercancel', () => { x0 = null; });
  })();

  /* ====================================================== ZOOM DA FÁBRICA */
  const rz = $('#fabrica');
  function updateRZ(vh, vw) {
    if (!rz || reduce || current !== 'home') return;
    const r = rz.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const total = r.height - vh;
    const p = clamp(-r.top / total, 0, 1);
    const e = ease(clamp(p / .6, 0, 1));
    const pillW = clamp(vw * .2, 140, 380), pillH = pillW * .52;
    const s = rz.style;
    s.setProperty('--ct', ((vh - pillH) / 2 * (1 - e)).toFixed(1) + 'px');
    s.setProperty('--cl', ((vw - pillW) / 2 * (1 - e)).toFixed(1) + 'px');
    s.setProperty('--cr', (pillH / 2 * (1 - e) + 0.01).toFixed(1) + 'px');
    s.setProperty('--sc', (1.32 - .32 * e).toFixed(4));
    s.setProperty('--gap', (pillW + vw * .03).toFixed(0) + 'px');
    s.setProperty('--wx', (e * vw * .42).toFixed(1) + 'px');
    s.setProperty('--wy', (e * vh * .42).toFixed(1) + 'px');
    s.setProperty('--gapv', (pillH + 26).toFixed(0) + 'px');
    s.setProperty('--wo', (1 - clamp(e * 1.5, 0, 1)).toFixed(3));
    s.setProperty('--sh', clamp((p - .42) / .28, 0, 1).toFixed(3));
    const co = clamp((p - .58) / .24, 0, 1);
    s.setProperty('--co', co.toFixed(3));
    rz.classList.toggle('is-cap', co > .35);
  }
  if (reduce && rz) rz.classList.add('is-cap');

  /* ================================================================ VÍDEO */
  const vmodal = $('#vmodal'), vframe = $('#vframe');
  let vTrigger = null;
  function openVideo(id) {
    vTrigger = document.activeElement;
    vframe.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Vídeo institucional Mill Indústrias" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    $('#vlink').href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
    vmodal.classList.add('is-open'); vmodal.setAttribute('aria-hidden', 'false');
    syncLock(); setMenu(false); closeMega();
    setTimeout(() => $('[data-vclose]', vmodal).focus({ preventScroll: true }), 60);
    track('video_play', { video_id: id, page: current });
  }
  function closeVideo() {
    if (!vmodal.classList.contains('is-open')) return;
    vmodal.classList.remove('is-open'); vmodal.setAttribute('aria-hidden', 'true');
    syncLock();
    setTimeout(() => { if (!vmodal.classList.contains('is-open')) vframe.innerHTML = ''; }, 420);
    if (vTrigger && document.contains(vTrigger)) vTrigger.focus({ preventScroll: true });
  }
  document.addEventListener('click', (e) => {
    const v = e.target.closest('[data-video]');
    if (v) { e.preventDefault(); openVideo(v.dataset.video); return; }
    if (e.target.closest('[data-vclose]') || e.target === vmodal) closeVideo();
  });

  /* ============================================================ RAZÕES */
  const rItems = $$('#reasons .ritem');
  function updateReasons(vh) {
    if (current !== 'home' || !rItems.length) return;
    const mark = vh * .64;
    rItems.forEach((el) => el.classList.toggle('is-on', el.getBoundingClientRect().top < mark));
  }
  if (reduce) rItems.forEach((el) => el.classList.add('is-on'));

  /* ========================================================== CATÁLOGO */
  const mById = Object.fromEntries(MACHINES.map((m) => [m.id, m]));
  const bById = Object.fromEntries(BLADES.map((b) => [b.id, b]));
  const pById = Object.fromEntries(PARTS.map((p) => [p.id, p]));
  const CATS = {
    serras: { k: 'b', list: BLADES, cats: BLADE_SEGS, catOf: (b) => b.seg, nouns: ['lâmina', 'lâminas'] },
    maquinas: { k: 'm', list: MACHINES, cats: MACHINE_CATS, catOf: (m) => m.cat, nouns: ['máquina', 'máquinas'] },
    pecas: { k: 'p', list: PARTS, cats: null, catOf: () => 'pecas', nouns: ['peça', 'peças'] }
  };
  const catState = { serras: { f: 'all', q: '' }, maquinas: { f: 'all', q: '' }, pecas: { f: 'all', q: '' } };
  const searchKey = (it, name) => key([it.name, it.size, (it.lines || []).join(' '), it.desc, it.models, CATS[name].cats ? CATS[name].cats[CATS[name].catOf(it)] : '', (it.teeth || []).map((t) => t[0]).join(' ')].join(' '));
  function catItems(name) {
    const C = CATS[name], S = catState[name], q = key(S.q);
    return C.list.filter((it) => (S.f === 'all' || C.catOf(it) === S.f) && (!q || searchKey(it, name).includes(q)));
  }
  const plateOf = (name, it) => (name === 'serras' || it.bg === 'p' ? 'p' : 'w');
  function cardHTML(name, it, i) {
    const C = CATS[name], ref = `${C.k}:${it.id}`;
    const tag = name === 'maquinas' ? MACHINE_CATS[it.cat] : name === 'serras' ? BLADE_SEGS[it.seg] : 'Peça original';
    const lines = name === 'maquinas' ? it.lines : name === 'serras' ? it.teeth.map((t) => t[0]) : (it.models ? it.models.split(', ') : []);
    const keyRows = name === 'maquinas' ? it.key : name === 'serras' ? [['Medida', it.size], ['Aplicação', BLADE_SEGS[it.seg]]] : null;
    return `<article class="pcard" style="--i:${Math.min(i, 16)}" data-open-product="${ref}" tabindex="0" aria-label="${esc(it.name)}${it.size ? ' ' + esc(it.size) : ''}">
      <div class="pcard__plate pcard__plate--${plateOf(name, it)}">
        <img src="${img(it.img)}" alt="${esc(it.name)}${it.size ? ' ' + esc(it.size) : ''}, Mill" width="786" height="590" loading="lazy" decoding="async">
        <span class="pcard__tag">${esc(tag)}</span>${it.star ? '<span class="pcard__star">Destaque</span>' : ''}
      </div>
      <div class="pcard__body">
        <h3 class="pcard__name">${esc(it.name)}</h3>
        ${it.size ? `<p class="pcard__size">${esc(it.size)}</p>` : ''}
        ${lines && lines.length ? `<div class="pcard__lines">${lines.slice(0, 4).map((l) => `<span>${esc(l)}</span>`).join('')}</div>` : ''}
        <p class="pcard__desc">${esc(it.desc)}</p>
        ${keyRows ? `<dl class="pcard__key">${keyRows.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>` : ''}
      </div>
      <div class="pcard__actions">
        <button class="pcard__btn pcard__btn--more" data-open-product="${ref}">Detalhes</button>
        <button class="pcard__btn pcard__btn--quote" data-quote="${ref}">${name === 'pecas' ? 'Pedir peça' : 'Orçar'}</button>
      </div>
    </article>`;
  }
  function renderFilters(name) {
    const el = $(`[data-filters="${name}"]`); if (!el) return;
    const C = CATS[name], S = catState[name];
    el.innerHTML = [['all', 'Todas'], ...Object.entries(C.cats)].map(([k, l]) => {
      const n = k === 'all' ? C.list.length : C.list.filter((it) => C.catOf(it) === k).length;
      return `<button class="fchip" data-filter="${k}" aria-pressed="${S.f === k}">${esc(l)}<span>${n}</span></button>`;
    }).join('');
  }
  function renderGrid(name) {
    const grid = $(`[data-grid="${name}"]`); if (!grid) return;
    const items = catItems(name), total = CATS[name].list.length, many = CATS[name].nouns[1];
    grid.innerHTML = items.map((it, i) => cardHTML(name, it, i)).join('');
    const count = $(`[data-count-for="${name}"]`);
    if (count) count.textContent = items.length === total ? `${total} ${many}` : `${items.length} de ${total} ${many}`;
    const empty = $(`[data-empty="${name}"]`);
    if (empty) empty.hidden = items.length > 0;
  }
  function setFilter(name, f, opts = {}) {
    const S = catState[name];
    S.f = CATS[name].cats && CATS[name].cats[f] ? f : 'all';
    if (opts.clearSearch !== false) { S.q = ''; const s = $(`[data-search="${name}"]`); if (s) s.value = ''; }
    renderFilters(name); renderGrid(name);
  }
  const BASE = { serras: '#/mill-serras', maquinas: '#/mill-maquinas' };
  $$('[data-filters]').forEach((el) => el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]'); if (!b) return;
    const name = el.dataset.filters;
    setFilter(name, b.dataset.filter, { clearSearch: false });
    replaceHash(BASE[name] + (b.dataset.filter === 'all' ? '' : '/' + b.dataset.filter));
    track('catalog_filter', { catalog: name, filter: b.dataset.filter });
  }));
  $$('[data-search]').forEach((inp) => {
    let t;
    inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { catState[inp.dataset.search].q = inp.value; renderGrid(inp.dataset.search); }, 120); });
  });
  ['serras', 'maquinas'].forEach((n) => { renderFilters(n); renderGrid(n); });
  renderGrid('pecas');

  /* tecnologia das lâminas */
  const TECH_SVG = [
    '<path d="M2 24h60M2 24l6-10 6 10 6-10 6 10 6-10 6 10 6-10 6 10 6-10 6 10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 14l-2-3M20 14l2-3M32 14l-2-3M44 14l2-3M56 14l-2-3" stroke="#e6b22c" stroke-width="1.6"/>',
    '<path d="M2 20h60M2 20l6-10 6 10 6-10 6 10 6-10 6 10 6-10 6 10 6-10 6 10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 27h12M8 25v4M20 25v4M32 27h12M32 25v4M44 25v4" stroke="#e6b22c" stroke-width="1.4"/>',
    '<path d="M2 22h60M2 22l6-10 6 10 6-10 6 10 6-10 6 10 6-10 6 10 6-10 6 10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 12l1.6 2.6M20 12l1.6 2.6M32 12l1.6 2.6M44 12l1.6 2.6M56 12l1.6 2.6" stroke="#e6b22c" stroke-width="3" stroke-linecap="round"/>',
    '<rect x="2" y="9" width="60" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 13h60M2 17h60" stroke="currentColor" stroke-width=".8" opacity=".5"/><path d="M2 21h60" stroke="#e6b22c" stroke-width="1.6"/>',
    '<rect x="2" y="11" width="60" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M28 8l8 15M36 8l-8 15" stroke="#e6b22c" stroke-width="2.2" stroke-linecap="round"/>'
  ];
  $('#techList').innerHTML = BLADE_TECH.map(([t, d], i) => `<li data-reveal style="--d:${i * .06}s"><svg viewBox="0 0 64 30" aria-hidden="true">${TECH_SVG[i]}</svg><b>${esc(t)}</b><p>${esc(d)}</p></li>`).join('');
  $$('#techList [data-reveal]').forEach(observe);

  /* seletor técnico */
  const fSeg = $('#fSeg'), fUse = $('#fUse'), fRes = $('#fRes');
  const fState = { seg: 'alimentos', use: 0 };
  function renderFinder(user) {
    fSeg.innerHTML = Object.entries(BLADE_SEGS).map(([k, l]) => `<button class="fopt fopt--big" role="radio" aria-checked="${fState.seg === k}" data-seg="${k}">${esc(l)}</button>`).join('');
    fUse.innerHTML = FINDER[fState.seg].map((u, i) => `<button class="fopt" role="radio" aria-checked="${fState.use === i}" data-use="${i}">${esc(u[0])}</button>`).join('');
    const u = FINDER[fState.seg][fState.use];
    const b = bById[u[1]];
    const tooth = b.teeth.find((t) => t[0] === u[2]) || b.teeth[0];
    const alt = u[3] ? bById[u[3]] : null;
    fRes.innerHTML = `<p class="mono fres__k">Recomendação Mill</p>
      <h3 class="fres__name">${esc(b.name)}</h3>
      <p class="fres__size">${esc(b.size)} · <span style="color:var(--y)">${esc(u[2])}</span></p>
      <img class="fres__img" src="${img(b.img)}" alt="${esc(b.name)} ${esc(b.size)}" loading="lazy">
      <p class="fres__why">${esc(tooth[1])} ${esc(b.desc)}</p>
      <div class="fres__actions">
        <button class="btn btn--primary" data-lead="serras" data-product="${esc(b.name + ' ' + b.size)}"><span>Orçar esta lâmina</span>${icon('arrow')}</button>
        <button class="btn btn--ghost" data-open-product="b:${b.id}">Ver ficha</button>
      </div>
      ${alt ? `<p class="fres__alt">Também indicada: <button data-open-product="b:${alt.id}">${esc(alt.name)} ${esc(alt.size)}</button></p>` : ''}`;
    if (user) track('finder_result', { segment: fState.seg, blade: b.id, tooth: u[2] });
  }
  fSeg.addEventListener('click', (e) => { const b = e.target.closest('[data-seg]'); if (!b) return; fState.seg = b.dataset.seg; fState.use = 0; renderFinder(true); });
  fUse.addEventListener('click', (e) => { const b = e.target.closest('[data-use]'); if (!b) return; fState.use = +b.dataset.use; renderFinder(true); });
  renderFinder(false);

  /* planejamento de ponta a ponta */
  const stepsEl = $('#steps');
  const chip = (id) => { const m = mById[id]; return `<button class="mchip" data-open-product="m:${id}"><img src="${img(m.img)}" alt="" loading="lazy">${esc(m.name)}</button>`; };
  STEPS.forEach(([t, p, ids], i) => {
    const li = document.createElement('li');
    li.className = 'step';
    li.innerHTML = `<span class="step__n">${String(i + 1).padStart(2, '0')}</span><h3 class="step__t">${esc(t)}</h3><p class="step__p">${esc(p)}</p><div class="step__m">${ids.map(chip).join('')}</div>`;
    stepsEl.appendChild(li);
  });
  const lastStep = document.createElement('li');
  lastStep.className = 'step';
  lastStep.innerHTML = `<span class="step__n">${icon('check')}</span><h3 class="step__t">Linhas completas</h3><p class="step__p">Serrarias projetadas conforme a necessidade de cada cliente, de pequenas madeireiras a indústrias de grande porte.</p><div class="step__m">${chip('serraria-para-pinus')}${chip('serraria-para-eucalipto')}</div>`;
  stepsEl.appendChild(lastStep);
  const stepEls = $$('.step', stepsEl);
  const lineNum = $('.js-line-step'), lineName = $('.js-line-name');
  function updateSteps(vh) {
    if (current !== 'maquinas') return;
    const r = stepsEl.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const mark = vh * .55;
    stepsEl.style.setProperty('--lp', clamp((mark - r.top) / (r.height - 40), 0, 1).toFixed(4));
    let active = 0;
    stepEls.forEach((el, i) => { const on = el.getBoundingClientRect().top < mark; el.classList.toggle('is-on', on); if (on) active = i; });
    const idx = Math.min(active, STEPS.length - 1);
    lineNum.textContent = active >= STEPS.length ? '✓' : String(idx + 1).padStart(2, '0');
    lineName.textContent = active >= STEPS.length ? 'Linhas completas' : STEPS[idx][0];
  }

  /* ========================================================= PÓS-VENDA */
  $('#partsList').innerHTML = PARTS.map((p) => `<li><button data-open-product="p:${p.id}">${esc(p.name)}</button></li>`).join('');
  $('#services').innerHTML = SERVICES.map(([t, d], i) => `<article class="svc" data-reveal style="--d:${i * .05}s"><p class="mono">${String(i + 1).padStart(2, '0')} · Serviço</p><h4>${esc(t)}</h4><p>${esc(d)}</p></article>`).join('');
  $$('#services [data-reveal]').forEach(observe);

  /* ==================================================== PROVA SOCIAL */
  const reviewHTML = ([q, n]) => `<figure class="review"><span class="stars" aria-label="5 estrelas">${icon('star', '').repeat(5)}</span><q>${esc(q)}</q><figcaption class="review__by"><span class="review__av">${esc(n.split(' ').map((x) => x[0]).slice(0, 2).join(''))}</span><span><b>${esc(n)}</b><small>Avaliação no Google</small></span></figcaption></figure>`;
  $('#reviewsTrack').innerHTML = REVIEWS.map(reviewHTML).join('') + REVIEWS.map(reviewHTML).join('').replace(/<figure class="review"/g, '<figure class="review" aria-hidden="true"');
  const fairsHTML = FAIRS.map((f) => `<span class="fair">${esc(f)}</span>`).join('');
  $('#fairsTrack').innerHTML = fairsHTML + fairsHTML.replace(/<span class="fair"/g, '<span class="fair" aria-hidden="true"');

  /* ==================================================== REPRESENTANTES */
  const LINE_SLUG = { alimentos: 'ali', marcenaria: 'mar', madeira: 'mad', maquinas: 'maq' };
  const LINE_NAMES = { ali: 'Serras para alimentos', mar: 'Serras para marcenaria', mad: 'Serras para madeira', maq: 'Máquinas e equipamentos' };
  const UF_NAMES = Object.fromEntries(BR_MAP.states.map((s) => [s.id, s.name]));
  const repState = { uf: 'SC', line: 'all' };
  const repsFor = (uf, line) => REPS_BR.filter((r) => r.uf.includes(uf) && (line === 'all' || r.l.includes(line)));
  const svg = $('#brMap'), NS = 'http://www.w3.org/2000/svg';
  let mapReady = false;
  const labels = {};
  svg.setAttribute('viewBox', BR_MAP.viewBox);
  BR_MAP.states.forEach((s) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', s.d); p.setAttribute('data-uf', s.id); p.setAttribute('tabindex', '0'); p.setAttribute('role', 'button');
    svg.appendChild(p);
  });
  function placeLabels() {
    if (mapReady) return;
    let placed = 0;
    $$('path', svg).forEach((p) => {
      let bb; try { bb = p.getBBox(); } catch (e) { return; }
      if (!bb.width) return;
      placed++;
      if (bb.width * bb.height < 1100) return;
      const uf = p.dataset.uf;
      const off = { GO: [0, 10], MG: [8, 6], BA: [10, 0], PA: [0, 12], MS: [0, 4], SP: [10, 4], RS: [6, 0], PR: [4, 2], MT: [0, 6], AM: [0, 8], PI: [-4, 6], CE: [0, 2], MA: [-4, 6] }[uf] || [0, 0];
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', (bb.x + bb.width / 2 + off[0]).toFixed(1)); t.setAttribute('y', (bb.y + bb.height / 2 + off[1]).toFixed(1));
      t.textContent = uf; svg.appendChild(t); labels[uf] = t;
    });
    if (!placed) return;
    mapReady = true; paintMap();
  }
  function paintMap() {
    $$('path', svg).forEach((p) => {
      const n = repsFor(p.dataset.uf, repState.line).length;
      p.classList.toggle('is-on', n > 0);
      p.classList.toggle('is-sel', p.dataset.uf === repState.uf);
      p.setAttribute('aria-label', `${UF_NAMES[p.dataset.uf]}: ${n ? n + (n > 1 ? ' contatos' : ' contato') : 'atendimento direto da fábrica'}`);
    });
    Object.entries(labels).forEach(([uf, t]) => t.classList.toggle('is-sel', uf === repState.uf));
  }
  const ufSel = $('#ufSelect');
  ufSel.innerHTML = BR_MAP.states.slice().sort((a, b) => a.name.localeCompare(b.name, 'pt')).map((s) => `<option value="${s.id}">${esc(s.name)} (${s.id})</option>`).join('');
  $('#repLines').innerHTML = [['all', 'Todas as linhas'], ...Object.entries(LINE_NAMES)].map(([k, l]) => `<button class="lchip" data-line="${k}" aria-pressed="${k === 'all'}">${esc(l)}</button>`).join('');
  function brWa(phones) {
    for (const t of phones) { const d = t.replace(/\D/g, ''); if (d.length === 11 && d[2] === '9') return '55' + d; }
    return null;
  }
  function repCard(r, i, opts = {}) {
    const wa = opts.wa !== undefined ? opts.wa : brWa(r.t || []);
    const first = (r.c || r.n).split(' ')[0].replace(/^Ing\.$/, '');
    const msg = `Olá${first && !opts.direct ? ', ' + first : ''}! Vim pelo site da Mill e gostaria de falar sobre ${r.l.map((l) => LINES[l].toLowerCase()).join(', ')}.`;
    const tel = (r.t || [])[0] ? (r.t[0].trim().startsWith('+') ? '+' + r.t[0].replace(/\D/g, '') : '+55' + r.t[0].replace(/\D/g, '')) : '';
    return `<article class="rcard" style="--i:${i}">
      <div class="rcard__top"><div><p class="rcard__n">${esc(r.n)}</p>${r.c ? `<p class="rcard__c">${esc(r.c)}</p>` : ''}</div>${r.role ? `<span class="rcard__role">${esc(r.role)}</span>` : (opts.country ? `<span class="rcard__role">${esc(opts.country)}</span>` : '')}</div>
      <div class="rcard__l">${r.l.map((l) => `<span>${esc(LINE_NAMES[l])}</span>`).join('')}</div>
      ${r.area ? `<p class="rcard__area">${esc(r.area)}</p>` : ''}
      <div class="rcard__a">
        ${wa ? `<a class="is-wa" href="${waUrl(wa, msg)}" target="_blank" rel="noopener" data-rep="${esc(r.n)}">${icon('wa')}WhatsApp</a>` : ''}
        ${tel ? `<a href="tel:${tel}" data-track="rep_call">${icon('phone')}${esc(r.t[0])}</a>` : ''}
        ${r.e ? `<a href="mailto:${esc(r.e)}?subject=${encodeURIComponent('Contato pelo site da Mill')}" data-track="rep_email">${icon('mail')}${esc(r.e)}</a>` : ''}
      </div>
    </article>`;
  }
  function renderReps() {
    const reps = repsFor(repState.uf, repState.line);
    $('#repList').innerHTML = `<div class="reps__head"><b>${esc(UF_NAMES[repState.uf])}</b><span class="mono">${reps.length ? reps.length + (reps.length > 1 ? ' contatos' : ' contato') : 'Atendimento direto'}</span></div>`
      + (reps.length ? reps.map((r, i) => repCard(r, i)).join('') : `<p class="reps__note">Ainda não há representante ${repState.line === 'all' ? 'neste estado' : 'desta linha neste estado'}. Fale direto com a fábrica:</p>`)
      + repCard(REP_DIRECT, reps.length, { wa: CONFIG.wa.geral, direct: true });
    ufSel.value = repState.uf;
    if (mapReady) paintMap();
  }
  function setLine(line) {
    repState.line = LINE_NAMES[line] ? line : 'all';
    $$('#repLines [data-line]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.line === repState.line)));
    renderReps();
  }
  function selectUF(uf, scroll) {
    repState.uf = uf; renderReps();
    track('rep_state_select', { state: uf, line: repState.line });
    if (scroll && window.innerWidth < 1025) $('#repList').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  svg.addEventListener('click', (e) => { const p = e.target.closest('path'); if (p) selectUF(p.dataset.uf, true); });
  svg.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('path')) { e.preventDefault(); selectUF(e.target.dataset.uf, true); } });
  ufSel.addEventListener('change', () => selectUF(ufSel.value));
  $('#repLines').addEventListener('click', (e) => {
    const b = e.target.closest('[data-line]'); if (!b) return;
    setLine(b.dataset.line);
    const slug = Object.keys(LINE_SLUG).find((s) => LINE_SLUG[s] === b.dataset.line);
    replaceHash('#/representantes' + (slug ? '/' + slug : ''));
  });
  renderReps();
  const intlChips = $('#intlChips'), intlCard = $('#intlCard');
  intlChips.innerHTML = [...REPS_INT.map((r) => r.country), 'Outros países'].map((c) => `<button class="lchip" data-country="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('');
  intlChips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-country]'); if (!b) return;
    $$('[data-country]', intlChips).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const r = REPS_INT.find((x) => x.country === b.dataset.country);
    intlCard.innerHTML = r ? repCard(r, 0, { wa: r.wa || null, country: r.country })
      : repCard(Object.assign({}, REP_DIRECT, { role: 'Exportação', t: ['+55 49 3221-6200'] }), 0, { wa: CONFIG.wa.geral, direct: true });
    track('rep_country_select', { country: b.dataset.country });
  });

  /* ============================================================ GAVETA */
  const drawer = $('#drawer'), scrim = $('#scrim'), drBody = $('#drBody'), drFoot = $('#drFoot'), drCrumb = $('#drCrumb');
  let drState = null, lastFocus = null, drPushed = false, drReturn = '';
  function getItem(ref) {
    const [k, id] = ref.split(':');
    const it = k === 'm' ? mById[id] : k === 'b' ? bById[id] : pById[id];
    return it ? { k, it } : null;
  }
  const kindOf = (id) => (mById[id] ? 'm' : bById[id] ? 'b' : pById[id] ? 'p' : null);
  const viewOfKind = { m: 'maquinas', b: 'serras', p: 'posvenda' };
  function navList(k) {
    const name = k === 'm' ? 'maquinas' : k === 'b' ? 'serras' : 'pecas';
    const c = catItems(name);
    return c.length ? c : CATS[name].list;
  }
  function specTable(rows) {
    if (!rows || !rows.length) return '';
    const [head, ...body] = rows;
    return `<div class="spec-wrap"><table class="spec"><thead><tr>${head.map((h, i) => `<th scope="col">${i === 0 ? (esc(h) || 'Especificação') : esc(h)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  const ytHTML = (id) => `<div class="yt" data-yt="${esc(id)}" role="button" tabindex="0" aria-label="Assistir ao vídeo do equipamento em operação"><img src="https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg" alt="" loading="lazy"><span class="yt__play"><span>${icon('play')}</span></span></div>`;
  function fillDrawer(k, it) {
    const isM = k === 'm', isB = k === 'b';
    drCrumb.textContent = isM ? `Mill Máquinas / ${MACHINE_CATS[it.cat]}` : isB ? `Mill Serras / ${BLADE_SEGS[it.seg]}` : 'Pós-venda / Peças de reposição';
    const plate = isB || it.bg === 'p' ? 'p' : 'w';
    let html = `<div class="dr__plate dr__plate--${plate}"><img src="${img(it.img)}" alt="${esc(it.name)}, Mill"></div>
      <div class="dr__head"><p class="mono dr__cat">${esc(isM ? MACHINE_CATS[it.cat] : isB ? 'Serra fita · ' + BLADE_SEGS[it.seg] : 'Peça original Mill')}</p>
      <h2 class="dr__name" id="drTitle">${esc(it.name)}</h2>${it.size ? `<p class="dr__size">${esc(it.size)}</p>` : ''}
      <p class="dr__desc">${esc(it.desc)}</p>
      ${isM && it.lines ? `<div class="dr__lines">${it.lines.map((l) => `<span>${esc(l)}</span>`).join('')}</div>` : ''}</div>`;
    if (isM) {
      html += `<section class="dr__sec"><p class="mono dr__h">Destaques</p><ul class="dr__feats">${it.feats.map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul></section>`;
      if (it.opts && it.opts.length) html += `<section class="dr__sec"><p class="mono dr__h">Opcionais</p><div class="dr__opts">${it.opts.map((o) => `<span>${esc(o)}</span>`).join('')}</div></section>`;
      if (it.specs && it.specs.length) html += `<section class="dr__sec"><p class="mono dr__h">Ficha técnica</p>${specTable(it.specs)}<p class="dr__note">Medidas e configurações podem variar conforme o projeto. Peça a ficha completa ao especialista.</p></section>`;
      if (it.video) html += `<section class="dr__sec"><p class="mono dr__h">Em operação</p>${ytHTML(it.video)}</section>`;
    } else if (isB) {
      html += `<section class="dr__sec"><p class="mono dr__h">Dentes e aplicações</p><ul class="dr__teeth">${it.teeth.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ul></section>`;
      const mat = it.id === 'laminas-inox' ? 'Aço inox AISI 420' : 'Aço alto carbono temperado';
      html += `<section class="dr__sec"><p class="mono dr__h">Tecnologia Mill</p><ul class="dr__feats">${[mat, ...BLADE_TECH.map((t) => t[0] + ': ' + t[1].charAt(0).toLowerCase() + t[1].slice(1))].map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul></section>`;
    } else {
      html += `<section class="dr__sec"><p class="mono dr__h">Benefícios</p><ul class="dr__feats">${it.perks.map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul></section>`;
      if (it.models) html += `<section class="dr__sec"><p class="mono dr__h">Compatibilidade</p><div class="dr__opts"><span>${esc(it.models)}</span></div></section>`;
    }
    drBody.innerHTML = html; drBody.scrollTop = 0;
    const dept = isM ? 'maquinas' : isB ? 'serras' : 'posvenda';
    const msg = `Olá! Vim pelo site da Mill e tenho interesse em: ${it.name}${it.size ? ' ' + it.size : ''}. Pode me ajudar?`;
    drFoot.innerHTML = `<button class="btn btn--primary btn--lg" data-quote="${k}:${it.id}"><span>${isM ? 'Solicitar orçamento' : k === 'p' ? 'Pedir esta peça' : 'Orçar esta lâmina'}</span>${icon('arrow')}</button>
      <a class="btn btn--wa btn--lg" href="${waUrl(deptNum(dept), msg)}" target="_blank" rel="noopener" data-dept="${dept}">${icon('wa')}<span class="long">WhatsApp</span></a>
      <button class="iconbtn" data-copy aria-label="Copiar link do produto">${icon('link')}</button>`;
    track('product_view', { item_id: it.id, item_name: it.name, item_category: viewOfKind[k] });
  }
  function openDrawer(ref, how) {
    const found = getItem(ref); if (!found) return;
    const { k, it } = found;
    const wasOpen = drawer.classList.contains('is-open');
    drState = { k, id: it.id, list: navList(k) };
    fillDrawer(k, it);
    if (!wasOpen) {
      lastFocus = document.activeElement;
      drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
      scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('is-on'));
      syncLock();
      setTimeout(() => $('#drClose').focus({ preventScroll: true }), 80);
    }
    const target = '#/produto/' + it.id;
    if (how === 'push' && curHash() !== target) {
      try { drReturn = curHash(); history.pushState(null, '', target); drPushed = location.hash === target; lastRouted = target; } catch (e) { drPushed = false; }
    } else if (how === 'replace') {
      try { history.replaceState(null, '', target); lastRouted = target; } catch (e) { /* noop */ }
    }
  }
  function hideDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('is-on'); setTimeout(() => { scrim.hidden = true; }, 400);
    syncLock();
    setTimeout(() => { if (!drawer.classList.contains('is-open')) drBody.innerHTML = ''; }, 620);
    drState = null;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    if (drPushed) { drPushed = false; skipBack = true; hideDrawer(); history.back(); return; }
    const base = drState ? { m: '#/mill-maquinas', b: '#/mill-serras', p: '#/pos-venda/pecas' }[drState.k] : '#/';
    if (/^#\/produto\//.test(curHash())) replaceHash(base);
    hideDrawer();
  }
  function stepProduct(dir) {
    if (!drState) return;
    const L = drState.list, i = L.findIndex((x) => x.id === drState.id);
    const nx = L[(i + dir + L.length) % L.length];
    openDrawer(`${drState.k}:${nx.id}`, 'replace');
  }
  $('#drClose').addEventListener('click', closeDrawer);
  $('#drPrev').addEventListener('click', () => stepProduct(-1));
  $('#drNext').addEventListener('click', () => stepProduct(1));
  scrim.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', (e) => {
    const yt = e.target.closest('[data-yt]');
    if (yt && !yt.querySelector('iframe')) { yt.insertAdjacentHTML('beforeend', `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt.dataset.yt)}?autoplay=1&rel=0" title="Vídeo do equipamento" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`); track('video_play', { video_id: yt.dataset.yt }); }
    const cp = e.target.closest('[data-copy]');
    if (cp && drState) {
      const url = location.href.split('#')[0] + '#/produto/' + drState.id;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => { cp.innerHTML = icon('check'); setTimeout(() => { cp.innerHTML = icon('link'); }, 1600); }).catch(() => { window.prompt('Copie o link:', url); });
    }
  });
  drawer.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-yt]')) { e.preventDefault(); e.target.click(); } });

  /* ======================================================== ORÇAMENTO */
  const LEAD_TYPES = {
    maquinas: { l: 'Máquinas para serraria', s: 'Serraria completa ou equipamento', ic: 'gear', dept: 'maquinas', code: 'MQ' },
    serras: { l: 'Lâminas de serra fita', s: 'Alimentos, marcenaria e madeira', ic: 'blade', dept: 'serras', code: 'SR' },
    pecas: { l: 'Peças de reposição', s: 'Originais Mill', ic: 'part', dept: 'posvenda', code: 'PC' },
    assistencia: { l: 'Assistência técnica', s: 'Chamado, manutenção e montagem', ic: 'wrench', dept: 'posvenda', code: 'AT' },
    treinamento: { l: 'Treinamento', s: 'Operadores e equipe técnica', ic: 'cap', dept: 'posvenda', code: 'TR' },
    representante: { l: 'Quero ser representante', s: 'Parceria comercial', ic: 'handshake', dept: 'geral', code: 'RP' }
  };
  const machineOpts = MACHINES.map((m) => m.name);
  const bladeOpts = BLADES.map((b) => `${b.name} ${b.size}`);
  const LEAD_Q = {
    maquinas: { t: 'Sobre o seu projeto', qs: [
      { n: 'projeto', l: 'O que você precisa?', o: ['Serraria completa (nova)', 'Ampliar ou modernizar a linha', 'Substituir um equipamento', 'Equipamento específico'], req: 1 },
      { n: 'madeira', l: 'Qual madeira você processa?', o: ['Pinus', 'Eucalipto', 'Teca / gmelina', 'Outra'], req: 1 },
      { n: 'prazo', l: 'Quando pretende investir?', o: ['Imediato (até 30 dias)', '1 a 3 meses', '3 a 6 meses', 'Estou pesquisando'], req: 1 },
      { n: 'produto', l: 'Equipamento de interesse', sel: machineOpts }
    ] },
    serras: { t: 'Sobre as lâminas', qs: [
      { n: 'segmento', l: 'Para qual corte?', o: ['Alimentos', 'Marcenaria', 'Madeira / serraria'], req: 1 },
      { n: 'perfil', l: 'Você compra para…', o: ['Uso na minha empresa', 'Revenda / distribuição'], req: 1 },
      { n: 'volume', l: 'Consumo mensal estimado', o: ['Até 10 lâminas', '10 a 50', '50 a 200', 'Mais de 200'], req: 1 },
      { n: 'produto', l: 'Modelo ou medida', sel: bladeOpts }
    ] },
    pecas: { t: 'Sobre a peça', qs: [
      { n: 'linha', l: 'Linha do equipamento', o: ['M/PRO', 'L/PRO', 'G/FORCE', 'Compact Line', 'Outro / não sei'], req: 1 },
      { n: 'peca', l: 'Peça', sel: [...PARTS.map((p) => p.name), 'Outra peça'] },
      { n: 'urgencia', l: 'Urgência', o: ['Máquina parada', 'Preciso em breve', 'Reposição de estoque'], req: 1 },
      { n: 'obs', l: 'Modelo, número de série ou detalhes', ta: 1 }
    ] },
    assistencia: { t: 'Sobre o atendimento', qs: [
      { n: 'situacao', l: 'Qual a situação?', o: ['Máquina parada', 'Funcionando com falha', 'Manutenção preventiva', 'Montagem / instalação', 'Retífica de volantes'], req: 1 },
      { n: 'equipamento', l: 'Equipamento', sel: [...machineOpts, 'Outro'] },
      { n: 'obs', l: 'Conte rapidamente o que está acontecendo', ta: 1 }
    ] },
    treinamento: { t: 'Sobre o treinamento', qs: [
      { n: 'pessoas', l: 'Quantas pessoas?', o: ['1 a 3', '4 a 10', 'Mais de 10'], req: 1 },
      { n: 'equipamento', l: 'Para qual equipamento?', sel: [...machineOpts, 'Vários / linha completa'] },
      { n: 'obs', l: 'Objetivo do treinamento', ta: 1 }
    ] },
    representante: { t: 'Sobre a parceria', qs: [
      { n: 'regiao', l: 'Região de atuação (cidades, estados ou país)', tx: 1, req: 1 },
      { n: 'linhas', l: 'Linhas de interesse', o: ['Máquinas', 'Serras', 'Máquinas e serras'], req: 1 },
      { n: 'experiencia', l: 'Experiência', o: ['Já represento outras marcas', 'Estou começando'], req: 1 }
    ] }
  };
  const UFS = [...BR_MAP.states.map((s) => s.id).sort(), 'Fora do Brasil'];
  const modal = $('#lead'), form = $('#leadForm'), prog = $('#leadProg'), stepLbl = $('#leadStep'), btnNext = $('#leadNext'), btnBack = $('#leadBack'), errEl = $('#leadErr');
  $('#leadUf').innerHTML = '<option value="">Selecione</option>' + UFS.map((u) => `<option>${u}</option>`).join('');
  $('#leadTypes').innerHTML = Object.entries(LEAD_TYPES).map(([k, t]) => `<label class="opt"><input type="radio" name="tipo" value="${k}"><span>${icon(t.ic)}<span><b>${esc(t.l)}</b><small>${esc(t.s)}</small></span></span></label>`).join('');
  const lead = { step: 1, type: null, pre: {} };
  let modalTrigger = null, leadFromHash = false;
  function renderStep2() {
    const def = LEAD_Q[lead.type];
    $('#lead2Title').textContent = def.t;
    $('#lead2Fields').innerHTML = def.qs.map((q) => {
      if (q.o) return `<div class="q" data-q="${q.n}"><span class="q__l">${esc(q.l)}${q.req ? '' : ' <small>(opcional)</small>'}</span><div class="opts opts--sm">${q.o.map((o) => `<label class="opt"><input type="radio" name="${q.n}" value="${esc(o)}"${lead.pre[q.n] === o ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('')}</div></div>`;
      if (q.sel) {
        const pv = lead.pre[q.n];
        const opts = pv && !q.sel.includes(pv) ? [pv, ...q.sel] : q.sel;
        return `<label class="field q"><span class="field__l">${esc(q.l)} (opcional)</span><select name="${q.n}"><option value="">Ainda não sei / não se aplica</option>${opts.map((o) => `<option${pv === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
      }
      if (q.ta) return `<label class="field q"><span class="field__l">${esc(q.l)} (opcional)</span><textarea name="${q.n}" rows="3"></textarea></label>`;
      return `<label class="field q"><span class="field__l">${esc(q.l)} *</span><input name="${q.n}" ${q.req ? 'required' : ''}></label>`;
    }).join('');
  }
  function goStep(n) {
    lead.step = n;
    $$('.lstep', form).forEach((s) => { s.hidden = +s.dataset.step !== n; });
    const done = n === 4;
    $('#leadFoot').hidden = done;
    prog.style.width = done ? '100%' : `${n / 3 * 100}%`;
    stepLbl.textContent = done ? 'Pronto' : `Etapa ${n} de 3`;
    btnBack.style.visibility = n === 1 ? 'hidden' : 'visible';
    btnNext.querySelector('span').textContent = n === 3 ? 'Enviar pelo WhatsApp' : 'Continuar';
    errEl.hidden = true;
    $('.modal__box', modal).scrollTop = 0;
    const first = $(`.lstep[data-step="${n}"] input:not([type=hidden]), .lstep[data-step="${n}"] select, .lstep[data-step="${n}"] a`, form);
    if (first && fine) setTimeout(() => first.focus({ preventScroll: true }), 80);
  }
  function openLead(pre = {}) {
    modalTrigger = document.activeElement;
    form.reset();
    lead.type = pre.type && LEAD_Q[pre.type] ? pre.type : null;
    lead.pre = {};
    if (pre.product) lead.pre[lead.type === 'assistencia' || lead.type === 'treinamento' ? 'equipamento' : 'produto'] = pre.product;
    if (pre.project) lead.pre.projeto = pre.project;
    if (pre.part) lead.pre.peca = pre.part;
    if (pre.situacao) lead.pre.situacao = pre.situacao;
    if (pre.type === 'serras' && pre.product) { const b = BLADES.find((x) => pre.product.startsWith(x.name) && pre.product.includes(x.size)); if (b) lead.pre.segmento = b.seg === 'madeira' ? 'Madeira / serraria' : BLADE_SEGS[b.seg]; }
    try { const c = JSON.parse(localStorage.getItem('mill_contact') || 'null'); if (c) ['nome', 'empresa', 'whatsapp', 'email', 'cidade', 'uf'].forEach((k) => { if (c[k] && form.elements[k]) form.elements[k].value = c[k]; }); } catch (e) { /* noop */ }
    if (lead.type) { const r = form.querySelector(`input[name=tipo][value="${lead.type}"]`); if (r) r.checked = true; renderStep2(); goStep(2); } else goStep(1);
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    setFab(false); setMenu(false); closeMega(); syncLock();
    track('lead_form_open', { lead_type: lead.type || 'indefinido', page: current });
  }
  function closeModal(m) {
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    syncLock();
    if (m === modal) {
      if (leadFromHash) { leadFromHash = false; replaceHash('#/'); }
      if (modalTrigger && document.contains(modalTrigger)) modalTrigger.focus({ preventScroll: true });
      modalTrigger = null;
    }
  }
  window.MillLead = openLead;
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-lead]');
    if (t) { e.preventDefault(); openLead({ type: t.dataset.lead || null, product: t.dataset.product, project: t.dataset.project, part: t.dataset.part, situacao: t.dataset.situacao }); return; }
    const op = e.target.closest('[data-open]');
    if (op) { e.preventDefault(); const m = document.getElementById(op.dataset.open); if (m) { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); syncLock(); setTimeout(() => { const c = $('[data-close]', m); if (c) c.focus(); }, 60); } return; }
    const c = e.target.closest('[data-close]');
    if (c) { closeModal(c.closest('.modal')); return; }
    if (e.target.classList && e.target.classList.contains('modal')) closeModal(e.target);
  });
  const clearErr = (e) => { errEl.hidden = true; const f = e.target.closest && e.target.closest('.is-invalid'); if (f) f.classList.remove('is-invalid'); };
  form.addEventListener('input', clearErr);
  form.addEventListener('change', (e) => {
    clearErr(e);
    if (e.target.name === 'tipo') { lead.type = e.target.value; lead.pre = {}; renderStep2(); setTimeout(() => goStep(2), 160); }
  });
  btnBack.addEventListener('click', () => goStep(Math.max(1, lead.step - 1)));
  function maskPhone(el) {
    el.addEventListener('input', () => {
      let d = el.value.replace(/\D/g, '').slice(0, 11);
      if (d.length > 10) d = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
      else if (d.length > 6) d = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
      else if (d.length > 2) d = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      else if (d.length) d = `(${d}`;
      el.value = d;
    });
  }
  maskPhone(form.elements.whatsapp);
  function fail(errBox, msg, el) {
    errBox.classList.remove('form-ok');
    errBox.textContent = msg; errBox.hidden = false;
    if (el) { const f = el.closest('.field, .consent'); if (f) f.classList.add('is-invalid'); if (el.focus) el.focus({ preventScroll: false }); }
    return false;
  }
  function validate(step) {
    $$('.is-invalid', form).forEach((x) => x.classList.remove('is-invalid'));
    errEl.hidden = true;
    if (step === 1) return lead.type ? true : fail(errEl, 'Escolha uma opção para continuar.');
    if (step === 2) {
      for (const q of LEAD_Q[lead.type].qs) {
        if (!q.req) continue;
        const v = form.elements[q.n] ? (form.elements[q.n].value || '').trim() : '';
        if (!v) return fail(errEl, `Responda: ${q.l.replace(/\?$/, '')}.`, q.tx ? form.elements[q.n] : null);
      }
      return true;
    }
    const E = form.elements;
    if ((E.nome.value || '').trim().length < 2) return fail(errEl, 'Informe o seu nome.', E.nome);
    if (E.whatsapp.value.replace(/\D/g, '').length < 10) return fail(errEl, 'Informe um WhatsApp com DDD.', E.whatsapp);
    if ((E.cidade.value || '').trim().length < 2) return fail(errEl, 'Informe a sua cidade.', E.cidade);
    if (!E.uf.value) return fail(errEl, 'Selecione o estado.', E.uf);
    if (E.email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(E.email.value)) return fail(errEl, 'Confira o e-mail informado.', E.email);
    if (!E.lgpd.checked) return fail(errEl, 'Para continuar, aceite o contato sobre esta solicitação.', E.lgpd);
    return true;
  }
  function priority(type, a) {
    let s = 0;
    if (type === 'maquinas') { s += { 'Imediato (até 30 dias)': 3, '1 a 3 meses': 2, '3 a 6 meses': 1 }[a.prazo] || 0; s += { 'Serraria completa (nova)': 2, 'Ampliar ou modernizar a linha': 2 }[a.projeto] || 1; return s >= 4 ? 1 : s >= 2 ? 2 : 3; }
    if (type === 'serras') { s += { 'Mais de 200': 3, '50 a 200': 2, '10 a 50': 1 }[a.volume] || 0; if (a.perfil === 'Revenda / distribuição') s += 1; return s >= 3 ? 1 : s >= 1 ? 2 : 3; }
    if (type === 'pecas') return a.urgencia === 'Máquina parada' ? 1 : a.urgencia === 'Preciso em breve' ? 2 : 3;
    if (type === 'assistencia') return a.situacao === 'Máquina parada' ? 1 : a.situacao === 'Funcionando com falha' ? 2 : 3;
    return type === 'treinamento' ? 2 : 3;
  }
  function sendHook(payload) {
    if (!CONFIG.webhook) return;
    try { fetch(CONFIG.webhook, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload) }); } catch (err) { /* noop */ }
  }
  function openWa(url) {
    let win = null;
    try { win = window.open(url, '_blank'); } catch (err) { /* noop */ }
    if (win) { try { win.opener = null; } catch (err) { /* noop */ } }
    return !!win;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(lead.step)) return;
    if (lead.step < 3) { goStep(lead.step + 1); return; }
    const E = form.elements, T = LEAD_TYPES[lead.type];
    const answers = {};
    LEAD_Q[lead.type].qs.forEach((q) => { const v = E[q.n] ? (E[q.n].value || '').trim() : ''; if (v) answers[q.n] = v; });
    const labels = Object.fromEntries(LEAD_Q[lead.type].qs.map((q) => [q.n, q.l.replace(/\s*\(.*\)$/, '').replace(/\?$/, '')]));
    const contact = { nome: E.nome.value.trim(), empresa: E.empresa.value.trim(), whatsapp: E.whatsapp.value.trim(), email: E.email.value.trim(), cidade: E.cidade.value.trim(), uf: E.uf.value };
    const p = priority(lead.type, answers);
    const ref = `${T.code}-P${p}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const origin = originLabel();
    const msg = [
      'Olá, Mill! Vim pelo site.',
      `*${T.l}*`,
      ...Object.entries(answers).map(([k, v]) => `• ${labels[k]}: ${v}`),
      '',
      '*Contato*',
      `Nome: ${contact.nome}`,
      contact.empresa ? `Empresa: ${contact.empresa}` : null,
      `Cidade: ${contact.cidade}/${contact.uf}`,
      `WhatsApp: ${contact.whatsapp}`,
      contact.email ? `E-mail: ${contact.email}` : null,
      '',
      `Ref.: ${ref} · origem: ${origin}`
    ].filter((x) => x !== null).join('\n');
    const url = waUrl(deptNum(T.dept), msg);
    const opened = openWa(url);
    $('#doneWa').href = url;
    $('#doneText').textContent = opened ? 'Abrimos o WhatsApp do time responsável com o seu pedido organizado. É só tocar em enviar.' : 'Toque no botão abaixo para abrir o WhatsApp com o seu pedido já organizado.';
    try { localStorage.setItem('mill_contact', JSON.stringify(contact)); } catch (err) { /* noop */ }
    sendHook({ ref, tipo: lead.type, tipo_label: T.l, prioridade: p, respostas: answers, contato: contact, origem: origin, utm: getUtm(), pagina: location.href, enviado_em: new Date().toISOString() });
    track('generate_lead', { lead_type: lead.type, lead_priority: `P${p}`, lead_ref: ref, dept: T.dept, value: p === 1 ? 3 : p === 2 ? 2 : 1, currency: 'BRL' });
    goStep(4);
  });

  /* ------------------------------------------------------------ CONTATO */
  const cform = $('#contactForm'), cErr = $('#cErr');
  maskPhone(cform.elements.whatsapp);
  let cVia = 'wa';
  $$('[data-via]', cform).forEach((b) => b.addEventListener('click', () => { cVia = b.dataset.via; }));
  cform.addEventListener('input', (e) => { cErr.hidden = true; const f = e.target.closest('.is-invalid'); if (f) f.classList.remove('is-invalid'); });
  cform.addEventListener('submit', (e) => {
    e.preventDefault();
    const E = cform.elements;
    if (e.submitter && e.submitter.dataset.via) cVia = e.submitter.dataset.via;
    $$('.is-invalid', cform).forEach((x) => x.classList.remove('is-invalid'));
    if ((E.nome.value || '').trim().length < 2) return fail(cErr, 'Informe o seu nome.', E.nome);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(E.email.value)) return fail(cErr, 'Informe um e-mail válido.', E.email);
    if (!E.assunto.value) return fail(cErr, 'Escolha o assunto.', E.assunto);
    if ((E.mensagem.value || '').trim().length < 5) return fail(cErr, 'Escreva a sua mensagem.', E.mensagem);
    if (!E.lgpd.checked) return fail(cErr, 'Para enviar, aceite o contato sobre esta mensagem.', E.lgpd);
    const subj = E.assunto.options[E.assunto.selectedIndex].text;
    const lines = ['Olá, Mill! Vim pelo site (Fale conosco).', `*Assunto:* ${subj}`, '', E.mensagem.value.trim(), '', `Nome: ${E.nome.value.trim()}`, `E-mail: ${E.email.value.trim()}`, E.whatsapp.value ? `WhatsApp: ${E.whatsapp.value}` : null, '', `Origem: ${originLabel()}`].filter((x) => x !== null);
    if (cVia === 'mail') location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent('Contato pelo site: ' + subj)}&body=${encodeURIComponent(lines.join('\n').replace(/\*/g, ''))}`;
    else openWa(waUrl(deptNum(E.assunto.value), lines.join('\n')));
    sendHook({ tipo: 'contato', assunto: subj, mensagem: E.mensagem.value.trim(), contato: { nome: E.nome.value.trim(), email: E.email.value.trim(), whatsapp: E.whatsapp.value }, via: cVia, origem: originLabel(), utm: getUtm(), enviado_em: new Date().toISOString() });
    track('generate_lead', { lead_type: 'contato', dept: E.assunto.value, via: cVia, value: 1, currency: 'BRL' });
    cErr.hidden = false; cErr.classList.add('form-ok');
    cErr.textContent = cVia === 'mail' ? 'Abrimos o seu e-mail com a mensagem pronta. É só enviar.' : 'Abrimos o WhatsApp do setor com a sua mensagem. É só tocar em enviar.';
    return true;
  });

  /* ================================================================ FAB */
  const fab = $('#fab'), fabBtn = $('#fabBtn'), fabPanel = $('#fabPanel');
  function setFab(open) { fab.classList.toggle('is-open', open); fabBtn.setAttribute('aria-expanded', String(open)); fabPanel.setAttribute('aria-hidden', String(!open)); }
  fabBtn.addEventListener('click', (e) => { e.stopPropagation(); setFab(!fab.classList.contains('is-open')); });
  $$('[data-fab]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); setFab(!fab.classList.contains('is-open')); }));
  document.addEventListener('click', (e) => { if (fab.classList.contains('is-open') && !e.target.closest('#fab') && !e.target.closest('[data-fab]')) setFab(false); });
  fabPanel.addEventListener('click', (e) => { if (e.target.closest('a')) setTimeout(() => setFab(false), 100); });

  /* ============================================================== ROTAS */
  const PAGE_OF = { '': 'home', inicio: 'home', 'mill-serras': 'serras', serras: 'serras', 'mill-maquinas': 'maquinas', maquinas: 'maquinas', 'pos-venda': 'posvenda', 'pecas-de-reposicao': 'posvenda', representantes: 'reps', sobre: 'sobre', contato: 'contato', 'fale-conosco': 'contato' };
  const TITLES = {
    home: 'Mill Indústrias | Máquinas para serraria e lâminas de serra fita | Lages/SC',
    serras: 'Mill Serras | Lâminas de serra fita para alimentos, marcenaria e madeira',
    maquinas: 'Mill Máquinas | Máquinas para serraria, de ponta a ponta',
    posvenda: 'Pós-venda Mill | Peças de reposição, assistência autorizada e treinamentos',
    reps: 'Revendas e representantes | Mill Indústrias',
    sobre: 'Sobre nós | Mill Indústrias',
    contato: 'Fale conosco | Mill Indústrias'
  };
  const NAV_OF = { serras: 'serras', maquinas: 'maquinas', posvenda: 'posvenda', reps: 'reps', sobre: 'sobre', contato: 'contato' };
  const views = Object.fromEntries($$('[data-view]').map((v) => [v.dataset.view, v]));
  let pathOverride = null, lastRouted = null, skipBack = false, navHold = 0;
  function curHash() { return pathOverride !== null ? pathOverride : location.hash; }
  function replaceHash(h) {
    try { history.replaceState(null, '', h); pathOverride = location.hash === h ? null : h; } catch (e) { pathOverride = h; }
    lastRouted = h;
  }
  function navigate(h) {
    let ok = false;
    try { history.replaceState(Object.assign({}, history.state, { y: Math.round(window.scrollY) }), ''); } catch (e) { /* noop */ }
    try { if (location.hash !== h) history.pushState(null, '', h); ok = location.hash === h || (h === '#/' && /^#?\/?$/.test(location.hash)); } catch (e) { ok = false; }
    pathOverride = ok ? null : h;
    route(true);
  }
  let restoreY = null;
  function jump(y) { try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); } }
  function scrollTop() { jump(0); }
  function showView(name) {
    if (current === name) return false;
    Object.entries(views).forEach(([k, v]) => { v.hidden = k !== name; });
    const v = views[name];
    if (current && !reduce) { v.classList.remove('is-entering'); void v.offsetWidth; v.classList.add('is-entering'); }
    current = name;
    document.title = TITLES[name] || TITLES.home;
    $$('.nav__link').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === NAV_OF[name]));
    nav.classList.remove('is-hidden');
    scrollTop();
    if (name === 'reps') { requestAnimationFrame(placeLabels); setTimeout(placeLabels, 300); }
    hero.classList.toggle('is-paused', name !== 'home');
    track('page_view_virtual', { page_path: '/' + (curHash().replace(/^#\/?/, '') || ''), page_title: document.title });
    requestAnimationFrame(onScroll);
    return true;
  }
  function scrollToId(id, smooth) {
    if (restoreY !== null) { const y = restoreY; restoreY = null; requestAnimationFrame(() => requestAnimationFrame(() => jump(y))); return; }
    const el = document.getElementById(id); if (!el) return;
    navHold = performance.now() + 1400;
    const go = () => {
      const y = el.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(root).scrollPaddingTop) || 88) + 8;
      try { window.scrollTo({ top: y, behavior: smooth && !reduce ? 'smooth' : 'instant' }); } catch (e) { window.scrollTo(0, y); }
    };
    if (smooth) go(); else requestAnimationFrame(() => requestAnimationFrame(go));
  }
  function route(force) {
    const h = curHash();
    if (skipBack) { skipBack = false; lastRouted = h; return; }
    if (!force && h === lastRouted) return;
    lastRouted = h;
    const parts = decodeURIComponent(h.replace(/^#\/?/, '')).split('/').filter(Boolean);
    const a = parts[0] || '', b = parts[1] || '';
    closeMega(); setMenu(false);
    if (a === 'produto') {
      const k = kindOf(b);
      if (!k) { navigate('#/'); return; }
      if (current !== viewOfKind[k]) showView(viewOfKind[k]);
      drPushed = false;
      openDrawer(`${k}:${b}`);
      return;
    }
    if (drawer.classList.contains('is-open')) {
      const backToList = drPushed && h === drReturn;
      drPushed = false; hideDrawer();
      if (backToList) return;
    }
    if (a === 'orcamento') {
      if (!current) showView('home');
      leadFromHash = true;
      openLead({ type: b || null });
      return;
    }
    let view = PAGE_OF[a];
    if (!view) {
      const el = a && document.getElementById(a);
      const v = el && el.closest('[data-view]');
      if (v) { const changed = showView(v.dataset.view); scrollToId(a, !changed); return; }
      view = 'home';
    }
    const changed = showView(view);
    const smooth = !changed;
    const top = () => {
      if (restoreY !== null) { const y = restoreY; restoreY = null; requestAnimationFrame(() => requestAnimationFrame(() => jump(y))); return; }
      if (!changed) try { window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
    };
    if (view === 'home') { if (b) scrollToId(b === 'quem-somos' ? 'quem-somos' : b, smooth); else top(); return; }
    if (view === 'serras' || view === 'maquinas') {
      const C = CATS[view];
      if (C.cats[b]) { setFilter(view, b); scrollToId(view + '-catalogo', smooth); return; }
      if (b === 'seletor') { scrollToId('serras-seletor', smooth); return; }
      if (b === 'tecnologia') { scrollToId('serras-tecnologia', smooth); return; }
      if (b === 'ponta-a-ponta') { scrollToId('maquinas-ponta-a-ponta', smooth); return; }
      if (!b) { setFilter(view, 'all'); top(); }
      return;
    }
    if (view === 'posvenda') {
      const map = { pecas: 'pv-pecas', assistencia: 'pv-assistencia', treinamentos: 'pv-treinamentos' };
      if (map[b]) scrollToId(map[b], smooth); else top();
      return;
    }
    if (view === 'reps') {
      if (b === 'internacional') { scrollToId('reps-internacional', smooth); return; }
      setLine(LINE_SLUG[b] || 'all');
      if (b) scrollToId('reps-mapa', smooth); else top();
      return;
    }
    if (view === 'sobre') {
      const map = { video: 'sobre-video', 'trabalhe-conosco': 'sobre-trabalhe-conosco', transparencia: 'sobre-transparencia', diferenciais: 'sobre-diferenciais', historia: 'sobre-historia' };
      if (map[b]) scrollToId(map[b], smooth); else top();
      return;
    }
    top();
  }
  window.addEventListener('hashchange', () => { pathOverride = null; route(); });
  window.addEventListener('popstate', (e) => {
    pathOverride = null;
    restoreY = e.state && typeof e.state.y === 'number' && !skipBack ? e.state.y : null;
    route();
    restoreY = null;
  });
  try { history.scrollRestoration = 'manual'; } catch (e) { /* noop */ }
  /* todos os links internos passam pelo roteador: funciona também em pré-visualizações e iframes */
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '#' || a.classList.contains('js-wa')) { if (href === '#') e.preventDefault(); return; }
    e.preventDefault();
    if (href.startsWith('#/orcamento')) { openLead({ type: href.split('/')[2] || null }); return; }
    if (href === '#main') { $('#main').focus(); return; }
    navigate(href.startsWith('#/') ? href : '#/' + href.slice(1));
  });

  /* ============================================================ ROLAGEM */
  const progress = $('.progress'), mbar = $('.mbar');
  const stFigs = $$('.statement__fig');
  const mark = $('.footer__mark span');
  let lastY = window.scrollY, ticking = false;
  function onScroll() {
    const y = window.scrollY, vh = window.innerHeight, vw = window.innerWidth;
    const dy = y - lastY;
    nav.classList.toggle('is-scrolled', y > 30);
    if (performance.now() < navHold) nav.classList.remove('is-hidden');
    else if (!mnav.classList.contains('is-open') && !openItem) {
      if (y > 700 && dy > 6) nav.classList.add('is-hidden');
      else if (dy < -6 || y < 700) nav.classList.remove('is-hidden');
    }
    if (mbar) { if (dy > 12 && y > 400) mbar.classList.add('is-hidden'); else if (dy < -8) mbar.classList.remove('is-hidden'); }
    const max = document.documentElement.scrollHeight - vh;
    progress.style.setProperty('--sp', (max > 0 ? y / max : 0).toFixed(4));
    root.style.setProperty('--sx', (y * .55).toFixed(1));
    updateRZ(vh, vw);
    updateSteps(vh);
    updateReasons(vh);
    if (!reduce) {
      stFigs.forEach((f) => {
        if (f.offsetParent === null) return;
        const r = f.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        f.style.setProperty('--py', (-p * r.height * .13).toFixed(1) + 'px');
      });
      if (mark) {
        const r = mark.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) mark.style.setProperty('--fm-y', clamp((r.top - vh) * .18, -70, 0).toFixed(1) + 'px');
      }
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(onScroll));

  /* ============================================================= TECLADO */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (vmodal.classList.contains('is-open')) { closeVideo(); return; }
      const openModals = $$('.modal.is-open');
      if (openModals.length) { closeModal(openModals[openModals.length - 1]); return; }
      if (drawer.classList.contains('is-open')) { closeDrawer(); return; }
      if (fab.classList.contains('is-open')) { setFab(false); return; }
      if (mnav.classList.contains('is-open')) { setMenu(false); burger.focus(); return; }
      if (openItem) { const l = $('.nav__link', openItem); closeMega(); l.focus(); }
    }
    if (e.key === 'Enter' && e.target.matches && e.target.matches('.pcard')) { openDrawer(e.target.dataset.openProduct, 'push'); return; }
    if (drawer.classList.contains('is-open') && !$$('.modal.is-open').length && !(e.target.closest && e.target.closest('input, select, textarea'))) {
      if (e.key === 'ArrowRight') stepProduct(1);
      if (e.key === 'ArrowLeft') stepProduct(-1);
    }
    if (e.key === 'Tab') {
      const scope = (vmodal.classList.contains('is-open') ? vmodal : null) || $$('.modal.is-open').pop() || (drawer.classList.contains('is-open') ? drawer : null);
      if (!scope) return;
      const f = $$('a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, [tabindex="0"]', scope).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* produto e cotação a partir dos cards */
  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-quote]');
    if (q) {
      e.stopPropagation();
      const [k] = q.dataset.quote.split(':');
      const found = getItem(q.dataset.quote);
      const type = k === 'm' ? 'maquinas' : k === 'b' ? 'serras' : 'pecas';
      openLead({ type, product: found ? `${found.it.name}${found.it.size ? ' ' + found.it.size : ''}` : '', part: k === 'p' && found ? found.it.name : '' });
      return;
    }
    const o = e.target.closest('[data-open-product]');
    if (o) { e.preventDefault(); openDrawer(o.dataset.openProduct, drawer.classList.contains('is-open') ? 'replace' : 'push'); }
  });

  /* ================================================================ INÍCIO */
  wireWa();
  route(true);
  if (!current) showView('home');
  requestAnimationFrame(() => { hero.classList.add('is-ready'); root.classList.add('is-loaded'); onScroll(); });
})();
