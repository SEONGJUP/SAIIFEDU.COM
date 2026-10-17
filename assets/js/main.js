(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- 5단계 탭 ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.step-list [role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var k = e.key, next = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowUp' || k === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- 다국어 자막 미리보기 (번역 예시 문구) ---------- */
  var LINES = {
    ko: '작업 전, 안전대 고리를 먼저 체결하세요',
    en: 'Before starting work, fasten your safety harness hook first.',
    zh: '作业前，请先扣好安全带挂钩。',
    vi: 'Trước khi làm việc, hãy móc khóa dây an toàn trước.',
    ru: 'Перед началом работы сначала закрепите карабин страховочного пояса.',
    uz: 'Ishni boshlashdan oldin xavfsizlik kamari ilgagini mahkamlang.'
  };
  var line = document.getElementById('lang-line');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.lang-chips button'));
  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      line.textContent = LINES[b.getAttribute('data-lang')];
      line.lang = b.getAttribute('data-lang');
    });
  });

  /* ---------- 상담 폼 (접수 API 연결 전: 검증 후 안내만 표시) ---------- */
  var form = document.getElementById('lead-form');
  var msg = document.getElementById('form-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (el) {
      var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !bad) bad = el;
    });
    if (bad) {
      msg.className = 'form-msg err';
      msg.textContent = '필수 항목(*)을 입력하고 개인정보 수집·이용에 동의해 주세요.';
      bad.focus();
      return;
    }
    // TODO: 접수 API(또는 폼 서비스) 연결 후 fetch로 전송
    msg.className = 'form-msg ok';
    msg.textContent = '입력 확인 완료. 온라인 접수 연결 전이므로 02-6358-5843 또는 biz@seiim.co.kr로 연락 주시면 바로 안내드립니다.';
  });

  /* ---------- 디자인 시안 선택 바 (시안 확정 후 삭제) ---------- */
  var DESC = {
    a: '로고 블루·네이비, 좌우 분할 · 대기업 안전/구매팀용 신뢰형',
    b: '홍보영상 톤의 틸 컬러, 중앙 정렬·둥근 카드 · 친근한 프로덕트형',
    c: '다크+안전 옐로, 현장 사진·경고 띠 · 강한 인상의 현장형'
  };
  var pick = Array.prototype.slice.call(document.querySelectorAll('.picker [data-style]'));
  var desc = document.getElementById('picker-desc');
  function setStyle(s) {
    root.setAttribute('data-style', s);
    pick.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-style') === s ? 'true' : 'false'); });
    if (desc) desc.textContent = DESC[s];
    try { localStorage.setItem('saiifedu-style', s); } catch (e) {}
  }
  pick.forEach(function (b) { b.addEventListener('click', function () { setStyle(b.getAttribute('data-style')); }); });
  window.addEventListener('hashchange', function () {
    var s = location.hash.replace('#', '');
    if (/^[abc]$/.test(s)) setStyle(s);
  });
  setStyle(root.getAttribute('data-style') || 'b');
})();
