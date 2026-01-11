const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

const updateAuthNav = () => {
  const loginLink = document.querySelector('.nav-links a[href="/login.html"]');
  if (!loginLink) {
    return;
  }
  const rawUser = localStorage.getItem("mylly_user");
  const token = localStorage.getItem("mylly_token");
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    user = null;
  }

  const logoutLabel =
    (window.I18n && window.I18n.t && window.I18n.t("nav.logout")) ||
    "Kirjaudu ulos";
  const loginLabel =
    (window.I18n && window.I18n.t && window.I18n.t("nav.login")) || "Kirjaudu";

  if (token && user) {
    loginLink.textContent = logoutLabel;
    loginLink.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        localStorage.removeItem("mylly_token");
        localStorage.removeItem("mylly_user");
        window.location.href = "/login.html";
      },
      { once: true }
    );
  } else {
    loginLink.textContent = loginLabel;
  }
};

updateAuthNav();
window.updateAuthNav = updateAuthNav;

