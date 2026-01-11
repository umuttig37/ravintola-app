require("dotenv").config();
const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const { run, get, all } = require("./db");
const { createToken, requireAuth } = require("./auth");
const { formatDate, secondsToTime } = require("./utils");

const app = express();
const newsPath = path.join(__dirname, "data", "news.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const readNews = async () => {
  try {
    const raw = await fs.readFile(newsPath, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
};

const writeNews = async (items) => {
  await fs.mkdir(path.dirname(newsPath), { recursive: true });
  await fs.writeFile(newsPath, JSON.stringify(items, null, 2), "utf8");
};

const formatDepartureTime = (serviceDay, seconds) => {
  if (Number.isFinite(serviceDay)) {
    const timestamp = (serviceDay + seconds) * 1000;
    return new Date(timestamp).toLocaleTimeString("fi-FI", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Helsinki"
    });
  }
  return secondsToTime(seconds);
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * Rekisteröityminen asiakkaaksi.
 */
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: "Sähköposti ja salasana vaaditaan" });
    return;
  }

  try {
    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      res.status(409).json({ error: "Sähköposti on jo käytössä" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const result = await run(
      "INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, ?)",
      [email, hash, "customer", now]
    );

    const user = { id: result.lastID, email, role: "customer" };
    res.status(201).json({ token: createToken(user), user });
  } catch (err) {
    res.status(500).json({ error: "Rekisteröinti epäonnistui" });
  }
});

/**
 * Kirjautuminen.
 */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: "Sähköposti ja salasana vaaditaan" });
    return;
  }

  try {
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      res.status(401).json({ error: "Virheelliset tunnukset" });
      return;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      res.status(401).json({ error: "Virheelliset tunnukset" });
      return;
    }

    const publicUser = { id: user.id, email: user.email, role: user.role };
    res.json({ token: createToken(publicUser), user: publicUser });
  } catch (err) {
    res.status(500).json({ error: "Kirjautuminen epäonnistui" });
  }
});

app.get("/api/auth/me", requireAuth(), async (req, res) => {
  res.json({ user: req.user });
});

/**
 * Ruokalista.
 */
app.get("/api/menu", async (req, res) => {
  const showAll = req.query.all === "true";
  const sql = showAll
    ? "SELECT * FROM menu_items ORDER BY category, name"
    : "SELECT * FROM menu_items WHERE available = 1 ORDER BY category, name";

  const items = await all(sql);
  res.json({ items });
});

app.post("/api/menu", requireAuth(["admin"]), async (req, res) => {
  const { name, description, price, diet_tags, allergens, available, category } =
    req.body || {};

  if (!name || price === undefined) {
    res.status(400).json({ error: "Nimi ja hinta vaaditaan" });
    return;
  }

  const now = new Date().toISOString();
  const result = await run(
    `INSERT INTO menu_items
      (name, description, price, diet_tags, allergens, available, category, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      name,
      description || "",
      price,
      diet_tags || "",
      allergens || "",
      available ? 1 : 0,
      category || "",
      now,
      now
    ]
  );

  const item = await get("SELECT * FROM menu_items WHERE id = ?", [result.lastID]);
  res.status(201).json({ item });
});

app.put("/api/menu/:id", requireAuth(["admin"]), async (req, res) => {
  const id = Number(req.params.id);
  const { name, description, price, diet_tags, allergens, available, category } =
    req.body || {};

  const now = new Date().toISOString();
  await run(
    `UPDATE menu_items
     SET name = ?, description = ?, price = ?, diet_tags = ?, allergens = ?, available = ?, category = ?, updated_at = ?
     WHERE id = ?`,
    [
      name,
      description || "",
      price,
      diet_tags || "",
      allergens || "",
      available ? 1 : 0,
      category || "",
      now,
      id
    ]
  );

  const item = await get("SELECT * FROM menu_items WHERE id = ?", [id]);
  res.json({ item });
});

app.delete("/api/menu/:id", requireAuth(["admin"]), async (req, res) => {
  const id = Number(req.params.id);
  await run("DELETE FROM menu_items WHERE id = ?", [id]);
  res.json({ ok: true });
});

/**
 * Tilaus.
 */
app.post("/api/orders", requireAuth(), async (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Ostoskori on tyhjä" });
    return;
  }

  const ids = items.map((item) => Number(item.menuItemId));
  const placeholders = ids.map(() => "?").join(",");
  const menuRows = await all(
    `SELECT * FROM menu_items WHERE id IN (${placeholders})`,
    ids
  );

  const menuById = new Map(menuRows.map((row) => [row.id, row]));
  let total = 0;

  for (const item of items) {
    const menuItem = menuById.get(Number(item.menuItemId));
    if (!menuItem) {
      res.status(400).json({ error: "Virheellinen tuote" });
      return;
    }
    const qty = Math.max(1, Number(item.quantity || 1));
    total += menuItem.price * qty;
  }

  const now = new Date().toISOString();
  const orderResult = await run(
    "INSERT INTO orders (user_id, status, total, created_at) VALUES (?, ?, ?, ?)",
    [req.user.id, "uusi", total, now]
  );

  for (const item of items) {
    const menuItem = menuById.get(Number(item.menuItemId));
    const qty = Math.max(1, Number(item.quantity || 1));
    await run(
      "INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)",
      [orderResult.lastID, menuItem.id, menuItem.name, qty, menuItem.price]
    );
  }

  res.status(201).json({ id: orderResult.lastID, total, status: "uusi" });
});

app.get("/api/orders/me", requireAuth(), async (req, res) => {
  const orders = await all(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id]
  );
  res.json({ orders });
});

app.get("/api/orders", requireAuth(["admin"]), async (req, res) => {
  const orders = await all(
    `SELECT orders.*, users.email
     FROM orders
     JOIN users ON users.id = orders.user_id
     ORDER BY orders.created_at DESC`
  );

  const orderIds = orders.map((order) => order.id);
  let items = [];
  if (orderIds.length > 0) {
    const placeholders = orderIds.map(() => "?").join(",");
    items = await all(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      orderIds
    );
  }

  const itemsByOrder = items.reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = [];
    }
    acc[item.order_id].push(item);
    return acc;
  }, {});

  res.json({
    orders: orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || []
    }))
  });
});

app.put("/api/orders/:id/status", requireAuth(["admin"]), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!status) {
    res.status(400).json({ error: "Status puuttuu" });
    return;
  }

  await run("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  const order = await get("SELECT * FROM orders WHERE id = ?", [id]);
  res.json({ order });
});

/**
 * Päivän ruokalista (Sodexo Metropolia Myllypuro, ID 158).
 */
app.get("/api/daily-menu", async (req, res) => {
  const date = req.query.date || formatDate(new Date());
  const restaurantId = process.env.SODEXO_RESTAURANT_ID || "158";
  const url = `https://www.sodexo.fi/ruokalistat/output/daily_json/${restaurantId}/${date}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(502).json({ error: "Ruokalistan haku epäonnistui" });
      return;
    }
    const data = await response.json();
    const courses = (data.courses || []).map((course) => ({
      title: course.title_fi || course.title || "",
      category: course.category || "",
      price: course.price || "",
      diets: course.properties || "",
      allergens: course.allergenen || ""
    }));

    res.json({
      date,
      restaurantId,
      source: data.meta && data.meta.ref_url,
      courses
    });
  } catch (err) {
    res.status(502).json({ error: "Ruokalistan haku epäonnistui" });
  }
});

/**
 * Tiedotteet.
 */
app.get("/api/news", async (req, res) => {
  try {
    const items = await readNews();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: "Tiedotteiden haku epäonnistui" });
  }
});

app.post("/api/news", requireAuth(["admin"]), async (req, res) => {
  const { title, body, date } = req.body || {};
  if (!title) {
    res.status(400).json({ error: "Otsikko puuttuu" });
    return;
  }

  try {
    const items = await readNews();
    const next = {
      id: String(Date.now()),
      title: String(title).trim(),
      body: String(body || "").trim(),
      date: date || new Date().toISOString().slice(0, 10)
    };
    items.push(next);
    await writeNews(items);
    res.status(201).json({ item: next });
  } catch (err) {
    res.status(500).json({ error: "Tiedotteen tallennus epäonnistui" });
  }
});

app.delete("/api/news/:id", requireAuth(["admin"]), async (req, res) => {
  const id = req.params.id;
  try {
    const items = await readNews();
    const filtered = items.filter((item) => item.id !== id);
    await writeNews(filtered);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Tiedotteen poisto epäonnistui" });
  }
});

/**
 * HSL-lähdöt Myllypuron kampuksen läheltä.
 */
app.get("/api/hsl/departures", async (req, res) => {
  const subscriptionKey = process.env.HSL_SUBSCRIPTION_KEY;
  if (!subscriptionKey) {
    res.json({
      ok: false,
      message: "HSL-avainta ei ole asetettu (HSL_SUBSCRIPTION_KEY)",
      stop: null,
      departures: []
    });
    return;
  }

  const lat = Number(req.query.lat || 60.2253);
  const lon = Number(req.query.lon || 25.0768);

  const nearestQuery = {
    query: `query($lat: Float!, $lon: Float!) {
      nearest(lat: $lat, lon: $lon, maxDistance: 2000, filterByPlaceTypes: [STOP]) {
        edges {
          node {
            place {
              __typename
              ... on Stop {
                gtfsId
                name
                code
              }
            }
            distance
          }
        }
      }
    }`,
    variables: { lat, lon }
  };

  try {
    const nearestResponse = await fetch(
      "https://api.digitransit.fi/routing/v2/hsl/gtfs/v1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "digitransit-subscription-key": subscriptionKey
        },
        body: JSON.stringify(nearestQuery)
      }
    );

    const nearestData = await nearestResponse.json();
    const edges =
      (nearestData.data && nearestData.data.nearest && nearestData.data.nearest.edges) ||
      [];
    const candidates = edges
      .map((edge) => ({
        place: edge.node.place,
        distance: edge.node.distance
      }))
      .filter((entry) => entry.place && entry.place.gtfsId);

    if (candidates.length === 0) {
      res.json({ ok: true, stop: null, departures: [], stops: [] });
      return;
    }

    let selectedStop = null;
    let selectedDepartures = [];
    const stops = [];

    for (const entry of candidates.slice(0, 20)) {
      const place = entry.place;
      const stopQuery = {
        query: `query($id: String!) {
          stop(id: $id) {
            name
            code
            lat
            lon
            stoptimesWithoutPatterns(numberOfDepartures: 6) {
              scheduledDeparture
              realtimeDeparture
              realtime
              serviceDay
              trip {
                routeShortName
                tripHeadsign
              }
            }
          }
        }`,
        variables: { id: place.gtfsId }
      };

      const stopResponse = await fetch(
        "https://api.digitransit.fi/routing/v2/hsl/gtfs/v1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "digitransit-subscription-key": subscriptionKey
          },
          body: JSON.stringify(stopQuery)
        }
      );

      const stopData = await stopResponse.json();
      const stop = stopData.data && stopData.data.stop;
      if (!stop) {
        continue;
      }

      const nowEpoch = Math.floor(Date.now() / 1000);
      const stopDepartures = (stop.stoptimesWithoutPatterns || [])
        .map((dep) => {
          const seconds = dep.realtime ? dep.realtimeDeparture : dep.scheduledDeparture;
          const epoch = Number.isFinite(dep.serviceDay)
            ? dep.serviceDay + seconds
            : null;
          return {
            time: formatDepartureTime(dep.serviceDay, seconds),
            route: dep.trip.routeShortName,
            headsign: dep.trip.tripHeadsign,
            realtime: dep.realtime,
            epoch
          };
        })
        .filter((dep) => dep.epoch === null || dep.epoch >= nowEpoch - 60)
        .map((dep) => ({
          time: dep.time,
          route: dep.route,
          headsign: dep.headsign,
          realtime: dep.realtime
        }));

      stops.push({
        id: place.gtfsId,
        name: stop.name,
        code: stop.code,
        lat: stop.lat,
        lon: stop.lon,
        distance: entry.distance,
        departures: stopDepartures
      });

      if (!selectedStop && stopDepartures.length > 0) {
        selectedStop = { name: stop.name, code: stop.code, lat: stop.lat, lon: stop.lon };
        selectedDepartures = stopDepartures;
      }
    }

    if (!selectedStop && stops.length > 0) {
      const first = stops[0];
      selectedStop = { name: first.name, code: first.code, lat: first.lat, lon: first.lon };
      selectedDepartures = first.departures || [];
    }

    res.json({
      ok: true,
      stop: selectedStop,
      departures: selectedDepartures,
      stops
    });
  } catch (err) {
    res.status(502).json({
      ok: false,
      message: "HSL-haussa tapahtui virhe",
      stop: null,
      departures: []
    });
  }
});

module.exports = app;
