# Guillaume Caillet — Portfolio

Personal portfolio of Guillaume Caillet, Senior Product Designer based in Nantes, with 7+ years designing B2B SaaS products and design systems for Industry 4.0.

**Live:** [guillaumecaillet.fr](https://www.guillaumecaillet.fr)

---

## Stack

Vanilla HTML, CSS, and JavaScript — no framework, no build step, no runtime dependencies. Everything, including fonts and the shader library, is self-hosted: the site makes no third-party requests.

## Features

- **Bilingual, path-based routing.** French is the default and lives at the root (`/who/`, `/projects/<slug>/`); English is the same tree under `/en/`. Titles, meta descriptions, `canonical` and `hreflang` are all kept in sync per route.
- **SPA** with crossfade page transitions. Every route is a real URL, served by an `.htaccess` catch-all; legacy `/fr/…` URLs 301 to their unprefixed equivalent.
- **Light / dark theme** that defaults to the visitor's local time of day (light 07h–19h, dark otherwise) and re-checks while the tab stays open. An explicit toggle is stored and always wins.
- **Pixel-dot design language**, built from a few small pieces:
  - a **dot-matrix boot loader** ([dotmatrix-loader](https://github.com/guillaumecaillet/dotmatrix-loader)) shown for 2.5s before the content reveals;
  - an ambient **WebGL dithering background** (vanilla build of [Paper Shaders](https://github.com/paper-design/shaders)), one draw call, auto-paused when off-screen;
  - **CTA buttons** with stepped `clip-path` corners and a grid that re-rolls random accent pixels on hover;
  - **case-study images** whose corners disintegrate into chunky blocks sampled from the image's own pixels, via a single overlay canvas;
  - a **process stream** canvas running Discovery → Ship, scattered on the left, gathered into a fine line from Design onward.
- **Typography**: Pixelify Sans for display, Space Grotesk for text, IBM Plex Mono for labels — all self-hosted, latin + latin-ext subsets only.
- **SEO**: `sitemap.xml` with `hreflang` alternates, `robots.txt`, `llms.txt`, JSON-LD `ProfilePage`, apex → `www` and HTTPS redirects.
- Respects `prefers-reduced-motion` throughout; every canvas effect degrades to a static frame or is skipped.

## Structure

```
portfolio/
├── index.html      # Single HTML file — all pages as fixed-position sections
├── style.css       # Layout, theming, animations
├── main.js         # Routing, i18n, theme, reveals, filters
├── .htaccess       # Redirects + SPA fallback (OVH / Apache)
├── sitemap.xml     robots.txt     llms.txt
└── src/
    ├── fonts/      # Self-hosted woff2 + @font-face
    ├── img/        # Case-study images, CV PDF
    └── js/
        ├── dotmatrix-loader.js   # Boot loader
        ├── shader-bg.js          # Ambient dithering background
        ├── paper-shaders/        # Vendored vanilla build
        ├── pixel-hover.js        # CTA flicker + image crumble
        └── process-stream.js     # Discovery → Ship stream
```

## Running locally

No build required:

```bash
npx serve -l 4242 .
# → http://localhost:4242
```

Note that a plain static server does not apply `.htaccess`, so deep links such as `/projects/opal-ds-audit/` return 404 locally. Navigating from the homepage works, since routing is client-side.

## Deployment

Pushing to `master` deploys to production over FTP via GitHub Actions (`.github/workflows/deploy.yml`); `dev` deploys to the staging directory.

## Pages

| Route | Content |
|---|---|
| `/` | Intro, process, project list |
| `/who/` | Bio, experience timeline, links |
| `/projects/opal-ds-ai-prototyping-skills/` | Opal DS · AI Prototyping Skills — Oplit |
| `/projects/opal-ds-corrective-actions/` | Opal DS · Corrective Actions — Oplit |
| `/projects/multiselect-sticky-action-bar/` | Multi-select & Sticky Action Bar — Oplit |
| `/projects/figma-plugin-local-components-collector/` | Figma Plugin, Local Components Collector |
| `/projects/opal-ds-audit/` | Opal DS · Audit — Oplit |
| `/projects/capacity-transfer/` | Capacity Transfer Between Sectors — Oplit *(noindex)* |
| `/projects/prestashop-expert-experience/` | Expert Experience — PrestaShop *(noindex)* |
| `/projects/prestashop-design-system/` | PrestaShop Design System |
| `/projects/prestashop-customer-account/` | PrestaShop Customer Account |
| `/projects/prestashop-signin-signup/` | Sign in / Sign up Flow — PrestaShop |
| `/projects/prestashop-store-association/` | Store Association Flow — PrestaShop |

Each route has an English equivalent under `/en/`.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `1` | Go to Landing |
| `2` | Go to Who am I |
| `3` | Go to Projects |
| `Esc` | Back to Projects (from a case study) |
