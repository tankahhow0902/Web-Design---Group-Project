/* about shop*/
(function() {
  const autoImgs = [
    "img/store_front.png",
    "img/inside_store.png"
  ];
  const AUTO_INTERVAL = 4000;
  const FADE_DURATION = 400;

  const shopImg = document.getElementById("shopAutoImg");
  if (!shopImg) return;

  autoImgs.forEach(src => { const i = new Image(); i.src = src; });

  let idx = 0;
  setInterval(() => {
    shopImg.classList.add("fade-out");
    setTimeout(() => {
      idx = (idx + 1) % autoImgs.length;
      shopImg.src = autoImgs[idx];
      shopImg.classList.remove("fade-out");
    }, FADE_DURATION);
  }, AUTO_INTERVAL);
})();

/* about designer*/
(function() {
  const carousel = document.querySelector('.carousel');
  const track = document.querySelector('.carousel-track');
  if (!carousel || !track) return;

  const originalSlides = Array.from(track.children);
  const slideCount = originalSlides.length;
  if (slideCount === 0) return;

  const trackStyle = getComputedStyle(track);
  const gap = parseFloat(trackStyle.gap) || parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slide-gap')) || 40;

  const originalTransition = track.style.transition || getComputedStyle(track).transition || 'transform 600ms cubic-bezier(.22,.9,.32,1)';

  const leftClones = originalSlides.map(n => n.cloneNode(true));
  const rightClones = originalSlides.map(n => n.cloneNode(true));
  leftClones.forEach(c => c.classList.add('clone'));
  rightClones.forEach(c => c.classList.add('clone'));
  leftClones.reverse().forEach(c => track.insertBefore(c, track.firstChild));
  rightClones.forEach(c => track.appendChild(c));

  const slidesAll = Array.from(track.children);
  let index = slideCount;
  let isTransitioning = false;

  let x = 0;
  let counterInterval = null;
  const COUNTER_INTERVAL_MS = 10;
  const COUNTER_THRESHOLD = 300;

  function startCounter() {
    stopCounter();
    x = 0;
    counterInterval = setInterval(() => {
      x++;
      if (x > COUNTER_THRESHOLD) {
        x = 0;
        if (!isTransitioning) next();
      }
    }, COUNTER_INTERVAL_MS);
  }
  function stopCounter() {
    if (counterInterval) { clearInterval(counterInterval); counterInterval = null; }
  }

  function computeTranslatePx(forIndex) {
    const slideEl = slidesAll[forIndex];
    const slideRect = slideEl.getBoundingClientRect();
    const slideWidth = slideRect.width;
    const containerWidth = carousel.getBoundingClientRect().width;
    const centerOffset = (containerWidth - slideWidth) / 2;
    const step = slideWidth + gap;
    return -forIndex * step + centerOffset;
  }

  function setTranslate(forIndex, instant = false) {
    const translateX = computeTranslatePx(forIndex);
    if (instant) {
      track.style.transition = 'none';
      track.style.transform = `translateX(${translateX}px)`;
      void track.offsetWidth;
      track.style.transition = originalTransition;
    } else {
      track.style.transform = `translateX(${translateX}px)`;
    }
    slidesAll.forEach((s, i) => s.classList.toggle('active', i === forIndex));
    updateDotsForIndex(forIndex);
  }

  function initPosition() { setTranslate(index, true); }

  function next() {
    if (isTransitioning) return;
    isTransitioning = true;
    index++;
    setTranslate(index, false);
    x = 0;
  }
  function prev() {
    if (isTransitioning) return;
    isTransitioning = true;
    index--;
    setTranslate(index, false);
    x = 0;
  }

  track.addEventListener('transitionend', () => {
    isTransitioning = false;

    const leftEdge = slideCount;
    const rightEdge = slideCount + slideCount - 1;

    if (index < leftEdge) {
      index = index + slideCount;
      setTranslate(index, true);
    } else if (index > rightEdge) {
      index = index - slideCount;
      setTranslate(index, true);
    }

    x = 0;
    updateDotsForIndex(index);
  });

  // dots
  const dotsNodeList = document.querySelectorAll('.dots-container .dot');
  const dots = Array.from(dotsNodeList);
  dots.forEach((d, i) => {
    d.dataset.index = i;
    d.addEventListener('click', () => {
      if (isTransitioning) return;
      index = slideCount + i;
      setTranslate(index, false);
      isTransitioning = true;
      x = 0;
    });
  });

  const prevBtn = document.getElementById('prevBtn') || document.querySelector('.click-zone.left');
  const nextBtn = document.getElementById('nextBtn') || document.querySelector('.click-zone.right');
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); x = 0; });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); x = 0; });

  // Pause when mouse enters, resume on leave (desktop)
  carousel.addEventListener('mouseenter', () => stopCounter());
  carousel.addEventListener('mouseleave', () => startCounter());

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); x = 0; }
    if (e.key === 'ArrowRight') { next(); x = 0; }
  });

  function updateDotsForIndex(currentAllIndex) {
    if (!dots.length) return;
    let realIndex = (currentAllIndex - slideCount) % slideCount;
    if (realIndex < 0) realIndex += slideCount;
    dots.forEach((d, i) => d.classList.toggle('active', i === realIndex));
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => initPosition(), 120);
  });

  (function waitForImagesAndStart() {
    const imgs = Array.from(track.querySelectorAll('img'));
    if (imgs.length === 0) {
      initPosition();
      startCounter();
      return;
    }
    const promises = imgs.map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });
    Promise.all(promises).then(() => {
      initPosition();
      startCounter();
    });
  })();

})();

/*events modal (REPLACED and improved)*/
(function() {
  let modal = document.getElementById('event-modal') || document.querySelector('.event-modal');
  if (!modal) return;

  // Move modal to document.body to avoid fixed positioning being clipped by transformed ancestors
  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  const modalContent = modal.querySelector('.modal-content') || modal;
  const modalImage = modal.querySelector('#modal-image') || modal.querySelector('.modal-img img');
  const modalName = modal.querySelector('#modal-name');
  const modalDetail = modal.querySelector('#modal-detail');
  const closeBtn = modal.querySelector('.close');

  // Enforce safe modal root styles (fallbacks in case CSS differs)
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.display = 'none';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';
  modal.style.background = modal.style.background || 'rgba(0,0,0,0.7)';
  modal.style.padding = modal.style.padding || '20px';

  if (modalContent) {
    modalContent.style.maxHeight = modalContent.style.maxHeight || 'calc(100vh - 48px)';
    modalContent.style.overflow = modalContent.style.overflow || 'auto';
    modalContent.style.boxSizing = modalContent.style.boxSizing || 'border-box';
    modalContent.style.width = modalContent.style.width || 'min(92%, 900px)';
  }

  function openEventModalFromCard(card) {
    if (!card) return;
    const imgEl = card.querySelector('img');
    const imgSrc = card.dataset.img || (imgEl ? imgEl.src : '');
    const imgAlt = imgEl ? (imgEl.alt || '') : '';

    if (modalImage) {
      if (modalImage.tagName && modalImage.tagName.toLowerCase() === 'img') {
        modalImage.src = imgSrc || '';
        modalImage.alt = imgAlt;
      } else {
        modalImage.style.backgroundImage = imgSrc ? `url("${imgSrc}")` : '';
      }
    }

    if (modalName) modalName.textContent = card.dataset.name || (card.querySelector('.event-name') ? card.querySelector('.event-name').textContent : '');
    if (modalDetail) modalDetail.textContent = card.dataset.detail || card.getAttribute('data-detail') || '';

    // lock body scroll using class (CSS has body.modal-open)
    document.body.classList.add('modal-open');

    // scroll to top to avoid mobile fixed positioning quirks
    try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (e) { window.scrollTo(0,0); }

    // show modal (flex centers it)
    modal.style.display = 'flex';

    requestAnimationFrame(() => {
      if (modalContent) {
        modalContent.scrollTop = 0;
        modalContent.setAttribute && modalContent.setAttribute('tabindex', '-1');
        try { modalContent.focus({ preventScroll: true }); } catch (e) {}
      }
    });
  }

  function closeEventModal() {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    // optional: clear image src to free memory if desired
    if (modalImage && modalImage.tagName && modalImage.tagName.toLowerCase() === 'img') {
      modalImage.removeAttribute('src');
    }
  }

  // wire up event cards
  document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // allow links inside card to work
      if (e.target && e.target.closest && e.target.closest('a')) return;
      openEventModalFromCard(card);
    });
  });

  // close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeEventModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeEventModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeEventModal(); });

  // keep modal centered & sized on resize/orientationchange
  window.addEventListener('resize', () => {
    if (getComputedStyle(modal).display !== 'none') {
      if (modalContent) modalContent.style.maxHeight = 'calc(100vh - 48px)';
      requestAnimationFrame(() => { if (modalContent) modalContent.scrollTop = 0; });
    }
  });

})();

/* media helpers (unchanged) */
(function() {
  // breakpoints
  const mql920 = window.matchMedia('(max-width: 920px)');
  const mql600 = window.matchMedia('(max-width: 600px)');

  function applySmallScreenStyles() {
    // Carousel: prevent horizontal touch and hide overflow on small screens
    const carousel = document.querySelector('.carousel');
    const track = document.querySelector('.carousel-track');
    if (carousel) {
      carousel.style.overflow = 'hidden';
    }
    if (track) {
      track.style.touchAction = 'pan-y';
      track.style.webkitUserDrag = 'none';
    }

    // Event cards: limit width to viewport-ish if CSS didn't apply yet
    document.querySelectorAll('.event-card').forEach(card => {
      card.style.width = '92%';
      card.style.maxWidth = '92%';
    });

    // Shop image: cap height for small screens
    document.querySelectorAll('.shop-img').forEach(s => {
      s.style.maxHeight = '420px';
      s.style.height = 'auto';
    });

    // trigger a resize so any existing resize handlers recalculate layout
    window.dispatchEvent(new Event('resize'));
  }

  function revertSmallScreenStyles() {
    const carousel = document.querySelector('.carousel');
    const track = document.querySelector('.carousel-track');
    if (carousel) {
      carousel.style.overflow = '';
    }
    if (track) {
      track.style.touchAction = '';
      track.style.webkitUserDrag = '';
    }

    document.querySelectorAll('.event-card').forEach(card => {
      card.style.width = '';
      card.style.maxWidth = '';
    });

    document.querySelectorAll('.shop-img').forEach(s => {
      s.style.maxHeight = '';
      s.style.height = '';
    });

    window.dispatchEvent(new Event('resize'));
  }

  function handleMql920Change(e) {
    if (e.matches) applySmallScreenStyles();
    else revertSmallScreenStyles();
  }

  // initial apply
  try {
    if (mql920.matches) applySmallScreenStyles();
    else revertSmallScreenStyles();
    // listen to changes (modern API + fallback)
    if (typeof mql920.addEventListener === 'function') {
      mql920.addEventListener('change', handleMql920Change);
    } else if (typeof mql920.addListener === 'function') {
      mql920.addListener(handleMql920Change);
    }
  } catch (err) {
    // silently fail if matchMedia not supported
    console.warn('media helper: matchMedia not supported', err);
  }

  // Modal centering helper: when modal becomes visible, enforce centering and focus
  const modal = document.getElementById('event-modal') || document.querySelector('.event-modal');
  if (modal) {
    const modalContent = modal.querySelector('.modal-content');
    const observer = new MutationObserver(() => {
      // if modal is visible (style or class change), center it
      const isVisible = getComputedStyle(modal).display !== 'none' && getComputedStyle(modal).visibility !== 'hidden' && modal.offsetParent !== null;
      if (isVisible) {
        // ensure viewport at top to avoid fixed-position quirks on mobile
        try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch(e){ window.scrollTo(0,0); }
        // small delay to let browser apply layout, then focus content and scroll to top
        requestAnimationFrame(() => {
          if (modalContent) {
            modalContent.scrollTop = 0;
            modalContent.setAttribute && modalContent.setAttribute('tabindex','-1');
            try { modalContent.focus({ preventScroll: true }); } catch(e){}
          }
        });
      }
    });

    observer.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
    // also ensure when window resizes/orientation changes and modal visible, force centering
    window.addEventListener('orientationchange', () => {
      if (getComputedStyle(modal).display !== 'none') {
        window.dispatchEvent(new Event('resize'));
        requestAnimationFrame(() => {
          if (modalContent) modalContent.scrollIntoView({ block: 'center', inline: 'center' });
        });
      }
    });
  }

  // optional: ensure layout recalculation on orientation change
  window.addEventListener('orientationchange', () => {
    window.dispatchEvent(new Event('resize'));
  });

})();