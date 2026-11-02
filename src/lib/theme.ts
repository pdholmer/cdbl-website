// Night Game Builder look: signed-in pages only, mode saved on this device.
// Keep SIGNED_IN_PREFIXES in sync with the pre-paint script in index.html.
export type ThemePref = "light" | "dark" | "system";

export const THEME_KEY = "cdbl-theme";
export const SIGNED_IN_PREFIXES = ["/household", "/two-step", "/training", "/coach", "/account", "/admin", "/login", "/reset-password"];

export const isSignedInPath = (path: string) =>
  path !== "/admin/login" && SIGNED_IN_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

export const getThemePref = (): ThemePref => {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
};

export const setThemePref = (pref: ThemePref) => {
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    /* storage unavailable: choice lasts for this visit only */
  }
  window.dispatchEvent(new Event("cdbl-theme-change"));
};

export const resolveDark = (pref: ThemePref) =>
  pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

export const applyTheme = (path: string) => {
  const root = document.documentElement;
  const ngb = isSignedInPath(path);
  root.classList.toggle("ngb", ngb);
  root.classList.toggle("dark", ngb && resolveDark(getThemePref()));
};
