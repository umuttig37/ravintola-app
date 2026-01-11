const CartStore = {
  key: "mylly_cart",
  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch (err) {
      return [];
    }
  },
  save(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
  },
  add(item) {
    const items = this.load();
    const existing = items.find((entry) => entry.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...item, quantity: 1 });
    }
    this.save(items);
  },
  update(id, quantity) {
    const items = this.load().map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    this.save(items.filter((item) => item.quantity > 0));
  },
  remove(id) {
    const items = this.load().filter((item) => item.id !== id);
    this.save(items);
  },
  clear() {
    localStorage.removeItem(this.key);
  },
  total() {
    return this.load().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
};

