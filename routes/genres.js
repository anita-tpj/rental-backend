const express = require("express");
const router = express.Router();
const { Genre, validator } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const asyncMiddleware = require("../middleware/async");
const validateObjectId = require("../middleware/validateObjectId");

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const genres = await Genre.find().select("-__v").sort("name");
    res.send(genres);
  })
);

router.post("/", [auth, validate(validator)], async (req, res) => {
  let newGenre = new Genre({
    name: req.body.name,
  });

  newGenre = await newGenre.save();
  res.send(newGenre);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validator)],
  async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!genre)
      return res.status(404).send("The genre with the given ID was not found.");

    res.send(genre);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);

  if (!genre)
    return res.status(404).send("The genre with the given ID was not found.");

  res.send(genre);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id).select("-__v");

  if (!genre)
    return res.status(404).send("The genre with the given ID is not exist");

  res.send(genre);
});

module.exports = router;
