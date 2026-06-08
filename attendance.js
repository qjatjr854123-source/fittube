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

  // 반응형: 화면 폭에 따라 출석 위젯을 왼쪽 컬럼 ↔ 메인 슬롯으로 이동
  //  - 데스크탑(1100px↑): streak 카드 바로 아래 (왼쪽 컬럼 안)
  //  - 폰(1100px 미만):   메인 .phone 안 (왼쪽 컬럼은 통째로 숨겨지므로)
  const leftCol     = document.getElementById('attFloat')?.parentElement; // .att-left-col
  const mobileSlot  = document.getElementById('attMobileSlot');

  function placeWidget() {
    if (!leftCol || !mobileSlot) return;
    const isDesktop = window.innerWidth > 1100;
    if (isDesktop) {
      // 왼쪽 컬럼의 streak 카드 바로 뒤로
      if (wrap.parentElement !== leftCol) leftCol.appendChild(wrap);
    } else {
      // 메인 슬롯 안으로
      if (wrap.parentElement !== mobileSlot) mobileSlot.appendChild(wrap);
    }
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

  // 이번 달 캘린더 그리기
  function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0~11
    const firstDay = new Date(year, month, 1).getDay(); // 1일의 요일 (0=일)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDate = now.getDate();

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
      const isToday = day === todayDate;
      const cls = [
        'att-cal-cell',
        done ? 'done' : '',
        isToday ? 'today' : ''
      ].filter(Boolean).join(' ');
      html += `<div class="${cls}">${done ? '🔥' : day}</div>`;
    }

    calEl.innerHTML = html;

    // 왼쪽 사이드 캘린더에도 동일하게 그려줌
    const sideCalEl = document.getElementById('attCalendarSide');
    if (sideCalEl) sideCalEl.innerHTML = html;

    // 월 표시
    const sideCalMonth = document.getElementById('sideCalMonth');
    if (sideCalMonth) sideCalMonth.textContent = `${month + 1}월`;
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

  placeWidget();
  render();

  // 다른 스크립트(mylist 등)가 출석을 바꾼 뒤 위젯 갱신용
  window.refreshAttendance = render;

  // 창 크기 바뀌면 위젯 자리 다시 잡기 (데스크탑 ↔ 폰 전환)
  window.addEventListener('resize', placeWidget);
});
