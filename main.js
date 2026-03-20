(() => {
    'use strict';

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
            currentPage = pageId;
            updateNav();
            animatePageContent(next);

            setTimeout(() => { isTransitioning = false; }, 400);
        }, 300);
    }

    function updateNav() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === currentPage);
        });
    }

    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
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
            // Quick switch without animation on load
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
    });

    // --- Initial page content animation ---
    setTimeout(() => {
        animatePageContent(document.querySelector('.page--active'));
    }, 100);

})();
