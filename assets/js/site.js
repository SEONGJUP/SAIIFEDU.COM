(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };

  /* ---------- 한 문장 소개: 단어 단위로 쪼개기 ---------- */
  var reveal = $('[data-reveal]');
  var words = [];
  if (reveal && !reduce) {
    var HL = ['태블릿', '모국어로', '손가락으로', '이미', '완성되어'];
    reveal.innerHTML = reveal.textContent.trim().split(/\s+/).map(function (w) {
      var hl = HL.some(function (h) { return w.indexOf(h) === 0; });
      return '<span class="w' + (hl ? ' hl' : '') + '">' + w + '</span>';
    }).join(' ');
    words = $$('.w', reveal);
  }

  /* ---------- 스크롤 진행도 → CSS 변수 ---------- */
  var heroStage = $('.hero-stage');
  var docs = $('.docs');
  var statement = $('.statement');
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    if (heroStage) {
      var r = heroStage.getBoundingClientRect();
      heroStage.style.setProperty('--p', reduce ? 1 : clamp(1 - (r.top - vh * 0.1) / (vh * 0.65)).toFixed(3));
    }
    if (docs) {
      var d = docs.getBoundingClientRect();
      docs.style.setProperty('--p', reduce ? 1 : clamp((vh * 0.9 - d.top) / (vh * 0.75)).toFixed(3));
    }
    if (words.length && statement) {
      var s = statement.getBoundingClientRect();
      var p = clamp((vh * 0.8 - s.top) / (s.height * 0.75));
      var n = Math.round(p * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------- 5단계 스토리: 보이는 단계에 맞춰 태블릿 화면 전환 ---------- */
  var ipad = $('#flow-ipad');
  var steps = $$('.fstep');
  var dots = $$('.flow-dots li');
  function setStep(n) {
    if (!ipad) return;
    ipad.setAttribute('data-step', n);
    steps.forEach(function (s) { s.classList.toggle('on', s.getAttribute('data-step') === String(n)); });
    dots.forEach(function (d, i) { d.classList.toggle('on', i === n - 1); });
  }
  if ('IntersectionObserver' in window && steps.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setStep(Number(e.target.getAttribute('data-step'))); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }
  setStep(1);

  /* ---------- 다국어: 언어를 고르면 교안 제목과 자막이 바뀜 (번역 예시) ---------- */
  var L = {
    ko: ['한국어 자막', '표준교안 · 고소작업', '고소작업 안전수칙', '작업 전, 안전대 고리를 먼저 체결하세요'],
    en: ['English subtitles', 'Standard course · Work at height', 'Working at Height: Safety Rules', 'Before starting work, fasten your safety harness hook first.'],
    zh: ['中文字幕', '标准教材 · 高处作业', '高处作业安全守则', '作业前，请先扣好安全带挂钩。'],
    vi: ['Phụ đề tiếng Việt', 'Giáo trình chuẩn · Làm việc trên cao', 'Quy tắc an toàn khi làm việc trên cao', 'Trước khi làm việc, hãy móc khóa dây an toàn trước.'],
    ru: ['Русские субтитры', 'Стандартный курс · Работа на высоте', 'Правила безопасности при работе на высоте', 'Перед началом работы закрепите карабин страховочного пояса.'],
    uz: ['O‘zbekcha subtitr', 'Standart dastur · Balandlikda ishlash', 'Balandlikda ishlash xavfsizlik qoidalari', 'Ishni boshlashdan oldin xavfsizlik kamari ilgagini mahkamlang.']
  };
  var lgEls = ['#lg-name', '#lg-k', '#lg-t', '#lg-sub'].map(function (s) { return $(s); });
  var sw = $$('.swatches [role="radio"]');
  function setLang(btn, focus) {
    var code = btn.getAttribute('data-lang');
    sw.forEach(function (b) { var on = b === btn; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    lgEls.forEach(function (el, i) { if (el) { el.textContent = L[code][i]; el.lang = code; } });
    if (focus) btn.focus();
  }
  sw.forEach(function (b, i) {
    b.addEventListener('click', function () { setLang(b); });
    b.addEventListener('keydown', function (e) {
      var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
      if (d) { e.preventDefault(); setLang(sw[(i + d + sw.length) % sw.length], true); }
    });
  });
  if (sw.length) setLang(sw[0]);

  /* ---------- 숫자 카운트업 ---------- */
  var nums = $$('[data-count]');
  if (!reduce && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, to = Number(el.getAttribute('data-count')), t0 = performance.now();
        (function tick(t) {
          var k = Math.min(1, (t - t0) / 1400);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { co.observe(n); });
  }

})();
