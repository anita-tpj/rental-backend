const express = require("express");
const router = express.Router();
const { User, validator } = require("../models/user");
const validate = require("../middleware/validate");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const users = await User.find().sort("name");
  res.send(users);
});

router.post("/", [validate(validator)], async (req, res) => {
  let user = await User.findOne({ email: req.body.email });

  if (user) return res.status(400).send("User with given email already exists");

  user = new User(_.pick(req.body, ["userName", "email", "password"]));

  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(user.password, salt);

  const token = user.generateAuthToken();

  user.save();
  res.header("x-auth-token", token).send(_.pick(user, ["userName", "email"]));
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) return res.status(404).send("User with the given ID not exists");

  res.send(user);
});

module.exports = router;
