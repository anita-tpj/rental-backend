const mongoose = require("mongoose");
const Joi = require("joi");
const objectId = require("joi-objectid")(Joi);
const dayjs = require("dayjs");

const schema = Joi.object({
  customerId: objectId().required(),
  movieId: objectId().required(),
});

const rentalSchema = mongoose.Schema({
  rentalDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0,
  },
  movie: {
    type: mongoose.Schema({
      title: {
        type: String,
        require: true,
        minlength: 2,
        maxlength: 255,
        trim: true,
      },
      dailyRentalRate: {
        type: Number,
        min: 0,
        max: 255,
        require: true,
      },
    }),
    required: true,
  },

  customer: {
    type: mongoose.Schema({
      name: {
        type: String,
        require: true,
        minlength: 5,
        maxlength: 50,
      },
      phone: {
        type: String,
        require: true,
        minlength: 5,
        maxlength: 50,
      },
      isGold: {
        type: Boolean,
        default: false,
      },
    }),
    required: true,
  },
});

rentalSchema.methods.return = function () {
  this.returnDate = new Date();

  // const daysRented = Math.max(
  //   1,
  //   Math.ceil(dayjs(this.returnDate).diff(this.rentalDate, "day", true))
  // );

  const daysRented = dayjs().diff(this.rentalDate, "day");

  this.rentalFee = this.movie.dailyRentalRate * daysRented;
};

rentalSchema.statics.lookup = function (customerId, movieId) {
  return Rental.findOne({
    "customer._id": customerId,
    "movie._id": movieId,
  });
};
const Rental = new mongoose.model("Rental", rentalSchema);

function validateRental(rental) {
  return schema.validate(rental);
}

exports.Rental = Rental;
exports.validator = validateRental;
