/* 배웅 시안 v2 (고이 레이아웃) — 공통 틀 + 페이지별 렌더. 콘텐츠는 ../js/defaults.js (CONTENT_DEFAULT) 를 그대로 사용 */
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
  var NAV = [['index.html#sumok', '수목장 분양'], ['index.html#napgol', '봉안당'], ['index.html#maejang', '매장묘'], ['index.html#ijang', '파묘·이장'], ['index.html#reviews', '상담 후기', (C.reviews || []).length]];
  function shell() {
    var head = '<header class="header"><div class="in">' +
      '<a class="logo" href="index.html" aria-label="배웅 홈"><img src="img/logo-h.png" alt="배웅"></a>' +
      '<nav class="gnb" aria-label="주 메뉴">' + NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + (n[2] ? '<span class="n">' + n[2] + '</span>' : '') + '</a>'; }).join('') + '</nav>' +
      '<div class="pills"><a class="pill red" href="' + tel(S.phone) + '">' + ICON.phone + '연중무휴 상담</a><a class="pill" href="' + ROOT + 'facilities.html">' + ICON.map + '시설 찾기</a></div>' +
      '<button class="burger" id="burger" aria-label="메뉴 열기"><span></span><span></span><span></span></button></div>' +
      '<nav class="subnav" aria-label="빠른 메뉴">' + NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join('') + '<a href="contact.html">상담 신청</a></nav></header>' +
      '<div class="drawer" id="drawer"><div class="panel"><button class="close" id="drawerClose" aria-label="닫기">×</button><img src="img/logo-h.png" alt="배웅" style="height:30px;width:auto;margin-bottom:14px">' +
      NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join('') + '<a href="index.html#crem">화장장 예약 안내</a><a href="contact.html">상담 신청</a>' +
      '<a href="' + tel(S.phone) + '">전화 상담 ' + esc(S.phone) + '</a>' + (S.kakao ? '<a href="' + esc(S.kakao) + '" target="_blank" rel="noopener">카카오톡 상담</a>' : '') + '</div></div>';
    var foot = '<footer class="footer"><img src="img/logo-h.png" alt="배웅">' +
      '<div class="links"><a href="index.html#story">배웅 이야기</a>' + (S.blogUrl ? '<a href="' + esc(S.blogUrl) + '" target="_blank" rel="noopener">배웅 블로그</a>' : '') + '<a href="' + ROOT + 'privacy.html" class="b">개인정보처리방침</a><a href="' + ROOT + 'facilities.html">답사 시설</a><a href="' + ROOT + 'reviews.html">상담 후기</a><a href="contact.html">상담 신청</a><a href="' + ROOT + '">기존 홈페이지 보기</a></div>' +
      '<div class="info">' + esc(S.bizName) + '<br>' + esc(S.bizDesc) + '<br>전화 문의: ' + esc(S.phone) + ' · ' + esc(S.hours) + (S.email ? '<br>이메일: ' + esc(S.email) : '') + (S.bizNo ? '<br>사업자 등록번호: ' + esc(S.bizNo) : '') + '</div>' +
      '<div class="copy">© ' + new Date().getFullYear() + '. ' + esc(S.bizName) + ' ALL RIGHTS RESERVED.</div></footer>';
    var fab = '<a class="fab" href="contact.html?type=cremation" aria-label="화장장 예약 안내">' + ICON.flame + '화장장 예약</a><a class="fab tel" href="' + tel(S.phone) + '" aria-label="전화 상담">' + ICON.phone + '전화</a>';
    document.body.insertAdjacentHTML('afterbegin', head);
    var col = document.querySelector('.col');
    if (col) col.insertAdjacentHTML('beforeend', foot);
    document.body.insertAdjacentHTML('beforeend', fab);
    var dr = document.getElementById('drawer');
    document.getElementById('burger').onclick = function () { dr.classList.add('open'); };
    document.getElementById('drawerClose').onclick = function () { dr.classList.remove('open'); };
    dr.onclick = function (e) { if (e.target === dr) dr.classList.remove('open'); };
  }

  /* ---------- 첫 화면 ---------- */
  function home() {
    /* 슬라이드 */
    var SL = [
      { img: 'img/hero.jpg', chip: '수목장 분양 안내', tx: '직접 답사한 수목장만,<br>분양 조건을 서면으로 비교해 드려요', href: 'index.html#sumok' },
      { img: 'img/fac/haneulmun-2.jpg', chip: '화장장 예약 안내', tx: '화장장 예약이 처음이라면<br>희망 지역만 알려주세요', href: 'contact.html?type=cremation' },
      { img: 'img/fac/bundanghome-1.jpg', chip: '주말 무료 동행 답사', tx: '주말에도 담당자가<br>현장에 함께 갑니다', href: 'contact.html' }
    ];
    var sl = document.getElementById('slider'), dots = document.getElementById('dots'), cur = 0, timer;
    if (sl) {
      sl.innerHTML = SL.map(function (s, i) { return '<a class="slide' + (i === 0 ? ' on' : '') + '" href="' + s.href + '"><img src="' + img(s.img) + '" alt=""><span class="chip">' + s.chip + '</span><span class="tx">' + s.tx + '</span></a>'; }).join('');
      dots.innerHTML = SL.map(function (s, i) { return '<button type="button" aria-label="슬라이드 ' + (i + 1) + '"' + (i === 0 ? ' class="on"' : '') + '></button>'; }).join('');
      function go(i) { cur = (i + SL.length) % SL.length; sl.querySelectorAll('.slide').forEach(function (e, j) { e.classList.toggle('on', j === cur); }); dots.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('on', j === cur); }); }
      dots.querySelectorAll('button').forEach(function (b, i) { b.onclick = function () { go(i); clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 5000); }; });
      timer = setInterval(function () { go(cur + 1); }, 5000);
    }

    /* 비용 알아보기 폼 */
    var cf = document.getElementById('costForm');
    if (cf) {
      var r1 = document.getElementById('c-region'), r2 = document.getElementById('c-region2'), err = document.getElementById('c-region-err'), btn = document.getElementById('costBtn');
      var SIDO = { '서울': ['상관없음'], '경기': ['경기 북부', '경기 남부', '경기 동부', '상관없음'], '인천·김포': ['상관없음'], '강원': ['상관없음'], '기타 지역': ['상관없음'] };
      Object.keys(SIDO).forEach(function (k) { r1.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + k + '</option>'); });
      r1.onchange = function () {
        r2.innerHTML = '<option value="">--</option>' + (SIDO[r1.value] || []).map(function (x) { return '<option value="' + x + '">' + x + '</option>'; }).join('');
        if ((SIDO[r1.value] || []).length === 1) r2.value = SIDO[r1.value][0];
        err.style.display = r1.value ? 'none' : ''; btn.classList.toggle('soft', !r1.value);
      };
      if (qs('type')) document.getElementById('c-type').value = qs('type');
      cf.onsubmit = function (e) {
        e.preventDefault();
        if (!r1.value) { err.style.display = ''; r1.focus(); return; }
        var region = r2.value && r2.value !== '상관없음' ? r2.value : r1.value;
        location.href = 'contact.html?type=' + encodeURIComponent(document.getElementById('c-type').value) + '&region=' + encodeURIComponent(region) + '&when=' + encodeURIComponent(document.getElementById('c-when').value);
      };
    }

    /* 답사 시설: 유형 태그 + 행 3개 */
    var ft = document.getElementById('facTags'), fl = document.getElementById('facList');
    if (ft) {
      var fkeys = ['sumok', 'napgol', 'maejang'];
      ft.innerHTML = fkeys.map(function (k, i) { return '<button type="button" class="tag' + (i === 0 ? ' on' : '') + '" data-k="' + k + '">' + typeOf(k).name + ' ' + facilities(k).length + '</button>'; }).join('');
      function drawF(k) {
        fl.innerHTML = facilities(k).slice(0, 4).map(function (f) {
          var ph = (f.photos || [])[0];
          return '<a class="frow" href="facility.html?id=' + esc(f.id) + '">' + (ph ? '<img src="' + img(ph) + '" alt="" loading="lazy">' : '<span></span>') + '<div><div class="nm">' + esc(f.name) + '</div><div class="ar">' + esc(f.area) + (f.featured ? ' · 배웅 추천' : '') + '</div>' + (f.tags && f.tags.length ? '<div class="tg">' + f.tags.slice(0, 3).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') + '</div></a>';
        }).join('');
      }
      drawF('sumok');
      ft.querySelectorAll('.tag').forEach(function (b) { b.onclick = function () { ft.querySelectorAll('.tag').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); drawF(b.dataset.k); }; });
    }

    /* 후기: 유형 태그 + 카드 1장 */
    var rt = document.getElementById('revTags'), rc = document.getElementById('revCard');
    if (rt) {
      var revs = (C.reviews || []).filter(function (x) { return x.visible !== false; });
      var rkeys = [['', '전체'], ['sumok', '수목장'], ['napgol', '봉안당'], ['maejang', '공원묘지']].filter(function (k) { return !k[0] || revs.some(function (r) { return r.type === k[0]; }); });
      rt.innerHTML = rkeys.map(function (k, i) { return '<button type="button" class="tag' + (i === 0 ? ' on' : '') + '" data-k="' + k[0] + '">' + k[1] + '</button>'; }).join('');
      function drawR(k) {
        var list = revs.filter(function (r) { return !k || r.type === k; });
        rc.innerHTML = list.slice(0, 2).map(function (x) {
          var f = facility(x.facilityId);
          return '<div class="rcard"><div class="t">' + esc(x.title) + '</div><p>' + esc((x.body || '').replace(/\n+/g, ' ')) + '</p><div class="meta">' + esc(x.author) + ' | ' + esc(x.date) + (f ? ' | ' + esc(f.name) : '') + '</div><a class="btn btn-ghost btn-block btn-sm" href="' + esc(x.blogUrl || ROOT + 'reviews.html') + '" target="_blank" rel="noopener">자세히보기</a></div>';
        }).join('');
      }
      drawR('');
      rt.querySelectorAll('.tag').forEach(function (b) { b.onclick = function () { rt.querySelectorAll('.tag').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); drawR(b.dataset.k); }; });
    }

    /* 처음이라면: 블로그 글 카드 */
    var fc = document.getElementById('firstCards');
    if (fc) {
      var arts = (C.articles || []);
      var picks = [
        { ic: ICON.book, b: '처음 하는 장지 준비,<br>어떻게 해야 후회 없을까요?', lk: '장지 방문 상담 시 확인 기준', href: (arts.filter(function (a) { return /방문 상담|유의/.test(a.title); })[0] || arts[0] || {}).url },
        { ic: ICON.scale, b: '수목장? 봉안당?<br>나에게 맞는 장지 찾기', lk: '성남 납골당 vs 고양 수목장 비교', href: (arts.filter(function (a) { return /VS|비교/.test(a.title); })[0] || arts[1] || {}).url },
        { ic: ICON.form, b: '계약서에 서명하기 전,<br>꼭 확인해야 할 것들', lk: '장지 선택 계약 시 주의사항', href: (arts.filter(function (a) { return /계약/.test(a.title); })[0] || arts[2] || {}).url }
      ];
      fc.innerHTML = picks.map(function (p) { return '<a class="gcard" href="' + esc(p.href || S.blogUrl || '#') + '" target="_blank" rel="noopener"><i>' + p.ic + '</i><b>' + p.b + '</b><span class="lk">' + esc(p.lk) + '</span></a>'; }).join('');
    }

    /* 약속·절차 */
    var wc = document.getElementById('whyCards'); if (wc) wc.innerHTML = (S.why || []).map(function (x) { return '<div class="gcard" style="padding:18px 16px"><b style="font-size:15px">' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></div>'; }).join('');
    var sc = document.getElementById('stepCards'); if (sc) sc.innerHTML = (S.steps || []).map(function (x, i) { return '<div class="gcard num"><i>' + (i + 1) + '</i><div><b style="font-size:15px">' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></div></div>'; }).join('');

    /* 연락 */
    var ck = document.getElementById('ctKakao'); if (ck) { if (S.kakao) ck.href = S.kakao; else ck.remove(); }
    var ct = document.getElementById('ctTel'); if (ct) ct.href = tel(S.phone);
    var bc = document.getElementById('brandCard'); if (bc) bc.href = S.blogUrl || ROOT;
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
      '<div class="field"><label for="f-memo">궁금하신 점 (선택)</label><textarea id="f-memo" placeholder="모실 인원, 예산, 원하시는 조건 등을 적어 주세요"></textarea></div>' +
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
      var rec = { type: typeLabel(val('type')), region: regs().join(', '), when: w ? w[1] : '', name: name, phone: phone, memo: form.querySelector('#f-memo').value.trim(), facility: fac ? fac.name : '', page: 'v2' };
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
  if (page === 'contact') contact();
})();
