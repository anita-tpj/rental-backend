const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");

const schema = new Joi.object({
  userName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  isAdmin: Joi.boolean(),
});

const userSchema = mongoose.Schema({
  userName: {
    type: String,
    minLength: 1,
    maxLength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    uniq: true,
  },

  password: {
    type: String,
    required: true,
    minLength: 8,
    maxLength: 1024,
  },

  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = new mongoose.model("User", userSchema);

function validateUser(user) {
  return schema.validate(user);
}

exports.User = User;
exports.validator = validateUser;
