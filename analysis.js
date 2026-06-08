/* ============================================
   analysis.js — 분석 페이지 전용
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  if (!requireLogin()) return;

  // API 키만 초기화 (사진/분석결과/목표 유지)
  localStorage.removeItem(STORAGE_KEYS.API_KEY);

  renderProgressNav('analysis');

  // 사진 업로드 — 원본 즉시 저장 + 백그라운드 압축
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있어요.');
        fileInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const original = ev.target.result;

        // 미리보기는 원본으로 즉시 표시 (화면용 — 저장과는 별개)
        const uploadInner = document.getElementById('uploadInner');
        if (uploadInner) {
          uploadInner.innerHTML = `<img src="${original}" class="upload-preview" alt="uploaded">`;
        }
        const warn = document.getElementById('photoWarning');
        if (warn) warn.style.display = 'none';

        // ★ 저장은 '압축본'으로 먼저 처리한다.
        //   원본(고해상도)을 localStorage에 바로 넣으면 5MB 한도를 넘겨
        //   저장이 조용히 실패하고, 다음 페이지에서 사진이 사라진다.
        //   진행 가능(다음 버튼) 표시도 저장이 끝난 뒤에만 한다.
        compressImage(original, 700, 0.65)
          .then(compressed => {
            const toSave = (compressed && compressed.length < original.length) ? compressed : original;
            Store.setPhoto(toSave);
          })
          .catch(() => {
            // 압축 실패 시 원본이라도 저장 시도
            Store.setPhoto(original);
          })
          .then(() => {
            const check = Store.getPhoto();
            console.log('[사진 저장 결과]', check ? `OK (${check.length} chars)` : '실패');
            if (!check) {
              alert('사진 저장에 실패했어요. 더 작은 사진으로 다시 시도해주세요.');
              return;
            }
            Store.set(STORAGE_KEYS.PHOTO_SCORE, computePhotoScore(file, original));
            markGuideStep('photo');
            checkReadyToProceed();
          });
      };
      reader.readAsDataURL(file);
    });
  }

  // 이미지 압축 — 긴 변 maxSide 로 리사이즈 + JPEG quality
  function compressImage(base64, maxSide, quality) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  }

  // 분석 버튼 후처리 — 시뮬레이션 모드 (사진 해시 기반)
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      if (!Store.getPhoto()) {
        const warn = document.getElementById('photoWarning');
        if (warn) warn.style.display = 'block';
        document.getElementById('uploadBox')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      setTimeout(() => {
        saveAnalysisToStorage();
        showNextAction();
      }, 500);
    });
  }

  // 사진 + 목표 선택만 해도 바로 버튼 표시
  // (분석 버튼 안 눌러도 넘어갈 수 있게)
  const observer = new MutationObserver(() => checkReadyToProceed());
  const grCards = document.querySelectorAll('.gr-card');
  grCards.forEach(c => observer.observe(c, { attributes: true, attributeFilter: ['class'] }));

  // 목표 카드 클릭 → script.js 가 active/currentGoal 처리
  // 여기서는 Store 저장 + 가이드 체크만 위임
  document.querySelectorAll('.gr-card').forEach(card => {
    card.addEventListener('click', () => {
      setTimeout(() => {
        const active = document.querySelector('.gr-card.active');
        if (active) Store.set(STORAGE_KEYS.GOAL, active.dataset.goal);
        markGuideStep('goal');
        checkReadyToProceed();
      }, 50);
    });
  });

  // 페이지 진입 시 사진 미리 있으면 1단계 표시 (재진입 대비)
  if (Store.getPhoto()) markGuideStep('photo');
  if (Store.get(STORAGE_KEYS.GOAL)) markGuideStep('goal');
  checkReadyToProceed();

  // 다음 페이지 버튼 — 항상 최신 입력값으로 다시 분석
  const goNext = document.getElementById('goPredictionBtn');
  if (goNext) {
    goNext.addEventListener('click', () => {
      if (!Store.get(STORAGE_KEYS.GOAL)) {
        Store.set(STORAGE_KEYS.GOAL, '유지');
      }
      // 매번 입력값 다시 읽어서 분석 (체지방률 변경 반영)
      if (typeof analyzeBody === 'function') {
        try {
          userInfo.height   = parseFloat(document.getElementById('heightInput').value) || 175;
          userInfo.weight   = parseFloat(document.getElementById('weightInput').value) || 70;
          userInfo.age      = parseFloat(document.getElementById('ageInput')?.value) || 25;
          userInfo.activity = parseFloat(document.getElementById('activityInput')?.value) || 1.55;
          const genderBtn = document.querySelector('.gender-btn.active');
          if (genderBtn) userInfo.gender = genderBtn.dataset.gender;
          analyzeBody();
          saveAnalysisToStorage();
        } catch (e) {
          console.warn('자동 분석 스킵:', e);
        }
      }
      goTo('prediction.html');
    });
  }
});

function saveAnalysisToStorage() {
  const height    = parseFloat(document.getElementById('heightInput').value) || 175;
  const weight    = parseFloat(document.getElementById('weightInput').value) || 70;
  const age       = parseFloat(document.getElementById('ageInput')?.value) || 25;
  const activity  = parseFloat(document.getElementById('activityInput')?.value) || 1.55;
  const genderBtn = document.querySelector('.gender-btn.active');
  const gender    = genderBtn ? genderBtn.dataset.gender : '남';

  const bodyFatVal = parseFloat(document.getElementById('bodyFatInput')?.value);
  Store.set(STORAGE_KEYS.USER, {
    height, weight, age, activity, gender,
    bodyFat: (bodyFatVal && bodyFatVal >= 3 && bodyFatVal <= 60) ? bodyFatVal : null
  });

  // STEP01 체중 → 체중 기록(그래프)에 오늘 날짜로 자동 저장
  // (사용자가 체중 변화 섹션에 따로 입력하지 않아도 자동 기록됨)
  if (typeof Weights !== 'undefined' && weight >= 20 && weight <= 300) {
    Weights.setToday(weight);
    if (typeof window.refreshWeightGraph === 'function') window.refreshWeightGraph();
  }

  const metrics = {
    bmi:       document.getElementById('bmiValue').textContent,
    bmiStatus: document.getElementById('bmiStatus').textContent,
    bmr:       document.getElementById('bmrValue').textContent,
    tdee:      document.getElementById('tdeeValue').textContent,
    bodyFat:   document.getElementById('bodyFatInput')?.value || '20',
    muscle:    '38',
    protein:   document.getElementById('proteinValue').textContent,
  };
  Store.set(STORAGE_KEYS.METRICS, metrics);

  const activeGoal = document.querySelector('.gr-card.active');
  if (activeGoal) Store.set(STORAGE_KEYS.GOAL, activeGoal.dataset.goal);

  renderProgressNav('analysis');
}

function showNextAction() {
  const actions = document.getElementById('pageActions');
  if (actions) actions.style.display = 'flex';
  markGuideStep('plan'); // 분석 완료 = 3단계 활성
}

// 시작 가이드 단계 체크 (1=photo / 2=goal / 3=plan)
function markGuideStep(stepKey) {
  const step = document.querySelector(`.sg-step[data-step="${stepKey}"]`);
  if (step) step.classList.add('done');
}

// 사진 + 목표 = 다음 페이지 진행 가능 → 버튼 자동 표시
function checkReadyToProceed() {
  const hasPhoto = !!Store.getPhoto();
  const hasGoal  = !!Store.get(STORAGE_KEYS.GOAL);
  if (hasPhoto && hasGoal) {
    // 분석 안 눌렀어도 기본값으로 metrics 저장
    if (!Store.get(STORAGE_KEYS.METRICS)) {
      const height = parseFloat(document.getElementById('heightInput')?.value) || 175;
      const weight = parseFloat(document.getElementById('weightInput')?.value) || 70;
      const age    = parseFloat(document.getElementById('ageInput')?.value) || 25;
      const gender = document.querySelector('.gender-btn.active')?.dataset.gender || '남';
      const h = height / 100;
      const bmi = weight / (h * h);
      const bmr = gender === '남'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
      const activity = parseFloat(document.getElementById('activityInput')?.value) || 1.55;
      const tdee = Math.round(bmr * activity);
      const bodyFatVal = parseFloat(document.getElementById('bodyFatInput')?.value);
      Store.set(STORAGE_KEYS.USER, { height, weight, age, activity, gender,
        bodyFat: (bodyFatVal >= 3 && bodyFatVal <= 60) ? bodyFatVal : null });

      // STEP01 체중 → 체중 기록(그래프)에 자동 저장
      if (typeof Weights !== 'undefined' && weight >= 20 && weight <= 300) {
        Weights.setToday(weight);
        if (typeof window.refreshWeightGraph === 'function') window.refreshWeightGraph();
      }
      Store.set(STORAGE_KEYS.METRICS, {
        bmi: bmi.toFixed(1), bmiStatus: bmi < 18.5 ? '저체중' : bmi < 23 ? '정상' : bmi < 25 ? '과체중' : '비만',
        bmr: Math.round(bmr), tdee, bodyFat: bodyFatVal || '', muscle: '38',
        protein: Math.round(weight * 1.6)
      });
    }
    markGuideStep('plan');
    showNextAction();
  }
}

// 사진 고유 점수 (0~1) — 시뮬레이션용
function computePhotoScore(file, base64) {
  let h = 0;
  const str = (file.name || '') + '|' + file.size + '|' + base64.substring(100, 500);
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h % 1000) / 1000;
}

// ===== Replicate API — 이미지 변환 (BEFORE → AFTER) =====
// 모델: timothybrooks/instruct-pix2pix (텍스트 지시로 사진 편집)
// 약 $0.005/회 + 10초 대기
async function callReplicate(apiKey, photoBase64, goal) {
  if (!apiKey || !apiKey.startsWith('r8_')) {
    throw new Error('Replicate 키 형식 오류 (r8_... 로 시작)');
  }

  const prompts = {
    '벌크업':   'make this person more muscular, bigger arms and chest, lean muscle gain',
    '다이어트': 'make this person leaner and slimmer, lower body fat, fit physique',
    '유지':     'subtle improvement, slightly more defined muscle tone, same body shape'
  };
  const prompt = prompts[goal] || prompts['유지'];

  // Replicate 는 CORS 문제로 브라우저 직접 호출 차단 가능
  // 프록시 (https://corsproxy.io/) 경유 — 임시 데모용
  const proxy = 'https://corsproxy.io/?';
  const endpoint = 'https://api.replicate.com/v1/predictions';

  // 1단계: 예측 시작
  const startRes = await fetch(proxy + encodeURIComponent(endpoint), {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: '30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f', // instruct-pix2pix
      input: {
        image: photoBase64,
        prompt: prompt,
        num_inference_steps: 20,
        image_guidance_scale: 1.5,
        guidance_scale: 7.5,
      }
    })
  });

  if (!startRes.ok) {
    const err = await startRes.text();
    throw new Error(`Replicate 시작 실패 ${startRes.status}: ${err.substring(0, 150)}`);
  }

  const startData = await startRes.json();
  const predictionId = startData.id;
  const getUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;

  // 2단계: 완료될 때까지 폴링 (최대 30초)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const pollRes = await fetch(proxy + encodeURIComponent(getUrl), {
      headers: { 'Authorization': `Token ${apiKey}` }
    });
    const pollData = await pollRes.json();
    if (pollData.status === 'succeeded') {
      return pollData.output[0]; // 결과 이미지 URL
    }
    if (pollData.status === 'failed' || pollData.status === 'canceled') {
      throw new Error(`Replicate 처리 실패: ${pollData.error || 'unknown'}`);
    }
  }
  throw new Error('Replicate 시간 초과 (30초)');
}

// ===== Google Gemini Vision API 호출 =====
// 사진 → 체형 분석 → { bodyFat, muscle, bmiAdjust, summary }
async function callGeminiVision(apiKey, photoBase64) {
  const match = photoBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error('사진 형식 오류');
  const mimeType = match[1];
  const b64      = match[2];

  // 의료/건강 관점으로 프롬프트 재구성 — 안전 필터 회피
  const prompt = `당신은 피트니스 트레이너입니다. 이 사진의 인물 체형을 피트니스 관점에서 평가해주세요.
의료 진단이 아닌 일반적인 추정치이며, 운동 코칭 목적입니다.

다음 JSON 형식으로만 응답 (마크다운 코드블럭 없이):
{"bodyFat": 숫자, "muscle": 숫자, "bmiAdjust": 숫자, "summary": "한 줄"}

- bodyFat: 체지방률 추정 (5~45 사이 숫자)
- muscle: 근육량 추정 (20~55 사이 숫자)
- bmiAdjust: BMI 보정값 (-5~+5, 근육질 음수, 살찐 양수)
- summary: 체형 한 줄 평가 (한국어)`;

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: b64 } }
      ]
    }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 300,
      responseMimeType: 'application/json'
    },
    // 안전 필터 완화 (피트니스/근육 사진 차단 방지)
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ]
  };

  // 모델 순차 시도 — gemini-1.5-flash 가 안정적으로 작동 확인됨
  const models = [
    'gemini-1.5-flash',         // ✅ 작동 확인
    'gemini-1.5-flash-latest',  // 폴백
    'gemini-2.0-flash',         // 폴백
    'gemini-2.5-flash'          // 폴백
  ];

  let lastError = '';
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.status === 404) {
      lastError = `${model} 없음`;
      continue; // 다음 모델 시도
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini ${res.status}: ${errText.substring(0, 150)}`);
    }

    const data = await res.json();
    console.log('[Gemini 응답 전체]', JSON.stringify(data, null, 2));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      const finishReason = data.candidates?.[0]?.finishReason || '알수없음';
      const blockReason  = data.promptFeedback?.blockReason || '';
      throw new Error(`응답 비어있음 (사유: ${finishReason} ${blockReason}) — 사진 변경 추천`);
    }

    const jsonText = text.replace(/^```json\s*|\s*```$/g, '').trim();
    return JSON.parse(jsonText);
  }

  throw new Error(`사용 가능한 모델 없음 — 마지막: ${lastError}`);
}
