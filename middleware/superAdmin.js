const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const isSuperAdmin = req.user.role === "Super Admin";

  if (!isSuperAdmin) return res.status(403).send("Access denied.");

  next();
};
