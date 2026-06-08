/* ============================================
   notif.js — 운동 알림 시간 설정 (profile.html)
   브라우저 Notification API + setTimeout 기반
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const timeInput  = document.getElementById('notifTime');
  const toggle     = document.getElementById('notifToggle');
  const saveBtn    = document.getElementById('notifSave');
  const statusEl   = document.getElementById('notifStatus');
  if (!saveBtn) return;

  // 저장된 설정 불러오기
  const saved = JSON.parse(localStorage.getItem('fittube_notif') || '{}');
  if (saved.time)    timeInput.value = saved.time;
  if (saved.enabled) toggle.checked  = true;

  function showStatus(msg, ok) {
    statusEl.textContent = msg;
    statusEl.style.color = ok ? '#00ff88' : '#ff8800';
    setTimeout(() => { statusEl.textContent = ''; }, 3000);
  }

  saveBtn.addEventListener('click', async () => {
    if (!toggle.checked) {
      localStorage.setItem('fittube_notif', JSON.stringify({ time: timeInput.value, enabled: false }));
      clearScheduled();
      showStatus('알림이 꺼졌어요.', true);
      return;
    }

    // 알림 권한 요청
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        showStatus('알림 권한이 거부됐어요. 브라우저 설정에서 허용해주세요.', false);
        toggle.checked = false;
        return;
      }
    }
    if (Notification.permission === 'denied') {
      showStatus('알림이 차단됐어요. 브라우저 주소창 자물쇠 → 알림 허용해주세요.', false);
      toggle.checked = false;
      return;
    }

    localStorage.setItem('fittube_notif', JSON.stringify({ time: timeInput.value, enabled: true }));
    scheduleNotif(timeInput.value);
    showStatus(`매일 ${timeInput.value} 에 운동 알림을 보낼게요! 💪`, true);
  });

  // 페이지 로드 시 알림 예약 (켜져 있으면)
  if (saved.enabled && saved.time && Notification.permission === 'granted') {
    scheduleNotif(saved.time);
  }

  let _timerId = null;
  function clearScheduled() {
    if (_timerId) { clearTimeout(_timerId); _timerId = null; }
  }

  function scheduleNotif(timeStr) {
    clearScheduled();
    const [h, m] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1); // 오늘 시간 지났으면 내일
    const delay = target - now;
    _timerId = setTimeout(() => {
      new Notification('FitTube 💪', {
        body: '오늘 운동 시간이에요! 지금 바로 시작해볼까요?',
        icon: '/icon.svg'
      });
      scheduleNotif(timeStr); // 다음날 다시 예약
    }, delay);
  }
});