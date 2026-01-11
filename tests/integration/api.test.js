const request = require("supertest");
const app = require("../../server/app");
const { init } = require("../../server/db");

describe("API integraatio", () => {
  beforeAll(async () => {
    await init();
  });

  test("GET /api/health palauttaa ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("GET /api/menu palauttaa listan", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test("Rekisterointi ja kirjautuminen toimii", async () => {
    const email = `test_${Date.now()}@example.com`;
    const password = "Test1234";

    const register = await request(app)
      .post("/api/auth/register")
      .send({ email, password });

    expect(register.statusCode).toBe(201);
    expect(register.body.token).toBeTruthy();

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(login.statusCode).toBe(200);
    expect(login.body.user.email).toBe(email);
  });

  test("POST /api/orders vaatii kirjautumisen", async () => {
    const res = await request(app).post("/api/orders").send({ items: [] });
    expect(res.statusCode).toBe(401);
  });

  test("Tilaus luodaan kirjautuneelle", async () => {
    const email = `order_${Date.now()}@example.com`;
    const password = "Test1234";

    const register = await request(app)
      .post("/api/auth/register")
      .send({ email, password });

    const token = register.body.token;
    const menu = await request(app).get("/api/menu");
    const first = menu.body.items[0];

    const order = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ menuItemId: first.id, quantity: 1 }] });

    expect(order.statusCode).toBe(201);
    expect(order.body.id).toBeTruthy();
  });
});
