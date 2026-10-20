/* 배웅 시안 v2 — 공통 렌더 + 페이지별 렌더. 콘텐츠는 ../js/defaults.js (CONTENT_DEFAULT) 를 그대로 사용 */
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
    up: '<svg viewBox="0 0 24 24"><path d="m12 6-8 8 1.4 1.4L12 8.8l6.6 6.6L20 14z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M12 3 2 12h3v8h5v-6h4v6h5v-8h3z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M10 6 8.6 7.4 13.2 12l-4.6 4.6L10 18l6-6z"/></svg>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function img(p) { return p ? (/^(https?:)?\/\//.test(p) ? p : ROOT + p) : ''; }
  function tel(p) { return 'tel:' + String(p || '').replace(/[^0-9+]/g, ''); }
  function qs(k) { return new URLSearchParams(location.search).get(k) || ''; }
  function typeOf(k) { return C.types[k] || { name: '' }; }
  function facilities(type) { return (C.facilities || []).filter(function (f) { return f.visible !== false && (!type || f.type === type); }); }
  function facility(id) { return (C.facilities || []).filter(function (f) { return f.id === id; })[0]; }
  function here() { return location.pathname.split('/').pop() || 'index.html'; }
  window.V2 = { esc: esc, img: img, tel: tel, qs: qs, typeOf: typeOf, facilities: facilities, facility: facility, C: C, S: S, ICON: ICON, EHANEUL: EHANEUL };

  /* ---------- 공통 틀 ---------- */
  var NAV = [
    ['index.html#sumok', '수목장 분양', 'hot'], ['index.html#napgol', '봉안당'], ['index.html#maejang', '매장묘'], ['index.html#ijang', '파묘·이장'],
    ['index.html#crem', '화장장 예약 안내'], ['index.html#story', '배웅 이야기'], ['contact.html', '상담 신청']
  ];
  function shell() {
    var h = here();
    var top = '';
    var nav = NAV.map(function (n) { var on = n[0] === h ? ' on' : ''; return '<a href="' + n[0] + '" class="' + (n[2] || '') + on + '">' + n[1] + '</a>'; }).join('');
    var head = '<header class="header"><div class="wrap">' +
      '<a class="logo" href="index.html" aria-label="배웅 홈"><img src="img/logo-h.png" alt="배웅 BAEWOONG"></a>' +
      '<nav class="nav" aria-label="주 메뉴">' + nav + '</nav>' +
      '<div class="head-cta"><a class="btn btn-gold btn-sm" href="contact.html">상담 신청</a></div>' +
      '<button class="burger" aria-label="메뉴 열기" id="burger"><span></span><span></span><span></span></button></div></header>' +
      '<div class="drawer" id="drawer"><div class="panel"><button class="close" id="drawerClose" aria-label="닫기">×</button><img src="img/logo-h.png" alt="배웅" style="height:36px;width:auto;margin-bottom:14px">' +
      NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join('') +
      '<a href="' + tel(S.phone) + '">전화 상담 ' + esc(S.phone) + '</a>' + (S.kakao ? '<a href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카카오톡 상담</a>' : '') + '</div></div>';
    var foot = '<footer class="footer"><div class="wrap">' +
      '<div><div class="brand">배웅<small>BAEWOONG</small></div><p>' + esc(S.bizName) + '<br>' + esc(S.bizDesc) + '<br>상담 ' + esc(S.phone) + ' · ' + esc(S.hours) + '</p></div>' +
      '<div><h5>서비스</h5><div class="links"><a href="index.html#sumok">수목장 분양</a><a href="index.html#napgol">봉안당(납골당)</a><a href="index.html#maejang">매장묘·공원묘지</a><a href="index.html#ijang">파묘·이장</a><a href="index.html#crem">화장장 예약 안내</a></div></div>' +
      '<div><h5>안내</h5><div class="links"><a href="contact.html">상담 신청</a>' + (S.blogUrl ? '<a href="' + esc(S.blogUrl) + '" target="_blank" rel="noopener">배웅 블로그</a>' : '') + '<a href="' + ROOT + 'privacy.html">개인정보 처리방침</a><a href="' + ROOT + '" >기존 홈페이지 보기</a></div></div>' +
      '<div class="copy">© ' + new Date().getFullYear() + ' ' + esc(S.bizName) + '. 시설 사진은 배웅 상담팀이 직접 답사하며 촬영했습니다. 안내 비용은 상담 시점의 시설 공지에 따라 달라질 수 있습니다.</div>' +
      '</div></footer>';
    var fl = '<div class="float">' +
      '<a class="tel" href="' + tel(S.phone) + '">' + ICON.phone + '전화 상담</a>' +
      (S.kakao ? '<a class="kk" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카톡 상담</a>' : '') +
      '<a class="crem" href="contact.html?type=cremation">' + ICON.flame + '화장장 예약</a>' +
      '<a href="contact.html">' + ICON.form + '상담 신청</a>' +
      '<a class="top" href="#top" aria-label="맨 위로">' + ICON.up + 'TOP</a></div>' +
      '<nav class="tabbar" aria-label="빠른 메뉴">' +
      '<a href="index.html">' + ICON.home + '홈</a>' +
      '<a class="crem" href="contact.html?type=cremation">' + ICON.flame + '화장장 예약</a>' +
      '<a class="tel" href="' + tel(S.phone) + '">' + ICON.phone + '전화 상담</a>' +
      '<a href="contact.html">' + ICON.form + '상담 신청</a></nav>';
    document.body.insertAdjacentHTML('afterbegin', '<a id="top"></a>' + top + head);
    document.body.insertAdjacentHTML('beforeend', foot + fl);
    var dr = document.getElementById('drawer');
    document.getElementById('burger').onclick = function () { dr.classList.add('open'); };
    document.getElementById('drawerClose').onclick = function () { dr.classList.remove('open'); };
    dr.onclick = function (e) { if (e.target === dr) dr.classList.remove('open'); };
  }

  /* ---------- 조각 ---------- */
  function fcard(f) {
    var t = typeOf(f.type);
    var ph = (f.photos || [])[0];
    return '<article class="fcard">' +
      '<a class="ph" href="facility.html?id=' + esc(f.id) + '">' + (ph ? '<img src="' + img(ph) + '" alt="' + esc(f.name) + '" loading="lazy">' : '') +
      '<div class="bd"><span>답사 완료</span>' + (f.featured ? '<span class="rec">배웅 추천</span>' : '') + '</div></a>' +
      '<div class="body"><div class="area">' + esc(f.area) + ' · ' + esc(t.name) + '</div><h4><a href="facility.html?id=' + esc(f.id) + '">' + esc(f.name) + '</a></h4>' +
      (f.tags && f.tags.length ? '<div class="tags">' + f.tags.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
      '<p>' + esc(f.comment) + '</p>' +
      '<div class="price"><span>사용료</span><b>' + esc(f.price || '상담 시 안내') + '</b></div>' +
      '<div class="acts"><a href="facility.html?id=' + esc(f.id) + '">자세히 보기</a><a class="fill" href="contact.html?type=' + esc(f.type) + '&facility=' + esc(f.id) + '">이 시설 상담</a></div>' +
      '</div></article>';
  }
  window.V2.fcard = fcard;

  function grid(type, el) {
    var list = facilities(type);
    var areas = [];
    list.forEach(function (f) { var a = (f.area || '').split(' ')[1] || f.area; if (areas.indexOf(a) < 0) areas.push(a); });
    var t = typeOf(type);
    el.innerHTML = '<div class="grid-head"><h3>' + esc(t.name) + ' 답사 시설<small>' + list.length + '곳</small></h3>' +
      (areas.length > 1 ? '<div class="filters"><button class="chip on" data-a="">전체</button>' + areas.map(function (a) { return '<button class="chip" data-a="' + esc(a) + '">' + esc(a) + '</button>'; }).join('') + '</div>' : '') + '</div>' +
      '<div class="fgrid"></div>';
    var g = el.querySelector('.fgrid');
    function draw(a) { g.innerHTML = list.filter(function (f) { return !a || (f.area || '').indexOf(a) >= 0; }).map(fcard).join(''); }
    draw('');
    el.querySelectorAll('.chip').forEach(function (b) { b.onclick = function () { el.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); draw(b.dataset.a); }; });
  }

  /* ---------- 첫 화면 ---------- */
  function home() {
    document.querySelectorAll('[data-grid]').forEach(function (el) { grid(el.dataset.grid, el); });
    var st = document.getElementById('stats');
    var KI = { map: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>', chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>', won: '<svg viewBox="0 0 24 24"><path d="M3 5h2.2l1.7 7 1.8-7h2.6l1.8 7 1.7-7H17l-.6 2H21v2h-5.1l-.5 2H21v2h-6.1l-1.2 5h-2.4l-1.2-5H9.9L8.7 21H6.3l-1.2-5H3v-2h1.6l-.5-2H3V9h.6L3 5zm7.2 6-.3 1h4.2l-.3-1h-3.6z"/></svg>', cal: '<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>' };
    if (st) st.innerHTML = [
      [KI.map, facilities().length, '곳', '직접 답사한 시설'], [KI.chat, (C.reviews || []).length, '편', '동행 상담 후기'], [KI.won, '0', '원', '상담·동행 답사 비용'], [KI.cal, '주말', '', '동행 답사 가능']
    ].map(function (x) { return '<div class="panel kpi"><i>' + x[0] + '</i><div><b>' + x[1] + (x[2] ? '<small>' + x[2] + '</small>' : '') + '</b><span>' + x[3] + '</span></div></div>'; }).join('');
    var strip = document.getElementById('strip');
    if (strip) strip.innerHTML = TYPE_KEYS.map(function (k) { var t = typeOf(k); return '<a href="#' + k + '" data-go="' + k + '"><img src="' + img(t.image) + '" alt=""><span>' + esc(t.name) + '</span></a>'; }).join('');
    var qt = document.getElementById('qtypes');
    if (qt) qt.innerHTML = [['sumok', '수목장 분양'], ['napgol', '봉안당'], ['maejang', '매장묘'], ['ijang', '파묘·이장'], ['cremation', '화장장 예약'], ['unsure', '잘 모르겠어요']].map(function (x, i) { return '<label class="opt sm"><input type="radio" name="qtype" value="' + x[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + x[1] + '</span></label>'; }).join('');
    var qtel = document.getElementById('q-tel'); if (qtel) { qtel.textContent = S.phone; qtel.parentNode.querySelector('b').outerHTML = '<a href="' + tel(S.phone) + '"><b>' + esc(S.phone) + '</b></a>'; }
    var ft = document.getElementById('final-tel'); if (ft) { ft.textContent = S.phone; ft.href = tel(S.phone); }
    var fk = document.getElementById('final-kakao'); if (fk) { if (S.kakao) fk.href = S.kakao; else fk.remove(); }
    var bl = document.getElementById('blogLink'); if (bl) { if (S.blogUrl) bl.href = S.blogUrl; else bl.remove(); }
    /* 서비스 탭 */
    function showTab(k, scroll) {
      if (!document.querySelector('[data-pane="' + k + '"]')) return;
      document.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === k); });
      document.querySelectorAll('[data-pane]').forEach(function (p) { p.classList.toggle('on', p.dataset.pane === k); });
      if (scroll) document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { showTab(b.dataset.tab, false); history.replaceState(null, '', '#' + b.dataset.tab); }; });
    document.addEventListener('click', function (e) { var a = e.target.closest('a[href^="#"], a[href*="index.html#"]'); if (!a) return; var k = a.getAttribute('href').split('#')[1]; if (k && document.querySelector('[data-pane="' + k + '"]')) { e.preventDefault(); showTab(k, true); history.replaceState(null, '', '#' + k); } });
    if (location.hash && document.querySelector('[data-pane="' + location.hash.slice(1) + '"]')) showTab(location.hash.slice(1), true);
    ['sumok', 'napgol', 'maejang'].forEach(function (k) {
      var t = typeOf(k), el = document.getElementById('pros-' + k);
      if (el) el.innerHTML = (t.pros || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('');
    });
    var ij = typeOf('ijang');
    var r = document.getElementById('ijang-reasons'); if (r) r.innerHTML = (ij.reasons || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    var s = document.getElementById('ijang-steps'); if (s) s.innerHTML = (ij.steps || []).map(function (x, i) { return '<li><i>' + (i + 1) + '</i><div><b>' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></div></li>'; }).join('');
    var sp = document.getElementById('steps'); if (sp) sp.innerHTML = (S.steps || []).map(function (x) { return '<li><b>' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></li>'; }).join('');
    var wy = document.getElementById('why'); if (wy) wy.innerHTML = (S.why || []).map(function (x) { return '<li><i>' + ICON.check + '</i><div><b>' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></div></li>'; }).join('');
    var rv = document.getElementById('reviews');
    if (rv) rv.innerHTML = (C.reviews || []).filter(function (x) { return x.visible !== false; }).slice(0, 5).map(function (x) {
      var f = facility(x.facilityId); var ph = (x.photos || [])[0] || (f && (f.photos || [])[0]);
      return '<a class="row" href="' + esc(x.blogUrl || '../reviews.html') + '" target="_blank" rel="noopener">' + (ph ? '<img src="' + img(ph) + '" alt="" loading="lazy">' : '<span class="ph-empty"></span>') + '<div><b>' + esc(x.title) + '</b><small>' + esc(x.author) + ' · ' + esc(x.date) + (f ? ' · ' + esc(f.name) : '') + '</small></div><span class="go">읽기 ›</span></a>';
    }).join('');
    var ar = document.getElementById('articles');
    if (ar) ar.innerHTML = (C.articles || []).slice(0, 5).map(function (a) {
      return '<a class="row" href="' + esc(a.url) + '" target="_blank" rel="noopener">' + (a.image ? '<img src="' + img(a.image) + '" alt="" loading="lazy">' : '<span class="ph-empty"></span>') + '<div><b>' + esc(a.title) + '</b><small>' + esc(a.date) + ' · 배웅 블로그</small></div><span class="go">읽기 ›</span></a>';
    }).join('');
    var fq = document.getElementById('faq');
    if (fq) fq.innerHTML = (C.faqs || []).map(function (q, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(q.q) + '</summary><div class="a">' + nl(q.a) + '</div></details>'; }).join('');
    var qf = document.getElementById('qform');
    if (qf) qf.onsubmit = function (e) {
      e.preventDefault();
      var name = qf.querySelector('#q-name').value.trim(), phone = qf.querySelector('#q-phone').value.trim();
      if (!name || !phone) return alertBox('이름과 연락처를 입력해 주세요.');
      if (!qf.querySelector('#q-agree').checked) return alertBox('개인정보 수집·이용에 동의해 주세요.');
      var qtv = qf.querySelector('input[name=qtype]:checked');
      location.href = 'contact.html?name=' + encodeURIComponent(name) + '&phone=' + encodeURIComponent(phone) + '&type=' + encodeURIComponent(qtv ? qtv.value : '');
    };
  }
  function alertBox(msg) { var d = document.createElement('div'); d.textContent = msg; d.style.cssText = 'position:fixed;left:50%;bottom:110px;transform:translateX(-50%);background:#1C2A1F;color:#fff;padding:12px 20px;border-radius:999px;font-size:14px;z-index:99;box-shadow:0 8px 24px rgba(0,0,0,.2)'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2200); }
  window.V2.alertBox = alertBox;

  /* ---------- 상담 신청 ---------- */
  var TYPES = [
    ['sumok', '수목장 분양', '나무 아래 자연장'], ['napgol', '봉안당(납골당)', '실내 안치단'], ['maejang', '매장묘·공원묘지', '가족 묘역'],
    ['ijang', '파묘·이장', '묘 정리·새 장지'], ['cremation', '화장장 예약 안내', '예약 절차·일정 안내'], ['unsure', '아직 모르겠어요', '상담하며 정해요']
  ];
  var WHEN = [['urgent', '급해요', '1주일 이내'], ['soon', '1~3개월 안에', ''], ['later', '미리 준비해요', '생전 준비 등'], ['unknown', '아직 모르겠어요', '']];
  function typeLabel(k) { var t = TYPES.filter(function (x) { return x[0] === k; })[0]; return t ? t[1] : ''; }

  function contact() {
    var el = document.getElementById('cform'); if (!el) return;
    var fac = facility(qs('facility'));
    var type = qs('type') || (fac ? fac.type : '');
    if (!typeLabel(type)) type = '';
    var regions = (S.regions || []).slice();
    el.innerHTML = '<form class="card" id="form" novalidate>' +
      '<div class="fs"><h3><i>1</i>어떤 일로 문의하세요?<small>하나 선택</small></h3><div class="opts">' + TYPES.map(function (t) { return '<label class="opt"><input type="radio" name="type" value="' + t[0] + '"' + (t[0] === type ? ' checked' : '') + '><span>' + t[1] + '<small>' + t[2] + '</small></span></label>'; }).join('') + '</div>' +
      '<div class="notice" id="cremNote" hidden><b>화장장 예약은 보건복지부 e하늘 장사정보시스템에서만 할 수 있습니다.</b> 배웅이 예약 방법과 가능한 일정을 함께 확인해 드리고, 화장 이후 모실 곳까지 이어서 안내해 드립니다. <a href="' + EHANEUL + '" target="_blank" rel="noopener">e하늘 바로가기</a></div>' +
      (fac ? '<div class="notice"><b>' + esc(fac.name) + '</b> 시설 문의로 접수됩니다.</div>' : '') + '</div>' +
      '<div class="fs"><h3><i>2</i>희망하시는 지역은요?<small>여러 개 선택 가능</small></h3><div class="opts four">' + regions.map(function (r) { return '<label class="opt chk"><input type="checkbox" name="region" value="' + esc(r) + '"><span>' + esc(r) + '</span></label>'; }).join('') + '<label class="opt chk"><input type="checkbox" name="region" value="상관없음"><span>상관없어요</span></label></div></div>' +
      '<div class="fs"><h3><i>3</i>언제까지 필요하세요?</h3><div class="opts four">' + WHEN.map(function (w) { return '<label class="opt"><input type="radio" name="when" value="' + w[0] + '"><span>' + w[1] + (w[2] ? '<small>' + w[2] + '</small>' : '') + '</span></label>'; }).join('') + '</div></div>' +
      '<div class="fs"><h3><i>4</i>연락받으실 정보</h3><div class="frow">' +
      '<div class="field"><label for="f-name">이름 <em>*</em></label><input id="f-name" autocomplete="name" placeholder="홍길동" value="' + esc(qs('name')) + '"></div>' +
      '<div class="field"><label for="f-phone">휴대폰 번호 <em>*</em></label><input id="f-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="' + esc(qs('phone')) + '"></div></div>' +
      '<div class="field"><label for="f-memo">궁금하신 점 (선택)</label><textarea id="f-memo" placeholder="모실 인원, 예산, 원하시는 조건 등을 적어 주세요"></textarea></div>' +
      '<label class="agree"><input type="checkbox" id="f-agree"><span>상담을 위한 개인정보(이름, 연락처, 문의 내용) 수집·이용에 동의합니다. 상담 완료 후 1년간 보관 후 파기합니다. <a href="' + ROOT + 'privacy.html" target="_blank">자세히 보기</a></span></label>' +
      '<button class="btn btn-gold btn-block" type="submit" style="margin-top:20px;height:58px;font-size:17px">상담 신청하기</button>' +
      '<p style="margin-top:10px;font-size:12px;color:var(--muted);text-align:center">접수 후 상담팀이 순서대로 연락드립니다. 급하시면 ' + esc(S.phone) + ' 로 바로 전화 주세요.</p></div></form>' +
      '<aside class="side"><div class="card"><h3>바로 상담</h3><a class="tel" href="' + tel(S.phone) + '">' + esc(S.phone) + '</a><p>' + esc(S.hours) + '</p>' + (S.kakao ? '<a class="btn btn-kakao btn-block" style="margin-top:14px" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카카오톡 상담</a>' : '') + '</div>' +
      '<div class="card"><h3>선택하신 내용</h3><div class="sum" id="sum"></div></div></aside>';
    var form = document.getElementById('form');
    function val(n) { var x = form.querySelector('input[name=' + n + ']:checked'); return x ? x.value : ''; }
    function regs() { return Array.prototype.map.call(form.querySelectorAll('input[name=region]:checked'), function (x) { return x.value; }); }
    function sync() {
      document.getElementById('cremNote').hidden = val('type') !== 'cremation';
      var w = WHEN.filter(function (x) { return x[0] === val('when'); })[0];
      document.getElementById('sum').innerHTML = [['문의', typeLabel(val('type'))], ['시설', fac ? fac.name : ''], ['지역', regs().join(', ')], ['시기', w ? w[1] : '']].map(function (r) { return '<div><span>' + r[0] + '</span><b>' + (r[1] ? esc(r[1]) : '<span style="color:var(--line)">-</span>') + '</b></div>'; }).join('');
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
      var rec = { type: typeLabel(val('type')), region: regs().join(', '), when: w ? w[1] : '', name: name, phone: phone, memo: form.querySelector('#f-memo').value.trim(), facility: fac ? fac.name : '', page: 'v2' };
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = '접수 중…';
      fetch(ROOT + 'admin/api.php?action=inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function () { done(rec, true); })
        .catch(function () { done(rec, false); });
    };
    function done(rec, ok) {
      var msg = '[배웅 상담 신청]\n문의: ' + rec.type + (rec.facility ? '\n시설: ' + rec.facility : '') + '\n지역: ' + (rec.region || '-') + '\n시기: ' + (rec.when || '-') + '\n이름: ' + rec.name + '\n연락처: ' + rec.phone + (rec.memo ? '\n내용: ' + rec.memo : '');
      el.innerHTML = '<div class="card done" style="grid-column:1/-1;max-width:640px;margin:0 auto"><div class="ic">' + ICON.check + '</div>' +
        '<h3>' + (ok ? '상담 신청이 접수되었습니다' : '미리보기 화면에서는 접수되지 않습니다') + '</h3>' +
        '<p>' + (ok ? '상담팀이 순서대로 연락드리겠습니다. 급하시면 바로 전화 주세요.' : '실제 홈페이지에서는 이 화면에서 접수됩니다. 지금은 아래 버튼으로 카카오톡이나 전화로 같은 내용을 보내 주세요.') + '</p>' +
        '<pre style="text-align:left;background:var(--cream);border-radius:10px;padding:16px;font:inherit;font-size:14px;white-space:pre-wrap;margin-top:20px">' + esc(msg) + '</pre>' +
        '<div class="acts">' + (S.kakao ? '<a class="btn btn-kakao" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카카오톡으로 보내기</a>' : '') + '<a class="btn btn-green" href="' + tel(S.phone) + '">' + ICON.phone + esc(S.phone) + ' 전화하기</a><a class="btn btn-line" href="index.html">홈으로</a></div></div>';
      window.scrollTo(0, 0);
    }
  }

  /* ---------- 시설 상세 ---------- */
  function facilityPage() {
    var el = document.getElementById('fpage'); if (!el) return;
    var f = facility(qs('id'));
    if (!f) { el.innerHTML = '<div class="wrap page"><p>시설을 찾을 수 없습니다. <a href="index.html" style="text-decoration:underline">첫 화면으로</a></p></div>'; return; }
    var t = typeOf(f.type);
    document.title = f.name + ' | 배웅';
    var q = encodeURIComponent(f.address && f.address.length > 8 ? f.address : f.name);
    var photos = (f.photos || []).map(img);
    el.innerHTML = '<div class="wrap page"><div class="panel"><div class="panel-head"><div class="crumb"><a href="index.html">홈</a> › <a href="index.html#' + esc(f.type) + '">' + esc(t.name) + '</a> › ' + esc(f.name) + '</div></div>' +
      '<div class="fdetail"><div class="gallery"><div class="main"><img id="gmain" src="' + photos[0] + '" alt="' + esc(f.name) + '"></div><div class="thumbs">' + photos.map(function (p, i) { return '<img src="' + p + '" alt="" class="' + (i === 0 ? 'on' : '') + '" data-i="' + i + '">'; }).join('') + '</div></div>' +
      '<div class="finfo"><div class="area">' + esc(t.name) + ' · ' + esc(f.area) + (f.featured ? ' · 배웅 추천' : '') + '</div><h1>' + esc(f.name) + '</h1>' +
      (f.tags && f.tags.length ? '<div class="tags" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">' + f.tags.map(function (x) { return '<span style="font-size:12px;background:var(--cream);border-radius:4px;padding:3px 8px">' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
      '<p class="comment">' + esc(f.comment) + '</p>' +
      '<table>' + [['유형', t.name], ['지역', f.area], ['주소', f.address], ['운영', f.operator], ['사용료', (f.price || '상담 시 안내') + ' <small style="color:var(--muted)">· ' + esc(t.priceTag) + ' 평균 ' + esc(t.price) + '</small>']].filter(function (r) { return r[1]; }).map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + (r[0] === '사용료' ? r[1] : esc(r[1])) + '</td></tr>'; }).join('') + '</table>' +
      '<div class="maps"><a href="https://map.naver.com/p/search/' + q + '" target="_blank" rel="noopener">네이버 지도</a><a href="https://map.kakao.com/?q=' + q + '" target="_blank" rel="noopener">카카오맵</a>' + (f.blogUrl ? '<a href="' + esc(f.blogUrl) + '" target="_blank" rel="noopener">답사 후기</a>' : '') + '</div>' +
      '<div class="acts"><a class="btn btn-gold btn-block" href="contact.html?type=' + esc(f.type) + '&facility=' + esc(f.id) + '">' + ICON.form + '이 시설로 상담 신청</a><a class="btn btn-line btn-block" href="' + tel(S.phone) + '">' + ICON.phone + '전화로 바로 묻기 ' + esc(S.phone) + '</a></div>' +
      '<p style="margin-top:14px;font-size:12px;color:var(--muted)">※ 사용료·관리비·이용 기간은 시설 공지에 따라 달라집니다. 계약 전에 서면으로 비교해 드립니다.</p></div></div>' +
      '<div class="related"><h3>함께 보는 ' + esc(t.name) + '</h3><div class="fgrid">' + facilities(f.type).filter(function (x) { return x.id !== f.id; }).slice(0, 4).map(fcard).join('') + '</div></div></div></div>';
    el.querySelectorAll('.thumbs img').forEach(function (im) { im.onclick = function () { document.getElementById('gmain').src = im.src; el.querySelectorAll('.thumbs img').forEach(function (x) { x.classList.remove('on'); }); im.classList.add('on'); }; });
  }

  shell();
  var page = document.body.dataset.page;
  if (page === 'home') home();
  if (page === 'contact') contact();
  if (page === 'facility') facilityPage();
})();
