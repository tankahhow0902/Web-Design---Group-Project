/* about shop 自动切换 (立即执行 IIFE) */
(function() {
  const autoImgs = [
    "img/store_front.png",
    "img/inside_store.png"
  ];
  const AUTO_INTERVAL = 4000;
  const FADE_DURATION = 400;

  const shopImg = document.getElementById("shopAutoImg");
  if (!shopImg) return;

  // 预加载
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
})(); // <- 确保 IIFE 被调用

/* about designer 滑动轮播 (立即执行 IIFE) */
(function() {
  const carousel = document.querySelector('.carousel');
  const track = document.querySelector('.carousel-track');
  if (!carousel || !track) return;

  const originalSlides = Array.from(track.children);
  const slideCount = originalSlides.length;
  if (slideCount === 0) return;

  // 读取 gap
  const trackStyle = getComputedStyle(track);
  const gap = parseFloat(trackStyle.gap) || parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slide-gap')) || 40;

  // 保存 track 当前的 CSS transition（用来恢复）
  const originalTransition = track.style.transition || getComputedStyle(track).transition || 'transform 600ms cubic-bezier(.22,.9,.32,1)';

  // 复制整组到左右两侧（避免单张 clone 的不连续感）
  const leftClones = originalSlides.map(n => n.cloneNode(true));
  const rightClones = originalSlides.map(n => n.cloneNode(true));
  leftClones.forEach(c => c.classList.add('clone'));
  rightClones.forEach(c => c.classList.add('clone'));
  leftClones.reverse().forEach(c => track.insertBefore(c, track.firstChild));
  rightClones.forEach(c => track.appendChild(c));

  const slidesAll = Array.from(track.children);
  let index = slideCount; // 中间组的第一张
  let isTransitioning = false;

  // x 计数器
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

  // 计算 translateX (px) 使 slidesAll[forIndex] 居中
  function computeTranslatePx(forIndex) {
    const slideEl = slidesAll[forIndex];
    const slideRect = slideEl.getBoundingClientRect();
    const slideWidth = slideRect.width;
    const containerWidth = carousel.getBoundingClientRect().width;
    const centerOffset = (containerWidth - slideWidth) / 2;
    const step = slideWidth + gap;
    return -forIndex * step + centerOffset;
  }

  // 设置 transform；instant = true 时禁用过渡并立刻恢复原始 transition（避免闪动）
  function setTranslate(forIndex, instant = false) {
    const translateX = computeTranslatePx(forIndex);
    if (instant) {
      // 禁用过渡 -> 设置 transform -> 强制重绘 -> 恢复原始 transition
      track.style.transition = 'none';
      track.style.transform = `translateX(${translateX}px)`;
      // 强制 reflow
      void track.offsetWidth;
      // 立即恢复到保存的 transition（恢复后未来的 transform 会有动画）
      track.style.transition = originalTransition;
    } else {
      track.style.transform = `translateX(${translateX}px)`;
    }
    slidesAll.forEach((s, i) => s.classList.toggle('active', i === forIndex));
    updateDotsForIndex(forIndex);
  }

  // 初始化位置（instant）
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

  // transitionend: 如果落在 clone 範圍，跳回中間等效 slide（instant）
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
      index = slideCount + i; // 中間組對應的 index
      setTranslate(index, false);
      isTransitioning = true;
      x = 0;
    });
  });

  // prev/next 綁定
  const prevBtn = document.getElementById('prevBtn') || document.querySelector('.click-zone.left');
  const nextBtn = document.getElementById('nextBtn') || document.querySelector('.click-zone.right');
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); x = 0; });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); x = 0; });

  // hover 暫停/恢復
  carousel.addEventListener('mouseenter', () => stopCounter());
  carousel.addEventListener('mouseleave', () => startCounter());

  // 鍵盤支持
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

  // resize debounce
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => initPosition(), 120);
  });

  // 等待圖片載入後初始化，避免 clone/原始尺寸不一致
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

/* events modal（与原来逻辑相同） */
(function() {
  const modal = document.getElementById('event-modal');
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalDetail = document.getElementById('modal-detail');
  const closeBtn = document.querySelector('.close');

  if (modal && closeBtn) {
    document.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        modalImage.src = card.querySelector('img').src;
        modalName.textContent = card.dataset.name;
        modalDetail.textContent = card.dataset.detail;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });

    closeBtn.onclick = () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    };

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }
    });
  }
})();