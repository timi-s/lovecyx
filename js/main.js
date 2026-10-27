/* ============================================================
   恋爱网页 · 交互与渲染
   ------------------------------------------------------------
   主要内容都来自 js/config.js，这里负责：
   星空、光标光晕、阅读进度、相识计时、情书/时间线渲染、
   心动值、余生清单、求婚小机关、答应的那一刻、环境音乐。
   ============================================================ */

(function () {
  'use strict';

  var CONFIG = window.LOVE_CONFIG || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function reduceMotion() {
    return !!(reduceMotionQuery && reduceMotionQuery.matches);
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  var youName = ((CONFIG.you || {}).name || '你').trim();
  var meName = ((CONFIG.me || {}).name || '我').trim();

  /* ==========================================================
     1. 文案与内容渲染
     ========================================================== */

  var hero = CONFIG.hero || {};
  var proposal = CONFIG.proposal || {};
  var lab = CONFIG.lab || {};
  var photo = CONFIG.photo || {};

  function bindCopy() {
    document.title = '致' + youName + ' · 一封很长的情书';

    setText('brandNames', youName + ' & ' + meName);
    setText('heroEyebrow', hero.eyebrow || 'TO YOU · 致我最喜欢的人');
    setText('heroTitleTop', hero.titleTop || '遇见你，');
    setText('heroTitleBottom', hero.titleBottom || '是我所有浪漫的开始');

    var sub = $('#heroSub');
    if (sub) {
      sub.innerHTML = escapeHTML(hero.subtitle || '把我们的故事，写成') +
        '<em>' + escapeHTML(hero.subtitleEm || '一封很长很长的情书') + '</em>' +
        escapeHTML(hero.subtitleEnd || '。');
    }

    setText('primaryBtnLabel', hero.primaryButton || '打开这封信');
    setText('ghostBtnLabel', hero.ghostButton || '点亮心动');
    setText('letterTo', '给' + youName + '：');
    setText('letterFrom', meName);
    setText('letterSignature', CONFIG.letterSignature || '永远站在你这边的人');
    setText('letterTip', CONFIG.letterTip || '');
    setText('letterDate', CONFIG.letterDate || formatChineseDate(new Date()));
    setText('labKicker', lab.kicker || 'A LITTLE EXPERIMENT');
    setText('labMeterTitle', lab.title || '把心动值填满');
    setText('labText', lab.text || '');
    setText('proposalKicker', proposal.kicker || 'THE LAST QUESTION');
    setText('proposalTitleTop', proposal.title || '最后一个问题：');
    var titleEm = $('#proposalTitleEm');
    if (titleEm) {
      var titleLines = String(proposal.titleEm || '你愿意和我一起，把余生过成诗吗？').split('\n');
      titleEm.innerHTML = titleLines.map(escapeHTML).join('<br class="br-mobile">');
    }
    setText('yesBtn', proposal.yes || '愿意 ♥');
    setText('noBtn', proposal.no || '再想想');
    setText('proposalHint', proposal.hint || '');
    setText('celebrateKicker', proposal.celebrateKicker || 'YES!');
    setText('celebrateTitle', proposal.celebrateTitle || '我就知道 ♥');
    setText('celebrateText', proposal.celebrateText || '');
    setText('celebrateSeal', proposal.celebrateSeal || '最好的我们');
    setText('celebrateClose', proposal.closeButton || '收下这封情书');
    setText('footerLine', '写给' + youName + ' · ' + ((CONFIG.footer || {}).line || '第 ∞ 页'));
    setText('footerYear', String(new Date().getFullYear()));

    var made = $('#footerMade');
    if (made) {
      made.innerHTML = escapeHTML((CONFIG.footer || {}).madeBy || 'Made with') +
        ' <span aria-hidden="true">♥</span> by ' + escapeHTML(meName);
    }
  }

  function formatChineseDate(date) {
    return date.getFullYear() + ' 年 ' + (date.getMonth() + 1) + ' 月 ' + date.getDate() + ' 日';
  }

  function renderLetter() {
    var body = $('#letterBody');
    if (!body) return;
    body.textContent = '';
    var paragraphs = Array.isArray(CONFIG.letter) ? CONFIG.letter : [];
    paragraphs.forEach(function (paragraph) {
      var p = document.createElement('p');
      p.textContent = paragraph;
      body.appendChild(p);
    });
  }

  function renderPhoto() {
    var section = $('#photo');
    var img = $('#photoImg');
    var windowEl = $('#photoWindow');
    var video = $('#photoVideo');
    var videoUI = $('#photoVideoUI');
    var videoBadge = $('#photoVideoBadge');
    var videoBigPlay = $('#photoVideoBigPlay');
    var videoPlayBtn = $('#photoVideoPlay');
    var videoSoundBtn = $('#photoVideoSound');
    var fallback = photo.fallback || 'assets/photo-placeholder.svg';

    setText('photoTitle', photo.title || '相框里的你');
    setText('photoDesc', photo.desc || '');
    setText('photoCaption', photo.caption || '');
    setText('photoPlaqueName', photo.plaqueName || youName);
    setText('photoPlaqueMeta', photo.plaqueMeta || 'MY GIRL · 2026');
    setText('photoNote', photo.note || '');

    if (img) {
      img.alt = photo.alt || youName;
      img.style.objectPosition = photo.position || 'center 35%';
      img.src = fallback;
      if (section) section.classList.add('is-placeholder');

      var realSrc = photo.src;
      if (realSrc && realSrc !== fallback) {
        // 先用占位插画撑住相框，照片加载成功后再无缝替换。
        var probe = new Image();
        probe.onload = function () {
          img.src = realSrc;
          if (video) video.poster = realSrc;
          if (section) {
            section.classList.remove('is-placeholder');
            section.classList.add('has-photo');
          }
        };
        probe.onerror = function () {
          if (section) section.classList.add('is-placeholder');
        };
        probe.src = realSrc;
      }
    }

    if (video && windowEl) {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.poster = fallback;
      video.setAttribute('aria-label', photo.videoAlt || ((photo.alt || youName) + '的视频'));

      var setPlayingUI = function (playing) {
        windowEl.classList.toggle('is-playing', playing);
        if (videoPlayBtn) {
          videoPlayBtn.setAttribute('aria-label', playing ? '暂停视频' : '播放视频');
        }
      };
      var setMutedUI = function (muted) {
        video.muted = muted;
        windowEl.classList.toggle('is-muted', muted);
        if (videoSoundBtn) {
          videoSoundBtn.setAttribute('aria-pressed', muted ? 'false' : 'true');
          videoSoundBtn.setAttribute('aria-label', muted ? '打开视频声音' : '关闭视频声音');
        }
      };
      var togglePlay = function () {
        if (video.hidden) return;
        if (video.paused) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () { setPlayingUI(false); });
          }
        } else {
          video.pause();
        }
      };

      if (videoPlayBtn) videoPlayBtn.addEventListener('click', togglePlay);
      if (videoBigPlay) videoBigPlay.addEventListener('click', togglePlay);
      if (videoSoundBtn) {
        videoSoundBtn.addEventListener('click', function () {
          setMutedUI(!video.muted);
          if (!video.muted && video.paused) {
            var promise = video.play();
            if (promise && promise.catch) {
              promise.catch(function () { setPlayingUI(false); });
            }
          }
        });
      }
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () { setPlayingUI(true); });
      video.addEventListener('pause', function () { setPlayingUI(false); });
      video.addEventListener('error', function () {
        windowEl.classList.remove('has-video', 'is-playing');
        if (videoUI) videoUI.hidden = true;
        if (videoBadge) videoBadge.hidden = true;
        if (videoBigPlay) videoBigPlay.hidden = true;
      });

      setMutedUI(true);
      setPlayingUI(false);

      if (photo.video) {
        var videoActivated = false;
        video.addEventListener('loadeddata', function () {
          if (videoActivated) return;
          videoActivated = true;
          video.hidden = false;
          if (videoUI) videoUI.hidden = false;
          if (videoBadge) videoBadge.hidden = false;
          if (videoBigPlay) videoBigPlay.hidden = false;
          windowEl.classList.add('has-video');
          video.style.objectPosition = photo.position || 'center 35%';

          if (reduceMotion()) {
            setPlayingUI(false);
          } else {
            var promise = video.play();
            if (promise && promise.catch) {
              promise.catch(function () { setPlayingUI(false); });
            }
          }
        });
        video.src = photo.video;
        video.load();
      }
    }

    var dl = $('#photoFacts');
    if (!dl) return;
    dl.textContent = '';
    var facts = Array.isArray(photo.facts) ? photo.facts : [];
    facts.forEach(function (item) {
      var row = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = item.label || '';
      dd.textContent = item.value || '';
      row.appendChild(dt);
      row.appendChild(dd);
      dl.appendChild(row);
    });
  }

  function renderTimeline() {
    var list = $('#timelineList');
    if (!list) return;
    list.textContent = '';
    var items = Array.isArray(CONFIG.timeline) ? CONFIG.timeline : [];
    items.forEach(function (item, index) {
      var li = document.createElement('li');
      li.className = 'timeline__item reveal';
      li.style.setProperty('--d', (index * 90) + 'ms');

      var date = document.createElement('p');
      date.className = 'timeline__date';
      date.textContent = item.date || '';

      var dot = document.createElement('span');
      dot.className = 'timeline__dot';
      dot.setAttribute('aria-hidden', 'true');

      var card = document.createElement('div');
      card.className = 'timeline__card';

      var title = document.createElement('h3');
      title.textContent = item.title || '';

      var text = document.createElement('p');
      text.textContent = item.text || '';

      card.appendChild(title);
      card.appendChild(text);
      li.appendChild(date);
      li.appendChild(dot);
      li.appendChild(card);
      list.appendChild(li);
    });
  }

  var ICONS = {
    heart: '<path d="M12 20s-7-4.4-7-9.2A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3.2C19 15.6 12 20 12 20Z"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
    coffee: '<path d="M4 9h11v4.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"/><path d="M15 10h2.2a2.6 2.6 0 0 1 0 5.2H15"/><path d="M7.5 5.5V3M11 5.5V3"/>',
    music: '<path d="M9 18V5l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>'
  };

  function renderReasons() {
    var grid = $('#reasonsGrid');
    if (!grid) return;
    grid.textContent = '';
    var items = Array.isArray(CONFIG.reasons) ? CONFIG.reasons : [];
    items.forEach(function (item, index) {
      var card = document.createElement('article');
      card.className = 'reason reveal';
      card.style.setProperty('--d', (index * 80) + 'ms');

      var no = document.createElement('span');
      no.className = 'reason__no';
      no.setAttribute('aria-hidden', 'true');
      no.textContent = pad2(index + 1);

      var icon = document.createElement('span');
      icon.className = 'reason__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        (ICONS[item.icon] || ICONS.heart) + '</svg>';

      var title = document.createElement('h3');
      title.textContent = item.title || '';

      var text = document.createElement('p');
      text.textContent = item.text || '';

      card.appendChild(no);
      card.appendChild(icon);
      card.appendChild(title);
      card.appendChild(text);
      grid.appendChild(card);
    });
  }

  /* ==========================================================
     2. 顶部进度与导航状态
     ========================================================== */

  function initScrollUI() {
    var topbar = $('#topbar');
    var bar = $('#progressBar');
    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (topbar) topbar.classList.toggle('is-scrolled', y > 36);
      if (bar) bar.style.width = (ratio * 100).toFixed(2) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ==========================================================
     3. 星光与飘落的心
     ========================================================== */

  function initSky() {
    var canvas = $('#sky');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    var W = 0, H = 0;
    var stars = [];
    var petals = [];
    var raf = null;
    var last = 0;
    var time = 0;
    var running = false;

    function makeStars() {
      stars = [];
      var count = Math.round(Math.min(110, Math.max(46, W / 14)));
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.4 + Math.random() * 1.15,
          base: 0.16 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.9
        });
      }
    }

    function makePetals() {
      petals = [];
      var count = 12;
      for (var i = 0; i < count; i++) {
        petals.push({
          x: Math.random() * W,
          y: Math.random() * H,
          size: 4 + Math.random() * 7,
          rot: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.008,
          vx: -6 - Math.random() * 10,
          vy: 7 + Math.random() * 12,
          alpha: 0.05 + Math.random() * 0.09
        });
      }
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      makeStars();
      makePetals();
      if (reduceMotion()) drawStatic();
    }

    function drawHeart(x, y, size, rotation, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ff9fbe';
      ctx.beginPath();
      ctx.moveTo(0, size * 0.34);
      ctx.bezierCurveTo(-size * 0.9, -size * 0.26, -size * 0.52, -size * 1.04, 0, -size * 0.4);
      ctx.bezierCurveTo(size * 0.52, -size * 1.04, size * 0.9, -size * 0.26, 0, size * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function draw(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      time += dt;

      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var twinkle = 0.62 + 0.38 * Math.sin(time * s.speed + s.phase);
        ctx.globalAlpha = s.base * twinkle;
        ctx.fillStyle = '#f7e9ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var j = 0; j < petals.length; j++) {
        var p = petals[j];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin;
        if (p.y > H + 30) { p.y = -30; p.x = Math.random() * W; }
        if (p.x < -30) { p.x = W + 30; p.y = Math.random() * H; }
        drawHeart(p.x, p.y, p.size, p.rot, p.alpha * 1.4);
      }

      ctx.globalAlpha = 1;
      raf = window.requestAnimationFrame(draw);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        ctx.globalAlpha = s.base * 0.85;
        ctx.fillStyle = '#f7e9ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (var j = 0; j < petals.length; j++) {
        drawHeart(petals[j].x, petals[j].y, petals[j].size, petals[j].rot, petals[j].alpha);
      }
      ctx.globalAlpha = 1;
    }

    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
      running = false;
      last = 0;
    }

    function start() {
      if (running || reduceMotion()) return;
      running = true;
      last = 0;
      raf = window.requestAnimationFrame(draw);
    }

    function refresh() {
      stop();
      resize();
      time = 0;
      start();
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refresh, 180);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    if (reduceMotionQuery && reduceMotionQuery.addEventListener) {
      reduceMotionQuery.addEventListener('change', refresh);
    }

    resize();
    start();
  }

  /* ==========================================================
     4. 跟随光标的光晕
     ========================================================== */

  function initCursorGlow() {
    var glow = $('#cursorGlow');
    if (!glow) return;
    if (reduceMotion()) return;
    if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

    var targetX = -1000, targetY = -1000;
    var currentX = -1000, currentY = -1000;
    var visible = false;
    var raf = null;

    function loop() {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      glow.style.setProperty('--x', (currentX - 260).toFixed(1) + 'px');
      glow.style.setProperty('--y', (currentY - 260).toFixed(1) + 'px');

      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        raf = window.requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }

    function onMove(event) {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        currentX = targetX;
        currentY = targetY;
        glow.classList.add('is-visible');
        visible = true;
      }
      if (!raf) raf = window.requestAnimationFrame(loop);
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', function () {
      glow.classList.remove('is-visible');
      visible = false;
    });
  }

  /* ==========================================================
     5. 相识计时
     ========================================================== */

  function initCounter() {
    var start = new Date(CONFIG.startDate || '');
    var valid = !isNaN(start.getTime());
    if (!valid) {
      start = new Date();
      console.warn('[love-page] startDate 格式不正确，已从今天开始计时。格式示例：2024-05-20T20:13:00');
    }

    var since = 'SINCE ' + start.getFullYear() + '.' + pad2(start.getMonth() + 1) + '.' + pad2(start.getDate());
    if (start.getHours() !== 0 || start.getMinutes() !== 0) {
      since += ' · ' + pad2(start.getHours()) + ':' + pad2(start.getMinutes());
    }
    setText('sinceLabel', since);

    var nodes = {
      days: $('#days'),
      hours: $('#hours'),
      minutes: $('#minutes'),
      seconds: $('#seconds')
    };

    function tick() {
      var diff = Date.now() - start.getTime();
      if (!isFinite(diff) || diff < 0) diff = 0;
      var total = Math.floor(diff / 1000);
      var days = Math.floor(total / 86400);
      var hours = Math.floor((total % 86400) / 3600);
      var minutes = Math.floor((total % 3600) / 60);
      var seconds = total % 60;

      if (nodes.days) nodes.days.textContent = String(days).padStart(3, '0');
      if (nodes.hours) nodes.hours.textContent = pad2(hours);
      if (nodes.minutes) nodes.minutes.textContent = pad2(minutes);
      if (nodes.seconds) nodes.seconds.textContent = pad2(seconds);
    }

    tick();
    window.setInterval(tick, 1000);
  }

  /* ==========================================================
     6. 滚动显现
     ========================================================== */

  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (reduceMotion() || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ==========================================================
     7. 爱心特效 & 提示条
     ========================================================== */

  var toastTimer = null;

  function showToast(message) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  function burstHearts(x, y, count) {
    if (reduceMotion()) return;
    count = count || 16;
    var colors = ['#ff8fb1', '#ff5c8a', '#f6d6a8', '#ffb3c6', '#e7b6ff'];
    for (var i = 0; i < count; i++) {
      var el = document.createElement('span');
      el.className = 'burst-heart';
      el.textContent = '♥';
      el.setAttribute('aria-hidden', 'true');
      var angle = Math.random() * Math.PI * 2;
      var distance = 50 + Math.random() * 150;
      el.style.setProperty('--x', x.toFixed(1) + 'px');
      el.style.setProperty('--y', y.toFixed(1) + 'px');
      el.style.setProperty('--tx', (Math.cos(angle) * distance).toFixed(1) + 'px');
      el.style.setProperty('--ty', (Math.sin(angle) * distance - 60).toFixed(1) + 'px');
      el.style.setProperty('--size', (10 + Math.random() * 13).toFixed(0) + 'px');
      el.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
      el.style.setProperty('--rot', (Math.random() * 120 - 60).toFixed(0) + 'deg');
      el.style.setProperty('--scale', (0.85 + Math.random() * 0.9).toFixed(2));
      document.body.appendChild(el);
      window.setTimeout(function () { el.remove(); }, 1300);
    }
  }

  function initHeartButton() {
    var btn = $('#heartBurstBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var rect = btn.getBoundingClientRect();
      burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
    });
  }

  /* ==========================================================
     8. 心动实验室
     ========================================================== */

  function initLab() {
    var card = $('#labCard');
    var meter = $('#heartMeter');
    var fill = $('#meterFill');
    var value = $('#meterValue');
    var result = $('#meterResult');
    if (!card || !meter || !fill || !value || !result) return;

    var buttons = $$('.heart-btn', meter);
    var filled = new Set();
    var messages = {
      1: '咦，好像有点感觉了。',
      2: '嗯……心跳开始不听话。',
      3: '警告：靠近你时，心率持续升高。',
      4: '还差一点点，就要满了。'
    };

    function update() {
      var pct = buttons.length ? Math.round((filled.size / buttons.length) * 100) : 0;
      fill.style.width = pct + '%';
      value.textContent = String(pct);
      card.classList.toggle('is-full', pct === 100);

      if (pct === 0) {
        result.textContent = '';
        result.classList.remove('is-visible');
      } else if (pct === 100) {
        result.textContent = lab.result || '心动值 MAX。';
        result.classList.add('is-visible');
      } else {
        result.textContent = messages[filled.size] || '';
        result.classList.add('is-visible');
      }
    }

    buttons.forEach(function (btn, index) {
      btn.addEventListener('click', function () {
        if (card.classList.contains('is-full')) {
          filled.clear();
          buttons.forEach(function (b) {
            b.classList.remove('is-on');
            b.setAttribute('aria-pressed', 'false');
          });
          update();
          showToast(lab.fullHint || '心动值已重置，再试一次？');
          return;
        }

        if (filled.has(index)) {
          filled.delete(index);
          btn.classList.remove('is-on');
          btn.setAttribute('aria-pressed', 'false');
        } else {
          filled.add(index);
          btn.classList.add('is-on');
          btn.setAttribute('aria-pressed', 'true');
        }
        update();

        if (filled.size === buttons.length) {
          var rect = meter.getBoundingClientRect();
          burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, Math.min(34, window.innerWidth < 600 ? 18 : 30));
        }
      });
    });

    update();
  }

  /* ==========================================================
     9. 余生清单
     ========================================================== */

  function initBucket() {
    var list = $('#bucketList');
    var progress = $('#bucketProgress');
    if (!list) return;

    var items = Array.isArray(CONFIG.bucket) ? CONFIG.bucket : [];
    var storageKey = 'love-page.bucket.v1';
    var saved = [];
    try {
      var raw = window.localStorage.getItem(storageKey);
      saved = raw ? JSON.parse(raw) : [];
    } catch (err) {
      saved = [];
    }
    if (!Array.isArray(saved)) saved = [];

    function save(state) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (err) { /* 隐私模式下忽略即可 */ }
    }

    function refreshProgress() {
      var done = 0;
      $$('.bucket__btn', list).forEach(function (btn) {
        if (btn.getAttribute('aria-pressed') === 'true') done++;
      });
      if (progress) progress.textContent = '已完成 ' + done + ' / ' + items.length;
      return done;
    }

    list.textContent = '';
    items.forEach(function (text, index) {
      var li = document.createElement('li');
      li.className = 'bucket__item reveal';
      li.style.setProperty('--d', (index * 60) + 'ms');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bucket__btn';
      btn.setAttribute('aria-pressed', saved[index] === true ? 'true' : 'false');

      var check = document.createElement('span');
      check.className = 'bucket__check';
      check.setAttribute('aria-hidden', 'true');

      var label = document.createElement('span');
      label.className = 'bucket__label';
      label.textContent = text;

      btn.appendChild(check);
      btn.appendChild(label);

      btn.addEventListener('click', function () {
        var next = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', next ? 'true' : 'false');

        var state = $$('.bucket__btn', list).map(function (b) {
          return b.getAttribute('aria-pressed') === 'true';
        });
        save(state);
        var done = refreshProgress();

        if (next) {
          var rect = btn.getBoundingClientRect();
          burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
        }
        if (done === items.length && items.length > 0) {
          showToast('全部完成！那……什么时候出发？');
        }
      });

      li.appendChild(btn);
      list.appendChild(li);
    });

    refreshProgress();
  }

  /* ==========================================================
     10. 最后一个问题
     ========================================================== */

  function initProposal() {
    var stage = $('#proposalStage');
    var yesBtn = $('#yesBtn');
    var noBtn = $('#noBtn');
    var hint = $('#proposalHint');
    var celebrate = $('#celebrate');
    var celebrateClose = $('#celebrateClose');
    if (!stage || !yesBtn || !noBtn || !celebrate) return;

    var dodges = 0;
    var baseHint = proposal.hint || '';
    var noTexts = Array.isArray(proposal.noTexts) && proposal.noTexts.length
      ? proposal.noTexts
      : ['再想想', '真的吗？', '你确定？', '它会逃跑哦'];
    var lastFocus = null;
    var isOpen = false;
    var inertTargets = [$('main'), $('#topbar')].filter(Boolean);

    function dodge() {
      if (isOpen) return;
      if (reduceMotion()) {
        showToast('它说：不管点几次，答案都只有一个。');
        return;
      }

      var stageRect = stage.getBoundingClientRect();
      var btnRect = noBtn.getBoundingClientRect();

      if (!noBtn.classList.contains('is-loose')) {
        noBtn.style.left = (btnRect.left - stageRect.left) + 'px';
        noBtn.style.top = (btnRect.top - stageRect.top) + 'px';
        noBtn.classList.add('is-loose');
        void noBtn.offsetWidth;
      }

      var pad = 10;
      var w = noBtn.offsetWidth;
      var h = noBtn.offsetHeight;
      var maxX = Math.max(pad, stage.clientWidth - w - pad);
      var maxY = Math.max(pad, stage.clientHeight - h - pad);
      var yesRect = yesBtn.getBoundingClientRect();
      var yesX = yesRect.left - stageRect.left + yesRect.width / 2;
      var yesY = yesRect.top - stageRect.top + yesRect.height / 2;
      var targetX = pad;
      var targetY = pad;

      for (var i = 0; i < 30; i++) {
        targetX = pad + Math.random() * (maxX - pad);
        targetY = pad + Math.random() * (maxY - pad);
        var dx = targetX + w / 2 - yesX;
        var dy = targetY + h / 2 - yesY;
        if (dx * dx + dy * dy > 105 * 105) break;
      }

      dodges += 1;
      var scale = Math.max(0.55, 1 - dodges * 0.06);
      var tilt = (Math.random() * 12 - 6).toFixed(1);

      window.requestAnimationFrame(function () {
        noBtn.style.left = targetX + 'px';
        noBtn.style.top = targetY + 'px';
        noBtn.style.transform = 'scale(' + scale + ') rotate(' + tilt + 'deg)';
      });

      noBtn.textContent = noTexts[Math.min(dodges, noTexts.length - 1)];

      if (hint) {
        hint.classList.add('is-dodged');
        hint.textContent = dodges >= 3 ? (proposal.dodgedHint || '看来它已经替你回答了。') : baseHint;
      }
    }

    noBtn.addEventListener('click', function (event) {
      event.preventDefault();
      dodge();
    });
    noBtn.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') dodge();
    });

    function spawnConfetti() {
      if (reduceMotion()) return;
      var holder = $('#celebrateConfetti');
      if (!holder) return;
      holder.textContent = '';
      var colors = ['#ff8fb1', '#ff5c8a', '#f6d6a8', '#ffb3c6', '#e7b6ff', '#ffd6e4'];
      for (var i = 0; i < 46; i++) {
        var el = document.createElement('span');
        el.className = 'confetti-heart';
        el.textContent = '♥';
        el.setAttribute('aria-hidden', 'true');
        el.style.setProperty('--x', (Math.random() * 100).toFixed(2) + '%');
        el.style.setProperty('--size', (8 + Math.random() * 15).toFixed(0) + 'px');
        el.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
        el.style.setProperty('--dur', (3.8 + Math.random() * 3.4).toFixed(2) + 's');
        el.style.setProperty('--delay', (Math.random() * 1.8).toFixed(2) + 's');
        el.style.setProperty('--drift', (Math.random() * 180 - 90).toFixed(0) + 'px');
        el.style.setProperty('--rot', (Math.random() * 720 - 200).toFixed(0) + 'deg');
        holder.appendChild(el);
      }
    }

    function openCelebration() {
      if (isOpen) return;
      isOpen = true;
      var active = document.activeElement;
      lastFocus = active && active !== document.body && typeof active.focus === 'function' ? active : yesBtn;
      inertTargets.forEach(function (el) { el.setAttribute('inert', ''); });
      celebrate.hidden = false;
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(function () {
        celebrate.classList.add('is-open');
        spawnConfetti();
      });
      var rect = yesBtn.getBoundingClientRect();
      burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 26);
      window.setTimeout(function () {
        if (celebrateClose) celebrateClose.focus();
      }, 420);
    }

    function closeCelebration() {
      if (!isOpen) return;
      isOpen = false;
      celebrate.classList.remove('is-open');
      document.body.style.overflow = '';
      window.setTimeout(function () {
        celebrate.hidden = true;
        var holder = $('#celebrateConfetti');
        if (holder) holder.textContent = '';
        inertTargets.forEach(function (el) { el.removeAttribute('inert'); });
        if (lastFocus && typeof lastFocus.focus === 'function') {
          lastFocus.focus();
        }
      }, 520);
    }

    yesBtn.addEventListener('click', openCelebration);
    if (celebrateClose) celebrateClose.addEventListener('click', closeCelebration);

    celebrate.addEventListener('click', function (event) {
      if (event.target === celebrate) closeCelebration();
    });

    document.addEventListener('keydown', function (event) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        closeCelebration();
        return;
      }
      if (event.key !== 'Tab') return;
      var focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', celebrate)
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (!noBtn.classList.contains('is-loose')) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        noBtn.classList.remove('is-loose');
        noBtn.removeAttribute('style');
        noBtn.textContent = proposal.no || '再想想';
        dodges = 0;
        if (hint) {
          hint.classList.remove('is-dodged');
          hint.textContent = baseHint;
        }
      }, 220);
    }, { passive: true });
  }

  /* ==========================================================
     11. 环境音乐（Web Audio 实时合成，无需音频文件）
     ========================================================== */

  function initMusic() {
    var btn = $('#soundBtn');
    var label = $('#soundLabel');
    if (!btn) return;

    var ctx = null;
    var master = null;
    var padBus = null;
    var noteBus = null;
    var timer = null;
    var tickCount = 0;
    var notePos = 2;
    var playing = false;

    var chords = [
      [48, 55, 59, 64],   // Cmaj7
      [45, 52, 55, 60],   // Am7
      [41, 48, 52, 57],   // Fmaj7
      [43, 50, 55, 59]    // G
    ];
    var scale = [72, 74, 76, 79, 81, 84, 86, 88];

    function midiToFreq(midi) {
      return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function playChord(notes, at) {
      notes.forEach(function (midi, index) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = midiToFreq(midi);
        osc.detune.value = index === 0 ? -4 : 4;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.linearRampToValueAtTime(0.02, at + 2.1);
        gain.gain.setValueAtTime(0.02, at + 3.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 5.6);
        osc.connect(gain);
        gain.connect(padBus);
        osc.start(at);
        osc.stop(at + 5.8);
      });
    }

    function playNote(at) {
      var steps = [-2, -1, -1, 0, 1, 1, 2];
      notePos += steps[Math.floor(Math.random() * steps.length)];
      notePos = Math.max(0, Math.min(scale.length - 1, notePos));
      var midi = scale[notePos] + (Math.random() < 0.16 ? 12 : 0);

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'triangle';
      osc.frequency.value = midiToFreq(midi);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.linearRampToValueAtTime(0.052, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);

      osc.connect(gain);
      if (pan) {
        pan.pan.value = Math.random() * 1.1 - 0.55;
        gain.connect(pan);
        pan.connect(noteBus);
      } else {
        gain.connect(noteBus);
      }
      osc.start(at);
      osc.stop(at + 1.7);
    }

    function tick() {
      if (!ctx) return;
      var at = ctx.currentTime + 0.05;
      if (tickCount % 8 === 0) {
        playChord(chords[(tickCount / 8) % chords.length], at);
      }
      if (Math.random() < 0.78) playNote(at);
      tickCount += 1;
    }

    async function start() {
      var AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) throw new Error('Web Audio 不可用');

      ctx = new AudioCtor();
      master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.4);
      master.connect(ctx.destination);

      var delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.42;
      var feedback = ctx.createGain();
      feedback.gain.value = 0.3;
      var wet = ctx.createGain();
      wet.gain.value = 0.2;
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(master);

      padBus = ctx.createGain();
      padBus.gain.value = 0.55;
      padBus.connect(master);

      noteBus = ctx.createGain();
      noteBus.gain.value = 0.6;
      noteBus.connect(master);
      noteBus.connect(delay);

      if (ctx.state === 'suspended') await ctx.resume();

      tickCount = 0;
      tick();
      timer = window.setInterval(tick, 520);
      playing = true;
    }

    function stop() {
      playing = false;
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      if (ctx && master) {
        var now = ctx.currentTime;
        try {
          master.gain.cancelScheduledValues(now);
          master.gain.setValueAtTime(master.gain.value, now);
          master.gain.linearRampToValueAtTime(0.0001, now + 0.5);
        } catch (err) { /* ignore */ }
      }
      var closing = ctx;
      ctx = null;
      master = null;
      padBus = null;
      noteBus = null;
      window.setTimeout(function () {
        if (closing && closing.state !== 'closed') {
          closing.close().catch(function () {});
        }
      }, 900);
    }

    function renderButton() {
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐');
      btn.classList.toggle('is-playing', playing);
      if (label) label.textContent = playing ? '暂停' : '音乐';
    }

    btn.addEventListener('click', async function () {
      if (playing) {
        stop();
        renderButton();
        showToast('音乐已暂停');
        return;
      }
      btn.disabled = true;
      try {
        await start();
        renderButton();
        showToast('音乐已开启 · 音量很轻');
      } catch (err) {
        stop();
        renderButton();
        showToast('这个浏览器暂时不能播放音乐');
      } finally {
        btn.disabled = false;
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (!ctx || !playing) return;
      if (document.hidden) {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        ctx.suspend().catch(function () {});
      } else {
        ctx.resume().then(function () {
          if (ctx && playing && !timer) {
            tickCount = 0;
            tick();
            timer = window.setInterval(tick, 520);
          }
        }).catch(function () {});
      }
    });

    renderButton();
  }

  /* ==========================================================
     12. 启动
     ========================================================== */

  bindCopy();
  renderLetter();
  renderPhoto();
  renderTimeline();
  renderReasons();
  initScrollUI();
  initSky();
  initCursorGlow();
  initCounter();
  initHeartButton();
  initLab();
  initBucket();
  initProposal();
  initMusic();
  initReveal();

  console.log('%c♥ 这封情书，只写给你。', 'color:#ff8fb1;font-size:14px;');
})();
