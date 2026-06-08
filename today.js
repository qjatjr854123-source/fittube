/* ============================================
   today.js — "오늘 뭐 하지?" 추천 (index.html)
   ============================================
   헬스 초보의 첫 질문 "오늘 뭐 해야 돼?"에 바로 답.
   요일별 부위 분할 → 그 부위 운동 3개 추천 + 내 리스트에 담기.
   의존: exercise-db.js(EXERCISE_DB), shared.js(MyList)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('todayPick');
  if (!wrap) return;

  // 요일별 부위 분할 (0=일 ~ 6=토) — 헬스장 흔한 분할, 초보도 따라가기 쉬움
  // 부위명은 exercise-db.js 의 part 와 정확히 일치해야 함
  const DAY_PART = ['휴식', '가슴', '등', '하체', '어깨', '팔', '복근'];
  const DAY_NAME = ['일', '월', '화', '수', '목', '금', '토'];

  function render() {
    const now = new Date();
    const dow = now.getDay();              // 0~6
    const partName = DAY_PART[dow];
    const dayName  = DAY_NAME[dow];

    // 휴식일 (일요일)
    if (partName === '휴식') {
      wrap.innerHTML = `
        <div class="tp-head">
          <span class="tp-day">${dayName}요일</span>
          <span class="tp-label">오늘은</span>
        </div>
        <div class="tp-rest">
          <div class="tp-rest-emoji">😴</div>
          <div class="tp-rest-title">휴식의 날</div>
          <div class="tp-rest-sub">근육은 쉴 때 자라요. 푹 쉬세요!</div>
        </div>`;
      return;
    }

    // exercise-db 에서 오늘 부위 찾기
    const group = (typeof EXERCISE_DB !== 'undefined')
      ? EXERCISE_DB.find(g => g.part === partName)
      : null;

    if (!group) {
      wrap.innerHTML = `<div class="tp-rest"><div class="tp-rest-sub">운동 정보를 불러올 수 없어요.</div></div>`;
      return;
    }

    // 추천 운동 3개 (앞에서부터 — 초보에겐 기본 동작이 앞에 있음)
    const picks = group.items.slice(0, 3);

    const items = picks.map(ex => `
      <div class="tp-ex">
        <div class="tp-ex-text">
          <span class="tp-ex-name">${escapeHtml(ex.name)}</span>
          <span class="tp-ex-desc">${escapeHtml(ex.desc)}</span>
          ${ex.tip ? `<span class="tp-ex-tip">⚠️ ${escapeHtml(ex.tip)}</span>` : ''}
        </div>
        <a class="tp-ex-video" href="${workoutVideoUrl(ex.name)}" target="_blank" rel="noopener" title="자세 영상 보기">▶</a>
        <span class="tp-ex-plus" data-add="${escapeHtml(ex.name)}">+</span>
      </div>`).join('');

    wrap.innerHTML = `
      <div class="tp-head">
        <span class="tp-day">${dayName}요일</span>
        <span class="tp-label">오늘은</span>
      </div>
      <div class="tp-part">
        <span class="tp-part-emoji">${group.emoji}</span>
        <span class="tp-part-name">${group.part} 운동</span>
      </div>
      <div class="tp-list">${items}</div>
      <button type="button" class="tp-add-all" id="tpAddAll">오늘 운동 전부 담기</button>
    `;

    // 운동 1개 담기 ([+] 버튼만 — 영상 링크는 별도)
    wrap.querySelectorAll('.tp-ex-plus[data-add]').forEach(el => {
      el.addEventListener('click', () => {
        const added = MyList.add(el.dataset.add);  // false면 이미 있음
        flash(el.closest('.tp-ex'), added);
        if (added && typeof window.refreshBadges === 'function') window.refreshBadges();
      });
    });

    // 전부 담기
    const addAll = wrap.querySelector('#tpAddAll');
    if (addAll) {
      addAll.addEventListener('click', () => {
        // 새로 담긴 개수만 셈 (중복은 add 가 false 반환)
        const added = picks.filter(ex => MyList.add(ex.name)).length;
        addAll.textContent = added > 0 ? `${added}개 담았어요! ✓` : '이미 다 담겨있어요';
        setTimeout(() => { addAll.textContent = '오늘 운동 전부 담기'; }, 1300);
        if (typeof window.refreshBadges === 'function') window.refreshBadges();
      });
    }
  }

  function flash(el, added) {
    const plus = el.querySelector('.tp-ex-plus');
    if (added) {
      el.classList.add('added');
      if (plus) plus.textContent = '✓';
    } else {
      // 이미 담긴 운동 — 체크 표시로 "이미 있어요" 알림
      if (plus) plus.textContent = '✓';
    }
    setTimeout(() => {
      el.classList.remove('added');
      if (plus) plus.textContent = '+';
    }, 900);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  render();
});
