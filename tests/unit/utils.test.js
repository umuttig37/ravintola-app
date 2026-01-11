const { formatDate, secondsToTime, sumOrderTotal } = require("../../server/utils");

describe("utils", () => {
  test("formatDate returns YYYY-MM-DD", () => {
    const date = new Date("2026-01-10T10:20:30Z");
    expect(formatDate(date)).toBe("2026-01-10");
  });

  test("secondsToTime formats midnight", () => {
    expect(secondsToTime(0)).toBe("00:00");
  });

  test("secondsToTime formats 13:05", () => {
    expect(secondsToTime(13 * 3600 + 5 * 60)).toBe("13:05");
  });

  test("secondsToTime wraps after 24h", () => {
    expect(secondsToTime(25 * 3600)).toBe("01:00");
  });

  test("sumOrderTotal totals items", () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 3.5, quantity: 1 }
    ];
    expect(sumOrderTotal(items)).toBeCloseTo(23.5);
  });
});
