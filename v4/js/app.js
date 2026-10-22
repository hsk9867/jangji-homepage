/* 배웅 시안 v4 — 메인 구성은 속시원 방식(이모지 바로가기·후기 탭·상담사 카드·이용안내), 톤앤매너는 v2. 콘텐츠는 ../js/defaults.js (CONTENT_DEFAULT) */
(function () {
  var C = window.CONTENT_DEFAULT;
  var S = C.site;
  var ROOT = '../';
  var TYPE_KEYS = ['sumok', 'napgol', 'maejang', 'ijang'];
  var EHANEUL = 'https://www.15774129.go.kr/';
  var ICON = {
    phone: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>',
    kakao: '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.4.3.7.6.5l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>',
    form: '<svg viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
    flame: '<svg viewBox="0 0 24 24"><path d="M13.5 2s.6 3.3-1.4 5.7C10.3 9.8 8 11 8 14.4A5.5 5.5 0 0 0 13.5 20c3.2 0 5.5-2.3 5.5-5.6 0-2.4-1.3-4-2.3-5.2-.3 1.2-1 2.2-2 2.7.6-2.7-.3-7.3-1.2-9.9zM6.3 9.3C5.1 10.6 4 12.4 4 14.6A8 8 0 0 0 12 22c-2.5-.8-4.5-3.2-4.5-6.2 0-1.5.4-2.6 1-3.6-.9-.6-1.7-1.6-2.2-2.9z"/></svg>',
    map: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-1 16H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V6h10v4z"/></svg>',
    scale: '<svg viewBox="0 0 24 24"><path d="M12 3a1 1 0 0 1 1 1v1h5l3 7a3.5 3.5 0 0 1-7 0l2.3-5H13v12h4v2H7v-2h4V7H8.7L11 12a3.5 3.5 0 0 1-7 0l3-7h5V4a1 1 0 0 1 1-1zM6 9.2 4.3 13h3.4L6 9.2zm12 0L16.3 13h3.4L18 9.2z"/></svg>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function img(p) { return p ? (/^(https?:)?\/\//.test(p) ? p : ROOT + p) : ''; }
  function tel(p) { return 'tel:' + String(p || '').replace(/[^0-9+]/g, ''); }
  function qs(k) { return new URLSearchParams(location.search).get(k) || ''; }
  function typeOf(k) { return C.types[k] || { name: '' }; }
  function facilities(type) { return (C.facilities || []).filter(function (f) { return f.visible !== false && (!type || f.type === type); }); }
  function facility(id) { return (C.facilities || []).filter(function (f) { return f.id === id; })[0]; }
  function here() { return location.pathname.split('/').pop() || 'index.html'; }
  function alertBox(msg) { var d = document.createElement('div'); d.textContent = msg; d.style.cssText = 'position:fixed;left:50%;bottom:100px;transform:translateX(-50%);background:#252525;color:#fff;padding:12px 20px;border-radius:999px;font-size:14px;z-index:99;box-shadow:0 8px 24px rgba(0,0,0,.2)'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2200); }

  /* ---------- 공통 틀: 헤더·푸터·플로팅 ---------- */
  var NAV = [['service.html?type=sumok', '수목장'], ['service.html?type=napgol', '봉안당'], ['service.html?type=maejang', '매장묘·파묘'], ['service.html?type=cremation', '화장장 예약'], ['service.html?type=support', '장례지원금'], ['index.html#reviews', '상담 후기', (C.reviews || []).length]];
  function shell() {
    var head = '<header class="header"><div class="in">' +
      '<a class="logo" href="index.html" aria-label="배웅 홈"><img src="img/logo-h.png" alt="배웅"></a>' +
      '<nav class="gnb" aria-label="주 메뉴">' + NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + (n[2] ? '<span class="n">' + n[2] + '</span>' : '') + '</a>'; }).join('') + '</nav>' +
      '<div class="pills"><a class="pill red" href="' + tel(S.phone) + '">' + ICON.phone + '연중무휴 상담</a><a class="pill" href="' + ROOT + 'facilities.html">' + ICON.map + '시설 찾기</a></div>' +
      '<button class="burger" id="burger" aria-label="메뉴 열기"><span></span><span></span><span></span></button></div>' +
      '<nav class="subnav" aria-label="빠른 메뉴">' + NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join('') + '<a href="contact.html">상담 신청</a></nav></header>' +
      '<div class="drawer" id="drawer"><div class="panel"><button class="close" id="drawerClose" aria-label="닫기">×</button><img src="img/logo-h.png" alt="배웅" style="height:30px;width:auto;margin-bottom:14px">' +
      NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join('') + '<a href="index.html#counselors">배웅 상담사</a><a href="contact.html">상담 신청</a>' +
      '<a href="' + tel(S.phone) + '">전화 상담 ' + esc(S.phone) + '</a>' + (S.kakao ? '<a href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카카오톡 상담</a>' : '') + '</div></div>';
    var foot = '<footer class="footer"><img src="img/logo-h.png" alt="배웅">' +
      '<div class="links"><a href="index.html#story">배웅 이야기</a>' + (S.blogUrl ? '<a href="' + esc(S.blogUrl) + '" target="_blank" rel="noopener">배웅 블로그</a>' : '') + '<a href="' + ROOT + 'privacy.html" class="b">개인정보처리방침</a><a href="' + ROOT + 'facilities.html">답사 시설</a><a href="' + ROOT + 'reviews.html">상담 후기</a><a href="contact.html">상담 신청</a><a href="' + ROOT + '">기존 홈페이지 보기</a></div>' +
      '<div class="info">' + esc(S.bizName) + '<br>' + esc(S.bizDesc) + '<br>전화 문의: ' + esc(S.phone) + ' · ' + esc(S.hours) + (S.email ? '<br>이메일: ' + esc(S.email) : '') + (S.bizNo ? '<br>사업자 등록번호: ' + esc(S.bizNo) : '') + '</div>' +
      '<div class="copy">© ' + new Date().getFullYear() + '. ' + esc(S.bizName) + ' ALL RIGHTS RESERVED.</div></footer>';
    var fab = '<div class="fabs">' +
      '<a class="fab support" href="service.html?type=support" aria-label="장례지원금 안내"><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm2 3v2h14v-2zm2 5h4v1.5H7z"/></svg>지원금</a>' +
      (S.kakao ? '<a class="fab kakao" href="' + esc(S.kakao) + '" target="_blank" rel="noopener" aria-label="카카오톡 상담">' + ICON.kakao + '카톡</a>' : '') +
      '<a class="fab tel" href="' + tel(S.phone) + '" aria-label="전화 상담">' + ICON.phone + '전화</a>' +
      '<a class="fab" href="service.html?type=cremation" aria-label="화장장 예약 안내">' + ICON.flame + '화장장 예약</a></div>';
    document.body.insertAdjacentHTML('afterbegin', head);
    var col = document.querySelector('.col');
    if (col) col.insertAdjacentHTML('beforeend', foot);
    document.body.insertAdjacentHTML('beforeend', fab);
    var dr = document.getElementById('drawer');
    document.getElementById('burger').onclick = function () { dr.classList.add('open'); };
    document.getElementById('drawerClose').onclick = function () { dr.classList.remove('open'); };
    dr.onclick = function (e) { if (e.target === dr) dr.classList.remove('open'); };
  }

  /* ---------- 첫 화면 (v4: 속시원식 구성 + v2 톤앤매너) ---------- */
  var LI = {
    tree: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 7 10h3l-3.5 5H11v4h2v-4h4.5L14 10h3z"/></svg>',
    hall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10m14 11V10M9 21v-7m6 7v-7M3 10h18L12 4z"/></svg>',
    tomb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20V9a5 5 0 0 1 10 0v11M4 20h16M9.5 13h5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4M9 15.5l2 2 4-4"/></svg>',
    support: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 11h18M7 15h3"/><circle cx="16.5" cy="15" r="1.3"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-5.4-6-11a6 6 0 0 1 12 0c0 5.6-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.25 1z"/></svg>',
    compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M4 7h16M6 7l-3 7a3 3 0 0 0 6 0zm12 0-3 7a3 3 0 0 0 6 0zM8 21h8"/></svg>',
    walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4.5" r="1.6"/><path d="M10 21l2-6 2.5 2.5V21M8.5 13.5 10 9.5l3-1 2.5 3 2.5.8M10 9.5 7 11l-1 3.5"/></svg>',
    contract: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h4"/></svg>'
  };
  var QUICK = [
    ['sumok', LI.tree, '수목장', 'service.html?type=sumok'],
    ['napgol', LI.hall, '봉안당', 'service.html?type=napgol'],
    ['maejang', LI.tomb, '매장묘/파묘', 'service.html?type=maejang'],
    ['cremation', LI.calendar, '화장장 예약', 'service.html?type=cremation'],
    ['support', LI.support, '장례지원금', 'service.html?type=support'],
    ['facility', LI.pin, '답사 시설', ROOT + 'facilities.html']
  ];
  var REV_TABS = [['', '전체'], ['sumok', '수목장'], ['napgol', '봉안당'], ['maejang', '매장묘'], ['ijang', '파묘/이장']];
  var COUNSELORS = [
    { name: '김도윤', role: '장례 절차 상담', quote: '마음을 다해 함께하겠습니다', tags: ['차분한 절차 안내', '가족 중심 상담'], img: 'img/counselor-1.jpg' },
    { name: '이서연', role: '장지 비교 · 동행 답사', quote: '가족이 자주 찾아뵐 수 있는 곳을 먼저 봅니다', tags: ['주말 동행 답사', '서면 조건 비교'], img: '' },
    { name: '박준호', role: '파묘 · 이장 상담', quote: '절차는 저희가, 가족은 마음만 챙기세요', tags: ['개장 신고 대행', '길일 협의'], img: '' }
  ];
  var GUIDE_ICONS = [LI.phone, LI.compare, LI.walk, LI.contract];
  var GUIDE_LINKS = ['contact.html', ROOT + 'facilities.html', 'contact.html', 'contact.html'];
  function dragScroll(wrap) {
    if (!wrap) return;
    var down = false, sx = 0, sl = 0, moved = false;
    wrap.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') return; down = true; moved = false; sx = e.clientX; sl = wrap.scrollLeft; wrap.classList.add('drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; wrap.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; wrap.classList.remove('drag'); });
    wrap.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }
  /* 자연스러운 자동 슬라이드: 카드 묶음을 한 번 복제해 끊김 없이 흐르고, 손을 대거나 마우스를 올리면 멈춘다 */
  function autoSlide(wrap, track, speed) {
    if (!wrap || !track || track.children.length < 2) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (track.dataset.auto) { track.dataset.stop = '1'; }
    track.dataset.auto = '1'; track.dataset.stop = '';
    var kids = Array.prototype.slice.call(track.children);
    kids.forEach(function (k) { var c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; track.appendChild(c); });
    var half = 0, paused = false, last = 0, idleT, pos = wrap.scrollLeft;
    function measure() { half = track.scrollWidth / 2; }
    wrap.addEventListener('scroll', function () { if (paused) pos = wrap.scrollLeft; }, { passive: true });
    measure();
    function pause() { paused = true; clearTimeout(idleT); }
    function resume() { clearTimeout(idleT); idleT = setTimeout(function () { paused = false; }, 1800); }
    wrap.classList.add('auto');
    wrap.addEventListener('pointerenter', pause); wrap.addEventListener('pointerleave', resume);
    wrap.addEventListener('pointerdown', pause); wrap.addEventListener('pointerup', resume);
    wrap.addEventListener('touchstart', pause, { passive: true }); wrap.addEventListener('touchend', resume);
    wrap.addEventListener('focusin', pause); wrap.addEventListener('focusout', resume);
    function step(now) {
      if (track.dataset.stop) return;
      var dt = last ? Math.min(1000, now - last) : 16; last = now;
      if (!paused && !document.hidden) {
        if (!half) measure();
        pos += (speed || 28) * dt / 1000;
        if (half && pos >= half) pos -= half;
        wrap.scrollLeft = pos;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    window.addEventListener('resize', measure);
  }
  function arrows(sec, wrap) {
    sec.querySelectorAll('.arr[data-dir]').forEach(function (b) { b.onclick = function () { wrap.scrollBy({ left: (b.dataset.dir === 'prev' ? -1 : 1) * Math.round(wrap.clientWidth * .8), behavior: 'smooth' }); }; });
  }
  function home() {
    /* 첫 접속 인트로(전체 화면 CSS 효과): 문구가 단어별로 떠오른 뒤 로고로 바뀌고 사라진다. 세션당 1회, ?intro=1 로 다시 보기 */
    var seen = false; try { seen = !!sessionStorage.getItem('bw_intro'); } catch (e) {}
    if ((!seen && !/intro=0/.test(location.search)) || /intro=1/.test(location.search)) {
      var words = ['모실', '곳을', '정하는', '일,', null, '배웅이', '함께', '걷습니다'], wi = 0;
      document.body.insertAdjacentHTML('afterbegin', '<div class="bw-intro" aria-hidden="true"><div class="in"><p class="t">' +
        words.map(function (w) { return w === null ? '<br>' : '<span style="--i:' + (wi++) + '">' + w + '</span>'; }).join(' ') + '</p><img class="lg" src="img/logo-intro.jpg" alt=""></div></div>');
      try { sessionStorage.setItem('bw_intro', '1'); } catch (e) {}
      if (/introhold/.test(location.search)) document.querySelector('.bw-intro').classList.add('hold');
      else setTimeout(function () { var el = document.querySelector('.bw-intro'); if (el) el.remove(); }, 4900);
    }

    /* 슬라이드 */
    var SL = [
      { img: 'img/slide-sumok.jpg', chip: '수목장 분양 안내', tx: '직접 답사한 수목장만,<br>분양 조건을 서면으로 비교해 드려요', href: 'service.html?type=sumok' },
      { img: 'img/fac/haneulmun-2.jpg', chip: '화장장 예약 안내', tx: '화장장 예약이 처음이라면<br>희망 지역만 알려주세요', href: 'service.html?type=cremation' },
      { img: 'img/fac/bundanghome-1.jpg', chip: '주말 무료 동행 답사', tx: '주말에도 상담사가<br>현장에 함께 갑니다', href: 'contact.html' }
    ];
    var sl = document.getElementById('slider'), dots = document.getElementById('dots'), cur = 0, timer;
    if (sl) {
      sl.innerHTML = SL.map(function (s, i) { return '<a class="slide' + (i === 0 ? ' on' : '') + '" href="' + s.href + '"><img src="' + img(s.img) + '" alt=""><span class="chip">' + s.chip + '</span><span class="tx">' + s.tx + '</span></a>'; }).join('');
      dots.innerHTML = SL.map(function (s, i) { return '<button type="button" aria-label="슬라이드 ' + (i + 1) + '"' + (i === 0 ? ' class="on"' : '') + '></button>'; }).join('');
      var go = function (i) { cur = (i + SL.length) % SL.length; sl.querySelectorAll('.slide').forEach(function (e, j) { e.classList.toggle('on', j === cur); }); dots.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('on', j === cur); }); };
      dots.querySelectorAll('button').forEach(function (b, i) { b.onclick = function () { go(i); clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 5000); }; });
      timer = setInterval(function () { go(cur + 1); }, 5000);
    }

    /* 실적 띠: 보일 때 숫자가 올라간다 */
    var STATS = [
      { n: 100, suffix: '+', unit: '곳', label: '상담 가능 장지' },
      { n: 23524, suffix: '', unit: '건', label: '누적 상담 신청' },
      { n: 21233, suffix: '', unit: '건', label: '누적 계약 체결' },
      { n: 98, suffix: '%', unit: '', label: '고객 만족도' }
    ];
    var stl = document.getElementById('statList');
    if (stl) {
      stl.innerHTML = STATS.map(function (s) { return '<li><b><span class="num" data-n="' + s.n + '">' + s.n.toLocaleString('ko-KR') + '</span>' + s.suffix + (s.unit ? '<small>' + s.unit + '</small>' : '') + '</b><span class="lb">' + s.label + '</span></li>'; }).join('');
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce && 'IntersectionObserver' in window) {
        var ran = false;
        var io = new IntersectionObserver(function (es) {
          if (!es[0].isIntersecting || ran) return; ran = true; io.disconnect();
          stl.querySelectorAll('.num').forEach(function (el) {
            var to = Number(el.dataset.n), t0 = performance.now(), dur = 1400;
            (function tick(now) { var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e).toLocaleString('ko-KR'); if (p < 1) requestAnimationFrame(tick); })(t0);
          });
        }, { threshold: .4 });
        stl.querySelectorAll('.num').forEach(function (el) { el.textContent = '0'; });
        io.observe(stl);
      }
    }

    /* 6개 이모지 바로가기 */
    var ig = document.getElementById('igrid');
    if (ig) ig.innerHTML = QUICK.map(function (q) { return '<a href="' + q[3] + '"><span class="ico"><span class="em" aria-hidden="true">' + q[1] + '</span></span><span>' + q[2] + '</span></a>'; }).join('');

    /* 후기: 유형 탭 + 가로 카드 */
    var rf = document.getElementById('rvFilter'), rtrack = document.getElementById('rvTrack'), rwrap = document.getElementById('rvWrap');
    if (rf) {
      var revs = (C.reviews || []).filter(function (x) { return x.visible !== false; });
      rf.innerHTML = REV_TABS.map(function (k, i) { var n = revs.filter(function (r) { return !k[0] || r.type === k[0]; }).length; return '<button type="button"' + (i === 0 ? ' class="on"' : '') + ' data-k="' + k[0] + '">' + k[1] + (n ? ' <small>' + n + '</small>' : '') + '</button>'; }).join('');
      var drawR = function (k) {
        var list = revs.filter(function (r) { return !k || r.type === k; });
        if (!list.length) { rtrack.innerHTML = '<div class="rv-empty">' + (REV_TABS.filter(function (t) { return t[0] === k; })[0] || ['', ''])[1] + ' 후기는 준비 중입니다. 블로그에서 동행 기록을 먼저 보실 수 있어요.</div>'; return; }
        rtrack.innerHTML = list.map(function (x) {
          var f = facility(x.facilityId), ph = (x.photos || [])[0] || (f && (f.photos || [])[0]) || (typeOf(x.type).image || '');
          var tp = (REV_TABS.filter(function (t) { return t[0] === x.type; })[0] || ['', typeOf(x.type).name])[1];
          return '<a class="rv" href="' + esc(x.blogUrl || S.blogUrl || '#') + '" target="_blank" rel="noopener">' + (ph ? '<div class="ph"><img src="' + img(ph) + '" alt="" loading="lazy"></div>' : '') +
            '<div class="bd"><span class="tp">' + esc(tp) + (f ? ' · ' + esc(f.name) : '') + '</span><b>' + esc(x.title) + '</b><p>' + esc((x.body || '').replace(/\n+/g, ' ')) + '</p><span class="who">' + esc(x.author) + '<span>' + esc(x.date) + '</span></span></div></a>';
        }).join('');
        rwrap.scrollLeft = 0;
        autoSlide(rwrap, rtrack, 26);
      };
      drawR('');
      rf.querySelectorAll('button').forEach(function (b) { b.onclick = function () { rf.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); drawR(b.dataset.k); }; });
      dragScroll(rwrap); arrows(document.getElementById('reviews'), rwrap);
    }

    /* 상담사 카드 */
    var cn = document.getElementById('cnTrack');
    if (cn) {
      cn.innerHTML = COUNSELORS.map(function (c) {
        return '<article class="cn"><div class="top"><div class="txt"><span class="badge">배웅 상담원</span><h3>' + esc(c.name) + ' <small>상담원</small></h3><div class="role">' + esc(c.role) + '</div><p>' + esc(c.quote) + '</p></div>' +
          (c.img ? '<img class="pic" src="' + c.img + '" alt="' + esc(c.name) + ' 상담원">' : '<div class="pic ph" aria-hidden="true"><span>' + esc(c.name.slice(0, 1)) + '</span><small>사진 준비 중</small></div>') + '</div>' +
          '<ul class="chk">' + c.tags.map(function (t) { return '<li>' + ICON.check + esc(t) + '</li>'; }).join('') + '</ul>' +
          '<a class="btn btn-line btn-block btn-sm" href="contact.html?memo=' + encodeURIComponent(c.name + ' 상담원 상담 요청') + '">상담 문의</a></article>';
      }).join('');
      dragScroll(document.getElementById('cnWrap')); arrows(document.getElementById('counselors'), document.getElementById('cnWrap'));
      autoSlide(document.getElementById('cnWrap'), cn, 22);
    }

    /* 서비스 이용안내 4단계 */
    var gg = document.getElementById('guideGrid');
    if (gg) gg.innerHTML = (S.steps || []).map(function (g, i) { return '<a class="gd" href="' + (GUIDE_LINKS[i] || 'contact.html') + '"><div><span class="st">0' + (i + 1) + '</span><b>' + esc(g.t) + '</b><p>' + esc(g.d) + '</p></div><span class="ic" aria-hidden="true">' + (GUIDE_ICONS[i] || LI.phone) + '</span></a>'; }).join('');

    /* 답사 시설: 유형 태그 + 행 */
    var ft = document.getElementById('facTags'), fl = document.getElementById('facList');
    if (ft) {
      var fkeys = ['sumok', 'napgol', 'maejang'];
      ft.innerHTML = fkeys.map(function (k, i) { return '<button type="button" class="tag' + (i === 0 ? ' on' : '') + '" data-k="' + k + '">' + typeOf(k).name + ' ' + facilities(k).length + '</button>'; }).join('');
      var drawF = function (k) {
        fl.innerHTML = facilities(k).slice(0, 4).map(function (f) {
          var ph = (f.photos || [])[0];
          return '<a class="frow" href="facility.html?id=' + esc(f.id) + '">' + (ph ? '<img src="' + img(ph) + '" alt="" loading="lazy">' : '<span></span>') + '<div><div class="nm">' + esc(f.name) + '</div><div class="ar">' + esc(f.area) + (f.featured ? ' · 배웅 추천' : '') + '</div>' + (f.tags && f.tags.length ? '<div class="tg">' + f.tags.slice(0, 3).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') + '</div></a>';
        }).join('');
      };
      drawF('sumok');
      ft.querySelectorAll('.tag').forEach(function (b) { b.onclick = function () { ft.querySelectorAll('.tag').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); drawF(b.dataset.k); }; });
    }

    /* 연락 */
    var ck = document.getElementById('ctKakao'); if (ck) { if (S.kakao) ck.href = S.kakao; else ck.remove(); }
    var ct = document.getElementById('ctTel'); if (ct) ct.href = tel(S.phone);
    var bc = document.getElementById('brandCard'); if (bc) bc.href = S.blogUrl || ROOT;
  }

  /* ---------- 서비스 안내 페이지 (6개 바로가기용) ---------- */
  var EXTRA = {
    cremation: {
      name: '화장장 예약 안내', short: '화장장 예약은 보건복지부 e하늘 장사정보시스템에서만 할 수 있어요. 배웅이 예약 방법과 가능한 일정을 함께 확인해 드립니다.',
      priceTag: '화장 비용', price: '지역 주민 무료~수십만원', priceNote: '화장장마다 관내·관외 요금이 달라요. 거주지 기준으로 함께 확인해 드려요.',
      desc: '임종 후 화장장 예약은 가장 먼저, 그리고 가장 빨리 해야 하는 일입니다. 원하는 날짜·시간대가 금방 마감되기 때문에 희망 지역과 일정만 알려주시면 배웅이 e하늘에서 가능한 일정을 바로 확인해 드립니다.',
      steps: [{ t: '희망 지역·일정 전달', d: '거주지, 장례식장, 발인 예정일을 알려주세요.' }, { t: 'e하늘 가능 일정 확인', d: '관내·관외 화장장의 빈 시간대를 함께 확인합니다.' }, { t: '예약과 서류 안내', d: '사망진단서 등 필요한 서류와 예약 방법을 안내해 드려요.' }, { t: '화장 후 모실 곳까지', d: '수목장·봉안당 등 화장 이후 장지까지 이어서 상담합니다.' }],
      faqs: [{ q: '배웅이 대신 예약해 주나요?', a: '예약은 유족 명의로만 가능해 배웅이 방법과 일정을 옆에서 함께 확인해 드립니다. 처음이어도 10분이면 끝나요.' }, { q: '원하는 날짜가 없으면요?', a: '인근 다른 화장장의 일정을 바로 찾아보고, 발인 일정 조정이 필요하면 장례식장과 조율하는 방법까지 안내해 드려요.' }],
      cta: 'cremation'
    },
    support: {
      name: '장례지원금 안내', short: '정부와 지자체가 지원하는 장례 관련 지원금을 놓치지 않도록 배웅이 대상 여부와 신청 방법을 확인해 드려요.',
      priceTag: '대표 지원금', price: '장제급여 80만원 등', priceNote: '기초생활수급자 장제급여, 지자체 화장장려금, 국가유공자 장례 지원 등 자격에 따라 달라요.',
      desc: '장례 뒤에 신청할 수 있는 지원금은 종류가 많고 지자체마다 금액과 조건이 달라서 모르고 지나치는 가족이 많습니다. 배웅은 상담 과정에서 받을 수 있는 지원금을 함께 확인하고 신청 서류를 안내해 드립니다.',
      steps: [{ t: '대상 확인', d: '고인과 신청인의 자격(수급 여부, 거주지, 유공자 등)을 확인합니다.' }, { t: '지원금 종류 안내', d: '장제급여, 화장장려금, 자연장 장려금 등 받을 수 있는 항목을 정리해 드려요.' }, { t: '서류 준비', d: '사망진단서, 화장증명서, 가족관계증명서 등 필요한 서류를 안내합니다.' }, { t: '신청 방법 안내', d: '주민센터·복지로 신청 절차를 단계별로 알려 드려요.' }],
      faqs: [{ q: '누구나 받을 수 있나요?', a: '지원금마다 대상이 달라요. 기초생활수급자 장제급여처럼 자격이 필요한 것도 있고, 화장장려금처럼 거주 지역 조건만 맞으면 되는 것도 있어요.' }, { q: '기간이 정해져 있나요?', a: '대부분 사망일 또는 화장일로부터 일정 기간 안에 신청해야 해요. 상담 때 기한부터 확인해 드립니다.' }],
      cta: 'unsure'
    }
  };
  /* ---------- 서비스 안내 (전체 한눈에, 속시원 '어떤 서비스인지 먼저 볼게요') ---------- */
  function servicesPage() {
    var el = document.getElementById('svpage'); if (!el) return;
    document.title = '서비스 안내 | 배웅';
    var T = C.types;
    var stepT = function (arr) { return (arr || S.steps || []).map(function (x) { return x.t; }); };
    var SV = [
      { k: 'sumok', ic: LI.tree, eyebrow: '수목장', h: '나무 아래, 자연으로 모시는 수목장', p: T.sumok.desc, who: '자연 속에 모시고 싶고 관리 부담을 줄이고 싶은 가족', cost: T.sumok.priceTag + ' ' + T.sumok.price + ' · ' + T.sumok.priceNote, do_: '직접 답사한 수목장 가운데 조건에 맞는 곳 비교, 주말 동행 답사, 계약 대행', steps: stepT(), href: 'service.html?type=sumok', btn: '수목장 자세히 보기' },
      { k: 'napgol', ic: LI.hall, eyebrow: '봉안당(납골당)', h: '날씨와 상관없이 찾아뵙는 실내 봉안시설', p: T.napgol.desc, who: '자주 찾아뵙고 싶은 가족, 도심에서 가까운 곳을 원하는 분', cost: T.napgol.priceTag + ' ' + T.napgol.price + ' · ' + T.napgol.priceNote, do_: '단 위치·관리비·이용 기간을 서면으로 비교, 동행 답사, 계약 대행', steps: stepT(), href: 'service.html?type=napgol', btn: '봉안당 자세히 보기' },
      { k: 'maejang', ic: LI.tomb, eyebrow: '매장묘 · 파묘', h: '가족이 함께 모이는 묘역, 그리고 묘를 옮겨야 할 때', p: T.maejang.desc + ' 기존 묘를 정리해야 한다면 개장 신고부터 파묘, 화장, 새 장지 안치까지 배웅이 대행합니다.', who: '가족 묘역을 원하는 분, 기존 묘를 정리·이장해야 하는 분', cost: T.maejang.priceTag + ' ' + T.maejang.price + ' · 파묘·이장은 분묘 수와 장비 진입 여부에 따라 현장 확인 후 견적', do_: '공원묘지 비교·계약 대행, 파묘·이장 절차 대행(개장 신고·길일 협의·유골 수습·새 장지 안치)', steps: stepT(), href: 'service.html?type=maejang', btn: '매장묘·파묘 자세히 보기' },
      { k: 'cremation', ic: LI.calendar, eyebrow: '화장장 예약', h: '임종 후 가장 먼저 잡아야 하는 화장 일정', p: EXTRA.cremation.desc, who: '임종 직후 화장 일정을 빨리 잡아야 하는 가족, e하늘 예약이 처음인 분', cost: EXTRA.cremation.priceTag + ' ' + EXTRA.cremation.price + ' · ' + EXTRA.cremation.priceNote, do_: 'e하늘에서 가능한 일정 확인, 필요한 서류 안내, 화장 이후 모실 곳까지 이어서 상담', steps: stepT(EXTRA.cremation.steps), href: 'service.html?type=cremation', btn: '화장장 예약 안내 보기' },
      { k: 'support', ic: LI.support, eyebrow: '장례지원금', h: '놓치기 쉬운 장례 지원금, 함께 확인해요', p: EXTRA.support.desc, who: '장제급여·화장장려금 등을 받을 수 있는지 궁금한 가족', cost: EXTRA.support.priceTag + ' ' + EXTRA.support.price + ' · ' + EXTRA.support.priceNote, do_: '대상 여부 확인, 지원금 종류 정리, 서류와 신청 방법 안내', steps: stepT(EXTRA.support.steps), href: 'service.html?type=support', btn: '장례지원금 안내 보기' },
      { k: 'facility', ic: LI.pin, eyebrow: '답사 시설', h: '배웅이 직접 다녀온 장지만 보여드려요', p: '배웅 상담팀이 직접 방문해 진입로, 주차, 관리 상태까지 확인한 경기도 시설 ' + facilities().length + '곳입니다. 사진과 위치, 사용료를 먼저 보고 마음에 드는 곳으로 바로 상담을 신청할 수 있어요.', who: '어떤 곳들이 있는지부터 둘러보고 싶은 분', cost: '사용료·관리비는 시설별로 표기 · 계약 전 서면으로 다시 비교', do_: '시설별 사진·위치·특징 정리, 마음에 드는 곳으로 동행 답사', steps: ['유형 고르기', '시설 상세 보기', '이 시설로 상담 신청', '동행 답사'], href: ROOT + 'facilities.html', btn: '답사 시설 전체 보기' }
    ];
    el.innerHTML = '<section class="sec svcs-hero"><p class="crumb"><a href="index.html">홈</a> › 서비스 안내</p><h1>잘 몰라도 괜찮아요.<br>어떤 서비스인지 먼저 보고 고르세요</h1><p class="lead">배웅이 하는 일 여섯 가지를 한 번에 정리했어요. 상담과 동행 답사는 모두 무료입니다.</p>' +
      '<nav class="svc-tabs" aria-label="서비스 바로가기">' + SV.map(function (s) { return '<a href="#sv-' + s.k + '">' + s.eyebrow + '</a>'; }).join('') + '</nav></section>' +
      SV.map(function (s, i) {
        return '<section class="sec svc' + (i % 2 ? ' gray' : '') + '" id="sv-' + s.k + '"><div class="svc-head"><span class="em" aria-hidden="true">' + s.ic + '</span><div><span class="eyebrow">' + esc(s.eyebrow) + '</span><h2>' + esc(s.h) + '</h2></div></div>' +
          '<p class="lead">' + esc(s.p) + '</p>' +
          '<div class="svc-grid"><div><b>이런 분께</b><span>' + esc(s.who) + '</span></div><div><b>비용은</b><span>' + esc(s.cost) + '</span></div><div><b>배웅이 하는 일</b><span>' + esc(s.do_) + '</span></div></div>' +
          '<ol class="svc-steps">' + s.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
          '<div class="svc-acts"><a class="btn btn-primary" href="' + s.href + '">' + esc(s.btn) + '</a><a class="btn btn-line" href="contact.html?type=' + (s.k === 'facility' ? 'unsure' : s.k) + '">상담 신청</a></div></section>';
      }).join('') +
      '<section class="sec"><div class="contact-box"><small>어떤 서비스가 맞는지 모르겠다면</small><b>그냥 전화 주세요. 상담하며 같이 정해요</b><div class="acts"><a class="btn btn-primary" href="contact.html?type=unsure">상담 신청</a><a class="btn btn-white" href="' + tel(S.phone) + '">전화문의</a>' + (S.kakao ? '<a class="btn btn-white" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카톡문의</a>' : '') + '</div></div></section>';
    if (location.hash) { var t = document.querySelector(location.hash); if (t) setTimeout(function () { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }
  }

  function servicePage() {
    var el = document.getElementById('spage'); if (!el) return;
    var k = qs('type') || 'sumok';
    var t = C.types[k] || EXTRA[k]; if (!t) { k = 'sumok'; t = C.types[k]; }
    var q = QUICK.filter(function (x) { return x[0] === k; })[0];
    document.title = t.name + ' | 배웅';
    var list = C.types[k] ? facilities(k) : [];
    var cta = (t.cta || k);
    var html = '<section class="sec svc-hero"><p class="crumb"><a href="index.html">홈</a> › ' + esc(t.name) + '</p><div class="svc-head"><span class="em" aria-hidden="true">' + (q ? q[1] : LI.tree) + '</span><div><h1>' + esc(t.name) + '</h1><p class="lead">' + esc(t.short) + '</p></div></div>' +
      '<div class="info-box"><i>' + ICON.scale + '</i><div><b>' + esc(t.priceTag) + ' ' + esc(t.price) + '</b><br>' + esc(t.priceNote) + '</div></div></section>' +
      '<section class="sec gray"><h2>어떤 서비스인가요?</h2><p class="lead">' + esc(t.desc) + '</p>' +
      (t.pros ? '<div class="pc"><div class="gcard"><b>이런 점이 좋아요</b><ul class="dotl">' + t.pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' + (t.cons ? '<div class="gcard"><b>이런 점은 확인하세요</b><ul class="dotl">' + t.cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') + '</div>' : '') +
      (t.reasons ? '<div class="gcard" style="margin-top:14px"><b>이럴 때 파묘·이장을 생각합니다</b><ul class="dotl">' + t.reasons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
      (t.recommend ? '<div class="gcard" style="margin-top:14px"><b>이런 가족께 권해요</b><ul class="dotl">' + [].concat(t.recommend).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') + '</section>' +
      (k === 'maejang' ? '<section class="sec"><h2>파묘·이장도 함께 진행해요</h2><p class="lead">' + esc(typeOf('ijang').short) + '</p><a class="btn btn-line btn-block mt12" href="service.html?type=ijang">파묘·이장 안내 보기</a></section>' : '') +
      ((t.steps || S.steps) ? '<section class="sec' + (k === 'maejang' ? ' gray' : '') + '"><h2>진행 순서</h2><div class="sgrid v">' + (t.steps || S.steps).map(function (x, i) { return '<div><span class="idx">0' + (i + 1) + '</span><b>' + esc(x.t) + '</b><span>' + esc(x.d) + '</span></div>'; }).join('') + '</div></section>' : '') +
      (list.length ? '<section class="sec gray"><h2>직접 답사한 ' + esc(t.name) + ' <small class="cnt">' + list.length + '곳</small></h2><div class="flist">' + list.slice(0, 6).map(function (f) { var ph = (f.photos || [])[0]; return '<a class="frow" href="facility.html?id=' + esc(f.id) + '">' + (ph ? '<img src="' + img(ph) + '" alt="" loading="lazy">' : '<span></span>') + '<div><div class="nm">' + esc(f.name) + '</div><div class="ar">' + esc(f.area) + (f.price ? ' · ' + esc(f.price) : '') + '</div></div></a>'; }).join('') + '</div><a class="btn btn-line btn-block mt12" href="' + ROOT + 'facilities.html">답사 시설 전체 보기</a></section>' : '') +
      (t.faqs ? '<section class="sec"><h2>자주 묻는 질문</h2><div class="faq">' + t.faqs.map(function (f, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('') + '</div></section>' : '') +
      '<section class="sec gray"><div class="contact-box"><small>' + esc(t.name) + ', 더 궁금한 점이 있으시면</small><b>연중무휴 언제든 부담없이 연락해 주세요</b><div class="acts"><a class="btn btn-primary" href="contact.html?type=' + esc(cta) + '">상담 신청</a><a class="btn btn-white" href="' + tel(S.phone) + '">전화문의</a>' + (S.kakao ? '<a class="btn btn-white" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카톡문의</a>' : '') + '</div></div></section>';
    el.innerHTML = html;
  }

  /* ---------- 상담 신청 ---------- */
  var TYPES = [
    ['sumok', '수목장 분양', '나무 아래 자연장'], ['napgol', '봉안당(납골당)', '실내 안치단'], ['maejang', '매장묘·공원묘지', '가족 묘역'],
    ['ijang', '파묘·이장', '묘 정리·새 장지'], ['cremation', '화장장 예약 안내', '예약 절차·일정 안내'], ['unsure', '아직 모르겠어요', '상담하며 정해요']
  ];
  var WHEN = [['urgent', '급해요', '1주일 이내'], ['soon', '1~3개월 안에', ''], ['later', '미리 준비해요', '생전 준비 등'], ['now', '임종하신 상태', '바로 연락드려요'], ['unknown', '아직 모르겠어요', '']];
  function typeLabel(k) { var t = TYPES.filter(function (x) { return x[0] === k; })[0]; return t ? t[1] : ''; }

  function contact() {
    var el = document.getElementById('cform'); if (!el) return;
    var fac = facility(qs('facility'));
    var type = qs('type') || (fac ? fac.type : '');
    if (!typeLabel(type)) type = '';
    var regions = (S.regions || []).slice();
    var preR = qs('region'), preW = qs('when');
    el.innerHTML = '<form id="form" novalidate>' +
      '<div class="fs"><h3><i>1</i>어떤 일로 문의하세요?<small>하나 선택</small></h3><div class="opts">' + TYPES.map(function (t) { return '<label class="opt"><input type="radio" name="type" value="' + t[0] + '"' + (t[0] === type ? ' checked' : '') + '><span>' + t[1] + '<small>' + t[2] + '</small></span></label>'; }).join('') + '</div>' +
      '<div class="notice" id="cremNote" hidden><b>화장장 예약은 보건복지부 e하늘 장사정보시스템에서만 할 수 있습니다.</b> 배웅이 예약 방법과 가능한 일정을 함께 확인해 드리고, 화장 이후 모실 곳까지 이어서 안내해 드립니다. <a href="' + EHANEUL + '" target="_blank" rel="noopener">e하늘 바로가기</a></div>' +
      (fac ? '<div class="notice"><b>' + esc(fac.name) + '</b> 시설 문의로 접수됩니다.</div>' : '') + '</div>' +
      '<div class="fs"><h3><i>2</i>희망하시는 지역은요?<small>여러 개 선택 가능</small></h3><div class="opts four">' + regions.map(function (r) { return '<label class="opt chk"><input type="checkbox" name="region" value="' + esc(r) + '"' + (preR === r ? ' checked' : '') + '><span>' + esc(r) + '</span></label>'; }).join('') + '<label class="opt chk"><input type="checkbox" name="region" value="상관없음"' + (preR === '상관없음' ? ' checked' : '') + '><span>상관없어요</span></label></div></div>' +
      '<div class="fs"><h3><i>3</i>언제까지 필요하세요?</h3><div class="opts four">' + WHEN.map(function (w) { return '<label class="opt"><input type="radio" name="when" value="' + w[0] + '"' + (preW === w[0] ? ' checked' : '') + '><span>' + w[1] + (w[2] ? '<small>' + w[2] + '</small>' : '') + '</span></label>'; }).join('') + '</div></div>' +
      '<div class="fs"><h3><i>4</i>연락받으실 정보</h3>' +
      '<div class="field"><label for="f-name">이름 <em>*</em></label><input id="f-name" autocomplete="name" placeholder="홍길동" value="' + esc(qs('name')) + '"></div>' +
      '<div class="field"><label for="f-phone">휴대폰 번호 <em>*</em></label><input id="f-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="' + esc(qs('phone')) + '"></div>' +
      '<div class="field"><label for="f-memo">궁금하신 점 (선택)</label><textarea id="f-memo" placeholder="모실 인원, 예산, 원하시는 조건 등을 적어 주세요">' + esc(qs('memo')) + '</textarea></div>' +
      '<label class="agree"><input type="checkbox" id="f-agree"><span>상담을 위한 개인정보(이름, 연락처, 문의 내용) 수집·이용에 동의합니다. 상담 완료 후 1년간 보관 후 파기합니다. <a href="' + ROOT + 'privacy.html" target="_blank">자세히 보기</a></span></label>' +
      '<button class="btn btn-primary btn-block" type="submit" style="margin-top:18px;height:52px">상담 신청하기</button>' +
      '<p style="margin-top:10px;font-size:12px;color:var(--muted);text-align:center">접수 후 상담팀이 순서대로 연락드립니다. 급하시면 ' + esc(S.phone) + ' 로 바로 전화 주세요.</p></div></form>' +
      '<div class="sum" id="sum"></div>' +
      '<div class="side-call"><small style="font-size:12px;color:var(--text-2)">바로 상담</small><b><a href="' + tel(S.phone) + '">' + esc(S.phone) + '</a></b><p>' + esc(S.hours) + '</p>' + (S.kakao ? '<a class="btn btn-kakao btn-block btn-sm" style="margin-top:12px" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카카오톡 상담</a>' : '') + '</div>';
    var form = document.getElementById('form');
    function val(n) { var x = form.querySelector('input[name=' + n + ']:checked'); return x ? x.value : ''; }
    function regs() { return Array.prototype.map.call(form.querySelectorAll('input[name=region]:checked'), function (x) { return x.value; }); }
    function sync() {
      document.getElementById('cremNote').hidden = val('type') !== 'cremation';
      var w = WHEN.filter(function (x) { return x[0] === val('when'); })[0];
      document.getElementById('sum').innerHTML = '<div style="grid-template-columns:1fr;font-weight:700;color:var(--text)">선택하신 내용</div>' + [['문의', typeLabel(val('type'))], ['시설', fac ? fac.name : ''], ['지역', regs().join(', ')], ['시기', w ? w[1] : '']].map(function (r) { return '<div><span>' + r[0] + '</span><b>' + (r[1] ? esc(r[1]) : '<span>-</span>') + '</b></div>'; }).join('');
    }
    form.addEventListener('change', function (e) {
      if (e.target.name === 'region') { var any = form.querySelector('input[name=region][value=상관없음]'); if (e.target === any && any.checked) form.querySelectorAll('input[name=region]').forEach(function (x) { if (x !== any) x.checked = false; }); else if (e.target.checked) any.checked = false; }
      sync();
    });
    sync();
    form.onsubmit = function (e) {
      e.preventDefault();
      var name = form.querySelector('#f-name').value.trim(), phone = form.querySelector('#f-phone').value.trim();
      if (!val('type')) return alertBox('문의 유형을 선택해 주세요.');
      if (!name) return alertBox('이름을 입력해 주세요.');
      if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone)) return alertBox('휴대폰 번호를 확인해 주세요.');
      if (!form.querySelector('#f-agree').checked) return alertBox('개인정보 수집·이용에 동의해 주세요.');
      var w = WHEN.filter(function (x) { return x[0] === val('when'); })[0];
      var rec = { type: typeLabel(val('type')), region: regs().join(', '), when: w ? w[1] : '', name: name, phone: phone, memo: form.querySelector('#f-memo').value.trim(), facility: fac ? fac.name : '', page: 'v4' };
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = '접수 중…';
      fetch(ROOT + 'admin/api.php?action=inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function () { done(rec, true); })
        .catch(function () { done(rec, false); });
    };
    function done(rec, ok) {
      var msg = '[배웅 상담 신청]\n문의: ' + rec.type + (rec.facility ? '\n시설: ' + rec.facility : '') + '\n지역: ' + (rec.region || '-') + '\n시기: ' + (rec.when || '-') + '\n이름: ' + rec.name + '\n연락처: ' + rec.phone + (rec.memo ? '\n내용: ' + rec.memo : '');
      el.innerHTML = '<div class="done"><div class="ic">' + ICON.check + '</div>' +
        '<h3>' + (ok ? '상담 신청이 접수되었습니다' : '미리보기 화면에서는 접수되지 않습니다') + '</h3>' +
        '<p>' + (ok ? '상담팀이 순서대로 연락드리겠습니다. 급하시면 바로 전화 주세요.' : '실제 홈페이지에서는 이 화면에서 접수됩니다. 지금은 아래 버튼으로 카카오톡이나 전화로 같은 내용을 보내 주세요.') + '</p>' +
        '<pre>' + esc(msg) + '</pre>' +
        '<div class="acts">' + (S.kakao ? '<a class="btn btn-kakao" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카카오톡으로 보내기</a>' : '') + '<a class="btn btn-primary" href="' + tel(S.phone) + '">' + ICON.phone + esc(S.phone) + ' 전화하기</a><a class="btn btn-line" href="index.html">홈으로</a></div></div>';
      window.scrollTo(0, 0);
    }
  }

  /* ---------- 시설 상세 ---------- */
  function facilityPage() {
    var el = document.getElementById('fpage'); if (!el) return;
    var f = facility(qs('id'));
    if (!f) { el.insertAdjacentHTML('afterbegin', '<div class="fpage"><p>시설을 찾을 수 없습니다. <a href="index.html" style="text-decoration:underline">첫 화면으로</a></p></div>'); return; }
    var t = typeOf(f.type);
    document.title = f.name + ' | 배웅';
    var q = encodeURIComponent(f.address && f.address.length > 8 ? f.address : f.name);
    var photos = (f.photos || []).map(img);
    el.insertAdjacentHTML('afterbegin', '<div class="fpage"><div class="crumb"><a href="index.html">홈</a> › <a href="index.html#' + esc(f.type) + '">' + esc(t.name) + '</a> › ' + esc(f.name) + '</div>' +
      '<div class="gallery"><div class="main"><img id="gmain" src="' + photos[0] + '" alt="' + esc(f.name) + '"></div><div class="thumbs">' + photos.map(function (p, i) { return '<img src="' + p + '" alt="" class="' + (i === 0 ? 'on' : '') + '" data-i="' + i + '">'; }).join('') + '</div></div>' +
      '<div class="finfo"><div class="area">' + esc(t.name) + ' · ' + esc(f.area) + (f.featured ? ' · 배웅 추천' : '') + '</div><h1>' + esc(f.name) + '</h1>' +
      (f.tags && f.tags.length ? '<div class="tg">' + f.tags.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
      '<p class="comment">' + esc(f.comment) + '</p>' +
      '<table>' + [['유형', t.name], ['지역', f.area], ['주소', f.address], ['운영', f.operator], ['사용료', (f.price || '상담 시 안내') + ' <small style="color:var(--muted)">· ' + esc(t.priceTag) + ' 평균 ' + esc(t.price) + '</small>']].filter(function (r) { return r[1]; }).map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + (r[0] === '사용료' ? r[1] : esc(r[1])) + '</td></tr>'; }).join('') + '</table>' +
      '<div class="maps"><a href="https://map.naver.com/p/search/' + q + '" target="_blank" rel="noopener">네이버 지도</a><a href="https://map.kakao.com/?q=' + q + '" target="_blank" rel="noopener">카카오맵</a>' + (f.blogUrl ? '<a href="' + esc(f.blogUrl) + '" target="_blank" rel="noopener">답사 후기</a>' : '') + '</div>' +
      '<div class="acts"><a class="btn btn-primary btn-block" href="contact.html?type=' + esc(f.type) + '&facility=' + esc(f.id) + '">' + ICON.form + '이 시설로 상담 신청</a><a class="btn btn-line btn-block" href="' + tel(S.phone) + '">' + ICON.phone + '전화로 바로 묻기 ' + esc(S.phone) + '</a></div>' +
      '<p style="margin-top:12px;font-size:12px;color:var(--muted)">※ 사용료·관리비·이용 기간은 시설 공지에 따라 달라집니다. 계약 전에 서면으로 비교해 드립니다.</p></div></div>' +
      '<div class="related"><h3>함께 보는 ' + esc(t.name) + '</h3><div class="flist">' + facilities(f.type).filter(function (x) { return x.id !== f.id; }).slice(0, 4).map(function (x) { var ph = (x.photos || [])[0]; return '<a class="frow" href="facility.html?id=' + esc(x.id) + '">' + (ph ? '<img src="' + img(ph) + '" alt="" loading="lazy">' : '<span></span>') + '<div><div class="nm">' + esc(x.name) + '</div><div class="ar">' + esc(x.area) + '</div></div></a>'; }).join('') + '</div></div>');
    el.querySelectorAll('.thumbs img').forEach(function (im) { im.onclick = function () { document.getElementById('gmain').src = im.src; el.querySelectorAll('.thumbs img').forEach(function (x) { x.classList.remove('on'); }); im.classList.add('on'); }; });
  }

  var page = document.body.dataset.page;
  if (page === 'facility') facilityPage();
  shell();
  if (page === 'home') home();
  if (page === 'service') servicePage();
  if (page === 'services') servicesPage();
  if (page === 'contact') contact();
})();
