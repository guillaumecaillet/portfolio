(() => {
    'use strict';

    // --- Boot: reveal landing content ---
    setTimeout(() => {
        document.body.classList.remove('loading');
        revealTitle();
    }, 120);

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

    // (scramble / geek hover effect removed in redesign)

    // ===================================
    // Projects filter - chips filter the list by theme or "key" projects.
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

            // Filtering is a deliberate action: end the scroll-reveal intro and
            // show everything that's currently visible.
            const projPage = document.getElementById('landing');
            if (projPage && projPage._projReveal) { projPage.removeEventListener('scroll', projPage._projReveal); projPage._projReveal = null; }
            cards.forEach(c => { if (!c.classList.contains('is-filtered-out')) c.classList.add('visible'); });
            years.forEach(y => { if (!y.classList.contains('is-filtered-out')) y.classList.add('visible'); });
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

    // Real URL per page (History API routing). Keys are page ids, values are paths.
    const ROUTES = {
        'landing':                  '/',
        'who':                      '/who/',
        'project-ds-skills':        '/projects/opal-ds-ai-prototyping-skills/',
        'project-ds-execution':     '/projects/opal-ds-corrective-actions/',
        'project-multiselect':      '/projects/multiselect-sticky-action-bar/',
        'project-figma-plugin':     '/projects/figma-plugin-local-components-collector/',
        'project-ds-audit':         '/projects/opal-ds-audit/',
        'project-transfer':         '/projects/capacity-transfer/',
        'project-expert-experience':'/projects/prestashop-expert-experience/',
        'project-design-system':    '/projects/prestashop-design-system/',
        'project-customer-account': '/projects/prestashop-customer-account/',
        'project-signin':           '/projects/prestashop-signin-signup/',
        'project-store-association':'/projects/prestashop-store-association/'
    };
    const PATH_TO_PAGE = Object.fromEntries(Object.entries(ROUTES).map(([k, v]) => [v, k]));
    // Pages kept out of search engines (excluded from sitemap.xml as well).
    const NOINDEX_PAGES = new Set(['project-transfer', 'project-expert-experience']);
    const ORIGIN = 'https://www.guillaumecaillet.fr';

    function langPrefix() {
        return document.documentElement.lang.toLowerCase().startsWith('fr') ? '/fr' : '';
    }
    function pathForPage(pageId) {
        const path = ROUTES[pageId] || '/';
        const prefixed = langPrefix() + path;
        return prefixed === '/fr/' ? '/fr/' : prefixed;
    }
    function pageForPath(pathname) {
        let p = pathname;
        let fr = false;
        if (p === '/fr' || p.startsWith('/fr/')) { fr = true; p = p.slice(3) || '/'; }
        if (!p.endsWith('/')) p += '/';
        if (p === '//') p = '/';
        return { page: PATH_TO_PAGE[p] || null, fr };
    }

    // Per-page document titles (used for browser tab + SEO).
    const PAGE_TITLES = {
        'landing':                  'Guillaume Caillet · Senior Product Designer · Nantes',
        'who':                      'About, Guillaume Caillet',
        'projects':                 'Projects, Guillaume Caillet',
        'project-ds-skills':        'Opal DS · AI Prototyping Skills, Case Study',
        'project-ds-execution':     'Opal DS · Corrective Actions, Case Study',
        'project-multiselect':      'Multi-select & Sticky Action Bar, Case Study',
        'project-figma-plugin':     'Figma Plugin, Local Components Collector, Case Study',
        'project-ds-audit':         'Opal DS · Audit, Case Study',
        'project-transfer':         'Capacity Transfer Between Sectors, Case Study',
        'project-expert-experience':'PrestaShop Expert Experience, Case Study',
        'project-design-system':    'PrestaShop Design System, Case Study',
        'project-customer-account': 'PrestaShop Customer Account, Case Study',
        'project-signin':           'PrestaShop Sign-in / Sign-up, Case Study',
        'project-store-association':'PrestaShop Store Association, Case Study'
    };

    // Per-page meta description (used for SEO + social previews).
    const PAGE_META = {
        'landing':                  'Guillaume Caillet, Senior Product Designer based in Nantes, France. 7+ years designing B2B SaaS products and design systems for Industry 4.0.',
        'who':                      'Guillaume Caillet, Senior Product Designer based in Nantes. 7+ years across Oplit, PrestaShop, Airbus and SNCF.',
        'projects':                 'Selected case studies, design systems, B2B SaaS, industrial scheduling, and design-ops tooling.',
        'project-ds-skills':        'Opal DS AI Prototyping Skills, two design-system-aware AI skills that let a PM build a client-ready Figma prototype in one morning from a plain-language brief.',
        'project-ds-execution':     'Opal DS Corrective Actions, 44 components rebuilt, 2,634 token bindings applied, +20-30% gain per feature cycle.',
        'project-multiselect':      'Multi-select + Sticky Action Bar, one coupled pattern letting schedulers update 50 work orders in one click.',
        'project-figma-plugin':     'Local Components Collector, a Figma plugin that cuts DS audit time from days to hours.',
        'project-ds-audit':         'Opal DS Audit, graded findings against Atomic Design, BEM, DTCG and WCAG, with a 3-horizon remediation plan.',
        'project-transfer':         'Capacity Transfer Between Sectors, letting industrial schedulers reallocate production across workshops in seconds.',
        'project-expert-experience':'PrestaShop Expert Experience, reshaping a stalled partner portal and a devalued certification. Discovery FOCUSED, target experience, and the optimise / buy / build decision.',
        'project-design-system':    'PrestaShop Design System, 100% squad adoption, 80% in tech, -50% development time.',
        'project-customer-account': 'PrestaShop Customer Account, three accounts unified into one, eliminating support requests for basic updates.',
        'project-signin':           'PrestaShop Sign-in / Sign-up, authentication errors cut in half across the entire ecosystem.',
        'project-store-association':'PrestaShop Store Association, 600+ successful associations per day, -40% error-driven abandonment.'
    };

    // French titles + meta descriptions, used on /fr/ URLs.
    const PAGE_TITLES_FR = {
        'landing':                  'Guillaume Caillet · Senior Product Designer · Nantes',
        'who':                      'À propos, Guillaume Caillet',
        'projects':                 'Projets, Guillaume Caillet',
        'project-ds-skills':        'Opal DS · Skills IA de prototypage, étude de cas',
        'project-ds-execution':     'Opal DS · Actions correctives, étude de cas',
        'project-multiselect':      'Multi-sélection & Sticky Action Bar, étude de cas',
        'project-figma-plugin':     'Plugin Figma, Local Components Collector, étude de cas',
        'project-ds-audit':         'Opal DS · Audit, étude de cas',
        'project-transfer':         'Transfert de capacité entre secteurs, étude de cas',
        'project-expert-experience':'PrestaShop Expert Experience, étude de cas',
        'project-design-system':    'PrestaShop Design System, étude de cas',
        'project-customer-account': 'PrestaShop Compte client, étude de cas',
        'project-signin':           'PrestaShop Connexion / Inscription, étude de cas',
        'project-store-association':'PrestaShop Association de boutique, étude de cas'
    };
    const PAGE_META_FR = {
        'landing':                  'Guillaume Caillet, Senior Product Designer à Nantes. 7+ ans de conception de produits SaaS B2B et de design systems pour l\'industrie 4.0.',
        'who':                      'Guillaume Caillet, Senior Product Designer à Nantes. 7+ ans d\'expérience chez Oplit, PrestaShop, Airbus et SNCF.',
        'projects':                 'Études de cas : design systems, SaaS B2B, ordonnancement industriel et outillage design-ops.',
        'project-ds-skills':        'Opal DS Skills IA de prototypage : deux skills connectées au design system pour qu\'un PM construise un prototype Figma présentable en une matinée.',
        'project-ds-execution':     'Opal DS Actions correctives : 44 composants reconstruits, 2 634 liaisons de tokens, +20-30 % de gain par cycle de feature.',
        'project-multiselect':      'Multi-sélection + Sticky Action Bar : un pattern couplé qui permet de mettre à jour 50 ordres de fabrication en un clic.',
        'project-figma-plugin':     'Local Components Collector, un plugin Figma qui réduit le temps d\'audit d\'un design system de plusieurs jours à quelques heures.',
        'project-ds-audit':         'Opal DS Audit : constats notés selon Atomic Design, BEM, DTCG et WCAG, avec un plan de remédiation en 3 horizons.',
        'project-transfer':         'Transfert de capacité entre secteurs : permettre aux planificateurs de réallouer la production entre ateliers en quelques secondes.',
        'project-expert-experience':'PrestaShop Expert Experience : refonte d\'un portail partenaire à l\'arrêt et d\'une certification dévalorisée.',
        'project-design-system':    'PrestaShop Design System : 100 % d\'adoption par les squads, 80 % côté tech, -50 % de temps de développement.',
        'project-customer-account': 'PrestaShop Compte client : trois comptes unifiés en un seul, suppression des demandes de support pour les mises à jour basiques.',
        'project-signin':           'PrestaShop Connexion / Inscription : erreurs d\'authentification divisées par deux sur tout l\'écosystème.',
        'project-store-association':'PrestaShop Association de boutique : 600+ associations réussies par jour, -40 % d\'abandons liés aux erreurs.'
    };

    function updatePageTitle(pageId) {
        const fr = langPrefix() === '/fr';
        const titles = fr ? PAGE_TITLES_FR : PAGE_TITLES;
        const metas  = fr ? PAGE_META_FR  : PAGE_META;
        const t = titles[pageId] || titles.landing;
        document.title = t;
        // Sync meta description + open graph
        const desc = metas[pageId] || metas.landing;
        const setMeta = (sel, val) => {
            const el = document.querySelector(sel);
            if (el) el.setAttribute('content', val);
        };
        setMeta('meta[name="description"]', desc);
        setMeta('meta[property="og:title"]', t);
        setMeta('meta[property="og:description"]', desc);
        setMeta('meta[name="twitter:title"]', t);
        setMeta('meta[name="twitter:description"]', desc);

        // Canonical + og:url follow the current URL (language-specific).
        const url = ORIGIN + pathForPage(pageId);
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', url);
        setMeta('meta[property="og:url"]', url);

        // Sensitive case studies stay out of search engines.
        let robots = document.querySelector('meta[name="robots"]');
        if (NOINDEX_PAGES.has(pageId)) {
            if (!robots) {
                robots = document.createElement('meta');
                robots.setAttribute('name', 'robots');
                document.head.appendChild(robots);
            }
            robots.setAttribute('content', 'noindex, follow');
        } else if (robots) {
            robots.remove();
        }
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
        updateNav();           // landing-active toggled immediately
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
            history.pushState({ page: target }, '', pathForPage(target));
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
    window.addEventListener('popstate', () => {
        const { page } = pageForPath(location.pathname);
        if (page) {
            navigateTo(page);
        } else {
            showFallbackToast(location.pathname);
            history.replaceState({ page: 'landing' }, '', pathForPage('landing'));
            navigateTo('landing');
        }
    });

    // Soft 404 toast - shown when the user lands on or navigates to an unknown hash.
    function showFallbackToast(missingHash) {
        const fr = langPrefix() === '/fr';
        const msg = fr
            ? `Cette page n'existe plus, retour à l'accueil.`
            : `That page doesn't exist anymore, back to the home page.`;
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

    // Initial navigation: resolve the page from the URL path.
    // Legacy #hash URLs are upgraded to their real path (301-like, via replaceState).
    (function initialRoute() {
        let target = null;
        const { page, fr } = pageForPath(location.pathname);
        const legacyHash = location.hash.slice(1);
        if (fr) document.documentElement.lang = 'fr-FR';
        if (legacyHash && ROUTES[legacyHash]) {
            target = legacyHash; // old #hash link takes precedence, upgraded to its path
        } else if (page) {
            target = page;
        } else if (location.pathname !== '/' || (legacyHash && legacyHash !== 'landing')) {
            // Unknown path or hash - soft 404 back to the landing.
            showFallbackToast(location.pathname + location.hash);
        }
        target = target || 'landing';
        history.replaceState({ page: target }, '', pathForPage(target));
        if (target !== 'landing') {
            document.querySelector('.page--active')?.classList.remove('page--active');
            document.getElementById(target)?.classList.add('page--active');
            currentPage = target;
            updateNav();
            setTimeout(() => animatePageContent(document.getElementById(target)), 100);
        }
        updatePageTitle(currentPage);
    })();

    // --- Projects: scroll-triggered reveal, year group by year group ---
    // 2026 shows on arrival; each next year group (2025, 2024…) fades in
    // with a soft cascade as the user scrolls down to it.
    function revealGroup(group) {
        group.forEach((el, i) => {
            el.style.transitionDelay = (i * 70) + 'ms';
            el.classList.add('visible');
            const t = el;
            setTimeout(() => { t.style.transitionDelay = ''; }, 650 + i * 70);
        });
    }

    function setupProjectsReveal(page) {
        const list = page.querySelector('.projects-list');
        if (!list) return;                                  // not the projects page
        const items = Array.from(list.querySelectorAll('.project-year-label, .project-card'));
        if (!items.length) return;

        // Clean up any previous scroll handler on this page.
        if (page._projReveal) { page.removeEventListener('scroll', page._projReveal); page._projReveal = null; }

        // Theme filter active → just show everything that isn't filtered out.
        if (list.classList.contains('is-filtering')) {
            items.forEach(el => { if (!el.classList.contains('is-filtered-out')) el.classList.add('visible'); });
            return;
        }

        // Build year groups: each year label starts a new group.
        const groups = [];
        items.forEach(el => {
            if (el.classList.contains('project-year-label') || groups.length === 0) groups.push([]);
            groups[groups.length - 1].push(el);
        });

        // Reset hidden.
        items.forEach(el => { el.classList.remove('visible'); el.style.transitionDelay = ''; });

        // Reduced motion → reveal everything at once.
        if (typeof reduceMotion !== 'undefined' && reduceMotion) { groups.forEach(revealGroup); return; }

        // Scroll thresholds, strictly increasing so groups reveal in order and
        // group 0 (2026) is the only one shown at scrollTop 0, any viewport.
        function thresholds() {
            const vh = page.clientHeight, th = [];
            groups.forEach((g, i) => {
                if (i === 0) { th.push(-1); return; }
                const base = g[0].offsetTop - vh * 0.82;
                const prev = th[i - 1] < 0 ? 0 : th[i - 1];
                th.push(Math.max(prev + 60, base));
            });
            return th;
        }
        let th = thresholds();
        let revealed = 0;
        function check() {
            const st = page.scrollTop;
            for (let i = revealed; i < groups.length; i++) {
                if (th[i] <= st) { revealGroup(groups[i]); revealed = i + 1; }
                else break;
            }
            if (revealed >= groups.length) { page.removeEventListener('scroll', check); page._projReveal = null; }
        }
        page._projReveal = check;
        page.addEventListener('scroll', check, { passive: true });
        check();                                                        // reveal 2026 on arrival (sync)
        requestAnimationFrame(() => { th = thresholds(); check(); });   // refine once laid out
    }

    // --- Staggered Content Animations ---
    function animatePageContent(page) {
        // Who am I blocks
        const whoBlocks = page.querySelectorAll('.who-block');
        whoBlocks.forEach((block, i) => {
            block.classList.remove('visible');
            setTimeout(() => block.classList.add('visible'), 200 + i * 120);
        });

        // Year labels & project cards reveal on scroll (2026 on arrival,
        // 2025 then 2024 as you scroll down). Handled by setupProjectsReveal.
        setupProjectsReveal(page);

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

    // (cursor follower + ASCII trail removed in redesign)

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

    // (GitHub-style star/save button removed in redesign)

    // ===================================
    // i18n - FR / EN
    // ===================================
    const TRANSLATIONS = {
        en: {
            // Nav
            'nav.who':      'About',
            'nav.projects': 'Projects',
            'nav.star':     'Save',

            // Landing
            'landing.line1':    'Senior Product Designer',
            'landing.tagline':  'I make complex, demanding products simple. Currently at <a href="https://www.oplit.com" target="_blank" rel="noopener" class="landing-company">Oplit</a>.',
            'landing.meta.loc_k':    'Based in',
            'landing.meta.focus_k':  'Focus',
            'landing.meta.xp_k':     'Experience',
            'landing.meta.xp_v':     '7+ yrs',
            'landing.meta.status_k': 'Status',
            'landing.meta.status_v': 'Available',
            'landing.sub':      'Guillaume Caillet · Senior Product Designer · Nantes, France',
            'landing.sub_name': 'Guillaume Caillet',
            'landing.sub_role': 'Senior Product Designer',
            'landing.sub_loc':  'Nantes, France',
            'landing.pitch':    'Over the last 7 years, I\'ve contributed to the design and improvement of B2B SaaS products, alongside teams at <strong>Oplit</strong> (industrial schedulers), <strong>PrestaShop</strong> (300k+ merchants), <strong>Airbus</strong> and <strong>SNCF</strong>. I\'ve led design systems, run audits, and shipped infrastructure that teams build on.<span class="pitch-seek"><span class="pitch-seek-k">What I\'m looking for</span>High-stakes products where design co-pilots strategy.</span>',
            'landing.discover': 'Discover my work',
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

            'who.date.oplit':       'Sept. 2025 - Present',
            'who.date.prestashop':  'June 2022 - Sept. 2025',
            'who.date.beapp':       'June 2021 - June 2022',
            'who.date.lacapsule':   'Oct. 2020 - June 2021',
            'who.date.airbus':      'Sept. 2018 - Aug. 2020',
            'who.date.sncf':        'March 2018 - Aug. 2018',
            'who.date.stereosuper': 'Aug. 2015 - Sept. 2017',
            'who.date.teacher':     '2025 - Present',
            'who.date.mentor':      '2024 - Present',
            'who.date.ecv':         '2021 - Present',
            'who.date.designschool': '2025',
            'who.date.freelance':   '2020 - Present',

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

            'who.desc.oplit':       '<p><strong>+74% active users (430 → 747)</strong> and key features now running on customers\' production lines.</p><p>Oplit builds production planning software for industrial manufacturers in aerospace, luxury and automotive. I own design on the product: continuous discovery with customers and prospects, strategic features shipped with product and engineering, and the design system I rebuilt (44 components, structured for AI-assisted workflows) which made design execution 30 to 50% faster.</p><p>Latest: two AI skills (operator + builder) that let anyone generate design-system-faithful prototypes in Figma from a plain-language brief. A PM built and presented a client prototype on his own, in one morning.</p>',
            'who.desc.prestashop':  '<p><strong>Product Designer &amp; Design System Lead (2024)</strong></p><p>Progressively structured and deployed the research system across PrestaShop. Responsible for structuring and making the tools, templates, and user data operationally available so product teams could access them quickly and efficiently. The aim: provide efficient access to user research when designing PrestaShop products for 300k+ merchants.</p><p>Also worked on structuring the Design System so teams could rely on it and extend it. Proposing areas for development, structuring the team around the project and giving visibility to the work.</p><p><strong>Design System contributor (2023)</strong></p><p>Involved in structuring and implementing the PrestaShop Design System. Working on the monitoring, implementation, and use of components and design tokens by everyone who uses the design system, as well as the components designed by the Product Designers.</p><p><strong>Product Designer (2022)</strong></p><p>Within the Customer Platform team, working on the design and improvement of the user experience through the user account and, more generally, the login experience.</p>',
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

            // Case studies - shared
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
            'case.section.questions': 'Open questions',
            'case.section.shift':        'The profession is shifting',
            'case.section.craft':        'The new craft',
            'case.section.uncomfortable':'The uncomfortable part',
            'case.section.takeaways':    'What I keep',
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

            'case.expert.title':    'Expert Experience',
            'case.expert.subtitle': 'When design becomes the instrument of a strategic decision: reshaping a stalled partner portal and a hollowed-out certification, and turning a fuzzy, high-stakes problem into a system of defensible decisions.',
            'case.expert.metric1.value': '25%',
            'case.expert.metric1.label': 'real engagement on the Expert portal it was meant to power',
            'case.expert.metric2.value': '22%',
            'case.expert.metric2.label': 'of experts certified, for a certification no one took seriously anymore',
            'case.expert.metric3.value': 'Build',
            'case.expert.metric3.label': 'the option chosen: optimise / buy / build the partner portal',
            'case.expert.fig.decision':    'Mapping the decision: build the portal in-house, buy the exam brick.',
            'case.expert.fig.focused':     'The FOCUSED method, from discovery to prototype.',
            'case.expert.fig.levels':      'Two readable tiers replace a confusing gradient of statuses.',
            'case.expert.fig.touchpoints': 'Five touchpoints, structured around the Channel Manager / Expert insight.',
            'case.expert.shot.invitation':    'Certification, discovery page',
            'case.expert.shot.detail':        'Certification, detail page (premium)',
            'case.expert.shot.select':        'Selecting and inviting a developer',
            'case.expert.shot.dashboard':     'Tracking dashboard, certification pending',
            'case.expert.shot.dashboardsucceed':'Tracking dashboard, agency certified',
            'case.expert.shot.onboarding':    'Onboarding, joining the Expert+ program',
            'case.expert.shot.pricing':       'Plan comparison, Expert+ subscription',
            'case.expert.shot.flowcertif':    'Full certification flow, overview',
            'case.expert.shot.flowonboarding':'Full onboarding flow, overview',
            'case.expert.shot.flowdiscovery':'Discovery userflow: every path mapped (free, paid, developer journey) before moving to screens.',
            'case.expert.situation': '<p>PrestaShop relies on an ecosystem of experts to support its merchants. In 2025, two tools meant to keep that ecosystem alive had stalled: a partner portal that only 25% of experts actually used, and a certification that 22% of them had earned but no one took seriously anymore. The lost revenue ran into the hundreds of thousands of euros.</p><p>My mission was not to "redo the screens". It was to lead the search for the best possible experience in order to inform an investment decision: should we optimise the existing tool, buy a market solution, or build our own? I designed the target experience vision and the journeys that let the company decide, then replace its partner portal with an in-house product, to take back control of how it works.</p><p>I left the company just before rollout. This case study therefore documents design and decision work, not a measured result.</p><p><strong>The starting point: two failures feeding each other</strong></p><p>The Expert portal, built on a third-party solution, was a strategic failure. With 25% active engagement, it did not fulfil its role as the central hub of the partner program. Experts weren\'t uninterested; the tool itself was deeply unfit: a dated, unintuitive interface, costly and technically blocked customisation that ruled out any iteration, multilingual gaps that penalised a community international by nature. A tool that generated friction where it should have created value.</p><p>The certification, for its part, had been drained of meaning. Only 22% of experts were certified, traceability was non-existent, and the system was no longer aligned with business goals. The ecosystem\'s verdict, gathered in interviews, was unequivocal: too easy, obtainable by anyone, and therefore no longer a guarantee of skill.</p><p>On top of this came a structural confusion, felt by experts and internally alike: no one clearly distinguished "joining the program", "earning a badge", being an "expert" at one, two or three stars, and being "certified". An illegible program cannot be desirable.</p><p><strong>The stakes: a deadline that isn\'t up for negotiation</strong></p><p>The project had a hard driver. The set objective was that, by the end of the last quarter of 2025, at least 80% of agencies holding an active certification (235 out of 294) would have had at least one of their developers take the new exam. A governance rule followed: from January 2026, only agencies with at least one certified developer would keep their visibility in the official directory and their status. A continuity mechanism was planned so as not to brutally penalise already-certified agencies during the transition.</p><p>This constraint drove everything. The goal: upskill an entire ecosystem without alienating it, on a tight schedule, and use the momentum to rebuild a business model.</p>',
            'case.expert.decision': '<p>The explicit mission was to define the ideal experience and the value journey for two audiences, in order to inform a strategic choice between three options: optimise the existing tool, buy a market solution, or build our own.</p><p>Design was not at the end of the decision chain: it was the instrument of that decision. By making the target experience tangible, what a credible and desirable journey should look like, I gave the company a compass to arbitrate, complementing the cost and technical-feasibility analyses led by tech.</p><p>The answer played out differently per building block. For the certification, sitting the exam stayed anchored to a specialised third-party platform, able to handle proctored exams and identity verification. For the partner portal, however, the company decided, after I left, in favour of an in-house product, replacing the third-party solution, to regain control of its experience and its freedom to iterate, precisely what had been missing.</p>',
            'case.expert.collaboration': '<p>The project was run as a Product Trio: a PM, a Lead Dev and me on design, with a Lead Designer on framing and discovery supervision, a two-person content team, and a Lead PM.</p><p>I was present end to end, from discovery to interface design and prototype. The project\'s design delivery is attributed 100% to me: modelling the journeys, designing the interfaces, prototyping, preparing and exploiting the tests, and regularly presenting to the leads to validate the direction before moving on. I contributed to every step of the method and worked in continuous collaboration within the trio: team rituals, co-creation workshops, alignment sessions between product vision, technical feasibility and user desirability.</p><p>In other words, I was autonomous across the whole design, within a strategic frame set collectively with the PM, the Lead Dev and the Lead Designer.</p>',
            'case.expert.methodology': '<p>The approach followed the FOCUSED framework end to end, each step tied to a concrete contribution rather than applied mechanically.</p><ul class="case-list"><li><strong>Frame.</strong> Framing the mission through two distinct but converging design briefs, one centred on the portal, the other on the certification, with co-defined objectives, scope and deliverables.</li><li><strong>Observe.</strong> Immersing in the ecosystem of technical certifications, understanding mental models and pain points, through interviews with certified, non-certified and international experts, as well as agencies.</li><li><strong>Claim.</strong> Formulating a clear, attractive value proposition from the expert\'s and the agency\'s point of view, marketing included, down to the launch message worked out in a workshop.</li><li><strong>Unfold.</strong> Identifying the key moments and critical interactions of the journey, from information-gathering to renewal.</li><li><strong>Steal.</strong> Analysing market standards, in particular Adobe, Shopify and Google, to spot best practices, engaging mechanisms and mistakes to avoid.</li><li><strong>Execute.</strong> Designing and prototyping the journeys and interfaces, preparing and exploiting user tests, involving tech to de-risk the options.</li><li><strong>Decide.</strong> Synthesising the learnings and formulating reasoned recommendations for the minimum viable scope, documenting the experience risks tied to launch and migration.</li></ul>',
            'case.expert.findings': '<p>Three learnings structured everything else.</p><ul class="case-list"><li><strong>The dual audience.</strong> There was an external audience, the technical expert (an agency developer or freelance integrator), driven by efficiency, recognition of their expertise and return on investment. And an internal audience too often forgotten, the Channel Manager, the PrestaShop employee who bridges to a portfolio of agencies and is responsible for their onboarding, follow-up and success.</li><li><strong>Their symbiotic relationship.</strong> This is the project\'s strongest stance. Friction in the Channel Manager\'s journey translates directly into a poor experience on the expert\'s side. In other words, a smooth experience for the Channel Manager is a prerequisite for a successful experience for the expert. Designing only for the external storefront would have been a mistake.</li><li><strong>Needs of value, not features.</strong> The deep needs were about value and recognition. The expert\'s job-to-be-done boils down to "help me perform and prove the value of my partnership without wasting time", and the Channel Manager\'s to "give me a 360° view so I can move from solving problems to creating value".</li></ul>',
            'case.expert.decisions': '<p>Several structuring trade-offs follow directly from these findings.</p><ul class="case-list"><li><strong>Clarify the program into two clear tiers.</strong> To the confusion of statuses I substituted a simple distinction: on one side the entry status, free: you join the program, declare your stores, accumulate points, with no official recognition or directory visibility. On the other the premium, paid status, giving access to all benefits, including visibility, support and one included certification per year. A legible boundary replaces an illegible gradient of stars.</li><li><strong>Name by role, not by technical content.</strong> The name of the base certification was designed to reflect its function as a gateway to expert status, not its technical syllabus. This choice creates a coherent, scalable naming able to host future specialisations without starting from scratch.</li><li><strong>Set a "Core + Specialised" model.</strong> The foundational certification becomes the mandatory prerequisite to any future specialisation. It is nominative, tied to an identified developer, valid two years, and materialised by a shareable badge and tracking dashboards. The agency earns its recognition as soon as at least one of its developers is certified.</li><li><strong>Restore credibility through concrete attributes.</strong> Faced with a certification judged "too easy", the new model embraces proctored exams, identity verification and traceability, the marks of seriousness found among the market references in the benchmark.</li><li><strong>Arbitrate as you go, including by removing.</strong> Not every decision was an addition. A "publish my profile" banner was removed because it sowed confusion and did not match the intended use case. And the scope of the first batch was deliberately tightened to exam assignment and sending invitations, explicitly taking the newcomer journey out, to first ship a robust core.</li></ul>',
            'case.expert.design_solution': '<p>The work covered a complete system, articulated around five priority touchpoints: discovering the program, assigning and inviting a developer, sitting the assessment, tracking via a dashboard, and renewal.</p><p>On the certification side, the journeys run from the discovery page (free or premium) to the detail page, to selecting or inviting a developer from the team, to invitation confirmation, to the developer sitting the exam with its pass or fail outcomes, through to the tracking dashboard that traces pending and certified statuses.</p><p>On the program-entry side, the onboarding journey guides the agency through legible steps, from welcome to declaring its stores, to premium subscription, up to creating its public profile. A score-and-levels system, fed by declarations, certification and activity, drives visibility to merchants. The whole is completed by a plan comparison, the certification detail pages and the launch emails.</p>',
            'case.expert.reflection': '<p><strong>The rigour of the process, what I\'m proudest of</strong></p><p>The most telling sign of the project\'s maturity is not a screen, it\'s the way decisions were made. Going to production was not linear: two Go/No-Go reviews were rejected before the green light.</p><p>The first stumbled on success criteria to revisit, a continuity plan to consolidate and a still-fragile journey core, with an honest observation: content was not integrated enough into the design process. The second asked for interface adjustments and handling of edge cases. Only then came the green light for delivery, followed by a final validation by the content, product and design leads.</p><p>Two owned refusals before moving on: in a tight-deadline context, that is proof of collective discipline.</p><p><strong>The constraints that framed realism</strong></p><p>The project was built under strong constraints, and naming them is part of the story\'s honesty. A minimum viable scope to ship in a short timeframe, imposing a sustained pace. A launch planned in five languages, forcing design for translation and localisation from the start, down to the badges and the emails. An integration to ensure within the existing ecosystem, with a dependency on the exam platform\'s capabilities. A migration plan to prepare for already-certified agencies. And change management, since raising a certification\'s bar means bringing experts along in the transition rather than imposing it on them.</p><p><strong>What I take away</strong></p><p>I left before rollout, so I cannot claim post-launch results, and I prefer to say so plainly rather than dress up the story. What I can show is how to turn a fuzzy, political, high-financial-stakes problem into a system of defensible decisions.</p><ul class="case-list"><li><strong>Design can be an investment-decision tool.</strong> By making the target experience tangible, you give an organisation a criterion for arbitration that cost analyses alone don\'t provide. Here, this work fed the choice to rebuild the partner portal in-house: a choice of freedom and control.</li><li><strong>Designing for the internal user is often the real lever.</strong> The symbiotic relationship between the expert and the Channel Manager was the insight that avoided a storefront redesign with no effect on substance.</li><li><strong>A good process says no.</strong> The two rejected Go/No-Gos did more for the final quality than any isolated screen.</li></ul><p>Had I continued, the first thing I would have measured is the share of agencies having certified at least one developer before the deadline, then the adoption of the premium tier and the reactivation of the portal beyond the initial 25%.</p><p class="case-caption"><em>Case study · Expert Experience, PrestaShop, 2025. Screenshots of the journeys and the detail of discovery deliverables are available on request.</em></p>',

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
            'case.sa.metric2.value': '~-40%',
            'case.sa.metric2.label': 'estimated drop in error-driven abandonment',
            'case.sa.situation': '<p>The shop association process, particularly for open-source installations, was a major source of confusion. Merchants didn\'t understand why association was required and abandoned the process, especially when errors occurred.</p><p>The association exists because most users have Open Source shops installed locally on their hosting, not always identified as belonging to the owner account. Association creates this connection.</p>',
            'case.sa.tasks':    '<ul class="case-list"><li>Conducted research to identify key pain points and abandonment triggers.</li><li>Redesigned the flow to require only the necessary information, providing clear guidance and error correction.</li><li>Modeled the new process on the SaaS "Edition" experience, offering direct association for recognized shop owners.</li><li>Prototyped the new flow (including a demonstrative video) and validated improvements with stakeholders.</li></ul>',
            'case.sa.results':  '<ul class="case-list"><li>Major improvement in user comprehension and reduced frustration.</li><li>Most shop traffic now flows through the updated payment platform and onboarding.</li><li>Unified the experience with the "Edition" SaaS model for consistency.</li></ul>',

            // DS Execution (Actions correctives 2026)
            'case.dsexec.title':    'Opal DS · Corrective Actions',
            'case.dsexec.subtitle': 'Executing the design system remediation plan: rebuilding 44 components, applying 2,634 token bindings, and establishing a dev-alignment workflow that accelerates feature delivery by 20-30%.',
            'case.dsexec.metric1.value': '92 → 2 634',
            'case.dsexec.metric1.label': 'token bindings applied',
            'case.dsexec.metric2.value': '9% → 100%',
            'case.dsexec.metric2.label': 'component compliance rate',
            'case.dsexec.metric3.value': '44',
            'case.dsexec.metric3.label': 'components rebuilt · 0 hardcoded values remaining',
            'case.dsexec.execution':   '<p>With the audit findings as a roadmap, I executed in 5 ordered phases: foundations (color palette, spacing, typography, iconography, vocabulary), then component-by-component reconstruction. 3 icon libraries consolidated into 1. Every hex value replaced by a token reference.</p><p class="case-caption">Each component refactor: hardcoded values → semantic tokens. Multiplied across 44 components.</p>',
            'case.dsexec.automation':  '<p>Token binding was the highest-volume task. I automated it using Claude Code with the Figma MCP (Model Context Protocol, lets agents drive Figma directly): 1,755 bindings applied in a single session, 45,000+ nodes analysed, 879 auto-corrections. What would have taken weeks took hours.</p><p class="case-caption"><em>Automation didn\'t replace review, every binding was checked. Speed without governance just means faster regression.</em></p>',
            'case.dsexec.alignment':   '<p>4-step dev-alignment workflow: <strong>Figma</strong> (design + tokens applied) → <strong>Notion doc</strong> (states, variants, props) → <strong>Storybook/Chromatic</strong> (implementation reviewed by designer) → <strong>Linear ticket closed</strong>. As of April 2026: 11 components in dev review: FButton, FTextfield, OpalSwitch, FChip, FDialog, and 6 others.</p>',
            'case.dsexec.results':     '<p>44 components rebuilt. 0 hardcoded values remaining. 3 → 1 icon library. Estimated +20-30% gain per feature cycle. The design system went from an implicit, undocumented system to a structured, scalable, dev-aligned infrastructure.</p>',

            // Opal DS, AI Prototyping Skills
            'case.dsskills.title':    'Opal DS · AI Prototyping Skills',
            'case.dsskills.subtitle': 'The other day, my PM presented a prototype to a client, and I did nothing... well, almost. Two AI skills built those interfaces from our design system, through a brief written in plain language.',
            'case.dsskills.metric1.value': '1 morning',
            'case.dsskills.metric1.label': 'from a brief to a client-ready prototype',
            'case.dsskills.metric2.value': '2 skills',
            'case.dsskills.metric2.label': 'operator + builder, agnostic and reusable',
            'case.dsskills.metric3.value': '11 screens · 4 modals',
            'case.dsskills.metric3.label': 'generated from a brief, no manual design step',
            'case.dsskills.shift':      '<p>"AI is transforming design" has been repeated for three years, to the point it means nothing. In 2026 the numbers caught up with the intuition.</p><p>Figma\'s <em>State of the Designer 2026</em> (900+ designers) reports that 91% now feel AI tools improve the <strong>quality</strong> of their work, beyond raw speed, and that regular users report markedly higher job satisfaction. The <em>State of AI in Design</em> places AI\'s contribution mostly in the first 60% of a project: ideation, first mockups, variant generation. The remaining 40% stays human: the trade-offs, the polish, the call on which direction actually serves the user.</p><p>The most accurate framing I have read is not about replacement but about a kind of <strong>sorting</strong>, one I touched on in a previous article.</p><p>On one side, designers who had made producing screens their whole value. On the other, those who already knew their value sat upstream, and slightly off to the side of all that: finding which problem deserves solving, which solution truly holds, and how to add the small touch a designer is genuinely able to bring.</p><p>In honesty, I note the selection bias in these surveys: designers who rejected AI outright rarely answer them. So the picture is rosier than the field. Still, to my mind the underlying trend is hard to argue with: value is sliding from execution toward judgment.</p><p>That leaves the one question that matters: what do I hand to AI, and what do I keep? This project is my attempt to answer it concretely, by building the tool with my own hands and watching what it actually moves.</p>',
            'case.dsskills.problem':    '<p>At Oplit we build software for industrial production planning. The cycle looked like this: a PM frames a need, I design in Figma, I try to stay faithful to the design system, I ship a prototype that looks like the product but is not the product, engineering re-decides things design could have settled, and every handoff creates friction.</p><p>The skills were there. The chain between them was where it broke.</p><p>Before touching anything, I wanted the real state of our design system, Opal. Not by intuition: live, recounted at the source from a Figma plugin. At the audit the picture was harsh: no single source of truth, heavy UI debt, almost no parity between Figma and the code. I then brought the design side up to standard, color tokenised, documented, accessible. But product adoption stayed dramatically low, around 8% of instances in product files came from the DS. The system became good on the design side, and almost no one used it in the product.</p><p>The lever was obvious: make the DS genuinely easy to mobilise. It was already well documented; what it lacked was use. That single move unlocked both quality and speed.</p>',
            'case.dsskills.approach':   '<p>Part of the path was blocked on the engineering side. The design-to-code chain was waiting on resources: <a href="/projects/opal-ds-audit/" data-page="project-ds-audit">Code Connect</a> to do, Storybook in progress, no design-to-code bridge yet. The tokens were ready to export, but someone had to wire them.</p><p>I could have waited, but I went around it instead, with a simple idea: <strong>if engineering cannot come to the design system, the design system has to go to the teams.</strong></p><p>Concretely, I built two skills, specialised AI agents that read and mobilise the DS to generate interfaces directly in Figma from a plain-language brief.</p><ul class="case-list"><li>The <strong>operator</strong> holds the knowledge: where components live, their variants, how they assemble, the rules that govern their use. It updates itself as the DS evolves.</li><li>The <strong>builder</strong> consumes that knowledge to construct screens. You give it a brief, "show the impact of format-change matrices on scheduling", and it instantiates the right components, in the right variants, with the right tokens.</li></ul><p>Said like that, it sounds like a tooling project. What I really want to tell is what <em>building</em> these skills did to me, because that is where the craft hides.</p>',
            'case.dsskills.solution':   '<p>Here is what plenty of people forget to say about building a skill: <strong>it forces you to clearly put into words what you kept as intuition.</strong></p><p>Encoding a rule into an agent means settling it. "Is this component used in this context?" The answer can no longer be "it depends" when you configure a machine: you have to say exactly what it depends on, and write the rule. In a few weeks I settled ambiguities I had let sit for months, because the tool would not tolerate the vagueness. First shift: the craft moves from doing to formalising. The precise gesture is no longer in the mouse; it is in how accurately you describe your own judgment.</p><p>Second shift, the verification method. I built each skill in a <strong>clean room</strong>: every fact about the DS verified live before being encoded, and every version tested by a blank, memoryless agent to simulate someone starting from scratch. If it recovered the right knowledge from the live sources, the skill was valid. Otherwise we iterated. I am precise on this, in honesty: the protocol validates <em>retrieval</em>, not taste. Visual quality I judged by eye, against the real product. The agent guarantees you find the right brick; it does not guarantee you chose the right assembly. That choice stays mine.</p><p>Development was not a straight line. The first build produced structurally correct interfaces (right architecture, right components) but uniform, with no granularity: identical work-order cards, missing states, information density too low. The signal was clear, the skill lacked context on variants and their usage rules. After correction, v2 instantiated the right variant for the real state of each work order, rebuilt the column footers, told the statuses apart. Not perfect, but credible for a client.</p><p>Third shift, the most important: <strong>the guardrail as a design decision.</strong> I set a rule: nothing propagates into the DS without a validated manifest and my explicit approval. The system would have been faster without it, and also less reliable, less maintainable, and potentially dangerous for the integrity of the DS. That choice was not technical, it was a design decision. It is exactly what the surveys describe with their "40% that stays human": the stance on what is <em>good</em>, the responsibility for the call. This project only holds because speed and rigor coexist in it.</p>',
            'case.dsskills.outcome':    '<p>The best validation came from use, not from my own tests. My PM took the builder, on his own. In one morning he built a prototype of the feature he had to present that afternoon: a complex case that lets schedulers see the impact of item sequences on their OEE in real time. A few hours later he was presenting it to a client.</p><p>And these are not three rough screens. What strikes you across them is the consistency: table states are correct, modals use the right Form components, navigation follows the established patterns. This is the DS instantiated, not a mock-up.</p><p>Now the part I want to say, because an honest share cannot stop at the success. <strong>This project did not solve the original problem.</strong> The starting diagnosis was 8% product adoption, a DS invisible <em>inside the app</em>. The skills speed up <strong>prototyping</strong> and make the <strong>handoff</strong> more reliable, which is huge, but the DS is still not deployed in the app. I opened a path to faithful prototyping; I have not yet won the adoption battle in production. These are two distinct fights, and conflating them would be dishonest.</p><p>Where the impact is real and durable is the chain. Because the prototype is made of the real components and the real tokens, engineering receives screens it has almost nothing to reinterpret: fewer re-decisions, less back-and-forth, a shorter path from design to shipped code. That is the gain that holds.</p>',
            'case.dsskills.impact':     '<p>The bottom line, what building the skills actually delivered:</p><ul class="case-list"><li><strong>Speed and autonomy.</strong> A PM with no design training ships a client-ready prototype in a morning, on his own. Fewer bottlenecks for me, faster answers for clients.</li><li><strong>A handoff that holds.</strong> Prototypes are now made of the real components and tokens, so engineering has almost nothing to reinterpret: fewer re-decisions, less back-and-forth, design reaches shipped code faster.</li><li><strong>A reproducible model.</strong> Two agnostic skills, deployable on any documented design system. A way of working, not a one-off.</li></ul><p>And the honest scope: this opened fast, faithful prototyping. Production adoption of the DS is the next fight, and a separate one.</p>',
            'case.dsskills.questions':  '<p>This project solves a concrete problem. It opens others, more unsettling, that I would rather face head-on.</p><ul class="case-list"><li><strong>Credible without being true: feature or risk?</strong> "Wrong, but not stupid" is a strength for a concept demo. It is also a power to handle with care: showing a client a perfectly credible interface with knowingly wrong numbers needs an explicit framing ("the calculations are wrong, bear with me"). Without it, credibility becomes a risk. The craft, now, includes holding that line.</li><li><strong>Empowering the PM: am I rising or being bypassed?</strong> Both, and that is fine. A PM autonomous on prototyping means fewer bottlenecks and more of my time on what matters. But the other face would be naive to deny: what I made doable without me should push my value up a notch, toward decision, system and judgment, instead of diluting it. The tool does not decide that for me. I do.</li><li><strong>The most uncomfortable one.</strong> If I hold this skill <em>through</em> my tool, do I really acquire it myself? I have no clean answer. I only notice that writing a rule for a machine forced me to understand it better than when I executed it by hand. Maybe the craft does not disappear, it rises a level of abstraction. And I would rather work that question from the inside than watch it from a distance.</li></ul>',
            'case.dsskills.learning':   '<p>The two skills are <strong>agnostic</strong>. I did not hard-code Oplit into them: the operator and the builder point to configurable sources, a Figma key, a Notion base, a git repository. Any team with a documented DS can deploy them on its own system. The chain becomes: plain-language brief, real components, faithful prototype, a handoff that holds.</p><p>If you want to try the same thing, here is what I keep concretely:</p><ul class="case-list"><li><strong>Diagnose live, not by intuition.</strong> Before building, measure the real state of your DS, dated and recounted. Without that, you optimise a fantasy.</li><li><strong>Encoding is deciding.</strong> Use building the skill to kill your ambiguities. The rule you cannot write is a design decision you have not made yet.</li><li><strong>Test with a blank agent.</strong> Real validation is a memoryless agent recovering the right knowledge from your sources. If it cannot, a human cannot either.</li><li><strong>Set your guardrail, and treat it as design.</strong> Decide explicitly what never propagates without human validation. It is slow, and it is what makes the system reliable.</li><li><strong>Separate the impact you aim for from the one you get.</strong> Be honest about the problem you actually solve. That is what makes your story credible, like a good prototype.</li></ul><p>The profession is shifting, and it is getting more demanding. The value of a senior designer here is knowing, at every step, what to hand the machine and what to keep. Mastering the latest AI tool was never the point. Holding speed and rigor together is, more than ever, a designer\'s job.</p><p class="case-caption">Stack &amp; method: Claude Code (operating the DS and building the skills), Figma MCP (live connector), Figma (Opal file, components and foundations), Notion (knowledge base and documentation), a mandatory human validation on every propagation. External sources: Figma\'s State of the Designer 2026, the State of AI in Design Report, and John Maeda\'s Design in Tech Report 2025 (Agent Experience).</p>',
            'case.dsskills.fig.audit_t0':  'The starting point at the audit (T0, Nov 2025): no single source of truth, ~90% UI debt, zero Figma-dev parity. The diagnosis was bad.',
            'case.dsskills.fig.dashboard': 'The live tracker after corrective work: the design side is now solid (97), but product adoption stays low (10). That gap is the case for this project.',
            'case.dsskills.fig.design':    'Design axis, composite 97/100. Every axis measured live from the plugin, not estimated.',
            'case.dsskills.fig.dev':       'The real state of the design-to-code chain. The tokens are ready; the rest was waiting on dev resources that never came.',
            'case.dsskills.fig.product':   'Product axis: the DS still thin in the app, the first AI-assisted build under way.',
            'case.dsskills.fig.versions':  'The same screen in three states: the real product, build v1, build v2 after iterating on the skill. The gap between v1 and v2 is where the craft sits.',
            'case.dsskills.fig.flow1':     'A full 4-step flow (base, selected card, Tags modal, tag applied), with a sticky bar and real Form components, generated from a brief.',
            'case.dsskills.fig.flow2':     '11 screens, 4 modals, a whole system. No manual design between the brief and this result.',
            'case.dsskills.fig.schema_arch':  'How the two skills connect: live sources feed the operator (the knowledge of the DS), which feeds the builder (screen construction). A human gate sits over every propagation.',
            'case.dsskills.fig.schema_iter':  'How we reached the current skills: audit, corrective actions, build v1, diagnostic, build v2, autonomous PM use. A clean-room loop runs across every step.',
            'case.dsskills.fig.schema_chain': 'The reusable value chain: brief, builder, real components, faithful prototype, a handoff that holds. Deployable on any documented DS.',

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
            'case.dsaudit.fig.synthese':   'The audit at T0 (Nov 2025): the global verdict in one screen, with the six structural points it revealed.',
            'case.dsaudit.fig.design':     'Design debt: foundations coverage (Typography, Shadows, Breakpoints absent) and two competing Figma libraries.',
            'case.dsaudit.fig.dev':        'Dev debt: 3 icon libraries, Vuetify bypassed with heavy overrides, no Storybook, no shared token repo.',
            'case.dsaudit.fig.transverse': 'The most critical debt is cross-cutting: no Figma-to-code bridge, no parity, no governance. Design-dev alignment became the top priority.',

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
            'case.transfer.outcome': '<p><strong>Feature adopted and used weekly</strong> (Mixpanel).</p><ul class="case-list"><li><strong>Multi-site deployment unblocked:</strong> the client is launching deployment on 10+ sites. Most significant business impact: the feature conditioned contract expansion.</li><li><strong>Process eliminated:</strong> 8 Excel steps → 1 action with visual feedback, complete traceability, and one-click cancellation.</li><li><strong>User trust:</strong> the scheduler sees exactly what was transferred, from where, to where, and can cancel. Traceability resolves the initial problem.</li></ul><blockquote><p>"The options we asked for, they work. We\'ve taken a real step forward. I have no more blockers to move forward with deployment for other sites."</p><p>- Production planning manager</p></blockquote>',

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
            'landing.line1':    'Senior Product Designer',
            'landing.tagline':  'Je rends simples des produits complexes et exigeants. Actuellement chez <a href="https://www.oplit.com" target="_blank" rel="noopener" class="landing-company">Oplit</a>.',
            'landing.meta.loc_k':    'Basé à',
            'landing.meta.focus_k':  'Focus',
            'landing.meta.xp_k':     'Expérience',
            'landing.meta.xp_v':     '7+ ans',
            'landing.meta.status_k': 'Statut',
            'landing.meta.status_v': 'Disponible',
            'landing.sub':      'Guillaume Caillet · Senior Product Designer · Nantes, France',
            'landing.sub_name': 'Guillaume Caillet',
            'landing.sub_role': 'Senior Product Designer',
            'landing.sub_loc':  'Nantes, France',
            'landing.pitch':    'Sur les 7 dernières années, j\'ai participé à la conception et à l\'amélioration de produits SaaS B2B, aux côtés des équipes de <strong>Oplit</strong> (planification industrielle), <strong>PrestaShop</strong> (300k+ marchands), <strong>Airbus</strong> et <strong>SNCF</strong>. J\'ai piloté des design systems, mené des audits, et livré des chantiers d\'infrastructure sur lesquels les équipes s\'appuient.<span class="pitch-seek"><span class="pitch-seek-k">Ce que je cherche</span>Des produits exigeants où le design co-pilote la stratégie.</span>',
            'landing.discover': 'Découvrir mon travail',
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

            'who.date.oplit':       'Sept. 2025 - Aujourd\'hui',
            'who.date.prestashop':  'Juin 2022 - Sept. 2025',
            'who.date.beapp':       'Juin 2021 - Juin 2022',
            'who.date.lacapsule':   'Oct. 2020 - Juin 2021',
            'who.date.airbus':      'Sept. 2018 - Août 2020',
            'who.date.sncf':        'Mars 2018 - Août 2018',
            'who.date.stereosuper': 'Août 2015 - Sept. 2017',
            'who.date.teacher':     '2025 - Aujourd\'hui',
            'who.date.mentor':      '2024 - Aujourd\'hui',
            'who.date.ecv':         '2021 - Aujourd\'hui',
            'who.date.designschool': '2025',
            'who.date.freelance':   '2020 - Aujourd\'hui',

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

            'who.desc.oplit':       '<p><strong>+74% d\'utilisateurs actifs (430 → 747)</strong> et des features clés déployées sur les lignes de production des clients.</p><p>Oplit conçoit un logiciel de planification industrielle pour l\'aéronautique, le luxe et l\'automobile. Je porte le design produit : discovery continue avec clients et prospects, features stratégiques livrées avec le produit et l\'engineering, et le design system que j\'ai reconstruit (44 composants, structuré pour des workflows assistés par IA) qui a accéléré l\'exécution design de 30 à 50%.</p><p>Dernièrement : deux skills IA (operator + builder) qui permettent de générer dans Figma des prototypes fidèles au design system, depuis un brief en langage naturel. Un PM a construit et présenté un prototype client seul, en une matinée.</p>',
            'who.desc.prestashop':  '<p><strong>Product Designer &amp; Design System Lead (2024)</strong></p><p>Déploiement progressif du système de recherche chez PrestaShop. Structuration et mise à disposition opérationnelle des outils, templates et données utilisateurs pour que les équipes produit y accèdent rapidement et efficacement. L\'objectif : offrir un accès efficace à la recherche utilisateur lors de la conception des produits PrestaShop pour 300k+ marchands.</p><p>Structuration du Design System pour que les équipes puissent s\'appuyer dessus et l\'étendre. Proposition d\'axes de développement, structuration de l\'équipe autour du projet et mise en visibilité des travaux.</p><p><strong>Contributeur Design System (2023)</strong></p><p>Implication dans la structuration et l\'implémentation du Design System PrestaShop. Suivi, implémentation et usage des composants et design tokens par l\'ensemble des utilisateurs du système, ainsi que les composants conçus par les Product Designers.</p><p><strong>Product Designer (2022)</strong></p><p>Au sein de l\'équipe Customer Platform, conception et amélioration de l\'expérience utilisateur au travers du compte utilisateur et de l\'expérience de connexion.</p>',
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

            // Case studies - shared
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
            'case.section.questions': 'Questions ouvertes',
            'case.section.shift':        'Le métier se déplace',
            'case.section.craft':        'Le nouveau craft',
            'case.section.uncomfortable':'La partie inconfortable',
            'case.section.takeaways':    'Ce que je garde',
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

            'case.expert.title':    'Expert Experience',
            'case.expert.subtitle': 'Quand le design devient l\'instrument d\'une décision stratégique : refondre un portail partenaires à l\'arrêt et une certification vidée de son sens, et transformer un problème flou et à fort enjeu en un système de décisions défendables.',
            'case.expert.metric1.value': '25 %',
            'case.expert.metric1.label': 'd\'engagement réel sur le portail Expert qu\'il devait animer',
            'case.expert.metric2.value': '22 %',
            'case.expert.metric2.label': 'des experts certifiés, pour une certification que plus personne ne prenait au sérieux',
            'case.expert.metric3.value': 'Construire',
            'case.expert.metric3.label': 'l\'option retenue : optimiser / acheter / construire le portail partenaires',
            'case.expert.fig.decision':    'Mapping de la décision : construire le portail en interne, acheter la brique d\'examen.',
            'case.expert.fig.focused':     'La méthode FOCUSED, de la discovery au prototype.',
            'case.expert.fig.levels':      'Deux niveaux lisibles remplacent un dégradé de statuts confus.',
            'case.expert.fig.touchpoints': 'Cinq points de contact, structurés autour de l\'insight Channel Manager / Expert.',
            'case.expert.shot.invitation':    'Certification, page de découverte',
            'case.expert.shot.detail':        'Certification, page de détail (premium)',
            'case.expert.shot.select':        'Sélection et invitation d\'un développeur',
            'case.expert.shot.dashboard':     'Dashboard de suivi, certification en attente',
            'case.expert.shot.dashboardsucceed':'Dashboard de suivi, agence certifiée',
            'case.expert.shot.onboarding':    'Onboarding, rejoindre le programme Expert+',
            'case.expert.shot.pricing':       'Comparatif d\'offres, abonnement Expert+',
            'case.expert.shot.flowcertif':    'Parcours de certification complet, vue d\'ensemble',
            'case.expert.shot.flowonboarding':'Parcours d\'onboarding complet, vue d\'ensemble',
            'case.expert.shot.flowdiscovery':'Userflow de discovery : tous les chemins cartographiés (gratuit, payant, parcours développeur) avant la mise en écrans.',
            'case.expert.situation': '<p>PrestaShop s\'appuie sur un écosystème d\'experts pour accompagner ses marchands. En 2025, deux outils censés animer cet écosystème étaient à l\'arrêt : un portail partenaires que seuls 25 % des experts utilisaient réellement, et une certification que 22 % d\'entre eux avaient obtenue mais que plus personne ne prenait au sérieux. Le manque à gagner se chiffrait en centaines de milliers d\'euros.</p><p>Ma mission n\'était pas de « refaire les écrans ». Elle était de piloter la recherche de la meilleure expérience possible pour éclairer une décision d\'investissement : fallait-il optimiser l\'existant, acheter une solution du marché, ou en construire une ? J\'ai conçu la vision d\'expérience cible et les parcours qui ont permis à l\'entreprise de trancher, puis de remplacer son portail partenaires par un produit construit en interne, pour reprendre la main sur sa manière de faire.</p><p>Je suis parti de l\'entreprise juste avant la mise en application. Ce case study documente donc un travail de conception et de décision, pas un résultat mesuré.</p><p><strong>Le point de départ : deux échecs qui se nourrissent l\'un l\'autre</strong></p><p>Le portail Expert, bâti sur une solution tierce, était un échec stratégique. Avec 25 % d\'engagement actif, il ne remplissait pas sa fonction de hub central du programme partenaires. Les experts n\'étaient pas désintéressés ; l\'outil, lui, était profondément inadapté : une interface datée et peu intuitive, une personnalisation coûteuse et techniquement bloquée qui interdisait toute itération, des lacunes multilingues qui pénalisaient une communauté par nature internationale. Un outil qui générait de la friction là où il aurait dû créer de la valeur.</p><p>La certification, elle, était vidée de son sens. 22 % seulement des experts étaient certifiés, la traçabilité était inexistante, et le système n\'était plus aligné sur les objectifs business. Le verdict de l\'écosystème, recueilli en entretien, était sans appel : trop facile, obtenable par n\'importe qui, et donc plus une garantie de compétence.</p><p>À cela s\'ajoutait une confusion structurelle, ressentie par les experts comme en interne : personne ne distinguait clairement le fait de « rejoindre le programme », d\'« obtenir un badge », d\'être « expert » à une, deux ou trois étoiles, et d\'être « certifié ». Un programme illisible ne peut pas être désirable.</p><p><strong>L\'enjeu : une échéance qui ne se négocie pas</strong></p><p>Le projet avait un moteur daté. L\'objectif fixé était que, d\'ici la fin du dernier trimestre 2025, au moins 80 % des agences disposant d\'une certification active (235 sur 294) aient fait passer le nouvel examen à au moins un de leurs développeurs. Une règle de gouvernance en découlait : à partir de janvier 2026, seules les agences comptant au moins un développeur certifié conserveraient leur visibilité dans l\'annuaire officiel et leur statut. Un dispositif de continuité était prévu pour ne pas pénaliser brutalement les agences déjà certifiées pendant la transition.</p><p>Cette contrainte a tout orienté. L\'objectif : faire monter en compétence tout un écosystème sans le braquer, dans un délai serré, et profiter du mouvement pour rebâtir un modèle économique.</p>',
            'case.expert.decision': '<p>La mission explicite était de définir l\'expérience idéale et le parcours de valeur pour deux publics, afin d\'éclairer un choix stratégique entre trois options : optimiser l\'outil existant, acheter une solution du marché, ou construire la nôtre.</p><p>Le design n\'était pas au bout de la chaîne de décision : il en était l\'instrument. En rendant tangible l\'expérience cible, à quoi ressemblait un parcours crédible et désirable, j\'ai donné à l\'entreprise une boussole pour arbitrer, en complément des analyses de coût et de faisabilité portées par la tech.</p><p>La réponse s\'est jouée différemment selon la brique. Pour la certification, le passage de l\'examen est resté adossé à une plateforme tierce spécialisée, capable d\'assurer les examens surveillés et la vérification d\'identité. Pour le portail partenaires en revanche, l\'entreprise a tranché, après mon départ, en faveur d\'un produit construit en interne, en remplacement de la solution tierce, afin de reprendre la maîtrise de son expérience et sa liberté d\'itération, précisément ce qui avait manqué jusque-là.</p>',
            'case.expert.collaboration': '<p>Le projet a été mené en Product Trio : une PM, un Lead Dev et moi au design, avec une Lead Designer sur le cadrage et la supervision de la discovery, une équipe content à deux personnes, et une Lead PM.</p><p>J\'ai été présent de bout en bout, de la discovery à la conception des interfaces et du prototype. La réalisation design du projet m\'est attribuée à 100 % : la modélisation des parcours, le design des interfaces, le prototypage, la préparation et l\'exploitation des tests, et la présentation régulière aux leads pour valider la direction avant de continuer. J\'ai contribué à toutes les étapes de la méthode et travaillé en collaboration continue au sein du trio : rituels d\'équipe, ateliers de co-création, sessions d\'alignement entre vision produit, faisabilité technique et désirabilité utilisateur.</p><p>Autrement dit, j\'étais autonome sur l\'ensemble de la conception, dans un cadre stratégique posé collectivement avec la PM, le Lead Dev et la Lead Designer.</p>',
            'case.expert.methodology': '<p>La démarche a suivi le cadre FOCUSED de bout en bout, chaque étape étant rattachée à une contribution concrète plutôt qu\'appliquée mécaniquement.</p><ul class="case-list"><li><strong>Frame.</strong> Cadrer la mission à travers deux design briefs distincts mais convergents, l\'un centré sur le portail, l\'autre sur la certification, avec co-définition des objectifs, du périmètre et des livrables.</li><li><strong>Observe.</strong> S\'immerger dans l\'écosystème des certifications techniques, comprendre les modèles mentaux et les points de douleur, via des entretiens avec des experts certifiés, non certifiés et internationaux, ainsi qu\'avec des agences.</li><li><strong>Claim.</strong> Formuler une proposition de valeur claire et attractive du point de vue de l\'expert et de l\'agence, marketing compris, jusqu\'au message de lancement travaillé en atelier.</li><li><strong>Unfold.</strong> Identifier les moments-clés et les interactions critiques du parcours, de la prise d\'information au renouvellement.</li><li><strong>Steal.</strong> Analyser les standards du marché, en particulier Adobe, Shopify et Google, pour repérer les bonnes pratiques, les mécanismes engageants et les erreurs à éviter.</li><li><strong>Execute.</strong> Concevoir et prototyper les parcours et les interfaces, préparer et exploiter les tests utilisateurs, en associant la tech pour dérisquer les pistes.</li><li><strong>Decide.</strong> Synthétiser les apprentissages et formuler des recommandations argumentées pour le périmètre minimal viable, en documentant les risques d\'expérience liés au lancement et à la migration.</li></ul>',
            'case.expert.findings': '<p>Trois enseignements ont structuré tout le reste.</p><ul class="case-list"><li><strong>La double cible.</strong> Il y avait un public externe, l\'expert technique (développeur en agence ou intégrateur freelance), motivé par l\'efficacité, la reconnaissance de son expertise et le retour sur investissement. Et un public interne trop souvent oublié, le Channel Manager, l\'employé PrestaShop qui fait le pont avec un portefeuille d\'agences et se trouve responsable de leur onboarding, de leur suivi et de leur succès.</li><li><strong>Leur relation symbiotique.</strong> C\'est la prise de position la plus forte du projet. Une friction dans le parcours du Channel Manager se traduit directement par une mauvaise expérience côté expert. Autrement dit, une expérience fluide pour le Channel Manager est une condition sine qua non d\'une expérience réussie pour l\'expert. Concevoir uniquement pour la vitrine externe aurait été une erreur.</li><li><strong>Des besoins de valeur, pas de fonctionnalités.</strong> Les besoins profonds relèvent de la valeur et de la reconnaissance. Le job-to-be-done de l\'expert se résume à « aidez-moi à performer et à prouver la valeur de mon partenariat sans perdre de temps », et celui du Channel Manager à « donnez-moi une vue à 360° pour passer de résoudre des problèmes à créer de la valeur ».</li></ul>',
            'case.expert.decisions': '<p>Plusieurs arbitrages structurants découlent directement de ces constats.</p><ul class="case-list"><li><strong>Clarifier le programme en deux niveaux nets.</strong> À la confusion des statuts, j\'ai substitué une distinction simple : d\'un côté le statut d\'entrée, gratuit : on rejoint le programme, on déclare ses boutiques, on cumule des points, sans reconnaissance officielle ni visibilité dans l\'annuaire. De l\'autre le statut premium, payant, qui donne accès à l\'ensemble des bénéfices, dont la visibilité, l\'accompagnement et une certification incluse par an. Une frontière lisible remplace un dégradé d\'étoiles illisible.</li><li><strong>Nommer par le rôle, pas par le contenu technique.</strong> Le nom de la certification de base a été pensé pour refléter sa fonction de porte d\'entrée au statut d\'expert, et non son programme technique. Ce choix crée une nomenclature cohérente et évolutive, capable d\'accueillir demain des spécialisations sans repartir de zéro.</li><li><strong>Poser un modèle « Core + Spécialisé ».</strong> La certification fondamentale devient le prérequis obligatoire à toute spécialisation future. Elle est nominative, rattachée à un développeur identifié, valide deux ans, et matérialisée par un badge partageable et par des tableaux de bord de suivi. L\'agence obtient sa reconnaissance dès qu\'au moins un de ses développeurs est certifié.</li><li><strong>Restaurer la crédibilité par des attributs concrets.</strong> Face à une certification jugée « trop facile », le nouveau modèle assume des examens surveillés, une vérification d\'identité et une traçabilité, les codes de sérieux repérés chez les références du marché en benchmark.</li><li><strong>Arbitrer au fil de l\'eau, y compris en retirant.</strong> Toutes les décisions n\'ont pas été des ajouts. Une bannière « publish my profile » a été supprimée parce qu\'elle semait la confusion et ne correspondait pas au cas d\'usage visé. Et le périmètre du premier lot a été volontairement resserré sur l\'assignation des examens et l\'envoi des invitations, en sortant explicitement le parcours du nouvel arrivant, pour livrer d\'abord un cœur robuste.</li></ul>',
            'case.expert.design_solution': '<p>Le travail a couvert un système complet, articulé autour de cinq points de contact prioritaires : la découverte du programme, l\'assignation et l\'invitation d\'un développeur, le passage de l\'évaluation, le suivi via un tableau de bord, et le renouvellement.</p><p>Côté certification, les parcours vont de la page de découverte (libre ou premium) à la page de détail, à la sélection ou l\'invitation d\'un développeur de l\'équipe, à la confirmation d\'invitation, au passage de l\'examen côté développeur avec ses issues de réussite ou d\'échec, jusqu\'au tableau de bord de suivi qui trace les statuts en attente et certifiés.</p><p>Côté entrée dans le programme, le parcours d\'onboarding guide l\'agence par étapes lisibles, de la bienvenue à la déclaration de ses boutiques, à la souscription premium, jusqu\'à la création de son profil public. Un système de score et de niveaux, alimenté par les déclarations, la certification et l\'activité, pilote la visibilité auprès des marchands. Le tout est complété par un comparatif d\'offres, les pages de détail de certification et les emails de lancement.</p>',
            'case.expert.reflection': '<p><strong>La rigueur du processus, ce dont je suis le plus fier</strong></p><p>Le point le plus révélateur de la maturité du projet n\'est pas un écran, c\'est la manière dont les décisions ont été prises. Le passage en production n\'a pas été linéaire : deux revues de type Go/No-Go ont été invalidées avant d\'obtenir le feu vert.</p><p>La première a buté sur des critères de succès à revoir, un plan de continuité à consolider et un cœur de parcours encore fragile, avec un constat honnête : le contenu n\'était pas assez intégré au processus de conception. La deuxième a demandé des ajustements d\'interface et le traitement de cas annexes. Ce n\'est qu\'ensuite qu\'est venu le feu vert pour la livraison, puis une validation finale par les leads content, produit et design.</p><p>Deux refus assumés avant de continuer : dans un contexte à échéance serrée, c\'est une preuve de discipline collective.</p><p><strong>Les contraintes qui ont cadré le réalisme</strong></p><p>Le projet s\'est construit sous des contraintes fortes, et les nommer fait partie de l\'honnêteté du récit. Un périmètre minimal viable à livrer dans un délai court, imposant un rythme soutenu. Un lancement prévu en cinq langues, qui obligeait à concevoir dès le départ pour la traduction et la localisation, jusqu\'aux badges et aux emails. Une intégration à assurer dans l\'écosystème existant, avec une dépendance aux capacités de la plateforme d\'examen. Un plan de migration à prévoir pour les agences déjà certifiées. Et un accompagnement du changement, puisque relever le niveau d\'exigence d\'une certification suppose d\'embarquer les experts dans la transition plutôt que de la leur imposer.</p><p><strong>Ce que je retiens</strong></p><p>Je suis parti avant la mise en application, je ne peux donc pas revendiquer de résultats post-lancement, et je préfère le dire clairement plutôt que d\'habiller le récit. Ce que je peux montrer, c\'est la manière de transformer un problème flou, politique et à fort enjeu financier en un système de décisions défendables.</p><ul class="case-list"><li><strong>Le design peut être un outil de décision d\'investissement.</strong> En rendant l\'expérience cible tangible, on offre à une organisation un critère d\'arbitrage que les seules analyses de coût ne donnent pas. Ici, ce travail a nourri le choix de reconstruire le portail partenaires en interne : un choix de liberté et de maîtrise.</li><li><strong>Concevoir pour l\'utilisateur interne est souvent le vrai levier.</strong> La relation symbiotique entre l\'expert et le Channel Manager a été l\'insight qui a évité un redesign de vitrine sans effet sur le fond.</li><li><strong>Un bon processus dit non.</strong> Les deux Go/No-Go invalidés ont plus fait pour la qualité finale que n\'importe quel écran isolé.</li></ul><p>Si j\'avais poursuivi, la première chose que j\'aurais mesurée serait le taux d\'agences ayant certifié au moins un développeur avant l\'échéance, puis l\'adoption du niveau premium et la réactivation du portail au-delà des 25 % initiaux.</p><p class="case-caption"><em>Case study · Expert Experience, PrestaShop, 2025. Les captures d\'écran des parcours et le détail des livrables de discovery sont disponibles sur demande.</em></p>',

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
            'case.sa.metric2.value': '~-40%',
            'case.sa.metric2.label': 'baisse estimée des abandons sur erreur',
            'case.sa.situation': '<p>Le processus d\'association de boutique, notamment pour les installations open-source, était une source majeure de confusion. Les marchands ne comprenaient pas pourquoi l\'association était nécessaire et abandonnaient le processus, surtout lorsque des erreurs survenaient.</p><p>L\'association existe car la plupart des utilisateurs ont des boutiques Open Source installées localement sur leur hébergement, pas toujours identifiées comme appartenant au compte propriétaire. L\'association crée ce lien.</p>',
            'case.sa.tasks':    '<ul class="case-list"><li>Recherche pour identifier les principaux points de friction et déclencheurs d\'abandon.</li><li>Refonte du flux pour ne demander que les informations nécessaires, avec des guidances claires et une correction d\'erreurs.</li><li>Modélisation du nouveau processus sur l\'expérience SaaS "Edition", offrant une association directe pour les propriétaires de boutiques reconnus.</li><li>Prototypage du nouveau flux (incluant une vidéo de démonstration) et validation des améliorations avec les parties prenantes.</li></ul>',
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
            'case.dsexec.results':     '<p>44 composants reconstruits. 0 valeur en dur restante. 3 → 1 librairie d\'icônes. Gain estimé de +20-30% par cycle de feature. Le design system est passé d\'un système implicite et non documenté à une infrastructure structurée, scalable et alignée avec le dev.</p>',

            // Opal DS, Skills de prototypage IA
            'case.dsskills.title':    'Opal DS · Skills de prototypage IA',
            'case.dsskills.subtitle': 'L\'autre jour, mon PM a présenté un prototype à un client, et je n\'ai rien fait... enfin presque. Deux skills IA ont permis de construire ces interfaces basées sur notre design system, via un brief écrit en langage naturel.',
            'case.dsskills.metric1.value': '1 matinée',
            'case.dsskills.metric1.label': 'd\'un brief à un prototype montrable à un client',
            'case.dsskills.metric2.value': '2 skills',
            'case.dsskills.metric2.label': 'operator + builder, agnostiques et réutilisables',
            'case.dsskills.metric3.value': '11 écrans · 4 modales',
            'case.dsskills.metric3.label': 'générés depuis un brief, sans étape de design manuelle',
            'case.dsskills.shift':      '<p>On entend « l\'IA transforme le design » depuis trois ans, au point que la phrase ne veut plus rien dire. En 2026, les chiffres ont rattrapé l\'intuition.</p><p>Le <em>State of the Designer 2026</em> de Figma (900+ designers) rapporte que 91% estiment désormais que les outils d\'IA améliorent la <strong>qualité</strong> de leur travail, au-delà de la seule vitesse, et que les utilisateurs réguliers déclarent une satisfaction nettement supérieure. Le <em>State of AI in Design</em> situe l\'apport de l\'IA surtout sur les premiers 60% d\'un projet : idéation, premières maquettes, génération de variantes. Les 40% restants restent humains : les arbitrages, le polish, la décision de direction qui sert vraiment l\'utilisateur.</p><p>La formule la plus juste que j\'ai lue ne parle pas de remplacement mais d\'un certain <strong>tri</strong>, que j\'ai pu évoquer lors d\'un article précédent.</p><p>D\'un côté, les designers qui avaient fait de leur valeur la production d\'écrans. De l\'autre, ceux qui savaient déjà que leur valeur était en amont et/ou légèrement en décalé de tout ça : trouver quel problème mérite d\'être résolu, quelle solution tient vraiment et comment ajouter ce petit grain qu\'un designer est vraiment capable d\'ajouter.</p><p>Par honnêteté, je note le biais de sélection de ces enquêtes : les designers qui ont refusé l\'IA en bloc y répondent rarement. La photo est donc plus optimiste que le terrain. Cependant la tendance de fond ne se discute plus vraiment à mon sens : la valeur glisse de l\'exécution vers le jugement.</p><p>Reste la seule question qui compte : qu\'est-ce que je confie à l\'IA, et qu\'est-ce que je garde pour moi ? Ce projet est ma tentative d\'y répondre concrètement, en fabriquant l\'outil de mes propres mains et en regardant ce qu\'il déplace vraiment.</p>',
            'case.dsskills.problem':    '<p>Chez Oplit, on développe un logiciel de pilotage de production industrielle. Le cycle ressemblait à ça : un PM exprime un besoin, je conçois dans Figma, j\'essaie de rester fidèle au design system, je livre un prototype « qui ressemble mais qui n\'en est pas un », le dev refait des décisions que le design aurait pu fixer, et chaque handoff génère de la friction.</p><p>Les compétences étaient là. C\'est la chaîne entre elles qui coinçait.</p><p>Avant de toucher à quoi que ce soit, j\'ai voulu savoir dans quel état était réellement notre design system, Opal. Pas à l\'intuition : en live, recompté à la source depuis un plugin Figma. Au moment de l\'audit, le tableau était sévère : aucune source de vérité unique, une grosse dette UI, presque aucune parité entre Figma et le code. J\'ai ensuite remis le côté design au niveau, couleur tokenisée, documenté, accessible. Mais l\'adoption produit est restée dramatiquement basse, autour de 8% d\'instances issues du DS dans les fichiers produit. Le système est devenu bon côté design, et presque personne ne s\'en servait dans le produit.</p><p>Le levier était évident : rendre le DS vraiment facile à mobiliser. Il était déjà bien documenté ; ce qui manquait, c\'était l\'usage. Ce geste-là débloquait d\'un coup la qualité et la vitesse.</p>',
            'case.dsskills.approach':   '<p>Une partie du chemin était bloquée côté dev. La chaîne design→code attendait des ressources : <a href="/projects/opal-ds-audit/" data-page="project-ds-audit">Code Connect</a> à faire, Storybook en cours, un pont design-to-code encore inexistant. Les tokens étaient prêts à l\'export, mais il fallait quelqu\'un pour les brancher.</p><p>J\'aurais pu attendre mais j\'ai préféré contourner, avec une idée simple : <strong>si le dev ne peut pas venir au design system, le design system doit aller vers les équipes.</strong></p><p>Concrètement, j\'ai créé deux skills, des agents IA spécialisés capables de lire et de mobiliser le DS pour générer des interfaces directement dans Figma, à partir d\'un brief en langage naturel.</p><ul class="case-list"><li>L\'<strong>operator</strong> porte la connaissance : où vivent les composants, leurs variantes, comment ils s\'assemblent, les règles qui régissent leur usage. Et il sait se mettre à jour quand le DS évolue.</li><li>Le <strong>builder</strong> consomme cette connaissance pour construire des écrans. On lui donne un brief, « montre l\'impact des matrices de changement de format sur l\'ordonnancement », et il instancie les bons composants, dans les bonnes variantes, avec les bons tokens.</li></ul><p>Dit comme ça, ça sonne comme un projet d\'outillage. Mais ce que je veux vraiment raconter, c\'est ce que <em>fabriquer</em> ces skills m\'a fait, parce que c\'est là que se cache le craft.</p>',
            'case.dsskills.solution':   '<p>Voici ce que pas mal de monde oublie de dire sur la fabrication d\'un skill : <strong>ça t\'oblige à formuler clairement ce que tu gardais en intuition.</strong></p><p>Encoder une règle dans un agent, c\'est la trancher. « Est-ce que ce composant s\'utilise dans ce contexte ? » La réponse ne peut plus être « ça dépend » quand tu configures une machine : il faut dire de quoi ça dépend, exactement, et écrire la règle. J\'ai réglé en quelques semaines des ambiguïtés que je laissais traîner depuis des mois, parce que l\'outil ne tolérait pas le flou. Première mutation : le craft se déplace du faire vers le formaliser. Le geste précis n\'est plus dans la souris ; il est dans la justesse avec laquelle tu décris ton propre jugement.</p><p>Deuxième mutation, la méthode de vérification. J\'ai construit chaque skill en <strong>clean room</strong> : chaque fait sur le DS vérifié en live avant d\'être encodé, et chaque version testée par un agent vierge, sans mémoire, pour simuler quelqu\'un qui part de zéro. S\'il retrouvait la bonne connaissance depuis les sources live, le skill était valide. Sinon, on itérait. Je suis précis là-dessus, par honnêteté : ce protocole valide la <em>récupération</em> de l\'information, pas le goût. La qualité visuelle, je l\'ai validée à l\'œil, en comparant au produit réel. L\'agent garantit qu\'on retrouve la bonne brique ; il ne garantit pas qu\'on a choisi le bon assemblage. Ce choix reste mien.</p><p>Le développement n\'a pas été une ligne droite. Le premier build générait des interfaces structurellement justes (bonne architecture, bons composants) mais uniformes, sans granularité : cartes OF identiques, états manquants, densité d\'info trop faible. Le signal était clair, le skill manquait de contexte sur les variantes et leurs règles d\'usage. Après correction, la v2 instanciait la bonne variante selon l\'état réel de chaque OF, reconstituait les footers de colonnes, différenciait les statuts. Pas parfait, mais crédible pour un client.</p><p>Troisième mutation, la plus importante : <strong>le garde-fou comme décision de design.</strong> J\'ai posé une règle : rien ne se propage dans le DS sans manifeste validé et sans accord explicite de ma part. Le système aurait été plus rapide sans ce garde-fou. Il aurait aussi été moins fiable, moins maintenable, et potentiellement dangereux pour l\'intégrité du DS. Ce choix n\'était pas technique, c\'était une décision de design. C\'est exactement ce que les enquêtes décrivent avec leurs « 40% qui restent humains » : la posture sur ce qui est <em>bien</em>, la responsabilité de l\'arbitrage. Ce projet ne tient que parce que la vitesse et la rigueur y coexistent.</p>',
            'case.dsskills.outcome':    '<p>La meilleure validation est venue de l\'usage, pas de mes tests. Mon PM a pris le builder, seul. Et en une matinée, il a construit un prototype de la feature qu\'il devait présenter l\'après-midi : un cas complexe qui permet aux ordonnanceurs de visualiser l\'impact des séquences d\'articles sur leur TRS en temps réel. Quelques heures plus tard, il le présentait à un client.</p><p>Et ce ne sont pas trois écrans bricolés. Ce qui frappe sur ces écrans, c\'est la cohérence : les états de table sont corrects, les modales utilisent les bons composants Form, la navigation respecte les patterns établis. C\'est du DS instancié, pas du mock-up.</p><p>Maintenant la partie que je tiens à dire, parce qu\'un partage honnête ne peut pas s\'arrêter au succès. <strong>Ce projet n\'a pas réglé le problème initial.</strong> Le diagnostic de départ, c\'était une adoption produit à 8%, un DS invisible <em>dans l\'application</em>. Les skills accélèrent le <strong>prototypage</strong> et fiabilisent le <strong>handoff</strong>, ce qui est énorme, mais le DS n\'est toujours pas déployé dans l\'app. J\'ai ouvert une voie de prototypage fidèle ; je n\'ai pas encore gagné la bataille de l\'adoption en production. Ce sont deux combats distincts, et les confondre serait malhonnête.</p><p>Là où l\'impact est réel et durable, c\'est sur la chaîne. Parce que le prototype est fait des vrais composants et des vrais tokens, le dev reçoit des écrans qu\'il n\'a presque rien à réinterpréter : moins de décisions refaites, moins d\'allers-retours, un chemin plus court entre le design et le code livré. C\'est ça, le gain qui tient.</p>',
            'case.dsskills.impact':     '<p>L\'essentiel, ce que la création des skills a réellement apporté :</p><ul class="case-list"><li><strong>Vitesse et autonomie.</strong> Un PM sans formation design livre un prototype montrable à un client en une matinée, tout seul. Moins de goulots pour moi, des réponses plus rapides pour les clients.</li><li><strong>Un handoff qui tient.</strong> Les prototypes sont faits des vrais composants et tokens, donc le dev n\'a presque rien à réinterpréter : moins de décisions refaites, moins d\'allers-retours, le design arrive plus vite au code livré.</li><li><strong>Un modèle reproductible.</strong> Deux skills agnostiques, déployables sur n\'importe quel design system documenté. Une façon de travailler, pas un one-shot.</li></ul><p>Et le périmètre honnête : ça a ouvert un prototypage rapide et fidèle. L\'adoption du DS en production reste le combat suivant, et distinct.</p>',
            'case.dsskills.questions':  '<p>Ce projet règle un problème concret. Il en ouvre d\'autres, plus dérangeants, que je préfère regarder en face.</p><ul class="case-list"><li><strong>Crédible sans être vrai : feature ou risque ?</strong> « Faux, mais pas idiots » est une force pour une démo de concept. C\'est aussi un pouvoir à manier avec prudence : présenter à un client une interface parfaitement crédible avec des chiffres sciemment faux suppose un cadrage explicite (« les calculs sont faux, soyez indulgents »). Sans ce cadrage, la crédibilité devient un risque. Le craft, désormais, c\'est aussi tenir cette ligne.</li><li><strong>Empuissancer le PM, est-ce m\'élever ou me contourner ?</strong> Les deux, et c\'est très bien. Un PM autonome sur le prototypage, c\'est moins de goulots et plus de temps pour moi sur ce qui compte. Mais il y a l\'autre face, et la nier serait naïf : ce que j\'ai rendu faisable sans moi doit remonter ma valeur d\'un cran, vers la décision, le système, le jugement, au lieu de la diluer. L\'outil ne décide pas ça à ma place. Moi si.</li><li><strong>La plus inconfortable.</strong> Si je détiens cette compétence <em>à travers</em> mon outil, est-ce que je l\'acquiers vraiment, moi ? Je n\'ai pas de réponse propre. Je constate juste que formuler une règle pour une machine m\'a forcé à la comprendre mieux que quand je l\'exécutais à la main. Peut-être que le craft ne disparaît pas, il remonte d\'un cran d\'abstraction. Et je préfère travailler cette question de l\'intérieur que la regarder de loin.</li></ul>',
            'case.dsskills.learning':   '<p>Les deux skills sont <strong>agnostiques</strong>. Je n\'ai pas codé Oplit en dur dedans : l\'operator et le builder pointent vers des sources configurables, une clé Figma, une base Notion, un dépôt git. N\'importe quelle équipe avec un DS documenté peut les déployer sur son propre système. La chaîne devient : brief en langage naturel, composants réels, prototype fidèle, un handoff qui tient.</p><p>Si tu veux tenter la même chose, voici ce que je retiens de concret :</p><ul class="case-list"><li><strong>Diagnostique en live, pas à l\'intuition.</strong> Avant de construire, mesure l\'état réel de ton DS, daté, recompté. Sans ça, tu optimises un fantasme.</li><li><strong>Encoder, c\'est trancher.</strong> Sers-toi de la fabrication du skill pour tuer tes ambiguïtés. La règle que tu n\'arrives pas à écrire est une décision de design que tu n\'as pas encore prise.</li><li><strong>Teste avec un agent vierge.</strong> La vraie validation, c\'est qu\'un agent sans mémoire retrouve la bonne connaissance depuis tes sources. Si lui n\'y arrive pas, un humain non plus.</li><li><strong>Pose ton garde-fou, et traite-le comme du design.</strong> Décide explicitement ce qui ne se propage jamais sans validation humaine. C\'est lent, et c\'est ce qui rend le système fiable.</li><li><strong>Sépare l\'impact que tu vises de celui que tu obtiens.</strong> Sois honnête sur le problème que tu résous vraiment. C\'est ce qui rendra ton récit crédible, comme un bon prototype.</li></ul><p>Le métier se déplace, et il devient plus exigeant. La valeur du designer senior, ici, c\'est de savoir, à chaque geste, ce qu\'on confie à la machine et ce qu\'on garde pour soi. Maîtriser le dernier outil d\'IA n\'a jamais été le sujet. Tenir ensemble la vitesse et la rigueur, c\'est peut-être plus que jamais un travail de designer.</p><p class="case-caption">Stack &amp; méthode : Claude Code (opération du DS et build des skills), MCP Figma (connecteur live), Figma (fichier Opal, composants et fondations), Notion (base de connaissance et documentation), une validation humaine obligatoire sur toute propagation. Sources externes : le State of the Designer 2026 de Figma, le State of AI in Design Report, et le Design in Tech Report 2025 de John Maeda (Agent Experience).</p>',
            'case.dsskills.fig.audit_t0':  'Le point de départ à l\'audit (T0, nov. 2025) : aucune source de vérité, ~90% de dette UI, 0% de parité Figma↔dev. Le diagnostic était mauvais.',
            'case.dsskills.fig.dashboard': 'Le tracker live après les corrections : le côté design est désormais solide (97), mais l\'adoption produit reste basse (10). C\'est cet écart qui justifie ce projet.',
            'case.dsskills.fig.design':    'Axe Design, composite 97/100. Chaque axe mesuré en live depuis le plugin, pas estimé.',
            'case.dsskills.fig.dev':       'L\'état réel de la chaîne design→code. Les tokens sont prêts ; le reste attendait des ressources dev qui n\'arrivaient pas.',
            'case.dsskills.fig.product':   'Axe Produit : le DS encore peu présent dans l\'app, la première construction assistée par IA en cours.',
            'case.dsskills.fig.versions':  'Le même écran en trois états : le produit réel, le build v1, le build v2 après itération sur le skill. C\'est l\'écart entre v1 et v2 qui dit où était le craft.',
            'case.dsskills.fig.flow1':     'Un parcours complet en 4 étapes (base, carte sélectionnée, modale Tags, tag appliqué), avec sticky bar et vrais composants Form, généré depuis un brief.',
            'case.dsskills.fig.flow2':     '11 écrans, 4 modales, un système entier. Aucune intervention design manuelle entre le brief et ce résultat.',
            'case.dsskills.fig.schema_arch':  'Comment les deux skills s\'articulent : les sources live alimentent l\'operator (la connaissance du DS), qui alimente le builder (la construction d\'écrans). Un regard humain couvre toute propagation.',
            'case.dsskills.fig.schema_iter':  'Comment on est arrivés aux skills actuels : audit, actions correctives, build v1, diagnostic, build v2, usage autonome par le PM. Une boucle clean room traverse chaque étape.',
            'case.dsskills.fig.schema_chain': 'La chaîne de valeur réutilisable : brief, builder, composants réels, prototype fidèle, un handoff qui tient. Déployable sur tout DS documenté.',

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
            'case.dsaudit.fig.synthese':   'L\'audit à T0 (nov. 2025) : le verdict global en un écran, avec les six points structurels qu\'il a révélés.',
            'case.dsaudit.fig.design':     'Dette design : couverture des fondations (Typography, Shadows, Breakpoints absents) et deux librairies Figma concurrentes.',
            'case.dsaudit.fig.dev':        'Dette dev : 3 librairies d\'icônes, Vuetify contourné à coups d\'overrides, 0 Storybook, pas de repo de tokens partagé.',
            'case.dsaudit.fig.transverse': 'La dette la plus critique est transverse : pas de pont Figma→code, pas de parité, pas de gouvernance. L\'alignement design↔dev est devenu la priorité.',

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
            'case.transfer.outcome': '<p><strong>Feature adoptée et utilisée chaque semaine</strong> (Mixpanel).</p><ul class="case-list"><li><strong>Déploiement multi-sites débloqué :</strong> le client lance le déploiement sur 10+ sites. Impact business le plus significatif : la feature conditionnait l\'expansion du contrat.</li><li><strong>Processus éliminé :</strong> 8 étapes Excel → 1 action avec feedback visuel, traçabilité complète et annulation en 1 clic.</li><li><strong>Confiance utilisateur :</strong> l\'ordonnanceur voit exactement ce qu\'il a transféré, d\'où, vers où, et peut annuler. La traçabilité résout le problème initial.</li></ul><blockquote><p>« Les options qu\'on a demandées, elles fonctionnent. On a franchi un vrai cap. Je n\'ai plus de bloqueurs pour avancer sur le déploiement des autres sites. »</p><p>- Responsable planification de production</p></blockquote>',

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
    // URL prefix wins (/fr/... is the French version), then stored preference, then browser.
    const urlLang = (location.pathname === '/fr' || location.pathname.startsWith('/fr/')) ? 'fr' : null;
    let currentLang = urlLang || localStorage.getItem('folio-lang') || browserLang;

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

        // Keep the URL prefix (/fr) and canonical/og:url in sync with the language.
        if (typeof pathForPage === 'function' && typeof currentPage !== 'undefined') {
            history.replaceState({ page: currentPage }, '', pathForPage(currentPage));
            updatePageTitle(currentPage);
        }
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
    // Theme switch - light / dark
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
    // Scroll reveals - .reveal → .in
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
    // Footer clock - local time in Nantes (Europe/Paris)
    // ===================================
    function tickFooterClock() {
        const els = document.querySelectorAll('.footer-time');
        if (!els.length) return;
        const time = new Intl.DateTimeFormat('fr-FR', {
            timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit'
        }).format(new Date());
        els.forEach(el => { el.textContent = `Nantes ${time}`; });
    }
    tickFooterClock();
    setInterval(tickFooterClock, 30000);

    // ===================================
    // Projects list - floating "memory card" cover on hover.
    // One generated template per project: same structure, deterministic
    // ASCII motif seeded by the project slug. Desktop pointers only.
    // ===================================
    const COVER_DATA = {
        'project-ds-skills':        { metricKey: 'case.dsskills.metric1.value' },
        'project-ds-execution':     { metricKey: 'case.dsexec.metric2.value' },
        'project-multiselect':      { metricKey: 'case.multi.metric1.value', suffix: ' actions' },
        'project-figma-plugin':     { metricKey: 'case.plugin.metric1.value' },
        'project-ds-audit':         { metricKey: 'case.dsaudit.metric3.value' },
        'project-transfer':         { metricKey: 'case.transfer.metric3.value' },
        'project-expert-experience':{ metricKey: 'case.expert.metric1.value' },
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
                '<div class="cover-code"></div>' +
                '<div class="cover-title"></div>' +
                '<div class="cover-metric"></div>' +
                '<div class="cover-icon" aria-hidden="true"></div>' +
            '</div>';
        document.body.appendChild(preview);

        const coverCodeEl   = preview.querySelector('.cover-code');
        const coverMetricEl = preview.querySelector('.cover-metric');
        const coverTitleEl  = preview.querySelector('.cover-title');
        const coverIconEl   = preview.querySelector('.cover-icon');

        // Soft-pixel mass, Manoeuvres-style: a deterministic skyline of
        // desaturated slate/paper pixels seeded by the project slug.
        const PIX_PALETTES = {
            dark:  ['#3c434e', '#57626f', '#7b8b9e', '#a7b3c0', '#cfd0c8'],
            light: ['#525c69', '#75839a', '#a2adbc', '#c6cbc9', '#e0ddd2']
        };

        function seededRandom(str) {
            let h = 2166136261;
            for (let i = 0; i < str.length; i++) {
                h ^= str.charCodeAt(i);
                h = Math.imul(h, 16777619);
            }
            return function () {
                h += 0x6D2B79F5;
                let t = Math.imul(h ^ (h >>> 15), 1 | h);
                t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
        }

        const PIX_COLS = 30, PIX_ROWS = 9, PIX_CELL = 10;

        function buildMass(slug) {
            const rnd = seededRandom(slug);
            const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
            const pal = PIX_PALETTES[theme];
            // Column heights: a bounded random walk, flat outside the mass.
            const start = 2 + Math.floor(rnd() * 3);
            const end = PIX_COLS - 2 - Math.floor(rnd() * 3);
            let h = 2 + Math.floor(rnd() * 3);
            const heights = [];
            for (let c = 0; c < PIX_COLS; c++) {
                if (c < start || c > end) { heights.push(0); continue; }
                h += Math.floor(rnd() * 3) - 1;
                h = Math.max(1, Math.min(PIX_ROWS - 1, h));
                heights.push(h);
            }
            coverIconEl.style.gridTemplateColumns = `repeat(${PIX_COLS}, 1fr)`;
            coverIconEl.style.gridAutoRows = PIX_CELL + 'px';
            coverIconEl.textContent = '';
            for (let y = 0; y < PIX_ROWS; y++) {
                for (let x = 0; x < PIX_COLS; x++) {
                    const cell = document.createElement('i');
                    if (heights[x] >= (PIX_ROWS - y)) {
                        const t = rnd();
                        const idx = t < 0.16 ? 4 : t < 0.34 ? 3 : t < 0.58 ? 2 : (y > PIX_ROWS - 4 ? 0 : 1);
                        cell.style.background = pal[idx];
                    }
                    coverIconEl.appendChild(cell);
                }
            }
        }

        let pvX = 0, pvY = 0, pvTX = 0, pvTY = 0;
        let pvActive = false;

        document.addEventListener('mousemove', (e) => {
            pvTX = e.clientX + 28;
            pvTY = e.clientY - 90;
        });

        (function animPreview() {
            pvX += (pvTX - pvX) * 0.14;
            pvY += (pvTY - pvY) * 0.14;
            if (pvActive) {
                const maxX = window.innerWidth - 340;
                const maxY = window.innerHeight - 240;
                preview.style.transform =
                    `translate(${Math.min(pvX, maxX)}px, ${Math.max(12, Math.min(pvY, maxY))}px)`;
            }
            requestAnimationFrame(animPreview);
        })();

        document.querySelectorAll('#landing .project-card').forEach(card => {
            const slug = card.dataset.page;
            const data = COVER_DATA[slug];
            if (!data) return;
            card.addEventListener('mouseenter', () => {
                const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
                const company = card.querySelector('.project-company')?.textContent || '';
                const title = card.querySelector('.project-name')?.textContent || '';
                const index = card.querySelector('.project-index')?.textContent || '00';
                coverCodeEl.textContent = `${index} · ${company}`;
                coverTitleEl.textContent = title;
                coverMetricEl.textContent = (t[data.metricKey] || '') + (data.suffix || '');
                buildMass(slug);
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

    // --- Pixel skyline: generative PS2-style mass, dissolves on scroll ---
    (() => {
        const landing = document.getElementById('landing');
        const sky = document.querySelector('.pixel-skyline');
        if (!landing || !sky) return;

        // 32-bit palettes: a shaded body ramp (dark base -> light top), a
        // highlight, warm/glass windows, and low-contrast haze for the
        // distant back layer. Slate/paper family, theme-aware.
        const PAL = {
            dark: {
                body: ['#2f3640', '#3c4551', '#4e5a68', '#67788b', '#8ba0b6'],
                hi:   '#c2cfdd',
                win:  '#e7b968',
                haze: ['#262c35', '#2d343e', '#353d48']
            },
            light: {
                body: ['#59636f', '#6f7d8d', '#8d9bac', '#aab4bf', '#cdd0c9'],
                hi:   '#e2e2d9',
                win:  '#47566a',
                haze: ['#e7e5db', '#dedcd1', '#d4d3c8']
            }
        };

        const CELL = 11, ROWS = 16;

        // Stable per-cell hash noise (independent of draw order).
        function h2(x, y) {
            let n = (x * 374761393 + y * 668265263) | 0;
            n = Math.imul(n ^ (n >>> 13), 1274126177);
            return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
        }
        // Vertical shade with a touch of dither: top of a column is lightest,
        // base darkest; a few cells step a facet lighter/darker for texture.
        function shadeColor(P, x, y, top) {
            const span = Math.max(1, (ROWS - 1) - top);
            const f = (y - top) / span;
            let i = Math.round((1 - f) * (P.body.length - 1));
            const r = h2(x * 3 + 1, y * 5 + 2);
            if (r < 0.10) i += 1; else if (r > 0.92) i -= 1;
            return P.body[Math.max(0, Math.min(P.body.length - 1, i))];
        }
        // Lit window on the front base city (skip roof row + far edges).
        function isWindow(x, y, top) {
            return y > top && (x % 2 === 0) && (((ROWS - 1 - y) % 2) === 1) && h2(x, y) > 0.52;
        }

        // Nantes landmarks as pixel sprites. Chars map to palette indices
        // (0 = darkest .. 4 = lightest), '.' = empty. Rows top -> bottom,
        // bottom-aligned to the ground when stamped.
        const SPR = { '%': 0, '#': 1, '+': 2, ':': 3, '*': 4 };
        const sprite = (rows) => ({ w: rows[0].length, h: rows.length, rows });

        const CATHEDRALE = sprite([          // twin Gothic spires
            '..*...*..', '..#...#..', '..#...#..', '.###.###.', '.###.###.',
            '#########', '#########', '####*####', '#########', '##*###*##'
        ]);
        const ELEPHANT = sprite([            // Les Machines de l'île
            '.....#####...', '...########..', '..##########.', '.###########.',
            '.############', '%############', '%#.##.##.##..', '.#.##.##.##..',
            '...#..#..#...'
        ]);
        const TOUR_LU = sprite([             // Tour LU + cupola/finial
            '..*..', '..#..', '.:::.', ':::::', '.###.',
            '.###.', '.###.', '.###.', '.###.', '#####'
        ]);
        const TOUR_BRETAGNE = sprite([       // tallest modern tower + antenna
            '.*..', '####', '#*##', '####', '##*#', '####',
            '#*##', '####', '##*#', '####', '####'
        ]);
        const GRUE_TITAN = sprite([          // Titan portal crane
            '.#########.', '.#...#.....', '.....#.....', '....###....', '.....#.....',
            '....#.#....', '...#...#...', '...#...#...', '..#.....#..', '..#.....#..', '.#.......#.'
        ]);
        const SCENE = [CATHEDRALE, ELEPHANT, TOUR_LU, TOUR_BRETAGNE, GRUE_TITAN];
        const SCENE_GAP = 3;

        // Deterministic RNG (FNV-1a seed + mulberry32) so the base city is
        // stable across theme toggles and only extends on resize.
        function seeded(str) {
            let h = 2166136261;
            for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
            return function () {
                h += 0x6D2B79F5;
                let t = Math.imul(h ^ (h >>> 15), 1 | h);
                t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
        }

        function buildSkyline() {
            const cols = Math.ceil(window.innerWidth / CELL) + 2;
            const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
            const P = PAL[theme];
            const rnd = seeded('gc-nantes-32');

            // Layer 1 — distant haze (low contrast, sits furthest back).
            const hazeTop = new Array(cols), hazeTone = new Array(cols);
            let bt = 5 + Math.floor(rnd() * 3);
            for (let x = 0; x < cols; x++) {
                bt += Math.floor(rnd() * 3) - 1;
                bt = Math.max(4, Math.min(9, bt));
                hazeTop[x] = ROWS - bt;
                hazeTone[x] = P.haze[Math.floor(rnd() * P.haze.length)];
            }

            // Layer 3 — landmarks, centred. Mark their columns so the front
            // city doesn't grow through them; keep the haze visible behind.
            const isLm = new Array(cols).fill(false);
            const lmTop = new Array(cols).fill(ROWS);
            const lmCell = [];
            for (let y = 0; y < ROWS; y++) lmCell.push(new Int8Array(cols)); // 0 none, 2 body, 3 highlight
            let sceneW = -SCENE_GAP;
            SCENE.forEach(s => { sceneW += s.w + SCENE_GAP; });
            let cx = Math.max(0, Math.floor((cols - sceneW) / 2));
            SCENE.forEach(s => {
                for (let c = 0; c < s.w; c++) { const x = cx + c; if (x < cols) isLm[x] = true; }
                const top = ROWS - s.h;
                for (let r = 0; r < s.h; r++) {
                    for (let c = 0; c < s.w; c++) {
                        const ch = s.rows[r][c];
                        if (ch === '.') continue;
                        const x = cx + c, y = top + r;
                        if (x >= cols) continue;
                        lmCell[y][x] = (ch === '*' || ch === ':') ? 3 : 2;
                        if (y < lmTop[x]) lmTop[x] = y;
                    }
                }
                cx += s.w + SCENE_GAP;
            });

            // Layer 2 — front base city (skips landmark columns).
            const frontTop = new Array(cols).fill(ROWS);
            let ft = 2 + Math.floor(rnd() * 2);
            for (let x = 0; x < cols; x++) {
                ft += Math.floor(rnd() * 3) - 1;
                ft = Math.max(2, Math.min(6, ft));
                if (!isLm[x]) frontTop[x] = ROWS - ft;
            }

            // Render, back-to-front, one cell at a time.
            sky.style.gridTemplateColumns = `repeat(${cols}, ${CELL}px)`;
            sky.style.gridAutoRows = CELL + 'px';
            const frag = document.createDocumentFragment();
            const cells = [];
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < cols; x++) {
                    const cell = document.createElement('i');
                    let col = null;
                    const lm = lmCell[y][x];
                    if (lm === 3) {
                        col = P.hi;
                    } else if (lm === 2) {
                        col = shadeColor(P, x, y, lmTop[x]);
                    } else if (y >= frontTop[x]) {
                        col = isWindow(x, y, frontTop[x]) ? P.win : shadeColor(P, x, y, frontTop[x]);
                    } else if (y >= hazeTop[x]) {
                        col = hazeTone[x];
                    }
                    if (col) {
                        cell.style.background = col;
                        // per-pixel evaporation seeds: r1 = start delay, r2 = drift, row = height (top evaporates first)
                        cells.push({ el: cell, row: y, r1: h2(x * 2 + 7, y * 3 + 1), r2: h2(x * 5 + 2, y * 7 + 4) });
                    }
                    frag.appendChild(cell);
                }
            }
            sky.textContent = '';
            sky.appendChild(frag);
            skyCells = cells;
        }

        // Scroll-driven evaporation: pixels rise, shrink and fade as you
        // scroll into the page — top rows first, like vapour lifting off
        // (reversible on the way back up). Falls back to a plain opacity fade
        // under prefers-reduced-motion.
        let skyCells = [];
        const DIST = 520;
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let ticking = false, evaporating = false;
        const apply = () => {
            ticking = false;
            const p = Math.min(landing.scrollTop / DIST, 1);
            if (reduce) { sky.style.opacity = (0.5 - 0.35 * p).toFixed(3); return; }
            if (p > 0 && !evaporating) { sky.classList.add('scattering'); evaporating = true; }
            else if (p === 0 && evaporating) { sky.classList.remove('scattering'); evaporating = false; }
            for (let i = 0; i < skyCells.length; i++) {
                const c = skyCells[i];
                // higher rows (small row index) start lifting earlier
                const start = c.r1 * 0.45 + (1 - c.row / ROWS) * 0.28;
                const l = Math.max(0, Math.min((p - start) / 0.42, 1));
                if (l === c._l) continue;
                c._l = l;
                if (l === 0) { c.el.style.transform = ''; c.el.style.opacity = ''; continue; }
                const ty = -l * (26 + c.r2 * 48);                 // drift upward
                const tx = (c.r2 - 0.5) * 12 * l;                 // slight sideways wobble
                const sc = 1 - 0.45 * l;                          // shrink as it rises
                c.el.style.opacity = (1 - l).toFixed(3);
                c.el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ')';
            }
        };
        landing.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(apply); }
        }, { passive: true });

        const rebuild = () => { buildSkyline(); apply(); };
        rebuild();

        // Rebuild on width change (debounced) and on theme toggle.
        let rz;
        let lastCols = Math.ceil(window.innerWidth / CELL) + 2;
        window.addEventListener('resize', () => {
            clearTimeout(rz);
            rz = setTimeout(() => {
                const cols = Math.ceil(window.innerWidth / CELL) + 2;
                if (cols !== lastCols) { lastCols = cols; rebuild(); }
            }, 150);
        });
        new MutationObserver(rebuild).observe(document.documentElement, {
            attributes: true, attributeFilter: ['data-theme']
        });
    })();

})();
