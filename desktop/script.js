const desktop = document.getElementById('desktop');
const modalLayer = document.getElementById('modalLayer');
const windows = modalLayer.querySelectorAll('.app-window');

// ---------- Clock ----------
const clockEl = document.getElementById('clock');
function updateClock() {
  const now = new Date();
  clockEl.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}
updateClock();
setInterval(updateClock, 10000);

// ---------- Notice card ----------
document.getElementById('noticeClose').addEventListener('click', (e) => {
  e.currentTarget.closest('.notice-card').style.display = 'none';
});

// ---------- Modal open/close ----------
function openWindow(id) {
  windows.forEach(w => w.hidden = (w.dataset.window !== id));
  desktop.classList.add('dimmed');
  modalLayer.classList.add('open');
}
function closeWindow() {
  modalLayer.classList.remove('open');
  desktop.classList.remove('dimmed');
  windows.forEach(w => w.hidden = true);
}

document.querySelectorAll('[data-open]').forEach(el => {
  el.addEventListener('click', (e) => {
    // ignore if this click was the tail end of a folder drag
    if (el.classList.contains('folder') && el.dataset.dragged === '1') {
      el.dataset.dragged = '0';
      return;
    }
    openWindow(el.dataset.open);
  });
});

modalLayer.addEventListener('click', (e) => {
  if (e.target === modalLayer) closeWindow();
});
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', closeWindow);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeWindow();
});

// ---------- Works filter (inside Finder window) ----------
const worksGrid = document.getElementById('worksGrid');
document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    worksGrid.querySelectorAll('.work-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
    });
  });
});

// ---------- Draggable folders ----------
const folders = document.querySelectorAll('.folder');
const DEFAULTS = {};
folders.forEach(f => {
  DEFAULTS[f.dataset.id] = { left: f.style.left, top: f.style.top };
});

function applyStoredPositions() {
  folders.forEach(f => {
    const saved = localStorage.getItem('dapi-folder-' + f.dataset.id);
    if (saved) {
      const { left, top } = JSON.parse(saved);
      f.style.left = left;
      f.style.top = top;
    }
  });
}
applyStoredPositions();

folders.forEach(folder => {
  let startX, startY, origLeft, origTop, moved = false;

  folder.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const rect = desktop.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    origLeft = folder.offsetLeft;
    origTop = folder.offsetTop;
    moved = false;
    folder.setPointerCapture(e.pointerId);

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      let newLeft = origLeft + dx;
      let newTop = origTop + dy;
      newLeft = Math.max(0, Math.min(rect.width - folder.offsetWidth, newLeft));
      newTop = Math.max(50, Math.min(rect.height - 90, newTop));
      folder.style.left = newLeft + 'px';
      folder.style.top = newTop + 'px';
      folder.classList.add('dragging');
    }
    function onUp(ev) {
      folder.releasePointerCapture(e.pointerId);
      folder.removeEventListener('pointermove', onMove);
      folder.removeEventListener('pointerup', onUp);
      folder.classList.remove('dragging');
      if (moved) {
        folder.dataset.dragged = '1';
        localStorage.setItem('dapi-folder-' + folder.dataset.id, JSON.stringify({
          left: folder.style.left, top: folder.style.top
        }));
      }
    }
    folder.addEventListener('pointermove', onMove);
    folder.addEventListener('pointerup', onUp);
  });
});

function shuffleFolders() {
  const rect = desktop.getBoundingClientRect();
  folders.forEach(f => {
    const left = 10 + Math.random() * 70;
    const top = 30 + Math.random() * 45;
    f.style.left = left + '%';
    f.style.top = top + '%';
    localStorage.setItem('dapi-folder-' + f.dataset.id, JSON.stringify({ left: f.style.left, top: f.style.top }));
  });
}
function restoreFolders() {
  folders.forEach(f => {
    localStorage.removeItem('dapi-folder-' + f.dataset.id);
    f.style.left = DEFAULTS[f.dataset.id].left;
    f.style.top = DEFAULTS[f.dataset.id].top;
  });
}

// ---------- Context menu ----------
const contextMenu = document.getElementById('contextMenu');
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const x = Math.min(e.clientX, window.innerWidth - 240);
  const y = Math.min(e.clientY, window.innerHeight - 320);
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.classList.add('open');
});
document.addEventListener('click', (e) => {
  if (!contextMenu.contains(e.target)) contextMenu.classList.remove('open');
});

contextMenu.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  switch (action) {
    case 'open-works': openWindow('works'); break;
    case 'contact': openWindow('contacts'); break;
    case 'vibe': alert('Вайб проверен: 100%. Дедлайн — вчера, но вайб на месте.'); break;
    case 'reload': location.reload(); break;
    case 'delete-bugs': alert('Баги удалены (появятся новые в следующем коммите).'); break;
    case 'lights': desktop.classList.toggle('lights-off'); break;
    case 'shuffle': shuffleFolders(); break;
    case 'restore': restoreFolders(); break;
    case 'devmode': console.log('%cDAPI OS v1.0 — собрано на кофе, дедлайнах и вере в AI.', 'color:#8bc34a;font-family:monospace;font-size:12px;'); break;
  }
});
