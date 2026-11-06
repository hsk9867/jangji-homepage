/* 공통: 콘텐츠 합치기, 헤더·메뉴·하단 탭바·플로팅 버튼·푸터, 카드 도우미, 문의 전송
   2026-11-03 시안 4(v4)에서 확정된 내용을 시안 1에 반영: 문구 인트로, 메뉴·탭바·플로팅·푸터 구성, 시설 키워드·가격, 공유·지도·리뷰 도우미 */
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
  var SHORT = { sumok: '수목장', napgol: '봉안당', maejang: '공원묘지', ijang: '파묘·이장' };
  var EHANEUL = 'https://www.15774129.go.kr/';
  /* 고객 리뷰 키워드 (worker.js REVIEW_KEYWORDS 와 같게 유지) */
  var REVIEW_KEYWORDS = ['경치가 좋아요', '조용해요', '주차가 편해요', '관리가 잘 돼요', '시설이 깨끗해요', '찾아가기 쉬워요', '실내가 밝아요', '직원이 친절해요', '산책하기 좋아요', '비용이 합리적이에요', '쉴 공간이 있어요', '자주 찾아뵙기 좋아요', '상담이 꼼꼼했어요', '답사 동행이 든든했어요'];

  var ICON = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    form: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
    kakao: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.4.3.7.6.5l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="11" height="11" rx="2"/><rect x="9.5" y="9.5" width="11" height="11" rx="2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    tree: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 6 10h3l-4 6h6v6h2v-6h6l-4-6h3z"/></svg>',
    house: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2 9v2h20V9zM4 12v7H3v2h18v-2h-1v-7h-2v7h-3v-7h-2v7H9v-7H7v7H6v-7z"/></svg>',
    hill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 20c3-6 6-9 9-9 2 0 3 1 4 2 1-1 2-1.5 3-1.5 2 0 3.5 3 4 8.5z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2c.1-.2.1-.5.1-.7s0-.5-.1-.7L16 7.2c.5.5 1.2.8 2 .8a3 3 0 1 0-3-3c0 .2 0 .5.1.7L8 9.8A3 3 0 1 0 8 14.2l7.1 4.2c-.1.2-.1.4-.1.6a2.9 2.9 0 1 0 3-2.9z"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2s.6 3.3-1.4 5.7C10.3 9.8 8 11 8 14.4A5.5 5.5 0 0 0 13.5 20c3.2 0 5.5-2.3 5.5-5.6 0-2.4-1.3-4-2.3-5.2-.3 1.2-1 2.2-2 2.7.6-2.7-.3-7.3-1.2-9.9zM6.3 9.3C5.1 10.6 4 12.4 4 14.6A8 8 0 0 0 12 22c-2.5-.8-4.5-3.2-4.5-6.2 0-1.5.4-2.6 1-3.6-.9-.6-1.7-1.6-2.2-2.9z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15 15 0 0 0-1.3-5.4A8 8 0 0 1 18.9 11zM12 4c.9 1.3 1.6 3.4 1.9 7h-3.8c.3-3.6 1-5.7 1.9-7zM5.1 13h3a15 15 0 0 0 1.3 5.4A8 8 0 0 1 5.1 13zm3-2h-3a8 8 0 0 1 4.3-5.4A15 15 0 0 0 8.1 11zM12 20c-.9-1.3-1.6-3.4-1.9-7h3.8c-.3 3.6-1 5.7-1.9 7zm2.6-1.6a15 15 0 0 0 1.3-5.4h3a8 8 0 0 1-4.3 5.4z"/></svg>',
    nblog: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 17V7h3.2l4.3 6V7H17v10h-3.2l-4.3-6v6z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a1 1 0 0 1 1 1v1h5l3 7a3.5 3.5 0 0 1-7 0l2.3-5H13v12h4v2H7v-2h4V7H8.7L11 12a3.5 3.5 0 0 1-7 0l3-7h5V4a1 1 0 0 1 1-1zM6 9.2 4.3 13h3.4L6 9.2zm12 0L16.3 13h3.4L18 9.2z"/></svg>'
  };
  /* 로고 톤 투톤 일러스트 아이콘 (48x48) — 바로가기·서비스 안내·이용안내 */
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
  /* 복수 유형(types) 시설도 각 유형 목록에 함께 나옵니다 */
  function hasType(f, type) { return !type || f.type === type || (f.types || []).indexOf(type) >= 0; }
  function visibleFacilities(type) { return C.facilities.filter(function (f) { return f.visible !== false && hasType(f, type); }); }
  function visibleReviews(type) {
    return C.reviews.filter(function (r) { return r.visible !== false && (!type || r.type === type); })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }
  function fmtDate(d) { return d ? String(d).slice(0, 10).replace(/-/g, '.') : ''; }
  function sampleTag(x) { return x.sample ? ' <span class="lab" style="background:#eee;color:#666">예시</span>' : ''; }
  /* 시설 키워드 (“경치가 좋아요” 등) — 없으면 특징 태그 */
  function kwOf(f) { return (f.keywords && f.keywords.length) ? f.keywords : (f.tags || []); }
  function kwChips(list, n) { list = list || []; return list.length ? '<div class="kw">' + list.slice(0, n || 3).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : ''; }
  function typeNames(f) { return (f.types && f.types.length ? f.types : [f.type]).map(function (k) { return SHORT[k] || ''; }).filter(Boolean).join(' · '); }

  function facCard(f) {
    var n = (f.photos || []).length;
    return '<a class="fac" href="facility.html?id=' + encodeURIComponent(f.id) + '"><div class="ph">' + img(facPhoto(f), f.name) + (n > 1 ? '<span class="n">사진 ' + n + '</span>' : '') + (f.featured ? '<span class="rec">배웅 추천</span>' : '') + '</div>' +
      '<div class="t"><h3>' + esc(f.name) + '</h3><span class="ty">' + esc(SHORT[f.type] || '') + '</span></div><div class="loc">' + esc(f.area || f.address || '') + (f.price ? ' · <b>최저 ' + esc(f.price) + '</b>' : '') + '</div>' + kwChips(kwOf(f), 2) + '</a>';
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
      dragScroll(r);
    });
  }
  function faqHtml(list) {
    if (!list || !list.length) return '';
    return '<div class="faq">' + list.map(function (f) { return '<details><summary>' + esc(f.q) + '</summary><div class="a">' + esc(f.a) + '</div></details>'; }).join('') + '</div>';
  }
  /* 마우스로 가로 목록을 끌어서 넘기기 (터치 기기는 기본 스크롤) */
  function dragScroll(wrap) {
    if (!wrap || wrap.dataset.drag) return; wrap.dataset.drag = '1';
    var down = false, sx = 0, sl = 0, moved = false;
    wrap.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') return; down = true; moved = false; sx = e.clientX; sl = wrap.scrollLeft; wrap.classList.add('drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; wrap.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; wrap.classList.remove('drag'); });
    wrap.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }
  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._tm); t._tm = setTimeout(function () { t.classList.remove('on'); }, 2200);
  }
  function modal(html) {
    var m = document.createElement('div'); m.className = 'modal'; m.innerHTML = '<div class="box"><button type="button" class="x" aria-label="닫기">×</button>' + html + '</div>';
    document.body.appendChild(m); document.body.style.overflow = 'hidden';
    var close = function () { m.remove(); document.body.style.overflow = ''; };
    m.querySelector('.x').onclick = close; m.onclick = function (e) { if (e.target === m) close(); };
    return { el: m, close: close };
  }
  function loadScript(src, ok, fail) {
    var s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = fail || function () {}; document.head.appendChild(s);
  }
  function getJson(u) { return fetch(u).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }); }

  /* 하단 상담 신청 (간단 폼) */
  function applySection(title, presetType) {
    var s = C.site;
    return '<section class="sec apply" id="apply"><div class="wrap apply-box"><div class="sec-head" style="margin:0"><div class="tx"><span class="pill">상담 신청</span><h2>' + esc(title || s.finalTitle) + '</h2>' +
      '<a class="tel" href="' + telHref(s.phone) + '">' + ICON.phone + esc(s.phone) + '</a><small>' + esc(s.hours) + '</small>' +
      (s.kakao ? '<a class="btn btn-kakao btn-block mt16" href="' + esc(s.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '카카오톡 상담</a>' : '') + '</div></div>' +
      '<form class="quick-form" id="quick-form" novalidate><div class="f-row">' +
      '<div class="field"><label for="qf-name">이름 <em>*</em></label><input id="qf-name" autocomplete="name" placeholder="이름을 입력해 주십시오"></div>' +
      '<div class="field"><label for="qf-phone">연락처 <em>*</em></label><input id="qf-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000"></div></div>' +
      '<div class="field"><label for="qf-type">상담 분야</label><select id="qf-type">' + TYPE_KEYS.map(function (k) { return '<option value="' + k + '"' + (k === presetType ? ' selected' : '') + '>' + esc(typeOf(k).name) + '</option>'; }).join('') + '<option value="cremation"' + (presetType === 'cremation' ? ' selected' : '') + '>화장장 예약 안내</option><option value="support"' + (presetType === 'support' ? ' selected' : '') + '>장례지원금 문의</option><option value="unsure">아직 정하지 못했습니다</option></select></div>' +
      '<div class="field"><label for="qf-memo">추가 문의 (선택)</label><textarea id="qf-memo" placeholder="모실 인원, 희망 지역, 예산 등을 적어 주십시오"></textarea></div>' +
      '<label class="agree"><input type="checkbox" id="qf-agree"><span>상담을 위한 개인정보(이름, 연락처, 문의 내용) 수집·이용에 동의합니다. <a href="privacy.html" target="_blank">자세히</a></span></label>' +
      '<button class="btn btn-main btn-block" type="submit">무료 상담 신청하기</button><div class="err" id="qf-err"></div></form></div></section>';
  }
  function inquiryTypeName(tk) { return tk === 'unsure' ? '아직 정하지 못했습니다' : tk === 'support' ? '장례지원금 문의' : tk === 'cremation' ? '화장장 예약 안내' : typeOf(tk).name; }
  function bindApply() {
    var f = document.getElementById('quick-form'); if (!f) return;
    f.onsubmit = function (e) {
      e.preventDefault();
      var name = f.querySelector('#qf-name').value.trim(), phone = f.querySelector('#qf-phone').value.trim(), err = f.querySelector('#qf-err');
      var tk = f.querySelector('#qf-type').value;
      if (!name) { err.textContent = '이름을 입력해 주십시오.'; return; }
      if (phone.replace(/[^0-9]/g, '').length < 9) { err.textContent = '연락 가능한 번호를 정확히 입력해 주십시오.'; return; }
      if (!f.querySelector('#qf-agree').checked) { err.textContent = '개인정보 수집·이용에 동의해 주십시오.'; return; }
      var btn = f.querySelector('button'); btn.disabled = true; btn.textContent = '보내는 중…'; err.textContent = '';
      var rec = { type: inquiryTypeName(tk), region: '', when: '', name: name, phone: phone, memo: f.querySelector('#qf-memo').value.trim(), facility: '', page: location.pathname };
      sendInquiry(rec).then(function (res) {
        if (!res || !res.ok) throw new Error((res && res.message) || '접수 실패');
        f.innerHTML = '<div class="ok-msg"><b>상담 신청이 접수되었습니다.</b><br>' + esc(name) + '님, 상담팀이 확인 후 ' + esc(phone) + ' 으로 연락드리겠습니다.' +
          (res.demo ? '<br><small style="color:#8a5a00">미리보기 사이트라 실제로 접수되지는 않습니다.</small>' : '') + '</div>';
      }).catch(function (e2) {
        btn.disabled = false; btn.textContent = '무료 상담 신청하기';
        err.innerHTML = '접수 중 문제가 생겼습니다. <a href="' + telHref(C.site.phone) + '"><b>' + esc(C.site.phone) + '</b></a> 로 전화 주십시오.';
      });
    };
  }

  /* ---------- 레이아웃 ---------- */
  var MENU = [['sumokjang.html', '수목장'], ['napgoldang.html', '봉안당'], ['maejang.html', '공원묘지'], ['ijang.html', '파묘·이장'], ['search.html', '장지 찾기·비교'], ['facilities.html', '답사 시설'], ['crematorium.html', '화장장 예약'], ['contact.html?type=support', '장례지원금 상담'], ['reviews.html', '상담 후기'], ['services.html', '서비스 안내']];
  /* 첫 화면 인트로: 문구 두 줄만 차례로 떠오른 뒤 사라짐(약 3.3초). 세션당 1회, ?intro=1 다시 보기, ?intro=0 생략, ?introhold 멈춤 */
  document.addEventListener('DOMContentLoaded', function () { if (document.body.dataset.page === 'home') {
    var seen = false; try { seen = !!sessionStorage.getItem('bw_intro'); } catch (e) {}
    if ((!seen && !/intro=0/.test(location.search)) || /intro=1/.test(location.search)) {
      document.body.insertAdjacentHTML('afterbegin', '<div class="intro" aria-hidden="true"><p class="intro-t"><span class="l1">모실 곳을 정하는 일,</span><span class="l2">배웅이 함께 걷습니다.</span></p></div>');
      try { sessionStorage.setItem('bw_intro', '1'); } catch (e) {}
      if (/introhold/.test(location.search)) document.querySelector('.intro').classList.add('hold'); else setTimeout(function () { var el = document.querySelector('.intro'); if (el) el.remove(); }, 3300);
    }
  } });
  function logoHtml() {
    var s = C.site;
    return '<a class="logo" href="./"><img src="img/logo-h.png" alt="' + esc(s.name) + '">' + (s.slogan ? '<small>' + esc(s.slogan) + '</small>' : '') + '</a>';
  }
  function layout() {
    var s = C.site;
    var here = location.pathname.split('/').pop() || 'index.html';
    var nav = MENU.map(function (m) { return '<a href="' + m[0] + '"' + (here === m[0].split('?')[0] && (m[0].indexOf('?') < 0 || location.search === '?' + m[0].split('?')[1]) ? ' class="on"' : '') + '>' + m[1] + '</a>'; }).join('');

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
      '<a href="contact.html">상담 신청</a>' + (s.blogUrl ? '<a href="' + esc(s.blogUrl) + '" target="_blank" rel="noopener">배웅 블로그</a>' : '') +
      '<div class="dr-call"><a class="btn btn-main btn-block" href="' + telHref(s.phone) + '">' + ICON.phone + '<span>전화 상담 <b>' + esc(s.phone) + '</b></span></a>' +
      (s.kakao ? '<a class="btn btn-kakao btn-block" href="' + esc(s.kakao) + '" target="_blank" rel="noopener">' + ICON.kakao + '<span>카카오톡 상담 <b>채널로 문의하기</b></span></a>' : '') + '</div></div>';
    document.body.appendChild(dr);
    var openDrawer = function () { dr.classList.add('open'); };
    hd.querySelector('.menu-btn').onclick = openDrawer;
    dr.onclick = function (e) { if (e.target === dr || e.target.classList.contains('drawer-close')) dr.classList.remove('open'); };

    /* 푸터 (v4 구성): 이용약관|개인정보처리방침, 회사 정보, 저작권, 고객문의 박스, 로고 + 채널 아이콘 */
    var ft = document.createElement('footer');
    ft.className = 'ft';
    var info = [['사업자등록번호', s.bizNo], ['주소', s.address], ['메일', s.email]].filter(function (x) { return x[1]; });
    ft.innerHTML = '<div class="wrap">' +
      '<div class="flinks"><a href="privacy.html">이용약관</a><span>|</span><a href="privacy.html"><b>개인정보처리방침</b></a></div>' +
      '<div class="finfo"><div class="co"><b>' + esc(s.bizName || s.name) + '</b>' + (s.ceo ? ' <span>대표 : ' + esc(s.ceo) + '</span>' : '') + '</div>' +
      info.map(function (x) { return '<div>' + x[0] + ' : ' + esc(x[1]) + '</div>'; }).join('') +
      (s.bizDesc ? '<div>' + esc(s.bizDesc) + '</div>' : '') + '<div>상담 ' + esc(s.hours) + '</div></div>' +
      '<div class="fcopy">© ' + new Date().getFullYear() + '. ' + esc(s.bizName || s.name) + ' All rights reserved.</div>' +
      '<a class="fcall" href="' + telHref(s.phone) + '"><small>고객문의 (' + esc(String(s.hours || '').split(' · ')[0]) + ')</small><b>' + esc(s.phone) + '</b></a>' +
      '<div class="fbottom"><img src="img/logo-h.png" alt="' + esc(s.name) + '"><div class="fsns">' +
      (s.kakao ? '<a href="' + esc(s.kakao) + '" target="_blank" rel="noopener" aria-label="카카오톡 채널">' + ICON.kakao + '</a>' : '') +
      (s.blogUrl ? '<a href="' + esc(s.blogUrl) + '" target="_blank" rel="noopener" aria-label="네이버 블로그">' + ICON.nblog + '</a>' : '') +
      '<a href="facilities.html" aria-label="답사 시설">' + ICON.pin + '</a>' +
      '<a href="http://baewoong.co.kr" target="_blank" rel="noopener" aria-label="기존 홈페이지">' + ICON.globe + '</a></div></div></div>';
    shell.appendChild(ft);

    /* 하단 탭바 (앱 메뉴): 홈 · 장지 비교 · 전화 상담(가운데) · 상담 신청 · 메뉴 */
    var tb = document.createElement('nav');
    tb.className = 'tabbar';
    tb.setAttribute('aria-label', '빠른 메뉴');
    tb.innerHTML = '<a href="./"' + (here === 'index.html' || here === '' ? ' class="on"' : '') + '>' + ICON.home + '홈</a>' +
      '<a href="search.html"' + (here === 'search.html' ? ' class="on"' : '') + '>' + ICON.grid + '장지 비교</a>' +
      '<a class="call" href="' + telHref(s.phone) + '" aria-label="전화 상담 ' + esc(s.phone) + '"><span class="c">' + ICON.phone + '</span><b>전화 상담</b></a>' +
      '<a href="contact.html' + (window.CONTACT_QUERY || '') + '"' + (here === 'contact.html' ? ' class="on"' : '') + '>' + ICON.form + '상담 신청</a>' +
      '<button type="button" class="tab-menu">' + ICON.menu + '메뉴</button>';
    document.body.appendChild(tb);
    tb.querySelector('.tab-menu').onclick = openDrawer;

    /* 플로팅 버튼: 카톡 · 장례지원금 · 화장장 예약 (첫 화면에서는 숨기고 스크롤 내리면 나타남) */
    var fab = document.createElement('div');
    fab.className = 'fabs';
    fab.innerHTML = (s.kakao ? '<a class="fab kakao" href="' + esc(s.kakao) + '" target="_blank" rel="noopener" aria-label="카카오톡 상담">' + ICON.kakao + '카톡</a>' : '') +
      '<a class="fab support" href="contact.html?type=support" aria-label="장례지원금 상담 신청">장례<br>지원금</a>' +
      '<a class="fab crem" href="crematorium.html" aria-label="화장장 예약 안내">' + ICON.flame + '화장장<br>예약</a>';
    document.body.appendChild(fab);
    if (document.body.dataset.page === 'home') {
      var fabHide = function () { var m = document.querySelector('#quick'); var lim = m ? m.getBoundingClientRect().bottom + scrollY - innerHeight + 40 : 200; document.body.classList.toggle('fab-hide', scrollY < Math.max(lim, 80)); };
      fabHide(); addEventListener('scroll', fabHide, { passive: true }); addEventListener('resize', fabHide);
    }
  }

  /* 문의 전송: 서버(PHP·Worker)에 저장 */
  function sendInquiry(rec) {
    if (/\.github\.io$/.test(location.hostname)) return Promise.resolve({ ok: true, demo: true });
    return fetch('admin/api.php?action=inquiry', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'JANGJI' },
      body: JSON.stringify({ inquiry: rec })
    }).then(function (r) { return r.json(); });
  }

  window.U = {
    ICON: ICON, LI: LI, TYPE_KEYS: TYPE_KEYS, SHORT: SHORT, EHANEUL: EHANEUL, REVIEW_KEYWORDS: REVIEW_KEYWORDS, esc: esc, nl: nl, telHref: telHref, qs: qs, typeOf: typeOf, typeImg: typeImg, bg: bg, img: img,
    facPhoto: facPhoto, revPhoto: revPhoto, facility: facility, hasType: hasType, visibleFacilities: visibleFacilities, visibleReviews: visibleReviews,
    fmtDate: fmtDate, sampleTag: sampleTag, kwOf: kwOf, kwChips: kwChips, typeNames: typeNames, facCard: facCard, revCard: revCard, artCard: artCard, rail: rail, bindRails: bindRails,
    faqHtml: faqHtml, applySection: applySection, bindApply: bindApply, sendInquiry: sendInquiry, inquiryTypeName: inquiryTypeName,
    dragScroll: dragScroll, toast: toast, modal: modal, loadScript: loadScript, getJson: getJson
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
