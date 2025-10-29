const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const { Rental, validator } = require("../models/rental");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const express = require("express");
const Fawn = require("fawn");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const rentals = await Rental.find().select("-__v").sort("-rentalDate");
  res.send(rentals);
});

router.post("/", [auth, validate(validator)], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId);
  const movie = await Movie.findById(req.body.movieId);

  if (!customer) {
    return res.status(404).send("Invalid customer ID");
  }

  if (!movie) {
    return res.status(404).send("Invalid movie ID");
  }

  let newRental = new Rental({
    movie: {
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
    customer: {
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold,
    },
  });

  try {
    new Fawn.Task()
      .save("rentals", newRental)
      .update(
        "movies",
        { _id: movie._id },
        {
          $inc: { numberInStock: -1 },
        }
      )
      .run();

    res.send(newRental);
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const rental = await Rental.findById(req.params.id).select("-__v");
  if (!rental)
    return res.status(404).send("The rental with the given ID was not found.");

  res.send(rental);
});

module.exports = router;
