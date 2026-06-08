/* ============================================
   sticky-cards.js — 옆 떠있는 카드 스크롤 연동 (index.html)
   ============================================
   왼쪽 컬럼(.att-left-col)과 오른쪽 컬럼(.wt-right-col)을
   "완전히 똑같은 top 픽셀값"으로 — 항상 같은 높이에서 같이 움직임.
   처음엔 메인 따라 올라가다, 일정 지점(24px)에서 멈춤.
   - 데스크탑(1100px↑)에서만 작동. 폰은 컬럼이 숨겨짐.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const cols = [
    document.querySelector('.att-left-col'),
    document.querySelector('.wt-right-col'),
  ].filter(Boolean);

  if (!cols.length) return;

  const START_TOP = 40;   // 시작 위치 (px)
  const MIN_TOP   = 24;   // 최소 멈춤 위치 (px) — 여기서 고정

  function onScroll() {
    if (window.innerWidth <= 1100) {
      cols.forEach(c => { c.style.top = ''; });
      return;
    }

    const y = window.scrollY || window.pageYOffset;
    // 스크롤 따라 올라가다가 MIN_TOP 에서 멈춤
    const newTop = Math.max(MIN_TOP, START_TOP - y);

    cols.forEach(c => { c.style.top = newTop + 'px'; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();   // 로드 시 즉시 적용 (CSS 6% 대신 JS 24px 로 통일)
});
