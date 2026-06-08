/* ============================================
   FitTube — 공통 스크립트 (전 페이지 공유)
   localStorage 저장/로드, 페이지 가드, 진행 표시기, PWA 등록
   ============================================ */

// ===== PWA — 서비스 워커 등록 (홈화면 설치 + 오프라인) =====
// ⚠️ file:// 에선 동작 안 함. http(localhost) 또는 https 필요.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('[PWA] 서비스 워커 등록됨 — 설치/오프라인 가능'))
      .catch(err => console.warn('[PWA] 서비스 워커 등록 실패:', err));
  });
}

const STORAGE_KEYS = {
  USER:           'fittube_user',
  WEIGHTS:        'fittube_weights',           // 날짜별 체중 { 'YYYY-MM-DD': 70.5 }
  MYLIST:         'fittube_mylist',            // 나만의 운동 리스트 [{name, done}]
  PHOTO:          'fittube_photo',
  PHOTO_SCORE:    'fittube_photo_score',
  AI_RESULT:      'fittube_ai_result',
  API_KEY:        'fittube_api_key',           // 구버전 Gemini
  REPLICATE_KEY:  'fittube_replicate_key',     // Replicate API 토큰 (r8_...)
  AFTER_PHOTO:    'fittube_after_photo',       // Replicate 가 생성한 AFTER 사진 캐시
  METRICS:        'fittube_metrics',
  GOAL:           'fittube_goal',
  RECORDS:        'fittube_records',
  SELECTED_DAY:   'fittube_selected_day',
};

// ===== 저장/로드 =====
const Store = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('localStorage 저장 실패:', e);
    }
  },
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  clear() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },
  // 사진 — localStorage 우선, 실패 시 sessionStorage 폴백 (페이지 이동 시 유지)
  setPhoto(base64) {
    let saved = false;
    try {
      localStorage.setItem(STORAGE_KEYS.PHOTO, base64);
      saved = true;
    } catch (e) {
      console.warn('localStorage 사진 저장 실패, sessionStorage 시도:', e.message);
    }
    if (!saved) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.PHOTO, base64);
      } catch (e2) {
        console.error('sessionStorage 도 실패:', e2.message);
        window.__photoMemory = base64;
      }
    }
  },
  getPhoto() {
    return localStorage.getItem(STORAGE_KEYS.PHOTO)
        || sessionStorage.getItem(STORAGE_KEYS.PHOTO)
        || window.__photoMemory
        || null;
  }
};

// ===== 비밀번호 해시 (데모 수준 보호) =====
// 브라우저 내장 crypto.subtle 로 SHA-256 → 평문 저장 방지.
// ⚠️ 진짜 서비스는 서버 + bcrypt 필요. 이건 "평문 노출만 막는" 수준.
async function hashPassword(pw) {
  // crypto.subtle 은 https 또는 localhost 에서만 동작 (file:// 일부 브라우저 ❌)
  if (!window.crypto || !window.crypto.subtle) {
    // 폴백 — 환경이 지원 안 하면 간단 변환 (최소한 평문은 아님)
    return 'plain:' + btoa(unescape(encodeURIComponent(pw)));
  }
  const data = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return 'sha256:' + Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== 현재 로그인 사용자 표시 이름 =====
// 구글 로그인 → 이름/이메일, 아이디 로그인 → 아이디. 두 경로를 한 곳에서 처리.
function currentUserLabel() {
  const login = Store.get('fittube_login');
  if (!login) return '';
  // 구글: name 우선, 없으면 이메일 앞부분
  if (login.provider === 'google') {
    if (login.name) return login.name;
    if (login.id && login.id.includes('@')) return login.id.split('@')[0];
  }
  return login.id || '';
}

// ===== 로그인 가드 =====
// 보호 페이지(index/prediction/plan) 진입 시 비로그인이면 login.html 로
function requireLogin() {
  const login = Store.get('fittube_login');
  if (!login || !login.id) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ===== 페이지 가드 =====
// prediction/plan 페이지 진입 시 사진+목표 둘 다 있어야 진행 가능
// (METRICS 는 자동 계산되도록 변경 — [분석하기] 안 눌러도 OK)
function requireAnalysis() {
  const photo = Store.getPhoto();
  const goal  = Store.get(STORAGE_KEYS.GOAL);
  if (!photo || !goal) {
    alert('사진 업로드 + 목표 선택 후 진행해주세요.');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// plan 페이지: 목표까지 선택했어야 함
function requireGoal() {
  if (!requireAnalysis()) return false;
  const goal = Store.get(STORAGE_KEYS.GOAL);
  if (!goal) {
    alert('먼저 목표를 선택해주세요.');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// ===== 진행 표시기 렌더 =====
// HTML의 <div id="progressNav"></div> 자리에 자동 주입
function renderProgressNav(currentPage) {
  const nav = document.getElementById('progressNav');
  if (!nav) return;

  const steps = [
    { key: 'analysis',   label: '01 · 분석',  href: 'index.html' },
    { key: 'prediction', label: '02 · 예측',  href: 'prediction.html' },
    { key: 'plan',       label: '03 · 플랜',  href: 'plan.html' },
  ];

  const metrics = Store.get(STORAGE_KEYS.METRICS);
  const goal    = Store.get(STORAGE_KEYS.GOAL);

  nav.innerHTML = steps.map((s, i) => {
    const isCurrent = s.key === currentPage;
    const isPast    = (s.key === 'analysis' && metrics) ||
                      (s.key === 'prediction' && goal) ||
                      (s.key === 'plan' && currentPage === 'plan');
    const clickable = isPast || isCurrent;
    const cls = [
      'pn-step',
      isCurrent ? 'pn-current' : '',
      isPast && !isCurrent ? 'pn-past' : '',
      !clickable ? 'pn-locked' : '',
    ].filter(Boolean).join(' ');

    const arrow = i < steps.length - 1
      ? '<span class="pn-arrow">›</span>'
      : '';

    const content = `
      <span class="pn-dot"></span>
      <span class="pn-label">${s.label}</span>
    `;

    return clickable
      ? `<a class="${cls}" href="${s.href}">${content}</a>${arrow}`
      : `<span class="${cls}">${content}</span>${arrow}`;
  }).join('');
}

// ===== 페이지 이동 헬퍼 =====
function goTo(page) {
  window.location.href = page;
}

// ===== 레벨 시스템 (게임처럼 — 총 운동일 기반) =====
// 총 운동 일수 → 레벨 + 칭호 + 다음 레벨까지 진행률
function userLevel() {
  const total = Object.keys(Records.all()).filter(k => Records.all()[k]).length;
  // 레벨 구간: 누적 운동일 기준
  const tiers = [
    { lv: 1, title: '헬스 입문',   min: 0,   next: 3 },
    { lv: 2, title: '운동 새싹',   min: 3,   next: 7 },
    { lv: 3, title: '꾸준러',      min: 7,   next: 15 },
    { lv: 4, title: '헬스 초급',   min: 15,  next: 30 },
    { lv: 5, title: '헬스 중급',   min: 30,  next: 50 },
    { lv: 6, title: '헬스 고수',   min: 50,  next: 100 },
    { lv: 7, title: '헬스 마스터', min: 100, next: null },
  ];
  let cur = tiers[0];
  for (const t of tiers) { if (total >= t.min) cur = t; }

  // 다음 레벨까지 진행률 (%)
  let progress = 100, remain = 0;
  if (cur.next != null) {
    const span = cur.next - cur.min;
    const done = total - cur.min;
    progress = Math.min(100, Math.round((done / span) * 100));
    remain = cur.next - total;
  }
  return { level: cur.lv, title: cur.title, total, progress, remain, isMax: cur.next == null };
}

// ===== 주차 계산 (운동 종목 매주 로테이션용) =====
// 앱 첫 사용일을 기준으로 "지금 몇 주차인지" 계산.
// 첫 사용일은 한 번만 저장 (없으면 오늘로 기록).
function appWeekIndex() {
  let start = Store.get('fittube_start_date');
  if (!start) {
    start = todayKey();
    Store.set('fittube_start_date', start);
  }
  // 'YYYY-MM-DD' 두 날짜의 경과 일수 → 주차
  const [sy, sm, sd] = start.split('-').map(Number);
  const startMs = new Date(sy, sm - 1, sd).getTime();
  const [ty, tm, td] = todayKey().split('-').map(Number);
  const todayMs = new Date(ty, tm - 1, td).getTime();
  const days = Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.floor(days / 7));   // 0주차부터
}

// 부위의 운동들 중 "이번 주 종목" 하나 고르기 (주차로 순환)
function weeklyPick(items) {
  if (!items || !items.length) return null;
  return items[appWeekIndex() % items.length];
}

// ===== 운동 자세 영상 (유튜브 검색 링크) =====
// 개별 영상 ID를 모으지 않고 검색으로 연결 → 어떤 운동이든 자동 작동.
function workoutVideoUrl(exerciseName) {
  const q = encodeURIComponent(exerciseName + ' 자세 운동법');
  return `https://www.youtube.com/results?search_query=${q}`;
}

// ===== 운동 기록 (출석 체크) =====
// 저장 형태: { "2026-05-29": true, "2026-05-28": true, ... }
// 날짜는 'YYYY-MM-DD' 문자열 키 (로컬 시간 기준)

// 오늘 날짜를 'YYYY-MM-DD' 로 (로컬 기준 — toISOString 은 UTC라 안 씀)
function todayKey(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const Records = {
  all() {
    return Store.get(STORAGE_KEYS.RECORDS) || {};
  },
  isDone(dateKey) {
    return !!this.all()[dateKey];
  },
  // 오늘 운동 완료 토글 — 켜면 true, 다시 누르면 취소
  toggleToday() {
    const recs = this.all();
    const key = todayKey();
    if (recs[key]) {
      delete recs[key];
    } else {
      recs[key] = true;
    }
    Store.set(STORAGE_KEYS.RECORDS, recs);
    return !!recs[key];
  },
  // 오늘까지 연속으로 운동한 일수 (오늘 안 했으면 어제까지 기준으로 셈)
  streak() {
    const recs = this.all();
    let count = 0;
    const d = new Date();
    // 오늘 안 했으면 어제부터 카운트 (오늘은 아직 기회 남음)
    if (!recs[todayKey(d)]) {
      d.setDate(d.getDate() - 1);
    }
    while (recs[todayKey(d)]) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  },
  // 이번 달 운동한 총 일수
  countThisMonth() {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return Object.keys(this.all()).filter(k => k.startsWith(prefix) && this.all()[k]).length;
  }
};

// ===== 체중 기록 =====
// 저장 형태: { "2026-05-29": 70.5, "2026-05-28": 70.8, ... }
const Weights = {
  all() {
    return Store.get(STORAGE_KEYS.WEIGHTS) || {};
  },
  // 오늘 체중 저장 (같은 날 다시 입력하면 덮어씀)
  setToday(kg) {
    const w = this.all();
    w[todayKey()] = kg;
    Store.set(STORAGE_KEYS.WEIGHTS, w);
  },
  getToday() {
    return this.all()[todayKey()] ?? null;
  },
  // 날짜순 정렬된 배열 [{ date, kg }, ...] — 그래프 그릴 때 사용
  sorted() {
    const w = this.all();
    return Object.keys(w)
      .sort()
      .map(date => ({ date, kg: w[date] }));
  },
  // 최근 N개만 (그래프가 너무 빽빽하지 않게)
  recent(n) {
    const arr = this.sorted();
    return n ? arr.slice(-n) : arr;
  }
};

// ===== 나만의 운동 리스트 =====
// 저장 형태: [{ name: '푸시업 30개', done: false }, ...]
const MyList = {
  all() {
    return Store.get(STORAGE_KEYS.MYLIST) || [];
  },
  add(name) {
    const list = this.all();
    // 이미 같은 운동이 있으면 중복으로 담지 않음 (전부 담기 여러 번 눌러도 OK)
    if (list.some(item => item.name === name)) {
      return false;   // 중복 — 안 담음
    }
    list.push({ name: name, done: false });
    Store.set(STORAGE_KEYS.MYLIST, list);
    return true;      // 새로 담김
  },
  toggle(index) {
    const list = this.all();
    if (list[index]) {
      list[index].done = !list[index].done;
      Store.set(STORAGE_KEYS.MYLIST, list);
    }
  },
  remove(index) {
    const list = this.all();
    list.splice(index, 1);
    Store.set(STORAGE_KEYS.MYLIST, list);
  }
};
