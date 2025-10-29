const express = require("express");
const mongoose = require("mongoose");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const { Rental, validator } = require("../models/rental");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const rentals = await Rental.find().select("-__v").sort("-rentalDate");
  res.send(rentals);
});

router.post("/", [auth, validate(validator)], async (req, res, next) => {
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).send("Invalid customer ID");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(404).send("Invalid movie ID");

  const session = await mongoose.startSession();
  let createdRental;

  try {
    await session.withTransaction(async () => {
      const stockUpdate = await Movie.updateOne(
        { _id: movie._id, numberInStock: { $gt: 0 } },
        { $inc: { numberInStock: -1 } },
        { session }
      );

      if (stockUpdate.modifiedCount !== 1) {
        const err = new Error("OUT_OF_STOCK");
        err.status = 400;
        throw err;
      }

      const rental = new Rental({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        movie: {
          _id: movie._id,
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate,
        },
      });

      createdRental = await rental.save({ session });
    });

    res.status(201).send(createdRental);
  } catch (err) {
    if (err && (err.message === "OUT_OF_STOCK" || err.status === 400)) {
      return res.status(400).send("Movie not in stock");
    }
    next(err);
  } finally {
    session.endSession();
  }
});

router.get("/:id", [validateObjectId], async (req, res) => {
  const rental = await Rental.findById(req.params.id).select("-__v");
  if (!rental)
    return res.status(404).send("The rental with the given ID was not found.");
  res.send(rental);
});

module.exports = router;
