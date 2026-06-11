/* prediction.js */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireLogin()) return;
  const goal    = Store.get(STORAGE_KEYS.GOAL) || '유지';
  const photo   = Store.getPhoto();
  const user    = Store.get(STORAGE_KEYS.USER) || { weight: 70, height: 175, age: 25, gender: '남' };
  const metrics = Store.get(STORAGE_KEYS.METRICS) || {};

  if (!goal) { window.location.href = 'index.html'; return; }

  renderProgressNav('prediction');

  const config = computeConfig(goal, user, metrics);

  document.getElementById('resultGoal').textContent = goal;
  // 헤더 부제도 목표별 주(週) 수를 따라가게 (기존엔 HTML에 "8주"로 고정돼 있었음)
  const subtitleEl = document.getElementById('resultSubtitle');
  if (subtitleEl) subtitleEl.textContent = `${config.weeks}주 후 예상 결과`;
  document.getElementById('arrowText').textContent  = `${config.weeks}주 후`;
  document.getElementById('resultMsg').innerHTML = `
    이 루틴대로 <strong>${config.weeks}주</strong> 진행하면<br>
    <span style="color:#ff0033">${config.detail}</span> 예상됩니다
    <div class="result-disclaimer">※ 키·체중 기반 추정치 · 개인차 있음</div>
  `;

  const warning = document.getElementById('accuracyWarning');
  if (warning) {
    const bf = parseFloat(user.bodyFat);
    warning.style.display = (bf && bf >= 3) ? 'none' : 'flex';
  }

  // 체형별 솔직 코칭 메시지 표시
  const coach = coachingMessage(user, metrics);
  const coachBox = document.getElementById('coachBox');
  if (coach && coachBox) {
    document.getElementById('coachIcon').textContent  = coach.icon;
    document.getElementById('coachTitle').textContent = coach.title;
    document.getElementById('coachBody').textContent  = coach.body;
    coachBox.style.display = 'flex';
  }

  renderChangeBars(config, user, metrics);

  // ===== BEFORE: 업로드한 사진 =====
  const beforeImg = document.getElementById('beforeImg');
  if (photo) {
    beforeImg.innerHTML = `<img src="${photo}" class="ba-img" alt="before">`;
  } else {
    beforeImg.innerHTML = `<div class="ba-placeholder">사진 미업로드</div>`;
  }

  // ===== AFTER 자리는 prediction.html 인라인 스크립트가 부위별 피드백으로 처리 =====
  // (구버전 실루엣/필터 코드는 afterImg null 가드로 자동 스킵)
  const afterImg = document.getElementById('afterImg');
  if (!afterImg) return;

  const silhouettes = {
    '벌크업': `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" style="width:70%;height:auto;filter:drop-shadow(0 0 24px rgba(255,0,51,0.7));animation:silPulse 2s ease-in-out infinite">
      <circle cx="60" cy="22" r="16" fill="rgba(255,0,51,0.95)"/>
      <path d="M18 72 Q18 44 60 41 Q102 44 102 72 L110 132 Q88 138 60 138 Q32 138 10 132 Z" fill="rgba(255,0,51,0.95)"/>
      <path d="M4 56 Q0 64 2 82 Q5 97 20 96 L20 72 Q12 67 8 60 Z" fill="rgba(255,0,51,0.75)"/>
      <path d="M116 56 Q120 64 118 82 Q115 97 100 96 L100 72 Q108 67 112 60 Z" fill="rgba(255,0,51,0.75)"/>
      <path d="M28 138 Q23 168 20 198" stroke="rgba(255,0,51,0.95)" stroke-width="20" stroke-linecap="round" fill="none"/>
      <path d="M92 138 Q97 168 100 198" stroke="rgba(255,0,51,0.95)" stroke-width="20" stroke-linecap="round" fill="none"/>
    </svg>`,
    '다이어트': `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" style="width:55%;height:auto;filter:drop-shadow(0 0 24px rgba(255,0,51,0.7));animation:silPulse 2s ease-in-out infinite">
      <circle cx="60" cy="22" r="13" fill="rgba(255,0,51,0.95)"/>
      <path d="M36 64 Q36 44 60 41 Q84 44 84 64 L89 130 Q74 136 60 136 Q46 136 31 130 Z" fill="rgba(255,0,51,0.95)"/>
      <path d="M14 54 Q11 62 13 78 Q16 91 31 89 L33 66 Q23 63 18 57 Z" fill="rgba(255,0,51,0.75)"/>
      <path d="M106 54 Q109 62 107 78 Q104 91 89 89 L87 66 Q97 63 102 57 Z" fill="rgba(255,0,51,0.75)"/>
      <path d="M37 136 Q33 163 31 197" stroke="rgba(255,0,51,0.95)" stroke-width="13" stroke-linecap="round" fill="none"/>
      <path d="M83 136 Q87 163 89 197" stroke="rgba(255,0,51,0.95)" stroke-width="13" stroke-linecap="round" fill="none"/>
    </svg>`,
    '유지': `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" style="width:62%;height:auto;filter:drop-shadow(0 0 24px rgba(255,0,51,0.7));animation:silPulse 2s ease-in-out infinite">
      <circle cx="60" cy="22" r="15" fill="rgba(255,0,51,0.95)"/>
      <path d="M26 68 Q26 44 60 41 Q94 44 94 68 L100 132 Q80 138 60 138 Q40 138 20 132 Z" fill="rgba(255,0,51,0.95)"/>
      <path d="M8 56 Q5 64 7 80 Q10 93 25 91 L26 70 Q16 66 12 59 Z" fill="rgba(255,0,51,0.75)"/>
      <path d="M112 56 Q115 64 113 80 Q110 93 95 91 L94 70 Q104 66 108 59 Z" fill="rgba(255,0,51,0.75)"/>
      <path d="M32 138 Q28 165 26 197" stroke="rgba(255,0,51,0.95)" stroke-width="16" stroke-linecap="round" fill="none"/>
      <path d="M88 138 Q92 165 94 197" stroke="rgba(255,0,51,0.95)" stroke-width="16" stroke-linecap="round" fill="none"/>
    </svg>`
  };

  // 로딩 표시
  afterImg.innerHTML = `
    <div class="ba-loading">
      <div class="ba-spinner-new"></div>
      <div class="ba-loading-text">결과 계산 중<span class="ba-dots"><i>.</i><i>.</i><i>.</i></span></div>
    </div>`;

  // 3초 후 실루엣 표시
  setTimeout(() => {
    afterImg.classList.add('ba-after-done');

    const metricsHTML = config.metrics.map(m => `
      <div class="ba-metric ${m.positive ? 'positive' : 'neutral'}">
        <span class="bm-dot"></span>
        <span class="bm-label">${m.label}</span>
        <span class="bm-value">${m.value}</span>
      </div>`).join('');

    // 목표별 CSS 필터 + canvas 변환으로 시각적 차이 극대화
    const filterMap = {
      '벌크업':   'contrast(1.4) saturate(1.6) brightness(1.08) hue-rotate(5deg)',
      '다이어트': 'contrast(1.2) saturate(0.8) brightness(1.15) hue-rotate(-5deg)',
      '유지':     'contrast(1.1) saturate(1.1) brightness(1.05)',
    };
    const filter = filterMap[goal] || 'none';

    if (photo) {
      afterImg.innerHTML = `
        <div style="position:relative;width:100%;height:100%;">
          <img src="${photo}" class="ba-img ba-img-after" alt="after"
               style="filter:${filter}; transform:scale(1.04);">
          <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,0,51,0.15),transparent);border-radius:12px;pointer-events:none;"></div>
          <div class="ba-after-badge">+${config.weeks}주</div>
          <div style="position:absolute;bottom:6px;left:6px;right:6px;font-size:8px;color:rgba(255,255,255,0.8);background:rgba(0,0,0,0.55);padding:3px 6px;border-radius:5px;text-align:center;backdrop-filter:blur(4px);">
            ※ 실제 미래 사진 아님 · 이미지 효과
          </div>
        </div>
      `;
    } else {
      afterImg.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;">
          ${silhouettes[goal] || silhouettes['유지']}
          <div class="ba-after-badge">+${config.weeks}주</div>
        </div>
      `;
    }
  }, 3000);});

function computeConfig(goal, user, metrics) {
  const w   = parseFloat(user.weight) || 70;
  const h   = parseFloat(user.height) || 175;
  const bmi = parseFloat(metrics.bmi) || (w / Math.pow(h / 100, 2));
  const bf  = parseFloat(user.bodyFat) || parseFloat(metrics.bodyFat) ||
    Math.max(5, Math.min(50, 1.20 * bmi + 0.23 * (parseFloat(user.age)||25) - 10.8 * ((user.gender==='남')?1:0) - 5.4));
  const scale = w / 70;

  if (goal === '벌크업') {
    const weeks      = 8;
    const weightGain = round(0.4 * weeks * scale, 1);
    const muscleGain = round(weightGain * 0.7, 1);
    const fatChange  = round(-0.1 * weeks - (bmi < 22 ? 0.3 : 0), 1);
    return { weeks,
      detail: `체중 +${weightGain}kg · 근육 +${muscleGain}kg · 체지방 ${fatChange}%`,
      metrics: [
        { label: '체중',   value: `+${weightGain}kg`, positive: true },
        { label: '근육량', value: `+${muscleGain}kg`, positive: true },
        { label: '체지방', value: `${fatChange}%`,    positive: true },
      ]
    };
  }
  if (goal === '다이어트') {
    const weeks      = 8;
    const weeklyRate = bmi >= 25 ? 0.85 : (bmi >= 23 ? 0.7 : 0.55);
    const weightLoss = round(weeklyRate * weeks * scale * 0.85, 1);
    const fatLoss    = round(weightLoss * 0.7 / w * 100, 1);
    return { weeks,
      detail: `체중 -${weightLoss}kg · 체지방 -${fatLoss}%`,
      metrics: [
        { label: '체중',   value: `-${weightLoss}kg`, positive: true },
        { label: '체지방', value: `-${fatLoss}%`,     positive: true },
        { label: '근육량', value: bmi < 22 ? '주의' : '유지', positive: false },
      ]
    };
  }
  const weeks    = 8;
  const strength = round(weeks * (bmi < 20 ? 2.2 : (bmi > 25 ? 1.3 : 1.8)), 0);
  const fatTrim  = round(weeks * (bf > 20 ? 0.15 : 0.1), 1);
  return { weeks,
    detail: `근력 +${strength}% · 체지방 -${fatTrim}%`,
    metrics: [
      { label: '근력',   value: `+${strength}%`, positive: true },
      { label: '체지방', value: `-${fatTrim}%`,  positive: true },
      { label: '체형',   value: '유지',          positive: false },
    ]
  };
}

function round(n, d=1) { return Math.round(n * Math.pow(10,d)) / Math.pow(10,d); }

// 체형별 솔직 코칭 메시지 — 체지방률(있으면) → 없으면 BMI 로 판정.
// 솔직하되 모욕 ❌, 항상 "그래서 이렇게 하면 된다"는 해법을 붙임.
function coachingMessage(user, metrics) {
  const w   = parseFloat(user.weight) || 70;
  const h   = parseFloat(user.height) || 175;
  const bmi = parseFloat(metrics.bmi) || (w / Math.pow(h / 100, 2));
  const bf  = parseFloat(user.bodyFat) || parseFloat(metrics.bodyFat) || null;
  const male = user.gender !== '여';

  // 판정: 체지방률 우선, 없으면 BMI
  let level; // 'high' | 'low' | 'fit'
  if (bf != null) {
    const highBf = male ? 25 : 32;   // 이 이상이면 체지방 높음
    const lowBf  = male ? 10 : 18;   // 이 이하면 마른/저체지방
    level = bf >= highBf ? 'high' : (bf <= lowBf ? 'low' : 'fit');
  } else {
    level = bmi >= 25 ? 'high' : (bmi < 18.5 ? 'low' : 'fit');
  }

  const msgs = {
    high: {
      icon: '🎯',
      title: '솔직하게, 지금이 시작할 때예요',
      body: '체지방이 높은 편이라 변화가 가장 크게 느껴지는 구간이에요. 주 3~4회 운동 + 식단 관리, 딱 8주만 해보세요. 확실히 달라집니다.'
    },
    low: {
      icon: '🍚',
      title: '마른 편 — 잘 먹는 게 운동만큼 중요해요',
      body: '지금은 안 먹으면 근육이 안 붙어요. 단백질·탄수 충분히 챙기고 고중량 위주로. 운동보다 식사를 먼저 챙기세요.'
    },
    fit: {
      icon: '💪',
      title: '기본기 탄탄해요',
      body: '이미 잘하고 있다는 뜻이에요. 지금 루틴 유지하면서 약점 부위만 보강하면 완성도가 올라가요.'
    }
  };
  return msgs[level];
}

function renderChangeBars(config, user, metrics) {
  const container = document.getElementById('changeBars');
  if (!container) return;

  const weight  = parseFloat(user.weight) || 70;
  const bmi2    = parseFloat(metrics.bmi) || (weight / Math.pow((parseFloat(user.height)||175)/100, 2));
  const bodyFat = parseFloat(user.bodyFat) || parseFloat(metrics.bodyFat) ||
    Math.max(5, Math.min(50, 1.20*bmi2 + 0.23*(parseFloat(user.age)||25) - 10.8*((user.gender==='남')?1:0) - 5.4));
  const muscle  = parseFloat(metrics.muscle) || 38;

  const rows = config.metrics.map(m => {
    const num      = parseFloat(m.value);
    const isMuscle = m.label.includes('근육');
    const isFat    = m.label.includes('체지방');
    const isWeight = m.label.includes('체중');
    const isPower  = m.label.includes('근력');
    const isShape  = m.label.includes('체형');

    let current, expected, unit;
    if (isWeight)      { current = weight;  expected = weight  + (num||0); unit = 'kg'; }
    else if (isMuscle) { current = muscle;  expected = muscle  + (num||0); unit = '%';  }
    else if (isFat)    { current = bodyFat; expected = bodyFat + (num||0); unit = '%';  }
    else if (isPower)  { current = '기준';  expected = `+${num}% 향상`;   unit = '';   }
    else if (isShape)  { current = '현재';  expected = '유지';             unit = '';   }
    else               { current = 0;       expected = 0;                  unit = '';   }

    const barPct = isNaN(num) ? 30 : Math.min(95, Math.max(10, Math.abs(num)*12));
    return { label: m.label, current, expected, unit, valueStr: m.value, barPct, positive: m.positive };
  });

  container.innerHTML = rows.map(r => {
    const cur = typeof r.current === 'number' ? r.current.toFixed(1)+r.unit : (r.current||'');
    const exp = typeof r.expected === 'number' ? r.expected.toFixed(1)+r.unit : (r.expected||r.valueStr);
    const color = r.positive ? '#00ff88' : 'rgba(255,255,255,0.4)';
    return `
      <div class="hud-metric-row">
        <div class="hud-metric-left">
          <span class="hud-metric-key">${r.label}</span>
          <span class="hud-metric-dot">·</span>
          <span class="hud-metric-desc" style="color:${color};">${r.valueStr}</span>
        </div>
        <div class="hud-metric-right">
          <span style="font-size:13px;color:rgba(255,255,255,0.4);margin-right:4px;">${cur}</span>
          <span style="font-size:13px;color:#ff0033;margin-right:4px;">→</span>
          <span class="hud-metric-val" style="font-size:18px;">${exp}</span>
        </div>
      </div>`;
  }).join('');
}
