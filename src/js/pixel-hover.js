// Pixel hover interactions.
//
// 1. CTA buttons: a grid of cells over the button, re-rolled every 130ms
//    while hovered — each cell has a small chance of showing a random
//    accent colour. It flickers rather than fades, which is what makes it
//    feel alive instead of decorative.
// 2. Case-study images: a full-viewport canvas overlay redraws the hovered
//    image as chunky blocks near its corners, sampling the image's OWN
//    pixels so it looks like the picture itself is disintegrating.
//
// Technique borrowed in spirit from craft.wild.as, implemented here.
(function () {
    'use strict';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!finePointer) return;

    // --- CTA buttons: random pixel flicker ----------------------------
    (function ctaFlicker() {
        const SELECTOR = '.landing-link-card, .who-link-card, .footer-cta-mail';
        const ACCENTS = ['#ffffff', '#e7b968', '#a7bdd6', '#1b1c1e'];
        const CELL = 9, DENSITY = 0.14, TICK = 130;

        document.querySelectorAll(SELECTOR).forEach(btn => {
            if (btn.dataset.pxfx) return;
            btn.dataset.pxfx = '1';

            const fx = document.createElement('span');
            fx.className = 'pxfx';
            fx.setAttribute('aria-hidden', 'true');
            btn.appendChild(fx);

            let cells = [];
            function build() {
                const w = btn.offsetWidth, h = btn.offsetHeight;
                if (!w || !h) return;
                const cols = Math.ceil(w / CELL), rows = Math.ceil(h / CELL);
                if (cols * rows > 1200) return; // guard: never let the grid run away
                fx.textContent = '';
                fx.style.gridTemplateColumns = `repeat(${cols}, ${CELL}px)`;
                fx.style.gridAutoRows = CELL + 'px';
                cells = [];
                for (let i = 0; i < cols * rows; i++) cells.push(fx.appendChild(document.createElement('i')));
            }
            build();
            if (window.ResizeObserver) new ResizeObserver(build).observe(btn);
            if (reduce) return;

            let timer = null;
            const roll = () => {
                for (let i = 0; i < cells.length; i++) {
                    cells[i].style.background = Math.random() < DENSITY
                        ? ACCENTS[(Math.random() * ACCENTS.length) | 0]
                        : 'transparent';
                }
            };
            const clear = () => { for (let i = 0; i < cells.length; i++) cells[i].style.background = 'transparent'; };

            btn.addEventListener('mouseenter', () => {
                if (timer) return;
                roll();
                timer = setInterval(roll, TICK);
            });
            btn.addEventListener('mouseleave', () => {
                clearInterval(timer);
                timer = null;
                clear();
            });
        });
    })();

    // --- Case-study images: corners crumble into their own pixels ------
    (function imageCrumble() {
        if (reduce) return;
        const media = [].slice.call(document.querySelectorAll('.case-image img, .case-image--cover img'));
        if (!media.length) return;

        const cv = document.createElement('canvas');
        cv.setAttribute('aria-hidden', 'true');
        cv.className = 'crumble-layer';
        document.body.appendChild(cv);

        const ctx = cv.getContext('2d');
        const DPR = Math.min(devicePixelRatio || 1, 2);
        const BLOCK = 14;
        let W = 0, H = 0, target = null, raf = null;

        const off = document.createElement('canvas');
        const offc = off.getContext('2d', { willReadFrequently: true });

        function size() {
            W = innerWidth; H = innerHeight;
            cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        }
        size();
        addEventListener('resize', size);

        // Deterministic per-cell noise, re-seeded on each animation step so
        // the surviving blocks change and the corner appears to crumble.
        function hash(n) { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x); }

        function frame(ts) {
            ctx.clearRect(0, 0, W, H);
            if (!target) { raf = null; return; }

            const r = target.getBoundingClientRect();
            const mw = target.naturalWidth, mh = target.naturalHeight;
            if (r.width > 0 && r.bottom > 0 && r.top < H && mw && mh) {
                const cols = Math.floor(r.width / BLOCK), rows = Math.floor(r.height / BLOCK);
                if (cols >= 2 && rows >= 2) {
                    if (off.width !== cols || off.height !== rows) { off.width = cols; off.height = rows; }
                    // cover-fit sample of the image, downscaled to one pixel per block
                    const sc = Math.max(r.width / mw, r.height / mh);
                    const cw = r.width / sc, ch = r.height / sc;
                    let data = null;
                    try {
                        offc.drawImage(target, (mw - cw) / 2, (mh - ch) / 2, cw, ch, 0, 0, cols, rows);
                        data = offc.getImageData(0, 0, cols, rows).data;
                    } catch (e) { data = null; }

                    if (data) {
                        const step = Math.floor((ts || 0) / 90);
                        const reach = Math.min(cols, rows) * 0.62;
                        const s = BLOCK - 1;
                        for (let j = 0; j < rows; j++) {
                            for (let i = 0; i < cols; i++) {
                                const dcx = Math.min(i, cols - 1 - i), dcy = Math.min(j, rows - 1 - j);
                                let p = 1 - Math.sqrt(dcx * dcx + dcy * dcy) / reach;
                                if (p <= 0) continue;
                                p *= p; // densest right at the corners
                                if (hash(i * 12.9 + j * 78.2 + step * 3.1) > p) continue;
                                const k = (j * cols + i) * 4;
                                ctx.fillStyle = 'rgb(' + data[k] + ',' + data[k + 1] + ',' + data[k + 2] + ')';
                                ctx.fillRect(Math.round(r.left) + i * BLOCK, Math.round(r.top) + j * BLOCK, s, s);
                            }
                        }
                    }
                }
            }
            raf = requestAnimationFrame(frame);
        }

        media.forEach(img => {
            img.addEventListener('mouseenter', () => {
                target = img;
                if (raf === null) raf = requestAnimationFrame(frame);
            });
            img.addEventListener('mouseleave', () => {
                if (target === img) target = null;
            });
        });
    })();
})();
