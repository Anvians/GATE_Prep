const API = '/api';
const SECTIONS = ['GA', 'MATH', 'AMD', 'FTS', 'MMI'];
const SECTION_TITLES = {
  GA: 'General Aptitude',
  MATH: 'Engineering Mathematics',
  AMD: 'Applied Mechanics & Design',
  FTS: 'Fluid Mechanics & Thermal Sciences',
  MMI: 'Materials, Manufacturing & Industrial Engg',
};

let EXAM_DATE = new Date('2027-02-06T00:00:00+05:30');
let TARGET_SCORE = 60;
let topicsCache = [];
let mocksCache = [];

/* ---------------- Countdown ---------------- */
function tickCountdown() {
  const now = new Date();
  let diff = EXAM_DATE - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);

  document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
}

async function loadConfig() {
  try {
    const res = await fetch(`${API}/config`);
    const cfg = await res.json();
    if (cfg.examDate) EXAM_DATE = new Date(cfg.examDate);
    if (cfg.targetScore) TARGET_SCORE = cfg.targetScore;
  } catch (e) {
    console.warn('Using default exam date, could not reach /api/config');
  }
  tickCountdown();
  setInterval(tickCountdown, 30000);
}

/* ---------------- Topics ---------------- */
async function loadTopics() {
  const res = await fetch(`${API}/topics`);
  topicsCache = await res.json();
  renderLedgers();
  renderProgress();
}

function renderProgress() {
  SECTIONS.forEach((section) => {
    const items = topicsCache.filter((t) => t.section === section);
    const total = items.length;
    const done = items.filter((t) => t.status === 'completed').length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById(`bar-${section}`).style.width = pct + '%';
    document.getElementById(`pct-${section}`).textContent = pct + '%';
  });
}

function renderLedgers() {
  const container = document.getElementById('ledgers');
  container.innerHTML = '';

  SECTIONS.forEach((section) => {
    const items = topicsCache.filter((t) => t.section === section);
    const done = items.filter((t) => t.status === 'completed').length;

    const card = document.createElement('div');
    card.className = 'ledger-card';

    card.innerHTML = `
      <div class="ledger-head">
        <h2>${SECTION_TITLES[section]}</h2>
        <span class="ledger-count">${done} / ${items.length} done</span>
      </div>
      <div class="topic-list" data-section="${section}"></div>
      <div class="add-topic-row">
        <input type="text" placeholder="Add a topic to ${section}..." data-add-section="${section}" />
        <button class="btn-small" data-add-btn="${section}">Add</button>
      </div>
    `;

    const list = card.querySelector('.topic-list');
    items.forEach((topic) => list.appendChild(renderTopicRow(topic)));

    container.appendChild(card);
  });

  // wire up "add topic" controls
  container.querySelectorAll('[data-add-btn]').forEach((btn) => {
    btn.addEventListener('click', () => addTopic(btn.dataset.addBtn));
  });
  container.querySelectorAll('[data-add-section]').forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTopic(input.dataset.addSection);
    });
  });
}

function renderTopicRow(topic) {
  const row = document.createElement('div');
  row.className = `topic-row ${topic.status === 'completed' ? 'completed' : ''}`;
  row.dataset.id = topic._id;

  row.innerHTML = `
    <div class="topic-row-main">
      <button class="status-dot ${topic.status}" title="Click to change status"></button>
      <span class="topic-name">${escapeHtml(topic.name)}</span>
      <button class="topic-notes-toggle">notes</button>
      <button class="topic-delete" title="Delete topic">&times;</button>
    </div>
    <div class="topic-notes">
      <textarea placeholder="Notes on ${escapeHtml(topic.name)}...">${escapeHtml(topic.notes || '')}</textarea>
    </div>
  `;

  const dot = row.querySelector('.status-dot');
  dot.addEventListener('click', () => cycleStatus(topic));

  const notesToggle = row.querySelector('.topic-notes-toggle');
  const notesBox = row.querySelector('.topic-notes');
  notesToggle.addEventListener('click', () => notesBox.classList.toggle('open'));

  const textarea = row.querySelector('textarea');
  let saveTimer;
  textarea.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveTopicNotes(topic._id, textarea.value), 600);
  });

  row.querySelector('.topic-delete').addEventListener('click', () => deleteTopic(topic._id));

  return row;
}

function nextStatus(status) {
  if (status === 'not-started') return 'in-progress';
  if (status === 'in-progress') return 'completed';
  return 'not-started';
}

async function cycleStatus(topic) {
  const newStatus = nextStatus(topic.status);
  await fetch(`${API}/topics/${topic._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
  await loadTopics();
}

async function saveTopicNotes(id, notes) {
  await fetch(`${API}/topics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
}

async function addTopic(section) {
  const input = document.querySelector(`[data-add-section="${section}"]`);
  const name = input.value.trim();
  if (!name) return;
  await fetch(`${API}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, name }),
  });
  input.value = '';
  await loadTopics();
}

async function deleteTopic(id) {
  if (!confirm('Delete this topic?')) return;
  await fetch(`${API}/topics/${id}`, { method: 'DELETE' });
  await loadTopics();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------- Mocks ---------------- */
async function loadMocks() {
  const res = await fetch(`${API}/mocks`);
  mocksCache = await res.json();
  renderMockTable();
  drawChart();
}

function renderMockTable() {
  const tbody = document.getElementById('mock-tbody');
  tbody.innerHTML = '';

  if (mocksCache.length === 0) {
    tbody.innerHTML = `<tr class="mock-empty-row"><td colspan="10">No mocks logged yet. Add your first one above.</td></tr>`;
    return;
  }

  [...mocksCache].reverse().forEach((m) => {
    const tr = document.createElement('tr');
    const dateStr = new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    tr.innerHTML = `
      <td>${dateStr}</td>
      <td>${escapeHtml(m.source || '—')}</td>
      <td>${m.gaScore ?? '—'}</td>
      <td>${m.mathScore ?? '—'}</td>
      <td>${m.amdScore ?? '—'}</td>
      <td>${m.ftsScore ?? '—'}</td>
      <td>${m.mmiScore ?? '—'}</td>
      <td class="percentile-cell">${m.overallScore ?? '—'}</td>
      <td>${m.percentile ?? '—'}</td>
      <td><button class="mock-delete" data-id="${m._id}">&times;</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.mock-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteMock(btn.dataset.id));
  });
}

async function deleteMock(id) {
  if (!confirm('Delete this mock entry?')) return;
  await fetch(`${API}/mocks/${id}`, { method: 'DELETE' });
  await loadMocks();
}

function drawChart() {
  const canvas = document.getElementById('score-chart');
  const emptyMsg = document.getElementById('chart-empty');
  const ctx = canvas.getContext('2d');

  const points = mocksCache.filter((m) => m.overallScore !== null && m.overallScore !== undefined);

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio || canvas.parentElement.clientWidth * devicePixelRatio;
  canvas.height = 140 * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;
  ctx.clearRect(0, 0, w, h);

  if (points.length === 0) {
    emptyMsg.style.display = 'flex';
    return;
  }
  emptyMsg.style.display = 'none';

  const padding = 20;
  const maxP = 100;
  const minP = Math.min(30, ...points.map((p) => p.overallScore));

  // target line (default 60 marks)
  const targetY = padding + (1 - (TARGET_SCORE - minP) / (maxP - minP)) * (h - padding * 2);
  ctx.strokeStyle = 'rgba(232,163,61,0.35)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padding, targetY);
  ctx.lineTo(w - padding, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(138,147,160,0.7)';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillText('target ' + TARGET_SCORE, padding, targetY - 6);

  // line path
  const stepX = (w - padding * 2) / Math.max(points.length - 1, 1);
  ctx.strokeStyle = '#E8A33D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = padding + i * stepX;
    const y = padding + (1 - (p.overallScore - minP) / (maxP - minP)) * (h - padding * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // dots
  ctx.fillStyle = '#E8A33D';
  points.forEach((p, i) => {
    const x = padding + i * stepX;
    const y = padding + (1 - (p.overallScore - minP) / (maxP - minP)) * (h - padding * 2);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ---------------- Mock form ---------------- */
function wireMockForm() {
  const toggleBtn = document.getElementById('toggle-mock-form');
  const cancelBtn = document.getElementById('cancel-mock-form');
  const form = document.getElementById('mock-form');

  toggleBtn.addEventListener('click', () => form.classList.toggle('hidden'));
  cancelBtn.addEventListener('click', () => form.classList.add('hidden'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      date: document.getElementById('mock-date').value,
      source: document.getElementById('mock-source').value,
      gaScore: numOrNull('mock-ga'),
      mathScore: numOrNull('mock-math'),
      amdScore: numOrNull('mock-amd'),
      ftsScore: numOrNull('mock-fts'),
      mmiScore: numOrNull('mock-mmi'),
      overallScore: numOrNull('mock-overall'),
      percentile: numOrNull('mock-percentile'),
      notes: document.getElementById('mock-notes').value,
    };
    await fetch(`${API}/mocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    form.reset();
    form.classList.add('hidden');
    await loadMocks();
  });
}

function numOrNull(id) {
  const val = document.getElementById(id).value;
  return val === '' ? null : Number(val);
}

/* ---------------- Init ---------------- */
window.addEventListener('resize', () => drawChart());

(async function init() {
  await loadConfig();
  await loadTopics();
  await loadMocks();
  wireMockForm();
})();
