// Données de DÉMONSTRATION (aucune connexion Kraken live, aucun ordre réel).
// Contenu éducatif / illustratif uniquement.

export const KPIS = [
  { label: "Equity (démo)", value: "24 380 €", sub: "+3,1 % / 30 j", up: true },
  { label: "P&L 30 jours", value: "+742 €", sub: "32 trades", up: true },
  { label: "Drawdown max", value: "-6,8 %", sub: "sur la période", up: false },
  { label: "Win rate", value: "61 %", sub: "taux de réussite" },
  { label: "R:R moyen", value: "1 : 2,4", sub: "risque / rendement" },
  { label: "Exposition", value: "Faible", sub: "levier maîtrisé" },
];

export const POSITIONS = [
  { asset: "BTC/USD", side: "Long", entry: 61240, last: 63110, size: "0,12", pnlPct: 3.05 },
  { asset: "ETH/USD", side: "Long", entry: 3380, last: 3422, size: "1,4", pnlPct: 1.24 },
  { asset: "WTI", side: "Short", entry: 78.9, last: 77.2, size: "5", pnlPct: 2.15 },
  { asset: "NAS100", side: "Long", entry: 19840, last: 19710, size: "0,5", pnlPct: -0.65 },
  { asset: "SOL/USD", side: "Long", entry: 142.5, last: 148.9, size: "8", pnlPct: 4.49 },
];

// Feed "intelligence" structuré (issu, à terme, de la classification IA des posts)
export const SIGNALS = [
  {
    asset: "BTC",
    type: "signal",
    bias: "long",
    confidence: 0.78,
    context: "Réintégration au-dessus de la borne basse après balayage de liquidité.",
    time: "09:12",
  },
  {
    asset: "WTI",
    type: "analysis",
    bias: "short",
    confidence: 0.64,
    context: "Rejet d'une résistance hebdomadaire, momentum en ralentissement.",
    time: "08:40",
  },
  {
    asset: "NASDAQ",
    type: "macro",
    bias: "neutral",
    confidence: 0.5,
    context: "Volatilité post-publication, structure encore illisible — prudence.",
    time: "Hier",
  },
  {
    asset: "—",
    type: "education",
    bias: "neutral",
    confidence: 0.0,
    context: "Rappel : pas de confirmation = pas de trade. La discipline prime.",
    time: "Hier",
  },
];

// Rendements mensuels (démo) pour le graphe Analytics
export const MONTHLY = [
  { m: "Jan", r: 4.2 },
  { m: "Fév", r: -1.8 },
  { m: "Mar", r: 6.1 },
  { m: "Avr", r: 2.4 },
  { m: "Mai", r: -2.1 },
  { m: "Juin", r: 3.3 },
  { m: "Juil", r: 1.2 },
  { m: "Août", r: 5.0 },
  { m: "Sep", r: -0.9 },
  { m: "Oct", r: 3.8 },
];

export const RISK = [
  { label: "Volatilité (30j)", value: "Modérée" },
  { label: "Drawdown courant", value: "-2,1 %" },
  { label: "Ratio de Sharpe (démo)", value: "1,8" },
  { label: "Plus longue série gagnante", value: "7 trades" },
  { label: "Perte max sur un trade", value: "-1,0 % du capital" },
  { label: "Levier moyen", value: "≤ 2x" },
];
