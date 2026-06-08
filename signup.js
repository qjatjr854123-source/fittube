/* ============================================
   signup.js — 회원가입 (Firebase Auth 이메일/비번)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const emailInput  = document.getElementById('signupEmail');
  const pwInput     = document.getElementById('signupPw');
  const pwConfirm   = document.getElementById('signupPwConfirm');
  const agreeCheck  = document.getElementById('signupAgree');
  const signupBtn   = document.getElementById('signupBtn');
  const errorBox    = document.getElementById('signupError');

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

  async function signup() {
    hideError();
    const email = emailInput.value.trim();
    const pw    = pwInput.value;
    const pwC   = pwConfirm.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('올바른 이메일을 입력해주세요.');
      markError(emailInput); return;
    }
    if (!pw || pw.length < 6) {
      showError('비밀번호는 6자 이상이어야 합니다.');
      markError(pwInput); return;
    }
    if (pw !== pwC) {
      showError('비밀번호가 일치하지 않습니다.');
      markError(pwConfirm); return;
    }
    if (!agreeCheck.checked) {
      showError('이용약관에 동의해주세요.');
      return;
    }

    // Firebase 초기화 확인
    if (typeof firebaseAuth === 'undefined') {
      showError('인증 서비스 초기화 실패. 새로고침 해주세요.');
      return;
    }

    signupBtn.disabled = true;
    signupBtn.querySelector('span').textContent = '가입 중...';

    try {
      const result = await firebaseAuth.createUserWithEmailAndPassword(email, pw);
      const user = result.user;

      Store.set('fittube_login', {
        id: user.email,
        uid: user.uid,
        provider: 'email',
        loggedInAt: new Date().toISOString()
      });

      window.location.href = 'index.html';
    } catch (err) {
      signupBtn.disabled = false;
      signupBtn.querySelector('span').textContent = '가입하기';

      if (err.code === 'auth/email-already-in-use') {
        showError('이미 사용 중인 이메일이에요. 로그인해주세요.');
        markError(emailInput);
      } else if (err.code === 'auth/weak-password') {
        showError('비밀번호가 너무 약해요. 6자 이상으로 입력해주세요.');
        markError(pwInput);
      } else if (err.code === 'auth/invalid-email') {
        showError('올바른 이메일 형식이 아니에요.');
        markError(emailInput);
      } else {
        showError('가입 실패: ' + (err.message || err.code));
      }
    }
  }

  signupBtn.addEventListener('click', signup);
  [emailInput, pwInput, pwConfirm].forEach(input => {
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') signup(); });
    input.addEventListener('input', hideError);
  });
});