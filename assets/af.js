const toggle = document.getElementById('theme-toggle');
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark';

    if (toggle && isDark) {
      document.body.setAttribute('data-theme', 'dark');
      toggle.textContent = '☾';
    }

    if (toggle) toggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme');
      if (current === 'dark') {
        document.body.removeAttribute('data-theme');
        toggle.textContent = '☀';
        localStorage.setItem('theme', 'light');
      } else {
        document.body.setAttribute('data-theme', 'dark');
        toggle.textContent = '☾';
        localStorage.setItem('theme', 'dark');
      }
    });
    const menuBtn = document.getElementById('menu-toggle');
    const menu = document.getElementById('site-menu');
    function setMenu(open) {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? '✕' : '☰';
    }
    if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });
    document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && e.target !== menuBtn) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
    }
  
(function () {
  // mini_agent recordings: real terminal sessions (asciicast files) played by asciinema-player.
  const card = document.querySelector('.demo-card');
  if (!card || !window.AsciinemaPlayer) return;
  const tabs = Array.from(card.querySelectorAll('[role="tab"]'));
  const screen = card.querySelector('.demo-screen');
  const title = card.querySelector('.demo-title'), text = card.querySelector('.demo-text'), cmd = card.querySelector('.demo-cmd');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let player = null, current = 0, auto = !reduce, timer = null;
  function show(i, play) {
    clearTimeout(timer);
    if (player) { try { player.dispose(); } catch (e) {} player = null; }
    screen.textContent = '';
    current = i;
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    const t = tabs[i];
    title.textContent = t.dataset.title; text.textContent = t.dataset.text; cmd.textContent = t.dataset.cmd;
    screen.setAttribute('aria-label', t.dataset.label);
    player = AsciinemaPlayer.create(t.dataset.cast, screen, {
      autoPlay: play, loop: false, fit: 'width', theme: 'af', idleTimeLimit: 2, controls: true,
      poster: 'npt:' + t.dataset.end });
    player.addEventListener('ended', () => {
      if (auto) timer = setTimeout(() => { if (auto) show((current + 1) % tabs.length, true); }, 3000);
    });
  }
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => { auto = false; show(k, true); });
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = (current + d + tabs.length) % tabs.length;
      tabs[n].focus(); auto = false; show(n, true);
    });
  });
  show(0, false);
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => {
    if (es.some(e => e.isIntersecting)) { io.disconnect(); if (auto && current === 0) show(0, true); }
  }, { threshold: 0.4 });
  io.observe(card);
})();
