const STORAGE_KEY = 'trello-app.state';

const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' };

// ── State ──────────────────────────────────────────────────────────────────

function defaultState() {
  return {
    columns: [
      { id: uid(), title: 'Todo', cards: [] },
      { id: uid(), title: 'In Progress', cards: [] },
      { id: uid(), title: 'Done', cards: [] },
    ],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

let state = loadState();

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() {
  return crypto.randomUUID();
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}`;
}

function findCard(cardId) {
  for (const col of state.columns) {
    const card = col.cards.find(c => c.id === cardId);
    if (card) return { col, card };
  }
  return null;
}

// ── Drag & Drop ────────────────────────────────────────────────────────────

let dragCardId = null;
let dragSourceColId = null;

// ── Render ─────────────────────────────────────────────────────────────────

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (const col of state.columns) {
    board.appendChild(createColumnEl(col));
  }
}

function createColumnEl(col) {
  const colEl = document.createElement('div');
  colEl.className = 'column';
  colEl.dataset.colId = col.id;

  // drag-over events
  colEl.addEventListener('dragover', e => {
    e.preventDefault();
    colEl.classList.add('drag-over');
  });
  colEl.addEventListener('dragleave', e => {
    if (!colEl.contains(e.relatedTarget)) {
      colEl.classList.remove('drag-over');
    }
  });
  colEl.addEventListener('drop', e => {
    e.preventDefault();
    colEl.classList.remove('drag-over');
    handleDrop(col.id);
  });

  // Header
  const header = document.createElement('div');
  header.className = 'column-header';

  const titleEl = document.createElement('span');
  titleEl.className = 'column-title';
  titleEl.textContent = col.title;
  titleEl.title = 'クリックして編集';
  titleEl.addEventListener('click', () => startEditColumnTitle(col.id, titleEl));

  const countEl = document.createElement('span');
  countEl.className = 'column-count';
  countEl.textContent = col.cards.length;

  const delBtn = document.createElement('button');
  delBtn.className = 'column-delete';
  delBtn.textContent = '×';
  delBtn.title = 'カラムを削除';
  delBtn.addEventListener('click', () => deleteColumn(col.id));

  header.append(titleEl, countEl, delBtn);

  // Cards list
  const cardsList = document.createElement('div');
  cardsList.className = 'cards-list';
  for (const card of col.cards) {
    cardsList.appendChild(createCardEl(card));
  }

  // Add card area
  const addArea = createAddCardArea(col.id);

  colEl.append(header, cardsList, addArea);
  return colEl;
}

function createCardEl(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.cardId = card.id;
  el.dataset.priority = card.priority || 'medium';
  el.draggable = true;

  el.addEventListener('dragstart', () => {
    dragCardId = card.id;
    dragSourceColId = state.columns.find(c => c.cards.some(cc => cc.id === card.id))?.id;
    setTimeout(() => el.classList.add('dragging'), 0);
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
  });
  el.addEventListener('click', e => {
    if (e.target.classList.contains('card-delete')) return;
    openModal(card.id);
  });

  const titleEl = document.createElement('div');
  titleEl.className = 'card-title';
  titleEl.textContent = card.title;

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const badge = document.createElement('span');
  badge.className = `priority-badge ${card.priority || 'medium'}`;
  badge.textContent = PRIORITY_LABEL[card.priority] || '中';

  meta.appendChild(badge);

  if (card.dueDate) {
    const due = document.createElement('span');
    due.className = 'due-date' + (isOverdue(card.dueDate) ? ' overdue' : '');
    due.textContent = '期限: ' + formatDate(card.dueDate);
    meta.appendChild(due);
  }

  const delBtn = document.createElement('button');
  delBtn.className = 'card-delete';
  delBtn.textContent = '×';
  delBtn.title = 'カードを削除';
  delBtn.addEventListener('click', e => {
    e.stopPropagation();
    deleteCard(card.id);
  });

  el.append(titleEl, meta, delBtn);
  return el;
}

function createAddCardArea(colId) {
  const area = document.createElement('div');
  area.className = 'add-card-area';

  const btn = document.createElement('button');
  btn.className = 'add-card-btn';
  btn.textContent = '+ カード追加';

  const form = document.createElement('div');
  form.className = 'add-card-form';

  const input = document.createElement('textarea');
  input.className = 'add-card-input';
  input.placeholder = 'カードのタイトルを入力...';
  input.rows = 2;

  const actions = document.createElement('div');
  actions.className = 'add-card-actions';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.textContent = '追加';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'キャンセル';

  actions.append(confirmBtn, cancelBtn);
  form.append(input, actions);
  area.append(btn, form);

  btn.addEventListener('click', () => {
    btn.style.display = 'none';
    form.classList.add('active');
    input.focus();
  });

  const cancel = () => {
    form.classList.remove('active');
    btn.style.display = '';
    input.value = '';
  };

  const confirm = () => {
    const title = input.value.trim();
    if (!title) return;
    addCard(colId, title);
    cancel();
  };

  confirmBtn.addEventListener('click', confirm);
  cancelBtn.addEventListener('click', cancel);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      confirm();
    }
    if (e.key === 'Escape') cancel();
  });

  return area;
}

// ── Column title inline edit ───────────────────────────────────────────────

function startEditColumnTitle(colId, titleEl) {
  const input = document.createElement('input');
  input.className = 'column-title-input';
  input.value = titleEl.textContent;
  titleEl.replaceWith(input);
  input.focus();
  input.select();

  const finish = () => {
    const val = input.value.trim();
    const col = state.columns.find(c => c.id === colId);
    if (col && val) col.title = val;
    saveState();
    renderBoard();
  };

  input.addEventListener('blur', finish);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') {
      input.value = titleEl.textContent;
      input.blur();
    }
  });
}

// ── Column actions ─────────────────────────────────────────────────────────

function addColumn() {
  state.columns.push({ id: uid(), title: '新しいカラム', cards: [] });
  saveState();
  renderBoard();
  // auto-start title edit for new column
  const board = document.getElementById('board');
  const last = board.lastElementChild;
  const titleEl = last?.querySelector('.column-title');
  if (titleEl) startEditColumnTitle(state.columns[state.columns.length - 1].id, titleEl);
}

function deleteColumn(colId) {
  state.columns = state.columns.filter(c => c.id !== colId);
  saveState();
  renderBoard();
}

// ── Card actions ───────────────────────────────────────────────────────────

function addCard(colId, title) {
  const col = state.columns.find(c => c.id === colId);
  if (!col) return;
  col.cards.push({
    id: uid(),
    title,
    description: '',
    dueDate: null,
    priority: 'medium',
  });
  saveState();
  renderBoard();
}

function deleteCard(cardId) {
  for (const col of state.columns) {
    const idx = col.cards.findIndex(c => c.id === cardId);
    if (idx !== -1) {
      col.cards.splice(idx, 1);
      saveState();
      renderBoard();
      return;
    }
  }
}

// ── Drag & Drop logic ──────────────────────────────────────────────────────

function handleDrop(targetColId) {
  if (!dragCardId || !dragSourceColId) return;
  if (dragSourceColId === targetColId) return;

  const srcCol = state.columns.find(c => c.id === dragSourceColId);
  const dstCol = state.columns.find(c => c.id === targetColId);
  if (!srcCol || !dstCol) return;

  const idx = srcCol.cards.findIndex(c => c.id === dragCardId);
  if (idx === -1) return;

  const [card] = srcCol.cards.splice(idx, 1);
  dstCol.cards.push(card);

  dragCardId = null;
  dragSourceColId = null;

  saveState();
  renderBoard();
}

// ── Modal ──────────────────────────────────────────────────────────────────

let editingCardId = null;

function openModal(cardId) {
  const result = findCard(cardId);
  if (!result) return;
  const { card } = result;
  editingCardId = cardId;

  document.getElementById('modal-card-title').value = card.title;
  document.getElementById('modal-card-desc').value = card.description || '';
  document.getElementById('modal-card-due').value = card.dueDate || '';
  document.getElementById('modal-card-priority').value = card.priority || 'medium';

  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('modal-card-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  editingCardId = null;
}

function saveModal() {
  if (!editingCardId) return;
  const result = findCard(editingCardId);
  if (!result) return;
  const { card } = result;

  card.title = document.getElementById('modal-card-title').value.trim() || card.title;
  card.description = document.getElementById('modal-card-desc').value.trim();
  card.dueDate = document.getElementById('modal-card-due').value || null;
  card.priority = document.getElementById('modal-card-priority').value;

  saveState();
  renderBoard();
  closeModal();
}

// ── Event listeners ────────────────────────────────────────────────────────

document.getElementById('add-column-btn').addEventListener('click', addColumn);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-save').addEventListener('click', saveModal);

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) saveModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('modal-overlay').classList.contains('active')) {
    closeModal();
  }
});

// ── Init ───────────────────────────────────────────────────────────────────

renderBoard();
