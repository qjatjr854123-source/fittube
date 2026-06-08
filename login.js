/* ============================================
   login.js — 로그인 (Firebase Auth 이메일/비번 + 구글)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const idInput    = document.getElementById('loginId');   // 이메일 입력
  const pwInput    = document.getElementById('loginPw');
  const loginBtn   = document.getElementById('loginBtn');
  const errorBox   = document.getElementById('loginError');
  const signupLink = document.getElementById('signupLink');
  const forgotLink = document.getElementById('forgotLink');
  const googleBtn  = document.getElementById('googleLoginBtn');

  // 이미 로그인된 사용자 → index.html
  if (typeof firebaseAuth !== 'undefined') {
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        Store.set('fittube_login', {
          id: user.email || user.uid,
          uid: user.uid,
          provider: user.providerData[0]?.providerId || 'email',
          loggedInAt: new Date().toISOString()
        });
        window.location.href = 'index.html';
      }
    });
  } else {
    // Firebase 없으면 localStorage 세션 확인
    const existingUser = Store.get('fittube_login');
    if (existingUser && existingUser.id) {
      window.location.href = 'index.html';
      return;
    }
  }

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }
  function hideError() {
    if (!errorBox) return;
    errorBox.style.display = 'none';
  }
  function markError(input) {
    input.classList.add('login-input-error');
    setTimeout(() => input.classList.remove('login-input-error'), 600);
    input.focus();
  }

  async function login() {
    hideError();
    const email = idInput.value.trim();
    const pw    = pwInput.value;

    if (!email) {
      showError('이메일을 입력해주세요.');
      markError(idInput); return;
    }
    if (!pw) {
      showError('비밀번호를 입력해주세요.');
      markError(pwInput); return;
    }

    if (typeof firebaseAuth === 'undefined') {
      showError('인증 서비스 초기화 실패. 새로고침 해주세요.');
      return;
    }

    loginBtn.disabled = true;
    const span = loginBtn.querySelector('span');
    if (span) span.textContent = '로그인 중...';

    try {
      await firebaseAuth.signInWithEmailAndPassword(email, pw);
      // onAuthStateChanged 에서 자동으로 index.html 이동
    } catch (err) {
      loginBtn.disabled = false;
      if (span) span.textContent = '로그인';

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' ||
          err.code === 'auth/invalid-credential') {
        showError('이메일 또는 비밀번호가 올바르지 않아요.');
        markError(idInput);
      } else if (err.code === 'auth/invalid-email') {
        showError('올바른 이메일 형식이 아니에요.');
        markError(idInput);
      } else if (err.code === 'auth/too-many-requests') {
        showError('로그인 시도가 너무 많아요. 잠시 후 다시 시도해주세요.');
      } else {
        showError('로그인 실패: ' + (err.message || err.code));
      }
    }
  }

  loginBtn.addEventListener('click', login);
  [idInput, pwInput].forEach(input => {
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
    input.addEventListener('input', hideError);
  });

  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'signup.html';
  });

  // 비밀번호 찾기 — Firebase 이메일 재설정
  forgotLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = idInput.value.trim();
    if (!email) {
      showError('이메일을 먼저 입력해주세요.');
      markError(idInput);
      return;
    }
    if (typeof firebaseAuth === 'undefined') return;
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
      errorBox.style.color = '#00ff88';
      errorBox.style.borderColor = '#00ff88';
      errorBox.style.background = 'rgba(0,255,136,0.08)';
      showError('비밀번호 재설정 이메일을 보냈어요! 메일함을 확인해주세요.');
    } catch (err) {
      showError('이메일 전송 실패: ' + (err.message || err.code));
    }
  });

  // 구글 로그인
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      hideError();
      if (typeof firebaseAuth === 'undefined' || typeof googleProvider === 'undefined') {
        showError('구글 로그인 초기화 실패. 새로고침 해주세요.');
        return;
      }
      googleBtn.disabled = true;
      firebaseAuth.signInWithPopup(googleProvider)
        .then(() => { /* onAuthStateChanged 에서 처리 */ })
        .catch((err) => {
          googleBtn.disabled = false;
          if (err.code === 'auth/popup-closed-by-user' ||
              err.code === 'auth/cancelled-popup-request') return;
          if (err.code === 'auth/unauthorized-domain') {
            showError('구글 로그인은 배포 후 사용 가능해요. 이메일로 로그인해주세요.');
          } else {
            showError('구글 로그인 실패: ' + (err.message || err.code));
          }
        });
    });
  }
});