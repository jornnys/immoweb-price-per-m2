(() => {
  "use strict";

  const BADGE_CLASS = "immoweb-ppm2-badge";
  const PROCESSED_ATTR = "data-ppm2-processed";

  // --- Parsing (duplicated from src/parsing.js for content script context) ---

  function parsePrice(text) {
    if (!text || text.includes(" - ") || text.includes("\u2013") || text.includes("+")) return null;
    // Match the first price-like sequence (digits with . or , or space separators)
    const match = text.match(/[\d][\d.,\s]*/);
    if (!match) return null;
    const digits = match[0].replace(/\D/g, "");
    const value = parseInt(digits, 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function parseSurface(text) {
    if (!text) return null;
    const match = text.match(/([\d,.]+)\s*m²/);
    if (!match) return null;
    const value = parseInt(match[1].replace(/[.,]/g, ""), 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function calculatePricePerM2(price, surface) {
    if (!price || !surface || surface === 0) return null;
    return Math.round(price / surface);
  }

  function formatPricePerM2(value) {
    if (!Number.isFinite(value)) return null;
    const formatted = new Intl.NumberFormat("de-BE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
    return `${formatted}/m²`;
  }

  // --- DOM helpers ---

  function createBadge(text) {
    const badge = document.createElement("span");
    badge.className = BADGE_CLASS;
    badge.textContent = text;
    return badge;
  }

  // --- Search results page ---

  function processSearchCard(card) {
    if (card.hasAttribute(PROCESSED_ATTR)) return;
    card.setAttribute(PROCESSED_ATTR, "true");

    const priceEl = card.querySelector(
      '.card--result__price .resizable-text[aria-hidden="true"]'
    );
    if (!priceEl) return;

    const price = parsePrice(priceEl.textContent);
    if (!price) return;

    const propInfo = card.querySelector(".card__information--property");
    if (!propInfo) return;

    const surface = parseSurface(propInfo.textContent);
    if (!surface) return;

    const ppm2 = calculatePricePerM2(price, surface);
    if (!ppm2) return;

    const label = formatPricePerM2(ppm2);
    if (!label) return;

    const badge = createBadge(label);
    // XL cards have .card--result__price-container, medium cards don't
    const priceContainer = card.querySelector(".card--result__price-container");
    const priceP = card.querySelector(".card--result__price");
    if (priceContainer) {
      priceContainer.appendChild(badge);
    } else if (priceP) {
      priceP.insertAdjacentElement("afterend", badge);
    }
  }

  function handleSearchResults() {
    document
      .querySelectorAll(
        `article[class*="card--result"]:not([${PROCESSED_ATTR}])`
      )
      .forEach(processSearchCard);
  }

  // --- Detail page ---

  function injectDetailBadge(price, surface) {
    if (document.querySelector(`.${BADGE_CLASS}`)) return;

    const ppm2 = calculatePricePerM2(price, surface);
    if (!ppm2) return;

    const label = formatPricePerM2(ppm2);
    if (!label) return;

    const badge = createBadge(label);
    badge.classList.add("immoweb-ppm2-badge--detail");

    const headerPrice = document.querySelector(".classified__price");
    if (headerPrice) {
      headerPrice.appendChild(badge);
    }
  }

  function handleDetailPage() {
    if (document.querySelector(`.${BADGE_CLASS}`)) return;

    // Content scripts run in an isolated world and can't access
    // window.classified directly. Inject a script into the page context
    // to read the data and pass it back via a custom DOM event.
    const script = document.createElement("script");
    script.textContent = `
      (function() {
        var c = window.classified;
        if (!c) return;
        var price = c.price && c.price.mainValue;
        var surface = c.property && c.property.netHabitableSurface;
        if (price && surface) {
          document.dispatchEvent(new CustomEvent("__ppm2_data__", {
            detail: { price: price, surface: surface }
          }));
        }
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
  }

  // Listen for data from the injected page-context script
  document.addEventListener("__ppm2_data__", (e) => {
    const { price, surface } = e.detail;
    injectDetailBadge(price, surface);
  });

  // --- Main ---
  // Detect page type by DOM presence rather than URL patterns,
  // since immoweb uses different paths per language (en/nl/fr).

  function isSearchPage() {
    return document.querySelectorAll('article[class*="card--result"]').length > 0;
  }

  function isDetailPage() {
    return !!document.querySelector(".classified__price");
  }

  function run() {
    if (isSearchPage()) {
      handleSearchResults();
    } else if (isDetailPage()) {
      handleDetailPage();
    }
  }

  // Run on initial load
  run();

  // Observe DOM changes for infinite scroll / SPA navigation
  const observer = new MutationObserver(() => {
    run();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
