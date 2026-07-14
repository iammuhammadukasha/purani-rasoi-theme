/* Purani Rasoi Shopify theme interactions */

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
        document.querySelectorAll(".cart-count").forEach((el) => {
          const n = cart.item_count || 0;
          el.textContent = String(n);
          el.classList.toggle("is-empty", n <= 0);
        });
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
        document.querySelectorAll(".cart-count").forEach((el) => {
          const n = cart.item_count || 0;
          el.textContent = String(n);
          el.classList.toggle("is-empty", n <= 0);
        });
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
})();
