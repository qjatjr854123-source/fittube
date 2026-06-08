/* ============================================
   mylist.js — 나만의 운동 리스트 (index.html)
   ============================================
   - 운동 이름 직접 입력 → 추가 / 체크 / 삭제
   - 데스크탑: 오른쪽 체중 카드 아래 / 폰: 메인 (반응형 자리 이동)
   데이터: shared.js 의 MyList 사용
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const floatBox  = document.getElementById('mlFloat');     // 데스크탑 자리
  const mobileSlot = document.getElementById('mlMobileSlot'); // 폰 자리
  if (!floatBox && !mobileSlot) return;

  // 위젯 본체를 하나 만들어서 화면 크기에 따라 두 자리 중 하나로 이동
  const widget = document.createElement('div');
  widget.className = 'ml-card';
  widget.innerHTML = `
    <div class="ml-head">
      <span class="ml-title">📋 나만의 운동</span>
      <span class="ml-count" id="mlCount">0개</span>
    </div>
    <!-- 초보자용 — 부위별 운동 골라 담기 -->
    <button type="button" class="ml-browse-btn" id="mlBrowseBtn">
      <span>🔍 운동 뭐 할지 모르겠다면?</span>
      <span class="ml-browse-arrow" id="mlBrowseArrow">▾</span>
    </button>
    <div class="ml-browse" id="mlBrowse" style="display:none;"></div>

    <ul class="ml-items" id="mlItems"></ul>
    <div class="ml-empty" id="mlEmpty">운동을 추가해서 나만의 리스트를 만들어보세요!</div>
  `;

  const itemsEl = widget.querySelector('#mlItems');
  const emptyEl = widget.querySelector('#mlEmpty');
  const countEl = widget.querySelector('#mlCount');
  const browseBtn   = widget.querySelector('#mlBrowseBtn');
  const browseArrow = widget.querySelector('#mlBrowseArrow');
  const browseEl    = widget.querySelector('#mlBrowse');

  function render() {
    const list = MyList.all();
    countEl.textContent = `${list.length}개`;
    if (typeof window.refreshBadges === 'function') window.refreshBadges();

    if (!list.length) {
      itemsEl.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';

    itemsEl.innerHTML = list.map((item, i) => {
      const sets = item.sets || '';
      const reps = item.reps || '';
      const setInfo = (sets || reps) ? `<span class="ml-setinfo">${sets ? sets+'세트' : ''} ${reps ? reps+'회' : ''}</span>` : `<span class="ml-setinfo-empty" data-edit="${i}">+ 세트/횟수</span>`;
      return `
        <li class="ml-item ${item.done ? 'done' : ''}">
          <button type="button" class="ml-check" data-toggle="${i}" aria-label="완료">
            ${item.done ? '✓' : ''}
          </button>
          <div class="ml-info">
            <span class="ml-name">${escapeHtml(item.name)}</span>
            <span class="ml-setwrap" data-edit="${i}">${setInfo}</span>
          </div>
          <a class="ml-video" href="${workoutVideoUrl(item.name)}" target="_blank" rel="noopener" title="자세 영상 보기">▶</a>
          <button type="button" class="ml-del" data-del="${i}" aria-label="삭제">×</button>
        </li>`;
    }).join('');
  }

  // 사용자 입력을 HTML에 넣을 때 안전하게 (태그 주입 방지)
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ===== 세트/횟수 편집 팝업 =====
  function showSetEditor(index) {
    const existing = document.getElementById('setEditorPopup');
    if (existing) existing.remove();

    const list = MyList.all();
    const item = list[index];
    if (!item) return;

    const popup = document.createElement('div');
    popup.id = 'setEditorPopup';
    popup.className = 'set-editor-popup';
    popup.innerHTML = `
      <div class="set-editor-head">
        <span class="set-editor-title">${escapeHtml(item.name)}</span>
        <button type="button" class="set-editor-close" id="setEditorClose">×</button>
      </div>
      <div class="set-editor-row">
        <label class="set-editor-label">세트</label>
        <input type="number" class="set-editor-input" id="setInput" min="1" max="20" value="${item.sets || ''}" placeholder="3">
      </div>
      <div class="set-editor-row">
        <label class="set-editor-label">횟수</label>
        <input type="number" class="set-editor-input" id="repInput" min="1" max="200" value="${item.reps || ''}" placeholder="10">
      </div>
      <button type="button" class="set-editor-save" id="setEditorSave">저장</button>
    `;

    const phone = document.querySelector('.phone') || document.body;
    phone.appendChild(popup);

    popup.querySelector('#setEditorClose').addEventListener('click', () => popup.remove());
    popup.querySelector('#setEditorSave').addEventListener('click', () => {
      const sets = parseInt(popup.querySelector('#setInput').value) || null;
      const reps = parseInt(popup.querySelector('#repInput').value) || null;
      const l = MyList.all();
      if (l[index]) { l[index].sets = sets; l[index].reps = reps; }
      Store.set(STORAGE_KEYS.MYLIST, l);
      popup.remove();
      render();
    });
  }

  // ===== 부위별 운동 골라 담기 (초보자용) =====
  // 추천 목록 한 번만 그리기
  function buildBrowse() {
    if (typeof EXERCISE_DB === 'undefined') {
      browseEl.innerHTML = '<div class="ml-empty">운동 목록을 불러올 수 없어요.</div>';
      return;
    }
    browseEl.innerHTML = EXERCISE_DB.map(group => `
      <div class="ml-group">
        <div class="ml-group-head">${group.emoji} ${group.part}</div>
        ${group.items.map(ex => `
          <div class="ml-suggest" data-add="${escapeHtml(ex.name)}">
            <div class="ml-suggest-text">
              <span class="ml-suggest-name">${escapeHtml(ex.name)}</span>
              <span class="ml-suggest-desc">${escapeHtml(ex.desc)}</span>
            </div>
            <span class="ml-suggest-plus">+</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  let browseOpen = false;
  browseBtn.addEventListener('click', () => {
    browseOpen = !browseOpen;
    if (browseOpen && !browseEl.innerHTML) buildBrowse();
    browseEl.style.display = browseOpen ? 'block' : 'none';
    browseArrow.textContent = browseOpen ? '▴' : '▾';
  });

  // 추천 운동 클릭 → 내 리스트에 추가 (잠깐 "담김✓" 피드백)
  browseEl.addEventListener('click', (e) => {
    const row = e.target.closest('[data-add]');
    if (!row) return;
    MyList.add(row.dataset.add);
    render();
    row.classList.add('added');
    const plus = row.querySelector('.ml-suggest-plus');
    if (plus) plus.textContent = '✓';
    setTimeout(() => {
      row.classList.remove('added');
      if (plus) plus.textContent = '+';
    }, 900);
  });

  // 체크/삭제/세트편집 (이벤트 위임)
  itemsEl.addEventListener('click', (e) => {
    const toggleI = e.target.closest('[data-toggle]')?.dataset.toggle;
    const delI    = e.target.closest('[data-del]')?.dataset.del;
    const editI   = e.target.closest('[data-edit]')?.dataset.edit;
    if (toggleI != null) {
      MyList.toggle(+toggleI);
      render();
      maybeSuggestComplete();
    }
    else if (delI != null) { MyList.remove(+delI); render(); }
    else if (editI != null) { showSetEditor(+editI); }
  });

  // 운동 2개 이상이고 전부 ✓ 됐는데 아직 오늘 출석 안 했으면 → 완료 제안
  function maybeSuggestComplete() {
    const list = MyList.all();
    if (list.length < 2) return;                  // 너무 적으면 제안 안 함
    if (!list.every(item => item.done)) return;   // 하나라도 안 됐으면 패스
    if (Records.isDone(todayKey())) return;       // 이미 출석했으면 패스

    if (confirm('운동 다 끝냈네요! 💪\n오늘 운동 완료로 기록할까요?')) {
      Records.toggleToday();                      // 출석 체크
      // 출석 위젯 / 배지 갱신
      if (typeof window.refreshAttendance === 'function') window.refreshAttendance();
      if (typeof window.refreshBadges === 'function') window.refreshBadges();
    }
  }

  // 반응형: 화면 폭에 따라 위젯을 데스크탑 카드 ↔ 폰 슬롯으로 이동
  function placeWidget() {
    const target = window.innerWidth > 1100 ? floatBox : mobileSlot;
    if (target && widget.parentElement !== target) target.appendChild(widget);
  }

  placeWidget();
  render();
  window.addEventListener('resize', placeWidget);
});
