const express = require("express");
const router = express.Router();
const { User, validator } = require("../models/user");
const validate = require("../middleware/validate");
const bcrypt = require("bcrypt");

router.post("/", validate(validator), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("Invalid email or password");

  let validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();

  res.send(token);
});

module.exports = router;
