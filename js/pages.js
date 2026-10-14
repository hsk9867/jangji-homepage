/* 페이지별 화면. body data-page 값으로 골라 실행합니다. */
(function () {
  var U = window.U, C = window.C, I = U.ICON, esc = U.esc, nl = U.nl;
  var P = {};
  function setTitle(t) { document.title = t ? t + ' | ' + C.site.name : C.site.name + ' | ' + C.site.slogan; }
  function list(a) { return (a || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }
  var TYPE_ICON = { sumok: I.tree, napgol: I.house, maejang: I.hill };

  /* ---------- HOME ---------- */
  P.home = function (el) {
    var s = C.site;
    setTitle('');
    var revs = U.visibleReviews().filter(function (r) { return r.featured !== false; }).slice(0, 12);
    var supportUrl = s.supportFormUrl;

    el.innerHTML =
      /* 1. 히어로 */
      '<section class="hero" style="' + U.bg(s.heroImage || 'img/hero.svg') + '"><div class="wrap">' +
        '<div class="eyebrow">' + esc(s.heroEyebrow || '') + '</div><h1>' + esc(s.heroTitle) + '</h1>' +
        (s.heroSub ? '<p style="margin-top:10px;opacity:.92">' + nl(s.heroSub) + '</p>' : '') +
        '<div class="btn-row"><a class="btn btn-coral" href="' + U.telHref(s.phone) + '">' + I.phone + '전화 상담</a>' +
        '<a class="btn btn-line" href="contact.html">' + I.form + '무료 견적 받기</a></div>' +
        '<div class="hero-badges">' + (s.heroBadges || []).map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('') + '</div>' +
      '</div></section>' +

      /* 2. 상황 선택 */
      '<section class="sec sec-gray"><div class="wrap"><div class="sec-title"><span class="pill">장지 상담</span><h2>지금 어떤 상황인지 알려주세요.</h2><p>배웅이 가족의 상황에 꼭 맞는 방법으로 함께 하겠습니다.</p></div>' +
        '<div class="situ">' +
          '<a href="' + U.telHref(s.phone) + '"><div class="top"><span class="emo">🔔</span><span><strong>지금 알아보기</strong><small>지금 바로 모실 곳을 찾아야 해요.</small></span><span class="arr">→</span></div>' +
            '<div class="hash"><span>#바로 전화 연결</span><span>#가까운 위치</span><span>#빠른 안치</span><span>#당일 답사</span></div></a>' +
          '<a href="#types"><div class="top"><span class="emo">📋</span><span><strong>미리 준비하기</strong><small>여유 있게 비교하고 답사할래요.</small></span><span class="arr">→</span></div>' +
            '<div class="hash"><span>#시설 비교</span><span>#주말 동행 답사</span><span>#계약 조건 확인</span><span>#장례지원금</span></div></a>' +
        '</div></div></section>' +

      /* 3. 상담·답사 후기 */
      (revs.length ? '<section class="sec"><div class="wrap"><div class="sec-left"><div><h2>배웅 상담·답사 후기 <span class="cnt">' + U.visibleReviews().length + '</span></h2><p>배웅 상담팀이 가족과 함께 다녀온 현장 이야기입니다.</p></div><a class="more" href="reviews.html">전체 보기 ›</a></div>' +
        U.rail(revs.map(U.revCard).join(''), 'wide') + '</div></section>' : '') +

      /* 4. 서비스 이용 안내 */
      '<section class="sec"><div class="wrap"><div class="sec-title"><h2>서비스 이용 안내</h2></div><ol class="flow">' +
        (s.steps || []).map(function (st, i) { return '<li><div class="tx"><strong>' + esc(st.t) + '</strong><span>' + esc(st.d) + '</span></div><span class="ic">' + ['📞', '🔍', '📍', '📝', '🕊️'][i % 5] + '</span></li>'; }).join('') +
      '</ol></div></section>' +

      /* 5. 약속 */
      '<section class="sec sec-gray"><div class="wrap"><div class="sec-title"><span class="pill">배웅의 약속</span><h2>후회 없는 선택을 위해,\n직접 보고 함께 걷습니다</h2></div>' +
        '<div class="price-cards" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">' + (s.why || []).map(function (w) { return '<div class="pcard" style="padding:22px 20px"><b style="font-size:17px;display:block;margin-bottom:6px">' + esc(w.t) + '</b><span class="d">' + esc(w.d) + '</span></div>'; }).join('') + '</div>' +
      '</div></section>' +

      /* 6. 장지 유형 안내 (가격) */
      '<section class="sec" id="types"><div class="wrap"><div class="sec-title"><h2>장지 유형 안내</h2><p>가족들이 가장 많이 찾는 장지 유형의 평균 가격과 정보예요.</p></div><div class="price-cards">' +
        U.TYPE_KEYS.map(function (k, i) {
          var t = U.typeOf(k);
          return '<a class="pcard' + (i === 0 ? ' hot' : '') + '" href="' + t.path + '"><div class="tags"><span>' + esc(t.priceTag || '') + '</span>' + (i === 0 ? '<span class="h">HOT</span>' : '') + '</div>' +
            '<span class="d">' + esc(t.short) + '</span><div class="box"><b>' + esc(U.SHORT[k]) + '</b><em>' + esc(t.price) + '</em></div></a>';
        }).join('') + '</div><p class="price-note">블로그 답사 자료 기준 평균이며, 실제 비용은 시설·위치·관리비에 따라 달라집니다.</p></div></section>' +

      /* 7. 유형별 추천 시설 */
      '<section class="sec sec-gray"><div class="wrap">' +
        ['sumok', 'napgol', 'maejang'].map(function (k) {
          var l = U.visibleFacilities(k).filter(function (f) { return f.featured !== false; });
          if (!l.length) return '';
          return '<div class="type-block"><div class="sec-left"><h2><span class="dot-ic">' + TYPE_ICON[k] + '</span>' + esc(U.SHORT[k]) + ' 추천</h2><a class="more" href="' + U.typeOf(k).path + '#list">더 보기 ›</a></div>' + U.rail(l.map(U.facCard).join('')) + '</div>';
        }).join('') + '</div></section>' +

      /* 8. 장례지원금 */
      (supportUrl ? '<section class="sec" style="padding-bottom:0"><div class="wrap"><div class="support"><div><b>장례지원금, 꼭 장례 전에 확인하세요</b><p>받을 수 있는 지원 항목을 배웅이 미리 정리해 드립니다. 지원 여부와 금액은 신청 조건과 심사 결과에 따라 달라집니다.</p></div>' +
        '<a class="btn btn-coral" href="' + esc(supportUrl) + '" target="_blank" rel="noopener">장례지원금 신청서 작성</a></div></div></section>' : '') +

      /* 9. 장례정보 */
      ((C.articles || []).length ? '<section class="sec"><div class="wrap"><div class="sec-left"><div><h2>배웅이 알려드리는 장례정보</h2><p>장지 선택과 계약 전에 알아두면 좋은 내용을 정리했어요.</p></div>' + (s.blogUrl ? '<a class="more" href="' + esc(s.blogUrl) + '" target="_blank" rel="noopener">블로그 ›</a>' : '') + '</div>' +
        U.rail(C.articles.map(U.artCard).join(''), 'wide') + '</div></section>' : '') +

      /* 10. FAQ */
      '<section class="sec" style="padding-top:24px"><div class="wrap" style="max-width:900px"><div class="faq-head"><h2>자주 묻는 질문</h2><p>상담 때 가족들이 가장 많이 물어보시는 내용이에요.</p></div>' + U.faqHtml(C.faqs) + '</div></section>' +

      /* 11. 상담 신청 */
      U.applySection();
    // 줄바꿈 표시
    el.querySelectorAll('.sec-title h2').forEach(function (h) { h.style.whiteSpace = 'pre-line'; });
  };

  /* ---------- 장지 유형 (수목장·봉안당·공원묘지) ---------- */
  P.type = function (el) {
    var key = document.body.dataset.type, t = U.typeOf(key);
    setTitle(t.name);
    window.CONTACT_QUERY = '?type=' + key;
    var all = U.visibleFacilities(key);
    var areas = [];
    all.forEach(function (f) { var a = (f.area || '').split(/[ (]/)[0] + ' ' + ((f.area || '').split(' ')[1] || ''); a = (f.area || '').replace(/\(.*\)/, '').trim(); if (a && areas.indexOf(a) < 0) areas.push(a); });
    var revs = U.visibleReviews(key).slice(0, 6);

    el.innerHTML =
      '<section class="sub-hero" style="' + U.bg(U.typeImg(key)) + '"><div class="wrap"><div class="crumb">장지 안내</div><h1>' + esc(t.name) + '</h1><p>' + esc(t.short) + '</p></div></section>' +
      '<section class="sec"><div class="wrap"><div class="intro-grid"><div><span class="pill">' + esc(U.SHORT[key]) + '란?</span><p class="lead">' + nl(t.desc) + '</p></div>' +
        '<div class="price-box"><span class="tg">' + esc(t.priceTag || '평균') + '</span><span class="lb">' + esc(U.SHORT[key]) + ' 평균 가격</span><span class="v">' + esc(t.price) + '</span><small>' + esc(t.priceNote) + '</small>' +
        '<a class="btn btn-coral btn-block mt16" href="contact.html?type=' + key + '">' + I.form + '내 조건으로 견적 받기</a></div></div>' +
        '<div class="pc mt24"><div><h3>좋은 점</h3><ul>' + list(t.pros) + '</ul></div><div><h3>미리 알아두실 점</h3><ul>' + list(t.cons) + '</ul></div><div><h3>이런 가족께 추천해요</h3><ul>' + list(t.recommend) + '</ul></div></div>' +
      '</div></section>' +
      '<section class="sec sec-gray" id="list"><div class="wrap"><div class="sec-left"><div><h2><span class="dot-ic">' + (TYPE_ICON[key] || '') + '</span>배웅이 답사한 ' + esc(U.SHORT[key]) + ' <span class="cnt">' + all.length + '</span></h2><p>사진을 눌러 시설 정보와 답사 메모를 확인하세요.</p></div></div>' +
        (areas.length > 1 ? '<div class="chips" id="chips"><button class="chip on" data-a="">전체</button>' + areas.map(function (a) { return '<button class="chip" data-a="' + esc(a) + '">' + esc(a) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="fac-grid" id="facs"></div></div></section>' +
      (revs.length ? '<section class="sec"><div class="wrap"><div class="sec-left"><h2>' + esc(U.SHORT[key]) + ' 상담·답사 후기</h2><a class="more" href="reviews.html?type=' + key + '">더 보기 ›</a></div>' + U.rail(revs.map(U.revCard).join(''), 'wide') + '</div></section>' : '') +
      ((t.faqs || []).length ? '<section class="sec" style="padding-top:' + (revs.length ? '0' : '56px') + '"><div class="wrap" style="max-width:900px"><div class="faq-head"><h2>자주 묻는 질문</h2></div>' + U.faqHtml(t.faqs) + '</div></section>' : '') +
      U.applySection(U.SHORT[key] + ', 어디가 좋을지\n전화로 편하게 물어보세요.', key);

    function draw(area) {
      var l = all.filter(function (f) { return !area || (f.area || '').indexOf(area) === 0; });
      document.getElementById('facs').innerHTML = l.length ? l.map(U.facCard).join('') : '<div class="empty" style="grid-column:1/-1">등록된 시설이 곧 올라옵니다. 지금은 전화로 안내받으세요.</div>';
    }
    draw('');
    var chips = document.getElementById('chips');
    if (chips) chips.onclick = function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c === b); });
      draw(b.dataset.a);
    };
  };

  /* ---------- 답사 시설 전체 ---------- */
  P.facilities = function (el) {
    setTitle('답사 시설');
    var cur = U.qs('type');
    el.innerHTML = '<div class="wrap"><div class="plain-head"><h1>배웅이 답사한 시설</h1><p>배웅 상담팀이 직접 다녀와 확인한 수목장·봉안당·공원묘지입니다.</p></div>' +
      '<div class="chips mt16" id="chips"><button class="chip" data-t="">전체</button>' + ['sumok', 'napgol', 'maejang'].map(function (k) { return '<button class="chip" data-t="' + k + '">' + esc(U.SHORT[k]) + ' ' + U.visibleFacilities(k).length + '</button>'; }).join('') + '</div>' +
      '<div class="fac-grid" id="facs"></div></div><div style="height:48px"></div>' + U.applySection();
    var chips = document.getElementById('chips');
    function draw() {
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c.dataset.t === cur); });
      var l = U.visibleFacilities(cur);
      document.getElementById('facs').innerHTML = l.length ? l.map(U.facCard).join('') : '<div class="empty" style="grid-column:1/-1">등록된 시설이 없습니다.</div>';
    }
    chips.onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; cur = b.dataset.t; draw(); };
    draw();
  };

  /* ---------- 이장·파묘 ---------- */
  P.ijang = function (el) {
    var t = U.typeOf('ijang');
    setTitle(t.name);
    window.CONTACT_QUERY = '?type=ijang';
    var revs = U.visibleReviews('ijang').slice(0, 6);
    el.innerHTML =
      '<section class="sub-hero" style="' + U.bg(U.typeImg('ijang')) + '"><div class="wrap"><div class="crumb">장지 안내</div><h1>' + esc(t.name) + '</h1><p>' + esc(t.short) + '</p></div></section>' +
      '<section class="sec"><div class="wrap"><div class="intro-grid"><div><span class="pill">파묘·이장이란?</span><p class="lead">' + nl(t.desc) + '</p>' +
        '<div class="pc mt24" style="grid-template-columns:1fr"><div><h3>이런 경우 상담받으세요</h3><ul>' + list(t.reasons) + '</ul></div></div></div>' +
        '<div class="price-box"><span class="tg">' + esc(t.priceTag || '') + '</span><span class="lb">비용 안내</span><span class="v">' + esc(t.price) + '</span><small>' + esc(t.priceNote) + '</small>' +
        '<a class="btn btn-coral btn-block mt16" href="' + U.telHref(C.site.phone) + '">' + I.phone + '현장 확인 요청하기</a></div></div></div></section>' +
      '<section class="sec sec-gray"><div class="wrap"><div class="sec-title"><span class="pill">진행 절차</span><h2>개장 신고부터 새 장지 안치까지</h2></div><ol class="steps-v">' +
        (t.steps || []).map(function (st) { return '<li><div><strong>' + esc(st.t) + '</strong><span>' + esc(st.d) + '</span></div></li>'; }).join('') + '</ol></div></section>' +
      (revs.length ? '<section class="sec"><div class="wrap"><div class="sec-left"><h2>파묘·이장 상담 이야기</h2><a class="more" href="reviews.html?type=ijang">더 보기 ›</a></div>' + U.rail(revs.map(U.revCard).join(''), 'wide') + '</div></section>' : '') +
      ((t.faqs || []).length ? '<section class="sec" style="padding-top:' + (revs.length ? '0' : '56px') + '"><div class="wrap" style="max-width:900px"><div class="faq-head"><h2>자주 묻는 질문</h2></div>' + U.faqHtml(t.faqs) + '</div></section>' : '') +
      U.applySection('묘 이전이 고민되시면\n현장 확인부터 무료로 받아보세요.', 'ijang');
  };

  /* ---------- 시설 상세 ---------- */
  P.facility = function (el) {
    var f = U.facility(U.qs('id'));
    if (!f || f.visible === false) { el.innerHTML = '<div class="wrap sec"><div class="empty">시설 정보를 찾을 수 없습니다. <a href="facilities.html"><b>답사 시설 보기</b></a></div></div>'; return; }
    var t = U.typeOf(f.type);
    setTitle(f.name);
    window.CONTACT_QUERY = '?type=' + f.type + '&facility=' + encodeURIComponent(f.id);
    var photos = (f.photos && f.photos.length) ? f.photos : [U.typeImg(f.type)];
    var revs = U.visibleReviews().filter(function (r) { return r.facilityId === f.id; });
    var q = encodeURIComponent(f.address && !/일대|\(/.test(f.address) ? f.address : f.name);
    var rows = [['유형', t.name], ['지역', f.area], ['주소', f.address], ['운영', f.operator], ['비용', f.price]].filter(function (r) { return r[1]; });
    var others = U.visibleFacilities(f.type).filter(function (x) { return x.id !== f.id; }).slice(0, 8);

    el.innerHTML =
      '<div class="gallery"><div class="track" id="track">' + photos.map(function (p, i) { return U.img(p, f.name + ' 사진 ' + (i + 1), i < 2); }).join('') + '</div>' +
        (photos.length > 1 ? '<button class="nav-b prev" aria-label="이전 사진">‹</button><button class="nav-b next" aria-label="다음 사진">›</button><span class="num" id="num">1 / ' + photos.length + '</span>' : '') + '</div>' +
      '<section class="sec" style="padding-top:28px"><div class="wrap"><div class="detail-grid"><div>' +
        '<div class="d-tags"><a class="ty" href="' + t.path + '">' + esc(U.SHORT[f.type]) + '</a>' + (f.tags || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + U.sampleTag(f) + '</div>' +
        '<h1 class="d-title">' + esc(f.name) + '</h1>' +
        '<dl class="info">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
        '<div class="map-links"><a href="https://map.naver.com/p/search/' + q + '" target="_blank" rel="noopener">네이버 지도</a><a href="https://map.kakao.com/?q=' + q + '" target="_blank" rel="noopener">카카오맵</a></div>' +
        (f.comment ? '<div class="comment"><strong>배웅 답사 메모</strong>' + esc(f.comment) + '</div>' : '') +
        (f.blogUrl ? '<a class="blog-link" href="' + esc(f.blogUrl) + '" target="_blank" rel="noopener"><span><b>N 블로그</b> 배웅이 쓴 답사기 전체 보기</span><span>›</span></a>' : '') +
        (revs.length ? '<div class="sec-left" style="margin-top:40px"><h2 style="font-size:20px">이 시설 상담·답사 후기</h2></div><div class="rev-grid">' + revs.map(U.revCard).join('') + '</div>' : '') +
      '</div><div class="sticky-side"><div class="side-cta"><h3>이 시설, 상담받아 보세요</h3><p>현재 선택할 수 있는 자리와 정확한 비용, 동행 답사 일정을 안내해 드립니다. 주말 답사도 무료입니다.</p>' +
        '<a class="btn btn-coral btn-block" href="' + U.telHref(C.site.phone) + '">' + I.phone + '전화 상담 ' + esc(C.site.phone) + '</a>' +
        '<a class="btn btn-line btn-block" href="contact.html' + window.CONTACT_QUERY + '">' + I.form + '이 시설로 견적 문의</a>' +
        (C.site.kakao ? '<a class="btn btn-kakao btn-block" href="' + esc(C.site.kakao) + '" target="_blank" rel="noopener">' + I.kakao + '카카오톡 상담</a>' : '') + '</div></div></div></div></section>' +
      (others.length ? '<section class="sec sec-gray"><div class="wrap"><div class="sec-left"><h2>다른 ' + esc(U.SHORT[f.type]) + '도 비교해 보세요</h2><a class="more" href="' + t.path + '#list">전체 ›</a></div>' + U.rail(others.map(U.facCard).join('')) + '</div></section>' : '');

    var track = document.getElementById('track'), num = document.getElementById('num');
    if (num) {
      var step = function () { return track.querySelector('img').clientWidth; };
      track.addEventListener('scroll', function () { num.textContent = (Math.round(track.scrollLeft / step()) + 1) + ' / ' + photos.length; }, { passive: true });
      el.querySelector('.gallery .prev').onclick = function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); };
      el.querySelector('.gallery .next').onclick = function () { track.scrollBy({ left: step(), behavior: 'smooth' }); };
    }
  };

  /* ---------- 후기 목록 ---------- */
  P.reviews = function (el) {
    setTitle('상담·답사 후기');
    var cur = U.qs('type'), shown = 9;
    el.innerHTML = '<div class="wrap"><div class="plain-head"><h1>상담·답사 후기</h1><p>배웅 상담팀이 가족과 함께 시설을 둘러보고 남긴 이야기입니다.</p></div>' +
      '<div class="chips mt16" id="chips"><button class="chip" data-t="">전체</button>' + U.TYPE_KEYS.map(function (k) { return '<button class="chip" data-t="' + k + '">' + esc(U.SHORT[k]) + '</button>'; }).join('') + '</div>' +
      '<div class="rev-grid" id="list"></div><button class="btn btn-line load-more" id="more">후기 더 보기</button></div>' +
      '<div style="height:56px"></div>' + U.applySection();
    var chips = document.getElementById('chips'), more = document.getElementById('more');
    function draw() {
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c.dataset.t === cur); });
      var l = U.visibleReviews(cur);
      document.getElementById('list').innerHTML = l.length ? l.slice(0, shown).map(U.revCard).join('') : '<div class="empty" style="grid-column:1/-1">아직 등록된 후기가 없습니다.</div>';
      more.style.display = l.length > shown ? '' : 'none';
    }
    chips.onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; cur = b.dataset.t; shown = 9; draw(); };
    more.onclick = function () { shown += 9; draw(); };
    draw();
  };

  /* ---------- 후기 상세 ---------- */
  P.review = function (el) {
    var r = C.reviews.filter(function (x) { return x.id === U.qs('id'); })[0];
    if (!r || r.visible === false) { el.innerHTML = '<div class="wrap sec"><div class="empty">후기를 찾을 수 없습니다. <a href="reviews.html"><b>후기 목록</b></a></div></div>'; return; }
    setTitle(r.title);
    window.CONTACT_QUERY = '?type=' + r.type;
    var f = U.facility(r.facilityId);
    el.innerHTML = '<div class="wrap" style="padding-top:28px"><div class="article"><a class="more" href="reviews.html" style="color:#767676;font-size:14px">‹ 후기 목록</a>' +
      '<div class="d-tags mt16"><span class="ty">' + esc(U.SHORT[r.type]) + ' 상담</span>' + U.sampleTag(r) + '</div>' +
      '<h1>' + esc(r.title) + '</h1><div class="who">' + esc(r.author || '고객') + ' · ' + U.fmtDate(r.date) + '</div>' +
      '<div class="body">' + esc(r.body) + '</div>' +
      (r.blogUrl ? '<a class="blog-link" href="' + esc(r.blogUrl) + '" target="_blank" rel="noopener"><span><b>N 블로그</b> 이 이야기 전체 보기</span><span>›</span></a>' : '') +
      ((r.photos || []).length ? '<div class="photos">' + r.photos.map(function (p) { return U.img(p, r.title + ' 사진'); }).join('') + '</div>' : '') +
      (f && f.visible !== false ? '<a class="linked" href="facility.html?id=' + encodeURIComponent(f.id) + '">' + U.img(U.facPhoto(f), f.name) + '<span><small>진행 시설</small><strong>' + esc(f.name) + '</strong></span><span style="margin-left:auto;color:#767676">›</span></a>' : '') +
      '</div></div><div style="height:48px"></div>' + U.applySection('같은 고민이 있으시다면\n편하게 전화 주세요.', r.type);
  };

  /* ---------- 단계형 견적·상담 문의 ---------- */
  P.contact = function (el) {
    setTitle('견적·상담 신청');
    var s = C.site;
    var fac = U.facility(U.qs('facility'));
    var st = { type: U.qs('type') || (fac ? fac.type : ''), region: '', when: '', name: '', phone: '', memo: '', facility: fac ? fac.name : '' };
    if (st.type && U.TYPE_KEYS.indexOf(st.type) < 0 && st.type !== 'unsure') st.type = '';
    var step = st.type ? 2 : 1, TOTAL = 4;
    var WHEN = [['urgent', '급해요 (1주일 이내)', '바로 전화로 연락드립니다'], ['soon', '1~3개월 안에', ''], ['later', '미리 준비하고 있어요', '부모님 생전 준비 등'], ['unknown', '아직 모르겠어요', '']];
    function typeName(k) { return k === 'unsure' ? '아직 잘 모르겠어요' : U.typeOf(k).name; }
    function whenName(k) { var w = WHEN.filter(function (x) { return x[0] === k; })[0]; return w ? w[1] : ''; }
    function picked() {
      var a = [];
      if (st.facility) a.push('시설 <b>' + esc(st.facility) + '</b>');
      if (st.type && step > 1) a.push('유형 <b>' + esc(typeName(st.type)) + '</b>');
      if (st.region && step > 2) a.push('지역 <b>' + esc(st.region) + '</b>');
      if (st.when && step > 3) a.push('시기 <b>' + esc(whenName(st.when)) + '</b>');
      return a.length ? '<div class="picked">' + a.join(' · ') + '</div>' : '';
    }
    function opt(val, label, sub, on, attr) { return '<button type="button" class="opt' + (on ? ' on' : '') + '" ' + attr + '="' + esc(val) + '">' + esc(label) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</button>'; }
    function draw() {
      var body = '';
      if (step === 1) body = '<h1 class="q">어떤 장지를 찾으세요?</h1><div class="opts">' + U.TYPE_KEYS.map(function (k) { return opt(k, U.typeOf(k).name, U.typeOf(k).short, st.type === k, 'data-type'); }).join('') + opt('unsure', '아직 잘 모르겠어요', '상담하면서 함께 정해요', st.type === 'unsure', 'data-type') + '</div>';
      else if (step === 2) body = '<h1 class="q">희망하시는 지역은요?</h1><div class="opts two">' + (s.regions || []).map(function (r) { return opt(r, r, '', st.region === r, 'data-region'); }).join('') + opt('상관없음', '상관없어요', '', st.region === '상관없음', 'data-region') + '</div>';
      else if (step === 3) body = '<h1 class="q">언제까지 필요하세요?</h1><div class="opts">' + WHEN.map(function (w) { return opt(w[0], w[1], w[2], st.when === w[0], 'data-when'); }).join('') + '</div>';
      else body = '<h1 class="q">연락받으실 정보를 남겨 주세요</h1>' +
        '<div class="field"><label for="f-name">이름 <em>*</em></label><input id="f-name" autocomplete="name" value="' + esc(st.name) + '" placeholder="홍길동"></div>' +
        '<div class="field"><label for="f-phone">휴대폰 번호 <em>*</em></label><input id="f-phone" type="tel" inputmode="tel" autocomplete="tel" value="' + esc(st.phone) + '" placeholder="010-0000-0000"></div>' +
        '<div class="field"><label for="f-memo">궁금하신 점 (선택)</label><textarea id="f-memo" placeholder="모실 인원, 예산, 원하시는 조건 등을 적어 주세요">' + esc(st.memo) + '</textarea></div>' +
        '<label class="agree"><input type="checkbox" id="f-agree"><span>상담을 위한 개인정보(이름, 연락처, 문의 내용) 수집·이용에 동의합니다. 상담 완료 후 1년간 보관 후 파기합니다. <a href="privacy.html" target="_blank">자세히 보기</a></span></label>' +
        '<button class="btn btn-coral btn-block" id="send">' + I.check + '무료 상담 신청하기</button><div class="err" id="err"></div>';
      el.innerHTML = '<div class="form-wrap"><div class="step-n">' + step + ' / ' + TOTAL + ' 단계</div><div class="progress"><i style="width:' + (step / TOTAL * 100) + '%"></i></div>' +
        picked() + body + (step > 1 ? '<div class="form-nav"><button class="btn btn-line back" id="back">이전</button></div>' : '') +
        '<div class="call-box"><small>입력이 번거로우시면</small><a class="tel" href="' + U.telHref(s.phone) + '">' + esc(s.phone) + '</a><small>' + esc(s.hours) + '</small></div></div>';
      el.querySelectorAll('[data-type]').forEach(function (b) { b.onclick = function () { st.type = b.dataset.type; step = 2; draw(); }; });
      el.querySelectorAll('[data-region]').forEach(function (b) { b.onclick = function () { st.region = b.dataset.region; step = 3; draw(); }; });
      el.querySelectorAll('[data-when]').forEach(function (b) { b.onclick = function () { st.when = b.dataset.when; step = 4; draw(); }; });
      var back = document.getElementById('back'); if (back) back.onclick = function () { keep(); step--; draw(); };
      var send = document.getElementById('send'); if (send) send.onclick = submit;
      window.scrollTo(0, 0);
    }
    function keep() { var n = document.getElementById('f-name'); if (!n) return; st.name = n.value.trim(); st.phone = document.getElementById('f-phone').value.trim(); st.memo = document.getElementById('f-memo').value.trim(); }
    function submit() {
      keep();
      var err = document.getElementById('err'), btn = document.getElementById('send');
      if (!st.name) { err.textContent = '이름을 입력해 주세요.'; return; }
      if (st.phone.replace(/[^0-9]/g, '').length < 9) { err.textContent = '연락 가능한 번호를 정확히 입력해 주세요.'; return; }
      if (!document.getElementById('f-agree').checked) { err.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }
      btn.disabled = true; btn.textContent = '보내는 중…'; err.textContent = '';
      var rec = { type: typeName(st.type), region: st.region, when: whenName(st.when), name: st.name, phone: st.phone, memo: st.memo, facility: st.facility, page: document.referrer ? document.referrer.replace(location.origin, '') : '' };
      U.sendInquiry(rec).then(function (res) { if (!res || !res.ok) throw new Error((res && res.message) || '접수 실패'); done(rec, res.demo); })
        .catch(function (e) {
          btn.disabled = false; btn.innerHTML = I.check + '무료 상담 신청하기';
          err.innerHTML = '접수 중 문제가 생겼습니다. <a href="' + U.telHref(s.phone) + '"><b>' + esc(s.phone) + '</b></a> 로 전화 주세요.';
        });
    }
    function done(rec, demo) {
      el.innerHTML = '<div class="form-wrap done"><div class="ok">' + I.check + '</div><h1>상담 신청이 접수되었습니다</h1>' +
        (demo ? '<div class="notice-bar" style="border-radius:10px;margin-top:12px">미리보기 사이트라 실제로 접수되지는 않습니다. 정식 서버에서는 관리자 문의함에 쌓입니다.</div>' : '') +
        '<p>' + esc(rec.name) + '님, 담당자가 확인 후 <b>' + esc(rec.phone) + '</b> 으로 연락드리겠습니다.' + (st.when === 'urgent' ? '<br>급하신 경우 바로 전화 주시면 더 빠르게 안내해 드립니다.' : '') + '</p>' +
        '<a class="btn btn-coral btn-block" href="' + U.telHref(s.phone) + '">' + I.phone + '바로 전화하기 ' + esc(s.phone) + '</a>' +
        '<a class="btn btn-line btn-block mt8" href="./">처음으로</a></div>';
      window.scrollTo(0, 0);
    }
    draw();
  };

  /* ---------- 개인정보 처리방침 ---------- */
  P.privacy = function (el) {
    setTitle('개인정보 처리방침');
    var s = C.site;
    el.innerHTML = '<div class="wrap prose" style="max-width:760px;padding:36px 16px 56px"><h1 style="font-size:26px">개인정보 처리방침</h1>' +
      '<p class="mt16">' + esc(s.bizName) + '(이하 "회사")는 상담 신청 과정에서 받는 개인정보를 아래와 같이 처리합니다.</p>' +
      '<h2>1. 수집 항목</h2><p>이름, 휴대폰 번호, 문의 내용(장지 유형, 희망 지역, 시기, 요청 사항)</p>' +
      '<h2>2. 수집·이용 목적</h2><p>장지 분양 및 이장·파묘 상담, 견적 안내, 현장 답사 일정 조율을 위한 연락</p>' +
      '<h2>3. 보유 및 이용 기간</h2><p>상담 완료 후 1년간 보관하며, 기간이 지나면 지체 없이 파기합니다. 계약이 이루어진 경우 관련 법령에서 정한 기간 동안 보관합니다.</p>' +
      '<h2>4. 제3자 제공</h2><p>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 상담 진행을 위해 이용자가 선택한 장지 시설에 연락처를 전달할 필요가 있는 경우 사전에 동의를 받습니다.</p>' +
      '<h2>5. 동의를 거부할 권리</h2><p>개인정보 수집·이용에 동의하지 않을 수 있으며, 이 경우 온라인 상담 신청은 할 수 없습니다. 전화 상담은 언제든 가능합니다.</p>' +
      '<h2>6. 이용자의 권리</h2><p>이용자는 언제든 자신의 개인정보 열람, 정정, 삭제를 요청할 수 있습니다.</p>' +
      '<h2>7. 개인정보 보호책임자</h2><p>' + esc(s.bizName) + (s.ceo ? ' 대표 ' + esc(s.ceo) : '') + ' · ' + esc(s.phone) + (s.email ? ' · ' + esc(s.email) : '') + '</p>' +
      '<p class="mt24">시행일: 2026년 10월 14일</p></div>';
  };

  window.PAGES = P;
})();
