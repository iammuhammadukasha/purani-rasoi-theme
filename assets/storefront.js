/* Purani Rasoi storefront interactions */

(function () {
  const cartCounts = document.querySelectorAll(".cart-count");
  const mobileNav = document.getElementById("mobile-nav");
  const openBtn = document.getElementById("menu-open");
  const closeBtn = document.getElementById("menu-close");
  const shopToggle = document.getElementById("shop-toggle");
  const shopMenu = document.getElementById("shop-menu");
  let count = 0;

  function setCart(n) {
    cartCounts.forEach((el) => {
      el.textContent = String(n);
      el.classList.toggle("is-empty", n <= 0);
    });
  }

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qtyEl = document.getElementById("qty-value");
      const qty = qtyEl ? Math.max(1, parseInt(qtyEl.textContent, 10) || 1) : 1;
      count += qty;
      setCart(count);
      const label = btn.innerHTML;
      btn.textContent = "Added";
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = label;
        btn.disabled = false;
      }, 1200);
    });
  });

  function setMenu(open) {
    if (!mobileNav) return;
    mobileNav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  openBtn?.addEventListener("click", () => setMenu(true));
  closeBtn?.addEventListener("click", () => setMenu(false));
  mobileNav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

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

  const qtyValue = document.getElementById("qty-value");
  document.getElementById("qty-minus")?.addEventListener("click", () => {
    if (!qtyValue) return;
    qtyValue.textContent = String(Math.max(1, (parseInt(qtyValue.textContent, 10) || 1) - 1));
  });
  document.getElementById("qty-plus")?.addEventListener("click", () => {
    if (!qtyValue) return;
    qtyValue.textContent = String((parseInt(qtyValue.textContent, 10) || 1) + 1);
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

  const thumbsRail = document.querySelector("[data-thumbs-rail]");
  document.querySelector("[data-thumbs-prev]")?.addEventListener("click", () => {
    thumbsRail?.scrollBy({ left: -120, behavior: "smooth" });
  });
  document.querySelector("[data-thumbs-next]")?.addEventListener("click", () => {
    thumbsRail?.scrollBy({ left: 120, behavior: "smooth" });
  });

  document.querySelectorAll(".pdp-weights button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pdp-weights button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
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
})();
