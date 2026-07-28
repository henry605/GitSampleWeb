/* =========================================================
   AXIOM — Near-Future HUD Interface
   script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  initClock();
  initUptime();
  initTypedSubtitle();
  initMetrics();
  initTerminalLog();
  initScrollReveal();
  if (!prefersReducedMotion) initBackgroundCanvas();
  initAccessForm();
});

/* ---------------------------------------------------------
   1. トップバーの時計
   --------------------------------------------------------- */
function initClock() {
  const clockEl = document.getElementById('clock');
  if (!clockEl) return;

  const tick = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  };

  tick();
  setInterval(tick, 1000);
}

/* ---------------------------------------------------------
   2. フッターの稼働時間（ページ滞在時間）カウンター
   --------------------------------------------------------- */
function initUptime() {
  const uptimeEl = document.getElementById('uptime');
  if (!uptimeEl) return;

  const start = Date.now();

  const tick = () => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    uptimeEl.textContent = `UPTIME ${hh}:${mm}:${ss}`;
  };

  tick();
  setInterval(tick, 1000);
}

/* ---------------------------------------------------------
   3. ヒーローのサブタイトル タイプライター演出
   --------------------------------------------------------- */
function initTypedSubtitle() {
  const target = document.getElementById('typed-line');
  if (!target) return;

  const lines = [
    '次世代自律思考体との接続を確立しています…',
    'AXIOMコアが状況を継続的に学習し、再構成します。',
    '許可されたオペレーターのみアクセス可能です。'
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const current = lines[lineIndex];

    if (!deleting) {
      target.textContent = current.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      target.textContent = current.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
      }
    }

    const speed = deleting ? 28 : 45;
    setTimeout(type, speed);
  };

  type();
}

/* ---------------------------------------------------------
   4. ヒーローのHUDメトリクス（雰囲気演出用の疑似データ）
   --------------------------------------------------------- */
function initMetrics() {
  const tempEl = document.querySelector('[data-metric="temp"]');
  const syncEl = document.querySelector('[data-metric="sync"]');
  const uplinkEl = document.querySelector('[data-metric="uplink"]');
  if (!tempEl || !syncEl || !uplinkEl) return;

  let sync = 0;

  const update = () => {
    const temp = (36.2 + Math.random() * 0.8).toFixed(1);
    sync = Math.min(100, sync + Math.floor(Math.random() * 9));
    const uplink = (4 + Math.random() * 3).toFixed(1);

    tempEl.textContent = `${temp}°`;
    syncEl.textContent = `${String(sync).padStart(2, '0')}%`;
    uplinkEl.textContent = `${uplink} ms`;

    if (sync >= 100) sync = Math.floor(Math.random() * 20);
  };

  update();
  setInterval(update, 1400);
}

/* ---------------------------------------------------------
   5. ターミナル風システムログ
   --------------------------------------------------------- */
function initTerminalLog() {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const logs = [
    { text: 'SYSTEM BOOT SEQUENCE INITIATED', type: 'ok' },
    { text: 'LOADING NEURAL MODULES ... OK', type: 'ok' },
    { text: 'ESTABLISHING SATELLITE UPLINK ... OK', type: 'ok' },
    { text: 'CIPHER HANDSHAKE COMPLETE', type: 'ok' },
    { text: 'ANOMALY DETECTED IN SECTOR 04', type: 'warn' },
    { text: 'ANOMALY ISOLATED / CONTAINED', type: 'ok' },
    { text: 'DISTRIBUTED ADAPTATION ONLINE', type: 'ok' },
    { text: 'AXIOM CORE STATUS: NOMINAL', type: 'ok' },
  ];

  let elapsedSeconds = 0;
  let index = 0;

  const appendLine = () => {
    if (index >= logs.length) return;

    elapsedSeconds += Math.floor(Math.random() * 3) + 1;
    const hh = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(elapsedSeconds % 60).padStart(2, '0');

    const entry = logs[index];
    const line = document.createElement('span');
    line.className = 'log-line';
    line.innerHTML = `<span class="ts">[${hh}:${mm}:${ss}]</span> <span class="${entry.type}">${entry.text}</span>`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;

    index++;
    setTimeout(appendLine, 900);
  };

  appendLine();
}

/* ---------------------------------------------------------
   6. スクロールで要素をふわっと表示（IntersectionObserver）
   --------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   7. 背景キャンバス：遠近グリッド + 浮遊パーティクル
   --------------------------------------------------------- */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let pointer = { x: 0.5, y: 0.5 };

  const PARTICLE_COUNT = 70;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 1 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
    }));
  }

  function drawGrid(offsetX, offsetY) {
    const spacing = 64;
    ctx.strokeStyle = 'rgba(69, 240, 196, 0.05)';
    ctx.lineWidth = 1;

    for (let x = -spacing; x < width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x + offsetX, 0);
      ctx.lineTo(x + offsetX, height);
      ctx.stroke();
    }

    for (let y = -spacing; y < height + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y + offsetY);
      ctx.lineTo(width, y + offsetY);
      ctx.stroke();
    }
  }

  function drawParticles() {
    particles.forEach((p) => {
      p.y -= p.speed;
      if (p.y < 0) {
        p.y = height;
        p.x = Math.random() * width;
      }

      const parallaxX = (pointer.x - 0.5) * 20 * p.z;
      const parallaxY = (pointer.y - 0.5) * 20 * p.z;

      ctx.beginPath();
      ctx.arc(p.x + parallaxX, p.y + parallaxY, p.z * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(69, 240, 196, ${0.15 + p.z * 0.35})`;
      ctx.fill();
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    const offsetX = (pointer.x - 0.5) * 30;
    const offsetY = (pointer.y - 0.5) * 30;

    drawGrid(offsetX, offsetY);
    drawParticles();

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / window.innerWidth;
    pointer.y = e.clientY / window.innerHeight;
  });

  resize();
  createParticles();
  render();
}

/* ---------------------------------------------------------
   8. アクセス申請フォーム（デモ用の疑似判定）
   --------------------------------------------------------- */
function initAccessForm() {
  const form = document.getElementById('access-form');
  const input = document.getElementById('access-code');
  const result = document.getElementById('access-result');
  if (!form || !input || !result) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const code = input.value.trim();

    if (!code) {
      result.dataset.state = 'pending';
      result.textContent = '> 識別コードを入力してください';
      return;
    }

    result.dataset.state = 'pending';
    result.textContent = '> AUTHENTICATING ...';

    setTimeout(() => {
      result.dataset.state = 'granted';
      result.textContent = `> ACCESS GRANTED — WELCOME, OPERATOR "${code.toUpperCase()}"`;
    }, 1200);
  });
}