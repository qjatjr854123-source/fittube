/* ============================================
   attendance.js — 운동 출석 체크 위젯 (index.html)
   ============================================
   - "오늘 운동 완료" 버튼 → 도장 + 연속 일수(streak)
   - 이번 달 미니 캘린더 (운동한 날 표시)
   데이터: shared.js 의 Records / todayKey 사용
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('attendance');
  if (!wrap) return; // 위젯 없는 페이지면 무시

  const btn       = document.getElementById('attBtn');
  const btnIcon   = document.getElementById('attBtnIcon');
  const btnText   = document.getElementById('attBtnText');
  const streakNum = document.getElementById('attStreakNum');
  const monthEl   = document.getElementById('attMonth');
  const calEl     = document.getElementById('attCalendar');

  // 데스크탑 옆 떠있는 카드 (없을 수도 있음)
  const floatStreak = document.getElementById('attFloatStreak');
  const floatMonth  = document.getElementById('attFloatMonth');

  function placeWidget() {
    // 위젯 위치는 HTML에서 고정 — JS 이동 불필요
  }

  // 화면 전체 다시 그리기 (버튼 상태 + 숫자 + 캘린더)
  function render() {
    const doneToday = Records.isDone(todayKey());

    // 버튼 상태
    btn.classList.toggle('done', doneToday);
    btnIcon.textContent = doneToday ? '✅' : '💪';
    btnText.textContent = doneToday ? '오늘 운동 완료!' : '오늘 운동 완료';

    // 연속 일수 + 이번 달
    const streak = Records.streak();
    const monthCount = Records.countThisMonth();
    streakNum.textContent = streak;
    monthEl.textContent = `이번 달 ${monthCount}일 운동`;

    // 옆 떠있는 카드도 같은 숫자로 (데스크탑에서만 보임)
    if (floatStreak) floatStreak.textContent = streak;
    if (floatMonth)  floatMonth.textContent = `이번 달 ${monthCount}일 운동`;

    renderCalendar();
  }

  // 현재 캘린더 월 (0=현재달, -1=지난달 등)
  let calOffset = 0;

  // 이전/다음 달 이동 버튼 추가
  function renderCalNav() {
    const existing = document.getElementById('calNav');
    if (existing) return;
    const nav = document.createElement('div');
    nav.id = 'calNav';
    nav.className = 'cal-nav';
    nav.innerHTML = `
      <button type="button" class="cal-nav-btn" id="calPrev">‹</button>
      <span class="cal-nav-month" id="calNavMonth"></span>
      <button type="button" class="cal-nav-btn" id="calNext">›</button>
    `;
    calEl.parentElement.insertBefore(nav, calEl);
    document.getElementById('calPrev').addEventListener('click', () => { calOffset--; renderCalendar(); });
    document.getElementById('calNext').addEventListener('click', () => {
      if (calOffset < 0) { calOffset++; renderCalendar(); }
    });
  }

  // 이번 달 캘린더 그리기
  function renderCalendar() {
    renderCalNav();
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth() + calOffset, 1);
    const year = base.getFullYear();
    const month = base.getMonth(); // 0~11
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDate = (calOffset === 0) ? now.getDate() : -1;

    // 다음달 버튼 비활성화 (현재달 이상 못 감)
    const nextBtn = document.getElementById('calNext');
    if (nextBtn) nextBtn.style.opacity = calOffset >= 0 ? '0.3' : '1';

    // 월 표시 업데이트
    const navMonth = document.getElementById('calNavMonth');
    if (navMonth) navMonth.textContent = `${year}년 ${month + 1}월`;

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    let html = '';

    // 요일 헤더
    dayNames.forEach(d => {
      html += `<div class="att-cal-head">${d}</div>`;
    });

    // 1일 앞의 빈 칸
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="att-cal-cell empty"></div>`;
    }

    // 날짜 칸
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const done = Records.isDone(key);
      const hasMemo = typeof Memos !== 'undefined' && Memos.get(key);
      const isToday = day === todayDate;
      const cls = [
        'att-cal-cell',
        done ? 'done' : '',
        isToday ? 'today' : '',
        hasMemo ? 'has-memo' : ''
      ].filter(Boolean).join(' ');
      html += `<div class="${cls}" data-key="${key}" title="${hasMemo ? '메모 있음' : ''}">${done ? '🔥' : day}${hasMemo ? '<span class="cal-memo-dot"></span>' : ''}</div>`;
    }

    calEl.innerHTML = html;

    // 날짜 클릭 → 메모 팝업
    calEl.querySelectorAll('.att-cal-cell[data-key]').forEach(cell => {
      cell.addEventListener('click', () => showMemoInput(cell.dataset.key));
    });

    // 왼쪽 사이드 캘린더에도 동일하게 그려줌
    const sideCalEl = document.getElementById('attCalendarSide');
    if (sideCalEl) sideCalEl.innerHTML = html;

    // 월 표시
    const sideCalMonth = document.getElementById('sideCalMonth');
    if (sideCalMonth) sideCalMonth.textContent = `${month + 1}월`;

    // 이번달 운동 수 (현재 보는 달 기준)
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthCount = Object.keys(Records.all()).filter(k => k.startsWith(prefix) && Records.all()[k]).length;
    if (monthEl) monthEl.textContent = `${month + 1}월 ${monthCount}일 운동`;
  }

  // 버튼 클릭 → 오늘 토글
  btn.addEventListener('click', () => {
    const nowDone = Records.toggleToday();
    render();
    if (typeof window.refreshBadges === 'function') window.refreshBadges();

    // 완료했을 때 살짝 통통 튀는 피드백
    if (nowDone) {
      btn.classList.remove('pop');
      void btn.offsetWidth;
      btn.classList.add('pop');
      launchConfetti();
      showPlanBanner();
      showMemoInput(todayKey()); // 메모 입력창 열기
    }
  });

  // 폭죽 애니메이션
  function launchConfetti() {
    const colors = ['#ff0033', '#ff5e6e', '#fff', '#ff8800', '#00ff88', '#ffcc00'];
    const count = 60;
    const container = document.body;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        z-index: 9999;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        left: ${Math.random() * 100}vw;
        top: 40%;
        opacity: 1;
        pointer-events: none;
        transform: translateY(0) rotate(0deg);
        transition: transform ${0.8 + Math.random() * 0.8}s ease-out, opacity ${0.8 + Math.random() * 0.8}s ease-out;
      `;
      container.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translateY(${-(Math.random() * 300 + 100)}px) rotate(${Math.random() * 720}deg) translateX(${(Math.random() - 0.5) * 200}px)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 1600);
    }
  }

  // 운동 완료 후 "플랜 보기" 배너 show/hide
  const planBanner = document.getElementById('attPlanBanner');
  const planClose  = document.getElementById('attPlanClose');
  if (planClose) {
    planClose.addEventListener('click', () => {
      if (planBanner) planBanner.style.display = 'none';
    });
  }
  function showPlanBanner() {
    if (!planBanner) return;
    planBanner.style.display = 'flex';
    setTimeout(() => { planBanner.style.display = 'none'; }, 6000);
  }

  // ===== 메모 팝업 =====
  function showMemoInput(dateKey) {
    // 기존 팝업 제거
    const existing = document.getElementById('memoPopup');
    if (existing) existing.remove();

    const memo = (typeof Memos !== 'undefined') ? Memos.get(dateKey) : '';
    const isToday = dateKey === todayKey();
    const label = isToday ? '오늘' : dateKey.slice(5); // MM-DD

    const popup = document.createElement('div');
    popup.id = 'memoPopup';
    popup.className = 'memo-popup';
    popup.innerHTML = `
      <div class="memo-popup-head">
        <span class="memo-popup-date">${label} 운동 메모</span>
        <button type="button" class="memo-popup-close" id="memoClose">×</button>
      </div>
      <textarea class="memo-textarea" id="memoText" placeholder="오늘 운동 어땠나요? (PR, 컨디션, 느낀 점...)" maxlength="100">${memo}</textarea>
      <div class="memo-popup-foot">
        <span class="memo-char" id="memoChar">${memo.length}/100</span>
        <button type="button" class="memo-save-btn" id="memoSave">저장</button>
      </div>
    `;

    const phone = document.querySelector('.phone') || document.body;
    phone.appendChild(popup);

    const textarea = popup.querySelector('#memoText');
    const charEl   = popup.querySelector('#memoChar');
    textarea.focus();

    textarea.addEventListener('input', () => {
      charEl.textContent = `${textarea.value.length}/100`;
    });

    popup.querySelector('#memoClose').addEventListener('click', () => popup.remove());

    popup.querySelector('#memoSave').addEventListener('click', () => {
      if (typeof Memos !== 'undefined') Memos.set(dateKey, textarea.value);
      popup.remove();
      render(); // 캘린더 메모 점 갱신
    });
  }

  placeWidget();
  render();

  // 다른 스크립트(mylist 등)가 출석을 바꾼 뒤 위젯 갱신용
  window.refreshAttendance = render;

  // 창 크기 바뀌면 위젯 자리 다시 잡기 (데스크탑 ↔ 폰 전환)
  window.addEventListener('resize', placeWidget);
});
