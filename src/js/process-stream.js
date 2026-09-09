// Process stream: a river of pixels running left to right across the four
// steps (Discovery -> Ship). It is widest and most scattered at the start,
// pinches into a narrow line in the middle, then opens back up — the shape
// carries the idea that exploration converges before it scales.
//
// Canvas 2D, one block per grid cell, re-rolled ~9 times a second so it
// twinkles like a dot-matrix panel rather than sliding smoothly.
(function () {
    'use strict';
    const cv = document.getElementById('process-stream');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const PX = 7;                 // block size in CSS px
    const STEP_MS = 110;          // how often the twinkle re-rolls
    let W = 0, H = 0, cols = 0, rows = 0, visible = true, raf = null, lastStep = -1;

    function cssVar(name, fallback) {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fallback;
    }

    // Two families rather than a gradient: every block is either cold or
    // warm, so the middle reads as the two mixing instead of turning into
    // muddy grey. Light variants give the field some texture.
    let COLD, COLD_L, WARM, WARM_L, INK;
    function readPalette() {
        COLD = cssVar('--cta-blue', '#3566b3');
        COLD_L = '#8fb0d8';
        WARM = cssVar('--flow-gold', '#e0ac4e');
        WARM_L = '#f2d49a';
        INK = cssVar('--text', '#2b2c2b');
    }

    // stable pseudo-random in [0,1)
    function hash(n) { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x); }

    function size() {
        const r = cv.getBoundingClientRect();
        if (r.width < 2) return;
        W = r.width; H = r.height;
        cv.width = Math.round(W * DPR);
        cv.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        cols = Math.ceil(W / PX);
        rows = Math.ceil(H / PX);
        lastStep = -1;
    }

    function draw(step) {
        ctx.clearRect(0, 0, W, H);
        const mid = rows / 2;
        const drift = step * 0.05;

        for (let i = 0; i < cols; i++) {
            const p = i / (cols - 1);

            // "Order" runs 0 -> 1: scattered mess at Discovery, fully
            // gathered by step 2 (Design), then it stays a fine line for
            // Build and Ship. The four labels sit at roughly 4/27/50/74%.
            const t = Math.min(1, Math.max(0, (p - 0.03) / 0.27));
            const o = t * t * (3 - 2 * t);            // smoothstep

            // Main strand. It wanders a lot while things are still messy and
            // settles into a calm wave once it is ordered.
            const cy = mid
                + Math.sin(p * 5.2 + drift) * rows * 0.13 * (1 - 0.55 * o)
                + Math.sin(p * 12.7 - drift * 0.6) * rows * 0.06 * (1 - o);

            // A second fine strand that only separates out on the ordered side.
            const cy2 = cy + Math.sin(p * 8.4 + drift * 1.4) * rows * 0.115 * o;

            // Vertical scatter collapses from a wide cloud to a fine line,
            // while the strand fills in so the right stays continuous.
            const spread = rows * (0.46 * (1 - o) + 0.022);
            const fill = 0.17 + 0.78 * o;

            // Odds that a given block is warm rather than cold: all blue on
            // the left, all gold on the right, genuinely mixed in between.
            const warmChance = Math.min(1, Math.max(0, p * 1.45 - 0.16));

            for (let j = 0; j < rows; j++) {
                let d = Math.abs(j - cy) / spread;
                if (o > 0.5) d = Math.min(d, Math.abs(j - cy2) / spread);
                if (d > 1) continue;

                const density = Math.pow(1 - d, 1.25) * fill;
                if (hash(i * 12.9 + j * 78.2 + step * 3.7) > density) continue;

                const tone = hash(i * 3.1 + j * 7.7 + step * 1.3);
                const warm = hash(i * 5.7 + j * 2.3 + step * 0.9) < warmChance;
                let col;
                // Dark specks only belong to the noisy side; the resolved
                // end stays clean.
                if (tone > 0.955 && o < 0.5) col = INK;
                else if (warm) col = tone > 0.62 ? WARM_L : WARM;
                else col = tone > 0.62 ? COLD_L : COLD;

                ctx.globalAlpha = 0.55 + 0.30 * (1 - d) + 0.15 * o;
                ctx.fillStyle = col;
                ctx.fillRect(i * PX, j * PX, PX - 1, PX - 1);
            }
        }
        ctx.globalAlpha = 1;
    }

    function loop(ts) {
        if (!visible) { raf = null; return; }
        const step = Math.floor((ts || 0) / STEP_MS);
        if (step !== lastStep) { lastStep = step; draw(step); }
        raf = requestAnimationFrame(loop);
    }

    function start() {
        if (raf === null && !reduce) raf = requestAnimationFrame(loop);
    }

    readPalette();
    size();
    draw(0);

    if (window.ResizeObserver) new ResizeObserver(() => { size(); draw(lastStep < 0 ? 0 : lastStep); }).observe(cv);

    // Only animate while the block is actually on screen.
    if (window.IntersectionObserver) {
        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            if (visible) start();
        }, { threshold: 0.05 }).observe(cv);
    } else {
        visible = true;
        start();
    }

    // Follow the light/dark toggle.
    new MutationObserver(() => { readPalette(); draw(lastStep < 0 ? 0 : lastStep); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
