(function () {
  if (window.FX_SNOW) initSnow();
  if (window.FX_LEAVES) initLeaves();
  function initSnow() {
    const c = document.getElementById('snow-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, flakes = [];
    function resize() { w = c.width = innerWidth; h = c.height = innerHeight; }
    resize(); addEventListener('resize', resize);
    for (let i = 0; i < 80; i++) flakes.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 1, s: Math.random() + 0.5 });
    (function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      flakes.forEach((f) => {
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill();
        f.y += f.s; if (f.y > h) f.y = -5;
      });
      requestAnimationFrame(draw);
    })();
  }
  function initLeaves() {
    const c = document.getElementById('leaves-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, leaves = [];
    function resize() { w = c.width = innerWidth; h = c.height = innerHeight; }
    resize(); addEventListener('resize', resize);
    for (let i = 0; i < 35; i++) leaves.push({ x: Math.random() * w, y: Math.random() * h, s: Math.random() * 8 + 6, yv: Math.random() + 0.4 });
    (function draw() {
      ctx.clearRect(0, 0, w, h);
      leaves.forEach((l) => {
        ctx.fillStyle = 'rgba(180,120,50,0.7)';
        ctx.fillRect(l.x, l.y, l.s, l.s / 2);
        l.y += l.yv; if (l.y > h) l.y = -15;
      });
      requestAnimationFrame(draw);
    })();
  }
})();
