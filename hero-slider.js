/* hero-slider.js — เอนจิ้นควบคุม .hero-slider (auto-play/hover-pause/drag/prev-next/dots)
   เดิมเป็น inline <script> เฉพาะ index.html ย้ายมาเป็นไฟล์ใช้ร่วมกันทุกหน้า + เรียกซ้ำได้
   (nav-render/banner-render เปลี่ยนสไลด์จาก Supabase แล้วต้องเรียก initHeroSlider() ใหม่)
   ใช้ property-style event handler (el.onclick = ...) แทน addEventListener ตรงจุดที่ต้อง
   เรียกซ้ำได้ปลอดภัย กัน listener ซ้อนกันเมื่อ re-init */
window.initHeroSlider = function () {
  var track = document.getElementById('heroSliderTrack');
  var dotsWrap = document.getElementById('heroSliderDots');
  var prevBtn = document.getElementById('heroPrevBtn');
  var nextBtn = document.getElementById('heroNextBtn');
  if (!track) return;

  if (!window.__heroSlider) window.__heroSlider = {};
  var S = window.__heroSlider;
  if (S.stopAutoplay) S.stopAutoplay();
  if (S.resizeHandler) window.removeEventListener('resize', S.resizeHandler);

  var slides = Array.prototype.slice.call(track.children);
  var slideCount = slides.length;
  if (slideCount === 0) return;

  var currentIndex = 0;
  var AUTOPLAY_DELAY = 5000;
  var autoplayTimer = null;
  var isPointerDown = false;
  var isHovering = false;

  if (dotsWrap) dotsWrap.innerHTML = '';
  var dots = [];
  if (dotsWrap) {
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-slider__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'ไปที่แบนเนอร์ที่ ' + (i + 1));
      dot.onclick = function () {
        goToSlide(i);
        restartAutoplay();
      };
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  function updateActiveDot() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentIndex);
      dot.setAttribute('aria-selected', String(i === currentIndex));
    });
  }

  function goToSlide(index, behavior) {
    currentIndex = (index + slideCount) % slideCount;
    track.scrollTo({ left: currentIndex * track.clientWidth, behavior: behavior || 'smooth' });
    updateActiveDot();
  }

  function goToNext() {
    goToSlide(currentIndex + 1);
  }

  function goToPrev() {
    goToSlide(currentIndex - 1);
  }

  function startAutoplay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (isHovering) return;
    stopAutoplay();
    autoplayTimer = setInterval(goToNext, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }
  S.stopAutoplay = stopAutoplay;

  function restartAutoplay() {
    if (isHovering) return;
    startAutoplay();
  }

  if (prevBtn) {
    prevBtn.onclick = function () {
      goToPrev();
      restartAutoplay();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = function () {
      goToNext();
      restartAutoplay();
    };
  }

  var sliderWrap = track.closest('.hero-slider') || track;
  sliderWrap.onmouseenter = function () {
    isHovering = true;
    stopAutoplay();
  };
  sliderWrap.onmouseleave = function () {
    isHovering = false;
    if (!isPointerDown) restartAutoplay();
  };

  track.onpointerdown = function () {
    isPointerDown = true;
    stopAutoplay();
  };
  track.onpointerup = function () {
    isPointerDown = false;
    restartAutoplay();
  };

  var scrollSyncTimer = null;
  track.onscroll = function () {
    clearTimeout(scrollSyncTimer);
    scrollSyncTimer = setTimeout(function () {
      var width = track.clientWidth || 1;
      currentIndex = Math.max(0, Math.min(slideCount - 1, Math.round(track.scrollLeft / width)));
      updateActiveDot();
      if (!isPointerDown) restartAutoplay();
    }, 120);
  };

  S.resizeHandler = function () {
    goToSlide(currentIndex, 'auto');
  };
  window.addEventListener('resize', S.resizeHandler);

  updateActiveDot();
  startAutoplay();
};

document.addEventListener('DOMContentLoaded', function () {
  window.initHeroSlider();
});
