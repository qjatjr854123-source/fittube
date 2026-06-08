/* ============================================
   firebase-config.js — Firebase 초기화 (FitTube)
   ============================================
   ⚠️ 이 키들은 웹에 공개되는 게 정상입니다 (브라우저로 가는 공개 설정값).
      진짜 비밀키가 아니에요 — 안심하고 써도 됩니다.

   ⚠️ 중요: 이 앱은 file:/// (더블클릭) 으로 열면 구글 로그인이 거부됩니다.
      반드시 로컬 서버(예: VS Code Live Server, http://localhost:...) 로 열어야 동작합니다.
   ============================================ */

// CDN(compat) 방식 — npm/빌드 도구 없이 <script> 태그만으로 동작
// (login.html 에서 firebase-app-compat.js / firebase-auth-compat.js 를 먼저 로드)

const firebaseConfig = {
  apiKey: "AIzaSyBjycl2oicD7CnmoKmEIOsKL97KbwmYJ6s",
  authDomain: "fittube-88639.firebaseapp.com",
  projectId: "fittube-88639",
  storageBucket: "fittube-88639.firebasestorage.app",
  messagingSenderId: "107777014131",
  appId: "1:107777014131:web:6f67bebf8f3178583aed06",
  measurementId: "G-9ZDHM2CB05"
};

// file:// 환경에서는 Firebase 초기화 스킵 (에러 방지)
if (location.protocol !== 'file:') {
  firebase.initializeApp(firebaseConfig);
  var firebaseAuth = firebase.auth();
  var googleProvider = new firebase.auth.GoogleAuthProvider();
}
