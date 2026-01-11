const I18n = (() => {
  const storageKey = "mylly_lang";
  const translations = {
    fi: {
      "nav.open": "Avaa valikko",
      "nav.menu": "Valikko",
      "nav.home": "Etusivu",
      "nav.menuLink": "Ruokalista",
      "nav.cart": "Ostoskori",
      "nav.login": "Kirjaudu",
      "nav.admin": "Hallinta",
      "nav.logout": "Kirjaudu ulos",
      "lang.toggle": "Vaihda kieli",
      "hero.eyebrow": "Metropolia Myllypuro",
      "hero.title": "Kampuksen rohkein lounaspaikka.",
      "hero.lead":
        "Paikalliset raaka-aineet, selkeät erityisruokavaliot ja nopeat noutotilaukset. Kaikki yhdessä paikassa.",
      "hero.cta.menu": "Tutustu ruokalistaan",
      "hero.cta.daily": "Katso päivän menu",
      "hero.badge.price": "Opiskelijahinta",
      "hero.badge.responsible": "Vastuullinen keittiö",
      "hero.badge.vegan": "Vegaaniset vaihtoehdot",
      "hero.fast.title": "Tilaa nopeasti",
      "hero.fast.body": "Kirjaudu ja kokoa tilaus valmiiksi ennen luentoa.",
      "hero.fast.cta": "Avaa ostoskori",
      "hero.hsl.title": "HSL-tilanne",
      "hero.hsl.body": "Seuraavat lähdöt kampukselta.",
      "loading": "Ladataan...",
      "daily.title": "Päivän ruokalista",
      "daily.date": "Päivä",
      "daily.empty": "Päivän ruokalistaa ei ole saatavilla.",
      "choice.title": "Ruoka, joka huomioi valintasi",
      "choice.lead": "Selkeä hinnoittelu ja ruokavaliomerkinnät jokaisessa annoksessa.",
      "choice.cta": "Avaa koko ruokalista",
      "services.title": "Palvelut",
      "services.pickup": "Nopeat noudot",
      "services.preorder": "Ennakkotilaukset",
      "services.allergens": "Allergeenit selkeästi",
      "services.price": "Opiskelijalounas alkaen 2,95 eur.",
      "hsl.title": "HSL-lähdöt Myllypuron kampukselta",
      "hsl.lead": "Näytämme seuraavat yhteydet kampuksen lähellä.",
      "hsl.mapLabel": "HSL-lähtöjen kartta",
      "story.title": "Miksi Mylly Bistro?",
      "story.body":
        "Toimimme Metropolian kampusalueella ja olemme suunnitelleet ruokalistan opiskelijoiden päivärytmin mukaan. Aamun ensimmäinen kahvi, lounaan tehokas nouto ja iltapäivän kevyt bowl hoituvat samalla reissulla.",
      "story.address.title": "Osoite",
      "story.address.body": "Myllypurontie 1, 00920 Helsinki",
      "story.address.hours": "Auki arkisin 10.30 - 15.00",
      "footer.since": "Opiskelijaruokailua vuodesta 2026.",
      "menu.title": "Ravintolan ruokalista",
      "menu.lead": "Valitse annokset, tarkista erityisruokavaliot ja lisää ostoskoriin.",
      "menu.filter.gluten": "Gluteeniton (G)",
      "menu.filter.lactose": "Laktoositon (L)",
      "menu.filter.veg": "Kasvis (VEG)",
      "menu.filter.vegan": "Vegaaninen (VE)",
      "menu.empty": "Ruokalistaa ei löydy suodatuksilla.",
      "menu.add": "Lisää koriin",
      "menu.added": "Lisätty",
      "menu.footer": "Tilaa etukäteen ja nouda heti.",
      "cart.title": "Ostoskori",
      "cart.lead": "Tarkista annokset ja lähetä tilaus.",
      "cart.empty": "Ostoskori on tyhjä.",
      "cart.total": "Yhteensä",
      "cart.checkout": "Lähetä tilaus",
      "cart.footer": "Nouda tilaus 10 minuutissa.",
      "login.title": "Kirjaudu tai rekisteröidy",
      "login.lead":
        "Kirjautuneena voit tarkastella omia tilauksia ja tallentaa suosikit.",
      "login.form.title": "Kirjautuminen",
      "login.form.email": "Sähköposti",
      "login.form.password": "Salasana",
      "login.form.submit": "Kirjaudu",
      "register.title": "Uusi asiakas",
      "register.submit": "Luo tili",
      "admin.title": "Hallintapaneeli",
      "admin.lead": "Päivitä ruokalista ja seuraa tilauksia.",
      "admin.locked": "Sinun tulee kirjautua sisään ylläpitona.",
      "admin.newItem": "Uusi ruokalista-alkio",
      "admin.form.name": "Nimi",
      "admin.form.desc": "Kuvaus",
      "admin.form.price": "Hinta (eur)",
      "admin.form.diets": "Diettagit (esim. L,G,VEG)",
      "admin.form.allergens": "Allergeenit",
      "admin.form.category": "Kategoria",
      "admin.form.save": "Tallenna",
      "admin.menu.title": "Ruokalista",
      "admin.orders.title": "Tilaukset",
      "admin.footer": "Ylläpito seuraa tilauksia reaaliajassa.",
      "admin.news.title": "Tiedotteet",
      "admin.news.lead": "Lisää ja poista tiedotteita etusivulle.",
      "admin.news.add": "Lisää tiedote",
      "admin.news.titleLabel": "Otsikko",
      "admin.news.bodyLabel": "Teksti",
      "admin.news.dateLabel": "Päivämäärä",
      "admin.news.save": "Tallenna",
      "admin.news.empty": "Ei tiedotteita vielä.",
      "admin.news.titleMissing": "Otsikko puuttuu",
      "news.title": "Tiedotteet",
      "news.lead": "Ajankohtaiset asiat kampukselta.",
      "news.empty": "Ei tiedotteita juuri nyt.",
      "order.status": "Status",
      "order.status.new": "uusi",
      "order.status.cooking": "valmistuksessa",
      "order.status.ready": "valmis",
      "order.status.pickup": "nouto",
      "order.label": "Tilaus",
      "hsl.realtime": "reaaliaikainen",
      "hsl.scheduled": "aikataulu",
      "action.update": "Päivitä",
      "action.delete": "Poista",
      "action.available": "Saatavilla",
      "error.requestFailed": "Pyyntö epäonnistui",
      "error.loginRequired": "Kirjaudu ensin sisään ennen tilausta.",
      "error.cartEmpty": "Ostoskori on tyhjä.",
      "order.success": "Tilaus {id} vastaanotettu. Noutoajaksi arvioitu 10 min.",
      "error.hslFailed": "HSL-tietojen haku epäonnistui",
      "error.hslNone": "Ei lähtöjä",
      "error.menuFailed": "Ruokalistan haku epäonnistui",
      "error.newsFailed": "Tiedotteiden haku epäonnistui"
    },
    en: {
      "nav.open": "Open menu",
      "nav.menu": "Menu",
      "nav.home": "Home",
      "nav.menuLink": "Menu",
      "nav.cart": "Cart",
      "nav.login": "Sign in",
      "nav.admin": "Admin",
      "nav.logout": "Sign out",
      "lang.toggle": "Switch language",
      "hero.eyebrow": "Metropolia Myllypuro",
      "hero.title": "The boldest campus lunch spot.",
      "hero.lead":
        "Local ingredients, clear dietary labels, and fast pickup orders. Everything in one place.",
      "hero.cta.menu": "Explore the menu",
      "hero.cta.daily": "See today's menu",
      "hero.badge.price": "Student price",
      "hero.badge.responsible": "Responsible kitchen",
      "hero.badge.vegan": "Vegan options",
      "hero.fast.title": "Order fast",
      "hero.fast.body": "Sign in and prep your order before class.",
      "hero.fast.cta": "Open cart",
      "hero.hsl.title": "HSL status",
      "hero.hsl.body": "Next departures from campus.",
      "loading": "Loading...",
      "daily.title": "Daily menu",
      "daily.date": "Date",
      "daily.empty": "Daily menu is not available.",
      "choice.title": "Food that fits your choices",
      "choice.lead": "Clear pricing and dietary labels for every dish.",
      "choice.cta": "Open full menu",
      "services.title": "Services",
      "services.pickup": "Fast pickup",
      "services.preorder": "Preorders",
      "services.allergens": "Allergens clearly listed",
      "services.price": "Student lunch from 2.95 eur.",
      "hsl.title": "HSL departures near Myllypuro campus",
      "hsl.lead": "We show the next connections nearby.",
      "hsl.mapLabel": "Map of HSL departures",
      "story.title": "Why Mylly Bistro?",
      "story.body":
        "We operate at the Metropolia campus and plan the menu around student rhythm. Morning coffee, efficient lunch pickup, and a light afternoon bowl in one stop.",
      "story.address.title": "Address",
      "story.address.body": "Myllypurontie 1, 00920 Helsinki",
      "story.address.hours": "Open weekdays 10:30 - 15:00",
      "footer.since": "Student dining since 2026.",
      "menu.title": "Restaurant menu",
      "menu.lead": "Choose dishes, check diets, and add to cart.",
      "menu.filter.gluten": "Gluten-free (G)",
      "menu.filter.lactose": "Lactose-free (L)",
      "menu.filter.veg": "Vegetarian (VEG)",
      "menu.filter.vegan": "Vegan (VE)",
      "menu.empty": "No items match the filters.",
      "menu.add": "Add to cart",
      "menu.added": "Added",
      "menu.footer": "Order ahead and pick up fast.",
      "cart.title": "Cart",
      "cart.lead": "Review dishes and send your order.",
      "cart.empty": "Your cart is empty.",
      "cart.total": "Total",
      "cart.checkout": "Send order",
      "cart.footer": "Pick up your order in 10 minutes.",
      "login.title": "Sign in or register",
      "login.lead": "When signed in, you can view orders and save favorites.",
      "login.form.title": "Sign in",
      "login.form.email": "Email",
      "login.form.password": "Password",
      "login.form.submit": "Sign in",
      "register.title": "New customer",
      "register.submit": "Create account",
      "admin.title": "Admin panel",
      "admin.lead": "Update the menu and track orders.",
      "admin.locked": "You must sign in as admin.",
      "admin.newItem": "New menu item",
      "admin.form.name": "Name",
      "admin.form.desc": "Description",
      "admin.form.price": "Price (eur)",
      "admin.form.diets": "Diet tags (e.g. L,G,VEG)",
      "admin.form.allergens": "Allergens",
      "admin.form.category": "Category",
      "admin.form.save": "Save",
      "admin.menu.title": "Menu",
      "admin.orders.title": "Orders",
      "admin.footer": "Admin monitors orders in real time.",
      "admin.news.title": "Announcements",
      "admin.news.lead": "Add and remove announcements on the home page.",
      "admin.news.add": "Add announcement",
      "admin.news.titleLabel": "Title",
      "admin.news.bodyLabel": "Body",
      "admin.news.dateLabel": "Date",
      "admin.news.save": "Save",
      "admin.news.empty": "No announcements yet.",
      "admin.news.titleMissing": "Title is required",
      "news.title": "Announcements",
      "news.lead": "Latest updates from campus.",
      "news.empty": "No announcements right now.",
      "order.status": "Status",
      "order.status.new": "new",
      "order.status.cooking": "cooking",
      "order.status.ready": "ready",
      "order.status.pickup": "pickup",
      "order.label": "Order",
      "hsl.realtime": "realtime",
      "hsl.scheduled": "scheduled",
      "action.update": "Update",
      "action.delete": "Delete",
      "action.available": "Available",
      "error.requestFailed": "Request failed",
      "error.loginRequired": "Please sign in before ordering.",
      "error.cartEmpty": "Your cart is empty.",
      "order.success": "Order {id} received. Pickup in about 10 minutes.",
      "error.hslFailed": "Failed to load HSL departures",
      "error.hslNone": "No departures",
      "error.menuFailed": "Failed to load menu",
      "error.newsFailed": "Failed to load announcements"
    }
  };

  let lang = localStorage.getItem(storageKey) || "fi";
  if (!translations[lang]) {
    lang = "fi";
  }

  const t = (key) => translations[lang][key] || key;

  const applyTranslations = () => {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const value = t(key);
      if (value && value !== key) {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.dataset.i18nHtml;
      const value = t(key);
      if (value && value !== key) {
        el.innerHTML = value;
      }
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const pairs = el.dataset.i18nAttr.split(",");
      pairs.forEach((pair) => {
        const [attr, key] = pair.split(":").map((part) => part.trim());
        if (attr && key) {
          el.setAttribute(attr, t(key));
        }
      });
    });

    const toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.textContent = lang === "fi" ? "EN" : "FI";
      toggle.setAttribute("aria-label", t("lang.toggle"));
    }

    if (window.updateAuthNav) {
      window.updateAuthNav();
    }
  };

  const setLang = (next) => {
    lang = translations[next] ? next : "fi";
    localStorage.setItem(storageKey, lang);
    applyTranslations();
  };

  const init = () => {
    applyTranslations();
    const toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.addEventListener("click", () =>
        setLang(lang === "fi" ? "en" : "fi")
      );
    }
  };

  return {
    init,
    t,
    setLang,
    getLang: () => lang
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  I18n.init();
});
