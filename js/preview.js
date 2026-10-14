/* 관리자 '미리보기': 저장하기 전 초안을 이 탭에서만 보여 줍니다 (?preview=1 로 열면 그 탭에서 계속 유지). */
(function () {
  try {
    if (/[?&]preview=1/.test(location.search)) sessionStorage.setItem('jangji_preview_on', '1');
    if (sessionStorage.getItem('jangji_preview_on') === '1') {
      var d = JSON.parse(localStorage.getItem('jangji_preview') || 'null');
      if (d) { window.SITE_CONTENT = d; window.PREVIEW_MODE = true; }
    }
  } catch (e) { /* 저장소를 못 쓰면 미리보기 없이 진행 */ }
})();
