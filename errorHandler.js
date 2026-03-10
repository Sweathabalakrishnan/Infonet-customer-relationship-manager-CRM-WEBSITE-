module.exports = function errorHandler(err, req, res, next) {
  console.error("ERROR:", err);
  const message = err?.message || "Server error";
  res.status(500).json({ message });
};