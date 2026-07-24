// Boot screen
const bootScreen = document.getElementById('bootScreen');
if (bootScreen) {
  window.addEventListener('load', () => {
    setTimeout(() => bootScreen.classList.add('hidden'), 1700);
  });
  bootScreen.addEventListener('click', () => bootScreen.classList.add('hidden'));
}

// Menubar clock
const clockEl = document.getElementById('clock');
function updateClock() {
  if (!clockEl) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  clockEl.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 1000 * 10);

// Works filter
const filterButtons = document.querySelectorAll('.filter');
const workCards = document.querySelectorAll('.work-card');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    workCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

// Active nav link on scroll
const navLinks = document.querySelectorAll('.menubar-nav a[href^="#"]');
const sections = Array.from(navLinks)
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);
if (sections.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(s => observer.observe(s));
}

// Custom right-click context menu
const contextMenu = document.getElementById('contextMenu');
if (contextMenu) {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
    contextMenu.classList.add('open');
  });
  document.addEventListener('click', () => contextMenu.classList.remove('open'));

  contextMenu.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (!action) return;
    if (action === 'reload') location.reload();
    if (action === 'team') location.href = 'team.html';
    if (action === 'about-os') alert('DAPI OS v1.0 — собрано на кофе, дедлайнах и вере в AI.');
  });
}
