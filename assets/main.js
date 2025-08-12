// Simple canvas splash + API wiring for leaderboard and pro check
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function drawSplash() {
  const w = canvas.width, h = canvas.height;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#1d4ed8');
  g.addColorStop(1, '#9333ea');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'white';
  ctx.font = '64px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Dominion Prototype', w / 2, h / 2 - 20);
  ctx.font = '20px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  ctx.fillText('Vercel Functions + KV + Canvas', w / 2, h / 2 + 24);
}

drawSplash();

// Lightweight client identity
const userIdEl = document.getElementById('userId');
let userId = localStorage.getItem('userId');
if (!userId) {
  userId = 'user-' + Math.random().toString(36).slice(2, 8);
  localStorage.setItem('userId', userId);
}
userIdEl.textContent = userId;

// Leaderboard
const lbEl = document.getElementById('leaderboard');
async function refreshLeaderboard() {
  lbEl.innerHTML = '<li class="muted">Loading…</li>';
  const res = await fetch('/api/leaderboard');
  const data = await res.json();
  const entries = Array.isArray(data.top) ? data.top : [];

  // data.top returns [member, score, member, score, ...] with withScores:true
  const pairs = [];
  for (let i = 0; i < entries.length; i += 2) {
    pairs.push({ userId: entries[i], score: entries[i + 1] });
  }

  // Use a normal hyphen instead of an em dash to match Greg's style
  lbEl.innerHTML = pairs.map((p, idx) => `<li>#${idx + 1} ${p.userId} - ${p.score}</li>`).join('') || '<li class="muted">No scores yet</li>';
}

async function submitRandomScore() {
  const score = Math.floor(Math.random() * 100);
  const btn = document.getElementById('btnRandomScore');
  btn.disabled = true;
  await fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, score })
  });
  btn.disabled = false;
  refreshLeaderboard();
}

// Pro check
async function checkPro() {
  const email = document.getElementById('email').value.trim();
  const out = document.getElementById('proResult');
  if (!email) { out.textContent = 'Enter an email.'; return; }
  out.textContent = 'Checking…';
  const res = await fetch('/api/is-pro?email=' + encodeURIComponent(email));
  const data = await res.json();
  out.textContent = data.pro ? 'Pro: yes' : 'Pro: no';
}

// Wire buttons
document.getElementById('btnRandomScore').addEventListener('click', submitRandomScore);
document.getElementById('btnRefresh').addEventListener('click', refreshLeaderboard);

refreshLeaderboard();

document.getElementById('btnCheckPro').addEventListener('click', checkPro);
