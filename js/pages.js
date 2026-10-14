/* 페이지별 화면. body data-page 값으로 골라 실행합니다. */
(function () {
  var U = window.U, C = window.C, I = U.ICON, esc = U.esc, nl = U.nl;
  var P = {};

  function setTitle(t) { document.title = t ? t + ' | ' + C.site.name : C.site.name; }

  /* ---------- HOME ---------- */
  P.home = function (el) {
    var s = C.site;
    setTitle('');
    var featuredFac = U.visibleFacilities().filter(function (f) { return f.featured; });
    if (!featuredFac.length) featuredFac = U.visibleFacilities().slice(0, 6);
    var featuredRev = U.visibleReviews().filter(function (r) { return r.featured; }).slice(0, 6);
    if (!featuredRev.length) featuredRev = U.visibleReviews().slice(0, 3);

    el.innerHTML =
      '<section class="hero" style="' + U.bg(s.heroImage || 'img/hero.svg') + '"><div class="wrap">' +
        '<h1>' + nl(s.heroTitle) + '</h1><p>' + nl(s.heroSub) + '</p>' +
        '<div class="btn-row"><a class="btn btn-warm" href="' + U.telHref(s.phone) + '">' + I.phone + '지금 전화 상담</a>' +
        '<a class="btn btn-line" href="contact.html">' + I.form + '무료 견적 받기</a></div>' +
        '<div class="hero-badges">' + (s.heroBadges || []).map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('') + '</div>' +
      '</div></section>' +

      '<div class="wrap"><div class="situ">' +
        '<a class="urgent" href="' + U.telHref(s.phone) + '"><span class="ic">' + I.clock + '</span><span><strong>급하게 장지를 찾고 있어요</strong><small>지금 바로 전화로 가능한 곳을 안내받으세요</small></span><span class="arr">›</span></a>' +
        '<a class="later" href="#types"><span class="ic">' + I.search + '</span><span><strong>미리 알아보고 있어요</strong><small>장지 유형과 답사 시설을 먼저 둘러보세요</small></span><span class="arr">›</span></a>' +
      '</div></div>' +

      '<section class="sec" id="types"><div class="wrap"><div class="sec-head"><div class="eyebrow">장지 유형</div><h2>어떤 장지를 찾으세요?</h2><p>유형별 특징과 가격, 저희가 답사한 시설을 볼 수 있습니다.</p></div>' +
        '<div class="types">' + U.TYPE_KEYS.map(function (k) {
          var t = U.typeOf(k);
          return '<a class="type-card" href="' + t.path + '"><div class="ph" style="' + U.bg(U.typeImg(k)) + '"></div><div class="bd"><h3>' + esc(t.name) + '</h3><p>' + esc(t.short) + '</p><div class="price">' + esc(t.price) + '</div></div></a>';
        }).join('') + '</div></div></section>' +

      (featuredFac.length ? '<section class="sec sec-alt"><div class="wrap"><div class="sec-head row"><div><div class="eyebrow">답사 시설</div><h2>직접 다녀온 시설</h2></div><a class="more" href="sumokjang.html#list">전체 보기 ›</a></div>' +
        '<div class="hscroll">' + featuredFac.map(U.facCard).join('') + '</div></div></section>' : '') +

      (featuredRev.length ? '<section class="sec"><div class="wrap"><div class="sec-head row"><div><div class="eyebrow">고객 후기</div><h2>함께한 가족들의 이야기</h2></div><a class="more" href="reviews.html">전체 후기 ›</a></div>' +
        '<div class="hscroll">' + featuredRev.map(U.revCard).join('') + '</div></div></section>' : '') +

      '<section class="sec sec-alt"><div class="wrap"><div class="sec-head"><div class="eyebrow">진행 절차</div><h2>상담은 이렇게 진행됩니다</h2></div>' +
        '<ol class="steps">' + (s.steps || []).map(function (st) { return '<li><div><strong>' + esc(st.t) + '</strong><span>' + esc(st.d) + '</span></div></li>'; }).join('') + '</ol></div></section>' +

      '<section class="sec"><div class="wrap"><div class="sec-head"><div class="eyebrow">왜 저희인가요</div><h2>이렇게 약속드립니다</h2></div>' +
        '<div class="why">' + (s.why || []).map(function (w) { return '<div><strong>' + esc(w.t) + '</strong><span>' + esc(w.d) + '</span></div>'; }).join('') + '</div></div></section>' +

      U.finalCta();
  };

  /* ---------- 장지 유형 (수목장·납골당·매장묘) ---------- */
  P.type = function (el) {
    var key = document.body.dataset.type, t = U.typeOf(key);
    setTitle(t.name);
    window.CONTACT_QUERY = '?type=' + key;
    var list = U.visibleFacilities(key);
    var areas = [];
    list.forEach(function (f) { if (f.area && areas.indexOf(f.area) < 0) areas.push(f.area); });
    var revs = U.visibleReviews(key).slice(0, 3);

    el.innerHTML =
      '<section class="ph-head" style="' + U.bg(U.typeImg(key)) + '"><div class="wrap"><div class="crumb">장지 안내</div><h1>' + esc(t.name) + '</h1><p>' + esc(t.short) + '</p></div></section>' +
      '<section class="sec"><div class="wrap"><div class="intro-grid"><div><div class="sec-head"><h2>' + esc(t.name) + ' 알아보기</h2></div><p class="lead">' + nl(t.desc) + '</p></div>' +
        '<div class="price-box"><span class="lb">' + esc(t.name) + ' 평균 가격</span><span class="v">' + esc(t.price) + '</span><small>' + esc(t.priceNote) + '</small>' +
        '<a class="btn btn-primary btn-block mt16" href="contact.html?type=' + key + '">' + I.form + '내 조건으로 견적 받기</a></div></div>' +
        '<div class="pc mt24">' +
          '<div><h3>좋은 점</h3><ul>' + (t.pros || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
          '<div><h3>미리 알아두실 점</h3><ul>' + (t.cons || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
          '<div><h3>이런 분께 추천해요</h3><ul>' + (t.recommend || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '</div></div></section>' +

      '<section class="sec sec-alt" id="list"><div class="wrap"><div class="sec-head"><div class="eyebrow">답사 시설</div><h2>직접 다녀온 ' + esc(t.name) + '</h2><p>사진을 눌러 시설 정보와 답사 메모를 확인하세요.</p></div>' +
        (areas.length > 1 ? '<div class="chips" id="chips"><button class="chip on" data-a="">전체</button>' + areas.map(function (a) { return '<button class="chip" data-a="' + esc(a) + '">' + esc(a) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="fac-grid" id="facs"></div></div></section>' +

      (revs.length ? '<section class="sec"><div class="wrap"><div class="sec-head row"><div><div class="eyebrow">고객 후기</div><h2>' + esc(t.name) + ' 진행 후기</h2></div><a class="more" href="reviews.html?type=' + key + '">더 보기 ›</a></div><div class="rev-grid">' + revs.map(U.revCard).join('') + '</div></div></section>' : '') +

      ((t.faqs || []).length ? '<section class="sec ' + (revs.length ? 'sec-alt' : '') + '"><div class="wrap"><div class="sec-head"><h2>자주 묻는 질문</h2></div>' + U.faqHtml(t.faqs) + '</div></section>' : '') +
      U.finalCta(t.name + ', 어디가 좋을지\n전화로 편하게 물어보세요');

    function draw(area) {
      var l = list.filter(function (f) { return !area || f.area === area; });
      document.getElementById('facs').innerHTML = l.length ? l.map(U.facCard).join('') : '<div class="empty">등록된 시설이 곧 올라옵니다. 지금은 전화로 안내받으세요.</div>';
    }
    draw('');
    var chips = document.getElementById('chips');
    if (chips) chips.onclick = function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c === b); });
      draw(b.dataset.a);
    };
  };

  /* ---------- 이장·파묘 ---------- */
  P.ijang = function (el) {
    var t = U.typeOf('ijang');
    setTitle(t.name);
    window.CONTACT_QUERY = '?type=ijang';
    var revs = U.visibleReviews('ijang').slice(0, 3);
    el.innerHTML =
      '<section class="ph-head" style="' + U.bg(U.typeImg('ijang')) + '"><div class="wrap"><div class="crumb">장지 안내</div><h1>' + esc(t.name) + '</h1><p>' + esc(t.short) + '</p></div></section>' +
      '<section class="sec"><div class="wrap"><div class="intro-grid"><div><div class="sec-head"><h2>이장·파묘, 이렇게 도와드립니다</h2></div><p class="lead">' + nl(t.desc) + '</p>' +
        '<div class="pc mt24" style="grid-template-columns:1fr"><div><h3>이런 경우 상담받으세요</h3><ul>' + (t.reasons || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div></div>' +
        '<div class="price-box"><span class="lb">비용 안내</span><span class="v">' + esc(t.price) + '</span><small>' + esc(t.priceNote) + '</small>' +
        '<a class="btn btn-primary btn-block mt16" href="' + U.telHref(C.site.phone) + '">' + I.phone + '현장 확인 요청하기</a></div></div></div></section>' +
      '<section class="sec sec-alt"><div class="wrap"><div class="sec-head"><div class="eyebrow">진행 절차</div><h2>상담부터 새 장지 안치까지</h2></div>' +
        '<ol class="steps" style="grid-template-columns:none">' + (t.steps || []).map(function (st) { return '<li><div><strong>' + esc(st.t) + '</strong><span>' + esc(st.d) + '</span></div></li>'; }).join('') + '</ol></div></section>' +
      (revs.length ? '<section class="sec"><div class="wrap"><div class="sec-head row"><div><div class="eyebrow">진행 사례</div><h2>이장·파묘 후기</h2></div><a class="more" href="reviews.html?type=ijang">더 보기 ›</a></div><div class="rev-grid">' + revs.map(U.revCard).join('') + '</div></div></section>' : '') +
      ((t.faqs || []).length ? '<section class="sec ' + (revs.length ? 'sec-alt' : '') + '"><div class="wrap"><div class="sec-head"><h2>자주 묻는 질문</h2></div>' + U.faqHtml(t.faqs) + '</div></section>' : '') +
      U.finalCta('묘 이전이 고민되시면\n현장 확인부터 무료로 받아보세요');
  };

  /* ---------- 시설 상세 ---------- */
  P.facility = function (el) {
    var f = U.facility(U.qs('id'));
    if (!f || f.visible === false) { el.innerHTML = '<div class="wrap sec"><div class="empty">시설 정보를 찾을 수 없습니다. <a class="more" href="./">처음으로</a></div></div>'; return; }
    var t = U.typeOf(f.type);
    setTitle(f.name);
    window.CONTACT_QUERY = '?type=' + f.type + '&facility=' + encodeURIComponent(f.id);
    var photos = (f.photos && f.photos.length) ? f.photos : [U.typeImg(f.type)];
    var revs = U.visibleReviews().filter(function (r) { return r.facilityId === f.id; });
    var q = encodeURIComponent(f.address || f.name);
    var rows = [['유형', t.name], ['지역', f.area], ['주소', f.address], ['운영', f.operator], ['가격', f.price]].filter(function (r) { return r[1]; });

    el.innerHTML =
      '<div class="gallery"><div class="track" id="track">' + photos.map(function (p, i) { return '<div role="img" aria-label="' + esc(f.name) + ' 사진 ' + (i + 1) + '" style="' + U.bg(p) + '"></div>'; }).join('') + '</div>' +
        (photos.length > 1 ? '<button class="nav-b prev" aria-label="이전 사진">‹</button><button class="nav-b next" aria-label="다음 사진">›</button><span class="num" id="num">1 / ' + photos.length + '</span>' : '') + '</div>' +
      '<section class="sec" style="padding-top:24px"><div class="wrap"><div class="detail-grid"><div>' +
        '<div class="tags"><a class="tag" href="' + t.path + '">' + esc(t.name) + '</a>' + (f.area ? '<span class="tag warm">' + esc(f.area) + '</span>' : '') + (f.tags || []).map(function (x) { return '<span class="tag">' + esc(x) + '</span>'; }).join('') + U.sampleTag(f) + '</div>' +
        '<h1 style="font-size:26px;margin:10px 0 18px">' + esc(f.name) + '</h1>' +
        '<dl class="info">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
        (f.address ? '<div class="map-links"><a href="https://map.naver.com/p/search/' + q + '" target="_blank" rel="noopener">네이버 지도</a><a href="https://map.kakao.com/?q=' + q + '" target="_blank" rel="noopener">카카오맵</a></div>' : '') +
        (f.comment ? '<div class="comment mt24"><strong>답사 메모</strong>' + esc(f.comment) + '</div>' : '') +
        (revs.length ? '<div class="sec-head mt24" style="margin-top:36px"><h2 style="font-size:21px">이 시설 진행 후기</h2></div><div class="rev-grid">' + revs.map(U.revCard).join('') + '</div>' : '') +
      '</div><div class="sticky-side"><div class="side-cta"><h3>이 시설, 상담받아 보세요</h3><p>자리 현황과 정확한 가격, 현장 동행 답사 일정을 안내해 드립니다.</p>' +
        '<a class="btn btn-primary btn-block" href="' + U.telHref(C.site.phone) + '">' + I.phone + '전화 상담 ' + esc(C.site.phone) + '</a>' +
        '<a class="btn btn-line btn-block" href="contact.html' + window.CONTACT_QUERY + '">' + I.form + '이 시설로 견적 문의</a></div></div></div></div></section>';

    var track = document.getElementById('track'), num = document.getElementById('num');
    if (num) {
      track.addEventListener('scroll', function () { num.textContent = (Math.round(track.scrollLeft / track.clientWidth) + 1) + ' / ' + photos.length; }, { passive: true });
      el.querySelector('.prev').onclick = function () { track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }); };
      el.querySelector('.next').onclick = function () { track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }); };
    }
  };

  /* ---------- 후기 목록 ---------- */
  P.reviews = function (el) {
    setTitle('고객 후기');
    var cur = U.qs('type'), shown = 9;
    el.innerHTML = '<div class="wrap"><div class="plain-head"><h1>고객 후기</h1><p>저희와 함께 장지를 마련한 가족들이 남긴 이야기입니다.</p></div>' +
      '<div class="chips mt16" id="chips"><button class="chip" data-t="">전체</button>' + U.TYPE_KEYS.map(function (k) { return '<button class="chip" data-t="' + k + '">' + esc(U.typeOf(k).name) + '</button>'; }).join('') + '</div>' +
      '<div class="rev-grid" id="list"></div><button class="btn btn-line load-more" id="more">후기 더 보기</button></div>' +
      '<div style="height:48px"></div>' + U.finalCta();
    var chips = document.getElementById('chips'), more = document.getElementById('more');
    function draw() {
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c.dataset.t === cur); });
      var l = U.visibleReviews(cur);
      document.getElementById('list').innerHTML = l.length ? l.slice(0, shown).map(U.revCard).join('') : '<div class="empty">아직 등록된 후기가 없습니다.</div>';
      more.style.display = l.length > shown ? '' : 'none';
    }
    chips.onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; cur = b.dataset.t; shown = 9; draw(); };
    more.onclick = function () { shown += 9; draw(); };
    draw();
  };

  /* ---------- 후기 상세 ---------- */
  P.review = function (el) {
    var r = C.reviews.filter(function (x) { return x.id === U.qs('id'); })[0];
    if (!r || r.visible === false) { el.innerHTML = '<div class="wrap sec"><div class="empty">후기를 찾을 수 없습니다. <a class="more" href="reviews.html">후기 목록</a></div></div>'; return; }
    setTitle(r.title);
    window.CONTACT_QUERY = '?type=' + r.type;
    var t = U.typeOf(r.type), f = U.facility(r.facilityId);
    el.innerHTML = '<div class="wrap" style="max-width:760px;padding-top:24px"><a class="more" href="reviews.html">‹ 후기 목록</a>' +
      '<article class="article mt16"><div class="tags"><span class="tag">' + esc(t.name) + '</span>' + U.sampleTag(r) + '</div>' +
      '<h1 class="mt8">' + esc(r.title) + '</h1><div class="who"><span>' + esc(r.author || '고객') + '님</span><span>' + U.fmtDate(r.date) + '</span></div>' +
      '<div class="body">' + esc(r.body) + '</div>' +
      ((r.photos || []).length ? '<div class="photos">' + r.photos.map(function (p) { return '<img src="' + esc(p) + '" alt="' + esc(r.title) + ' 사진" loading="lazy">'; }).join('') + '</div>' : '') +
      (f && f.visible !== false ? '<a class="linked" href="facility.html?id=' + encodeURIComponent(f.id) + '"><span class="ph" style="' + U.bg(U.facPhoto(f)) + '"></span><span><small>진행 시설</small><strong>' + esc(f.name) + '</strong></span><span class="more" style="margin-left:auto">›</span></a>' : '') +
      '</article></div><div style="height:40px"></div>' + U.finalCta('같은 고민이 있으시다면\n편하게 전화 주세요');
  };

  /* ---------- 단계형 견적·상담 문의 ---------- */
  P.contact = function (el) {
    setTitle('견적·상담 문의');
    var s = C.site;
    var fac = U.facility(U.qs('facility'));
    var st = { type: U.qs('type') || (fac ? fac.type : ''), region: fac ? fac.area : '', when: '', name: '', phone: '', memo: '', facility: fac ? fac.name : '' };
    if (st.type && U.TYPE_KEYS.indexOf(st.type) < 0 && st.type !== 'unsure') st.type = '';
    var step = st.type ? (st.region ? 3 : 2) : 1;
    var TOTAL = 4;
    var WHEN = [['urgent', '급해요 (1주일 이내)', '바로 전화로 연락드립니다'], ['soon', '1~3개월 안에', ''], ['later', '미리 준비하고 있어요', ''], ['unknown', '아직 모르겠어요', '']];

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
    function opt(val, label, sub, on, attr) { return '<button type="button" class="opt' + (on ? ' on' : '') + '" ' + attr + '="' + esc(val) + '"><span>' + esc(label) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></button>'; }

    function draw() {
      var body = '';
      if (step === 1) {
        body = '<h1 class="q">어떤 장지를 찾으세요?</h1><div class="opts">' +
          U.TYPE_KEYS.map(function (k) { return opt(k, U.typeOf(k).name, U.typeOf(k).short, st.type === k, 'data-type'); }).join('') +
          opt('unsure', '아직 잘 모르겠어요', '상담하면서 함께 정해요', st.type === 'unsure', 'data-type') + '</div>';
      } else if (step === 2) {
        body = '<h1 class="q">희망하시는 지역은요?</h1><div class="opts two">' +
          (s.regions || []).map(function (r) { return opt(r, r, '', st.region === r, 'data-region'); }).join('') + opt('상관없음', '상관없어요', '', st.region === '상관없음', 'data-region') + '</div>';
      } else if (step === 3) {
        body = '<h1 class="q">언제까지 필요하세요?</h1><div class="opts">' + WHEN.map(function (w) { return opt(w[0], w[1], w[2], st.when === w[0], 'data-when'); }).join('') + '</div>';
      } else {
        body = '<h1 class="q">연락받으실 정보를 남겨 주세요</h1>' +
          '<div class="field"><label for="f-name">이름 <em>*</em></label><input id="f-name" autocomplete="name" value="' + esc(st.name) + '" placeholder="홍길동"></div>' +
          '<div class="field"><label for="f-phone">휴대폰 번호 <em>*</em></label><input id="f-phone" type="tel" inputmode="tel" autocomplete="tel" value="' + esc(st.phone) + '" placeholder="010-0000-0000"></div>' +
          '<div class="field"><label for="f-memo">궁금하신 점 (선택)</label><textarea id="f-memo" placeholder="예산, 모실 분 수, 원하시는 조건 등을 적어 주세요">' + esc(st.memo) + '</textarea></div>' +
          '<label class="agree"><input type="checkbox" id="f-agree"><span>상담을 위한 개인정보(이름, 연락처, 문의 내용) 수집·이용에 동의합니다. 상담 완료 후 1년간 보관 후 파기합니다. <a href="privacy.html" target="_blank">자세히 보기</a></span></label>' +
          '<button class="btn btn-primary btn-block" id="send">' + I.check + '무료 상담 신청하기</button><div class="err" id="err"></div>';
      }
      el.innerHTML = '<div class="wrap form-wrap" style="padding-top:24px;padding-bottom:40px">' +
        '<div class="step-n">' + step + ' / ' + TOTAL + ' 단계</div><div class="progress"><i style="width:' + (step / TOTAL * 100) + '%"></i></div>' +
        picked() + body +
        (step > 1 ? '<div class="form-nav"><button class="btn btn-line back" id="back">이전</button></div>' : '') +
        '<div class="call-box"><small>입력이 번거로우시면</small><a class="tel" href="' + U.telHref(s.phone) + '">' + esc(s.phone) + '</a><small>' + esc(s.hours) + '</small></div></div>';

      el.querySelectorAll('[data-type]').forEach(function (b) { b.onclick = function () { st.type = b.dataset.type; step = 2; draw(); }; });
      el.querySelectorAll('[data-region]').forEach(function (b) { b.onclick = function () { st.region = b.dataset.region; step = 3; draw(); }; });
      el.querySelectorAll('[data-when]').forEach(function (b) { b.onclick = function () { st.when = b.dataset.when; step = 4; draw(); }; });
      var back = document.getElementById('back'); if (back) back.onclick = function () { keep(); step--; draw(); };
      var send = document.getElementById('send'); if (send) send.onclick = submit;
      window.scrollTo(0, 0);
    }
    function keep() {
      var n = document.getElementById('f-name'); if (!n) return;
      st.name = n.value.trim(); st.phone = document.getElementById('f-phone').value.trim(); st.memo = document.getElementById('f-memo').value.trim();
    }
    function submit() {
      keep();
      var err = document.getElementById('err'), btn = document.getElementById('send');
      var digits = st.phone.replace(/[^0-9]/g, '');
      if (!st.name) { err.textContent = '이름을 입력해 주세요.'; return; }
      if (digits.length < 9) { err.textContent = '연락 가능한 번호를 정확히 입력해 주세요.'; return; }
      if (!document.getElementById('f-agree').checked) { err.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }
      btn.disabled = true; btn.textContent = '보내는 중…'; err.textContent = '';
      var rec = { type: typeName(st.type), region: st.region, when: whenName(st.when), name: st.name, phone: st.phone, memo: st.memo, facility: st.facility, page: document.referrer ? document.referrer.replace(location.origin, '') : '' };
      U.sendInquiry(rec).then(function (res) {
        if (!res || !res.ok) throw new Error((res && res.message) || '접수 실패');
        done(rec);
      }).catch(function (e) {
        btn.disabled = false; btn.innerHTML = I.check + '무료 상담 신청하기';
        err.innerHTML = '접수 중 문제가 생겼습니다. ' + esc(e.message && e.message !== 'Failed to fetch' ? e.message : '') + ' 번거로우시겠지만 <a href="' + U.telHref(s.phone) + '"><b>' + esc(s.phone) + '</b></a> 로 전화 주세요.';
      });
    }
    function done(rec) {
      el.innerHTML = '<div class="wrap form-wrap done"><div class="ok">' + I.check + '</div><h1>상담 신청이 접수되었습니다</h1>' +
        '<p>' + esc(rec.name) + '님, 담당자가 확인 후 <b>' + esc(rec.phone) + '</b> 으로 연락드리겠습니다.' + (st.when === 'urgent' ? '<br>급하신 경우 바로 전화 주시면 더 빠르게 안내해 드립니다.' : '') + '</p>' +
        '<a class="btn btn-primary btn-block" href="' + U.telHref(s.phone) + '">' + I.phone + '바로 전화하기 ' + esc(s.phone) + '</a>' +
        '<a class="btn btn-line btn-block mt8" href="./">처음으로</a></div>';
      window.scrollTo(0, 0);
    }
    draw();
  };

  /* ---------- 개인정보 처리방침 ---------- */
  P.privacy = function (el) {
    setTitle('개인정보 처리방침');
    var s = C.site;
    el.innerHTML = '<div class="wrap prose" style="max-width:760px;padding:32px 16px 48px"><h1 style="font-size:26px">개인정보 처리방침</h1>' +
      '<p class="mt16">' + esc(s.bizName) + '(이하 "회사")는 상담 신청 과정에서 받는 개인정보를 아래와 같이 처리합니다.</p>' +
      '<h2>1. 수집 항목</h2><p>이름, 휴대폰 번호, 문의 내용(장지 유형, 희망 지역, 시기, 요청 사항)</p>' +
      '<h2>2. 수집·이용 목적</h2><p>장지 분양 및 이장·파묘 상담, 견적 안내, 상담 진행을 위한 연락</p>' +
      '<h2>3. 보유 및 이용 기간</h2><p>상담 완료 후 1년간 보관하며, 기간이 지나면 지체 없이 파기합니다. 계약이 이루어진 경우 관련 법령에서 정한 기간 동안 보관합니다.</p>' +
      '<h2>4. 제3자 제공</h2><p>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 상담 진행을 위해 이용자가 선택한 장지 시설에 연락처를 전달할 필요가 있는 경우, 사전에 동의를 받습니다.</p>' +
      '<h2>5. 동의를 거부할 권리</h2><p>개인정보 수집·이용에 동의하지 않을 수 있으며, 이 경우 온라인 상담 신청은 할 수 없습니다. 전화 상담은 언제든 가능합니다.</p>' +
      '<h2>6. 이용자의 권리</h2><p>이용자는 언제든 자신의 개인정보 열람, 정정, 삭제를 요청할 수 있습니다. 아래 연락처로 요청해 주세요.</p>' +
      '<h2>7. 개인정보 보호책임자</h2><p>' + esc(s.ceo) + ' (대표) · ' + esc(s.phone) + (s.email ? ' · ' + esc(s.email) : '') + '</p>' +
      '<p class="mt24">시행일: 2026년 10월 14일</p></div>';
  };

  window.PAGES = P;
})();
