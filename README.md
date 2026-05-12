# Guillaume Caillet — Portfolio

Personal portfolio of Guillaume Caillet, Senior Product Designer with 7+ years of experience across industrial, agency, and SaaS environments.

**Live:** [guillaumecaillet.fr](https://guillaumecaillet.fr)

---

## Stack

Vanilla HTML, CSS, and JavaScript — no framework, no build step, no dependencies.

- **SPA** with crossfade page transitions and hash-based routing
- **ASCII galaxy** renderer — logarithmic spiral arms, real-time animation, dual-instance (light foreground on landing / dark background on inner pages)
- **Split-flap scramble** effect on all interactive text elements
- **Spring-follower cursor** with ASCII character trail
- **Collapsible** experience entries with smooth max-height transitions
- **FR / EN** language switch — full content i18n, persisted in localStorage
- **Star button** — GitHub-style bookmark CTA with shortcut hint

## Structure

```
portfolio/
├── index.html      # Single HTML file — all pages as fixed-position sections
├── style.css       # All layout, animations, and theming
├── main.js         # Galaxy renderer, navigation, i18n, all interactions
└── src/
    └── img/        # Case study images and CV PDF
```

## Running locally

No build required — open directly in a browser or serve with any static server:

```bash
npx serve .
# → http://localhost:3000
```

## Pages

| Route | Content |
|---|---|
| `#landing` | Intro, ASCII galaxy background |
| `#who` | Bio, experience timeline, links |
| `#projects` | Year-grouped project list with company tags |
| `#project-ds-execution` | Opal Design System · Actions correctives — case study |
| `#project-multiselect` | Multi-select & Sticky Action Bar — case study |
| `#project-figma-plugin` | Plugin Figma — case study |
| `#project-ds-audit` | Opal Design System · Audit — case study |
| `#project-transfer` | Capacity Transfer Between Sectors — case study |
| `#project-design-system` | PrestaShop Design System — case study |
| `#project-customer-account` | PrestaShop Customer Account — case study |
| `#project-signin` | Sign in / Sign up Flow — case study |
| `#project-store-association` | Store Association Flow — case study |

## Keyboard shortcuts

| Key | Action |
|---|---|
| `1` | Go to Landing |
| `2` | Go to Who am I |
| `3` | Go to Projects |
| `Esc` | Back to Projects (from a case study) |
