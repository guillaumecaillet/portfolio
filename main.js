(() => {
    'use strict';

    // --- ASCII Art Loader ---
    const loader = document.getElementById('loader');
    const loaderAscii = document.getElementById('loader-ascii');

    const asciiFrames = [];
    const chars = '.:-=+*#%@';
    const w = 48, h = 24;

    // Generate frames of a morphing circle/blob
    for (let f = 0; f <= 40; f++) {
        const progress = f / 40;
        let frame = '';
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const nx = (x - w / 2) / (w / 2);
                const ny = (y - h / 2) / (h / 2) * 1.8;
                const dist = Math.sqrt(nx * nx + ny * ny);
                const radius = 0.7 + 0.15 * Math.sin(progress * Math.PI * 4 + Math.atan2(ny, nx) * 3);
                const filled = dist < radius * progress;
                if (filled) {
                    const intensity = Math.floor((1 - dist / radius) * (chars.length - 1) * progress);
                    frame += chars[Math.min(Math.max(intensity, 0), chars.length - 1)];
                } else {
                    frame += ' ';
                }
            }
            frame += '\n';
        }
        asciiFrames.push(frame);
    }

    let frameIndex = 0;
    const loaderInterval = setInterval(() => {
        if (frameIndex < asciiFrames.length) {
            loaderAscii.textContent = asciiFrames[frameIndex];
            frameIndex++;
        } else {
            clearInterval(loaderInterval);
            setTimeout(() => {
                // Char blur: blur ASCII chars before fading loader
                loaderAscii.style.filter = 'blur(18px)';
                // Fade out loader after blur is underway
                setTimeout(() => {
                    loader.classList.add('done');
                    startSphere();
                    setTimeout(() => revealTitle(), 400);
                    setTimeout(() => loader.remove(), 1000);
                }, 250);
            }, 200);
        }
    }, 65);

    // --- Split-flap title reveal ---
    function revealTitle() {
        const lines = document.querySelectorAll('.landing-title .line');
        const scramblePool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';

        function revealLine(lineIndex) {
            if (lineIndex >= lines.length) {
                // All lines done — fade in subtitle and links
                const sub = document.querySelector('.landing-sub');
                const links = document.querySelector('.landing-links');
                if (sub) setTimeout(() => sub.classList.add('visible'), 200);
                if (links) setTimeout(() => links.classList.add('visible'), 400);
                return;
            }
            const line = lines[lineIndex];
            line.classList.add('revealed');

            const nodes = [];
            line.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    nodes.push({ type: 'text', node, original: node.textContent });
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    nodes.push({ type: 'element', node, original: node.textContent });
                }
            });

            const totalLength = nodes.reduce((sum, n) => sum + n.original.length, 0);
            let iteration = 0;

            const interval = setInterval(() => {
                let charIndex = 0;

                nodes.forEach(n => {
                    const text = n.original;
                    let result = '';

                    for (let i = 0; i < text.length; i++) {
                        if (text[i] === ' ') {
                            result += ' ';
                        } else if (charIndex < iteration) {
                            result += text[i];
                        } else {
                            result += scramblePool[Math.floor(Math.random() * scramblePool.length)];
                        }
                        charIndex++;
                    }

                    n.node.textContent = result;
                });

                iteration += 0.5;
                if (iteration >= totalLength) {
                    clearInterval(interval);
                    nodes.forEach(n => { n.node.textContent = n.original; });
                    // Next line once this one is done
                    revealLine(lineIndex + 1);
                }
            }, 30);
        }

        revealLine(0);
    }

    // --- ASCII Sphere Background ---
    const sphereEl = document.getElementById('ascii-sphere');
    const sW = 56, sH = 28;
    const sAspect = (sW / sH) / 2.15;
    const sR = 0.82;
    const sChars = ' ..,,::;;!!**##%%@@';
    const sLx = 0.57, sLy = -0.40, sLz = 0.72;
    const sLLen = Math.sqrt(sLx*sLx + sLy*sLy + sLz*sLz);
    let sAngle = 0;
    let sRunning = false;
    let sTimer = null;

    function renderSphereFrame() {
        const cosA = Math.cos(sAngle), sinA = Math.sin(sAngle);
        let result = '';
        for (let row = 0; row < sH; row++) {
            for (let col = 0; col < sW; col++) {
                const sx = (col / sW * 2 - 1) * sAspect;
                const sy = (row / sH * 2 - 1);
                const r2 = sx*sx + sy*sy;
                if (r2 > sR*sR) { result += ' '; continue; }
                const sz = Math.sqrt(sR*sR - r2);
                const nx = sx*cosA + sz*sinA;
                const ny = sy;
                const nz = -sx*sinA + sz*cosA;
                let L = (nx*sLx + ny*sLy + nz*sLz) / sLLen;
                L = Math.max(0.05, L);
                const lon = Math.atan2(nx, nz);
                const lat = Math.asin(Math.max(-1, Math.min(1, ny / sR)));
                const isGrid = Math.abs(Math.sin(lon * 6)) < 0.10 || Math.abs(Math.sin(lat * 4)) < 0.10;
                if (isGrid) L = Math.max(0.03, L * 0.25);
                result += sChars[Math.floor(L * (sChars.length - 1))];
            }
            result += '\n';
        }
        return result;
    }

    function startSphere() {
        if (sRunning || !sphereEl) return;
        sRunning = true;
        (function tick() {
            if (!sRunning) return;
            sphereEl.textContent = renderSphereFrame();
            sAngle += 0.009;
            sTimer = setTimeout(tick, 80);
        })();
    }

    function stopSphere() {
        sRunning = false;
        clearTimeout(sTimer);
    }

    // --- Pastel Hover on Landing Link Cards ---
    const pastels = [
        '#FFD1DC', '#FFDAC1', '#FFF1C1', '#D4F0C0',
        '#C1E1FF', '#E1C1FF', '#FFE1F0', '#C1FFE1',
        '#FFE8C1', '#D1C1FF', '#C1FFF4', '#FFC1C1',
    ];

    // --- Split-flap scramble effect ---
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    function addScramble(el, textEl) {
        const target = textEl || el;
        const originalText = target.textContent;
        let scrambleInterval = null;

        el.addEventListener('mouseenter', () => {
            let iteration = 0;
            clearInterval(scrambleInterval);
            scrambleInterval = setInterval(() => {
                target.textContent = originalText
                    .split('')
                    .map((char, i) => {
                        if (char === ' ') return ' ';
                        if (i < iteration) return originalText[i];
                        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    })
                    .join('');
                iteration += 1 / 2;
                if (iteration >= originalText.length) {
                    clearInterval(scrambleInterval);
                    target.textContent = originalText;
                }
            }, 30);
        });

        el.addEventListener('mouseleave', () => {
            clearInterval(scrambleInterval);
            target.textContent = originalText;
        });
    }

    // Oplit link
    const oplitLink = document.querySelector('.landing-company');
    if (oplitLink) addScramble(oplitLink);

    // Nav links
    document.querySelectorAll('.nav-link').forEach(el => addScramble(el));

    // Landing link cards & who-link-cards (scramble the label)
    document.querySelectorAll('.landing-link-card, .who-link-card').forEach(card => {
        const label = card.querySelector('.landing-link-card-label, .who-link-card-label');
        if (label) addScramble(card, label);
    });

    // Who links
    document.querySelectorAll('.who-link').forEach(el => addScramble(el));

    // Project cards (scramble the project name)
    document.querySelectorAll('.project-card').forEach(card => {
        const name = card.querySelector('.project-name');
        if (name) addScramble(card, name);
    });

    // Case back links
    document.querySelectorAll('.case-back').forEach(el => addScramble(el));

    document.querySelectorAll('.landing-link-card, .who-link-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const color = pastels[Math.floor(Math.random() * pastels.length)];
            card.style.backgroundColor = color;
        });
        card.addEventListener('mouseleave', () => {
            card.style.backgroundColor = '';
        });
    });

    // --- Page Navigation ---
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('a[data-page]');
    let currentPage = 'landing';
    let isTransitioning = false;

    function navigateTo(pageId) {
        if (pageId === currentPage || isTransitioning) return;
        isTransitioning = true;

        const current = document.querySelector('.page--active');
        const next = document.getElementById(pageId);
        if (!current || !next) { isTransitioning = false; return; }

        current.classList.add('page--exit');
        current.classList.remove('page--active');

        setTimeout(() => {
            current.classList.remove('page--exit');
            next.classList.add('page--active');
            next.scrollTop = 0;
            currentPage = pageId;
            updateNav();
            animatePageContent(next);
            setTimeout(() => { isTransitioning = false; }, 400);
        }, 300);
    }

    function updateNav() {
        // Toggle body class for landing-specific styles (cursor glow, etc.)
        document.body.classList.toggle('landing-active', currentPage === 'landing');

        // Highlight "Projects" nav link when on a project detail page
        const isProjectPage = currentPage.startsWith('project-');
        document.querySelectorAll('.nav-link').forEach(link => {
            if (isProjectPage && link.dataset.page === 'projects') {
                link.classList.add('active');
            } else {
                link.classList.toggle('active', link.dataset.page === currentPage);
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.dataset.page;
            if (!target) return; // Let external links work normally
            e.preventDefault();
            location.hash = target;
            navigateTo(target);
        });
    });

    window.addEventListener('hashchange', () => {
        const hash = location.hash.slice(1);
        if (hash && document.getElementById(hash)) {
            navigateTo(hash);
        }
    });

    if (location.hash) {
        const hash = location.hash.slice(1);
        if (document.getElementById(hash) && hash !== 'landing') {
            document.querySelector('.page--active')?.classList.remove('page--active');
            document.getElementById(hash)?.classList.add('page--active');
            currentPage = hash;
            updateNav();
            setTimeout(() => animatePageContent(document.getElementById(hash)), 100);
        }
    }

    // --- Staggered Content Animations ---
    function animatePageContent(page) {
        const whoBlocks = page.querySelectorAll('.who-block');
        whoBlocks.forEach((block, i) => {
            block.classList.remove('visible');
            setTimeout(() => block.classList.add('visible'), 200 + i * 120);
        });

        const projectCards = page.querySelectorAll('.project-card');
        projectCards.forEach((card, i) => {
            card.classList.remove('visible');
            setTimeout(() => card.classList.add('visible'), 200 + i * 80);
        });

        const caseSections = page.querySelectorAll('.case-section');
        caseSections.forEach((section, i) => {
            section.classList.remove('visible');
            setTimeout(() => section.classList.add('visible'), 300 + i * 150);
        });

        const caseMetrics = page.querySelectorAll('.case-metric');
        caseMetrics.forEach((metric, i) => {
            metric.classList.remove('visible');
            setTimeout(() => metric.classList.add('visible'), 500 + i * 100);
        });
    }

    // --- Cursor ASCII Trail ---
    const trail = document.getElementById('cursor-trail');
    const trailChars = '.:*+=#@%&$~^!?/\\|<>{}[]()';
    let lastTrailTime = 0;
    const trailInterval = 20;

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTrailTime < trailInterval) return;
        lastTrailTime = now;

        const span = document.createElement('span');
        span.textContent = trailChars[Math.floor(Math.random() * trailChars.length)];
        span.style.left = e.clientX + 'px';
        span.style.top = e.clientY + 'px';
        trail.appendChild(span);

        setTimeout(() => span.remove(), 1500);
    });

    // --- Keyboard Navigation ---
    document.addEventListener('keydown', (e) => {
        if (e.key === '1') navigateTo('landing');
        if (e.key === '2') navigateTo('who');
        if (e.key === '3') navigateTo('projects');
        if (e.key === 'Escape' && currentPage.startsWith('project-')) {
            navigateTo('projects');
        }
    });

    // --- External links handler (safety net) ---
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        const href = link.getAttribute('href');
        // Skip internal SPA navigation links
        if (link.hasAttribute('data-page')) return;
        if (href.startsWith('#')) return;
        // Handle external links
        if (href.startsWith('mailto:') || href.startsWith('tel:')) {
            window.location.href = href;
        } else if (href.startsWith('http') || href.startsWith('//')) {
            window.open(href, '_blank', 'noopener');
        }
    });

    // --- Collapsible Experience Entries ---
    document.querySelectorAll('.experience-header').forEach(header => {
        header.addEventListener('click', () => {
            const entry = header.parentElement;
            const desc = entry.querySelector('.experience-desc');
            if (!desc) return;

            if (entry.classList.contains('open')) {
                // Collapse: set current height first, then animate to 0
                desc.style.maxHeight = desc.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    desc.style.maxHeight = '0';
                });
                entry.classList.remove('open');
            } else {
                // Expand: animate to scrollHeight, then remove inline style
                entry.classList.add('open');
                desc.style.maxHeight = desc.scrollHeight + 'px';
                desc.addEventListener('transitionend', function handler() {
                    if (entry.classList.contains('open')) {
                        desc.style.maxHeight = 'none';
                    }
                    desc.removeEventListener('transitionend', handler);
                });
            }
        });
    });

    // --- Rotating ASCII Sphere Background ---
    const sphereEl = document.getElementById('ascii-sphere');
    if (sphereEl) {
        const sW = 60, sH = 30;
        const R = 12;
        let angle = 0;

        function renderSphere() {
            const output = [];
            for (let j = 0; j < sH; j++) {
                let row = '';
                for (let i = 0; i < sW; i++) {
                    const x = (i - sW / 2) * 0.5;
                    const y = (j - sH / 2);
                    const d = Math.sqrt(x * x + y * y);

                    if (d < R) {
                        const z = Math.sqrt(R * R - x * x - y * y);
                        const rx = x * Math.cos(angle) + z * Math.sin(angle);
                        const rz = -x * Math.sin(angle) + z * Math.cos(angle);

                        const lon = Math.atan2(rz, rx);
                        const lat = Math.asin(y / R);

                        const gridLon = Math.abs(lon % 0.6) < 0.08;
                        const gridLat = Math.abs(lat % 0.5) < 0.06;

                        if (gridLon || gridLat) {
                            const light = (rz / R + 1) * 0.5;
                            if (light > 0.5) {
                                row += '[ ]';
                            } else if (light > 0.2) {
                                row += ' . ';
                            } else {
                                row += ' · ';
                            }
                        } else {
                            row += '   ';
                        }
                    } else if (Math.abs(d - R) < 0.8) {
                        row += ' . ';
                    } else {
                        row += '   ';
                    }
                }
                output.push(row);
            }
            sphereEl.textContent = output.join('\n');
            angle += 0.008;
            requestAnimationFrame(renderSphere);
        }

        renderSphere();
    }

    // --- Initial state ---
    document.body.classList.toggle('landing-active', currentPage === 'landing');
    setTimeout(() => {
        animatePageContent(document.querySelector('.page--active'));
    }, 100);

})();
