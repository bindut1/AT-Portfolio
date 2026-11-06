/*
 * Motion & navigation for the portfolio.
 * Everything is progressive enhancement: without JS (no .js class) all
 * content is visible and the page still works as a plain long scroll.
 */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 1100px)');
  const hasIO = 'IntersectionObserver' in window;

  /* ---------- Cover titles: split into animated letters ---------- */

  document.querySelectorAll('[data-split]').forEach((title) => {
    const text = title.textContent.trim();
    if (!title.hasAttribute('aria-label')) title.setAttribute('aria-label', text);
    title.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--i', i);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch === ' ' ? ' ' : ch;
      title.appendChild(span);
    });
  });

  const covers = [...document.querySelectorAll('.cover')];
  const playCover = (cover) => {
    cover.classList.add('is-in');
    cover.querySelector('[data-split]')?.classList.add('is-in');
  };

  // Start once fonts are ready so letters don't jump.
  const start = () => {
    root.classList.add('is-loaded');
    playCover(covers[0]);
  };
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(start);
  } else {
    start();
  }

  /* ---------- Scroll reveal ---------- */

  const revealGroups = [
    ['.circle', 'circle'],
    ['.fig__img', 'photo'],
    ['.deco-plane', 'fly'],
    ['.title, .block__title, .contact__title', 'mask'],
    ['.hello__role, .hello__meta, .text, .project__heading, .links li, .job, .block__strong, .block__sub, .contact__card, .contact__list li', 'up'],
    ['.pills li, .tools li', 'pop'],
  ];

  const revealTargets = [];
  revealGroups.forEach(([selector, type]) => {
    document.querySelectorAll(`.section:not(.cover) :is(${selector})`).forEach((el) => {
      el.dataset.reveal = type;
      revealTargets.push(el);
    });
  });

  // Stagger items inside the same section in document order.
  document.querySelectorAll('.section').forEach((section) => {
    [...section.querySelectorAll('[data-reveal]')].forEach((el, i) => {
      el.style.setProperty('--d', `${Math.min(i * 70, 900)}ms`);
    });
  });

  if (hasIO && !reduceMotion.matches) {
    // Elements inside a clipped figure may have no visible area, so every
    // reveal is triggered by its section entering the viewport.
    const sectionIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
          if (entry.target.classList.contains('cover')) playCover(entry.target);
          sectionIo.unobserve(entry.target);
        });
      },
      { threshold: mobileQuery.matches ? 0.08 : 0.22 }
    );
    document.querySelectorAll('.section').forEach((s) => sectionIo.observe(s));

    // On mobile sections are tall, so long lists reveal item by item.
    if (mobileQuery.matches) {
      const itemIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.style.setProperty('--d', '0ms');
            entry.target.classList.add('is-visible');
            itemIo.unobserve(entry.target);
          });
        },
        { threshold: 0.1 }
      );
      revealTargets.filter((el) => el.dataset.reveal === 'up').forEach((el) => itemIo.observe(el));
    }
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
    covers.forEach(playCover);
  }

  /* ---------- Navigation ---------- */

  const nav = document.querySelector('[data-site-nav]');
  const menu = document.querySelector('[data-mobile-menu]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const navLinks = [...document.querySelectorAll('[data-nav-link]')];
  const progress = document.querySelector('.scroll-progress span');
  const toTop = document.querySelector('[data-to-top]');

  const setMenu = (open) => {
    if (open) nav.classList.remove('is-hidden');
    root.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    menu.setAttribute('aria-hidden', String(!open));
  };

  toggle.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
  window.matchMedia('(max-width: 1100px)').addEventListener('change', () => setMenu(false));

  // Smooth-scroll every in-page link and close the mobile menu.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });

  // Highlight the nav item of the section in the middle of the viewport.
  const setActive = (id) => {
    navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.navLink === id));
  };

  if (hasIO) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.dataset.navSection);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    document.querySelectorAll('[data-nav-section]').forEach((s) => sectionObserver.observe(s));
  }

  /* ---------- Scroll-driven effects (one rAF loop) ---------- */

  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;

    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    // Hide the nav while scrolling down, reveal it when scrolling up.
    if (!root.classList.contains('menu-open')) {
      if (y < 120 || y < lastY - 4) nav.classList.remove('is-hidden');
      else if (y > lastY + 4) nav.classList.add('is-hidden');
    }
    nav.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > vh * 0.9);
    lastY = y;

    if (!reduceMotion.matches && !mobileQuery.matches) {
      parallaxEls.forEach((img) => {
        const rect = img.closest('.section').getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const p = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        img.style.translate = `0 ${(p * parseFloat(img.dataset.parallax) * img.offsetHeight).toFixed(1)}px`;
      });
    }

    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', onScroll);
  mobileQuery.addEventListener('change', () => parallaxEls.forEach((img) => (img.style.translate = '')));
  onScroll();
})();
