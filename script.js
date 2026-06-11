// ===== 데이터 =====
const partVideos = {
  '가슴': 'IODxDxX7oi4',
  '등': 'eGo4IYlbE5g',
  '하체': 'ultWZbUMPL8',
  '어깨': '3VcKaXpzqRo',
  '팔': 'kwG2ipFRgfo',
  '복근': 'ASdvN_XEl_c',
  '유산소': 'Imdmug2sH9w',
  '휴식': 'g_tea8ZNk5A'
};

const partEmojis = {
  '가슴': '💪', '등': '🔙', '하체': '🦵', '어깨': '🏋️',
  '팔': '💪', '복근': '🔥', '유산소': '🏃', '휴식': '😴'
};

const weekPlanByGoal = {
  '벌크업': [
    { day: '월', part: '가슴' }, { day: '화', part: '등' }, { day: '수', part: '하체' },
    { day: '목', part: '어깨' }, { day: '금', part: '팔' }, { day: '토', part: '복근' },
    { day: '일', part: '휴식' }
  ],
  '다이어트': [
    { day: '월', part: '유산소' }, { day: '화', part: '하체' }, { day: '수', part: '복근' },
    { day: '목', part: '유산소' }, { day: '금', part: '등' }, { day: '토', part: '유산소' },
    { day: '일', part: '휴식' }
  ],
  '유지': [
    { day: '월', part: '가슴' }, { day: '화', part: '등' }, { day: '수', part: '하체' },
    { day: '목', part: '어깨' }, { day: '금', part: '팔' }, { day: '토', part: '복근' },
    { day: '일', part: '휴식' }
  ]
};

const dietConfig = {
  '벌크업':   { kcalPerKg: 40, proteinPerKg: 2.5, carbRatio: 0.5,  fatRatio: 0.25 },
  '다이어트': { kcalPerKg: 25, proteinPerKg: 2.3, carbRatio: 0.35, fatRatio: 0.3  },
  '유지':     { kcalPerKg: 32, proteinPerKg: 2.0, carbRatio: 0.45, fatRatio: 0.28 }
};

const mealTemplates = {
  '벌크업': [
    { time: '07:00', name: '아침', items: [
      { food: '현미밥',       basePer70: 200, unit: 'g' },
      { food: '닭가슴살',     basePer70: 150, unit: 'g' },
      { food: '계란 (전란)',  basePer70: 100, unit: 'g (약 2개)' },
      { food: '바나나',       basePer70: 120, unit: 'g' }
    ]},
    { time: '12:30', name: '점심', items: [
      { food: '잡곡밥',      basePer70: 250, unit: 'g' },
      { food: '소고기 안심', basePer70: 180, unit: 'g' },
      { food: '브로콜리',    basePer70: 100, unit: 'g' },
      { food: '아보카도',    basePer70: 80,  unit: 'g' }
    ]},
    { time: '16:00', name: '운동 전 간식', items: [
      { food: '고구마',        basePer70: 200, unit: 'g' },
      { food: '프로틴 셰이크', basePer70: 30,  unit: 'g (1스쿱)' }
    ]},
    { time: '20:00', name: '운동 후 저녁', items: [
      { food: '백미밥', basePer70: 250, unit: 'g' },
      { food: '연어',   basePer70: 180, unit: 'g' },
      { food: '시금치', basePer70: 100, unit: 'g' },
      { food: '아몬드', basePer70: 20,  unit: 'g' }
    ]},
    { time: '22:30', name: '취침 전', items: [
      { food: '카제인 프로틴', basePer70: 30, unit: 'g (1스쿱)' },
      { food: '땅콩버터',      basePer70: 15, unit: 'g' }
    ]}
  ],
  '다이어트': [
    { time: '07:00', name: '아침', items: [
      { food: '오트밀',    basePer70: 50,  unit: 'g' },
      { food: '계란 흰자', basePer70: 140, unit: 'g (약 4개)' },
      { food: '블루베리',  basePer70: 80,  unit: 'g' }
    ]},
    { time: '12:30', name: '점심', items: [
      { food: '현미밥',     basePer70: 120, unit: 'g' },
      { food: '닭가슴살',   basePer70: 200, unit: 'g' },
      { food: '샐러드',     basePer70: 150, unit: 'g' },
      { food: '올리브오일', basePer70: 5,   unit: 'g' }
    ]},
    { time: '16:00', name: '간식', items: [
      { food: '그릭요거트', basePer70: 150, unit: 'g' },
      { food: '아몬드',     basePer70: 15,  unit: 'g' }
    ]},
    { time: '19:30', name: '저녁', items: [
      { food: '고구마',      basePer70: 150, unit: 'g' },
      { food: '연어 (구이)', basePer70: 150, unit: 'g' },
      { food: '브로콜리',    basePer70: 150, unit: 'g' }
    ]},
    { time: '21:30', name: '취침 전 (선택)', items: [
      { food: '카제인 프로틴', basePer70: 25, unit: 'g (1스쿱)' }
    ]}
  ],
  '유지': [
    { time: '07:30', name: '아침', items: [
      { food: '현미밥',      basePer70: 150, unit: 'g' },
      { food: '계란 (전란)', basePer70: 100, unit: 'g (약 2개)' },
      { food: '바나나',      basePer70: 100, unit: 'g' }
    ]},
    { time: '12:30', name: '점심', items: [
      { food: '잡곡밥',   basePer70: 200, unit: 'g' },
      { food: '닭가슴살', basePer70: 150, unit: 'g' },
      { food: '김치',     basePer70: 50,  unit: 'g' },
      { food: '계란찜',   basePer70: 120, unit: 'g' }
    ]},
    { time: '16:00', name: '간식', items: [
      { food: '단백질 바', basePer70: 50,  unit: 'g' },
      { food: '사과',      basePer70: 150, unit: 'g' }
    ]},
    { time: '19:30', name: '저녁', items: [
      { food: '현미밥',      basePer70: 180, unit: 'g' },
      { food: '소고기 안심', basePer70: 150, unit: 'g' },
      { food: '시금치 나물', basePer70: 80,  unit: 'g' },
      { food: '두부',        basePer70: 80,  unit: 'g' }
    ]}
  ]
};

// ===== 상태 =====
let userInfo = { height: 175, weight: 70, age: 25, gender: '남', activity: 1.55 };
let currentGoal = '유지';
let selectedDayIdx = 0;

// ===== Step 1: 입력 =====
const uploadBox   = document.getElementById('uploadBox');
const fileInput   = document.getElementById('fileInput');
const uploadInner = document.getElementById('uploadInner');

if (uploadBox && fileInput && uploadInner) {

  uploadBox.addEventListener('click', () => fileInput.click());

  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
  });
  uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('drag-over'));
  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      userInfo.gender = btn.dataset.gender;
    });
  });

  const bfInputEl = document.getElementById('bodyFatInput');
  if (bfInputEl) {
    bfInputEl.addEventListener('input', () => bfInputEl.classList.remove('input-error'));
  }

  document.getElementById('analyzeBtn').addEventListener('click', () => {
    if (!Store.getPhoto()) {
      const warn = document.getElementById('photoWarning');
      if (warn) warn.style.display = 'block';
      return;
    }

    const height  = parseFloat(document.getElementById('heightInput').value);
    const weight  = parseFloat(document.getElementById('weightInput').value);
    const age     = parseFloat(document.getElementById('ageInput').value);
    const bodyFat = parseFloat(document.getElementById('bodyFatInput').value);

    if (!height || height < 100 || height > 250) { alert('키를 올바르게 입력해주세요. (100~250cm)'); return; }
    if (!weight || weight < 20  || weight > 300)  { alert('체중을 올바르게 입력해주세요. (20~300kg)'); return; }
    if (!age    || age < 10     || age > 100)      { alert('나이를 올바르게 입력해주세요. (10~100세)'); return; }
    if (bodyFat && (bodyFat < 3 || bodyFat > 60)) {
      alert('체지방률은 3~60% 사이로 입력해주세요. (모르면 비워두세요)');
      const bfInput = document.getElementById('bodyFatInput');
      if (bfInput) { bfInput.focus(); bfInput.classList.add('input-error'); }
      return;
    }

    userInfo.height   = height;
    userInfo.weight   = weight;
    userInfo.age      = age;
    userInfo.activity = parseFloat(document.getElementById('activityInput').value) || 1.55;

    const btn = document.getElementById('analyzeBtn');
    btn.innerHTML = '<span class="spinner-small"></span> 결과 계산 중...';
    btn.disabled  = true;

    setTimeout(() => {
      analyzeBody();
      btn.innerHTML = 'AI로 체형 분석하기';
      btn.disabled  = false;
    }, 1500);
  });
}

// ===== 분석 계산 =====
function analyzeBody() {
  if (typeof Store !== 'undefined') {
    const prevUser = Store.get(STORAGE_KEYS.USER) || {};
    Store.set(STORAGE_KEYS.USER, { ...prevUser, ...userInfo });
  }

  const h      = userInfo.height / 100;
  const rawBmi = userInfo.weight / (h * h);

  const aiResult   = (typeof Store !== 'undefined') ? Store.get(STORAGE_KEYS.AI_RESULT) : null;
  const photoScore = (typeof Store !== 'undefined' && Store.get(STORAGE_KEYS.PHOTO_SCORE)) || 0.5;

  const userBodyFat  = parseFloat(document.getElementById('bodyFatInput')?.value);
  const hasUserInput = !isNaN(userBodyFat) && userBodyFat >= 3 && userBodyFat <= 60;

  let bmi, bodyFat;
  if (hasUserInput) {
    bmi     = rawBmi;
    bodyFat = userBodyFat;
  } else if (aiResult && typeof aiResult.bodyFat === 'number') {
    bmi     = Math.max(15, Math.min(40, rawBmi + (aiResult.bmiAdjust || 0)));
    bodyFat = Math.max(5, Math.min(45, aiResult.bodyFat));
  } else {
    bmi = rawBmi;
    const photoBased = 6 + photoScore * 32;
    const sexFactor  = userInfo.gender === '남' ? 1 : 0;
    const bmiBased   = 1.20 * bmi + 0.23 * userInfo.age - 10.8 * sexFactor - 5.4 + 2;
    bodyFat = Math.round((photoBased * 0.6 + bmiBased * 0.4) * 10) / 10;
    if (userInfo.gender === '여') bodyFat = Math.min(45, bodyFat + 5);
    bodyFat = Math.max(5, Math.min(45, bodyFat));
  }

  const bmr = userInfo.gender === '남'
    ? 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age + 5
    : 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age - 161;

  const tdee = Math.round(bmr * userInfo.activity);

  let bmiStatus     = '정상';
  let recommendGoal = '유지';
  if (bmi < 18.5)    { bmiStatus = '저체중'; recommendGoal = '벌크업'; }
  else if (bmi < 23) { bmiStatus = '정상';   recommendGoal = '유지'; }
  else if (bmi < 25) { bmiStatus = '과체중'; recommendGoal = '다이어트'; }
  else               { bmiStatus = '비만';   recommendGoal = '다이어트'; }

  const muscleMass = (aiResult && typeof aiResult.muscle === 'number')
    ? Math.round(aiResult.muscle * 10) / 10
    : (() => {
        const fatMass  = userInfo.weight * (bodyFat / 100);
        const leanMass = userInfo.weight - fatMass;
        return Math.round((leanMass * 0.44 / userInfo.weight) * 100 * 10) / 10;
      })();

  const protein = Math.round(userInfo.weight * dietConfig[recommendGoal].proteinPerKg);

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  const step2El = document.getElementById('step2');
  if (step2El) step2El.style.display = 'block';

  setText('bmiValue', bmi.toFixed(1));
  setText('bmrValue', Math.round(bmr));
  setText('tdeeValue', tdee);
  setText('bfValue', bodyFat.toFixed(1));
  setText('mmValue', muscleMass.toFixed(1));
  setText('proteinValue', protein);

  window.lastMetrics = {
    bmi:     bmi.toFixed(1),
    bmr:     String(Math.round(bmr)),
    tdee:    String(tdee),
    bodyFat: bodyFat.toFixed(1),
    muscle:  muscleMass.toFixed(1),
    protein: String(protein),
  };

  setText('bmiStatus', bmiStatus);

  const hudH = document.getElementById('hudHeight');
  const hudW = document.getElementById('hudWeight');
  if (hudH) hudH.textContent = userInfo.height;
  if (hudW) hudW.textContent = userInfo.weight;

  const donutFill = document.getElementById('bmiDonutFill');
  if (donutFill) {
    const pct = Math.min(Math.max((bmi - 10) / 25, 0), 1);
    const dash = Math.round(pct * 314);
    setTimeout(() => {
      donutFill.style.strokeDasharray = `${dash} 314`;
      donutFill.style.stroke = bmi < 18.5 ? '#00d4ff' : bmi < 23 ? '#00ff88' : bmi < 25 ? '#ff8800' : '#ff0033';
    }, 200);
  }

  document.querySelectorAll('.gr-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.gr-card[data-goal="${recommendGoal}"]`)?.classList.add('active');
  currentGoal = recommendGoal;

  setTimeout(() => document.getElementById('step2').scrollIntoView({ behavior: 'smooth' }), 100);
}

// ===== 목표 선택 =====
document.querySelectorAll('.gr-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.gr-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    currentGoal = card.dataset.goal;
    if (typeof renderWeekPlan === 'function' && document.getElementById('weekGrid')) {
      renderWeekPlan();
    }
  });
});

// ===== 주간 플랜 렌더 =====
function renderWeekPlan() {
  const plan     = weekPlanByGoal[currentGoal];
  const weekGrid = document.getElementById('weekGrid');
  if (!weekGrid) return;

  weekGrid.innerHTML = plan.map((d, i) => `
    <div class="day-card" data-idx="${i}">
      <div class="day-name">${d.day}</div>
      <div class="day-emoji">${partEmojis[d.part]}</div>
      <div class="day-part">${d.part}</div>
    </div>
  `).join('');

  document.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('click', () => showDay(parseInt(card.dataset.idx)));
  });
}

// ===== 일별 상세 =====
function showDay(idx) {
  selectedDayIdx = idx;
  if (typeof Store !== 'undefined') Store.set(STORAGE_KEYS.SELECTED_DAY, idx);
  const plan = weekPlanByGoal[currentGoal];
  const day  = plan[idx];

  document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.day-card[data-idx="${idx}"]`).classList.add('active');

  document.getElementById('selectedDay').textContent     = day.day + '요일';
  document.getElementById('selectedDayPart').textContent = day.part;
  document.getElementById('goalLabel').textContent       = currentGoal;

  const videoWrap = document.getElementById('videoWrap');
  const videoId   = partVideos[day.part];

  if (!videoId) {
    videoWrap.innerHTML = `
      <div class="rest-card">
        <div class="rest-emoji">😴</div>
        <div class="rest-title">완전 휴식의 날</div>
        <div class="rest-sub">근육 회복 · 충분한 수면 · 스트레칭</div>
      </div>`;
  } else {
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    videoWrap.innerHTML = `
      <a href="${watchUrl}" target="_blank" class="video-card">
        <img src="${thumbUrl}" class="video-thumb" alt="${day.part}"
             onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'">
        <div class="video-overlay">
          <div class="play-icon">▶</div>
          <div class="play-text">${day.part} 자세 영상</div>
        </div>
      </a>`;
  }

  renderMuscleMap(day.part);
  renderDiet();
  document.getElementById('step4').style.display = 'block';
  setTimeout(() => document.getElementById('step4').scrollIntoView({ behavior: 'smooth' }), 100);
}

// ===== 근육 그림 렌더 =====
const MUSCLE_IMG_BASE = 'images/';
const muscleImageByPart = {
  '가슴':   MUSCLE_IMG_BASE + 'chest.jpg',
  '등':     MUSCLE_IMG_BASE + 'back.png',
  '하체':   MUSCLE_IMG_BASE + 'leg.png',
  '어깨':   MUSCLE_IMG_BASE + 'shoulder.jpg',
  '팔':     MUSCLE_IMG_BASE + 'arm.png',
  '복근':   MUSCLE_IMG_BASE + 'abs.jpg',
  '유산소': null,
  '휴식':   null
};

const partEmojiBig = {
  '가슴': '💪', '등': '🔙', '하체': '🦵', '어깨': '🏋️',
  '팔': '💪', '복근': '🔥', '유산소': '🏃', '휴식': '🛌'
};

function renderMuscleMap(part) {
  const wrap = document.getElementById('muscleMapWrap');
  if (!wrap) return;

  const imageSrc = muscleImageByPart[part];

  if (part === '휴식') {
    wrap.innerHTML = `
      <div class="muscle-rest">
        <div class="muscle-rest-emoji">🛌</div>
        <div class="muscle-rest-text">오늘은 휴식의 날 — 스트레칭만</div>
      </div>`;
    return;
  }

  if (!imageSrc) {
    const emoji = partEmojiBig[part] || '💪';
    wrap.innerHTML = `
      <div class="muscle-rest">
        <div class="muscle-rest-emoji" style="font-size:72px;">${emoji}</div>
        <div class="muscle-rest-text" style="font-size:18px; color:#fff;">
          오늘은 <strong style="color:#ff0033; font-size:22px;">${part}</strong> 운동
        </div>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="muscle-card">
      <div class="muscle-image-wrap">
        <img src="${imageSrc}" alt="${part} 근육" class="muscle-image"
             onerror="this.parentElement.innerHTML='<div class=\\'muscle-image-fallback\\'>이미지 로드 실패</div>'">
      </div>
      <div class="muscle-card-label">${part}</div>
    </div>
  `;
}

// ===== 식단 렌더 =====
function renderDiet() {
  const config     = dietConfig[currentGoal];
  const storedUser = (typeof Store !== 'undefined') ? Store.get(STORAGE_KEYS.USER) : null;
  const latestWeight = (typeof Weights !== 'undefined') ? Weights.sorted().slice(-1)[0]?.kg : null;
  const w          = (storedUser && storedUser.weight) ? parseFloat(storedUser.weight)
                   : latestWeight ? latestWeight
                   : userInfo.weight || 70;
  const totalKcal  = Math.round(w * config.kcalPerKg);
  const totalP     = Math.round(w * config.proteinPerKg);
  const totalC     = Math.round((totalKcal * config.carbRatio) / 4);
  const totalF     = Math.round((totalKcal * config.fatRatio) / 9);

  document.getElementById('dietSummary').innerHTML = `
    <div class="summary-grid">
      <div class="sum-item"><div class="sum-label">하루 칼로리</div><div class="sum-value">${totalKcal}</div><div class="sum-unit">kcal</div></div>
      <div class="sum-item"><div class="sum-label">단백질</div><div class="sum-value">${totalP}</div><div class="sum-unit">g</div></div>
      <div class="sum-item"><div class="sum-label">탄수화물</div><div class="sum-value">${totalC}</div><div class="sum-unit">g</div></div>
      <div class="sum-item"><div class="sum-label">지방</div><div class="sum-value">${totalF}</div><div class="sum-unit">g</div></div>
    </div>
    <div class="summary-note">기준 체중 ${w}kg · 목표 ${currentGoal}</div>
  `;

  const meals = mealTemplates[currentGoal];
  const scale = w / 70;
  document.getElementById('mealList').innerHTML = meals.map(meal => `
    <div class="meal-card">
      <div class="meal-header">
        <div class="meal-time">${meal.time}</div>
        <div class="meal-name">${meal.name}</div>
      </div>
      <div class="meal-items">
        ${meal.items.map(i => {
          const amt = Math.round(i.basePer70 * scale);
          return `<div class="meal-item">
            <div class="mi-food">${i.food}</div>
            <div class="mi-amount">${amt}${i.unit.startsWith('g') ? '' : ' '}${i.unit}</div>
          </div>`;
        }).join('')}
      </div>
      <a href="https://www.coupang.com/np/search?q=${encodeURIComponent(meal.items.map(i=>i.food).join('+'))}" target="_blank" class="meal-shop-link">쿠팡에서 재료 구매하기 →</a>
    </div>
  `).join('');
}
