const Api = {
  tokenKey: "mylly_token",
  userKey: "mylly_user",
  getToken() {
    return localStorage.getItem(this.tokenKey);
  },
  setAuth(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  },
  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.userKey));
    } catch (err) {
      return null;
    }
  },
  async request(path, options = {}) {
    const headers = options.headers || {};
    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(path, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const fallback =
        (window.I18n && window.I18n.t && window.I18n.t("error.requestFailed")) ||
        "Pyyntö epäonnistui";
      const message = data.error || fallback;
      throw new Error(message);
    }
    return data;
  }
};
