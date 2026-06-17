/* ============================================
   weight.js — 체중 변화 기록 + SVG 선 그래프 (index.html)
   ============================================
   - 오늘 체중 입력 → 저장 → 점이 찍히고 선이 이어짐
   - 그래프는 라이브러리 없이 SVG 직접 생성 (가벼움)
   - 데스크탑: 오른쪽 카드 / 폰: 메인 섹션 (둘 다 같은 데이터)
   데이터: shared.js 의 Weights 사용
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('wtSection');
  if (!section) return;

  const input      = document.getElementById('wtInput');
  const saveBtn    = document.getElementById('wtSaveBtn');
  const latestEl   = document.getElementById('wtLatest');
  const emptyEl    = document.getElementById('wtEmpty');
  const graphM     = document.getElementById('wtGraphMobile');  // 폰
  const graphD     = document.getElementById('wtGraphDesktop'); // 데스크탑 카드
  const floatLatest = document.getElementById('wtFloatLatest');
  const floatFoot   = document.getElementById('wtFloatFoot');
  const goalInput  = document.getElementById('wtGoalInput');
  const goalSave   = document.getElementById('wtGoalSave');
  const goalDiff   = document.getElementById('wtGoalDiff');
  const filterTabs = document.querySelectorAll('.wt-filter-tab');

  let currentRange = 7; // 기본 1주

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentRange = parseInt(tab.dataset.range);
      render();
    });
  });

  // SVG 선 그래프 생성 — data: [{date, kg}, ...]
  function buildGraph(data, w, h, goalKg) {
    if (!data.length) return '';

    const padL = 10, padR = 10, padT = 14, padB = 20;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;

    const kgs = data.map(d => d.kg);
    if (goalKg) kgs.push(goalKg); // 목표값도 범위에 포함
    let min = Math.min(...kgs);
    let max = Math.max(...kgs);
    if (min === max) { min -= 1; max += 1; }

    const xStep = data.length > 1 ? innerW / (data.length - 1) : 0;
    const toY = kg => padT + innerH - ((kg - min) / (max - min)) * innerH;
    const toX = i => padL + i * xStep;

    const points = data.map((d, i) => ({ x: toX(i), y: toY(d.kg), kg: d.kg, date: d.date }));

    // 부드러운 곡선 (베지어)
    let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i-1].x + points[i].x) / 2;
      const cp1y = points[i-1].y;
      const cp2x = (points[i-1].x + points[i].x) / 2;
      const cp2y = points[i].y;
      pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
    }

    // 면적
    const areaD = `${pathD} L ${points[points.length-1].x.toFixed(1)} ${(padT + innerH).toFixed(1)} L ${padL} ${(padT + innerH).toFixed(1)} Z`;

    // 점들
    const circles = points.map((p, i) => {
      const isLast = i === points.length - 1;
      if (isLast) {
        return `
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="#ff0033" opacity="0.25"/>
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#fff" stroke="#ff0033" stroke-width="2"/>
          <text x="${p.x.toFixed(1)}" y="${(padT - 4).toFixed(1)}" text-anchor="middle"
                font-size="9" font-weight="800" fill="#ff0033" font-family="'Courier New', monospace">${p.kg}kg</text>`;
      }
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2" fill="#ff0033" opacity="0.6"/>`;
    }).join('');

    // 날짜 라벨 (첫번째, 마지막)
    const firstDate = data[0].date ? data[0].date.slice(5) : '';
    const lastDate  = data[data.length-1].date ? data[data.length-1].date.slice(5) : '';
    const dateLabels = data.length > 1 ? `
      <text x="${padL}" y="${h - 4}" text-anchor="start" font-size="8" fill="rgba(255,255,255,0.3)" font-family="monospace">${firstDate}</text>
      <text x="${(padL + innerW)}" y="${h - 4}" text-anchor="end" font-size="8" fill="rgba(255,255,255,0.3)" font-family="monospace">${lastDate}</text>` : '';

    return `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="overflow:visible">
        <defs>
          <linearGradient id="wtFill${w}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ff0033" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#ff0033" stop-opacity="0"/>
          </linearGradient>
          <filter id="wtGlow${w}">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path d="${areaD}" fill="url(#wtFill${w})"/>
        <path d="${pathD}" fill="none" stroke="#ff0033" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round" filter="url(#wtGlow${w})"/>
        ${goalKg ? `
          <line x1="${padL}" y1="${toY(goalKg).toFixed(1)}" x2="${(padL+innerW)}" y2="${toY(goalKg).toFixed(1)}"
                stroke="#00d4ff" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.8"/>
          <text x="${(padL+innerW)}" y="${(toY(goalKg)-3).toFixed(1)}" text-anchor="end"
                font-size="8" fill="#00d4ff" font-family="monospace">목표 ${goalKg}kg</text>` : ''}
        ${circles}
        ${dateLabels}
      </svg>`;
  }

  function render() {
    const data = currentRange === 0 ? Weights.sorted() : Weights.recent(currentRange);
    const latest = Weights.sorted().slice(-1)[0];
    const goalKg = Store.get(STORAGE_KEYS.WEIGHT_GOAL);

    // 목표 체중 input 에 채워두기
    if (goalInput && goalKg) goalInput.value = goalKg;

    // 최신 체중 표시
    const latestText = latest ? `${latest.kg} kg` : '-- kg';
    if (latestEl)     latestEl.textContent = latestText;
    if (floatLatest)  floatLatest.textContent = latestText;

    // 오늘 이미 입력했으면 input 에 채워두기
    const today = Weights.getToday();
    if (today != null && input) input.value = today;

    // 목표 차이 표시
    if (goalDiff) {
      if (goalKg && latest) {
        const diff = (latest.kg - goalKg).toFixed(1);
        if (Math.abs(diff) < 0.1) {
          goalDiff.textContent = '🎉 목표 달성!';
          goalDiff.className = 'wt-goal-diff reached';
        } else if (diff > 0) {
          goalDiff.textContent = `목표까지 -${diff}kg`;
          goalDiff.className = 'wt-goal-diff down';
        } else {
          goalDiff.textContent = `목표까지 +${Math.abs(diff)}kg`;
          goalDiff.className = 'wt-goal-diff up';
        }
      } else {
        goalDiff.textContent = '';
      }
    }

    if (!data.length) {
      if (emptyEl)  emptyEl.style.display = 'block';
      if (graphM)   graphM.innerHTML = '';
      if (graphD)   graphD.innerHTML = '<div class="wt-empty-mini">기록 없음</div>';
      if (floatFoot) floatFoot.textContent = '체중을 기록해보세요';
      return;
    }

    if (data.length === 1) {
      if (emptyEl) emptyEl.style.display = 'none';
      const oneMsg = `<div class="wt-empty-mini">📍 ${data[0].kg}kg 기록됨<br>하루 더 재면 변화 그래프가 그려져요</div>`;
      if (graphM)   graphM.innerHTML = oneMsg;
      if (graphD)   graphD.innerHTML = oneMsg;
      if (floatFoot) floatFoot.textContent = '기록 1회 · 변화 보려면 1회 더';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    // 그래프 그리기 — 목표선 포함
    if (graphM) graphM.innerHTML = buildGraph(data, 300, 90, goalKg);
    if (graphD) graphD.innerHTML = buildGraph(data, 220, 110, goalKg);

    // 데스크탑 카드 하단 — 변화량
    if (floatFoot && data.length >= 2) {
      const diff = (data[data.length - 1].kg - data[0].kg).toFixed(1);
      const sign = diff > 0 ? '+' : '';
      floatFoot.textContent = `최근 ${data.length}회 · ${sign}${diff}kg`;
    } else if (floatFoot) {
      floatFoot.textContent = `기록 ${data.length}회`;
    }
  }

  function save() {
    const kg = parseFloat(input.value);
    if (!kg || kg < 20 || kg > 300) {
      input.classList.add('wt-input-error');
      setTimeout(() => input.classList.remove('wt-input-error'), 500);
      input.focus();
      return;
    }
    Weights.setToday(kg);
    // 체중 위젯 기록 → USER 스토리지에도 반영 (식단 계산에 사용)
    const prevUser = Store.get(STORAGE_KEYS.USER) || {};
    Store.set(STORAGE_KEYS.USER, { ...prevUser, weight: kg });
    render();
    if (typeof window.refreshBadges === 'function') window.refreshBadges();
    // 식단 즉시 갱신
    if (typeof renderDiet === 'function') renderDiet();

    // 저장 피드백
    saveBtn.textContent = '저장됨 ✓';
    setTimeout(() => { saveBtn.textContent = '기록'; }, 1200);
  }

  saveBtn.addEventListener('click', save);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });

  // 최근 기록 목록 + 삭제 버튼
  const historyEl = document.getElementById('wtHistory');
  function renderHistory() {
    if (!historyEl) return;
    const data = Weights.sorted().slice(-5).reverse(); // 최근 5개 역순
    if (!data.length) { historyEl.innerHTML = ''; return; }
    historyEl.innerHTML = data.map(d => `
      <div class="wt-hist-row">
        <span class="wt-hist-date">${d.date.slice(5)}</span>
        <span class="wt-hist-kg">${d.kg} kg</span>
        <button type="button" class="wt-hist-del" data-date="${d.date}" title="삭제">×</button>
      </div>`).join('');

    historyEl.querySelectorAll('.wt-hist-del').forEach(btn => {
      btn.addEventListener('click', () => {
        Weights.remove(btn.dataset.date);
        render();
        if (typeof window.refreshBadges === 'function') window.refreshBadges();
      });
    });
  }

  // 목표 체중 저장
  if (goalSave) {
    goalSave.addEventListener('click', () => {
      const kg = parseFloat(goalInput.value);
      if (!kg || kg < 20 || kg > 300) {
        goalInput.classList.add('wt-input-error');
        setTimeout(() => goalInput.classList.remove('wt-input-error'), 500);
        return;
      }
      Store.set(STORAGE_KEYS.WEIGHT_GOAL, kg);
      render();
      goalSave.textContent = '설정됨 ✓';
      setTimeout(() => { goalSave.textContent = '설정'; }, 1200);
    });
    if (goalInput) {
      goalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') goalSave.click(); });
    }
  }

  // 다른 스크립트(analysis.js)가 체중을 자동 저장한 뒤 그래프 갱신용
  window.refreshWeightGraph = () => { render(); renderHistory(); };

  render();
  renderHistory();
});
