/* ============================================
   sw.js — 서비스 워커 (PWA: 설치 + 오프라인)
   ============================================
   앱 핵심 파일을 캐시해서:
   1) 폰 홈화면에 "설치" 가능 (브라우저가 SW 있으면 설치 제안)
   2) 인터넷 끊겨도 열림 (캐시에서 불러옴)
   파일을 수정하면 CACHE_VERSION 숫자를 올려야 새 버전이 반영됨.
   ============================================ */

const CACHE_VERSION = 'fittube-v6';

// 오프라인에서도 열려야 하는 핵심 파일들
const CORE_ASSETS = [
  './',
  './index.html',
  './login.html',
  './signup.html',
  './prediction.html',
  './plan.html',
  './terms.html',
  './profile.html',
  './style.css',
  './shared.css',
  './login.css',
  './shared.js',
  './script.js',
  './analysis.js',
  './attendance.js',
  './weight.js',
  './mylist.js',
  './exercise-db.js',
  './today.js',
  './badges.js',
  './sticky-cards.js',
  './profile.js',
  './login.js',
  './signup.js',
  './prediction.js',
  './plan.js',
  './firebase-config.js',
  './manifest.json',
  './icon.svg',
  // 운동 부위 이미지 (영문 파일명 — 배포 안전)
  './images/chest.jpg',
  './images/back.png',
  './images/leg.png',
  './images/shoulder.jpg',
  './images/arm.png',
  './images/abs.jpg',
];

// 설치 — 핵심 파일 캐시에 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())   // 새 SW 바로 활성화
      .catch(err => console.warn('[SW] 캐시 일부 실패(무시):', err))
  );
});

// 활성화 — 옛 버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청 가로채기 — 캐시 우선, 없으면 네트워크 (cache-first)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // GET 만 처리. 외부 도메인(유튜브·firebase·CDN)은 그냥 네트워크로.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req)
        .then(res => {
          // 새로 받은 같은-출처 파일은 캐시에 추가 (다음엔 오프라인 OK)
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html')); // 완전 오프라인 폴백
    })
  );
});
