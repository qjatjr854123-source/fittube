/* ============================================
   profile.js — 내 프로필 (전적 보기 + 내 정보 수정)
   ============================================
   - 위: 레벨/전적/배지 (보기)
   - 아래: 내 정보 수정 (닉네임·키·몸무게·목표) ← 실제로 쓰는 곳
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const body = document.getElementById('profileBody');
  if (!body) return;
  try { render(); } catch (e) {
    console.error('[프로필] 오류:', e);
    body.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">불러오기 실패 — 새로고침 해보세요</div>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // 사진을 정사각형으로 잘라 작게 압축 (프로필 동그라미용)
  function compressSquare(base64, size) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const side = Math.min(img.width, img.height);   // 짧은 변 기준 정사각형
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        canvas.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  }

  function render() {
    const login = Store.get('fittube_login') || {};
    const user  = Store.get('fittube_user') || {};

    // 닉네임 (저장된 거 우선 → 로그인 라벨 → 기본)
    const nick = user.nickname
      || (typeof currentUserLabel === 'function' ? currentUserLabel() : '')
      || '운동러';

    // 레벨 (함수 있으면)
    const lv = (typeof userLevel === 'function')
      ? userLevel()
      : { level: 1, title: '헬스 입문', total: 0, progress: 0, remain: 3, isMax: false };

    const streak     = (typeof Records !== 'undefined') ? Records.streak() : 0;
    const monthCount = (typeof Records !== 'undefined') ? Records.countThisMonth() : 0;

    const nextText = lv.isMax ? '최고 레벨! 🎉' : `다음 레벨까지 ${lv.remain}일`;

    // 프로필 사진 (있으면 사진, 없으면 가운데 큰 + = 사진 추가)
    const photo = user.profilePhoto || null;
    const avatarInner = photo
      ? `<img src="${photo}" alt="프로필" class="pf-avatar-img">`
      : `<span class="pf-avatar-plus">+</span>`;

    body.innerHTML = `
      <!-- 레벨 카드 -->
      <div class="pf-hero">
        <div class="pf-avatar" id="pfAvatar" title="사진 추가">
          ${avatarInner}
        </div>
        <input type="file" id="pfPhotoInput" accept="image/*" style="display:none">
        <div class="pf-name">${esc(nick)}</div>
        <div class="pf-title">Lv.${lv.level} · ${lv.title}</div>
        <div class="pf-progress"><div class="pf-progress-bar" style="width:${lv.progress}%"></div></div>
        <div class="pf-next">${nextText}</div>
      </div>

      <!-- 전적 -->
      <div class="pf-stats">
        <div class="pf-stat"><div class="pf-stat-num">${streak}</div><div class="pf-stat-label">🔥 연속일</div></div>
        <div class="pf-stat"><div class="pf-stat-num">${lv.total}</div><div class="pf-stat-label">총 운동일</div></div>
        <div class="pf-stat"><div class="pf-stat-num">${monthCount}</div><div class="pf-stat-label">이번 달</div></div>
      </div>

      <!-- 내 정보 수정 -->
      <div class="pf-section-title">⚙️ 내 정보 수정</div>
      <div class="pf-form">
        <label class="pf-field">
          <span>닉네임</span>
          <input type="text" id="pfNick" maxlength="12" value="${esc(nick)}" placeholder="닉네임">
        </label>
        <label class="pf-field">
          <span>키 (cm)</span>
          <input type="number" id="pfHeight" min="100" max="250" value="${esc(user.height || '')}" placeholder="175">
        </label>
        <label class="pf-field">
          <span>몸무게 (kg)</span>
          <input type="number" id="pfWeight" min="20" max="300" value="${esc(user.weight || '')}" placeholder="70">
        </label>
        <button type="button" class="pf-save-btn" id="pfSave">저장하기</button>
        <div class="pf-save-msg" id="pfSaveMsg"></div>
      </div>
    `;

    // 프로필 사진 — 아바타 클릭 → 파일 선택
    const avatar = document.getElementById('pfAvatar');
    const photoInput = document.getElementById('pfPhotoInput');
    if (avatar && photoInput) {
      avatar.addEventListener('click', () => photoInput.click());
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          // 작게 압축해서 저장 (localStorage 용량 초과 방지)
          compressSquare(ev.target.result, 200).then(small => {
            const u = Store.get('fittube_user') || {};
            u.profilePhoto = small;
            Store.set('fittube_user', u);
            render();   // 다시 그려서 사진 반영
          });
        };
        reader.readAsDataURL(file);
      });
    }

    // 저장
    document.getElementById('pfSave').addEventListener('click', () => {
      const nickVal   = document.getElementById('pfNick').value.trim();
      const heightVal = parseFloat(document.getElementById('pfHeight').value);
      const weightVal = parseFloat(document.getElementById('pfWeight').value);

      const u = Store.get('fittube_user') || {};
      if (nickVal) u.nickname = nickVal;
      if (heightVal >= 100 && heightVal <= 250) u.height = heightVal;
      if (weightVal >= 20 && weightVal <= 300) u.weight = weightVal;
      Store.set('fittube_user', u);

      const msg = document.getElementById('pfSaveMsg');
      msg.textContent = '저장됐어요! ✓';
      setTimeout(() => render(), 800);   // 다시 그려서 닉네임 등 반영
    });
  }

  // 로그아웃
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!confirm('로그아웃 할까요?')) return;
      localStorage.removeItem('fittube_login');
      const done = () => window.location.href = 'login.html';
      try {
        if (typeof firebaseAuth !== 'undefined') firebaseAuth.signOut().then(done).catch(done);
        else done();
      } catch (e) { done(); }
    });
  }
});
