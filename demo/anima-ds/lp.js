/* ============================================================
   Anima DS — Landing interactions
   Scroll reveal · staggered groups · stat count-up · sticky topbar
   All guarded by prefers-reduced-motion.
   ============================================================ */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Stagger index: assign --i to each child inside a reveal group ---- */
document.querySelectorAll('[data-reveal-group]').forEach((group) => {
  group.querySelectorAll('[data-reveal]').forEach((el, i) => {
    el.style.setProperty('--i', i);
  });
});

/* ---- Scroll reveal ---- */
if (reduced) {
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        // trigger count-up if flagged
        if (entry.target.hasAttribute('data-count')) countUp(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

/* ---- Stat count-up ----
   Parses the numeric part of a <folio-stat value="…"> and animates it,
   preserving the surrounding glyphs (+, %, spaces). */
function countUp(statEl) {
  if (reduced) return;
  const raw = statEl.getAttribute('value') || '';
  const match = raw.match(/(\d[\d\s]*)/); // first number run
  if (!match) return;
  const targetStr = match[1].replace(/\s/g, '');
  const target = parseInt(targetStr, 10);
  if (!Number.isFinite(target) || target === 0) return;

  const prefix = raw.slice(0, match.index);
  const suffix = raw.slice(match.index + match[1].length);
  const dur = 900;
  const start = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic

  function frame(now) {
    const t = Math.min(1, (now - start) / dur);
    const val = Math.round(ease(t) * target);
    statEl.setAttribute('value', `${prefix}${val}${suffix}`);
    if (t < 1) requestAnimationFrame(frame);
    else statEl.setAttribute('value', raw); // restore exact original
  }
  requestAnimationFrame(frame);
}

/* ---- Recommender: styled dropdown → offer + price + contact CTA ---- */
const RECO = {
  diagnostic: {
    offer: 'Diagnostic Design System',
    price: 'dès 4 500 € · forfait · 2–3 sem.',
    note: "Avant d'investir dans un système, il faut savoir ce qu'il doit résoudre. En 2 à 3 semaines, j'audite votre produit, votre Figma et le lien design ↔ code, puis je vous rends une feuille de route priorisée — pas un rapport de plus, un plan actionnable.",
    points: [
      'Audit produit, Figma, tokens & accessibilité (RGAA / EAA)',
      'Roadmap priorisée + proposition de structure',
      'Chiffrage précis des étapes suivantes'
    ],
    invite: "Réservons 30 min pour cadrer votre contexte : je vous dis si le Diagnostic est le bon point de départ, et ce qu'il vous fera gagner."
  },
  conception: {
    offer: 'Conception & Implémentation',
    price: '10 – 50 k€ · ex. type ~22 k€',
    note: "Votre interface diverge parce que chaque écran est recodé à la main. Je construis les fondations, les composants et la doc, connectés au code (Code Connect) — pour que design et dev arrêtent de repartir de zéro.",
    points: [
      'Fondations & tokens (Figma variables, DTCG, modes)',
      'Composants documentés + gouvernance',
      'Connexion au code + accessibilité by design'
    ],
    invite: "Montrez-moi votre produit en 30 min : je vous donne une fourchette réaliste et les 2–3 premières priorités."
  },
  essentiel: {
    offer: 'Abonnement · Essentiel',
    price: 'dès ~1 100 € / mois · ~2 j/mois',
    note: "Un design system sans personne pour le faire vivre se périme en quelques mois. Pour ~2 jours/mois, je le garde cohérent, la dette recule, et vous suivez sa santé via une scorecard mensuelle — sans engagement au-delà du trimestre.",
    points: [
      'Évolution & maintenance continues',
      'Scorecard mensuelle (dette · couverture · adoption)',
      'Point de suivi mensuel'
    ],
    invite: "Parlons 30 min de l'état actuel de votre DS : je vous montre concrètement ce qu'un mois-type changerait."
  },
  croissance: {
    offer: 'Abonnement · Croissance',
    price: '~2 100 € / mois · ~4 j/mois',
    note: "Un DS n'a de valeur que s'il est adopté. Pour ~4 jours/mois, je coache vos équipes design ET dev, je déploie la gouvernance et j'anime un atelier par trimestre — l'objectif est que tout le monde s'en serve, pas qu'il existe.",
    points: [
      'Coaching équipe (design & dev)',
      'Déploiement & gouvernance',
      '1 atelier / trimestre + canal Slack dédié'
    ],
    invite: "En 30 min, on identifie ce qui bloque l'adoption chez vous — et par quoi commencer dès le premier mois."
  },
  scale: {
    offer: 'Abonnement · Scale',
    price: '~4 000 € / mois · ~8 j/mois',
    note: "Passer à l'échelle, c'est gérer plusieurs équipes, plusieurs marques, du theming. Pour ~8 jours/mois, j'assure un suivi hebdomadaire, un atelier par mois et une architecture multi-marque qui tient la charge.",
    points: [
      'Suivi hebdomadaire + Slack prioritaire',
      '1 atelier / mois',
      'Multi-marque / theming à l\'échelle'
    ],
    invite: "Décrivons votre organisation en 30 min : je vous propose l'architecture qui scale sans casser l'existant."
  },
  formation: {
    offer: 'Formations & Workshops',
    price: '1 500 € / session (4h)',
    note: "Parfois le besoin n'est pas de construire, mais de faire monter l'équipe en compétence. En 4h, présentiel ou distanciel, vos designers et devs repartent avec des méthodes concrètes — pas des slides.",
    points: [
      'Fondamentaux DS · Tokens & variables Figma',
      'Contribuer au DS · Design ↔ Dev · Accessibilité',
      'Adaptée à votre stack, design ET dev'
    ],
    invite: "Dites-moi le niveau de votre équipe en 30 min : je cale le programme sur vos vrais besoins."
  },
  carte: {
    offer: 'À la carte / TJM',
    price: 'dès 500 € · TJM 600 €/j',
    note: "Un besoin précis ne mérite pas un pack entier. Audit express, config de tokens, formation seule ou quelques jours sur-mesure : on prend juste ce qu'il faut, sans engagement.",
    points: [
      'Audit express dès 1 500 € · Tokens dès 500 €',
      'Maintenance ponctuelle 500 €/mois',
      'TJM 600 €/j pour le sur-mesure'
    ],
    invite: "Dites-moi votre besoin exact en 30 min : je vous fais une proposition ciblée, sans surdimensionner."
  }
};

document.querySelectorAll('[data-dropdown]').forEach((drop) => {
  const trigger = drop.querySelector('.fdrop-trigger');
  const list = drop.querySelector('.fdrop-list');
  const valueEl = drop.querySelector('.fdrop-value');
  const opts = [...drop.querySelectorAll('.fdrop-opt')];
  const reco = drop.parentElement.querySelector('.reco');
  let activeIdx = -1;

  const setActive = (i) => {
    opts.forEach((o, idx) => o.classList.toggle('is-active', idx === i));
    activeIdx = i;
    if (i >= 0) opts[i].scrollIntoView({ block: 'nearest' });
  };
  const open = () => {
    drop.classList.add('is-open'); list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const sel = opts.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    setActive(sel >= 0 ? sel : 0);
  };
  const close = () => {
    drop.classList.remove('is-open'); list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false'); setActive(-1);
  };
  const choose = (i) => {
    opts.forEach((o) => o.setAttribute('aria-selected', 'false'));
    opts[i].setAttribute('aria-selected', 'true');
    valueEl.textContent = opts[i].textContent;
    valueEl.classList.remove('is-placeholder');
    close(); trigger.focus();
    const r = RECO[opts[i].dataset.offer];
    if (!r) return;
    reco.querySelector('.reco-offer').textContent = r.offer;
    reco.querySelector('.reco-price').textContent = r.price;
    reco.querySelector('.reco-note').textContent = r.note;
    const pts = reco.querySelector('.reco-points');
    pts.innerHTML = '';
    (r.points || []).forEach((p) => {
      const li = document.createElement('li');
      li.textContent = p;
      pts.appendChild(li);
    });
    reco.querySelector('.reco-invite').textContent = r.invite || '';
    reco.hidden = false;
    // restart the reveal transition on each new selection
    reco.classList.remove('is-shown');
    requestAnimationFrame(() => requestAnimationFrame(() => reco.classList.add('is-shown')));
  };

  trigger.addEventListener('click', () => (list.hidden ? open() : close()));
  opts.forEach((o, idx) => {
    o.addEventListener('click', () => choose(idx));
    o.addEventListener('mousemove', () => setActive(idx));
  });
  drop.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); trigger.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); list.hidden ? open() : setActive(Math.min(opts.length - 1, activeIdx + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!list.hidden) setActive(Math.max(0, activeIdx - 1)); }
    else if ((e.key === 'Enter' || e.key === ' ') && !list.hidden && activeIdx >= 0) { e.preventDefault(); choose(activeIdx); }
  });
  document.addEventListener('click', (e) => { if (!drop.contains(e.target)) close(); });
});

/* ---- Sticky topbar border on scroll ---- */
const topbar = document.getElementById('topbar');
if (topbar) {
  const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
