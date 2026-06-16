// Contenu pédagogique original — orienté investissement, swing trading, spot/margin faible levier, actions US, DCA.
// Aucune promesse de gain. Contenu informatif uniquement.

export const BADGES = [
  { id: "investor", label: "Investisseur", icon: "📈", desc: "Niveau 1 terminé" },
  { id: "swing-trader", label: "Swing Trader", icon: "🎯", desc: "Niveau 2 terminé" },
  { id: "risk-manager", label: "Risk Manager", icon: "🛡️", desc: "Quiz risque réussi à 100%" },
  { id: "portfolio-builder", label: "Portfolio Builder", icon: "🏗️", desc: "Niveau 3 terminé" },
  { id: "streak-7", label: "Régularité", icon: "🔥", desc: "7 jours d'affilée" },
];

export const LEVELS = [
  {
    id: "l1",
    tone: "emerald",
    label: "Niveau 1 — Fondations de l'investissement",
    summary: "Investissement vs trading, DCA, classes d'actifs et premières notions de gestion.",
    modules: [
      {
        id: "l1m1",
        title: "Investissement vs Trading",
        points: [
          "Investir = prendre une position sur plusieurs semaines/mois avec une thèse fondamentale ou technique.",
          "Trader (swing) = profiter de mouvements de prix à court/moyen terme (quelques jours à semaines).",
          "Le spot consiste à acheter l'actif réel (sans levier) — le capital ne peut pas descendre sous zéro.",
          "La margin (faible levier ×2 à ×5) amplifie les gains ET les pertes : la gestion du risque est encore plus critique.",
        ],
        quiz: [
          {
            type: "single",
            q: "Quelle est la principale différence entre investir en spot et utiliser la margin ?",
            options: [
              "Le spot est réservé aux actions, la margin aux cryptos",
              "En spot on ne peut pas perdre plus que son capital ; en margin le levier amplifie les pertes",
              "La margin est toujours plus rentable",
              "Le spot nécessite un broker agréé, pas la margin",
            ],
            correct: [1],
            explain:
              "En spot, la perte maximale est le capital investi. En margin (levier), une baisse amplifiée peut liquider la position avant d'atteindre le fond — d'où l'importance d'un stop-loss strict.",
          },
          {
            type: "boolean",
            q: "Un swing trade peut durer plusieurs semaines.",
            correct: true,
            explain:
              "Oui. Le swing trading vise les mouvements de quelques jours à plusieurs semaines sur des timeframes journaliers ou hebdomadaires.",
          },
        ],
      },
      {
        id: "l1m2",
        title: "Le DCA — Dollar Cost Averaging",
        points: [
          "Le DCA consiste à investir un montant fixe à intervalles réguliers (ex : 100€/semaine), quelle que soit la direction du marché.",
          "Il lisse le prix d'achat moyen et réduit l'impact des variations court terme.",
          "Idéal pour accumuler du Bitcoin, de l'Ethereum ou des ETF US sur le long terme.",
          "Le DCA ne garantit pas de gain mais discipline l'investisseur et évite le 'market timing' émotionnel.",
        ],
        quiz: [
          {
            type: "single",
            q: "Quel est l'objectif principal du DCA ?",
            options: [
              "Acheter uniquement au plus bas",
              "Lisser le prix d'entrée moyen dans le temps",
              "Maximiser le levier",
              "Vendre rapidement pour encaisser",
            ],
            correct: [1],
            explain:
              "Le DCA étale les achats dans le temps pour moyenner le coût d'acquisition, sans chercher à timer le marché.",
          },
          {
            type: "boolean",
            q: "Le DCA est uniquement adapté aux cryptomonnaies.",
            correct: false,
            explain:
              "Non. Le DCA s'applique à tout actif : actions US, ETF, crypto, indices… C'est une méthode, pas un type d'actif.",
          },
        ],
      },
      {
        id: "l1m3",
        title: "Classes d'actifs : Actions US, Crypto Spot, ETF",
        points: [
          "Actions US (NYSE / NASDAQ) : entreprises cotées comme Apple, Nvidia, Tesla. Horizon moyen/long terme.",
          "Crypto spot : Bitcoin, Ethereum — actifs volatils mais liquides, sans levier.",
          "ETF (Exchange Traded Fund) : panier d'actifs (ex. S&P 500) permettant une diversification simple.",
          "Matières premières (Or, Pétrole) : actifs de couverture et de diversification.",
          "Chaque classe a son profil risque/rendement — diversifier réduit le risque global.",
        ],
        quiz: [
          {
            type: "single",
            q: "Qu'est-ce qu'un ETF ?",
            options: [
              "Un token crypto décentralisé",
              "Un fonds coté en bourse répliquant un indice ou un panier d'actifs",
              "Un contrat à terme sur matières premières",
              "Une option d'achat sur action",
            ],
            correct: [1],
            explain:
              "Un ETF réplique la performance d'un indice (S&P 500, NASDAQ 100…) et se négocie en bourse comme une action, offrant une diversification instantanée.",
          },
          {
            type: "multiple",
            q: "Quels actifs peuvent faire l'objet d'un DCA ? (plusieurs réponses)",
            options: ["Bitcoin (BTC)", "Actions Apple (AAPL)", "ETF S&P 500", "Options hebdomadaires"],
            correct: [0, 1, 2],
            explain:
              "Les options courtes échéances sont des instruments spéculatifs, pas adaptés au DCA. BTC, actions et ETF s'y prêtent très bien.",
          },
        ],
      },
    ],
  },
  {
    id: "l2",
    tone: "cyan",
    label: "Niveau 2 — Swing Trading & Analyse",
    summary: "Lire un graphique en swing, analyser les actions US, comprendre la margin à faible levier.",
    modules: [
      {
        id: "l2m1",
        title: "Swing Trading : timeframes et biais",
        points: [
          "Le swing trading s'appuie principalement sur les timeframes Daily (1J) et Weekly (1S).",
          "On définit un biais directionnel (haussier ou baissier) avant de chercher une entrée.",
          "Une position swing dure typiquement de 3 jours à 4 semaines selon le setup.",
          "Patience : on n'entre pas à n'importe quelle heure, on attend la zone et la configuration.",
        ],
        quiz: [
          {
            type: "single",
            q: "Sur quel timeframe se base principalement l'analyse swing ?",
            options: ["1 minute", "15 minutes", "Daily / Weekly", "Ticks"],
            correct: [2],
            explain:
              "Le swing trading utilise le Daily ou le Weekly pour le biais et l'entrée. Les timeframes courts génèrent trop de bruit.",
          },
          {
            type: "boolean",
            q: "En swing trading, une position peut rester ouverte plusieurs semaines.",
            correct: true,
            explain:
              "C'est même l'objectif : capturer un mouvement de fond, pas du scalping. La durée peut aller de quelques jours à un mois.",
          },
        ],
      },
      {
        id: "l2m2",
        title: "Lire les Actions US : secteurs et catalyseurs",
        points: [
          "Les actions US sont regroupées par secteurs : Tech, Santé, Finance, Énergie, Consommation…",
          "Un catalyseur = un événement qui peut déclencher un mouvement fort : earnings (résultats), macro (Fed), news sectorielle.",
          "Le Nasdaq 100 est dominé par la tech (Apple, Nvidia, Microsoft, Meta, Amazon…).",
          "Surveiller les earnings dates avant de prendre une position : la volatilité peut exploser.",
          "Le contexte macro (taux Fed, inflation, emploi) influence toutes les actions US.",
        ],
        quiz: [
          {
            type: "single",
            q: "Qu'est-ce qu'un 'earnings' pour une action US ?",
            options: [
              "Une annonce de dividende",
              "La publication trimestrielle des résultats financiers de l'entreprise",
              "Un rachat d'actions en bourse",
              "Une augmentation de capital",
            ],
            correct: [1],
            explain:
              "Les earnings sont les résultats trimestriels publiés par l'entreprise. Ils peuvent provoquer des mouvements de ±10% ou plus en une nuit.",
          },
          {
            type: "boolean",
            q: "Il est risqué de garder une position swing ouverte pendant une publication d'earnings.",
            correct: true,
            explain:
              "Oui. Les earnings créent une volatilité imprévisible. Un swing trader prudent allège ou sort sa position avant la publication.",
          },
        ],
      },
      {
        id: "l2m3",
        title: "Margin faible levier : règles et gestion",
        points: [
          "La margin permet d'emprunter des fonds au broker pour amplifier sa position.",
          "Faible levier = ×2 à ×5 maximum — au-delà, le risque de liquidation devient trop élevé.",
          "Le stop-loss est OBLIGATOIRE en margin : une position sans stop peut liquider tout le compte.",
          "Règle de base : ne risquer que 1 à 2% du capital par trade en margin.",
          "Un levier ×3 sur une baisse de 33% liquide la position — connaître son seuil de liquidation avant d'entrer.",
        ],
        quiz: [
          {
            type: "single",
            q: "Pourquoi le stop-loss est-il indispensable en margin ?",
            options: [
              "Pour éviter de payer des frais",
              "Car sans stop, une baisse amplifiée par le levier peut tout liquider",
              "Car le broker l'exige légalement",
              "Pour maximiser le gain potentiel",
            ],
            correct: [1],
            explain:
              "En margin, le levier amplifie les pertes. Sans stop-loss, une correction normale peut liquider l'intégralité de la position.",
          },
          {
            type: "scenario",
            q: "Tu utilises un levier ×4 sur une position de 1 000€. De combien le prix peut-il baisser avant liquidation ?",
            options: ["50%", "25%", "10%", "75%"],
            correct: [1],
            explain:
              "Levier ×4 : une baisse de 25% (1/4) suffit à perdre 100% du capital. C'est pourquoi le stop doit être placé bien avant ce niveau.",
          },
        ],
      },
    ],
  },
  {
    id: "l3",
    tone: "violet",
    label: "Niveau 3 — Construction de Portefeuille",
    summary: "Allocation d'actifs, gestion long terme, diversification et psychologie de l'investisseur.",
    modules: [
      {
        id: "l3m1",
        title: "Allocation & Diversification",
        points: [
          "L'allocation = répartir son capital entre plusieurs actifs/classes pour réduire le risque global.",
          "Exemple d'allocation équilibrée : 50% actions US (ETF), 30% crypto spot (BTC/ETH), 20% cash/stables.",
          "La corrélation entre actifs est clé : quand la tech chute, l'or ou les obligations tendent à monter.",
          "Sur-concentration dans un seul actif = risque maximal même si l'actif semble sûr.",
          "Rééquilibrer périodiquement : si un actif explose, reprendre les profits pour maintenir l'allocation cible.",
        ],
        quiz: [
          {
            type: "single",
            q: "Pourquoi diversifier son portefeuille ?",
            options: [
              "Pour maximiser le rendement à court terme",
              "Pour réduire le risque global en évitant de tout mettre sur un seul actif",
              "Car c'est obligatoire légalement",
              "Pour éviter de payer des impôts",
            ],
            correct: [1],
            explain:
              "La diversification réduit l'impact d'une mauvaise performance d'un actif sur l'ensemble du portefeuille — principe fondamental de la gestion de patrimoine.",
          },
          {
            type: "boolean",
            q: "Il faut rééquilibrer son portefeuille de temps en temps.",
            correct: true,
            explain:
              "Oui. Après une forte hausse d'un actif, sa part augmente dans le portefeuille. On reprend les profits pour revenir à l'allocation cible.",
          },
        ],
      },
      {
        id: "l3m2",
        title: "Psychologie de l'investisseur",
        points: [
          "FOMO (Fear Of Missing Out) : peur de rater un mouvement → entrées impulsives, souvent au mauvais moment.",
          "FUD (Fear, Uncertainty, Doubt) : panique à la baisse → ventes émotionnelles qui cristallisent les pertes.",
          "L'investisseur discipliné suit son plan : il achète selon sa thèse, pas selon les réseaux sociaux.",
          "Tenir un journal de trades/investissements permet d'identifier ses biais comportementaux.",
          "La patience est un edge : les meilleurs setups ne se présentent pas chaque jour.",
        ],
        quiz: [
          {
            type: "single",
            q: "Qu'est-ce que le FOMO dans le contexte de l'investissement ?",
            options: [
              "Une stratégie de couverture de portefeuille",
              "La peur de rater un mouvement qui pousse à entrer impulsivement",
              "Un indicateur de volume",
              "Une technique d'analyse fondamentale",
            ],
            correct: [1],
            explain:
              "Le FOMO pousse à acheter après une forte hausse, souvent au pire moment. La discipline consiste à s'en tenir à son plan d'entrée défini à l'avance.",
          },
          {
            type: "scenario",
            q: "Bitcoin vient de faire +40% en une semaine. Tout le monde en parle. Que fais-tu ?",
            options: [
              "J'achète immédiatement pour ne pas rater la suite",
              "Je revois ma thèse, évalue si une entrée est justifiée techniquement, et j'attends une zone de retrait",
              "Je vends mes autres actifs pour tout mettre sur BTC",
              "Je prends un levier maximum pour amplifier",
            ],
            correct: [1],
            explain:
              "Après une forte hausse, le risque/récompense se dégrade. On revient à l'analyse : y a-t-il une zone d'entrée pertinente ? Sinon, on attend.",
          },
        ],
      },
    ],
  },
];

export const CASE_STUDIES = [
  {
    id: "cs-dca-btc",
    asset: "Bitcoin — DCA long terme",
    tag: "Crypto Spot",
    context:
      "Un investisseur décide d'accumuler du Bitcoin sur 12 mois avec 200€/mois, sans chercher à timer le marché. Il investit le 1er de chaque mois, quelle que soit la direction.",
    steps: [
      "Définition du budget mensuel fixe (200€) — argent qu'il peut se permettre d'immobiliser.",
      "Achat automatisé le 1er de chaque mois, spot uniquement (pas de levier).",
      "Pas de panic sell pendant les baisses : la thèse (adoption BTC) reste inchangée.",
      "Revue trimestrielle : la thèse est-elle toujours valide ? Sinon on réévalue.",
    ],
    decision: "Accumulation progressive, spot, sans levier, horizon 1-3 ans.",
    outcome: "Scénario pédagogique : prix moyen lissé, moins affecté par la volatilité court terme.",
    debrief:
      "Le DCA retire l'émotion de l'équation. L'investisseur n'essaie pas de deviner le bas — il accumule régulièrement. La discipline prime sur la prédiction.",
  },
  {
    id: "cs-swing-nvidia",
    asset: "NVIDIA (NVDA) — Swing haussier",
    tag: "Action US",
    context:
      "NVIDIA consolide après un fort rally. Sur le Daily, le prix forme une zone de support claire. La thèse : continuation haussière liée au cycle IA. Catalyseur : prochains earnings dans 6 semaines.",
    steps: [
      "Contexte (Weekly) : tendance haussière confirmée, structure de hauts/bas croissants.",
      "Zone d'entrée (Daily) : retour sur support + volume décroissant en consolidation.",
      "Plan : entrée sur la zone, stop sous le bas de la consolidation, TP partiel sur le précédent plus-haut.",
      "Earnings : position allégée à 50% avant la publication pour limiter la volatilité.",
    ],
    decision: "Achat spot ou margin ×2 sur la zone, risque 1.5% du capital, TP partiel avant earnings.",
    outcome: "Scénario pédagogique : +18% capturé sur 3 semaines, sortie partielle avant earnings.",
    debrief:
      "La clé : le plan était défini AVANT l'entrée. La sortie partielle avant earnings est une règle de gestion, pas une émotion. On applique le processus.",
  },
  {
    id: "cs-margin-eth",
    asset: "Ethereum (ETH) — Margin faible levier",
    tag: "Crypto Margin",
    context:
      "ETH rebondit sur un support majeur hebdomadaire. L'investisseur veut amplifier le mouvement avec un levier ×3 tout en maîtrisant son risque.",
    steps: [
      "Analyse (Weekly) : support mensuel, volume acheteur en hausse.",
      "Calcul du seuil de liquidation : avec ×3, une baisse de 33% liquide. Stop placé à -8%.",
      "Taille de position : 1% du capital risqué (stop à -8% × levier = taille ajustée).",
      "Gestion : si +15% de profit, déplacement du stop au prix d'entrée (stop breakeven).",
    ],
    decision: "Position margin ×3, stop strict à -8%, taille calibrée pour ne risquer que 1% du capital.",
    outcome: "Scénario pédagogique : +22% en 10 jours, stop déplacé, position fermée sur TP.",
    debrief:
      "En margin, le sizing est tout. Un levier ×3 avec un stop à -8% risque 24% de la mise — calibrer la taille pour ramener ça à 1% du capital total. C'est ça la gestion.",
  },
];
