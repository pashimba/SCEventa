// Romantic Particle and Heart Burst System
class HeartConfetti {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'fx-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;

    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '99999'
    });

    document.body.appendChild(this.canvas);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createHeartPath(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // top left curve
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    // bottom left curve
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.2);
    // bottom right curve
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    // top right curve
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 70) {
    const colors = [
      '#ff4d88', '#ff70a6', '#ff9770', '#ffd670',
      '#70d6ff', '#b388ff', '#ff85a1', '#fbb1bd'
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4, // initial upward kick
        size: Math.random() * 14 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        life: 1,
        decay: Math.random() * 0.015 + 0.008,
        isStar: Math.random() > 0.6
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.vx *= 0.98; // air drag
      p.rotation += p.vRot;
      p.life -= p.decay;
      p.opacity = Math.max(0, p.life);

      if (p.life <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;

      if (p.isStar) {
        // Draw 4-point sparkle star
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.beginPath();
        const s = p.size * 0.6;
        for (let j = 0; j < 4; j++) {
          this.ctx.lineTo(0, -s);
          this.ctx.quadraticCurveTo(0, 0, s * 0.25, 0);
          this.ctx.rotate(Math.PI / 2);
        }
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Draw Heart
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.createHeartPath(this.ctx, -p.size / 2, -p.size / 2, p.size);
        this.ctx.restore();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Sparkle cursor trail
function initCursorSparkles() {
  let lastX = 0, lastY = 0;
  window.addEventListener('mousemove', (e) => {
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (dist > 35) {
      lastX = e.clientX;
      lastY = e.clientY;
      createMiniSparkle(e.clientX, e.clientY);
    }
  });

  window.addEventListener('click', (e) => {
    // Mini heart burst on every click
    createClickHeart(e.clientX, e.clientY);
  });
}

function createMiniSparkle(x, y) {
  const el = document.createElement('div');
  el.className = 'cursor-sparkle';
  el.textContent = ['✨', '💖', '⭐', '🌸', '🤍'][Math.floor(Math.random() * 5)];
  el.style.left = (x + (Math.random() * 20 - 10)) + 'px';
  el.style.top = (y + (Math.random() * 20 - 10)) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function createClickHeart(x, y) {
  const el = document.createElement('div');
  el.className = 'click-float-heart';
  el.textContent = ['❤️', '💖', '💕', '💗', '💓'][Math.floor(Math.random() * 5)];
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

document.addEventListener('DOMContentLoaded', () => {
  window.heartConfetti = new HeartConfetti();
  initCursorSparkles();
});
