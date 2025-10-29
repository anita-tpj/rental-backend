const express = require("express");
const router = express.Router();

router.get("/", (_req, res) => {
  res.send("Vidly rental API is up. Try /api/movies");
});

module.exports = router;
