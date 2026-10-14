/* 공통: 콘텐츠 합치기, 헤더·메뉴·하단 상담 바·푸터, 도우미 함수, 문의 전송 */
(function () {
  var D = window.CONTENT_DEFAULT || {};
  var S = window.SITE_CONTENT || {};
  var C = {};
  C.site = Object.assign({}, D.site, S.site || {});
  C.types = {};
  Object.keys(D.types).forEach(function (k) { C.types[k] = Object.assign({}, D.types[k], (S.types || {})[k] || {}); });
  C.facilities = Array.isArray(S.facilities) ? S.facilities : D.facilities;
  C.reviews = Array.isArray(S.reviews) ? S.reviews : D.reviews;
  window.C = C;

  var TYPE_KEYS = ['sumok', 'napgol', 'maejang', 'ijang'];
  var PH = { sumok: 'img/ph-sumok.svg', napgol: 'img/ph-napgol.svg', maejang: 'img/ph-maejang.svg', ijang: 'img/ph-ijang.svg' };

  var ICON = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    form: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.4.3.7.6.5l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    leaf: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#2f5d50"/><path d="M16 25V14" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M16 15c0-5 3-8 8-8 0 5-3 8-8 8zM16 18c0-4-2.5-6.5-7-6.5 0 4 2.5 6.5 7 6.5z" fill="#cfe3d6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function telHref(p) { return 'tel:' + String(p || '').replace(/[^0-9+]/g, ''); }
  function qs(name) { return new URLSearchParams(location.search).get(name) || ''; }
  function typeOf(k) { return C.types[k] || { name: '' }; }
  function typeImg(k) { var t = typeOf(k); return t.image || PH[k] || PH.sumok; }
  function bg(url) { return "background-image:url('" + String(url).replace(/'/g, '%27') + "')"; }
  function facPhoto(f) { return (f.photos && f.photos[0]) || typeImg(f.type); }
  function revPhoto(r) {
    if (r.photos && r.photos[0]) return r.photos[0];
    var f = facility(r.facilityId); if (f && f.photos && f.photos[0]) return f.photos[0];
    return typeImg(r.type);
  }
  function facility(id) { return id ? C.facilities.filter(function (f) { return f.id === id; })[0] : null; }
  function visibleFacilities(type) { return C.facilities.filter(function (f) { return f.visible !== false && (!type || f.type === type); }); }
  function visibleReviews(type) {
    return C.reviews.filter(function (r) { return r.visible !== false && (!type || r.type === type); })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }
  function fmtDate(d) { return d ? String(d).slice(0, 10).replace(/-/g, '.') : ''; }
  function sampleTag(x) { return x.sample ? '<span class="tag sample">예시</span>' : ''; }

  function facCard(f) {
    var t = typeOf(f.type);
    var n = (f.photos || []).length;
    return '<a class="fac" href="facility.html?id=' + encodeURIComponent(f.id) + '">' +
      '<div class="ph" style="' + bg(facPhoto(f)) + '">' + (n > 1 ? '<span class="cnt">사진 ' + n + '</span>' : '') + '</div>' +
      '<div class="bd"><div class="tags"><span class="tag">' + esc(t.name) + '</span>' + (f.area ? '<span class="tag warm">' + esc(f.area) + '</span>' : '') + sampleTag(f) + '</div>' +
      '<h3>' + esc(f.name) + '</h3>' +
      '<div class="meta">' + esc(f.address || '') + (f.operator ? ' · ' + esc(f.operator) : '') + '</div>' +
      (f.price ? '<div class="price">' + esc(f.price) + '</div>' : '') +
      '<span class="go">답사 사진·정보 보기 ›</span></div></a>';
  }
  function revCard(r) {
    var t = typeOf(r.type);
    return '<a class="rev" href="review.html?id=' + encodeURIComponent(r.id) + '">' +
      '<div class="ph" style="' + bg(revPhoto(r)) + '"></div>' +
      '<div class="bd"><div class="tags"><span class="tag">' + esc(t.name) + '</span>' + sampleTag(r) + '</div>' +
      '<h3>' + esc(r.title) + '</h3><p class="ex">' + esc(r.body) + '</p>' +
      '<div class="who"><span>' + esc(r.author || '고객') + '님</span><span>' + fmtDate(r.date) + '</span></div></div></a>';
  }
  function faqHtml(list) {
    if (!list || !list.length) return '';
    return '<div class="faq">' + list.map(function (f) { return '<details><summary>' + esc(f.q) + '</summary><div class="a">' + esc(f.a) + '</div></details>'; }).join('') + '</div>';
  }
  function finalCta(title) {
    var s = C.site;
    return '<section class="sec final"><div class="wrap"><h2>' + nl(title || s.finalTitle) + '</h2>' +
      '<a class="tel" href="' + telHref(s.phone) + '">' + esc(s.phone) + '</a><small>' + esc(s.hours) + '</small>' +
      '<div class="btn-row"><a class="btn btn-warm" href="' + telHref(s.phone) + '">' + ICON.phone + '지금 전화 상담</a>' +
      '<a class="btn btn-line" href="contact.html">' + ICON.form + '무료 견적 받기</a></div></div></section>';
  }

  /* ---------- 레이아웃 ---------- */
  var MENU = [
    ['sumokjang.html', '수목장'], ['napgoldang.html', '납골당'], ['maejang.html', '매장묘'],
    ['ijang.html', '이장·파묘'], ['reviews.html', '고객 후기'], ['contact.html', '견적·상담']
  ];
  function logoHtml() {
    var s = C.site;
    return '<a class="logo" href="./">' + (s.logo ? '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + '">' : ICON.leaf + '<span>' + esc(s.name) + '</span>') + '</a>';
  }
  function layout() {
    var s = C.site;
    var here = location.pathname.split('/').pop() || 'index.html';
    var nav = MENU.map(function (m) { return '<a href="' + m[0] + '"' + (here === m[0] ? ' class="on"' : '') + '>' + m[1] + '</a>'; }).join('');
    var hd = document.createElement('header');
    hd.className = 'hd';
    hd.innerHTML = '<div class="wrap">' + logoHtml() + '<nav class="nav">' + nav + '</nav>' +
      '<a class="hd-call" href="' + telHref(s.phone) + '">' + ICON.phone + '<span>' + esc(s.phone) + '</span></a>' +
      '<button class="menu-btn" aria-label="메뉴 열기">' + ICON.menu + '</button></div>';
    document.body.insertBefore(hd, document.body.firstChild);

    var dr = document.createElement('div');
    dr.className = 'drawer';
    dr.innerHTML = '<div class="drawer-in" role="dialog" aria-label="메뉴"><button class="drawer-close" aria-label="메뉴 닫기">×</button>' +
      '<a href="./">처음으로</a>' + nav +
      '<a class="btn btn-primary btn-block" href="' + telHref(s.phone) + '">' + ICON.phone + esc(s.phone) + '</a></div>';
    document.body.appendChild(dr);
    hd.querySelector('.menu-btn').onclick = function () { dr.classList.add('open'); };
    dr.onclick = function (e) { if (e.target === dr || e.target.classList.contains('drawer-close')) dr.classList.remove('open'); };

    var ft = document.createElement('footer');
    ft.className = 'ft';
    ft.innerHTML = '<div class="wrap">' + logoHtml() +
      '<a class="tel" href="' + telHref(s.phone) + '">' + esc(s.phone) + '</a>' +
      '<p>' + esc(s.bizName) + ' · 대표 ' + esc(s.ceo) + ' · 사업자등록번호 ' + esc(s.bizNo) + '<br>' + esc(s.address) +
      (s.email ? ' · ' + esc(s.email) : '') + '<br>상담 시간 ' + esc(s.hours) + '</p>' +
      '<div class="links"><a href="privacy.html">개인정보 처리방침</a><a href="contact.html">상담 문의</a></div>' +
      '<p class="mt16">© ' + new Date().getFullYear() + ' ' + esc(s.name) + '</p></div>';
    document.body.appendChild(ft);

    if (document.body.dataset.page !== 'contact') {
      var bar = document.createElement('div');
      bar.className = 'bar' + (s.kakao ? '' : ' no-kakao');
      bar.innerHTML = '<a class="b-call" href="' + telHref(s.phone) + '">' + ICON.phone + '전화 상담</a>' +
        '<a class="b-form" href="contact.html' + (window.CONTACT_QUERY || '') + '">' + ICON.form + '견적 문의</a>' +
        (s.kakao ? '<a class="b-kakao" href="' + esc(s.kakao) + '" target="_blank" rel="noopener">' + ICON.chat + '카톡</a>' : '');
      document.body.appendChild(bar);
    } else {
      document.body.style.paddingBottom = '0';
    }
    if (window.PREVIEW_MODE) {
      var nb = document.createElement('div'); nb.className = 'notice-bar'; nb.textContent = '관리자 미리보기 화면입니다. 저장 전 내용이 보입니다.';
      document.body.insertBefore(nb, document.body.firstChild);
    }
  }

  /* 문의 전송: 서버(PHP)에 저장. 실패하면 오류를 돌려줌 */
  function sendInquiry(rec) {
    /* GitHub Pages 미리보기에는 PHP가 없어 실제 접수 대신 안내만 */
    if (/\.github\.io$/.test(location.hostname)) return Promise.resolve({ ok: true, demo: true });
    return fetch('admin/api.php?action=inquiry', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'JANGJI' },
      body: JSON.stringify({ inquiry: rec })
    }).then(function (r) { return r.json(); });
  }

  window.U = {
    ICON: ICON, TYPE_KEYS: TYPE_KEYS, esc: esc, nl: nl, telHref: telHref, qs: qs, typeOf: typeOf, typeImg: typeImg, bg: bg,
    facPhoto: facPhoto, revPhoto: revPhoto, facility: facility, visibleFacilities: visibleFacilities, visibleReviews: visibleReviews,
    fmtDate: fmtDate, sampleTag: sampleTag, facCard: facCard, revCard: revCard, faqHtml: faqHtml, finalCta: finalCta, sendInquiry: sendInquiry
  };

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.dataset.page;
    if (window.PAGES && window.PAGES[page]) window.PAGES[page](document.getElementById('app'));
    layout();
    var s = C.site;
    if (!document.title || document.title === '-') document.title = s.name;
  });
})();
