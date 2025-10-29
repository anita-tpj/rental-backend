const mongoose = require("mongoose");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().min(5).max(50).required(),
  phone: Joi.string().min(5).max(50).required(),
  isGold: Joi.boolean().required(),
});

const customerSchema = mongoose.Schema({
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
});

const Customer = new mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  return schema.validate(customer);
}

exports.Customer = Customer;
exports.validator = validateCustomer;
