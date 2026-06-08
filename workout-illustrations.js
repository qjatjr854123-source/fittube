// workout-illustrations.js
// FitTube — 부위별 운동 일러스트 프롬프트 + DALL-E 생성 유틸
// 사용법: import { WORKOUT_PARTS, generateIllustration, generateAllIllustrations } from './workout-illustrations.js'

// ─────────────────────────────────────────────
// 1. 공통 스타일 suffix (모든 프롬프트에 자동 추가됨)
// ─────────────────────────────────────────────
const STYLE_SUFFIX = [
  "flat minimal illustration",
  "friendly approachable character",
  "warm pastel color palette",
  "simple clean outlines",
  "white background",
  "no medical anatomy labels",
  "no bodybuilder physique",
  "beginner fitness app style",
  "everyday office worker body type",
].join(", ");

// ─────────────────────────────────────────────
// 2. 부위별 프롬프트 데이터
// ─────────────────────────────────────────────
export const WORKOUT_PARTS = [
  {
    id: "chest",
    label: "가슴",
    emoji: "🫁",
    representative_exercise: "푸시업",
    prompt: `An ordinary person doing a push-up exercise, ${STYLE_SUFFIX}`,
    // 추가 운동 예시 (필요 시 prompt_alt 사용)
    prompt_alt: `An ordinary person doing a dumbbell chest press on a bench, ${STYLE_SUFFIX}`,
  },
  {
    id: "back",
    label: "등",
    emoji: "🧍",
    representative_exercise: "덤벨 로우",
    prompt: `An ordinary person doing a single-arm dumbbell row exercise, ${STYLE_SUFFIX}`,
    prompt_alt: `An ordinary person doing a lat pulldown machine exercise, ${STYLE_SUFFIX}`,
  },
  {
    id: "lower_body",
    label: "하체",
    emoji: "🦵",
    representative_exercise: "스쿼트",
    prompt: `An ordinary person doing a bodyweight squat exercise, ${STYLE_SUFFIX}`,
    prompt_alt: `An ordinary person doing a forward lunge exercise, ${STYLE_SUFFIX}`,
  },
  {
    id: "shoulder",
    label: "어깨",
    emoji: "💪",
    representative_exercise: "숄더 프레스",
    prompt: `An ordinary person doing a dumbbell shoulder press overhead, ${STYLE_SUFFIX}`,
    prompt_alt: `An ordinary person doing lateral raises with light dumbbells, ${STYLE_SUFFIX}`,
  },
  {
    id: "arm",
    label: "팔",
    emoji: "🤜",
    representative_exercise: "바이셉 컬",
    prompt: `An ordinary person doing a dumbbell bicep curl with a light weight, ${STYLE_SUFFIX}`,
    prompt_alt: `An ordinary person doing a tricep overhead extension, ${STYLE_SUFFIX}`,
  },
  {
    id: "abs",
    label: "복근",
    emoji: "⚡",
    representative_exercise: "크런치",
    prompt: `An ordinary person doing a crunch abdominal exercise on a mat, ${STYLE_SUFFIX}`,
    prompt_alt: `An ordinary person holding a plank position on a yoga mat, ${STYLE_SUFFIX}`,
  },
];

// ─────────────────────────────────────────────
// 3. DALL-E API 호출 유틸
//    OpenAI API key는 환경변수 또는 호출 시 전달
// ─────────────────────────────────────────────

/**
 * 단일 부위 일러스트 생성
 * @param {string} partId - WORKOUT_PARTS의 id값 (예: "chest")
 * @param {string} apiKey - OpenAI API key
 * @param {object} options - 선택 옵션
 * @param {boolean} options.useAlt - 대체 프롬프트 사용 여부 (기본: false)
 * @param {"256x256"|"512x512"|"1024x1024"} options.size - 이미지 크기 (기본: "512x512")
 * @returns {Promise<{partId, label, url}>}
 */
export async function generateIllustration(partId, apiKey, options = {}) {
  const { useAlt = false, size = "512x512" } = options;

  const part = WORKOUT_PARTS.find((p) => p.id === partId);
  if (!part) throw new Error(`Unknown partId: ${partId}`);

  const prompt = useAlt ? part.prompt_alt : part.prompt;

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality: "standard",
      style: "natural", // "vivid" 보다 일러스트에 적합
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`DALL-E API error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    partId: part.id,
    label: part.label,
    url: data.data[0].url,
  };
}

/**
 * 전체 6개 부위 일러스트 순차 생성
 * @param {string} apiKey - OpenAI API key
 * @param {object} options - generateIllustration과 동일한 옵션
 * @param {function} onProgress - 진행 콜백 (partId, index, total) => void
 * @returns {Promise<Array<{partId, label, url}>>}
 */
export async function generateAllIllustrations(apiKey, options = {}, onProgress = null) {
  const results = [];

  for (let i = 0; i < WORKOUT_PARTS.length; i++) {
    const part = WORKOUT_PARTS[i];
    if (onProgress) onProgress(part.id, i + 1, WORKOUT_PARTS.length);

    const result = await generateIllustration(part.id, apiKey, options);
    results.push(result);

    // API rate limit 방지: 요청 간 500ms 간격
    if (i < WORKOUT_PARTS.length - 1) {
      await new Promise((res) => setTimeout(res, 500));
    }
  }

  return results;
}

// ─────────────────────────────────────────────
// 4. 사용 예시
// ─────────────────────────────────────────────
/*

// 단일 생성
const result = await generateIllustration("chest", "sk-...");
console.log(result.url); // https://oaidalleapiprodscus.blob.core.windows.net/...

// 전체 생성 (진행률 표시 포함)
const all = await generateAllIllustrations(
  "sk-...",
  { size: "1024x1024" },
  (partId, current, total) => {
    console.log(`생성 중: ${partId} (${current}/${total})`);
  }
);

// 결과 활용
all.forEach(({ label, url }) => {
  const img = document.createElement("img");
  img.src = url;
  img.alt = `${label} 운동 일러스트`;
  document.body.appendChild(img);
});

*/
