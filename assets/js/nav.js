/* ============================================================
   SCREW FACE — navigation renderer (vanilla, no dependencies)
   assets/js/nav.js

   Paints the primary nav, the drop slot, the mobile drawer and
   the footer link columns from NAV (assets/js/nav.config.js).
   Runs before main.js so the cart can paint into the bag count
   the same way it always has.

   The header keeps its own markup for the brand lockup and the
   Search / Bag / burger utilities — those are preserved as-is
   and are not config-driven on purpose.
   ============================================================ */
(function () {
  'use strict';

  if (typeof NAV === 'undefined') return;

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const REDUCED = !!(window.matchMedia &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const HOVER_IN  = 100;   /* hover-intent delay before a dropdown opens */
  const HOVER_OUT = 200;   /* grace on the way out, so a diagonal mouse
                              path to a child item does not close it */

  /* ---------- 1. CURRENT PAGE ---------- */
  const HERE = (location.pathname.split('/').pop() || 'index.html');
  const HERE_CAT = new URLSearchParams(location.search).get('cat') || '';
  const ON_INDEX = HERE === 'index.html' || HERE === '';

  /* "index.html#join" becomes "#join" when we are already on index,
     so on-page anchors keep jumping instead of reloading the page. */
  function href(h) {
    return ON_INDEX && h.indexOf('index.html#') === 0 ? h.slice('index.html'.length) : h;
  }

  function isCurrent(item) {
    const [file, query] = item.href.split('#')[0].split('?');
    if (file !== HERE) return false;
    const want = new URLSearchParams(query || '').get('cat') || '';
    return want === HERE_CAT;
  }

  /* ---------- 2. RESOLVE ----------
     An item tied to a category with no SKUs behind it is dropped.
     A group left with fewer than two children loses its trigger —
     a dropdown holding one item reads worse than no dropdown. */
  function stocked(item) {
    if (!item.cat) return true;
    return typeof PRODUCTS !== 'undefined' && PRODUCTS.some(p => p.cat === item.cat);
  }

  function resolve(list) {
    return (list || []).reduce((keep, item) => {
      if (!stocked(item)) return keep;
      if (item.children) {
        const kids = resolve(item.children);
        if (kids.length < 2) return keep;
        keep.push(Object.assign({}, item, { children: kids }));
      } else {
        keep.push(item);
      }
      return keep;
    }, []);
  }

  const PRIMARY = resolve(NAV.primary);
  const DROP    = NAV.activeDrop || null;

  /* ---------- 3. BUILD ---------- */
  function link(item, cls) {
    const a = document.createElement('a');
    a.href = href(item.href);
    a.textContent = item.label;
    if (cls) a.className = cls;
    if (isCurrent(item)) a.setAttribute('aria-current', 'page');
    return a;
  }

  let uid = 0;

  function group(item) {
    const wrap = document.createElement('div');
    wrap.className = 'nav__group';

    const id = 'navgrp-' + (++uid);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav__trigger';
    btn.textContent = item.label;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);

    const panel = document.createElement('div');
    panel.className = 'nav__panel';
    panel.id = id;
    panel.hidden = true;

    const ul = document.createElement('ul');
    item.children.forEach(kid => {
      const li = document.createElement('li');
      li.appendChild(link(kid));
      ul.appendChild(li);
    });
    panel.appendChild(ul);

    if (item.children.some(isCurrent)) btn.setAttribute('aria-current', 'true');

    wrap.append(btn, panel);
    wireGroup(wrap, btn, panel, item);
    return wrap;
  }

  /* ---------- 4. DROPDOWN BEHAVIOUR ---------- */
  const openGroups = [];

  /* an open panel cannot escape the header's difference blend, so the
     header goes solid for as long as one is open */
  function syncHeader() {
    const bar = $('.nav');
    if (bar) bar.classList.toggle('has-open', openGroups.length > 0);
  }

  function closeAll(except) {
    openGroups.slice().forEach(g => { if (g.el !== except) g.close(); });
  }

  function wireGroup(wrap, btn, panel, item) {
    let timer = null;
    let tapped = false;      /* opened by a deliberate tap on the trigger, as
                                opposed to by hover or by focus arriving */
    let returning = false;   /* Escape is handing focus back to the trigger —
                                that focusin must not reopen the panel */
    const items = () => $$('a', panel);

    const rec = { el: wrap, close };

    function open() {
      clearTimeout(timer);
      if (returning) return;
      if (btn.getAttribute('aria-expanded') === 'true') return;
      closeAll(wrap);
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      wrap.classList.add('is-open');
      openGroups.push(rec);
      syncHeader();
    }

    function close() {
      clearTimeout(timer);
      if (btn.getAttribute('aria-expanded') === 'false') return;
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      wrap.classList.remove('is-open');
      tapped = false;
      const i = openGroups.indexOf(rec);
      if (i > -1) openGroups.splice(i, 1);
      syncHeader();
    }

    function closeToTrigger() {
      const had = panel.contains(document.activeElement);
      returning = true;
      close();
      if (had) btn.focus();
      returning = false;
    }

    /* hover, with intent */
    wrap.addEventListener('mouseenter', () => {
      clearTimeout(timer);
      timer = setTimeout(open, HOVER_IN);
    });
    wrap.addEventListener('mouseleave', () => {
      clearTimeout(timer);
      timer = setTimeout(close, HOVER_OUT);
    });

    /* focus keeps it open; leaving the group with Tab closes it */
    wrap.addEventListener('focusin', open);
    wrap.addEventListener('focusout', () => {
      setTimeout(() => { if (!wrap.contains(document.activeElement)) close(); }, 0);
    });

    /* Pointer: the first tap opens, the second follows the link. The decision
       has to be made from the state as it stood before the pointer went down —
       pointerdown focuses the trigger, and that focusin has already opened the
       panel by the time click runs. */
    let wasTapped = false;
    btn.addEventListener('pointerdown', () => { wasTapped = tapped; });
    btn.addEventListener('click', e => {
      e.preventDefault();
      if (e.detail === 0) return;          /* keyboard activation; handled below */
      if (wasTapped) { location.href = href(item.href); return; }
      open();
      tapped = true;
    });

    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        /* preventDefault also stops the synthetic click a button fires */
        e.preventDefault(); open(); (items()[0] || btn).focus();
      }
      else if (e.key === 'ArrowDown') { e.preventDefault(); open(); (items()[0] || btn).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); open(); (items().slice(-1)[0] || btn).focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });

    panel.addEventListener('keydown', e => {
      const list = items();
      const at = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (list[at + 1] || list[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (list[at - 1] || list.slice(-1)[0]).focus(); }
      else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); list.slice(-1)[0].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeToTrigger(); }
    });
  }

  /* outside click and route change close everything */
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav__group')) closeAll(null);
  });
  addEventListener('pagehide', () => closeAll(null));

  /* ---------- 5. PRIMARY ROW ---------- */
  (function paintPrimary() {
    const row = $('[data-nav-primary]');
    if (!row) return;
    row.replaceChildren();
    PRIMARY.forEach(item => row.appendChild(item.children ? group(item) : link(item)));
    /* the drop slot renders nothing at all when there is no active drop */
    if (DROP) row.appendChild(link(DROP, 'nav__drop'));
  })();

  /* ---------- 6. DRAWER ---------- */
  (function drawer() {
    const panel = $('.menu');
    if (!panel) return;

    const list = $('[data-nav-drawer]', panel);
    if (list) {
      list.replaceChildren();
      const push = (item, cls) => {
        const li = document.createElement('li');
        li.appendChild(link(item, cls));
        list.appendChild(li);
      };
      /* groups flatten in the drawer — a nested accordion inside a
         full-screen menu is more chrome than it is worth */
      PRIMARY.forEach(item => {
        if (item.children) item.children.forEach(k => push(k));
        else push(item);
      });
      if (DROP) push(DROP, 'menu__drop');
    }

    const links = $('[data-nav-drawer-foot]', panel);
    if (links) {
      links.replaceChildren();
      /* the drawer carries the full footer set — info and socials both */
      NAV.footer.info.concat(NAV.footer.follow).forEach(item => {
        const li = document.createElement('li');
        const a = link(item);
        if (/^https?:/.test(item.href)) { a.rel = 'noopener'; a.target = '_blank'; }
        li.appendChild(a);
        links.appendChild(li);
      });
    }

    panel.setAttribute('aria-modal', 'true');
    panel.hidden = true;

    let opener = null;
    const focusables = () =>
      $$('a[href], button:not([disabled])', panel).filter(el => el.offsetParent !== null);

    function open(e) {
      opener = (e && e.currentTarget) || $('[data-menu-open]');
      panel.hidden = false;
      /* next frame, so the clip-path transition has a state to run from */
      if (REDUCED) panel.classList.add('is-open');
      else requestAnimationFrame(() => panel.classList.add('is-open'));
      document.documentElement.classList.add('is-locked');
      $$('[data-menu-open]').forEach(b => b.setAttribute('aria-expanded', 'true'));
      const first = focusables()[0];
      if (first) first.focus();
    }

    function close() {
      if (panel.hidden) return;
      panel.classList.remove('is-open');
      document.documentElement.classList.remove('is-locked');
      $$('[data-menu-open]').forEach(b => b.setAttribute('aria-expanded', 'false'));
      const done = () => { panel.hidden = true; };
      if (REDUCED) done(); else setTimeout(done, 800);
      if (opener) opener.focus();
    }

    $$('[data-menu-open]').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-controls', 'site-menu');
      b.addEventListener('click', open);
    });
    $$('[data-menu-close]').forEach(b => b.addEventListener('click', close));
    $$('a', panel).forEach(a => a.addEventListener('click', close));

    panel.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  })();

  /* ---------- 7. FOOTER COLUMNS ---------- */
  (function paintFooter() {
    const map = { info: '[data-foot-info]', follow: '[data-foot-follow]' };
    Object.keys(map).forEach(key => {
      $$(map[key]).forEach(ul => {
        ul.replaceChildren();
        NAV.footer[key].forEach(item => {
          const li = document.createElement('li');
          const a = link(item);
          if (/^https?:/.test(item.href)) { a.rel = 'noopener'; a.target = '_blank'; }
          li.appendChild(a);
          ul.appendChild(li);
        });
      });
    });
  })();

})();
