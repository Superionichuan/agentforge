/* AgentForge site interactions (design v2): header on scroll, reveal on scroll, hero entrance and
   parallax, counting numbers, the mini_agent terminal replay, wires between the three columns,
   and the ground-state lattice. No libraries. Everything is optional: without JavaScript, or with
   reduced motion, the page shows its final state. */
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const seen = (el, cb, opts) => {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const o = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { o.disconnect(); cb(); } }, opts);
    o.observe(el);
  };

  /* header gets a line once the page scrolls */
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* reveal on scroll */
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (reduce) { el.classList.add('is-in'); return; }
    seen(el, () => el.classList.add('is-in'), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  });

  /* hero: tiles fade in, then follow the pointer a little (depth in px) */
  const hero = document.querySelector('.hero-x');
  if (hero) {
    requestAnimationFrame(() => setTimeout(() => hero.classList.add('is-ready'), 80));
    const layers = [...hero.querySelectorAll('[data-depth]')];
    if (!reduce && layers.length && window.matchMedia('(pointer: fine)').matches) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const step = () => {
        cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
        for (const l of layers) {
          const d = +l.dataset.depth;
          l.style.transform = `translate3d(${(-cx * d).toFixed(2)}px, ${(-cy * d).toFixed(2)}px, 0)`;
        }
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.0005 ? requestAnimationFrame(step) : 0;
      };
      hero.addEventListener('pointermove', (ev) => {
        const r = hero.getBoundingClientRect();
        tx = (ev.clientX - r.left) / r.width - 0.5;
        ty = (ev.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(step);
      });
      hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(step); });
    }
  }

  /* numbers count up once */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    seen(el, () => {
      const t0 = performance.now(), dur = 1200;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
  });

  /* mini_agent terminal: types the command, then prints the recorded output line by line */
  const term = document.querySelector('[data-term]');
  if (term && !reduce) {
    const lines = [...term.querySelectorAll('.ln')];
    const cmd = term.querySelector('.ln .c');
    const full = cmd ? cmd.textContent : '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    let playing = false;
    const play = async () => {
      if (playing || !cmd) return;
      playing = true;
      lines.forEach((l, i) => { l.hidden = i > 0; });
      cmd.textContent = '';
      cmd.after(cursor);
      for (let i = 1; i <= full.length; i++) { cmd.textContent = full.slice(0, i); await wait(24 + Math.random() * 46); }
      await wait(420);
      for (let i = 1; i < lines.length; i++) {
        lines[i].hidden = false;
        lines[i].appendChild(cursor);
        await wait(+(lines[i].dataset.wait || 150));
      }
      playing = false;
    };
    lines.forEach((l, i) => { l.hidden = i > 0; });
    if (cmd) cmd.textContent = '';
    seen(term, play, { threshold: 0.45 });
    const again = term.querySelector('.replay');
    if (again) again.addEventListener('click', play);
  }

  /* wires: from each problem to a plate of the platform, and from the plate to each answer */
  const stack = document.querySelector('.stack');
  if (stack) {
    const svg = stack.querySelector('.wires');
    const img = stack.querySelector('.platform img');
    // left and right corners of the three plates, as fractions of the illustration
    const plates = [[0.26, 0.31, 0.74, 0.31], [0.25, 0.505, 0.75, 0.50], [0.245, 0.645, 0.757, 0.64]];
    const draw = () => {
      if (!svg || !img || getComputedStyle(svg).display === 'none' || !img.complete) return;
      const R = stack.getBoundingClientRect(), I = img.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${R.width.toFixed(1)} ${R.height.toFixed(1)}`);
      const P = [...stack.querySelectorAll('.problems li')].map((li) => li.getBoundingClientRect());
      const A = [...stack.querySelectorAll('.answers li')].map((li) => li.getBoundingClientRect());
      const px = (f) => I.left - R.left + f * I.width, py = (f) => I.top - R.top + f * I.height;
      const curve = (x0, y0, x1, y1) => { const m = (x0 + x1) / 2; return `M${x0.toFixed(1)},${y0.toFixed(1)} C${m.toFixed(1)},${y0.toFixed(1)} ${m.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)} `; };
      let d = '';
      P.forEach((p, k) => { const pl = plates[Math.min(k, 2)]; d += curve(p.right - R.left + 12, p.top - R.top + p.height / 2, px(pl[0]), py(pl[1])); });
      A.forEach((a, k) => { const pl = plates[Math.min(k, 2)]; d += curve(px(pl[2]), py(pl[3]), a.left - R.left - 14, a.top - R.top + 22); });
      svg.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
    };
    if (img) img.addEventListener('load', draw);
    window.addEventListener('resize', draw);
    window.addEventListener('load', draw);
    draw();
  }

  /* ground state: atoms jiggle when hot, then relax into a triangular lattice and bond; repeat */
  const cv = document.getElementById('ground');
  if (cv && cv.getContext) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, atoms = [], bonds = [], s = 30, raf = 0, onScreen = false, t0 = performance.now();
    const setup = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = W < 700 ? 22 : 30;
      atoms = [];
      const rows = Math.ceil(H / (s * 0.866)) + 1, cols = Math.ceil(W / s) + 1;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * s + (j % 2 ? s / 2 : 0), y = j * s * 0.866 + s * 0.4;
          const nx = (x - W / 2) / (W * 0.5), ny = (y - H / 2) / (H * 0.56);
          const e = nx * nx + ny * ny;
          if (e > 1) continue;
          atoms.push({ tx: x, ty: y, x: x + (Math.random() - 0.5) * s * 5, y: y + (Math.random() - 0.5) * s * 5, vx: 0, vy: 0, e, hot: Math.random() < 0.06 });
        }
      }
      bonds = [];
      for (let a = 0; a < atoms.length; a++) {
        for (let b = a + 1; b < atoms.length; b++) {
          const dx = atoms[a].tx - atoms[b].tx, dy = atoms[a].ty - atoms[b].ty;
          if (dx * dx + dy * dy < s * s * 1.08) bonds.push(a, b);
        }
      }
    };
    const temperature = (t) => {  // a 16 s cycle: hot, cooling, ground state, reheating
      const c = (t / 1000) % 16;
      if (c < 2.5) return 1;
      if (c < 9) { const p = (c - 2.5) / 6.5; return 1 - p * p * (3 - 2 * p); }
      if (c < 13.5) return 0;
      const p = (c - 13.5) / 2.5; return p * p;
    };
    const frame = (now) => {
      const T = reduce ? 0 : temperature(now - t0);
      const k = 0.004 + 0.07 * (1 - T) * (1 - T), noise = 1.5 * T;
      ctx.clearRect(0, 0, W, H);
      for (const a of atoms) {
        if (reduce) { a.x = a.tx; a.y = a.ty; continue; }
        a.vx = (a.vx + k * (a.tx - a.x) + (Math.random() - 0.5) * noise) * 0.86;
        a.vy = (a.vy + k * (a.ty - a.y) + (Math.random() - 0.5) * noise) * 0.86;
        a.x += a.vx; a.y += a.vy;
      }
      const order = Math.pow(1 - T, 3);
      if (order > 0.02) {
        ctx.lineWidth = 1;
        for (let i = 0; i < bonds.length; i += 2) {
          const a = atoms[bonds[i]], b = atoms[bonds[i + 1]];
          const dx = a.x - b.x, dy = a.y - b.y;
          if (dx * dx + dy * dy > s * s * 1.7) continue;
          const fade = 1 - Math.max(a.e, b.e);
          ctx.strokeStyle = `rgba(47, 91, 234, ${(0.32 * order * fade).toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      for (const a of atoms) {
        const fade = 1 - a.e * a.e;
        ctx.fillStyle = a.hot ? `rgba(242, 140, 40, ${(0.95 * fade).toFixed(3)})` : `rgba(11, 26, 74, ${(0.78 * fade).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.hot ? 2.9 : 2.2, 0, Math.PI * 2); ctx.fill();
      }
      raf = !reduce && onScreen && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    setup();
    if (reduce) { frame(performance.now()); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; if (onScreen) start(); }).observe(cv);
      document.addEventListener('visibilitychange', () => { if (!document.hidden && onScreen) start(); });
    } else { onScreen = true; start(); }
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { setup(); if (reduce) frame(performance.now()); }, 200); });
  }
})();
