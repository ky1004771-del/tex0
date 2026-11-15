(function () {
  try {
    var c = document.getElementById('fx');
    if (!c || !c.getContext) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, flakes = [], running = true;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make(initial) {
      var gold = Math.random() < 0.13;
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : -12,
        r: gold ? Math.random() * 1.3 + 0.8 : Math.random() * 2.1 + 0.5,
        vy: Math.random() * 0.55 + 0.22,
        sway: Math.random() * 0.7 + 0.2,
        ph: Math.random() * 6.28,
        tw: Math.random() * 6.28,
        gold: gold
      };
    }

    function init() {
      resize();
      var n = W < 700 ? 55 : 120;
      flakes = [];
      for (var i = 0; i < n; i++) flakes.push(make(true));
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.vy;
        f.ph += 0.012;
        f.tw += 0.05;
        f.x += Math.sin(f.ph) * f.sway * 0.5;

        if (f.y > H + 12) { flakes[i] = make(false); continue; }
        if (f.x < -12) f.x = W + 12;
        if (f.x > W + 12) f.x = -12;

        if (f.gold) {
          var a = 0.35 + 0.65 * Math.abs(Math.sin(f.tw));
          var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 4);
          g.addColorStop(0, 'rgba(255,240,200,' + a + ')');
          g.addColorStop(0.35, 'rgba(240,207,139,' + (a * 0.55) + ')');
          g.addColorStop(1, 'rgba(240,207,139,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r * 4, 0, 6.2832);
          ctx.fill();
        } else {
          var al = Math.min(0.9, 0.25 + f.r * 0.28);
          if (f.r > 1.8) {
            var s = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 1.8);
            s.addColorStop(0, 'rgba(240,244,255,' + al + ')');
            s.addColorStop(1, 'rgba(240,244,255,0)');
            ctx.fillStyle = s;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r * 1.8, 0, 6.2832);
            ctx.fill();
          } else {
            ctx.fillStyle = 'rgba(240,244,255,' + al + ')';
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, 6.2832);
            ctx.fill();
          }
        }
      }
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; requestAnimationFrame(frame); }
    });

    init();
    requestAnimationFrame(frame);
  } catch (e) { /* 효과 오류는 무시 */ }
})();
