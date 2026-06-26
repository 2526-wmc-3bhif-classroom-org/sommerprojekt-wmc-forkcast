export type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "forkcast-theme";

// Two daisyUI themes are defined ("light", "dark"). "system" resolves to one of
// them via the OS preference and keeps following it while selected.
export function useTheme() {
  const choice = useState<ThemeChoice>("theme", () => "system");

  function resolve(c: ThemeChoice): "light" | "dark" {
    if (c !== "system") return c;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply() {
    document.documentElement.setAttribute("data-theme", resolve(choice.value));
  }

  function setTheme(c: ThemeChoice) {
    choice.value = c;
    localStorage.setItem(STORAGE_KEY, c);
    apply();
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeChoice | null;
    if (saved) choice.value = saved;
    apply();
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (choice.value === "system") apply();
      });
  }

  return { choice, setTheme, init, resolve };
}
