/* ============================================
   login.js — 로그인 페이지 (가짜 인증, localStorage)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const idInput   = document.getElementById('loginId');
  const pwInput   = document.getElementById('loginPw');
  const loginBtn  = document.getElementById('loginBtn');
  const errorBox  = document.getElementById('loginError');
  const signupLink = document.getElementById('signupLink');
  const forgotLink = document.getElementById('forgotLink');
  const googleBtn  = document.getElementById('googleLoginBtn');

  // 이미 로그인된 사용자는 index.html 로 이동
  const existingUser = Store.get('fittube_login');
  if (existingUser && existingUser.id) {
    window.location.href = 'index.html';
    return;
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
    const id = idInput.value.trim();
    const pw = pwInput.value;

    if (!id) {
      showError('아이디를 입력해주세요.');
      markError(idInput);
      return;
    }
    if (id.length < 3) {
      showError('아이디는 3자 이상이어야 합니다.');
      markError(idInput);
      return;
    }
    if (!pw) {
      showError('비밀번호를 입력해주세요.');
      markError(pwInput);
      return;
    }
    if (pw.length < 4) {
      showError('비밀번호는 4자 이상이어야 합니다.');
      markError(pwInput);
      return;
    }

    // 저장된 계정과 매칭
    const accounts = Store.get('fittube_accounts') || [];
    const account = accounts.find(acc => acc.id === id);

    if (!account) {
      showError('등록되지 않은 아이디입니다. 회원가입 먼저 해주세요.');
      markError(idInput);
      return;
    }
    // 비밀번호 비교 — 저장된 건 해시(sha256:...). 입력값도 해시해서 비교.
    // 단, 개선 전 평문으로 가입한 옛 계정도 있을 수 있어 둘 다 허용.
    const pwHash = await hashPassword(pw);
    const matches = (account.pw === pwHash) || (account.pw === pw);
    if (!matches) {
      showError('비밀번호가 일치하지 않습니다.');
      markError(pwInput);
      return;
    }

    // 인증 성공 — 로그인 정보 저장
    Store.set('fittube_login', {
      id: id,
      loggedInAt: new Date().toISOString()
    });

    // 버튼 비활성화 + 로딩
    loginBtn.disabled = true;
    loginBtn.textContent = '로그인 중...';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  }

  loginBtn.addEventListener('click', login);

  // Enter 키로 로그인
  [idInput, pwInput].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') login();
    });
    input.addEventListener('input', hideError);
  });

  // 회원가입 → signup.html 로 이동
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'signup.html';
  });

  // 비밀번호 찾기 — v1.1
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('비밀번호 찾기는 다음 버전에 추가됩니다.');
  });

  // ===== Google 로그인 (Firebase) =====
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      hideError();

      if (typeof firebaseAuth === 'undefined' || typeof googleProvider === 'undefined') {
        showError('구글 로그인 초기화에 실패했어요. 페이지를 새로고침해주세요.');
        return;
      }

      googleBtn.disabled = true;

      firebaseAuth.signInWithPopup(googleProvider)
        .then((result) => {
          const user = result.user;

          Store.set('fittube_login', {
            id: user.email || user.uid,
            name: user.displayName || '',
            photo: user.photoURL || '',
            provider: 'google',
            loggedInAt: new Date().toISOString()
          });

          window.location.href = 'index.html';
        })
        .catch((err) => {
          googleBtn.disabled = false;

          // 사용자가 팝업을 그냥 닫은 경우는 조용히 무시
          if (err.code === 'auth/popup-closed-by-user' ||
              err.code === 'auth/cancelled-popup-request') {
            return;
          }
          if (err.code === 'auth/unauthorized-domain' ||
              err.code === 'auth/operation-not-supported-in-this-environment') {
            showError('구글 로그인은 배포 후 사용 가능해요. 아이디/비번으로 로그인해주세요.');
          } else {
            showError('구글 로그인 실패: ' + (err.message || err.code));
          }
          console.error('Google 로그인 오류:', err);
        });
    });
  }
});
