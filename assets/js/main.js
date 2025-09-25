// Main shared JS for Flip Inventory landing site
// Handles: mobile nav, theme toggle, reveal animations, smooth scroll, pricing toggle

(function () {
  const docEl = document.documentElement;

  function getStoredTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (_) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch (_) {}
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      docEl.classList.add('dark');
    } else {
      docEl.classList.remove('dark');
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    if (stored) {
      applyTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  function initNav() {
    const toggle = document.querySelector('[data-mobile-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;

    function closeMenu() {
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      const isHidden = menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(!isHidden));
    });

    menu.addEventListener('click', function (e) {
      const target = e.target;
      if (target && target.matches('a')) {
        closeMenu();
      }
    });

    // Close dropdowns when clicking outside (desktop)
    document.addEventListener('click', function (e) {
      const blogGroup = document.querySelector('.group');
      if (!blogGroup) return;
      const dropdown = blogGroup.querySelector('.group-hover\\:block');
      // relies on CSS hover; no JS toggle needed beyond outside click for mobile
    });
  }

  function initThemeToggle() {
    const buttons = document.querySelectorAll('[data-theme-toggle]');
    if (!buttons.length) return;

    function updateIcons() {
      const isDark = docEl.classList.contains('dark');
      buttons.forEach((b) => {
        const sun = b.querySelector('[data-icon="sun"]');
        const moon = b.querySelector('[data-icon="moon"]');
        if (sun && moon) {
          if (isDark) {
            sun.classList.remove('hidden');
            moon.classList.add('hidden');
          } else {
            sun.classList.add('hidden');
            moon.classList.remove('hidden');
          }
        }
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', function () {
        const isDark = docEl.classList.toggle('dark');
        storeTheme(isDark ? 'dark' : 'light');
        updateIcons();
      });
    });

    updateIcons();
  }

  function injectThemeToggleFab() {
    if (document.querySelector('[data-theme-toggle-fab]')) return;
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.setAttribute('data-theme-toggle', '');
    btn.setAttribute('data-theme-toggle-fab', '');
    btn.className = 'fixed z-50 top-3 left-3 p-2 rounded-full border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/70 shadow backdrop-blur text-slate-700 dark:text-slate-200';
    btn.innerHTML = `
      <svg data-icon="sun" class="h-4 w-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <svg data-icon="moon" class="h-4 w-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    `;
    document.body.appendChild(btn);
  }

  function initRevealAnimations() {
    const elements = document.querySelectorAll('[data-animate]');
    if (!elements.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    elements.forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-6', 'transition', 'duration-700', 'ease-out');
      observer.observe(el);
    });
  }

  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('a[href^="#"]')) {
        const link = target.closest('a[href^="#"]');
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  function initPricingToggle() {
    const toggle = document.getElementById('billingToggle');
    if (!toggle) return;

    function applyBillingMode() {
      const yearly = !!toggle.checked;
      document.querySelectorAll('[data-monthly]').forEach((el) => {
        el.classList.toggle('hidden', yearly);
      });
      document.querySelectorAll('[data-annual]').forEach((el) => {
        el.classList.toggle('hidden', !yearly);
      });
    }

    // Bind to multiple events for reliability across browsers
    ['change', 'input', 'click'].forEach((evt) => {
      toggle.addEventListener(evt, applyBillingMode);
    });

    // If the input is wrapped by a label, also bind the label
    const label = toggle.closest('label');
    if (label) {
      label.addEventListener('click', function () {
        // let the native toggle happen first
        setTimeout(applyBillingMode, 0);
      });
    }

    // Initialize state on load
    applyBillingMode();
  }

  // Auto-hide header on scroll (mobile-friendly)
  function initAutoHideHeader() {
    const header = document.querySelector('header[data-autohide]');
    if (!header) return;
    let lastY = window.pageYOffset || document.documentElement.scrollTop;
    function onScroll() {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      // Hide when scrolling down, show when scrolling up
      if (y > lastY && y > 56) {
        header.classList.add('-translate-y-full');
      } else {
        header.classList.remove('-translate-y-full');
      }
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function bumpBaseFontSize() {
    try {
      // Slightly increase root font size from default 16px → 17px
      // This scales all Tailwind rem-based typography consistently
      document.documentElement.style.fontSize = '17px';
    } catch (_) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Follow user's system/browser theme by default
    initTheme();
    initNav();
    // No manual theme switch button; do not inject FAB
    initRevealAnimations();
    initSmoothScroll();
    initPricingToggle();
    initAutoHideHeader();
    bumpBaseFontSize();
  });
})();


