const jwt = require("jsonwebtoken");

const TOKEN_SECRET = process.env.JWT_SECRET || "dev-secret";

const createToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    TOKEN_SECRET,
    { expiresIn: "12h" }
  );

const requireAuth = (roles = []) => (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Puuttuva kirjautuminen" });
    return;
  }

  try {
    const payload = jwt.verify(token, TOKEN_SECRET);
    if (roles.length > 0 && !roles.includes(payload.role)) {
      res.status(403).json({ error: "Ei oikeuksia" });
      return;
    }
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Virheellinen tai vanhentunut istunto" });
  }
};

module.exports = {
  createToken,
  requireAuth
};

