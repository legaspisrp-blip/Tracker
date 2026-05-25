// ============================================================================
// theme.jsx — Variant A (Terminal) + Variant B (Quiet Ledger), light/dark
// ============================================================================

const PALETTES = {
  "a-light": {
    bg: "#f3f1ea",
    panel: "#fbfaf5",
    panelAlt: "#efece3",
    text: "#0c0c0a",
    muted: "#6e6c63",
    faint: "#9b9890",
    border: "#d8d4c5",
    borderHi: "#b3ad9a",
    grid: "#e6e2d3",
    accent: "oklch(58% 0.18 145)",
    accentSoft: "oklch(58% 0.18 145 / 0.10)",
    up: "oklch(58% 0.18 145)",
    down: "oklch(56% 0.22 27)",
    warn: "oklch(70% 0.16 75)",
    chip: "#e8e4d4"
  },
  "a-dark": {
    bg: "#0a0a0a",
    panel: "#111111",
    panelAlt: "#0e0e0e",
    text: "#ebebe6",
    muted: "#8a8a82",
    faint: "#5e5e58",
    border: "#1f1f1c",
    borderHi: "#2e2e29",
    grid: "#181815",
    accent: "oklch(76% 0.22 148)",
    accentSoft: "oklch(76% 0.22 148 / 0.14)",
    up: "oklch(76% 0.22 148)",
    down: "oklch(68% 0.24 28)",
    warn: "oklch(78% 0.18 80)",
    chip: "#1a1a17"
  },
  "b-light": {
    bg: "#f1ece4",
    panel: "#fbf7ef",
    panelAlt: "#e9e3d7",
    text: "#1d1c19",
    muted: "#736e63",
    faint: "#a39d8e",
    border: "#dfd8c8",
    borderHi: "#c1b8a3",
    grid: "#ebe5d6",
    accent: "oklch(58% 0.14 40)",
    accentSoft: "oklch(58% 0.14 40 / 0.12)",
    up: "oklch(48% 0.10 155)",
    down: "oklch(54% 0.16 30)",
    warn: "oklch(64% 0.14 70)",
    chip: "#e6dfcd"
  },
  "b-dark": {
    bg: "#14140f",
    panel: "#1c1c16",
    panelAlt: "#181812",
    text: "#ece7da",
    muted: "#9a9484",
    faint: "#6a655a",
    border: "#26261e",
    borderHi: "#34342a",
    grid: "#1f1f18",
    accent: "oklch(72% 0.13 42)",
    accentSoft: "oklch(72% 0.13 42 / 0.16)",
    up: "oklch(72% 0.13 155)",
    down: "oklch(64% 0.18 30)",
    warn: "oklch(76% 0.14 75)",
    chip: "#22221b"
  }
};
const VARIANT_META = {
  a: {
    radius: "2px",
    fontDisplay: '"Geist", "Inter", sans-serif',
    fontUI: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", ui-monospace, monospace',
    fontNum: '"JetBrains Mono", ui-monospace, monospace',
    tracking: "-0.01em",
    displayWeight: 600
  },
  b: {
    radius: "10px",
    fontDisplay: '"Fraunces", Georgia, serif',
    fontUI: '"Inter", system-ui, sans-serif',
    fontMono: '"IBM Plex Mono", ui-monospace, monospace',
    fontNum: '"IBM Plex Mono", ui-monospace, monospace',
    tracking: "-0.02em",
    displayWeight: 500
  }
};
function applyTheme(variant, mode, accent) {
  const p = PALETTES[`${variant}-${mode}`];
  const m = VARIANT_META[variant];
  return {
    "--bg": p.bg,
    "--panel": p.panel,
    "--panel-alt": p.panelAlt,
    "--text": p.text,
    "--muted": p.muted,
    "--faint": p.faint,
    "--border": p.border,
    "--border-hi": p.borderHi,
    "--grid": p.grid,
    "--accent": accent || p.accent,
    "--accent-soft": p.accentSoft,
    "--up": p.up,
    "--down": p.down,
    "--warn": p.warn,
    "--chip": p.chip,
    "--radius": m.radius,
    "--font-ui": m.fontUI,
    "--font-mono": m.fontMono,
    "--font-display": m.fontDisplay,
    "--font-num": m.fontNum,
    "--tracking": m.tracking,
    "--display-weight": m.displayWeight
  };
}
Object.assign(window, {
  applyTheme,
  PALETTES,
  VARIANT_META
});