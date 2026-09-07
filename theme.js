(() => {
  const storageKey = "personal-cv-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const root = document.documentElement;
  const labels = { system: "System", light: "Light", dark: "Dark" };
  const colors = { light: "#ffffff", dark: "#171717" };
  const validPreference = (value) =>
    value === "light" || value === "dark" ? value : "system";
  let preference = "system";

  try {
    preference = validPreference(localStorage.getItem(storageKey));
  } catch {
    // Theme selection still works when browser storage is unavailable.
  }

  function applyTheme() {
    root.dataset.theme = preference;
    const resolved = preference === "system"
      ? (systemTheme.matches ? "dark" : "light")
      : preference;

    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      const theme = preference === "system"
        ? (meta.media.includes("dark") ? "dark" : "light")
        : preference;
      meta.content = colors[theme];
    });

    const button = document.getElementById("theme-button");
    if (button) {
      document.getElementById("theme-label").textContent = `Theme: ${labels[preference]}`;
      button.title = `Color theme: ${labels[preference]} (currently ${resolved}). Choose appearance.`;
      document.querySelectorAll('input[name="theme"]').forEach((input) => {
        input.checked = input.value === preference;
      });
    }
  }

  // This script runs in the head so a saved choice is applied before first paint.
  applyTheme();
  systemTheme.addEventListener("change", applyTheme);

  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) {
      preference = validPreference(event.newValue);
      applyTheme();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const control = document.querySelector(".theme-control");
    const button = document.getElementById("theme-button");
    const options = document.getElementById("theme-options");

    function closeOptions(restoreFocus = false) {
      options.hidden = true;
      button.setAttribute("aria-expanded", "false");
      if (restoreFocus) button.focus();
    }

    button.addEventListener("click", () => {
      const opening = options.hidden;
      options.hidden = !opening;
      button.setAttribute("aria-expanded", String(opening));
      if (opening) options.querySelector("input:checked").focus();
    });

    options.addEventListener("change", (event) => {
      preference = validPreference(event.target.value);
      try {
        if (preference === "system") localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, preference);
      } catch {
        // Apply the choice for this page even if it cannot be remembered.
      }
      applyTheme();
    });

    control.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !options.hidden) {
        event.preventDefault();
        closeOptions(true);
      }
    });

    control.addEventListener("focusout", (event) => {
      // Label clicks can briefly move focus to the body before their radio.
      // Outside pointer clicks are handled separately below.
      if (event.relatedTarget && !control.contains(event.relatedTarget)) closeOptions();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!control.contains(event.target)) closeOptions();
    });

    applyTheme();
    control.hidden = false;
  });
})();
