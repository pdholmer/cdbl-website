import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyTheme } from "@/lib/theme";

/** Applies the signed-in look and the saved Light / Dark / Device mode. */
export const ThemeScope = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    applyTheme(pathname);
    const reapply = () => applyTheme(window.location.pathname);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", reapply);
    window.addEventListener("cdbl-theme-change", reapply);
    window.addEventListener("storage", reapply);
    return () => {
      mq.removeEventListener("change", reapply);
      window.removeEventListener("cdbl-theme-change", reapply);
      window.removeEventListener("storage", reapply);
    };
  }, [pathname]);

  return null;
};

export default ThemeScope;
