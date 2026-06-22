/* ============================================================
   RENUMB FLESH — shared behaviour (loaded with defer on every page)
   - Background video: real mobile-compatible autoplay (muted +
     playsinline). No play-button overlay, with a poster fallback.
   - Mobile menu: locks body scroll while open (handled with CSS class).
   ============================================================ */
(function () {
  function playBg() {
    var wrap = document.querySelector('.site-bg');
    var video = wrap ? wrap.querySelector('video') : null;
    if (!video) return;

    var saveData = navigator.connection && navigator.connection.saveData;

    /* Respect explicit data-saver only. Everywhere else we autoplay. */
    if (saveData) {
      wrap.classList.add('poster-only');
      video.removeAttribute('autoplay');
      video.querySelectorAll('source').forEach(function (s) { s.removeAttribute('src'); });
      try { video.load(); } catch (e) {}
      return;
    }

    /* Belt-and-suspenders for iOS/Android autoplay policies. */
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.playsInline = true;

    function attempt() {
      var p = video.play && video.play();
      if (p && p.catch) {
        p.catch(function () {
          /* If the browser still refuses, retry once on first touch/scroll,
             then fall back to the poster so users never see a play button. */
          var retry = function () {
            video.play().then(removeListeners).catch(function () {
              wrap.classList.add('poster-only');
              removeListeners();
            });
          };
          var removeListeners = function () {
            ['touchstart', 'click', 'scroll'].forEach(function (ev) {
              window.removeEventListener(ev, retry, { passive: true });
            });
          };
          ['touchstart', 'click', 'scroll'].forEach(function (ev) {
            window.addEventListener(ev, retry, { passive: true, once: false });
          });
        });
      }
    }

    if (video.readyState >= 2) { attempt(); }
    else { video.addEventListener('loadeddata', attempt, { once: true }); attempt(); }
  }

  function stripDeadHeroVideos() {
    /* The decorative hero <video> elements point at hero.mp4 / hero-bg.mp4
       which are not shipped. They are display:none; clear sources so the
       browser never fires a wasted 404 and never shows a play affordance. */
    document.querySelectorAll('.hero > video, .hero-video > video').forEach(function (v) {
      v.removeAttribute('autoplay');
      v.pause && v.pause();
      v.querySelectorAll('source').forEach(function (s) { s.removeAttribute('src'); });
      try { v.load(); } catch (e) {}
    });
  }

  function init() { stripDeadHeroVideos(); playBg(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
