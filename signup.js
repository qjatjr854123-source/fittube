/* ============================================
   signup.js — 회원가입 페이지 (가짜 인증, localStorage)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const idInput     = document.getElementById('signupId');
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

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function signup() {
    hideError();
    const id    = idInput.value.trim();
    const email = emailInput.value.trim();
    const pw    = pwInput.value;
    const pwC   = pwConfirm.value;

    // 아이디 검증
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
    if (!/^[a-zA-Z0-9_]+$/.test(id)) {
      showError('아이디는 영문, 숫자, 밑줄만 사용 가능합니다.');
      markError(idInput);
      return;
    }

    // 중복 아이디 체크
    const existingAccounts = Store.get('fittube_accounts') || [];
    if (existingAccounts.some(acc => acc.id === id)) {
      showError('이미 사용 중인 아이디입니다.');
      markError(idInput);
      return;
    }

    // 이메일 — 선택 (입력했으면 형식 체크)
    if (email && !isValidEmail(email)) {
      showError('올바른 이메일 형식이 아닙니다.');
      markError(emailInput);
      return;
    }

    // 비밀번호
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
    if (pw !== pwC) {
      showError('비밀번호가 일치하지 않습니다.');
      markError(pwConfirm);
      return;
    }

    // 약관 동의
    if (!agreeCheck.checked) {
      showError('이용약관 및 개인정보 처리방침에 동의해주세요.');
      return;
    }

    // 회원가입 — 비밀번호는 해시해서 저장 (평문 노출 방지)
    const pwHash = await hashPassword(pw);
    existingAccounts.push({
      id: id,
      pw: pwHash,
      email: email || null,
      createdAt: new Date().toISOString()
    });
    Store.set('fittube_accounts', existingAccounts);

    // 자동 로그인
    Store.set('fittube_login', {
      id: id,
      loggedInAt: new Date().toISOString()
    });

    // 버튼 비활성화 + 로딩
    signupBtn.disabled = true;
    signupBtn.textContent = '가입 중...';

    setTimeout(() => {
      alert('가입 완료! 환영합니다.');
      window.location.href = 'index.html';
    }, 600);
  }

  signupBtn.addEventListener('click', signup);

  // Enter 키로 가입
  [idInput, emailInput, pwInput, pwConfirm].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') signup();
    });
    input.addEventListener('input', hideError);
  });
});
