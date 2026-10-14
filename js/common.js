/* 공통: 콘텐츠 합치기, 헤더·메뉴·하단 탭바·플로팅 버튼·푸터, 카드 도우미, 문의 전송 */
(function () {
  var D = window.CONTENT_DEFAULT || {};
  var S = window.SITE_CONTENT || {};
  var C = {};
  C.site = Object.assign({}, D.site, S.site || {});
  C.types = {};
  Object.keys(D.types).forEach(function (k) { C.types[k] = Object.assign({}, D.types[k], (S.types || {})[k] || {}); });
  ['facilities', 'reviews', 'articles', 'faqs'].forEach(function (k) { C[k] = Array.isArray(S[k]) ? S[k] : (D[k] || []); });
  window.C = C;

  var TYPE_KEYS = ['sumok', 'napgol', 'maejang', 'ijang'];
  var SHORT = { sumok: '수목장', napgol: '봉안당', maejang: '공원묘지', ijang: '이장·파묘' };

  var ICON = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    form: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
    kakao: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.4.3.7.6.5l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    tree: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 6 10h3l-4 6h6v6h2v-6h6l-4-6h3z"/></svg>',
    house: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2 9v2h20V9zM4 12v7H3v2h18v-2h-1v-7h-2v7h-3v-7h-2v7H9v-7H7v7H6v-7z"/></svg>',
    hill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 20c3-6 6-9 9-9 2 0 3 1 4 2 1-1 2-1.5 3-1.5 2 0 3.5 3 4 8.5z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function telHref(p) { return 'tel:' + String(p || '').replace(/[^0-9+]/g, ''); }
  function qs(name) { return new URLSearchParams(location.search).get(name) || ''; }
  function typeOf(k) { return C.types[k] || { name: '' }; }
  function typeImg(k) { return typeOf(k).image || 'img/hero.svg'; }
  function bg(url) { return "background-image:url('" + String(url).replace(/'/g, '%27') + "')"; }
  function img(src, alt, eager) { return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">'; }
  function facility(id) { return id ? C.facilities.filter(function (f) { return f.id === id; })[0] : null; }
  function facPhoto(f) { return (f.photos && f.photos[0]) || typeImg(f.type); }
  function revPhoto(r) {
    if (r.photos && r.photos[0]) return r.photos[0];
    var f = facility(r.facilityId); return f ? facPhoto(f) : typeImg(r.type);
  }
  function visibleFacilities(type) { return C.facilities.filter(function (f) { return f.visible !== false && (!type || f.type === type); }); }
  function visibleReviews(type) {
    return C.reviews.filter(function (r) { return r.visible !== false && (!type || r.type === type); })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }
  function fmtDate(d) { return d ? String(d).slice(0, 10).replace(/-/g, '.') : ''; }
  function sampleTag(x) { return x.sample ? ' <span class="lab" style="background:#eee;color:#666">예시</span>' : ''; }

  function facCard(f) {
    var n = (f.photos || []).length;
    return '<a class="fac" href="facility.html?id=' + encodeURIComponent(f.id) + '"><div class="ph">' + img(facPhoto(f), f.name) + (n > 1 ? '<span class="n">사진 ' + n + '</span>' : '') + '</div>' +
      '<div class="t"><h3>' + esc(f.name) + '</h3><span class="ty">' + esc(SHORT[f.type] || '') + '</span></div><div class="loc">' + esc(f.area || f.address || '') + '</div></a>';
  }
  function revCard(r) {
    var f = facility(r.facilityId);
    return '<a class="rev card-h" href="review.html?id=' + encodeURIComponent(r.id) + '"><div class="ph">' + img(revPhoto(r), r.title) + '</div>' +
      '<div class="bd"><span class="lab">' + esc(SHORT[r.type] || '') + ' 상담</span>' + sampleTag(r) +
      '<div class="who">' + esc(r.author || '고객') + (f ? ' · ' + esc(f.name) : '') + ' · ' + fmtDate(r.date) + '</div>' +
      '<h3>' + esc(r.title) + '</h3><p class="ex">' + esc(r.body) + '</p></div></a>';
  }
  function artCard(a) {
    return '<a class="art" href="' + esc(a.url) + '" target="_blank" rel="noopener"><div class="ph">' + (a.image ? img(a.image, a.title) : '') + '</div>' +
      '<span class="lab">장례정보</span><h3>' + esc(a.title) + '</h3><small>' + fmtDate(a.date) + '</small></a>';
  }
  function rail(items, cls) {
    return '<div class="rail-wrap"><button class="rail-btn prev" aria-label="이전">‹</button><div class="rail ' + (cls || '') + '">' + items + '</div><button class="rail-btn next" aria-label="다음">›</button></div>';
  }
  function bindRails(root) {
    (root || document).querySelectorAll('.rail-wrap').forEach(function (w) {
      var r = w.querySelector('.rail');
      w.querySelector('.prev').onclick = function () { r.scrollBy({ left: -r.clientWidth * 0.8, behavior: 'smooth' }); };
      w.querySelector('.next').onclick = function () { r.scrollBy({ left: r.clientWidth * 0.8, behavior: 'smooth' }); };
    });
  }
  function faqHtml(list) {
    if (!list || !list.length) return '';
    return '<div class="faq">' + list.map(function (f) { return '<details><summary>' + esc(f.q) + '</summary><div class="a">' + esc(f.a) + '</div></details>'; }).join('') + '</div>';
  }

  /* 하단 상담 신청 (간단 폼) */
  function applySection(title, presetType) {
    var s = C.site;
    return '<section class="sec apply" id="apply"><div class="wrap apply-box"><div class="sec-head" style="margin:0"><div class="tx"><span class="pill">상담 신청</span><h2>' + esc(title || s.finalTitle) + '</h2>' +
      '<a class="tel" href="' + telHref(s.phone) + '">' + ICON.phone + esc(s.phone) + '</a><small>' + esc(s.hours) + '</small>' +
      (s.kakao ? '<a class="btn btn-kakao btn-block mt16" href="' + esc(s.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카카오톡 상담</a>' : '') + '</div></div>' +
      '<form class="quick-form" id="quick-form" novalidate><div class="f-row">' +
      '<div class="field"><label for="qf-name">이름 <em>*</em></label><input id="qf-name" autocomplete="name" placeholder="홍길동"></div>' +
      '<div class="field"><label for="qf-phone">연락처 <em>*</em></label><input id="qf-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000"></div></div>' +
      '<div class="field"><label for="qf-type">상담 유형</label><select id="qf-type">' + TYPE_KEYS.map(function (k) { return '<option value="' + k + '"' + (k === presetType ? ' selected' : '') + '>' + esc(typeOf(k).name) + '</option>'; }).join('') + '<option value="unsure">아직 모르겠어요</option><option value="support">장례지원금 문의</option></select></div>' +
      '<div class="field"><label for="qf-memo">문의 내용 (선택)</label><textarea id="qf-memo" placeholder="모실 인원, 희망 지역, 예산 등을 적어 주세요"></textarea></div>' +
      '<label class="agree"><input type="checkbox" id="qf-agree"><span>상담을 위한 개인정보(이름, 연락처, 문의 내용) 수집·이용에 동의합니다. <a href="privacy.html" target="_blank">자세히</a></span></label>' +
      '<button class="btn btn-main btn-block" type="submit">무료 상담 신청하기</button><div class="err" id="qf-err"></div></form></div></section>';
  }
  function bindApply() {
    var f = document.getElementById('quick-form'); if (!f) return;
    f.onsubmit = function (e) {
      e.preventDefault();
      var name = f.querySelector('#qf-name').value.trim(), phone = f.querySelector('#qf-phone').value.trim(), err = f.querySelector('#qf-err');
      var tk = f.querySelector('#qf-type').value;
      if (!name) { err.textContent = '이름을 입력해 주세요.'; return; }
      if (phone.replace(/[^0-9]/g, '').length < 9) { err.textContent = '연락 가능한 번호를 정확히 입력해 주세요.'; return; }
      if (!f.querySelector('#qf-agree').checked) { err.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }
      var btn = f.querySelector('button'); btn.disabled = true; btn.textContent = '보내는 중…'; err.textContent = '';
      var rec = { type: tk === 'unsure' ? '아직 모르겠어요' : tk === 'support' ? '장례지원금 문의' : typeOf(tk).name, region: '', when: '', name: name, phone: phone, memo: f.querySelector('#qf-memo').value.trim(), facility: '', page: location.pathname };
      sendInquiry(rec).then(function (res) {
        if (!res || !res.ok) throw new Error((res && res.message) || '접수 실패');
        f.innerHTML = '<div class="ok-msg"><b>상담 신청이 접수되었습니다.</b><br>' + esc(name) + '님, 담당자가 확인 후 ' + esc(phone) + ' 으로 연락드리겠습니다.' +
          (res.demo ? '<br><small style="color:#8a5a00">미리보기 사이트라 실제로 접수되지는 않습니다.</small>' : '') + '</div>';
      }).catch(function (e2) {
        btn.disabled = false; btn.textContent = '무료 상담 신청하기';
        err.innerHTML = '접수 중 문제가 생겼습니다. <a href="' + telHref(C.site.phone) + '"><b>' + esc(C.site.phone) + '</b></a> 로 전화 주세요.';
      });
    };
  }

  /* ---------- 레이아웃 ---------- */
  var MENU = [['sumokjang.html', '수목장'], ['napgoldang.html', '봉안당'], ['maejang.html', '공원묘지'], ['ijang.html', '이장·파묘'], ['facilities.html', '답사 시설'], ['reviews.html', '상담 후기']];
  function logoHtml() {
    var s = C.site;
    return '<a class="logo" href="./">' + (s.logo ? '<img src="' + esc(s.logo) + '" alt="">' : '') + '<span>' + esc(s.name) + '</span>' + (s.slogan ? '<small>' + esc(s.slogan) + '</small>' : '') + '</a>';
  }
  function layout() {
    var s = C.site;
    var here = location.pathname.split('/').pop() || 'index.html';
    var nav = MENU.map(function (m) { return '<a href="' + m[0] + '"' + (here === m[0] ? ' class="on"' : '') + '>' + m[1] + '</a>'; }).join('');

    /* 앱 화면 틀: 가운데 480px 안에 상단 바 + 본문 + 푸터 */
    var shell = document.createElement('div');
    shell.className = 'shell';
    var app = document.getElementById('app');
    document.body.insertBefore(shell, app);
    if (window.PREVIEW_MODE) {
      var nb = document.createElement('div'); nb.className = 'notice-bar'; nb.textContent = '관리자 미리보기 화면입니다. 저장 전 내용이 보입니다.';
      shell.appendChild(nb);
    }

    var hd = document.createElement('header');
    hd.className = 'hd';
    hd.innerHTML = '<div class="wrap">' + logoHtml() + '<div class="hd-right">' +
      '<a class="hd-tel" href="' + telHref(s.phone) + '" aria-label="전화 상담 ' + esc(s.phone) + '" title="전화 상담 ' + esc(s.phone) + '">' + ICON.phone + '</a>' +
      '<button class="menu-btn" aria-label="메뉴 열기">' + ICON.menu + '</button></div></div>';
    shell.appendChild(hd);
    shell.appendChild(app);

    var dr = document.createElement('div');
    dr.className = 'drawer';
    dr.innerHTML = '<div class="drawer-in" role="dialog" aria-label="메뉴"><button class="drawer-close" aria-label="메뉴 닫기">×</button><a href="./">홈</a>' + nav +
      '<a href="contact.html">견적·상담 신청</a>' + (s.blogUrl ? '<a href="' + esc(s.blogUrl) + '" target="_blank" rel="noopener">배웅 블로그</a>' : '') +
      '<a class="btn btn-main btn-block" href="' + telHref(s.phone) + '">' + ICON.phone + esc(s.phone) + '</a>' +
      (s.kakao ? '<a class="btn btn-kakao btn-block" style="margin-top:8px" href="' + esc(s.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카카오톡 상담</a>' : '') + '</div>';
    document.body.appendChild(dr);
    hd.querySelector('.menu-btn').onclick = function () { dr.classList.add('open'); };
    dr.onclick = function (e) { if (e.target === dr || e.target.classList.contains('drawer-close')) dr.classList.remove('open'); };

    var ft = document.createElement('footer');
    ft.className = 'ft';
    var biz = [s.bizName, s.ceo ? '대표 ' + s.ceo : '', s.bizNo ? '사업자등록번호 ' + s.bizNo : ''].filter(Boolean).map(esc).join(' · ');
    ft.innerHTML = '<div class="wrap">' + logoHtml() + '<a class="tel" href="' + telHref(s.phone) + '">' + esc(s.phone) + '</a>' +
      '<p>' + biz + (s.bizDesc ? '<br>' + esc(s.bizDesc) : '') + (s.address ? '<br>' + esc(s.address) : '') + (s.email ? '<br>' + esc(s.email) : '') + '<br>상담 ' + esc(s.hours) + '</p>' +
      '<div class="links"><a href="privacy.html">개인정보 처리방침</a><a href="contact.html">상담 신청</a>' + (s.blogUrl ? '<a href="' + esc(s.blogUrl) + '" target="_blank" rel="noopener">블로그</a>' : '') + '</div>' +
      '<p class="mt16">© ' + new Date().getFullYear() + ' ' + esc(s.bizName || s.name) + '</p></div>';
    shell.appendChild(ft);

    /* 하단 탭바 (앱 메뉴) — 모든 화면 크기에서 표시 */
    var tb = document.createElement('nav');
    tb.className = 'tabbar';
    tb.setAttribute('aria-label', '빠른 메뉴');
    tb.innerHTML = '<a href="./"' + (here === 'index.html' || here === '' ? ' class="on"' : '') + '>' + ICON.home + '홈</a>' +
      '<a href="facilities.html"' + (here === 'facilities.html' ? ' class="on"' : '') + '>' + ICON.map + '답사 시설</a>' +
      '<a class="call" href="' + telHref(s.phone) + '"><span class="c">' + ICON.phone + '</span><b>전화 상담</b></a>' +
      (s.kakao ? '<a class="kk" href="' + esc(s.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카톡 상담</a>' : '<a href="reviews.html">' + ICON.form + '상담 후기</a>') +
      '<a href="contact.html' + (window.CONTACT_QUERY || '') + '"' + (here === 'contact.html' ? ' class="on"' : '') + '>' + ICON.form + '상담 신청</a>';
    document.body.appendChild(tb);
  }

  /* 문의 전송: 서버(PHP)에 저장 */
  function sendInquiry(rec) {
    if (/\.github\.io$/.test(location.hostname)) return Promise.resolve({ ok: true, demo: true });
    return fetch('admin/api.php?action=inquiry', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'JANGJI' },
      body: JSON.stringify({ inquiry: rec })
    }).then(function (r) { return r.json(); });
  }

  window.U = {
    ICON: ICON, TYPE_KEYS: TYPE_KEYS, SHORT: SHORT, esc: esc, nl: nl, telHref: telHref, qs: qs, typeOf: typeOf, typeImg: typeImg, bg: bg, img: img,
    facPhoto: facPhoto, revPhoto: revPhoto, facility: facility, visibleFacilities: visibleFacilities, visibleReviews: visibleReviews,
    fmtDate: fmtDate, sampleTag: sampleTag, facCard: facCard, revCard: revCard, artCard: artCard, rail: rail, bindRails: bindRails,
    faqHtml: faqHtml, applySection: applySection, bindApply: bindApply, sendInquiry: sendInquiry
  };

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.dataset.page;
    if (window.PAGES && window.PAGES[page]) window.PAGES[page](document.getElementById('app'));
    layout();
    bindRails();
    bindApply();
    if (!document.title || document.title === '-') document.title = C.site.name;
  });
})();
