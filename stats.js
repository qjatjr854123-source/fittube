/* ============================================
   stats.js — 운동 통계 섹션 (index.html)
   이번 달 총 운동일, 최장 streak, 평균 체중
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('statsSection');
  if (!wrap) return;

  function calcLongestStreak() {
    const recs = Records.all();
    const keys = Object.keys(recs).filter(k => recs[k]).sort();
    if (!keys.length) return 0;
    let max = 1, cur = 1;
    for (let i = 1; i < keys.length; i++) {
      const prev = new Date(keys[i - 1]);
      const curr = new Date(keys[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) { cur++; max = Math.max(max, cur); }
      else cur = 1;
    }
    return max;
  }

  function calcAvgWeight() {
    const sorted = Weights.sorted();
    if (!sorted.length) return null;
    const sum = sorted.reduce((acc, d) => acc + d.kg, 0);
    return (sum / sorted.length).toFixed(1);
  }

  function render() {
    const totalDays   = Object.keys(Records.all()).filter(k => Records.all()[k]).length;
    const monthCount  = Records.countThisMonth();
    const longestStreak = calcLongestStreak();
    const currentStreak = Records.streak();
    const avgWeight   = calcAvgWeight();
    const goalKg      = Store.get(STORAGE_KEYS.WEIGHT_GOAL);
    const latestKg    = Weights.sorted().slice(-1)[0]?.kg;

    wrap.innerHTML = `
      <div class="stats-head">
        <span class="stats-title">📊 내 운동 통계</span>
      </div>
      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-val">${monthCount}<span class="stats-unit">일</span></div>
          <div class="stats-label">이번 달 운동</div>
        </div>
        <div class="stats-card">
          <div class="stats-val">${totalDays}<span class="stats-unit">일</span></div>
          <div class="stats-label">총 운동일</div>
        </div>
        <div class="stats-card">
          <div class="stats-val">${currentStreak}<span class="stats-unit">일</span></div>
          <div class="stats-label">현재 연속</div>
        </div>
        <div class="stats-card">
          <div class="stats-val">${longestStreak}<span class="stats-unit">일</span></div>
          <div class="stats-label">최장 streak</div>
        </div>
        <div class="stats-card">
          <div class="stats-val">${avgWeight ?? '--'}<span class="stats-unit">kg</span></div>
          <div class="stats-label">평균 체중</div>
        </div>
        <div class="stats-card ${goalKg && latestKg && Math.abs(latestKg - goalKg) < 0.1 ? 'reached' : ''}">
          <div class="stats-val">${goalKg ? goalKg + '<span class="stats-unit">kg</span>' : '--'}</div>
          <div class="stats-label">목표 체중</div>
        </div>
      </div>
    `;
  }

  render();
  window.refreshStats = render;
});