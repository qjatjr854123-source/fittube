/* ============================================
   badges.js — 성취 배지 시스템 (index.html)
   ============================================
   이미 쌓인 데이터(출석 streak, 이번달 운동, 체중기록)로
   배지 달성 여부를 자동 판정 → 획득 시 컬러, 미획득은 흐리게.
   별도 저장 없음 (데이터에서 매번 계산 = 항상 정확).
   의존: shared.js 의 Records, Weights, MyList
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('badges');
  if (!wrap) return;

  // 배지 정의 — check(): 현재 데이터로 달성했는지 true/false
  const BADGES = [
    // 운동 출석
    { icon: '🏃', name: '첫 걸음',    desc: '첫 운동 완료',
      check: () => Object.keys(Records.all()).length >= 1 },
    { icon: '🔥', name: '3일 연속',   desc: '3일 연속 운동',
      check: () => Records.streak() >= 3 },
    { icon: '💪', name: '일주일',     desc: '7일 연속 운동',
      check: () => Records.streak() >= 7 },
    { icon: '🦾', name: '2주 연속',   desc: '14일 연속 운동',
      check: () => Records.streak() >= 14 },
    { icon: '👊', name: '한 달 개근', desc: '30일 연속 운동',
      check: () => Records.streak() >= 30 },

    // 이번 달 횟수
    { icon: '📅', name: '한 달 5회',  desc: '이번 달 5회 운동',
      check: () => Records.countThisMonth() >= 5 },
    { icon: '🗓️', name: '한 달 10회', desc: '이번 달 10회 운동',
      check: () => Records.countThisMonth() >= 10 },
    { icon: '🏆', name: '한 달 20회', desc: '이번 달 20회 운동',
      check: () => Records.countThisMonth() >= 20 },

    // 총 운동 횟수
    { icon: '⭐', name: '10회 달성',  desc: '총 운동 10회',
      check: () => Object.keys(Records.all()).length >= 10 },
    { icon: '🌟', name: '30회 달성',  desc: '총 운동 30회',
      check: () => Object.keys(Records.all()).length >= 30 },
    { icon: '💎', name: '50회 달성',  desc: '총 운동 50회',
      check: () => Object.keys(Records.all()).length >= 50 },

    // 체중 기록
    { icon: '⚖️', name: '체중 기록',  desc: '체중 첫 기록',
      check: () => Weights.sorted().length >= 1 },
    { icon: '📈', name: '꾸준 측정',  desc: '체중 5회 기록',
      check: () => Weights.sorted().length >= 5 },
    { icon: '📊', name: '체중 마스터', desc: '체중 10회 기록',
      check: () => Weights.sorted().length >= 10 },

    // 나만의 운동
    { icon: '📋', name: '루틴 시작',  desc: '나만의 운동 1개',
      check: () => MyList.all().length >= 1 },
    { icon: '💼', name: '루틴 메이커', desc: '나만의 운동 3개',
      check: () => MyList.all().length >= 3 },
    { icon: '🎯', name: '루틴 고수',  desc: '나만의 운동 5개',
      check: () => MyList.all().length >= 5 },
  ];

  function render() {
    let gained = 0;
    const html = BADGES.map(b => {
      let ok = false;
      try { ok = !!b.check(); } catch (e) { ok = false; }
      if (ok) gained++;
      return `
        <div class="badge-item ${ok ? 'got' : 'locked'}" title="${b.desc}">
          <div class="badge-icon">${b.icon}</div>
          <div class="badge-name">${b.name}</div>
        </div>`;
    }).join('');

    wrap.innerHTML = `
      <div class="badges-head">
        <span class="badges-title">🏆 성취 배지</span>
        <span class="badges-count">${gained} / ${BADGES.length}</span>
      </div>
      <div class="badges-grid">${html}</div>
    `;
  }

  render();
  // 출석/체중/리스트가 바뀌면 배지도 다시 판정하도록 전역 노출
  window.refreshBadges = render;
});
