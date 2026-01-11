const adminPanel = document.getElementById("admin-panel");
const adminLocked = document.getElementById("admin-locked");
const menuForm = document.getElementById("menu-form");
const menuFormMsg = document.getElementById("menu-form-msg");
const adminMenuEl = document.getElementById("admin-menu");
const adminOrdersEl = document.getElementById("admin-orders");
const newsForm = document.getElementById("news-form");
const newsFormMsg = document.getElementById("news-form-msg");
const adminNewsEl = document.getElementById("admin-news");
const adminNewsEmptyEl = document.getElementById("admin-news-empty");

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

const renderMenuItem = (item) => {
  const wrapper = document.createElement("div");
  wrapper.className = "menu-card";
  wrapper.innerHTML = `
    <div class="stack">
      <strong>${item.name}</strong>
      <label>${t("admin.form.name", "Nimi")} <input type="text" name="name" value="${item.name}" /></label>
      <label>${t("admin.form.desc", "Kuvaus")} <input type="text" name="description" value="${item.description || ""}" /></label>
      <label>${t("admin.form.price", "Hinta (eur)")} <input type="number" step="0.1" name="price" value="${item.price}" /></label>
      <label>${t("admin.form.diets", "Diettagit (esim. L,G,VEG)")} <input type="text" name="diet_tags" value="${item.diet_tags || ""}" /></label>
      <label>${t("admin.form.allergens", "Allergeenit")} <input type="text" name="allergens" value="${item.allergens || ""}" /></label>
      <label>${t("admin.form.category", "Kategoria")} <input type="text" name="category" value="${item.category || ""}" /></label>
      <label class="checkbox">
        <input type="checkbox" name="available" ${item.available ? "checked" : ""} /> ${t("action.available", "Saatavilla")}
      </label>
      <div>
        <button class="btn primary small" data-update="${item.id}">${t("action.update", "Päivitä")}</button>
        <button class="btn ghost small" data-delete="${item.id}">${t("action.delete", "Poista")}</button>
      </div>
    </div>
  `;
  return wrapper;
};

const renderOrder = (order) => {
  const wrapper = document.createElement("div");
  wrapper.className = "menu-card";
  const items = (order.items || [])
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  wrapper.innerHTML = `
    <strong>${t("order.label", "Tilaus")} #${order.id}</strong>
    <div class="menu-meta">
      <span>${order.email}</span>
      <span>${new Date(order.created_at).toLocaleString(getLocale())}</span>
      <span>${formatPrice(order.total)}</span>
    </div>
    <p class="muted">${items}</p>
    <label>
      ${t("order.status", "Status")}
      <select data-status="${order.id}">
        <option value="uusi" ${order.status === "uusi" ? "selected" : ""}>${t("order.status.new", "uusi")}</option>
        <option value="valmistuksessa" ${order.status === "valmistuksessa" ? "selected" : ""}>${t("order.status.cooking", "valmistuksessa")}</option>
        <option value="valmis" ${order.status === "valmis" ? "selected" : ""}>${t("order.status.ready", "valmis")}</option>
        <option value="nouto" ${order.status === "nouto" ? "selected" : ""}>${t("order.status.pickup", "nouto")}</option>
      </select>
    </label>
  `;
  return wrapper;
};

const renderNewsItem = (item, index) => {
  const wrapper = document.createElement("div");
  wrapper.className = "menu-card";
  const dateLabel = item.date
    ? new Date(item.date).toLocaleDateString(getLocale())
    : "";

  wrapper.innerHTML = `
    <strong>${item.title}</strong>
    <div class="menu-meta">
      ${dateLabel ? `<span>${dateLabel}</span>` : ""}
    </div>
    <p class="muted">${item.body || ""}</p>
    <button class="btn ghost small" data-news-delete="${index}">${t("action.delete", "Poista")}</button>
  `;
  return wrapper;
};

const loadAdminMenu = async () => {
  const data = await Api.request("/api/menu?all=true");
  adminMenuEl.innerHTML = "";
  data.items.forEach((item) => {
    adminMenuEl.appendChild(renderMenuItem(item));
  });
};

const loadOrders = async () => {
  const data = await Api.request("/api/orders");
  adminOrdersEl.innerHTML = "";
  data.orders.forEach((order) => {
    adminOrdersEl.appendChild(renderOrder(order));
  });
};

const loadNews = async () => {
  if (!adminNewsEl || !adminNewsEmptyEl) {
    return;
  }
  try {
    const data = await Api.request("/api/news");
    const items = (data.items || []).slice();
    adminNewsEl.innerHTML = "";
    if (items.length === 0) {
      adminNewsEmptyEl.classList.remove("hidden");
      return;
    }

    adminNewsEmptyEl.classList.add("hidden");
    items.forEach((item) => {
      adminNewsEl.appendChild(renderNewsItem(item, item.id));
    });
  } catch (err) {
    adminNewsEmptyEl.textContent = err.message;
    adminNewsEmptyEl.classList.remove("hidden");
  }
};

const initAdmin = () => {
  const user = Api.getUser();
  if (!user || user.role !== "admin") {
    adminLocked.classList.remove("hidden");
    adminPanel.classList.add("hidden");
    return;
  }

  adminLocked.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  loadAdminMenu();
  loadOrders();
  loadNews();
};

menuForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  menuFormMsg.textContent = "";

  const formData = new FormData(menuForm);
  const payload = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    diet_tags: formData.get("diet_tags"),
    allergens: formData.get("allergens"),
    category: formData.get("category"),
    available: formData.get("available") === "on"
  };

  try {
    await Api.request("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    menuForm.reset();
    loadAdminMenu();
  } catch (err) {
    menuFormMsg.textContent = err.message;
  }
});

if (newsForm) {
  newsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    newsFormMsg.textContent = "";

    const formData = new FormData(newsForm);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      body: String(formData.get("body") || "").trim(),
      date: formData.get("date") || new Date().toISOString().slice(0, 10)
    };

    if (!payload.title) {
      newsFormMsg.textContent = t("admin.news.titleMissing", "Otsikko puuttuu");
      return;
    }

    try {
      await Api.request("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      newsForm.reset();
      loadNews();
    } catch (err) {
      newsFormMsg.textContent = err.message;
    }
  });
}

adminMenuEl.addEventListener("click", async (event) => {
  const updateBtn = event.target.closest("button[data-update]");
  const deleteBtn = event.target.closest("button[data-delete]");

  if (updateBtn) {
    const id = Number(updateBtn.dataset.update);
    const card = updateBtn.closest(".menu-card");
    const payload = {
      name: card.querySelector("input[name=name]").value,
      description: card.querySelector("input[name=description]").value,
      price: Number(card.querySelector("input[name=price]").value),
      diet_tags: card.querySelector("input[name=diet_tags]").value,
      allergens: card.querySelector("input[name=allergens]").value,
      category: card.querySelector("input[name=category]").value,
      available: card.querySelector("input[name=available]").checked
    };

    await Api.request(`/api/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    loadAdminMenu();
  }

  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.delete);
    await Api.request(`/api/menu/${id}`, { method: "DELETE" });
    loadAdminMenu();
  }
});

if (adminNewsEl) {
  adminNewsEl.addEventListener("click", async (event) => {
    const deleteBtn = event.target.closest("button[data-news-delete]");
    if (!deleteBtn) {
      return;
    }

    const id = deleteBtn.dataset.newsDelete;
    try {
      await Api.request(`/api/news/${id}`, { method: "DELETE" });
      loadNews();
    } catch (err) {
      adminNewsEmptyEl.textContent = err.message;
      adminNewsEmptyEl.classList.remove("hidden");
    }
  });
}

adminOrdersEl.addEventListener("change", async (event) => {
  const select = event.target.closest("select[data-status]");
  if (!select) {
    return;
  }
  const id = Number(select.dataset.status);
  await Api.request(`/api/orders/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: select.value })
  });
  loadOrders();
});

initAdmin();
