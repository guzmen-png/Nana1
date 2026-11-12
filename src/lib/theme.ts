export type ThemeId =
  | "mist-teal"
  | "dawn-ink"
  | "olive-grove"
  | "ocean-slate"
  | "maple-ink"
  | "charcoal-gold";

export type ThemeTokens = {
  id: ThemeId;
  label: string;
  swatch: string;
  ink: string;
  inkSoft: string;
  mist: string;
  paper: string;
  accent: string;
  accentDeep: string;
  glowA: string;
  glowB: string;
  foam: string;
  line: string;
  themeColor: string;
};

export const THEMES: ThemeTokens[] = [
  {
    id: "mist-teal",
    label: "안개 티일",
    swatch: "#0F6B5C",
    ink: "#18212B",
    inkSoft: "#4A5A68",
    mist: "#D7E5EE",
    paper: "#F3F7FA",
    accent: "#0F6B5C",
    accentDeep: "#0A4F44",
    glowA: "#C9DCE8",
    glowB: "#E7F0E8",
    foam: "rgba(255, 255, 255, 0.72)",
    line: "rgba(24, 33, 43, 0.1)",
    themeColor: "#D7E5EE",
  },
  {
    id: "dawn-ink",
    label: "새벽 잉크",
    swatch: "#1F4E79",
    ink: "#152033",
    inkSoft: "#51607A",
    mist: "#D9E3F0",
    paper: "#F2F5F9",
    accent: "#1F4E79",
    accentDeep: "#163A5C",
    glowA: "#C5D4E8",
    glowB: "#E4ECF5",
    foam: "rgba(255, 255, 255, 0.74)",
    line: "rgba(21, 32, 51, 0.1)",
    themeColor: "#D9E3F0",
  },
  {
    id: "olive-grove",
    label: "올리브 숲",
    swatch: "#5C6B2F",
    ink: "#1C2414",
    inkSoft: "#5A6450",
    mist: "#E2E8D8",
    paper: "#F5F7F0",
    accent: "#5C6B2F",
    accentDeep: "#3F4A20",
    glowA: "#D5DEC4",
    glowB: "#E8EFE0",
    foam: "rgba(255, 255, 255, 0.72)",
    line: "rgba(28, 36, 20, 0.1)",
    themeColor: "#E2E8D8",
  },
  {
    id: "ocean-slate",
    label: "바다 슬레이트",
    swatch: "#2F6F7A",
    ink: "#142428",
    inkSoft: "#4E646B",
    mist: "#D5E7EA",
    paper: "#F1F7F8",
    accent: "#2F6F7A",
    accentDeep: "#1F4F57",
    glowA: "#C3DCE1",
    glowB: "#E3F0F1",
    foam: "rgba(255, 255, 255, 0.72)",
    line: "rgba(20, 36, 40, 0.1)",
    themeColor: "#D5E7EA",
  },
  {
    id: "maple-ink",
    label: "단풍 잉크",
    swatch: "#8B4513",
    ink: "#2A1A12",
    inkSoft: "#6A5346",
    mist: "#EADFD4",
    paper: "#F8F3EE",
    accent: "#8B4513",
    accentDeep: "#5C2E0C",
    glowA: "#E0D0C0",
    glowB: "#F0E7DE",
    foam: "rgba(255, 255, 255, 0.7)",
    line: "rgba(42, 26, 18, 0.1)",
    themeColor: "#EADFD4",
  },
  {
    id: "charcoal-gold",
    label: "먹빛 골드",
    swatch: "#8A6A2F",
    ink: "#1A1C1E",
    inkSoft: "#5C6168",
    mist: "#E4E5E7",
    paper: "#F5F5F4",
    accent: "#8A6A2F",
    accentDeep: "#5E4820",
    glowA: "#D5D6D8",
    glowB: "#EAE8E0",
    foam: "rgba(255, 255, 255, 0.72)",
    line: "rgba(26, 28, 30, 0.12)",
    themeColor: "#E4E5E7",
  },
];

export const DEFAULT_THEME_ID: ThemeId = "mist-teal";
export const THEME_STORAGE_KEY = "nanal.theme";

export function getTheme(id: string | null | undefined): ThemeTokens {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(theme: ThemeTokens) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.style.setProperty("--ink", theme.ink);
  root.style.setProperty("--ink-soft", theme.inkSoft);
  root.style.setProperty("--mist", theme.mist);
  root.style.setProperty("--paper", theme.paper);
  root.style.setProperty("--teal", theme.accent);
  root.style.setProperty("--teal-deep", theme.accentDeep);
  root.style.setProperty("--glow-a", theme.glowA);
  root.style.setProperty("--glow-b", theme.glowB);
  root.style.setProperty("--foam", theme.foam);
  root.style.setProperty("--line", theme.line);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme.themeColor);
}

export function loadStoredThemeId(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;
  try {
    return getTheme(localStorage.getItem(THEME_STORAGE_KEY)).id;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function saveThemeId(id: ThemeId) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // ignore quota / private mode
  }
}
