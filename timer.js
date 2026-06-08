/* ============================================
   timer.js — 세트 사이 휴식 타이머 (plan 페이지)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('restTimer');
  if (!wrap) return;

  const display  = document.getElementById('rtDisplay');
  const startBtn = document.getElementById('rtStart');
  const resetBtn = document.getElementById('rtReset');
  const presets  = wrap.querySelectorAll('.rt-preset');

  let totalSec = 60;
  let remain   = 60;
  let timerId  = null;
  let running  = false;

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function updateDisplay() {
    display.textContent = fmt(remain);
    // 10초 이하 — 빨간 경고
    if (remain <= 10 && remain > 0) {
      display.style.color = '#ff0033';
      display.style.textShadow = '0 0 20px rgba(255,0,51,0.6)';
    } else {
      display.style.color = '#fff';
      display.style.textShadow = 'none';
    }
  }

  // 소리 알림 (Web Audio API)
  function beep(freq = 880, duration = 0.15, vol = 0.3) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }

  function finishBeep() {
    // 완료 3연속 비프
    beep(660, 0.15, 0.4);
    setTimeout(() => beep(880, 0.15, 0.4), 200);
    setTimeout(() => beep(1100, 0.3, 0.5), 400);
  }

  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      if (running) return;
      presets.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      totalSec = parseInt(btn.dataset.sec);
      remain = totalSec;
      updateDisplay();
    });
  });

  startBtn.addEventListener('click', () => {
    if (running) {
      clearInterval(timerId);
      running = false;
      startBtn.textContent = '계속';
      return;
    }
    running = true;
    startBtn.textContent = '일시정지';
    timerId = setInterval(() => {
      remain--;
      updateDisplay();
      // 3초 전 비프
      if (remain === 3) beep(440, 0.1, 0.2);
      if (remain === 2) beep(440, 0.1, 0.2);
      if (remain === 1) beep(440, 0.1, 0.2);
      if (remain <= 0) {
        clearInterval(timerId);
        running = false;
        finish();
      }
    }, 1000);
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerId);
    running = false;
    remain = totalSec;
    updateDisplay();
    startBtn.textContent = '시작';
    wrap.classList.remove('rt-done');
    display.style.color = '#fff';
    display.style.textShadow = 'none';
  });

  function finish() {
    startBtn.textContent = '시작';
    wrap.classList.add('rt-done');
    display.textContent = '다음 세트! 💪';
    display.style.color = '#00ff88';
    display.style.textShadow = '0 0 20px rgba(0,255,136,0.6)';

    finishBeep();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    setTimeout(() => {
      wrap.classList.remove('rt-done');
      remain = totalSec;
      updateDisplay();
    }, 2500);
  }

  updateDisplay();
});
