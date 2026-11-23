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
  const term = document.querySelector('.term-replay');
  if (!term) return;
  const lines = Array.from(term.querySelectorAll('.ln'));
  const btn = document.getElementById('replay-btn');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    if (btn) btn.hidden = true;
    return;
  }
  let timers = [];
  function play() {
    timers.forEach(clearTimeout); timers = [];
    lines.forEach(l => l.classList.remove('on'));
    let t = 250;
    lines.forEach(l => { timers.push(setTimeout(() => l.classList.add('on'), t)); t += +(l.dataset.pause || 250); });
  }
  term.classList.add('armed');
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { play(); io.disconnect(); } }, { threshold: 0.35 });
  io.observe(term);
  if (btn) btn.addEventListener('click', play);
})();
