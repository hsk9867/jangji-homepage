/* 배웅 시안 v3 (goifuneral 구성 참고) — 공통 렌더 + 페이지별 렌더. 콘텐츠는 ../js/defaults.js (CONTENT_DEFAULT) 를 그대로 사용 */
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


  /* ---------- 공통 틀 (고이 스타일 헤더·푸터) ---------- */
  var MENU = [['type.html?type=sumok', '수목장', 'badge'], ['type.html?type=napgol', '봉안당'], ['type.html?type=maejang', '매장묘'], ['type.html?type=ijang', '파묘·이장'], ['index.html#reviews', '동행 후기', 'cnt'], ['index.html#story', '배웅 이야기']];
  function shell() {
    var cnt = (C.reviews || []).filter(function (x) { return x.visible !== false; }).length;
    var menu = MENU.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + (n[2] === 'badge' ? '<span class="n">N</span>' : n[2] === 'cnt' ? '<span class="cnt">' + cnt + '</span>' : '') + '</a>'; }).join('');
    var head = '<header class="header"><div class="top">' +
      '<a class="logo" href="index.html" aria-label="배웅 홈"><img src="img/logo-h.png" alt="배웅"></a>' +
      '<div class="pills"><a class="pill gold" href="' + tel(S.phone) + '">' + ICON.phone + '24시간 상담</a><a class="pill line" href="index.html#facilities">' + ICON.home + '시설 찾기</a></div>' +
      '<button class="burger" aria-label="메뉴 열기" id="burger"><span></span><span></span><span></span></button></div>' +
      '<nav class="menu" aria-label="주 메뉴">' + menu + '</nav></header>' +
      '<div class="drawer" id="drawer"><div class="panel"><button class="close" id="drawerClose" aria-label="닫기">×</button><img src="img/logo-h.png" alt="배웅" style="height:30px;width:auto;margin-bottom:14px">' +
      MENU.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join('') +
      '<a href="contact.html">상담 신청</a><a href="' + tel(S.phone) + '">전화 상담 ' + esc(S.phone) + '</a>' + (S.kakao ? '<a href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카카오톡 상담</a>' : '') + '</div></div>';
    var foot = '<footer class="footer">' +
      '<div class="links"><a href="type.html?type=sumok">수목장</a><a href="type.html?type=napgol">봉안당</a><a href="type.html?type=maejang">매장묘</a><a href="type.html?type=ijang">파묘·이장</a><a href="contact.html">상담 신청</a><a href="' + ROOT + 'privacy.html">개인정보처리방침</a>' + (S.blogUrl ? '<a href="' + esc(S.blogUrl) + '" target="_blank" rel="noopener">블로그</a>' : '') + '</div>' +
      '<b>' + esc(S.bizName) + '</b><br>' + esc(S.bizDesc) + '<br>' + (S.ceo ? '대표 : ' + esc(S.ceo) + ' | ' : '') + '전화 문의 : ' + esc(S.phone) + '<br>' + (S.address ? '주소 : ' + esc(S.address) + '<br>' : '') + (S.bizNo ? '사업자 등록번호 : ' + esc(S.bizNo) + '<br>' : '') +
      '<span style="display:block;margin-top:10px">© ' + new Date().getFullYear() + ' ' + esc(S.bizName) + ' ALL RIGHTS RESERVED. 시설 사진은 배웅 상담팀이 직접 답사하며 촬영했습니다.</span></footer>';
    var fl = '<div class="float">' + (S.kakao ? '<a class="kk" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카톡 상담</a>' : '') + '<a href="' + tel(S.phone) + '">' + ICON.phone + '전화 상담</a></div>';
    var side = '<aside class="brand-side"><img src="img/logo-h.png" alt="배웅"><h2>모실 곳을 정하는 일,<br>배웅이 <em class="ul" style="font-style:normal">처음부터</em> 함께 걷겠습니다</h2><p>직접 답사한 수목장·봉안당·공원묘지만 안내하고, 비용과 조건은 서면으로 비교해 드려요.</p><a class="btn btn-line" href="contact.html">장지 상담 신청하기</a></aside>';
    document.body.insertAdjacentHTML('afterbegin', '<a id="top"></a>' + head);
    document.body.insertAdjacentHTML('beforeend', foot + fl + side);
    var dr = document.getElementById('drawer');
    document.getElementById('burger').onclick = function () { dr.classList.add('open'); };
    document.getElementById('drawerClose').onclick = function () { dr.classList.remove('open'); };
    dr.onclick = function (e) { if (e.target === dr) dr.classList.remove('open'); };
  }

  /* ---------- 타이포그래피 효과 ---------- */
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function splitChars(text) {
    var n = 0;
    return String(text == null ? '' : text).split('\n').map(function (line) {
      return Array.prototype.map.call(line, function (ch) {
        if (ch === ' ') return ' ';
        return '<span class="ch" style="--i:' + (n++) + '">' + esc(ch) + '</span>';
      }).join('');
    }).join('<br>');
  }
  function countUp(el, to, suffix) {
    if (REDUCE || !('IntersectionObserver' in window)) { el.textContent = to + suffix; return; }
    el.textContent = '0' + suffix;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io.disconnect();
      var t0 = performance.now(), dur = 900;
      (function tick(now) { var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e) + suffix; if (p < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .6 });
    io.observe(el);
  }
  function typo() {
    var targets = document.querySelectorAll('.sec .h, .sec .h1, .sec .sub, .sec .crumb, .promo h3, .promo p, .brand-side h2, .brand-side p, .tile, .h-row');
    if (REDUCE || !('IntersectionObserver' in window)) { document.querySelectorAll('.ul').forEach(function (u) { u.classList.add('in'); }); return; }
    targets.forEach(function (el) {
      if (el.classList.contains('tf')) return;
      var sec = el.closest('.sec, .promo, .brand-side') || el.parentNode;
      var order = Array.prototype.indexOf.call(sec.querySelectorAll('.h, .h1, .sub, .crumb, h3, p, .tile, .h-row'), el);
      el.classList.add('tf'); if (order > 0) el.classList.add('tf-d' + Math.min(3, order));
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.tf').forEach(function (el) { io.observe(el); });
    document.querySelectorAll('.ul').forEach(function (u) { if (!u.closest('.tf')) io.observe(u); });
    // 첫 화면에 이미 보이는 것은 바로
    requestAnimationFrame(function () { document.querySelectorAll('.tf').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight * .9 && r.bottom > 0) el.classList.add('in'); }); });
  }

  /* ---------- 첫 화면 ---------- */
  function fitem(f) {
    var t = typeOf(f.type), ph = (f.photos || [])[0];
    return '<a class="fitem" href="facility.html?id=' + esc(f.id) + '">' + (ph ? '<img src="' + img(ph) + '" alt="" loading="lazy">' : '<span></span>') +
      '<div><span class="t">' + esc(f.area) + ' · ' + esc(t.name) + '</span><b>' + esc(f.name) + '</b><div class="p">사용료 <em>' + esc(f.price || '상담 시 안내') + '</em>' + (f.featured ? ' · 배웅 추천' : '') + '</div></div></a>';
  }
  function home() {
    /* 배너 */
    var cards = (S.cards || []).slice(0, 4);
    var track = document.getElementById('bannerTrack'), dots = document.getElementById('bannerDots');
    if (track && cards.length) {
      track.innerHTML = cards.map(function (c) {
        var href = c.href === 'tel' ? tel(S.phone) : (/\.html$/.test(c.href) ? (c.href === 'contact.html' ? 'contact.html' : 'type.html?type=' + ({ 'sumokjang.html': 'sumok', 'napgoldang.html': 'napgol', 'maejang.html': 'maejang', 'ijang.html': 'ijang' }[c.href] || 'sumok')) : c.href);
        return '<a class="slide" href="' + esc(href) + '"><img src="' + img(c.image) + '" alt=""><div class="txt"><span class="tag">' + esc(c.tag) + '</span><b>' + splitChars(c.t) + '</b></div></a>';
      }).join('');
      dots.innerHTML = cards.map(function (_, i) { return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('');
      var i = 0, n = cards.length, timer;
      var slides = track.querySelectorAll('.slide');
      function mark() { slides.forEach(function (s, j) { if (j === i) { if (!s.classList.contains('on')) { s.classList.remove('on'); void s.offsetWidth; s.classList.add('on'); } } else s.classList.remove('on'); }); }
      function go(k) { i = (k + n) % n; track.style.transform = 'translateX(-' + (i * 100) + '%)'; dots.querySelectorAll('i').forEach(function (d, j) { d.classList.toggle('on', j === i); }); mark(); }
      mark();
      function auto() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 5000); }
      auto();
      var sx = null, dx = 0, el = document.getElementById('banner');
      el.addEventListener('pointerdown', function (e) { sx = e.clientX; dx = 0; track.style.transition = 'none'; });
      el.addEventListener('pointermove', function (e) { if (sx === null) return; dx = e.clientX - sx; track.style.transform = 'translateX(calc(-' + (i * 100) + '% + ' + dx + 'px))'; });
      function up(e) { if (sx === null) return; track.style.transition = ''; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); else go(i); sx = null; auto(); if (Math.abs(dx) > 6) { var block = function (ev) { ev.preventDefault(); el.removeEventListener('click', block, true); }; el.addEventListener('click', block, true); setTimeout(function () { el.removeEventListener('click', block, true); }, 50); } }
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', up);
    }
    /* 비용 알아보기 폼 */
    var fc = document.getElementById('facCount'); if (fc) { fc.classList.add('count'); countUp(fc, facilities().length, '곳'); }
    var qr = document.getElementById('q-region');
    if (qr) (S.regions || []).forEach(function (r) { var o = document.createElement('option'); o.value = r; o.textContent = r; qr.appendChild(o); });
    var qf = document.getElementById('qform');
    if (qf) qf.onsubmit = function (e) {
      e.preventDefault();
      var err = document.getElementById('q-err');
      if (!qr.value) { err.hidden = false; qr.focus(); return; }
      err.hidden = true;
      var w = document.getElementById('q-when').value; if (w === 'now') w = 'urgent';
      location.href = 'contact.html?type=' + encodeURIComponent(document.getElementById('q-type').value) + '&region=' + encodeURIComponent(qr.value) + '&when=' + encodeURIComponent(w);
    };
    /* 시설 찾기 */
    var fl = document.getElementById('facList'), fch = document.getElementById('facChips');
    if (fl) {
      var all = facilities(), cur = 'all';
      var keys = [['all', '전체']].concat(TYPE_KEYS.filter(function (k) { return all.some(function (f) { return f.type === k; }); }).map(function (k) { return [k, typeOf(k).name.replace(/\(.*\)/, '').replace('·공원묘지', '')]; }));
      fch.innerHTML = keys.map(function (k) { return '<button type="button" data-k="' + k[0] + '"' + (k[0] === 'all' ? ' class="on"' : '') + '>' + esc(k[1]) + '</button>'; }).join('');
      function drawF() { var list = all.filter(function (f) { return cur === 'all' || f.type === cur; }); fl.innerHTML = list.slice(0, 4).map(fitem).join(''); var more = fl.nextElementSibling; if (more) { more.textContent = (cur === 'all' ? '시설 전체 보기' : typeOf(cur).name + ' 시설 전체 보기') + ' (' + list.length + '곳)'; more.href = 'type.html?type=' + (cur === 'all' ? 'sumok' : cur) + '#list'; } }
      fch.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; cur = b.dataset.k; fch.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); drawF(); };
      drawF();
    }
    /* 후기 */
    var rl = document.getElementById('revList'), rch = document.getElementById('revChips');
    if (rl) {
      var revs = (C.reviews || []).filter(function (x) { return x.visible !== false; }), rcur = 'all';
      var rkeys = [['all', '# 사랑하는 가족을 모신 고객님들']].concat(TYPE_KEYS.filter(function (k) { return revs.some(function (x) { return x.type === k; }); }).map(function (k) { return [k, '# ' + typeOf(k).name.replace(/\(.*\)/, '')]; }));
      rch.innerHTML = rkeys.map(function (k) { return '<button type="button" data-k="' + k[0] + '"' + (k[0] === 'all' ? ' class="on"' : '') + '>' + esc(k[1]) + '</button>'; }).join('');
      function drawR() {
        var list = revs.filter(function (x) { return rcur === 'all' || x.type === rcur; }).slice(0, 2);
        rl.innerHTML = list.map(function (x) { var f = facility(x.facilityId); return '<article class="rcard"><div class="bd"><div class="tag"># ' + esc(x.title) + '</div><p>' + esc(x.body) + '</p><small>' + esc(x.author) + ' | ' + esc(x.date) + (f ? ' | ' + esc(f.name) : '') + '</small></div><a class="more" href="' + esc(x.blogUrl || '../reviews.html') + '" target="_blank" rel="noopener">자세히보기</a></article>'; }).join('');
      }
      rch.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; rcur = b.dataset.k; rch.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); drawR(); };
      drawR();
    }
    var sp = document.getElementById('steps'); if (sp) sp.innerHTML = (S.steps || []).map(function (x, i) { return '<li><i>' + (i + 1) + '</i><div><b>' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></div></li>'; }).join('');
    var wy = document.getElementById('why'); if (wy) wy.innerHTML = (S.why || []).map(function (x) { return '<li><i>' + ICON.check + '</i><div><b>' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></div></li>'; }).join('');
    var kb = document.getElementById('kakaoBtn'); if (kb) { if (S.kakao) kb.href = S.kakao; else kb.remove(); }
    var tb = document.getElementById('telBtn'); if (tb) tb.href = tel(S.phone);
    var bl = document.getElementById('blogLink'); if (bl) { if (S.blogUrl) bl.href = S.blogUrl; else bl.remove(); }
    var ar = document.getElementById('articles');
    if (ar) ar.innerHTML = (C.articles || []).slice(0, 4).map(function (a) { return '<a class="row" href="' + esc(a.url) + '" target="_blank" rel="noopener">' + (a.image ? '<img src="' + img(a.image) + '" alt="" loading="lazy">' : '<span></span>') + '<div><b>' + esc(a.title) + '</b><small>' + esc(a.date) + ' · 배웅 블로그</small></div><span class="go"></span></a>'; }).join('');
  }

  /* ---------- 유형 페이지 (수목장·봉안당·매장묘·파묘 이장) ---------- */
  var PRICE = {
    sumok: ['영구사용료 평균 · 관리비 별도', [['개인목 (1위)', '300~500만원', '한 분을 모시는 기본형'], ['부부목 (2위)', '700~1,000만원', '두 분을 함께'], ['가족목 (4위 이상)', '상담 안내', '시설·구역별 상이']]],
    napgol: ['개인단 기준 · 관리비 확인', [['개인단 (1위)', '200~1,500만원', '단 높이·층에 따라 차이'], ['부부단 (2위)', '상담 안내', '나란히 모시는 형태'], ['가족단', '상담 안내', '여러 분을 함께']]],
    maejang: ['석물 비용 별도', [['평장 · 봉안묘', '상담 안내', '매장묘보다 부담이 적음'], ['매장묘 (가족 단위)', '1,700만원~', '석물·토지·위치별 상이'], ['가족 봉안묘', '상담 안내', '여러 분의 유골함을 함께']]],
    ijang: ['현장 확인 후 견적', [['개장 신고 대행', '포함', '관할 지자체 신고'], ['파묘 · 유골 수습', '분묘 수별', '장비 진입 여부에 따라'], ['화장 · 새 장지 안치', '별도', '수목장·봉안당 등']]]
  };
  function typePage() {
    var el = document.getElementById('tpage'); if (!el) return;
    var k = qs('type'); if (!C.types[k]) k = 'sumok';
    var t = typeOf(k), pr = PRICE[k];
    document.title = t.name + ' | 배웅';
    var list = facilities(k);
    el.innerHTML = '<section class="sec hero"><p class="crumb"><a href="index.html">홈</a> › ' + esc(t.name) + '</p><h1 class="h1">' + esc(t.name) + '</h1><p class="sub">' + esc(t.short) + '</p>' +
      '<div class="tile"><i class="ic ic-coin"></i><p>' + esc(t.priceTag) + ' <b>' + esc(t.price) + '</b><br>' + esc(t.priceNote) + '</p></div></section>' +
      '<section class="sec"><h2 class="h">어떤 곳인가요?</h2><p class="sub">' + esc(t.desc) + '</p>' +
      (t.pros ? '<div class="pc" id="compare"><div><h4>이런 점이 좋아요</h4><ul>' + t.pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' + (t.cons ? '<div><h4>이런 점은 확인하세요</h4><ul>' + t.cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') + (t.recommend ? '<div><h4>이런 분께 권해요</h4><ul>' + t.recommend.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') + '</div>' : '') +
      (t.reasons ? '<div class="pc"><div><h4>이럴 때 파묘·이장을 생각합니다</h4><ul>' + t.reasons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>' : '') + '</section>' +
      '<section class="sec gray" id="price"><h2 class="h">비용 안내</h2><p class="sub">' + esc(pr[0]) + '</p><div class="price-tbl" style="background:#fff">' + pr[1].map(function (r) { return '<div><span>' + esc(r[0]) + '<br><small style="color:var(--muted)">' + esc(r[2]) + '</small></span><b>' + esc(r[1]) + '</b></div>'; }).join('') + '</div><a class="btn btn-primary btn-block" style="margin-top:14px" href="contact.html?type=' + k + '">' + esc(t.name) + ' 상담 신청</a></section>' +
      (t.steps ? '<section class="sec"><h2 class="h">진행 순서</h2><ol class="steps">' + t.steps.map(function (x, i) { return '<li><i>' + (i + 1) + '</i><div><b>' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></div></li>'; }).join('') + '</ol></section>' : '') +
      (list.length ? '<section class="sec gray" id="list"><h2 class="h">직접 답사한 ' + esc(t.name) + ' <small style="color:var(--muted);font-weight:600;font-size:14px">' + list.length + '곳</small></h2><div class="fgrid" style="margin-top:14px">' + list.map(fcard).join('') + '</div></section>' : '') +
      (t.faqs ? '<section class="sec"><h2 class="h">자주 묻는 질문</h2><div class="faq">' + t.faqs.map(function (q, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(q.q) + '</summary><div class="a">' + esc(q.a) + '</div></details>'; }).join('') + '</div></section>' : '') +
      '<section class="sec gray"><h2 class="h">' + esc(t.name) + ', 더 궁금한 점이 있으시면<br>언제든 연락 주세요</h2><div class="cta2">' + (S.kakao ? '<a class="btn btn-kakao" href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카카오톡 문의</a>' : '') + '<a class="btn btn-primary" href="' + tel(S.phone) + '">전화 문의</a></div><a class="btn btn-line btn-block" href="contact.html?type=' + k + '">상담 신청서 작성하기</a></section>';
    if (location.hash) { var h = document.querySelector(location.hash); if (h) setTimeout(function () { h.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }
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
    (qs('region') || '').split(',').forEach(function (r) { var x = form.querySelector('input[name=region][value="' + r.trim() + '"]'); if (x) x.checked = true; });
    if (qs('when')) { var wx = form.querySelector('input[name=when][value="' + qs('when') + '"]'); if (wx) wx.checked = true; }
    sync();
    form.onsubmit = function (e) {
      e.preventDefault();
      var name = form.querySelector('#f-name').value.trim(), phone = form.querySelector('#f-phone').value.trim();
      if (!val('type')) return alertBox('문의 유형을 선택해 주세요.');
      if (!name) return alertBox('이름을 입력해 주세요.');
      if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone)) return alertBox('휴대폰 번호를 확인해 주세요.');
      if (!form.querySelector('#f-agree').checked) return alertBox('개인정보 수집·이용에 동의해 주세요.');
      var w = WHEN.filter(function (x) { return x[0] === val('when'); })[0];
      var rec = { type: typeLabel(val('type')), region: regs().join(', '), when: w ? w[1] : '', name: name, phone: phone, memo: form.querySelector('#f-memo').value.trim(), facility: fac ? fac.name : '', page: 'v3' };
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

  function facilityPage() {
    var el = document.getElementById('fpage'); if (!el) return;
    var f = facility(qs('id'));
    if (!f) { el.innerHTML = '<div class="wrap page"><p>시설을 찾을 수 없습니다. <a href="index.html" style="text-decoration:underline">첫 화면으로</a></p></div>'; return; }
    var t = typeOf(f.type);
    document.title = f.name + ' | 배웅';
    var q = encodeURIComponent(f.address && f.address.length > 8 ? f.address : f.name);
    var photos = (f.photos || []).map(img);
    el.innerHTML = '<div class="sec"><div class="panel" style="border:0;box-shadow:none"><div class="panel-head" style="padding:0 0 12px"><div class="crumb"><a href="index.html">홈</a> › <a href="type.html?type=' + esc(f.type) + '">' + esc(t.name) + '</a> › ' + esc(f.name) + '</div></div>' +
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
  if (page === 'type') typePage();
  typo();
})();
