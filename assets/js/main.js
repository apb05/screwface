/* ============================================================
   SCREW FACE — interactions (vanilla, no dependencies)
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = n => '$' + n.toLocaleString('en-US');
  const moneyCAD = n => money(n) + ' CAD';

  /* Hoodie bundle pricing: 1 $40 · 2 $70 · 3 $100 · 4 $125.
     Past four the tiers stack — every full four is $125, the remainder
     is charged at its own tier price. */
  function hoodieTotal(n) {
    if (n <= 0) return 0;
    const sets = Math.floor(n / 4), rest = n % 4;
    return sets * HOODIE_TIERS[4] + HOODIE_TIERS[rest];
  }

  /* ---------- 1. PRELOADER ---------- */
  (function loader() {
    const el = $('.loader');
    if (!el) return;
    const fill = $('.loader__fill', el);
    const pct  = $('.loader__pct', el);
    let v = 0;
    const done = () => {
      document.body.classList.add('loaded');
      setTimeout(() => el.remove(), 1400);
    };
    if (REDUCED) { done(); return; }
    const tick = setInterval(() => {
      v = Math.min(100, v + Math.random() * 16 + 5);
      if (fill) fill.style.transform = `scaleX(${v / 100})`;
      if (pct) pct.textContent = String(Math.floor(v)).padStart(3, '0');
      if (v >= 100) { clearInterval(tick); setTimeout(done, 420); }
    }, 130);
  })();

  /* ---------- 2. CUSTOM CURSOR ---------- */
  (function cursor() {
    if (window.matchMedia('(hover: none)').matches) return;
    const dot  = $('.cursor');
    const ring = $('.cursor__ring');
    if (!dot || !ring) return;
    const label = $('span', ring);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('cursor-live');
    }, { passive: true });
    (function raf() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      dot.style.transform  = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(raf);
    })();

    document.addEventListener('mouseover', e => {
      const t = e.target.closest('a, button, .card, .hslide, [data-cursor]');
      document.body.classList.toggle('cursor-hover', !!t);
      const txt = t && t.getAttribute('data-cursor');
      document.body.classList.toggle('cursor-label', !!txt);
      if (label) label.textContent = txt || '';
    });
    document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hide'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hide'));
  })();

  /* ---------- 3. NAV ---------- */
  (function nav() {
    const bar = $('.nav');
    if (!bar) return;
    let last = 0;
    const solidAt = () => ($('.hero') ? innerHeight * 0.86 : 40);
    const onScroll = () => {
      const y = scrollY;
      bar.classList.toggle('is-solid', y > solidAt());
      bar.classList.toggle('is-hidden', y > last && y > 320 && !$('.menu.is-open'));
      last = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- 4. MENU OVERLAY ---------- */
  /* Moved to assets/js/nav.js — the drawer is built from NAV
     (assets/js/nav.config.js) and needs the focus trap, focus
     return and aria-modal handling that live alongside it. */

  /* ---------- 5. SCROLL REVEALS ---------- */
  (function reveals() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    items.forEach((el, i) => {
      if (!el.style.getPropertyValue('--d')) {
        const sibs = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : i;
        el.style.setProperty('--d', Math.min(sibs, 6) * 0.07 + 's');
      }
      io.observe(el);
    });
  })();

  /* ---------- 6. PARALLAX ---------- */
  (function parallax() {
    const items = $$('[data-parallax]');
    if (!items.length || REDUCED) return;
    let ticking = false;
    const run = () => {
      items.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const amt = parseFloat(el.dataset.parallax) || 12;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${(-p * amt).toFixed(2)}%, 0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  })();

  /* ---------- 7. HORIZONTAL DRAG SCROLLER ---------- */
  (function hscroll() {
    $$('.hscroll').forEach(root => {
      const track = $('.hscroll__track', root);
      const thumb = $('.hscroll__thumb', root);
      if (!track) return;
      let down = false, startX = 0, startL = 0, moved = 0;

      track.addEventListener('pointerdown', e => {
        down = true; moved = 0;
        startX = e.clientX; startL = track.scrollLeft;
        track.classList.add('is-drag');
      });
      addEventListener('pointerup', () => { down = false; track.classList.remove('is-drag'); });
      addEventListener('pointermove', e => {
        if (!down) return;
        const dx = e.clientX - startX;
        moved = Math.abs(dx);
        track.scrollLeft = startL - dx;
      });
      track.addEventListener('click', e => { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } }, true);

      const sync = () => {
        if (!thumb) return;
        const max = track.scrollWidth - track.clientWidth;
        const ratio = track.clientWidth / track.scrollWidth;
        thumb.style.width = Math.max(ratio * 100, 8) + '%';
        thumb.style.left = (max > 0 ? (track.scrollLeft / max) * (100 - Math.max(ratio * 100, 8)) : 0) + '%';
      };
      track.addEventListener('scroll', sync, { passive: true });
      addEventListener('resize', sync);
      sync();
    });
  })();

  /* ---------- 8. PRODUCT RENDERING ---------- */
  function cardHTML(p, i) {
    const flag = p.flag ? `<span class="card__flag">${p.flag}</span>` : '';
    const sw = (p.colours || []).map(c => `<i style="background:${c}"></i>`).join('');
    return `
    <article class="card" data-reveal data-cat="${p.cat}" data-price="${p.price}" data-id="${p.id}" style="--d:${(i % 4) * 0.06}s">
      <a class="card__media" href="product.html?id=${p.id}" data-cursor="View">
        ${flag}
        <img class="a" src="${IMG(p.a)}" alt="${p.name} — front" loading="lazy">
        <img class="b" src="${IMG(p.b)}" alt="${p.name} — alternate" loading="lazy">
      </a>
      <button class="card__quick" data-add="${p.id}">Add — ${money(p.price)}</button>
      <div class="card__info">
        <div>
          <h3 class="card__name">${p.name}</h3>
          <p class="card__meta">${p.colour}</p>
          <div class="card__swatches">${sw}</div>
        </div>
        <span class="card__price">${money(p.price)}</span>
      </div>
    </article>`;
  }

  function renderGrid(el, list) {
    el.innerHTML = list.map(cardHTML).join('');
    // quick-add buttons sit outside the anchor, so wire them after paint
    $$('[data-add]', el).forEach(b => b.addEventListener('click', ev => {
      ev.preventDefault();
      const p = PRODUCTS.find(x => x.id === b.dataset.add);
      if (p) Cart.add(p, 'M');
    }));
    // re-run reveal for freshly injected nodes
    if (REDUCED) { $$('[data-reveal]', el).forEach(n => n.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]', el).forEach(n => io.observe(n));
  }

  /* ---------- 9. CART ---------- */
  const Cart = {
    key: 'sf-cart-v1',
    items: [],
    load() {
      let raw = [];
      try { raw = JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { raw = []; }
      /* drop lines for products that no longer exist, and re-read price and
         imagery from the catalogue so an old bag can't show a stale price */
      this.items = raw.reduce((keep, line) => {
        const p = PRODUCTS.find(x => x.id === line.id);
        if (p) keep.push({ id: p.id, name: p.name, price: p.price, img: p.a,
                           cat: p.cat, colour: p.colour, size: line.size, qty: line.qty });
        return keep;
      }, []);
      if (this.items.length !== raw.length) this.save();
    },
    save() { try { localStorage.setItem(this.key, JSON.stringify(this.items)); } catch (e) {} },
    add(p, size) {
      const line = this.items.find(i => i.id === p.id && i.size === size);
      if (line) line.qty += 1;
      else this.items.push({ id: p.id, name: p.name, price: p.price, img: p.a,
                             cat: p.cat, colour: p.colour, size, qty: 1 });
      this.save(); this.paint(); openDrawer();
      toast(`${p.name} — added`);
    },
    remove(idx) { this.items.splice(idx, 1); this.save(); this.paint(); },
    bump(idx, d) {
      const it = this.items[idx];
      if (!it) return;
      it.qty += d;
      if (it.qty < 1) this.items.splice(idx, 1);
      this.save(); this.paint();
    },
    /* list price, before any bundle is applied */
    gross() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
    hoodieQty() {
      return this.items.reduce((s, i) => s + (i.cat === 'hoodies' ? i.qty : 0), 0);
    },
    total() {
      const other = this.items.reduce((s, i) => s + (i.cat === 'hoodies' ? 0 : i.price * i.qty), 0);
      return hoodieTotal(this.hoodieQty()) + other;
    },
    saved() { return this.gross() - this.total(); },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); },
    paint() {
      $$('.cart-count').forEach(n => n.textContent = '(' + this.count() + ')');
      const body = $('.drawer__body');
      const sum = $('[data-cart-total]');
      if (sum) sum.textContent = moneyCAD(this.total());
      const gross = $('[data-cart-gross]');
      if (gross) gross.textContent = money(this.gross());
      const savedRow = $('[data-saved-row]');
      const saved = $('[data-cart-saved]');
      if (saved) saved.textContent = '− ' + money(this.saved());
      if (savedRow) savedRow.hidden = this.saved() <= 0;
      const nudge = $('[data-bundle-nudge]');
      if (nudge) {
        const n = this.hoodieQty();
        const next = n < 4 ? n + 1 : 0;
        nudge.textContent = next
          ? `Add ${next === 1 ? 'a hoodie' : 'one more hoodie'} — ${next} for ${money(HOODIE_TIERS[next])}`
          : 'Best bundle price applied';
      }
      if (!body) return;
      if (!this.items.length) {
        body.innerHTML = `<div class="drawer__empty"><p class="label">Your bag is empty</p>
          <p class="small" style="margin-top:10px">Nothing selected yet.</p>
          <a class="btn" style="margin-top:22px" href="shop.html">Browse the drop <i></i></a></div>`;
        return;
      }
      body.innerHTML = this.items.map((i, n) => `
        <div class="citem">
          <img src="${IMG(i.img)}" alt="${i.name}">
          <div>
            <div class="citem__top">
              <div>
                <p class="citem__name">${i.name}</p>
                <p class="card__meta">${i.colour || ''} · Size ${i.size}</p>
              </div>
              <span class="card__price">${money(i.price * i.qty)}</span>
            </div>
            <div class="citem__actions">
              <div class="qty">
                <button data-q="-1" data-i="${n}" aria-label="Decrease quantity">−</button>
                <span>${i.qty}</span>
                <button data-q="1" data-i="${n}" aria-label="Increase quantity">+</button>
              </div>
              <a class="citem__rm" data-rm="${n}" href="#">Remove</a>
            </div>
          </div>
        </div>`).join('');
      $$('[data-q]', body).forEach(b => b.addEventListener('click', () => this.bump(+b.dataset.i, +b.dataset.q)));
      $$('[data-rm]', body).forEach(b => b.addEventListener('click', e => { e.preventDefault(); this.remove(+b.dataset.rm); }));
    }
  };

  function openDrawer() { $('.drawer') && $('.drawer').classList.add('on'); $('.scrim') && $('.scrim').classList.add('on'); }
  function closeDrawer() { $('.drawer') && $('.drawer').classList.remove('on'); $('.scrim') && $('.scrim').classList.remove('on'); }

  let toastTimer;
  function toast(msg) {
    const t = $('.toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2400);
  }

  /* ---------- 10. PAGE WIRING ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    Cart.load(); Cart.paint();

    $$('[data-cart-open]').forEach(b => b.addEventListener('click', openDrawer));
    $$('[data-cart-close]').forEach(b => b.addEventListener('click', closeDrawer));
    $('.scrim') && $('.scrim').addEventListener('click', closeDrawer);
    addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

    $$('[data-year]').forEach(n => n.textContent = new Date().getFullYear());

    /* -- home / shop grids -- */
    const grid = $('[data-grid]');
    if (grid && typeof PRODUCTS !== 'undefined') {
      const limit = parseInt(grid.dataset.limit || '0', 10);
      renderGrid(grid, limit ? PRODUCTS.slice(0, limit) : PRODUCTS);

      const chips = $$('.chip');
      const sortSel = $('.sortsel');
      let cat = 'all';
      const apply = () => {
        let list = cat === 'all' ? PRODUCTS.slice() : PRODUCTS.filter(p => p.cat === cat);
        const s = sortSel ? sortSel.value : '';
        if (s === 'low') list.sort((a, b) => a.price - b.price);
        if (s === 'high') list.sort((a, b) => b.price - a.price);
        if (s === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
        renderGrid(grid, list);
        const c = $('[data-count]');
        if (c) c.textContent = String(list.length).padStart(2, '0') + ' pieces';
      };
      chips.forEach(ch => ch.addEventListener('click', () => {
        chips.forEach(x => x.classList.remove('on'));
        ch.classList.add('on');
        cat = ch.dataset.cat;
        apply();
      }));
      // nav deep-links (shop.html?cat=hoodies) land on that category
      const wanted = new URLSearchParams(location.search).get('cat');
      const preset = wanted && chips.find(c => c.dataset.cat === wanted);
      if (preset) {
        chips.forEach(x => x.classList.remove('on'));
        preset.classList.add('on');
        cat = wanted;
      }
      sortSel && sortSel.addEventListener('change', apply);
      if (chips.length) apply();
    }

    /* -- accordions -- */
    $$('.acc').forEach(acc => {
      const btn = $('.acc__btn', acc), panel = $('.acc__panel', acc);
      btn && btn.addEventListener('click', () => {
        const open = acc.classList.toggle('on');
        panel.style.maxHeight = open ? panel.scrollHeight + 'px' : 0;
      });
    });

    /* -- size picker -- */
    $$('.size').forEach(s => s.addEventListener('click', () => {
      if (s.classList.contains('off')) return;
      $$('.size').forEach(x => x.classList.remove('on'));
      s.classList.add('on');
    }));

    /* -- PDP -- */
    const pdp = $('[data-pdp]');
    if (pdp && typeof PRODUCTS !== 'undefined') {
      const id = new URLSearchParams(location.search).get('id');
      const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];
      const set = (sel, val) => { const n = $(sel); if (n) n.textContent = val; };
      set('[data-p-name]', p.name);
      set('[data-p-price]', moneyCAD(p.price));
      set('[data-p-colour]', p.colour);
      set('[data-p-note]', p.note);
      set('[data-p-cat]', p.cat.toUpperCase());
      const gal = $('[data-p-gallery]');
      if (gal) {
        /* every shot on white: three on-model views, then both flat renders.
           Four half-width and the last one wide, so the grid closes evenly. */
        const shots = [...(p.model || [p.a, p.b]),
                       ...(p.render || [])].filter((v, i, arr) => v && arr.indexOf(v) === i);
        gal.innerHTML = shots.map((s, i) =>
          `<figure${i === shots.length - 1 ? ' class="wide"' : ''}><img src="${IMG(s)}" alt="${p.name} in ${p.colour} — view ${i + 1}" loading="${i ? 'lazy' : 'eager'}"></figure>`
        ).join('');
      }
      const heroEl = $('[data-p-hero]');
      if (heroEl && p.hero) {
        heroEl.innerHTML =
          `<figure style="position:relative;overflow:hidden;aspect-ratio:16/9" data-reveal="zoom">
             <img src="${IMG(p.hero)}" alt="${p.heroAlt || ''}" style="width:100%;height:100%;object-fit:cover" loading="lazy">
             <figcaption class="label label--inv" style="position:absolute;left:var(--pad);bottom:22px;text-shadow:0 1px 14px rgba(0,0,0,.6)">${p.heroTag || ''}</figcaption>
           </figure>`;
        heroEl.hidden = false;
      }

      const addBtn = $('[data-p-add]');
      addBtn && addBtn.addEventListener('click', () => {
        const chosen = $('.size.on');
        if (!chosen) { toast('Select a size first'); return; }
        Cart.add(p, chosen.textContent.trim());
      });
      const rel = $('[data-related]');
      if (rel) renderGrid(rel, PRODUCTS.filter(x => x.id !== p.id).slice(0, 4));
      set('[data-p-print]', p.print);
      document.title = p.name + ' — ' + p.colour + ' — Screw Face Product';
    }

    /* -- newsletter -- */
    $$('form[data-join]').forEach(f => f.addEventListener('submit', e => {
      e.preventDefault();
      const ok = $('.form-ok', f);
      ok && ok.classList.add('on');
      f.reset();
      setTimeout(() => ok && ok.classList.remove('on'), 4000);
    }));

    /* -- video autoplay guard (mobile / low-power) -- */
    $$('video[autoplay]').forEach(v => {
      const play = v.play();
      if (play && play.catch) play.catch(() => {
        const poster = v.getAttribute('data-fallback');
        if (poster) {
          const img = new Image();
          img.src = poster; img.alt = '';
          img.style.cssText = 'width:100%;height:100%;object-fit:cover';
          v.replaceWith(img);
        }
      });
    });
  });
})();
