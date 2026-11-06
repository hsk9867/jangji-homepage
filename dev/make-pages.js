// 페이지 HTML 생성기: node dev/make-pages.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = '배웅 | 장지 안심 동행 서비스';
const VER = '20261106h';  // 캐시 쿼리 (css·js 바꾸면 올려 주세요)
const pages = [
  ['index.html', 'home', '', SITE, '수목장·봉안당(납골당)·공원묘지 분양 상담부터 파묘·이장까지. 배웅이 직접 답사한 시설만 안내하고, 주말에도 무료로 동행 답사합니다. 070-7621-4444'],
  ['sumokjang.html', 'type', 'sumok', '수목장 | 배웅', '경기도 수목장 평균 가격과 특징, 배웅이 직접 답사한 수목장 사진과 후기.'],
  ['napgoldang.html', 'type', 'napgol', '봉안당(납골당) | 배웅', '경기도 봉안당·납골당 평균 가격과 특징, 배웅이 직접 답사한 봉안시설 사진과 후기.'],
  ['maejang.html', 'type', 'maejang', '공원묘지·매장묘 | 배웅', '경기도 공원묘지·매장묘·가족 봉안묘 정보, 배웅이 직접 답사한 공원묘원 사진과 후기.'],
  ['ijang.html', 'ijang', '', '파묘·이장 안내 | 배웅', '파묘·이장·개장의 개념과 시기, 7단계 절차, 체크포인트를 정리하고 개장 신고부터 화장장 예약, 봉안까지 배웅이 함께합니다.'],
  ['facilities.html', 'facilities', '', '답사 시설 | 배웅', '배웅이 직접 답사한 경기도 수목장·봉안당·공원묘지 목록.'],
  ['facility.html', 'facility', '', '답사 시설 | 배웅', '배웅이 직접 답사한 장지 시설 정보와 사진.'],
  ['reviews.html', 'reviews', '', '상담 후기 | 배웅', '배웅과 함께 상담·동행 답사한 가족의 이야기.'],
  ['review.html', 'review', '', '상담·답사 후기 | 배웅', '배웅 상담·답사 후기.'],
  ['contact.html', 'contact', '', '상담 신청 | 배웅', '수목장 분양·봉안당·매장묘·파묘 이장·화장장 예약·장례지원금 무료 상담 신청.'],
  ['search.html', 'search', '', '장지 찾기·비교 | 배웅', '직접 답사한 수목장·봉안당·매장묘를 지역과 특징으로 찾고 최대 3곳까지 비교합니다.'],
  ['crematorium.html', 'crematorium', '', '화장장 예약 안내 | 배웅', '전국 화장시설을 지역별로 찾고 e하늘 장사정보시스템에서 바로 예약합니다.'],
  ['services.html', 'services', '', '서비스 안내 | 배웅', '수목장·봉안당·매장묘·파묘·화장장 예약·장례지원금. 배웅이 어떤 일을 어떻게 도와드리는지 먼저 보고 고르십시오.'],
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
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600&display=swap">
<link rel="stylesheet" href="css/style.css?v=${VER}">
<script src="js/blog-content.js?v=${VER}"></script>
<script src="js/defaults.js?v=${VER}"></script>
<script>document.write('<script src="data/content.js?t=' + Date.now() + '"><${BS}/script>');</script>
<script src="js/preview.js"></script>
<script src="js/common.js?v=${VER}"></script>
<script src="js/pages.js?v=${VER}"></script>
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
