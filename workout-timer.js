/* ============================================
   workout-timer.js — 운동 총 시간 타이머 (index.html)
   시작 → 일시정지 → 완료 → 기록 저장
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const wrap     = document.getElementById('workoutTimerWrap');
  if (!wrap) return;

  const timeEl   = document.getElementById('wktTime');
  const labelEl  = document.getElementById('wktLabel');
  const startBtn = document.getElementById('wktStart');
  const stopBtn  = document.getElementById('wktStop');
  const finishBtn= document.getElementById('wktFinish');

  let elapsed = 0;   // 경과 초
  let timerId = null;
  let running = false;

  function fmt(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function tick() {
    elapsed++;
    timeEl.textContent = fmt(elapsed);
    // 1시간 넘으면 색 변경
    if (elapsed >= 3600) {
      timeEl.style.color = '#ff8800';
    }
  }

  function start() {
    running = true;
    timerId = setInterval(tick, 1000);
    startBtn.style.display  = 'none';
    stopBtn.style.display   = 'inline-flex';
    finishBtn.style.display = 'inline-flex';
    labelEl.textContent = '운동 중 💪';
    wrap.classList.add('running');
  }

  function pause() {
    if (!running) {
      // 재개
      running = true;
      timerId = setInterval(tick, 1000);
      stopBtn.textContent = '⏸ 일시정지';
      labelEl.textContent = '운동 중 💪';
    } else {
      // 일시정지
      running = false;
      clearInterval(timerId);
      stopBtn.textContent = '▶ 재개';
      labelEl.textContent = '일시정지 중...';
    }
  }

  function finish() {
    clearInterval(timerId);
    running = false;

    const totalMin = Math.round(elapsed / 60);
    const timeStr  = fmt(elapsed);

    // 오늘 운동 기록에 시간 저장
    const key = todayKey();
    const saved = Store.get('fittube_workout_times') || {};
    saved[key] = elapsed;
    Store.set('fittube_workout_times', saved);

    // UI 완료 상태
    wrap.classList.remove('running');
    wrap.classList.add('done');
    timeEl.textContent = timeStr;
    timeEl.style.color = '#00ff88';
    labelEl.textContent = `오늘 운동 완료! 총 ${totalMin}분`;
    stopBtn.style.display   = 'none';
    finishBtn.style.display = 'none';
    startBtn.style.display  = 'inline-flex';
    startBtn.textContent    = '↺ 다시 시작';
    startBtn.classList.add('restart');

    // 출석 체크 안 됐으면 자동 체크
    if (!Records.isDone(key)) {
      Records.toggleToday();
      if (typeof window.refreshAttendance === 'function') window.refreshAttendance();
      if (typeof window.refreshBadges === 'function') window.refreshBadges();
      if (typeof window.refreshStats === 'function') window.refreshStats();
    }

    // 완료 폭죽
    if (typeof launchConfetti === 'undefined') {
      // 간단한 폭죽 대체
      const colors = ['#ff0033','#00ff88','#00d4ff','#ffcc00'];
      for (let i = 0; i < 30; i++) {
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;z-index:9999;width:${Math.random()*8+4}px;height:${Math.random()*8+4}px;background:${colors[Math.floor(Math.random()*4)]};border-radius:50%;left:${Math.random()*100}vw;top:30%;pointer-events:none;transition:transform ${0.8+Math.random()*0.6}s ease-out,opacity 1s ease-out;`;
        document.body.appendChild(el);
        requestAnimationFrame(() => {
          el.style.transform = `translateY(-${Math.random()*300+100}px) translateX(${(Math.random()-0.5)*200}px)`;
          el.style.opacity = '0';
        });
        setTimeout(() => el.remove(), 1600);
      }
    }
  }

  startBtn.addEventListener('click', () => {
    if (startBtn.classList.contains('restart')) {
      // 리셋 후 재시작
      elapsed = 0;
      timeEl.textContent = '00:00:00';
      timeEl.style.color = '#ff0033';
      wrap.classList.remove('done');
      startBtn.textContent = '▶ 시작';
      startBtn.classList.remove('restart');
    }
    start();
  });

  stopBtn.addEventListener('click', pause);
  finishBtn.addEventListener('click', finish);

  // 오늘 이미 기록된 시간 있으면 표시
  const savedTimes = Store.get('fittube_workout_times') || {};
  const todaySec = savedTimes[todayKey()];
  if (todaySec) {
    elapsed = todaySec;
    timeEl.textContent = fmt(elapsed);
    timeEl.style.color = '#00ff88';
    labelEl.textContent = `오늘 ${Math.round(todaySec/60)}분 운동했어요 💪`;
    startBtn.textContent = '↺ 다시 시작';
    startBtn.classList.add('restart');
  }
});