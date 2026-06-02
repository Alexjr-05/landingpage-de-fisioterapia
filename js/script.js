/* =============================================
   DRA. DÉBORA ALVES — LANDING PAGE JS
   Fisioterapia Pós-Parto Imediato — Método FPPI
   ============================================= */

'use strict';

/* === HEADER: scroll effect + active link === */
(function initHeader() {
  const header    = document.getElementById('header');
  const links     = document.querySelectorAll('.header__link');
  const sections  = document.querySelectorAll('section[id]');
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('mainNav');

  function onScroll() {
    /* Sticky + blur */
    header.classList.toggle('scrolled', window.scrollY > 60);

    /* Back-to-top */
    const btn = document.getElementById('backToTop');
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);

    /* Active nav link */
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });

    links.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger */
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close nav on link click */
  links.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
})();

/* === SMOOTH SCROLL for anchor links === */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* === SCROLL REVEAL === */
(function initReveal() {
  const revealEls = document.querySelectorAll('[data-reveal], [data-reveal-right]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* Stagger siblings */
        const siblings = entry.target.parentElement.querySelectorAll('[data-reveal], [data-reveal-right]');
        let delay = 0;
        siblings.forEach((el, i) => {
          if (el === entry.target) {
            delay = i * 80;
          }
        });
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

/* === GALERIA LIGHTBOX === */
(function initLightbox() {
  const items      = document.querySelectorAll('.galeria__item[data-lightbox]');
  const lightbox   = document.getElementById('lightbox');
  const img        = document.getElementById('lightboxImg');
  const closeBtn   = document.getElementById('lightboxClose');
  const prevBtn    = document.getElementById('lightboxPrev');
  const nextBtn    = document.getElementById('lightboxNext');

  if (!lightbox) return;

  const images = [];
  items.forEach(item => {
    const src = item.querySelector('img').src;
    const alt = item.querySelector('img').alt;
    images.push({ src, alt });
  });

  let current = 0;

  function open(index) {
    current = index;
    img.src = images[current].src;
    img.alt = images[current].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { img.src = ''; }, 300);
  }

  function navigate(dir) {
    current = (current + dir + images.length) % images.length;
    img.style.animation = 'none';
    img.offsetHeight; /* reflow */
    img.style.animation = '';
    img.src = images[current].src;
    img.alt = images[current].alt;
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   navigate(-1);
    if (e.key === 'ArrowRight')  navigate(1);
  });
})();

/* === DEPOIMENTOS CAROUSEL === */
(function initCarousel() {
  const track    = document.getElementById('depoimentosTrack');
  const prevBtn  = document.getElementById('depPrev');
  const nextBtn  = document.getElementById('depNext');
  const dotsWrap = document.getElementById('depDots');

  if (!track) return;

  const cards = track.querySelectorAll('.depoimento__card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  /* Determine visible cards based on viewport */
  function visibleCount() {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, total - visibleCount());
  }

  /* Build dots */
  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'dep-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.dep-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardWidth = cards[0].offsetWidth + 24; /* card + gap */
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  }

  function next() { goTo(current < maxIndex() ? current + 1 : 0); }
  function prev() { goTo(current > 0 ? current - 1 : maxIndex()); }

  function startAuto() {
    autoTimer = setInterval(next, 4500);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  /* Touch swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    startAuto();
  }, { passive: true });

  /* Recalculate on resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(0);
    }, 200);
  });

  buildDots();
  startAuto();
})();

/* === BACK TO TOP === */
document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* === LUCIDE ICONS — ensure re-init after dynamic content === */
if (window.lucide) {
  document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
  });
}
