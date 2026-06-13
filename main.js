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
        const stats = document.querySelector('.landing-stats');
        const pitch = document.querySelector('.landing-pitch');
        const links = document.querySelector('.landing-links');
        if (sub)   setTimeout(() => sub.classList.add('visible'), 320);
        if (stats) setTimeout(() => stats.classList.add('visible'), 460);
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
    // Projects filter — chips filter the list by theme or "key" projects.
    // "All" restores the full timeline (year labels + earlier projects).
    // ===================================
    (function setupProjectFilter() {
        const filterBar = document.querySelector('.projects-filter');
        const projectsList = document.querySelector('.projects-list');
        if (!filterBar || !projectsList) return;

        const chips = Array.from(filterBar.querySelectorAll('.filter-chip'));
        const cards = Array.from(projectsList.querySelectorAll('.project-card'));
        const years = Array.from(projectsList.querySelectorAll('.project-year-label'));
        const extras = Array.from(projectsList.querySelectorAll('.project-list-sep, .project-other-intro, .project-other-list'));

        function apply(filter) {
            const isAll = filter === 'all';
            cards.forEach(card => {
                const match = isAll
                    || (filter === 'key' && card.dataset.key === 'true')
                    || (card.dataset.theme === filter);
                card.classList.toggle('is-filtered-out', !match);
            });
            // Year labels & the earlier-projects block only make sense in "All"
            years.forEach(y => y.classList.toggle('is-filtered-out', !isAll));
            extras.forEach(e => e.classList.toggle('is-filtered-out', !isAll));
            projectsList.classList.toggle('is-filtering', !isAll);
        }

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.toggle('active', c === chip));
                apply(chip.dataset.filter);
            });
        });
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
        'landing':                  'Guillaume Caillet, Senior Product Designer',
        'who':                      'About, Guillaume Caillet',
        'projects':                 'Projects, Guillaume Caillet',
        'project-ds-execution':     'Opal DS · Corrective Actions, Case Study',
        'project-multiselect':      'Multi-select & Sticky Action Bar, Case Study',
        'project-figma-plugin':     'Figma Plugin, Local Components Collector, Case Study',
        'project-ds-audit':         'Opal DS · Audit, Case Study',
        'project-transfer':         'Capacity Transfer Between Sectors, Case Study',
        'project-design-system':    'PrestaShop Design System, Case Study',
        'project-customer-account': 'PrestaShop Customer Account, Case Study',
        'project-signin':           'PrestaShop Sign-in / Sign-up, Case Study',
        'project-store-association':'PrestaShop Store Association, Case Study'
    };

    // Per-page meta description (used for SEO + social previews).
    const PAGE_META = {
        'landing':                  'Senior Product Designer · 7+ years building B2B SaaS products and design systems · Industry 4.0 · France.',
        'who':                      'Guillaume Caillet, Senior Product Designer. 7+ years across Oplit, PrestaShop, Airbus and SNCF.',
        'projects':                 'Selected case studies, design systems, B2B SaaS, industrial scheduling, and design-ops tooling.',
        'project-ds-execution':     'Opal DS Corrective Actions, 44 components rebuilt, 2,634 token bindings applied, +20–30% gain per feature cycle.',
        'project-multiselect':      'Multi-select + Sticky Action Bar, one coupled pattern letting schedulers update 50 work orders in one click.',
        'project-figma-plugin':     'Local Components Collector, a Figma plugin that cuts DS audit time from days to hours.',
        'project-ds-audit':         'Opal DS Audit, graded findings against Atomic Design, BEM, DTCG and WCAG, with a 3-horizon remediation plan.',
        'project-transfer':         'Capacity Transfer Between Sectors, letting industrial schedulers reallocate production across workshops in seconds.',
        'project-design-system':    'PrestaShop Design System, 100% squad adoption, 80% in tech, –50% development time.',
        'project-customer-account': 'PrestaShop Customer Account, three accounts unified into one, eliminating support requests for basic updates.',
        'project-signin':           'PrestaShop Sign-in / Sign-up, authentication errors cut in half across the entire ecosystem.',
        'project-store-association':'PrestaShop Store Association, 600+ successful associations per day, –40% error-driven abandonment.'
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
        // data-page is read by CSS to show page-scoped elements
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

    // Burger menu toggle
    const burgerBtn = document.getElementById('burger-btn');
    const navLinksEl = document.querySelector('.nav-links');
    if (burgerBtn && navLinksEl) {
        burgerBtn.addEventListener('click', () => {
            const isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
            burgerBtn.setAttribute('aria-expanded', !isOpen);
            navLinksEl.classList.toggle('open', !isOpen);
        });
        // Close menu on nav link click
        navLinksEl.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.setAttribute('aria-expanded', 'false');
                navLinksEl.classList.remove('open');
            });
        });
    }

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
            ? `Cette page n'existe plus, voici la liste des projets.`
            : `That page doesn't exist anymore, here's the project list.`;
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
            'landing.line1':    'Making complex, demanding products simple to use.',
            'landing.line2_pre':'Currently at ',
            'landing.sub':      'Guillaume Caillet · Senior Product Designer · France',
            'landing.sub_name': 'Guillaume Caillet',
            'landing.sub_role': 'Senior Product Designer',
            'landing.sub_loc':  'France',
            'landing.pitch':    'Over the last 7 years, I\'ve contributed to the design and improvement of B2B SaaS products, alongside teams at <strong>Oplit</strong> (industrial schedulers), <strong>PrestaShop</strong> (300k+ merchants), <strong>Airbus</strong> and <strong>SNCF</strong>. I\'ve led design systems, run audits, and shipped infrastructure that teams build on.<br><br>What I\'m looking for: high-stakes products where design co-pilots strategy, not a service function.',
            'landing.discover': 'Discover my work →',
            'landing.about':    'About me',
            'landing.email':    'Email me',
            'landing.linkedin': 'Connect on LinkedIn',
            'landing.scroll':   'Scroll',
            'landing.stat1':    'active users at Oplit',
            'landing.stat2':    'auth errors at PrestaShop (300k+ merchants)',
            'landing.stat3':    'faster design execution with the rebuilt design system',
            'landing.stat.go':  'see the work →',

            // Marquee labels
            'mq.skills':  'Skills',

            // Who page
            'who.title': 'Who am I?',
            'who.intro.p1': 'I came to design without really noticing it.. first through the games I played, then something deeper that stuck: a curiosity for graphic systems and the drive to build the things that had gradually fascinated me.',
            'who.intro.p2': '<strong>Senior Product Designer</strong> at <strong>Oplit</strong>, a B2B SaaS platform for industrial scheduling. I design for planners and shop-floor operators in luxury watchmaking, aerospace, and precision engineering. Expert users, direct operational impact. I took over and deployed Oplit\'s design system as a structural element of the organization, aligning design, engineering, and product around a shared language.',
            'who.intro.p3': 'What interests me: SaaS environments where design shapes how organizations work. A decision framework that holds, a component system that speeds up the team, research that redirects a roadmap. I\'m looking for roles where design co-pilots product strategy.',

            'who.section.professional': 'Professional Experiences',
            'who.section.other':        'Other experiences',
            'who.section.studies':      'Studies',
            'who.section.mentoring':    'Mentoring',
            'who.section.articles':     'Articles',
            'who.section.podcasts':     'Podcasts',
            'who.section.templates':    'Templates for Notion',
            'who.section.cv':           'Curriculum Vitae',
            'who.section.links':        'Useful links',

            'who.date.oplit':       'Sept. 2025 – Present',
            'who.date.prestashop':  'June 2022 – Sept. 2025',
            'who.date.beapp':       'June 2021 – June 2022',
            'who.date.lacapsule':   'Oct. 2020 – June 2021',
            'who.date.airbus':      'Sept. 2018 – Aug. 2020',
            'who.date.sncf':        'March 2018 – Aug. 2018',
            'who.date.stereosuper': 'Aug. 2015 – Sept. 2017',
            'who.date.teacher':     '2025 – Present',
            'who.date.mentor':      '2024 – Present',
            'who.date.ecv':         '2021 – Present',
            'who.date.designschool': '2025',
            'who.date.freelance':   '2020 – Present',

            'who.role.oplit':       'Senior Product Designer',
            'who.role.prestashop':  'Product Designer',
            'who.role.beapp':       'UX/UI Designer',
            'who.role.lacapsule':   'UX Designer Consultant',
            'who.role.airbus':      'UX Designer, Work-study',
            'who.role.sncf':        'UX Designer, Internship',
            'who.role.stereosuper': 'UX Designer, Work-study',
            'who.role.teacher':     'Teacher',
            'who.role.ecv':         'Speaker & Jury',
            'who.role.designschool': 'Lecturer',
            'who.company.designschool': 'École de Design Nantes',
            'who.role.freelance':   'Freelancing',

            'who.desc.oplit':       '<p><strong>+74% active users (430 → 747)</strong> and key features now running on customers\' production lines.</p><p>Oplit builds production planning software for industrial manufacturers in aerospace, luxury and automotive. I own design on the product: continuous discovery with customers and prospects, strategic features shipped with product and engineering, and the design system I rebuilt (44 components, structured for AI-assisted workflows) which made design execution 30 to 50% faster.</p>',
            'who.desc.prestashop':  '<p><strong>Product Designer &amp; Design System Lead (2024)</strong></p><p>Progressively structured and deployed the research system across PrestaShop. Responsible for structuring and making the tools, templates, and user data operationally available so product teams could access them quickly and efficiently. The aim: provide efficient access to user research when designing PrestaShop products for 300k+ merchants.</p><p>Also worked on structuring the Design System to make it robust, flexible and scalable. Proposing areas for development, structuring the team around the project and giving visibility to the work.</p><p><strong>Design System contributor (2023)</strong></p><p>Involved in structuring and implementing the PrestaShop Design System. Working on the monitoring, implementation, and use of components and design tokens by everyone who uses the design system, as well as the components designed by the Product Designers.</p><p><strong>Product Designer (2022)</strong></p><p>Within the Customer Platform team, working on the design and improvement of the user experience through the user account and, more generally, the login experience.</p>',
            'who.desc.beapp':       '<p>In charge of UX at Beapp, working mainly with the UI designer and in contact with all the people involved in the various customer projects (PO, Business, Tech).</p><p>Designing experiences for different types of clients in the healthcare, automotive, food, institutional, and other sectors. Running creativity, immersion, and co-creation workshops. In charge of user research and testing.</p>',
            'who.desc.lacapsule':   '<p>Work as a UX consultant for companies looking to improve their user experience.</p>',
            'who.desc.airbus':      '<p>Joined the team of UX/UI designers (UXiD) as part of a process to digitalize the Airbus Group. The team designs and redesigns processes as well as business applications and HMIs, putting people back at the heart of their design.</p><p>Responsible for disseminating UX guidelines and best practices throughout the group. Collecting user requirements, participating in the design of business applications, organising information architecture, and working in collaboration with IT and other departments.</p>',
            'who.desc.sncf':        '<p>Working as a UX designer in section 574 (innovation) at the SNCF in Nantes. In charge of designing personas, user paths, and screen ergonomics for different applications.</p>',
            'who.desc.stereosuper': '<p>An apprentice for 2 years and trained as a web designer with a specialization in UX design, working on several projects and building up solid experience in a field I\'m passionate about.</p>',
            'who.desc.teacher':     '<ul><li>1st year: Design &amp; UX/UI fundamentals (early 2025)</li><li>2nd year: Figma training (late 2025)</li></ul>',
            'who.desc.mentor':      '<p>Helping designers, no matter their seniority, to grow and giving them feedbacks about their projects or career perspectives.</p>',
            'who.desc.ecv':         '<ul><li>Design System workshop with M1 UX: building a foundation &amp; understanding the need for a design system (2026)</li><li>Jury M2 UX: end-of-study projects (2026)</li><li>Eco-design &amp; Design System, Speaker (2023, 2024, 2025)</li><li>Design System, Annual project, 100% students graduated (2022-2023)</li><li>User Research Methods, Lecturer (2021-2022)</li></ul>',
            'who.desc.designschool': '<ul><li>1st year: Design &amp; UX/UI fundamentals</li><li>2nd year: Figma training</li></ul>',

            'who.mentoring.link':  'Book a mentoring session with Guillaume Caillet on ADPList →',
            'who.articles.text':   'I write about <strong>design</strong>, <strong>design systems</strong>, and <strong>user research</strong>. Pragmatic notes from the field.',
            'who.articles.link':   'Guillaume CAILLET on Medium →',
            'who.podcast.simon':   'Interview with Simon Robic on mobile-first design →',
            'who.templates.link':  'Guillaume Caillet | Notion Template Creator →',
            'who.cv.link':         'Download CV (PDF) →',
            'who.email':           'Email me',
            'who.linkedin':        'Connect on LinkedIn',

            // Projects
            'projects.title': 'Projects',
            'projects.other.intro': 'Earlier projects: concept work, prototypes and student projects I still find relevant.',
            'projects.filter.key':      'Key projects',
            'projects.filter.all':      'All',
            'projects.filter.ds':       'Design Systems',
            'projects.filter.product':  'Product',
            'projects.filter.research': 'Research',
            'projects.filter.tooling':  'Tooling',

            // Footer
            'footer.role':    'Senior Product Designer',
            'footer.email':   'contact@guillaumecaillet.fr',
            'footer.status':  'Open to opportunities',
            'footer.cta.kicker': 'Interested in my profile? Let\'s connect.',
            'footer.cta.msg':    'Send me a message',

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
            'case.ca.subtitle': 'Unifying three fragmented PrestaShop accounts (Back Office, Marketplace, Business Care) into one, so users finally stop calling support to update an email.',
            'case.ca.metric1.value': '3 → 1',
            'case.ca.metric1.label': 'unified customer account',
            'case.ca.metric2.value': '0',
            'case.ca.metric2.label': 'support dependency for basic account updates',
            'case.ca.metric3.value': 'Kano basic',
            'case.ca.metric3.label': 'need, structured as infrastructure, not feature',
            'case.ca.situation': '<p>Third phase of user identity unification (after Sign in/Sign up and Store Association).</p><ul class="case-list"><li>No "customer account": data scattered between back-office, marketplace, no centralized space</li><li>Users couldn\'t modify email, password themselves → had to contact support</li><li>Significant support ticket volume on this topic alone</li></ul><p><strong>Kano framing:</strong> basic need, not a "wow" feature. Absence generates frustration, presence is obvious. The challenge: convincing stakeholders to invest in an "invisible" but structuring project.</p>',
            'case.ca.research_discovery': '<p>No specific research. Insights came directly from Sign in/Sign up research (5 interviews + Mixpanel + support). Benchmark: Shopify, WooCommerce, Wix all have a centralized account space → market standard, not innovation.</p>',
            'case.ca.decisions': '<p><strong>Scope V1 vs V2:</strong></p><ul class="case-list"><li>V1 (shipped): personal data (name, email, phone, country, password) + shop identification + PrestaShop service links</li><li>Cut from V1: multi-shop, billing management → added through iterations</li></ul><p><strong>Database consolidation:</strong> UX requirements defined (data, structure, rights), tech designed the migration from marketplace, help center, and back-office databases.</p><p><strong>Account deletion (GDPR):</strong> duplicate accounts identified. Legal discussion → dual argument: GDPR compliance + server cost reduction.</p><p><strong>Personal info / Business info distinction:</strong> separation existed but was poorly organized. Made explicit and accessible.</p>',
            'case.ca.collaboration': '<p><strong>Cross-squad scope transfer:</strong> the Marketplace team was managing "customer user" data when it legitimately fell under the Account team. The scope transfer happened naturally as it freed bandwidth for the Marketplace team.</p><p><strong>Friction with the Payment team:</strong> payment data lived in a separate technical environment. Recovering this component was technically complex and required close collaboration.</p><p><strong>Workshops:</strong> 1h to 1h30 brainstorms with PM, Designer, and Tech Leads. Format: proposals and decision-making on how to centralize information.</p>',
            'case.ca.design_solution': '<p>A single centralized space where users see their personal data, business data, and links to all PrestaShop services. Clear distinction between Personal info and Business info sections, self-service for all basic updates, and account deletion capability (GDPR compliance).</p>',
            'case.ca.outcome': '<ul class="case-list"><li><strong>Significant reduction in support tickets</strong> related to personal data modifications. Near-total absence of complaints post-launch.</li><li><strong>Full autonomy:</strong> merchants modify their personal and business data without support.</li><li><strong>Synchronized data</strong> across all PrestaShop services (marketplace, help center, back-office).</li><li><strong>Kano indicator:</strong> success is measured by the disappearance of the problem, not by applause.</li></ul>',

            // Sign in/up
            'case.si.title':    'Sign in / Sign up Flow',
            'case.si.subtitle': 'Cutting authentication errors in half by redesigning sign-in across the entire PrestaShop ecosystem (back office, marketplace, help center).',
            'case.si.metric1.value': '-50%',
            'case.si.metric1.label': 'authentication errors (7k avg vs 15k before)',
            'case.si.metric2.value': '-50%',
            'case.si.metric2.label': 'flow length (5 steps → 3 steps)',
            'case.si.metric3.value': '50%',
            'case.si.metric3.label': 'of logins via Google SSO within 6 months',
            'case.si.situation': '<p>Open-source e-commerce ecosystem, 300k+ merchants. 4 entry points (back-office, marketplace, help center, business care), each with its own auth system and separate database.</p><ul class="case-list"><li>Users had up to 3 separate, unsynchronized sets of credentials</li><li>~15,000 authentication errors per month on average (Mixpanel, 2023-2024)</li><li>Ticket volume consumed most of the Account team\'s bandwidth</li></ul>',
            'case.si.research_discovery': '<p>5 merchant interviews (semi-structured, direct contact) + Mixpanel data + support feedback.</p><p><strong>Hypotheses tested:</strong></p><ul class="case-list"><li><strong>"Too many login methods"</strong> → <strong>Confirmed.</strong> Users didn\'t know which credentials to use for which service.</li><li><strong>"Unintuitive flow"</strong> → <strong>Confirmed.</strong> 5 steps for account creation (personal data, typology, shop data, validation, email confirmation).</li><li><strong>"Accepted credentials aren\'t explicit"</strong> → <strong>Confirmed.</strong> No feedback on which credential type worked where.</li><li><strong>"Login with local credentials on the marketplace"</strong> → <strong>Confirmed.</strong> Major source of errors.</li><li><strong>"Different email for each service"</strong> → <strong>Disproven.</strong> The problem was fragmented databases: each service had its own, with no communication between them. Impossible to identify the same person across back-office, marketplace, and help center when addresses differed.</li><li><strong>"Merchants manage their shop alone"</strong> → <strong>Disproven.</strong> Some shops are managed by agencies → roles/permissions topic (addressed in Store Association).</li></ul>',
            'case.si.decisions': '<p><strong>Scope split into 3 tickets</strong> (agreement PM + Designer + Lead Dev):</p><ol class="case-list"><li>Sign in / Sign up: auth and account creation redesign</li><li>Store Association: shop → PrestaShop account association</li><li>Customer Account: centralized personal and business data space</li></ol><p><strong>Alternatives discarded:</strong></p><ul class="case-list"><li>Magic link → technical complexity too high on existing stack. Classic Google SSO retained.</li><li>Two-factor auth code → added friction. Not V1 priority.</li><li>Shop claim by URL → impossible to prove ownership. Redirected to Store Association with UUID.</li><li>Automatic account merge → too risky on identification. Progressive consolidation via unified system.</li></ul><p><strong>Core trade-off, user simplicity vs technical complexity:</strong> The team\'s tendency was to push complexity onto the user (technical codes in error messages, technical requirements displayed). Design stance: handle complexity system-side. The user enters their email, the system handles the rest. Concretely: initial error messages contained a technical code for support. Replaced with understandable messages, without exposing sensitive information.</p>',
            'case.si.collaboration': '<ul class="case-list"><li><strong>Squad of 7:</strong> product trio (PM + Lead Dev + Product Designer) + back-end devs + Scrum Master + QA</li><li><strong>Designer role:</strong> facilitating brainstorms, discovery workshops, design focus, design challenges</li><li><strong>Cross-squad alignment:</strong> sign-in touched 3 services and 3 teams. Inter-squad syncs. Topic recognized as critical → prioritization facilitated.</li></ul>',
            'case.si.design_solution': '<p>The flow went from <strong>5 steps to 3 steps</strong>:</p><ol class="case-list"><li>Account creation (essential data only + "Sign up with Google" option first)</li><li>User profile (typology: merchant, agency, freelance)</li><li>Arrival on the unified account</li></ol><p>Google SSO was prioritized in dominant position in the interface (button on top, before the classic form). User education was integrated into the flow: making users understand that a single PrestaShop account is enough for all services.</p>',
            'case.si.outcome': '<p><strong>Dedicated tracking plan</strong> set up to measure connection mode (credentials vs Google SSO).</p><ul class="case-list"><li><strong>50% reduction in authentication errors:</strong> 167k users connected with only ~7k errors on average (2024-2025) vs ~15k errors on average (2023-2024). Source: Mixpanel.</li><li><strong>50% reduction in flow length:</strong> from 5 steps to 3 steps for account creation.</li><li><strong>Growing Google SSO adoption:</strong> visible on the Mixpanel graph with a crossover of credentials/Google curves over the post-launch period, showing a progressive migration toward SSO.</li><li><strong>Indirect benefits:</strong> the reduction in auth errors freed up bandwidth for the Account team, who could finally focus on feature development.</li></ul>',

            // Store Association
            'case.sa.title':    'Store Association Flow',
            'case.sa.subtitle': 'Redesign of the association flow between the user account and the shop, making it transparent and error-resistant.',
            'case.sa.metric1.value': '600+',
            'case.sa.metric1.label': 'successful associations per day',
            'case.sa.metric2.value': '~–40%',
            'case.sa.metric2.label': 'estimated drop in error-driven abandonment',
            'case.sa.situation': '<p>The shop association process, particularly for open-source installations, was a major source of confusion. Merchants didn\'t understand why association was required and abandoned the process, especially when errors occurred.</p><p>The association exists because most users have Open Source shops installed locally on their hosting, not always identified as belonging to the owner account. Association creates this connection.</p>',
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
            'case.dsexec.automation':  '<p>Token binding was the highest-volume task. I automated it using Claude Code with the Figma MCP (Model Context Protocol, lets agents drive Figma directly): 1,755 bindings applied in a single session, 45,000+ nodes analysed, 879 auto-corrections. What would have taken weeks took hours.</p><p class="case-caption"><em>Automation didn\'t replace review, every binding was checked. Speed without governance just means faster regression.</em></p>',
            'case.dsexec.alignment':   '<p>4-step dev-alignment workflow: <strong>Figma</strong> (design + tokens applied) → <strong>Notion doc</strong> (states, variants, props) → <strong>Storybook/Chromatic</strong> (implementation reviewed by designer) → <strong>Linear ticket closed</strong>. As of April 2026: 11 components in dev review: FButton, FTextfield, OpalSwitch, FChip, FDialog, and 6 others.</p>',
            'case.dsexec.results':     '<p>44 components rebuilt. 0 hardcoded values remaining. 3 → 1 icon library. Estimated +20–30% gain per feature cycle. The design system went from an implicit, undocumented system to a structured, scalable, dev-aligned infrastructure.</p>',

            // Plugin Figma
            'case.plugin.title':    'Figma Plugin, Local Components Collector',
            'case.plugin.subtitle': 'A JavaScript plugin built with the Figma Plugin API to automate local component audits, reducing DS audit time from days to hours.',
            'case.plugin.metric1.value': 'days → hours',
            'case.plugin.metric1.label': 'DS audit time reduction',
            'case.plugin.metric2.value': '0',
            'case.plugin.metric2.label': 'manual file-by-file navigation needed',
            'case.plugin.metric3.value': 'Solo',
            'case.plugin.metric3.label': 'shipped without engineering bandwidth',
            'case.plugin.problem':   '<p>Without a dedicated tool, identifying un-factorized local components in a Figma file is entirely manual: open each frame, inspect each element, note duplicates. No consolidated view exists natively. This directly delays factorization work and silently grows design debt between audits.</p>',
            'case.plugin.approach':  '<p>I identified the need through personal friction while running a DS audit at Oplit. Instead of waiting for an engineering solution, I built the tool myself. I defined criteria for a "factorization candidate": frequency of use, presence of variants, visual and structural complexity.</p>',
            'case.plugin.howworks': '<p>The plugin is written in JavaScript using the Figma Plugin API. It crawls all nodes in the current file, detects local components (not from a shared library), and generates a structured report: component name, usage count, parent frame, factorization priority. The report displays directly in the plugin panel, no export needed.</p>',
            'case.plugin.impact':    '<p>DS audit time reduced from several days to a few hours. Factorization candidates are identified objectively. The plugin demonstrates that a senior designer can deliver tooling value without waiting on engineering bandwidth.</p>',

            // DS Audit (2025)
            'case.dsaudit.title':    'Opal DS · Audit',
            'case.dsaudit.subtitle': 'A systematic Opal DS audit, graded findings against four industry frameworks, with a phased remediation plan I executed over the following months.',
            'case.dsaudit.metric1.value': '3 levels',
            'case.dsaudit.metric1.label': 'CRITICAL / WARNING / INFO severity grading',
            'case.dsaudit.metric2.value': '3 horizons',
            'case.dsaudit.metric2.label': 'Immediate / Next / Future remediation plan',
            'case.dsaudit.metric3.value': '4 frameworks',
            'case.dsaudit.metric3.label': 'Atomic Design · BEM · DTCG · WCAG 2.1 AA',
            'case.dsaudit.situation':    '<p>Design and code weren\'t talking to each other. The same button appeared in 5 different variants depending on the page. No shared documentation existed. Rules lived in people\'s heads. Every new developer had to reverse-engineer the system from production.</p>',
            'case.dsaudit.methodology':  '<p>I built a custom audit protocol using the Figma MCP (Model Context Protocol): systematic reading of every component in the library, evaluated against 4 reference frameworks: Atomic Design (structure), BEM (naming), DTCG (Design Tokens Community Group standard), WCAG 2.1 AA (accessibility). Each finding was graded: CRITICAL (blocks correct usage), WARNING (inconsistency, technical debt risk), INFO (improvement opportunity).</p>',
            'case.dsaudit.findings':     '<p><strong>Button, NON-COMPLIANT:</strong> hex values in shadow properties, "Type" prop collision with reserved keyword, token path conflicts. <strong>Foundations, NEEDS WORK:</strong> forked naming conventions, 3 different names for the same opacity primitive. Report structured by severity with 3 remediation horizons: Immediate (blockers), Next (next sprint), Future (backlog).</p>',
            'case.dsaudit.plan':         '<p>5-step remediation plan: 1. Audit → 2. Foundations (color tokens, spacing, typography, iconography, vocabulary) → 3. Components (rebuilt one by one against the audit report) → 4. Dev alignment (Storybook, review workflow) → 5. Deployment. Each step had explicit entry/exit criteria.</p>',

            // Capacity Transfer Between Sectors
            'case.transfer.title':    'Capacity Transfer Between Sectors',
            'case.transfer.subtitle': 'From 8 manual steps in Excel to 1 action with real-time feedback, enabling a major automotive manufacturer to unlock multi-site deployment.',
            'case.transfer.metric1.value': 'Deployed',
            'case.transfer.metric1.label': 'feature live and adopted',
            'case.transfer.metric2.value': 'Weekly',
            'case.transfer.metric2.label': 'consistent usage since launch (Mixpanel)',
            'case.transfer.metric3.value': '10+ sites',
            'case.transfer.metric3.label': 'multi-site deployment unblocked',
            'case.transfer.metric4.value': '3.5 months',
            'case.transfer.metric4.label': 'discovery to production with a 3-person team',
            'case.transfer.situation': '<p>Industrial planning SaaS (Industry 4.0): aerospace, luxury watchmaking, automotive. The planning module manages demand, capacity, inventory, and scheduling across production lines.</p><p><strong>The problem:</strong> when a machine is overloaded (load rate > 100%), the scheduler must transfer demand to another machine. Before: entirely manual process.</p><p><strong>The 8-step manual process</strong> (documented in session):</p><ol class="case-list"><li>Manufacturing tab → increase capacity → still overloaded</li><li>Balance load/capacity → rate 100%</li><li>Stock tab → check impact → negative stock</li><li>Calculate parts to transfer (demand vs target gap)</li><li>Identify transferable references</li><li>Execute transfers (reference A, then B...)</li><li>Origin sector: verify projected stock</li><li>Destination sector: manually adjust target</li></ol><p><strong>Business stake:</strong> the client (a major automotive manufacturer, multi-site) couldn\'t deploy Oplit on 10+ additional sites without this feature. Convergence of critical user need + commercial stake (retention + expansion).</p>',
            'case.transfer.research_discovery': '<p><strong>Co-creation with the client, 5-6 iterative sessions:</strong></p><ul class="case-list"><li>Remote observations of the scheduler\'s real workflow</li><li>Mapping workarounds (Excel, manual calculations, memory)</li><li>Successive iterations to the final design</li></ul><p><strong>FOCUSED framework:</strong></p><ul class="case-list"><li><strong>Frame:</strong> quantified success metrics (0 stock rupture, optimal load rate, deals signed thanks to the module)</li><li><strong>Observe:</strong> "I\'m the planning manager, machines overloaded, manual optimization process, painful and long"</li><li><strong>Claim:</strong> "Transfer in 3 clicks, visualize impact in real time, undo in 1 click"</li><li><strong>Unfold:</strong> 5 touchpoints (stock → sector → transfer → immediate impact → adjust)</li><li><strong>Steal:</strong> Notion (bidirectional backlinks), GitHub (PR reverts), Figma (instances/master), Stripe (linked transactions)</li><li><strong>Execute:</strong> happy path + sad path + 4 hypotheses</li><li><strong>Decide:</strong> structured Go/No-Go (Product, Tech, Sales, Ops)</li></ul><p><strong>Critical discovery:</strong> the client\'s vocabulary didn\'t match ours. "Load" for them = "demand". "Production target" for them = "capacity". Identified in test sessions → wording adjustment.</p><p><strong>Hypotheses to validate:</strong></p><ol class="case-list"><li>Dual-line system (emission + reception) understood instantly → tested in session</li><li>Automatic adjustments preferred over manual input → auto/manual ratio via Mixpanel</li><li>Cancellation discoverable and used at the right time → usage rate + creation/cancellation delay</li><li>Global stock consistency understood → monitoring "stock disappeared" tickets</li></ol>',
            'case.transfer.decisions': '<p><strong>Structural constraint:</strong> 1 single dev. Every decision passed the filter "buildable in this cycle?" (late 2025 → mid-March 2026).</p><p><strong>Retained:</strong></p><ul class="case-list"><li><strong>Manual transfer with pre-calculated suggestions:</strong> the scheduler stays in control. Don\'t automate what the user needs to understand. Trust comes from transparency.</li><li><strong>Dual-line system (emission + reception):</strong> inspired by Notion/GitHub/Stripe. Transfer Sector 1 → Sector 2 = emission line (tag "Partial/Complete transfer") + reception line (tag "Transfer received"). Clickable bidirectional link.</li><li><strong>One-click cancellation</strong> from reception line. Automatic restoration. Client\'s #1 request.</li><li><strong>Visual tags</strong> (Partial/Complete/Received): immediate feedback without opening details.</li></ul><p><strong>Cut from V1 scope:</strong></p><ul class="case-list"><li>Automatic route optimization → too complex for 1 dev</li><li>Alternative route suggestions → same reason</li><li>Projected load rate on destination → V2 backlog. Current rate displayed in modal, not projection.</li></ul><p><strong>Edge cases:</strong></p><ul class="case-list"><li>Transfer > available stock → error + blocking</li><li>Modify reception line → disabled dropdown + tooltip</li><li>Multi-select + transfer → incompatible V1</li><li>Cancellation after production started → blocking + explanatory message</li></ul>',
            'case.transfer.collaboration': '<p><strong>Team:</strong> Product trio (PM + Product Designer + 1 Dev).</p><p><strong>5-6 co-creation sessions with the client:</strong> iterative format: presentation of business reflections and interface proposals, client feedback on their real workflow and workarounds, adjustments.</p><p><strong>Design deliverables:</strong></p><ul class="case-list"><li>Figma: annotated specs + interactive prototype</li><li>Linear: functional spec with context, success criteria (short/medium/long term), Figma link, delta from current state, detailed specs, acceptance criteria, and Mixpanel trackers</li></ul><p><strong>Test participants:</strong> the client\'s scheduler in test sessions on staging before production deployment. Post-test adjustments (terminology, interaction patterns).</p><p><strong>Managing the team constraint:</strong> with only 1 dev, the designer (me) had to provide exhaustive specs from the first handoff to minimize back-and-forth. Linear specs systematically included edge cases and sad paths.</p>',
            'case.transfer.design_solution': '<p><strong>The final user flow (Happy Path):</strong></p><ol class="case-list"><li>The scheduler identifies an overloaded sector. "Sector 1" displays a red badge "Load rate: 200%" + an alert "Min stock: 1 rupture"</li><li>They click the dropdown of the reference to transfer (e.g. "Ribs-10")</li><li>They select "Transfer load"</li><li>The modal opens with pre-filled information (period, operation, origin sector locked)</li><li>They select the destination (e.g. "Sector 2") → the current load rate displays (e.g. "15%")</li><li>They choose the quantity to transfer (e.g. 45 out of 90 parts)</li><li>They validate</li><li>Immediate result. On Sector 1: the reference shows a "Partial transfer" tag with a sub-line "To Sector 2 ↗" and the adjusted production target (from 90 to 45, with original indication). On Sector 2: the reference appears with a "Transfer received" tag and a sub-line "From Sector 1 ↗". The stock evolution graph shows hatched bars for the transferred target. A new "Transferred prod. target" line appears in the detail table.</li><li>The scheduler can cancel the transfer in one click from the reception line</li><li>They can iterate: make multiple successive transfers until optimal balance</li></ol>',
            'case.transfer.outcome': '<p><strong>Feature adopted and used weekly</strong> (Mixpanel).</p><ul class="case-list"><li><strong>Multi-site deployment unblocked:</strong> the client is launching deployment on 10+ sites. Most significant business impact: the feature conditioned contract expansion.</li><li><strong>Process eliminated:</strong> 8 Excel steps → 1 action with visual feedback, complete traceability, and one-click cancellation.</li><li><strong>User trust:</strong> the scheduler sees exactly what was transferred, from where, to where, and can cancel. Traceability resolves the initial problem.</li></ul><blockquote><p>"The options we asked for, they work. We\'ve taken a real step forward. I have no more blockers to move forward with deployment for other sites."</p><p>– Production planning manager</p></blockquote>',

            // Multi-select & Sticky Action Bar (merged)
            'case.multi.title':    'Multi-select & Sticky Action Bar',
            'case.multi.subtitle': 'One coupled pattern: multi-select triggers a sticky action bar, so schedulers can update 50 work orders in one click instead of fifty. Same behavior across cards and Gantt views.',
            'case.multi.metric1.value': '2,250',
            'case.multi.metric1.label': 'bulk actions in first 30 days (Mixpanel)',
            'case.multi.metric2.value': '4 views',
            'case.multi.metric2.label': 'consistent behavior across cards & Gantt',
            'case.multi.metric3.value': '~7 days',
            'case.multi.metric3.label': 'design / 4 months to production',
            'case.multi.metric4.value': '50-100',
            'case.multi.metric4.label': 'min/week saved per planner (estimated)',
            'case.multi.context': '<p>Industrial planning SaaS, 12 clients (aerospace, luxury watchmaking, precision engineering), 3 to 5 users per client. 4 main work views (WO, In-progress, Progress tracking in cards and Gantt).</p><p><strong>The problem:</strong> no multi-selection. Each action (tag, priority, status, move) was done operation by operation.</p><ul class="case-list"><li>Tag 5 operations: 5× (click → tag → validate) = 2-3 min</li><li>Prioritize a 16-operation WO: 16× (open → modify → validate) = 5-10 min</li><li>Impact: 5 to 15 min lost/day/user</li></ul><p>Multi-selection is a standard (Shopify, Jira, etc.). Its absence generated strong frustration.</p><p><strong>Client verbatims:</strong></p><ul class="case-list"><li>"I want to select 5 operations and tag them all \'Urgent\' in 1 click instead of doing it one by one."</li><li>"When a work order becomes a priority, I want to prioritize it for all workshops without opening each operation."</li><li>"I need to move a complete work order (16 operations) to another work center without doing the same action 16 times."</li></ul>',
            'case.multi.research_discovery': '<p><strong>Converging sources:</strong></p><ul class="case-list"><li>Recurring client requests reported by OPS in weeklies</li><li>User interviews (behaviors and usage patterns)</li><li>Remote observations (screen sharing) with 2 clients</li></ul><p>Discovery structured via the FOCUSED framework (detailed in the Capacity Transfer case study).</p><p><strong>First Use Case:</strong> "As a scheduler, when I want to apply tags, priorities, or statuses on multiple operations in one action, what matters is doing it fast (< 30s), consistently, while staying in my work view."</p><p><strong>Benchmark:</strong> Shopify, Miro, Kajabi, Circle, Jira. Recurring pattern: sticky bar on selection, "X items selected" counter, confirmation modal for high-impact actions.</p>',
            'case.multi.decisions': '<p><strong>Sticky bar vs alternatives:</strong></p><ul class="case-list"><li>Right-click context menu → not visible enough for users with low tool familiarity</li><li>Persistent top toolbar → interface already had complex side menus, top element = content visibility loss</li><li><strong>Bottom sticky bar (retained)</strong> → maximum visibility on tables and lists, actions accessible for all</li></ul><p><strong>4 quick actions retained</strong> (Tags, Priority, Status, Date): identified by cross-referencing interviews + field observations, validated post-deployment by Mixpanel. Secondary actions (work center change, batch, lock) in the "…" menu.</p><p><strong>"Capacity-aware" variant:</strong> available in Gantt for certain clients. If the destination work center lacks capacity → operation moved to next day or spread.</p><p><strong>Cross-view consistency:</strong> same multi-select behavior in Cards and Gantt despite very different visual structures. User context: production, stress, noise. Need for quick actions without relearning a pattern from one view to another.</p><p><strong>Edge cases:</strong> selection persists during search · selection maintained between Gantt and list · deselection on context switch · selection lost on refresh (deliberate technical choice) · actions on incompatible statuses → warning + confirmation · no selection limit.</p>',
            'case.multi.collaboration': '<p><strong>Specs in dual format:</strong> annotated Figma (design specs) + Linear document (functional spec for design→tech handoff).</p><p><strong>Linear document structure:</strong> context, short/medium/long-term success criteria, Figma link, delta from current state, detailed specs per component, acceptance criteria, and desired Mixpanel trackers.</p><p><strong>Interactive prototype</strong> delivered via Figma to let tech and stakeholders test the flow before development.</p><p><strong>Structured Go/No-Go</strong> with 4 parties: Product, Tech, Sales, Ops.</p>',
            'case.multi.design_solution': '<p>The sticky bar has a <strong>2-level hierarchy</strong>:</p><ul class="case-list"><li><strong>Level 1, Information:</strong> select-all checkbox, counter, number of parts, number of hours, close button.</li><li><strong>Level 2, Actions:</strong> 4 direct buttons + dropdown "…" for secondary actions.</li></ul><p>Checkbox on hover on each OP card, always visible in touch mode (44×44px). Selected state: 2px blue border + pale blue background. The sticky bar persists between actions (only closes manually).</p>',
            'case.multi.outcome': '<p><strong>Mixpanel tracking plan</strong> set up from deployment to track: which actions are done in multi-select, by which users, in what volume.</p><ul class="case-list"><li><strong>2,250 multi-select actions in the first 30 days</strong> (source: Mixpanel). Breakdown by action type and by client visible on the dashboard.</li><li><strong>Most used actions:</strong> sector (work center) change and priorities lead, followed by tags and statuses.</li><li><strong>Adoption:</strong> all clients with access to the feature use it daily.</li><li><strong>Estimated time savings:</strong> ~100 operations processed per week per planner, going from 30s-1min per operation (individual) to a few seconds per batch. Potentially 50 to 100 minutes/week saved per planner.</li><li><strong>Delivery time:</strong> ~7 days of design work, 4 months from scoping to production deployment (including design, staging, demo, prod, and feedback/corrections).</li></ul>',
        },

        fr: {
            // Nav
            'nav.who':      'À propos',
            'nav.projects': 'Projets',
            'nav.star':     'Sauvegarder',

            // Landing
            'landing.line1':    'Rendre simple d\'utilisation des produits complexes et exigeants.',
            'landing.line2_pre':'Actuellement chez ',
            'landing.sub':      'Guillaume Caillet · Senior Product Designer · France',
            'landing.sub_name': 'Guillaume Caillet',
            'landing.sub_role': 'Senior Product Designer',
            'landing.sub_loc':  'France',
            'landing.pitch':    'Sur les 7 dernières années, j\'ai participé à la conception et à l\'amélioration de produits SaaS B2B, aux côtés des équipes de <strong>Oplit</strong> (planification industrielle), <strong>PrestaShop</strong> (300k+ marchands), <strong>Airbus</strong> et <strong>SNCF</strong>. J\'ai piloté des design systems, mené des audits, et livré des chantiers d\'infrastructure sur lesquels les équipes s\'appuient.<br><br>Ce que je cherche : des produits exigeants où le design co-pilote la stratégie, pas une fonction support.',
            'landing.discover': 'Découvrir mon travail →',
            'landing.about':    'À propos de moi',
            'landing.email':    'M\'écrire',
            'landing.linkedin': 'Me suivre sur LinkedIn',
            'landing.scroll':   'Scroll',
            'landing.stat1':    'd\'utilisateurs actifs chez Oplit',
            'landing.stat2':    'd\'erreurs d\'auth chez PrestaShop (300k+ marchands)',
            'landing.stat3':    'd\'exécution design plus rapide avec le design system reconstruit',
            'landing.stat.go':  'voir le projet →',

            // Marquee labels
            'mq.skills':  'Compétences',

            // Who page
            'who.title': 'Qui suis-je ?',
            'who.intro.p1': 'Je suis arrivé dans le design sans y faire vraiment attention.. d\'abord par les jeux auxquels je jouais puis quelque chose de plus profond qui m\'est resté : une curiosité pour les systèmes graphiques et l\'envie de construire moi aussi ces choses qui m\'ont fascinés petit à petit.',
            'who.intro.p2': '<strong>Senior Product Designer</strong> chez <strong>Oplit</strong>, SaaS B2B d\'ordonnancement industriel. Je conçois pour des planificateurs et opérateurs d\'atelier (horlogerie de luxe, aéronautique, mécanique fine). Utilisateurs experts, impact opérationnel direct. J\'ai repris et déployé le design system comme élément structurant de l\'organisation, alignant design, engineering et produit autour d\'un langage commun.',
            'who.intro.p3': 'Ce qui m\'intéresse : les environnements SaaS où le design façonne comment les organisations fonctionnent. Un cadre de décision qui tient, un système de composants qui accélère l\'équipe, une research qui réoriente une roadmap. Je cherche des rôles où le design co-pilote la stratégie produit.',

            'who.section.professional': 'Expériences professionnelles',
            'who.section.other':        'Autres expériences',
            'who.section.studies':      'Études',
            'who.section.mentoring':    'Mentorat',
            'who.section.articles':     'Articles',
            'who.section.podcasts':     'Podcasts',
            'who.section.templates':    'Templates pour Notion',
            'who.section.cv':           'Curriculum Vitae',
            'who.section.links':        'Liens utiles',

            'who.date.oplit':       'Sept. 2025 – Aujourd\'hui',
            'who.date.prestashop':  'Juin 2022 – Sept. 2025',
            'who.date.beapp':       'Juin 2021 – Juin 2022',
            'who.date.lacapsule':   'Oct. 2020 – Juin 2021',
            'who.date.airbus':      'Sept. 2018 – Août 2020',
            'who.date.sncf':        'Mars 2018 – Août 2018',
            'who.date.stereosuper': 'Août 2015 – Sept. 2017',
            'who.date.teacher':     '2025 – Aujourd\'hui',
            'who.date.mentor':      '2024 – Aujourd\'hui',
            'who.date.ecv':         '2021 – Aujourd\'hui',
            'who.date.designschool': '2025',
            'who.date.freelance':   '2020 – Aujourd\'hui',

            'who.role.oplit':       'Senior Product Designer',
            'who.role.prestashop':  'Product Designer',
            'who.role.beapp':       'UX/UI Designer',
            'who.role.lacapsule':   'Consultant UX Designer',
            'who.role.airbus':      'UX Designer, Alternance',
            'who.role.sncf':        'UX Designer, Stage',
            'who.role.stereosuper': 'UX Designer, Alternance',
            'who.role.teacher':     'Enseignant',
            'who.role.ecv':         'Intervenant & Jury',
            'who.role.designschool': 'Chargé de cours',
            'who.company.designschool': 'École de Design Nantes',
            'who.role.freelance':   'Freelance',

            'who.desc.oplit':       '<p><strong>+74% d\'utilisateurs actifs (430 → 747)</strong> et des features clés déployées sur les lignes de production des clients.</p><p>Oplit conçoit un logiciel de planification industrielle pour l\'aéronautique, le luxe et l\'automobile. Je porte le design produit : discovery continue avec clients et prospects, features stratégiques livrées avec le produit et l\'engineering, et le design system que j\'ai reconstruit (44 composants, structuré pour des workflows assistés par IA) qui a accéléré l\'exécution design de 30 à 50%.</p>',
            'who.desc.prestashop':  '<p><strong>Product Designer &amp; Design System Lead (2024)</strong></p><p>Déploiement progressif du système de recherche chez PrestaShop. Structuration et mise à disposition opérationnelle des outils, templates et données utilisateurs pour que les équipes produit y accèdent rapidement et efficacement. L\'objectif : offrir un accès efficace à la recherche utilisateur lors de la conception des produits PrestaShop pour 300k+ marchands.</p><p>Structuration du Design System pour le rendre robuste, flexible et scalable. Proposition d\'axes de développement, structuration de l\'équipe autour du projet et mise en visibilité des travaux.</p><p><strong>Contributeur Design System (2023)</strong></p><p>Implication dans la structuration et l\'implémentation du Design System PrestaShop. Suivi, implémentation et usage des composants et design tokens par l\'ensemble des utilisateurs du système, ainsi que les composants conçus par les Product Designers.</p><p><strong>Product Designer (2022)</strong></p><p>Au sein de l\'équipe Customer Platform, conception et amélioration de l\'expérience utilisateur au travers du compte utilisateur et de l\'expérience de connexion.</p>',
            'who.desc.beapp':       '<p>En charge de l\'UX chez Beapp, travaillant principalement avec le designer UI et en contact avec toutes les personnes impliquées dans les différents projets clients (PO, Business, Tech).</p><p>Conception d\'expériences pour différents types de clients dans les secteurs santé, automobile, alimentaire, institutionnel, etc. Animation d\'ateliers de créativité, d\'immersion et de co-création. En charge de la recherche utilisateur et des tests.</p>',
            'who.desc.lacapsule':   '<p>Travail en tant que consultant UX pour des entreprises souhaitant améliorer leur expérience utilisateur.</p>',
            'who.desc.airbus':      '<p>Intégration de l\'équipe de designers UX/UI (UXiD) dans le cadre d\'un processus de digitalisation du Groupe Airbus. L\'équipe conçoit et repense des processus ainsi que des applications métier et des IHM, en remettant l\'humain au cœur du design.</p><p>Responsable de la diffusion des guidelines UX et des bonnes pratiques au sein du groupe. Collecte des besoins utilisateurs, participation à la conception d\'applications métier, organisation de l\'architecture d\'information, et travail en collaboration avec l\'IT et les autres départements.</p>',
            'who.desc.sncf':        '<p>UX designer en section 574 (innovation) à la SNCF à Nantes. En charge de la conception de personas, de parcours utilisateurs et de l\'ergonomie des écrans pour différentes applications.</p>',
            'who.desc.stereosuper': '<p>Apprenti pendant 2 ans, formé en tant que web designer avec une spécialisation en UX design, travaillant sur plusieurs projets et développant une solide expérience dans un domaine qui me passionne.</p>',
            'who.desc.teacher':     '<ul><li>1ère année : Bases du design et UX/UI (début 2025)</li><li>2ème année : Formation Figma (fin 2025)</li></ul>',
            'who.desc.mentor':      '<p>Accompagnement de designers, quel que soit leur niveau de séniorité, dans leur développement et dans leurs retours sur leurs projets ou perspectives de carrière.</p>',
            'who.desc.ecv':         '<ul><li>Workshop Design System avec les M1 UX : construction d\'une base et compréhension de l\'intérêt d\'un design system (2026)</li><li>Jury M2 UX : sujets de fin d\'étude (2026)</li><li>Éco-design &amp; Design System, Intervenant (2023, 2024, 2025)</li><li>Design System, Projet annuel, 100% d\'étudiants diplômés (2022-2023)</li><li>Méthodes de Recherche Utilisateur, Chargé de cours (2021-2022)</li></ul>',
            'who.desc.designschool': '<ul><li>1ère année : Bases du design et UX/UI</li><li>2ème année : Formation Figma</li></ul>',

            'who.mentoring.link':  'Réserver une session de mentorat avec Guillaume Caillet sur ADPList →',
            'who.articles.text':   'J\'écris sur le <strong>design</strong>, les <strong>design systems</strong> et la <strong>recherche utilisateur</strong>. Des notes de terrain, pragmatiques.',
            'who.articles.link':   'Guillaume Caillet sur Medium →',
            'who.podcast.simon':   'Interview avec Simon Robic sur le mobile-first →',
            'who.templates.link':  'Guillaume Caillet | Créateur de Templates Notion →',
            'who.cv.link':         'Télécharger le CV (PDF) →',
            'who.email':           'M\'écrire',
            'who.linkedin':        'Me suivre sur LinkedIn',

            // Projects
            'projects.title': 'Projets',
            'projects.other.intro': 'Projets antérieurs : concepts, prototypes et travaux étudiants que je trouve toujours pertinents.',
            'projects.filter.key':      'Projets clés',
            'projects.filter.all':      'Tous',
            'projects.filter.ds':       'Design Systems',
            'projects.filter.product':  'Produit',
            'projects.filter.research': 'Research',
            'projects.filter.tooling':  'Tooling',

            // Footer
            'footer.role':    'Senior Product Designer',
            'footer.email':   'contact@guillaumecaillet.fr',
            'footer.status':  'Ouvert aux opportunités',
            'footer.cta.kicker': 'Mon profil vous intéresse ? Connectons-nous.',
            'footer.cta.msg':    'Envoyez-moi un message',

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
            'case.ca.subtitle': 'Unifier trois comptes PrestaShop fragmentés (Back Office, Marketplace, Business Care) en un seul, pour que les utilisateurs n\'aient plus à appeler le support pour changer leur email.',
            'case.ca.metric1.value': '3 → 1',
            'case.ca.metric1.label': 'compte client unifié',
            'case.ca.metric2.value': '0',
            'case.ca.metric2.label': 'dépendance au support pour les mises à jour basiques',
            'case.ca.metric3.value': 'Kano basic',
            'case.ca.metric3.label': 'need, structuré comme infrastructure, pas comme feature',
            'case.ca.situation': '<p>3ème volet de l\'unification de l\'identité utilisateur (après Sign in/Sign up et Store Association).</p><ul class="case-list"><li>Pas de « compte client » : données dispersées entre back-office, marketplace, aucun espace central</li><li>Les utilisateurs ne pouvaient pas modifier eux-mêmes email, mot de passe → obligés de contacter le support</li><li>Volume de tickets support significatif sur ce seul sujet</li></ul><p><strong>Cadrage Kano :</strong> besoin de base, pas feature « wow ». L\'absence génère de la frustration, la présence est une évidence. L\'enjeu : convaincre les stakeholders d\'investir sur un chantier « invisible » mais structurant.</p>',
            'case.ca.research_discovery': '<p>Pas de research spécifique. Les insights sont issus directement de la research Sign in/Sign up (5 interviews + Mixpanel + support). Benchmark : Shopify, WooCommerce, Wix ont tous un espace compte centralisé → standard marché, pas innovation.</p>',
            'case.ca.decisions': '<p><strong>Scope V1 vs V2 :</strong></p><ul class="case-list"><li>V1 (livré) : données personnelles (nom, email, tél, pays, mdp) + identification boutique + liens services PrestaShop</li><li>Coupé du V1 : multi-boutique, gestion facturation → ajouté par itérations</li></ul><p><strong>Consolidation BDD :</strong> requirements UX posés (données, structure, droits), la tech a conçu la migration des bases marketplace, help center et back-office.</p><p><strong>Suppression de compte (RGPD) :</strong> comptes en doublon identifiés. Discussion légal → double argument : compliance RGPD + réduction coûts serveur.</p><p><strong>Distinction Personal info / Business info :</strong> la séparation existait mais était mal organisée. Rendue explicite et accessible.</p>',
            'case.ca.collaboration': '<p><strong>Récupération de scope cross-squads :</strong> l\'équipe Marketplace gérait les données « utilisateur client » alors que cela relevait légitimement de l\'équipe Account. Le transfert de scope s\'est fait naturellement car il libérait de la bande passante pour l\'équipe Marketplace.</p><p><strong>Friction avec l\'équipe Payment :</strong> les données de paiement étaient gérées dans un environnement technique séparé. Récupérer cette brique a été complexe côté technique et a nécessité une collaboration rapprochée.</p><p><strong>Workshops :</strong> brainstorms d\'1h à 1h30 avec PM, Designer et Leads Tech. Format : propositions et prises de décision sur la façon de centraliser l\'information.</p>',
            'case.ca.design_solution': '<p>Un espace centralisé unique où l\'utilisateur voit ses données personnelles, ses données business et ses liens vers tous les services PrestaShop. Distinction claire entre les sections Personal info et Business info, autonomie totale pour toutes les mises à jour basiques, et possibilité de suppression de compte (conformité RGPD).</p>',
            'case.ca.outcome': '<ul class="case-list"><li><strong>Réduction significative des tickets support</strong> liés aux modifications de données personnelles. Absence quasi-totale de plaintes post-launch.</li><li><strong>Autonomie totale :</strong> les marchands modifient leurs données perso et business sans support.</li><li><strong>Données synchronisées</strong> sur tous les services PrestaShop (marketplace, help center, back-office).</li><li><strong>Indicateur Kano :</strong> le succès se mesure par la disparition du problème, pas par des applaudissements.</li></ul>',

            // Sign in/up
            'case.si.title':    'Sign in / Sign up Flow',
            'case.si.subtitle': 'Diviser par deux les erreurs d\'authentification en refondant la connexion sur l\'ensemble de l\'écosystème PrestaShop (back office, marketplace, centre d\'aide).',
            'case.si.metric1.value': '-50%',
            'case.si.metric1.label': 'd\'erreurs d\'authentification (7k en moy. vs 15k avant)',
            'case.si.metric2.value': '-50%',
            'case.si.metric2.label': 'de réduction du flux (5 étapes → 3 étapes)',
            'case.si.metric3.value': '50%',
            'case.si.metric3.label': 'des connexions via Google SSO en 6 mois',
            'case.si.situation': '<p>Écosystème e-commerce open-source, 300k+ marchands. 4 points d\'entrée (back-office, marketplace, help center, business care) avec chacun son propre système d\'auth et sa propre base de données.</p><ul class="case-list"><li>Les utilisateurs avaient jusqu\'à 3 sets d\'identifiants distincts, non synchronisés</li><li>~15 000 erreurs d\'authentification par mois en moyenne (Mixpanel, 2023-2024)</li><li>Le volume de tickets consommait la majorité de la bande passante de l\'équipe Account</li></ul>',
            'case.si.research_discovery': '<p>5 interviews marchands (semi-directif, contact direct) + data Mixpanel + retours support.</p><p><strong>Hypothèses testées :</strong></p><ul class="case-list"><li><strong>« Trop de moyens de connexion »</strong> → <strong>Confirmé.</strong> Les utilisateurs ne savaient pas quel identifiant utiliser pour quel service.</li><li><strong>« Parcours peu intuitif »</strong> → <strong>Confirmé.</strong> 5 étapes à la création de compte (données perso, typologie, données boutique, validation, confirmation email).</li><li><strong>« Identifiants acceptés pas explicites »</strong> → <strong>Confirmé.</strong> Pas de feedback sur quel type de credentials fonctionnait où.</li><li><strong>« Connexion avec identifiants locaux sur la marketplace »</strong> → <strong>Confirmé.</strong> Source majeure d\'erreurs.</li><li><strong>« Email différent pour chaque service »</strong> → <strong>Infirmé.</strong> Le problème était l\'éclatement des bases de données : chaque service avait la sienne, sans communication entre elles. Impossible d\'identifier une même personne entre back-office, marketplace et help center si les adresses différaient.</li><li><strong>« Marchands gèrent leur boutique seuls »</strong> → <strong>Infirmé.</strong> Certaines boutiques sont gérées par des agences → sujet rôles/permissions (traité dans Store Association).</li></ul>',
            'case.si.decisions': '<p><strong>Découpe du scope en 3 tickets</strong> (accord PM + Designer + Lead Dev) :</p><ol class="case-list"><li>Sign in / Sign up : refonte auth et création de compte</li><li>Store Association : association boutique → compte PrestaShop</li><li>Customer Account : espace centralisé données perso et pro</li></ol><p><strong>Alternatives écartées :</strong></p><ul class="case-list"><li>Magic link → complexité technique trop élevée sur le socle existant. SSO Google classique retenu.</li><li>Code double authentification → ajoutait de la friction. Pas prioritaire V1.</li><li>Réclamation de boutique par URL → impossible de prouver la filiation. Redirigé vers Store Association avec UUID.</li><li>Merge automatique des comptes → risque trop élevé sur l\'identification. Consolidation progressive via le système unifié.</li></ul><p><strong>Trade-off principal, simplicité utilisateur vs complexité technique :</strong> La tendance de l\'équipe était de faire porter la complexité sur l\'utilisateur (codes techniques dans les messages d\'erreur, affichage de requirements techniques). Le parti pris design : traiter la complexité côté système. L\'utilisateur entre son email, le système gère le reste. Concrètement : les messages d\'erreur initiaux contenaient un code technique pour le support. Remplacés par des messages compréhensibles, sans exposer d\'information sensible.</p>',
            'case.si.collaboration': '<ul class="case-list"><li><strong>Squad de 7 :</strong> product trio (PM + Lead Dev + Product Designer) + devs back-end + Scrum Master + QA</li><li><strong>Rôle designer :</strong> animation brainstorms, ateliers discovery, focus design, challenge design</li><li><strong>Alignement cross-squads :</strong> le sign-in touchait 3 services et donc 3 équipes. Syncs inter-squads. Sujet reconnu comme névralgique → priorisation facilitée.</li></ul>',
            'case.si.design_solution': '<p>Le flow est passé de <strong>5 étapes à 3 étapes</strong> :</p><ol class="case-list"><li>Création de compte (données essentielles uniquement + option "Sign up with Google" en premier)</li><li>Profil utilisateur (typologie : marchand, agence, freelance)</li><li>Arrivée sur le compte unifié</li></ol><p>Priorisation du SSO Google en position dominante dans l\'interface (bouton en haut, avant le formulaire classique). Éducation utilisateur intégrée au flow : faire comprendre qu\'un seul compte PrestaShop suffit pour tous les services.</p>',
            'case.si.outcome': '<p><strong>Tracking plan dédié</strong> mis en place pour mesurer le mode de connexion (credentials vs Google SSO).</p><ul class="case-list"><li><strong>Réduction de 50% des erreurs d\'authentification :</strong> 167k utilisateurs connectés avec seulement ~7k erreurs en moyenne (2024-2025) vs ~15k erreurs en moyenne (2023-2024). Source : Mixpanel.</li><li><strong>Réduction de 50% de la longueur du flow :</strong> de 5 étapes à 3 étapes pour la création de compte.</li><li><strong>Adoption croissante du SSO Google :</strong> visible sur le graph Mixpanel avec un croisement des courbes credentials/Google sur la période post-launch, montrant une migration progressive vers le SSO.</li><li><strong>Retombées indirectes :</strong> la réduction des erreurs d\'auth a libéré de la bande passante pour l\'équipe Account qui pouvait enfin se concentrer sur le développement de features.</li></ul>',

            // Store Association
            'case.sa.title':    'Store Association Flow',
            'case.sa.subtitle': 'Refonte du flux d\'association entre le compte utilisateur et la boutique, le rendant transparent et résistant aux erreurs.',
            'case.sa.metric1.value': '600+',
            'case.sa.metric1.label': 'associations réussies par jour',
            'case.sa.metric2.value': '~–40%',
            'case.sa.metric2.label': 'baisse estimée des abandons sur erreur',
            'case.sa.situation': '<p>Le processus d\'association de boutique, notamment pour les installations open-source, était une source majeure de confusion. Les marchands ne comprenaient pas pourquoi l\'association était nécessaire et abandonnaient le processus, surtout lorsque des erreurs survenaient.</p><p>L\'association existe car la plupart des utilisateurs ont des boutiques Open Source installées localement sur leur hébergement, pas toujours identifiées comme appartenant au compte propriétaire. L\'association crée ce lien.</p>',
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
            'case.dsexec.automation':  '<p>L\'application des token bindings était la tâche à plus haut volume. Je l\'ai automatisée avec Claude Code et le MCP Figma (Model Context Protocol, permet aux agents IA de piloter Figma directement) : 1 755 bindings appliqués en une seule session, 45 000+ nœuds analysés, 879 corrections automatiques. Ce qui aurait pris des semaines a pris des heures.</p><p class="case-caption"><em>L\'automatisation ne remplace pas la revue, chaque binding a été vérifié. La vitesse sans gouvernance, c\'est juste de la régression plus rapide.</em></p>',
            'case.dsexec.alignment':   '<p>Workflow dev-alignment en 4 étapes : <strong>Figma</strong> (design terminé, tokens appliqués) → <strong>doc Notion</strong> (états, variantes, props) → <strong>Storybook/Chromatic</strong> (implémentation revue par le designer) → <strong>ticket Linear fermé</strong>. Au 22 avril 2026 : 11 composants en revue dev : FButton, FTextfield, OpalSwitch, FChip, FDialog, et 6 autres.</p>',
            'case.dsexec.results':     '<p>44 composants reconstruits. 0 valeur en dur restante. 3 → 1 librairie d\'icônes. Gain estimé de +20–30% par cycle de feature. Le design system est passé d\'un système implicite et non documenté à une infrastructure structurée, scalable et alignée avec le dev.</p>',

            // Plugin Figma
            'case.plugin.title':    'Plugin Figma, Local Components Collector',
            'case.plugin.subtitle': 'Un plugin JavaScript construit avec la Figma Plugin API pour automatiser l\'audit des composants locaux, réduisant le temps d\'audit DS de plusieurs jours à quelques heures.',
            'case.plugin.metric1.value': 'jours → heures',
            'case.plugin.metric1.label': 'réduction du temps d\'audit DS',
            'case.plugin.metric2.value': '0',
            'case.plugin.metric2.label': 'navigation manuelle fichier par fichier',
            'case.plugin.metric3.value': 'Solo',
            'case.plugin.metric3.label': 'livré sans ressource engineering',
            'case.plugin.problem':   '<p>Sans outil dédié, identifier les composants locaux non factorisés dans un fichier Figma est entièrement manuel : ouvrir chaque frame, inspecter chaque élément, noter les doublons. Aucune vue consolidée n\'existe nativement. Cela retarde directement les travaux de factorisation et fait croître silencieusement la dette design.</p>',
            'case.plugin.approach':  '<p>J\'ai identifié le besoin via une friction personnelle lors d\'un audit DS chez Oplit. Plutôt que d\'attendre une solution engineering, j\'ai construit l\'outil moi-même. J\'ai défini les critères d\'un "candidat à la factorisation" : fréquence d\'usage, présence de variantes, complexité visuelle et structurelle.</p>',
            'case.plugin.howworks': '<p>Le plugin est écrit en JavaScript avec la Figma Plugin API. Il crawle tous les nœuds du fichier courant, détecte les composants locaux (hors librairie partagée), et génère un rapport structuré : nom du composant, nombre d\'usages, frame parente, score de priorité. Le rapport s\'affiche directement dans le panel du plugin, sans export nécessaire.</p>',
            'case.plugin.impact':    '<p>Temps d\'audit DS réduit de plusieurs jours à quelques heures. Les candidats à la factorisation sont identifiés objectivement. Le plugin est la preuve qu\'un designer senior peut créer de la valeur outillage sans attendre la capacité engineering.</p>',

            // Opal DS Audit (2025)
            'case.dsaudit.title':    'Opal DS · Audit',
            'case.dsaudit.subtitle': 'Audit systématique du design system Opal, findings gradués contre quatre frameworks de référence, et plan de remédiation en 3 horizons que j\'ai exécuté dans les mois suivants.',
            'case.dsaudit.metric1.value': '3 niveaux',
            'case.dsaudit.metric1.label': 'sévérité CRITICAL / WARNING / INFO',
            'case.dsaudit.metric2.value': '3 horizons',
            'case.dsaudit.metric2.label': 'plan Immédiat / Prochain / Futur',
            'case.dsaudit.metric3.value': '4 frameworks',
            'case.dsaudit.metric3.label': 'Atomic Design · BEM · DTCG · WCAG 2.1 AA',
            'case.dsaudit.situation':    '<p>Design et code ne se parlaient pas. Le même bouton apparaissait en 5 variantes différentes selon la page. Aucune documentation partagée n\'existait. Les règles vivaient dans les têtes. Chaque nouveau développeur devait reconstruire le système par rétro-ingénierie à partir de la production.</p>',
            'case.dsaudit.methodology':  '<p>J\'ai construit un protocole d\'audit custom via le MCP Figma (Model Context Protocol) : lecture systématique de chaque composant dans la librairie, évalué contre 4 frameworks : Atomic Design (structure), BEM (nommage), DTCG (Design Tokens Community Group, standard d\'architecture de tokens), WCAG 2.1 AA (accessibilité). Chaque finding était gradué : CRITICAL (bloque l\'usage correct), WARNING (incohérence, risque de dette), INFO (opportunité d\'amélioration).</p>',
            'case.dsaudit.findings':     '<p><strong>Button, NON-COMPLIANT :</strong> valeurs hex dans les propriétés shadow, collision de la prop "Type" avec un mot-clé réservé, conflits de chemin de tokens. <strong>Foundations, NEEDS WORK :</strong> conventions de nommage forkées, 3 noms différents pour la même primitive d\'opacité. Rapport structuré par sévérité avec 3 horizons : Immédiat (blocages), Prochain (prochain sprint), Futur (backlog).</p>',
            'case.dsaudit.plan':         '<p>Plan de remédiation en 5 étapes : 1. Audit → 2. Bases (tokens couleur, espacement, typographie, icônes, vocabulaire) → 3. Composants (reconstruits un par un) → 4. Alignement dev (Storybook, workflow de revue) → 5. Déploiement. Critères d\'entrée/sortie explicites à chaque étape.</p>',

            // Transfert de charge entre secteurs
            'case.transfer.title':    'Transfert de charge entre secteurs',
            'case.transfer.subtitle': 'De 8 étapes manuelles dans Excel à 1 action avec feedback en temps réel, permettant à un grand constructeur automobile de débloquer le déploiement multi-sites.',
            'case.transfer.metric1.value': 'Déployé',
            'case.transfer.metric1.label': 'feature live et adoptée',
            'case.transfer.metric2.value': 'Hebdo',
            'case.transfer.metric2.label': 'utilisation régulière depuis le lancement (Mixpanel)',
            'case.transfer.metric3.value': '10+ sites',
            'case.transfer.metric3.label': 'déploiement multi-sites débloqué',
            'case.transfer.metric4.value': '3,5 mois',
            'case.transfer.metric4.label': 'du cadrage à la production avec une équipe de 3',
            'case.transfer.situation': '<p>SaaS de planification industrielle (Industrie 4.0) : aéronautique, horlogerie de luxe, automobile. Le module planification gère demande, capacité, stocks et ordonnancement sur les lignes de production.</p><p><strong>Le problème :</strong> quand une machine est en surcharge (taux de charge > 100%), l\'ordonnanceur doit transférer de la demande vers une autre machine. Avant : processus entièrement manuel.</p><p><strong>Le processus en 8 étapes</strong> (documenté en session) :</p><ol class="case-list"><li>Onglet fabrication → augmenter la capacité → toujours en surcharge</li><li>Équilibrer charge/capacité → taux 100%</li><li>Onglet stock → vérifier l\'impact → stock négatif</li><li>Calculer les pièces à transférer (écart demande vs objectif)</li><li>Identifier les références transférables</li><li>Effectuer les transferts (référence A, puis B…)</li><li>Secteur d\'origine : vérifier stock projeté</li><li>Secteur destination : ajuster manuellement l\'objectif</li></ol><p><strong>Enjeu business :</strong> le client (un grand constructeur automobile, multi-sites) ne pouvait pas déployer Oplit sur 10+ sites supplémentaires sans cette feature. Convergence besoin utilisateur critique + enjeu commercial (rétention + expansion).</p>',
            'case.transfer.research_discovery': '<p><strong>Co-création avec le client, 5-6 sessions itératives :</strong></p><ul class="case-list"><li>Observations à distance du workflow réel de l\'ordonnanceur</li><li>Cartographie des workarounds (Excel, calculs manuels, mémoire)</li><li>Itérations successives jusqu\'au design final</li></ul><p><strong>Framework FOCUSED :</strong></p><ul class="case-list"><li><strong>Frame :</strong> métriques de succès quantifiées (0 rupture stock, taux de charge optimal, deals signés grâce au module)</li><li><strong>Observe :</strong> « Je suis le responsable planning, machines surchargées, processus d\'optimisation manuel, pénible et long »</li><li><strong>Claim :</strong> « Transférez en 3 clics, visualisez l\'impact en temps réel, annulez en 1 clic »</li><li><strong>Unfold :</strong> 5 touchpoints (stock → secteur → transférer → impact immédiat → ajuster)</li><li><strong>Steal :</strong> Notion (backlinks bidirectionnels), GitHub (PR reverts), Figma (instances/master), Stripe (transactions liées)</li><li><strong>Execute :</strong> happy path + sad path + 4 hypothèses</li><li><strong>Decide :</strong> Go/No-Go structuré (Product, Tech, Sales, Ops)</li></ul><p><strong>Découverte critique :</strong> le vocabulaire du client ne correspondait pas au nôtre. « Charge » pour eux = « demande ». « Objectif de production » pour eux = « capacité ». Identifié en session de test → ajustement du wording.</p><p><strong>Hypothèses à valider :</strong></p><ol class="case-list"><li>Système de double ligne (émission + réception) compris instantanément → testé en session</li><li>Ajustements automatiques préférés à la saisie manuelle → ratio auto/manuel via Mixpanel</li><li>Annulation découvrable et utilisée au bon moment → taux d\'utilisation + délai création/annulation</li><li>Cohérence globale des stocks comprise → monitoring tickets « stock disparu »</li></ol>',
            'case.transfer.decisions': '<p><strong>Contrainte structurelle :</strong> 1 seul dev. Chaque décision passait le filtre « buildable dans ce cycle ? » (fin 2025 → mi-mars 2026).</p><p><strong>Retenu :</strong></p><ul class="case-list"><li><strong>Transfert manuel avec suggestions pré-calculées :</strong> l\'ordonnanceur reste aux commandes. Ne pas automatiser ce que l\'utilisateur a besoin de comprendre. La confiance vient de la transparence.</li><li><strong>Double ligne (émission + réception) :</strong> inspiré de Notion/GitHub/Stripe. Transfert Secteur 1 → Secteur 2 = ligne d\'émission (tag « Transfert partiel/complet ») + ligne de réception (tag « Transfert reçu »). Lien bidirectionnel cliquable.</li><li><strong>Annulation en 1 clic</strong> depuis la ligne de réception. Restauration automatique. Demande n°1 du client.</li><li><strong>Tags visuels</strong> (Partiel/Complet/Reçu) : feedback immédiat sans ouvrir les détails.</li></ul><p><strong>Coupé du scope V1 :</strong></p><ul class="case-list"><li>Optimisation automatique des routes → trop complexe pour 1 dev</li><li>Suggestions de routes alternatives → même raison</li><li>Taux de charge projeté sur la destination → V2 backlog. Taux actuel affiché dans la modale, pas la projection.</li></ul><p><strong>Edge cases :</strong></p><ul class="case-list"><li>Transfert > stock disponible → erreur + blocage</li><li>Modification de la ligne de réception → dropdown désactivé + tooltip</li><li>Multi-sélection + transfert → incompatible V1</li><li>Annulation après démarrage production → blocage + message explicatif</li></ul>',
            'case.transfer.collaboration': '<p><strong>Équipe :</strong> trio Produit (PM + Product Designer + 1 Dev).</p><p><strong>5-6 sessions de co-création avec le client :</strong> format itératif : présentation de réflexions métier et de propositions d\'interface, retours du client sur son workflow réel et ses workarounds, ajustements.</p><p><strong>Livrables design :</strong></p><ul class="case-list"><li>Figma : specs annotées + prototype interactif</li><li>Linear : spec fonctionnelle avec contexte, critères de succès (court/moyen/long terme), lien Figma, delta par rapport à l\'existant, specs détaillées, critères d\'acceptation et trackers Mixpanel</li></ul><p><strong>Participants aux tests :</strong> l\'ordonnanceur du client en sessions de test sur staging avant le déploiement en production. Ajustements post-test (terminologie, patterns d\'interaction).</p><p><strong>Gestion de la contrainte d\'équipe :</strong> avec 1 seul dev, le designer (moi) devait fournir des specs exhaustives dès le premier handoff pour minimiser les allers-retours. Les specs Linear incluaient systématiquement les edge cases et sad paths.</p>',
            'case.transfer.design_solution': '<p><strong>Le flow utilisateur final (Happy Path) :</strong></p><ol class="case-list"><li>L\'ordonnanceur identifie un secteur en surcharge. « Secteur 1 » affiche un badge rouge « Taux de charge : 200% » + une alerte « Stock min : 1 rupture »</li><li>Il clique sur le dropdown de la référence à transférer (ex. « Nervures-10 »)</li><li>Il sélectionne « Transférer la charge »</li><li>La modale s\'ouvre avec les informations pré-remplies (période, opération, secteur d\'origine verrouillé)</li><li>Il sélectionne la destination (ex. « Secteur 2 ») → le taux de charge actuel s\'affiche (ex. « 15% »)</li><li>Il choisit la quantité à transférer (ex. 45 sur 90 pièces)</li><li>Il valide</li><li>Résultat immédiat. Sur le Secteur 1 : la référence affiche un tag « Transfert partiel » avec une sous-ligne « Vers Secteur 2 ↗ » et l\'objectif de production ajusté (de 90 à 45, avec indication de l\'original). Sur le Secteur 2 : la référence apparaît avec un tag « Transfert reçu » et une sous-ligne « Depuis Secteur 1 ↗ ». Le graphique d\'évolution du stock affiche des barres hachurées pour l\'objectif transféré. Une nouvelle ligne « Obj. prod. transféré » apparaît dans le tableau de détail.</li><li>L\'ordonnanceur peut annuler le transfert en un clic depuis la ligne de réception</li><li>Il peut itérer : faire plusieurs transferts successifs jusqu\'à l\'équilibre optimal</li></ol>',
            'case.transfer.outcome': '<p><strong>Feature adoptée et utilisée chaque semaine</strong> (Mixpanel).</p><ul class="case-list"><li><strong>Déploiement multi-sites débloqué :</strong> le client lance le déploiement sur 10+ sites. Impact business le plus significatif : la feature conditionnait l\'expansion du contrat.</li><li><strong>Processus éliminé :</strong> 8 étapes Excel → 1 action avec feedback visuel, traçabilité complète et annulation en 1 clic.</li><li><strong>Confiance utilisateur :</strong> l\'ordonnanceur voit exactement ce qu\'il a transféré, d\'où, vers où, et peut annuler. La traçabilité résout le problème initial.</li></ul><blockquote><p>« Les options qu\'on a demandées, elles fonctionnent. On a franchi un vrai cap. Je n\'ai plus de bloqueurs pour avancer sur le déploiement des autres sites. »</p><p>– Responsable planification de production</p></blockquote>',

            // Multi-sélection & Sticky Action Bar (fusionnés)
            'case.multi.title':    'Multi-sélection & Sticky Action Bar',
            'case.multi.subtitle': 'Un pattern couplé : la multi-sélection déclenche une sticky action bar, pour qu\'un planificateur puisse modifier 50 ordres de fabrication en un clic plutôt qu\'en cinquante. Même comportement en vue cards et en Gantt.',
            'case.multi.metric1.value': '2 250',
            'case.multi.metric1.label': 'actions groupées sur les 30 premiers jours (Mixpanel)',
            'case.multi.metric2.value': '4 vues',
            'case.multi.metric2.label': 'comportement cohérent en cards & Gantt',
            'case.multi.metric3.value': '~7 jours',
            'case.multi.metric3.label': 'de design / 4 mois jusqu\'à la production',
            'case.multi.metric4.value': '50-100',
            'case.multi.metric4.label': 'min/semaine économisées par planificateur (estimé)',
            'case.multi.context': '<p>SaaS de planification industrielle, 12 clients (aéro, horlogerie de luxe, mécanique fine), 3 à 5 utilisateurs par client. 4 vues de travail principales (OF, En-cours, Suivi d\'avancement en cards et Gantt).</p><p><strong>Le problème :</strong> aucune multi-sélection. Chaque action (tag, priorité, statut, déplacement) se faisait opération par opération.</p><ul class="case-list"><li>Taguer 5 opérations : 5× (clic → tag → valider) = 2-3 min</li><li>Prioriser un OF de 16 opérations : 16× (ouvrir → modifier → valider) = 5-10 min</li><li>Impact : 5 à 15 min perdues/jour/utilisateur</li></ul><p>La multi-sélection est un standard (Shopify, Jira, etc.). Son absence générait une frustration forte.</p><p><strong>Verbatims clients :</strong></p><ul class="case-list"><li>« Je veux sélectionner 5 opérations et leur mettre le tag "Urgent" en 1 clic au lieu de le faire une par une. »</li><li>« Quand un OF devient prioritaire, je veux le prioriser pour tous les ateliers sans ouvrir chaque opération. »</li><li>« J\'ai besoin de déplacer un OF complet (16 opérations) vers un autre poste de charge sans faire 16 fois la même action. »</li></ul>',
            'case.multi.research_discovery': '<p><strong>Sources convergentes :</strong></p><ul class="case-list"><li>Demandes clients récurrentes remontées par l\'OPS en hebdos</li><li>Interviews utilisateurs (comportements et patterns d\'usage)</li><li>Observations à distance (partage d\'écran) avec 2 clients</li></ul><p>Structuration de la discovery via le framework FOCUSED (détaillé dans le cas Transfert de charge).</p><p><strong>First Use Case :</strong> « En tant qu\'ordonnanceur, quand je veux appliquer tags, priorités ou statuts sur plusieurs opérations en une action, ce qui compte c\'est de le faire vite (< 30s), de façon cohérente, en restant dans ma vue de travail. »</p><p><strong>Benchmark :</strong> Shopify, Miro, Kajabi, Circle, Jira. Pattern récurrent : sticky bar à la sélection, compteur « X éléments sélectionnés », modale de confirmation pour les actions à fort impact.</p>',
            'case.multi.decisions': '<p><strong>Sticky bar vs alternatives :</strong></p><ul class="case-list"><li>Menu contextuel (clic droit) → pas assez visible pour des utilisateurs peu familiers des outils</li><li>Toolbar persistante en haut → l\'interface avait déjà des menus latéraux complexes, élément en haut = perte de visibilité contenu</li><li><strong>Bottom sticky bar (retenu)</strong> → visibilité maximale sur tables et listes, actions accessibles pour tous</li></ul><p><strong>4 quick actions retenues</strong> (Tags, Priorité, Statut, Date) : identifiées par croisement interviews + observations terrain, validées post-déploiement par Mixpanel. Actions secondaires (changement de poste, lot, verrou) dans le menu "…".</p><p><strong>Variante « capacity-aware » :</strong> disponible en Gantt pour certains clients. Si le poste de destination n\'a pas la capacité → opération déplacée au jour suivant ou étalée.</p><p><strong>Cohérence cross-vues :</strong> même comportement multi-sélection en Cards et Gantt malgré des structures visuelles très différentes. Contexte utilisateur : production, stress, bruit. Besoin d\'actions rapides sans réapprendre un pattern d\'une vue à l\'autre.</p><p><strong>Edge cases :</strong> sélection persistante pendant la recherche · sélection maintenue entre Gantt et liste · désélection au changement de contexte · sélection perdue au rafraîchissement (choix technique délibéré) · actions sur statuts incompatibles → warning + confirmation · pas de limite de sélection.</p>',
            'case.multi.collaboration': '<p><strong>Specs en double support :</strong> Figma annotées (design specs) + document Linear (spec fonctionnel pour le handoff design→tech).</p><p><strong>Structure du document Linear :</strong> contexte, critères de réussite à court/moyen/long terme, lien Figma, delta par rapport à l\'état actuel, specs détaillées par composant, acceptance criteria, et trackers Mixpanel souhaités.</p><p><strong>Prototype interactif</strong> livré via Figma pour permettre à la tech et aux stakeholders de tester le flow avant développement.</p><p><strong>Go/No-Go structuré</strong> avec 4 parties : Produit, Tech, Sales, Ops.</p>',
            'case.multi.design_solution': '<p>La sticky bar a une <strong>hiérarchie à 2 niveaux</strong> :</p><ul class="case-list"><li><strong>Niveau 1, Informations :</strong> checkbox tout sélectionner, compteur, nb pièces, nb heures, bouton fermer.</li><li><strong>Niveau 2, Actions :</strong> 4 boutons directs + dropdown « … » pour les actions secondaires.</li></ul><p>Checkbox au hover sur chaque carte OP, toujours visible en mode tactile (44×44px). État sélectionné : border bleu 2px + fond bleu pâle. Persistance de la sticky bar entre les actions (ne se ferme que manuellement).</p>',
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
    }

    // Initialise language on load
    setLang(currentLang);

    // Lang button click handlers
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });

    // --- Lightbox ---
    const lbOverlay = document.createElement('div');
    lbOverlay.className = 'lightbox-overlay';
    const lbImg = document.createElement('img');
    lbOverlay.appendChild(lbImg);
    document.body.appendChild(lbOverlay);

    function closeLightbox() {
        lbOverlay.classList.remove('active');
    }

    lbOverlay.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    document.addEventListener('click', (e) => {
        const img = e.target.closest('.case-image img, .case-image--cover img');
        if (!img) return;
        e.preventDefault();
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        requestAnimationFrame(() => lbOverlay.classList.add('active'));
    });

    // ===================================
    // Theme switch — light / dark
    // ===================================
    const themeToggle = document.getElementById('theme-toggle');
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('folio-theme', theme);
        if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#ffffff' : '#1a1a1a');
    }

    // Sync meta color with the theme the boot script picked
    if (themeMeta) {
        themeMeta.setAttribute('content',
            document.documentElement.dataset.theme === 'light' ? '#ffffff' : '#1a1a1a');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
            applyTheme(next);
        });
    }

    // Follow system changes only when the user hasn't chosen explicitly
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('folio-theme')) {
            document.documentElement.dataset.theme = e.matches ? 'light' : 'dark';
        }
    });

    // ===================================
    // Scroll reveals — .reveal → .in
    // ===================================
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealEls = document.querySelectorAll('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('in'));
    } else {
        const revealIO = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealIO.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => revealIO.observe(el));
    }

    // ===================================
    // Footer clock — local time in Paris
    // ===================================
    function tickFooterClock() {
        const els = document.querySelectorAll('.footer-time');
        if (!els.length) return;
        const time = new Intl.DateTimeFormat('fr-FR', {
            timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit'
        }).format(new Date());
        els.forEach(el => { el.textContent = `Paris ${time}`; });
    }
    tickFooterClock();
    setInterval(tickFooterClock, 30000);

    // ===================================
    // Projects list — floating "memory card" cover on hover.
    // One generated template per project: same structure, deterministic
    // ASCII motif seeded by the project slug. Desktop pointers only.
    // ===================================
    const COVER_DATA = {
        'project-ds-execution':     { metricKey: 'case.dsexec.metric2.value' },
        'project-multiselect':      { metricKey: 'case.multi.metric1.value', suffix: ' actions' },
        'project-figma-plugin':     { metricKey: 'case.plugin.metric1.value' },
        'project-ds-audit':         { metricKey: 'case.dsaudit.metric3.value' },
        'project-transfer':         { metricKey: 'case.transfer.metric3.value' },
        'project-design-system':    { metricKey: 'case.ds.metric3.value' },
        'project-customer-account': { metricKey: 'case.ca.metric1.value' },
        'project-signin':           { metricKey: 'case.si.metric1.value' },
        'project-store-association':{ metricKey: 'case.sa.metric1.value' }
    };

    const finePointer = window.matchMedia('(pointer: fine)').matches;

    if (finePointer && !reduceMotion) {
        const preview = document.createElement('div');
        preview.className = 'project-preview';
        preview.innerHTML =
            '<div class="cover-card">' +
                '<div class="cover-grid" aria-hidden="true"></div>' +
                '<div class="cover-code"></div>' +
                '<div class="cover-metric"></div>' +
                '<div class="cover-title"></div>' +
                '<div class="cover-foot"><span>Case study</span><span class="cover-slot"></span></div>' +
            '</div>';
        document.body.appendChild(preview);

        const coverCodeEl   = preview.querySelector('.cover-code');
        const coverMetricEl = preview.querySelector('.cover-metric');
        const coverTitleEl  = preview.querySelector('.cover-title');
        const coverSlotEl   = preview.querySelector('.cover-slot');

        // Build the pixel "life grid" once
        const gridEl = preview.querySelector('.cover-grid');
        const COLS = 44, ROWS = 5;
        const gridCells = [];
        gridEl.style.setProperty('--cols', COLS);
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const cell = document.createElement('i');
                gridEl.appendChild(cell);
                gridCells.push({ el: cell, x, y });
            }
        }
        const GRID_OFF = 'rgba(122, 110, 180, 0.14)';
        function updateGrid(f) {
            for (let k = 0; k < gridCells.length; k++) {
                const o = gridCells[k];
                const wave = ((o.x + o.y * 2 - f) % 9 + 9) % 9;
                const spark = ((o.x * 7 + o.y * 13 + f * 5) % 37) < 2;
                if (wave < 2) {
                    o.el.style.background = wave < 1 ? 'var(--cover-hi)' : 'var(--cover-accent)';
                    o.el.style.opacity = '0.95';
                } else if (spark) {
                    o.el.style.background = 'var(--cover-accent)';
                    o.el.style.opacity = '0.55';
                } else {
                    o.el.style.background = GRID_OFF;
                    o.el.style.opacity = '0.4';
                }
            }
        }

        let pvX = 0, pvY = 0, pvTX = 0, pvTY = 0;
        let pvActive = false;
        let rafCount = 0, gridFrame = 0;

        document.addEventListener('mousemove', (e) => {
            pvTX = e.clientX + 28;
            pvTY = e.clientY - 90;
        });

        (function animPreview() {
            rafCount++;
            pvX += (pvTX - pvX) * 0.14;
            pvY += (pvTY - pvY) * 0.14;
            if (pvActive) {
                const maxX = window.innerWidth - 360;
                const maxY = window.innerHeight - 240;
                preview.style.transform =
                    `translate(${Math.min(pvX, maxX)}px, ${Math.max(12, Math.min(pvY, maxY))}px)`;
                if (rafCount % 7 === 0) { gridFrame++; updateGrid(gridFrame); }
            }
            requestAnimationFrame(animPreview);
        })();

        // Cover accent + highlight follow the company badge color
        const COVER_ACCENTS = {
            'project-company--oplit':      ['#6384ff', '#aec0ff'],
            'project-company--prestashop': ['#a584e6', '#d6c4f2'],
            'project-company--perso':      ['#9aa0a6', '#cfd2d6']
        };

        document.querySelectorAll('#projects .project-card').forEach(card => {
            const slug = card.dataset.page;
            const data = COVER_DATA[slug];
            if (!data) return;
            card.addEventListener('mouseenter', () => {
                const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
                const companyEl = card.querySelector('.project-company');
                const company = companyEl?.textContent || '';
                const title = card.querySelector('.project-name')?.textContent || '';
                const index = card.querySelector('.project-index')?.textContent || '00';
                const accentClass = Object.keys(COVER_ACCENTS)
                    .find(cls => companyEl?.classList.contains(cls));
                const [acc, hi] = COVER_ACCENTS[accentClass] || ['#4d34ff', '#a99cff'];
                preview.style.setProperty('--cover-accent', acc);
                preview.style.setProperty('--cover-hi', hi);
                coverCodeEl.textContent = `GC://${company.replace(/\s+/g, '-')}/${slug.replace('project-', '')}`.toUpperCase();
                coverMetricEl.textContent = (t[data.metricKey] || '') + (data.suffix || '');
                coverTitleEl.textContent = title;
                coverSlotEl.textContent = `Slot ${index}`;
                pvActive = true;
                preview.classList.add('on');
            });
            card.addEventListener('mouseleave', () => {
                pvActive = false;
                preview.classList.remove('on');
            });
        });

        // Never leave a cover floating after a navigation or click
        window.addEventListener('hashchange', () => {
            pvActive = false;
            preview.classList.remove('on');
        });
        document.addEventListener('click', () => {
            pvActive = false;
            preview.classList.remove('on');
        }, true);
    }

})();
