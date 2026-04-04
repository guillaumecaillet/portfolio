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
                loader.classList.add('done');
                setTimeout(() => loader.remove(), 600);
            }, 300);
        }
    }, 65);

    // --- Pastel Hover on Landing Link Cards ---
    const pastels = [
        '#FFD1DC', '#FFDAC1', '#FFF1C1', '#D4F0C0',
        '#C1E1FF', '#E1C1FF', '#FFE1F0', '#C1FFE1',
        '#FFE8C1', '#D1C1FF', '#C1FFF4', '#FFC1C1',
    ];

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
    const navLinks = document.querySelectorAll('[data-page]');
    let currentPage = 'landing';
    let isTransitioning = false;

    function navigateTo(pageId) {
        if (pageId === currentPage || isTransitioning) return;
        isTransitioning = true;

        const current = document.querySelector(`.page--active`);
        const next = document.getElementById(pageId);
        if (!current || !next) { isTransitioning = false; return; }

        // Exit current page
        current.classList.add('page--exit');
        current.classList.remove('page--active');

        // Enter new page after brief delay
        setTimeout(() => {
            current.classList.remove('page--exit');
            next.classList.add('page--active');
            // Scroll to top for case study pages
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

    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.page;
            if (target) {
                location.hash = target;
                navigateTo(target);
            }
        });
    });

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
        const hash = location.hash.slice(1);
        if (hash && document.getElementById(hash)) {
            navigateTo(hash);
        }
    });

    // Initial hash navigation
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
        // Who am I blocks
        const whoBlocks = page.querySelectorAll('.who-block');
        whoBlocks.forEach((block, i) => {
            block.classList.remove('visible');
            setTimeout(() => block.classList.add('visible'), 200 + i * 120);
        });

        // Project cards
        const projectCards = page.querySelectorAll('.project-card');
        projectCards.forEach((card, i) => {
            card.classList.remove('visible');
            setTimeout(() => card.classList.add('visible'), 200 + i * 80);
        });

        // Case study sections
        const caseSections = page.querySelectorAll('.case-section');
        caseSections.forEach((section, i) => {
            section.classList.remove('visible');
            setTimeout(() => section.classList.add('visible'), 300 + i * 150);
        });

        // Case study metrics
        const caseMetrics = page.querySelectorAll('.case-metric');
        caseMetrics.forEach((metric, i) => {
            metric.classList.remove('visible');
            setTimeout(() => metric.classList.add('visible'), 500 + i * 100);
        });
    }

    // --- Cursor Glow ---
    const glow = document.querySelector('.cursor-glow');
    let glowX = 0, glowY = 0, currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        glowX = e.clientX;
        glowY = e.clientY;
    });

    function updateGlow() {
        currentX += (glowX - currentX) * 0.08;
        currentY += (glowY - currentY) * 0.08;
        glow.style.left = currentX + 'px';
        glow.style.top = currentY + 'px';
        requestAnimationFrame(updateGlow);
    }
    requestAnimationFrame(updateGlow);

    // --- Keyboard Navigation ---
    document.addEventListener('keydown', (e) => {
        if (e.key === '1') navigateTo('landing');
        if (e.key === '2') navigateTo('who');
        if (e.key === '3') navigateTo('projects');
        // Escape goes back to projects list from a case study
        if (e.key === 'Escape' && currentPage.startsWith('project-')) {
            navigateTo('projects');
        }
    });

    // --- Collapsible Experience Entries ---
    document.querySelectorAll('.experience-header').forEach(header => {
        header.addEventListener('click', () => {
            const entry = header.parentElement;
            entry.classList.toggle('open');
        });
    });

    // --- Initial state ---
    document.body.classList.toggle('landing-active', currentPage === 'landing');
    setTimeout(() => {
        animatePageContent(document.querySelector('.page--active'));
    }, 100);

})();
