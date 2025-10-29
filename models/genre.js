const mongoose = require("mongoose");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().min(5).max(50).required(),
});

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minlength: 5,
    maxlength: 50,
  },
});

const Genre = mongoose.model("Genre", genreSchema);

function validateGenre(genre) {
  return schema.validate(genre);
}

exports.genreSchema = genreSchema;
exports.Genre = Genre;
exports.validator = validateGenre;
