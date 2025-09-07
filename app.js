// Elements
const sidebar   = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const overlay   = document.getElementById('overlay');
const nav       = document.querySelector('.nav');
const activeIndicator = document.querySelector('.active-indicator');


const STORAGE_KEY = 'nebula.sidebar.state';
const ACTIVE_KEY  = 'nebula.sidebar.activeIndex';


(function restoreState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (saved && !isMobile) {
    sidebar.dataset.state = saved; // 'expanded' | 'collapsed'
    toggleBtn.setAttribute('aria-expanded', saved !== 'collapsed');
  }

  const idx = +localStorage.getItem(ACTIVE_KEY);
  const links = [...document.querySelectorAll('.nav__link')];
  if (!Number.isNaN(idx) && links[idx]) {
    links.forEach(l => l.classList.remove('is-active'));
    links[idx].classList.add('is-active');
    moveActiveIndicator(links[idx]);
  } else {
    const current = document.querySelector('.nav__link.is-active');
    if (current) moveActiveIndicator(current);
  }
})();


function toggleSidebar() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile) {
    const open = sidebar.classList.toggle('open');
    overlay.classList.toggle('show', open);
    overlay.setAttribute('aria-hidden', !open);
  } else {
    const collapsed = sidebar.dataset.state === 'collapsed';
    sidebar.dataset.state = collapsed ? 'expanded' : 'collapsed';
    toggleBtn.setAttribute('aria-expanded', collapsed);
    localStorage.setItem(STORAGE_KEY, sidebar.dataset.state);
  }
}

toggleBtn.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar.classList.contains('open')) toggleSidebar();
});


document.querySelectorAll('[data-accordion]').forEach(btn => {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', () => toggleAccordion(btn, panel));
  
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAccordion(btn, panel); }
  });
});

function toggleAccordion(button, panel) {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));

  if (!expanded) {
    panel.hidden = false;
    const h = panel.scrollHeight;
    panel.style.height = '0px';
    requestAnimationFrame(() => {
      panel.style.height = h + 'px';
    });
    panel.addEventListener('transitionend', () => {
      panel.style.height = '';
    }, { once: true });
  } else {
    const h = panel.scrollHeight;
    panel.style.height = h + 'px';
    requestAnimationFrame(() => {
      panel.style.height = '0px';
    });
    panel.addEventListener('transitionend', () => {
      panel.hidden = true;
      panel.style.height = '';
    }, { once: true });
  }
}


const linkSelector = '.nav__link, .submenu__link';
document.querySelectorAll(linkSelector).forEach((link, index) => {
  link.addEventListener('click', (e) => {
    // Set active (only for top-level links)
    if (link.classList.contains('nav__link')) {
      document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');
      localStorage.setItem(ACTIVE_KEY, [...document.querySelectorAll('.nav__link')].indexOf(link));
      moveActiveIndicator(link);
    }
    // Ripple
    spawnRipple(e, link);
  });
});


function moveActiveIndicator(activeLink) {
  const rect = activeLink.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();
  const top = rect.top - navRect.top + (rect.height - 36) / 2; 
  activeIndicator.style.top = `${top}px`;
  activeIndicator.style.opacity = '1';
}


window.addEventListener('resize', () => {
  const current = document.querySelector('.nav__link.is-active');
  if (current) moveActiveIndicator(current);

  
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    sidebar.dataset.state = 'expanded';
    localStorage.setItem(STORAGE_KEY, 'expanded');
  } else {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
  }
});


function spawnRipple(e, target) {
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.left = `${x}px`;
  span.style.top = `${y}px`;

  target.appendChild(span);
  span.addEventListener('animationend', () => span.remove());
}


const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  .ripple {
    position: absolute;
    width: 10px; height: 10px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle, rgba(107,138,255,0.35) 0%, rgba(107,138,255,0.0) 60%);
    left: 0; top: 0; transform: translate(-50%, -50%);
    animation: ripple .6s ease-out forwards;
  }
`;
document.head.appendChild(rippleStyle);
