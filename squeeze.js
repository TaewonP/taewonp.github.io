/*
 * Squeezing visual — the site symbol.
 * A sine "signal" sits hidden inside a wide cloud of photon-counting noise
 * (signal buried). As squeezing is introduced, the noise collapses and the
 * signal is revealed — then it relaxes back, looping. (cf. squeezing photo.jpg)
 * Drives the header logo (#squeezeLogo, where present) and the animated favicon.
 */
(function () {
    var COLOR = '#224f8a'; // a refined navy blue for the data points

    function gauss() { // Box–Muller
        var u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function makeSqueeze(ctx, W, H, o) {
        o = o || {};
        var N = o.N || 130, r = o.r || 2.1, speed = o.speed || 0.4;
        var cy = H / 2;
        var amp = H * (o.amp || 0.16);            // signal amplitude
        var sigWide = H * (o.sigWide || 0.30);    // noise spread when "buried"
        var sigNarrow = Math.max(0.8, H * (o.sigNarrow || 0.04)); // when "squeezed"
        var cycles = o.cycles || 2;
        var rate = o.rate || 0.02;
        var col = o.color || COLOR;
        var pts = [];
        for (var i = 0; i < N; i++) pts.push({ x: Math.random() * W, g: gauss() });

        function signal(x) { return cy + amp * Math.sin(2 * Math.PI * cycles * (x / W)); }

        var t = o.phase || 0;
        return function step() {
            t += rate;
            var sq = (1 - Math.cos(t)) / 2;       // 0 = buried, 1 = squeezed
            sq = sq * sq * (3 - 2 * sq);          // ease — linger at the extremes
            var sigma = sigWide + (sigNarrow - sigWide) * sq;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = col;
            for (var i = 0; i < N; i++) {
                var p = pts[i];
                p.x -= speed;
                if (p.x < 0) { p.x = W; p.g = gauss(); }
                var y = signal(p.x) + p.g * sigma;
                if (y < r || y > H - r) continue;
                ctx.beginPath();
                ctx.arc(p.x, y, r, 0, 6.2832);
                ctx.fill();
            }
        };
    }

    function start() {
        // Header logo — only on pages that have the canvas
        var c = document.getElementById('squeezeLogo');
        if (c) {
            var W = 172, H = 50, dpr = window.devicePixelRatio || 1;
            c.width = W * dpr; c.height = H * dpr;
            c.style.width = W + 'px'; c.style.height = H + 'px';
            var ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
            var logoStep = makeSqueeze(ctx, W, H, { N: 130, r: 1.8, speed: 0.4, rate: 0.02 });
            (function loop() { logoStep(); requestAnimationFrame(loop); })();
        }

        // Animated favicon — the site symbol, on every page
        var fav = document.getElementById('favicon');
        if (!fav) {
            fav = document.createElement('link');
            fav.id = 'favicon'; fav.rel = 'icon'; fav.type = 'image/png';
            document.head.appendChild(fav);
        }
        var S = 64, fc = document.createElement('canvas');
        fc.width = S; fc.height = S;
        var fctx = fc.getContext('2d');
        var favStep = makeSqueeze(fctx, S, S, { N: 90, r: 2.4, speed: 0.7, amp: 0.17, sigWide: 0.30, sigNarrow: 0.06, cycles: 2, rate: 0.16 });
        setInterval(function () { favStep(); fav.href = fc.toDataURL('image/png'); }, 110);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
