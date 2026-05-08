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
        const links = document.querySelector('.landing-links');
        if (sub)   setTimeout(() => sub.classList.add('visible'), 320);
        if (links) setTimeout(() => links.classList.add('visible'), 520);
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

        // Crossfade: both pages transition simultaneously
        current.classList.add('page--exit');
        current.classList.remove('page--active');
        next.classList.add('page--active');
        next.scrollTop = 0;
        currentPage = pageId;
        updateNav();           // landing-active toggled immediately → galaxy-bg in sync
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

    // ===================================
    // Star Button
    // ===================================
    const starBtn      = document.getElementById('star-btn');
    const starCountEl  = document.getElementById('star-count');
    const starTooltipEl = document.getElementById('star-tooltip');
    let isStarred  = localStorage.getItem('folio-starred') === 'true';
    let starCount  = parseInt(localStorage.getItem('folio-star-count') || '0', 10);

    function updateStarUI() {
        if (starCountEl) starCountEl.textContent = starCount;
        starBtn?.classList.toggle('starred', isStarred);
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
        if (!isStarred) {
            isStarred = true;
            starCount++;
            localStorage.setItem('folio-starred', 'true');
            localStorage.setItem('folio-star-count', starCount.toString());
        } else {
            isStarred = false;
            starCount = Math.max(0, starCount - 1);
            localStorage.setItem('folio-starred', 'false');
            localStorage.setItem('folio-star-count', starCount.toString());
        }
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
            'nav.who':      'Who am I',
            'nav.projects': 'Projects',
            'nav.star':     'Star',

            // Landing
            'landing.line1':    'Senior Product Designer',
            'landing.line2_pre':'currently working at ',
            'landing.sub':      'Guillaume Caillet — 7+ years of experience — Based in France',
            'landing.email':    'Email me',
            'landing.linkedin': 'LinkedIn Profile',

            // Who page
            'who.title': 'Who am I?',
            'who.intro.p1': 'My journey into design started way before any formal training — back when I was a kid playing <s>Counter-Strike</s> on the family computer, I wasn\'t just into the game; I was fascinated by the branding around pro teams like SK, NiP, Fnatic, and VeryGames. I started creating logos and nicknames for my teammates using Photoshop 7 (yes, I was only 6). That\'s where the story began.',
            'who.intro.p2': 'Over time, I grew more curious about how visual systems work and how beautiful things are built. After a (brief and not-so-passionate) detour through an accounting degree, I realigned myself with what had been driving me for years and pursued studies in Design and Engineering. I\'ve always been as interested in building tools as in designing with them.',
            'who.intro.p3': 'Today, I work as a <strong>Senior Product Designer</strong> at <strong>Oplit</strong>, a B2B SaaS platform for industrial scheduling and capacity planning. My users are schedulers, production planners, and shop-floor operators in sectors like luxury watchmaking, automotive, aerospace, and precision engineering. My role is a bridge between design, product, and engineering — I write specifications in Linear, synthesize research in Notion, design in Figma, and track adoption in Mixpanel.',
            'who.intro.p4': 'Beyond product design, I own Oplit\'s design system — <strong>Opal</strong>. I ran a full audit (findings graded CRITICAL / WARNING / INFO), rebuilt 44 components, applied 2,634 token bindings (from 92), and established a 4-step dev-alignment workflow: Figma → Notion doc → Storybook review → Linear ticket closed. I also built a Figma plugin in JavaScript to automate local component audits. I\'m fluent in the domain vocabulary of industrial production: work orders (WOs), routing sheets, load rates, work centers, capacity planning.',
            'who.intro.p5': 'I\'m drawn to environments where design shapes how organisations actually operate — not just how products look. The most meaningful work I\'ve done isn\'t a screen: it\'s a decision framework that stuck, a component library that shipped on time, a research synthesis that changed a product roadmap.',

            'who.section.professional': 'Professional Experiences',
            'who.section.other':        'Other experiences',
            'who.section.studies':      'Studies',
            'who.section.mentoring':    'Mentoring',
            'who.section.articles':     'Articles',
            'who.section.podcasts':     'Podcasts',
            'who.section.templates':    'Templates for Notion',
            'who.section.cv':           'Curriculum Vitae',
            'who.section.links':        'Useful links',

            'who.date.oplit':       'Sept. 2025 — Now',
            'who.date.prestashop':  'June 2022 — Aug. 2025',
            'who.date.beapp':       'June 2021 — June 2022',
            'who.date.lacapsule':   'Oct. 2020 — June 2021',
            'who.date.airbus':      'Sept. 2018 — June 2020',
            'who.date.sncf':        'March 2018 — Aug. 2018',
            'who.date.stereosuper': 'Aug. 2015 — Sept. 2017',
            'who.date.teacher':     '2025 — Now',
            'who.date.mentor':      '2024 — Now',
            'who.date.speaker':     '2021 — Now',
            'who.date.freelance':   '2020 — Now',

            'who.role.oplit':       'Senior Product Designer',
            'who.role.prestashop':  'Product Designer',
            'who.role.beapp':       'UX/UI Designer',
            'who.role.lacapsule':   'UX Designer Consultant',
            'who.role.airbus':      'UX Designer',
            'who.role.sncf':        'UX Designer — Internship',
            'who.role.stereosuper': 'UX Designer — Work-study',
            'who.role.teacher':     'Teacher',
            'who.role.speaker':     'Speaker',
            'who.role.freelance':   'Freelancing',

            'who.desc.oplit':       '<p><strong>Industrial scheduling &amp; capacity planning SaaS.</strong> My users — schedulers, planners, shop-floor operators — work in luxury watchmaking, automotive, aerospace, and precision engineering. 3 years of accumulated research, 9+ clients interviewed.</p><p><strong>Opal Design System ownership:</strong> full audit (CRITICAL / WARNING / INFO grading), 44 components rebuilt, 2,634 token bindings applied (from 92), 3 icon libraries → 1, 100% component compliance (from 9%). Dev-alignment workflow: Figma → Notion doc → Storybook/Chromatic → Linear closed. 11 components in dev review. Estimated gain: +20–30% per feature.</p><p><strong>Automation:</strong> 1,755 token bindings applied in a single Claude Code + Figma MCP session — 45k nodes analysed, 879 auto-corrections.</p><p><strong>Frameworks:</strong> FOCUSED spec (Notion), FUC use cases, Discovery Client, Internal Audit. Specs written as "when X → then Y" in Linear.</p><p><strong>Figma plugin:</strong> built <em>Local Components Collector</em> in JavaScript (Figma Plugin API) — reduces DS audit from days to hours.</p>',
            'who.desc.prestashop':  '<p><strong>Sr Product Designer &amp; Design System Lead (2024)</strong></p><p>Progressively structures and deploys the research system across PrestaShop. Responsible for structuring and making the tools, templates, and user data operationally available so product teams can access them quickly and efficiently. The aim is to provide efficient access to user search when designing PrestaShop products for our 300k+ merchants.</p><p>Also working on structuring the Design System to make it robust, flexible and scalable. Proposing areas for development, structuring the team around the project and giving visibility to what we\'re doing.</p><p><strong>Design System contributor (2023)</strong></p><p>Involved in structuring and implementing the PrestaShop Design System. Working on the monitoring, implementation, and use of components and design tokens by everyone who uses the design system, as well as the components designed by the Product Designers.</p><p><strong>Product Designer (2022)</strong></p><p>Within the Customer Platform team, working on the design and improvement of the user experience through the user account and, more generally, the login experience.</p>',
            'who.desc.beapp':       '<p>In charge of UX at Beapp, working mainly with the UI designer and in contact with all the people involved in the various customer projects (PO, Business, Tech).</p><p>Designing experiences for different types of clients in the healthcare, automotive, food, institutional, and other sectors. Running creativity, immersion, and co-creation workshops. In charge of user research and testing.</p>',
            'who.desc.lacapsule':   '<p>Work as a UX consultant for companies looking to improve their user experience.</p>',
            'who.desc.airbus':      '<p>Joined the team of UX/UI designers (UXiD) as part of a process to digitalize the Airbus Group. The team designs and redesigns processes as well as business applications and HMIs, putting people back at the heart of their design.</p><p>Responsible for disseminating UX guidelines and best practices throughout the group. Collecting user requirements, participating in the design of business applications, organising information architecture, and working in collaboration with IT and other departments.</p>',
            'who.desc.sncf':        '<p>Working as a UX designer in section 574 (innovation) at the SNCF in Nantes. In charge of designing personas, user paths, and screen ergonomics for different applications.</p>',
            'who.desc.stereosuper': '<p>An apprentice for 2 years and trained as a web designer with a specialization in UX design, working on several projects and building up solid experience in a field I\'m passionate about.</p>',
            'who.desc.teacher':     '<p>Teaching the basics of UI Design to young designers.</p>',
            'who.desc.mentor':      '<p>Helping designers, no matter their seniority, to grow and giving them feedbacks about their projects or career perspectives.</p>',
            'who.desc.speaker':     '<ul><li>Eco-design &amp; Design System 2023, 2024, 2025 (Speaker)</li><li>Design System \'22-\'23 (Annual project) — 100% students graduated</li><li>User Research Methods \'21-\'22 (Lecturer)</li></ul>',

            'who.mentoring.link':  'Get mentored by Guillaume CAILLET on ADPList →',
            'who.articles.text':   'I have written a few articles on various subjects, such as <strong>design</strong>, <strong>design systems</strong>, and <strong>user research</strong>.',
            'who.articles.link':   'Guillaume CAILLET on Medium →',
            'who.podcast.simon':   'Interview with Simon Robic on mobile-first design →',
            'who.templates.link':  'Guillaume Caillet | Notion Template Creator →',
            'who.cv.link':         'Download CV (PDF) →',
            'who.email':           'Email me',
            'who.linkedin':        'LinkedIn Profile',

            // Projects
            'projects.title': 'Projects',

            // Case studies — shared
            'case.back':             '← Back to projects',
            'case.label':            'Case Study',
            'case.section.situation':'Situation',
            'case.section.tasks':    'Tasks & Actions',
            'case.section.results':  'Results',
            'case.section.next':     'Next Steps',
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

            // Year labels
            'year.2026': '2026',
            'year.2025': '2025',
            'year.2024': '2024',

            // Design System
            'case.ds.title':    'PrestaShop Design System',
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
            'case.ca.title':    'PrestaShop Customer Account',
            'case.ca.subtitle': 'Unification and redesign of the PrestaShop user account, previously split into three separate accounts (Back Office, Marketplace, Business Care).',
            'case.ca.metric1.value': '3 → 1',
            'case.ca.metric1.label': 'accounts unified into a single customer account',
            'case.ca.metric2.value': '0',
            'case.ca.metric2.label': 'support requests needed for basic account updates',
            'case.ca.situation': '<p>PrestaShop users struggled to manage their interactions due to three separate accounts: Back Office for shop management, Marketplace account for module purchases, and User account for business care subscription invoices.</p><p>These fragmented systems created confusion, inconsistency, and inefficiency. Basic actions like updating emails or passwords required users to contact technical support, leading to unnecessary delays.</p>',
            'case.ca.tasks':    '<ul class="case-list"><li>Led exploratory user research, competitive benchmarking, and co-creation workshops to pinpoint pain points and user needs.</li><li>Oversaw the consolidation of disparate user databases into a single source of truth.</li><li>Redesigned the UI to clearly distinguish personal and business information.</li><li>Prioritized must-have features: self-service for updates, account deletion, and unified billing management.</li><li>Streamlined onboarding by encouraging Google account creation to reduce friction.</li></ul>',
            'case.ca.results':  '<ul class="case-list"><li>Full user autonomy over data, eliminating dependency on support for updates.</li><li>Data consistently synchronized across all PrestaShop services.</li><li>Increased user satisfaction through positive feedback.</li><li>Streamlined processes for billing and account management.</li></ul>',

            // Sign in/up
            'case.si.title':    'Sign in / Sign up Flow',
            'case.si.subtitle': 'Redesign of the account creation and connection flow to make it fluid and simple throughout the PrestaShop product.',
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
            'case.sa.metric2.value': '↓',
            'case.sa.metric2.label': 'marked decrease in abandonment due to errors',
            'case.sa.situation': '<p>The shop association process, particularly for open-source installations, was a major source of confusion. Merchants didn\'t understand why association was required and abandoned the process — especially when errors occurred.</p><p>The association exists because most users have Open Source shops installed locally on their hosting, not always identified as belonging to the owner account. Association creates this connection.</p>',
            'case.sa.tasks':    '<ul class="case-list"><li>Conducted research to identify key pain points and abandonment triggers.</li><li>Redesigned the flow to require only the necessary information, providing clear guidance and error correction.</li><li>Modeled the new process on the SaaS "Edition" experience, offering seamless association for recognized shop owners.</li><li>Prototyped the new flow (including a demonstrative video) and validated improvements with stakeholders.</li></ul>',
            'case.sa.results':  '<ul class="case-list"><li>Major improvement in user comprehension and reduced frustration.</li><li>Most shop traffic now flows through the updated payment platform and onboarding.</li><li>Unified the experience with the "Edition" SaaS model for consistency.</li></ul>',

            // Operator Planning
            'case.op.title':    'Oplit — Operator Planning',
            'case.op.subtitle': 'Designing the first operator-facing module in an industrial scheduling platform — from 9-client research to the strategic decision to skip an intermediate step.',
            'case.op.metric1.value': '9',
            'case.op.metric1.label': 'clients interviewed across 5 sectors',
            'case.op.metric2.value': '3 yrs',
            'case.op.metric2.label': 'of accumulated research fed into this feature',
            'case.op.metric3.value': '3',
            'case.op.metric3.label': 'pilot clients launched at rollout',
            'case.op.situation': '<p>Operators — the people on the shop floor who actually produce the parts — were completely absent from the platform. Schedulers managed workflows in a vacuum, with no direct connection to the operators executing them. This gap was becoming a blocker for acquisition and retention on strategic accounts.</p>',
            'case.op.research':  '<p>I ran structured discovery sessions with 9 clients across sectors: luxury watchmaking, automotive, aerospace, precision mechanics. Each session mapped onto 8 comparable blocks, separating recurring patterns from sector-specific requirements.</p><p>I built a 10-dimension competency framework (knowledge, know-how, behavioral), a polyvalence matrix per operator profile, and a regulatory certification tracking model. Research was synthesized in Notion using the Discovery Client framework.</p>',
            'case.op.decision':  '<p>During a cross-team brainstorm, two paths were debated: an intermediate "setter" step, or going directly to full operator planning. The setter option was ~3× more complex — for a transitional use clients would quickly outgrow. I defended and drove adoption of the direct operator planning path, documenting 8 hypotheses (H1–H8) to support the decision.</p>',
            'case.op.output':    '<p>Full FOCUSED spec in Notion. FUC use case matrix. Client trigger milestones. Figma design covering nominative WO assignment, absence management, polyvalence visualization, and certification tracking.</p>',
            'case.op.results':   '<p>3 pilot clients launched at rollout. Nominative WO assignment replaced the previous "unassigned" default. Absence processing time reduced. The module became a key acquisition argument for accounts that previously blocked on this gap.</p>',

            // Gantt & OF Dependencies
            'case.gantt.title':    'Oplit — WO Dependencies & Gantt',
            'case.gantt.subtitle': 'Designing the dependency model between work orders — resolving a persistent semantic confusion between grouping and sequential dependencies, with configurable transfer delays.',
            'case.gantt.metric1.value': '2',
            'case.gantt.metric1.label': 'dependency types (grouping vs. sequential)',
            'case.gantt.metric2.value': 'buffer ≠ lead time',
            'case.gantt.metric2.label': 'semantic distinction formally established',
            'case.gantt.metric3.value': '0',
            'case.gantt.metric3.label': 'hardcoded delay values — fully configurable',
            'case.gantt.situation': '<p>Several clients in watchmaking, automotive, and precision mechanics needed to model relationships between work orders (WOs). A WO for "machining" had to complete before "treatment" could begin — but the exact nature of that relationship varied: sometimes back-to-back (no delay), sometimes with a configurable transfer delay between operations.</p>',
            'case.gantt.problem':   '<p>Two fundamentally different relationships were constantly confused: <strong>grouping</strong> (operations run back-to-back, no delay, same scheduling block) and <strong>sequential dependency</strong> (one WO must end before another can begin, with a configurable transfer delay). Treating them the same caused incorrect scheduling and cascade delays.</p><p>A second confusion: buffer (extra time added for safety) vs. lead time (structural delay tied to the routing sheet). Both are time gaps — but one is configuration, the other is specification.</p>',
            'case.gantt.solution':  '<p>Two distinct interaction models: a <strong>band view</strong> with SVG connectors (solid line = grouping, dashed = sequential), color-coded by parent-child family, alert badges (blocking/blocked) on affected WOs, and buffer annotations (e.g. "D+2") colored by delay risk. A <strong>list view</strong> with tree indentation, type badges, and a Grouping column for quick scanning.</p>',
            'case.gantt.results':   '<p>Schedulers gained a systemic view of dependency chains. Cascade delays became anticipatable. Watchmaking clients — where multi-step routing sheets are standard — adopted the feature immediately as a key planning tool.</p>',

            // DS Execution (Actions correctives 2026)
            'case.dsexec.title':    'Oplit — Opal DS · Corrective Actions',
            'case.dsexec.subtitle': 'Executing the design system remediation plan: rebuilding 44 components, applying 2,634 token bindings, and establishing a dev-alignment workflow that accelerates feature delivery by 20–30%.',
            'case.dsexec.metric1.value': '92 → 2 634',
            'case.dsexec.metric1.label': 'token bindings applied',
            'case.dsexec.metric2.value': '9% → 100%',
            'case.dsexec.metric2.label': 'component compliance rate',
            'case.dsexec.metric3.value': '44',
            'case.dsexec.metric3.label': 'components rebuilt · 0 hardcoded values remaining',
            'case.dsexec.execution':   '<p>With the audit findings as a roadmap, I executed in 5 ordered phases: foundations (color palette, spacing, typography, iconography, vocabulary), then component-by-component reconstruction. 3 icon libraries consolidated into 1. Every hex value replaced by a token reference.</p>',
            'case.dsexec.automation':  '<p>Token binding was the highest-volume task. I automated it using Claude Code with the Figma MCP — 1,755 bindings applied in a single session, 45,000+ nodes analysed, 879 auto-corrections. What would have taken weeks took hours.</p>',
            'case.dsexec.alignment':   '<p>4-step dev-alignment workflow: <strong>Figma</strong> (design + tokens applied) → <strong>Notion doc</strong> (states, variants, props) → <strong>Storybook/Chromatic</strong> (implementation reviewed by designer) → <strong>Linear ticket closed</strong>. As of April 2026: 11 components in dev review — FButton, FTextfield, OpalSwitch, FChip, FDialog, and 6 others.</p>',
            'case.dsexec.results':     '<p>44 components rebuilt. 0 hardcoded values remaining. 3 → 1 icon library. Estimated +20–30% gain per feature cycle. The design system went from an implicit, undocumented system to a structured, scalable, dev-aligned infrastructure.</p>',

            // Plugin Figma
            'case.plugin.title':    'Figma Plugin — Local Components Collector',
            'case.plugin.subtitle': 'A JavaScript plugin built with the Figma Plugin API to automate local component audits — reducing DS audit time from days to hours.',
            'case.plugin.metric1.value': 'days → hours',
            'case.plugin.metric1.label': 'DS audit time reduction',
            'case.plugin.metric2.value': '0',
            'case.plugin.metric2.label': 'manual file-by-file navigation needed',
            'case.plugin.metric3.value': 'JS',
            'case.plugin.metric3.label': 'built with Figma Plugin API',
            'case.plugin.problem':   '<p>Without a dedicated tool, identifying un-factorized local components in a Figma file is entirely manual: open each frame, inspect each element, note duplicates. No consolidated view exists natively. This directly delays factorization work and silently grows design debt between audits.</p>',
            'case.plugin.approach':  '<p>I identified the need through personal friction while running a DS audit at Oplit. Instead of waiting for an engineering solution, I built the tool myself. I defined criteria for a "factorization candidate": frequency of use, presence of variants, visual and structural complexity.</p>',
            'case.plugin.howworks': '<p>The plugin is written in JavaScript using the Figma Plugin API. It crawls all nodes in the current file, detects local components (not from a shared library), and generates a structured report: component name, usage count, parent frame, factorization priority. The report displays directly in the plugin panel — no export needed.</p>',
            'case.plugin.impact':    '<p>DS audit time reduced from several days to a few hours. Factorization candidates are identified objectively. The plugin demonstrates that a senior designer can deliver tooling value without waiting on engineering bandwidth.</p>',

            // DS Audit (2025)
            'case.dsaudit.title':    'Oplit — Opal DS · Audit',
            'case.dsaudit.subtitle': 'Systematic audit of the Opal design system — graded findings (CRITICAL / WARNING / INFO), four reference frameworks, and a 3-horizon remediation plan.',
            'case.dsaudit.metric1.value': '3 levels',
            'case.dsaudit.metric1.label': 'CRITICAL / WARNING / INFO severity grading',
            'case.dsaudit.metric2.value': '3 horizons',
            'case.dsaudit.metric2.label': 'Immediate / Next / Future remediation plan',
            'case.dsaudit.metric3.value': '4 frameworks',
            'case.dsaudit.metric3.label': 'Atomic Design · BEM · DTCG · WCAG 2.1 AA',
            'case.dsaudit.situation':    '<p>Design and code weren\'t talking to each other. The same button appeared in 5 different variants depending on the page. No shared documentation existed. Rules lived in people\'s heads. Every new developer had to reverse-engineer the system from production.</p>',
            'case.dsaudit.methodology':  '<p>I built a custom audit protocol using the Figma MCP: systematic reading of every component in the library, evaluated against 4 reference frameworks — Atomic Design (structure), BEM (naming), DTCG (token architecture), WCAG 2.1 AA (accessibility). Each finding was graded: CRITICAL (blocks correct usage), WARNING (inconsistency, technical debt risk), INFO (improvement opportunity).</p>',
            'case.dsaudit.findings':     '<p><strong>Button — NON-COMPLIANT:</strong> hex values in shadow properties, "Type" prop collision with reserved keyword, token path conflicts. <strong>Foundations — NEEDS WORK:</strong> forked naming conventions, 3 different names for the same opacity primitive. Report structured by severity with 3 remediation horizons: Immediate (blockers), Next (next sprint), Future (backlog).</p>',
            'case.dsaudit.plan':         '<p>5-step remediation plan: 1. Audit → 2. Foundations (color tokens, spacing, typography, iconography, vocabulary) → 3. Components (rebuilt one by one against the audit report) → 4. Dev alignment (Storybook, review workflow) → 5. Deployment. Each step had explicit entry/exit criteria.</p>',

            // WO Lock & Lead Time
            'case.lock.title':    'Oplit — WO Lock & Lead Time',
            'case.lock.subtitle': 'Two coupled features that protect production plans from accidental modifications and integrate structural transfer delays into scheduling calculations.',
            'case.lock.metric1.value': '2 features',
            'case.lock.metric1.label': 'coupled — lock + lead time',
            'case.lock.metric2.value': '0',
            'case.lock.metric2.label': 'accidental modifications reported since deployment',
            'case.lock.metric3.value': 'when X → then Y',
            'case.lock.metric3.label': 'specification method in Linear',
            'case.lock.problem':     '<p>A work order (WO) in production could be modified by any user at any time — including WOs already dispatched to the shop floor. This caused production inconsistencies: operators working from different data than schedulers. Lead time was also ignored: structural transfer delays between operations were omitted or hardcoded, making scheduling calculations unreliable.</p>',
            'case.lock.conception':  '<p>I designed a lock mechanism with 4 states (unlocked, locked, partially locked, inherited) and explicit inheritance rules for dependent WOs. Lead time became a configurable property per work center, with automatic propagation through the routing sheet. All state transitions were specified using the "when X → then Y" format in Linear, with role-based permission tables.</p>',
            'case.lock.results':     '<p>Zero accidental modifications reported since deployment. Lead time is now integrated into all scheduling calculations, improving accuracy of load and capacity projections. The feature became a prerequisite for clients with multi-step routing sheets.</p>',

            // Bulk Edit & Multi-select
            'case.multi.title':    'Oplit — Bulk Edit & Multi-select',
            'case.multi.subtitle': 'A transversal interaction pattern deployed across 4 views — contextual floating toolbar, exhaustive state matrix, zero destructive actions without confirmation.',
            'case.multi.metric1.value': '4 views',
            'case.multi.metric1.label': 'Gantt, list, kanban, table',
            'case.multi.metric2.value': '×6',
            'case.multi.metric2.label': 'estimated time reduction for bulk edits',
            'case.multi.metric3.value': '0',
            'case.multi.metric3.label': 'destructive actions without confirmation',
            'case.multi.problem':    '<p>Modifying 50 work orders one by one — changing a priority, updating a work center, rescheduling a batch — was standard practice. No grouped action existed. For schedulers handling hundreds of WOs daily, this friction compounded across every session.</p>',
            'case.multi.approach':   '<p>I identified multi-select as a transversal pattern, not a view-specific feature. It needed to work consistently across Gantt, list, kanban, and data table. I designed a contextual floating toolbar: safe actions (edit, assign, reschedule) and destructive actions (delete, cancel) separated visually, with confirmation required for the latter. Edge cases handled: locked WOs in mixed selections, partial selections across filtered views.</p>',
            'case.multi.matrix':     '<p>Complete state matrix built before any dev handoff: (none selected / partial / all selected) × (all available actions) × (locked WOs present in selection). This prevented undefined states from reaching production and made the Linear spec self-sufficient.</p>',
            'case.multi.results':    '<p>Deployed across all 4 views. Immediate adoption from schedulers. Estimated ×6 time reduction for batch operations. The pattern established a reusable interaction convention across the product.</p>',

            // Sticky Bar
            'case.sticky.title':    'Oplit — Sticky Bar Label',
            'case.sticky.subtitle': 'A targeted fix for a critical UX error identified through user feedback — a bar label that disappears on scroll, confirmed as a source of production mistakes on the shop floor.',
            'case.sticky.metric1.value': '1',
            'case.sticky.metric1.label': 'critical UX error corrected',
            'case.sticky.metric2.value': '0',
            'case.sticky.metric2.label': 'label-ambiguity errors reported post-deployment',
            'case.sticky.metric3.value': 'sticky',
            'case.sticky.metric3.label': 'label visible regardless of scroll position',
            'case.sticky.problem':   '<p>On long Gantt views (spanning weeks or months), horizontal scrolling causes WO bar labels to disappear off the left edge of the screen. Schedulers and operators lose context about which WO they\'re looking at. This was confirmed by users as a cause of real production errors: dispatching the wrong WO to the wrong operator.</p>',
            'case.sticky.solution':  '<p>A sticky label anchored to the left edge of the visible area, remaining readable regardless of scroll position. The label maintains clear visual distinction from the bar: it sits outside the bar bounds, uses the same color coding, and includes the WO reference number. When the bar scrolls fully off-screen to the right, the sticky label still indicates its position.</p>',
            'case.sticky.details':   '<p>Key implementation considerations: z-index layering to avoid collisions with other bars. Clip behavior when the bar is narrower than the label. Truncation rules at very small bar sizes. The pattern was subsequently extended to all bar types in the Gantt (capacity bars, holiday blocks).</p>',
            'case.sticky.impact':    '<p>Zero label-ambiguity errors reported since deployment. Rolled out as a priority patch after user feedback confirmed it as a safety-critical production issue. Extended to all bar types in the Gantt.</p>',
        },

        fr: {
            // Nav
            'nav.who':      'Qui suis-je',
            'nav.projects': 'Projets',
            'nav.star':     'Star',

            // Landing
            'landing.line1':    'Senior Product Designer',
            'landing.line2_pre':'actuellement chez ',
            'landing.sub':      'Guillaume Caillet — 7+ ans d\'expérience — Basé en France',
            'landing.email':    'M\'écrire',
            'landing.linkedin': 'Profil LinkedIn',

            // Who page
            'who.title': 'Qui suis-je ?',
            'who.intro.p1': 'Mon parcours dans le design a commencé bien avant toute formation — gamin, quand je jouais à <s>Counter-Strike</s> sur l\'ordinateur familial, je n\'étais pas juste dans le jeu ; j\'étais fasciné par le branding des équipes pro comme SK, NiP, Fnatic et VeryGames. J\'ai commencé à créer des logos et des pseudos pour mes coéquipiers avec Photoshop 7 (oui, j\'avais 6 ans). C\'est là que tout a commencé.',
            'who.intro.p2': 'Au fil du temps, j\'ai développé une curiosité pour les systèmes visuels et la façon dont les belles choses sont construites. Après un (bref et peu passionné) détour par une formation en comptabilité, je me suis réaligné avec ce qui me motivait depuis des années. J\'ai toujours été autant attiré par la construction d\'outils que par leur usage pour concevoir.',
            'who.intro.p3': 'Aujourd\'hui, je suis <strong>Senior Product Designer</strong> chez <strong>Oplit</strong>, une plateforme SaaS B2B dédiée à l\'ordonnancement industriel et à la planification capacitaire. Mes utilisateurs sont des planificateurs, ordonnanceurs et opérateurs d\'atelier dans des secteurs comme l\'horlogerie de luxe, l\'automobile, l\'aéronautique et la mécanique fine. Mon rôle est un pont entre design, produit et engineering — je rédige des specs dans Linear, synthétise la recherche dans Notion, conçois dans Figma et suis l\'adoption dans Mixpanel.',
            'who.intro.p4': 'Au-delà du design produit, j\'ai la propriété du design system d\'Oplit — <strong>Opal</strong>. J\'ai conduit un audit complet (findings classés CRITICAL / WARNING / INFO), reconstruit 44 composants, appliqué 2 634 token bindings (contre 92 à l\'origine), et établi un workflow dev-alignment en 4 étapes : Figma → doc Notion → revue Storybook → ticket Linear fermé. J\'ai aussi développé un plugin Figma en JavaScript pour automatiser l\'audit des composants locaux. Je suis fluent dans le vocabulaire métier de la production industrielle : ordres de fabrication (OF), gammes, taux de charge, postes de charge, planification capacitaire.',
            'who.intro.p5': 'Je suis attiré par les environnements où le design façonne comment les organisations fonctionnent réellement — pas seulement comment les produits se présentent. Les travaux qui ont le plus de sens ne sont pas des écrans : c\'est un cadre de décision qui a tenu, une bibliothèque de composants livrée dans les temps, une synthèse de recherche qui a changé une roadmap produit.',

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
            'who.date.speaker':     '2021 — Aujourd\'hui',
            'who.date.freelance':   '2020 — Aujourd\'hui',

            'who.role.oplit':       'Senior Product Designer',
            'who.role.prestashop':  'Product Designer',
            'who.role.beapp':       'UX/UI Designer',
            'who.role.lacapsule':   'Consultant UX Designer',
            'who.role.airbus':      'UX Designer',
            'who.role.sncf':        'UX Designer — Stage',
            'who.role.stereosuper': 'UX Designer — Alternance',
            'who.role.teacher':     'Enseignant',
            'who.role.speaker':     'Intervenant',
            'who.role.freelance':   'Freelance',

            'who.desc.oplit':       '<p><strong>SaaS d\'ordonnancement industriel &amp; planification capacitaire.</strong> Mes utilisateurs — planificateurs, ordonnanceurs, opérateurs atelier — travaillent dans l\'horlogerie de luxe, l\'automobile, l\'aéronautique et la mécanique fine. 3 ans de recherche capitalisée, 9+ clients interviewés.</p><p><strong>Ownership Design System Opal :</strong> audit complet (CRITICAL / WARNING / INFO), 44 composants reconstruits, 2 634 token bindings appliqués (contre 92 initiaux), 3 librairies d\'icônes → 1, 100% de conformité composants (contre 9%). Workflow dev-alignment : Figma → doc Notion → Storybook/Chromatic → ticket Linear fermé. 11 composants en revue dev. Gain estimé : +20–30% par fonctionnalité.</p><p><strong>Automatisation :</strong> 1 755 bindings appliqués en une session Claude Code + MCP Figma — 45k nœuds analysés, 879 corrections automatiques.</p><p><strong>Frameworks :</strong> spec FOCUSED (Notion), cas d\'usage FUC, Discovery Client, Audit Interne. Specs rédigées en "when X → then Y" dans Linear.</p><p><strong>Plugin Figma :</strong> développé <em>Local Components Collector</em> en JavaScript (Figma Plugin API) — passe l\'audit DS de plusieurs jours à quelques heures.</p>',
            'who.desc.prestashop':  '<p><strong>Sr Product Designer &amp; Design System Lead (2024)</strong></p><p>Déploiement progressif du système de recherche chez PrestaShop. Responsable de la structuration et de la mise à disposition opérationnelle des outils, templates et données utilisateurs pour que les équipes produit y accèdent rapidement et efficacement. L\'objectif est d\'offrir un accès efficace à la recherche utilisateur lors de la conception des produits PrestaShop pour nos 300k+ marchands.</p><p>Travail également sur la structuration du Design System pour le rendre robuste, flexible et scalable. Proposition d\'axes de développement, structuration de l\'équipe autour du projet et mise en visibilité des travaux.</p><p><strong>Contributeur Design System (2023)</strong></p><p>Implication dans la structuration et l\'implémentation du Design System PrestaShop. Travail sur le suivi, l\'implémentation et l\'usage des composants et design tokens par l\'ensemble des utilisateurs du système, ainsi que sur les composants conçus par les Product Designers.</p><p><strong>Product Designer (2022)</strong></p><p>Au sein de l\'équipe Customer Platform, travail sur la conception et l\'amélioration de l\'expérience utilisateur au travers du compte utilisateur et, plus généralement, de l\'expérience de connexion.</p>',
            'who.desc.beapp':       '<p>En charge de l\'UX chez Beapp, travaillant principalement avec le designer UI et en contact avec toutes les personnes impliquées dans les différents projets clients (PO, Business, Tech).</p><p>Conception d\'expériences pour différents types de clients dans les secteurs santé, automobile, alimentaire, institutionnel, etc. Animation d\'ateliers de créativité, d\'immersion et de co-création. En charge de la recherche utilisateur et des tests.</p>',
            'who.desc.lacapsule':   '<p>Travail en tant que consultant UX pour des entreprises souhaitant améliorer leur expérience utilisateur.</p>',
            'who.desc.airbus':      '<p>Intégration de l\'équipe de designers UX/UI (UXiD) dans le cadre d\'un processus de digitalisation du Groupe Airbus. L\'équipe conçoit et repense des processus ainsi que des applications métier et des IHM, en remettant l\'humain au cœur du design.</p><p>Responsable de la diffusion des guidelines UX et des bonnes pratiques au sein du groupe. Collecte des besoins utilisateurs, participation à la conception d\'applications métier, organisation de l\'architecture d\'information, et travail en collaboration avec l\'IT et les autres départements.</p>',
            'who.desc.sncf':        '<p>UX designer en section 574 (innovation) à la SNCF à Nantes. En charge de la conception de personas, de parcours utilisateurs et de l\'ergonomie des écrans pour différentes applications.</p>',
            'who.desc.stereosuper': '<p>Apprenti pendant 2 ans, formé en tant que web designer avec une spécialisation en UX design, travaillant sur plusieurs projets et développant une solide expérience dans un domaine qui me passionne.</p>',
            'who.desc.teacher':     '<p>Enseignement des bases du design UI à de jeunes designers.</p>',
            'who.desc.mentor':      '<p>Accompagnement de designers, quel que soit leur niveau de séniorité, dans leur développement et dans leurs retours sur leurs projets ou perspectives de carrière.</p>',
            'who.desc.speaker':     '<ul><li>Éco-design &amp; Design System 2023, 2024, 2025 (Intervenant)</li><li>Design System \'22-\'23 (Projet annuel) — 100% d\'étudiants diplômés</li><li>Méthodes de Recherche Utilisateur \'21-\'22 (Chargé de cours)</li></ul>',

            'who.mentoring.link':  'Se faire mentorer par Guillaume CAILLET sur ADPList →',
            'who.articles.text':   'J\'ai écrit quelques articles sur des sujets variés, tels que le <strong>design</strong>, les <strong>design systems</strong> et la <strong>recherche utilisateur</strong>.',
            'who.articles.link':   'Guillaume CAILLET sur Medium →',
            'who.podcast.simon':   'Interview avec Simon Robic sur le mobile-first →',
            'who.templates.link':  'Guillaume Caillet | Créateur de Templates Notion →',
            'who.cv.link':         'Télécharger le CV (PDF) →',
            'who.email':           'M\'écrire',
            'who.linkedin':        'Profil LinkedIn',

            // Projects
            'projects.title': 'Projets',

            // Case studies — shared
            'case.back':             '← Retour aux projets',
            'case.label':            'Étude de cas',
            'case.section.situation':'Situation',
            'case.section.tasks':    'Tâches & Actions',
            'case.section.results':  'Résultats',
            'case.section.next':     'Prochaines étapes',
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

            // Year labels
            'year.2026': '2026',
            'year.2025': '2025',
            'year.2024': '2024',

            // Design System
            'case.ds.title':    'PrestaShop Design System',
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
            'case.ca.title':    'PrestaShop Customer Account',
            'case.ca.subtitle': 'Unification et refonte du compte utilisateur PrestaShop, auparavant divisé en trois comptes distincts (Back Office, Marketplace, Business Care).',
            'case.ca.metric1.value': '3 → 1',
            'case.ca.metric1.label': 'comptes unifiés en un seul compte client',
            'case.ca.metric2.value': '0',
            'case.ca.metric2.label': 'demandes au support pour les mises à jour basiques',
            'case.ca.situation': '<p>Les utilisateurs PrestaShop peinaient à gérer leurs interactions en raison de trois comptes séparés : Back Office pour la gestion de la boutique, compte Marketplace pour les achats de modules, et compte utilisateur pour les factures d\'abonnement Business Care.</p><p>Ces systèmes fragmentés créaient de la confusion, de l\'incohérence et de l\'inefficacité. Des actions basiques comme la mise à jour d\'un email ou d\'un mot de passe nécessitaient de contacter le support technique, entraînant des délais inutiles.</p>',
            'case.ca.tasks':    '<ul class="case-list"><li>Pilotage de la recherche utilisateur exploratoire, du benchmarking concurrentiel et d\'ateliers de co-création pour identifier les points de friction et les besoins.</li><li>Supervision de la consolidation des bases de données utilisateurs disparates en une source unique de vérité.</li><li>Refonte de l\'UI pour distinguer clairement les informations personnelles et professionnelles.</li><li>Priorisation des fonctionnalités essentielles : autonomie pour les mises à jour, suppression de compte et gestion unifiée de la facturation.</li><li>Simplification de l\'onboarding en encourageant la création de compte Google pour réduire les frictions.</li></ul>',
            'case.ca.results':  '<ul class="case-list"><li>Pleine autonomie des utilisateurs sur leurs données, éliminant la dépendance au support pour les mises à jour.</li><li>Données synchronisées de manière cohérente sur tous les services PrestaShop.</li><li>Augmentation de la satisfaction utilisateur grâce aux retours positifs.</li><li>Processus simplifiés pour la facturation et la gestion des comptes.</li></ul>',

            // Sign in/up
            'case.si.title':    'Sign in / Sign up Flow',
            'case.si.subtitle': 'Refonte du flux de création de compte et de connexion pour le rendre fluide et simple dans tout le produit PrestaShop.',
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
            'case.sa.metric2.value': '↓',
            'case.sa.metric2.label': 'baisse marquée des abandons dus aux erreurs',
            'case.sa.situation': '<p>Le processus d\'association de boutique, notamment pour les installations open-source, était une source majeure de confusion. Les marchands ne comprenaient pas pourquoi l\'association était nécessaire et abandonnaient le processus — surtout lorsque des erreurs survenaient.</p><p>L\'association existe car la plupart des utilisateurs ont des boutiques Open Source installées localement sur leur hébergement, pas toujours identifiées comme appartenant au compte propriétaire. L\'association crée ce lien.</p>',
            'case.sa.tasks':    '<ul class="case-list"><li>Recherche pour identifier les principaux points de friction et déclencheurs d\'abandon.</li><li>Refonte du flux pour ne demander que les informations nécessaires, avec des guidances claires et une correction d\'erreurs.</li><li>Modélisation du nouveau processus sur l\'expérience SaaS "Edition", offrant une association fluide pour les propriétaires de boutiques reconnus.</li><li>Prototypage du nouveau flux (incluant une vidéo de démonstration) et validation des améliorations avec les parties prenantes.</li></ul>',
            'case.sa.results':  '<ul class="case-list"><li>Amélioration majeure de la compréhension utilisateur et réduction de la frustration.</li><li>La majeure partie du trafic boutique passe désormais par la plateforme de paiement et l\'onboarding mis à jour.</li><li>Expérience unifiée avec le modèle SaaS "Edition" pour la cohérence.</li></ul>',

            // Planning Opérateur
            'case.op.title':    'Oplit — Planning Opérateur',
            'case.op.subtitle': 'Conception du premier module orienté opérateurs dans une plateforme d\'ordonnancement industriel — de la research multi-clients à la décision stratégique de passer directement au planning opérateur.',
            'case.op.metric1.value': '9',
            'case.op.metric1.label': 'clients interviewés sur 5 secteurs',
            'case.op.metric2.value': '3 ans',
            'case.op.metric2.label': 'de recherche capitalisée sur cette feature',
            'case.op.metric3.value': '3',
            'case.op.metric3.label': 'clients pilotes lancés au déploiement',
            'case.op.situation': '<p>Les opérateurs — les personnes qui fabriquent réellement les pièces en atelier — étaient totalement absents de la plateforme. Les planificateurs géraient leurs plannings dans le vide, sans lien direct avec les opérateurs qui allaient les exécuter. Ce manque devenait un bloquant à l\'acquisition et la rétention sur les comptes stratégiques.</p>',
            'case.op.research':  '<p>J\'ai conduit des sessions de discovery structurées avec 9 clients dans différents secteurs : horlogerie de luxe, automobile, aéronautique, mécanique. Chaque session était cartographiée sur 8 blocs comparables, permettant de séparer les patterns récurrents des spécificités sectorielles.</p><p>J\'ai construit un framework de compétences en 10 dimensions (savoir, savoir-faire, comportemental), une matrice de polyvalence par profil opérateur, et un modèle de suivi des certifications réglementaires. La recherche a été synthétisée dans un document Notion via le framework Discovery Client.</p>',
            'case.op.decision':  '<p>Lors d\'un brainstorming transverse, deux chemins ont été débattus : une étape intermédiaire "régleur", ou aller directement au planning opérateur complet. L\'option régleur était ~3× plus complexe — pour un usage transitoire que les clients dépasseraient rapidement. J\'ai défendu et fait adopter le planning opérateur direct, en documentant 8 hypothèses (H1–H8) pour valider la décision.</p>',
            'case.op.output':    '<p>Spec FOCUSED complète dans Notion. Matrice de cas d\'usage FUC. Jalons clients déclencheurs. Design Figma couvrant l\'affectation nominative d\'OF, la gestion des absences, la visualisation de la polyvalence et le suivi des certifications.</p>',
            'case.op.results':   '<p>3 clients pilotes lancés au déploiement. L\'affectation nominative d\'OF a remplacé l\'ancienne valeur "non affecté". Réduction du temps de traitement des absences. Le module est devenu un argument d\'acquisition clé pour les comptes qui bloquaient sur ce manque.</p>',

            // Dépendances OF & Gantt
            'case.gantt.title':    'Oplit — Dépendances OF & Gantt',
            'case.gantt.subtitle': 'Conception du modèle de dépendances entre ordres de fabrication — résolution d\'une confusion sémantique persistante entre regroupement et dépendance fin-début, avec délais de transfert configurables.',
            'case.gantt.metric1.value': '2',
            'case.gantt.metric1.label': 'types de dépendances (regroupement vs. fin-début)',
            'case.gantt.metric2.value': 'buffer ≠ lead time',
            'case.gantt.metric2.label': 'distinction sémantique formalisée',
            'case.gantt.metric3.value': '0',
            'case.gantt.metric3.label': 'valeur de délai en dur — tout est configurable',
            'case.gantt.situation': '<p>Plusieurs clients en horlogerie, automobile et mécanique fine avaient besoin de modéliser des relations entre ordres de fabrication (OF). Un OF "Usinage" devait se terminer avant que "Traitement" puisse commencer — mais la nature exacte de cette relation variait : parfois sans délai (back-to-back), parfois avec un délai de transfert configurable.</p>',
            'case.gantt.problem':   '<p>Deux relations fondamentalement différentes étaient constamment confondues : le <strong>regroupement</strong> (opérations enchaînées sans délai, même bloc d\'ordonnancement) et la <strong>dépendance fin-début</strong> (un OF doit se terminer avant qu\'un autre puisse commencer, avec un délai de transfert configurable). Les traiter comme identiques causait un ordonnancement incorrect et des retards en cascade.</p><p>Deuxième confusion : buffer (temps ajouté pour la sécurité) vs. lead time (délai structurel lié à la gamme). Les deux sont des écarts de temps — mais l\'un est de la configuration, l\'autre de la spécification.</p>',
            'case.gantt.solution':  '<p>Deux modèles d\'interaction distincts : une <strong>vue en bandelettes</strong> avec connecteurs SVG (ligne pleine = regroupement, tirets = fin-début), colorés par famille père-fils, badges d\'alerte (bloquant/bloqué) sur les OF concernés, et annotations buffer (ex : "J+2") colorées selon le risque de retard. Une <strong>vue liste</strong> avec indentation arborescente, badges type et colonne Regroupement.</p>',
            'case.gantt.results':   '<p>Les planificateurs ont obtenu une vision systémique des chaînes de dépendance. Les retards en cascade sont devenus anticipables. Les clients en horlogerie — où les gammes multi-étapes sont la norme — ont adopté la feature immédiatement.</p>',

            // Opal DS Actions correctives (2026)
            'case.dsexec.title':    'Oplit — Opal DS · Actions correctives',
            'case.dsexec.subtitle': 'Exécution du plan de remédiation du design system : reconstruction de 44 composants, application de 2 634 token bindings, et mise en place d\'un workflow dev-alignment qui accélère la livraison des features de 20 à 30%.',
            'case.dsexec.metric1.value': '92 → 2 634',
            'case.dsexec.metric1.label': 'token bindings appliqués',
            'case.dsexec.metric2.value': '9% → 100%',
            'case.dsexec.metric2.label': 'taux de conformité des composants',
            'case.dsexec.metric3.value': '44',
            'case.dsexec.metric3.label': 'composants reconstruits · 0 valeur en dur restante',
            'case.dsexec.execution':   '<p>Avec les findings de l\'audit comme feuille de route, j\'ai exécuté en 5 phases ordonnées : les bases (palette couleur, espacement, typographie, icônes, vocabulaire), puis la reconstruction composant par composant. 3 librairies d\'icônes consolidées en 1. Chaque valeur hexadécimale remplacée par une référence token.</p>',
            'case.dsexec.automation':  '<p>L\'application des token bindings était la tâche à plus haut volume. Je l\'ai automatisée avec Claude Code + MCP Figma — 1 755 bindings appliqués en une seule session, 45 000+ nœuds analysés, 879 corrections automatiques. Ce qui aurait pris des semaines a pris des heures.</p>',
            'case.dsexec.alignment':   '<p>Workflow dev-alignment en 4 étapes : <strong>Figma</strong> (design terminé, tokens appliqués) → <strong>doc Notion</strong> (états, variantes, props) → <strong>Storybook/Chromatic</strong> (implémentation revue par le designer) → <strong>ticket Linear fermé</strong>. Au 22 avril 2026 : 11 composants en revue dev — FButton, FTextfield, OpalSwitch, FChip, FDialog, et 6 autres.</p>',
            'case.dsexec.results':     '<p>44 composants reconstruits. 0 valeur en dur restante. 3 → 1 librairie d\'icônes. Gain estimé de +20–30% par cycle de feature. Le design system est passé d\'un système implicite et non documenté à une infrastructure structurée, scalable et alignée avec le dev.</p>',

            // Plugin Figma
            'case.plugin.title':    'Plugin Figma — Local Components Collector',
            'case.plugin.subtitle': 'Un plugin JavaScript construit avec la Figma Plugin API pour automatiser l\'audit des composants locaux — réduisant le temps d\'audit DS de plusieurs jours à quelques heures.',
            'case.plugin.metric1.value': 'jours → heures',
            'case.plugin.metric1.label': 'réduction du temps d\'audit DS',
            'case.plugin.metric2.value': '0',
            'case.plugin.metric2.label': 'navigation manuelle fichier par fichier',
            'case.plugin.metric3.value': 'JS',
            'case.plugin.metric3.label': 'construit avec la Figma Plugin API',
            'case.plugin.problem':   '<p>Sans outil dédié, identifier les composants locaux non factorisés dans un fichier Figma est entièrement manuel : ouvrir chaque frame, inspecter chaque élément, noter les doublons. Aucune vue consolidée n\'existe nativement. Cela retarde directement les travaux de factorisation et fait croître silencieusement la dette design.</p>',
            'case.plugin.approach':  '<p>J\'ai identifié le besoin via une friction personnelle lors d\'un audit DS chez Oplit. Plutôt que d\'attendre une solution engineering, j\'ai construit l\'outil moi-même. J\'ai défini les critères d\'un "candidat à la factorisation" : fréquence d\'usage, présence de variantes, complexité visuelle et structurelle.</p>',
            'case.plugin.howworks': '<p>Le plugin est écrit en JavaScript avec la Figma Plugin API. Il crawle tous les nœuds du fichier courant, détecte les composants locaux (hors librairie partagée), et génère un rapport structuré : nom du composant, nombre d\'usages, frame parente, score de priorité. Le rapport s\'affiche directement dans le panel du plugin — sans export nécessaire.</p>',
            'case.plugin.impact':    '<p>Temps d\'audit DS réduit de plusieurs jours à quelques heures. Les candidats à la factorisation sont identifiés objectivement. Le plugin est la preuve qu\'un designer senior peut créer de la valeur outillage sans attendre la capacité engineering.</p>',

            // Opal DS Audit (2025)
            'case.dsaudit.title':    'Oplit — Opal DS · Audit',
            'case.dsaudit.subtitle': 'Audit systématique du design system Opal — findings gradués (CRITICAL / WARNING / INFO), quatre frameworks de référence, et plan de remédiation en 3 horizons.',
            'case.dsaudit.metric1.value': '3 niveaux',
            'case.dsaudit.metric1.label': 'sévérité CRITICAL / WARNING / INFO',
            'case.dsaudit.metric2.value': '3 horizons',
            'case.dsaudit.metric2.label': 'plan Immédiat / Prochain / Futur',
            'case.dsaudit.metric3.value': '4 frameworks',
            'case.dsaudit.metric3.label': 'Atomic Design · BEM · DTCG · WCAG 2.1 AA',
            'case.dsaudit.situation':    '<p>Design et code ne se parlaient pas. Le même bouton apparaissait en 5 variantes différentes selon la page. Aucune documentation partagée n\'existait. Les règles vivaient dans les têtes. Chaque nouveau développeur devait reconstruire le système par rétro-ingénierie à partir de la production.</p>',
            'case.dsaudit.methodology':  '<p>J\'ai construit un protocole d\'audit custom via le MCP Figma : lecture systématique de chaque composant dans la librairie, évalué contre 4 frameworks — Atomic Design (structure), BEM (nommage), DTCG (architecture de tokens), WCAG 2.1 AA (accessibilité). Chaque finding était gradué : CRITICAL (bloque l\'usage correct), WARNING (incohérence, risque de dette), INFO (opportunité d\'amélioration).</p>',
            'case.dsaudit.findings':     '<p><strong>Button — NON-COMPLIANT :</strong> valeurs hex dans les propriétés shadow, collision de la prop "Type" avec un mot-clé réservé, conflits de chemin de tokens. <strong>Foundations — NEEDS WORK :</strong> conventions de nommage forkées, 3 noms différents pour la même primitive d\'opacité. Rapport structuré par sévérité avec 3 horizons : Immédiat (blocages), Prochain (prochain sprint), Futur (backlog).</p>',
            'case.dsaudit.plan':         '<p>Plan de remédiation en 5 étapes : 1. Audit → 2. Bases (tokens couleur, espacement, typographie, icônes, vocabulaire) → 3. Composants (reconstruits un par un) → 4. Alignement dev (Storybook, workflow de revue) → 5. Déploiement. Critères d\'entrée/sortie explicites à chaque étape.</p>',

            // Verrouillage OF & Lead Time
            'case.lock.title':    'Oplit — Verrouillage OF & Lead Time',
            'case.lock.subtitle': 'Deux features couplées qui protègent les plans de production des modifications accidentelles et intègrent les délais de transfert structurels dans les calculs d\'ordonnancement.',
            'case.lock.metric1.value': '2 features',
            'case.lock.metric1.label': 'couplées — verrou + lead time',
            'case.lock.metric2.value': '0',
            'case.lock.metric2.label': 'modification accidentelle signalée depuis le déploiement',
            'case.lock.metric3.value': 'when X → then Y',
            'case.lock.metric3.label': 'méthode de spécification dans Linear',
            'case.lock.problem':     '<p>Un ordre de fabrication (OF) en production pouvait être modifié par n\'importe quel utilisateur à tout moment — y compris des OF déjà transmis en atelier. Cela entraînait des incohérences de production. Le lead time était aussi ignoré : les délais de transfert structurels entre opérations étaient omis ou en dur, rendant les calculs d\'ordonnancement peu fiables.</p>',
            'case.lock.conception':  '<p>J\'ai conçu un mécanisme de verrou avec 4 états (déverrouillé, verrouillé, partiellement verrouillé, hérité) et des règles d\'héritage explicites pour les OF dépendants. Le lead time est devenu une propriété configurable par poste de charge, avec propagation automatique à travers la gamme. Toutes les transitions d\'état ont été spécifiées au format "when X → then Y" dans Linear, avec des tableaux d\'habilitations par rôle.</p>',
            'case.lock.results':     '<p>Zéro modification accidentelle signalée depuis le déploiement. Le lead time est maintenant intégré dans tous les calculs d\'ordonnancement, améliorant la précision des projections de charge et de capacité. La feature est devenue un prérequis pour les clients avec des gammes multi-étapes.</p>',

            // Multi-sélection
            'case.multi.title':    'Oplit — Édition en masse & Multi-sélection',
            'case.multi.subtitle': 'Un pattern d\'interaction transversal déployé sur 4 vues — toolbar flottante contextuelle, matrice d\'états exhaustive, zéro action destructive sans confirmation.',
            'case.multi.metric1.value': '4 vues',
            'case.multi.metric1.label': 'Gantt, liste, kanban, tableau',
            'case.multi.metric2.value': '×6',
            'case.multi.metric2.label': 'réduction estimée du temps sur les traitements en masse',
            'case.multi.metric3.value': '0',
            'case.multi.metric3.label': 'action destructive sans confirmation',
            'case.multi.problem':    '<p>Modifier 50 ordres de fabrication un par un — changer une priorité, mettre à jour un poste de charge, replanifier un lot — était la pratique standard. Aucune action groupée n\'était disponible. Pour les planificateurs traitant des centaines d\'OF par jour, cette friction s\'accumulait à chaque session.</p>',
            'case.multi.approach':   '<p>J\'ai identifié la multi-sélection comme un pattern transversal, pas une feature spécifique à une vue. Il devait fonctionner de manière cohérente sur le Gantt, la liste, le kanban et le tableau de données. J\'ai conçu une toolbar flottante contextuelle : actions sûres (modifier, affecter, replanifier) et actions destructives (supprimer, annuler) séparées visuellement, avec confirmation requise pour ces dernières.</p>',
            'case.multi.matrix':     '<p>Matrice d\'états complète construite avant tout handoff dev : (aucun sélectionné / partiel / tout sélectionné) × (toutes les actions disponibles) × (OF verrouillés présents dans la sélection). Cela a évité que des états indéfinis n\'atteignent la production et a rendu la spécification Linear autosuffisante.</p>',
            'case.multi.results':    '<p>Déployé sur les 4 vues. Adoption immédiate des planificateurs. Réduction estimée ×6 du temps sur les opérations en masse. Le pattern a établi une convention d\'interaction réutilisable dans l\'ensemble du produit.</p>',

            // Sticky Bar
            'case.sticky.title':    'Oplit — Label Sticky sur le Gantt',
            'case.sticky.subtitle': 'Une correction ciblée pour une erreur UX critique identifiée via des retours terrain — un label de barre qui disparaît au scroll, confirmé comme source d\'erreurs de production en atelier.',
            'case.sticky.metric1.value': '1',
            'case.sticky.metric1.label': 'erreur UX critique corrigée',
            'case.sticky.metric2.value': '0',
            'case.sticky.metric2.label': 'erreur d\'ambiguïté de label signalée après déploiement',
            'case.sticky.metric3.value': 'sticky',
            'case.sticky.metric3.label': 'label visible quelle que soit la position de scroll',
            'case.sticky.problem':   '<p>Sur les Gantt longs (couvrant des semaines ou des mois), le scroll horizontal fait disparaître les labels des barres d\'OF hors du bord gauche de l\'écran. Les planificateurs et opérateurs perdent le contexte sur quel OF ils regardent. Ce n\'était pas théorique — des utilisateurs l\'ont signalé comme cause d\'erreurs de production réelles : affecter le mauvais OF au mauvais opérateur.</p>',
            'case.sticky.solution':  '<p>Un label sticky ancré au bord gauche de la zone visible, lisible quelle que soit la position de scroll. Le label sticky maintient une distinction visuelle claire avec la barre : il est positionné hors des bounds de la barre, utilise le même code couleur, et inclut le numéro de référence de l\'OF. Quand la barre sort complètement de l\'écran, le label sticky indique toujours sa position.</p>',
            'case.sticky.details':   '<p>Considérations clés : z-index pour éviter les collisions avec d\'autres barres. Comportement au clip quand la barre est plus étroite que le label. Règles de troncature à très petite taille de barre. Le pattern a ensuite été étendu à tous les types de barres dans le Gantt.</p>',
            'case.sticky.impact':    '<p>Zéro erreur d\'ambiguïté de label signalée depuis le déploiement. Déployé en patch prioritaire après confirmation d\'un problème de sécurité critique pour la production. Étendu à tous les types de barres dans le Gantt.</p>',
        }
    };

    let currentLang = localStorage.getItem('folio-lang') || 'en';

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
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    // Initialise language on load
    setLang(currentLang);

    // Lang button click handlers
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });

})();
