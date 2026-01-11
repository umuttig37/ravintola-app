const menuListEl = document.getElementById("menu-list");
const menuEmptyEl = document.getElementById("menu-empty");
const filterEls = Array.from(document.querySelectorAll(".filter"));

let menuItems = [];

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

const formatPrice = (price) =>
  `${Number(price).toLocaleString(getLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ?`;

const renderMenuItem = (item) => {
  const card = document.createElement("div");
  card.className = "menu-card";
  card.innerHTML = `
    <h3>${item.name}</h3>
    <p class="muted">${item.description || ""}</p>
    <div class="menu-meta">
      <span>${formatPrice(item.price)}</span>
      ${item.diet_tags ? `<span>${item.diet_tags}</span>` : ""}
      ${item.allergens ? `<span>${item.allergens}</span>` : ""}
    </div>
    <button class="btn primary small" data-add="${item.id}">${t("menu.add", "Lisää koriin")}</button>
  `;
  return card;
};

const getActiveFilters = () =>
  filterEls.filter((el) => el.checked).map((el) => el.value);

const applyFilters = () => {
  const active = getActiveFilters();
  const filtered = menuItems.filter((item) => {
    if (active.length === 0) {
      return true;
    }
    const tags = (item.diet_tags || "").split(",").map((t) => t.trim());
    return active.every((filter) => tags.includes(filter));
  });

  menuListEl.innerHTML = "";
  if (filtered.length === 0) {
    menuEmptyEl.classList.remove("hidden");
    return;
  }
  menuEmptyEl.classList.add("hidden");

  filtered.forEach((item) => {
    menuListEl.appendChild(renderMenuItem(item));
  });
};

const attachAddHandlers = () => {
  menuListEl.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-add]");
    if (!button) {
      return;
    }

    const id = Number(button.dataset.add);
    const item = menuItems.find((entry) => entry.id === id);
    if (!item) {
      return;
    }

    CartStore.add({ id: item.id, name: item.name, price: item.price });
    button.textContent = t("menu.added", "Lisätty");
    setTimeout(() => {
      button.textContent = t("menu.add", "Lisää koriin");
    }, 1200);
  });
};

const loadMenu = async () => {
  try {
    const data = await Api.request("/api/menu");
    menuItems = data.items || [];
    applyFilters();
    attachAddHandlers();
  } catch (err) {
    menuEmptyEl.textContent = t("error.menuFailed", "Ruokalistan haku epäonnistui");
    menuEmptyEl.classList.remove("hidden");
  }
};

filterEls.forEach((el) => el.addEventListener("change", applyFilters));

loadMenu();
