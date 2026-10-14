// 블로그 자료 → 홈페이지 기본 콘텐츠(js/blog-content.js) + 사진(img/fac, img/rev, img/art)
const fs = require('fs');
const path = require('path');
const https = require('https');
const P = require('./parsed.json');
const R = require('./fac-raw.json');
const PICK = require('./pick.json');
const POSTS = require('./posts.json');
const OUT = path.join(process.env.USERPROFILE || process.env.HOME, 'jangji-homepage');
const BLOG = n => 'https://blog.naver.com/baewoong0816/' + n;

function dl(url, file) {
  if (fs.existsSync(file) && fs.statSync(file).size > 1000) return Promise.resolve();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return new Promise((ok, no) => https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    if (res.statusCode !== 200) { res.resume(); return no(new Error(res.statusCode + ' ' + url)); }
    const w = fs.createWriteStream(file); res.pipe(w); w.on('finish', ok);
  }).on('error', no));
}
const BAD = /배웅|썸네일|당근|보조금|문의|카드뉴스|대표이미지|스크린샷|템플릿|지원금|배너|로고/;
function photoish(u) {
  if (u.includes('.PNG/') || u.includes('.GIF/')) return false;
  const f = decodeURIComponent(u.split('/').pop());
  return !BAD.test(f) && !/^\d{3,4}_[^.]+\.(jpg|jpeg)$/i.test(f);
}

/* ---------- 시설 ---------- */
const FAC = {
  muryang: { area: '경기 남양주', address: '경기도 남양주시 수동면 비룡로 864-1', operator: '사설 (무량사 인근)', tags: ['사찰 인근', '파묘·이장 후 안치'], photos: [0, 8, 2, 3, 1, 7], comment: '남양주 수동면 무량사 인근에 있는 수목장입니다. 능선을 따라 조성된 수목 구역에서 산 전망이 넓게 트여 있고, 파묘·이장 후 새로 모실 곳을 찾는 가족이 많이 찾습니다. 서울 동북부와 구리·남양주에서 오가기 편합니다.' },
  yangji: { area: '경기 용인', address: '경기도 용인시 처인구 백암면 박곡로208번길 24', operator: '사찰 운영 (불광사)', tags: ['사찰 수목장', '사찰 직접 관리'], photos: [4, 1, 2, 0, 6, 8], comment: '불광사 경내에 자리한 수목장으로, 사찰에서 직접 관리하고 운영합니다. 자연과 사찰의 차분한 분위기를 함께 느낄 수 있어 불교식 추모를 원하는 가족이 많이 찾습니다. 수원·분당·이천·안성에서 오가기 좋습니다.' },
  cheongsol: { area: '경기 김포', address: '경기도 김포시 월곶면 애기봉로409번길 82-11', operator: '자연장지', tags: ['가족목 가능', '정돈된 산책로'], photos: [5, 0, 1, 3, 7, 8], comment: '김포 월곶면에 위치한 자연장지입니다. 산책로를 따라 수목이 고르게 정돈되어 있어 가족이 함께 걸으며 추모하기 좋습니다. 서울 서부·인천·김포 생활권 가족에게 알맞습니다.' },
  gonggam: { area: '경기 고양(일산)', address: '경기도 고양시 일산동구 지영로194번길 132', operator: '사설', tags: ['일산 생활권', '단정한 수목 구역'], photos: [8, 0, 1, 4, 5, 7], comment: '일산동구 지영로에 있는 수목장입니다. 계단식으로 정리된 수목 구역과 탁 트인 전망이 특징이며, 일산·파주·서울 서북부에서 가깝습니다. 희망하는 구성과 추가 안치 조건을 현장에서 함께 확인해 드립니다.' },
  jayeonae: { area: '경기 고양(일산)', address: '경기도 고양시 일산동구 지영로194번길 135', operator: '일산 메모리얼파크', tags: ['수목장·봉안당 함께', '일산 생활권'], photos: [7, 4, 0, 5, 8, 2], comment: "'일산 메모리얼파크 자연애숲'으로도 알려진 곳입니다. 숲길을 따라 수목장 구역이 이어지고, 실내 봉안 공간도 함께 운영합니다. 공감수목장과 가까워 같은 날 두 곳을 비교 답사하는 가족이 많습니다." },
  naraewon: { area: '경기 화성', address: '경기도 화성시 팔탄면 온천로 280-6', operator: '사설', tags: ['개인목·부부목·가족목', '수원 인근'], photos: [3, 0, 1, 4, 7, 8], comment: '화성 팔탄면 덕천리에 자리한 사설 수목장입니다. 숲과 나무가 어우러진 분위기로 조성되어 있고, 개인목·부부목·가족목 가운데 가족 상황에 맞게 고를 수 있습니다. 수원·화성·오산에서 가깝습니다.' },
  galwolsa: { area: '경기 양평', address: '경기도 양평군 양평읍', operator: '재단법인 갈월사', tags: ['사찰 수목장', '조용한 환경'], photos: [1, 0, 2, 4, 7, 8], comment: '재단법인 갈월사가 운영하는 수목장입니다. 사찰 부지의 차분한 분위기 덕분에 조용한 환경에서 추모하고 싶은 가족에게 잘 어울리며, 서울 근교에서 방문 계획을 세우기 편합니다.' },
  geumodongji: { area: '경기 용인', address: '경기도 용인시 처인구 원삼면 문촌리 일대', operator: '사설', tags: ['넓은 수목 구역', '서울 접근성'], photos: [3, 0, 1, 4, 6, 8], comment: '용인 처인구 원삼면에 있는 수목장입니다. 넓게 펼쳐진 수목 구역이 특징이며, 구역에 따라 계단·경사·휴식 공간 위치가 다르니 실제 고려 중인 자리를 기준으로 함께 확인해 드립니다.' },
  seohyeon: { area: '경기 파주', address: '경기도 파주시 광탄면 명봉산로 277', operator: '실내 봉안시설', tags: ['실내 봉안당', '예배 공간'], photos: [1, 4, 3, 0, 5, 2], comment: '파주 광탄면에 위치한 실내 봉안시설입니다. 계절과 날씨에 관계없이 참배할 수 있고, 별도의 예배·추모 공간이 마련되어 있습니다. 경기 서북부와 서울 서북권 가족이 많이 비교하는 곳입니다.' },
  bundanghue: { area: '경기 광주(분당권)', address: '경기도 광주시 오포읍 오포로 211-49', operator: '사설', tags: ['분당 접근성', '서재형 인테리어'], photos: [4, 0, 5, 6, 2, 1], comment: '경기 광주 오포읍에 있는 봉안당으로, 분당권에서 차로 오가기 편합니다. 따뜻한 목재 톤의 서재형 실내와 안정적인 관리 상태로 상담 때 자주 함께 안내해 드리는 곳입니다.' },
  haneulan: { area: '경기 양주', address: '경기도 양주시', operator: '사설', tags: ['경기 북부', '밝은 실내'], photos: [2, 0, 3, 4, 6, 1], comment: '경기 북부 양주에 위치한 봉안시설입니다. 밝고 넓은 실내 복도와 안치 공간이 특징입니다. 안치 형태와 이용 기간, 관리비는 상담 때 최신 자료로 함께 확인해 드립니다.' },
  thecrest: { area: '경기 포천', address: '경기도 포천시 내촌면 부마로 341-1', operator: '광릉추모공원', tags: ['갤러리 봉안당', '상담 라운지'], photos: [0, 1, 2, 6, 8, 4], comment: '광릉추모공원의 봉안당으로, 예술가들과 협업한 작품이 함께 놓인 갤러리 봉안당입니다. 2층 해연과 4층 상빈재에 봉안실이 있고, 1층에는 가족이 머물 수 있는 상담 라운지가 마련되어 있습니다.' },
  eden: { area: '경기 남양주', address: '경기도 남양주시 화도읍 수레로964번길 113-13', operator: '사설', tags: ['전통 봉안당', '남양주·구리권'], photos: [3, 0, 2, 4, 7, 8], comment: '남양주 화도읍에 있는 봉안당입니다. 희망하는 안치 공간을 기준으로 비용과 관리비를 서면으로 비교해 드리며, 명절 연휴 이용 규칙도 미리 안내해 드립니다.' },
  honorstone: { area: '경기 용인', address: '경기도 용인시 처인구 모현읍 새래로 158-33', operator: '사설 (용인공원 아너스톤)', tags: ['대형 주차장', '유족대기실'], photos: [4, 0, 2, 3, 6, 8], comment: '정식 명칭은 용인공원 아너스톤입니다. 2,400여 평 규모에 25,000위 이상을 모실 수 있고, 2,000대 규모 주차장과 매점, 유족대기실, 장애인 시설을 갖추고 있습니다.' },
  haneulmun: { area: '경기 고양(일산)', address: '경기도 고양시 덕양구 보광로106번길 46', operator: '실내 봉안시설', tags: ['실내 봉안당', '일산·고양권'], photos: [2, 0, 3, 4, 7, 8], comment: '고양 덕양구에 있는 실내 봉안시설로, 계절과 날씨 영향을 적게 받습니다. 사진만 보고 정하기보다 실제 안치단 앞에 서서 높이와 분위기를 확인해 보시길 권합니다.' },
  obongjeongsa: { area: '경기 의왕', address: '경기도 의왕시 고천동 일대', operator: '사찰 봉안시설', tags: ['사찰 봉안당', '의왕·안양권'], photos: [2, 0, 1, 6, 7], comment: '의왕 고천동 일대의 사찰 안에 마련된 봉안시설입니다. 사전 답사로 안치 공간과 이동 경로를 확인했으며, 불교식 추모를 원하는 가족에게 알맞습니다.' },
  namseoul: { area: '경기 광주(곤지암)', address: '경기도 광주시 곤지암읍 가마을길 83-19', operator: '기독교 법인', tags: ['기독교 봉안당', '수목장 함께 운영'], photos: [0, 1, 2, 3, 7, 8], comment: '기독교 법인이 운영하는 추모시설로, 실내 납골당과 수목장을 함께 운영합니다. 분당뿐 아니라 강남에서도 비교적 가까워 성남·분당 가족이 함께 검토하는 곳입니다.' },
  bundanghome: { area: '경기 성남(분당)', address: '경기도 성남시 분당구 (영장산 자락)', operator: '사설', tags: ['도서관형 봉안당', '분당권'], photos: [0, 1, 2, 4, 5, 7], comment: '공간 전체가 서재나 도서관처럼 꾸며져 편안한 분위기를 주는 분당의 봉안당입니다. 영장산 자락에 자리하고 있으며, 특허받은 봉안 시스템을 운영합니다.' },
  mugunghwa: { area: '경기 양평', address: '경기도 양평군 서종면', operator: '공원묘원', tags: ['잔디장·수목장·봉안담', '가족묘'], photos: [0, 1, 6, 7, 2, 8], comment: '양평에 있는 공원묘원으로 잔디장, 개인목·부부목·가족목 수목장, 야외 봉안담까지 한곳에서 고를 수 있습니다. 장묘 형태별 비용과 관리비를 한 장으로 정리해 비교해 드립니다.' },
  sinsegye: { area: '경기 양주', address: '경기도 양주시 장흥면 권율로29번길 170', operator: '공원묘원 (1971년 설립)', tags: ['50년 운영', '가족묘'], photos: [3, 4, 2], comment: '1971년 설립되어 50년 넘게 운영 중인 약 54,000평 규모의 공원묘원입니다. 서울에서 30분 남짓 거리로, 가족묘·매장묘를 찾는 가족이 많이 비교하는 곳입니다.' },
  jahayeon: { area: '경기 고양(일산)', address: '경기도 고양시 일산동구 지영로 36-87', operator: '공원묘원', tags: ['매장묘·봉안묘·평장', '일산 유일 공원묘원'], photos: [0, 6, 7, 8, 1, 3], comment: '일산 지역의 유일한 공원묘원입니다. 전통 매장묘부터 가족 단위 봉안묘, 봉안담, 평장, 자연장까지 선택할 수 있어 가족 구성에 맞춰 비교하기 좋습니다.' },
  nakwon: { area: '경기 파주', address: '경기도 파주시 송화로 일대', operator: '재단법인 (1972년)', tags: ['오랜 운영', '파주·고양권'], photos: [2, 3, 7, 4, 5], comment: '1970년 파주 금촌 야동동에 조성된 공원묘지로, 1972년 재단법인을 설립해 지금까지 운영하고 있습니다. 파주·고양·일산 생활권 가족에게 알맞습니다.' }
};

/* ---------- 상담·답사 후기 (블로그 글) ---------- */
const REV = [
  { logNo: 224431109629, type: 'napgol', facilityId: 'honorstone' },
  { logNo: 224423919482, type: 'sumok', facilityId: 'naraewon' },
  { logNo: 224397789066, type: 'maejang', facilityId: 'jahayeon' },
  { logNo: 224395482038, type: 'napgol', facilityId: 'namseoul' },
  { logNo: 224383776090, type: 'napgol', facilityId: 'haneulan' },
  { logNo: 224411743930, type: 'sumok', facilityId: 'galwolsa' },
  { logNo: 224373334065, type: 'sumok', facilityId: 'yangji' },
  { logNo: 224370709163, type: 'sumok', facilityId: 'geumodongji' },
  { logNo: 224363967758, type: 'napgol', facilityId: 'seohyeon' },
  { logNo: 224359282787, type: 'napgol', facilityId: 'bundanghome' },
  { logNo: 224438264593, type: 'ijang', facilityId: 'muryang' },
  { logNo: 224247837400, type: 'ijang', facilityId: '' }
];
const SKIP = /지원금|클릭|바로가기|naver\.me|blog\.naver|배웅입니다|대표번호|주식회사|상담 및 문의|계약대행|토탈컨설팅|👇|이미지를/;

function excerpt(text) {
  const lines = text.split('\n').map(s => s.trim()).filter(s => s.length > 40 && !SKIP.test(s));
  let out = '';
  for (const l of lines) { if ((out + l).length > 520) break; out += (out ? '\n\n' : '') + l; if (out.length > 380) break; }
  return out;
}

(async () => {
  const facilities = [];
  for (const f of R) {
    const meta = FAC[f.id]; if (!meta) continue;
    const photos = [];
    for (const i of meta.photos) {
      const u = PICK[f.id][i]; if (!u) continue;
      const rel = 'img/fac/' + f.id + '-' + (photos.length + 1) + '.jpg';
      await dl(u + '?type=w773', path.join(OUT, rel)); photos.push(rel);
    }
    facilities.push({ id: f.id, type: f.type, name: f.name, area: meta.area, address: meta.address, operator: meta.operator, price: '상담 시 안내', tags: meta.tags, comment: meta.comment, photos, blogUrl: BLOG(f.posts[0].logNo), featured: true, visible: true });
    process.stdout.write('.');
  }
  console.log(' facilities', facilities.length);

  const reviews = [];
  for (const r of REV) {
    const p = P.find(x => x.logNo === r.logNo); if (!p) { console.log('missing', r.logNo); continue; }
    const imgs = p.imgs.filter(photoish).slice(1, 4);
    const photos = [];
    for (const u of imgs) { const rel = 'img/rev/' + r.logNo + '-' + (photos.length + 1) + '.jpg'; await dl(u + '?type=w773', path.join(OUT, rel)); photos.push(rel); }
    const d = new Date(p.date);
    reviews.push({ id: 'b' + r.logNo, type: r.type, title: p.title, author: '배웅 상담팀', date: d.toISOString().slice(0, 10), facilityId: r.facilityId, body: excerpt(p.text), photos, blogUrl: BLOG(r.logNo), featured: true, visible: true });
    process.stdout.write('.');
  }
  console.log(' reviews', reviews.length);

  const arts = POSTS.filter(p => p.cat === 12 && p.date > Date.parse('2026-01-01')).sort((a, b) => b.date - a.date).slice(0, 6);
  const articles = [];
  for (const a of arts) {
    let img = '';
    if (a.thumb) { img = 'img/art/' + a.logNo + '.jpg'; try { await dl(a.thumb.split('?')[0] + '?type=w580', path.join(OUT, img)); } catch (e) { img = ''; } }
    articles.push({ title: a.title, url: BLOG(a.logNo), image: img, date: new Date(a.date).toISOString().slice(0, 10) });
  }
  console.log('articles', articles.length);

  const js = '/* 배웅 블로그(blog.naver.com/baewoong0816)에서 가져온 기본 시설·후기·장례정보. 관리자에서 저장하면 data/content.js 가 우선합니다. */\n' +
    'window.BLOG_CONTENT = ' + JSON.stringify({ facilities, reviews, articles }, null, 1) + ';\n';
  fs.writeFileSync(path.join(OUT, 'js', 'blog-content.js'), js);
  console.log('wrote js/blog-content.js', js.length);
})().catch(e => { console.error(e); process.exit(1); });
