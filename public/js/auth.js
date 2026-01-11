const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error");

const handleAuth = async (event, url, errorEl) => {
  event.preventDefault();
  errorEl.textContent = "";

  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    email: formData.get("email"),
    password: formData.get("password")
  };

  try {
    const data = await Api.request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    Api.setAuth(data.token, data.user);
    if (data.user.role === "admin") {
      window.location.href = "/admin.html";
      return;
    }
    window.location.href = "/menu.html";
  } catch (err) {
    errorEl.textContent = err.message;
  }
};

if (loginForm) {
  loginForm.addEventListener("submit", (event) =>
    handleAuth(event, "/api/auth/login", loginError)
  );
}

if (registerForm) {
  registerForm.addEventListener("submit", (event) =>
    handleAuth(event, "/api/auth/register", registerError)
  );
}

