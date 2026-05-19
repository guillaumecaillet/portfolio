(() => {
    'use strict';

    // --- Galaxy renderer ---
    let GAL_W = 120, GAL_H = 50; // recalculated on init
    const GAL_CHARS = ' ..,,,:::;;;===+++***###@@@';

    function calcGalDims() {
        // Measure actual char size from the pre element
        const span = document.createElement('span');
        span.textContent = '.'.repeat(20);
        span.style.cssText = 'position:absolute;top:0;left:0;visibility:hidden;pointer-events:none';
        sphereEl.appendChild(span);
        const charW = (span.offsetWidth / 20) || 5.3;
        const charH = span.offsetHeight || 9.6;
        sphereEl.removeChild(span);
        GAL_W = Math.ceil(sphereEl.offsetWidth  / charW) + 1;
        GAL_H = Math.ceil(sphereEl.offsetHeight / charH) + 1;
    }

    function renderGalaxy(t) {
        const cx = GAL_W / 2, cy = GAL_H / 2;
        const rows = new Array(GAL_H);
        for (let row = 0; row < GAL_H; row++) {
            let rowStr = '';
            for (let col = 0; col < GAL_W; col++) {
                const dx = (col - cx) / cx;
                const dy = (row - cy) / cy * 2.05;
                const r  = Math.sqrt(dx * dx + dy * dy);
                const theta = Math.atan2(dy, dx);
                const phase = 2 * (theta - t - Math.log(Math.max(r, 0.05)) * 2.8);
                const arm   = Math.pow(Math.max(0, Math.cos(phase)), 3);
                const core  = Math.exp(-r * r * 9);
                const disc  = Math.exp(-r * 1.7);
                const armB  = arm * disc * (r > 0.05 ? 1 : 0);
                const h     = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
                const star  = (h - Math.floor(h)) > 0.965 ? 0.1 : 0;
                const b     = Math.min(1, core * 4 + armB * 2 + star);
                rowStr += GAL_CHARS[Math.floor(b * (GAL_CHARS.length - 1))];
            }
            rows[row] = rowStr;
        }
        return rows.join('\n');
    }

    // --- ASCII Galaxy ---
    const sphereEl  = document.getElementById('ascii-sphere');
    const galaxyBgEl = document.getElementById('galaxy-bg');
    let sAngle = 0, sRunning = false, sTimer = null;

    function startSphere() {
        if (sRunning) return;
        calcGalDims();
        sRunning = true;
        (function tick() {
            if (!sRunning) return;
            const frame = renderGalaxy(sAngle);
            if (sphereEl)  sphereEl.textContent  = frame;
            if (galaxyBgEl) galaxyBgEl.textContent = frame;
            sAngle += 0.008;
            sTimer = setTimeout(tick, 80);
        })();
    }

    function stopSphere() {
        sRunning = false;
        clearTimeout(sTimer);
    }

    window.addEventListener('resize', () => { if (sRunning) calcGalDims(); });

    // Start immediately — full opacity acts as loader
    startSphere();

    // After 2.5s: recede to bg + reveal nav + text
    setTimeout(() => {
        sphereEl.classList.add('loaded');
        document.body.classList.remove('loading');
        revealTitle();
    }, 2500);

    // --- Blur reveal ---
    function revealTitle() {
        const lines = document.querySelectorAll('.landing-title .line');
        lines.forEach((line, i) => setTimeout(() => line.classList.add('revealed'), i * 180));
        const sub = document.querySelector('.landing-sub');
        const pitch = document.querySelector('.landing-pitch');
        const links = document.querySelector('.landing-links');
        if (sub)   setTimeout(() => sub.classList.add('visible'), 320);
        if (pitch) setTimeout(() => pitch.classList.add('visible'), 460);
        if (links) setTimeout(() => links.classList.add('visible'), 620);
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
        let scrambleInterval = null;
        let currentOriginal = '';

        el.addEventListener('mouseenter', () => {
            currentOriginal = target.textContent; // read live — respects current language
            let iteration = 0;
            clearInterval(scrambleInterval);
            scrambleInterval = setInterval(() => {
                target.textContent = currentOriginal
                    .split('')
                    .map((char, i) => {
                        if (char === ' ') return ' ';
                        if (i < iteration) return currentOriginal[i];
                        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    })
                    .join('');
                iteration += 1 / 2;
                if (iteration >= currentOriginal.length) {
                    clearInterval(scrambleInterval);
                    target.textContent = currentOriginal;
                }
            }, 30);
        });

        el.addEventListener('mouseleave', () => {
            clearInterval(scrambleInterval);
            target.textContent = currentOriginal || target.textContent;
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

    // ===================================
    // Projects minimap — thematic compass.
    // Hovering a project lights up its star, its theme wedge, and shows a
    // caption describing the theme.
    // ===================================
    (function setupMinimap() {
        const minimap = document.querySelector('.minimap');
        if (!minimap) return;
        const pointer   = minimap.querySelector('.minimap-pointer');
        const line      = minimap.querySelector('.minimap-line');
        const caption   = minimap.querySelector('.minimap-caption');
        const stars     = Array.from(minimap.querySelectorAll('.minimap-star'));
        const wedges    = Array.from(minimap.querySelectorAll('.minimap-wedge'));
        const cardinals = Array.from(minimap.querySelectorAll('.minimap-cardinal'));
        const starById  = new Map(stars.map(s => [s.dataset.project, s]));

        function themeLabel(theme) {
            const key = `projects.theme.label.${theme}`;
            const fallback = {
                ds: 'Design Systems',
                product: 'Product Design',
                research: 'User Research & Flows',
                tooling: 'Tooling & Design Ops'
            }[theme] || theme;
            try {
                if (typeof TRANSLATIONS !== 'undefined' && currentLang && TRANSLATIONS[currentLang]?.[key]) {
                    return TRANSLATIONS[currentLang][key];
                }
            } catch (e) { /* noop */ }
            return fallback;
        }

        function projectLabel(card) {
            const name = card.querySelector('.project-name')?.textContent?.trim() || '';
            return name;
        }

        function moveTo(projectId, label, theme) {
            const star = starById.get(projectId);
            if (!star) return;
            const cx = parseFloat(star.getAttribute('cx'));
            const cy = parseFloat(star.getAttribute('cy'));
            if (pointer) pointer.setAttribute('transform', `translate(${cx}, ${cy})`);
            if (line) { line.setAttribute('x2', cx); line.setAttribute('y2', cy); }

            stars.forEach(s => s.classList.toggle('is-active', s === star));
            wedges.forEach(w => w.classList.toggle('is-active', w.dataset.theme === theme));
            cardinals.forEach(c => c.classList.toggle('is-active', c.dataset.theme === theme));
            minimap.classList.add('is-pointing');

            if (caption && label) {
                const tLabel = themeLabel(theme);
                caption.innerHTML = `<span class="caption-theme">${tLabel}</span> ${label}`;
            }
        }

        function reset() {
            if (pointer) pointer.setAttribute('transform', 'translate(50, 50)');
            if (line) { line.setAttribute('x2', '50'); line.setAttribute('y2', '50'); }
            stars.forEach(s => s.classList.remove('is-active'));
            wedges.forEach(w => w.classList.remove('is-active'));
            cardinals.forEach(c => c.classList.remove('is-active'));
            minimap.classList.remove('is-pointing');
            if (caption) {
                const idle = caption.dataset.idle || caption.textContent;
                caption.dataset.idle = idle;
                caption.textContent = idle;
            }
        }

        document.querySelectorAll('#projects .project-card').forEach(card => {
            const pid = card.dataset.page;
            if (!pid) return;
            const star = starById.get(pid);
            const theme = star?.dataset.theme;
            const label = projectLabel(card);
            card.addEventListener('mouseenter', () => moveTo(pid, label, theme));
            card.addEventListener('focus',      () => moveTo(pid, label, theme));
            card.addEventListener('mouseleave', reset);
            card.addEventListener('blur',       reset);
        });

        reset();
    })();

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

    // Clone the footer template into each .page so it sits at the end of
    // the page's scroll area. The user has to scroll down to reveal it.
    (function injectFooters() {
        const template = document.querySelector('.site-footer.footer-template');
        if (!template) return;
        const clone = () => {
            const f = template.cloneNode(true);
            f.classList.remove('footer-template');
            f.removeAttribute('aria-hidden');
            return f;
        };
        pages.forEach(page => page.appendChild(clone()));
    })();

    // Per-page document titles (used for browser tab + SEO).
    const PAGE_TITLES = {
        'landing':                  'Guillaume Caillet — Sr. Product Designer',
        'who':                      'About — Guillaume Caillet',
        'projects':                 'Projects — Guillaume Caillet',
        'project-ds-execution':     'Opal DS · Corrective Actions — Case Study',
        'project-multiselect':      'Multi-select & Sticky Action Bar — Case Study',
        'project-figma-plugin':     'Figma Plugin — Local Components Collector — Case Study',
        'project-ds-audit':         'Opal DS · Audit — Case Study',
        'project-transfer':         'Capacity Transfer Between Sectors — Case Study',
        'project-design-system':    'PrestaShop Design System — Case Study',
        'project-customer-account': 'PrestaShop Customer Account — Case Study',
        'project-signin':           'PrestaShop Sign-in / Sign-up — Case Study',
        'project-store-association':'PrestaShop Store Association — Case Study'
    };

    // Per-page meta description (used for SEO + social previews).
    const PAGE_META = {
        'landing':                  'Senior Product Designer · 7+ years building B2B SaaS products and design systems · Industry 4.0 · France.',
        'who':                      'Guillaume Caillet — Senior Product Designer. 7+ years across Oplit, PrestaShop, Airbus and SNCF.',
        'projects':                 'Selected case studies — design systems, B2B SaaS, industrial scheduling, and design-ops tooling.',
        'project-ds-execution':     'Opal DS Corrective Actions — 44 components rebuilt, 2,634 token bindings applied, +20–30% gain per feature cycle.',
        'project-multiselect':      'Multi-select + Sticky Action Bar — one coupled pattern letting schedulers update 50 work orders in one click.',
        'project-figma-plugin':     'Local Components Collector — a Figma plugin that cuts DS audit time from days to hours.',
        'project-ds-audit':         'Opal DS Audit — graded findings against Atomic Design, BEM, DTCG and WCAG, with a 3-horizon remediation plan.',
        'project-transfer':         'Capacity Transfer Between Sectors — letting industrial schedulers reallocate production across workshops in seconds.',
        'project-design-system':    'PrestaShop Design System — 100% squad adoption, 80% in tech, –50% development time.',
        'project-customer-account': 'PrestaShop Customer Account — three accounts unified into one, eliminating support requests for basic updates.',
        'project-signin':           'PrestaShop Sign-in / Sign-up — authentication errors cut in half across the entire ecosystem.',
        'project-store-association':'PrestaShop Store Association — 600+ successful associations per day, –40% error-driven abandonment.'
    };

    function updatePageTitle(pageId) {
        const t = PAGE_TITLES[pageId] || PAGE_TITLES.landing;
        document.title = t;
        // Sync meta description + open graph
        const desc = PAGE_META[pageId] || PAGE_META.landing;
        const setMeta = (sel, val) => {
            const el = document.querySelector(sel);
            if (el) el.setAttribute('content', val);
        };
        setMeta('meta[name="description"]', desc);
        setMeta('meta[property="og:title"]', t);
        setMeta('meta[property="og:description"]', desc);
        setMeta('meta[name="twitter:title"]', t);
        setMeta('meta[name="twitter:description"]', desc);
    }

    function navigateTo(pageId) {
        if (pageId === currentPage || isTransitioning) return;
        isTransitioning = true;

        const current = document.querySelector('.page--active');
        const next = document.getElementById(pageId);
        if (!current || !next) { isTransitioning = false; return; }

        // Crossfade: both pages transition simultaneously
        current.classList.add('page--exit');
        current.classList.remove('page--active');
        next.classList.add('page--active');
        next.scrollTop = 0;
        currentPage = pageId;
        updateNav();           // landing-active toggled immediately → galaxy-bg in sync
        updatePageTitle(pageId);
        animatePageContent(next);

        // Cleanup after transition completes
        setTimeout(() => {
            current.classList.remove('page--exit');
            isTransitioning = false;
        }, 700);
    }

    function updateNav() {
        // Toggle body class for landing-specific styles (cursor glow, etc.)
        document.body.classList.toggle('landing-active', currentPage === 'landing');
        // data-page is read by CSS to show page-scoped elements (e.g. the minimap)
        document.body.dataset.page = currentPage;

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
            const target = link.dataset.page;
            if (!target) return; // Let external links work normally
            e.preventDefault();
            location.hash = target;
            navigateTo(target);
        });
    });

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
        const hash = location.hash.slice(1);
        if (hash && document.getElementById(hash)) {
            navigateTo(hash);
        } else if (hash) {
            // Unknown hash — fall back to projects with a one-time toast.
            showFallbackToast(hash);
            location.hash = 'projects';
        }
    });

    // Soft 404 toast — shown when the user lands on or navigates to an unknown hash.
    function showFallbackToast(missingHash) {
        const fr = (typeof currentLang !== 'undefined' && currentLang === 'fr');
        const msg = fr
            ? `Cette page n'existe plus — voici la liste des projets.`
            : `That page doesn't exist anymore — here's the project list.`;
        let toast = document.getElementById('fallback-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'fallback-toast';
            toast.className = 'fallback-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 4000);
    }

    // Initial hash navigation
    if (location.hash) {
        const hash = location.hash.slice(1);
        if (document.getElementById(hash) && hash !== 'landing') {
            document.querySelector('.page--active')?.classList.remove('page--active');
            document.getElementById(hash)?.classList.add('page--active');
            currentPage = hash;
            updateNav();
            updatePageTitle(hash);
            setTimeout(() => animatePageContent(document.getElementById(hash)), 100);
        } else if (hash && hash !== 'landing') {
            // Hash present but not a real page — soft 404.
            showFallbackToast(hash);
            location.hash = 'projects';
        }
    }
    updatePageTitle(currentPage);

    // --- Staggered Content Animations ---
    function animatePageContent(page) {
        // Who am I blocks
        const whoBlocks = page.querySelectorAll('.who-block');
        whoBlocks.forEach((block, i) => {
            block.classList.remove('visible');
            setTimeout(() => block.classList.add('visible'), 200 + i * 120);
        });

        // Year labels & project cards (animate together in DOM order)
        const projectItems = page.querySelectorAll('.project-year-label, .project-card');
        projectItems.forEach((item, i) => {
            if (item.classList.contains('project-year-label')) {
                item.style.opacity = '0';
                item.style.transform = 'translateY(8px)';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 180 + i * 60);
            } else {
                item.classList.remove('visible');
                setTimeout(() => item.classList.add('visible'), 200 + i * 60);
            }
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

    // --- Cursor: spring follower + ASCII trail ---
    const trail = document.getElementById('cursor-trail');
    const trailChars = '|:-+.';

    // Spring follower element
    const follower = document.createElement('div');
    follower.className = 'cursor-follower';
    follower.textContent = '+';
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    (function animFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        follower.style.transform = `translate(${followerX - 5}px, ${followerY - 7}px)`;
        requestAnimationFrame(animFollower);
    })();

    // Trail chars (throttled)
    let lastTrailTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTrailTime < 35) return;
        lastTrailTime = now;
        const span = document.createElement('span');
        span.textContent = trailChars[Math.floor(Math.random() * trailChars.length)];
        span.style.left = e.clientX + 'px';
        span.style.top = e.clientY + 'px';
        trail.appendChild(span);
        setTimeout(() => span.remove(), 1200);
    });

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

    // --- Case study image fallback (graceful placeholder if PNG missing) ---
    document.querySelectorAll('.case-image img').forEach(img => {
        img.addEventListener('error', () => {
            const figure = img.closest('figure, .case-image');
            if (figure) figure.classList.add('case-image--missing');
        }, { once: true });
    });

    // --- Collapsible Experience Entries ---
    document.querySelectorAll('.experience-header').forEach((header, index) => {
        // A11y: make the header keyboard-accessible and announce its state.
        const entry = header.parentElement;
        const desc  = entry?.querySelector('.experience-desc');
        const toggle = header.querySelector('.experience-toggle');
        const role  = header.querySelector('.experience-role')?.textContent?.trim() || '';
        const company = header.querySelector('.experience-company')?.textContent?.trim() || '';
        const labelBase = [role, company].filter(Boolean).join(' at ') || 'experience entry';

        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-label', `Show details for ${labelBase}`);
        if (toggle) toggle.setAttribute('aria-hidden', 'true');
        if (desc) {
            const descId = desc.id || `exp-desc-${index}`;
            desc.id = descId;
            header.setAttribute('aria-controls', descId);
        }

        function toggleEntry() {
            if (!desc || !entry) return;
            const isOpen = entry.classList.contains('open');

            if (isOpen) {
                desc.style.maxHeight = desc.scrollHeight + 'px';
                requestAnimationFrame(() => { desc.style.maxHeight = '0'; });
                entry.classList.remove('open');
                header.setAttribute('aria-expanded', 'false');
                header.setAttribute('aria-label', `Show details for ${labelBase}`);
            } else {
                entry.classList.add('open');
                desc.style.maxHeight = desc.scrollHeight + 'px';
                header.setAttribute('aria-expanded', 'true');
                header.setAttribute('aria-label', `Hide details for ${labelBase}`);
                desc.addEventListener('transitionend', function handler() {
                    if (entry.classList.contains('open')) {
                        desc.style.maxHeight = 'none';
                    }
                    desc.removeEventListener('transitionend', handler);
                });
            }
        }

        header.addEventListener('click', toggleEntry);
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleEntry();
            }
        });
    });

    // --- Initial state ---
    document.body.classList.toggle('landing-active', currentPage === 'landing');
    setTimeout(() => {
        animatePageContent(document.querySelector('.page--active'));
    }, 100);

    // ===================================
    // Star Button
    // ===================================
    const starBtn      = document.getElementById('star-btn');
    const starCountEl  = document.getElementById('star-count');
    const starTooltipEl = document.getElementById('star-tooltip');
    // Base score so the counter never reads as "0 social proof".
    // The user's own star is added on top of this base.
    const BASE_STARS = 10;
    let isStarred  = localStorage.getItem('folio-starred') === 'true';
    let starCount  = BASE_STARS + (isStarred ? 1 : 0);

    function updateStarUI() {
        if (starCountEl) {
            starCountEl.textContent = starCount;
            starCountEl.removeAttribute('hidden');
        }
        starBtn?.classList.toggle('starred', isStarred);
        if (starBtn) {
            starBtn.setAttribute('aria-pressed', isStarred ? 'true' : 'false');
        }
    }
    updateStarUI();

    let tooltipTimer = null;
    function showStarTooltip(msg) {
        if (!starTooltipEl) return;
        starTooltipEl.textContent = msg;
        starTooltipEl.classList.add('visible');
        clearTimeout(tooltipTimer);
        tooltipTimer = setTimeout(() => starTooltipEl.classList.remove('visible'), 3000);
    }

    starBtn?.addEventListener('click', () => {
        isStarred = !isStarred;
        starCount = BASE_STARS + (isStarred ? 1 : 0);
        localStorage.setItem('folio-starred', isStarred ? 'true' : 'false');
        updateStarUI();

        const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
        const shortcut = isMac ? '⌘D' : 'Ctrl+D';
        const fr = currentLang === 'fr';
        const msg = isStarred
            ? (fr ? `Ajoutez aux favoris avec ${shortcut} !` : `Bookmark with ${shortcut} to keep it!`)
            : (fr ? 'Retiré des étoiles' : 'Unstarred');
        showStarTooltip(msg);
    });

    // ===================================
    // i18n — FR / EN
    // ===================================
    const TRANSLATIONS = {
        en: {
            // Nav
            'nav.who':      'About',
            'nav.projects': 'Projects',
            'nav.star':     'Save',

            // Landing
            'landing.line1':    'I design complex products with high standards.',
            'landing.line2_pre':'Currently at ',
            'landing.sub':      'Guillaume Caillet · Senior Product Designer · France',
            'landing.sub_name': 'Guillaume Caillet',
            'landing.sub_role': 'Senior Product Designer',
            'landing.sub_loc':  'France',
            'landing.pitch':    'Over the last 7 years, I\'ve contributed to the design and improvement of B2B SaaS products — alongside teams at <strong>Oplit</strong> (industrial schedulers), <strong>PrestaShop</strong> (300k+ merchants), <strong>Airbus</strong> and <strong>SNCF</strong>. I\'ve led design systems, run audits, and shipped infrastructure that compounds across teams.<br><br>What I\'m looking for: high-stakes products where design co-pilots strategy — not a service function.',
            'landing.discover': 'Discover my work →',
            'landing.email':    'Email me',
            'landing.linkedin': 'Connect on LinkedIn',

            // Who page
            'who.title': 'Who am I?',
            'who.intro.p1': 'I came to design through visual systems before any formal training — building logos and branding kits as a kid for fun. What took root then never left: a curiosity for systems, and the drive to build tools as much as to use them.',
            'who.intro.p2': 'Today I\'m a <strong>Senior Product Designer</strong> at <strong>Oplit</strong>, a B2B SaaS platform for industrial scheduling. I design for planners and shop-floor operators in luxury watchmaking, aerospace, and precision engineering — expert users, in contexts where every design decision has real operational impact. My role goes beyond interface design: I took over and deployed Oplit\'s design system as a structural element of the organization, aligning design, engineering, and product around a shared language. Turning a design tool into shared decision-making infrastructure — that\'s the kind of leverage I look for in my work.',
            'who.intro.p3': 'What draws me are SaaS environments where design shapes how organizations actually operate — not just how products look. The work that matters isn\'t screens: it\'s a decision framework that held, a component system that accelerated the entire team, user research that redirected a roadmap. I\'m moving toward roles where design owns part of the product strategy — not as a service function, but as a co-author of where the product goes next.',

            'who.section.professional': 'Professional Experiences',
            'who.section.other':        'Other experiences',
            'who.section.studies':      'Studies',
            'who.section.mentoring':    'Mentoring',
            'who.section.articles':     'Articles',
            'who.section.podcasts':     'Podcasts',
            'who.section.templates':    'Templates for Notion',
            'who.section.cv':           'Curriculum Vitae',
            'who.section.links':        'Useful links',

            'who.date.oplit':       'Sept. 2025 — Present',
            'who.date.prestashop':  'June 2022 — Aug. 2025',
            'who.date.beapp':       'June 2021 — June 2022',
            'who.date.lacapsule':   'Oct. 2020 — June 2021',
            'who.date.airbus':      'Sept. 2018 — June 2020',
            'who.date.sncf':        'March 2018 — Aug. 2018',
            'who.date.stereosuper': 'Aug. 2015 — Sept. 2017',
            'who.date.teacher':     '2025 — Present',
            'who.date.mentor':      '2024 — Present',
            'who.date.ecv':         '2021 — Present',
            'who.date.designschool': '2025',
            'who.date.freelance':   '2020 — Present',

            'who.role.oplit':       'Senior Product Designer',
            'who.role.prestashop':  'Product Designer',
            'who.role.beapp':       'UX/UI Designer',
            'who.role.lacapsule':   'UX Designer Consultant',
            'who.role.airbus':      'UX Designer',
            'who.role.sncf':        'UX Designer — Internship',
            'who.role.stereosuper': 'UX Designer — Work-study',
            'who.role.teacher':     'Teacher',
            'who.role.ecv':         'Speaker & Jury',
            'who.role.designschool': 'Lecturer',
            'who.company.designschool': 'École de Design Nantes',
            'who.role.freelance':   'Freelancing',

            'who.desc.oplit':       '<p><strong>Industrial scheduling &amp; capacity planning SaaS.</strong> My users — schedulers, planners, shop-floor operators — work in luxury watchmaking, automotive, aerospace, and precision engineering. 3 years of accumulated research, 9+ clients interviewed.</p><p><strong>Opal Design System ownership:</strong> full audit (CRITICAL / WARNING / INFO grading), 44 components rebuilt, 2,634 token bindings applied (from 92), 3 icon libraries → 1, 100% component compliance (from 9%). Dev-alignment workflow: Figma → Notion doc → Storybook/Chromatic → Linear closed. 11 components in dev review. Estimated gain: +20–30% per feature.</p><p><strong>Automation:</strong> 1,755 token bindings applied in a single session using Claude Code with the Figma MCP (Model Context Protocol) — 45k nodes analysed, 879 auto-corrections.</p><p><strong>Frameworks:</strong> FOCUSED spec template (a 7-step structure for product specs in Notion), FUC (Functional Use Cases), Discovery Client, Internal Audit. Specs written as "when X → then Y" in Linear.</p><p><strong>Figma plugin:</strong> built <em>Local Components Collector</em> in JavaScript (Figma Plugin API) — reduces DS audit from days to hours.</p>',
            'who.desc.prestashop':  '<p><strong>Sr Product Designer &amp; Design System Lead (2024)</strong></p><p>Progressively structures and deploys the research system across PrestaShop. Responsible for structuring and making the tools, templates, and user data operationally available so product teams can access them quickly and efficiently. The aim is to provide efficient access to user search when designing PrestaShop products for our 300k+ merchants.</p><p>Also working on structuring the Design System to make it robust, flexible and scalable. Proposing areas for development, structuring the team around the project and giving visibility to what we\'re doing.</p><p><strong>Design System contributor (2023)</strong></p><p>Involved in structuring and implementing the PrestaShop Design System. Working on the monitoring, implementation, and use of components and design tokens by everyone who uses the design system, as well as the components designed by the Product Designers.</p><p><strong>Product Designer (2022)</strong></p><p>Within the Customer Platform team, working on the design and improvement of the user experience through the user account and, more generally, the login experience.</p>',
            'who.desc.beapp':       '<p>In charge of UX at Beapp, working mainly with the UI designer and in contact with all the people involved in the various customer projects (PO, Business, Tech).</p><p>Designing experiences for different types of clients in the healthcare, automotive, food, institutional, and other sectors. Running creativity, immersion, and co-creation workshops. In charge of user research and testing.</p>',
            'who.desc.lacapsule':   '<p>Work as a UX consultant for companies looking to improve their user experience.</p>',
            'who.desc.airbus':      '<p>Joined the team of UX/UI designers (UXiD) as part of a process to digitalize the Airbus Group. The team designs and redesigns processes as well as business applications and HMIs, putting people back at the heart of their design.</p><p>Responsible for disseminating UX guidelines and best practices throughout the group. Collecting user requirements, participating in the design of business applications, organising information architecture, and working in collaboration with IT and other departments.</p>',
            'who.desc.sncf':        '<p>Working as a UX designer in section 574 (innovation) at the SNCF in Nantes. In charge of designing personas, user paths, and screen ergonomics for different applications.</p>',
            'who.desc.stereosuper': '<p>An apprentice for 2 years and trained as a web designer with a specialization in UX design, working on several projects and building up solid experience in a field I\'m passionate about.</p>',
            'who.desc.teacher':     '<p>Teaching the basics of UI Design to young designers.</p>',
            'who.desc.mentor':      '<p>Helping designers, no matter their seniority, to grow and giving them feedbacks about their projects or career perspectives.</p>',
            'who.desc.ecv':         '<ul><li>Design System workshop with M1 UX — building a foundation &amp; understanding the need for a design system (2026)</li><li>Jury M2 UX — end-of-study projects (2026)</li><li>Eco-design &amp; Design System 2023, 2024, 2025 (Speaker)</li><li>Design System \'22-\'23 (Annual project) — 100% students graduated</li><li>User Research Methods \'21-\'22 (Lecturer)</li></ul>',
            'who.desc.designschool': '<ul><li>1st year — Design &amp; UX/UI fundamentals</li><li>2nd year — Figma training</li></ul>',

            'who.mentoring.link':  'Book a mentoring session with Guillaume Caillet on ADPList →',
            'who.articles.text':   'I write about <strong>design</strong>, <strong>design systems</strong>, and <strong>user research</strong> — pragmatic notes from the field.',
            'who.articles.link':   'Guillaume CAILLET on Medium →',
            'who.podcast.simon':   'Interview with Simon Robic on mobile-first design →',
            'who.templates.link':  'Guillaume Caillet | Notion Template Creator →',
            'who.cv.link':         'Download CV (PDF) →',
            'who.email':           'Email me',
            'who.linkedin':        'Connect on LinkedIn',

            // Projects
            'projects.title': 'Projects',
            'projects.other.intro': 'Earlier projects — concept work, prototypes and student projects I still find relevant.',
            'projects.minimap.label': 'Thematic compass',
            'projects.minimap.idle':  'Hover a project to see its theme.',
            'projects.theme.ds':       'DESIGN SYSTEMS',
            'projects.theme.product':  'PRODUCT',
            'projects.theme.research': 'RESEARCH',
            'projects.theme.tooling':  'TOOLING',
            'projects.theme.label.ds':       'Design Systems',
            'projects.theme.label.product':  'Product Design',
            'projects.theme.label.research': 'User Research & Flows',
            'projects.theme.label.tooling':  'Tooling & Design Ops',

            // Footer
            'footer.role':    'Senior Product Designer',
            'footer.email':   'contact@guillaumecaillet.fr',

            // Case studies — shared
            'case.back':             '← Back to projects',
            'case.label':            'Case Study',
            'case.section.situation':'Context',
            'case.section.tasks':    'Approach',
            'case.section.results':  'Outcome',
            'case.section.next':     'What\'s next',
            'case.section.research':  'Research & Synthesis',
            'case.section.decision':  'Strategic Decision',
            'case.section.output':    'Design Output',
            'case.section.problem':   'Problem',
            'case.section.approach':  'Approach',
            'case.section.solution':  'Solution',
            'case.section.howworks':  'How it works',
            'case.section.impact':    'Impact',
            'case.section.methodology': 'Methodology',
            'case.section.findings':  'Findings',
            'case.section.execution': 'Execution',
            'case.section.alignment': 'Dev Alignment',
            'case.section.automation':'Automation',
            'case.section.conception':'Design & Specification',
            'case.section.matrix':    'State Matrix',
            'case.section.details':   'Implementation Details',
            'case.section.plan':      'Remediation Plan',
            'case.section.trigger':   'Multi-select pattern',
            'case.section.surface':   'Sticky action bar',
            'case.section.context':   'Context',
            'case.section.learning':  'Learnings',
            'case.section.reflection':'Reflection',
            'case.section.research_discovery': 'Research & Discovery',
            'case.section.decisions': 'Decisions & Trade-offs',
            'case.section.collaboration': 'Collaboration',
            'case.section.design_solution': 'Design Solution',
            'case.section.outcome': 'Outcome & Measurement',

            // Year labels
            'year.2026': '2026',
            'year.2025': '2025',
            'year.2024': '2024',

            // Project company tags
            'project.tag.oplit':      'Oplit',
            'project.tag.prestashop': 'PrestaShop',
            'project.tag.perso':      'Personal',

            // Design System
            'case.ds.title':    'Design System',
            'case.ds.subtitle': 'Structuring and development of the PrestaShop Design System. Provide product and core teams with access to a system that enables them to design coherent, fluid and easily structured experiences.',
            'case.ds.metric1.value': '100%',
            'case.ds.metric1.label': 'of product squads use the DS in design',
            'case.ds.metric2.value': '80%',
            'case.ds.metric2.label': 'adoption in tech teams',
            'case.ds.metric3.value': '-50%',
            'case.ds.metric3.label': 'reduction in development time',
            'case.ds.situation': '<p>When I joined in June 2022, the PrestaShop "design system" was a set of advanced UI kits in Figma, not shared as a true library. Product designers worked with their own components, tech teams used a separate framework, and interface consistency was weak.</p><p>With multiple touchpoints (main product, help center, marketplace, academy), alignment was critical to scaling both product and brand.</p>',
            'case.ds.tasks':     '<ul class="case-list"><li>Structured the design system team and implemented shared ownership around a unified workflow.</li><li>Set up contribution processes, component review cycles, and regular design-tech alignment meetings.</li><li>Built a transparent Kanban in Notion, accessible to both design and tech, to track every component request and status.</li><li>Audited the existing system and produced actionable recommendations to realign the system for future growth.</li><li>Pushed adoption of documentation standards, making documentation a Go/No-Go criterion for any new component.</li><li>Introduced and started implementing design tokens, following best practices for primitive and semantic layers.</li></ul>',
            'case.ds.results':   '<ul class="case-list"><li>Implementation of design/tech contribution processes, documentation, comprehensive auditing, governance, and shared Kanban.</li><li>Initial implementation of design tokens on test projects (inspired by Nathan Curtis).</li><li>Reduction in design/documentation debt, alignment with tech on nomenclature.</li></ul>',
            'case.ds.next':      '<ul class="case-list"><li>Ongoing documentation standardization across all components.</li><li>Rollout of experience libraries for specialized squads, maintaining brand and UX alignment.</li><li>Continued monitoring of DS adoption and iteration of governance processes.</li></ul>',

            // Customer Account
            'case.ca.title':    'Customer Account',
            'case.ca.subtitle': 'Unifying three fragmented PrestaShop accounts (Back Office, Marketplace, Business Care) into one — so users finally stop calling support to update an email.',
            'case.ca.metric1.value': '3 → 1',
            'case.ca.metric1.label': 'unified customer account',
            'case.ca.metric2.value': '0',
            'case.ca.metric2.label': 'support dependency for basic account updates',
            'case.ca.metric3.value': 'Kano basic',
            'case.ca.metric3.label': 'need — structured as infrastructure, not feature',
            'case.ca.situation': '<p>Third phase of the user identity unification project (after Sign in/Sign up and Store Association). PrestaShop had no "customer account" per se. User data was scattered: some in the back-office, some on the marketplace, no centralized space.</p><p>Users couldn\'t modify their own basic information (email, password): they had to contact support. The volume of support tickets related to these requests consumed a significant share of team bandwidth.</p><p><strong>Framed by the Kano model:</strong> this is not a "wow" feature but a basic need. Its absence generates frustration, its presence is considered obvious. The challenge was convincing stakeholders to invest in an "invisible" but structuring project.</p>',
            'case.ca.research_discovery': '<p><strong>No specific research</strong> for this ticket: insights came directly from the Sign in/Sign up research (5 merchant interviews + Mixpanel data + support feedback).</p><p>The need was self-evident: all competitors (Shopify, WooCommerce, Wix) had a centralized account space. The benchmark confirmed this was a market standard, not an innovation.</p><p>The challenge wasn\'t validating the need but defining the V1 scope: which information to centralize first, in what order.</p>',
            'case.ca.decisions': '<p><strong>Scope V1 vs V2:</strong></p><ul class="case-list"><li><strong>V1 (shipped):</strong> personal data (name, email, phone, country, password) + generic shop identification data + links to PrestaShop services (Marketplace, Academy, Help Center).</li><li><strong>Cut from V1 (backlog):</strong> multi-shop functionality, billing management directly in the account. Added through successive iterations.</li></ul><p><strong>Database consolidation:</strong> major technical effort. The approach was to define UX requirements (which data, what structure, what rights) then let tech design the solution by recovering existing databases from the marketplace, help center, and back-office (core).</p><p><strong>Account deletion (GDPR):</strong></p><ul class="case-list"><li>Identified issue: users had created duplicate accounts to manage their shop.</li><li>Discussion with legal on data to retain vs delete entirely.</li><li>Dual argument: GDPR compliance + cost reduction (stored data = server costs).</li></ul><p><strong>Personal info / Business info distinction:</strong> structural decision to clarify reading. The separation already existed but was poorly organized. The redesign made it explicit and easily accessible.</p>',
            'case.ca.collaboration': '<p><strong>Cross-squad scope transfer:</strong> the Marketplace team was managing "customer user" data when it legitimately fell under the Account team. The scope transfer happened naturally as it freed bandwidth for the Marketplace team.</p><p><strong>Friction with the Payment team:</strong> payment data lived in a separate technical environment. Recovering this component was technically complex and required close collaboration.</p><p><strong>Workshops:</strong> 1h to 1h30 brainstorms with PM, Designer, and Tech Leads. Format: proposals and decision-making on how to centralize information.</p>',
            'case.ca.design_solution': '<p>A single centralized space where users see their personal data, business data, and links to all PrestaShop services. Clear distinction between Personal info and Business info sections, self-service for all basic updates, and account deletion capability (GDPR compliance).</p>',
            'case.ca.outcome': '<p><strong>Significant reduction in support tickets</strong> related to personal data modifications (goal was to halve them minimum). No exact figure available, but the primary indicator is the near-total absence of complaints post-launch on this topic.</p><ul class="case-list"><li><strong>Full user autonomy:</strong> merchants can now modify their personal and business data without contacting support.</li><li><strong>Synchronized data</strong> across all PrestaShop services (marketplace, help center, back-office).</li><li><strong>Absence of negative feedback as a success indicator:</strong> consistent with the Kano model — a well-executed basic need doesn\'t generate enthusiasm but eliminates frustration. Success is measured by the disappearance of the problem, not by applause.</li></ul>',

            // Sign in/up
            'case.si.title':    'Sign in / Sign up Flow',
            'case.si.subtitle': 'Cutting authentication errors in half by redesigning sign-in across the entire PrestaShop ecosystem (back office, marketplace, help center).',
            'case.si.metric1.value': '-50%',
            'case.si.metric1.label': 'authentication errors (7k avg vs 15k before)',
            'case.si.metric2.value': '-50%',
            'case.si.metric2.label': 'flow length (5 steps → 3 steps)',
            'case.si.metric3.value': '50%',
            'case.si.metric3.label': 'of logins via Google SSO within 6 months',
            'case.si.situation': '<p>PrestaShop is an open-source e-commerce ecosystem used by 300k+ merchants, with multiple entry points: a back-office (shop management), a marketplace (modules/add-ons), a help center (support), and a business care (subscription).</p><p>Each service had its own authentication system with separate, unsynchronized databases. Users had up to 3 sets of credentials: one for the back-office (local credentials on their hosting), one for the marketplace (email+password and/or Google), and one for the help center.</p><p>The trigger: a spike in support tickets related to authentication errors was consuming most of the Account team\'s bandwidth, blocking new feature development. Key data point: ~15,000 authentication errors per month on average (2023-2024), tracked via Mixpanel.</p>',
            'case.si.research_discovery': '<p><strong>Mixed approach — quantitative + qualitative:</strong> The problem was already well-dimensioned by quantitative data (Mixpanel) and support feedback. Qualitative research served to understand behaviors and confirm/nuance hypotheses.</p><p><strong>5 merchant interviews</strong> in semi-structured format, recruited through direct contact. Goal: understand how they connected and what generated friction.</p><p><strong>Hypotheses tested:</strong></p><ul class="case-list"><li><strong>"Too many different login methods"</strong> → Confirmed: users didn\'t know which credentials to use for which service.</li><li><strong>"An unintuitive flow"</strong> → Confirmed: account creation had 5 steps (personal data, user typology, shop data like size/employees/revenue/physical store, validation, then email confirmation with validation link).</li><li><strong>"Accepted credentials aren\'t explicit"</strong> → Confirmed: no clear feedback on which type of credentials worked on which service.</li><li><strong>"Users try to log in with their local (back-office) credentials on the marketplace"</strong> → Confirmed: this was a major source of errors.</li><li><strong>"Users have different email addresses for each service"</strong> → Disproven: the problem wasn\'t different emails but the technical impossibility of using the same credentials across services, even with the same email address.</li><li><strong>"Merchants manage their shop alone"</strong> → Disproven: some shops are managed by agencies or teams, opening up the topic of roles and permissions (addressed in the Store Association / Customer Account project).</li></ul>',
            'case.si.decisions': '<p><strong>Strategic scope breakdown:</strong> The overall project was split — by mutual agreement (PM + Designer + Lead Dev) — into 3 distinct tickets to keep a manageable size and allow the roadmap to absorb the project:</p><ol class="case-list"><li><strong>Sign in / Sign up</strong> — authentication and account creation flow redesign</li><li><strong>Store Association</strong> — enabling merchants to associate their shops (installed on their hosting) with their PrestaShop account</li><li><strong>Customer Account</strong> — creating a centralized space for personal and business data</li></ol><p><strong>Alternatives explored and discarded:</strong></p><ul class="case-list"><li><strong>Magic link / Google SSO:</strong> explored but the technical complexity on the existing stack was too high. Classic Google SSO ("Continue with Google") was retained — more standard and technically manageable.</li><li><strong>Two-factor authentication code:</strong> considered for security but discarded as it added friction to a flow we were trying to simplify. Not a V1 priority.</li><li><strong>Shop claim by URL:</strong> the idea that a merchant could claim a shop via its URL. Discarded for technical reasons — impossible to prove ownership without a structured association process. Redirected to the "Store Association" ticket with UUID creation.</li><li><strong>Automatic account merge:</strong> explored but ownership identification issues made automatic merging too risky. Consolidation happened progressively through the new unified account system.</li></ul><p><strong>Core trade-off — user simplicity vs technical complexity:</strong> The team\'s tendency was to push technical complexity onto the user (displaying technical requirements, error messages with technical codes, manual configuration). The design stance: handle complexity "behind the curtain" — the user only needs to enter their email to identify and connect, the system handles the rest.</p><p>Concrete example: in an early version, error messages contained a technical code for users to include in support tickets. It meant nothing to them. The chosen solution: generic but understandable error messages, without giving too much information (security risk for malicious actors).</p>',
            'case.si.collaboration': '<p><strong>Squad of 7:</strong> a product trio (PM + Lead Dev + Product Designer) + back-end devs + Scrum Master + QA.</p><p><strong>Designer\'s role in the squad:</strong> facilitating brainstorm workshops, design focus sessions, discovery workshops, and design challenges.</p><p><strong>Cross-squad alignment:</strong> Sign-in touched multiple services (back-office, marketplace, help center) and therefore multiple teams. Alignment was achieved through sync meetings between squads. The topic was recognized as critical (entry point for users to all PrestaShop services), which facilitated collective prioritization.</p><p><strong>Managing technical dependencies:</strong> Required juggling development priorities across each squad to align efforts on a cross-cutting initiative.</p>',
            'case.si.design_solution': '<p>The flow went from <strong>5 steps to 3 steps</strong>:</p><ol class="case-list"><li>Account creation (essential data only + "Sign up with Google" option first)</li><li>User profile (typology: merchant, agency, freelance)</li><li>Arrival on the unified account</li></ol><p>Google SSO was prioritized in dominant position in the interface (button on top, before the classic form). User education was integrated into the flow: making users understand that a single PrestaShop account is enough for all services.</p>',
            'case.si.outcome': '<p><strong>Dedicated tracking plan</strong> set up to measure connection mode (credentials vs Google SSO).</p><ul class="case-list"><li><strong>50% reduction in authentication errors:</strong> 167k users connected with only ~7k errors on average (2024-2025) vs ~15k errors on average (2023-2024). Source: Mixpanel.</li><li><strong>50% reduction in flow length:</strong> from 5 steps to 3 steps for account creation.</li><li><strong>Growing Google SSO adoption:</strong> visible on the Mixpanel graph with a crossover of credentials/Google curves over the post-launch period, showing a progressive migration toward SSO.</li><li><strong>Indirect benefits:</strong> the reduction in auth errors freed up bandwidth for the Account team, who could finally focus on feature development.</li></ul>',

            // Store Association
            'case.sa.title':    'Store Association Flow',
            'case.sa.subtitle': 'Redesign of the association flow between the user account and the shop, making it transparent and error-resistant.',
            'case.sa.metric1.value': '600+',
            'case.sa.metric1.label': 'successful associations per day',
            'case.sa.metric2.value': '~–40%',
            'case.sa.metric2.label': 'estimated drop in error-driven abandonment',
            'case.sa.situation': '<p>The shop association process, particularly for open-source installations, was a major source of confusion. Merchants didn\'t understand why association was required and abandoned the process — especially when errors occurred.</p><p>The association exists because most users have Open Source shops installed locally on their hosting, not always identified as belonging to the owner account. Association creates this connection.</p>',
            'case.sa.tasks':    '<ul class="case-list"><li>Conducted research to identify key pain points and abandonment triggers.</li><li>Redesigned the flow to require only the necessary information, providing clear guidance and error correction.</li><li>Modeled the new process on the SaaS "Edition" experience, offering seamless association for recognized shop owners.</li><li>Prototyped the new flow (including a demonstrative video) and validated improvements with stakeholders.</li></ul>',
            'case.sa.results':  '<ul class="case-list"><li>Major improvement in user comprehension and reduced frustration.</li><li>Most shop traffic now flows through the updated payment platform and onboarding.</li><li>Unified the experience with the "Edition" SaaS model for consistency.</li></ul>',

            // DS Execution (Actions correctives 2026)
            'case.dsexec.title':    'Opal DS · Corrective Actions',
            'case.dsexec.subtitle': 'Executing the design system remediation plan: rebuilding 44 components, applying 2,634 token bindings, and establishing a dev-alignment workflow that accelerates feature delivery by 20–30%.',
            'case.dsexec.metric1.value': '92 → 2 634',
            'case.dsexec.metric1.label': 'token bindings applied',
            'case.dsexec.metric2.value': '9% → 100%',
            'case.dsexec.metric2.label': 'component compliance rate',
            'case.dsexec.metric3.value': '44',
            'case.dsexec.metric3.label': 'components rebuilt · 0 hardcoded values remaining',
            'case.dsexec.execution':   '<p>With the audit findings as a roadmap, I executed in 5 ordered phases: foundations (color palette, spacing, typography, iconography, vocabulary), then component-by-component reconstruction. 3 icon libraries consolidated into 1. Every hex value replaced by a token reference.</p><p class="case-caption">Each component refactor: hardcoded values → semantic tokens. Multiplied across 44 components.</p>',
            'case.dsexec.automation':  '<p>Token binding was the highest-volume task. I automated it using Claude Code with the Figma MCP (Model Context Protocol — lets agents drive Figma directly): 1,755 bindings applied in a single session, 45,000+ nodes analysed, 879 auto-corrections. What would have taken weeks took hours.</p><p class="case-caption"><em>Automation didn\'t replace review — every binding was checked. Speed without governance is just faster regression.</em></p>',
            'case.dsexec.alignment':   '<p>4-step dev-alignment workflow: <strong>Figma</strong> (design + tokens applied) → <strong>Notion doc</strong> (states, variants, props) → <strong>Storybook/Chromatic</strong> (implementation reviewed by designer) → <strong>Linear ticket closed</strong>. As of April 2026: 11 components in dev review — FButton, FTextfield, OpalSwitch, FChip, FDialog, and 6 others.</p>',
            'case.dsexec.results':     '<p>44 components rebuilt. 0 hardcoded values remaining. 3 → 1 icon library. Estimated +20–30% gain per feature cycle. The design system went from an implicit, undocumented system to a structured, scalable, dev-aligned infrastructure.</p>',

            // Plugin Figma
            'case.plugin.title':    'Figma Plugin — Local Components Collector',
            'case.plugin.subtitle': 'A JavaScript plugin built with the Figma Plugin API to automate local component audits — reducing DS audit time from days to hours.',
            'case.plugin.metric1.value': 'days → hours',
            'case.plugin.metric1.label': 'DS audit time reduction',
            'case.plugin.metric2.value': '0',
            'case.plugin.metric2.label': 'manual file-by-file navigation needed',
            'case.plugin.metric3.value': 'Solo',
            'case.plugin.metric3.label': 'shipped without engineering bandwidth',
            'case.plugin.problem':   '<p>Without a dedicated tool, identifying un-factorized local components in a Figma file is entirely manual: open each frame, inspect each element, note duplicates. No consolidated view exists natively. This directly delays factorization work and silently grows design debt between audits.</p>',
            'case.plugin.approach':  '<p>I identified the need through personal friction while running a DS audit at Oplit. Instead of waiting for an engineering solution, I built the tool myself. I defined criteria for a "factorization candidate": frequency of use, presence of variants, visual and structural complexity.</p>',
            'case.plugin.howworks': '<p>The plugin is written in JavaScript using the Figma Plugin API. It crawls all nodes in the current file, detects local components (not from a shared library), and generates a structured report: component name, usage count, parent frame, factorization priority. The report displays directly in the plugin panel — no export needed.</p>',
            'case.plugin.impact':    '<p>DS audit time reduced from several days to a few hours. Factorization candidates are identified objectively. The plugin demonstrates that a senior designer can deliver tooling value without waiting on engineering bandwidth.</p>',

            // DS Audit (2025)
            'case.dsaudit.title':    'Opal DS · Audit',
            'case.dsaudit.subtitle': 'A systematic Opal DS audit — graded findings against four industry frameworks, with a phased remediation plan I executed over the following months.',
            'case.dsaudit.metric1.value': '3 levels',
            'case.dsaudit.metric1.label': 'CRITICAL / WARNING / INFO severity grading',
            'case.dsaudit.metric2.value': '3 horizons',
            'case.dsaudit.metric2.label': 'Immediate / Next / Future remediation plan',
            'case.dsaudit.metric3.value': '4 frameworks',
            'case.dsaudit.metric3.label': 'Atomic Design · BEM · DTCG · WCAG 2.1 AA',
            'case.dsaudit.situation':    '<p>Design and code weren\'t talking to each other. The same button appeared in 5 different variants depending on the page. No shared documentation existed. Rules lived in people\'s heads. Every new developer had to reverse-engineer the system from production.</p>',
            'case.dsaudit.methodology':  '<p>I built a custom audit protocol using the Figma MCP (Model Context Protocol): systematic reading of every component in the library, evaluated against 4 reference frameworks — Atomic Design (structure), BEM (naming), DTCG (Design Tokens Community Group standard), WCAG 2.1 AA (accessibility). Each finding was graded: CRITICAL (blocks correct usage), WARNING (inconsistency, technical debt risk), INFO (improvement opportunity).</p>',
            'case.dsaudit.findings':     '<p><strong>Button — NON-COMPLIANT:</strong> hex values in shadow properties, "Type" prop collision with reserved keyword, token path conflicts. <strong>Foundations — NEEDS WORK:</strong> forked naming conventions, 3 different names for the same opacity primitive. Report structured by severity with 3 remediation horizons: Immediate (blockers), Next (next sprint), Future (backlog).</p>',
            'case.dsaudit.plan':         '<p>5-step remediation plan: 1. Audit → 2. Foundations (color tokens, spacing, typography, iconography, vocabulary) → 3. Components (rebuilt one by one against the audit report) → 4. Dev alignment (Storybook, review workflow) → 5. Deployment. Each step had explicit entry/exit criteria.</p>',

            // Capacity Transfer Between Sectors
            'case.transfer.title':    'Capacity Transfer Between Sectors',
            'case.transfer.subtitle': 'From 8 manual steps in Excel to 1 action with real-time feedback — enabling a major automotive manufacturer to unlock multi-site deployment.',
            'case.transfer.metric1.value': 'Deployed',
            'case.transfer.metric1.label': 'feature live and adopted',
            'case.transfer.metric2.value': 'Weekly',
            'case.transfer.metric2.label': 'consistent usage since launch (Mixpanel)',
            'case.transfer.metric3.value': '10+ sites',
            'case.transfer.metric3.label': 'multi-site deployment unblocked',
            'case.transfer.metric4.value': '3.5 months',
            'case.transfer.metric4.label': 'discovery to production with a 3-person team',
            'case.transfer.situation': '<p>Oplit is an industrial planning SaaS (Industry 4.0) used by manufacturers in aerospace, luxury watchmaking, and automotive. The planning module lets schedulers manage demand, capacity, inventory, and scheduling across their production lines (work centers / machines).</p><p><strong>The business problem:</strong> when a machine is overloaded (load rate > 100%), the scheduler must transfer production demand to another machine. Before Oplit, this process was entirely manual: calculations in Excel, identifying available machines through personal knowledge, adjusting stock projections by hand, no traceability, no way to undo.</p><p><strong>The manual process in 8 steps</strong> (documented in session with the client):</p><ol class="case-list"><li>In the manufacturing tab, try increasing capacity → still overloaded</li><li>Balance the load to capacity → load rate 100%</li><li>In the stock tab, check the impact → negative stock</li><li>Calculate the number of parts to transfer (demand vs production target gap, e.g. 300k parts)</li><li>Identify transferable references to reach the target volume</li><li>Make multiple transfer events (reference A, then B...)</li><li>On the origin sector: verify the projected stock updates</li><li>On the destination sector: manually adjust the stock target</li></ol><p><strong>The client:</strong> a major automotive manufacturer operating across multiple production sites. The success of this feature conditions Oplit\'s deployment on 10+ additional sites — a direct business stake, not just a UX problem.</p><p><strong>The trigger:</strong> the client couldn\'t move forward with multi-site deployment without this feature. It\'s the convergence of a critical user need and a commercial stake (retention + expansion).</p>',
            'case.transfer.research_discovery': '<p><strong>Co-creation with the client over 5-6 iterative sessions:</strong></p><ul class="case-list"><li>Remote observations (screen sharing) of the scheduler\'s real workflow</li><li>Mapping workarounds: Excel files, manual calculations, memory</li><li>Documentation of the 8-step manual process (documented in session)</li><li>Presentation of information hierarchy proposals and interface designs</li><li>Successive iterations to the final design</li><li>The client shared their real behavior, tool workarounds, and time spent</li></ul><p><strong>FOCUSED framework</strong> used to structure the discovery:</p><ul class="case-list"><li><strong>Frame:</strong> quantified success metrics (no stock ruptures, optimal load rate, business = GTM in Make to Stock + deals signed, client closed thanks to the module)</li><li><strong>Observe:</strong> First Use Case — "I\'m the planning manager, I do my weekly load/capacity exercise, what matters is giving production targets based on strategy, but machines are overloaded and the optimization process is manual, painful, and long"</li><li><strong>Claim:</strong> "Transfer your load in 3 clicks, visualize the impact in real time, keep full control with one-click undo. No more fictional stock ruptures and Excel calculations."</li><li><strong>Unfold:</strong> 5 key touchpoints (stock page → sector view → transfer demand → see immediate impact → adjust if needed)</li><li><strong>Steal:</strong> Benchmarks — Notion (bidirectional backlinks), GitHub (PR reverts with automatic restoration), Figma (instances/master distinction), Stripe (linked transactions with distinct tags)</li><li><strong>Execute:</strong> happy path + sad path + 4 hypotheses to validate</li><li><strong>Decide:</strong> structured Go/No-Go with Product, Tech, Sales, Ops</li></ul><p><strong>Critical discovery during the project:</strong> the client\'s vocabulary didn\'t match ours. What Oplit called "load", the client called "demand". What Oplit called "production target", the client called "capacity". This misunderstanding was identified during test sessions and required an interface wording adjustment.</p><p><strong>Hypotheses to validate:</strong></p><ol class="case-list"><li>Users instantly understand the dual-line system (emission + reception) → tested in session with the client</li><li>Automatic adjustments are preferred over manual input → tracking auto vs manual ratio via Mixpanel</li><li>Transfer cancellation is discoverable and used at the right time → usage rate + delay between creation and cancellation</li><li>Global stock consistency is immediately understood → monitoring support tickets "stock disappeared"</li></ol>',
            'case.transfer.decisions': '<p><strong>Structural constraint:</strong> 1 single developer on the project. Every design decision had to pass the filter "is this buildable in this cycle?" (late 2025 → mid-March 2026).</p><p><strong>What was retained and why:</strong></p><ul class="case-list"><li><strong>Manual transfer with pre-calculated suggestions:</strong> the scheduler stays in control. Don\'t automate what the user needs to understand — trust comes from transparency, not from black-box automation.</li><li><strong>Dual-line system (emission + reception):</strong> inspired by Notion (backlinks), GitHub (PR reverts), Stripe (linked transactions). When transferring from Sector 1 to Sector 2, two lines appear: an emission line on Sector 1 (with tag "Partial transfer" or "Complete transfer") and a reception line on Sector 2 (with tag "Transfer received"). Both are linked by a clickable bidirectional link.</li><li><strong>One-click cancellation:</strong> from the reception line. Automatic stock restoration to initial state. This was the client\'s #1 request — impossible to cancel a transfer in the previous version.</li><li><strong>Visual tags (Partial/Complete/Received):</strong> immediate feedback on transfer status without opening details.</li></ul><p><strong>What was cut from V1 scope:</strong></p><ul class="case-list"><li><strong>Automatic route optimization:</strong> too technically complex for 1 dev and a short cycle. Would have required heavy processing of the client\'s load file.</li><li><strong>Alternative route suggestions:</strong> same reason — too much technical work for a sustainable dev cycle.</li><li><strong>Projected load rate on destination sector:</strong> cut for V1, added to V2 backlog. Current load rate is displayed in the transfer modal (e.g. "Current load rate: 15%") but not the projection after reception.</li></ul><p><strong>Transfer modal:</strong></p><ul class="case-list"><li>Pre-filled information: period, operation, origin sector (locked, non-editable)</li><li>Load to transfer: manually adjustable quantity with total indication (e.g. "45 /90")</li><li>Destination sector: dropdown with current load rate display</li><li>The scheduler sees both load rates (origin and destination) in the same modal — informed decision without switching views</li></ul><p><strong>Edge cases handled:</strong></p><ul class="case-list"><li>Attempt to transfer more than available stock → error message + blocking</li><li>Attempt to modify the reception line → disabled dropdown + explanatory tooltip</li><li>Multi-select + transfer → "Transfer load" CTA grayed out (not compatible in V1)</li><li>Cancellation of a transfer where production has started → blocking + explanatory message</li></ul>',
            'case.transfer.collaboration': '<p><strong>Team:</strong> Product trio (PM + Product Designer + 1 Dev).</p><p><strong>5-6 co-creation sessions with the client:</strong> iterative format — presentation of business reflections and interface proposals, client feedback on their real workflow and workarounds, adjustments.</p><p><strong>Design deliverables:</strong></p><ul class="case-list"><li>Figma: annotated specs + interactive prototype</li><li>Linear: functional spec with context, success criteria (short/medium/long term), Figma link, delta from current state, detailed specs, acceptance criteria, and Mixpanel trackers</li></ul><p><strong>Test participants:</strong> the client\'s scheduler in test sessions on staging before production deployment. Post-test adjustments (terminology, interaction patterns).</p><p><strong>Managing the team constraint:</strong> with only 1 dev, the designer (me) had to provide exhaustive specs from the first handoff to minimize back-and-forth. Linear specs systematically included edge cases and sad paths.</p>',
            'case.transfer.design_solution': '<p><strong>The final user flow (Happy Path):</strong></p><ol class="case-list"><li>The scheduler identifies an overloaded sector — "Sector 1" displays a red badge "Load rate: 200%" + an alert "Min stock: 1 rupture"</li><li>They click the dropdown of the reference to transfer (e.g. "Ribs-10")</li><li>They select "Transfer load"</li><li>The modal opens with pre-filled information (period, operation, origin sector locked)</li><li>They select the destination (e.g. "Sector 2") → the current load rate displays (e.g. "15%")</li><li>They choose the quantity to transfer (e.g. 45 out of 90 parts)</li><li>They validate</li><li>Immediate result — On Sector 1: the reference shows a "Partial transfer" tag with a sub-line "To Sector 2 ↗" and the adjusted production target (from 90 to 45, with original indication). On Sector 2: the reference appears with a "Transfer received" tag and a sub-line "From Sector 1 ↗". The stock evolution graph shows hatched bars for the transferred target. A new "Transferred prod. target" line appears in the detail table.</li><li>The scheduler can cancel the transfer in one click from the reception line</li><li>They can iterate: make multiple successive transfers until optimal balance</li></ol>',
            'case.transfer.outcome': '<p><strong>Feature adopted and used weekly</strong> since deployment (tracked via Mixpanel).</p><ul class="case-list"><li><strong>Multi-site deployment unblocked:</strong> the client validated the module and is launching deployment on 10+ additional production sites. This is the most significant business impact — the feature directly conditioned contract expansion.</li><li><strong>Manual process eliminated:</strong> from 8 manual steps with Excel to 1 action with immediate visual feedback, complete traceability (origin, destination, quantity, bidirectional links) and one-click cancellation.</li><li><strong>User trust established:</strong> the scheduler can now see exactly what they transferred, from where, to where, and cancel if needed. Traceability resolves the initial problem "I don\'t know if I\'ve already done a transfer or not".</li><li><strong>Delivery time:</strong> ~3.5 months from scoping to production (late 2025 → mid-March 2026) with a 3-person team (PM + Designer + 1 Dev).</li></ul><blockquote><p>"The options we asked for, they work. We\'ve taken a real step forward. I have no more blockers to move forward with deployment for other sites."</p><p>— Production planning manager, after deployment</p></blockquote>',

            // Multi-select & Sticky Action Bar (merged)
            'case.multi.title':    'Multi-select & Sticky Action Bar',
            'case.multi.subtitle': 'One coupled pattern — multi-select triggers a sticky action bar — so schedulers can update 50 work orders in one click instead of fifty. Same behavior across cards and Gantt views.',
            'case.multi.metric1.value': '2,250',
            'case.multi.metric1.label': 'bulk actions in first 30 days (Mixpanel)',
            'case.multi.metric2.value': '4 views',
            'case.multi.metric2.label': 'consistent behavior across cards & Gantt',
            'case.multi.metric3.value': '~7 days',
            'case.multi.metric3.label': 'design / 4 months to production',
            'case.multi.metric4.value': '50-100',
            'case.multi.metric4.label': 'min/week saved per planner (estimated)',
            'case.multi.context': '<p>Oplit is an industrial planning SaaS (Industry 4.0) used by 12 companies (aeronautics, luxury watchmaking, precision engineering), with 3 to 5 users per client. Users are schedulers and workshop managers who daily manage dozens of manufacturing operations across multiple days, work centers, and work orders (OF).</p><p>The product offered 4 main work views: OF view (work orders), In-progress view (cards), Progress tracking in cards and Gantt.</p><p><strong>The problem:</strong> no multi-selection possible. Each action (tagging, prioritizing, changing a status, moving) had to be done operation by operation. To tag 5 operations: 5× (click OP → click tag → validate) = 2-3 minutes. To prioritize a 16-operation work order: 16× (open OP → modify priority → validate) = 5-10 minutes.</p><p><strong>Business impact:</strong> 5 to 15 minutes lost per day per user, frustration on blocking actions in the daily workflow, risk of errors and omissions.</p><p><strong>Market gap:</strong> multi-selection is a standard in all management tools (Shopify, Jira, etc.). Its absence in Oplit generated strong frustration as users had this habit in their other tools.</p><p><strong>Client verbatims:</strong></p><ul class="case-list"><li>"I want to select 5 operations on Monday, Tuesday and Wednesday, and tag them all \'Urgent\' in 1 click instead of doing it operation by operation."</li><li>"When a work order becomes a priority, I want to prioritize it for all workshops without opening each operation one by one."</li><li>"I need to move a complete work order (16 operations) to another work center without doing the same action 16 times."</li></ul>',
            'case.multi.research_discovery': '<p><strong>Multiple converging sources:</strong></p><ul class="case-list"><li>Recurring client requests reported by OPS during weekly follow-ups</li><li>User interviews to identify behaviors and usage patterns</li><li>Remote observations (screen sharing) with 2 clients to see real-situation behavior</li></ul><p><strong>FOCUSED framework</strong> used to structure the discovery:</p><ul class="case-list"><li><strong>Frame:</strong> define ambition with quantified success metrics</li><li><strong>Observe:</strong> identify First Use Case (FUC) and secondary use cases</li><li><strong>Claim:</strong> narrative positioning ("how do I pitch my feature")</li><li><strong>Unfold:</strong> 5 key touchpoints of the experience</li><li><strong>Steal:</strong> benchmark and golden nuggets</li><li><strong>Execute:</strong> design with happy path and sad path</li><li><strong>Decide:</strong> Go/No-Go with Product, Tech, Sales, Ops</li></ul><p><strong>First Use Case identified:</strong> "As a scheduler, when I want to apply tags, priorities, or statuses on multiple operations in a single action, what matters most is being able to do it quickly (under 30 seconds), consistently, and staying in the view where I work."</p><p><strong>Benchmark:</strong> Shopify, Miro, Kajabi, Circle, Jira. Recurring pattern identified: sticky bar on selection, visible counter "X items selected", confirmation modal for high-impact actions.</p>',
            'case.multi.decisions': '<p><strong>Sticky bar vs other patterns:</strong></p><ul class="case-list"><li><strong>Right-click context menu:</strong> discarded — not visible enough for users with low tool familiarity.</li><li><strong>Persistent top toolbar:</strong> discarded — the interface already had side menus and complex UI — adding a top element reduced content visibility.</li><li><strong>Bottom sticky bar (retained):</strong> preserves high interface visibility on tables and card lists, enables quick actions accessible even for less familiar users.</li></ul><p><strong>4 quick actions chosen (Tags, Priority, Status, Date):</strong> identified by cross-referencing interviews, field observations, and validated post-deployment by Mixpanel trackers. Selection criterion: actions needed to act quickly on operations in production. Secondary actions (work center change, batch, lock) are in the "…" menu — less frequent or done in calmer moments.</p><p><strong>"Capacity-aware" variant:</strong> available only in Gantt view for certain clients. When a user moves an operation to a work center, the system checks if the center has sufficient capacity. If not, the operation is moved to the next day or spread over time.</p><p><strong>Cross-view consistency:</strong> same multi-select behavior on Cards and Gantt views, despite very different visual structures. Motivated by user context: these are people in production, sometimes under stress from a noisy environment and multiple demands. They need to take quick, informed, easy actions without relearning a pattern from one view to another. However, information displayed in the sticky bar and available actions vary by view.</p><p><strong>Edge cases handled:</strong></p><ul class="case-list"><li>Selection + search: selection persists during search</li><li>Switch between Gantt and list in same context: selection maintained</li><li>Context switch (e.g., In-progress → OF): deselection — different use case</li><li>Page refresh: selection lost (deliberate technical choice)</li><li>Actions on incompatible statuses: warning with confirmation</li><li>No selection limit (validated with tech)</li></ul>',
            'case.multi.collaboration': '<p><strong>Specs in dual format:</strong> annotated Figma (design specs) + Linear document (functional spec for design→tech handoff).</p><p><strong>Linear document structure:</strong> context, short/medium/long-term success criteria, Figma link, delta from current state, detailed specs per component, acceptance criteria, and desired Mixpanel trackers.</p><p><strong>Interactive prototype</strong> delivered via Figma to let tech and stakeholders test the flow before development.</p><p><strong>Structured Go/No-Go</strong> with 4 parties: Product, Tech, Sales, Ops.</p>',
            'case.multi.design_solution': '<p>The sticky bar has a <strong>2-level hierarchy</strong>:</p><ul class="case-list"><li><strong>Level 1 — Information:</strong> select-all checkbox, counter, number of parts, number of hours, close button.</li><li><strong>Level 2 — Actions:</strong> 4 direct buttons + dropdown "…" for secondary actions.</li></ul><p>Checkbox on hover on each OP card, always visible in touch mode (44×44px). Selected state: 2px blue border + pale blue background. The sticky bar persists between actions (only closes manually).</p>',
            'case.multi.outcome': '<p><strong>Mixpanel tracking plan</strong> set up from deployment to track: which actions are done in multi-select, by which users, in what volume.</p><ul class="case-list"><li><strong>2,250 multi-select actions in the first 30 days</strong> (source: Mixpanel). Breakdown by action type and by client visible on the dashboard.</li><li><strong>Most used actions:</strong> sector (work center) change and priorities lead, followed by tags and statuses.</li><li><strong>Adoption:</strong> all clients with access to the feature use it daily.</li><li><strong>Estimated time savings:</strong> ~100 operations processed per week per planner, going from 30s-1min per operation (individual) to a few seconds per batch. Potentially 50 to 100 minutes/week saved per planner.</li><li><strong>Delivery time:</strong> ~7 days of design work, 4 months from scoping to production deployment (including design, staging, demo, prod, and feedback/corrections).</li></ul>',
        },

        fr: {
            // Nav
            'nav.who':      'À propos',
            'nav.projects': 'Projets',
            'nav.star':     'Sauvegarder',

            // Landing
            'landing.line1':    'Je conçois des produits complexes à haute exigence.',
            'landing.line2_pre':'Actuellement chez ',
            'landing.sub':      'Guillaume Caillet · Senior Product Designer · France',
            'landing.sub_name': 'Guillaume Caillet',
            'landing.sub_role': 'Senior Product Designer',
            'landing.sub_loc':  'France',
            'landing.pitch':    'Sur les 7 dernières années, j\'ai participé à la conception et à l\'amélioration de produits SaaS B2B — aux côtés des équipes de <strong>Oplit</strong> (planification industrielle), <strong>PrestaShop</strong> (300k+ marchands), <strong>Airbus</strong> et <strong>SNCF</strong>. J\'ai piloté des design systems, mené des audits, et livré des chantiers d\'infrastructure que les équipes capitalisent ensuite.<br><br>Ce que je cherche : des produits exigeants où le design co-pilote la stratégie — pas une fonction support.',
            'landing.discover': 'Découvrir mon travail →',
            'landing.email':    'M\'écrire',
            'landing.linkedin': 'Me suivre sur LinkedIn',

            // Who page
            'who.title': 'Qui suis-je ?',
            'who.intro.p1': 'Je suis venu au design par les systèmes visuels avant toute formation — en construisant des logos et des kits de branding gamin, pour le plaisir. Ce qui a pris racine à cette époque ne m\'a jamais quitté : une curiosité pour les systèmes, et l\'envie de construire les outils autant que de les utiliser.',
            'who.intro.p2': 'Aujourd\'hui je suis <strong>Senior Product Designer</strong> chez <strong>Oplit</strong>, une plateforme SaaS B2B d\'ordonnancement industriel. Je conçois pour des planificateurs et opérateurs d\'atelier dans l\'horlogerie de luxe, l\'aéronautique et la mécanique fine — des utilisateurs experts, dans des contextes où chaque décision de design a un impact opérationnel réel. Mon rôle dépasse la conception d\'interfaces : j\'ai repris et déployé le design system d\'Oplit comme un élément structurant de l\'organisation, en alignant design, engineering et produit autour d\'un langage commun. Transformer un outil de design en infrastructure de décision partagée — c\'est ce type de levier que je cherche dans mon travail.',
            'who.intro.p3': 'Ce qui m\'attire, ce sont les environnements SaaS où le design façonne comment les organisations fonctionnent, pas seulement comment les produits se présentent. Les travaux qui comptent ne sont pas des écrans : c\'est un cadre de décision qui tient, un système de composants qui accélère toute l\'équipe, une recherche utilisateur qui réoriente une roadmap. Je me dirige vers des rôles où le design co-pilote une partie de la stratégie produit — pas comme une fonction support, mais comme co-auteur de la direction du produit.',

            'who.section.professional': 'Expériences professionnelles',
            'who.section.other':        'Autres expériences',
            'who.section.studies':      'Études',
            'who.section.mentoring':    'Mentorat',
            'who.section.articles':     'Articles',
            'who.section.podcasts':     'Podcasts',
            'who.section.templates':    'Templates pour Notion',
            'who.section.cv':           'Curriculum Vitae',
            'who.section.links':        'Liens utiles',

            'who.date.oplit':       'Sept. 2025 — Aujourd\'hui',
            'who.date.prestashop':  'Juin 2022 — Août 2025',
            'who.date.beapp':       'Juin 2021 — Juin 2022',
            'who.date.lacapsule':   'Oct. 2020 — Juin 2021',
            'who.date.airbus':      'Sept. 2018 — Juin 2020',
            'who.date.sncf':        'Mars 2018 — Août 2018',
            'who.date.stereosuper': 'Août 2015 — Sept. 2017',
            'who.date.teacher':     '2025 — Aujourd\'hui',
            'who.date.mentor':      '2024 — Aujourd\'hui',
            'who.date.ecv':         '2021 — Aujourd\'hui',
            'who.date.designschool': '2025',
            'who.date.freelance':   '2020 — Aujourd\'hui',

            'who.role.oplit':       'Senior Product Designer',
            'who.role.prestashop':  'Product Designer',
            'who.role.beapp':       'UX/UI Designer',
            'who.role.lacapsule':   'Consultant UX Designer',
            'who.role.airbus':      'UX Designer',
            'who.role.sncf':        'UX Designer — Stage',
            'who.role.stereosuper': 'UX Designer — Alternance',
            'who.role.teacher':     'Enseignant',
            'who.role.ecv':         'Intervenant & Jury',
            'who.role.designschool': 'Chargé de cours',
            'who.company.designschool': 'École de Design Nantes',
            'who.role.freelance':   'Freelance',

            'who.desc.oplit':       '<p><strong>SaaS d\'ordonnancement industriel &amp; planification capacitaire.</strong> Mes utilisateurs — planificateurs, ordonnanceurs, opérateurs atelier — travaillent dans l\'horlogerie de luxe, l\'automobile, l\'aéronautique et la mécanique fine. 3 ans de recherche capitalisée, 9+ clients interviewés.</p><p><strong>Ownership Design System Opal :</strong> audit complet (CRITICAL / WARNING / INFO), 44 composants reconstruits, 2 634 token bindings appliqués (contre 92 initiaux), 3 librairies d\'icônes → 1, 100% de conformité composants (contre 9%). Workflow dev-alignment : Figma → doc Notion → Storybook/Chromatic → ticket Linear fermé. 11 composants en revue dev. Gain estimé : +20–30% par fonctionnalité.</p><p><strong>Automatisation :</strong> 1 755 bindings appliqués en une session avec Claude Code et le MCP Figma (Model Context Protocol — permet aux agents IA de piloter Figma directement) — 45k nœuds analysés, 879 corrections automatiques.</p><p><strong>Frameworks :</strong> template de spec FOCUSED (structure en 7 étapes pour les specs produit dans Notion), FUC (Functional Use Cases), Discovery Client, Audit Interne. Specs rédigées en "when X → then Y" dans Linear.</p><p><strong>Plugin Figma :</strong> développé <em>Local Components Collector</em> en JavaScript (Figma Plugin API) — passe l\'audit DS de plusieurs jours à quelques heures.</p>',
            'who.desc.prestashop':  '<p><strong>Sr Product Designer &amp; Design System Lead (2024)</strong></p><p>Déploiement progressif du système de recherche chez PrestaShop. Responsable de la structuration et de la mise à disposition opérationnelle des outils, templates et données utilisateurs pour que les équipes produit y accèdent rapidement et efficacement. L\'objectif est d\'offrir un accès efficace à la recherche utilisateur lors de la conception des produits PrestaShop pour nos 300k+ marchands.</p><p>Travail également sur la structuration du Design System pour le rendre robuste, flexible et scalable. Proposition d\'axes de développement, structuration de l\'équipe autour du projet et mise en visibilité des travaux.</p><p><strong>Contributeur Design System (2023)</strong></p><p>Implication dans la structuration et l\'implémentation du Design System PrestaShop. Travail sur le suivi, l\'implémentation et l\'usage des composants et design tokens par l\'ensemble des utilisateurs du système, ainsi que sur les composants conçus par les Product Designers.</p><p><strong>Product Designer (2022)</strong></p><p>Au sein de l\'équipe Customer Platform, travail sur la conception et l\'amélioration de l\'expérience utilisateur au travers du compte utilisateur et, plus généralement, de l\'expérience de connexion.</p>',
            'who.desc.beapp':       '<p>En charge de l\'UX chez Beapp, travaillant principalement avec le designer UI et en contact avec toutes les personnes impliquées dans les différents projets clients (PO, Business, Tech).</p><p>Conception d\'expériences pour différents types de clients dans les secteurs santé, automobile, alimentaire, institutionnel, etc. Animation d\'ateliers de créativité, d\'immersion et de co-création. En charge de la recherche utilisateur et des tests.</p>',
            'who.desc.lacapsule':   '<p>Travail en tant que consultant UX pour des entreprises souhaitant améliorer leur expérience utilisateur.</p>',
            'who.desc.airbus':      '<p>Intégration de l\'équipe de designers UX/UI (UXiD) dans le cadre d\'un processus de digitalisation du Groupe Airbus. L\'équipe conçoit et repense des processus ainsi que des applications métier et des IHM, en remettant l\'humain au cœur du design.</p><p>Responsable de la diffusion des guidelines UX et des bonnes pratiques au sein du groupe. Collecte des besoins utilisateurs, participation à la conception d\'applications métier, organisation de l\'architecture d\'information, et travail en collaboration avec l\'IT et les autres départements.</p>',
            'who.desc.sncf':        '<p>UX designer en section 574 (innovation) à la SNCF à Nantes. En charge de la conception de personas, de parcours utilisateurs et de l\'ergonomie des écrans pour différentes applications.</p>',
            'who.desc.stereosuper': '<p>Apprenti pendant 2 ans, formé en tant que web designer avec une spécialisation en UX design, travaillant sur plusieurs projets et développant une solide expérience dans un domaine qui me passionne.</p>',
            'who.desc.teacher':     '<p>Enseignement des bases du design UI à de jeunes designers.</p>',
            'who.desc.mentor':      '<p>Accompagnement de designers, quel que soit leur niveau de séniorité, dans leur développement et dans leurs retours sur leurs projets ou perspectives de carrière.</p>',
            'who.desc.ecv':         '<ul><li>Workshop Design System avec les M1 UX — construction d\'une base et compréhension de l\'intérêt d\'un design system (2026)</li><li>Jury M2 UX — sujets de fin d\'étude (2026)</li><li>Éco-design &amp; Design System 2023, 2024, 2025 (Intervenant)</li><li>Design System \'22-\'23 (Projet annuel) — 100% d\'étudiants diplômés</li><li>Méthodes de Recherche Utilisateur \'21-\'22 (Chargé de cours)</li></ul>',
            'who.desc.designschool': '<ul><li>1ère année — Bases du design et UX/UI</li><li>2ème année — Formation Figma</li></ul>',

            'who.mentoring.link':  'Réserver une session de mentorat avec Guillaume Caillet sur ADPList →',
            'who.articles.text':   'J\'écris sur le <strong>design</strong>, les <strong>design systems</strong> et la <strong>recherche utilisateur</strong> — des notes de terrain, pragmatiques.',
            'who.articles.link':   'Guillaume Caillet sur Medium →',
            'who.podcast.simon':   'Interview avec Simon Robic sur le mobile-first →',
            'who.templates.link':  'Guillaume Caillet | Créateur de Templates Notion →',
            'who.cv.link':         'Télécharger le CV (PDF) →',
            'who.email':           'M\'écrire',
            'who.linkedin':        'Me suivre sur LinkedIn',

            // Projects
            'projects.title': 'Projets',
            'projects.other.intro': 'Projets antérieurs — concepts, prototypes et travaux étudiants que je trouve toujours pertinents.',
            'projects.minimap.label': 'Boussole thématique',
            'projects.minimap.idle':  'Survolez un projet pour voir son thème.',
            'projects.theme.ds':       'DESIGN SYSTEMS',
            'projects.theme.product':  'PRODUIT',
            'projects.theme.research': 'RESEARCH',
            'projects.theme.tooling':  'TOOLING',
            'projects.theme.label.ds':       'Design Systems',
            'projects.theme.label.product':  'Product Design',
            'projects.theme.label.research': 'Recherche utilisateur & Flows',
            'projects.theme.label.tooling':  'Tooling & Design Ops',

            // Footer
            'footer.role':    'Senior Product Designer',
            'footer.email':   'contact@guillaumecaillet.fr',

            // Case studies — shared
            'case.back':             '← Retour aux projets',
            'case.label':            'Étude de cas',
            'case.section.situation':'Contexte',
            'case.section.tasks':    'Approche',
            'case.section.results':  'Résultats',
            'case.section.next':     'Et après ?',
            'case.section.research':  'Recherche & Synthèse',
            'case.section.decision':  'Décision stratégique',
            'case.section.output':    'Output design',
            'case.section.problem':   'Problème',
            'case.section.approach':  'Approche',
            'case.section.solution':  'Solution',
            'case.section.howworks':  'Comment ça marche',
            'case.section.impact':    'Impact',
            'case.section.methodology': 'Méthodologie',
            'case.section.findings':  'Findings',
            'case.section.execution': 'Exécution',
            'case.section.alignment': 'Alignement dev',
            'case.section.automation':'Automatisation',
            'case.section.conception':'Design & Spécification',
            'case.section.matrix':    'Matrice d\'états',
            'case.section.details':   'Détails d\'implémentation',
            'case.section.plan':      'Plan de remédiation',
            'case.section.trigger':   'Pattern de multi-sélection',
            'case.section.surface':   'Sticky action bar',
            'case.section.context':   'Contexte',
            'case.section.learning':  'Apprentissages',
            'case.section.reflection':'Réflexion',
            'case.section.research_discovery': 'Recherche & Exploration',
            'case.section.decisions': 'Décisions & Arbitrages',
            'case.section.collaboration': 'Collaboration',
            'case.section.design_solution': 'Solution Design',
            'case.section.outcome': 'Résultats & Mesure',

            // Year labels
            'year.2026': '2026',
            'year.2025': '2025',
            'year.2024': '2024',

            // Project company tags
            'project.tag.oplit':      'Oplit',
            'project.tag.prestashop': 'PrestaShop',
            'project.tag.perso':      'Perso',

            // Design System
            'case.ds.title':    'Design System',
            'case.ds.subtitle': 'Structuration et développement du Design System PrestaShop. Donner aux équipes produit et core l\'accès à un système leur permettant de concevoir des expériences cohérentes, fluides et facilement structurées.',
            'case.ds.metric1.value': '100%',
            'case.ds.metric1.label': 'des squads produit utilisent le DS en design',
            'case.ds.metric2.value': '80%',
            'case.ds.metric2.label': 'd\'adoption dans les équipes tech',
            'case.ds.metric3.value': '-50%',
            'case.ds.metric3.label': 'de réduction du temps de développement',
            'case.ds.situation': '<p>À mon arrivée en juin 2022, le "design system" PrestaShop était un ensemble de kits UI avancés dans Figma, non partagé en tant que vraie bibliothèque. Les designers travaillaient avec leurs propres composants, les équipes tech utilisaient un framework séparé, et la cohérence d\'interface était faible.</p><p>Avec de multiples points de contact (produit principal, centre d\'aide, marketplace, académie), l\'alignement était critique pour scaler à la fois le produit et la marque.</p>',
            'case.ds.tasks':    '<ul class="case-list"><li>Structuration de l\'équipe Design System et mise en place d\'une propriété partagée autour d\'un workflow unifié.</li><li>Création de processus de contribution, de cycles de revue des composants, et de réunions régulières d\'alignement design-tech.</li><li>Construction d\'un Kanban transparent dans Notion, accessible au design et à la tech, pour suivre chaque demande de composant et son statut.</li><li>Audit du système existant et production de recommandations actionnables pour réaligner le système sur les besoins futurs.</li><li>Promotion des standards de documentation, faisant de la documentation un critère Go/No-Go pour tout nouveau composant.</li><li>Introduction et début d\'implémentation des design tokens, en suivant les bonnes pratiques pour les couches primitives et sémantiques.</li></ul>',
            'case.ds.results':  '<ul class="case-list"><li>Mise en place de processus de contribution design/tech, documentation, audit complet, gouvernance et Kanban partagé.</li><li>Implémentation initiale des design tokens sur des projets test (inspiré de Nathan Curtis).</li><li>Réduction de la dette design/documentation, alignement avec la tech sur la nomenclature.</li></ul>',
            'case.ds.next':     '<ul class="case-list"><li>Standardisation continue de la documentation sur tous les composants.</li><li>Déploiement de bibliothèques d\'expérience pour des squads spécialisées, en maintenant l\'alignement marque et UX.</li><li>Suivi continu de l\'adoption du DS et itération des processus de gouvernance.</li></ul>',

            // Customer Account
            'case.ca.title':    'Customer Account',
            'case.ca.subtitle': 'Unifier trois comptes PrestaShop fragmentés (Back Office, Marketplace, Business Care) en un seul — pour que les utilisateurs n\'aient plus à appeler le support pour changer leur email.',
            'case.ca.metric1.value': '3 → 1',
            'case.ca.metric1.label': 'compte client unifié',
            'case.ca.metric2.value': '0',
            'case.ca.metric2.label': 'dépendance au support pour les mises à jour basiques',
            'case.ca.metric3.value': 'Kano basic',
            'case.ca.metric3.label': 'need — structuré comme infrastructure, pas comme feature',
            'case.ca.situation': '<p>3ème volet du chantier d\'unification de l\'identité utilisateur (après Sign in/Sign up et Store Association). PrestaShop n\'avait pas de « compte utilisateur » à proprement parler. Les données utilisateurs étaient dispersées : une partie dans le back-office, une partie sur la marketplace, aucun espace central.</p><p>Les utilisateurs ne pouvaient pas modifier eux-mêmes leurs informations basiques (email, mot de passe) : ils devaient contacter le support. Le volume de tickets support liés à ces demandes consommait une part significative de la bande passante de l\'équipe.</p><p><strong>Cadrage par le modèle de Kano :</strong> ce n\'est pas une feature « wow » mais un besoin de base. Son absence génère de la frustration, sa présence est considérée comme une évidence. L\'enjeu était de convaincre les stakeholders d\'investir sur un projet « invisible » mais structurant.</p>',
            'case.ca.research_discovery': '<p><strong>Pas de research spécifique</strong> pour ce ticket : les insights venaient directement de la research du Sign in/Sign up (5 interviews marchands + data Mixpanel + retours support).</p><p>Le besoin était une évidence : tous les concurrents (Shopify, WooCommerce, Wix) avaient un espace compte centralisé. Le benchmark a confirmé que c\'était un standard du marché, pas une innovation.</p><p>L\'enjeu n\'était pas de valider le besoin mais de définir le scope V1 : quelles informations centraliser en premier, dans quel ordre.</p>',
            'case.ca.decisions': '<p><strong>Scope V1 vs V2 :</strong></p><ul class="case-list"><li><strong>V1 (livré) :</strong> données personnelles (nom, email, téléphone, pays, mot de passe) + données génériques d\'identification de la boutique + lien vers les services PrestaShop (Marketplace, Academy, Help Center).</li><li><strong>Coupé du scope V1 (backlog) :</strong> fonctionnalité multi-boutique, gestion de la facturation directement dans le compte. Ajouté par itérations successives.</li></ul><p><strong>Consolidation des bases de données :</strong> chantier technique majeur. L\'approche a été de poser les requirements UX (quelles données, quelle structure, quels droits) puis de laisser la tech concevoir la solution en récupérant les bases existantes de la marketplace, du help center et du back-office (core).</p><p><strong>Suppression de compte (RGPD) :</strong></p><ul class="case-list"><li>Enjeu identifié : des utilisateurs avaient créé des comptes en doublon pour gérer leur boutique.</li><li>Discussion avec le légal sur les données à conserver vs supprimer totalement.</li><li>Double argument : compliance RGPD + réduction des coûts (données stockées = coûts serveur).</li></ul><p><strong>Distinction Personal info / Business info :</strong> décision structurelle pour clarifier la lecture. La séparation existait déjà mais était mal organisée. Le redesign l\'a rendue explicite et facile d\'accès.</p>',
            'case.ca.collaboration': '<p><strong>Récupération de scope cross-squads :</strong> l\'équipe Marketplace gérait les données « utilisateur client » alors que cela relevait légitimement de l\'équipe Account. Le transfert de scope s\'est fait naturellement car il libérait de la bande passante pour l\'équipe Marketplace.</p><p><strong>Friction avec l\'équipe Payment :</strong> les données de paiement étaient gérées dans un environnement technique séparé. Récupérer cette brique a été complexe côté technique et a nécessité une collaboration rapprochée.</p><p><strong>Workshops :</strong> brainstorms d\'1h à 1h30 avec PM, Designer et Leads Tech. Format : propositions et prises de décision sur la façon de centraliser l\'information.</p>',
            'case.ca.design_solution': '<p>Un espace centralisé unique où l\'utilisateur voit ses données personnelles, ses données business et ses liens vers tous les services PrestaShop. Distinction claire entre les sections Personal info et Business info, autonomie totale pour toutes les mises à jour basiques, et possibilité de suppression de compte (conformité RGPD).</p>',
            'case.ca.outcome': '<p><strong>Réduction significative des tickets support</strong> liés aux modifications de données personnelles (l\'objectif était de diviser par 2 minimum). Pas de chiffre exact disponible, mais l\'indicateur principal est l\'absence quasi-totale de plaintes post-launch sur ce sujet.</p><ul class="case-list"><li><strong>Autonomie utilisateur totale :</strong> les marchands peuvent désormais modifier leurs données personnelles et business sans contacter le support.</li><li><strong>Données synchronisées</strong> à travers tous les services PrestaShop (marketplace, help center, back-office).</li><li><strong>L\'absence de retour négatif comme indicateur de succès :</strong> conforme au modèle de Kano — un besoin de base bien exécuté ne génère pas d\'enthousiasme mais élimine la frustration. Le succès se mesure par la disparition du problème, pas par des applaudissements.</li></ul>',

            // Sign in/up
            'case.si.title':    'Sign in / Sign up Flow',
            'case.si.subtitle': 'Diviser par deux les erreurs d\'authentification en refondant la connexion sur l\'ensemble de l\'écosystème PrestaShop (back office, marketplace, centre d\'aide).',
            'case.si.metric1.value': '-50%',
            'case.si.metric1.label': 'd\'erreurs d\'authentification (7k en moy. vs 15k avant)',
            'case.si.metric2.value': '-50%',
            'case.si.metric2.label': 'de réduction du flux (5 étapes → 3 étapes)',
            'case.si.metric3.value': '50%',
            'case.si.metric3.label': 'des connexions via Google SSO en 6 mois',
            'case.si.situation': '<p>PrestaShop est un écosystème e-commerce open-source utilisé par 300k+ marchands, avec plusieurs points d\'entrée : un back-office (gestion de boutique), une marketplace (modules/add-ons), un help center (support) et une business care (abonnement).</p><p>Chaque service avait son propre système d\'authentification avec des bases de données distinctes, non synchronisées. Les utilisateurs avaient jusqu\'à 3 sets d\'identifiants différents : un pour le back-office (identifiants locaux sur leur hébergement), un pour la marketplace (email+mdp et/ou Google) et un pour le help center.</p><p>Le déclencheur : un pic de tickets support lié aux erreurs d\'authentification qui consommait la majorité de la bande passante de l\'équipe Account, empêchant le développement de nouvelles features. Donnée clé : ~15 000 erreurs d\'authentification par mois en moyenne (2023-2024), trackées via Mixpanel.</p>',
            'case.si.research_discovery': '<p><strong>Approche mixte quanti + quali :</strong> Le problème était déjà largement dimensionné par la data quantitative (Mixpanel) et les retours du support. La recherche qualitative a servi à comprendre les comportements et confirmer/nuancer les hypothèses.</p><p><strong>5 interviews marchands</strong> en format semi-directif, recrutés par contact direct. Objectif : comprendre comment ils se connectaient et ce qui générait de la friction.</p><p><strong>Hypothèses testées :</strong></p><ul class="case-list"><li><strong>« Trop de moyens de connexion différents »</strong> → Confirmé : les utilisateurs ne savaient pas quel identifiant utiliser pour quel service.</li><li><strong>« Un parcours peu intuitif »</strong> → Confirmé : le flow de création de compte comportait 5 étapes (données personnelles, typologie utilisateur, données boutique pro, validation, puis confirmation par email).</li><li><strong>« Les identifiants acceptés ne sont pas explicites »</strong> → Confirmé : pas de feedback clair sur quel type de credentials fonctionnait sur quel service.</li><li><strong>« Les utilisateurs tentent de se connecter avec leurs identifiants locaux (back-office) sur la marketplace »</strong> → Confirmé : source majeure d\'erreurs.</li><li><strong>« Les utilisateurs ont des adresses email différentes pour chaque service »</strong> → Infirmé : le problème n\'était pas des emails différents mais l\'impossibilité technique d\'utiliser les mêmes credentials entre services, même avec la même adresse.</li><li><strong>« Les marchands gèrent leur boutique seuls »</strong> → Infirmé : certaines boutiques sont gérées par des agences ou des équipes, ouvrant le sujet des rôles et permissions (traité dans Store Association / Customer Account).</li></ul>',
            'case.si.decisions': '<p><strong>Découpe stratégique du scope :</strong> Le chantier global a été découpé d\'un commun accord (PM + Designer + Lead Dev) en 3 tickets distincts pour conserver une taille raisonnable et permettre à la roadmap d\'absorber le projet :</p><ol class="case-list"><li><strong>Sign in / Sign up</strong> — refonte des parcours d\'authentification et de création de compte</li><li><strong>Store Association</strong> — permettre aux marchands d\'associer leurs boutiques à leur compte PrestaShop</li><li><strong>Customer Account</strong> — créer un espace centralisé pour les données personnelles et pro</li></ol><p><strong>Alternatives explorées et écartées :</strong></p><ul class="case-list"><li><strong>Magic link / Google SSO :</strong> exploré mais la complexité technique sur le socle existant était trop importante. Le SSO Google classique ("Continue with Google") a été retenu — plus standard et maîtrisable.</li><li><strong>Code de double authentification :</strong> envisagé pour la sécurité mais écarté car ajoutait de la friction. Pas prioritaire en V1.</li><li><strong>Réclamation de boutique par URL :</strong> écarté pour raison technique — impossible de prouver la filiation sans un processus d\'association structuré. Redirigé vers le ticket "Store Association" avec UUID.</li><li><strong>Merge automatique des comptes :</strong> exploré mais les problématiques d\'identification rendaient le merge trop risqué. Consolidation progressive via le nouveau système unifié.</li></ul><p><strong>Trade-off principal — simplicité utilisateur vs complexité technique :</strong> La tendance de l\'équipe était de faire porter la complexité technique sur l\'utilisateur. Le parti pris design : traiter la complexité « derrière le rideau » — l\'utilisateur n\'a qu\'à rentrer son email, le système gère le reste.</p><p>Exemple concret : dans une première version, les messages d\'erreur contenaient un code technique pour les tickets support. Ça ne signifiait rien pour les utilisateurs. Solution retenue : des messages d\'erreur génériques mais compréhensibles, sans donner trop d\'information (risque de sécurité).</p>',
            'case.si.collaboration': '<p><strong>Squad de 7 personnes :</strong> un product trio (PM + Lead Dev + Product Designer) + devs back-end + Scrum Master + QA.</p><p><strong>Rôle du designer dans la squad :</strong> animation des ateliers de brainstorm, focus design, ateliers discovery et challenge design.</p><p><strong>Alignement cross-squads :</strong> Le sign-in touchait plusieurs services (back-office, marketplace, help center) et donc plusieurs équipes. L\'alignement s\'est fait par des points de synchronisation entre squads. Le sujet était reconnu comme névralgique (porte d\'entrée des utilisateurs vers tous les services PrestaShop), ce qui a facilité la priorisation collective.</p><p><strong>Gestion des dépendances techniques :</strong> Il a fallu jongler avec les priorités de développement de chaque squad pour aligner les efforts sur un sujet transversal.</p>',
            'case.si.design_solution': '<p>Le flow est passé de <strong>5 étapes à 3 étapes</strong> :</p><ol class="case-list"><li>Création de compte (données essentielles uniquement + option "Sign up with Google" en premier)</li><li>Profil utilisateur (typologie : marchand, agence, freelance)</li><li>Arrivée sur le compte unifié</li></ol><p>Priorisation du SSO Google en position dominante dans l\'interface (bouton en haut, avant le formulaire classique). Éducation utilisateur intégrée au flow : faire comprendre qu\'un seul compte PrestaShop suffit pour tous les services.</p>',
            'case.si.outcome': '<p><strong>Tracking plan dédié</strong> mis en place pour mesurer le mode de connexion (credentials vs Google SSO).</p><ul class="case-list"><li><strong>Réduction de 50% des erreurs d\'authentification :</strong> 167k utilisateurs connectés avec seulement ~7k erreurs en moyenne (2024-2025) vs ~15k erreurs en moyenne (2023-2024). Source : Mixpanel.</li><li><strong>Réduction de 50% de la longueur du flow :</strong> de 5 étapes à 3 étapes pour la création de compte.</li><li><strong>Adoption croissante du SSO Google :</strong> visible sur le graph Mixpanel avec un croisement des courbes credentials/Google sur la période post-launch, montrant une migration progressive vers le SSO.</li><li><strong>Retombées indirectes :</strong> la réduction des erreurs d\'auth a libéré de la bande passante pour l\'équipe Account qui pouvait enfin se concentrer sur le développement de features.</li></ul>',

            // Store Association
            'case.sa.title':    'Store Association Flow',
            'case.sa.subtitle': 'Refonte du flux d\'association entre le compte utilisateur et la boutique, le rendant transparent et résistant aux erreurs.',
            'case.sa.metric1.value': '600+',
            'case.sa.metric1.label': 'associations réussies par jour',
            'case.sa.metric2.value': '~–40%',
            'case.sa.metric2.label': 'baisse estimée des abandons sur erreur',
            'case.sa.situation': '<p>Le processus d\'association de boutique, notamment pour les installations open-source, était une source majeure de confusion. Les marchands ne comprenaient pas pourquoi l\'association était nécessaire et abandonnaient le processus — surtout lorsque des erreurs survenaient.</p><p>L\'association existe car la plupart des utilisateurs ont des boutiques Open Source installées localement sur leur hébergement, pas toujours identifiées comme appartenant au compte propriétaire. L\'association crée ce lien.</p>',
            'case.sa.tasks':    '<ul class="case-list"><li>Recherche pour identifier les principaux points de friction et déclencheurs d\'abandon.</li><li>Refonte du flux pour ne demander que les informations nécessaires, avec des guidances claires et une correction d\'erreurs.</li><li>Modélisation du nouveau processus sur l\'expérience SaaS "Edition", offrant une association fluide pour les propriétaires de boutiques reconnus.</li><li>Prototypage du nouveau flux (incluant une vidéo de démonstration) et validation des améliorations avec les parties prenantes.</li></ul>',
            'case.sa.results':  '<ul class="case-list"><li>Amélioration majeure de la compréhension utilisateur et réduction de la frustration.</li><li>La majeure partie du trafic boutique passe désormais par la plateforme de paiement et l\'onboarding mis à jour.</li><li>Expérience unifiée avec le modèle SaaS "Edition" pour la cohérence.</li></ul>',

            // Opal DS Actions correctives (2026)
            'case.dsexec.title':    'Opal DS · Actions correctives',
            'case.dsexec.subtitle': 'Exécution du plan de remédiation du design system : reconstruction de 44 composants, application de 2 634 token bindings, et mise en place d\'un workflow dev-alignment qui accélère la livraison des features de 20 à 30%.',
            'case.dsexec.metric1.value': '92 → 2 634',
            'case.dsexec.metric1.label': 'token bindings appliqués',
            'case.dsexec.metric2.value': '9% → 100%',
            'case.dsexec.metric2.label': 'taux de conformité des composants',
            'case.dsexec.metric3.value': '44',
            'case.dsexec.metric3.label': 'composants reconstruits · 0 valeur en dur restante',
            'case.dsexec.execution':   '<p>Avec les findings de l\'audit comme feuille de route, j\'ai exécuté en 5 phases ordonnées : les bases (palette couleur, espacement, typographie, icônes, vocabulaire), puis la reconstruction composant par composant. 3 librairies d\'icônes consolidées en 1. Chaque valeur hexadécimale remplacée par une référence token.</p><p class="case-caption">Pour chaque refactor de composant : valeurs en dur → tokens sémantiques. Multiplié par 44 composants.</p>',
            'case.dsexec.automation':  '<p>L\'application des token bindings était la tâche à plus haut volume. Je l\'ai automatisée avec Claude Code et le MCP Figma (Model Context Protocol — permet aux agents IA de piloter Figma directement) : 1 755 bindings appliqués en une seule session, 45 000+ nœuds analysés, 879 corrections automatiques. Ce qui aurait pris des semaines a pris des heures.</p><p class="case-caption"><em>L\'automatisation ne remplace pas la revue — chaque binding a été vérifié. La vitesse sans gouvernance, ce n\'est qu\'une régression plus rapide.</em></p>',
            'case.dsexec.alignment':   '<p>Workflow dev-alignment en 4 étapes : <strong>Figma</strong> (design terminé, tokens appliqués) → <strong>doc Notion</strong> (états, variantes, props) → <strong>Storybook/Chromatic</strong> (implémentation revue par le designer) → <strong>ticket Linear fermé</strong>. Au 22 avril 2026 : 11 composants en revue dev — FButton, FTextfield, OpalSwitch, FChip, FDialog, et 6 autres.</p>',
            'case.dsexec.results':     '<p>44 composants reconstruits. 0 valeur en dur restante. 3 → 1 librairie d\'icônes. Gain estimé de +20–30% par cycle de feature. Le design system est passé d\'un système implicite et non documenté à une infrastructure structurée, scalable et alignée avec le dev.</p>',

            // Plugin Figma
            'case.plugin.title':    'Plugin Figma — Local Components Collector',
            'case.plugin.subtitle': 'Un plugin JavaScript construit avec la Figma Plugin API pour automatiser l\'audit des composants locaux — réduisant le temps d\'audit DS de plusieurs jours à quelques heures.',
            'case.plugin.metric1.value': 'jours → heures',
            'case.plugin.metric1.label': 'réduction du temps d\'audit DS',
            'case.plugin.metric2.value': '0',
            'case.plugin.metric2.label': 'navigation manuelle fichier par fichier',
            'case.plugin.metric3.value': 'Solo',
            'case.plugin.metric3.label': 'livré sans ressource engineering',
            'case.plugin.problem':   '<p>Sans outil dédié, identifier les composants locaux non factorisés dans un fichier Figma est entièrement manuel : ouvrir chaque frame, inspecter chaque élément, noter les doublons. Aucune vue consolidée n\'existe nativement. Cela retarde directement les travaux de factorisation et fait croître silencieusement la dette design.</p>',
            'case.plugin.approach':  '<p>J\'ai identifié le besoin via une friction personnelle lors d\'un audit DS chez Oplit. Plutôt que d\'attendre une solution engineering, j\'ai construit l\'outil moi-même. J\'ai défini les critères d\'un "candidat à la factorisation" : fréquence d\'usage, présence de variantes, complexité visuelle et structurelle.</p>',
            'case.plugin.howworks': '<p>Le plugin est écrit en JavaScript avec la Figma Plugin API. Il crawle tous les nœuds du fichier courant, détecte les composants locaux (hors librairie partagée), et génère un rapport structuré : nom du composant, nombre d\'usages, frame parente, score de priorité. Le rapport s\'affiche directement dans le panel du plugin — sans export nécessaire.</p>',
            'case.plugin.impact':    '<p>Temps d\'audit DS réduit de plusieurs jours à quelques heures. Les candidats à la factorisation sont identifiés objectivement. Le plugin est la preuve qu\'un designer senior peut créer de la valeur outillage sans attendre la capacité engineering.</p>',

            // Opal DS Audit (2025)
            'case.dsaudit.title':    'Opal DS · Audit',
            'case.dsaudit.subtitle': 'Audit systématique du design system Opal — findings gradués contre quatre frameworks de référence, et plan de remédiation en 3 horizons que j\'ai exécuté dans les mois suivants.',
            'case.dsaudit.metric1.value': '3 niveaux',
            'case.dsaudit.metric1.label': 'sévérité CRITICAL / WARNING / INFO',
            'case.dsaudit.metric2.value': '3 horizons',
            'case.dsaudit.metric2.label': 'plan Immédiat / Prochain / Futur',
            'case.dsaudit.metric3.value': '4 frameworks',
            'case.dsaudit.metric3.label': 'Atomic Design · BEM · DTCG · WCAG 2.1 AA',
            'case.dsaudit.situation':    '<p>Design et code ne se parlaient pas. Le même bouton apparaissait en 5 variantes différentes selon la page. Aucune documentation partagée n\'existait. Les règles vivaient dans les têtes. Chaque nouveau développeur devait reconstruire le système par rétro-ingénierie à partir de la production.</p>',
            'case.dsaudit.methodology':  '<p>J\'ai construit un protocole d\'audit custom via le MCP Figma (Model Context Protocol) : lecture systématique de chaque composant dans la librairie, évalué contre 4 frameworks — Atomic Design (structure), BEM (nommage), DTCG (Design Tokens Community Group, standard d\'architecture de tokens), WCAG 2.1 AA (accessibilité). Chaque finding était gradué : CRITICAL (bloque l\'usage correct), WARNING (incohérence, risque de dette), INFO (opportunité d\'amélioration).</p>',
            'case.dsaudit.findings':     '<p><strong>Button — NON-COMPLIANT :</strong> valeurs hex dans les propriétés shadow, collision de la prop "Type" avec un mot-clé réservé, conflits de chemin de tokens. <strong>Foundations — NEEDS WORK :</strong> conventions de nommage forkées, 3 noms différents pour la même primitive d\'opacité. Rapport structuré par sévérité avec 3 horizons : Immédiat (blocages), Prochain (prochain sprint), Futur (backlog).</p>',
            'case.dsaudit.plan':         '<p>Plan de remédiation en 5 étapes : 1. Audit → 2. Bases (tokens couleur, espacement, typographie, icônes, vocabulaire) → 3. Composants (reconstruits un par un) → 4. Alignement dev (Storybook, workflow de revue) → 5. Déploiement. Critères d\'entrée/sortie explicites à chaque étape.</p>',

            // Transfert de charge entre secteurs
            'case.transfer.title':    'Transfert de charge entre secteurs',
            'case.transfer.subtitle': 'De 8 étapes manuelles dans Excel à 1 action avec feedback en temps réel — permettant à un grand constructeur automobile de débloquer le déploiement multi-sites.',
            'case.transfer.metric1.value': 'Déployé',
            'case.transfer.metric1.label': 'feature live et adoptée',
            'case.transfer.metric2.value': 'Hebdo',
            'case.transfer.metric2.label': 'utilisation régulière depuis le lancement (Mixpanel)',
            'case.transfer.metric3.value': '10+ sites',
            'case.transfer.metric3.label': 'déploiement multi-sites débloqué',
            'case.transfer.metric4.value': '3,5 mois',
            'case.transfer.metric4.label': 'du cadrage à la production avec une équipe de 3',
            'case.transfer.situation': '<p>Oplit est un SaaS de planification industrielle (Industrie 4.0) utilisé par des industriels de l\'aéronautique, de l\'horlogerie de luxe et de l\'automobile. Le module de planification permet aux ordonnanceurs de gérer la demande, la capacité, les stocks et l\'ordonnancement sur leurs lignes de production (postes de charge / machines).</p><p><strong>Le problème métier :</strong> quand une machine est en surcharge (taux de charge > 100%), l\'ordonnanceur doit transférer de la demande de production vers une autre machine. Avant Oplit, ce processus était entièrement manuel : calculs dans Excel, identification des machines disponibles par connaissance personnelle, ajustement des projections de stock à la main, aucune traçabilité, aucun retour en arrière possible.</p><p><strong>Le processus manuel en 8 étapes</strong> (documenté en session avec le client) :</p><ol class="case-list"><li>Dans l\'onglet fabrication, essayer d\'augmenter la capacité → toujours en surcharge</li><li>Équilibrer la charge à la capacité → taux de charge 100%</li><li>Dans l\'onglet stock, vérifier l\'impact → stock négatif</li><li>Calculer le nombre de pièces à transférer (écart demande vs objectif de production, ex. 300k pièces)</li><li>Identifier les références transférables pour atteindre le volume cible</li><li>Effectuer plusieurs événements de transfert (référence A, puis B...)</li><li>Sur le secteur d\'origine : vérifier la mise à jour du stock projeté</li><li>Sur le secteur de destination : ajuster manuellement l\'objectif de stock</li></ol><p><strong>Le client :</strong> un grand constructeur automobile opérant sur plusieurs sites de production. Le succès de cette feature conditionne le déploiement d\'Oplit sur 10+ sites supplémentaires — un enjeu business direct, pas seulement un problème UX.</p><p><strong>Le déclencheur :</strong> le client ne pouvait pas avancer sur le déploiement multi-sites sans cette feature. C\'est la convergence d\'un besoin utilisateur critique et d\'un enjeu commercial (rétention + expansion).</p>',
            'case.transfer.research_discovery': '<p><strong>Co-création avec le client sur 5-6 sessions itératives :</strong></p><ul class="case-list"><li>Observations à distance (partage d\'écran) du workflow réel de l\'ordonnanceur</li><li>Cartographie des workarounds : fichiers Excel, calculs manuels, mémoire</li><li>Documentation du processus manuel en 8 étapes (documenté en session)</li><li>Présentation de propositions de hiérarchie d\'information et de designs d\'interface</li><li>Itérations successives jusqu\'au design final</li><li>Le client a partagé son comportement réel, ses workarounds d\'outils et le temps passé</li></ul><p><strong>Framework FOCUSED</strong> utilisé pour structurer la discovery :</p><ul class="case-list"><li><strong>Frame :</strong> métriques de succès quantifiées (aucune rupture de stock, taux de charge optimal, business = GTM en Make to Stock + deals signés, client fermé grâce au module)</li><li><strong>Observe :</strong> First Use Case — « Je suis le responsable planning, je fais mon exercice hebdomadaire charge/capacité, ce qui compte c\'est donner des objectifs de production basés sur la stratégie, mais les machines sont surchargées et le processus d\'optimisation est manuel, pénible et long »</li><li><strong>Claim :</strong> « Transférez votre charge en 3 clics, visualisez l\'impact en temps réel, gardez le contrôle total avec une annulation en un clic. Plus de ruptures de stock fictives et de calculs Excel. »</li><li><strong>Unfold :</strong> 5 touchpoints clés (page stock → vue secteur → transférer la demande → voir l\'impact immédiat → ajuster si nécessaire)</li><li><strong>Steal :</strong> Benchmarks — Notion (backlinks bidirectionnels), GitHub (reverts de PR avec restauration automatique), Figma (distinction instances/master), Stripe (transactions liées avec tags distincts)</li><li><strong>Execute :</strong> happy path + sad path + 4 hypothèses à valider</li><li><strong>Decide :</strong> Go/No-Go structuré avec Product, Tech, Sales, Ops</li></ul><p><strong>Découverte critique pendant le projet :</strong> le vocabulaire du client ne correspondait pas au nôtre. Ce qu\'Oplit appelait « charge », le client appelait « demande ». Ce qu\'Oplit appelait « objectif de production », le client appelait « capacité ». Ce malentendu a été identifié pendant les sessions de test et a nécessité un ajustement du wording de l\'interface.</p><p><strong>Hypothèses à valider :</strong></p><ol class="case-list"><li>Les utilisateurs comprennent instantanément le système de double ligne (émission + réception) → testé en session avec le client</li><li>Les ajustements automatiques sont préférés à la saisie manuelle → suivi du ratio auto vs manuel via Mixpanel</li><li>L\'annulation de transfert est découvrable et utilisée au bon moment → taux d\'utilisation + délai entre création et annulation</li><li>La cohérence globale des stocks est immédiatement comprise → monitoring des tickets support « le stock a disparu »</li></ol>',
            'case.transfer.decisions': '<p><strong>Contrainte structurelle :</strong> 1 seul développeur sur le projet. Chaque décision de design devait passer le filtre « est-ce buildable dans ce cycle ? » (fin 2025 → mi-mars 2026).</p><p><strong>Ce qui a été retenu et pourquoi :</strong></p><ul class="case-list"><li><strong>Transfert manuel avec suggestions pré-calculées :</strong> l\'ordonnanceur reste aux commandes. Ne pas automatiser ce que l\'utilisateur a besoin de comprendre — la confiance vient de la transparence, pas d\'une automatisation en boîte noire.</li><li><strong>Système de double ligne (émission + réception) :</strong> inspiré de Notion (backlinks), GitHub (reverts de PR), Stripe (transactions liées). Lors d\'un transfert du Secteur 1 vers le Secteur 2, deux lignes apparaissent : une ligne d\'émission sur le Secteur 1 (avec tag « Transfert partiel » ou « Transfert complet ») et une ligne de réception sur le Secteur 2 (avec tag « Transfert reçu »). Les deux sont liées par un lien bidirectionnel cliquable.</li><li><strong>Annulation en un clic :</strong> depuis la ligne de réception. Restauration automatique du stock à l\'état initial. C\'était la demande n°1 du client — impossible d\'annuler un transfert dans la version précédente.</li><li><strong>Tags visuels (Partiel/Complet/Reçu) :</strong> feedback immédiat sur le statut du transfert sans ouvrir les détails.</li></ul><p><strong>Ce qui a été coupé du scope V1 :</strong></p><ul class="case-list"><li><strong>Optimisation automatique des routes :</strong> trop complexe techniquement pour 1 dev et un cycle court. Aurait nécessité un traitement lourd du fichier de charge du client.</li><li><strong>Suggestions de routes alternatives :</strong> même raison — trop de travail technique pour un cycle de dev soutenable.</li><li><strong>Taux de charge projeté sur le secteur de destination :</strong> coupé pour la V1, ajouté au backlog V2. Le taux de charge actuel est affiché dans la modale de transfert (ex. « Taux de charge actuel : 15% ») mais pas la projection après réception.</li></ul><p><strong>Modale de transfert :</strong></p><ul class="case-list"><li>Informations pré-remplies : période, opération, secteur d\'origine (verrouillé, non modifiable)</li><li>Charge à transférer : quantité ajustable manuellement avec indication du total (ex. « 45 /90 »)</li><li>Secteur de destination : dropdown avec affichage du taux de charge actuel</li><li>L\'ordonnanceur voit les deux taux de charge (origine et destination) dans la même modale — décision éclairée sans changer de vue</li></ul><p><strong>Edge cases traités :</strong></p><ul class="case-list"><li>Tentative de transférer plus que le stock disponible → message d\'erreur + blocage</li><li>Tentative de modifier la ligne de réception → dropdown désactivé + tooltip explicatif</li><li>Multi-sélection + transfert → CTA « Transférer la charge » grisé (non compatible en V1)</li><li>Annulation d\'un transfert où la production a démarré → blocage + message explicatif</li></ul>',
            'case.transfer.collaboration': '<p><strong>Équipe :</strong> trio Produit (PM + Product Designer + 1 Dev).</p><p><strong>5-6 sessions de co-création avec le client :</strong> format itératif — présentation de réflexions métier et de propositions d\'interface, retours du client sur son workflow réel et ses workarounds, ajustements.</p><p><strong>Livrables design :</strong></p><ul class="case-list"><li>Figma : specs annotées + prototype interactif</li><li>Linear : spec fonctionnelle avec contexte, critères de succès (court/moyen/long terme), lien Figma, delta par rapport à l\'existant, specs détaillées, critères d\'acceptation et trackers Mixpanel</li></ul><p><strong>Participants aux tests :</strong> l\'ordonnanceur du client en sessions de test sur staging avant le déploiement en production. Ajustements post-test (terminologie, patterns d\'interaction).</p><p><strong>Gestion de la contrainte d\'équipe :</strong> avec 1 seul dev, le designer (moi) devait fournir des specs exhaustives dès le premier handoff pour minimiser les allers-retours. Les specs Linear incluaient systématiquement les edge cases et sad paths.</p>',
            'case.transfer.design_solution': '<p><strong>Le flow utilisateur final (Happy Path) :</strong></p><ol class="case-list"><li>L\'ordonnanceur identifie un secteur en surcharge — « Secteur 1 » affiche un badge rouge « Taux de charge : 200% » + une alerte « Stock min : 1 rupture »</li><li>Il clique sur le dropdown de la référence à transférer (ex. « Nervures-10 »)</li><li>Il sélectionne « Transférer la charge »</li><li>La modale s\'ouvre avec les informations pré-remplies (période, opération, secteur d\'origine verrouillé)</li><li>Il sélectionne la destination (ex. « Secteur 2 ») → le taux de charge actuel s\'affiche (ex. « 15% »)</li><li>Il choisit la quantité à transférer (ex. 45 sur 90 pièces)</li><li>Il valide</li><li>Résultat immédiat — Sur le Secteur 1 : la référence affiche un tag « Transfert partiel » avec une sous-ligne « Vers Secteur 2 ↗ » et l\'objectif de production ajusté (de 90 à 45, avec indication de l\'original). Sur le Secteur 2 : la référence apparaît avec un tag « Transfert reçu » et une sous-ligne « Depuis Secteur 1 ↗ ». Le graphique d\'évolution du stock affiche des barres hachurées pour l\'objectif transféré. Une nouvelle ligne « Obj. prod. transféré » apparaît dans le tableau de détail.</li><li>L\'ordonnanceur peut annuler le transfert en un clic depuis la ligne de réception</li><li>Il peut itérer : faire plusieurs transferts successifs jusqu\'à l\'équilibre optimal</li></ol>',
            'case.transfer.outcome': '<p><strong>Feature adoptée et utilisée chaque semaine</strong> depuis le déploiement (suivi via Mixpanel).</p><ul class="case-list"><li><strong>Déploiement multi-sites débloqué :</strong> le client a validé le module et lance le déploiement sur 10+ sites de production supplémentaires. C\'est l\'impact business le plus significatif — la feature conditionnait directement l\'expansion du contrat.</li><li><strong>Processus manuel éliminé :</strong> de 8 étapes manuelles avec Excel à 1 action avec feedback visuel immédiat, traçabilité complète (origine, destination, quantité, liens bidirectionnels) et annulation en un clic.</li><li><strong>Confiance utilisateur établie :</strong> l\'ordonnanceur peut maintenant voir exactement ce qu\'il a transféré, d\'où, vers où, et annuler si nécessaire. La traçabilité résout le problème initial « je ne sais pas si j\'ai déjà fait un transfert ou non ».</li><li><strong>Délai de livraison :</strong> ~3,5 mois du cadrage à la production (fin 2025 → mi-mars 2026) avec une équipe de 3 personnes (PM + Designer + 1 Dev).</li></ul><blockquote><p>« Les options qu\'on a demandées, elles fonctionnent. On a franchi un vrai cap. Je n\'ai plus de bloqueurs pour avancer sur le déploiement des autres sites. »</p><p>— Responsable planification de production, après le déploiement</p></blockquote>',

            // Multi-sélection & Sticky Action Bar (fusionnés)
            'case.multi.title':    'Multi-sélection & Sticky Action Bar',
            'case.multi.subtitle': 'Un pattern couplé — la multi-sélection déclenche une sticky action bar — pour qu\'un planificateur puisse modifier 50 ordres de fabrication en un clic plutôt qu\'en cinquante. Même comportement en vue cards et en Gantt.',
            'case.multi.metric1.value': '2 250',
            'case.multi.metric1.label': 'actions groupées sur les 30 premiers jours (Mixpanel)',
            'case.multi.metric2.value': '4 vues',
            'case.multi.metric2.label': 'comportement cohérent en cards & Gantt',
            'case.multi.metric3.value': '~7 jours',
            'case.multi.metric3.label': 'de design / 4 mois jusqu\'à la production',
            'case.multi.metric4.value': '50-100',
            'case.multi.metric4.label': 'min/semaine économisées par planificateur (estimé)',
            'case.multi.context': '<p>Oplit est un SaaS de planification industrielle (Industrie 4.0) utilisé par 12 entreprises (aéronautique, horlogerie de luxe, ingénierie de précision), avec 3 à 5 utilisateurs par client. Les utilisateurs sont des ordonnanceurs et chefs d\'atelier qui gèrent quotidiennement des dizaines d\'opérations de fabrication réparties sur plusieurs jours, postes de charge et ordres de fabrication (OF).</p><p>Le produit proposait 4 vues de travail principales : vue OF, vue En-cours (cartes), vue Suivi d\'avancement en cartes et en Gantt.</p><p><strong>Le problème :</strong> aucune multi-sélection possible. Chaque action (taguer, prioriser, changer un statut, déplacer) devait être faite opération par opération. Pour taguer 5 opérations : 5× (clic OP → clic tag → valider) = 2-3 minutes. Pour prioriser un OF de 16 opérations : 16× (ouvrir OP → modifier priorité → valider) = 5-10 minutes.</p><p><strong>Impact métier :</strong> 5 à 15 minutes perdues par jour par utilisateur, frustration sur des actions bloquantes dans le workflow quotidien, risque d\'erreurs et d\'oublis.</p><p><strong>Gap marché :</strong> la multi-sélection est un standard dans tous les outils de gestion (Shopify, Jira, etc.). Son absence dans Oplit générait une frustration forte car les utilisateurs avaient cette habitude dans leurs autres outils.</p><p><strong>Verbatims clients :</strong></p><ul class="case-list"><li>« Je veux pouvoir sélectionner 5 opérations sur lundi, mardi et mercredi, et leur mettre le tag \'Urgent\' en 1 clic au lieu de le faire opération par opération. »</li><li>« Quand un OF devient prioritaire, je veux pouvoir le prioriser pour tous les ateliers sans ouvrir chaque opération une par une. »</li><li>« J\'ai besoin de déplacer un OF complet (16 opérations) vers un autre poste de charge sans faire 16 fois la même action. »</li></ul>',
            'case.multi.research_discovery': '<p><strong>Sources multiples convergentes :</strong></p><ul class="case-list"><li>Demandes clients récurrentes remontées par les OPS lors du suivi hebdomadaire</li><li>Interviews utilisateurs pour identifier les comportements et les patterns d\'usage</li><li>Observations à distance (partage d\'écran) avec 2 clients pour voir le comportement en situation réelle</li></ul><p><strong>Framework FOCUSED</strong> utilisé pour structurer la discovery :</p><ul class="case-list"><li><strong>Frame :</strong> définir l\'ambition avec des success metrics chiffrés</li><li><strong>Observe :</strong> identifier le First Use Case (FUC) et les use cases secondaires</li><li><strong>Claim :</strong> positionnement narratif (« comment je pitch ma feature »)</li><li><strong>Unfold :</strong> 5 touchpoints clés de l\'expérience</li><li><strong>Steal :</strong> benchmark et golden nuggets</li><li><strong>Execute :</strong> design avec happy path et sad path</li><li><strong>Decide :</strong> Go/No-Go avec Produit, Tech, Sales, Ops</li></ul><p><strong>First Use Case identifié :</strong> « En tant qu\'ordonnanceur, lorsque je veux appliquer des tags, priorités ou statuts sur plusieurs opérations en une seule action, ce qui compte le plus pour moi c\'est de pouvoir faire l\'action rapidement (moins de 30 secondes), de manière cohérente, et de rester dans la vue où je travaille. »</p><p><strong>Benchmark :</strong> Shopify, Miro, Kajabi, Circle, Jira. Pattern récurrent identifié : sticky bar lors de sélection, compteur visible « X éléments sélectionnés », modal de confirmation pour actions à impact.</p>',
            'case.multi.decisions': '<p><strong>Sticky bar vs autres patterns :</strong></p><ul class="case-list"><li><strong>Menu contextuel au clic droit :</strong> écarté — pas assez visible pour des utilisateurs avec une faible connaissance de l\'outil.</li><li><strong>Toolbar persistante en haut :</strong> écarté — l\'interface avait déjà des menus latéraux et une UI complexe — ajouter un élément en haut réduisait la visibilité du contenu.</li><li><strong>Sticky bar en bas (retenue) :</strong> conserve une visibilité d\'interface élevée sur tableau et liste de cartes, et permet des actions rapides accessibles même pour des utilisateurs peu familiers.</li></ul><p><strong>Choix des 4 quick actions (Tags, Priorité, Statut, Date) :</strong> identifiés par croisement des interviews, observations terrain, et validés post-déploiement par les trackers Mixpanel. Critère de sélection : actions nécessaires pour agir rapidement sur des opérations en production. Les actions secondaires (modification du poste de charge, batch, figer) sont dans le menu « … » — moins fréquentes ou réalisées dans des moments plus calmes.</p><p><strong>Variante « capacity-aware » :</strong> disponible uniquement en vue Gantt pour certains clients. Lorsqu\'un utilisateur déplace une opération sur un poste de charge, le système vérifie que le poste a la capacité suffisante. Si non, l\'opération est déplacée au jour suivant ou étalée dans le temps.</p><p><strong>Cohérence cross-vues :</strong> même comportement de multi-select sur la vue Cartes et la vue Gantt, malgré des structures visuelles très différentes. Décision motivée par le contexte utilisateur : ce sont des personnes en production, parfois soumises au stress d\'un environnement sonore et de sollicitations multiples. Ils doivent pouvoir prendre des actions rapides, éclairées et faciles sans réapprendre un pattern d\'une vue à l\'autre. Cependant, les informations affichées dans la sticky bar et les actions disponibles varient selon la vue.</p><p><strong>Edge cases traités :</strong></p><ul class="case-list"><li>Sélection + recherche : la sélection persiste pendant la recherche</li><li>Switch entre vue Gantt et liste dans le même contexte : sélection maintenue</li><li>Switch de contexte (ex : En-cours → OF) : dé-sélection car changement de cas d\'usage</li><li>Refresh page : sélection perdue (choix technique assumé)</li><li>Actions sur statuts incompatibles : warning avec confirmation</li><li>Pas de limite de sélection (validé avec la tech)</li></ul>',
            'case.multi.collaboration': '<p><strong>Specs en double support :</strong> Figma annotées (design specs) + document Linear (spec fonctionnel pour le handoff design→tech).</p><p><strong>Structure du document Linear :</strong> contexte, critères de réussite à court/moyen/long terme, lien Figma, delta par rapport à l\'état actuel, specs détaillées par composant, acceptance criteria, et trackers Mixpanel souhaités.</p><p><strong>Prototype interactif</strong> livré via Figma pour permettre à la tech et aux stakeholders de tester le flow avant développement.</p><p><strong>Go/No-Go structuré</strong> avec 4 parties : Produit, Tech, Sales, Ops.</p>',
            'case.multi.design_solution': '<p>La sticky bar a une <strong>hiérarchie à 2 niveaux</strong> :</p><ul class="case-list"><li><strong>Niveau 1 — Informations :</strong> checkbox tout sélectionner, compteur, nb pièces, nb heures, bouton fermer.</li><li><strong>Niveau 2 — Actions :</strong> 4 boutons directs + dropdown « … » pour les actions secondaires.</li></ul><p>Checkbox au hover sur chaque carte OP, toujours visible en mode tactile (44×44px). État sélectionné : border bleu 2px + fond bleu pâle. Persistance de la sticky bar entre les actions (ne se ferme que manuellement).</p>',
            'case.multi.outcome': '<p><strong>Tracking plan Mixpanel</strong> mis en place dès le déploiement pour tracer : quelles actions sont faites en multi-select, par quels utilisateurs, dans quel volume.</p><ul class="case-list"><li><strong>2 250 actions en multi-select sur les 30 premiers jours</strong> (source : Mixpanel). Répartition par type d\'action et par client visible sur le dashboard.</li><li><strong>Actions les plus utilisées :</strong> modification de secteur (poste de charge) et priorités en tête, suivi par les tags et les statuts.</li><li><strong>Adoption :</strong> tous les clients ayant accès à la fonctionnalité l\'utilisent au quotidien.</li><li><strong>Gain de temps estimé :</strong> une centaine d\'opérations traitées par semaine par planificateur, passant de 30s-1min par opération (individuel) à quelques secondes par batch. Soit potentiellement 50 à 100 minutes/semaine économisées par planificateur.</li><li><strong>Temps de réalisation :</strong> ~7 jours de travail design, 4 mois du cadrage au déploiement en production (incluant design, staging, démo, prod, et retours/corrections).</li></ul>',
        }
    };

    // Detect browser language as fallback when no preference is stored.
    const browserLang = (navigator.language || navigator.userLanguage || 'en')
        .toLowerCase().startsWith('fr') ? 'fr' : 'en';
    let currentLang = localStorage.getItem('folio-lang') || browserLang;

    function setLang(lang) {
        if (!TRANSLATIONS[lang]) return;
        currentLang = lang;
        localStorage.setItem('folio-lang', lang);
        document.documentElement.lang = lang === 'fr' ? 'fr-FR' : 'en';

        // Update textContent elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key  = el.dataset.i18n;
            const text = TRANSLATIONS[lang][key];
            if (text !== undefined) el.textContent = text;
        });

        // Update innerHTML elements
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key  = el.dataset.i18nHtml;
            const html = TRANSLATIONS[lang][key];
            if (html !== undefined) el.innerHTML = html;
        });

        // Sync lang button active state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const isActive = btn.dataset.lang === lang;
            btn.classList.toggle('active', isActive);
            if (isActive) btn.setAttribute('aria-current', 'true');
            else btn.removeAttribute('aria-current');
        });

        // Refresh minimap idle caption cache so future hovers/resets use the new locale.
        const mc = document.getElementById('minimap-caption');
        if (mc) mc.dataset.idle = mc.textContent;
    }

    // Initialise language on load
    setLang(currentLang);

    // Lang button click handlers
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });

})();
