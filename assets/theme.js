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

  /* PDP quantity + gallery */
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

  /* Variant weight buttons → select option */
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

  /* AJAX add to cart */
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
        const res = await fetch(window.Shopify?.routes?.root
          ? `${window.Shopify.routes.root}cart/add.js`
          : "/cart/add.js", {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Add failed");
        const cart = await fetch(window.Shopify?.routes?.root
          ? `${window.Shopify.routes.root}cart.js`
          : "/cart.js").then((r) => r.json());
        document.querySelectorAll(".cart-count").forEach((el) => {
          el.textContent = String(cart.item_count || 0);
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

  /* Quick-add buttons with data-variant-id */
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
          el.textContent = String(cart.item_count || 0);
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
})();
