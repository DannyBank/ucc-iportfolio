/**
 * Light/dark theme toggle.
 * The initial theme is already applied by the inline script in <head>
 * (to avoid a flash of the wrong theme before CSS loads). This file just
 * wires up the button to flip html[data-theme] and remember the choice.
 */
(function () {
  "use strict";

  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", function () {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
})();
