// Contenu pédagogique — orienté trading actif (scalping, intraday, futures, forex, indices).
// Aucune promesse de gain. Contenu informatif uniquement.

export const TRADING_BADGES = [
  { id: "t-analyst",       label: "Analyste",       icon: "📊", desc: "Niveau 1 terminé" },
  { id: "t-momentum",      label: "Momentum Trader", icon: "⚡", desc: "Niveau 2 terminé" },
  { id: "t-pro",           label: "Pro Trader",      icon: "🏆", desc: "Niveau 3 terminé" },
  { id: "t-risk-master",   label: "Risk Master",     icon: "🎯", desc: "Quiz risque parfait" },
  { id: "t-streak",        label: "Discipline",      icon: "🔥", desc: "7 jours d'affilée" },
];

export const TRADING_LEVELS = [
  {
    id: "t1",
    tone: "amber",
    label: "Niveau 1 — Bases du Trading",
    summary: "Marchés, chandeliers, supports/résistances et premiers reflexes d'analyse.",
    modules: [
      {
        id: "t1m1",
        title: "Marchés et instruments financiers",
        points: [
          "Le Forex : marché des devises (EUR/USD, GBP/USD…), ouvert 24h/5j, le plus liquide au monde.",
          "Les indices (NAS100, S&P500, DAX) : paniers d'actions reflétant l'économie d'un pays ou secteur.",
          "Les crypto futures (BTC, ETH, HYPE…) : contrats à terme permettant de trader avec levier sur la crypto.",
          "CFD & perps : instruments dérivés permettant de trader à la hausse (LONG) ou à la baisse (SHORT).",
          "Chaque marché a ses horaires, sa liquidité et sa volatilité — s'adapter est une compétence.",
        ],
        quiz: [
          {
            type: "single",
            q: "Quelle est la particularité du marché Forex par rapport aux autres marchés ?",
            options: [
              "Il n'est ouvert qu'aux professionnels",
              "Il est ouvert 24h/24 du lundi au vendredi et est le plus liquide au monde",
              "Il ne s'échange que des cryptomonnaies",
              "Il est fermé le week-end et la nuit",
            ],
            correct: [1],
            explain:
              "Le Forex est ouvert en continu du lundi au vendredi grâce aux sessions qui se chevauchent (Tokyo, Londres, New York). C'est le marché le plus liquide avec plus de 7 000 milliards de dollars échangés par jour.",
          },
          {
            type: "boolean",
            q: "Un trader SHORT gagne lorsque le prix monte.",
            correct: false,
            explain:
              "Non. Un SHORT est une position vendeuse : on gagne si le prix baisse. Si le prix monte, la position SHORT est en perte.",
          },
          {
            type: "single",
            q: "Qu'est-ce que le NAS100 ?",
            options: [
              "Un token crypto",
              "L'indice des 100 plus grandes entreprises non-financières du NASDAQ",
              "Un contrat pétrolier",
              "Une paire de devises",
            ],
            correct: [1],
            explain:
              "Le NAS100 (Nasdaq 100) regroupe les 100 plus grandes entreprises non-financières du NASDAQ, dominées par la tech (Apple, Nvidia, Meta…). C'est un instrument très populaire chez les traders intraday.",
          },
        ],
      },
      {
        id: "t1m2",
        title: "Lire un graphique en chandeliers japonais",
        points: [
          "Un chandelier = Open, High, Low, Close sur une période (1min, 15min, 1H, 4H, 1D…).",
          "Corps vert (haussier) : le prix a clôturé plus haut que l'ouverture — les acheteurs dominent.",
          "Corps rouge (baissier) : le prix a clôturé plus bas que l'ouverture — les vendeurs dominent.",
          "Les mèches (shadows) montrent les extremes : haute mèche haute = rejet de la zone haute.",
          "Patterns importants : Doji (indécision), Marteau (retournement haussier), Engulfing (signal fort).",
          "Plus la timeframe est haute, plus le signal est fiable.",
        ],
        quiz: [
          {
            type: "single",
            q: "Que signifie une longue mèche supérieure sur un chandelier ?",
            options: [
              "Le prix a fortement monté et la tendance continue",
              "Le prix a tenté de monter mais a été rejeté par les vendeurs",
              "Le marché est fermé pendant cette période",
              "Le volume est anormalement élevé",
            ],
            correct: [1],
            explain:
              "Une longue mèche supérieure indique un rejet : les acheteurs ont poussé le prix en haut, mais les vendeurs ont repris le contrôle avant la clôture. C'est un signal de faiblesse haussière.",
          },
          {
            type: "boolean",
            q: "Un Doji signifie que les acheteurs ont clairement dominé la session.",
            correct: false,
            explain:
              "Non. Un Doji (corps minuscule) signifie indécision : les forces entre acheteurs et vendeurs sont équilibrées. Il faut attendre confirmation avant d'agir.",
          },
          {
            type: "multiple",
            q: "Quels éléments compose un chandelier japonais ? (plusieurs réponses)",
            options: ["L'ouverture (Open)", "Le volume total de la journée", "Le plus haut (High)", "La clôture (Close)"],
            correct: [0, 2, 3],
            explain:
              "Un chandelier japonais contient : Open, High, Low, Close (OHLC). Le volume est un indicateur séparé, pas inclus dans le chandelier lui-même.",
          },
        ],
      },
      {
        id: "t1m3",
        title: "Supports, résistances et zones de prix",
        points: [
          "Un support = niveau de prix où les acheteurs ont tendance à intervenir et stopper la baisse.",
          "Une résistance = niveau où les vendeurs reprennent le contrôle et stoppent la hausse.",
          "Plus un niveau a été testé de fois, plus il est significatif (mais aussi plus fragile).",
          "Quand un support est cassé, il devient résistance (et vice versa) — c'est le principe de polarité.",
          "Les zones (supply/demand) sont plus pertinentes que les niveaux fixes : le marché ne s'arrête pas au pip près.",
          "Les niveaux psychologiques (ex : 100$, 50 000$) agissent souvent comme supports/résistances naturels.",
        ],
        quiz: [
          {
            type: "single",
            q: "Qu'est-ce que le principe de 'polarité' en analyse technique ?",
            options: [
              "Un support et une résistance s'annulent mutuellement",
              "Un support cassé devient résistance, et une résistance cassée devient support",
              "Le marché est toujours haussier sur le long terme",
              "Les niveaux psychologiques n'ont aucune valeur",
            ],
            correct: [1],
            explain:
              "La polarité est un concept clé : quand le prix casse un support, ce niveau devient une nouvelle résistance car les anciens acheteurs qui voulaient sortir à break-even vendront à ce niveau.",
          },
          {
            type: "boolean",
            q: "Il vaut mieux trader sur des zones que sur des niveaux de prix exacts.",
            correct: true,
            explain:
              "Exact. Le marché ne s'arrête rarement à un prix précis. Travailler avec des zones (ex : 48 500$ — 49 200$) est plus réaliste et évite de rater de bonnes entrées.",
          },
        ],
      },
    ],
  },
  {
    id: "t2",
    tone: "orange",
    label: "Niveau 2 — Indicateurs & Gestion du Risque",
    summary: "RSI, MACD, moyennes mobiles, money management et stratégies intraday.",
    modules: [
      {
        id: "t2m1",
        title: "Les indicateurs techniques essentiels",
        points: [
          "RSI (Relative Strength Index) : oscillateur entre 0 et 100. >70 = suracheté, <30 = survendu.",
          "MACD : mesure la convergence/divergence de deux moyennes mobiles. Le croisement des lignes génère des signaux.",
          "Moyennes mobiles (MA20, MA50, MA200) : lissent le prix. Un prix au-dessus de la MA200 = tendance haussière long terme.",
          "Bollinger Bands : l'écartement des bandes signale la volatilité. Contraction = explosion imminente.",
          "Les indicateurs sont des outils, pas des oracles. Ils confirment — ils ne prédisent pas.",
          "Ne jamais utiliser plusieurs indicateurs mesurant la même chose (ex : RSI + Stochastique = redondance).",
        ],
        quiz: [
          {
            type: "single",
            q: "Que signifie un RSI > 70 ?",
            options: [
              "Le marché est survendu et va forcément monter",
              "Le marché est suracheté, une correction est possible mais pas certaine",
              "Le volume est exceptionnel",
              "Le prix est au plus bas de la journée",
            ],
            correct: [1],
            explain:
              "RSI > 70 signale une zone de surachat : le prix a monté fortement et rapidement. Une correction est plus probable, mais le RSI peut rester élevé longtemps en tendance forte. Ce n'est pas un signal de vente automatique.",
          },
          {
            type: "boolean",
            q: "Superposer un RSI et un Stochastique donne plus d'informations qu'un seul des deux.",
            correct: false,
            explain:
              "Non. RSI et Stochastique mesurent la même chose (momentum/oscillateur). Les combiner crée de la redondance, pas de l'information. Mieux vaut combiner des indicateurs de nature différente (ex : tendance + momentum).",
          },
          {
            type: "single",
            q: "Qu'indique un resserrement des Bollinger Bands ?",
            options: [
              "La fin imminente de la tendance haussière",
              "Une période de faible volatilité, souvent suivie d'un mouvement fort",
              "Un signal d'achat automatique",
              "Que le marché est fermé",
            ],
            correct: [1],
            explain:
              "La contraction des Bollinger Bands indique une compression de volatilité — le marché accumule de l'énergie. Cette phase précède souvent une forte sortie de range, à la hausse ou à la baisse.",
          },
        ],
      },
      {
        id: "t2m2",
        title: "Gestion du risque et money management",
        points: [
          "La règle des 1-2% : ne jamais risquer plus de 1 à 2% du capital total sur un seul trade.",
          "Risk/Reward (R:R) : chaque trade doit avoir un minimum de R:R 1:2 (risque 50$, viser 100$).",
          "Le Stop-Loss est non négociable : il définit la perte maximale acceptée AVANT d'entrer.",
          "Position sizing = ajuster la taille en fonction du stop pour que la perte = 1-2% du capital.",
          "Formule : Taille = (Capital × %risque) ÷ distance_stop_en_$.",
          "Un trader professionnel peut avoir 40% de trades gagnants et être rentable grâce à un bon R:R.",
        ],
        quiz: [
          {
            type: "scenario",
            q: "Capital : 10 000$. Risque max 1%. Stop à 50$ du prix d'entrée. Quelle taille de position ?",
            options: ["50 unités", "200 unités", "2 unités", "500 unités"],
            correct: [2],
            explain:
              "10 000$ × 1% = 100$ de risque max. Distance stop = 50$. Taille = 100$ ÷ 50$ = 2 unités. Avec 2 unités et un stop à -50$, on perd exactement 100$ = 1% du capital si le stop est touché.",
          },
          {
            type: "boolean",
            q: "Un trader avec 40% de trades gagnants peut être rentable.",
            correct: true,
            explain:
              "Absolument. Si le R:R moyen est de 1:3 (perd 1$, gagne 3$), avec 40% de gagnants : (0.4×3) - (0.6×1) = 1.2 - 0.6 = +0.6$ en moyenne par trade. La rentabilité vient du rapport gain/perte, pas du taux de réussite.",
          },
          {
            type: "single",
            q: "Pourquoi place-t-on le stop-loss AVANT d'entrer en position ?",
            options: [
              "Pour profiter de l'effet de levier maximum",
              "Car le broker l'exige",
              "Pour définir objectivement la perte maximale sans laisser les émotions intervenir",
              "Pour éviter les frais de roulement",
            ],
            correct: [2],
            explain:
              "Le stop placé avant l'entrée est une décision rationnelle. Une fois en position, les émotions biaisent le jugement — on a tendance à 'espérer' un retournement et à repousser le stop, ce qui aggrave les pertes.",
          },
        ],
      },
      {
        id: "t2m3",
        title: "Stratégies scalping et intraday",
        points: [
          "Le scalping cible des mouvements de 5 à 30 points sur des timeframes 1min à 15min.",
          "L'intraday vise des mouvements plus larges sur 1H-4H — toutes les positions sont fermées avant minuit.",
          "La session de New York (14h-23h Paris) est la plus volatile pour NAS100, S&P500 et paires USD.",
          "La session de Londres (08h-17h Paris) est idéale pour les paires EUR/GBP et indices européens.",
          "Le news trading : éviter les positions ouvertes lors des publications macro importantes (NFP, Fed, CPI).",
          "L'heure d'ouverture (Open) d'une session crée souvent un faux mouvement (fakeout) avant la vraie direction.",
        ],
        quiz: [
          {
            type: "single",
            q: "Quelle session est la plus volatile pour trader le NAS100 ?",
            options: [
              "La session de Tokyo (02h-11h Paris)",
              "La session de New York (14h-23h Paris)",
              "La session de Sydney (00h-09h Paris)",
              "Le week-end",
            ],
            correct: [1],
            explain:
              "Le NAS100 est un indice américain. Il est le plus actif à l'ouverture de Wall Street (15h30 Paris) avec les plus forts volumes et mouvements directionnels. C'est la session de référence pour trader cet instrument.",
          },
          {
            type: "boolean",
            q: "Il est conseillé de garder une position intraday ouverte pendant une annonce de la Fed.",
            correct: false,
            explain:
              "Non. Les annonces Fed (FOMC) créent des mouvements violents et imprévisibles (±100-200 points sur indices en secondes). La règle intraday : on sort avant les news majeures ou on n'entre pas.",
          },
        ],
      },
    ],
  },
  {
    id: "t3",
    tone: "rose",
    label: "Niveau 3 — Trading Professionnel",
    summary: "Price Action avancée, psychologie du trader et construction d'une stratégie robuste.",
    modules: [
      {
        id: "t3m1",
        title: "Price Action et structure de marché",
        points: [
          "La structure de marché : Higher Highs (HH) + Higher Lows (HL) = tendance haussière.",
          "Lower Highs (LH) + Lower Lows (LL) = tendance baissière. Un changement de structure (CHoCH) = alerte.",
          "Les Order Blocks (OB) : zones de décision institutionnelle, souvent aux origines des impulsions fortes.",
          "Le Fair Value Gap (FVG) : déséquilibre de prix laissé lors d'une impulsion rapide — le prix y revient souvent.",
          "Le concept de liquidité : le marché cherche les stop-loss des traders (clusters de stops = liquidités).",
          "Combiner structure + OB + FVG = confluence forte pour une entrée en Price Action.",
        ],
        quiz: [
          {
            type: "single",
            q: "Une série de HH et HL sur un graphique indique :",
            options: [
              "Une tendance baissière",
              "Un marché en range",
              "Une tendance haussière",
              "Une inversion de tendance",
            ],
            correct: [2],
            explain:
              "Higher Highs (sommets croissants) et Higher Lows (creux croissants) définissent une tendance haussière structurée. Tant que la structure est intacte, on privilégie les positions LONG.",
          },
          {
            type: "single",
            q: "Qu'est-ce qu'un Fair Value Gap (FVG) ?",
            options: [
              "L'écart entre le prix d'achat et de vente (spread)",
              "Un déséquilibre laissé par une bougie d'impulsion forte, que le prix cherche souvent à combler",
              "La différence entre le high et le low journalier",
              "Un indicateur de volume institutionnel",
            ],
            correct: [1],
            explain:
              "Un FVG se forme quand une bougie d'impulsion forte laisse un 'vide' de prix (gap entre la mèche haute de la bougie précédente et la mèche basse de la bougie suivante). Le prix tend à revenir combler ce déséquilibre.",
          },
          {
            type: "boolean",
            q: "Le marché cherche activement les zones de concentration de stop-loss pour les activer.",
            correct: true,
            explain:
              "C'est le concept de liquidité : les stop-loss des traders retail sont des ordres en attente. Les grands acteurs (market makers, institutionnels) ont intérêt à activer ces zones pour obtenir la liquidité nécessaire à leurs positions.",
          },
        ],
      },
      {
        id: "t3m2",
        title: "Psychologie du trader",
        points: [
          "Le revenge trading : après une perte, vouloir 'se refaire' immédiatement avec une taille plus grande — le piège le plus destructeur.",
          "L'overtrading : prendre trop de trades par ennui ou compulsion, hors de son plan. Qualité > quantité.",
          "FOMO en trading : entrer sur un mouvement déjà amorcé, souvent au pire moment (sommet).",
          "L'anchor bias : s'attacher au prix d'entrée d'une position perdante et refuser de couper — 'ça va remonter'.",
          "Un journal de trading est essentiel : documenter chaque trade (setup, raison, résultat, émotion ressentie).",
          "La discipline est un muscle : des règles claires, respectées même sous pression, sont la base du trading durable.",
        ],
        quiz: [
          {
            type: "single",
            q: "Qu'est-ce que le 'revenge trading' ?",
            options: [
              "Une stratégie avancée de contre-tendance",
              "Reprendre immédiatement une position après une perte pour 'se refaire', souvent avec plus de risque",
              "Un trade basé sur des données fondamentales",
              "Une technique de scalping rapide",
            ],
            correct: [1],
            explain:
              "Le revenge trading est l'ennemi n°1 du trader. Après une perte, l'état émotionnel est altéré et le jugement biaisé. Prendre un nouveau trade immédiatement dans cet état multiplie les erreurs et aggrave les pertes.",
          },
          {
            type: "scenario",
            q: "Tu perds 3 trades de suite. Quelle est la bonne réaction ?",
            options: [
              "Augmenter la taille des positions pour récupérer rapidement",
              "Trader sur une paire différente que tu ne connais pas",
              "Faire une pause, revoir les trades, attendre le prochain setup qualité",
              "Passer en mode scalping pour multiplier les chances",
            ],
            correct: [2],
            explain:
              "3 pertes consécutives = signal de pause obligatoire. Analyser ce qui n'a pas fonctionné (setup invalide ? exécution ? marché difficile ?), puis attendre un setup de qualité conforme au plan. Le meilleur trade est parfois de ne pas trader.",
          },
        ],
      },
      {
        id: "t3m3",
        title: "Construire sa stratégie et backtester",
        points: [
          "Une stratégie = un ensemble de règles précises pour entrer, gérer et sortir un trade. Rien de vague.",
          "Le backtesting : tester la stratégie sur l'historique de prix pour évaluer son edge statistique.",
          "Métriques clés : Win Rate, R:R moyen, Profit Factor (total gains / total pertes), Max Drawdown.",
          "Forward testing : paper trading en temps réel avant d'engager du capital réel.",
          "Le journal de trading : chaque trade documenté = base de données pour s'améliorer.",
          "Optimisation ≠ overfitting : une stratégie trop optimisée sur le passé peut échouer en live.",
        ],
        quiz: [
          {
            type: "single",
            q: "Qu'est-ce que le Profit Factor d'une stratégie ?",
            options: [
              "Le ratio entre le nombre de trades gagnants et perdants",
              "Le total des gains divisé par le total des pertes sur une période",
              "Le capital total engagé par trade",
              "Le drawdown maximum enregistré",
            ],
            correct: [1],
            explain:
              "Le Profit Factor = Σ gains / Σ pertes. Un PF > 1 signifie que la stratégie est rentable. Un PF de 1.5 signifie que pour chaque 1$ perdu, on gagne 1.5$ en moyenne. Objectif : PF ≥ 1.5 sur un échantillon significatif.",
          },
          {
            type: "boolean",
            q: "Un backtesting parfait sur 5 ans garantit des performances futures similaires.",
            correct: false,
            explain:
              "Non. Le backtesting donne une indication statistique mais ne garantit rien. Les marchés évoluent (régimes changeants, volatilité, corrélations). De plus, l'overfitting — optimiser une stratégie pour coller à l'historique — crée une illusion de performance qui s'effondre en live.",
          },
          {
            type: "multiple",
            q: "Quels éléments doit contenir un journal de trading ? (plusieurs réponses)",
            options: [
              "La raison d'entrée (setup décrit)",
              "L'état émotionnel au moment du trade",
              "Le cours de l'action demain",
              "Le résultat (PnL, R:R réalisé)",
            ],
            correct: [0, 1, 3],
            explain:
              "Un journal de trading documenté permet d'identifier les patterns de réussite et d'échec. Les émotions sont aussi importantes que le setup : elles révèlent les biais comportementaux qui sabotent les performances.",
          },
        ],
      },
    ],
  },
];

export const TRADING_CASE_STUDIES = [
  {
    id: "tc-nas100-scalp",
    asset: "NAS100 — Scalping ouverture US",
    tag: "Indice US",
    context:
      "Le NAS100 ouvre la session de New York avec un gap haussier. Le prix teste une zone de résistance intraday sur fond de données macro neutres. Le trader identifie un Order Block sur 15min et attend le retrait.",
    steps: [
      "Contexte (4H) : tendance haussière intacte, dernier Higher Low respecté.",
      "Identification de l'OB (15min) : bougie baissière à l'origine de l'impulsion haussière précédente.",
      "Attente du retrait : le prix revient sur l'OB avec RSI < 40 — signe de momentum vendeur épuisé.",
      "Entrée LONG sur la zone OB, stop sous le bas de l'OB, TP sur le précédent high intraday.",
    ],
    decision: "LONG scalp sur Order Block, R:R 1:3, stop 15 pts, TP 45 pts, durée prévue 20-60 min.",
    outcome: "Scénario pédagogique : +42 pts capturés en 35 minutes, trade fermé manuellement avant news.",
    debrief:
      "Le timing est clé : attendre le retrait sur l'OB plutôt que de chasser le mouvement. La confluence (OB + RSI oversold + structure haussière) donne une entrée à forte probabilité. La sortie avant la news est une règle de discipline, pas une émotion.",
  },
  {
    id: "tc-hype-futures",
    asset: "HYPE/USDT — Breakout Futures",
    tag: "Crypto Futures",
    context:
      "HYPE consolide depuis 3 jours sous une résistance majeure sur fond de volume décroissant. Le trader anticipe un breakout haussier et prépare une entrée sur la confirmation de cassure.",
    steps: [
      "Analyse (4H) : compression sous résistance, bougie de plus en plus étroites = spring potentiel.",
      "Identification du niveau de cassure : breakout validé sur clôture 4H au-dessus de la résistance avec volume.",
      "Entrée en LONG sur le retest de la résistance devenue support, stop sous le retour en range.",
      "Gestion dynamique : TP1 à +15% (partiel 50%), TP2 runner avec stop trail sur swing low.",
    ],
    decision: "LONG futures ×5 sur retest post-breakout, risque 1.5% du capital, TP progressif.",
    outcome: "Scénario pédagogique : +19% sur 4 jours, sortie partielle TP1, runner fermé sur reversal.",
    debrief:
      "Le faux breakout (fakeout) est le piège classique : ne jamais entrer sur la cassure elle-même, attendre le retest. La gestion progressive (TP partiel + runner) capture le mouvement sans laisser trop sur la table.",
  },
  {
    id: "tc-eurusd-intraday",
    asset: "EUR/USD — Setup Forex intraday",
    tag: "Forex",
    context:
      "L'EUR/USD approche une zone de demande hebdomadaire en session de Londres. Le DXY (Dollar Index) montre des signes de faiblesse. Le trader cherche une entrée LONG sur EUR/USD avec un setup en confluence.",
    steps: [
      "Analyse macro : DXY en rejet sous résistance = dollar faible → favorable à EUR/USD haussier.",
      "Zone de demande (Weekly) : niveau où les acheteurs ont stoppé la baisse 3 fois en 6 mois.",
      "Entrée (1H) : FVG haussier + chandelier marteau sur la zone — confluence triple.",
      "Gestion : stop sous le bas de la zone de demande (-30 pips), TP sur résistance suivante (+80 pips).",
    ],
    decision: "LONG EUR/USD sur confluence FVG + demande weekly + signal 1H, R:R 1:2.7.",
    outcome: "Scénario pédagogique : +75 pips en 2 sessions, position allégée à mi-chemin.",
    debrief:
      "La confluence macro + multi-timeframe est ce qui sépare un bon setup d'un trade aléatoire. Analyser le contexte global (DXY) avant l'entrée chart permet d'entrer dans le sens du courant, pas contre lui.",
  },
];
