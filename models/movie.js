const mongoose = require("mongoose");
const Joi = require("joi");
const objectId = require("joi-objectid")(Joi);
const { genreSchema, Genre } = require("./genre");

const schema = Joi.object({
  title: Joi.string().min(2).max(50).required(),
  numberInStock: Joi.number().min(0).required(),
  dailyRentalRate: Joi.number().min(0).required(),
  genreId: objectId().required(),
});

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
    trim: true,
  },
  numberInStock: {
    type: Number,
    min: 0,
    max: 255,
    required: true,
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    max: 255,
    required: true,
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre",
  },
});

const Movie = new mongoose.model("Movie", movieSchema);

function validateMovie(movie) {
  return schema.validate(movie);
}

exports.Movie = Movie;
exports.validator = validateMovie;
