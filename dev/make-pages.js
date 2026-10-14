// 페이지 HTML 생성기: node dev/make-pages.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = '배웅 | 장지 안심 동행 서비스';
const pages = [
  ['index.html', 'home', '', SITE, '수목장·봉안당(납골당)·공원묘지 분양 상담부터 파묘·이장까지. 배웅이 직접 답사한 시설만 안내하고, 주말에도 무료로 동행 답사합니다. 070-7621-4444'],
  ['sumokjang.html', 'type', 'sumok', '수목장 | 배웅', '경기도 수목장 평균 가격과 특징, 배웅이 직접 답사한 수목장 사진과 후기.'],
  ['napgoldang.html', 'type', 'napgol', '봉안당(납골당) | 배웅', '경기도 봉안당·납골당 평균 가격과 특징, 배웅이 직접 답사한 봉안시설 사진과 후기.'],
  ['maejang.html', 'type', 'maejang', '공원묘지·매장묘 | 배웅', '경기도 공원묘지·매장묘·가족 봉안묘 정보, 배웅이 직접 답사한 공원묘원 사진과 후기.'],
  ['ijang.html', 'ijang', '', '이장·파묘 | 배웅', '파묘·이장 절차와 비용 구성. 개장 신고부터 새 장지 안치까지 배웅이 대행합니다.'],
  ['facilities.html', 'facilities', '', '답사 시설 | 배웅', '배웅이 직접 답사한 경기도 수목장·봉안당·공원묘지 목록.'],
  ['facility.html', 'facility', '', '답사 시설 | 배웅', '배웅이 직접 답사한 장지 시설 정보와 사진.'],
  ['reviews.html', 'reviews', '', '상담·답사 후기 | 배웅', '배웅 상담팀이 가족과 함께 다녀온 장지 상담·답사 후기.'],
  ['review.html', 'review', '', '상담·답사 후기 | 배웅', '배웅 상담·답사 후기.'],
  ['contact.html', 'contact', '', '견적·상담 신청 | 배웅', '수목장·봉안당·공원묘지·이장 무료 견적 및 상담 신청.'],
  ['privacy.html', 'privacy', '', '개인정보 처리방침 | 배웅', '배웅 개인정보 처리방침.']
];
const BS = String.fromCharCode(92);
for (const [file, page, type, title, desc] of pages) {
  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>-</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="배웅">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="https://hsk9867.github.io/jangji-homepage/img/og.png">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="img/logo-mark.png" type="image/png">
<link rel="apple-touch-icon" href="img/logo-mark.png">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sunn-us/SUIT@2/fonts/variable/woff2/SUIT-Variable.css">
<link rel="stylesheet" href="css/style.css">
<script src="js/blog-content.js"></script>
<script src="js/defaults.js"></script>
<script>document.write('<script src="data/content.js?t=' + Date.now() + '"><${BS}/script>');</script>
<script src="js/preview.js"></script>
<script src="js/common.js"></script>
<script src="js/pages.js"></script>
</head>
<body data-page="${page}"${type ? ` data-type="${type}"` : ''}>
<main id="app"></main>
<noscript><p style="padding:24px">이 사이트는 자바스크립트가 필요합니다. 070-7621-4444 로 전화 주세요.</p></noscript>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, file), html);
}
console.log('pages:', pages.length);
