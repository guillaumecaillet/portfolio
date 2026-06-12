# Revue UX Copy — Portfolio Guillaume Caillet

> Revue complète des textes du portfolio (`index.html` + `main.js` EN/FR).
> Objectif : faire passer le portfolio d'un site bien écrit à un outil de conversion clair pour recruteurs, hiring managers produit et pairs designers.

**Score global : 7/10.** Le contenu de fond est solide (positionnement Senior PD, métriques chiffrées, cas concrets). Les marges de progrès sont sur la **clarté pour audience non-design ops**, la **cohérence inter-cas**, et la **microcopy de conversion** (CTA, états, footer, méta-données).

---

## Résumé exécutif — top 10 actions

| # | Action | Impact | Effort | Priorité |
|---|---|---|---|---|
| 1 | Réécrire les CTA landing/who pour cohérence verbe + intention | Conversion | XS | **P0** |
| 2 | Standardiser les sections d'études de cas sur 1 grille | Lisibilité | S | **P0** |
| 3 | Glossariser ou désargotiser le jargon (FOCUSED, FUC, DTCG, MCP, PDC, OF) | Accessibilité | S | **P0** |
| 4 | Réécrire les sous-titres de cas qui dépassent 25 mots | Scannabilité | XS | **P0** |
| 5 | Ajouter des `<title>` uniques par étude de cas (SEO + onglets) | SEO/UX | XS | **P0** |
| 6 | Repenser le bouton « Star » (intent flou pour audience non-tech) | Clarté | S | **P1** |
| 7 | Resserrer l'intro « Who am I » p1 (storytelling enfance) | Densité | XS | **P1** |
| 8 | Normaliser les valeurs de métriques (« ↓ », « real persona », « cards + Gantt » → reformuler) | Crédibilité | XS | **P1** |
| 9 | Ajouter footer + état hors-ligne + indicateur « (+) » accessible | Robustesse | M | **P2** |
| 10 | Ajouter meta `og:image`, mots-clés SEO, fil d'Ariane | Distribution | S | **P2** |

---

## 1. Navigation & micro-interactions

### 1.1 Bouton « Star » — intention floue

**Constat.** Le bouton `Star` (icône étoile + compteur `0`) emprunte sa sémantique à GitHub. Pour un recruteur produit ou un hiring manager non-tech, le geste est ambigu : ajouter aux favoris ? Liker ? Suivre ?
Le compteur affichant `0` par défaut est aussi un signal négatif (zero proof social).

**Avant**
- Aria-label : `Star this portfolio`
- Visible : `Star · 0`

**Après — option A (recommandée, registre produit)**
- Aria-label : `Save this portfolio to favorites`
- Visible : `★ Save` (sans compteur tant que < 5)
- Tooltip onhover : `Save this portfolio — comes back next time you visit`

**Après — option B (registre tech assumé)**
- Visible : `★ Star · 12` (afficher le compteur seulement si ≥ 1)
- Tooltip : `12 people starred this portfolio`

**Rationale.** « Save » est universel. Masquer le compteur tant qu'il n'apporte pas de proof social évite l'effet « bouton vide ».

### 1.2 Liens nav

**Avant** — `Who am I` / `Projects`
**Après** — `About` / `Projects` (EN) — `À propos` / `Projets` (FR)

**Rationale.** « Who am I » est une question — adaptée pour le H1 de la page, mais en navigation, un nom est plus scannable. Garde la question pour le titre de section.

### 1.3 Switch de langue

**Avant** — `EN · FR` (boutons sans état actif visible explicitement dans le markup)

**Après**
- Ajouter `aria-current="true"` sur la langue active
- Tooltip discret : `Switch to French` / `Passer en anglais`

---

## 2. Page d'accueil (Landing)

### 2.1 Titre principal

**Avant (EN)**
> Senior Product Designer
> currently working at **Oplit**

**Avant (FR)**
> Senior Product Designer
> actuellement chez **Oplit**

**Après — recommandé**

EN :
> Senior Product Designer
> shipping design systems and SaaS products at **Oplit**

FR :
> Senior Product Designer
> je conçois des design systems et des produits SaaS chez **Oplit**

**Rationale.** « Currently working at » est passif et faible. Une phrase d'action raconte ce que tu fais, pas juste où tu travailles. L'en-tête doit en 5 secondes communiquer **ton métier + ce que tu apportes**.

### 2.2 Sous-titre

**Avant**
> Guillaume Caillet — 7+ years of experience — Based in France

**Après — option A (factuel, recommandé)**
> Guillaume Caillet · 7+ years building B2B SaaS products · France

**Après — option B (orienté valeur)**
> Guillaume Caillet · 7 ans à designer des produits B2B utiles, cohérents et qui scalent · France

**Rationale.** Les tirets em font fonction de séparateurs : `·` (middle dot) est plus discret et casse moins le rythme. Préciser **B2B SaaS** signale immédiatement le segment.

### 2.3 CTA landing

**Avant** — `Email me` / `LinkedIn Profile`

**Problème.** Mélange verbe (Email me) + nom (LinkedIn Profile). Inconsistance UX.

**Après — recommandé**
| Option | EN | FR | Commentaire |
|---|---|---|---|
| A (verbe + verbe) | `Email me` / `Connect on LinkedIn` | `M'écrire` / `Me suivre sur LinkedIn` | **Le plus direct** |
| B (intention) | `Get in touch` / `View LinkedIn` | `Me contacter` / `Voir LinkedIn` | Plus formel |
| C | `Start a conversation` / `Open LinkedIn` | `Démarrer une conversation` / `Ouvrir LinkedIn` | Trop romanesque, à éviter |

**Recommandation : option A.** Symétrie verbale, énergie d'action, pragmatique.

---

## 3. Page « Who am I »

### 3.1 Titre

**Avant** — `Who am I?` / `Qui suis-je ?`

**Garder** — la question fonctionne en H1, c'est cohérent avec le ton « personnel ». Aucun changement.

### 3.2 Intro paragraphe 1 (anecdote enfance)

**Constat.** L'anecdote Photoshop 7 / FPS / branding est charmante mais **longue (4 lignes)** et concurrente avec les paragraphes 2 et 3 qui portent ton vrai positionnement Senior. À 6 ans = signal hobbyiste, alors que tu vises des rôles de leverage organisationnel.

**Avant (EN, ~85 mots)**
> My relationship with design started before any formal training. As a kid, I played FPS games on the family computer, but what fascinated me wasn't the game — it was the branding of pro teams. At 6, I was creating logos for my teammates in Photoshop 7. What took root back then never left me: a curiosity for visual systems, and the drive to build tools as much as to use them.

**Après — option A (resserré, 50 mots)**
> Design started for me before any formal training. At 6, I was making logos in Photoshop 7 for my online gaming teammates — fascinated less by the game than by the branding of pro teams. That early instinct stayed: curiosity for visual systems, and the urge to build tools as much as to use them.

**Après — option B (couper l'anecdote, ouvrir directement sur la posture)**
> I came to design through visual systems before any formal training — building logos and branding kits as a kid for fun. What took root then never left: a curiosity for systems, and the drive to build tools as much as to use them.

**Recommandation : option A** si tu tiens à l'anecdote (elle humanise), **option B** si tu veux entrer plus vite dans le vif. Les deux sont mieux que la version actuelle.

### 3.3 Intro paragraphe 2 — jargon

**Constat.** « decision infrastructure », « leverage », « structural element of the organization » — vocabulaire de leadership produit, **mais utilisé en cumul**. Risque : sonne marketing.

**Avant**
> This kind of leverage — turning a design tool into decision infrastructure — is what defines my practice.

**Après**
> Turning a design tool into shared decision-making infrastructure — that's the kind of leverage I look for in my work.

**Rationale.** Plus humain (« I look for »), même contenu, moins « manifeste ».

### 3.4 Intro paragraphe 3 — clarifier l'ambition

**Avant (EN)**
> I'm naturally moving toward roles where I own the product — where design vision and product strategy are one and the same.

**Après**
> I'm moving toward roles where design owns part of the product strategy — not as service, but as a co-author of where the product goes next.

**Rationale.** « own the product » peut sonner comme « je veux être Head of Product ». Préciser « co-author of strategy » est plus crédible et plus juste.

### 3.5 Section dates — état actuel

**Avant** — `Sept. 2025 — Now` / `Sept. 2025 — Aujourd'hui`

**Après** — `Sept. 2025 — Present` (EN, plus formel pour CV) / `Depuis sept. 2025` (FR, plus naturel)

### 3.6 Toggle « + »

**Constat.** Le `+` indique « cliquer pour développer », mais sans `aria-expanded` ni `aria-controls`. Pour un lecteur d'écran, le bouton n'a aucune sémantique.

**Recommandation HTML/copy**
```html
<button class="experience-toggle"
        aria-expanded="false"
        aria-controls="exp-oplit-desc"
        aria-label="Show details for Senior Product Designer at Oplit">
  +
</button>
```

Et au survol, tooltip discret : `Voir les détails` / `View details`.

### 3.7 Mentoring — capitalisation

**Avant** — `Get mentored by Guillaume CAILLET on ADPList →`

**Après** — `Book a mentoring session with Guillaume Caillet on ADPList →` / `Réserver une session de mentorat avec Guillaume Caillet sur ADPList →`

**Rationale.** Tout-capital sur le nom = visuellement crié. « Get mentored » est vague — `Book a session` est l'action concrète.

### 3.8 Articles

**Avant** — `I have written a few articles on various subjects, such as design, design systems, and user research.`

**Après** — `I write about design, design systems, and user research — pragmatic notes from the field.` / `J'écris sur le design, les design systems et la recherche utilisateur — des notes de terrain pragmatiques.`

**Rationale.** « a few » sous-vend. « pragmatic notes from the field » porte ta posture (pragmatisme + terrain) que tu revendiques par ailleurs.

### 3.9 CV

**Avant** — `Download CV (PDF) →`

**Après** — `Download CV — PDF, updated May 2026 →` / `Télécharger le CV — PDF, mis à jour mai 2026 →`

**Rationale.** Date de mise à jour = signal de fraîcheur, important pour un recruteur. Ajouter le poids si > 2 Mo.

---

## 4. Liste des projets

### 4.1 Tags par projet — incohérence FR/EN

**Constat.** Le tag `Prototypage` apparaît dans la version EN du HTML statique (`<span class="case-tag">Prototypage</span>`), alors que la version FR est correcte. Vérifier que tous les `case-tag` sont aussi traduits via `data-i18n` (pour l'instant ils sont en dur dans le HTML).

**Recommandation.**
- EN : `Prototyping` (et non `Prototypage`)
- Ajouter `data-i18n` aux tags pour bascule FR/EN propre.

### 4.2 Catégories de projets — terminologie

**Avant (echantillon)**
- `Design System, Design Ops, Automation`
- `Industrial SaaS, Interaction Design, Pattern Design, Component Design`
- `Tooling, Design Ops, JavaScript, Figma Plugin API`
- `Product Design, Product Strategy, Sales Enablement, Documentation`

**Constat.** Mélange de niveaux d'abstraction (discipline + livrable + outil). « JavaScript » et « Figma Plugin API » sont des outils, pas des disciplines.

**Après — proposition de grille unifiée à 3 axes**
```
[Discipline] · [Méthode] · [Livrable]
```

| Avant | Après |
|---|---|
| Design System, Design Ops, Automation | Design System · Automation · Tooling |
| Industrial SaaS, Interaction Design, Pattern Design, Component Design | Interaction Design · Pattern Design · Industrial SaaS |
| Tooling, Design Ops, JavaScript, Figma Plugin API | Design Ops · Tooling · Figma Plugin |
| Product Design, Product Strategy, Sales Enablement, Documentation | Product Design · Strategy · Sales Enablement |

**Règles.**
- 3 tags max (au-delà, ça devient illisible).
- Pas de mention de techno (`JavaScript`, `Figma Plugin API`) en tag — ça va dans le corps de l'étude.
- Les tags sont des disciplines, pas des outils.

### 4.3 Liste « Other projects »

**Constat.** Apparition brute, sans pourquoi. Pas d'introduction.

**Avant** — direct vers `<ul>` avec 5 projets non détaillés.

**Après — ajouter une intro courte**
> EN : `Earlier projects — concept work, prototypes, and student projects I still find interesting.`
> FR : `Projets antérieurs — concepts, prototypes et travaux étudiants que je trouve toujours pertinents.`

**Rationale.** Sinon on ne sait pas si c'est « les autres choses dont je suis fier » ou « les choses moins importantes ».

### 4.4 Numérotation des projets

**Constat.** L'index 07 apparaît deux fois (`project-customer-account` et `project-signin`). Bug copy/numérotation.

**Action.** Renumérote 01–10 sur l'ensemble (ou par année si tu veux marquer les groupes).

### 4.5 Flèche de carte projet

**Avant** — `→` seul.

**Après** — Texte caché pour SR : `<span class="sr-only">View case study</span> →`

---

## 5. Études de cas — cohérence transverse

### 5.1 Sections — forte hétérogénéité

**Constat.** 8 études, 5 grilles différentes :
| Étude | Sections |
|---|---|
| PrestaShop DS | Situation · Tasks & Actions · Results · Next Steps |
| PrestaShop CA | Situation · Tasks & Actions · Results |
| PrestaShop Sign-in | Situation · Tasks & Actions · Results |
| PrestaShop Store Asso | Situation · Tasks & Actions · Results |
| Opal DS · Exec | Execution · Automation · Dev Alignment · Results |
| Opal DS · Audit | Situation · Methodology · Findings · Plan |
| Plugin Figma | Problem · Approach · How it works · Impact |
| Capacity Transfer | Context · Problem · Approach · Impact |
| Multi-select | Problem · Multi-select pattern · Sticky action bar · Implementation Details · Impact |

**Recommandation — grille unifiée à 5 sections (recommandée)**
```
1. Context     — situation, contraintes, audience
2. Problem     — ce qui ne marchait pas, pour qui, à quel coût
3. Approach    — décisions clés, méthode, alternatives écartées
4. Outcome     — résultats chiffrés, impact qualitatif
5. Reflection  — apprentissages, prochaines étapes (optionnel)
```

**Bénéfice.** Le visiteur sait où chercher quoi. Les cas se comparent. Tu peux les scanner en 30 s chacun.

**Migration suggérée.**
- `Situation` → `Context`
- `Tasks & Actions` → `Approach`
- `Results` → `Outcome`
- `Methodology` → fusionner dans `Approach`
- `Findings` → fusionner dans `Outcome` (ce sont les conclusions de l'audit)
- `Execution` / `How it works` / `Multi-select pattern` → variantes de `Approach`
- Les blocs spécifiques techniques (token diff, workflow diagram) restent en place — ils enrichissent `Approach`.

### 5.2 Sous-titres trop denses

**Exemple le plus extrême — Capacity Transfer**

**Avant**
> Designing a capacity-transfer feature that lets schedulers reallocate production from one workshop to another to absorb overloads. Major customer-side impact — significant reduction in information processing time and a clear, precise visualization where there was none before — paired with F.O.C.U.S.E.D documentation and a real-persona-driven demo script.

**Problème.** 47 mots, 3 idées différentes, jargon (« F.O.C.U.S.E.D », « persona-driven demo script »).

**Après — recommandé (deux phrases, 22 mots)**
> A capacity-transfer feature that lets schedulers reallocate production across workshops in seconds — backed by structured docs and a demo grounded in a real customer.

**Règle générale.** Sous-titre = 1 phrase, ≤ 25 mots. Une seule idée principale + un appui concret.

### 5.3 Métriques — formats hétérogènes

**Constats par métrique problématique**

| Métrique actuelle | Problème | Reformulation |
|---|---|---|
| `↓` | Pas de chiffre, illisible isolé | Remplacer par `~–40%` ou `Significant ↓` avec valeur estimée |
| `Stock module` | Pas une métrique, c'est un emplacement | `Stock module` → label `Where it shipped` ; ou retirer |
| `F.O.C.U.S.E.D` | Acronyme cryptique | `7-step spec` (label : `FOCUSED docs framework — 7 steps`) |
| `real persona` | Adjectif, pas une mesure | `1 customer · 9+ interviews` ou `Persona grounded in 9+ customer interviews` |
| `cards + Gantt` | C'est une scope, pas une métrique | `2 views` (label : `consistent across cards & Gantt`) |
| `4 quick actions` | OK mais label mélange `·` et `,` | Garder, normaliser séparateurs |
| `2 variants` | OK | OK |
| `3 levels` / `3 horizons` / `4 frameworks` | OK formellement | Garder |
| `92 → 2 634` | Excellente | Garder |
| `9% → 100%` | Excellente | Garder |
| `100%`, `80%`, `-50%` | Bons | Garder |
| `3 → 1` | Bonne | Garder |
| `0` (support requests) | Très bonne | Garder |
| `days → hours` | Bonne mais imprécise | `~3 days → 2 hours` si tu as la donnée |
| `JS` | Pas une métrique, c'est un fait | Retirer la 3e métrique du Plugin Figma — 2 métriques fortes valent mieux que 3 dont une faible |

**Règle générale métriques.**
- Format `X → Y` ou `±N%` ou `N items` privilégié.
- Jamais d'acronyme seul comme valeur.
- Jamais de symbole isolé (`↓`, `★`).
- Si tu n'as pas le chiffre, **retire la case-metric** plutôt que de mettre un placeholder.

### 5.4 Jargon récurrent — créer un glossaire ou désargoter

**Termes problématiques pour audience non-design ops**
| Terme | Problème | Action |
|---|---|---|
| F.O.C.U.S.E.D | Acronyme non standard | Soit développer (`Framework, Outcome, Context, User, Scope, Edge cases, Done`), soit appeler `7-step spec framework` |
| FUC | Acronyme métier Oplit | Développer en première occurrence |
| DTCG | Design Tokens Community Group | Spell out la 1re fois |
| MCP Figma | Model Context Protocol | Spell out + 1 ligne d'explication |
| PDC | Poste de charge | Traduire dans la version EN |
| OF | Ordre de fabrication / Work order | Traduire dans la version EN |
| Suivi d'avancement | Reste en français en EN | `Progress tracking (Suivi d'avancement)` |
| Storybook/Chromatic | OK pour audience tech, opaque sinon | OK à conserver |

**Règle.** En première occurrence dans une étude, un acronyme ou un terme jargon doit être suivi d'une glose courte entre parenthèses ou en italique.

### 5.5 Titres de cas — répétition du nom de la société

**Avant**
- `case-meta` : `Case Study · Oplit · Opal DS`
- `case-title` : `Oplit — Opal DS · Corrective Actions`

**Après**
- `case-meta` : `Case Study · Oplit · Opal DS`
- `case-title` : `Corrective Actions` (la société est déjà au-dessus)

**Rationale.** Pas besoin de répéter `Oplit — Opal DS` dans le H2 — la `case-meta` au-dessus le porte déjà.

### 5.6 « Back to projects » — link

**Avant** — `← Back to projects` / `← Retour aux projets`

**OK**, mais ajouter un `aria-label` plus descriptif :
```html
<a class="case-back" aria-label="Back to all projects list">← Back to projects</a>
```

---

## 6. Cas par cas — quick wins

### 6.1 PrestaShop Customer Account

**Subtitle**
> Avant : `Unification and redesign of the PrestaShop user account, previously split into three separate accounts (Back Office, Marketplace, Business Care).`
> Après : `Unifying three fragmented PrestaShop accounts (Back Office, Marketplace, Business Care) into one — so users finally stop calling support to update an email.`

**Rationale.** Le « ça finit par » donne instantanément l'impact business sans avoir à cliquer.

### 6.2 PrestaShop Sign-in / Sign-up

**Subtitle**
> Avant : `Redesign of the account creation and connection flow to make it fluid and simple throughout the PrestaShop product.`
> Après : `Cutting authentication errors in half by redesigning sign-in across the entire PrestaShop ecosystem (back office, marketplace, help center).`

**Rationale.** Mention l'impact dans le sous-titre. Le « -50% errors » est ton meilleur atout — fais-en la promesse, pas une découverte tardive.

### 6.3 Plugin Figma — métrique faible

Retirer la 3e case-metric `JS — built with Figma Plugin API` (c'est un fait, pas une métrique). Garder `days → hours` et `0 manual nav`.

Mieux : remplacer par `1 dev = 1 designer — built without engineering bandwidth` (label : `proof a designer can ship tooling alone`).

### 6.4 Multi-select & Sticky Action Bar

**Subtitle EN**
> Avant : `A coupled pattern — multi-select as the trigger, the sticky action bar as the action surface.`
> Après : `One coupled pattern — multi-select triggers a sticky action bar — so schedulers can update 50 work orders in one click instead of fifty.`

**Rationale.** Le « 50 → 1 » est ton vrai discours utilisateur. Le rendre concret dès le sous-titre rend l'enjeu clair sans avoir à lire 600 mots.

### 6.5 Capacity Transfer

**Section labels**
- `Context` ✓
- `Problem` ✓
- `Approach` ✓
- `Impact` ✓

**Mais** : ajouter une 5e section `Reflection / Learnings` — ton paragraphe de fin (`Apprentissage : un designer qui comprend les enjeux go-to-market...`) mérite sa section dédiée. C'est ton signal le plus fort de senior posture.

### 6.6 Opal DS Audit

**Subtitle**
> Avant : `Systematic audit of the Opal design system — graded findings (CRITICAL / WARNING / INFO), four reference frameworks, and a 3-horizon remediation plan.`
> Après : `A systematic Opal DS audit — graded findings against four industry frameworks, with a phased remediation plan I executed over the following months.`

**Rationale.** « phased remediation plan I executed » crée le lien naturel vers l'étude `Corrective Actions` qui suit. Liens narratifs entre cas = signal de cohérence.

### 6.7 Opal DS · Corrective Actions

**Section `Execution` — diff token**
Ajouter un caption sous le diff :
> `Each component refactor: hardcoded values → semantic tokens. Multiplied across 44 components.`

**Section `Automation`**
Ajouter une note d'éthique pro :
> `Automation didn't replace review — every binding was checked. Speed without governance is just faster regression.`

**Rationale.** Démontre une posture de senior qui ne fait pas du « speed run » irresponsable.

---

## 7. SEO, méta, et distribution

### 7.1 `<title>` unique par page

**Avant** — toutes les pages partagent `Guillaume Caillet — Sr. Product Designer`.

**Après — JS dynamique au `pushState`**
```js
const PAGE_TITLES = {
  'landing': 'Guillaume Caillet — Sr. Product Designer',
  'who': 'About — Guillaume Caillet, Sr. Product Designer',
  'projects': 'Projects — Guillaume Caillet',
  'project-ds-execution': 'Opal DS · Corrective Actions — Case Study',
  // ...
};
```

**Bénéfice.** Onglets nommés, partage de lien lisible, SEO.

### 7.2 Meta description par cas

Ajouter `<meta name="description">` qui change selon la page (via JS). Aujourd'hui, seule la home a une description.

### 7.3 OG image

Pas d'`og:image` détectée. Ajouter au moins une image sociale par défaut (`/src/img/og-default.png`, 1200×630). Idéal : une par cas.

### 7.4 Mots-clés métier

Ajouter dans la meta description home : `B2B SaaS · Industry 4.0 · Design Systems`.

---

## 8. États manquants & robustesse

### 8.1 État « page not found »

Si le hash ne matche aucune `section`, le visiteur reste sur la dernière vue. **Risque** : un lien partagé `#project-xxxxx` cassé donne un cul-de-sac silencieux.

**Microcopy proposée — empty state pour ancres invalides**
> EN : `This page doesn't exist (anymore). Browse my latest case studies →`
> FR : `Cette page n'existe pas (ou plus). Voir mes dernières études de cas →`

### 8.2 Loading state

Le `body.loading` n'a pas de copy associée. Si la sphère ASCII met du temps à charger sur connexion lente, l'utilisateur voit un écran noir.

**Optionnel** : ajouter un `<noscript>` minimal :
> `This portfolio uses JavaScript for transitions. You can still see all the content below.`

### 8.3 Confirmation Star button

Quand on clique « Star », que se passe-t-il ? Le compteur s'incrémente — mais pas de tooltip de feedback.

**Microcopy proposée** (toast 2s)
> EN : `Saved! Thanks for the star.`
> FR : `Sauvegardé ! Merci pour l'étoile.`

---

## 9. Ton & voix — analyse globale

### 9.1 Constat

Tu es **professionnel, précis, parfois trop dense**. Le ton est :
- ✅ honnête (pas de bullshit corporate)
- ✅ chiffré (métriques solides partout)
- ✅ orienté impact (pas juste « j'ai dessiné »)
- ⚠️ parfois trop conceptuel (« decision infrastructure », « turning a design tool into »)
- ⚠️ jargon design ops dense par endroits
- ⚠️ peu de respiration (paragraphes longs sans listes, sans pauses)

### 9.2 Voice principles à formaliser

Je te propose un mini guide voix/ton à appliquer partout :

```
1. Direct.    Une idée par phrase. Sujet + verbe + complément. Pas de subordonnées en chaîne.
2. Chiffré.   Si je peux mettre un nombre, je le fais. Sinon, je dis pourquoi je ne peux pas.
3. Honnête.   Je ne survends pas. « Estimated » et « ongoing » sont des mots que j'utilise.
4. Pragmatique. Je dis ce qui a marché, ce qui a échoué, et ce que j'ai appris.
5. Tourné vers l'avenir. Chaque cas se termine par ce que ça permet ensuite.
```

À ajouter en commentaire dans `main.js` ou en tête du fichier `README.md`.

---

## 10. Localisation FR ↔ EN — parité

### 10.1 Items non traduits ou inconsistants

| Élément | EN | FR | Action |
|---|---|---|---|
| Tag « Prototypage » | `Prototypage` (devrait être `Prototyping`) | `Prototypage` | Corriger EN |
| `Suivi d'avancement` | reste en FR dans la version EN | OK | Glose EN |
| Ecole de design Nantes | OK | OK | — |
| Articles count | « a few » (vague) | « quelques » (vague) | Reformuler les deux |
| Star button | `Star` | `Star` (pas traduit) | `Save` / `Sauver` |
| Section `Findings` | `Findings` | `Findings` (resté en EN) | `Conclusions` ou `Constats` |
| Section `case.section.research` | `Research & Synthesis` | `Recherche & Synthèse` | OK |

### 10.2 Détection automatique de langue

Aujourd'hui, langue = `localStorage.getItem('folio-lang') || 'en'`. Si l'utilisateur arrive depuis un référent FR (LinkedIn FR, recruteur FR), il aura EN par défaut.

**Recommandation**
```js
const browserLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
let currentLang = localStorage.getItem('folio-lang') || browserLang;
```

---

## 11. Accessibilité — points UX copy

| Item | État | Action |
|---|---|---|
| `aria-label` sur les liens icônes | ✓ partiellement | Compléter |
| `aria-expanded` sur les toggles | ✗ manquant | Ajouter |
| `aria-current` sur lang-switch actif | ✗ | Ajouter |
| Texte alternatif des images de cas | ✓ présent mais générique | Préciser ce qu'on voit |
| Liens « → » sans contexte | ⚠️ | Texte SR caché ou aria-label |
| `lang="fr"` quand FR actif | ✓ géré | OK |

---

## 12. Plan d'action priorisé

### Sprint 1 — Quick wins (½ journée)
1. Réécrire les CTA landing + nav (cohérence verbale).
2. Corriger `Prototypage` → `Prototyping` en EN.
3. Renommer `Star` → `Save` (ou cacher le compteur quand 0).
4. Resserrer le sous-titre Capacity Transfer (47 → 22 mots).
5. Ajouter `aria-expanded` sur les toggles `+`.
6. Détection langue navigateur.
7. Renumérotation projets (07 dupliqué).

### Sprint 2 — Standardisation (1 journée)
8. Migrer toutes les études de cas vers la grille unifiée 5 sections.
9. Normaliser les case-metrics (retirer les valeurs faibles, formater).
10. Désargoter / gloser les acronymes (FOCUSED, FUC, DTCG, MCP, PDC, OF).
11. Tags projets : passer à 3 max, niveau homogène (discipline).
12. Footer + intro "Other projects".

### Sprint 3 — SEO & distribution (½ journée)
13. `<title>` dynamique par page.
14. Meta description par cas.
15. OG image par défaut + dates de publication.
16. Page 404 inline.

---

## 13. Notes finales

**Ce que tu fais déjà très bien**
- Métriques chiffrées en tête de cas — rare dans les portfolios design, à conserver coûte que coûte.
- L'arc narratif Audit → Corrective Actions → Plugin → Multi-select raconte une vraie maturité produit.
- Le ton « senior qui livre » sans posture grandiose dans les paragraphes 2/3 du Who am I.
- La double langue maintenue à parité (à 95%).
- Les case studies Oplit montrent une posture de owner, pas d'exécutant.

**Ce qui débloquerait le plus de valeur**
1. **Standardiser les sections** des études (grille unifiée).
2. **Désargoter** pour rendre lisible aux recruteurs et hiring managers non-design ops.
3. **Resserrer les sous-titres** (≤ 25 mots, 1 idée).
4. **Mettre l'impact business dans le sous-titre** (pas en bas de page).

**Cap suivant**
Le portfolio raconte aujourd'hui « j'ai été ». Avec ces ajustements, il dira clairement « voilà ce que je vais apporter ». Tu vises des rôles où design owne une part de la stratégie : ton portfolio doit être un échantillon de cette posture, pas un CV illustré.

Tu y es à 80%. Les 20% restants tiennent à de la précision sémantique et de la cohérence — pas à du fond.

---

*Revue générée le 9 mai 2026 — basée sur `index.html` et `main.js` de la branche `master`.*
