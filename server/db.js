const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const initSqlJs = require("sql.js");

const DB_PATH = path.join(__dirname, "data", "app.db");

let SQL = null;
let db = null;

const ensureDb = () => {
  if (!db) {
    throw new Error("Tietokantaa ei ole alustettu");
  }
};

const saveDb = () => {
  if (!db) {
    return;
  }
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
};

const run = async (sql, params = []) => {
  ensureDb();
  db.run(sql, params);
  const result = db.exec("SELECT last_insert_rowid() AS id");
  const lastID = result && result[0] && result[0].values[0][0];
  saveDb();
  return { lastID };
};

const queryAll = (sql, params = []) => {
  ensureDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

const get = async (sql, params = []) => {
  const rows = queryAll(sql, params);
  return rows[0];
};

const all = async (sql, params = []) => queryAll(sql, params);

const init = async () => {
  SQL = await initSqlJs({
    locateFile: (file) =>
      path.join(__dirname, "..", "node_modules", "sql.js", "dist", file)
  });

  if (fs.existsSync(DB_PATH)) {
    const filebuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      diet_tags TEXT,
      allergens TEXT,
      available INTEGER NOT NULL DEFAULT 1,
      category TEXT,
      image_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id)
    )`
  );

  const adminEmail = "admin@ravintola.local";
  const admin = await get("SELECT id FROM users WHERE email = ?", [adminEmail]);
  if (!admin) {
    const hash = bcrypt.hashSync("admin123", 10);
    await run(
      "INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, ?)",
      [adminEmail, hash, "admin", new Date().toISOString()]
    );
  }

  const menuCount = await get("SELECT COUNT(*) AS count FROM menu_items");
  if (!menuCount || menuCount.count === 0) {
    const now = new Date().toISOString();
    const seedItems = [
      {
        name: "Myllypuron lohikeitto",
        description: "Kermainen lohikeitto, tilli ja paahdettu ruis",
        price: 9.9,
        diet_tags: "L,G",
        allergens: "kala,maito",
        category: "Keitot"
      },
      {
        name: "Kasvisbowl harissa",
        description: "Paahdettua kukkakaalia, kikherneita ja sitruunajogurtti",
        price: 10.5,
        diet_tags: "VL,VEG",
        allergens: "maito",
        category: "Kulhot"
      },
      {
        name: "Street taco trio",
        description: "Kana, avokado ja pikkelöity punasipuli",
        price: 11.9,
        diet_tags: "L",
        allergens: "gluteeni",
        category: "Pääruoat"
      },
      {
        name: "Smetanaperunat",
        description: "Uuniperunat, savupaprika, yrtit",
        price: 8.5,
        diet_tags: "G,VEG",
        allergens: "maito",
        category: "Lisukkeet"
      },
      {
        name: "Kaura-omena crumble",
        description: "Lämmin kaurapaistos ja vaniljakastike",
        price: 5.5,
        diet_tags: "VL,VEG",
        allergens: "gluteeni,maito",
        category: "Jälkiruoat"
      }
    ];

    for (const item of seedItems) {
      await run(
        `INSERT INTO menu_items
          (name, description, price, diet_tags, allergens, available, category, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)` ,
        [
          item.name,
          item.description,
          item.price,
          item.diet_tags,
          item.allergens,
          item.category,
          now,
          now
        ]
      );
    }
  }

  saveDb();
};

module.exports = {
  run,
  get,
  all,
  init
};
