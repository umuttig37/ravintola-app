const dailyMenuEl = document.getElementById("daily-menu");
const dailyEmptyEl = document.getElementById("daily-empty");
const dailyDateEl = document.getElementById("daily-date");
const hslPreviewEl = document.getElementById("hsl-preview");
const hslListEl = document.getElementById("hsl-list");
const hslEmptyEl = document.getElementById("hsl-empty");
const hslMapEl = document.getElementById("hsl-map");
const newsListEl = document.getElementById("news-list");
const newsEmptyEl = document.getElementById("news-empty");

const CAMPUS = { lat: 60.2253, lon: 25.0768 };
let hslMap = null;
let hslMarkers = [];
let campusMarker = null;

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

const formatPrice = (value) => {
  if (!value) {
    return "";
  }
  const normalized = String(value).replace("EUR", "").trim();
  return normalized ? `${normalized} ?` : "";
};

const renderCourse = (course) => {
  const card = document.createElement("div");
  card.className = "menu-card";
  card.innerHTML = `
    <h3>${course.title || "(Nimeton)"}</h3>
    <div class="menu-meta">
      ${course.category ? `<span>${course.category}</span>` : ""}
      ${course.price ? `<span>${formatPrice(course.price)}</span>` : ""}
      ${course.diets ? `<span>${course.diets}</span>` : ""}
    </div>
  `;
  return card;
};

const renderDeparture = (dep) => {
  const card = document.createElement("div");
  card.className = "menu-card";
  card.innerHTML = `
    <h3>${dep.route || "-"} ${dep.headsign || ""}</h3>
    <div class="menu-meta">
      <span>${dep.time}</span>
      <span>${dep.realtime ? t("hsl.realtime", "reaaliaikainen") : t("hsl.scheduled", "aikataulu")}</span>
    </div>
  `;
  return card;
};

const renderNewsItem = (item) => {
  const card = document.createElement("div");
  card.className = "menu-card";
  const dateLabel = item.date
    ? new Date(item.date).toLocaleDateString(getLocale())
    : "";
  card.innerHTML = `
    <h3>${item.title || ""}</h3>
    <div class="menu-meta">
      ${dateLabel ? `<span>${dateLabel}</span>` : ""}
    </div>
    <p class="muted">${item.body || ""}</p>
  `;
  return card;
};

const ensureMap = () => {
  if (!hslMapEl || !window.L) {
    return null;
  }
  if (!hslMap) {
    hslMap = L.map(hslMapEl, { zoomControl: true }).setView(
      [CAMPUS.lat, CAMPUS.lon],
      15
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(hslMap);

    campusMarker = L.circleMarker([CAMPUS.lat, CAMPUS.lon], {
      radius: 7,
      color: "#0f766e",
      fillColor: "#14b8a6",
      fillOpacity: 0.9
    })
      .addTo(hslMap)
      .bindPopup("<strong>Metropolia Myllypuro</strong>");
  }
  return hslMap;
};

const clearMarkers = () => {
  hslMarkers.forEach((marker) => marker.remove());
  hslMarkers = [];
};

const markerIcon = (label) =>
  L.divIcon({
    className: "hsl-marker",
    html: `
      <div class="hsl-arrow"><span>&gt;</span></div>
      <div class="hsl-label">${label || "-"}</div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30]
  });

const updateMap = (stops) => {
  const map = ensureMap();
  if (!map) {
    return;
  }

  clearMarkers();

  const points = [];
  stops.forEach((stop) => {
    if (!stop || stop.lat === null || stop.lon === null) {
      return;
    }
    const first = stop.departures && stop.departures[0];
    if (!first) {
      return;
    }
    const label = `${first.route || ""} ${first.time || ""}`.trim();
    const marker = L.marker([stop.lat, stop.lon], {
      icon: markerIcon(label)
    }).addTo(map);
    marker.bindPopup(
      `<strong>${stop.name}</strong><br />${label || t("error.hslNone")}`
    );
    hslMarkers.push(marker);
    points.push([stop.lat, stop.lon]);
  });

  if (campusMarker) {
    points.push([CAMPUS.lat, CAMPUS.lon]);
  }

  if (points.length > 0) {
    map.fitBounds(points, { padding: [24, 24] });
  }
};

const loadDailyMenu = async () => {
  try {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    dailyDateEl.textContent = `${t("daily.date", "Päivä")}: ${date}`;
    const data = await Api.request(`/api/daily-menu?date=${date}`);

    dailyMenuEl.innerHTML = "";
    if (!data.courses || data.courses.length === 0) {
      dailyEmptyEl.classList.remove("hidden");
      return;
    }

    dailyEmptyEl.classList.add("hidden");
    data.courses.forEach((course) => {
      dailyMenuEl.appendChild(renderCourse(course));
    });
  } catch (err) {
    dailyEmptyEl.classList.remove("hidden");
  }
};

const loadHsl = async () => {
  try {
    const data = await Api.request("/api/hsl/departures");
    if (!data.ok) {
      const message = data.message || t("error.hslFailed", "HSL-tietoja ei saatavilla");
      hslPreviewEl.textContent = message;
      hslEmptyEl.textContent = message;
      hslEmptyEl.classList.remove("hidden");
      return;
    }

    if (!data.departures || data.departures.length === 0) {
      const emptyMsg = t("error.hslNone", "Ei lähtöjä");
      hslPreviewEl.textContent = emptyMsg;
      hslEmptyEl.textContent = emptyMsg;
      hslEmptyEl.classList.remove("hidden");
      hslListEl.innerHTML = "";
      updateMap(data.stops || []);
      return;
    }

    hslEmptyEl.classList.add("hidden");
    hslPreviewEl.innerHTML = data.departures
      .slice(0, 3)
      .map((dep) => `${dep.time} ${dep.route}`)
      .join("<br />");

    hslListEl.innerHTML = "";
    data.departures.forEach((dep) => {
      hslListEl.appendChild(renderDeparture(dep));
    });

    updateMap(data.stops || []);
  } catch (err) {
    const message = t("error.hslFailed", "HSL-tietojen haku epäonnistui");
    hslPreviewEl.textContent = message;
    hslEmptyEl.textContent = message;
    hslEmptyEl.classList.remove("hidden");
  }
};

const loadNews = async () => {
  if (!newsListEl || !newsEmptyEl) {
    return;
  }

  try {
    const data = await Api.request("/api/news");
    if (data.items && Array.isArray(data.items)) {
      renderNews(data.items);
      return;
    }
    renderNews([]);
  } catch (err) {
    newsEmptyEl.textContent = t("error.newsFailed", "Tiedotteiden haku epäonnistui");
    newsEmptyEl.classList.remove("hidden");
  }
};

const renderNews = (items) => {
  const sorted = items
    .filter((item) => item && item.title)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  newsListEl.innerHTML = "";
  if (sorted.length === 0) {
    newsEmptyEl.classList.remove("hidden");
    return;
  }

  newsEmptyEl.classList.add("hidden");
  sorted.forEach((item) => {
    newsListEl.appendChild(renderNewsItem(item));
  });
};

loadDailyMenu();
loadHsl();
loadNews();
