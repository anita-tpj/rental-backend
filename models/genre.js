const mongoose = require("mongoose");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().min(2).max(20).required(),
});

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minlength: 2,
    maxlength: 20,
  },
});

const Genre = mongoose.model("Genre", genreSchema);

function validateGenre(genre) {
  return schema.validate(genre);
}

exports.genreSchema = genreSchema;
exports.Genre = Genre;
exports.validator = validateGenre;
