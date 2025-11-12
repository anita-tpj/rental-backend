const express = require("express");
const router = express.Router();
const { Customer, validator } = require("../models/customer");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/", auth, async (req, res) => {
  const search = (req.query.search || "").trim();
  const start = Number(req.query._start) || 0;
  const limit = Number(req.query._limit) || 10;

  const filter = search ? { name: { $regex: search, $options: "i" } } : {};

  const customers = await Customer.find(filter)
    .sort({ name: 1 })
    .skip(start)
    .limit(limit)
    .select("-__v");
  res.send(customers);
});

router.post("/", [auth, validate(validator)], async (req, res) => {
  let newCustomer = new Customer({
    isGold: req.body.isGold,
    name: req.body.name,
    phone: req.body.phone,
  });

  newCustomer = await newCustomer.save();

  res.send(newCustomer);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validator)],
  async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isGold: req.body.isGold, name: req.body.name, phone: req.body.phone },
      { new: true }
    );

    if (!customer)
      return res
        .status(404)
        .send("The customer with the given ID was not found.");

    res.send(customer);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const customer = await Customer.findById(req.params.id).select("-__v");

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});
module.exports = router;
