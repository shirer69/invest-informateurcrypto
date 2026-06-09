const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconPortfolio = (p) => (
  <svg {...base} {...p}>
    <path d="M3 14c3-6 6-3 9-7s5-3 9-1" />
    <path d="M3 20h18" />
    <path d="M3 20V9M21 20v-7" />
  </svg>
);

export const IconSwing = (p) => (
  <svg {...base} {...p}>
    <path d="M3 12h3l3 6 6-12 3 6h3" />
  </svg>
);

export const IconThesis = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

export const IconAlert = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3a6 6 0 0 0-6 6c0 5-2 6-2 6h16s-2-1-2-6a6 6 0 0 0-6-6Z" />
    <path d="M10.5 20a1.8 1.8 0 0 0 3 0" />
  </svg>
);

export const IconCycle = (p) => (
  <svg {...base} {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
    <path d="M20 4v4h-4" />
    <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
    <path d="M4 20v-4h4" />
  </svg>
);

export const IconVault = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="12" cy="12" r="3.4" />
    <path d="M12 8.6V6M12 18v-2.6M15.4 12H18M6 12h2.6" />
  </svg>
);

export const IconArrow = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconCheck = (p) => (
  <svg {...base} {...p} strokeWidth={1.6}>
    <path d="M4 12.5 9 17 20 6" />
  </svg>
);

export const IconCross = (p) => (
  <svg {...base} {...p} strokeWidth={1.6}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconPlus = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconLinkedin = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" />
  </svg>
);
