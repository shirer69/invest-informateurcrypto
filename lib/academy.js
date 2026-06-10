// Contenu pédagogique original (reformulé, éducatif — aucun message Telegram copié).
// Aucune promesse de gain. Contenu informatif uniquement.

export const BADGES = [
  { id: "market-analyst", label: "Market Analyst", icon: "📊", desc: "Niveau 1 terminé" },
  { id: "liquidity-hunter", label: "Liquidity Hunter", icon: "🎯", desc: "Niveau 2 terminé" },
  { id: "risk-manager", label: "Risk Manager", icon: "🛡️", desc: "Quiz risque réussi à 100%" },
  { id: "institutional", label: "Institutional", icon: "🏛️", desc: "Niveau 3 terminé" },
  { id: "streak-7", label: "Régularité", icon: "🔥", desc: "7 jours d'affilée" },
];

// Types de questions : single | multiple | boolean | scenario
export const LEVELS = [
  {
    id: "l1",
    tone: "emerald",
    label: "Niveau 1 — Fondations",
    summary: "Comprendre les marchés, la structure d'un trade et les notions de base.",
    modules: [
      {
        id: "l1m1",
        title: "Comprendre les marchés",
        points: [
          "Crypto, indices, matières premières : des classes d'actifs aux comportements différents.",
          "La volatilité varie selon l'actif et le contexte macro.",
          "Liquidité = facilité à entrer/sortir d'une position sans déplacer le prix.",
        ],
        quiz: [
          {
            type: "single",
            q: "Qu'est-ce que la liquidité d'un marché ?",
            options: [
              "La quantité de news disponibles",
              "La facilité d'acheter/vendre sans trop déplacer le prix",
              "Le niveau de levier autorisé",
              "Le nombre d'indicateurs sur le graphique",
            ],
            correct: [1],
            explain:
              "La liquidité mesure la capacité à exécuter un ordre proche du prix affiché. Plus un marché est liquide, plus le slippage est faible.",
          },
          {
            type: "boolean",
            q: "Tous les actifs ont la même volatilité.",
            correct: false,
            explain:
              "Faux. La volatilité dépend de l'actif, de l'heure, du contexte macro et de la liquidité.",
          },
        ],
      },
      {
        id: "l1m2",
        title: "Structure d'un trade",
        points: [
          "Un trade se définit AVANT l'entrée : zone d'entrée, invalidation (SL), objectif (TP).",
          "Le ratio risque/rendement (R:R) compare le risque pris au gain visé.",
          "Sans niveau d'invalidation clair, il n'y a pas de plan — seulement un pari.",
        ],
        quiz: [
          {
            type: "single",
            q: "Quel élément définit où votre idée de trade est invalidée ?",
            options: ["Le take-profit", "Le stop-loss", "Le levier", "Le spread"],
            correct: [1],
            explain:
              "Le stop-loss matérialise le niveau où le scénario est invalidé : on coupe et on préserve le capital.",
          },
          {
            type: "scenario",
            q: "Entrée à 100, stop à 95, objectif à 115. Quel est le R:R approximatif ?",
            options: ["1:1", "1:2", "1:3", "Négatif"],
            correct: [2],
            explain:
              "Risque = 5 (100→95), gain visé = 15 (100→115) → environ 1:3. Un R:R favorable permet d'être rentable même avec un taux de réussite modéré.",
          },
        ],
      },
      {
        id: "l1m3",
        title: "Support, résistance & tendance",
        points: [
          "Support / résistance : zones où le prix a historiquement réagi.",
          "Tendance (trend) vs range : le marché alterne phases directionnelles et phases de consolidation.",
          "On adapte la lecture au contexte : on ne trade pas un range comme une tendance.",
        ],
        quiz: [
          {
            type: "boolean",
            q: "On utilise la même approche en tendance et en range.",
            correct: false,
            explain:
              "Faux. En range on joue les bornes ; en tendance on cherche des continuations dans le sens du mouvement.",
          },
        ],
      },
    ],
  },
  {
    id: "l2",
    tone: "cyan",
    label: "Niveau 2 — Méthode (lecture de marché)",
    summary: "Lecture multi-timeframe, zones de liquidité, confirmation et gestion du risque.",
    modules: [
      {
        id: "l2m1",
        title: "Lecture multi-timeframe",
        points: [
          "Le timeframe supérieur donne le biais directionnel (le « contexte »).",
          "Le timeframe inférieur sert au timing d'entrée précis.",
          "Un setup aligné sur plusieurs unités de temps est plus robuste.",
        ],
        quiz: [
          {
            type: "single",
            q: "À quoi sert principalement le timeframe supérieur ?",
            options: [
              "Au timing d'entrée précis",
              "À définir le biais directionnel / contexte",
              "À calculer le spread",
              "À choisir le levier",
            ],
            correct: [1],
            explain:
              "Le TF supérieur cadre la direction générale ; on descend ensuite chercher une entrée fine sur un TF plus bas.",
          },
        ],
      },
      {
        id: "l2m2",
        title: "Zones de liquidité & confirmation",
        points: [
          "Les zones de liquidité se situent souvent autour des plus-hauts/plus-bas évidents.",
          "Une confirmation (réaction du prix sur la zone) réduit le risque d'entrée prématurée.",
          "Patience : pas de confirmation = pas de trade.",
        ],
        quiz: [
          {
            type: "scenario",
            q: "Le prix atteint une zone clé sans aucune réaction nette. Que fais-tu ?",
            options: [
              "J'entre quand même au cas où",
              "J'attends une confirmation avant d'agir",
              "Je double la taille pour me rattraper",
              "Je retire mon stop-loss",
            ],
            correct: [1],
            explain:
              "Sans confirmation, on attend. Entrer « au cas où » ou retirer son stop sont des erreurs classiques de discipline.",
          },
          {
            type: "multiple",
            q: "Quels éléments renforcent la qualité d'un setup ? (plusieurs réponses)",
            options: [
              "Alignement multi-timeframe",
              "Confirmation sur la zone",
              "Absence d'invalidation claire",
              "R:R favorable",
            ],
            correct: [0, 1, 3],
            explain:
              "L'absence d'invalidation claire est au contraire un signal de NE PAS entrer. Les autres renforcent le setup.",
          },
        ],
      },
      {
        id: "l2m3",
        title: "Gestion du risque & timing",
        points: [
          "Le risque par trade se définit en % du capital, fixé à l'avance (souvent faible).",
          "Le money management prime sur la prédiction : préserver le capital d'abord.",
          "Le timing d'entrée découle du plan, pas de l'émotion (pas de FOMO).",
        ],
        quiz: [
          {
            type: "single",
            q: "Quelle est la priorité d'une approche disciplinée ?",
            options: [
              "Maximiser le levier",
              "Préserver le capital et contrôler le risque",
              "Trader le plus souvent possible",
              "Suivre les émotions du marché",
            ],
            correct: [1],
            explain:
              "La préservation du capital et le contrôle du risque passent avant la recherche du gain. C'est ce qui permet de durer.",
          },
        ],
      },
    ],
  },
  {
    id: "l3",
    tone: "violet",
    label: "Niveau 3 — Avancé",
    summary: "Structure de marché avancée, balayages de liquidité, confluence et psychologie.",
    modules: [
      {
        id: "l3m1",
        title: "Structure de marché avancée",
        points: [
          "Identifier les changements de structure (rupture de la séquence de hauts/bas).",
          "Un « balayage de liquidité » (liquidity sweep) peut précéder un retournement.",
          "La structure se lit en continu : elle évolue avec le prix.",
        ],
        quiz: [
          {
            type: "boolean",
            q: "Un balayage de liquidité garantit un retournement.",
            correct: false,
            explain:
              "Faux. Rien n'est garanti. Un sweep est un indice de contexte, à confirmer — pas une certitude.",
          },
        ],
      },
      {
        id: "l3m2",
        title: "Confluence & psychologie",
        points: [
          "La confluence = plusieurs signaux indépendants pointant dans le même sens.",
          "Discipline émotionnelle : accepter les pertes contrôlées, ne pas sur-trader.",
          "Gestion d'exposition au niveau du portefeuille, pas seulement du trade isolé.",
        ],
        quiz: [
          {
            type: "single",
            q: "Qu'est-ce que la « confluence » ?",
            options: [
              "Un seul indicateur très fiable",
              "Plusieurs signaux indépendants alignés",
              "Le fait d'augmenter le levier",
              "Une zone sans volume",
            ],
            correct: [1],
            explain:
              "La confluence additionne des arguments indépendants : plus ils convergent, plus le scénario est crédible (sans jamais être certain).",
          },
        ],
      },
    ],
  },
];

// Cas pédagogiques originaux (inspirés de situations de marché types, reformulés).
export const CASE_STUDIES = [
  {
    id: "cs-wti",
    asset: "WTI (pétrole)",
    tag: "Matières premières",
    context:
      "Le marché évolue sous une résistance hebdomadaire after un mouvement haussier étendu. Le contexte macro suggère de la prudence.",
    steps: [
      "Contexte (TF supérieur) : prix en zone de résistance, momentum qui ralentit.",
      "Liquidité : plus-hauts récents susceptibles d'attirer le prix avant une réaction.",
      "Confirmation : rejet net de la zone sur le TF d'entrée.",
      "Plan : invalidation au-dessus de la zone, objectif sur le support intermédiaire.",
    ],
    decision: "Vente sur confirmation, risque faible défini à l'avance.",
    outcome: "Scénario pédagogique : objectif partiel atteint, stop déplacé pour protéger.",
    debrief:
      "L'intérêt n'est pas le résultat mais le process : contexte → liquidité → confirmation → plan. Aucune garantie : la discipline prime.",
  },
  {
    id: "cs-btc",
    asset: "BTC",
    tag: "Crypto",
    context:
      "Après une phase de range, le prix balaie les plus-bas évidents puis réintègre la zone (faux mouvement potentiel).",
    steps: [
      "Contexte : range identifié, bornes claires.",
      "Sweep : balayage des plus-bas (prise de liquidité) puis réintégration.",
      "Confirmation : retour au-dessus de la borne basse.",
      "Plan : invalidation sous le plus-bas du sweep, objectif borne haute.",
    ],
    decision: "Achat sur réintégration confirmée, taille calibrée au risque.",
    outcome: "Scénario pédagogique : mouvement vers la borne haute, gestion active.",
    debrief:
      "Un sweep n'est pas un signal magique : sans réintégration confirmée, on n'entre pas. Le risque reste borné par l'invalidation.",
  },
  {
    id: "cs-nasdaq",
    asset: "NASDAQ",
    tag: "Indices",
    context:
      "Ouverture après une publication macro. Forte volatilité initiale, structure incertaine.",
    steps: [
      "Contexte : volatilité élevée, pas de structure nette → prudence.",
      "Règle : si le marché est illisible, on ne force pas.",
      "Attente : laisser la structure se former avant d'agir.",
    ],
    decision: "Pas de trade — le meilleur trade est parfois l'absence de trade.",
    outcome: "Scénario pédagogique : capital préservé, opportunité plus claire ensuite.",
    debrief:
      "Ne pas trader est une décision active. Préserver le capital dans le bruit fait partie de la méthode.",
  },
];
