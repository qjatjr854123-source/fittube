/* ============================================
   plan.js — 플랜 페이지
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireLogin()) return;
  if (!requireGoal()) return;

  renderProgressNav('plan');

  const user = Store.get(STORAGE_KEYS.USER);
  const goal = Store.get(STORAGE_KEYS.GOAL);

  // ✅ userInfo 에 저장된 나이·활동 수준까지 복원
  // 체중 우선순위: USER 스토리지 → 체중 위젯 최근 기록 → 기본값
  const latestRecordedWeight = (typeof Weights !== 'undefined') ? Weights.sorted().slice(-1)[0]?.kg : null;
  if (typeof userInfo !== 'undefined') {
    userInfo.height   = user?.height   || 175;
    userInfo.weight   = user?.weight   || latestRecordedWeight || 70;
    userInfo.age      = user?.age      || 25;
    userInfo.activity = user?.activity || 1.55;
    userInfo.gender   = user?.gender   || '남';
    // USER 스토리지에 체중 없으면 최근 기록값으로 업데이트
    if (!user?.weight && latestRecordedWeight) {
      const prevUser = Store.get(STORAGE_KEYS.USER) || {};
      Store.set(STORAGE_KEYS.USER, { ...prevUser, weight: latestRecordedWeight });
    }
  }

  // ✅ window.currentGoal 이 아닌 script.js 의 currentGoal 변수를 직접 갱신
  if (goal && typeof currentGoal !== 'undefined') {
    currentGoal = goal;
  }

  if (typeof renderWeekPlan === 'function') {
    renderWeekPlan();

    // 오늘 요일 항상 자동 선택 (월=0 ~ 일=6)
    const jsDay = new Date().getDay(); // 0=일 ~ 6=토
    const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

    if (typeof showDay === 'function') {
      showDay(todayIdx);
    }
  } else {
    console.error('renderWeekPlan 함수를 찾을 수 없습니다.');
  }
});
