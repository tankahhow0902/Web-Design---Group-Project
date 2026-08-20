/*about shop*/
(function() {
  const autoImgs = [
    "img/store_front.png",
    "img/inside_store.png"
  ];
  const AUTO_INTERVAL = 4000;
  const FADE_DURATION = 400;

  const shopImg = document.getElementById("shopAutoImg");
  if (!shopImg) return;

  // preload
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

/*about designer (carousel)*/
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
    if (!slideEl) return 0;
    const slideRect = slideEl.getBoundingClientRect();
    const slideWidth = slideRect.width;
    const containerWidth = carousel.getBoundingClientRect().width;

    const offsetLeft = slideEl.offsetLeft || 0;
    const centerOffset = (containerWidth - slideWidth) / 2;
    return -offsetLeft + centerOffset;
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

  function initPosition() {
    setTimeout(() => setTranslate(index, true), 20);
  }

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

  // prev/next click zones
  const prevBtn = document.getElementById('prevBtn') || document.querySelector('.click-zone.left');
  const nextBtn = document.getElementById('nextBtn') || document.querySelector('.click-zone.right');
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); x = 0; });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); x = 0; });

  // pause on hover (desktop)
  carousel.addEventListener('mouseenter', () => stopCounter());
  carousel.addEventListener('mouseleave', () => startCounter());

  // keyboard: only operate carousel when modal is not open
  window.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('modal-open')) return;
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
      setTimeout(() => {
        initPosition();
        startCounter();
      }, 30);
    });
  })();

})();

/*events modal (full, robust)*/
(function() {
  let modal = document.getElementById('event-modal') || document.querySelector('.event-modal');
  if (!modal) return;

  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  const modalContent = modal.querySelector('.modal-content') || modal;
  const modalImage = modal.querySelector('#modal-image') || modal.querySelector('.modal-img img');
  const modalName = modal.querySelector('#modal-name');
  const modalDetail = modal.querySelector('#modal-detail');
  const closeBtn = modal.querySelector('.close');

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

  function getScrollbarCompensation() {
    return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  }

  function onModalKeydown(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
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

    document.body.classList.add('modal-open');

    const compensation = getScrollbarCompensation();
    if (compensation > 0) {
      if (document.body.dataset.originalPaddingRight === undefined) {
        document.body.dataset.originalPaddingRight = document.body.style.paddingRight || '';
      }
      const currentPaddingRight = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = (currentPaddingRight + compensation) + 'px';
    }

    modal.style.display = 'flex';

    requestAnimationFrame(() => {
      if (modalContent) {
        modalContent.scrollTop = 0;
        if (modalContent.setAttribute) modalContent.setAttribute('tabindex', '-1');
        try { modalContent.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
    });

    window.addEventListener('keydown', onModalKeydown, true);
  }

  function closeEventModal() {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');

    if (document.body.dataset.originalPaddingRight !== undefined) {
      document.body.style.paddingRight = document.body.dataset.originalPaddingRight;
      delete document.body.dataset.originalPaddingRight;
    } else {
      document.body.style.paddingRight = '';
    }

    if (modalImage && modalImage.tagName && modalImage.tagName.toLowerCase() === 'img') {
      modalImage.removeAttribute('src');
      modalImage.alt = '';
    }

    window.removeEventListener('keydown', onModalKeydown, true);
  }

  document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target && e.target.closest && e.target.closest('a')) return;
      openEventModalFromCard(card);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeEventModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeEventModal(); });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && getComputedStyle(modal).display !== 'none') {
      closeEventModal();
    }
  });

  window.addEventListener('resize', () => {
    if (getComputedStyle(modal).display !== 'none') {
      if (modalContent) modalContent.style.maxHeight = 'calc(100vh - 48px)';
      requestAnimationFrame(() => { if (modalContent) modalContent.scrollTop = 0; });
    }
  });

})();

/*media helpers*/
(function() {
  const mql920 = window.matchMedia('(max-width: 920px)');
  const mql600 = window.matchMedia('(max-width: 600px)');

  function applySmallScreenStyles() {
    const carousel = document.querySelector('.carousel');
    const track = document.querySelector('.carousel-track');
    if (carousel) {
      carousel.style.overflow = 'hidden';
    }
    if (track) {
      track.style.touchAction = 'pan-y';
      track.style.webkitUserDrag = 'none';
    }

    document.querySelectorAll('.event-card').forEach(card => {
      card.style.width = '92%';
      card.style.maxWidth = '92%';
    });

    document.querySelectorAll('.shop-img').forEach(s => {
      s.style.maxHeight = '420px';
      s.style.height = 'auto';
    });

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

  try {
    if (mql920.matches) applySmallScreenStyles();
    else revertSmallScreenStyles();

    if (typeof mql920.addEventListener === 'function') {
      mql920.addEventListener('change', handleMql920Change);
    } else if (typeof mql920.addListener === 'function') {
      mql920.addListener(handleMql920Change);
    }
  } catch (err) {
    console.warn('media helper: matchMedia not supported', err);
  }

  const modal = document.getElementById('event-modal') || document.querySelector('.event-modal');
  if (modal) {
    const modalContent = modal.querySelector('.modal-content');
    const observer = new MutationObserver(() => {
      const isVisible = getComputedStyle(modal).display !== 'none' && getComputedStyle(modal).visibility !== 'hidden' && modal.offsetParent !== null;
      if (isVisible) {
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

    window.addEventListener('orientationchange', () => {
      if (getComputedStyle(modal).display !== 'none') {
        window.dispatchEvent(new Event('resize'));
        requestAnimationFrame(() => {
          if (modalContent) modalContent.scrollIntoView({ block: 'center', inline: 'center' });
        });
      }
    });
  }

  window.addEventListener('orientationchange', () => {
    window.dispatchEvent(new Event('resize'));
  });

})();
