/* Purani Rasoi Shopify theme interactions */

window.PuraniRasoi = window.PuraniRasoi || {};
window.PuraniRasoi.updateCartUI = function updateCartUI(cart) {
  const n = (cart && cart.item_count) || 0;
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = String(n);
    el.classList.toggle("is-empty", n <= 0);
  });
  document.querySelectorAll("[data-header-cart], .dh-tools__cart").forEach((el) => {
    el.classList.toggle("is-empty", n <= 0);
  });
};

window.PuraniRasoi.openCartDrawer = async function openCartDrawer() {
  await window.PuraniRasoi.refreshCartDrawer?.();
  const drawer = document.getElementById("CartDrawer");
  if (!drawer) return;
  drawer.hidden = false;
  drawer.removeAttribute("hidden");
  requestAnimationFrame(() => {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
};

window.PuraniRasoi.closeCartDrawer = function closeCartDrawer() {
  const drawer = document.getElementById("CartDrawer");
  if (!drawer) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  window.setTimeout(() => {
    if (!drawer.classList.contains("is-open")) drawer.hidden = true;
  }, 560);
};

window.PuraniRasoi.refreshCartDrawer = async function refreshCartDrawer() {
  try {
    const root = (window.Shopify && Shopify.routes && Shopify.routes.root) || "/";
    const res = await fetch(`${root}?sections=cart-drawer`);
    if (!res.ok) return;
    const data = await res.json();
    const html = data["cart-drawer"];
    if (!html) return;
    const current = document.getElementById("shopify-section-cart-drawer");
    const wasOpen = document.getElementById("CartDrawer")?.classList.contains("is-open");
    if (current) {
      current.outerHTML = html;
    } else {
      document.body.insertAdjacentHTML("beforeend", html);
    }
    const drawer = document.getElementById("CartDrawer");
    if (drawer && wasOpen) {
      drawer.hidden = false;
      drawer.removeAttribute("hidden");
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
    }
  } catch (e) {
    /* ignore refresh errors */
  }
};

(function () {
  const openBtn = document.getElementById("menu-open");
  const closeBtn = document.getElementById("menu-close");
  const mobileNav = document.getElementById("mobile-nav");
  const shopToggle = document.getElementById("shop-toggle");
  const shopMenu = document.getElementById("shop-menu");

  function setMenu(open) {
    if (!mobileNav) return;
    mobileNav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  openBtn?.addEventListener("click", () => setMenu(true));
  closeBtn?.addEventListener("click", () => setMenu(false));
  mobileNav?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );

  shopToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = shopToggle.getAttribute("aria-expanded") === "true";
    shopToggle.setAttribute("aria-expanded", String(!open));
    if (shopMenu) shopMenu.hidden = open;
  });

  document.addEventListener("click", () => {
    if (!shopToggle || !shopMenu) return;
    shopToggle.setAttribute("aria-expanded", "false");
    shopMenu.hidden = true;
  });
  shopMenu?.addEventListener("click", (e) => e.stopPropagation());

  const qtyInput = document.getElementById("Quantity-product");
  const qtySpan = document.getElementById("qty-value");
  function syncQtyDisplay() {
    if (qtyInput && qtySpan) qtySpan.textContent = qtyInput.value;
  }
  document.getElementById("qty-minus")?.addEventListener("click", () => {
    if (!qtyInput) return;
    qtyInput.value = String(Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1));
    syncQtyDisplay();
  });
  document.getElementById("qty-plus")?.addEventListener("click", () => {
    if (!qtyInput) return;
    qtyInput.value = String((parseInt(qtyInput.value, 10) || 1) + 1);
    syncQtyDisplay();
  });

  const mainImg = document.getElementById("pdp-main-img");
  document.querySelectorAll("[data-thumb]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-thumb");
      if (!src || !mainImg) return;
      mainImg.src = src;
      document.querySelectorAll("[data-thumb]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  document.querySelectorAll("[data-option-value]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-option-value");
      const position = btn.getAttribute("data-option-position") || "1";
      const select = document.querySelector(
        `select[data-option-position="${position}"], #Option-${position}, [name="options[${btn.getAttribute("data-option-name")}]"]`
      );
      if (select && value) {
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      btn.parentElement?.querySelectorAll("[data-option-value]").forEach((b) =>
        b.classList.remove("is-active")
      );
      btn.classList.add("is-active");
    });
  });

  document.querySelectorAll("form[data-product-form]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"], .pdp-add, .bs-card__btn');
      const fd = new FormData(form);
      try {
        if (btn) {
          btn.disabled = true;
          btn.dataset.label = btn.innerHTML;
          btn.textContent = "Adding…";
        }
        const res = await fetch("/cart/add.js", {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Add failed");
        const cart = await fetch("/cart.js").then((r) => r.json());
        window.PuraniRasoi?.updateCartUI?.(cart);
        window.PuraniRasoi?.openCartDrawer?.();
        if (btn) {
          btn.textContent = "Added";
          setTimeout(() => {
            btn.innerHTML = btn.dataset.label || "Add to Cart";
            btn.disabled = false;
          }, 1200);
        }
      } catch (err) {
        form.submit();
      }
    });
  });

  document.querySelectorAll("[data-add-variant]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-add-variant");
      if (!id) return;
      const label = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = "Adding…";
      try {
        await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ id: Number(id), quantity: 1 }),
        });
        const cart = await fetch("/cart.js").then((r) => r.json());
        window.PuraniRasoi?.updateCartUI?.(cart);
        window.PuraniRasoi?.openCartDrawer?.();
        btn.textContent = "Added";
        setTimeout(() => {
          btn.innerHTML = label;
          btn.disabled = false;
        }, 1200);
      } catch (e) {
        window.location.href = `/cart/add?id=${id}&quantity=1`;
      }
    });
  });

  /* Cart drawer: open / close / qty / remove / upsell (event delegation) */
  async function changeCartLine(key, quantity) {
    const res = await fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: key, quantity }),
    });
    if (!res.ok) throw new Error("cart change failed");
    const cart = await res.json();
    window.PuraniRasoi?.updateCartUI?.(cart);
    await window.PuraniRasoi?.refreshCartDrawer?.();
    return cart;
  }

  document.addEventListener("click", async (e) => {
    const openEl = e.target.closest("[data-cart-drawer-open]");
    if (openEl) {
      e.preventDefault();
      window.PuraniRasoi?.openCartDrawer?.();
      return;
    }

    if (e.target.closest("[data-cart-drawer-close]")) {
      e.preventDefault();
      window.PuraniRasoi?.closeCartDrawer?.();
      return;
    }

    const qtyBtn = e.target.closest("[data-cart-qty]");
    if (qtyBtn) {
      e.preventDefault();
      const key = qtyBtn.getAttribute("data-key");
      const delta = parseInt(qtyBtn.getAttribute("data-cart-qty"), 10) || 0;
      const row = qtyBtn.closest("[data-cart-item]");
      const current = parseInt(row?.querySelector(".pr-cart-drawer__qty span")?.textContent || "1", 10) || 1;
      const next = Math.max(0, current + delta);
      try {
        await changeCartLine(key, next);
      } catch (err) {
        /* keep UI */
      }
      return;
    }

    const removeBtn = e.target.closest("[data-cart-remove]");
    if (removeBtn) {
      e.preventDefault();
      try {
        await changeCartLine(removeBtn.getAttribute("data-key"), 0);
      } catch (err) {
        /* keep UI */
      }
      return;
    }

    const upsellBtn = e.target.closest("[data-cart-upsell-add]");
    if (upsellBtn) {
      e.preventDefault();
      const id = upsellBtn.getAttribute("data-variant-id");
      if (!id) return;
      const label = upsellBtn.innerHTML;
      upsellBtn.disabled = true;
      upsellBtn.textContent = "Adding…";
      try {
        await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ id: Number(id), quantity: 1 }),
        });
        const cart = await fetch("/cart.js").then((r) => r.json());
        window.PuraniRasoi?.updateCartUI?.(cart);
        await window.PuraniRasoi?.refreshCartDrawer?.();
      } catch (err) {
        upsellBtn.innerHTML = label;
        upsellBtn.disabled = false;
      }
      return;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const drawer = document.getElementById("CartDrawer");
    if (drawer?.classList.contains("is-open")) {
      window.PuraniRasoi?.closeCartDrawer?.();
    }
  });

  /* Customer Love carousel — autoplay, pause on hover */
  document.querySelectorAll("[data-love-carousel]").forEach((root) => {
    const slides = Array.from(root.querySelectorAll("[data-love-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-love-dot]"));
    if (slides.length < 2) return;

    let index = Math.max(
      0,
      slides.findIndex((s) => s.classList.contains("is-active"))
    );
    const interval = Math.max(2500, parseInt(root.getAttribute("data-interval"), 10) || 4000);
    let timer = null;

    function show(i) {
      const prev = index;
      index = ((i % slides.length) + slides.length) % slides.length;
      if (prev !== index && slides[prev]) {
        slides[prev].classList.add("is-exit");
        window.setTimeout(() => slides[prev].classList.remove("is-exit"), 450);
      }
      slides.forEach((slide, n) => {
        const active = n === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        slide.removeAttribute("hidden");
      });
      dots.forEach((dot, n) => {
        const active = n === index;
        dot.classList.toggle("is-active", active);
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function next() {
      show(index + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, interval);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const i = parseInt(dot.getAttribute("data-love-dot"), 10);
        if (Number.isNaN(i)) return;
        show(i);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", (e) => {
      if (!root.contains(e.relatedTarget)) start();
    });

    show(index);
    start();
  });

  /* Shop toolbar: filter drawer, themed sort, grid/list view */
  const shopFilters = document.getElementById("shop-filters");
  const shopFilterBtns = document.querySelectorAll("[data-shop-filter]");
  const productGrid = document.getElementById("product-grid");

  function setShopFiltersOpen(open) {
    if (!shopFilters) return;
    shopFilters.classList.toggle("is-open", open);
    if (open) shopFilters.removeAttribute("hidden");
    else shopFilters.setAttribute("hidden", "");
    document.body.style.overflow = open ? "hidden" : "";
    shopFilterBtns.forEach((btn) => btn.setAttribute("aria-expanded", String(open)));
  }

  shopFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllSortMenus();
      const open = shopFilters?.classList.contains("is-open");
      setShopFiltersOpen(!open);
    });
  });
  document.querySelectorAll("[data-shop-filter-close]").forEach((el) => {
    el.addEventListener("click", () => setShopFiltersOpen(false));
  });

  function closeAllSortMenus() {
    document.querySelectorAll("[data-shop-sort]").forEach((root) => {
      const menu = root.querySelector(".shop-sort__menu");
      const toggle = root.querySelector("[data-shop-sort-toggle]");
      if (menu) menu.hidden = true;
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll("[data-shop-sort]").forEach((root) => {
    const toggle = root.querySelector("[data-shop-sort-toggle]");
    const menu = root.querySelector(".shop-sort__menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !menu.hidden;
      closeAllSortMenus();
      if (!open) {
        menu.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
      }
    });

    menu.addEventListener("click", (e) => e.stopPropagation());

    root.querySelectorAll("[data-sort-value]").forEach((opt) => {
      if (opt.tagName === "A") return;
      opt.addEventListener("click", () => {
        root.querySelectorAll("[data-sort-value]").forEach((o) => o.classList.remove("is-active"));
        opt.classList.add("is-active");
        closeAllSortMenus();
      });
    });
  });

  document.addEventListener("click", () => closeAllSortMenus());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setShopFiltersOpen(false);
      closeAllSortMenus();
    }
  });

  const viewKey = "pr-shop-view";
  function setShopView(mode) {
    if (!productGrid) return;
    const list = mode === "list";
    productGrid.classList.toggle("is-list", list);
    document.querySelectorAll("[data-shop-view]").forEach((btn) => {
      const active = btn.getAttribute("data-shop-view") === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    try {
      localStorage.setItem(viewKey, mode);
    } catch (e) {}
  }

  document.querySelectorAll("[data-shop-view]").forEach((btn) => {
    btn.addEventListener("click", () => setShopView(btn.getAttribute("data-shop-view") || "grid"));
  });
  if (productGrid) {
    let saved = "grid";
    try {
      saved = localStorage.getItem(viewKey) || "grid";
    } catch (e) {}
    setShopView(saved);
  }

  /* Hero slider */
  document.querySelectorAll("[data-hero-slider]").forEach((root) => {
    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dotsWrap = root.querySelector("[data-hero-dots]");
    const prev = root.querySelector("[data-hero-prev]");
    const next = root.querySelector("[data-hero-next]");
    if (slides.length < 2) {
      if (prev) prev.hidden = true;
      if (next) next.hidden = true;
      return;
    }

    let index = Math.max(
      0,
      slides.findIndex((s) => s.classList.contains("is-active"))
    );
    let timer = null;
    const interval = Number(root.getAttribute("data-interval") || 5000);

    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hero-slider__dot" + (i === index ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", () => go(i, true));
        dotsWrap.appendChild(dot);
      });
    }

    function go(i, pause) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, n) => {
        const active = n === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        if (active) slide.removeAttribute("tabindex");
        else slide.setAttribute("tabindex", "-1");
      });
      dotsWrap?.querySelectorAll(".hero-slider__dot").forEach((dot, n) => {
        dot.classList.toggle("is-active", n === index);
      });
      if (pause) restart();
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => go(index + 1), interval);
    }

    prev?.addEventListener("click", () => go(index - 1, true));
    next?.addEventListener("click", () => go(index + 1, true));
    root.addEventListener("mouseenter", () => {
      if (timer) clearInterval(timer);
    });
    root.addEventListener("mouseleave", restart);
    restart();
  });

  /* Ajax / predictive search overlay */
  const ajaxSearch = document.getElementById("ajax-search");
  const ajaxInput = ajaxSearch?.querySelector("[data-ajax-search-input]");
  const ajaxResults = ajaxSearch?.querySelector("[data-ajax-search-results]");
  const ajaxMeta = ajaxSearch?.querySelector("[data-ajax-search-meta]");
  const openBtns = document.querySelectorAll("[data-ajax-search-open]");
  let ajaxTimer = null;
  let ajaxSeq = 0;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function stripHtml(html) {
    const el = document.createElement("div");
    el.innerHTML = html || "";
    return (el.textContent || el.innerText || "").replace(/\s+/g, " ").trim();
  }

  /* Predictive search returns decimal currency strings (e.g. "349.00"), not cents */
  function money(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value)) return "";
    const currency = (window.Shopify && Shopify.currency && Shopify.currency.active) || "INR";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: value % 1 === 0 ? 0 : 2,
      }).format(value);
    } catch (e) {
      return "₹" + (value % 1 === 0 ? Math.round(value) : value.toFixed(2));
    }
  }

  function productImage(p) {
    if (p.featured_image) {
      if (typeof p.featured_image === "string") return p.featured_image;
      if (p.featured_image.url) return p.featured_image.url;
      if (p.featured_image.src) return p.featured_image.src;
    }
    if (p.image) {
      if (typeof p.image === "string") return p.image;
      if (p.image.url) return p.image.url;
    }
    const variant = Array.isArray(p.variants) ? p.variants[0] : null;
    if (variant && variant.featured_image && variant.featured_image.url) {
      return variant.featured_image.url;
    }
    if (variant && variant.image) return variant.image;
    return "";
  }

  function setAjaxOpen(open) {
    if (!ajaxSearch) return;
    ajaxSearch.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    openBtns.forEach((btn) => btn.setAttribute("aria-expanded", String(open)));
    if (open) {
      setTimeout(() => ajaxInput?.focus(), 40);
    } else if (ajaxInput) {
      ajaxInput.value = "";
      if (ajaxResults) ajaxResults.innerHTML = "";
      if (ajaxMeta) ajaxMeta.textContent = "Type to search products";
    }
  }

  function renderAjaxProducts(products, q) {
    if (!ajaxResults) return;
    if (!products.length) {
      ajaxResults.innerHTML =
        '<div class="ajax-search__empty">No products found for “' + escapeHtml(q) + '”</div>';
      if (ajaxMeta) ajaxMeta.textContent = "0 results";
      return;
    }
    if (ajaxMeta) {
      ajaxMeta.textContent =
        products.length + (products.length === 1 ? " result" : " results") + ' for “' + q + '”';
    }
    ajaxResults.innerHTML = products
      .map((p) => {
        const url = p.url || "#";
        const title = p.title || "Product";
        const img = productImage(p);
        const alt =
          (p.featured_image && p.featured_image.alt) || title;
        const priceNum = Number(p.price_min != null ? p.price_min : p.price);
        const compareNum = Number(
          p.compare_at_price_min != null ? p.compare_at_price_min : p.compare_at_price_max
        );
        const priceLabel = Number.isFinite(priceNum) ? money(priceNum) : "";
        const hasCompare = Number.isFinite(compareNum) && compareNum > priceNum && priceNum >= 0;
        const savePct = hasCompare
          ? Math.round(((compareNum - priceNum) / compareNum) * 100)
          : 0;
        const variant =
          Array.isArray(p.variants) && p.variants.length === 1 ? p.variants[0] : null;
        const sizeLabel =
          variant && variant.title && variant.title !== "Default Title" ? variant.title : "";
        const typeLabel = p.type || "";
        const vendorLabel = p.vendor || "";
        const available = p.available !== false;
        const tags = Array.isArray(p.tags) ? p.tags : [];
        const isBest =
          tags.some((t) => String(t).toLowerCase().includes("bestseller")) ||
          tags.some((t) => String(t).toLowerCase().includes("best seller"));
        const excerpt = stripHtml(p.body || "").slice(0, 90);

        return (
          '<article class="bs-card ajax-search__card">' +
          '<a href="' +
          escapeHtml(url) +
          '" class="bs-card__media">' +
          (isBest ? '<span class="bs-card__badge">Best Seller</span>' : "") +
          (!available ? '<span class="bs-card__badge ajax-search__oos">Out of Stock</span>' : "") +
          (img
            ? '<img src="' +
              escapeHtml(img) +
              '" alt="' +
              escapeHtml(alt) +
              '" width="400" height="480" loading="lazy">'
            : '<div class="ajax-search__img-fallback" aria-hidden="true"></div>') +
          "</a>" +
          '<div class="bs-card__body">' +
          '<h3 class="bs-card__title"><a href="' +
          escapeHtml(url) +
          '">' +
          escapeHtml(title) +
          "</a></h3>" +
          (sizeLabel || typeLabel
            ? '<p class="bs-card__size">' +
              escapeHtml(sizeLabel || typeLabel) +
              "</p>"
            : "") +
          (vendorLabel
            ? '<p class="ajax-search__vendor">' + escapeHtml(vendorLabel) + "</p>"
            : "") +
          (excerpt
            ? '<p class="ajax-search__excerpt">' + escapeHtml(excerpt) + (excerpt.length >= 90 ? "…" : "") + "</p>"
            : "") +
          '<div class="bs-card__price">' +
          (priceLabel ? "<strong>" + escapeHtml(priceLabel) + "</strong>" : "") +
          (hasCompare ? "<s>" + escapeHtml(money(compareNum)) + "</s>" : "") +
          (savePct > 0 ? '<span class="bs-card__off">' + savePct + "% OFF</span>" : "") +
          "</div>" +
          '<p class="ajax-search__stock ' +
          (available ? "is-in" : "is-out") +
          '">' +
          (available ? "In stock" : "Out of stock") +
          "</p>" +
          '<a class="bs-card__btn" href="' +
          escapeHtml(url) +
          '">' +
          (available ? "View Product" : "View Details") +
          "</a>" +
          "</div></article>"
        );
      })
      .join("");
  }

  async function runAjaxSearch(q) {
    if (!ajaxResults) return;
    const query = (q || "").trim();
    if (query.length < 2) {
      ajaxResults.innerHTML = "";
      if (ajaxMeta) ajaxMeta.textContent = "Type at least 2 characters";
      return;
    }
    const seq = ++ajaxSeq;
    if (ajaxMeta) ajaxMeta.textContent = "Searching…";
    try {
      const url =
        "/search/suggest.json?q=" +
        encodeURIComponent(query) +
        "&resources[type]=product" +
        "&resources[limit]=12" +
        "&resources[options][unavailable_products]=last" +
        "&resources[options][fields]=title,product_type,variants.title,vendor,tag,body";
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();
      if (seq !== ajaxSeq) return;
      const products =
        (data.resources && data.resources.results && data.resources.results.products) || [];
      renderAjaxProducts(products, query);
    } catch (err) {
      if (seq !== ajaxSeq) return;
      if (ajaxMeta) ajaxMeta.textContent = "Could not search right now";
      ajaxResults.innerHTML =
        '<div class="ajax-search__empty">Please try again in a moment.</div>';
    }
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setAjaxOpen(true);
    });
  });

  ajaxSearch?.querySelectorAll("[data-ajax-search-close]").forEach((el) => {
    el.addEventListener("click", () => setAjaxOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && ajaxSearch && !ajaxSearch.hidden) setAjaxOpen(false);
  });

  ajaxInput?.addEventListener("input", () => {
    clearTimeout(ajaxTimer);
    ajaxTimer = setTimeout(() => runAjaxSearch(ajaxInput.value), 280);
  });

  ajaxSearch
    ?.querySelector("[data-ajax-search-form]")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      runAjaxSearch(ajaxInput?.value || "");
    });

  /* Mobile category carousel arrows */
  document.querySelectorAll("[data-cats-carousel]").forEach((root) => {
    const rail = root.querySelector("[data-cats-rail]");
    const prev = root.querySelector("[data-cats-prev]");
    const next = root.querySelector("[data-cats-next]");
    if (!rail) return;

    function scrollByCard(dir) {
      const card = rail.querySelector(".mh-cat");
      const step = card ? card.getBoundingClientRect().width + 16 : 120;
      rail.scrollBy({ left: dir * step, behavior: "smooth" });
    }

    prev?.addEventListener("click", () => scrollByCard(-1));
    next?.addEventListener("click", () => scrollByCard(1));
  });
})();
