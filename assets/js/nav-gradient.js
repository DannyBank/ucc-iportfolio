/**
 * Per-page navbar gradient.
 *
 * Every page key here matches the `data-page` attribute used by the
 * navmenu links and the `page` argument loader.js passes to loadPage().
 * Adding a new page to the site only ever requires one new entry here.
 *
 * The actual crossfade is done with two stacked layers inside #header
 * (.header-bg-base / .header-bg-overlay, see nav-gradient.css): the idle
 * layer is given the next gradient, then both layers' `.is-active` class
 * is toggled in the same frame so one fades out while the other fades in.
 * That avoids the abrupt "pop" a plain background-color/image swap would
 * cause, since gradients can't be transitioned directly by the browser.
 *
 * Exposed as window.updateNavGradient so loader.js can call it after every
 * page load, the same way it already does for initTyped / initSkillsAnimation.
 */
(function () {
  "use strict";

  const PAGE_GRADIENTS = {
    home: "linear-gradient(160deg, #020024 0%, #216682 30%, #00D4FF 100%)",
    aboutme: "linear-gradient(160deg, #0A1F44 0%, #3454D1 40%, #7B61FF 100%)",
    projects: "linear-gradient(160deg, #1E3A5F 0%, #1E7A6E 45%, #2DD4BF 100%)",
    contact: "linear-gradient(160deg, #0F172A 0%, #334155 45%, #38BDF8 100%)"
  };

  const DEFAULT_PAGE = "home";
  const CROSSFADE_MS = 900; // keep in sync with the transition-duration in nav-gradient.css

  const header = document.querySelector("#header");
  const layers = header ? header.querySelectorAll(".header-bg-layer") : [];

  // [activeLayer, idleLayer] - swapped after every completed crossfade.
  let [activeLayer, idleLayer] = layers;
  let currentPage = DEFAULT_PAGE;
  let fadeTimer = null;

  function updateNavGradient(page) {
    if (!header || !activeLayer || !idleLayer) return;

    const gradient = PAGE_GRADIENTS[page] || PAGE_GRADIENTS[DEFAULT_PAGE];

    // Keep the CSS variable in sync too, for anything else that reads
    // "the current page gradient" outside of the layer elements.
    header.style.setProperty("--header-gradient", gradient);

    if (page === currentPage) return; // already showing this gradient
    currentPage = page;

    clearTimeout(fadeTimer);

    idleLayer.style.background = gradient;
    // Force a reflow so the new background is registered before the
    // opacity transition starts, otherwise the browser can coalesce both
    // changes and skip straight to the end state instead of animating.
    void idleLayer.offsetWidth;

    idleLayer.classList.add("is-active");
    activeLayer.classList.remove("is-active");

    fadeTimer = setTimeout(() => {
      activeLayer.style.background = ""; // now fully transparent, safe to clear
      [activeLayer, idleLayer] = [idleLayer, activeLayer];
    }, CROSSFADE_MS);
  }

  window.updateNavGradient = updateNavGradient;
})();
