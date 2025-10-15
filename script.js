// Basit Flappy Bird - tek dosyada oyun mantığı, hafif fizik
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

let frames = 0;
let pipes = [];
const PIPE_W = 60;
const GAP = 180; // engeller arası boşluk
let speed = 2.2;
let score = 0;
let highScore = 0;
let gameOver = false;
let running = false;

const uiScore = document.getElementById('score');
const uiMsg = document.getElementById('msg');

// Kuş objesi
const bird = {
  x: 80,
  y: H,
  r: 16,
  vy: 0,
  gravity: 0.10,    // düşme yavaş
  jumpForce: 3.5,   // zıplama hafif
  rotation: 0,
  reset() {
    this.y = H/2;
    this.vy = 0;
    this.rotation = 0;
  },
  flap() {
    this.vy = -this.jumpForce;
  },
  update() {
    this.vy += this.gravity;
    this.y += this.vy;
    if (this.vy > 1.5) this.rotation = Math.min(Math.PI/2, this.rotation + 0.08);
    else this.rotation = Math.max(-0.6, this.rotation - 0.12);
    if (this.y + this.r >= H) { this.y = H - this.r; gameOver = true; }
    if (this.y - this.r <= 0) { this.y = this.r; this.vy = 0; }
  },
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = '#FFD23F';
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#FF8C42';
    ctx.beginPath();
    ctx.moveTo(this.r - 2, 0);
    ctx.lineTo(this.r + 12, -6);
    ctx.lineTo(this.r + 12, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(6, -4, 3.2, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
};

function resetGame() {
  pipes = [];
  frames = 0;
  score = 0;
  speed = 2.2;
  gameOver = false;
  running = true;
  bird.reset();
  uiMsg.classList.add('hidden');
  uiScore.textContent = String(score);
  loop();
}

function spawnPipe() {
  const topH = Math.max(40, Math.random() * (H - GAP - 120) + 40);
  pipes.push({ x: W, top: topH, bottom: topH + GAP, passed: false });
}

function updatePipes() {
  if (frames % 90 === 0) spawnPipe();

  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= speed;

    if (!p.passed && p.x + PIPE_W < bird.x - bird.r) {
      p.passed = true;
      score += 1;
      uiScore.textContent = String(score);
      if (score % 6 === 0) speed += 0.12;
    }

    if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_W) {
      if (bird.y - bird.r < p.top || bird.y + bird.r > p.bottom) {
        gameOver = true;
      }
    }

    if (p.x + PIPE_W < -30) pipes.splice(i,1);
  }
}

function drawPipes() {
  ctx.fillStyle = '#2e8b57';
  ctx.strokeStyle = '#196F3D';
  ctx.lineWidth = 3;
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, PIPE_W, p.top);
    ctx.strokeRect(p.x, 0, PIPE_W, p.top);
    ctx.fillRect(p.x, p.bottom, PIPE_W, H - p.bottom);
    ctx.strokeRect(p.x, p.bottom, PIPE_W, H - p.bottom);
  });
}

function drawBackground() {
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#c67e4a';
  ctx.fillRect(0, H - 40, W, 40);
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i=0;i<10;i++){
    ctx.fillRect((i*80 + (frames*0.5 % 80)), H-38, 60, 6);
  }
}

function draw() {
  drawBackground();
  drawPipes();
  bird.draw();
}

function loop() {
  frames++;
  ctx.clearRect(0,0,W,H);

  bird.update();
  updatePipes();
  draw();

  if (!gameOver) {
    requestAnimationFrame(loop);
  } else {
    running = false;
    if (score > highScore) highScore = score;
    uiMsg.textContent = `Oyun Bitti — Puan: ${score} · Rekor: ${highScore} · Tekrar oynamak için tıkla veya boşluk`;
    uiMsg.classList.remove('hidden');
  }
}

// Input
function handleFlap() {
  if (!running) { resetGame(); return; }
  if (!gameOver) bird.flap();
}
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); if (!running || gameOver) resetGame(); else bird.flap(); }
});
window.addEventListener('pointerdown', (e) => { e.preventDefault(); if (!running || gameOver) resetGame(); else bird.flap(); });

uiMsg.addEventListener('click', () => { resetGame(); });

uiMsg.textContent = 'Başlamak için ekrana dokun veya boşluk tuşu';
uiMsg.classList.remove('hidden');
uiScore.textContent = '0';

function fitCanvas() {
  const targetWidth = Math.min(window.innerWidth * 0.92, 360);
  const scale = targetWidth / 400;
  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = 'top left';
  document.getElementById('ui').style.width = `${targetWidth}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();