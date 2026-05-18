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
            'case.ca.metric1.label': 'accounts unified into a single customer account',
            'case.ca.metric2.value': '0',
            'case.ca.metric2.label': 'support requests needed for basic account updates',
            'case.ca.situation': '<p>PrestaShop users struggled to manage their interactions due to three separate accounts: Back Office for shop management, Marketplace account for module purchases, and User account for business care subscription invoices.</p><p>These fragmented systems created confusion, inconsistency, and inefficiency. Basic actions like updating emails or passwords required users to contact technical support, leading to unnecessary delays.</p>',
            'case.ca.tasks':    '<ul class="case-list"><li>Led exploratory user research, competitive benchmarking, and co-creation workshops to pinpoint pain points and user needs.</li><li>Oversaw the consolidation of disparate user databases into a single source of truth.</li><li>Redesigned the UI to clearly distinguish personal and business information.</li><li>Prioritized must-have features: self-service for updates, account deletion, and unified billing management.</li><li>Streamlined onboarding by encouraging Google account creation to reduce friction.</li></ul>',
            'case.ca.results':  '<ul class="case-list"><li>Full user autonomy over data, eliminating dependency on support for updates.</li><li>Data consistently synchronized across all PrestaShop services.</li><li>Increased user satisfaction through positive feedback.</li><li>Streamlined processes for billing and account management.</li></ul>',

            // Sign in/up
            'case.si.title':    'Sign in / Sign up Flow',
            'case.si.subtitle': 'Cutting authentication errors in half by redesigning sign-in across the entire PrestaShop ecosystem (back office, marketplace, help center).',
            'case.si.metric1.value': '-50%',
            'case.si.metric1.label': 'authentication errors (7k avg vs 15k before)',
            'case.si.metric2.value': '-50%',
            'case.si.metric2.label': 'flow length reduction',
            'case.si.metric3.value': '50%',
            'case.si.metric3.label': 'of logins via Google SSO within 6 months',
            'case.si.situation': '<p>PrestaShop users faced multiple points of authentication (product, marketplace, help center, back office), with no consistent flows or shared data. The lack of synchronization between databases resulted in duplicate accounts and authentication failures.</p><p>Until recently, there were 2 connection modes (SSO &amp; Connection by ID). The objective was twofold: increase SSO registrations &amp; connections, and make users understand they only need one PrestaShop account.</p>',
            'case.si.tasks':    '<ul class="case-list"><li>Conducted an in-depth audit of existing workflows, identifying sources of confusion and friction.</li><li>Mapped and consolidated all user data sources to a single database.</li><li>Completely redesigned authentication screens and flows to educate users on the "single account for all PrestaShop" model.</li><li>Prioritized SSO integration and shortened onboarding to three key steps.</li><li>Introduced clear error messaging and education around the new account structure.</li></ul>',
            'case.si.results':  '<ul class="case-list"><li>One unified interface across the product for account creation and connection.</li><li>Support requests related to authentication dropped significantly.</li><li>Users responded positively to the new, simplified experience.</li></ul>',

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
            'case.transfer.subtitle': 'A capacity-transfer feature that lets schedulers reallocate production across workshops in seconds — backed by structured documentation and a demo grounded in a real customer.',
            'case.transfer.metric1.value': 'Multi-site',
            'case.transfer.metric1.label': 'shipped in the Stock module · industrial scope',
            'case.transfer.metric2.value': '7-step spec',
            'case.transfer.metric2.label': 'FOCUSED docs framework + Linear specs',
            'case.transfer.metric3.value': '9+ interviews',
            'case.transfer.metric3.label': 'demo grounded in real customer research',
            'case.transfer.context':  '<p>In multi-site or multi-sector industrial environments, schedulers routinely reallocate production capacity from one workshop to another to absorb overloads or optimize resource use. The platform offered no native mechanism to model and track these capacity transfers — users compensated with Excel exports and manual workarounds.</p>',
            'case.transfer.problem':  '<p>Schedulers couldn\'t visualize the impact of a capacity transfer on both sectors involved simultaneously, nor trace the decisions made. On the commercial side, the feature was hard to demonstrate without a scenario anchored in real industrial reality.</p>',
            'case.transfer.approach': '<ul class="case-list"><li>Feature documentation written using the <strong>FOCUSED framework</strong> — a 7-step spec template (Framework, Outcome, Context, Users, Scope, Edge cases, Done) — in Notion.</li><li>Business rules and UI behaviors specified in Linear ("when X → then Y" format).</li><li>Demo script and design anchored in a <strong>real user persona</strong> — a senior scheduler in the automotive equipment sector — drawn from actual customer research, not a hypothetical profile.</li><li>Demo script designed as a narrative scenario → 3 distinct moments of value → key interactions to demonstrate (rather than an exhaustive walkthrough).</li><li>Alignment with the commercial team on product storytelling.</li></ul><p><strong>Key decisions:</strong> ground the demo in a real user persona drawn from customer research; structure the narrative around 3 distinct moments of value rather than an exhaustive feature walkthrough.</p>',
            'case.transfer.impact':   '<ul class="case-list"><li><strong>Major customer-side impact:</strong> significant reduction in information processing time for schedulers, and a clear, precise visualization of capacity transfers across both sectors involved — where there was no native view before.</li><li>Complete, structured product documentation — directly usable by developers and support.</li><li>Demo script reusable by the commercial team without additional preparation.</li><li>Feature positioned as differentiating in the Stock module during sales cycles.</li></ul>',
            'case.transfer.reflection': '<p>A designer who understands go-to-market can multiply a feature\'s impact well beyond the product team. Grounding the demo in a real user persona — drawn from customer research, not a hypothetical profile — makes the storytelling honest and the value claims defendable.</p><p>What I\'d carry into the next feature: anchor the spec in real workflows from day one, write the demo script before the UI is final, and treat sales enablement as part of the design output, not a downstream artifact.</p>',

            // Multi-select & Sticky Action Bar (merged)
            'case.multi.title':    'Multi-select & Sticky Action Bar',
            'case.multi.subtitle': 'One coupled pattern — multi-select triggers a sticky action bar — so schedulers can update 50 work orders in one click instead of fifty. Same behavior across cards and Gantt views.',
            'case.multi.metric1.value': '2 views',
            'case.multi.metric1.label': 'consistent behavior across cards & Gantt',
            'case.multi.metric2.value': '4 quick actions',
            'case.multi.metric2.label': 'Tags · Priority · Status · Date · "…" for secondary',
            'case.multi.metric3.value': '2 variants',
            'case.multi.metric3.label': 'standard + capacity-aware sticky bar',
            'case.multi.problem':    '<p>Schedulers handle hundreds of work orders daily. Modifying 50 work orders one by one — changing a tag, updating a status, rescheduling a batch — was standard practice with no grouped-action support. Two related design problems sit underneath: how do users select multiple items consistently across very different views (cards, Gantt) — and once selected, how does the action surface look and behave so the most common operations are one click away without blocking the data?</p>',
            'case.multi.trigger':    '<p>Multi-select was designed as a transversal pattern, not a view-specific feature. In the progress-tracking cards view ("Suivi d\'avancement"): select-all per work center, select across multiple days, and select across multiple work centers unitarily. In the Gantt view: same selection model, same shortcuts. The state matrix covers (none / partial / all) × (available actions) × (locked work orders in selection) — so undefined states never reach production and the Linear spec is self-sufficient.</p>',
            'case.multi.surface':    '<p>The sticky action bar is the visible counterpart of the selection. It anchors to the viewport with a clear two-row hierarchy:</p><ul class="case-list"><li><strong>Top row:</strong> select/unselect-all toggle, selection summary ("7 items selected · xxx parts · xxx hours"), close.</li><li><strong>Bottom row:</strong> 4 quick daily actions (Tags, Priority, Status, Date), a "…" menu for secondary actions (Change work center, Batch, Lock) that surface dynamically when space allows, and navigation arrows to move through the selection.</li></ul><p>A second variant adds a "Respect available capacity" toggle on top — used when the bulk action would impact load on the work centers.</p>',
            'case.multi.details':    '<p>Key behaviors: the bar is movable so it never blocks data the user needs to read; secondary actions appear inline when there\'s space and collapse into the "…" menu otherwise; loading states are explicit while bulk actions are processing; integrations stay consistent across cards and Gantt.</p>',
            'case.multi.impact':     '<p>Common daily actions reachable in one click from any selection state. Status updates are noticeably more visible than before. The pattern is reusable across the product because the trigger and the surface ship and evolve together — not as two disconnected features.</p>',
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
            'case.ca.metric1.label': 'comptes unifiés en un seul compte client',
            'case.ca.metric2.value': '0',
            'case.ca.metric2.label': 'demandes au support pour les mises à jour basiques',
            'case.ca.situation': '<p>Les utilisateurs PrestaShop peinaient à gérer leurs interactions en raison de trois comptes séparés : Back Office pour la gestion de la boutique, compte Marketplace pour les achats de modules, et compte utilisateur pour les factures d\'abonnement Business Care.</p><p>Ces systèmes fragmentés créaient de la confusion, de l\'incohérence et de l\'inefficacité. Des actions basiques comme la mise à jour d\'un email ou d\'un mot de passe nécessitaient de contacter le support technique, entraînant des délais inutiles.</p>',
            'case.ca.tasks':    '<ul class="case-list"><li>Pilotage de la recherche utilisateur exploratoire, du benchmarking concurrentiel et d\'ateliers de co-création pour identifier les points de friction et les besoins.</li><li>Supervision de la consolidation des bases de données utilisateurs disparates en une source unique de vérité.</li><li>Refonte de l\'UI pour distinguer clairement les informations personnelles et professionnelles.</li><li>Priorisation des fonctionnalités essentielles : autonomie pour les mises à jour, suppression de compte et gestion unifiée de la facturation.</li><li>Simplification de l\'onboarding en encourageant la création de compte Google pour réduire les frictions.</li></ul>',
            'case.ca.results':  '<ul class="case-list"><li>Pleine autonomie des utilisateurs sur leurs données, éliminant la dépendance au support pour les mises à jour.</li><li>Données synchronisées de manière cohérente sur tous les services PrestaShop.</li><li>Augmentation de la satisfaction utilisateur grâce aux retours positifs.</li><li>Processus simplifiés pour la facturation et la gestion des comptes.</li></ul>',

            // Sign in/up
            'case.si.title':    'Sign in / Sign up Flow',
            'case.si.subtitle': 'Diviser par deux les erreurs d\'authentification en refondant la connexion sur l\'ensemble de l\'écosystème PrestaShop (back office, marketplace, centre d\'aide).',
            'case.si.metric1.value': '-50%',
            'case.si.metric1.label': 'd\'erreurs d\'authentification (7k en moy. vs 15k avant)',
            'case.si.metric2.value': '-50%',
            'case.si.metric2.label': 'de réduction de la longueur du flux',
            'case.si.metric3.value': '50%',
            'case.si.metric3.label': 'des connexions via Google SSO en 6 mois',
            'case.si.situation': '<p>Les utilisateurs PrestaShop faisaient face à plusieurs points d\'authentification (produit, marketplace, centre d\'aide, back office), sans flux cohérents ni données partagées. Le manque de synchronisation entre les bases de données entraînait des doublons de comptes et des échecs d\'authentification.</p><p>Jusqu\'à récemment, il existait 2 modes de connexion (SSO &amp; Connexion par identifiant). L\'objectif était double : augmenter les inscriptions et connexions SSO, et faire comprendre aux utilisateurs qu\'ils n\'ont besoin que d\'un seul compte PrestaShop.</p>',
            'case.si.tasks':    '<ul class="case-list"><li>Audit approfondi des workflows existants, identification des sources de confusion et de friction.</li><li>Cartographie et consolidation de toutes les sources de données utilisateurs vers une base unique.</li><li>Refonte complète des écrans et flux d\'authentification pour éduquer les utilisateurs sur le modèle "un seul compte pour tout PrestaShop".</li><li>Priorisation de l\'intégration SSO et raccourcissement de l\'onboarding en trois étapes clés.</li><li>Introduction de messages d\'erreur clairs et d\'une pédagogie autour de la nouvelle structure de compte.</li></ul>',
            'case.si.results':  '<ul class="case-list"><li>Une interface unifiée sur l\'ensemble du produit pour la création de compte et la connexion.</li><li>Les demandes au support liées à l\'authentification ont fortement diminué.</li><li>Les utilisateurs ont répondu positivement à la nouvelle expérience simplifiée.</li></ul>',

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
            'case.transfer.subtitle': 'Une feature de transfert de charge qui permet aux planificateurs de réallouer la production entre ateliers en quelques secondes — adossée à une documentation structurée et un script de démo ancré dans un client réel.',
            'case.transfer.metric1.value': 'Multi-sites',
            'case.transfer.metric1.label': 'livré dans le module Stock · scope industriel',
            'case.transfer.metric2.value': 'Spec en 7 étapes',
            'case.transfer.metric2.label': 'framework FOCUSED + specs Linear',
            'case.transfer.metric3.value': '9+ interviews',
            'case.transfer.metric3.label': 'démo ancrée dans la research client réelle',
            'case.transfer.context':  '<p>Dans les environnements industriels multi-sites ou multi-secteurs, les planificateurs réallouent régulièrement de la capacité de production d\'un atelier vers un autre pour absorber les surcharges ou optimiser l\'utilisation des ressources. La plateforme ne proposait aucun mécanisme natif pour modéliser et suivre ces transferts de charge — les utilisateurs compensaient via des exports Excel et des workarounds manuels.</p>',
            'case.transfer.problem':  '<p>Les planificateurs ne pouvaient pas visualiser l\'impact d\'un transfert de charge sur les deux secteurs impliqués simultanément, ni tracer les décisions prises. Côté commercial, la feature était difficile à démontrer sans scénario ancré dans une réalité métier concrète.</p>',
            'case.transfer.approach': '<ul class="case-list"><li>Documentation feature rédigée selon le <strong>framework FOCUSED</strong> — un template de spec en 7 étapes (Framework, Outcome, Context, Users, Scope, Edge cases, Done) — dans Notion.</li><li>Règles métier et comportements UI spécifiés dans Linear (format "when X → then Y").</li><li>Script de démo et design ancrés dans un <strong>persona utilisateur réel</strong> — un planificateur senior dans le secteur équipementier automobile — issu de la research client réelle, pas d\'un profil hypothétique.</li><li>Script de démo conçu comme un scénario narratif → 3 moments de valeur distincts → interactions clés à montrer (plutôt qu\'un walkthrough exhaustif des fonctionnalités).</li><li>Alignement avec l\'équipe commerciale sur le storytelling produit.</li></ul><p><strong>Décisions clés :</strong> ancrer la démo dans un persona utilisateur réel issu de la research client ; structurer le récit autour de 3 moments de valeur distincts plutôt qu\'un walkthrough exhaustif des fonctionnalités.</p>',
            'case.transfer.impact':   '<ul class="case-list"><li><strong>Impact client majeur :</strong> réduction significative du temps de traitement de l\'information pour les planificateurs, et visualisation claire et précise des transferts de charge sur les deux secteurs concernés — là où aucune vue native n\'existait auparavant.</li><li>Documentation produit complète et structurée — directement exploitable par les développeurs et le support.</li><li>Script de démo réutilisable par l\'équipe commerciale sans préparation supplémentaire.</li><li>Feature positionnée comme différenciante dans le module Stock lors des cycles de vente.</li></ul>',
            'case.transfer.reflection': '<p>Un designer qui comprend les enjeux go-to-market peut démultiplier l\'impact d\'une feature bien au-delà de l\'équipe produit. Ancrer la démo dans un persona utilisateur réel — issu de la research client, pas d\'un profil hypothétique — rend le storytelling honnête et les promesses de valeur défendables.</p><p>Ce que je garde pour la prochaine feature : ancrer la spec dans des workflows réels dès le jour 1, écrire le script de démo avant que l\'UI soit finale, et traiter le sales enablement comme un livrable de design, pas un artefact en aval.</p>',

            // Multi-sélection & Sticky Action Bar (fusionnés)
            'case.multi.title':    'Multi-sélection & Sticky Action Bar',
            'case.multi.subtitle': 'Un pattern couplé — la multi-sélection déclenche une sticky action bar — pour qu\'un planificateur puisse modifier 50 ordres de fabrication en un clic plutôt qu\'en cinquante. Même comportement en vue cards et en Gantt.',
            'case.multi.metric1.value': '2 vues',
            'case.multi.metric1.label': 'comportement cohérent en cards & Gantt',
            'case.multi.metric2.value': '4 actions rapides',
            'case.multi.metric2.label': 'Tags · Priorité · Statut · Date · "…" pour les secondaires',
            'case.multi.metric3.value': '2 variantes',
            'case.multi.metric3.label': 'standard + respect de la capacité disponible',
            'case.multi.problem':    '<p>Les planificateurs traitent des centaines d\'ordres de fabrication (OF — work orders) par jour. Modifier 50 OF un par un — changer un tag, mettre à jour un statut, replanifier un lot — était la pratique standard, sans support d\'action groupée. Deux problèmes de design sont liés : comment sélectionner plusieurs éléments de manière cohérente sur des vues très différentes (cards, Gantt) — et une fois sélectionnés, comment la surface d\'actions doit s\'afficher et se comporter pour que les opérations les plus fréquentes soient à un clic, sans bloquer les données ?</p>',
            'case.multi.trigger':    '<p>La multi-sélection a été conçue comme un pattern transversal, pas une feature spécifique à une vue. Vue "Suivi d\'avancement" (cards) : select-all par poste de charge (PDC — work center), sélection sur plusieurs jours, sélection multi-PDC unitairement. Vue Gantt : même modèle de sélection, mêmes raccourcis. La matrice d\'états couvre (aucun / partiel / tout) × (actions disponibles) × (OF verrouillés dans la sélection) — pour qu\'aucun état indéfini n\'atteigne la production et que la spec Linear soit autosuffisante.</p>',
            'case.multi.surface':    '<p>La sticky action bar est la contrepartie visible de la sélection. Elle s\'ancre au viewport avec une hiérarchie en deux lignes :</p><ul class="case-list"><li><strong>Ligne du haut :</strong> toggle tout sélectionner / désélectionner, résumé de sélection ("7 éléments sélectionnés · xxx pièces · xxx heures"), fermeture.</li><li><strong>Ligne du bas :</strong> 4 actions rapides quotidiennes (Tags, Priorité, Statut, Date), un menu "…" pour les actions secondaires (Modifier poste de charge, Batch, Figer) qui s\'affichent dynamiquement quand la place le permet, et des flèches de navigation pour parcourir la sélection.</li></ul><p>Une seconde variante ajoute un toggle "Respecter la capacité disponible" en haut — utilisée quand l\'action en masse impacte la charge des postes de charge.</p>',
            'case.multi.details':    '<p>Comportements clés : la barre est déplaçable pour ne jamais bloquer les données que l\'utilisateur doit lire ; les actions secondaires apparaissent en ligne quand il y a la place et se replient dans le menu "…" sinon ; états de chargement explicites pendant le traitement des actions en masse ; intégrations cohérentes en cards et en Gantt.</p>',
            'case.multi.impact':     '<p>Les actions quotidiennes sont accessibles en un clic depuis n\'importe quel état de sélection. Le changement de statut est nettement plus visible qu\'auparavant. Le pattern est réutilisable dans tout le produit parce que le déclencheur et la surface livrent et évoluent ensemble — pas comme deux features déconnectées.</p>',
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
