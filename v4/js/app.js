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
  var NAV = [['search.html?type=sumok', '수목장'], ['search.html?type=napgol', '봉안당'], ['search.html?type=maejang', '공원묘지'], ['ijang.html', '파묘·이장']];
  function shell() {
    var head = '<header class="header"><div class="in">' +
      '<a class="logo" href="index.html" aria-label="배웅 홈"><img src="img/logo-h.png" alt="배웅"></a>' +
      '<nav class="gnb" aria-label="주 메뉴">' + NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + (n[2] ? '<span class="n">' + n[2] + '</span>' : '') + '</a>'; }).join('') + '</nav>' +
      '<div class="pills"><a class="pill cta" href="contact.html">' + ICON.form + '상담 신청</a></div>' +
      '<button class="burger" id="burger" aria-label="메뉴 열기"><span></span><span></span><span></span></button></div>' +
      '<nav class="subnav" aria-label="빠른 메뉴">' + NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join('') + '<a href="contact.html">상담 신청</a></nav></header>' +
      '<div class="drawer" id="drawer"><div class="panel"><button class="close" id="drawerClose" aria-label="닫기">×</button><img src="img/logo-h.png" alt="배웅" style="height:30px;width:auto;margin-bottom:14px">' +
      NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join('') + '<a href="crematorium.html">화장장 예약</a><a href="contact.html?type=support">장례지원금 상담</a><a href="index.html#reviews">상담 후기</a><a href="index.html#counselors">배웅 상담사</a><a href="index.html#faq">자주 하는 질문</a><a href="contact.html">상담 신청</a>' +
      '<a href="' + tel(S.phone) + '">전화 상담 ' + esc(S.phone) + '</a>' + (S.kakao ? '<a href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카카오톡 상담</a>' : '') + '</div></div>';
    var foot = '<footer class="footer"><img src="img/logo-h.png" alt="배웅">' +
      '<div class="links"><a href="index.html#story">배웅 이야기</a>' + (S.blogUrl ? '<a href="' + esc(S.blogUrl) + '" target="_blank" rel="noopener">배웅 블로그</a>' : '') + '<a href="' + ROOT + 'privacy.html" class="b">개인정보처리방침</a><a href="' + ROOT + 'facilities.html">답사 시설</a><a href="' + ROOT + 'reviews.html">상담 후기</a><a href="contact.html">상담 신청</a><a href="http://baewoong.co.kr" target="_blank" rel="noopener">기존 홈페이지(baewoong.co.kr)</a></div>' +
      '<div class="info">' + esc(S.bizName) + '<br>' + esc(S.bizDesc) + '<br>전화 문의: ' + esc(S.phone) + ' · ' + esc(S.hours) + (S.email ? '<br>이메일: ' + esc(S.email) : '') + (S.bizNo ? '<br>사업자 등록번호: ' + esc(S.bizNo) : '') + '</div>' +
      '<div class="copy">© ' + new Date().getFullYear() + '. ' + esc(S.bizName) + ' ALL RIGHTS RESERVED.</div></footer>';
    var fab = '<div class="fabs">' +
      '<a class="fab support" href="contact.html?type=support" aria-label="장례지원금 상담 신청"><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm2 3v2h14v-2zm2 5h4v1.5H7z"/></svg>지원금</a>' +
      (S.kakao ? '<a class="fab kakao" href="' + esc(S.kakao) + '" target="_blank" rel="noopener" aria-label="카카오톡 상담">' + ICON.kakao + '카톡</a>' : '') +
      '<a class="fab tel" href="' + tel(S.phone) + '" aria-label="전화 상담">' + ICON.phone + '전화</a>' +
      '<a class="fab" href="crematorium.html" aria-label="화장장 예약 안내">' + ICON.flame + '화장장 예약</a></div>';
    document.body.insertAdjacentHTML('afterbegin', head);
    var col = document.querySelector('.col');
    if (col) col.insertAdjacentHTML('beforeend', foot);
    document.body.insertAdjacentHTML('beforeend', fab);
    var cur = here();
    document.body.insertAdjacentHTML('beforeend', '<nav class="tabbar" aria-label="하단 메뉴">' +
      '<a href="index.html"' + (cur === 'index.html' ? ' class="on"' : '') + '><svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>홈</a>' +
      '<a href="search.html?type=sumok"' + (cur === 'search.html' ? ' class="on"' : '') + '><svg viewBox="0 0 24 24"><path d="M4 5h7v14H4zM13 5h7v14h-7z" opacity=".35"/><path d="M4 5h7v6H4zM13 13h7v6h-7z"/></svg>장지 비교</a>' +
      '<a href="contact.html"' + (cur === 'contact.html' ? ' class="on"' : '') + '><svg viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>상담 신청</a>' +
      '<button type="button" id="tabMenu"><svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>메뉴</button></nav>');
    document.getElementById('tabMenu').onclick = function () { document.getElementById('drawer').classList.add('open'); };
    var dr = document.getElementById('drawer');
    document.getElementById('burger').onclick = function () { dr.classList.add('open'); };
    document.getElementById('drawerClose').onclick = function () { dr.classList.remove('open'); };
    dr.onclick = function (e) { if (e.target === dr) dr.classList.remove('open'); };
  }

  /* ---------- 첫 화면 (v4: 속시원식 구성 + v2 톤앤매너) ---------- */
  /* 로고 톤 투톤 일러스트 아이콘 (48x48) */
  /* 로고 톤 투톤 일러스트 아이콘 (48x48) */
  var LI = {
    tree: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="36" cy="11" r="5" fill="#B19769"/><ellipse cx="24" cy="41" rx="15" ry="3.5" fill="#C9D8CB"/><rect x="21.5" y="28" width="5" height="12" rx="2" fill="#2B3D2D"/><circle cx="24" cy="17" r="9" fill="#4A6B52"/><circle cx="16.5" cy="23" r="6.5" fill="#2B3D2D"/><circle cx="31.5" cy="23" r="6.5" fill="#2B3D2D"/><circle cx="24" cy="24" r="7" fill="#4A6B52"/></svg>',
    hall: '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="42" rx="17" ry="3" fill="#C9D8CB"/><path d="M8 19 24 8l16 11z" fill="#2B3D2D"/><rect x="9" y="19" width="30" height="4" rx="1" fill="#4A6B52"/><rect x="10" y="23" width="28" height="16" fill="#F5F1E8"/><rect x="12.5" y="25" width="4" height="14" rx="1.2" fill="#4A6B52"/><rect x="31.5" y="25" width="4" height="14" rx="1.2" fill="#4A6B52"/><path d="M19.5 39v-8.5a4.5 4.5 0 0 1 9 0V39z" fill="#B19769"/><rect x="8" y="38" width="32" height="3" rx="1" fill="#2B3D2D"/></svg>',
    tomb: '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="39" rx="17" ry="5" fill="#C9D8CB"/><path d="M15 36V18a9 9 0 0 1 18 0v18z" fill="#4A6B52"/><path d="M18 36V18.5a6 6 0 0 1 12 0V36z" fill="#2B3D2D"/><rect x="21" y="22" width="6" height="1.8" rx=".9" fill="#F5F1E8"/><rect x="21" y="26" width="6" height="1.8" rx=".9" fill="#F5F1E8"/><circle cx="37" cy="31" r="3" fill="#B19769"/><rect x="36.2" y="33" width="1.6" height="6" rx=".8" fill="#4A6B52"/><circle cx="10.5" cy="33" r="2.4" fill="#B19769"/><rect x="9.8" y="34.5" width="1.4" height="4.5" rx=".7" fill="#4A6B52"/></svg>',
    calendar: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="11" width="32" height="30" rx="4" fill="#F5F1E8"/><path d="M8 15a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v6H8z" fill="#2B3D2D"/><rect x="14" y="7" width="3.5" height="8" rx="1.75" fill="#4A6B52"/><rect x="30.5" y="7" width="3.5" height="8" rx="1.75" fill="#4A6B52"/><rect x="12" y="25" width="5" height="4" rx="1" fill="#C9D8CB"/><rect x="21.5" y="25" width="5" height="4" rx="1" fill="#C9D8CB"/><rect x="12" y="32" width="5" height="4" rx="1" fill="#C9D8CB"/><path d="M22 34l4.5 4.5L35 29" fill="none" stroke="#B19769" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    support: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="13" width="30" height="21" rx="4" fill="#2B3D2D"/><rect x="6" y="18" width="30" height="4" fill="#4A6B52"/><rect x="10" y="26" width="9" height="3" rx="1.5" fill="#F5F1E8"/><circle cx="36" cy="32" r="8.5" fill="#B19769"/><circle cx="36" cy="32" r="5.5" fill="none" stroke="#F5F1E8" stroke-width="1.6"/><path d="M33.5 29.5h5M33.5 32h5" stroke="#F5F1E8" stroke-width="1.4" stroke-linecap="round"/></svg>',
    ijang: '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="41" rx="17" ry="3" fill="#C9D8CB"/><path d="M11 36c8-2 6-12 14-14s8-8 14-10" fill="none" stroke="#B19769" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 4"/><path d="M11 30s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" fill="#4A6B52"/><circle cx="11" cy="20" r="2.3" fill="#F5F1E8"/><path d="M37 24s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" fill="#2B3D2D"/><circle cx="37" cy="14" r="2.3" fill="#B19769"/></svg>',
    phone: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="#C9D8CB"/><g transform="translate(0.5,-1.5)"><path d="M18.3 15.5l3.2 5.2a2 2 0 0 1-.4 2.6l-1.6 1.4a14 14 0 0 0 6.2 6.2l1.4-1.6a2 2 0 0 1 2.6-.4l5.2 3.2a2 2 0 0 1 .6 2.8l-1.4 2.1a4 4 0 0 1-4.3 1.6C22 36.8 14.2 29 12.4 21.2a4 4 0 0 1 1.6-4.3l2.1-1.4a2 2 0 0 1 2.2 0z" fill="#2B3D2D"/></g><circle cx="32.5" cy="15.5" r="2.8" fill="#B19769"/></svg>',
    compare: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="#C9D8CB"/><rect x="23" y="12" width="2" height="22" rx="1" fill="#2B3D2D"/><rect x="17" y="34" width="14" height="2.5" rx="1.25" fill="#2B3D2D"/><rect x="12" y="15" width="24" height="2" rx="1" fill="#2B3D2D"/><path d="M9 24l4.5-8 4.5 8a4.5 4.5 0 0 1-9 0z" fill="#4A6B52"/><path d="M30 24l4.5-8 4.5 8a4.5 4.5 0 0 1-9 0z" fill="#B19769"/><circle cx="24" cy="12" r="2.2" fill="#B19769"/></svg>',
    walk: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="#C9D8CB"/><path d="M12 36c6-4 9-4 13-8s7-5 11-5" fill="none" stroke="#B19769" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="4 3.5"/><circle cx="19" cy="14.5" r="3.2" fill="#2B3D2D"/><path d="M15 29v-7a4 4 0 0 1 8 0v7z" fill="#2B3D2D"/><circle cx="29" cy="16" r="2.7" fill="#4A6B52"/><path d="M25.5 29v-6a3.5 3.5 0 0 1 7 0v6z" fill="#4A6B52"/></svg>',
    contract: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="#C9D8CB"/><path d="M16 11h11l6 6v20H16z" fill="#F5F1E8"/><path d="M27 11v6h6z" fill="#4A6B52"/><rect x="19" y="21" width="11" height="2" rx="1" fill="#4A6B52"/><rect x="19" y="25.5" width="11" height="2" rx="1" fill="#4A6B52"/><rect x="19" y="30" width="6" height="2" rx="1" fill="#4A6B52"/><circle cx="30" cy="32" r="4.2" fill="#B19769"/><circle cx="30" cy="32" r="1.8" fill="none" stroke="#F5F1E8" stroke-width="1.2"/></svg>'
  };
  var QUICK = [
    ['sumok', LI.tree, '수목장', 'search.html?type=sumok'],
    ['napgol', LI.hall, '봉안당', 'search.html?type=napgol'],
    ['maejang', LI.tomb, '매장묘', 'search.html?type=maejang'],
    ['ijang', LI.ijang, '파묘/이장', 'ijang.html'],
    ['cremation', LI.calendar, '화장장 예약', 'crematorium.html'],
    ['support', LI.support, '장례지원금', 'contact.html?type=support']
  ];
  var REV_TABS = [['', '전체'], ['sumok', '수목장'], ['napgol', '봉안당'], ['maejang', '매장묘'], ['ijang', '파묘/이장']];
  var COUNSELORS = [
    { name: '김도윤', role: '장례 절차 상담', quote: '마음을 다해 함께하겠습니다', tags: ['차분한 절차 안내', '가족 중심 상담'], img: 'img/counselor-1.jpg' },
    { name: '이서연', role: '장지 비교 · 동행 답사', quote: '가족이 자주 찾아뵐 수 있는 곳을 먼저 살핍니다', tags: ['주말 동행 답사', '서면 조건 비교'], img: '' },
    { name: '박준호', role: '파묘 · 이장 상담', quote: '절차는 배웅이 맡고, 가족은 마음을 돌보실 수 있도록 돕겠습니다', tags: ['개장 신고 대행', '길일 협의'], img: '' }
  ];
  var STEPS4 = [
    { t: '장지 상담 신청', d: '모실 인원과 희망 지역, 예산을 전화나 카카오톡으로 알려주십시오.' },
    { t: '맞춤 시설 비교', d: '직접 답사한 시설 가운데 조건에 맞는 곳을 골라 비용과 조건을 비교해 드립니다.' },
    { t: '현장 동행 답사', d: '사전 예약 후 담당 상담사가 함께 방문합니다. 주말 답사도 무료입니다.' },
    { t: '계약 대행·안치', d: '서면 조건을 확인한 뒤 계약부터 안치 준비까지 대행합니다.' }
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
      document.body.insertAdjacentHTML('afterbegin', '<div class="bw-intro" aria-hidden="true"><div class="in"><p class="t"><span class="l1">모실 곳을 정하는 일,</span><span class="l2">배웅이 함께 걷습니다.</span></p><img class="lg" src="img/logo-intro.jpg" alt=""></div></div>');
      try { sessionStorage.setItem('bw_intro', '1'); } catch (e) {}
      if (/introhold/.test(location.search)) document.querySelector('.bw-intro').classList.add('hold');
      else setTimeout(function () { var el = document.querySelector('.bw-intro'); if (el) el.remove(); }, 6400);
    }

    /* 슬라이드 */
    var SL = [
      { img: 'img/slide-sumok.jpg', chip: '수목장 분양 안내', tx: '직접 답사한 수목장만<br>분양 조건을 서면으로 비교해 드립니다', href: 'search.html?type=sumok' },
      { img: 'img/fac/haneulmun-2.jpg', chip: '화장장 예약 안내', tx: '화장장 예약이 처음이시라면<br>희망 지역만 알려주십시오', href: 'crematorium.html' },
      { img: 'img/fac/bundanghome-1.jpg', chip: '주말 무료 동행 답사', tx: '주말에도 상담사가<br>현장에 동행합니다', href: 'contact.html' }
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
      { n: 100, suffix: '+', unit: '곳', label: '상담 가능 장지', img: img('img/fac/eden-2.jpg') },
      { n: 23524, suffix: '', unit: '건', label: '누적 상담 신청', img: img('img/fac/gonggam-2.jpg') },
      { n: 21233, suffix: '', unit: '건', label: '누적 계약 체결', img: img('img/fac/haneulmun-2.jpg') },
      { n: 98, suffix: '', unit: '%', label: '고객 만족도', img: 'img/counselor-1.jpg' }
    ];
    var stl = document.getElementById('statList');
    if (stl) {
      stl.innerHTML = STATS.map(function (s) { return '<li><span class="ph"><img src="' + s.img + '" alt="" loading="lazy"></span><span class="lb">' + s.label + '</span><b><span class="num" data-n="' + s.n + '">' + s.n.toLocaleString('ko-KR') + '</span>' + s.suffix + (s.unit ? '<small>' + s.unit + '</small>' : '') + '</b></li>'; }).join('');
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

    /* 고객 상담 후기: 유형 탭 + 가로 카드, 전체 보기와 상세는 사이트 안에서 */
    var rf = document.getElementById('rvFilter'), rtrack = document.getElementById('rvTrack'), rwrap = document.getElementById('rvWrap'), rall = document.getElementById('rvAll');
    if (rf) {
      var revs = [];
      var stars = function (n) { var s = ''; for (var i = 0; i < 5; i++) s += '<i' + (i < n ? ' class="on"' : '') + '>★</i>'; return '<span class="st" aria-label="별점 ' + n + '점">' + s + '</span>'; };
      var tname = function (t) { return (REV_TABS.filter(function (x) { return x[0] === t; })[0] || ['', typeOf(t).name])[1]; };
      var rcard = function (x, full) {
        return '<article class="rv" data-id="' + esc(x.id) + '"' + (full ? '' : ' tabindex="0" role="button"') + '><div class="bd">' + stars(x.rating || 5) + '<p' + (full ? ' class="full"' : '') + '>' + esc(x.text) + '</p><span class="who"><b>' + esc(x.name) + '</b><span>' + esc(tname(x.type)) + ' · ' + esc(x.region) + ' · ' + esc(x.date) + '</span></span>' + (x.sample ? '<span class="smp">예시</span>' : '') + '</div></article>';
      };
      var drawR = function (k) {
        var list = revs.filter(function (r) { return !k || r.type === k; });
        if (!list.length) { rtrack.innerHTML = '<div class="rv-empty">' + tname(k) + ' 후기는 준비 중입니다.</div>'; return; }
        rtrack.innerHTML = list.map(function (x) { return rcard(x, false); }).join('');
        rwrap.scrollLeft = 0;
        autoSlide(rwrap, rtrack, 22);
      };
      var openR = function (id) {
        var x = revs.filter(function (r) { return r.id === id; })[0]; if (!x) return;
        document.body.insertAdjacentHTML('beforeend', '<div class="modal" id="rvModal"><div class="box"><button type="button" class="x" aria-label="닫기">×</button>' + stars(x.rating || 5) + '<p>' + esc(x.text).replace(/\n/g, '<br>') + '</p><div class="who"><b>' + esc(x.name) + '</b> · ' + esc(tname(x.type)) + ' · ' + esc(x.region) + ' · ' + esc(x.date) + '</div><a class="btn btn-primary btn-block" href="contact.html?type=' + esc(x.type) + '">같은 유형으로 상담 신청</a></div></div>');
        var m = document.getElementById('rvModal');
        m.onclick = function (e) { if (e.target === m || e.target.classList.contains('x')) m.remove(); };
      };
      fetch('data/testimonials.json?t=' + Math.floor(Date.now() / 600000)).then(function (r) { return r.ok ? r.json() : { items: [] }; }).then(function (d) {
        revs = (d.items || []).filter(function (x) { return x.visible !== false; });
        rf.innerHTML = REV_TABS.map(function (k, i) { var n = revs.filter(function (r) { return !k[0] || r.type === k[0]; }).length; return '<button type="button"' + (i === 0 ? ' class="on"' : '') + ' data-k="' + k[0] + '">' + k[1] + (n ? ' <small>' + n + '</small>' : '') + '</button>'; }).join('');
        rf.querySelectorAll('button').forEach(function (b) { b.onclick = function () { rf.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); drawR(b.dataset.k); }; });
        drawR('');
        document.getElementById('rvAllBtn').onclick = function () {
          var open = rall.hidden; rall.hidden = !open; this.textContent = open ? '후기 접기' : '상담 후기 전체 보기';
          if (open) { rall.innerHTML = revs.map(function (x) { return rcard(x, true); }).join(''); rall.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        };
      }).catch(function () { rtrack.innerHTML = '<div class="rv-empty">후기를 불러오지 못했습니다.</div>'; });
      document.getElementById('reviews').addEventListener('click', function (e) { var c = e.target.closest('.rv[role=button]'); if (c && !rwrap.classList.contains('drag')) openR(c.dataset.id); });
      document.getElementById('reviews').addEventListener('keydown', function (e) { var c = e.target.closest('.rv[role=button]'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openR(c.dataset.id); } });
      dragScroll(rwrap); arrows(document.getElementById('reviews'), rwrap);
    }

    /* 상담사 카드 (고정형) */
    var cn = document.getElementById('cnGrid');
    if (cn) {
      cn.innerHTML = COUNSELORS.map(function (c) {
        return '<article class="cn"><div class="top"><div class="txt"><span class="badge">배웅 상담원</span><h3>' + esc(c.name) + ' <small>상담원</small></h3><div class="role">' + esc(c.role) + '</div><p>' + esc(c.quote) + '</p></div>' +
          (c.img ? '<img class="pic" src="' + c.img + '" alt="' + esc(c.name) + ' 상담원">' : '<div class="pic ph" aria-hidden="true"><span>' + esc(c.name.slice(0, 1)) + '</span><small>사진 준비 중</small></div>') + '</div>' +
          '<ul class="chk">' + c.tags.map(function (t) { return '<li>' + ICON.check + esc(t) + '</li>'; }).join('') + '</ul>' +
          '<a class="btn btn-line btn-block btn-sm" href="contact.html?memo=' + encodeURIComponent(c.name + ' 상담원 상담 요청') + '">상담 문의</a></article>';
      }).join('');
    }

    /* 서비스 이용안내 4단계 */
    var gg = document.getElementById('guideGrid');
    if (gg) gg.innerHTML = STEPS4.map(function (g, i) { return '<a class="gd" href="' + (GUIDE_LINKS[i] || 'contact.html') + '"><div><span class="st">0' + (i + 1) + '</span><b>' + esc(g.t) + '</b><p>' + esc(g.d) + '</p></div><span class="ic" aria-hidden="true">' + (GUIDE_ICONS[i] || LI.phone) + '</span></a>'; }).join('');

    /* 답사 시설: 유형 태그 + 행 */
    var ft = document.getElementById('facTags'), fl = document.getElementById('facList');
    if (ft) {
      var fkeys = ['sumok', 'napgol', 'maejang'];
      var fshort = { sumok: '수목장', napgol: '봉안당', maejang: '공원묘지' };
      ft.innerHTML = fkeys.map(function (k, i) { return '<button type="button" class="tag' + (i === 0 ? ' on' : '') + '" data-k="' + k + '">' + fshort[k] + ' <small>' + facilities(k).length + '</small></button>'; }).join('');
      var drawF = function (k) {
        fl.innerHTML = facilities(k).slice(0, 4).map(function (f) {
          var ph = (f.photos || [])[0];
          return '<a class="frow" href="facility.html?id=' + esc(f.id) + '">' + (ph ? '<img src="' + img(ph) + '" alt="" loading="lazy">' : '<span></span>') + '<div><div class="nm">' + esc(f.name) + '</div><div class="ar">' + esc(f.area) + (f.featured ? ' · 배웅 추천' : '') + '</div>' + (f.tags && f.tags.length ? '<div class="tg">' + f.tags.slice(0, 3).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') + '</div></a>';
        }).join('');
      };
      drawF('sumok');
      ft.querySelectorAll('.tag').forEach(function (b) { b.onclick = function () { ft.querySelectorAll('.tag').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); drawF(b.dataset.k); }; });
    }

    /* 자주 하는 질문 */
    var fq = document.getElementById('faqList');
    if (fq) {
      var FQ = { '수목장은 몇 분까지 함께 모실 수 있나요?': '수목장은 몇 분까지 함께 모실 수 있습니까?', '납골당과 봉안당은 다른가요?': '납골당과 봉안당은 다른 곳입니까?', '이장은 언제 하는 게 좋나요?': '이장은 언제 하는 것이 좋습니까?' };
      var pick = function (k, i) { var f = (C.types[k] && C.types[k].faqs || [])[i]; return f ? { q: FQ[f.q] || f.q, a: f.a } : null; };
      var FAQS = [
        { q: '상담과 동행 답사는 정말 무료입니까?', a: '네. 상담, 시설 비교, 동행 답사 모두 비용이 없습니다. 계약은 시설과 직접 하시며, 배웅은 조건 확인과 절차를 돕습니다.' },
        { q: '어떤 지역의 시설을 안내합니까?', a: '경기도를 중심으로 배웅 상담팀이 직접 답사한 수목장·봉안당·공원묘지만 안내합니다. 그 외 지역은 상담 후 확인해 드립니다.' },
        pick('sumok', 0), pick('napgol', 0), pick('ijang', 0),
        { q: '임종 직후라 급한데 바로 도움을 받을 수 있습니까?', a: '연중무휴 전화로 연락 주시면 화장장 예약 가능 일정 확인부터 모실 곳 상담까지 바로 진행합니다.' }
      ].filter(Boolean);
      fq.innerHTML = FAQS.map(function (f, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('');
    }

    /* 연락 */
    var ck = document.getElementById('ctKakao'); if (ck) { if (S.kakao) ck.href = S.kakao; else ck.remove(); }
    var ct = document.getElementById('ctTel'); if (ct) ct.href = tel(S.phone);
    var bc = document.getElementById('brandCard'); if (bc) bc.href = S.blogUrl || ROOT;
  }

  /* ---------- 서비스 안내 페이지 (6개 바로가기용) ---------- */
  var EXTRA = {
    cremation: {
      name: '화장장 예약 안내', short: '화장장 예약은 보건복지부 e하늘 장사정보시스템에서만 할 수 있습니다. 배웅이 예약 방법과 가능한 일정을 함께 확인해 드립니다.',
      priceTag: '화장 비용', price: '지역 주민 무료~수십만원', priceNote: '화장장마다 관내·관외 요금이 다릅니다. 거주지 기준으로 함께 확인해 드립니다.',
      desc: '임종 후 화장장 예약은 가장 먼저, 그리고 가장 서둘러야 하는 일입니다. 원하는 날짜와 시간대는 빠르게 마감되므로, 희망 지역과 일정만 알려주시면 배웅이 e하늘에서 가능한 일정을 바로 확인해 드립니다.',
      steps: [{ t: '희망 지역·일정 전달', d: '거주지, 장례식장, 발인 예정일을 알려주십시오.' }, { t: 'e하늘 가능 일정 확인', d: '관내·관외 화장장의 빈 시간대를 함께 확인합니다.' }, { t: '예약과 서류 안내', d: '사망진단서 등 필요한 서류와 예약 방법을 안내해 드립니다.' }, { t: '화장 후 모실 곳까지', d: '수목장·봉안당 등 화장 이후 장지까지 이어서 상담합니다.' }],
      faqs: [{ q: '배웅이 대신 예약해 드릴 수 있습니까?', a: '예약은 유족 명의로만 가능하므로, 배웅이 방법과 일정을 곁에서 함께 확인해 드립니다. 처음이시더라도 10분 정도면 마칠 수 있습니다.' }, { q: '원하는 날짜가 없으면 어떻게 됩니까?', a: '인근 다른 화장장의 일정을 바로 확인하고, 발인 일정 조정이 필요하면 장례식장과 조율하는 방법까지 안내해 드립니다.' }],
      cta: 'cremation'
    },
    support: {
      name: '장례지원금 안내', short: '정부와 지자체가 지원하는 장례 관련 지원금을 놓치지 않도록 배웅이 대상 여부와 신청 방법을 확인해 드립니다.',
      priceTag: '대표 지원금', price: '장제급여 80만원 등', priceNote: '기초생활수급자 장제급여, 지자체 화장장려금, 국가유공자 장례 지원 등 자격에 따라 다릅니다.',
      desc: '장례 뒤에 신청할 수 있는 지원금은 종류가 많고 지자체마다 금액과 조건이 달라, 알지 못한 채 지나치는 가족이 많습니다. 배웅은 상담 과정에서 받으실 수 있는 지원금을 함께 확인하고 신청 서류를 안내해 드립니다.',
      steps: [{ t: '대상 확인', d: '고인과 신청인의 자격(수급 여부, 거주지, 유공자 등)을 확인합니다.' }, { t: '지원금 종류 안내', d: '장제급여, 화장장려금, 자연장 장려금 등 받으실 수 있는 항목을 정리해 드립니다.' }, { t: '서류 준비', d: '사망진단서, 화장증명서, 가족관계증명서 등 필요한 서류를 안내합니다.' }, { t: '신청 방법 안내', d: '주민센터·복지로 신청 절차를 단계별로 안내해 드립니다.' }],
      faqs: [{ q: '누구나 받을 수 있습니까?', a: '지원금마다 대상이 다릅니다. 기초생활수급자 장제급여처럼 자격이 필요한 것도 있고, 화장장려금처럼 거주 지역 조건만 충족하면 되는 것도 있습니다.' }, { q: '신청 기간이 정해져 있습니까?', a: '대부분 사망일 또는 화장일로부터 일정 기간 안에 신청해야 합니다. 상담 시 기한부터 확인해 드립니다.' }],
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
      { k: 'sumok', ic: LI.tree, eyebrow: '수목장', h: '나무 아래, 자연으로 모시는 수목장', p: T.sumok.desc, who: '자연 속에 모시고 싶고 관리 부담을 줄이고 싶은 가족', cost: T.sumok.priceTag + ' ' + T.sumok.price + ' · ' + T.sumok.priceNote, do_: '직접 답사한 수목장 가운데 조건에 맞는 곳을 비교하고, 주말 동행 답사와 계약 대행까지 맡습니다', steps: stepT(), href: 'search.html?type=sumok', btn: '수목장 찾기·비교' },
      { k: 'napgol', ic: LI.hall, eyebrow: '봉안당(납골당)', h: '날씨와 상관없이 찾아뵙는 실내 봉안시설', p: T.napgol.desc, who: '자주 찾아뵙고 싶은 가족, 도심에서 가까운 곳을 원하는 분', cost: T.napgol.priceTag + ' ' + T.napgol.price + ' · ' + T.napgol.priceNote, do_: '단 위치·관리비·이용 기간을 서면으로 비교하고, 동행 답사와 계약 대행을 맡습니다', steps: stepT(), href: 'search.html?type=napgol', btn: '봉안당 찾기·비교' },
      { k: 'maejang', ic: LI.tomb, eyebrow: '매장묘', h: '가족이 함께 모이는 전통 묘역', p: T.maejang.desc, who: '가족 묘역을 원하시는 분', cost: T.maejang.priceTag + ' ' + T.maejang.price + ' · ' + T.maejang.priceNote, do_: '직접 답사한 공원묘지 비교, 동행 답사, 계약 대행', steps: stepT(), href: 'search.html?type=maejang', btn: '매장묘 찾기·비교' },
      { k: 'cremation', ic: LI.calendar, eyebrow: '화장장 예약', h: '임종 후 가장 먼저 잡아야 하는 화장 일정', p: EXTRA.cremation.desc, who: '임종 직후 화장 일정을 빨리 잡아야 하는 가족, e하늘 예약이 처음인 분', cost: EXTRA.cremation.priceTag + ' ' + EXTRA.cremation.price + ' · ' + EXTRA.cremation.priceNote, do_: 'e하늘에서 가능한 일정을 확인하고 필요한 서류를 안내하며, 화장 이후 모실 곳까지 이어서 상담합니다', steps: stepT(EXTRA.cremation.steps), href: 'crematorium.html', btn: '전국 화장시설 찾기' },
      { k: 'support', ic: LI.support, eyebrow: '장례지원금', h: '놓치기 쉬운 장례 지원금, 함께 확인해 드립니다', p: EXTRA.support.desc, who: '장제급여·화장장려금 등을 받을 수 있는지 궁금한 가족', cost: EXTRA.support.priceTag + ' ' + EXTRA.support.price + ' · ' + EXTRA.support.priceNote, do_: '대상 여부를 확인하고 지원금 종류를 정리해 서류와 신청 방법을 안내합니다', steps: stepT(EXTRA.support.steps), href: 'contact.html?type=support', btn: '장례지원금 상담 신청' },
      { k: 'ijang', ic: LI.ijang, eyebrow: '파묘 · 이장', h: '묘를 옮겨야 할 때, 절차는 배웅이 맡습니다', p: T.ijang.desc, who: '기존 묘를 정리하거나 다른 곳으로 모셔야 하는 가족', cost: T.ijang.priceTag + ' ' + T.ijang.price + ' · ' + T.ijang.priceNote, do_: '개장 신고 대행, 길일 협의, 파묘·유골 수습, 화장과 새 장지 안치까지 진행', steps: stepT(T.ijang.steps), href: 'ijang.html', btn: '파묘·이장 안내 보기' }
    ];
    el.innerHTML = '<section class="sec svcs-hero"><p class="crumb"><a href="index.html">홈</a> › 서비스 안내</p><h1>처음이셔도 괜찮습니다.<br>어떤 서비스인지 먼저 살펴보십시오</h1><p class="lead">배웅이 하는 일 여섯 가지를 한 자리에 정리했습니다. 상담과 동행 답사는 모두 무료입니다.</p>' +
      '<nav class="svc-tabs" aria-label="서비스 바로가기">' + SV.map(function (s) { return '<a href="#sv-' + s.k + '">' + s.eyebrow + '</a>'; }).join('') + '</nav></section>' +
      SV.map(function (s, i) {
        return '<section class="sec svc' + (i % 2 ? ' gray' : '') + '" id="sv-' + s.k + '"><div class="svc-head"><span class="em" aria-hidden="true">' + s.ic + '</span><div><span class="eyebrow">' + esc(s.eyebrow) + '</span><h2>' + esc(s.h) + '</h2></div></div>' +
          '<p class="lead">' + esc(s.p) + '</p>' +
          '<div class="svc-grid"><div><b>이런 분께</b><span>' + esc(s.who) + '</span></div><div><b>비용은</b><span>' + esc(s.cost) + '</span></div><div><b>배웅이 하는 일</b><span>' + esc(s.do_) + '</span></div></div>' +
          '<ol class="svc-steps">' + s.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
          '<div class="svc-acts"><a class="btn btn-primary" href="' + s.href + '">' + esc(s.btn) + '</a><a class="btn btn-line" href="contact.html?type=' + s.k + '">상담 신청</a></div></section>';
      }).join('') +
      '<section class="sec"><div class="contact-box"><small>어떤 서비스가 맞을지 모르시겠다면</small><b>편히 전화 주십시오. 상담하며 함께 정하겠습니다</b><div class="acts"><a class="btn btn-primary" href="contact.html?type=unsure">상담 신청</a><a class="btn btn-white" href="' + tel(S.phone) + '">전화문의</a>' + (S.kakao ? '<a class="btn btn-white" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카톡문의</a>' : '') + '</div></div></section>';
    if (location.hash) { var t = document.querySelector(location.hash); if (t) setTimeout(function () { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }
  }

  /* ---------- 장지 검색·비교 (수목장·봉안당·매장묘) ---------- */
  var SEARCH_TYPES = [['sumok', '수목장'], ['napgol', '봉안당'], ['maejang', '매장묘']];
  function areaKey(a) { return String(a || '').replace(/^경기\s*/, '').replace(/\(.*\)$/, '').trim(); }
  function searchPage() {
    var el = document.getElementById('srch'); if (!el) return;
    var k = qs('type'); if (!C.types[k] || !SEARCH_TYPES.some(function (t) { return t[0] === k; })) k = 'sumok';
    var t = typeOf(k), all = facilities(k);
    document.title = t.name + ' 검색·비교 | 배웅';
    var areas = []; all.forEach(function (f) { var a = areaKey(f.area); if (a && areas.indexOf(a) < 0) areas.push(a); });
    var tagCount = {}; all.forEach(function (f) { (f.tags || []).forEach(function (x) { tagCount[x] = (tagCount[x] || 0) + 1; }); });
    var tags = Object.keys(tagCount).sort(function (a, b) { return tagCount[b] - tagCount[a]; }).slice(0, 8);
    var state = { area: '', tag: '', feat: false, q: '' }, picked = [];

    el.innerHTML = '<section class="sec srch-top"><p class="notice-line"><i></i>직접 답사한 시설만 안내합니다.</p>' +
      '<h1>' + esc(t.name) + ' 찾기</h1><p class="lead">' + esc(t.short) + '</p>' +
      '<div class="type-tabs">' + SEARCH_TYPES.map(function (x) { return '<a href="search.html?type=' + x[0] + '"' + (x[0] === k ? ' class="on"' : '') + '>' + x[1] + ' <small>' + facilities(x[0]).length + '</small></a>'; }).join('') + '</div>' +
      '<div class="filt row2 sels"><div class="sel"><select id="fArea" aria-label="지역"><option value="">지역 전체</option>' + areas.map(function (a) { return '<option value="' + esc(a) + '">' + esc(a) + '</option>'; }).join('') + '</select></div>' +
      '<div class="sel"><select id="fTag" aria-label="특징"><option value="">특징 전체</option>' + tags.map(function (a) { return '<option value="' + esc(a) + '">' + esc(a) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="filt row2"><input type="search" id="fQ" placeholder="시설명으로 찾기"><label class="tog"><input type="checkbox" id="fFeat"><span>배웅 추천만</span></label></div>' +
      '<div class="cnt"><b id="cnt"></b> <span class="dim">비교함에 담아 최대 3곳까지 한눈에 비교할 수 있습니다.</span></div></section>' +
      '<section class="sec gray" id="listSec"><div class="fgrid" id="fgrid"></div></section>' +
      '<section class="sec" id="cmpSec" hidden><div class="sec-title"><h2>선택한 시설 비교</h2><button type="button" class="arr" id="cmpClose" aria-label="닫기">×</button></div><div class="cmp-wrap" id="cmpWrap"></div></section>' +
      '<div class="cmpbar" id="cmpbar" hidden><div class="in"><span id="cmpN"></span><button type="button" class="btn btn-primary btn-sm" id="cmpGo">비교하기</button><button type="button" class="btn btn-line btn-sm" id="cmpClear">비우기</button></div></div>';

    function filtered() {
      return all.filter(function (f) {
        if (state.area && areaKey(f.area) !== state.area) return false;
        if (state.tag && (f.tags || []).indexOf(state.tag) < 0) return false;
        if (state.feat && !f.featured) return false;
        if (state.q && (f.name + ' ' + f.area + ' ' + (f.tags || []).join(' ')).indexOf(state.q) < 0) return false;
        return true;
      });
    }
    function card(f) {
      var ph = (f.photos || [])[0], on = picked.indexOf(f.id) >= 0;
      return '<article class="fc' + (on ? ' on' : '') + '" data-id="' + esc(f.id) + '"><a class="ph" href="facility.html?id=' + esc(f.id) + '">' + (ph ? '<img src="' + img(ph) + '" alt="" loading="lazy">' : '') + (f.featured ? '<span class="bdg">배웅 추천</span>' : '') + '</a>' +
        '<div class="bd"><a class="nm" href="facility.html?id=' + esc(f.id) + '">' + esc(f.name) + '</a><div class="ar">' + esc(f.area) + (f.operator ? ' · ' + esc(f.operator) : '') + '</div>' +
        '<div class="pr">' + esc(f.price || '상담 시 안내') + '</div>' +
        ((f.tags || []).length ? '<div class="tg">' + f.tags.slice(0, 3).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="acts"><button type="button" class="btn btn-line btn-sm cmp">' + (on ? '비교함에서 빼기' : '비교 담기') + '</button><a class="btn btn-primary btn-sm" href="contact.html?type=' + esc(k) + '&facility=' + esc(f.id) + '">상담 신청</a></div></div></article>';
    }
    function draw() {
      var list = filtered();
      document.getElementById('cnt').textContent = '총 ' + list.length + '곳';
      document.getElementById('fgrid').innerHTML = list.length ? list.map(card).join('') : '<div class="rv-empty">조건에 맞는 시설이 없습니다. 지역이나 특징을 바꿔 보십시오. 원하시는 조건을 상담으로 알려주시면 직접 찾아 안내해 드립니다.</div>';
    }
    function bar() {
      var b = document.getElementById('cmpbar'); b.hidden = !picked.length;
      document.getElementById('cmpN').innerHTML = '비교함 <b>' + picked.length + '</b> / 3';
    }
    function compare() {
      var fs = picked.map(facility).filter(Boolean); if (!fs.length) return;
      var rows = [['사진', function (f) { var p = (f.photos || [])[0]; return p ? '<img src="' + img(p) + '" alt="">' : ''; }], ['시설명', function (f) { return '<b>' + esc(f.name) + '</b>' + (f.featured ? '<span class="bdg2">배웅 추천</span>' : ''); }], ['지역', function (f) { return esc(f.area); }], ['주소', function (f) { return esc(f.address || '-'); }], ['운영', function (f) { return esc(f.operator || '-'); }], ['사용료', function (f) { return esc(f.price || '상담 시 안내'); }], ['특징', function (f) { return (f.tags || []).map(function (x) { return '<span class="t">' + esc(x) + '</span>'; }).join('') || '-'; }], ['배웅 한줄평', function (f) { return esc(f.comment || '-'); }], ['', function (f) { return '<a class="btn btn-primary btn-sm btn-block" href="contact.html?type=' + esc(k) + '&facility=' + esc(f.id) + '">상담 신청</a><a class="btn btn-line btn-sm btn-block" style="margin-top:6px" href="facility.html?id=' + esc(f.id) + '">상세 보기</a>'; }]];
      document.getElementById('cmpWrap').innerHTML = '<table class="cmp"><tbody>' + rows.map(function (r) { return '<tr><th>' + r[0] + '</th>' + fs.map(function (f) { return '<td>' + r[1](f) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table><p class="dim" style="margin-top:10px;font-size:12px">※ 사용료·관리비·이용 기간은 시설 공지에 따라 달라지며, 계약 전에 서면으로 다시 비교해 드립니다.</p>';
      var s = document.getElementById('cmpSec'); s.hidden = false; s.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    el.addEventListener('click', function (e) {
      var c = e.target.closest('.fc .cmp');
      if (c) {
        var id = c.closest('.fc').dataset.id, i = picked.indexOf(id);
        if (i >= 0) picked.splice(i, 1); else { if (picked.length >= 3) { alertBox('비교함에는 최대 3곳까지 담을 수 있습니다.'); return; } picked.push(id); }
        var on = picked.indexOf(id) >= 0; c.closest('.fc').classList.toggle('on', on); c.textContent = on ? '비교함에서 빼기' : '비교 담기';
        bar(); return;
      }
      if (e.target.id === 'cmpGo') compare();
      if (e.target.id === 'cmpClear') { picked = []; draw(); bar(); document.getElementById('cmpSec').hidden = true; }
      if (e.target.id === 'cmpClose') document.getElementById('cmpSec').hidden = true;
    });
    document.getElementById('fArea').addEventListener('change', function (e) { state.area = e.target.value; draw(); });
    document.getElementById('fTag').addEventListener('change', function (e) { state.tag = e.target.value; draw(); });
    document.getElementById('fQ').addEventListener('input', function (e) { state.q = e.target.value.trim(); draw(); });
    document.getElementById('fFeat').addEventListener('change', function (e) { state.feat = e.target.checked; draw(); });
    draw(); bar();
  }

  /* ---------- 화장장 예약 안내: 전국 화장시설 검색 (보건복지부 현황 자료) + e하늘 예약 연결 ---------- */
  function cremPage() {
    var el = document.getElementById('crem'); if (!el) return;
    document.title = '화장장 예약 안내 | 배웅';
    var x = EXTRA.cremation;
    el.innerHTML = '<section class="sec svc-hero"><p class="crumb"><a href="index.html">홈</a> › 화장장 예약 안내</p><div class="svc-head"><span class="em" aria-hidden="true">' + LI.calendar + '</span><div><h1>화장장 예약 안내</h1><p class="lead">' + esc(x.short) + '</p></div></div>' +
      '<div class="ehaneul"><div><b>화장 예약은 e하늘 장사정보시스템에서</b><p>전국 화장시설 예약은 보건복지부 e하늘에서만 접수합니다. 희망 일정이 빠르게 마감되니 아래에서 가까운 시설을 확인하신 뒤 바로 예약하십시오. 처음이시면 배웅이 함께 확인해 드립니다.</p></div><div class="acts"><a class="btn btn-primary" href="' + EHANEUL + 'funeral" target="_blank" rel="noopener">e하늘 화장 예약 바로가기</a><a class="btn btn-line" href="' + tel(S.phone) + '">배웅에 전화로 묻기</a></div></div></section>' +
      '<section class="sec gray" id="cremList"><div class="sec-title"><h2>전국 화장시설 찾기</h2><small class="dim" id="cremSrc"></small></div>' +
      '<div class="filt row2" style="margin-top:14px"><div class="sel" style="flex:1"><select id="cSido"><option value="">시·도 전체</option></select></div><input type="search" id="cQ" placeholder="시설명·시군구로 찾기" style="flex:1.2"></div>' +
      '<div class="cnt"><b id="cCnt"></b></div><div class="cgrid" id="cgrid"><div class="rv-empty">자료를 불러오는 중입니다…</div></div></section>' +
      '<section class="sec"><h2>진행 순서</h2><div class="sgrid v">' + x.steps.map(function (s, i) { return '<div><span class="idx">0' + (i + 1) + '</span><b>' + esc(s.t) + '</b><span>' + esc(s.d) + '</span></div>'; }).join('') + '</div></section>' +
      '<section class="sec gray"><h2>자주 묻는 질문</h2><div class="faq">' + x.faqs.map(function (f, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('') + '</div></section>' +
      '<section class="sec"><div class="contact-box"><small>화장 일정부터 모실 곳까지</small><b>연중무휴, 언제든 편히 연락 주십시오</b><div class="acts"><a class="btn btn-primary" href="contact.html?type=cremation">상담 신청</a><a class="btn btn-white" href="' + tel(S.phone) + '">전화문의</a>' + (S.kakao ? '<a class="btn btn-white" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카톡문의</a>' : '') + '</div></div></section>';
    var data = [], sido = document.getElementById('cSido'), q = document.getElementById('cQ'), grid = document.getElementById('cgrid');
    function draw() {
      var s = sido.value, kw = q.value.trim();
      var list = data.filter(function (r) { return (!s || r.sido === s) && (!kw || (r.name + ' ' + r.sigungu + ' ' + r.addr).indexOf(kw) >= 0); });
      document.getElementById('cCnt').textContent = '총 ' + list.length + '곳' + (s ? ' · ' + s : '');
      grid.innerHTML = list.length ? list.map(function (r) {
        var mq = encodeURIComponent(r.name);
        return '<article class="cc"><div class="hd"><b>' + esc(r.name) + '</b><span class="pub">' + esc(r.pub || '') + (r.furnace ? ' · 화장로 ' + esc(r.furnace) + '기' : '') + '</span></div><div class="ar">' + esc(r.sido) + ' ' + esc(r.sigungu) + '</div><div class="ad">' + esc(r.addr) + '</div>' +
          '<div class="acts">' + (r.tel ? '<a class="btn btn-line btn-sm" href="' + tel(r.tel) + '">' + ICON.phone + esc(r.tel) + '</a>' : '') + '<a class="btn btn-line btn-sm place" href="https://map.naver.com/p/search/' + mq + '" target="_blank" rel="noopener"><i>N</i>네이버 플레이스</a>' + '</div></article>';
      }).join('') : '<div class="rv-empty">조건에 맞는 화장시설이 없습니다.</div>';
    }
    fetch('data/crematoriums.json?t=' + Math.floor(Date.now() / 3600000)).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      data = d.items || [];
      var sidos = []; data.forEach(function (r) { if (sidos.indexOf(r.sido) < 0) sidos.push(r.sido); });
      sido.innerHTML = '<option value="">시·도 전체</option>' + sidos.map(function (s0) { return '<option value="' + esc(s0) + '">' + esc(s0) + '</option>'; }).join('');
      document.getElementById('cremSrc').textContent = '출처: 보건복지부 화장시설 현황' + (d.asOf ? ' (' + d.asOf + ' 기준)' : '');
      sido.onchange = draw; q.oninput = draw; draw();
    }).catch(function () {
      grid.innerHTML = '<div class="rv-empty">전국 화장시설 목록은 준비 중입니다. 지역을 알려주시면 배웅이 가까운 화장시설과 예약 가능 일정을 바로 확인해 드립니다.</div>';
      document.getElementById('cCnt').textContent = '';
    });
  }

  /* ---------- 파묘·이장 안내 (baewoong.co.kr/grave-relocation 내용 기준) ---------- */
  function ijangPage() {
    var el = document.getElementById('ijang'); if (!el) return;
    document.title = '파묘·이장 안내 | 배웅';
    var TERMS = [
      ['파묘(破墓)', '기존 묘를 열고 유해를 수습하는 일입니다. 이장 절차의 첫 번째 단계입니다.'],
      ['이장(移葬)', '수습한 유해를 새로운 장소에 다시 모시는 일입니다. 파묘와 반드시 함께 진행됩니다.'],
      ['개장(改葬)', '「장사 등에 관한 법률」상의 용어로, 파묘·이장 전 과정을 뜻합니다. 관할 관청의 허가가 반드시 필요합니다.']
    ];
    var STEPS = [
      ['가족 협의', '방향 결정과 역할 분담', '이장 사유를 공유하고 새 안장지의 방향(봉안당·자연장·봉안묘 등)을 함께 정합니다. 서류 준비, 현장 동행, 화장장 예약 담당을 나누어 두면 이후 혼선이 줄어듭니다.'],
      ['새 안장지 선정', '파묘 이전에 계약 완료', '새 안장지 계약을 파묘 전에 반드시 마쳐야 합니다. 계약 없이 파묘를 먼저 하면 유해를 임시 보관해야 하는 상황이 생깁니다. 관리 구조, 접근성, 운영 주체, 비용 조건을 함께 확인합니다.'],
      ['개장 신고', '허가증 없이 작업 불가', '현재 묘가 있는 시·군·구청에 신고하고 허가증을 받습니다. 필요 서류: 개장 신고서, 신청인 신분증, 토지 소유자 동의서(사유지), 가족관계증명서, 묘지 위치 약도 또는 지번. 처리 기간은 보통 3~7일이며, 개장허가증을 받은 뒤에만 파묘를 시작할 수 있습니다.'],
      ['파묘 업체 선정', '견적 항목 분리 확인', '사업자등록증과 장례지도사 자격 보유 여부를 먼저 확인합니다. 견적서는 파묘 작업비, 운반비, 화장비, 기타 비용이 분리된 형태로 받고, 두 곳 이상을 비교하는 것이 기준이 됩니다.'],
      ['파묘 당일', '개토제와 유해 수습', '개토제(開土祭)로 시작합니다. 간단한 제물(과일·포·술)을 차리고 후손이 인사를 올린 뒤 작업합니다. 화장하는 경우 관할 화장장에 2~5일 전 사전 예약이 필요하며, 당일 예약은 대부분 어렵습니다.'],
      ['재안장', '새 안장지에 모시는 절차', '새 묘지에 안장하는 경우 취토(取土)와 성분(成墳)으로 마무리합니다. 봉안당·수목장으로 모시는 경우 각 시설의 안장 절차에 따릅니다.'],
      ['이장 고유', '마무리 제례', '새 자리에 모신 뒤 이장 고유(告由)를 올리고 후손이 인사를 드리며 전체 절차를 마칩니다.']
    ];
    var CHECKS = ['가족 협의 — 방향 결정과 역할 분담까지 완료', '새 안장지 계약 — 파묘 이전에 완료', '개장 신고서 제출과 허가증 수령 — 허가증 없이 작업 불가', '이장 업체 계약과 날짜 확정 — 견적 항목 분리 확인', '화장장 사전 예약 — 화장의 경우 최소 2~5일 전', '개토제 준비물 — 제물, 향, 초 사전 확인', '가족 일정 공유 — 당일 참석 인원 사전 조율'];
    el.innerHTML = '<section class="sec" style="padding-bottom:0"><div class="ij-hero"><div class="tx"><h1>조상님을<br>새 자리로 정중하게</h1><p>개장 신고부터 화장장 예약, 봉안까지 함께합니다</p><a class="btn btn-primary" href="contact.html?type=ijang">이장·개장 상담 신청</a></div><div class="art" aria-hidden="true">' + LI.ijang + '</div></div></section>' +
      '<section class="sec"><p class="crumb"><a href="index.html">홈</a> › 파묘·이장 안내</p><h2>파묘·이장 절차, 순서보다 먼저 정리해야 할 기준</h2><p class="lead">묘지 수용, 사용 기한 만료, 거주지 이전 등 사유는 달라도 "어디서부터 시작해야 할지 모르겠다"는 말씀이 가장 많습니다. 파묘·이장은 가족 협의, 새 안장지 계약, 개장 신고, 업체 선정의 순서가 맞아야 하는 일이며, 순서가 어긋나면 처음부터 다시 준비해야 합니다.</p></section>' +
      '<section class="sec gray"><h2>파묘·이장·개장, 개념부터 정확히</h2><div class="ij-terms">' + TERMS.map(function (t) { return '<div><b>' + t[0] + '</b><p>' + t[1] + '</p></div>'; }).join('') + '</div><p class="notice" style="margin-top:12px">개장은 반드시 관할 시·군·구청에 신고하고 허가증을 받은 뒤에 진행할 수 있습니다. 허가 전에 작업을 진행하면 법적 문제가 생길 수 있습니다.</p></section>' +
      '<section class="sec"><h2>이장 시기 선택 기준</h2><p class="lead">전통적으로 이장은 음력 길일을 택합니다. 음력 3월(봄)이 가장 선호되고, 음력 10월(가을)이 그다음입니다. 삼복, 기일, 명절 전후는 피하는 시기로 꼽히며, 지관이나 풍수사에게 날을 따로 받는 경우도 있습니다.</p><p class="lead" style="margin-top:10px">다만 시기는 가족 협의 일정, 새 안장지 계약 완료 여부, 개장 허가 처리 기간을 함께 고려해 정해야 합니다. 전통 기준과 행정 일정을 함께 맞추는 것이 실무 기준이며, 시기 확정은 이장 준비의 가장 마지막 단계입니다.</p></section>' +
      '<section class="sec gray"><h2>파묘·이장 7단계 절차</h2><ol class="ij-steps">' + STEPS.map(function (s, i) { return '<li><i>' + (i + 1) + '</i><div><b>' + s[0] + ' <small>' + s[1] + '</small></b><p>' + s[2] + '</p></div></li>'; }).join('') + '</ol></section>' +
      '<section class="sec"><h2>파묘·이장 전 확인 체크포인트</h2><p class="lead">준비하시는 분들이 실제로 가장 많이 빠뜨리는 항목입니다. 일곱 가지가 모두 정리된 뒤에 파묘 날짜를 확정하는 것이 기준입니다.</p><ul class="ij-check">' + CHECKS.map(function (c) { return '<li>' + ICON.check + c + '</li>'; }).join('') + '</ul></section>' +
      '<section class="sec gray"><h2>기준을 먼저 정리하고 시작하십시오</h2><p class="lead">파묘·이장은 가족 협의 → 새 안장지 선정 → 개장 신고 → 업체 계약 → 파묘 당일 → 재안장 → 마무리 제례의 순서로 진행됩니다. 빠뜨리기 쉬운 것은 새 안장지 계약의 선행, 개장 허가증 수령, 화장장 사전 예약입니다. 순서가 어긋나면 일정이 지연되거나 유해를 임시 보관해야 하는 문제가 생깁니다.</p>' +
      '<div class="contact-box" style="margin-top:18px"><small>이장 일정을 잡기 전에</small><b>파묘·이장 절차 전반을 함께 정리해 드립니다</b><div class="acts"><a class="btn btn-primary" href="contact.html?type=ijang">이장·개장 상담 신청</a><a class="btn btn-white" href="' + tel(S.phone) + '">전화문의</a>' + (S.kakao ? '<a class="btn btn-white" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카톡문의</a>' : '') + '</div></div></section>';
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
      '<section class="sec gray"><h2>어떤 서비스입니까</h2><p class="lead">' + esc(t.desc) + '</p>' +
      (t.pros ? '<div class="pc"><div class="gcard"><b>이런 점이 좋아요</b><ul class="dotl">' + t.pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' + (t.cons ? '<div class="gcard"><b>이런 점은 확인하십시오</b><ul class="dotl">' + t.cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') + '</div>' : '') +
      (t.reasons ? '<div class="gcard" style="margin-top:14px"><b>이럴 때 파묘·이장을 생각합니다</b><ul class="dotl">' + t.reasons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
      (t.recommend ? '<div class="gcard" style="margin-top:14px"><b>이런 가족께 권합니다</b><ul class="dotl">' + [].concat(t.recommend).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') + '</section>' +
      ((t.steps || S.steps) ? '<section class="sec"><h2>진행 순서</h2><div class="sgrid v">' + (t.steps || S.steps).map(function (x, i) { return '<div><span class="idx">0' + (i + 1) + '</span><b>' + esc(x.t) + '</b><span>' + esc(x.d) + '</span></div>'; }).join('') + '</div></section>' : '') +
      (list.length ? '<section class="sec gray"><h2>직접 답사한 ' + esc(t.name) + ' <small class="cnt">' + list.length + '곳</small></h2><div class="flist">' + list.slice(0, 6).map(function (f) { var ph = (f.photos || [])[0]; return '<a class="frow" href="facility.html?id=' + esc(f.id) + '">' + (ph ? '<img src="' + img(ph) + '" alt="" loading="lazy">' : '<span></span>') + '<div><div class="nm">' + esc(f.name) + '</div><div class="ar">' + esc(f.area) + (f.price ? ' · ' + esc(f.price) : '') + '</div></div></a>'; }).join('') + '</div><a class="btn btn-line btn-block mt12" href="' + (SEARCH_TYPES.some(function (x) { return x[0] === k; }) ? 'search.html?type=' + k : ROOT + 'facilities.html') + '">' + esc(t.name) + ' 전체 찾기·비교</a></section>' : '') +
      (t.faqs ? '<section class="sec"><h2>자주 묻는 질문</h2><div class="faq">' + t.faqs.map(function (f, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('') + '</div></section>' : '') +
      '<section class="sec gray"><div class="contact-box"><small>' + esc(t.name) + '에 대해 더 궁금하신 점은</small><b>연중무휴, 언제든 편히 연락 주십시오</b><div class="acts"><a class="btn btn-primary" href="contact.html?type=' + esc(cta) + '">상담 신청</a><a class="btn btn-white" href="' + tel(S.phone) + '">전화문의</a>' + (S.kakao ? '<a class="btn btn-white" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카톡문의</a>' : '') + '</div></div></section>';
    el.innerHTML = html;
  }

  /* ---------- 상담 신청 ---------- */
  var TYPES = [
    ['sumok', '수목장 분양', '나무 아래 자연장'], ['napgol', '봉안당(납골당)', '실내 안치단'], ['maejang', '매장묘·공원묘지', '가족 묘역'],
    ['ijang', '파묘·이장', '묘 정리·새 장지'], ['cremation', '화장장 예약 안내', '예약 절차·일정 안내'], ['support', '장례지원금', '대상 확인·신청 안내'], ['unsure', '아직 정하지 못했습니다', '상담하며 정합니다']
  ];
  var WHEN = [['urgent', '급합니다', '1주일 이내'], ['soon', '1~3개월 안에', ''], ['later', '미리 준비합니다', '생전 준비 등'], ['now', '임종하신 상태', '바로 연락드립니다'], ['unknown', '아직 정하지 못했습니다', '']];
  function typeLabel(k) { var t = TYPES.filter(function (x) { return x[0] === k; })[0]; return t ? t[1] : ''; }

  function contact() {
    var el = document.getElementById('cform'); if (!el) return;
    var fac = facility(qs('facility'));
    var type = qs('type') || (fac ? fac.type : '');
    if (!typeLabel(type)) type = '';
    var regions = (S.regions || []).slice();
    var preR = qs('region'), preW = qs('when');
    el.innerHTML = '<form id="form" novalidate>' +
      '<div class="fs"><h3><i>1</i>문의하실 내용을 선택해 주십시오<small>하나 선택</small></h3><div class="opts">' + TYPES.map(function (t) { return '<label class="opt"><input type="radio" name="type" value="' + t[0] + '"' + (t[0] === type ? ' checked' : '') + '><span>' + t[1] + '<small>' + t[2] + '</small></span></label>'; }).join('') + '</div>' +
      '<div class="notice" id="cremNote" hidden><b>화장장 예약은 보건복지부 e하늘 장사정보시스템에서만 할 수 있습니다.</b> 배웅이 예약 방법과 가능한 일정을 함께 확인해 드리고, 화장 이후 모실 곳까지 이어서 안내해 드립니다. <a href="' + EHANEUL + '" target="_blank" rel="noopener">e하늘 바로가기</a></div>' +
      (fac ? '<div class="notice"><b>' + esc(fac.name) + '</b> 시설 문의로 접수됩니다.</div>' : '') + '</div>' +
      '<div class="fs"><h3><i>2</i>희망하시는 지역을 선택해 주십시오<small>여러 개 선택 가능</small></h3><div class="opts four">' + regions.map(function (r) { return '<label class="opt chk"><input type="checkbox" name="region" value="' + esc(r) + '"' + (preR === r ? ' checked' : '') + '><span>' + esc(r) + '</span></label>'; }).join('') + '<label class="opt chk"><input type="checkbox" name="region" value="상관없음"' + (preR === '상관없음' ? ' checked' : '') + '><span>상관없음</span></label></div></div>' +
      '<div class="fs"><h3><i>3</i>언제까지 필요하신지 알려주십시오</h3><div class="opts four">' + WHEN.map(function (w) { return '<label class="opt"><input type="radio" name="when" value="' + w[0] + '"' + (preW === w[0] ? ' checked' : '') + '><span>' + w[1] + (w[2] ? '<small>' + w[2] + '</small>' : '') + '</span></label>'; }).join('') + '</div></div>' +
      '<div class="fs"><h3><i>4</i>연락받으실 정보</h3>' +
      '<div class="field"><label for="f-name">이름 <em>*</em></label><input id="f-name" autocomplete="name" placeholder="홍길동" value="' + esc(qs('name')) + '"></div>' +
      '<div class="field"><label for="f-phone">휴대폰 번호 <em>*</em></label><input id="f-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="' + esc(qs('phone')) + '"></div>' +
      '<div class="field"><label for="f-memo">궁금하신 점 (선택)</label><textarea id="f-memo" placeholder="모실 인원, 예산, 원하시는 조건 등을 적어 주십시오">' + esc(qs('memo')) + '</textarea></div>' +
      '<label class="agree"><input type="checkbox" id="f-agree"><span>상담을 위한 개인정보(이름, 연락처, 문의 내용) 수집·이용에 동의합니다. 상담 완료 후 1년간 보관 후 파기합니다. <a href="' + ROOT + 'privacy.html" target="_blank">자세히 보기</a></span></label>' +
      '<button class="btn btn-primary btn-block" type="submit" style="margin-top:18px;height:52px">상담 신청하기</button>' +
      '<p style="margin-top:10px;font-size:12px;color:var(--muted);text-align:center">접수 후 상담팀이 순서대로 연락드리겠습니다. 급하신 경우 ' + esc(S.phone) + ' 로 바로 전화 주십시오.</p></div></form>' +
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
      if (!val('type')) return alertBox('문의 유형을 선택해 주십시오.');
      if (!name) return alertBox('이름을 입력해 주십시오.');
      if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone)) return alertBox('휴대폰 번호를 확인해 주십시오.');
      if (!form.querySelector('#f-agree').checked) return alertBox('개인정보 수집·이용에 동의해 주십시오.');
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
        '<p>' + (ok ? '상담팀이 순서대로 연락드리겠습니다. 급하신 경우 바로 전화 주십시오.' : '실제 홈페이지에서는 이 화면에서 접수됩니다. 지금은 아래 버튼으로 카카오톡이나 전화로 같은 내용을 보내 주십시오.') + '</p>' +
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
  if (page === 'search') searchPage();
  if (page === 'crematorium') cremPage();
  if (page === 'ijang') ijangPage();
  if (page === 'contact') contact();
})();
