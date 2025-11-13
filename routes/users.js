const express = require("express");
const router = express.Router();
const { User, validator } = require("../models/user");
const validate = require("../middleware/validate");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const superAdmin = require("../middleware/superAdmin");

router.get("/", auth, async (req, res) => {
  const skip = Number(req.query._start) || 0;
  const limit = Number(req.query._limit) || 10;
  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit).sort("userName").select("-__v"),
    User.countDocuments(),
  ]);
  res.set("X-Total-Count", String(total));
  res.send(users);
});

router.post("/", [auth, superAdmin, validate(validator)], async (req, res) => {
  let user = await User.findOne({ email: req.body.email });

  if (user) return res.status(400).send("User with given email already exists");

  user = new User(_.pick(req.body, ["userName", "email", "password", "role"]));

  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(user.password, salt);

  const token = user.generateAuthToken();

  await user.save();
  res.header("x-auth-token", token).send(_.pick(user, ["userName", "email"]));
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) return res.status(404).send("User with the given ID not exists");

  res.send(user);
});

router.put(
  "/:id",
  [auth, superAdmin, validateObjectId, validate(validator)],
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { userName: req.body.name, email: req.body.email, role: req.body.role },
      { new: true }
    );

    if (!user)
      return res.status(404).send("The user with the given ID was not found.");

    res.send(user);
  }
);

router.delete(
  "/:id",
  [auth, superAdmin, validateObjectId],
  async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user)
      return res.status(404).send("The user with the given ID was not found.");

    res.send(user);
  }
);

module.exports = router;
