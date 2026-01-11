const formatDate = (date) => date.toISOString().slice(0, 10);

const secondsToTime = (seconds) => {
  const hours = Math.floor(seconds / 3600) % 24;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const sumOrderTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

module.exports = {
  formatDate,
  secondsToTime,
  sumOrderTotal
};

