const app = require("./app");
const { init } = require("./db");

const PORT = process.env.PORT || 3000;

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Ravintola-app käynnissä portissa ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Tietokannan alustus epäonnistui", err);
    process.exit(1);
  });

