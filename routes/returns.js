const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validator = require("../middleware/validate");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const Joi = require("joi");
const objectId = require("joi-objectid")(Joi);

router.post("/", [auth, validator(validateReturn)], async (req, res) => {
  const { customerId, movieId } = req.body;

  const rental = await Rental.lookup(customerId, movieId);

  if (!rental)
    return res.status(404).send("Rental with the given ids not found");

  if (rental.returnDate)
    return res.status(400).send("Rental is already processed");

  rental.return();
  await rental.save();

  const movie = await Movie.findById(rental.movie._id);
  movie.numberInStock += 1;

  await movie.save();

  return res.status(200).send(rental);
});

function validateReturn(req) {
  const schema = Joi.object({
    customerId: objectId().required(),
    movieId: objectId().required(),
  });
  return schema.validate(req);
}

module.exports = router;
