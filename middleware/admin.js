const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const isAdmin = req.user.role === "Admin" || req.user.role === "Super Admin";

  if (!isAdmin) return res.status(403).send("Access denied.");

  next();
};
