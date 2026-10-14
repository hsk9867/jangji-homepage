// 시설 후보별로 관련 글, 주소, 사진 후보, 설명 문장을 모아 fac-raw.json 으로 저장
const fs = require('fs');
const P = require('./parsed.json');
const F = [
  // 수목장
  { id: 'muryang', type: 'sumok', name: '남양주 무량수목장', keys: ['무량수목장', '무량 수목장'] },
  { id: 'yangji', type: 'sumok', name: '용인 양지수목장 (불광사)', keys: ['양지수목장', '불광사'] },
  { id: 'cheongsol', type: 'sumok', name: '김포 청솔수목장', keys: ['청솔수목장', '청솔 수목장'] },
  { id: 'gonggam', type: 'sumok', name: '일산 공감수목장', keys: ['공감수목장', '공감 수목장'] },
  { id: 'jayeonae', type: 'sumok', name: '자연애숲수목장', keys: ['자연애숲', '자연애수목장', '자연애 수목장'] },
  { id: 'naraewon', type: 'sumok', name: '화성 나래원수목장', keys: ['나래원'] },
  { id: 'galwolsa', type: 'sumok', name: '양평 갈월사수목장', keys: ['갈월사'] },
  { id: 'geumodongji', type: 'sumok', name: '용인 금오동지수목장', keys: ['금오동지'] },
  // 봉안당
  { id: 'seohyeon', type: 'napgol', name: '파주 서현추모공원', keys: ['서현추모공원', '서현 추모공원'] },
  { id: 'bundanghue', type: 'napgol', name: '분당추모공원 휴', keys: ['분당추모공원', '분당 휴', '휴 봉안당', '분당휴'] },
  { id: 'haneulan', type: 'napgol', name: '양주 하늘안추모공원', keys: ['하늘안'] },
  { id: 'thecrest', type: 'napgol', name: '포천 광릉 더크레스트', keys: ['더크레스트', '더 크레스트'] },
  { id: 'eden', type: 'napgol', name: '남양주 에덴추모공원', keys: ['에덴추모공원', '에덴 추모공원'] },
  { id: 'honorstone', type: 'napgol', name: '용인 아너스톤', keys: ['아너스톤'] },
  { id: 'haneulmun', type: 'napgol', name: '일산 하늘문추모공원', keys: ['하늘문'] },
  { id: 'obongjeongsa', type: 'napgol', name: '오봉정사', keys: ['오봉정사'] },
  { id: 'namseoul', type: 'napgol', name: '성남 남서울가족공원', keys: ['남서울가족공원', '남서울 가족공원'] },
  { id: 'bundanghome', type: 'napgol', name: '분당홈', keys: ['분당홈'] },
  // 매장묘
  { id: 'mugunghwa', type: 'maejang', name: '무궁화공원묘원', keys: ['무궁화공원묘원', '무궁화 공원묘원'] },
  { id: 'sinsegye', type: 'maejang', name: '신세계공원묘지', keys: ['신세계공원묘지', '신세계 공원묘지'] },
  { id: 'jahayeon', type: 'maejang', name: '일산 자하연', keys: ['자하연'] },
  { id: 'nakwon', type: 'maejang', name: '낙원공원묘원', keys: ['낙원공원'] },
  { id: 'hannam', type: 'maejang', name: '한남공원묘원', keys: ['한남공원'] },
  { id: 'mokryeon', type: 'maejang', name: '목련공원묘지', keys: ['목련공원'] }
];
const BAD = /배웅|썸네일|당근|보조금|문의|카드뉴스|대표이미지|스크린샷|템플릿|지원금|배너|로고/;
function photoish(u) {
  if (u.includes('.PNG/') || u.includes('.GIF/')) return false;
  const f = decodeURIComponent(u.split('/').pop());
  if (BAD.test(f)) return false;
  if (/^\d{3,4}_[^.]+\.(jpg|jpeg)$/i.test(f)) return false; // 제목 카드
  return true;
}
const out = [];
for (const f of F) {
  const posts = P.filter(p => f.keys.some(k => p.title.includes(k))).sort((a, b) => b.date - a.date);
  const texts = posts.map(p => p.text).join('\n');
  const addrs = [];
  const re = /주소[는은:]?\s*((?:경기도|경기|서울특별시|서울|인천광역시|인천|강원특별자치도|강원도|강원)\s[^\n.,)]{4,40}?)(?:입니다|이며|이고|이에요|예요|\s*\(|\.|,|\n)/g;
  let m; while ((m = re.exec(texts))) { const a = m[1].trim(); if (!addrs.includes(a)) addrs.push(a); }
  const imgs = [];
  posts.forEach(p => p.imgs.filter(photoish).forEach(u => imgs.push({ u, logNo: p.logNo })));
  const sents = [];
  posts.slice(0, 3).forEach(p => p.text.split(/(?<=[.다요])\s+|\n/).forEach(s => { s = s.trim(); if (s.length > 25 && s.length < 160 && f.keys.some(k => s.includes(k.replace(/\s/g, '')) || s.includes(k)) && !/지원금|배웅|클릭|바로가기/.test(s) && sents.length < 8) sents.push(s); }));
  out.push({ ...f, posts: posts.map(p => ({ logNo: p.logNo, title: p.title, date: p.date })), addrs, imgs, sents });
  console.log(`${f.id.padEnd(13)} posts=${String(posts.length).padStart(2)} imgs=${String(imgs.length).padStart(3)} addr=${addrs.slice(0, 2).join(' / ')}`);
}
fs.writeFileSync('fac-raw.json', JSON.stringify(out, null, 1));
