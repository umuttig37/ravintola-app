const cartItemsEl = document.getElementById("cart-items");
const cartEmptyEl = document.getElementById("cart-empty");
const cartTotalEl = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const orderResultEl = document.getElementById("order-result");

const t = (key, fallback) => {
  if (window.I18n && typeof window.I18n.t === "function") {
    return window.I18n.t(key);
  }
  return fallback || key;
};

const getLocale = () => {
  if (window.I18n && typeof window.I18n.getLang === "function") {
    return window.I18n.getLang() === "en" ? "en-GB" : "fi-FI";
  }
  return "fi-FI";
};

const formatPrice = (value) =>
  `${Number(value).toLocaleString(getLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ?`;

const formatOrderSuccess = (id) =>
  t("order.success", "Tilaus {id} vastaanotettu. Noutoajaksi arvioitu 10 min.").replace(
    "{id}",
    id
  );

const renderCart = () => {
  const items = CartStore.load();
  cartItemsEl.innerHTML = "";

  if (items.length === 0) {
    cartEmptyEl.classList.remove("hidden");
    cartTotalEl.textContent = "0,00 eur";
    return;
  }

  cartEmptyEl.classList.add("hidden");
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="muted">${formatPrice(item.price)}</div>
      </div>
      <div>
        <input type="number" min="1" value="${item.quantity}" data-qty="${item.id}" />
        <button class="btn ghost small" data-remove="${item.id}">${t("action.delete", "Poista")}</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = formatPrice(CartStore.total());
};

cartItemsEl.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-qty]");
  if (!input) {
    return;
  }
  const id = Number(input.dataset.qty);
  CartStore.update(id, Number(input.value));
  renderCart();
});

cartItemsEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-remove]");
  if (!button) {
    return;
  }
  const id = Number(button.dataset.remove);
  CartStore.remove(id);
  renderCart();
});

checkoutBtn.addEventListener("click", async () => {
  orderResultEl.classList.add("hidden");

  const token = Api.getToken();
  if (!token) {
    orderResultEl.textContent = t("error.loginRequired", "Kirjaudu ensin sisään ennen tilausta.");
    orderResultEl.classList.remove("hidden");
    return;
  }

  const items = CartStore.load().map((item) => ({
    menuItemId: item.id,
    quantity: item.quantity
  }));

  if (items.length === 0) {
    orderResultEl.textContent = t("error.cartEmpty", "Ostoskori on tyhjä.");
    orderResultEl.classList.remove("hidden");
    return;
  }

  try {
    const result = await Api.request("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });

    CartStore.clear();
    renderCart();
    orderResultEl.textContent = formatOrderSuccess(result.id);
    orderResultEl.classList.remove("hidden");
  } catch (err) {
    orderResultEl.textContent = err.message;
    orderResultEl.classList.remove("hidden");
  }
});

renderCart();
